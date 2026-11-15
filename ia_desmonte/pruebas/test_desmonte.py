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


def test_elegir_toma_el_mayor_auc_y_la_justificacion_lo_dice():
    m = {'regresion_logistica': {'auc': .80, 'f1': .4}, 'random_forest': {'auc': .84, 'f1': .45},
         'gradient_boosting': {'auc': .83, 'f1': .47}, 'tasa_base': 0.1}
    nombre, texto = elegir(m)
    assert nombre == 'random_forest' and '0,84' in texto and '0,80' in texto


def test_evaluar_con_datos_sinteticos_de_prueba_devuelve_metricas_validas():
    tr, te = tabla_de_juguete(semilla=1), tabla_de_juguete(semilla=2)
    r = evaluar(tr, te)
    assert set(r) >= {'regresion_logistica', 'random_forest', 'gradient_boosting', 'tasa_base'}
    for k in ('regresion_logistica', 'random_forest', 'gradient_boosting'):
        assert 0.5 < r[k]['auc'] <= 1
        assert set(r[k]) >= {'auc', 'f1', 'accuracy', 'kappa', 'pr_auc', 'umbral'}
    assert 0 < r['tasa_base'] < 1


def test_riesgo_zona_con_pocos_puntos_es_baja():
    r = riesgo_por_zona(ModeloFijo(0.3), tabla_con_zona1_de_40_puntos())
    assert r['zona_1_riego_salitre']['n'] == 40
    assert r['zona_1_riego_salitre']['riesgo'] == 0.3
    assert r['zona_3_monte_semiarido']['n'] == 0 and r['zona_3_monte_semiarido']['riesgo'] is None
    assert confianza_riesgo(40) == 'baja' and confianza_riesgo(100) == 'media'
