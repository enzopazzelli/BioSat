from ia_desmonte.comun import ZONAS
from ia_desmonte.suelo_pelado import armar_json, fragilidad, meses_pelados


def test_mes_dudoso_si_cambia_con_el_umbral():
    pu = {0.20: [0.4] + [0.1] * 11, 0.25: [0.55] + [0.1] * 11, 0.30: [0.7] + [0.1] * 11}
    pel, dud = meses_pelados(pu)
    assert pel[0] is True and dud[0] is True and dud[1] is False and pel[1] is False


def test_mes_sin_datos_es_false_y_dudoso():
    pu = {u: [None] + [0.1] * 11 for u in (0.20, 0.25, 0.30)}
    pel, dud = meses_pelados(pu)
    assert pel[0] is False and dud[0] is True


def test_fragilidad_tope_100_y_formula():
    assert fragilidad(80, 12, 2000, 1.0) == 100.0
    assert fragilidad(20, 6, 600, 0.2) == round(100 * (0.35 * 0.5 + 0.30 * 0.5 + 0.20 * 0.5 + 0.15 * 0.2), 1)


def test_fragilidad_sin_riesgo_queda_null():
    assert fragilidad(20, 6, 600, None) is None


def test_armar_json_contrato():
    fr = {u: {z: [0.6] * 3 + [0.1] * 9 for z in ZONAS} for u in (0.20, 0.25, 0.30)}
    nobs = {z: [10] * 12 for z in ZONAS}
    clima = {z: {'dias40': 30.0, 'deficit': 1000.0} for z in ZONAS}
    riesgo = {z: 0.3 for z in ZONAS}
    monte = {z: {'monte_actual_pct': 20.0, 'desmonte_reciente_pct': 5.0} for z in ZONAS}
    j = armar_json(fr, nobs, clima, riesgo, monte)
    z = j['zonas']['zona_2_secano_este']
    assert z['meses_suelo_pelado'] == [True] * 3 + [False] * 9
    assert z['meses_suelo_pelado_promedio_anual'] == 3 and len(z['fraccion_pelado']) == 12
    assert z['confianza'] == 'media' and z['confianza_fragilidad'] == 'baja'
    assert j['evaluacion']['metodos']['umbral_ndvi']['exactitud'] is None


def test_fracciones_desde_tabla_ignora_puntos_sin_dato():
    import pandas as pd
    from ia_desmonte.suelo_pelado import fracciones_desde_tabla
    filas = []
    for i in range(10):
        f = {'zona': 1, **{f'm{m:02d}': 0.5 for m in range(1, 13)}, **{f'n{m:02d}': 4 for m in range(1, 13)}}
        f['m01'] = 0.1 if i < 6 else (None if i == 9 else 0.5)   # 6 pelados, 3 cubiertos, 1 sin dato
        filas.append(f)
    df = pd.DataFrame(filas)
    fr, nobs = fracciones_desde_tabla(df, (0.25,))
    assert fr[0.25]['zona_1_riego_salitre'][0] == round(6 / 9, 3)
    assert fr[0.25]['zona_1_riego_salitre'][1] == 0.0
    assert fr[0.25]['zona_2_secano_este'][0] is None
    assert nobs['zona_1_riego_salitre'][0] == 9
