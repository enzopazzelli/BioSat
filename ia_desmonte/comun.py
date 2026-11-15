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
HANSEN = 'UMD/hansen/global_forest_change_2025_v1_13'
ULTIMO_ANIO = 2025  # último año con pérdidas en Hansen v1.13
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
    estrato = ee.Image.constant(1).rename('estrato_muestra').updateMask(mascara).toInt()
    img = imagen.addBands(estrato)
    filas = []
    for i in range(math.ceil(n / tanda)):
        cuantos = min(tanda, n - i * tanda)
        fc = img.stratifiedSample(numPoints=cuantos, classBand='estrato_muestra', region=region, scale=escala,
                                  seed=semilla + i, dropNulls=True, tileScale=8, geometries=False)
        datos = con_reintentos(lambda: fc.getInfo())
        filas.extend(f['properties'] for f in datos['features'])
        print(f'  tanda {i + 1}: {len(datos["features"])} puntos')
    df = pd.DataFrame(filas)
    return df.drop(columns=['estrato_muestra'], errors='ignore')


def muestra_fc(imagen, region, n, escala, semilla):
    """FeatureCollection (del lado de Earth Engine) con n puntos al azar de los píxeles no enmascarados de `imagen`."""
    import ee
    mascara = imagen.mask().reduce(ee.Reducer.min())
    estrato = ee.Image.constant(1).rename('estrato_muestra').updateMask(mascara).toInt()
    return imagen.addBands(estrato).stratifiedSample(numPoints=n, classBand='estrato_muestra', region=region,
                                                     scale=escala, seed=semilla, dropNulls=True, tileScale=16,
                                                     geometries=False)


def asset_de(nombre):
    """Ruta de la tabla en el proyecto de Earth Engine (EE_PROJECT)."""
    return f'projects/{os.environ["EE_PROJECT"]}/assets/biosat_{nombre}'


def exportar(fc, nombre):
    """Exporta `fc` como tabla al proyecto de Earth Engine, en segundo plano y sin límite de tiempo.

    Si la tabla ya existe, no la vuelve a calcular. Devuelve la tarea (o None si ya estaba).
    """
    import ee
    try:
        ee.data.getAsset(asset_de(nombre))
        print(f'  {nombre}: ya estaba exportada')
        return None
    except ee.EEException:
        pass
    tarea = ee.batch.Export.table.toAsset(collection=fc, description=f'biosat_{nombre}', assetId=asset_de(nombre))
    tarea.start()
    print(f'  {nombre}: exportando (tarea {tarea.id})')
    return tarea


def esperar(tareas, cada=30):
    """Espera a que terminen las exportaciones; corta con error si alguna falla."""
    pendientes = [t for t in tareas if t is not None]
    while pendientes:
        time.sleep(cada)
        for t in list(pendientes):
            st = t.status()
            if st['state'] == 'COMPLETED':
                print(f'  tarea {t.id}: lista')
                pendientes.remove(t)
            elif st['state'] in ('FAILED', 'CANCELLED', 'CANCEL_REQUESTED'):
                raise RuntimeError(f'La exportación {st.get("description")} falló: {st.get("error_message")}')


def leer_tabla(nombre, pagina=4000):
    """Lee una tabla exportada por páginas y devuelve un DataFrame con sus propiedades."""
    import ee
    import pandas as pd
    tabla = ee.FeatureCollection(asset_de(nombre))
    n = con_reintentos(lambda: tabla.size().getInfo())
    filas = []
    for desde in range(0, n, pagina):
        datos = con_reintentos(lambda: tabla.toList(pagina, desde).getInfo())
        filas.extend(f['properties'] for f in datos)
    df = pd.DataFrame(filas)
    return df.drop(columns=['estrato_muestra'], errors='ignore')


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
