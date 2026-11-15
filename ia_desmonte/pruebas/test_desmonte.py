import numpy as np
import pandas as pd

from ia_desmonte.desmonte import PREDICTORES, confianza_riesgo, elegir, evaluar, riesgo_por_zona


def tabla_de_juguete(semilla, n=1500):
    """Tabla chica solo para probar las funciones (no son datos del proyecto)."""
    r = np.random.default_rng(semilla)
    df = pd.DataFrame({c: r.normal(size=n) for c in PREDICTORES if c != 'zona'})
    df['zona'] = r.integers(1, 6, size=n)
    logit = -1.5 * df['dist_sin_monte_m'] - df['dist_caminos_m'] - 1.0
    df['desmonte'] = (r.random(n) < 1 / (1 + np.exp(-logit))).astype(int)
    return df


class ModeloFijo:
    def __init__(self, p):
        self.p = p

    def predict_proba(self, X):
        return np.column_stack([np.full(len(X), 1 - self.p), np.full(len(X), self.p)])


def tabla_con_zona1_de_40_puntos():
    df = tabla_de_juguete(3, n=540)
    df['zona'] = [1] * 40 + [2] * 500
    return df


def test_elegir_usa_la_validacion_cruzada_del_entrenamiento_no_la_prueba():
    m = {'regresion_logistica': {'auc': .80, 'auc_cv': .78}, 'random_forest': {'auc': .79, 'auc_cv': .83},
         'gradient_boosting': {'auc': .82, 'auc_cv': .81}, 'tasa_base': 0.1}
    nombre, texto = elegir(m)
    assert nombre == 'random_forest'
    assert '0,83' in texto and '0,78' in texto and '0,79' in texto   # dice la validación cruzada y la prueba


def test_evaluar_con_datos_sinteticos_de_prueba_devuelve_metricas_validas():
    tr, te = tabla_de_juguete(semilla=1), tabla_de_juguete(semilla=2)
    r = evaluar(tr, te)
    assert set(r) >= {'regresion_logistica', 'random_forest', 'gradient_boosting', 'tasa_base'}
    for k in ('regresion_logistica', 'random_forest', 'gradient_boosting'):
        assert 0.5 < r[k]['auc'] <= 1
        assert set(r[k]) >= {'auc', 'auc_cv', 'f1', 'accuracy', 'kappa', 'pr_auc', 'umbral'}
        assert 0.5 < r[k]['auc_cv'] <= 1
    assert 0 < r['tasa_base'] < 1


def test_riesgo_zona_con_pocos_puntos_es_baja():
    r = riesgo_por_zona(ModeloFijo(0.3), tabla_con_zona1_de_40_puntos())
    assert r['zona_1_riego_salitre']['n'] == 40
    assert r['zona_1_riego_salitre']['riesgo'] == 0.3
    assert r['zona_3_monte_semiarido']['n'] == 0 and r['zona_3_monte_semiarido']['riesgo'] is None
    assert confianza_riesgo(40) == 'baja' and confianza_riesgo(100) == 'media'


def test_indice_rejilla_ubica_cada_punto_en_su_celda():
    import numpy as np
    from ia_desmonte.desmonte import REJILLA, indice_rejilla
    from ia_desmonte.comun import BBOX_PROVINCIA
    oeste, sur, este, norte = BBOX_PROVINCIA
    f, c = indice_rejilla(np.array([oeste + 0.0001, oeste + 2.5 * REJILLA]), np.array([norte - 0.0001, norte - 1.5 * REJILLA]))
    assert list(f) == [0, 1] and list(c) == [0, 2]


def test_leer_rejilla_devuelve_el_valor_de_la_celda():
    import numpy as np
    from ia_desmonte.desmonte import REJILLA, leer_rejilla
    from ia_desmonte.comun import BBOX_PROVINCIA
    oeste, _, _, norte = BBOX_PROVINCIA
    capa = np.arange(12, dtype=float).reshape(3, 4)
    v = leer_rejilla({'x': capa}, np.array([oeste + 3.5 * REJILLA]), np.array([norte - 2.5 * REJILLA]))
    assert v['x'][0] == capa[2, 3]


def test_leer_rejilla_fuera_de_la_grilla_da_nan():
    import numpy as np
    from ia_desmonte.desmonte import REJILLA, leer_rejilla
    from ia_desmonte.comun import BBOX_PROVINCIA
    oeste, _, _, norte = BBOX_PROVINCIA
    capa = np.ones((3, 4))
    v = leer_rejilla({'x': capa}, np.array([oeste + 0.5 * REJILLA, oeste + 0.5 * REJILLA]),
                     np.array([norte - 0.5 * REJILLA, norte - 10 * REJILLA]))   # el segundo cae al sur de la grilla
    assert v['x'][0] == 1 and np.isnan(v['x'][1])
