"""Corre todo el pipeline de datos reales y deja un registro de la corrida.

Uso (desde la raíz del repo):
    EE_PROJECT=<id> python -X utf8 -m ia_desmonte.correr_todo                 # todo
    EE_PROJECT=<id> python -X utf8 -m ia_desmonte.correr_todo suelo imagenes  # solo algunos módulos

Las muestras de Earth Engine quedan en ia_desmonte/salidas/*.csv. Si existen, no se vuelven a pedir:
borrarlas fuerza una muestra nueva.
"""
import datetime
import importlib
import platform
import sys
import traceback

from ia_desmonte.comun import HANSEN, SALIDAS, SEMILLA, UMBRAL_MONTE, escribir_json

ORDEN = ['suelo', 'desmonte', 'zonificacion', 'suelo_pelado', 'imagenes']
DATASETS = {
    'hansen': HANSEN, 'soilgrids': 'projects/soilgrids-isric/*_mean (SoilGrids 2.0)',
    'terraclimate': 'IDAHO_EPSCOR/TERRACLIMATE', 'worldcover': 'ESA/WorldCover/v200',
    'grip4': 'projects/sat-io/open-datasets/GRIP4/Central-South-America', 'wdpa': 'WCMC/WDPA/current/polygons',
    'worldpop': 'WorldPop/GP/100m/pop', 'nasadem': 'NASA/NASADEM_HGT/001',
    'landsat': 'LANDSAT/LC08|LC09|LT05|LE07/C02/T1_L2',
    'limites': 'geoBoundaries ARG ADM2 (IGN), ver scripts/generar_mapa_santiago.py',
}


def _versiones():
    salida = {'python': platform.python_version()}
    for m in ('ee', 'numpy', 'pandas', 'sklearn'):
        try:
            salida[m] = importlib.import_module(m).__version__
        except Exception:  # noqa: BLE001
            salida[m] = None
    return salida


def main(solo=None):
    modulos = [m for m in ORDEN if not solo or m in solo]
    registro = {'inicio': datetime.datetime.now().isoformat(timespec='seconds'), 'datasets': DATASETS,
                'semilla': SEMILLA, 'umbral_monte_pct': UMBRAL_MONTE, 'versiones': _versiones(), 'modulos': {}}
    for m in modulos:
        print(f'\n=== {m} ===')
        try:
            importlib.import_module(f'ia_desmonte.{m}').main()
            registro['modulos'][m] = 'correcto'
        except Exception as e:  # noqa: BLE001 (un módulo que falla no frena a los demás ni pisa su JSON)
            traceback.print_exc()
            registro['modulos'][m] = f'error: {e}'
    registro['fin'] = datetime.datetime.now().isoformat(timespec='seconds')
    escribir_json(SALIDAS / 'registro_corrida.json', registro)
    print('\nRegistro:', registro['modulos'])
    return registro


if __name__ == '__main__':
    main(sys.argv[1:] or None)
