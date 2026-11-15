import pytest
from ia_desmonte.suelo import armar_json, convertir, ponderar_0_30

CAMPOS = ['ph', 'arcilla_pct', 'arena_pct', 'limo_pct', 'carbono_organico_g_kg', 'nitrogeno_g_kg',
          'densidad_aparente_g_cm3', 'pdsi', 'distancia_caminos_km', 'distancia_monte_km', 'monte_nativo_pct']


def _stats(area):
    v = {'media': 1.234, 'mediana': 1.2, 'p10': 1.0, 'p90': 1.5, 'n': 5000}
    return {'area_medida': area, 'vars': {c: dict(v) for c in CAMPOS}}


STATS_EJEMPLO = {
    'zona_1_riego_salitre': _stats('tierra agropecuaria'),
    'zona_2_secano_este': _stats('tierra agropecuaria'),
    'zona_3_monte_semiarido': _stats('zona completa'),
    'zona_4_bajos_submeridionales': _stats('tierra agropecuaria'),
    'zona_5_sur_serrano': _stats('tierra agropecuaria'),
}


def test_ponderar_0_30():
    assert ponderar_0_30(60, 70, 80) == pytest.approx((5 * 60 + 10 * 70 + 15 * 80) / 30)


def test_convertir_unidades():
    assert convertir('phh2o', 81) == pytest.approx(8.1)
    # En Earth Engine el nitrógeno de SoilGrids viene en mg/kg (1770 donde la API de ISRIC da 177 cg/kg): x 0,001.
    assert convertir('nitrogen', 1770) == pytest.approx(1.77)
    assert convertir('bdod', 136) == pytest.approx(1.36)
    assert convertir('clay', 285) == pytest.approx(28.5)
    assert convertir('soc', 82) == pytest.approx(8.2)
    assert convertir('cec', 224) == pytest.approx(22.4)


def test_armar_json_respeta_contrato_y_marca_zona_completa():
    j = armar_json(STATS_EJEMPLO)
    z = j['zonas']['zona_1_riego_salitre']
    assert set(z) >= set(CAMPOS)
    assert z['ph']['confianza'] == 'media' and len(z['ph']['rango_p10_p90']) == 2
    assert z['ph']['valor'] == 1.23 and z['ph']['n_pixeles'] == 5000 and z['ph']['codigo'] == 'B16'
    assert j['zonas']['zona_3_monte_semiarido']['area_medida'] == 'zona completa'
    assert {'fuente', 'metodo', 'generado_por', 'fecha', 'notas'} <= set(j['meta'])


def test_armar_json_valor_faltante_queda_null():
    s = {k: {'area_medida': v['area_medida'], 'vars': {c: dict(d) for c, d in v['vars'].items()}}
         for k, v in STATS_EJEMPLO.items()}
    s['zona_2_secano_este']['vars']['pdsi'] = {'media': None, 'mediana': None, 'p10': None, 'p90': None, 'n': 0}
    z = armar_json(s)['zonas']['zona_2_secano_este']['pdsi']
    assert z['valor'] is None and z['rango_p10_p90'] is None
