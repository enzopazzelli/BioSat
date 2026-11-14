/*
 * BioSat · Zonificación con AIZAL y modelo predictivo de desmontes (Google Earth Engine)
 * --------------------------------------------------------------------------------------
 * Propuesta de la profesora (D-25): zonificar la provincia con variables de clima y suelo,
 * y predecir el desmonte por zona. Es un PUNTO DE PARTIDA para Santi: todos los parámetros
 * de arriba se pueden cambiar.
 *
 * Cómo usarlo: pegar en https://code.earthengine.google.com y tocar "Run".
 *   Los resultados grandes van a la pestaña "Tasks" (exportaciones a Google Drive, carpeta BioSat).
 *
 * Parte A · Zonificación
 *   k-means sobre clima y suelo estandarizados.
 *   - Si AIZAL_ASSET tiene la ruta del stack AIZAL V4, usa sus bandas (b03-b18).
 *   - Si no, arma variables equivalentes con TerraClimate (normal 1991-2020) y SoilGrids.
 *   Compara los grupos con las 5 zonas de BioSat (celdas de NASA POWER).
 *
 * Parte B · Modelo predictivo de desmontes
 *   - Historia: Hansen Global Forest Change (2001-2023, hecho con Landsat). Si aparece la base del LART
 *     (desde 1976) o se usa MapBiomas Chaco, se reemplazan monteAl() y desmonteEntre().
 *   - Validación temporal: entrena con predictores al 2008 y desmonte 2009-2015;
 *     prueba con predictores al 2015 y desmonte 2016-2023.
 *   - En Earth Engine: random forest y un árbol simple de referencia.
 *   - Exporta las tablas para la regresión logística y el modelo temporal (LSTM o Transformer) en Python.
 *   - Mapa de riesgo y riesgo medio por zona → data/desmonte_zonas.json (contratos §8).
 */

// ------------------------------------------------------------------ Parámetros
var AIZAL_ASSET = null;          // ej.: 'projects/<tu-proyecto>/assets/AIZAL_V4'
var K_ZONAS = 5;                 // propuesta de la profesora; revisar con silueta o codo
var ESCALA_ZONAS = 500;          // m, como la grilla de AIZAL
var CORTE_ENTRENAMIENTO = 2008;  // predictores a este año; etiqueta: desmonte en los años siguientes
var CORTE_PRUEBA = 2015;
var ULTIMO_ANIO = 2023;
var PUNTOS_POR_CLASE = 3000;

// ------------------------------------------------------------------ Zonas BioSat y región
var ZONAS = [
  {id: 'zona_1_riego_salitre', lat: -27.73, lon: -64.17},
  {id: 'zona_2_secano_este', lat: -27.65, lon: -62.42},
  {id: 'zona_3_monte_semiarido', lat: -26.58, lon: -62.85},
  {id: 'zona_4_bajos_submeridionales', lat: -28.46, lon: -62.83},
  {id: 'zona_5_sur_serrano', lat: -29.50, lon: -63.69}
];
function celda(z) {
  return ee.Geometry.Rectangle([z.lon - 0.3125, z.lat - 0.25, z.lon + 0.3125, z.lat + 0.25]);
}
var celdasBioSat = ee.FeatureCollection(ZONAS.map(function (z) { return ee.Feature(celda(z), {zona_id: z.id}); }));
var provincia = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM0_NAME', 'Argentina'))
  .filter(ee.Filter.stringContains('ADM1_NAME', 'Estero'));
var region = provincia.geometry();

// ================================================================== PARTE A · ZONIFICACIÓN
// Clima: B03 ET, B04 lluvia, B05 PDSI, B06 Tmín, B07 Tmáx, B08 albedo.
// Suelo: B09 CIC, B10 fragmentos, B11 nitrógeno, B12 arcilla, B13-B15 carbono, B16 pH, B17a arena, B17b limo, B18 densidad.
var BANDAS_AIZAL = ['b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11', 'b12',
                    'b13', 'b14', 'b15', 'b16', 'b17a', 'b17b', 'b18'];

function variablesPublicas() {
  // Las escalas no importan para el k-means porque después se estandariza.
  var tc = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE').filterDate('1991-01-01', '2021-01-01');
  var clima = ee.Image.cat([
    tc.select('aet').mean().rename('et'),
    tc.select('pr').mean().rename('lluvia'),
    tc.select('pdsi').mean().rename('pdsi'),
    tc.select('tmmn').mean().rename('tmin'),
    tc.select('tmmx').mean().rename('tmax'),
    tc.select('def').mean().rename('deficit_hidrico')
  ]);
  var suelo = ee.Image.cat(['cec', 'cfvo', 'nitrogen', 'clay', 'soc', 'phh2o', 'sand', 'silt', 'bdod'].map(function (p) {
    return ee.Image('projects/soilgrids-isric/' + p + '_mean').select(p + '_0-5cm_mean').rename(p);
  }));
  return clima.addBands(suelo);
}

var variables = (AIZAL_ASSET ? ee.Image(AIZAL_ASSET).select(BANDAS_AIZAL) : variablesPublicas()).clip(region);
var NOMBRES = AIZAL_ASSET ? BANDAS_AIZAL
  : ['et', 'lluvia', 'pdsi', 'tmin', 'tmax', 'deficit_hidrico', 'cec', 'cfvo', 'nitrogen', 'clay', 'soc', 'phh2o', 'sand', 'silt', 'bdod'];

// Estandarizar: (valor − media) / desvío, con la media y el desvío de la provincia
var stats = variables.reduceRegion({
  reducer: ee.Reducer.mean().combine(ee.Reducer.stdDev(), null, true),
  geometry: region, scale: 2000, maxPixels: 1e10, tileScale: 4
});
var medias = ee.Image.constant(NOMBRES.map(function (n) { return stats.get(n + '_mean'); })).rename(NOMBRES);
var desvios = ee.Image.constant(NOMBRES.map(function (n) { return stats.get(n + '_stdDev'); })).rename(NOMBRES);
var estandar = variables.subtract(medias).divide(desvios);

var muestraZonas = estandar.sample({region: region, scale: ESCALA_ZONAS, numPixels: 8000, seed: 11, geometries: false});
var zonasAIZAL = estandar.cluster(ee.Clusterer.wekaKMeans({nClusters: K_ZONAS, seed: 11}).train(muestraZonas))
  .rename('zona_aizal');

// Cómo caen los grupos dentro de cada celda de BioSat
var comparacion = ee.FeatureCollection(ZONAS.map(function (z) {
  var h = zonasAIZAL.reduceRegion({reducer: ee.Reducer.frequencyHistogram(), geometry: celda(z),
                                   scale: ESCALA_ZONAS, maxPixels: 1e9}).get('zona_aizal');
  return ee.Feature(null, {zona_biosat: z.id, pixeles_por_grupo: h});
}));
print('Parte A · grupos AIZAL dentro de cada zona BioSat', comparacion);

// Perfil de cada grupo (valores medios sin estandarizar), para ponerles nombre
var perfiles = variables.addBands(zonasAIZAL).reduceRegion({
  reducer: ee.Reducer.mean().repeat(NOMBRES.length).group({groupField: NOMBRES.length, groupName: 'zona_aizal'}),
  geometry: region, scale: 2000, maxPixels: 1e10, tileScale: 4
});
print('Parte A · perfil medio de cada grupo (orden de variables: ' + NOMBRES.join(', ') + ')', perfiles);

Export.image.toDrive({image: zonasAIZAL.toByte(), description: 'biosat_zonas_aizal', folder: 'BioSat',
                      region: region, scale: ESCALA_ZONAS, maxPixels: 1e10});
Export.table.toDrive({collection: comparacion, description: 'biosat_comparacion_zonas', folder: 'BioSat', fileFormat: 'CSV'});

// ================================================================== PARTE B · DESMONTES
var hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11');
var monte2000 = hansen.select('treecover2000').gte(30);
var anioPerdida = hansen.select('lossyear').updateMask(hansen.select('loss')).add(2000).rename('anio');

// Para usar el LART o MapBiomas Chaco, reemplazar estas dos funciones.
function monteAl(anio) { return monte2000.and(anioPerdida.unmask(9999).gt(anio)); }
function desmonteEntre(desde, hasta) {
  var a = anioPerdida.unmask(0);
  return a.gte(desde).and(a.lte(hasta));
}

function distanciaA(mascara, nombre) {
  // distancia en metros a la máscara (hasta 256 píxeles de la escala de cálculo)
  return mascara.selfMask().fastDistanceTransform(256).sqrt()
    .multiply(ee.Image.pixelArea().sqrt()).unmask(256 * 100).rename(nombre);
}
var pendiente = ee.Terrain.slope(ee.Image('NASA/NASADEM_HGT/001').select('elevation')).rename('pendiente');
var protegidas = ee.Image(0).byte().paint(
  ee.FeatureCollection('WCMC/WDPA/current/polygons').filterBounds(region), 1).rename('area_protegida');

// Predictores al año de corte. Ojo: las distancias de AIZAL (B30, B31) son de 2023; para la validación
// temporal se recalculan al año de corte con el mismo mapa de desmontes (sin mirar el futuro).
function predictores(anio) {
  var pob = ee.ImageCollection('WorldPop/GP/100m/pop').filterBounds(region)
    .filter(ee.Filter.eq('year', Math.min(anio, 2020))).mosaic().unmask(0).rename('poblacion');
  var imagen = ee.Image.cat([
    distanciaA(monteAl(anio).not(), 'dist_sin_monte'),
    distanciaA(desmonteEntre(2001, anio), 'dist_desmonte_previo'),
    pendiente, protegidas, pob, variables, zonasAIZAL
  ]);
  return AIZAL_ASSET ? imagen.addBands(ee.Image(AIZAL_ASSET).select(['b36'], ['dist_caminos'])) : imagen;
}

function tabla(anioCorte, hasta, semilla) {
  return predictores(anioCorte)
    .addBands(desmonteEntre(anioCorte + 1, hasta).rename('desmonte'))
    .updateMask(monteAl(anioCorte))
    .stratifiedSample({numPoints: PUNTOS_POR_CLASE, classBand: 'desmonte', region: region,
                       scale: 100, seed: semilla, geometries: true, tileScale: 8});
}
var entrenamiento = tabla(CORTE_ENTRENAMIENTO, CORTE_PRUEBA, 1);
var prueba = tabla(CORTE_PRUEBA, ULTIMO_ANIO, 2);
var PROPS = predictores(CORTE_ENTRENAMIENTO).bandNames();

var rf = ee.Classifier.smileRandomForest({numberOfTrees: 150, seed: 7}).train(entrenamiento, 'desmonte', PROPS);
var arbol = ee.Classifier.smileCart({maxNodes: 32}).train(entrenamiento, 'desmonte', PROPS);
function evaluar(clasificador, nombre) {
  var m = prueba.classify(clasificador).errorMatrix('desmonte', 'classification');
  print('Parte B · ' + nombre + ' (entrena hasta ' + CORTE_PRUEBA + ', prueba ' + (CORTE_PRUEBA + 1) + '-' + ULTIMO_ANIO + ')',
        'exactitud', m.accuracy(), 'kappa', m.kappa(), 'F1 [sin desmonte, desmonte]', m.fscore());
}
evaluar(rf, 'Random forest');
evaluar(arbol, 'Árbol simple (referencia)');
print('Parte B · importancia de cada variable (random forest)', rf.explain().get('importance'));

// Mapa de riesgo: el modelo final se entrena con lo más reciente (corte 2015) y se aplica al estado 2023
var rfFinal = ee.Classifier.smileRandomForest({numberOfTrees: 150, seed: 7}).setOutputMode('PROBABILITY')
  .train(prueba, 'desmonte', PROPS);
var riesgo = predictores(ULTIMO_ANIO).updateMask(monteAl(ULTIMO_ANIO)).classify(rfFinal).rename('riesgo_desmonte');

var riesgoPorZona = celdasBioSat.map(function (f) {
  var r = riesgo.reduceRegion({reducer: ee.Reducer.mean(), geometry: f.geometry(), scale: 250, maxPixels: 1e10, tileScale: 4});
  return f.set('riesgo_medio', r.get('riesgo_desmonte'));
});
print('Parte B · riesgo medio de desmonte por zona BioSat (0 a 1)', riesgoPorZona);

// Serie anual de desmonte (ha) por zona: entrada del modelo temporal (LSTM o Transformer)
var areaHa = ee.Image.pixelArea().divide(1e4).rename('ha');
var serie = celdasBioSat.map(function (f) {
  var g = areaHa.addBands(anioPerdida).reduceRegion({
    reducer: ee.Reducer.sum().group({groupField: 1, groupName: 'anio'}),
    geometry: f.geometry(), scale: 30, maxPixels: 1e11, tileScale: 8});
  return f.set('desmonte_ha_por_anio', g.get('groups'));
});

Export.table.toDrive({collection: entrenamiento, description: 'biosat_desmonte_entrenamiento', folder: 'BioSat', fileFormat: 'CSV'});
Export.table.toDrive({collection: prueba, description: 'biosat_desmonte_prueba', folder: 'BioSat', fileFormat: 'CSV'});
Export.table.toDrive({collection: riesgoPorZona, description: 'biosat_riesgo_por_zona', folder: 'BioSat', fileFormat: 'CSV'});
Export.table.toDrive({collection: serie, description: 'biosat_serie_desmonte_por_zona', folder: 'BioSat', fileFormat: 'GeoJSON'});
Export.image.toDrive({image: riesgo.multiply(100).toByte(), description: 'biosat_riesgo_desmonte', folder: 'BioSat',
                      region: region, scale: 250, maxPixels: 1e10});

// ------------------------------------------------------------------ Mapa
Map.centerObject(region, 7);
Map.addLayer(zonasAIZAL.randomVisualizer(), {opacity: 0.7}, 'Zonas AIZAL (k = ' + K_ZONAS + ')');
Map.addLayer(anioPerdida.clip(region), {min: 2001, max: 2023, palette: ['#ffe08a', '#ff8c42', '#d7263d', '#7a0b2b']}, 'Desmonte por año (Hansen)', false);
Map.addLayer(riesgo.clip(region), {min: 0, max: 0.6, palette: ['#f7f4ea', '#f2b56b', '#c2410c', '#5c1d0b']}, 'Riesgo de desmonte', false);
Map.addLayer(ee.Image().byte().paint({featureCollection: celdasBioSat, color: 1, width: 2}), {palette: ['#ffffff']}, 'Zonas BioSat');
