"""Zonificación de la provincia con k-means sobre clima y suelo (data/zonificacion_aizal.json, contrato §7).

Usa las mismas variables que AIZAL V4 (B03-B18), tomadas de sus fuentes originales: TerraClimate 1991-2020
y SoilGrids 2.0 (0-30 cm), más la pendiente de NASADEM. Se muestrean píxeles al azar de toda la provincia a 1 km.

Uso: EE_PROJECT=<id> python -X utf8 -m ia_desmonte.zonificacion
"""
import urllib.request

import numpy as np
import pandas as pd

from ia_desmonte.comun import (BBOX_PROVINCIA, DATA, SALIDAS, SEMILLA, ZONAS, con_reintentos, escribir_json,
                               iniciar_ee, meta_base, muestras_por_tandas)

VARIABLES = ['lluvia_anual_mm', 'def_hidrico_mm', 'tmax_mes_calido_c', 'tmin_mes_frio_c', 'ph', 'arcilla_pct',
             'arena_pct', 'carbono_organico_g_kg', 'densidad_aparente_g_cm3', 'cic_cmolc_kg', 'pendiente_grados']
PERFIL = {'lluvia_mm': 'lluvia_anual_mm', 'deficit_mm': 'def_hidrico_mm', 'tmax_c': 'tmax_mes_calido_c',
          'tmin_c': 'tmin_mes_frio_c', 'ph': 'ph', 'arcilla_pct': 'arcilla_pct', 'arena_pct': 'arena_pct',
          'carbono_organico_g_kg': 'carbono_organico_g_kg', 'densidad_aparente_g_cm3': 'densidad_aparente_g_cm3',
          'cic_cmolc_kg': 'cic_cmolc_kg', 'pendiente_grados': 'pendiente_grados'}
ESCALA = 1000
N_MUESTRA = 6000
PALETA = ['1b9e77', 'd95f02', '7570b3', 'e7298a', '66a61e', 'e6ab02', 'a6761d', '666666']
IMAGEN = 'data/imagenes/zonas_aizal.png'


def agrupar(df, k=5, ks=range(2, 9), semilla=SEMILLA):
    """k-means sobre VARIABLES estandarizadas. Los grupos se numeran de mayor a menor tamaño."""
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    X = df[VARIABLES].to_numpy(dtype=float)
    media, desvio = X.mean(axis=0), X.std(axis=0)
    desvio[desvio == 0] = 1.0
    Z = (X - media) / desvio
    siluetas, modelos = {}, {}
    for kk in ks:
        km = KMeans(n_clusters=kk, n_init=20, random_state=semilla).fit(Z)
        siluetas[kk] = float(silhouette_score(Z, km.labels_, sample_size=min(len(Z), 4000), random_state=semilla))
        modelos[kk] = km
    km = modelos[k] if k in modelos else KMeans(n_clusters=k, n_init=20, random_state=semilla).fit(Z)
    if k not in siluetas:
        siluetas[k] = float(silhouette_score(Z, km.labels_, sample_size=min(len(Z), 4000), random_state=semilla))
    orden = np.argsort(-np.bincount(km.labels_, minlength=k), kind='stable')
    nuevo = np.empty(k, dtype=int)
    nuevo[orden] = np.arange(k)
    return {'k': k, 'siluetas': siluetas, 'etiquetas': nuevo[km.labels_], 'centros_std': km.cluster_centers_[orden],
            'media': media, 'desvio': desvio}


def comparar(df, etiquetas):
    """Para cada zona de BioSat, qué grupo domina y en qué porcentaje de sus puntos."""
    salida = {}
    for i, z in enumerate(ZONAS, start=1):
        sel = np.asarray(etiquetas)[(df['zona'] == i).to_numpy()]
        if len(sel) == 0:
            salida[z] = {'grupo_mayoritario': None, 'coincidencia_pct': None}
            continue
        cuenta = np.bincount(sel)
        g = int(np.argmax(cuenta))
        salida[z] = {'grupo_mayoritario': g, 'coincidencia_pct': round(100 * cuenta[g] / len(sel), 1)}
    return salida


# Nombres de los 5 grupos de la corrida real (D-33). Los propuso Vale (agrónoma) mirando el perfil de cada grupo
# (docs/superpowers/plans/2026-11-15-propuesta-mejoras-agronomicas-d33.md) y Enzo verificó su ubicación contra el mapa
# (data/imagenes/zonas_aizal.png). Los números de grupo son estables: semilla fija y grupos ordenados por tamaño.
# Si cambian k, las variables o la muestra, hay que volver a mirar el perfil antes de reusarlos.
NOMBRES_GRUPOS = {
    0: 'Llanura semiárida cálida (Chaco Seco y Secano Este)',
    1: 'Llanura semiárida arenosa (Río Dulce y transición sur)',
    2: 'Llanura arcillosa con riesgo de anegamiento (Bajos)',
    3: 'Sierras y pedemonte fresco (Sierras del Sudoeste)',
    4: 'Humedales y paleocauces con alta materia orgánica',
}


def armar_json(res, df, nombres=None):
    """JSON del contrato §7. `nombres` = {id de grupo: nombre}; sin nombre, el grupo queda en null."""
    nombres = nombres or {}
    k, et = res['k'], np.asarray(res['etiquetas'])
    grupos = []
    for g in range(k):
        sel = df[et == g]
        grupos.append({'id': g, 'nombre': nombres.get(g), 'area_pct': round(100 * len(sel) / len(df), 1), 'n': int(len(sel)),
                       'perfil': {c: round(float(sel[v].mean()), 2) if len(sel) else None for c, v in PERFIL.items()}})
    mejor = max(res['siluetas'], key=res['siluetas'].get)
    criterio = (f'k = {k}, como propuso la cátedra (D-25). Silueta media con k = {k}: '
                f'{res["siluetas"][k]:.3f}. ')
    criterio += ('Es la mejor silueta entre los k probados.' if mejor == k else
                 f'La mejor silueta se da con k = {mejor} ({res["siluetas"][mejor]:.3f}); se mantiene k = {k} '
                 'para conversar con las 5 zonas de BioSat.')
    meta = meta_base(
        fuente='TerraClimate 1991-2020 (IDAHO_EPSCOR/TERRACLIMATE), SoilGrids 2.0 0-30 cm (projects/soilgrids-isric), '
               'NASADEM (NASA/NASADEM_HGT/001)',
        metodo=(f'k-means (scikit-learn, n_init=20) sobre {len(VARIABLES)} variables estandarizadas, con '
                f'{len(df)} píxeles al azar de toda la provincia a {ESCALA} m. El mapa asigna cada píxel al centro '
                'más cercano en Earth Engine.'),
        script='ia_desmonte/zonificacion.py',
        notas=('Mismas variables que AIZAL V4 (B03-B18), tomadas de sus fuentes originales (TerraClimate y '
               'SoilGrids). Es una zonificación del equipo, no la AIZAL oficial. Los nombres de los grupos los puso el equipo '
               '(Vale) mirando su perfil y el mapa (D-33). La coincidencia con las '
               'zonas de BioSat no tiene por qué ser 100 %: las zonas de BioSat se arman por departamento.'),
        variables=VARIABLES, k=k, silueta_media=round(res['siluetas'][k], 3),
        siluetas_por_k={str(kk): round(v, 3) for kk, v in sorted(res['siluetas'].items())},
        criterio_k=criterio, escala_m=ESCALA, imagen={'archivo': IMAGEN, 'bbox': BBOX_PROVINCIA})
    return {'meta': meta, 'grupos': grupos, 'comparacion_biosat': comparar(df, et)}


# ------------------------------------------------------------------ Earth Engine

def _suelo(ee, var, factor):
    img = ee.Image(f'projects/soilgrids-isric/{var}_mean')
    a, b, c = [img.select(f'{var}_{d}_mean') for d in ('0-5cm', '5-15cm', '15-30cm')]
    return a.multiply(5).add(b.multiply(10)).add(c.multiply(15)).divide(30).multiply(factor)


def imagen_variables(ee):
    """Imagen con VARIABLES en unidades reales."""
    tc = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE').filterDate('1991-01-01', '2021-01-01')
    meses = ee.List.sequence(1, 12)
    clim = lambda banda: ee.ImageCollection(meses.map(
        lambda m: tc.filter(ee.Filter.calendarRange(m, m, 'month')).select(banda).mean()))
    return ee.Image.cat([
        tc.select('pr').sum().divide(30).rename('lluvia_anual_mm'),
        tc.select('def').sum().divide(30).multiply(0.1).rename('def_hidrico_mm'),
        clim('tmmx').max().multiply(0.1).rename('tmax_mes_calido_c'),
        clim('tmmn').min().multiply(0.1).rename('tmin_mes_frio_c'),
        _suelo(ee, 'phh2o', 0.1).rename('ph'),
        _suelo(ee, 'clay', 0.1).rename('arcilla_pct'),
        _suelo(ee, 'sand', 0.1).rename('arena_pct'),
        _suelo(ee, 'soc', 0.1).rename('carbono_organico_g_kg'),
        _suelo(ee, 'bdod', 0.01).rename('densidad_aparente_g_cm3'),
        _suelo(ee, 'cec', 0.1).rename('cic_cmolc_kg'),
        ee.Terrain.slope(ee.Image('NASA/NASADEM_HGT/001').select('elevation')).rename('pendiente_grados'),
    ])


def muestra(n=N_MUESTRA, semilla=SEMILLA):
    ee = iniciar_ee()
    from ia_desmonte.zonas import zona_imagen
    z = zona_imagen()
    img = imagen_variables(ee).addBands(z).updateMask(z.mask())
    df = muestras_por_tandas(img, ee.Geometry.Rectangle(BBOX_PROVINCIA), n, ESCALA, semilla)
    df = df.dropna(subset=VARIABLES + ['zona'])
    df['zona'] = df['zona'].astype(int)
    return df


def pintar_mapa(res):
    """PNG de los grupos: cada píxel va al centro más cercano (mismas medias y desvíos que la muestra)."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zonas_fc
    img = imagen_variables(ee)
    std = ee.Image.cat([img.select(v).subtract(float(res['media'][i])).divide(float(res['desvio'][i]))
                        for i, v in enumerate(VARIABLES)])
    dists = []
    for c in res['centros_std']:
        d = std.subtract(ee.Image.constant([float(x) for x in c])).pow(2).reduce(ee.Reducer.sum())
        dists.append(d.multiply(-1))
    grupo = ee.Image.cat(dists).toArray().arrayArgmax().arrayGet([0]).rename('grupo')
    prov = zonas_fc().geometry()
    vis = grupo.clip(prov).visualize(min=0, max=res['k'] - 1, palette=PALETA[:res['k']])
    borde = ee.Image().byte().paint(zonas_fc(), 1, 1).visualize(palette=['333333'])
    url = (vis.blend(borde)).getThumbURL({'region': ee.Geometry.Rectangle(BBOX_PROVINCIA), 'dimensions': 900,
                                          'format': 'png', 'crs': 'EPSG:4326'})
    destino = DATA / 'imagenes' / 'zonas_aizal.png'
    destino.parent.mkdir(parents=True, exist_ok=True)
    con_reintentos(lambda: urllib.request.urlretrieve(url, destino))


def main():
    ruta = SALIDAS / 'zonificacion_muestra.csv'
    if ruta.exists():
        df = pd.read_csv(ruta)
    else:
        df = muestra()
        SALIDAS.mkdir(parents=True, exist_ok=True)
        df.to_csv(ruta, index=False)
    res = agrupar(df)
    print('Siluetas:', {k: round(v, 3) for k, v in res['siluetas'].items()})
    pintar_mapa(res)
    escribir_json(DATA / 'zonificacion_aizal.json', armar_json(res, df, NOMBRES_GRUPOS if res['k'] == 5 else None))
    print('Listo: data/zonificacion_aizal.json')


if __name__ == '__main__':
    main()
