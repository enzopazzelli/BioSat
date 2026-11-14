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

// ---- Arreglos de la revisión final: frases honestas y una por paso (2 a 5) ----

test('fraseMejorRotacion no dice "lo que elegiste" cuando los temas son los de siempre', () => {
  assert.equal(F.fraseMejorRotacion('Puente verde regulado', true),
    'Con lo que más suele importar (agua y suelo), la primera opción es «Puente verde regulado».');
  assert.equal(F.fraseMejorRotacion('Puente verde regulado', false), 'Para lo que elegiste, la primera opción es «Puente verde regulado».');
  assert.equal(F.fraseMejorRotacion('', true), null);
});

test('fraseCalorMas cuenta cuánto pesa un grado más (paso 4)', () => {
  assert.equal(F.fraseCalorMas('Quimilí', 1, 14, 20), 'Con 1 °C más, los días de más de 40 °C en Quimilí pasarían de 14 a 20 por año.');
  assert.equal(F.fraseCalorMas('Quimilí', 1.5, 14, 25), 'Con 1,5 °C más, los días de más de 40 °C en Quimilí pasarían de 14 a 25 por año.');
  assert.equal(F.fraseCalorMas('Quimilí', 0.5, 14.2, 14.4), 'Con 0,5 °C más, los días de más de 40 °C en Quimilí casi no cambiarían: unos 14 por año.');
});

test('fraseCalorMas devuelve null si falta un dato', () => {
  assert.equal(F.fraseCalorMas('', 1, 14, 20), null);
  assert.equal(F.fraseCalorMas('Quimilí', 0, 14, 20), null);       // sin grados de más no hay nada que contar
  assert.equal(F.fraseCalorMas('Quimilí', 1, null, 20), null);
  assert.equal(F.fraseCalorMas('Quimilí', 1, 14, NaN), null);
});

test('fraseAntesDeDecidir cuenta cuántas cosas hay que revisar (paso 5)', () => {
  assert.equal(F.fraseAntesDeDecidir('Colchón de rastrojo', 9), 'Si elegís «Colchón de rastrojo», son 9 cosas para revisar con tu agrónomo antes de decidir.');
  assert.equal(F.fraseAntesDeDecidir('Colchón de rastrojo', 1), 'Si elegís «Colchón de rastrojo», es 1 cosa para revisar con tu agrónomo antes de decidir.');
  assert.equal(F.fraseAntesDeDecidir('', 9), null);
  assert.equal(F.fraseAntesDeDecidir('X', 0), null);
  assert.equal(F.fraseAntesDeDecidir('X', null), null);
});
