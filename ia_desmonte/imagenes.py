"""Imágenes del visor (data/imagenes/, contrato §5): compuestos de mediana de Landsat hechos en Earth Engine.

- Verano: mediana de diciembre de 2024 a marzo de 2025. Invierno: mediana de junio a octubre de 2025 (Landsat 8 y 9).
- Año 2000 (solo Zona 3, Campo Gallo): mediana de agosto a noviembre de 2000 (Landsat 5 y 7).
- RGB en color natural y NDVI con paleta de marrón a verde. Recorte: el recuadro de cada zona del escenas.json anterior.

Uso: EE_PROJECT=<id> python -X utf8 -m ia_desmonte.imagenes
"""
import datetime
import hashlib
import io
import json
import urllib.request

from ia_desmonte.comun import DATA, RAIZ, SALIDAS, con_reintentos, escribir_json, iniciar_ee

CARPETA = DATA / 'imagenes'
PERIODOS = {'verano': ('2024-12-01', '2025-03-31', 'l89'), 'invierno': ('2025-06-01', '2025-10-31', 'l89'),
            'anio2000': ('2000-08-01', '2000-11-30', 'l57')}
CAPAS = {'verano': ['verano_rgb', 'verano_ndvi'], 'invierno': ['invierno_rgb', 'invierno_ndvi'], 'anio2000': ['2000_rgb']}
PALETA_NDVI = ['8c510a', 'bf812d', 'dfc27d', 'f6e8c3', 'c7eae5', '80cdc1', '35978f', '01665a']
MAX_KB = 300
ANCHO = 640


def _centro(inicio, fin):
    a, b = datetime.date.fromisoformat(inicio), datetime.date.fromisoformat(fin)
    return (a + (b - a) / 2).isoformat()


def componer(bbox, inicio, fin, sensores):
    """Mediana enmascarada de nubes con bandas R, G, B y NDVI, y la cantidad de escenas usadas."""
    ee = iniciar_ee()
    region = ee.Geometry.Rectangle(bbox)
    if sensores == 'l89':
        ids, rgb, nir_red = ['LANDSAT/LC08/C02/T1_L2', 'LANDSAT/LC09/C02/T1_L2'], ['SR_B4', 'SR_B3', 'SR_B2'], ['SR_B5', 'SR_B4']
    else:
        ids, rgb, nir_red = ['LANDSAT/LT05/C02/T1_L2', 'LANDSAT/LE07/C02/T1_L2'], ['SR_B3', 'SR_B2', 'SR_B1'], ['SR_B4', 'SR_B3']

    def limpiar(img):
        qa = img.select('QA_PIXEL')
        malo = (qa.bitwiseAnd(1 << 1).neq(0).Or(qa.bitwiseAnd(1 << 3).neq(0))
                .Or(qa.bitwiseAnd(1 << 4).neq(0)).Or(qa.bitwiseAnd(1 << 5).neq(0)))
        sr = img.select(rgb + [nir_red[0]]).multiply(0.0000275).add(-0.2)
        ndvi = img.select(nir_red).multiply(0.0000275).add(-0.2).normalizedDifference(nir_red).rename('NDVI')
        return sr.select(rgb, ['R', 'G', 'B']).addBands(ndvi).updateMask(malo.Not())

    col = ee.ImageCollection(ids[0]).merge(ee.ImageCollection(ids[1])).filterBounds(region).filterDate(inicio, fin)
    n = con_reintentos(lambda: col.size().getInfo())
    return col.map(limpiar).median().clip(region), n


def _bajar(img_vis, bbox, destino):
    """Baja la miniatura PNG y la achica a paleta si pasa de MAX_KB."""
    import ee
    from PIL import Image
    url = img_vis.getThumbURL({'region': ee.Geometry.Rectangle(bbox), 'dimensions': ANCHO, 'format': 'png',
                               'crs': 'EPSG:4326'})
    datos = con_reintentos(lambda: urllib.request.urlopen(url, timeout=120).read())
    im = Image.open(io.BytesIO(datos)).convert('RGB')
    im.save(destino, optimize=True)
    if destino.stat().st_size > MAX_KB * 1024:
        im.quantize(colors=256, method=Image.Quantize.MEDIANCUT).save(destino, optimize=True)
    return im


def _huella(im):
    return hashlib.sha256(im.convert('RGB').tobytes()).hexdigest()


def main():
    from PIL import Image
    previo = json.loads((CARPETA / 'escenas.json').read_text(encoding='utf-8'))
    escenas, huellas = {}, {}
    for z, m in previo.items():
        bbox = m['bbox']
        escenas[z] = {'bbox': bbox}
        for est, (ini, fin, sens) in PERIODOS.items():
            if est not in m:
                continue
            img, n = componer(bbox, ini, fin, sens)
            for capa in CAPAS[est]:
                if capa.endswith('ndvi'):
                    v = img.select('NDVI').visualize(min=0, max=0.8, palette=PALETA_NDVI)
                else:
                    v = img.select(['R', 'G', 'B']).visualize(min=0, max=0.3, gamma=1.2)
                destino = CARPETA / f'{z}_{capa}.png'
                im = _bajar(v, bbox, destino)
                previa = RAIZ / 'web' / 'img' / f'{z}_{capa}.webp'
                huellas[f'{z}_{capa}'] = {'png': _huella(im),
                                          'webp': _huella(Image.open(previa)) if previa.exists() else None}
                print(f'  {destino.name}: {destino.stat().st_size // 1024} KB, {n} escenas')
            sensores = 'Landsat 8/9' if sens == 'l89' else 'Landsat 5/7'
            escenas[z][est] = {'item': f'Mediana {sensores} · {n} escenas', 'fecha': _centro(ini, fin),
                               'periodo': f'{ini} a {fin}', 'n_escenas': n,
                               'fuente': 'Google Earth Engine (Collection 2 Level-2, sin nubes)'}
    escribir_json(CARPETA / 'escenas.json', escenas)
    escribir_json(SALIDAS / 'huellas_web_img.json', huellas)
    print('Listo: data/imagenes/')


if __name__ == '__main__':
    main()
