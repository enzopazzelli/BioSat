"""Suelo y paisaje por zona (data/suelo_zonas.json, contrato §2), con datos reales de Earth Engine.

- Suelo: SoilGrids 2.0 (ISRIC), promedio de 0 a 30 cm ponderado por espesor, a 250 m.
- Se mide sobre la tierra agropecuaria (ESA WorldCover 2021, clases 30 pastizal y 40 cultivo);
  si una zona tiene menos de 2.000 píxeles de 250 m agropecuarios, sobre la zona completa.
- PDSI: TerraClimate 1991-2020. Caminos: GRIP4. Monte: Hansen GFC (cobertura >= 25 % en 2000, sin pérdida hasta 2024).

Uso: EE_PROJECT=<id> python -X utf8 -m ia_desmonte.suelo
"""
import csv

from ia_desmonte.comun import (BBOX_PROVINCIA, DATA, HANSEN, SALIDAS, UMBRAL_MONTE, ZONAS, con_reintentos,
                               distancia_m, escribir_json, iniciar_ee, meta_base)

ESCALA = 250
MIN_PIXELES_AGRO = 2000
TOPE_DIST_M = 50000
GRIP4 = 'projects/sat-io/open-datasets/GRIP4/South-America'
TERRACLIMATE = 'IDAHO_EPSCOR/TERRACLIMATE'
WORLDCOVER = 'ESA/WorldCover/v200'

# Factor para pasar las unidades de SoilGrids a las del contrato.
FACTOR = {'phh2o': 0.1, 'clay': 0.1, 'sand': 0.1, 'silt': 0.1, 'soc': 0.1, 'nitrogen': 0.01, 'bdod': 0.01, 'cec': 0.1}
SUELO = {'ph': 'phh2o', 'arcilla_pct': 'clay', 'arena_pct': 'sand', 'limo_pct': 'silt',
         'carbono_organico_g_kg': 'soc', 'nitrogeno_g_kg': 'nitrogen', 'densidad_aparente_g_cm3': 'bdod'}
CODIGOS = {'ph': 'B16', 'arcilla_pct': 'B12', 'arena_pct': 'B17a', 'limo_pct': 'B17b', 'carbono_organico_g_kg': 'B15',
           'nitrogeno_g_kg': 'B11', 'densidad_aparente_g_cm3': 'B18', 'pdsi': 'B05', 'distancia_caminos_km': 'B36',
           'distancia_monte_km': 'B31', 'monte_nativo_pct': 'Hansen GFC'}
FUENTE_CAMPO = {**{k: 'SoilGrids 2.0, 0-30 cm' for k in SUELO}, 'pdsi': 'TerraClimate 1991-2020',
                'distancia_caminos_km': 'GRIP4 (Meijer y otros, 2018)',
                'distancia_monte_km': f'Hansen GFC, monte 2024 (cobertura >= {UMBRAL_MONTE} %)',
                'monte_nativo_pct': f'Hansen GFC, monte 2024 (cobertura >= {UMBRAL_MONTE} %)'}
CAMPOS_PIXEL = list(SUELO) + ['pdsi', 'distancia_caminos_km', 'distancia_monte_km']


def ponderar_0_30(a, b, c):
    """Promedio de 0 a 30 cm ponderado por el espesor de cada capa (5, 10 y 15 cm)."""
    return (5 * a + 10 * b + 15 * c) / 30


def convertir(var, crudo):
    """Pasa un valor de SoilGrids a las unidades del contrato."""
    return crudo * FACTOR[var]


def _r(v, d=2):
    return None if v is None else round(float(v), d)


def armar_json(stats):
    """Arma el JSON del contrato §2 a partir de las estadísticas por zona (ya en unidades finales)."""
    zonas = {}
    for z in ZONAS:
        s = stats[z]
        zona = {}
        for campo, codigo in CODIGOS.items():
            v = s['vars'][campo]
            hay_rango = v.get('p10') is not None and v.get('p90') is not None
            zona[campo] = {'valor': _r(v.get('media')), 'codigo': codigo, 'confianza': 'media',
                           'mediana': _r(v.get('mediana')),
                           'rango_p10_p90': [_r(v['p10']), _r(v['p90'])] if hay_rango else None,
                           'n_pixeles': v.get('n'), 'fuente': FUENTE_CAMPO[campo]}
        zona['area_medida'] = s['area_medida']
        zonas[z] = zona
    meta = meta_base(
        fuente=(f'SoilGrids 2.0 (projects/soilgrids-isric), TerraClimate ({TERRACLIMATE}), GRIP4 ({GRIP4}), '
                f'Hansen GFC ({HANSEN}), ESA WorldCover 2021 ({WORLDCOVER})'),
        metodo=(f'Media, mediana y percentiles 10 y 90 por zona a {ESCALA} m. Suelo: promedio 0-30 cm ponderado por '
                f'espesor. Se mide sobre tierra agropecuaria (WorldCover clases 30 y 40); si hay menos de '
                f'{MIN_PIXELES_AGRO} píxeles, sobre la zona completa (ver area_medida).'),
        script='ia_desmonte/suelo.py',
        notas=('SoilGrids es un modelo global (predicción a 250 m): confianza media. Las zonas son la unión de sus '
               'departamentos (geoBoundaries/IGN), igual que el mapa de la app. Las distancias se calculan a '
               f'{ESCALA} m y se acotan a {TOPE_DIST_M // 1000} km. monte_nativo_pct es el % de la superficie de la '
               'zona con monte en 2024. Los satélites no miden salinidad ni compactación profunda.'),
        umbral_monte_pct=UMBRAL_MONTE, escala_m=ESCALA)
    return {'meta': meta, 'zonas': zonas}


def monte_2024(ee):
    """Monte en 2024: cobertura arbórea del 2000 >= UMBRAL_MONTE y sin pérdida registrada hasta 2024."""
    h = ee.Image(HANSEN)
    return h.select('treecover2000').gte(UMBRAL_MONTE).And(h.select('lossyear').unmask(0).eq(0))


def _imagen(ee):
    """Imagen con una banda por campo medido por píxel, en las unidades del contrato."""
    bandas = []
    for campo, var in SUELO.items():
        img = ee.Image(f'projects/soilgrids-isric/{var}_mean')
        a, b, c = [img.select(f'{var}_{d}_mean') for d in ('0-5cm', '5-15cm', '15-30cm')]
        bandas.append(ponderar_0_30(a, b, c).multiply(FACTOR[var]).rename(campo))
    tc = ee.ImageCollection(TERRACLIMATE).filterDate('1991-01-01', '2021-01-01')
    bandas.append(tc.select('pdsi').mean().multiply(0.01).rename('pdsi'))
    region = ee.Geometry.Rectangle(BBOX_PROVINCIA).buffer(60000)
    caminos = ee.FeatureCollection(GRIP4).filterBounds(region)
    bandas.append(caminos.distance(TOPE_DIST_M, 50).unmask(TOPE_DIST_M).divide(1000).rename('distancia_caminos_km'))
    bandas.append(distancia_m(monte_2024(ee), ESCALA, TOPE_DIST_M).divide(1000).rename('distancia_monte_km'))
    return ee.Image.cat(bandas)


def _reductor(ee):
    return (ee.Reducer.mean().combine(ee.Reducer.median(), sharedInputs=True)
            .combine(ee.Reducer.percentile([10, 90]), sharedInputs=True)
            .combine(ee.Reducer.count(), sharedInputs=True))


def _stats_por_zona(ee, imagen, fc):
    res = con_reintentos(lambda: imagen.reduceRegions(collection=fc, reducer=_reductor(ee), scale=ESCALA,
                                                      tileScale=8).getInfo())
    salida = {}
    for f in res['features']:
        p = f['properties']
        salida[p['zona']] = {campo: {'media': p.get(f'{campo}_mean'), 'mediana': p.get(f'{campo}_median'),
                                     'p10': p.get(f'{campo}_p10'), 'p90': p.get(f'{campo}_p90'),
                                     'n': p.get(f'{campo}_count')}
                             for campo in CAMPOS_PIXEL}
    return salida


def calcular():
    """Calcula en Earth Engine las estadísticas por zona (unidades finales)."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zonas_fc
    fc = zonas_fc()
    img = _imagen(ee)
    wc = ee.ImageCollection(WORLDCOVER).first().select('Map')
    agro = wc.eq(30).Or(wc.eq(40))
    en_agro = _stats_por_zona(ee, img.updateMask(agro), fc)
    completa = _stats_por_zona(ee, img, fc)
    area = ee.Image.pixelArea()
    monte = con_reintentos(lambda: ee.Image.cat(area.updateMask(monte_2024(ee)).rename('monte'), area.rename('total'))
                           .reduceRegions(collection=fc, reducer=ee.Reducer.sum(), scale=30, tileScale=16).getInfo())
    pct = {f['properties']['zona']: 100 * f['properties']['monte'] / f['properties']['total']
           for f in monte['features']}
    stats = {}
    for z in ZONAS:
        n_agro = en_agro[z]['ph']['n'] or 0
        usar, area_medida = ((en_agro, 'tierra agropecuaria') if n_agro >= MIN_PIXELES_AGRO
                             else (completa, 'zona completa'))
        vars_ = dict(usar[z])
        vars_['monte_nativo_pct'] = {'media': pct[z], 'mediana': None, 'p10': None, 'p90': None, 'n': None}
        stats[z] = {'area_medida': area_medida, 'vars': vars_, 'n_pixeles_agro': n_agro}
    return stats


def _guardar_csv(stats):
    SALIDAS.mkdir(parents=True, exist_ok=True)
    with open(SALIDAS / 'suelo_zonas.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['zona', 'area_medida', 'campo', 'media', 'mediana', 'p10', 'p90', 'n'])
        for z in ZONAS:
            for campo, v in stats[z]['vars'].items():
                w.writerow([z, stats[z]['area_medida'], campo, v['media'], v['mediana'], v['p10'], v['p90'], v['n']])


def main():
    stats = calcular()
    _guardar_csv(stats)
    escribir_json(DATA / 'suelo_zonas.json', armar_json(stats))
    print('Listo: data/suelo_zonas.json')


if __name__ == '__main__':
    main()
