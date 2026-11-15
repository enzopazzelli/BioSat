// Pruebas de la lógica del idioma (web/idioma-logica.js): solo español e inglés (D-35).
// Diseño: docs/superpowers/specs/2026-11-15-idioma-es-en-design.md (A).
const test = require('node:test');
const assert = require('node:assert/strict');
const I = require('../web/idioma-logica.js');

test('el idioma sale de ?lang= primero, después de lo guardado y, si no, es español', () => {
  assert.equal(I.elegirIdioma('?lang=en', 'es'), 'en');
  assert.equal(I.elegirIdioma('?zona=x&lang=es', 'en'), 'es');
  assert.equal(I.elegirIdioma('', 'en'), 'en');
  assert.equal(I.elegirIdioma('', null), 'es');
});

test('solo hay español e inglés: cualquier otro valor abre en español', () => {
  assert.equal(I.elegirIdioma('', 'fr'), 'es');
  assert.equal(I.elegirIdioma('?lang=pt', 'en'), 'en');   // un ?lang inválido no pisa lo guardado
  assert.equal(I.elegirIdioma('?lang=pt', null), 'es');
});

test('locale de los números: en-US o es-AR', () => {
  assert.equal(I.locale('en'), 'en-US');
  assert.equal(I.locale('es'), 'es-AR');
});

test('fusionar: el inglés reemplaza donde existe; lo que falta queda en español; no toca los originales', () => {
  const es = {a: 'hola', b: {c: 'chau', d: 3}, m: ['ene', 'feb']};
  const en = {b: {c: 'bye'}, m: ['Jan'], sobra: 'x'};
  assert.deepEqual(I.fusionar(es, en), {a: 'hola', b: {c: 'bye', d: 3}, m: ['Jan', 'feb']});
  assert.deepEqual(es, {a: 'hola', b: {c: 'chau', d: 3}, m: ['ene', 'feb']});
});

test('ida y vuelta: aplicar inglés y después español deja todo igual, con los mismos objetos', () => {
  const o = {a: 'hola', b: {c: 'chau'}, m: ['ene', 'feb']};
  const b = o.b, m = o.m, es = I.copiaProfunda(o);
  I.aplicarEnLugar(o, I.fusionar(es, {a: 'hi', b: {c: 'bye'}, m: ['Jan', 'Feb']}));
  assert.equal(o.a, 'hi');
  assert.equal(o.m[1], 'Feb');
  I.aplicarEnLugar(o, es);
  assert.deepEqual(o, es);
  assert.equal(o.b, b);
  assert.equal(o.m, m);
});

test('clavesSobrantes encuentra las traducciones de claves que no existen en español', () => {
  assert.deepEqual(I.clavesSobrantes({a: 'x', b: {c: 'y'}}, {a: 'X', b: {z: 'Z'}, q: 'Q'}), ['b.z', 'q']);
  assert.deepEqual(I.clavesSobrantes({a: 'x', m: ['1', '2']}, {a: 'X', m: ['uno']}), []);
});
