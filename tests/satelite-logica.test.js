// Pruebas del satélite del lote (web/satelite-logica.js, D-40): rótulo de Landsat y comparación dron contra satélite.
// Diseño: docs/superpowers/specs/2026-11-15-satelite-del-lote-design.md
const test = require('node:test');
const assert = require('node:assert/strict');
const SL = require('../web/satelite-logica.js');

test('el rótulo del visor dice la resolución real de la imagen de la zona', () => {
  assert.ok(Math.abs(SL.metrosPorPixelZona([-64.57, -28.03, -63.77, -27.43], 640) - 123) < 1);
  assert.equal(SL.rotuloResolucion(123.4), 'Landsat · unos 120 m por píxel en este visor (original de 30 m)');
  assert.equal(SL.rotuloResolucion(31), 'Landsat · unos 30 m por píxel en este visor (original de 30 m)');
});

// Dron de 4 × 2 y satélite de 2 × 1 sobre el mismo recuadro. Celda izquierda: dron [0,5 0,5 / 0,5 NaN], satélite 0,4.
// Celda derecha: dron [NaN NaN / NaN 0] (menos de la mitad válida: no cuenta), satélite 0,1.
const RD = [[-28.002, -64], [-28, -63.996]], RS = [-64, -28.002, -63.996, -28];
const DRON = {valores: Float32Array.from([0.5, 0.5, NaN, NaN, 0.5, NaN, NaN, 0]), ancho: 4, alto: 2, recuadro: RD};
const SAT = {valores: [0.4, 0.1], ancho: 2, alto: 1, recuadro: RS};

test('compararNdvi usa solo las celdas con al menos la mitad del dron válida', () => {
  const c = SL.compararNdvi(DRON, SAT);
  assert.ok(Math.abs(c.dron - 0.5) < 1e-6); assert.ok(Math.abs(c.sat - 0.4) < 1e-6); assert.equal(c.celdas, 1);
  assert.equal(SL.compararNdvi({...DRON, valores: new Float32Array(8).fill(NaN)}, SAT), null);
  assert.equal(SL.compararNdvi(DRON, {...SAT, valores: [null, null]}), null);
});

test('solapan', () => {
  assert.equal(SL.solapan(RD, RS), true);
  assert.equal(SL.solapan(RD, [-63, -27, -62.9, -26.9]), false);
});

test('lineaComparacion dice la fuente, la resolución, la fecha y los días al vuelo', () => {
  const c = {dron: 0.5, sat: 0.4, celdas: 1}, f = {nombre: 'Sentinel-2', resolucion_m: 10, fecha: '2026-11-01', dias_al_vuelo: -2};
  assert.equal(SL.lineaComparacion(c, f, '2026-11-03'), 'En la misma superficie: NDVI mediano 0,50 con el dron y 0,40 con Sentinel-2 (10 m, 01/11, 2 días antes del vuelo).');
  assert.match(SL.lineaComparacion(c, {...f, dias_al_vuelo: 3}, '2026-11-03'), /3 días después del vuelo\)\.$/);
  assert.match(SL.lineaComparacion(c, {...f, dias_al_vuelo: 0}, '2026-11-03'), /el mismo día del vuelo\)\.$/);
  assert.match(SL.lineaComparacion(c, {...f, dias_al_vuelo: -1}, '2026-11-03'), /1 día antes del vuelo\)\.$/);
  assert.match(SL.lineaComparacion(c, {...f, dias_al_vuelo: null}, null), /\(10 m, pasada del 01\/11\)\.$/);
});

test('con el vuelo conocido solo por el mes, la línea dice "en el mes del vuelo" sin días', () => {
  const c = {dron: 0.42, sat: 0.38, celdas: 50}, f = {nombre: 'Sentinel-2', resolucion_m: 10, fecha: '2026-07-13', dias_al_vuelo: null};
  assert.match(SL.lineaComparacion(c, f, '2026-07'), /\(10 m, pasada del 13\/07, en el mes del vuelo\)\.$/);
});
