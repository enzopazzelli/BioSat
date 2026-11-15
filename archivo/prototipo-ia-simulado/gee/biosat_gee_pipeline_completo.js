/*
 * ==============================================================================
 * BioSat · Script Maestro: Zonificación K-Means + Modelo Desmonte Random Forest
 * ==============================================================================
 * Autor: Santi (Frente 2 Suelo/Zonificación & Frente 3 IA Desmonte)
 * Proyecto: NASA Space Apps Challenge 2026 · BioSat
 * 
 * Este script integra:
 *   1. Parte A: Zonificación agroecológica K-Means (k=5) sobre clima y suelo estandarizados.
 *   2. Parte B: Modelo predictivo de desmonte Random Forest (150 árboles) con validación temporal.
 *   3. Cruce con las 5 zonas BioSat para alimentar la App web y los contratos de datos §7 y §8.
 *
 * Instrucciones:
 *   Pegar en https://code.earthengine.google.com y presionar "Run".
 *   Ir a la pestaña "Tasks" en la esquina derecha para ejecutar las exportaciones a Drive.
 */

// ------------------------------------------------------------------ 1. Parámetros Globales
var AIZAL_ASSET = null;          // ej.: 'projects/<tu-proyecto>/assets/AIZAL_V4' (dejar null para fuentes públicas)
var K_ZONAS = 5;                 // Cantidad de clusters K-Means
var ESCALA_M = 500;              // Escala de trabajo (m)
var CORTE_TRAIN = 2008;          // Año de corte para entrenamiento
var CORTE_TEST = 2015;           // Año de corte para validación out-of-time
var ULTIMO_ANIO = 2023;          // Último año disponible de Hansen GFC
var PUNTOS_POR_CLASE = 3000;     // Muestras estratificadas por clase

// ------------------------------------------------------------------ 2. Región y Zonas BioSat
var provincia = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM0_NAME', 'Argentina'))
  .filter(ee.Filter.stringContains('ADM1_NAME', 'Estero'));
var region = provincia.geometry();

var ZONAS = [
  {id: 'zona_1_riego_salitre', nombre: 'Zona 1: Riego Río Dulce / Salitre', lat: -27.73, lon: -64.17},
  {id: 'zona_2_secano_este', nombre: 'Zona 2: Secano Este / Quimilí', lat: -27.65, lon: -62.42},
  {id: 'zona_3_monte_semiarido', nombre: 'Zona 3: Monte Semiárido / Copo', lat: -26.58, lon: -62.85},
  {id: 'zona_4_bajos_submeridionales', nombre: 'Zona 4: Bajos Submeridionales', lat: -28.46, lon: -62.83},
  {id: 'zona_5_sur_serrano', nombre: 'Zona 5: Sur Serrano / Ojo de Agua', lat: -29.50, lon: -63.69}
];

function crearCelda(z) {
  return ee.Geometry.Rectangle([z.lon - 0.3125, z.lat - 0.25, z.lon + 0.3125, z.lat + 0.25]);
}
var celdasBioSat = ee.FeatureCollection(ZONAS.map(function (z) {
  return ee.Feature(crearCelda(z), {zona_id: z.id, nombre: z.nombre});
}));

// ================================================================== PARTE A · ZONIFICACIÓN K-MEANS
var BANDAS_AIZAL = ['b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11', 'b12',
                    'b13', 'b14', 'b15', 'b16', 'b17a', 'b17b', 'b18'];

function variablesPublicas() {
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
var NOMBRES_VARS = AIZAL_ASSET ? BANDAS_AIZAL
  : ['et', 'lluvia', 'pdsi', 'tmin', 'tmax', 'deficit_hidrico', 'cec', 'cfvo', 'nitrogen', 'clay', 'soc', 'phh2o', 'sand', 'silt', 'bdod'];

// Estandarización Z-score
var stats = variables.reduceRegion({
  reducer: ee.Reducer.mean().combine(ee.Reducer.stdDev(), null, true),
  geometry: region, scale: 2000, maxPixels: 1e10, tileScale: 4
});
var medias = ee.Image.constant(NOMBRES_VARS.map(function (n) { return stats.get(n + '_mean'); })).rename(NOMBRES_VARS);
var desvios = ee.Image.constant(NOMBRES_VARS.map(function (n) { return stats.get(n + '_stdDev'); })).rename(NOMBRES_VARS);
var variablesEstandar = variables.subtract(medias).divide(desvios);

// Clustering K-Means
var muestraZonificacion = variablesEstandar.sample({
  region: region, scale: ESCALA_M, numPixels: 8000, seed: 11, geometries: false, tileScale: 8
});
var clustererKMeans = ee.Clusterer.wekaKMeans({nClusters: K_ZONAS, seed: 11}).train(muestraZonificacion);
var zonasAIZAL = variablesEstandar.cluster(clustererKMeans).rename('zona_aizal');

// Comparación espacial con celdas BioSat
var comparacionZonificacion = ee.FeatureCollection(ZONAS.map(function (z) {
  var h = zonasAIZAL.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(), geometry: crearCelda(z),
    scale: ESCALA_M, maxPixels: 1e9, tileScale: 4
  }).get('zona_aizal');
  return ee.Feature(null, {zona_biosat: z.id, histograma_clusters: h});
}));

// Perfil biofísico de cada cluster
var perfilesClusters = ee.FeatureCollection(ee.List.sequence(0, K_ZONAS - 1).map(function(k) {
  var m = variables.updateMask(zonasAIZAL.eq(ee.Number(k))).reduceRegion({
    reducer: ee.Reducer.mean(), geometry: region, scale: 2000, maxPixels: 1e10, tileScale: 4
  });
  return ee.Feature(null, m).set('cluster_id', k);
}));

print('Parte A · Grupos AIZAL en celdas BioSat:', comparacionZonificacion);
print('Parte A · Perfiles medios de cada cluster:', perfilesClusters);

// ================================================================== PARTE B · MODELO DESMONTE RANDOM FOREST
var hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11');
var monte2000 = hansen.select('treecover2000').gte(30);
var anioPerdida = hansen.select('lossyear').updateMask(hansen.select('loss')).add(2000).rename('anio');

function monteAl(anio) { return monte2000.and(anioPerdida.unmask(9999).gt(anio)); }
function desmonteEntre(desde, hasta) {
  var a = anioPerdida.unmask(0);
  return a.gte(desde).and(a.lte(hasta)).rename('desmonte');
}

function distanciaA(mascara, nombre) {
  return mascara.selfMask().fastDistanceTransform(256).sqrt()
    .multiply(ee.Image.pixelArea().sqrt()).unmask(256 * 100).rename(nombre);
}

var pendiente = ee.Terrain.slope(ee.Image('NASA/NASADEM_HGT/001').select('elevation')).rename('pendiente');
var protegidas = ee.Image(0).byte().paint(
  ee.FeatureCollection('WCMC/WDPA/current/polygons').filterBounds(region), 1).rename('area_protegida');

function predictores(anioCorte) {
  var pob = ee.ImageCollection('WorldPop/GP/100m/pop').filterBounds(region)
    .filter(ee.Filter.eq('year', Math.min(anioCorte, 2020))).mosaic().unmask(0).rename('poblacion');
  var img = ee.Image.cat([
    distanciaA(monteAl(anioCorte).not(), 'dist_sin_monte'),
    distanciaA(desmonteEntre(2001, anioCorte), 'dist_desmonte_previo'),
    pendiente, protegidas, pob, variables, zonasAIZAL
  ]);
  return AIZAL_ASSET ? img.addBands(ee.Image(AIZAL_ASSET).select(['b36'], ['dist_caminos'])) : img;
}

function tablaMuestreo(anioCorte, hasta, semilla) {
  return predictores(anioCorte)
    .addBands(desmonteEntre(anioCorte + 1, hasta))
    .updateMask(monteAl(anioCorte))
    .stratifiedSample({
      numPoints: PUNTOS_POR_CLASE, classBand: 'desmonte', region: region,
      scale: 100, seed: semilla, geometries: true, tileScale: 8
    });
}

var datosTrain = tablaMuestreo(CORTE_TRAIN, CORTE_TEST, 1);
var datosTest = tablaMuestreo(CORTE_TEST, ULTIMO_ANIO, 2);
var PROPS = predictores(CORTE_TRAIN).bandNames();

// Entrenamiento de Random Forest y Árbol CART
var rf = ee.Classifier.smileRandomForest({numberOfTrees: 150, seed: 7}).train(datosTrain, 'desmonte', PROPS);
var arbol = ee.Classifier.smileCart({maxNodes: 32}).train(datosTrain, 'desmonte', PROPS);

function evaluar(clasif, nombre) {
  var m = datosTest.classify(clasif).errorMatrix('desmonte', 'classification');
  print('Parte B · Evaluación ' + nombre + ' (Test 2016-2023):',
        'Exactitud:', m.accuracy(), 'Kappa:', m.kappa(), 'F1 [0, 1]:', m.fscore());
}
evaluar(rf, 'Random Forest (150 árboles)');
evaluar(arbol, 'Árbol CART (Referencia)');
print('Parte B · Importancia de Variables en Random Forest:', rf.explain().get('importance'));

// Modelo Final en Modo PROBABILIDAD para Riesgo Futuro
var rfProb = ee.Classifier.smileRandomForest({numberOfTrees: 150, seed: 7})
  .setOutputMode('PROBABILITY').train(datosTest, 'desmonte', PROPS);

var mapaRiesgo = predictores(ULTIMO_ANIO).updateMask(monteAl(ULTIMO_ANIO))
  .classify(rfProb).rename('riesgo_desmonte');

// Estadísticas de Riesgo y Monte por Zona BioSat
var riesgoPorZona = celdasBioSat.map(function (f) {
  var g = f.geometry();
  var r = mapaRiesgo.reduceRegion({reducer: ee.Reducer.mean(), geometry: g, scale: 250, maxPixels: 1e10, tileScale: 4});
  var aTot = ee.Image.pixelArea().reduceRegion({reducer: ee.Reducer.sum(), geometry: g, scale: 250, maxPixels: 1e10}).get('area');
  var aMon = ee.Image.pixelArea().updateMask(monteAl(ULTIMO_ANIO)).reduceRegion({reducer: ee.Reducer.sum(), geometry: g, scale: 250, maxPixels: 1e10}).get('area');
  var pctMon = ee.Number(aMon).divide(ee.Number(aTot)).multiply(100);
  return f.set({
    'riesgo_medio_0_1': r.get('riesgo_desmonte'),
    'monte_remanente_pct': pctMon
  });
});
print('Parte B · Riesgo Medio y Monte Remanente por Zona BioSat:', riesgoPorZona);

// Serie temporal de hectáreas desmontadas por año
var areaHa = ee.Image.pixelArea().divide(1e4).rename('ha');
var serieAnual = celdasBioSat.map(function (f) {
  var s = areaHa.addBands(anioPerdida).reduceRegion({
    reducer: ee.Reducer.sum().group({groupField: 1, groupName: 'anio'}),
    geometry: f.geometry(), scale: 60, maxPixels: 1e11, tileScale: 8
  });
  return f.set('desmonte_ha_por_anio', s.get('groups'));
});

// ================================================================== MAPA Y CAPAS
Map.centerObject(region, 7);
Map.setOptions('HYBRID');

Map.addLayer(zonasAIZAL.randomVisualizer(), {opacity: 0.6}, 'Parte A: Zonas AIZAL (k = 5)');
Map.addLayer(anioPerdida.clip(region), {min: 2001, max: 2023, palette: ['#ffe08a', '#ff8c42', '#d7263d', '#7a0b2b']}, 'Desmonte Histórico (Hansen 2001-2023)', false);
Map.addLayer(mapaRiesgo.clip(region), {min: 0.05, max: 0.65, palette: ['#f7f4ea', '#f2b56b', '#c2410c', '#5c1d0b']}, 'Parte B: Riesgo de Desmonte (RF)', true);
Map.addLayer(ee.Image().byte().paint({featureCollection: celdasBioSat, color: 1, width: 2.5}), {palette: ['#00FFFF']}, 'Zonas BioSat (5 Celdas)');

// ================================================================== EXPORTACIONES A GOOGLE DRIVE
Export.image.toDrive({image: zonasAIZAL.toByte(), description: 'BioSat_KMeans_Zonificacion', folder: 'BioSat_Santi_Task', region: region, scale: ESCALA_M, maxPixels: 1e10});
Export.image.toDrive({image: mapaRiesgo.multiply(100).toByte(), description: 'BioSat_Riesgo_Desmonte_Probabilidad', folder: 'BioSat_Santi_Task', region: region, scale: 250, maxPixels: 1e10});
Export.table.toDrive({collection: comparacionZonificacion, description: 'BioSat_KMeans_Cruce_Zonas', folder: 'BioSat_Santi_Task', fileFormat: 'CSV'});
Export.table.toDrive({collection: perfilesClusters, description: 'BioSat_KMeans_Perfiles', folder: 'BioSat_Santi_Task', fileFormat: 'CSV'});
Export.table.toDrive({collection: riesgoPorZona, description: 'BioSat_RF_Riesgo_Por_Zona', folder: 'BioSat_Santi_Task', fileFormat: 'CSV'});
Export.table.toDrive({collection: serieAnual, description: 'BioSat_Serie_Historica_Desmonte', folder: 'BioSat_Santi_Task', fileFormat: 'GeoJSON'});
