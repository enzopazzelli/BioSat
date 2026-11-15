"""Recorte satelital de un lote con vuelo de dron (D-40): Sentinel-2 a 10 m y Landsat 8/9 a 30 m.

Busca una pasada sin nubes cercana a la fecha del vuelo, alrededor del lote (el recuadro sale del GeoTIFF del dron,
con un margen), y guarda color real, NDVI y los valores del NDVI en data/imagenes/lotes/<lote>/.
Siempre queda la fecha de la pasada y a cuántos días del vuelo está (D-33). Si no hay pasada limpia, esa fuente
queda en null con el motivo.

Uso (Earth Engine con EE_PROJECT):
    python -X utf8 -m ia_desmonte.recorte_lote --tif D:/User/Desktop/NDVI.tif --nombre capital_zona1 [--fecha AAAA-MM-DD]
Diseño: docs/superpowers/specs/2026-11-15-satelite-del-lote-design.md
"""
import argparse
import datetime
import io
import json
import math
import urllib.request

from ia_desmonte.comun import DATA, con_reintentos, escribir_json, iniciar_ee

DESTINO = DATA / 'imagenes' / 'lotes'
MINIMO_LIMPIO = 0.95
VENTANA = {'s2': 20, 'l8': 30}
SIN_FECHA_DIAS = 120   # sin fecha del vuelo: la pasada limpia más reciente de los últimos 120 días
# Paleta del NDVI de la app (la leyenda .ramp de web/estilos.css y el dron), de 0 a 0,8.
PALETA_APP = ['a50026', 'f46d43', 'fee08b', 'd9ef8b', '66bd63', '006837']
M_GRADO = 111320


# ---------------------------------------------------------------- lógica pura (con pruebas)
def recuadro_de_tif(ruta, margen_m=200):
    """[oeste, sur, este, norte] del GeoTIFF (solo EPSG:4326), más un margen en metros."""
    import tifffile
    with tifffile.TiffFile(str(ruta)) as t:
        p = t.pages[0]
        geo = p.tags.get(34735)
        claves = list(geo.value) if geo else []
        geokeys = {claves[i]: claves[i + 3] for i in range(4, len(claves), 4)}
        if geokeys.get(1024) != 2 or geokeys.get(2048) != 4326:
            raise SystemExit('El GeoTIFF no está en latitud y longitud (EPSG:4326): usá --bbox oeste,sur,este,norte.')
        px, py = p.tags[33550].value[:2]
        x0, y0 = p.tags[33922].value[3:5]
        ancho, alto = p.imagewidth, p.imagelength
    o, n, e, s = x0, y0, x0 + ancho * px, y0 - alto * py
    dlat = margen_m / M_GRADO
    dlon = margen_m / (M_GRADO * math.cos(math.radians((s + n) / 2)))
    return [o - dlon, s - dlat, e + dlon, n + dlat]


def elegir_pasada(pasadas, fecha_vuelo, ventana_dias, minimo=MINIMO_LIMPIO):
    """La pasada limpia más cercana al vuelo dentro de la ventana (o la más reciente, sin fecha). (pasada, motivo)."""
    limpias = [p for p in pasadas if p['limpio'] >= minimo]
    if not fecha_vuelo:
        if not limpias:
            return None, f'sin pasada limpia en los últimos {SIN_FECHA_DIAS} días'
        p = max(limpias, key=lambda x: x['fecha'])
        return dict(p, dias_al_vuelo=None), None
    vuelo = datetime.date.fromisoformat(fecha_vuelo)
    cand = []
    for p in limpias:
        d = (datetime.date.fromisoformat(p['fecha']) - vuelo).days
        if abs(d) <= ventana_dias:
            cand.append((abs(d), d, p))
    if not cand:
        return None, f'sin pasada limpia a ±{ventana_dias} días del vuelo'
    _, d, p = min(cand, key=lambda x: (x[0], x[1]))   # empate: la de antes del vuelo
    return dict(p, dias_al_vuelo=d), None


def elegir_pasada_mes(pasadas, mes, minimo=MINIMO_LIMPIO):
    """Vuelo conocido solo por el mes ('AAAA-MM'): la pasada limpia del mes más cerca de su mitad, sin días al vuelo."""
    limpias = [p for p in pasadas if p['limpio'] >= minimo and p['fecha'].startswith(mes)]
    if not limpias:
        return None, f'sin pasada limpia en {mes}, el mes del vuelo'
    p = min(limpias, key=lambda x: (abs(int(x['fecha'][8:10]) - 15), x['fecha']))
    return dict(p, dias_al_vuelo=None), None


def armar_lote_json(nombre, recuadro, fecha_vuelo, fuentes, motivos):
    return {'version': 1, 'nombre': nombre, 'recuadro': recuadro, 'fecha_vuelo': fecha_vuelo,
            'generado_por': 'ia_desmonte/recorte_lote.py', 'fecha': datetime.date.today().isoformat(),
            'notas': 'Recorte satelital alrededor del lote con vuelo de dron (D-40). Cada fuente es una sola pasada sin '
                     'nubes en el recuadro (al menos 95 % limpio); dias_al_vuelo es la fecha de la pasada menos la del vuelo.',
            'fuentes': fuentes, 'motivos': motivos}


# ---------------------------------------------------------------- Earth Engine
def _colecciones(ee):
    def s2():
        def limpio(img):
            scl = img.select('SCL')
            mascara = scl.neq(3).And(scl.neq(8)).And(scl.neq(9)).And(scl.neq(10)).And(scl.neq(11))
            ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI')
            return img.addBands(ndvi).updateMask(mascara).set('mascara', mascara)
        return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED'), limpio, 20, 10, \
            lambda im: im.select(['B4', 'B3', 'B2']).visualize(min=0, max=3000, gamma=1.2)

    def l8():
        def limpio(img):
            qa = img.select('QA_PIXEL')
            mascara = qa.bitwiseAnd(0b11110).eq(0)
            sr = img.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5']).multiply(0.0000275).add(-0.2)
            ndvi = sr.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI')
            return sr.addBands(ndvi).updateMask(mascara).set('mascara', mascara)
        col = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2').merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
        return col, limpio, 30, 30, lambda im: im.select(['SR_B4', 'SR_B3', 'SR_B2']).visualize(min=0, max=0.3, gamma=1.2)
    return {'s2': s2(), 'l8': l8()}


def _pasadas(ee, col, limpio, escala_mascara, geom, inicio, fin):
    """[{'id', 'fecha', 'limpio'}] de las imágenes de la colección en el recuadro y las fechas."""
    def con_limpio(img):
        m = ee.Image(limpio(img).get('mascara')).unmask(0)
        frac = m.reduceRegion(ee.Reducer.mean(), geom, escala_mascara, maxPixels=1e8).values().get(0)
        return img.set('limpio', frac, 'fecha_txt', img.date().format('YYYY-MM-dd'))
    lista = (col.filterBounds(geom).filterDate(inicio, fin).map(con_limpio)
             .reduceColumns(ee.Reducer.toList(3), ['system:index', 'fecha_txt', 'limpio']).get('list'))
    return [{'id': i, 'fecha': f, 'limpio': float(l or 0)} for i, f, l in con_reintentos(lambda: lista.getInfo())]


def _bajar_png(img_vis, geom, escala, destino):
    from PIL import Image
    url = img_vis.getThumbURL({'region': geom, 'scale': escala, 'format': 'png', 'crs': 'EPSG:4326'})
    datos = con_reintentos(lambda: urllib.request.urlopen(url, timeout=120).read())
    Image.open(io.BytesIO(datos)).save(destino, optimize=True)


def _grilla_ndvi(ee, img, geom, escala, recuadro):
    """Valores del NDVI en una grilla al norte arriba (None donde hay nube o falta dato)."""
    proy = ee.Projection('EPSG:4326').atScale(escala)
    arr = (img.select('NDVI').unmask(-9999).reproject(proy)
           .sampleRectangle(region=geom, defaultValue=-9999).get('NDVI'))
    filas = con_reintentos(lambda: arr.getInfo())
    valores = [None if v <= -9998 else round(v, 4) for fila in filas for v in fila]
    return {'ancho': len(filas[0]) if filas else 0, 'alto': len(filas), 'recuadro': recuadro, 'valores': valores}


def generar(nombre, recuadro, fecha_vuelo):
    ee = iniciar_ee()
    geom = ee.Geometry.Rectangle(recuadro)
    carpeta = DESTINO / nombre
    carpeta.mkdir(parents=True, exist_ok=True)
    fuentes, motivos = {}, {}
    for clave, (col, limpio, esc_m, esc, vis_rgb) in _colecciones(ee).items():
        if fecha_vuelo and len(fecha_vuelo) == 7:   # solo el mes (AAAA-MM): se busca dentro del mes
            ini = datetime.date.fromisoformat(fecha_vuelo + '-01')
            fin = (ini + datetime.timedelta(days=32)).replace(day=1)
        elif fecha_vuelo:
            v = datetime.date.fromisoformat(fecha_vuelo)
            ini, fin = v - datetime.timedelta(days=VENTANA[clave]), v + datetime.timedelta(days=VENTANA[clave] + 1)
        else:
            fin = datetime.date.today() + datetime.timedelta(days=1)
            ini = fin - datetime.timedelta(days=SIN_FECHA_DIAS)
        lista = _pasadas(ee, col, limpio, esc_m, geom, ini.isoformat(), fin.isoformat())
        pasada, motivo = (elegir_pasada_mes(lista, fecha_vuelo) if fecha_vuelo and len(fecha_vuelo) == 7
                          else elegir_pasada(lista, fecha_vuelo, VENTANA[clave]))
        if not pasada:
            fuentes[clave], motivos[clave] = None, motivo
            print(clave, '→', motivo)
            continue
        img = limpio(ee.Image(col.filter(ee.Filter.eq('system:index', pasada['id'])).first())).clip(geom)
        _bajar_png(vis_rgb(img), geom, esc, carpeta / f'{clave}_rgb.png')
        _bajar_png(img.select('NDVI').visualize(min=0, max=0.8, palette=PALETA_APP), geom, esc, carpeta / f'{clave}_ndvi.png')
        fuentes[clave] = {'escena': pasada['id'], 'fecha': pasada['fecha'], 'dias_al_vuelo': pasada['dias_al_vuelo'],
                          'limpio': round(pasada['limpio'], 3), 'resolucion_m': esc,
                          'rgb': f'{clave}_rgb.png', 'ndvi_png': f'{clave}_ndvi.png',
                          'ndvi': _grilla_ndvi(ee, img, geom, esc, recuadro)}
        print(clave, '→', pasada['fecha'], 'limpio', fuentes[clave]['limpio'], 'días al vuelo', pasada['dias_al_vuelo'])
    escribir_json(carpeta / 'lote.json', armar_lote_json(nombre, recuadro, fecha_vuelo, fuentes, motivos))
    indice = DESTINO / 'lotes.json'
    lotes = json.loads(indice.read_text(encoding='utf-8'))['lotes'] if indice.exists() else []
    lotes = [x for x in lotes if x['nombre'] != nombre] + [{'nombre': nombre, 'recuadro': recuadro, 'ruta': f'{nombre}/lote.json'}]
    escribir_json(indice, {'lotes': lotes})


def main():
    a = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    a.add_argument('--tif', help='GeoTIFF del dron (EPSG:4326) del que sale el recuadro')
    a.add_argument('--bbox', help='oeste,sur,este,norte (en lugar de --tif)')
    a.add_argument('--fecha', default=None, help='fecha del vuelo AAAA-MM-DD (sin ella, la pasada limpia más reciente)')
    a.add_argument('--mes', default=None, help='si solo se sabe el mes del vuelo: AAAA-MM (no se inventa el día)')
    a.add_argument('--nombre', required=True)
    a.add_argument('--margen', type=float, default=200)
    x = a.parse_args()
    recuadro = [float(v) for v in x.bbox.split(',')] if x.bbox else recuadro_de_tif(x.tif, x.margen)
    generar(x.nombre, [round(v, 7) for v in recuadro], x.fecha or x.mes)


if __name__ == '__main__':
    main()
