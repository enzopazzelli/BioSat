// Pruebas del lector de dron (web/dron-logica.js, D-38): coordenadas, tipo de imagen, NDVI, zona del lote y textos.
// Diseño: docs/superpowers/specs/2026-11-15-lector-dron-design.md · Plan: docs/superpowers/plans/2026-11-15-lector-dron-etapa-1.md
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../web/dron-logica.js');
const proj4 = require('../web/vendor/proj4.js');

test('defProj4: UTM sur y norte, WGS84, POSGAR 2007 faja 4 y desconocido', () => {
  assert.equal(D.defProj4(32720), '+proj=utm +zone=20 +south +datum=WGS84 +units=m +no_defs');
  assert.equal(D.defProj4(32620), '+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs');
  assert.equal(D.defProj4(4326), '+proj=longlat +datum=WGS84 +no_defs');
  assert.equal(D.defProj4(5346), '+proj=tmerc +lat_0=-90 +lon_0=-63 +k=1 +x_0=4500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
  assert.match(D.defProj4(3857), /\+proj=merc \+a=6378137/);
  assert.equal(D.defProj4(22185), null);
});

test('epsgDe: proyectado, geográfico, definido por el usuario y sin GeoKeys', () => {
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32720}), 32720);
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 2, GeographicTypeGeoKey: 4326}), 4326);
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32767}), null);
  assert.equal(D.epsgDe(null), null);
});

test('recuadroLatLon envuelve las 4 esquinas (UTM 20 S, simétrico al meridiano -63)', () => {
  const r = D.recuadroLatLon([499000, 6999000, 501000, 7001000], (x, y) => proj4(D.defProj4(32720), 'WGS84', [x, y]));
  assert.ok(r[0][0] < r[1][0] && r[0][1] < -63 && r[1][1] > -63);
  assert.ok(Math.abs((r[0][1] + r[1][1]) / 2 + 63) < 1e-9);
  assert.ok(Math.abs((r[1][1] - r[0][1]) - 0.0202) < 0.0005);
});

test('metrosPorPixel: 0,01° de longitud a -27° en 100 px', () => {
  assert.ok(Math.abs(D.metrosPorPixel([[-27.01, -63.01], [-27, -63]], 100) - 9.92) < 0.05);
});

test('tipoImagen', () => {
  assert.equal(D.tipoImagen({bandas: 3, bits: [8, 8, 8], formato: 'uint', fotometrica: 2}), 'rgb');
  assert.equal(D.tipoImagen({bandas: 4, bits: [8, 8, 8, 8], formato: 'uint', fotometrica: 2}), 'rgb');
  assert.equal(D.tipoImagen({bandas: 5, bits: [16, 16, 16, 16, 16], formato: 'uint', fotometrica: 1}), 'multi');
  assert.equal(D.tipoImagen({bandas: 4, bits: [16, 16, 16, 16], formato: 'uint', fotometrica: 1}), 'multi');
  assert.equal(D.tipoImagen({bandas: 1, bits: [32], formato: 'float', fotometrica: 1}), 'una_decimal');
  assert.equal(D.tipoImagen({bandas: 1, bits: [16], formato: 'uint', fotometrica: 1}), 'gris');
});

test('pareceNdvi: todo lo válido entre -1 y 1', () => {
  assert.equal(D.pareceNdvi(Float32Array.from([-0.2, 0.5, 0.9, -9999]), -9999), true);
  assert.equal(D.pareceNdvi(Float32Array.from([0.2, 1.7]), null), false);
  assert.equal(D.pareceNdvi(Float32Array.from([NaN, NaN]), null), false);
});

test('descripcionesBandas lee GDAL_METADATA y bandasSugeridas no confunde red edge con rojo', () => {
  const xml = '<GDALMetadata><Item name="DESCRIPTION" sample="2" role="description">Red</Item><Item name="DESCRIPTION" sample="3" role="description">NIR</Item></GDALMetadata>';
  assert.deepEqual(D.descripcionesBandas(xml, 5), ['', '', 'Red', 'NIR', '']);
  assert.deepEqual(D.descripcionesBandas(undefined, 2), ['', '']);
  assert.deepEqual(D.bandasSugeridas(['Blue', 'Green', 'Red', 'NIR', 'RedEdge']), {rojo: 2, nir: 3});
  assert.deepEqual(D.bandasSugeridas(['Red edge', 'Red', 'Near Infrared']), {rojo: 1, nir: 2});
  assert.deepEqual(D.bandasSugeridas(['Rojo', 'Infrarrojo cercano']), {rojo: 0, nir: 1});
  assert.deepEqual(D.bandasSugeridas(['', '', '']), {rojo: null, nir: null});
});

test('ndvi: sin dato, 0/0 y máscara alfa quedan en NaN', () => {
  const v = D.ndvi(Uint16Array.from([100, 0, 50, 7]), Uint16Array.from([300, 0, 50, 7]), 7);
  assert.ok(Math.abs(v[0] - 0.5) < 1e-6 && Number.isNaN(v[1]) && v[2] === 0 && Number.isNaN(v[3]));
  const m = D.ndvi(Uint8Array.from([10, 10]), Uint8Array.from([30, 30]), null, Uint8Array.from([255, 0]));
  assert.ok(Math.abs(m[0] - 0.5) < 1e-6 && Number.isNaN(m[1]));
});

test('resumenNdvi: mediana y fracción por debajo del umbral (estricto), sin contar NaN', () => {
  const r = D.resumenNdvi(Float32Array.from([0.1, 0.2, 0.3, 0.6, NaN]), 0.25);
  assert.ok(Math.abs(r.mediana - 0.25) < 1e-6);
  assert.equal(r.fraccionBajo, 0.5);
  assert.equal(r.validos, 4);
  assert.deepEqual(D.resumenNdvi(Float32Array.from([NaN]), 0.25), {mediana: null, fraccionBajo: null, validos: 0});
});

test('fechaDeTiff y avisoTamano', () => {
  assert.equal(D.fechaDeTiff('2026:11:03 10:30:00'), '2026-11-03');
  assert.equal(D.fechaDeTiff(''), null);
  assert.equal(D.fechaDeTiff('basura'), null);
  assert.equal(D.avisoTamano(200e6), null);
  assert.equal(typeof D.avisoTamano(1.5 * 1024 ** 3), 'string');
});

const MAPA = require('../data/santiago_mapa.json'), CLIMA = require('../data/clima_zonas.json');
const GEO = Object.fromEntries(Object.entries(CLIMA.zonas).map(([id, z]) => [id[5], {lat: z.lat, lon: z.lon}]));

test('transformacionMapa reproduce los 5 puntos de NASA POWER del mapa', () => {
  const t = D.transformacionMapa(MAPA.puntos, GEO);
  for (const n of Object.keys(GEO)) {
    assert.ok(Math.abs(t.ax * GEO[n].lon + t.bx - MAPA.puntos[n].x) < 0.2, n);
    assert.ok(Math.abs(t.ay * GEO[n].lat + t.by - MAPA.puntos[n].y) < 0.2, n);
  }
});

test('parsearPath separa los anillos', () => {
  const a = D.parsearPath('M0,0L10,0L10,10L0,10ZM20,20L30,20L30,30Z');
  assert.equal(a.length, 2);
  assert.equal(a[0].length, 4);
  assert.deepEqual(a[1][2], [30, 30]);
});

test('zonaDelPunto: el punto de cada zona cae en su zona; Buenos Aires queda afuera', () => {
  const t = D.transformacionMapa(MAPA.puntos, GEO);
  for (const n of Object.keys(GEO)) assert.equal(D.zonaDelPunto(GEO[n].lat, GEO[n].lon, MAPA, t).zona, Number(n), n);
  assert.equal(D.zonaDelPunto(-34.6, -58.4, MAPA, t), null);
});

const R = {tipo: 'ndvi', fecha: '2026-11-03', mediana: 0.41, fraccionBajo: 0.18, zonaLote: 2, departamento: 'Moreno', zonaElegida: 2};

test('lineaInicio en sus casos', () => {
  assert.equal(D.lineaInicio(null), '¿Tenés una imagen de dron? Abrila en el Reporte');
  assert.equal(D.lineaInicio(R), 'Tu lote, según el dron (03/11): NDVI mediano 0,41 · 18 % sin cobertura activa.');
  assert.equal(D.lineaInicio({...R, tipo: 'rgb'}), 'Tu lote, según el dron (03/11): foto en color, sin NDVI.');
  assert.equal(D.lineaInicio({...R, tipo: 'gris'}), 'Tu lote, según el dron (03/11): imagen sin NDVI.');
  assert.equal(D.lineaInicio({...R, tipo: 'pendiente'}), 'Tu imagen de dron necesita un paso más en el Reporte.');
  assert.equal(D.lineaInicio({...R, fecha: null}), 'Tu lote, según el dron (fecha sin dato): NDVI mediano 0,41 · 18 % sin cobertura activa.');
  assert.equal(D.lineaInicio({...R, zonaLote: 5}), 'Tu lote, según el dron (03/11): NDVI mediano 0,41 · 18 % sin cobertura activa. Está en la Zona 5, no en la elegida.');
  assert.equal(D.lineaInicio({...R, zonaLote: null, departamento: null}), 'Tu lote, según el dron (03/11): NDVI mediano 0,41 · 18 % sin cobertura activa. Está fuera de Santiago del Estero.');
});

const Z = {fraccionZonaMes: 0.843, mesNombre: 'noviembre', periodo: '2021-2025', umbral: 0.25};

test('comparacion: no mezcla lotes con superficie y usa el mes del vuelo', () => {
  assert.deepEqual(D.comparacion(R, Z), [
    'NDVI mediano del lote: 0,41.',
    '18 % de la superficie sin cobertura vegetal activa (NDVI menor a 0,25).',
    'Tu zona en noviembre, según Landsat 2021-2025: 8 de cada 10 lotes con NDVI mediano menor a 0,25.',
    'Con ese mismo criterio, tu lote se vería con cobertura activa.']);
  assert.equal(D.comparacion({...R, mediana: 0.2}, Z)[3], 'Con ese mismo criterio, tu lote se vería sin cobertura activa.');
  assert.equal(D.comparacion({...R, fecha: null}, Z)[2], 'Sin la fecha del vuelo no se puede comparar con tu zona: escribila arriba.');
  assert.deepEqual(D.comparacion({...R, tipo: 'rgb'}, Z), ['Este archivo es una foto en color (RGB): no trae la banda infrarroja que hace falta para el NDVI.']);
  assert.equal(D.comparacion({...R, zonaLote: 5, departamento: 'Ojo de Agua'}, Z)[0], 'La imagen está en Ojo de Agua (Zona 5), no en la zona elegida.');
  const fuera = D.comparacion({...R, zonaLote: null, departamento: null}, Z);
  assert.equal(fuera[0], 'La imagen está fuera de Santiago del Estero: la comparación con las zonas no aplica.');
  assert.ok(!fuera.some(t => t.startsWith('Tu zona en')));
});

test('fichaTecnica: bandas desde 1, calibración y recuadro', () => {
  const t = D.fichaTecnica({tipo: 'ndvi', bandas: {rojo: 2, nir: 3}, epsg: 32720, metrosPixel: 0.042, anchoOriginal: 9000, altoOriginal: 6000, anchoCalculo: 2048});
  assert.ok(t.includes('Rojo: banda 3 · infrarrojo: banda 4.'));
  assert.ok(t.includes('Si el mosaico no está calibrado a reflectancia, el NDVI es aproximado.'));
  assert.ok(t.some(s => s.includes('EPSG:32720')));
  assert.ok(t.some(s => s.includes('9000 × 6000') && s.includes('2048')));
});

test('la fecha de la línea sigue el idioma (en inglés, mes/día)', () => {
  const antes = D.TEXTOS.locale;
  try {
    D.TEXTOS.locale = 'en-US';
    assert.match(D.lineaInicio({...R, tipo: 'rgb'}), /\(11\/03\)/);
  } finally { D.TEXTOS.locale = antes; }
  assert.match(D.lineaInicio({...R, tipo: 'rgb'}), /\(03\/11\)/);
});

test('tramos: lee el archivo de a franjas que cubren todas las filas, sin huecos ni solapes', () => {
  const t = D.tramos(6000, 1365, 512);
  assert.equal(t[0].o0, 0); assert.equal(t[t.length - 1].o1, 1365);
  assert.equal(t[0].r0, 0); assert.equal(t[t.length - 1].r1, 6000);
  for (let i = 1; i < t.length; i++) { assert.equal(t[i].o0, t[i - 1].o1); assert.equal(t[i].r0, t[i - 1].r1); }
  assert.ok(t.every(x => x.r1 - x.r0 <= 512 + 5 && x.o1 > x.o0 && x.r1 > x.r0));
  assert.deepEqual(D.tramos(60, 60, 512), [{o0: 0, o1: 60, r0: 0, r1: 60}]);
});

// Archivo real de Enzo (drone.tif, 15/11): JPEG en YCbCr, con máscara interna y versiones reducidas (COG).
// [indice, ancho, alto, bandas, NewSubfileType] tal como los lee geotiff.js.
const REAL = [[0, 18990, 13321, 3, 0], [1, 18990, 13321, 1, 4], [2, 9495, 6661, 3, 1], [3, 4748, 3331, 3, 1], [4, 2374, 1666, 3, 1],
  [5, 1187, 833, 3, 1], [6, 594, 417, 3, 1], [7, 297, 209, 3, 1], [8, 9495, 6661, 1, 5], [9, 4748, 3331, 1, 5], [10, 2374, 1666, 1, 5],
  [11, 1187, 833, 1, 5], [12, 594, 417, 1, 5], [13, 297, 209, 1, 5]].map(([i, ancho, alto, bandas, sub]) => ({i, ancho, alto, bandas, sub}));

test('una foto en YCbCr (JPEG) también es RGB', () => {
  assert.equal(D.tipoImagen({bandas: 3, bits: [8, 8, 8], formato: 'uint', fotometrica: 6}), 'rgb');
});

test('ycbcrARgb da lo mismo que readRGB de geotiff.js', () => {
  assert.deepEqual(D.ycbcrARgb(192, 109, 134), [200, 194, 158]);
  assert.deepEqual(D.ycbcrARgb(171, 109, 134), [179, 173, 137]);
  assert.deepEqual(D.ycbcrARgb(255, 128, 128), [255, 255, 255]);
  assert.deepEqual(D.ycbcrARgb(0, 255, 0), [0, 48, 225]);
});

test('elegirVista usa la versión reducida más chica que alcanza, y elegirMascara la de su mismo tamaño', () => {
  assert.equal(D.elegirVista(REAL, 2048), 4);
  assert.equal(D.elegirMascara(REAL, 2374, 1666), 10);
  assert.equal(D.elegirMascara(REAL, 18990, 13321), 1);
  assert.equal(D.elegirVista(REAL, 30000), 0);
  const chico = [{i: 0, ancho: 100, alto: 60, bandas: 5, sub: 0}];
  assert.equal(D.elegirVista(chico, 100), 0);
  assert.equal(D.elegirMascara(chico, 100, 60), null);
});

test('fichaTecnica de una foto RGB no habla de números calculados', () => {
  const t = D.fichaTecnica({tipo: 'rgb', bandas: null, epsg: 32721, metrosPixel: 0.211, anchoOriginal: 18990, altoOriginal: 13321, anchoCalculo: 2048});
  assert.ok(t.includes('Archivo de 18990 × 13321 píxeles. Se muestra una versión de 2048 píxeles de ancho, de unos 21 cm por píxel.'));
  assert.ok(!t.some(s => /números/.test(s)));
});

test('paqueteVuelo y vueloDePaquete: ida y vuelta, con el NDVI como Float32Array', () => {
  const e = {nombre: 'NDVI.tif', bytes: 10, fecha: '2026-11-03', tipo: 'ndvi', recuadro: [[-28, -64], [-27.9, -63.9]], url: 'blob:x', leyendo: false, error: null};
  const p = D.paqueteVuelo(e, {valores: Float32Array.from([0.1, 0.2]), ancho: 2, alto: 1}, new Blob(['png']), 'ahora');
  assert.equal(p.id, 'NDVI.tif|10|2026-11-03'); assert.equal(p.estado.url, undefined);
  const r = D.vueloDePaquete(structuredClone(p));
  assert.ok(r.ndvi.valores instanceof Float32Array); assert.equal(r.ndvi.valores[1], Float32Array.from([0.2])[0]);
  assert.equal(r.estado.tipo, 'ndvi');
  assert.equal(D.vueloDePaquete({...p, version: 2}), null);
  assert.equal(D.vueloDePaquete({...p, png: null}), null);
});

// D-41: clases del ingeniero (cortes cargados en la app)
const CLASES = {cortes: [0.25, 0.6], nombres: ['Maleza', 'Zona afectada', 'Vigoroso']};
test('clasificar: bordes exactos y sin contar el sin dato', () => {
  assert.deepEqual(D.clasificar(Float32Array.from([0.1, 0.25, 0.5, 0.6, 0.9, NaN]), [0.25, 0.6]), {conteos: [1, 2, 2], total: 5, porcentajes: [20, 40, 40]});
  assert.deepEqual(D.clasificar(Float32Array.from([NaN]), [0.25, 0.6]), {conteos: [0, 0, 0], total: 0, porcentajes: [null, null, null]});
});
test('validarClases rechaza cortes al revés, fuera de rango o nombres vacíos', () => {
  assert.deepEqual(D.validarClases(CLASES), {ok: true, error: null});
  assert.equal(D.validarClases({...CLASES, cortes: [0.6, 0.25]}).error, 'clasesOrden');
  assert.equal(D.validarClases({...CLASES, cortes: [0.2, 1.5]}).error, 'clasesRango');
  assert.equal(D.validarClases({...CLASES, cortes: [NaN, 0.5]}).error, 'clasesRango');
  assert.equal(D.validarClases({...CLASES, nombres: ['Maleza', ' ', 'Vigoroso']}).error, 'clasesNombres');
});
test('textoClases', () => {
  assert.equal(D.textoClases(CLASES, {conteos: [1, 2, 2], total: 5, porcentajes: [20, 40, 40]}), 'Maleza 20 % · Zona afectada 40 % · Vigoroso 40 %');
});
