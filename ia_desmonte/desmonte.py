"""Historia de desmontes y modelo predictivo por zona (data/desmonte_zonas.json, contrato §8).

- Historia: Hansen Global Forest Change (Landsat, 30 m), pérdida anual 2001-2025 sobre el monte del 2000.
- Modelo: validación en el tiempo. Entrena con el monte y los predictores al 2008 y el desmonte 2009-2015;
  se prueba con el monte y los predictores al 2015 y el desmonte 2016-2025. Compara regresión logística,
  random forest y gradient boosting, y elige el de mayor AUC en la prueba.
- Riesgo por zona: el modelo elegido se reentrena con 2015 -> 2016-2025 y se aplica al monte de 2025.

Uso: EE_PROJECT=<id> python -X utf8 -m ia_desmonte.desmonte
"""
import csv
import pickle

import numpy as np
import pandas as pd

from ia_desmonte.comun import (BBOX_PROVINCIA, DATA, HANSEN, SALIDAS, SEMILLA, ULTIMO_ANIO, UMBRAL_MONTE, UTM_20S, ZONAS,
                               con_reintentos, distancia_m, escribir_json, iniciar_ee, meta_base, valores_en_puntos)

PREDICTORES = ['dist_sin_monte_m', 'dist_desmonte_previo_m', 'dist_desmonte_reciente_m', 'monte_1km_pct',
               'dist_caminos_m', 'pendiente_grados', 'area_protegida', 'poblacion_densidad', 'deficit_hidrico_mm',
               'arcilla_pct', 'ph', 'zona']
NUMERICOS = [p for p in PREDICTORES if p != 'zona']
NOMBRES = {'regresion_logistica': 'regresión logística', 'random_forest': 'random forest',
           'gradient_boosting': 'gradient boosting'}
N_MUESTRA = 10000          # puntos de monte por muestra
ESCALA_MUESTRA = 30        # los valores se leen a 30 m: las etiquetas de Hansen quedan exactas
ESCALA_DIST = 250          # las distancias y la fragmentación se calculan a 250 m
TOPE_DIST_M = 25000
TOPE_CAMINOS_M = 50000
ANIOS = list(range(2001, ULTIMO_ANIO + 1))
PRUEBA = f'2016-{ULTIMO_ANIO}'
GRIP4 = 'projects/sat-io/open-datasets/GRIP4/Central-South-America'
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


def _validacion_cruzada(nombre, df):
    """AUC y umbral de F1 con validación cruzada de 5 partes sobre el entrenamiento (nunca sobre la prueba)."""
    from sklearn.metrics import precision_recall_curve, roc_auc_score
    from sklearn.model_selection import StratifiedKFold, cross_val_predict
    cv = StratifiedKFold(5, shuffle=True, random_state=SEMILLA)
    p = cross_val_predict(_modelo(nombre), df[PREDICTORES], df['desmonte'], cv=cv, method='predict_proba')[:, 1]
    prec, rec, umb = precision_recall_curve(df['desmonte'], p)
    f1 = 2 * prec * rec / np.maximum(prec + rec, 1e-12)
    return float(roc_auc_score(df['desmonte'], p)), float(umb[int(np.argmax(f1[:-1]))])


def evaluar(train, test):
    """Entrena los 3 modelos con `train` y los mide con `test` (y con validación cruzada dentro de `train`)."""
    from sklearn.metrics import (accuracy_score, average_precision_score, cohen_kappa_score, f1_score,
                                 roc_auc_score)
    salida = {}
    for nombre in NOMBRES:
        auc_cv, umbral = _validacion_cruzada(nombre, train)
        p = entrenar(nombre, train).predict_proba(test[PREDICTORES])[:, 1]
        pred = (p >= umbral).astype(int)
        y = test['desmonte']
        salida[nombre] = {'auc': round(float(roc_auc_score(y, p)), 3), 'auc_cv': round(auc_cv, 3),
                          'f1': round(float(f1_score(y, pred)), 3),
                          'accuracy': round(float(accuracy_score(y, pred)), 3),
                          'kappa': round(float(cohen_kappa_score(y, pred)), 3),
                          'pr_auc': round(float(average_precision_score(y, p)), 3), 'umbral': round(umbral, 3)}
    salida['tasa_base'] = round(float(test['desmonte'].mean()), 4)
    return salida


def _coma(x):
    return f'{x:.2f}'.replace('.', ',')


def elegir(metodos):
    """Elige el método de mayor AUC en la validación cruzada del entrenamiento (sin mirar la prueba).

    La justificación se escribe con los mismos números: la validación cruzada que decidió y la prueba que mide.
    """
    c = {k: v for k, v in metodos.items() if k in NOMBRES}
    nombre = max(c, key=lambda k: c[k]['auc_cv'])
    otros = sorted((k for k in c if k != nombre), key=lambda k: -c[k]['auc_cv'])
    texto = (f'Se eligió {NOMBRES[nombre]} porque tiene el AUC más alto en la validación cruzada del entrenamiento '
             f'({_coma(c[nombre]["auc_cv"])}, contra '
             + ' y '.join(f'{_coma(c[k]["auc_cv"])} de {NOMBRES[k]}' for k in otros)
             + f'). En la prueba {PRUEBA}, que no se usó para elegir, mide AUC {_coma(c[nombre]["auc"])} ('
             + ', '.join(f'{NOMBRES[k]} {_coma(c[k]["auc"])}' for k in otros) + ').')
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


REJILLA = 0.0025  # grados (unos 250 m): tamaño de celda de las capas caras que se bajan como grilla
CAPAS_REJILLA = ['dist_sin_monte_m', 'dist_desmonte_previo_m', 'dist_desmonte_reciente_m', 'monte_1km_pct',
                 'dist_caminos_m']


def capas_caras(ee, corte):
    """Distancias y fragmentación al año `corte`: caras de calcular, se bajan una vez como grilla de ~250 m."""
    tc, ly = _hansen(ee)
    t = corte - 2000
    monte = monte_en(ee, corte)
    previa = ly.gte(1).And(ly.lte(t))
    reciente = ly.gte(max(1, t - 2)).And(ly.lte(t))  # desmonte de los 3 años previos al corte
    proj = ee.Projection(UTM_20S).atScale(ESCALA_DIST)
    frag = (monte.unmask(0).reduceResolution(reducer=ee.Reducer.mean(), maxPixels=1024).reproject(proj)
            .focalMean(1000, 'circle', 'meters').multiply(100))
    region = ee.Geometry.Rectangle(BBOX_PROVINCIA).buffer(60000)
    caminos = ee.FeatureCollection(GRIP4).filterBounds(region)
    return ee.Image.cat([
        distancia_m(monte.Not(), ESCALA_DIST, TOPE_DIST_M).rename('dist_sin_monte_m'),
        distancia_m(previa, ESCALA_DIST, TOPE_DIST_M).rename('dist_desmonte_previo_m'),
        distancia_m(reciente, ESCALA_DIST, TOPE_DIST_M).rename('dist_desmonte_reciente_m'),
        frag.rename('monte_1km_pct'),
        caminos.distance(TOPE_CAMINOS_M, 50).unmask(TOPE_CAMINOS_M).rename('dist_caminos_m'),
    ]).toFloat()


def capas_baratas(ee, corte):
    """Predictores que se leen rápido en cada punto, a 30 m (enmascarados fuera del monte de `corte`)."""
    region = ee.Geometry.Rectangle(BBOX_PROVINCIA).buffer(60000)
    wdpa = ee.FeatureCollection(WDPA).filterBounds(region)
    pob = (ee.ImageCollection(WORLDPOP).filter(ee.Filter.eq('country', 'ARG'))
           .filter(ee.Filter.eq('year', min(corte, 2020))).mosaic())
    tclim = ee.ImageCollection(TERRACLIMATE).filterDate('1991-01-01', '2021-01-01').select('def')
    return ee.Image.cat([
        ee.Terrain.slope(ee.Image(NASADEM).select('elevation')).rename('pendiente_grados'),
        ee.Image.constant(0).paint(wdpa, 1).rename('area_protegida'),
        pob.divide(ee.Image.pixelArea().divide(1e6)).unmask(0).rename('poblacion_densidad'),
        tclim.sum().divide(30).multiply(0.1).rename('deficit_hidrico_mm'),
        _suelo_0_30(ee, 'clay', 0.1).rename('arcilla_pct'),
        _suelo_0_30(ee, 'phh2o', 0.1).rename('ph'),
    ]).updateMask(monte_en(ee, corte))


def indice_rejilla(lon, lat):
    """Fila y columna de la celda de la grilla que contiene cada punto."""
    oeste, _, _, norte = BBOX_PROVINCIA
    return (np.floor((norte - np.asarray(lat)) / REJILLA).astype(int),
            np.floor((np.asarray(lon) - oeste) / REJILLA).astype(int))


def leer_rejilla(rejilla, lon, lat):
    """Valor de cada capa de la grilla en cada punto; NaN si el punto cae fuera de la grilla (se descarta después)."""
    f, c = indice_rejilla(lon, lat)
    salida = {}
    for k, v in rejilla.items():
        dentro = (f >= 0) & (f < v.shape[0]) & (c >= 0) & (c < v.shape[1])
        valores = np.full(len(f), np.nan)
        valores[dentro] = v[f[dentro], c[dentro]]
        salida[k] = valores
    return salida


def bajar_rejilla(corte, bloque=512):
    """Baja las capas caras de `corte` como matrices (una vez; se guardan en salidas/ para no repetir)."""
    import concurrent.futures
    ruta = SALIDAS / f'rejilla_{corte}.npz'
    if ruta.exists():
        return dict(np.load(ruta))
    ee = iniciar_ee()
    img = capas_caras(ee, corte)
    oeste, sur, este, norte = BBOX_PROVINCIA
    ancho, alto = int(round((este - oeste) / REJILLA)), int(round((norte - sur) / REJILLA))
    salida = {k: np.full((alto, ancho), np.nan, dtype='float32') for k in CAPAS_REJILLA}

    def pedir(f0, c0):
        h, w = min(bloque, alto - f0), min(bloque, ancho - c0)
        pedido = {'expression': img, 'fileFormat': 'NUMPY_NDARRAY',
                  'grid': {'dimensions': {'width': w, 'height': h}, 'crsCode': 'EPSG:4326',
                           'affineTransform': {'scaleX': REJILLA, 'shearX': 0, 'translateX': oeste + c0 * REJILLA,
                                               'shearY': 0, 'scaleY': -REJILLA, 'translateY': norte - f0 * REJILLA}}}
        datos = con_reintentos(lambda: ee.data.computePixels(pedido))
        return f0, c0, h, w, datos

    bloques = [(f0, c0) for f0 in range(0, alto, bloque) for c0 in range(0, ancho, bloque)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
        for i, (f0, c0, h, w, datos) in enumerate(ex.map(lambda b: pedir(*b), bloques), start=1):
            for k in CAPAS_REJILLA:
                salida[k][f0:f0 + h, c0:c0 + w] = datos[k]
            print(f'  grilla {corte}: bloque {i}/{len(bloques)}')
    SALIDAS.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(ruta, **salida)
    return salida


def muestras(corte, fin, n, semilla):
    """Puntos al azar en el monte de `corte`, con predictores al corte y etiqueta 'se desmontó en (corte, fin]'."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import puntos_al_azar
    rejilla = bajar_rejilla(corte)
    img = capas_baratas(ee, corte)
    if fin is not None:
        _, ly = _hansen(ee)
        img = img.addBands(ly.gt(corte - 2000).And(ly.lte(fin - 2000)).rename('desmonte'))
    # Puntos uniformes en la provincia; Earth Engine devuelve solo los que caen en monte (imagen enmascarada).
    candidatos = puntos_al_azar(int(n * 2.8), semilla)
    print(f'Muestreando monte {corte}: {len(candidatos)} puntos candidatos para ~{n} de monte')
    crudo = SALIDAS / f'desmonte_valores_{corte}_{fin}.csv'  # lo que devolvió Earth Engine (para no repetirlo)
    if crudo.exists():
        df = pd.read_csv(crudo, index_col=0)
    else:
        df = valores_en_puntos(img, candidatos, ESCALA_MUESTRA)
        df.to_csv(crudo)
    for k, v in leer_rejilla(rejilla, df['lon'].to_numpy(), df['lat'].to_numpy()).items():
        df[k] = v
    df = df.dropna(subset=PREDICTORES)
    return df.head(n).reset_index(drop=True)


def serie_anual():
    """Hectáreas desmontadas por año (2001-2025) en cada zona, sobre el monte del 2000."""
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


def monte_pct(anio, umbral=UMBRAL_MONTE, escala=30):
    """% de la superficie de cada zona con monte al final de `anio`."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zonas_fc
    area = ee.Image.pixelArea()
    img = ee.Image.cat(area.updateMask(monte_en(ee, anio, umbral)).rename('monte'), area.rename('total'))
    r = con_reintentos(lambda: img.reduceRegions(collection=zonas_fc(), reducer=ee.Reducer.sum(), scale=escala,
                                                 tileScale=16).getInfo())
    return {f['properties']['zona']: round(100 * f['properties']['monte'] / f['properties']['total'], 2)
            for f in r['features']}


def perdida_ha(desde, hasta, umbral=UMBRAL_MONTE, escala=30):
    """Hectáreas desmontadas entre `desde` y `hasta` (inclusive) en cada zona."""
    ee = iniciar_ee()
    from ia_desmonte.zonas import zonas_fc
    tc, ly = _hansen(ee)
    m = tc.gte(umbral).And(ly.gte(desde - 2000)).And(ly.lte(hasta - 2000))
    img = ee.Image.pixelArea().divide(1e4).updateMask(m)
    r = con_reintentos(lambda: img.reduceRegions(collection=zonas_fc(), reducer=ee.Reducer.sum(), scale=escala,
                                                 tileScale=16).getInfo())
    return {f['properties']['zona']: round(f['properties'].get('sum', 0.0), 1) for f in r['features']}


def desmonte_reciente_pct(desde=2016, hasta=ULTIMO_ANIO):
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

def armar_json(serie, monte_actual, evaluacion, elegido, justificacion, riesgos, n_muestras, proyeccion=None):
    """JSON del contrato §8."""
    metodos = {k: v for k, v in evaluacion.items() if k in NOMBRES}
    if proyeccion:
        metodos['temporal'] = {'metodo': proyeccion['metodo'], 'error_ha_pct': proyeccion['error_ha_pct']}
    zonas = {}
    for z in ZONAS:
        zonas[z] = {
            'monte_actual_pct': monte_actual[z],
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
               'monte que vuelve a crecer. Valores leídos a 30 m en puntos al azar uniformes en la provincia; distancias y fragmentación calculadas a 250 m y acotadas (25 km; caminos 50 km). GRIP4 es '
               'una red de caminos de 2018 y se usa igual en todos los cortes. WorldPop llega a 2020: para cortes '
               'posteriores se usa 2020. deficit_hidrico_mm es positivo (falta de agua, TerraClimate 1991-2020).'),
        historia=f'Hansen Global Forest Change v1.13 (2001-{ULTIMO_ANIO}, Landsat 30 m)',
        predictores=PREDICTORES,
        validacion=('entrena con monte y predictores al 2008 y desmonte 2009-2015; prueba con monte y predictores '
                    f'al 2015 y desmonte {PRUEBA}'),
        horizonte_riesgo=('probabilidad de que un píxel de monte se desmonte en los próximos ~10 años si sigue el '
                          f'patrón {PRUEBA}'),
        umbral_monte_pct=UMBRAL_MONTE, muestras=n_muestras)
    return {'meta': meta,
            'evaluacion': {'metodos': metodos, 'metodo_elegido': elegido, 'justificacion_metodo': justificacion,
                           'tasa_base': evaluacion['tasa_base'],
                           'datos_de_prueba': f'{n_muestras["prueba"]} puntos de monte 2015, desmonte {PRUEBA}'},
            'zonas': zonas}


CORTES = {'entrenamiento': (2008, 2015, SEMILLA), 'prueba': (2015, ULTIMO_ANIO, SEMILLA + 1),
          'riesgo': (ULTIMO_ANIO, None, SEMILLA + 2)}


def _muestras():
    """Las 3 muestras: de los CSV de salidas/ si ya están; si no, se piden a Earth Engine y se guardan."""
    SALIDAS.mkdir(parents=True, exist_ok=True)
    for k, (corte, fin, semilla) in CORTES.items():
        ruta = SALIDAS / f'desmonte_{k}.csv'
        if not ruta.exists():
            muestras(corte, fin, N_MUESTRA, semilla).to_csv(ruta, index=False)
    return [pd.read_csv(SALIDAS / f'desmonte_{k}.csv') for k in CORTES]


def _sensibilidad():
    filas = []
    for u in (10, 25, 30):
        m = monte_pct(ULTIMO_ANIO, u, escala=100)  # aproximado a 100 m: solo muestra cuánto cambia con el umbral
        p = perdida_ha(2016, ULTIMO_ANIO, u, escala=100)
        filas += [[u, z, m[z], p[z]] for z in ZONAS]
    with open(SALIDAS / 'sensibilidad_umbral_monte.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['umbral_cobertura_pct', 'zona', f'monte_{ULTIMO_ANIO}_pct', f'perdida_2016_{ULTIMO_ANIO}_ha'])
        w.writerows(filas)


def main():
    train, test, actual = _muestras()
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
    monte = monte_pct(ULTIMO_ANIO)
    from ia_desmonte.proyeccion import proyectar_zonas
    proyeccion = proyectar_zonas(serie)
    n = {'entrenamiento': len(train), 'prueba': len(test), 'riesgo': len(actual)}
    escribir_json(DATA / 'desmonte_zonas.json',
                  armar_json(serie, monte, evaluacion, elegido, justificacion, riesgos, n, proyeccion))
    if not (SALIDAS / 'sensibilidad_umbral_monte.csv').exists():
        _sensibilidad()
    print('Listo: data/desmonte_zonas.json')


if __name__ == '__main__':
    import sys
    if len(sys.argv) == 3 and sys.argv[1] == 'muestra':  # una sola muestra (para correr las 3 en paralelo)
        corte, fin, semilla = CORTES[sys.argv[2]]
        SALIDAS.mkdir(parents=True, exist_ok=True)
        muestras(corte, fin, N_MUESTRA, semilla).to_csv(SALIDAS / f'desmonte_{sys.argv[2]}.csv', index=False)
    else:
        main()
