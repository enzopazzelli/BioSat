# Pruebas de las cuentas del programa del ESP32 (arduino/biosat_estacion_esp32/main.py), sin hardware.
# Que mande la misma línea que el Uno (docs/contratos-de-datos.md §6) y con la misma lógica.
# Correr con: python -m pytest tests/test_esp32_micropython.py
import importlib.util
import json
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ARCHIVO = RAIZ / 'arduino' / 'biosat_estacion_esp32' / 'main.py'
spec = importlib.util.spec_from_file_location('esp32_main', ARCHIVO)
M = importlib.util.module_from_spec(spec)
spec.loader.exec_module(M)

CLAVES_DEL_CONTRATO = ['t', 'agua_raw', 'temp_suelo_c', 'temp_aire_c', 'hum_aire_pct', 'luz_raw', 'semaforo']


def test_en_la_pc_no_arranca_la_placa():
    assert M.EN_LA_PLACA is False


def test_la_linea_es_json_con_las_claves_del_contrato_en_orden():
    linea = M.linea_json(12345, 512, 41.23, 33.0, 28.0, 870, 'rojo')
    assert linea == ('{"t":12345,"agua_raw":512,"temp_suelo_c":41.2,"temp_aire_c":33.0,'
                     '"hum_aire_pct":28,"luz_raw":870,"semaforo":"rojo"}')
    assert list(json.loads(linea)) == CLAVES_DEL_CONTRATO


def test_un_sensor_que_falla_manda_null():
    datos = json.loads(M.linea_json(1, 0, None, None, None, 0, 'amarillo'))
    assert datos['temp_suelo_c'] is None and datos['temp_aire_c'] is None and datos['hum_aire_pct'] is None


def test_la_escala_queda_de_0_a_1023_como_en_el_uno():
    assert M.a_10_bits(0) == 0
    assert M.a_10_bits(65535) == 1023
    assert M.a_10_bits(32768) == 512


def test_la_humedad_se_da_vuelta_como_en_el_uno():
    assert M.agua_desde_crudo(1023) == 0          # horquilla seca
    assert M.agua_desde_crudo(300) == 723         # mojada: sube


def test_lm35_10_mv_por_grado_y_lecturas_no_creibles():
    assert M.grados_lm35(300000) == 30.0          # 300 mV = 30 °C
    assert M.grados_lm35(M.LM35_SATURADO_UV) is None
    assert M.grados_lm35(None) is None


def test_el_semaforo_usa_los_mismos_umbrales_que_el_uno():
    assert M.calcular_semaforo(None, 0) == 'amarillo'
    assert M.calcular_semaforo(45.0, 0) == 'rojo'
    assert M.calcular_semaforo(35.0, 0) == 'amarillo'
    assert M.calcular_semaforo(30.0, M.SALITRE_AGUA_RAW) == 'amarillo'
    assert M.calcular_semaforo(30.0, 0) == 'verde'
    sketch = (RAIZ / 'arduino' / 'biosat_estacion_humedad_suelo' / 'biosat_estacion_humedad_suelo.ino').read_text('utf8')
    assert float(re.search(r'SUELO_ROJO_C = ([\d.]+)', sketch).group(1)) == M.SUELO_ROJO_C
    assert float(re.search(r'SUELO_AMARILLO_C = ([\d.]+)', sketch).group(1)) == M.SUELO_AMARILLO_C


def test_el_lcd_recibe_2_filas_de_16_letras():
    for args in [(512, 31.2, 30.0, 870, 'verde'), (1023, None, None, 0, 'amarillo'), (0, 104.9, 99.9, 1023, 'rojo')]:
        fila1, fila2 = M.textos_lcd(*args)
        assert len(fila1) == 16 and len(fila2) == 16
    assert M.textos_lcd(512, 31.2, 30.0, 870, 'verde') == ('S 31.2C A30.0C  ', 'Ag 512Lz 870 VER')


def test_pines_sin_repetir_y_analogicos_en_el_adc1():
    nombres = [n for n in dir(M) if n.startswith('PIN_')]
    pines = [getattr(M, n) for n in nombres]
    assert len(set(pines)) == len(pines)
    for n in ('PIN_LM35', 'PIN_AGUA', 'PIN_LDR'):
        assert 32 <= getattr(M, n) <= 39, n        # el ADC2 no anda con el wifi prendido
    prohibidos = {0, 1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 15}   # arranque, USB y memoria del ESP32
    assert not prohibidos & set(pines)
    for n in nombres:
        if n not in ('PIN_LM35', 'PIN_AGUA'):
            assert getattr(M, n) not in (34, 35, 36, 39), f'{n}: 34 a 39 son solo de entrada'
