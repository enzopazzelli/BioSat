/*
 * BioSat · Exportar estadísticas e imágenes por zona (Google Earth Engine)
 * -----------------------------------------------------------------------
 * Cómo usarlo:
 *   1. Pegar en https://code.earthengine.google.com y tocar "Run".
 *   2. En la consola aparece la tabla por zona y los links de las imágenes.
 *      Bajarlas a data/imagenes/ con el nombre que indica cada link (contratos §5).
 *   3. En la pestaña "Tasks", correr "biosat_estadisticas_zonas" (CSV a Google Drive).
 *   4. Con el CSV se completa data/diagnostico_landsat_ia.json
 *      (ver docs/contratos-de-datos.md §3). Nunca completar a mano.
 *
 * Qué calcula por zona (celda de NASA POWER de cada zona):
 *   - prob_pelado_m01..m12: proporción de lotes agrícolas con suelo pelado
 *     (NDVI < 0,25) en cada mes, promedio 2023-2025 (método simple de referencia).
 *   - cultivo_pct, monte_2000_pct, desmonte_2001_2023_pct, desmonte_2016_2023_pct.
 *   - ndvi_verano y ndvi_invierno de los lotes agrícolas, pendiente_media_pct.
 */

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

var MASCARA_NUBES = parseInt('11010', 2);
function prepararL89(img) {
  var limpio = img.select('QA_PIXEL').bitwiseAnd(MASCARA_NUBES).eq(0);
  var sr = img.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5'], ['azul', 'verde', 'rojo', 'nir'])
    .multiply(0.0000275).add(-0.2);
  var ndvi = sr.normalizedDifference(['nir', 'rojo']).rename('ndvi');
  return ee.Image(sr.addBands(ndvi).updateMask(limpio).copyProperties(img, ['system:time_start']));
}
function prepararL57(img) {
  var limpio = img.select('QA_PIXEL').bitwiseAnd(MASCARA_NUBES).eq(0);
  var sr = img.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4'], ['azul', 'verde', 'rojo', 'nir'])
    .multiply(0.0000275).add(-0.2);
  return ee.Image(sr.updateMask(limpio).copyProperties(img, ['system:time_start']));
}

var todas = ee.FeatureCollection(ZONAS.map(function (z) { return ee.Feature(celda(z)); })).geometry();
var l89 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
  .filterBounds(todas).map(prepararL89);
var l57 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LE07/C02/T1_L2'))
  .filterBounds(todas).map(prepararL57);

var UMBRAL_NDVI = 0.25;
var inicio = ee.Date('2023-01-01');
var mensual = ee.ImageCollection(ee.List.sequence(0, 35).map(function (i) {
  var d0 = inicio.advance(i, 'month');
  var col = l89.filterDate(d0, d0.advance(1, 'month')).select('ndvi');
  return col.median().lt(UMBRAL_NDVI).rename('pelado')
    .set('mes', d0.get('month')).set('n', col.size());
})).filter(ee.Filter.gt('n', 0));

// Una banda por mes del año: proporción de años (2023-2025) en que el píxel estuvo pelado.
var peladoPorMes = ee.Image.cat(ee.List.sequence(1, 12).map(function (m) {
  var mes = ee.Number(m).int();
  var nombre = ee.String('prob_pelado_m').cat(mes.format('%02d'));
  return mensual.filter(ee.Filter.eq('mes', mes)).mean().rename(nombre);
}));

var cultivos = ee.ImageCollection('ESA/WorldCover/v200').first().select('Map').eq(40);
var hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11');
var monte2000 = hansen.select('treecover2000').gte(30);
var perdida = hansen.select('loss').and(monte2000);
var perdidaReciente = perdida.and(hansen.select('lossyear').gte(16));
var pendiente = ee.Terrain.slope(ee.Image('NASA/NASADEM_HGT/001').select('elevation'));
var verano = l89.filterDate('2024-12-01', '2025-03-31').median();
var invierno = l89.filterDate('2025-06-01', '2025-10-31').median();

var porcentajes = ee.Image.cat([
  cultivos.rename('cultivo_pct'),
  monte2000.rename('monte_2000_pct'),
  perdida.rename('desmonte_2001_2023_pct'),
  perdidaReciente.rename('desmonte_2016_2023_pct')
]).multiply(100);
// Pendiente en grados → porcentaje.
var pendientePct = pendiente.multiply(Math.PI / 180).tan().multiply(100).rename('pendiente_media_pct');

var estadisticas = ee.FeatureCollection(ZONAS.map(function (z) {
  var g = celda(z);
  var enCultivos = peladoPorMes
    .addBands(verano.select('ndvi').rename('ndvi_verano'))
    .addBands(invierno.select('ndvi').rename('ndvi_invierno'))
    .updateMask(cultivos)
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: g, scale: 60, maxPixels: 1e10, tileScale: 4});
  var generales = porcentajes.addBands(pendientePct)
    .reduceRegion({reducer: ee.Reducer.mean(), geometry: g, scale: 60, maxPixels: 1e10, tileScale: 4});
  return ee.Feature(null, enCultivos.combine(generales))
    .set('zona_id', z.id).set('lat', z.lat).set('lon', z.lon)
    .set('umbral_ndvi', UMBRAL_NDVI).set('periodo_pelado', '2023-2025')
    .set('fuentes', 'Landsat 8/9 C2 L2; ESA WorldCover 2021; Hansen GFC v1.11; NASADEM');
}));

print('Estadísticas por zona (lotes agrícolas = ESA WorldCover clase 40)', estadisticas);
Export.table.toDrive({
  collection: estadisticas, description: 'biosat_estadisticas_zonas',
  fileFormat: 'CSV', folder: 'BioSat'
});

// Imágenes para el visor de la app (mismo recorte que el mockup: punto ± 0,4° × ± 0,3°).
var VIS_RGB = {bands: ['rojo', 'verde', 'azul'], min: 0.02, max: 0.18, gamma: 1.2};
var VIS_NDVI = {bands: ['ndvi'], min: -0.05, max: 0.85,
  palette: ['#a50026', '#f46d43', '#fee08b', '#d9ef8b', '#66bd63', '#006837']};
var invierno2000 = l57.filterDate('1999-06-01', '2001-10-31')
  .filter(ee.Filter.calendarRange(6, 10, 'month')).median();

ZONAS.forEach(function (z) {
  var recorte = ee.Geometry.Rectangle([z.lon - 0.4, z.lat - 0.3, z.lon + 0.4, z.lat + 0.3]);
  var p = {region: recorte, dimensions: 800, format: 'png'};
  var prefijo = 'z' + z.id.split('_')[1];   // z1, z2... (contratos §5)
  print(prefijo + '_invierno_rgb.png', invierno.visualize(VIS_RGB).getThumbURL(p));
  print(prefijo + '_verano_rgb.png', verano.visualize(VIS_RGB).getThumbURL(p));
  print(prefijo + '_invierno_ndvi.png', invierno.visualize(VIS_NDVI).getThumbURL(p));
  print(prefijo + '_verano_ndvi.png', verano.visualize(VIS_NDVI).getThumbURL(p));
  print(prefijo + '_2000_rgb.png', invierno2000.visualize(VIS_RGB).getThumbURL(p));
});
