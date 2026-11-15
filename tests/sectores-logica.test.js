// Pruebas de los sectores del lote (web/sectores-logica.js, D-39).
// Diseño: docs/superpowers/specs/2026-11-15-lector-dron-etapa-2-design.md · Plan: docs/superpowers/plans/2026-11-15-lector-dron-etapa-2.md
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../web/sectores-logica.js');

const CUAD = [[-28, -64], [-28, -63.999], [-27.999, -63.999], [-27.999, -64]];

test('areaHa: cuadrado de 0,001° a -28° y su mitad', () => {
  assert.ok(Math.abs(S.areaHa(CUAD) - 1.094) < 0.005);
  assert.ok(Math.abs(S.areaHa(CUAD.slice(0, 3)) - 0.547) < 0.003);
});

// Grilla de 4 × 2 píxeles de 0,001°, fila de arriba primero. Izquierda NDVI 0,5 (con un píxel sin dato); derecha 0.
const G = {valores: Float32Array.from([0.5, 0.5, 0, 0, 0.5, NaN, 0, 0]), ancho: 4, alto: 2, recuadro: [[-28.002, -64], [-28, -63.996]]};
const pol = (o, e) => [[-28.002, o], [-28.002, e], [-28, e], [-28, o]];

test('ndviEnPoligono usa los píxeles cuyo centro cae adentro', () => {
  assert.deepEqual(S.ndviEnPoligono(G, pol(-64, -63.998), 0.25), {mediana: 0.5, fraccionBajo: 0, validos: 3});
  assert.deepEqual(S.ndviEnPoligono(G, pol(-63.998, -63.996), 0.25), {mediana: 0, fraccionBajo: 1, validos: 4});
  assert.equal(S.ndviEnPoligono(G, pol(-63.9, -63.8), 0.25), null);
  assert.equal(S.ndviEnPoligono(null, pol(-64, -63.998), 0.25), null);
});

test('siguienteNumero no repite aunque se borren sectores', () => {
  assert.equal(S.siguienteNumero([]), 1);
  assert.equal(S.siguienteNumero([{n: 1}, {n: 4}]), 5);
});

test('nuevoSector nace para revisar; conCambios acepta solo estados válidos', () => {
  const s = S.nuevoSector([{n: 2}], {puntos: CUAD, ndvi: null, vuelo: null, ahora: '2026-11-15T13:00:00Z'});
  assert.equal(s.n, 3); assert.equal(s.estado, 'revisar'); assert.equal(s.nota, ''); assert.equal(s.hallazgo, '');
  assert.ok(Math.abs(s.ha - 1.094) < 0.005);
  const r = S.conCambios(s, {estado: 'revisado', hallazgo: 'suelo compactado'}, '2026-11-15T14:00:00Z');
  assert.equal(r.estado, 'revisado'); assert.equal(r.hallazgo, 'suelo compactado'); assert.equal(r.actualizado, '2026-11-15T14:00:00Z');
  assert.equal(S.conCambios(r, {estado: 'cualquiera'}, 'x').estado, 'revisado');
});

const S1 = {id: 's1-x', n: 1, puntos: CUAD, ha: 1.094, ndvi: {mediana: 0.18, fraccionBajo: 0.72, validos: 900},
  vuelo: {id: 'NDVI.tif|1|2026-11-03', fecha: '2026-11-03', archivo: 'NDVI.tif'}, nota: 'mancha clara', estado: 'revisado',
  hallazgo: 'suelo compactado', creado: 'a', actualizado: 'b'};

test('aGeoJSON y deGeoJSON: ida y vuelta, [lon, lat], anillo cerrado y renumerado', () => {
  const g = S.aGeoJSON([S1], {umbral: 0.25});
  assert.equal(g.type, 'FeatureCollection');
  const c = g.features[0].geometry.coordinates[0];
  assert.deepEqual(c[0], [-64, -28]); assert.deepEqual(c[0], c[c.length - 1]);
  assert.equal(g.features[0].properties.ndvi_mediano, 0.18); assert.equal(g.features[0].properties.vuelo_archivo, 'NDVI.tif');
  const r = S.deGeoJSON(g, [{n: 3, puntos: [[0, 0], [0, 1], [1, 1]]}], 'ahora');
  assert.equal(r.nuevos.length, 1); assert.equal(r.nuevos[0].n, 4);
  assert.deepEqual(r.nuevos[0].puntos, CUAD);
  assert.equal(r.nuevos[0].estado, 'revisado'); assert.equal(r.nuevos[0].hallazgo, 'suelo compactado');
});

test('deGeoJSON saltea lo que no es polígono, no duplica y rechaza lo que no es GeoJSON', () => {
  const g = S.aGeoJSON([S1], {umbral: 0.25});
  g.features.push({type: 'Feature', geometry: {type: 'Point', coordinates: [-64, -28]}, properties: {}});
  const r = S.deGeoJSON(g, [S1], 'ahora');
  assert.equal(r.nuevos.length, 0); assert.equal(r.repetidos, 1); assert.equal(r.salteados, 1);
  assert.equal(S.deGeoJSON({foo: 1}, [], 'ahora').error, 'noGeojson');
});

test('lineaSectores cuenta solo los que quedan para revisar', () => {
  assert.equal(S.lineaSectores([]), '');
  assert.equal(S.lineaSectores([{estado: 'revisar'}]), ' 1 sector para revisar.');
  assert.equal(S.lineaSectores([{estado: 'revisar'}, {estado: 'revisar'}, {estado: 'revisado'}]), ' 2 sectores para revisar.');
});

test('superficieTexto: hectáreas desde 0,1 ha; debajo, metros cuadrados', () => {
  assert.equal(S.superficieTexto(2.4), '2,4 ha');
  assert.equal(S.superficieTexto(0.1), '0,1 ha');
  assert.equal(S.superficieTexto(0.0015), '15 m²');
});

test('valoresEnPoligono devuelve los píxeles del sector (lo usan el NDVI y las clases)', () => {
  const v = S.valoresEnPoligono(G, pol(-64, -63.998));
  assert.equal(v.length, 4); assert.equal(v.filter(Number.isFinite).length, 3);
  assert.equal(S.valoresEnPoligono(G, pol(-63.9, -63.8)).length, 0);
  assert.deepEqual(S.ndviEnPoligono(G, pol(-64, -63.998), 0.25), {mediana: 0.5, fraccionBajo: 0, validos: 3});
});
