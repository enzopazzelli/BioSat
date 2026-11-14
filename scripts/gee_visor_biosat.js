/*
 * BioSat · Visor GIS de Santiago del Estero (Google Earth Engine)
 * ----------------------------------------------------------------
 * Cómo usarlo:
 *   1. Abrir https://code.earthengine.google.com, pegar este script y tocar "Run".
 *   2. Para compartirlo: botón "Apps" → "New App" → publicar. Queda un link público
 *      que se puede poner en la app web y en el pitch.
 *
 * Qué muestra:
 *   - Izquierda: Landsat 5/7 de 2000. Derecha: Landsat 8/9 de 2025 y las capas de BioSat.
 *     La barra del medio se arrastra para comparar (se ve el desmonte).
 *   - Capas: color real (invierno y verano), verdor NDVI, frecuencia de suelo pelado,
 *     desmonte por año (Hansen, hecho con Landsat), relieve y zonas parecidas (IA AlphaEarth).
 *   - Clic en el mapa: curva de verdor (NDVI) 2016-2025 de ese punto.
 *
 * Proyecto BioSat · NASA Space Apps 2026 · ver docs/cruce-de-datos.md
 */

// ---------------------------------------------------------------- Zonas BioSat
// Punto de NASA POWER de cada zona y su celda (0,5° de latitud × 0,625° de longitud).
var ZONAS = [
  {id: 'zona_1_riego_salitre', nombre: 'Zona 1 · Riego del Río Dulce', lat: -27.73, lon: -64.17},
  {id: 'zona_2_secano_este', nombre: 'Zona 2 · Secano del este', lat: -27.65, lon: -62.42},
  {id: 'zona_3_monte_semiarido', nombre: 'Zona 3 · Chaco semiárido norte', lat: -26.58, lon: -62.85},
  {id: 'zona_4_bajos_submeridionales', nombre: 'Zona 4 · Bajos submeridionales', lat: -28.46, lon: -62.83},
  {id: 'zona_5_sur_serrano', nombre: 'Zona 5 · Sur serrano (en evaluación)', lat: -29.50, lon: -63.69}
];
function celda(z) {
  return ee.Geometry.Rectangle([z.lon - 0.3125, z.lat - 0.25, z.lon + 0.3125, z.lat + 0.25]);
}
var zonasFC = ee.FeatureCollection(ZONAS.map(function (z) {
  return ee.Feature(celda(z), {id: z.id, nombre: z.nombre});
}));

var provincia = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM0_NAME', 'Argentina'))
  .filter(ee.Filter.stringContains('ADM1_NAME', 'Estero'));
var region = provincia.geometry();

// ---------------------------------------------------------------- Landsat
// Máscara de nubes con QA_PIXEL: bit 1 (nube dilatada), bit 3 (nube), bit 4 (sombra).
var MASCARA_NUBES = parseInt('11010', 2);

function prepararL89(img) {
  var limpio = img.select('QA_PIXEL').bitwiseAnd(MASCARA_NUBES).eq(0);
  var sr = img.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'],
                      ['azul', 'verde', 'rojo', 'nir', 'swir1', 'swir2'])
    .multiply(0.0000275).add(-0.2);
  return ee.Image(sr.updateMask(limpio).copyProperties(img, ['system:time_start']));
}
function prepararL57(img) {
  var limpio = img.select('QA_PIXEL').bitwiseAnd(MASCARA_NUBES).eq(0);
  var sr = img.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],
                      ['azul', 'verde', 'rojo', 'nir', 'swir1', 'swir2'])
    .multiply(0.0000275).add(-0.2);
  return ee.Image(sr.updateMask(limpio).copyProperties(img, ['system:time_start']));
}
function indices(img) {
  var ndvi = img.normalizedDifference(['nir', 'rojo']).rename('ndvi');   // verdor
  var nbr = img.normalizedDifference(['nir', 'swir2']).rename('nbr');    // cae con el desmonte
  var bsi = img.expression('((s + r) - (n + b)) / ((s + r) + (n + b))', {  // suelo desnudo
    s: img.select('swir1'), r: img.select('rojo'), n: img.select('nir'), b: img.select('azul')
  }).rename('bsi');
  return img.addBands([ndvi, nbr, bsi]);
}

var l89 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LC09/C02/T1_L2'))
  .filterBounds(region).map(prepararL89).map(indices);
var l57 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
  .merge(ee.ImageCollection('LANDSAT/LE07/C02/T1_L2'))
  .filterBounds(region).map(prepararL57).map(indices);

var invierno2025 = l89.filterDate('2025-06-01', '2025-10-31').median();
var verano2025 = l89.filterDate('2024-12-01', '2025-03-31').median();
var invierno2000 = l57.filterDate('1999-06-01', '2001-10-31')
  .filter(ee.Filter.calendarRange(6, 10, 'month')).median();

// Frecuencia de suelo pelado: proporción de meses (2023-2025) con NDVI menor al umbral.
// Es el "método simple" contra el que se compara el modelo de IA (Frente 3).
var UMBRAL_NDVI = 0.25;
var inicio = ee.Date('2023-01-01');
var mensual = ee.ImageCollection(ee.List.sequence(0, 35).map(function (i) {
  var d0 = inicio.advance(i, 'month');
  var col = l89.filterDate(d0, d0.advance(1, 'month')).select('ndvi');
  return col.median().set('system:time_start', d0.millis()).set('n', col.size());
})).filter(ee.Filter.gt('n', 0));
var frecuenciaPelado = mensual.map(function (img) {
  return img.lt(UMBRAL_NDVI).rename('pelado');
}).mean();

// ---------------------------------------------------------------- Otras capas
var cultivos = ee.ImageCollection('ESA/WorldCover/v200').first().select('Map').eq(40);
var hansen = ee.Image('UMD/hansen/global_forest_change_2023_v1_11');
var desmonte = hansen.select('lossyear').updateMask(hansen.select('loss'));
var dem = ee.Image('NASA/NASADEM_HGT/001').select('elevation');
var relieve = ee.Terrain.hillshade(dem);

// Zonas parecidas: k-means sobre los embeddings AlphaEarth 2024 (64 dimensiones).
var embeddings = ee.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL')
  .filterDate('2024-01-01', '2025-01-01').filterBounds(region).mosaic().clip(region);
var muestra = embeddings.sample({region: region, scale: 500, numPixels: 5000, seed: 7, geometries: false});
var zonasIA = embeddings.cluster(ee.Clusterer.wekaKMeans(7).train(muestra)).clip(region);

// ---------------------------------------------------------------- Estilos
var VIS_RGB = {bands: ['rojo', 'verde', 'azul'], min: 0.02, max: 0.18, gamma: 1.2};
var PALETA_NDVI = ['#a50026', '#f46d43', '#fee08b', '#d9ef8b', '#66bd63', '#006837'];
var VIS_NDVI = {bands: ['ndvi'], min: 0, max: 0.85, palette: PALETA_NDVI};
var VIS_PELADO = {min: 0, max: 0.6, palette: ['#f7f4ea', '#e6b35a', '#b8461f', '#5c1d0b']};
var VIS_DESMONTE = {min: 1, max: 23, palette: ['#ffe08a', '#ff8c42', '#d7263d', '#7a0b2b']};
var bordes = ee.Image().byte().paint({featureCollection: zonasFC, color: 1, width: 2});
var bordeProvincia = ee.Image().byte().paint({featureCollection: provincia, color: 1, width: 1});

// ---------------------------------------------------------------- Mapas
var mapa2000 = ui.Map();
var mapa2025 = ui.Map();
[mapa2000, mapa2025].forEach(function (m) {
  m.setOptions('HYBRID');
  m.setControlVisibility({layerList: true, zoomControl: true, mapTypeControl: false, fullscreenControl: false});
});

mapa2000.addLayer(invierno2000.clip(region), VIS_RGB, '2000 · color real (Landsat 5/7)');
mapa2000.addLayer(bordes, {palette: ['#ffffff']}, 'Zonas BioSat');
mapa2000.add(ui.Label('2000', {fontWeight: 'bold', fontSize: '16px', position: 'top-left'}));

mapa2025.addLayer(invierno2025.clip(region), VIS_RGB, '2025 · color real, invierno');
mapa2025.addLayer(verano2025.clip(region), VIS_RGB, '2025 · color real, verano', false);
mapa2025.addLayer(verano2025.clip(region), VIS_NDVI, 'Verdor NDVI · verano', false);
mapa2025.addLayer(invierno2025.clip(region), VIS_NDVI, 'Verdor NDVI · invierno', false);
mapa2025.addLayer(frecuenciaPelado.updateMask(cultivos).clip(region), VIS_PELADO, 'Frecuencia de suelo pelado (lotes agrícolas)', false);
mapa2025.addLayer(desmonte.clip(region), VIS_DESMONTE, 'Desmonte por año 2001-2023 (Hansen)', false);
mapa2025.addLayer(relieve.clip(region), {min: 150, max: 255}, 'Relieve (NASADEM)', false);
mapa2025.addLayer(zonasIA.randomVisualizer(), {opacity: 0.7}, 'Zonas parecidas (IA AlphaEarth, k = 7)', false);
mapa2025.addLayer(bordeProvincia, {palette: ['#ffd166']}, 'Provincia');
mapa2025.addLayer(bordes, {palette: ['#ffffff']}, 'Zonas BioSat (celda NASA POWER)');
mapa2025.add(ui.Label('2025', {fontWeight: 'bold', fontSize: '16px', position: 'top-right'}));

var enlace = ui.Map.Linker([mapa2000, mapa2025]);
var comparador = ui.SplitPanel({
  firstPanel: mapa2000, secondPanel: mapa2025, orientation: 'horizontal', wipe: true,
  style: {stretch: 'both'}
});

// ---------------------------------------------------------------- Panel lateral
var panel = ui.Panel({style: {width: '340px', padding: '10px'}});
panel.add(ui.Label('BioSat · Visor de Santiago del Estero', {fontSize: '20px', fontWeight: 'bold'}));
panel.add(ui.Label('Arrastrá la barra del medio para comparar 2000 con 2025. Prendé capas en el menú de la derecha. ' +
  'Tocá el mapa para ver cómo cambia el verdor de ese punto.', {fontSize: '12px'}));

panel.add(ui.Label('Ir a una zona', {fontWeight: 'bold', margin: '12px 8px 4px'}));
panel.add(ui.Select({
  items: ZONAS.map(function (z) { return {label: z.nombre, value: z.id}; }),
  placeholder: 'Elegí una zona',
  onChange: function (id) {
    var z = ZONAS.filter(function (x) { return x.id === id; })[0];
    mapa2025.centerObject(celda(z), 10);
  }
}));

function filaLeyenda(color, texto) {
  return ui.Panel([
    ui.Label('', {backgroundColor: color, padding: '7px', margin: '2px 6px 2px 8px'}),
    ui.Label(texto, {fontSize: '12px', margin: '2px 0'})
  ], ui.Panel.Layout.flow('horizontal'));
}
panel.add(ui.Label('Cómo leer las capas', {fontWeight: 'bold', margin: '12px 8px 4px'}));
panel.add(ui.Label('Verdor NDVI', {fontSize: '12px', fontWeight: 'bold'}));
panel.add(filaLeyenda('#a50026', 'Suelo pelado o seco'));
panel.add(filaLeyenda('#fee08b', 'Poco verde'));
panel.add(filaLeyenda('#006837', 'Cultivo o monte verde'));
panel.add(ui.Label('Suelo pelado (proporción de meses)', {fontSize: '12px', fontWeight: 'bold'}));
panel.add(filaLeyenda('#f7f4ea', 'Casi nunca'));
panel.add(filaLeyenda('#b8461f', 'Seguido'));
panel.add(filaLeyenda('#5c1d0b', 'Más de la mitad del tiempo'));
panel.add(ui.Label('Desmonte (año)', {fontSize: '12px', fontWeight: 'bold'}));
panel.add(filaLeyenda('#ffe08a', '2001'));
panel.add(filaLeyenda('#7a0b2b', '2023'));

var zonaGrafico = ui.Panel();
panel.add(ui.Label('Verdor del punto elegido', {fontWeight: 'bold', margin: '12px 8px 4px'}));
panel.add(zonaGrafico);
panel.add(ui.Label('Fuentes: Landsat 5/7/8/9 (NASA/USGS), Hansen Global Forest Change (UMD, hecho con Landsat), ' +
  'NASADEM (NASA), ESA WorldCover, AlphaEarth (Google DeepMind). BioSat apoya, no reemplaza, al productor.',
  {fontSize: '11px', color: '#555', margin: '14px 8px'}));

mapa2025.onClick(function (coords) {
  var punto = ee.Geometry.Point([coords.lon, coords.lat]);
  zonaGrafico.clear();
  zonaGrafico.add(ui.Label('Calculando…', {fontSize: '12px'}));
  var grafico = ui.Chart.image.series({
    imageCollection: l89.filterDate('2016-01-01', '2026-01-01').select('ndvi'),
    region: punto, reducer: ee.Reducer.mean(), scale: 30
  }).setOptions({
    title: 'NDVI 2016-2025 (' + coords.lat.toFixed(3) + ', ' + coords.lon.toFixed(3) + ')',
    vAxis: {title: 'NDVI', viewWindow: {min: -0.1, max: 1}},
    hAxis: {title: ''}, lineWidth: 1, pointSize: 2, legend: {position: 'none'}, colors: ['#1F7A44']
  });
  zonaGrafico.clear();
  zonaGrafico.add(grafico);
});

ui.root.clear();
ui.root.setLayout(ui.Panel.Layout.flow('horizontal'));
ui.root.add(panel);
ui.root.add(comparador);
mapa2025.centerObject(region, 7);
