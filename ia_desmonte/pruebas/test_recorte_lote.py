"""Pruebas del recorte satelital del lote (D-40), sin internet: recuadro, elegir la pasada y armar el JSON."""
from pathlib import Path

import pytest

from ia_desmonte.recorte_lote import armar_lote_json, elegir_pasada, recuadro_de_tif

FIXTURE = Path(__file__).resolve().parents[2] / 'tests' / 'fixtures' / 'dron_ndvi_4326.tif'


def test_recuadro_de_tif_lee_el_geotiff_y_suma_el_margen():
    o, s, e, n = recuadro_de_tif(FIXTURE, 0)
    assert o == pytest.approx(-63.69025, abs=1e-9) and e == pytest.approx(-63.68975, abs=1e-9)
    assert n == pytest.approx(-29.49975, abs=1e-9) and s == pytest.approx(-29.50025, abs=1e-9)
    o2, s2, e2, n2 = recuadro_de_tif(FIXTURE, 200)
    assert n2 - n == pytest.approx(0.0018, abs=0.0001) and s - s2 == pytest.approx(0.0018, abs=0.0001)
    assert e2 - e > 0.0018   # en longitud, el margen se agranda por el coseno de la latitud


PASADAS = [
    {'id': 'a', 'fecha': '2026-10-20', 'limpio': 0.99},
    {'id': 'b', 'fecha': '2026-11-01', 'limpio': 0.90},   # nublada: se descarta
    {'id': 'c', 'fecha': '2026-11-06', 'limpio': 0.97},
    {'id': 'd', 'fecha': '2026-12-01', 'limpio': 1.00},
]


def test_elegir_pasada_la_mas_cercana_y_limpia_dentro_de_la_ventana():
    p, motivo = elegir_pasada(PASADAS, '2026-11-03', 20)
    assert p['id'] == 'c' and p['dias_al_vuelo'] == 3 and motivo is None


def test_elegir_pasada_sin_fecha_toma_la_limpia_mas_reciente():
    p, motivo = elegir_pasada(PASADAS, None, 20)
    assert p['id'] == 'd' and p['dias_al_vuelo'] is None


def test_elegir_pasada_sin_candidatas_da_el_motivo():
    p, motivo = elegir_pasada(PASADAS, '2027-03-01', 20)
    assert p is None and motivo == 'sin pasada limpia a ±20 días del vuelo'


def test_armar_lote_json_deja_en_null_la_fuente_sin_pasada():
    j = armar_lote_json('prueba', [-64, -28, -63.99, -27.99], '2026-11-03',
                        {'s2': {'escena': 'x', 'fecha': '2026-11-06'}, 'l8': None}, {'l8': 'sin pasada limpia a ±30 días del vuelo'})
    assert j['version'] == 1 and j['nombre'] == 'prueba' and j['fecha_vuelo'] == '2026-11-03'
    assert j['fuentes']['s2']['escena'] == 'x' and j['fuentes']['l8'] is None
    assert j['motivos'] == {'l8': 'sin pasada limpia a ±30 días del vuelo'}
