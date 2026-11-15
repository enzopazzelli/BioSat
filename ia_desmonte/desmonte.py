"""Historia de desmontes y modelo predictivo por zona (data/desmonte_zonas.json, contrato §8).

- Historia: Hansen Global Forest Change (Landsat, 30 m), pérdida anual 2001-2024 sobre el monte del 2000.
- Modelo: validación en el tiempo. Entrena con el monte y los predictores al 2008 y el desmonte 2009-2015;
  se prueba con el monte y los predictores al 2015 y el desmonte 2016-2024. Compara regresión logística,
  random forest y gradient boosting, y elige el de mayor AUC en la prueba.
- Riesgo por zona: el modelo elegido se reentrena con 2015 -> 2016-2024 y se aplica al monte de 2024.

Uso: EE_PROJECT=<id> python -X utf8 -m ia_desmonte.desmonte
"""
import csv
import pickle

import numpy as np
import pandas as pd

from ia_desmonte.comun import (BBOX_PROVINCIA, DATA, HANSEN, SALIDAS, SEMILLA, UMBRAL_MONTE, ZONAS, con_reintentos,
                               distancia_m, escribir_json, iniciar_ee, meta_base, muestras_por_tandas)

PREDICTORES = ['dist_sin_monte_m', 'dist_desmonte_previo_m', 'dist_caminos_m', 'pendiente_grados', 'area_protegida',
               'poblacion_densidad', 'deficit_hidrico_mm', 'arcilla_pct', 'ph', 'zona']
NUMERICOS = [p for p in PREDICTORES if p != 'zona']
NOMBRES = {'regresion_logistica': 'regresión logística', 'random_forest': 'random forest',
           'gradient_boosting': 'gradient boosting'}
N_MUESTRA = 15000
ESCALA_MUESTRA = 100
TOPE_DIST_M = 25000
TOPE_CAMINOS_M = 50000
ANIOS = list(range(2001, 2025))
GRIP4 = 'projects/sat-io/open-datasets/GRIP4/South-America'
WDPA = 'WCMC/WDPA/current/polygons'
WORLDPOP = 'WorldPop/GP/100m/pop'
NASADEM = 'NASA/NASADEM_HGT/001'
TERRACLIMATE = 'IDAHO_EPSCOR/TERRACLIMATE'


# ------------------------------------------------------------------ modelos (sin Earth Engine)

def _modelo(nombre):
    from sklearn.compose import ColumnTransformer
    from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    zona = OneHotEncoder(categories=[[1, 2, 3, 4, 5]], handle_unknown='ignore')
    if nombre == 'regresion_logistica':
        prep = ColumnTransformer([('num', StandardScaler(), NUMERICOS), ('zona', zona, ['zona'])])
        return make_pipeline(prep, LogisticRegression(max_iter=1000))
    prep = ColumnTransformer([('num', 'passthrough', NUMERICOS), ('zona', zona, ['zona'])])
    if nombre == 'random_forest':
        return make_pipeline(prep, RandomForestClassifier(n_estimators=300, min_samples_leaf=5, n_jobs=-1,
                                                          random_state=SEMILLA))
    return make_pipeline(prep, HistGradientBoostingClassifier(random_state=SEMILLA))


def entrenar(nombre, df):
    """Entrena el modelo `nombre` con una tabla de PREDICTORES + 'desmonte'."""
    return _modelo(nombre).fit(df[PREDICTORES], df['desmonte'])


def _umbral_f1(nombre, df):
    """Umbral que maximiza F1 con validación cruzada de 5 partes sobre el entrenamiento (nunca sobre la prueba)."""
    from sklearn.metrics import precision_recall_curve
    from sklearn.model_selection import StratifiedKFold, cross_val_predict
    cv = StratifiedKFold(5, shuffle=True, random_state=SEMILLA)
    p = cross_val_predict(_modelo(nombre), df[PREDICTORES], df['desmonte'], cv=cv, method='predict_proba')[:, 1]
    prec, rec, umb = precision_recall_curve(df['desmonte'], p)
    f1 = 2 * prec * rec / np.maximum(prec + rec, 1e-12)
    return float(umb[int(np.argmax(f1[:-1]))])


def evaluar(train, test):
    """Entrena los 3 modelos con `train` y los mide con `test`."""
    from sklearn.metrics import (accuracy_score, average_precision_score, cohen_kappa_score, f1_score,
                                 roc_auc_score)
    salida = {}
    for nombre in NOMBRES:
        umbral = _umbral_f1(nombre, train)
        p = entrenar(nombre, train).predict_proba(test[PREDICTORES])[:, 1]
        pred = (p >= umbral).astype(int)
        y = test['desmonte']
        salida[nombre] = {'auc': round(float(roc_auc_score(y, p)), 3), 'f1': round(float(f1_score(y, pred)), 3),
                          'accuracy': round(float(accuracy_score(y, pred)), 3),
                          'kappa': round(float(cohen_kappa_score(y, pred)), 3),
                          'pr_auc': round(float(average_precision_score(y, p)), 3), 'umbral': round(umbral, 3)}
    salida['tasa_base'] = round(float(test['desmonte'].mean()), 4)
    return salida


def _coma(x):
    return f'{x:.2f}'.replace('.', ',')


def elegir(metodos):
    """Elige el método de mayor AUC en la prueba y escribe la justificación con los mismos números."""
    candidatos = {k: v for k, v in metodos.items() if k in NOMBRES}
    nombre = max(candidatos, key=lambda k: candidatos[k]['auc'])
    otros = sorted((k for k in candidatos if k != nombre), key=lambda k: -candidatos[k]['auc'])
    texto = (f'{NOMBRES[nombre].capitalize()} tiene el AUC más alto en la prueba 2016-2024 '
             f'({_coma(candidatos[nombre]["auc"])}), contra '
             + ' y '.join(f'{_coma(candidatos[k]["auc"])} de {NOMBRES[k]}' for k in otros) + '.')
    return nombre, texto


def riesgo_por_zona(modelo, df):
    """Probabilidad media de desmonte por zona y cantidad de puntos usados."""
    p = modelo.predict_proba(df[PREDICTORES])[:, 1]
    salida = {}
    for i, z in enumerate(ZONAS, start=1):
        sel = (df['zona'] == i).to_numpy()
        n = int(sel.sum())
        salida[z] = {'riesgo': round(float(p[sel].mean()), 3) if n else None, 'n': n}
    return salida


def confianza_riesgo(n):
    """Media si hay al menos 100 puntos de monte en la zona; si no, baja."""
    return 'media' if n >= 100 else 'baja'


# ------------------------------------------------------------------ Earth Engine

def _hansen(ee):
    h = ee.Image(HANSEN)
    return h.select('treecover2000'), h.select('lossyear').unmask(0)


def monte_en(ee, anio, umbral=UMBRAL_MONTE):
    """Monte al final de `anio`: cobertura del 2000 >= umbral y sin pérdida hasta ese año."""
    tc, ly = _hansen(ee)
    t = anio - 2000
    return tc.gte(umbral).And(ly.eq(0).Or(ly.gt(t)))


def _suelo_0_30(ee, var, factor):
    img = ee.Image(f'projects/soilgrids-isric/{var}_mean')
    a, b, c = [img.select(f'{var}_{d}_mean') for d in ('0-5cm', '5-15cm', '15-30cm')]
    return a.multiply(5).add(b.multiply(10)).add(c.multiply(15)).divide(30).multiply(factor)


def predictores(ee, corte):
    """Imagen con los predictores calculados al año `corte`."""
    from ia_desmonte.zonas import zona_imagen
    tc, ly = _hansen(ee)
    t = corte - 2000
    monte = monte_en(ee, corte)
    previa = ly.gte(1).And(ly.lte(t))
    region = ee.Geometry.Rectangle(BBOX_PROVINCIA).buffer(60000)
    caminos = ee.FeatureCollection(GRIP4).filterBounds(region)
    wdpa = ee.FeatureCollection(WDPA).filterBounds(region)
    anio_pob = min(corte, 2020)
    pob = (ee.ImageCollection(WORLDPOP).filter(ee.Filter.eq('country', 'ARG'))
           .filter(ee.Filter.eq('year', anio_pob)).mosaic())
    tclim = ee.ImageCollection(TERRACLIMATE).filterDate('1991-01-01', '2021-01-01').select('def')
    return ee.Image.cat([
        distancia_m(monte.Not(), ESCALA_MUESTRA, TOPE_DIST_M).rename('dist_sin_monte_m'),
        distancia_m(previa, ESCALA_MUESTRA, TOPE_DIST_M).rename('dist_desmonte_previo_m'),
        caminos.distance(TOPE_CAMINOS_M, 50).unmask(TOPE_CAMINOS_M).rename('dist_caminos_m'),
        ee.Terrain.slope(ee.Image(NASADEM).select('elevation')).rename('pendiente_grados'),
        ee.Image.constant(0).paint(wdpa, 1).rename('area_protegida'),
        pob.divide(ee.Image.pixelArea().divide(1e6)).unmask(0).rename('poblacion_densidad'),
        tclim.sum().divide(30).multiply(0.1).rename('deficit_hidrico_mm'),
        _suelo_0_30(ee, 'clay', 0.1).rename('arcilla_pct'),
        _suelo_0_30(ee, 'phh2o', 0.1).rename('ph'),
        zona_imagen(),
    ]).updateMask(monte)


def muestras(corte, fin, n, semilla):
    """Puntos al azar en el monte de `corte`, con predictores al corte y etiqueta 'se desmontó en (corte, fin]'."""
    ee = iniciar_ee()
    img = predictores(ee, corte)
    if fin is not None:
        _, ly = _hansen(ee)
        img = img.addBands(ly.gt(corte - 2000).And(ly.lte(fin - 2000)).rename('desmonte'))
    print(f'Muestreando monte {corte} (n={n})')
    df = muestras_por_tandas(img, ee.Geometry.Rectangle(BBOX_PROVINCIA), n, ESCALA_MUESTRA, semilla)
    df = df.dropna(subset=['zona'])
    df['zona'] = df['zona'].astype(int)
    return df


def serie_anual():
    """Hectáreas desmontadas por año (2001-2024) en cada zona, sobre el monte del 2000."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zonas_fc
    tc, ly = _hansen(ee)
    img = ee.Image.pixelArea().divide(1e4).addBands(ly).updateMask(tc.gte(UMBRAL_MONTE).And(ly.gte(1)))
    salida = {}
    fc = zonas_fc()
    for z in ZONAS:
        geom = fc.filter(ee.Filter.eq('zona', z)).geometry()
        r = con_reintentos(lambda: img.reduceRegion(
            reducer=ee.Reducer.sum().group(groupField=1, groupName='anio'), geometry=geom, scale=30,
            maxPixels=1e10, tileScale=16).getInfo())
        por_anio = {int(g['anio']): g['sum'] for g in r['groups']}
        salida[z] = [round(por_anio.get(a - 2000, 0.0), 1) for a in ANIOS]
        print(f'  serie {z}: {sum(salida[z]):.0f} ha')
    return salida


def monte_pct(anio, umbral=UMBRAL_MONTE):
    """% de la superficie de cada zona con monte al final de `anio`."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zonas_fc
    area = ee.Image.pixelArea()
    img = ee.Image.cat(area.updateMask(monte_en(ee, anio, umbral)).rename('monte'), area.rename('total'))
    r = con_reintentos(lambda: img.reduceRegions(collection=zonas_fc(), reducer=ee.Reducer.sum(), scale=30,
                                                 tileScale=16).getInfo())
    return {f['properties']['zona']: round(100 * f['properties']['monte'] / f['properties']['total'], 2)
            for f in r['features']}


def perdida_ha(desde, hasta, umbral=UMBRAL_MONTE):
    """Hectáreas desmontadas entre `desde` y `hasta` (inclusive) en cada zona."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zonas_fc
    tc, ly = _hansen(ee)
    m = tc.gte(umbral).And(ly.gte(desde - 2000)).And(ly.lte(hasta - 2000))
    img = ee.Image.pixelArea().divide(1e4).updateMask(m)
    r = con_reintentos(lambda: img.reduceRegions(collection=zonas_fc(), reducer=ee.Reducer.sum(), scale=30,
                                                 tileScale=16).getInfo())
    return {f['properties']['zona']: round(f['properties'].get('sum', 0.0), 1) for f in r['features']}


def desmonte_reciente_pct(desde=2016, hasta=2024):
    """% del monte que había al final de `desde - 1` que se desmontó entre `desde` y `hasta`, por zona."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zonas_fc
    tc, ly = _hansen(ee)
    area = ee.Image.pixelArea()
    perdida = tc.gte(UMBRAL_MONTE).And(ly.gte(desde - 2000)).And(ly.lte(hasta - 2000))
    img = ee.Image.cat(area.updateMask(monte_en(ee, desde - 1)).rename('monte'), area.updateMask(perdida).rename('perdida'))
    r = con_reintentos(lambda: img.reduceRegions(collection=zonas_fc(), reducer=ee.Reducer.sum(), scale=30,
                                                 tileScale=16).getInfo())
    return {f['properties']['zona']: (round(100 * f['properties'].get('perdida', 0) / f['properties']['monte'], 2)
                                      if f['properties'].get('monte') else None) for f in r['features']}


# ------------------------------------------------------------------ armado y corrida

def armar_json(serie, monte_2024, evaluacion, elegido, justificacion, riesgos, n_muestras, proyeccion=None):
    """JSON del contrato §8."""
    metodos = {k: v for k, v in evaluacion.items() if k in NOMBRES}
    if proyeccion:
        metodos['temporal'] = {'metodo': proyeccion['metodo'], 'error_ha_pct': proyeccion['error_ha_pct']}
    zonas = {}
    for z in ZONAS:
        zonas[z] = {
            'monte_actual_pct': monte_2024[z],
            'desmonte_ha_por_anio': {'desde': ANIOS[0], 'valores': serie[z]},
            'riesgo_medio_0_1': riesgos[z]['riesgo'], 'riesgo_n': riesgos[z]['n'],
            'proyeccion_ha': ({'anios': proyeccion['anios'], 'valores': proyeccion['valores'][z]}
                              if proyeccion else None),
            'confianza': confianza_riesgo(riesgos[z]['n']),
            'confianza_serie': 'alta',
            'confianza_proyeccion': 'baja' if proyeccion else None,
        }
    meta = meta_base(
        fuente=(f'Hansen Global Forest Change ({HANSEN}); predictores: GRIP4 ({GRIP4}), WDPA ({WDPA}), '
                f'WorldPop ({WORLDPOP}), NASADEM ({NASADEM}), TerraClimate ({TERRACLIMATE}), SoilGrids 2.0'),
        metodo=('Clasificación por píxel con validación en el tiempo. Se comparan regresión logística, random forest '
                'y gradient boosting; se elige el de mayor AUC en la prueba. Muestra al azar en el monte, sin '
                'balancear clases, para que las probabilidades queden calibradas.'),
        script='ia_desmonte/desmonte.py',
        notas=(f'Monte = cobertura arbórea del 2000 >= {UMBRAL_MONTE} % sin pérdida registrada. Hansen no registra el '
               'monte que vuelve a crecer. Distancias calculadas a 100 m y acotadas (25 km; caminos 50 km). GRIP4 es '
               'una red de caminos de 2018 y se usa igual en todos los cortes. WorldPop llega a 2020: para cortes '
               'posteriores se usa 2020. deficit_hidrico_mm es positivo (falta de agua, TerraClimate 1991-2020).'),
        historia=f'Hansen Global Forest Change v1.12 (2001-2024, Landsat 30 m)',
        predictores=PREDICTORES,
        validacion=('entrena con monte y predictores al 2008 y desmonte 2009-2015; prueba con monte y predictores '
                    'al 2015 y desmonte 2016-2024'),
        horizonte_riesgo=('probabilidad de que un píxel de monte se desmonte en los próximos ~9 años si sigue el '
                          'patrón 2016-2024'),
        umbral_monte_pct=UMBRAL_MONTE, muestras=n_muestras)
    return {'meta': meta,
            'evaluacion': {'metodos': metodos, 'metodo_elegido': elegido, 'justificacion_metodo': justificacion,
                           'tasa_base': evaluacion['tasa_base'],
                           'datos_de_prueba': f'{n_muestras["prueba"]} puntos de monte 2015, desmonte 2016-2024'},
            'zonas': zonas}


def _leer_o_muestrear(nombre, corte, fin, semilla):
    ruta = SALIDAS / f'desmonte_{nombre}.csv'
    if ruta.exists():
        return pd.read_csv(ruta)
    df = muestras(corte, fin, N_MUESTRA, semilla)
    SALIDAS.mkdir(parents=True, exist_ok=True)
    df.to_csv(ruta, index=False)
    return df


def _sensibilidad():
    filas = []
    for u in (10, 25, 30):
        m = monte_pct(2024, u)
        p = perdida_ha(2016, 2024, u)
        filas += [[u, z, m[z], p[z]] for z in ZONAS]
    with open(SALIDAS / 'sensibilidad_umbral_monte.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['umbral_cobertura_pct', 'zona', 'monte_2024_pct', 'perdida_2016_2024_ha'])
        w.writerows(filas)


def main():
    train = _leer_o_muestrear('entrenamiento', 2008, 2015, SEMILLA)
    test = _leer_o_muestrear('prueba', 2015, 2024, SEMILLA + 1)
    actual = _leer_o_muestrear('riesgo', 2024, None, SEMILLA + 2)
    evaluacion = evaluar(train, test)
    elegido, justificacion = elegir(evaluacion)
    print('Evaluación:', evaluacion)
    final = entrenar(elegido, test)
    with open(SALIDAS / 'desmonte_modelo.pkl', 'wb') as f:
        pickle.dump(final, f)
    riesgos = riesgo_por_zona(final, actual)
    ruta_serie = SALIDAS / 'desmonte_serie_anual.csv'
    if ruta_serie.exists():
        s = pd.read_csv(ruta_serie)
        serie = {z: s[z].tolist() for z in ZONAS}
    else:
        serie = serie_anual()
        pd.DataFrame({'anio': ANIOS, **serie}).to_csv(ruta_serie, index=False)
    monte = monte_pct(2024)
    from ia_desmonte.proyeccion import proyectar_zonas
    proyeccion = proyectar_zonas(serie)
    n = {'entrenamiento': len(train), 'prueba': len(test), 'riesgo': len(actual)}
    escribir_json(DATA / 'desmonte_zonas.json',
                  armar_json(serie, monte, evaluacion, elegido, justificacion, riesgos, n, proyeccion))
    if not (SALIDAS / 'sensibilidad_umbral_monte.csv').exists():
        _sensibilidad()
    print('Listo: data/desmonte_zonas.json')


if __name__ == '__main__':
    main()
