"""Genera los GeoTIFF de PRUEBA del lector de dron (D-38).

Son datos SINTÉTICOS, solo para las pruebas: no son un vuelo real y nunca se muestran en la app como si lo fueran.
Uso: python -X utf8 tests/fixtures/generar_tif_prueba.py

- dron_rgb_utm20s.tif: foto RGB (3 bandas uint8), EPSG:32720, 0,05 m por píxel, en el punto de la Zona 2.
- dron_multi_utm20s.tif: 5 bandas uint16 (Blue, Green, Red, NIR, RedEdge), sin dato 0, mismo lugar.
  Fila 0 sin dato; columnas 0-69 con NDVI 0,5 y 70-99 con NDVI 0. Esperado: mediana 0,5 y 30 % bajo 0,25.
- dron_ndvi_4326.tif: 1 banda float32 con NDVI 0,1, EPSG:4326, en el punto de la Zona 5, sin fecha.
- dron_sin_coordenadas.tif: foto RGB sin GeoKeys.
"""
from pathlib import Path

import numpy as np
import tifffile

AQUI = Path(__file__).parent
# Punto de NASA POWER de la Zona 2 (-27,65; -62,42) en UTM 20 S, calculado con web/vendor/proj4.js.
E_Z2, N_Z2 = 557211, 6941434
# Punto de la Zona 5 (data/clima_zonas.json).
LAT_Z5, LON_Z5 = -29.5, -63.69
FECHA = '2026:11:03 10:30:00'


def geokeys_utm20s():
    # GTModelType=1 (proyectado), GTRasterType=1 (PixelIsArea), ProjectedCSType=32720
    return [1, 1, 0, 3, 1024, 0, 1, 1, 1025, 0, 1, 1, 3072, 0, 1, 32720]


def geokeys_4326():
    # GTModelType=2 (geográfico), GTRasterType=1, GeographicType=4326
    return [1, 1, 0, 3, 1024, 0, 1, 2, 1025, 0, 1, 1, 2048, 0, 1, 4326]


def etiquetas_geo(x0, y0, px, geokeys):
    """ModelPixelScale, ModelTiepoint (esquina superior izquierda) y GeoKeyDirectory."""
    return [
        (33550, 'd', 3, (px, px, 0.0), True),
        (33922, 'd', 6, (0.0, 0.0, 0.0, x0, y0, 0.0), True),
        (34735, 'H', len(geokeys), tuple(geokeys), True),
    ]


def gdal_desc(nombres):
    items = ''.join(f'<Item name="DESCRIPTION" sample="{i}" role="description">{n}</Item>' for i, n in enumerate(nombres))
    return f'<GDALMetadata>{items}</GDALMetadata>'


def escribir(nombre, datos, extratags, fotometrica, planar='contig'):
    tifffile.imwrite(AQUI / nombre, datos, photometric=fotometrica, planarconfig=planar, extratags=extratags)
    print(nombre, (AQUI / nombre).stat().st_size, 'bytes')


def main():
    # RGB en la Zona 2: 120 x 80 px, verde a la izquierda y marrón a la derecha.
    ancho, alto, px = 120, 80, 0.05
    rgb = np.zeros((alto, ancho, 3), np.uint8)
    rgb[:, :70] = (60, 140, 50)
    rgb[:, 70:] = (150, 110, 70)
    x0, y0 = E_Z2 - ancho * px / 2, N_Z2 + alto * px / 2
    escribir('dron_rgb_utm20s.tif', rgb,
             etiquetas_geo(x0, y0, px, geokeys_utm20s()) + [(306, 's', 0, FECHA, True)], 'rgb')

    # Multiespectral en la Zona 2: 100 x 60 px, 5 bandas (separadas), sin dato 0.
    ancho, alto = 100, 60
    multi = np.full((5, alto, ancho), 500, np.uint16)
    multi[2, :, :] = 1000            # Red
    multi[3, :, :70] = 3000          # NIR: NDVI 0,5
    multi[3, :, 70:] = 1000          # NIR: NDVI 0
    multi[:, 0, :] = 0               # fila sin dato
    x0, y0 = E_Z2 - ancho * px / 2, N_Z2 + alto * px / 2
    extra = etiquetas_geo(x0, y0, px, geokeys_utm20s()) + [
        (306, 's', 0, FECHA, True),
        (42112, 's', 0, gdal_desc(['Blue', 'Green', 'Red', 'NIR', 'RedEdge']), True),
        (42113, 's', 0, '0', True),
    ]
    escribir('dron_multi_utm20s.tif', multi, extra, 'minisblack', planar='separate')

    # NDVI ya calculado en la Zona 5: 50 x 50 px, EPSG:4326, sin fecha.
    ancho = alto = 50
    grados = 0.00001
    nd = np.full((alto, ancho), 0.1, np.float32)
    x0, y0 = LON_Z5 - ancho * grados / 2, LAT_Z5 + alto * grados / 2
    escribir('dron_ndvi_4326.tif', nd, etiquetas_geo(x0, y0, grados, geokeys_4326()), 'minisblack')

    # Foto sin coordenadas.
    escribir('dron_sin_coordenadas.tif', np.full((40, 40, 3), 120, np.uint8), [], 'rgb')


if __name__ == '__main__':
    main()
