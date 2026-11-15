import pytest
from ia_desmonte.comun import ZONAS
from ia_desmonte.proyeccion import backtest, elegir_metodo, predecir, proyectar_zonas

ANIOS = list(range(2001, 2026))


def test_promedio_3():
    assert predecir([10, 20, 30, 40], 'promedio_3', 2) == [30, 30]


def test_tendencia_8_sigue_la_recta():
    assert predecir([1, 2, 3, 4, 5, 6, 7, 8], 'tendencia_8', 2) == pytest.approx([9, 10])


def test_nunca_negativo():
    for m in ('promedio_3', 'tendencia_8', 'holt'):
        assert min(predecir([100, 80, 60, 40, 20, 10, 5, 1], m, 4)) >= 0


def test_backtest_elige_el_menor_error():
    assert elegir_metodo({'promedio_3': 30.0, 'tendencia_8': 12.5, 'holt': 20.0}) == 'tendencia_8'


def test_backtest_serie_constante_da_error_cero_con_promedio():
    series = {z: [100.0] * 25 for z in ZONAS}
    assert backtest(series, ANIOS)['promedio_3'] == pytest.approx(0.0)


def test_proyectar_zonas_devuelve_4_anios_por_zona():
    series = {z: [float(100 + i) for i in range(25)] for z in ZONAS}
    p = proyectar_zonas(series)
    assert p['anios'] == [2026, 2027, 2028, 2029]
    assert all(len(p['valores'][z]) == 4 for z in ZONAS)
    assert p['metodo'] in ('promedio_3', 'tendencia_8', 'holt') and p['error_ha_pct'] >= 0
