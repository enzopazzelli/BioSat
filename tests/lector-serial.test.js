// Pruebas del lector del Arduino (arduino/lector-web-serial.js): solo la parte sin navegador.
// Contrato: docs/contratos-de-datos.md §6.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../arduino/lector-web-serial.js');

const LINEA = '{"t":12345,"agua_raw":512,"temp_suelo_c":41.2,"temp_aire_c":33.0,"hum_aire_pct":28,"luz_raw":870,"semaforo":"rojo"}';

test('una línea completa del contrato se convierte en lectura', () => {
  assert.deepEqual(L.parsearLinea(LINEA), {
    t: 12345, agua_raw: 512, temp_suelo_c: 41.2, temp_aire_c: 33, hum_aire_pct: 28, luz_raw: 870, semaforo: 'rojo'
  });
});

test('el DHT11 caído manda null y se conserva como null', () => {
  const l = L.parsearLinea('{"t":1,"agua_raw":100,"temp_suelo_c":30.5,"temp_aire_c":null,"hum_aire_pct":null,"luz_raw":500,"semaforo":"verde"}');
  assert.equal(l.temp_aire_c, null);
  assert.equal(l.hum_aire_pct, null);
  assert.equal(l.temp_suelo_c, 30.5);
});

test('texto que no es JSON (mensajes de arranque) se ignora', () => {
  assert.equal(L.parsearLinea('BioSat estacion de campo v1'), null);
  assert.equal(L.parsearLinea(''), null);
  assert.equal(L.parsearLinea('   '), null);
  assert.equal(L.parsearLinea('{"t":1,"agua_raw":'), null);   // línea cortada a la mitad
});

test('un JSON sin ninguna medición conocida se ignora', () => {
  assert.equal(L.parsearLinea('{"hola":"mundo"}'), null);
  assert.equal(L.parsearLinea('[1,2,3]'), null);
  assert.equal(L.parsearLinea('42'), null);
});

test('un valor que no es número (o es NaN) pasa a null en vez de colarse', () => {
  const l = L.parsearLinea('{"t":1,"agua_raw":"alto","temp_suelo_c":"NaN","temp_aire_c":33,"hum_aire_pct":28,"luz_raw":1,"semaforo":"verde"}');
  assert.equal(l.agua_raw, null);
  assert.equal(l.temp_suelo_c, null);
  assert.equal(l.temp_aire_c, 33);
});

test('un semáforo desconocido pasa a null', () => {
  const l = L.parsearLinea('{"t":1,"agua_raw":1,"temp_suelo_c":1,"temp_aire_c":1,"hum_aire_pct":1,"luz_raw":1,"semaforo":"azul"}');
  assert.equal(l.semaforo, null);
});

test('el acumulador junta trozos hasta tener la línea entera', () => {
  const a = L.crearAcumulador();
  assert.deepEqual(a.agregar(LINEA.slice(0, 40)), []);
  assert.deepEqual(a.agregar(LINEA.slice(40, 90)), []);
  const salida = a.agregar(LINEA.slice(90) + '\n');
  assert.equal(salida.length, 1);
  assert.equal(salida[0].temp_suelo_c, 41.2);
});

test('el acumulador separa varias líneas de un mismo trozo y acepta \\r\\n', () => {
  const a = L.crearAcumulador();
  const salida = a.agregar(LINEA + '\r\n' + LINEA.replace('41.2', '42.0') + '\r\n' + LINEA.slice(0, 20));
  assert.equal(salida.length, 2);
  assert.equal(salida[1].temp_suelo_c, 42);
  // lo que quedó cortado se completa en el trozo siguiente
  assert.equal(a.agregar(LINEA.slice(20) + '\n').length, 1);
});

test('el acumulador descarta basura sin newline para no crecer sin límite', () => {
  const a = L.crearAcumulador();
  assert.deepEqual(a.agregar('x'.repeat(5000)), []);
  const salida = a.agregar('\n' + LINEA + '\n');
  assert.equal(salida.length, 1);
});

test('soportado() es falso sin Web Serial', () => {
  assert.equal(L.hayWebSerial({}), false);
  assert.equal(L.hayWebSerial({serial: {}}), true);
});
