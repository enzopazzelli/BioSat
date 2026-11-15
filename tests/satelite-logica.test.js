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
