import json
import pytest
from ia_desmonte.comun import ZONAS, escribir_json, meta_base


def test_escribir_json_rechaza_nan(tmp_path):
    with pytest.raises(ValueError):
        escribir_json(tmp_path / 'x.json', {'a': float('nan')})


def test_escribir_json_no_pisa_si_falla(tmp_path):
    ruta = tmp_path / 'x.json'
    escribir_json(ruta, {'a': 1})
    with pytest.raises(ValueError):
        escribir_json(ruta, {'a': float('nan')})
    assert json.loads(ruta.read_text(encoding='utf-8')) == {'a': 1}


def test_meta_base_tiene_los_campos_obligatorios():
    m = meta_base('Hansen', 'umbral', 'ia_desmonte/x.py', notas='n', extra=1)
    assert {'fuente', 'metodo', 'generado_por', 'fecha', 'notas'} <= set(m) and m['extra'] == 1


def test_zonas_en_orden():
    assert ZONAS == ['zona_1_riego_salitre', 'zona_2_secano_este', 'zona_3_monte_semiarido',
                     'zona_4_bajos_submeridionales', 'zona_5_sur_serrano']
