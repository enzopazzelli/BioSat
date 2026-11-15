"""Meses de suelo pelado por zona con Landsat 2021-2025, y el índice de fragilidad (data/diagnostico_landsat_ia.json, §3).

- Puntos al azar sobre cultivos (ESA WorldCover 2021, clase 40): 1.500 por zona.
- En cada punto: NDVI mediano de cada mes calendario con Landsat 8 y 9 Collection 2 Level-2, 2021-2025,
  sin nubes, sombras, cirros ni nieve (QA_PIXEL).
- Un mes es "pelado" si al menos la mitad de los puntos de cultivo de la zona tiene NDVI < 0,25.
  Se repite con 0,20 y 0,30: si el resultado cambia, el mes queda marcado como dudoso.

Uso: EE_PROJECT=<id> python -X utf8 -m ia_desmonte.suelo_pelado
"""
import json

import pandas as pd

from ia_desmonte.comun import (BBOX_PROVINCIA, DATA, SALIDAS, SEMILLA, ZONAS, con_reintentos, escribir_json,
                               iniciar_ee, meta_base)

UMBRALES = (0.20, 0.25, 0.30)
UMBRAL = 0.25
PUNTOS_POR_ZONA = 1500
FORMULA = ('100 * (0,35 * min(dias_calor_40 / 40, 1) + 0,30 * meses_pelados / 12 + 0,20 * min(deficit_mm / 1200, 1) '
           '+ 0,15 * riesgo_desmonte)')
MESES = [f'm{m:02d}' for m in range(1, 13)]
CUENTAS = [f'n{m:02d}' for m in range(1, 13)]


def meses_pelados(por_umbral):
    """Devuelve (pelados, dudosos): 12 booleanos cada uno."""
    base = por_umbral[UMBRAL]
    pelados, dudosos = [], []
    for m in range(12):
        if base[m] is None:
            pelados.append(False)
            dudosos.append(True)
            continue
        p = base[m] >= 0.5
        otros = [por_umbral[u][m] for u in por_umbral if u != UMBRAL]
        cambia = any(o is None or (o >= 0.5) != p for o in otros)
        pelados.append(bool(p))
        dudosos.append(bool(cambia))
    return pelados, dudosos


def fragilidad(dias40, meses, deficit, riesgo):
    """Índice orientativo de 0 a 100 (fórmula en FORMULA). Si falta algún dato, None."""
    if None in (dias40, meses, deficit, riesgo):
        return None
    v = 0.35 * min(dias40 / 40, 1) + 0.30 * meses / 12 + 0.20 * min(deficit / 1200, 1) + 0.15 * riesgo
    return round(100 * v, 1)


def fracciones_desde_tabla(df, umbrales=UMBRALES):
    """De la tabla de puntos (zona, m01..m12, n01..n12) a fracciones por umbral, zona y mes, y puntos con dato."""
    fr = {u: {} for u in umbrales}
    nobs = {}
    for i, z in enumerate(ZONAS, start=1):
        d = df[df['zona'] == i]
        nobs[z] = [int(d[c].notna().sum()) for c in MESES]
        for u in umbrales:
            fila = []
            for c in MESES:
                v = d[c].dropna()
                fila.append(round(float((v < u).mean()), 3) if len(v) else None)
            fr[u][z] = fila
    return fr, nobs


def armar_json(fr, nobs, clima, riesgo, monte, obs_por_punto=None):
    """JSON del contrato §3."""
    zonas = {}
    for z in ZONAS:
        pel, dud = meses_pelados({u: fr[u][z] for u in fr})
        n_pel = sum(pel)
        zonas[z] = {
            'meses_suelo_pelado': pel, 'meses_dudosos': dud, 'fraccion_pelado': fr[UMBRAL][z],
            'fraccion_pelado_umbral_020': fr.get(0.20, {}).get(z), 'fraccion_pelado_umbral_030': fr.get(0.30, {}).get(z),
            'n_puntos_con_dato': nobs[z],
            'obs_limpias_por_punto': obs_por_punto[z] if obs_por_punto else None,
            'meses_suelo_pelado_promedio_anual': n_pel,
            'desmonte_reciente_pct': monte[z]['desmonte_reciente_pct'],
            'monte_actual_pct': monte[z]['monte_actual_pct'],
            'indice_fragilidad_0_100': fragilidad(clima[z]['dias40'], n_pel, clima[z]['deficit'], riesgo[z]),
            'formula_fragilidad': FORMULA,
            'confianza': 'media', 'confianza_fragilidad': 'baja',
        }
    meta = meta_base(
        fuente='Landsat 8 y 9 Collection 2 Level-2 (LANDSAT/LC08/C02/T1_L2, LANDSAT/LC09/C02/T1_L2), 2021-2025; '
               'cultivos de ESA WorldCover 2021 (ESA/WorldCover/v200, clase 40)',
        metodo=(f'{PUNTOS_POR_ZONA} puntos al azar sobre cultivos por zona. En cada punto, NDVI mediano de cada mes '
                f'calendario (2021-2025, sin nubes). Mes pelado: al menos la mitad de los puntos con NDVI < {UMBRAL}. '
                'Sensibilidad con 0,20 y 0,30: si cambia, el mes queda en meses_dudosos.'),
        script='ia_desmonte/suelo_pelado.py',
        notas=('El NDVI no distingue el suelo pelado del rastrojo: los dos tienen NDVI bajo. No hay datos de campo '
               'para medir la exactitud, por eso evaluacion queda en null. La fragilidad es un índice orientativo: '
               'sus pesos los eligió el equipo y no están calibrados (confianza baja). Usa días de más de 40 °C y '
               'déficit hídrico del período reciente (2021-2025) de clima_zonas.json y el riesgo de '
               'desmonte_zonas.json. monte_actual_pct y desmonte_reciente_pct salen de Hansen GFC.'),
        etiquetas='sin etiquetas de campo', periodo='2021-2025', umbral_ndvi=UMBRAL, umbrales_sensibilidad=list(UMBRALES))
    return {'meta': meta,
            'evaluacion': {'datos_de_prueba': 'sin datos de campo: no hay exactitud medible',
                           'metodos': {'umbral_ndvi': {'exactitud': None, 'f1': None}},
                           'metodo_elegido': 'umbral_ndvi'},
            'zonas': zonas}


# ------------------------------------------------------------------ Earth Engine

def _ndvi_mensual(ee):
    """Imagen con el NDVI mediano (m01..m12) y la cantidad de observaciones limpias (n01..n12) por mes."""
    def limpiar(img):
        qa = img.select('QA_PIXEL')
        malo = (qa.bitwiseAnd(1 << 1).neq(0).Or(qa.bitwiseAnd(1 << 3).neq(0))
                .Or(qa.bitwiseAnd(1 << 4).neq(0)).Or(qa.bitwiseAnd(1 << 5).neq(0)))
        sr = img.select(['SR_B4', 'SR_B5']).multiply(0.0000275).add(-0.2)
        return sr.normalizedDifference(['SR_B5', 'SR_B4']).rename('ndvi').updateMask(malo.Not())
    region = ee.Geometry.Rectangle(BBOX_PROVINCIA)
    col = (ee.ImageCollection('LANDSAT/LC08/C02/T1_L2').merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
           .filterBounds(region).filterDate('2021-01-01', '2026-01-01').map(limpiar))
    bandas = []
    for m in range(1, 13):
        mes = col.filter(ee.Filter.calendarRange(m, m, 'month'))
        bandas += [mes.median().rename(f'm{m:02d}'), mes.count().rename(f'n{m:02d}')]
    return ee.Image.cat(bandas)


def tabla_puntos():
    """Tabla de puntos de cultivo con su NDVI mensual (una consulta por zona)."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zona_imagen
    z = zona_imagen()
    cultivos = ee.ImageCollection('ESA/WorldCover/v200').first().select('Map').eq(40)
    estrato = z.updateMask(cultivos).rename('zona')
    ndvi = _ndvi_mensual(ee)
    partes = []
    for i in range(1, 6):
        pts = estrato.stratifiedSample(numPoints=0, classBand='zona', classValues=[i], classPoints=[PUNTOS_POR_ZONA],
                                       region=ee.Geometry.Rectangle(BBOX_PROVINCIA), scale=30, seed=SEMILLA + i,
                                       geometries=True, tileScale=8)
        fc = ndvi.sampleRegions(collection=pts, properties=['zona'], scale=30, tileScale=8, geometries=False)
        datos = con_reintentos(lambda: fc.getInfo())
        partes.append(pd.DataFrame([f['properties'] for f in datos['features']]))
        print(f'  zona {i}: {len(datos["features"])} puntos')
    df = pd.concat(partes, ignore_index=True)
    for c in MESES + CUENTAS:
        if c not in df:
            df[c] = None
    return df


def _clima_reciente():
    c = json.loads((DATA / 'clima_zonas.json').read_text(encoding='utf-8'))['zonas']
    return {z: {'dias40': c[z]['anual']['dias_calor_40']['reciente'], 'deficit': -c[z]['anual']['balance_mm']['reciente']}
            for z in ZONAS}


def main():
    ruta = SALIDAS / 'suelo_pelado_puntos.csv'
    if ruta.exists():
        df = pd.read_csv(ruta)
    else:
        df = tabla_puntos()
        SALIDAS.mkdir(parents=True, exist_ok=True)
        df.to_csv(ruta, index=False)
    fr, nobs = fracciones_desde_tabla(df)
    obs = {z: [round(float(df[df['zona'] == i][c].mean()), 1) if df[df['zona'] == i][c].notna().any() else None
               for c in CUENTAS] for i, z in enumerate(ZONAS, start=1)}
    desm = json.loads((DATA / 'desmonte_zonas.json').read_text(encoding='utf-8'))
    riesgo = {z: desm['zonas'][z]['riesgo_medio_0_1'] for z in ZONAS}
    from ia_desmonte.desmonte import desmonte_reciente_pct
    reciente = desmonte_reciente_pct()
    monte = {z: {'monte_actual_pct': desm['zonas'][z]['monte_actual_pct'], 'desmonte_reciente_pct': reciente[z]}
             for z in ZONAS}
    escribir_json(DATA / 'diagnostico_landsat_ia.json', armar_json(fr, nobs, _clima_reciente(), riesgo, monte, obs))
    print('Listo: data/diagnostico_landsat_ia.json')


if __name__ == '__main__':
    main()
