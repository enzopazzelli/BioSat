"""Constantes y utilidades compartidas por el pipeline de datos reales de BioSat.

Earth Engine se inicia con el proyecto de la variable de entorno EE_PROJECT (nunca se escribe en el repo).
"""
import datetime
import json
import math
import os
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATA = RAIZ / 'data'
SALIDAS = RAIZ / 'ia_desmonte' / 'salidas'

ZONAS = ['zona_1_riego_salitre', 'zona_2_secano_este', 'zona_3_monte_semiarido',
         'zona_4_bajos_submeridionales', 'zona_5_sur_serrano']
SEMILLA = 2026
HANSEN = 'UMD/hansen/global_forest_change_2024_v1_12'
UMBRAL_MONTE = 25  # % de cobertura arbórea en el 2000 para contar como monte
BBOX_PROVINCIA = [-65.3, -30.2, -61.5, -25.5]  # oeste, sur, este, norte


def iniciar_ee():
    """Inicia Earth Engine con el proyecto de EE_PROJECT."""
    proyecto = os.environ.get('EE_PROJECT')
    if not proyecto:
        raise SystemExit('Falta la variable de entorno EE_PROJECT con el ID del proyecto de Earth Engine.')
    import ee
    ee.Initialize(project=proyecto)
    return ee


def _a_python(o):
    """Convierte números de numpy a tipos de Python para json."""
    if hasattr(o, 'item'):
        return o.item()
    if hasattr(o, 'tolist'):
        return o.tolist()
    raise TypeError(f'No se puede guardar en JSON: {type(o).__name__}')


def escribir_json(ruta, dato):
    """Escribe JSON en UTF-8. Rechaza NaN e infinitos. Si algo falla, no toca el archivo existente."""
    texto = json.dumps(dato, ensure_ascii=False, indent=2, allow_nan=False, default=_a_python) + '\n'
    ruta = Path(ruta)
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(texto, encoding='utf-8')


def meta_base(fuente, metodo, script, notas='', **extra):
    """Bloque `meta` común a todos los JSON de datos."""
    m = {'fuente': fuente, 'metodo': metodo, 'generado_por': script,
         'fecha': datetime.date.today().isoformat(), 'notas': notas}
    m.update(extra)
    return m


def con_reintentos(fn, intentos=3, espera=5):
    """Llama a fn() y reintenta si Earth Engine corta la consulta."""
    for i in range(intentos):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001 (Earth Engine lanza varios tipos)
            if i == intentos - 1:
                raise
            print(f'  reintento {i + 1} tras error: {str(e)[:120]}')
            time.sleep(espera * (i + 1))


def muestras_por_tandas(imagen, region, n, escala, semilla, tanda=4000):
    """Toma n puntos al azar de los píxeles no enmascarados de `imagen`, en tandas, y devuelve un DataFrame."""
    import ee
    import pandas as pd
    mascara = imagen.mask().reduce(ee.Reducer.min())
    estrato = ee.Image.constant(1).rename('_estrato').updateMask(mascara).toInt()
    img = imagen.addBands(estrato)
    filas = []
    for i in range(math.ceil(n / tanda)):
        cuantos = min(tanda, n - i * tanda)
        fc = img.stratifiedSample(numPoints=cuantos, classBand='_estrato', region=region, scale=escala,
                                  seed=semilla + i, dropNulls=True, tileScale=8, geometries=False)
        datos = con_reintentos(lambda: fc.getInfo())
        filas.extend(f['properties'] for f in datos['features'])
        print(f'  tanda {i + 1}: {len(datos["features"])} puntos')
    df = pd.DataFrame(filas)
    return df.drop(columns=['_estrato'], errors='ignore')


UTM_20S = 'EPSG:32720'  # Santiago del Estero cae entera en la zona UTM 20 Sur: distancias en metros reales


def distancia_m(mascara, escala, tope_m):
    """Distancia en metros al píxel más cercano donde `mascara` vale 1, calculada a `escala` metros.

    Más allá de `tope_m` devuelve `tope_m` (el valor queda acotado y se avisa en los JSON).
    """
    import ee
    proj = ee.Projection(UTM_20S).atScale(escala)
    vecinos = int(tope_m / escala) + 2
    gruesa = (mascara.unmask(0).gt(0)
              .reduceResolution(reducer=ee.Reducer.max(), maxPixels=1024)
              .reproject(proj))
    d = gruesa.fastDistanceTransform(vecinos, 'pixels', 'squared_euclidean').sqrt().multiply(escala)
    return d.reproject(proj).unmask(tope_m).min(tope_m)
