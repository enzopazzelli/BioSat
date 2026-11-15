"""Pruebas de scripts/descargar_meteomatics.py (D-34): una descarga incompleta no pisa el pronóstico bueno.

Corre sin internet: la descarga de cada zona se reemplaza por una función de prueba.
Uso: python -X utf8 -m pytest scripts/pruebas -q
"""
import importlib.util
import json
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / 'descargar_meteomatics.py'


def cargar_script():
    spec = importlib.util.spec_from_file_location('descargar_meteomatics', SCRIPT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.PASS = 'clave-de-prueba'
    return mod


def respuesta(mod):
    """Respuesta con la forma de la API de Meteomatics: un valor por parámetro y por día."""
    fechas = ['2026-11-15T00:00:00Z', '2026-11-16T00:00:00Z']
    return {'data': [{'parameter': p, 'coordinates': [{'dates': [{'date': f, 'value': 1.0} for f in fechas]}]}
                     for p in mod.PARAMETROS]}


def test_si_falla_una_zona_no_escribe_y_sale_con_error(tmp_path):
    mod = cargar_script()
    destino = tmp_path / 'meteomatics_santiago_zonas.json'
    destino.write_text('{"bueno": true}', encoding='utf-8')
    fallida = mod.ZONAS[2]['id']
    mod.descargar_pronostico_zona = lambda z: None if z['id'] == fallida else respuesta(mod)
    with pytest.raises(SystemExit) as salida:
        mod.main(out_file=str(destino))
    assert salida.value.code == 1
    assert destino.read_text(encoding='utf-8') == '{"bueno": true}'


def test_si_bajan_las_5_zonas_escribe_el_archivo(tmp_path):
    mod = cargar_script()
    destino = tmp_path / 'meteomatics_santiago_zonas.json'
    mod.descargar_pronostico_zona = lambda z: respuesta(mod)
    mod.main(out_file=str(destino))
    j = json.loads(destino.read_text(encoding='utf-8'))
    assert [z['id'] for z in j['zonas']] == [z['id'] for z in mod.ZONAS]
    assert all(len(z['pronostico_7_dias']) == 2 for z in j['zonas'])
