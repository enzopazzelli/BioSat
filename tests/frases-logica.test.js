// Pruebas de las frases simples que resumen cada paso (web/frases-logica.js).
// Regla: salen de los datos de la app; si falta un dato, devuelven null y la frase no se muestra.
const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../web/frases-logica.js');

test('fraseCalor cuenta cómo cambiaron los días de más de 40 °C', () => {
  assert.equal(F.fraseCalor('Quimilí', 13.6, 24.4), 'En Quimilí, los días de más de 40 °C pasaron de 14 a 24 por año.');
  assert.equal(F.fraseCalor('La Banda', 16.2, 30.6), 'En La Banda, los días de más de 40 °C pasaron de 16 a 31 por año.');
});

test('fraseCalor no dice "pasaron de 14 a 14" cuando no cambió', () => {
  assert.equal(F.fraseCalor('Campo Gallo', 17.1, 17.4), 'En Campo Gallo, hay unos 17 días por año de más de 40 °C.');
});

test('fraseCalor acepta cero días', () => {
  assert.equal(F.fraseCalor('Ojo de Agua', 0, 0), 'En Ojo de Agua, hay unos 0 días por año de más de 40 °C.');
});

test('fraseCalor devuelve null si falta el pueblo o algún número', () => {
  assert.equal(F.fraseCalor('', 10, 12), null);
  assert.equal(F.fraseCalor(undefined, 10, 12), null);
  assert.equal(F.fraseCalor('Quimilí', null, 12), null);
  assert.equal(F.fraseCalor('Quimilí', 10, undefined), null);
  assert.equal(F.fraseCalor('Quimilí', NaN, 12), null);
  assert.equal(F.fraseCalor('Quimilí', 10, Infinity), null);
});

test('fraseMejorRotacion nombra la primera opción', () => {
  assert.equal(F.fraseMejorRotacion('Colchón de rastrojo: Soja + Maíz tardío'),
    'Para lo que elegiste, la primera opción es «Colchón de rastrojo: Soja + Maíz tardío».');
});

test('fraseMejorRotacion devuelve null si no hay nombre', () => {
  assert.equal(F.fraseMejorRotacion(''), null);
  assert.equal(F.fraseMejorRotacion('   '), null);
  assert.equal(F.fraseMejorRotacion(null), null);
  assert.equal(F.fraseMejorRotacion(undefined), null);
});

test('los textos están en un objeto con claves, listos para traducir', () => {
  assert.ok(F.TEXTOS && typeof F.TEXTOS === 'object');
  for (const k of ['calor', 'calorIgual', 'mejor']) assert.equal(typeof F.TEXTOS[k], 'string', k);
});
