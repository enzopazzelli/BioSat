import numpy as np
import pandas as pd

from ia_desmonte.comun import ZONAS
from ia_desmonte.zonificacion import VARIABLES, agrupar, armar_json, comparar


def tabla_tres_grupos(semilla=0, n=300):
    """Tres grupos bien separados, solo para probar (no son datos del proyecto)."""
    r = np.random.default_rng(semilla)
    partes = []
    for g, centro in enumerate([0.0, 10.0, 20.0]):
        d = pd.DataFrame({v: r.normal(centro, 0.5, n) for v in VARIABLES})
        d['zona'] = g + 1
        partes.append(d)
    return pd.concat(partes, ignore_index=True)


def test_agrupar_reconoce_tres_grupos_separados():
    res = agrupar(tabla_tres_grupos(), k=3, ks=range(2, 5))
    assert res['siluetas'][3] > 0.7
    assert len(set(res['etiquetas'])) == 3


def test_grupos_ordenados_por_tamano():
    df = tabla_tres_grupos()
    df = pd.concat([df, df[df['zona'] == 2]], ignore_index=True)  # el grupo de la zona 2 queda más grande
    res = agrupar(df, k=3, ks=range(2, 4))
    tam = np.bincount(res['etiquetas'])
    assert list(tam) == sorted(tam, reverse=True)


def test_comparar_da_100_cuando_coinciden():
    df = tabla_tres_grupos()
    res = agrupar(df, k=3, ks=range(2, 4))
    c = comparar(df, res['etiquetas'])
    assert all(c[z]['coincidencia_pct'] == 100.0 for z in ZONAS[:3])
    assert c['zona_4_bajos_submeridionales'] == {'grupo_mayoritario': None, 'coincidencia_pct': None}


def test_armar_json_area_suma_100_y_nombres_en_null():
    df = tabla_tres_grupos()
    res = agrupar(df, k=3, ks=range(2, 4))
    j = armar_json(res, df)
    assert abs(sum(g['area_pct'] for g in j['grupos']) - 100) < 0.5
    assert all(g['nombre'] is None for g in j['grupos'])
    assert j['meta']['k'] == 3 and j['meta']['silueta_media'] == round(res['siluetas'][3], 3)
