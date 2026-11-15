"""Proyección del desmonte anual por zona (2026-2029) con métodos simples probados contra el pasado.

Con 25 años de historia por zona, una red (LSTM o Transformer) no se justifica: se comparan tres métodos
simples, se prueban prediciendo 2019-2025 con lo que se sabía hasta 2018, y se elige el de menor error.
"""
import numpy as np

from ia_desmonte.comun import ZONAS

METODOS = ('promedio_3', 'tendencia_8', 'holt')
ANIOS_PROYECCION = [2026, 2027, 2028, 2029]


def _holt(serie, pasos):
    """Suavizado exponencial de Holt; alpha y beta se eligen con el error de un paso sobre la propia serie."""
    y = np.asarray(serie, dtype=float)
    mejor = None
    for a in np.arange(0.1, 1.0, 0.1):
        for b in np.arange(0.1, 1.0, 0.1):
            nivel, tend, err = y[0], y[1] - y[0], 0.0
            for v in y[1:]:
                err += (v - (nivel + tend)) ** 2
                nuevo = a * v + (1 - a) * (nivel + tend)
                tend = b * (nuevo - nivel) + (1 - b) * tend
                nivel = nuevo
            if mejor is None or err < mejor[0]:
                mejor = (err, nivel, tend)
    _, nivel, tend = mejor
    return [nivel + tend * (h + 1) for h in range(pasos)]


def predecir(serie, metodo, pasos):
    """Predice `pasos` años hacia adelante. Nunca devuelve valores negativos."""
    y = [float(v) for v in serie]
    if metodo == 'promedio_3':
        pred = [sum(y[-3:]) / 3] * pasos
    elif metodo == 'tendencia_8':
        x = np.arange(8)
        m, c = np.polyfit(x, y[-8:], 1)
        pred = [m * (8 + h) + c for h in range(pasos)]
    elif metodo == 'holt':
        pred = _holt(y, pasos)
    else:
        raise ValueError(f'Método desconocido: {metodo}')
    return [max(0.0, float(v)) for v in pred]


def backtest(series, anios, corte=2018):
    """Error ponderado (WAPE, %) de cada método al predecir los años posteriores a `corte`, sumado sobre las zonas."""
    k = anios.index(corte) + 1
    errores = {}
    for m in METODOS:
        num = den = 0.0
        for z in ZONAS:
            real = series[z][k:]
            pred = predecir(series[z][:k], m, len(real))
            num += sum(abs(p - r) for p, r in zip(pred, real))
            den += sum(real)
        errores[m] = round(100 * num / den, 1) if den else None
    return errores


def elegir_metodo(errores):
    """El método de menor error."""
    validos = {k: v for k, v in errores.items() if v is not None}
    return min(validos, key=validos.get)


def proyectar_zonas(series, anios=None):
    """Elige el método con el backtest y proyecta 2026-2029 para cada zona."""
    anios = anios or list(range(2001, 2001 + len(next(iter(series.values())))))
    errores = backtest(series, anios)
    metodo = elegir_metodo(errores)
    return {'metodo': metodo, 'error_ha_pct': errores[metodo], 'errores': errores, 'anios': ANIOS_PROYECCION,
            'valores': {z: [round(v, 1) for v in predecir(series[z], metodo, len(ANIOS_PROYECCION))]
                        for z in ZONAS}}
