"""La paleta del NDVI es una sola en todo el proyecto: la leyenda del visor (.ramp de web/estilos.css),
las imágenes de Landsat de las zonas (imagenes.py), los recortes del lote (recorte_lote.py) y el dron (web/dron.js).
Antes de este arreglo, imagenes.py usaba otra (de marrón a verde azulado) y la leyenda no coincidía (D-40)."""
import re

from ia_desmonte.comun import RAIZ


def _ramp_css():
    css = (RAIZ / 'web' / 'estilos.css').read_text(encoding='utf-8')
    gradiente = re.search(r'\.ramp\{[^}]*linear-gradient\(90deg,([^)]*)\)', css).group(1)
    return [c.strip().lstrip('#').lower() for c in gradiente.split(',')]


def test_imagenes_de_landsat_usan_la_paleta_de_la_leyenda():
    from ia_desmonte.imagenes import PALETA_NDVI
    assert [c.lower() for c in PALETA_NDVI] == _ramp_css()


def test_recortes_del_lote_usan_la_misma_paleta():
    from ia_desmonte.imagenes import PALETA_NDVI
    from ia_desmonte.recorte_lote import PALETA_APP
    assert PALETA_APP == PALETA_NDVI


def test_el_dron_usa_la_paleta_de_la_leyenda():
    js = (RAIZ / 'web' / 'dron.js').read_text(encoding='utf-8')
    colores = re.search(r"colores: \[([^\]]*)\]", js).group(1)
    assert [c.strip(" '#").lower() for c in colores.split(',')] == _ramp_css()
