// Pruebas de la lógica de la pantalla del kit (web/kit-logica.js).
// Correr con: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const K = require('../web/kit-logica.js');

const L = (t) => ({temp_suelo_c: t, agua_raw: 400, luz_raw: 500, temp_aire_c: 30, hum_aire_pct: 40, semaforo: 'verde'});

test('estable con 5 lecturas que varían menos de 0,3 °C', () =>
  assert.equal(K.estaEstable([L(50), L(50.1), L(50.2), L(50.1), L(50)]), true));

test('no estable con menos de 5 lecturas', () =>
  assert.equal(K.estaEstable([L(50), L(50), L(50), L(50)]), false));

test('no guarda si no se estabiliza', () => {
  let e = K.elegirBandeja(K.crearEstado(), 'A');
  for (const t of [40, 42, 44, 46, 48, 50]) e = K.registrarLectura(e, L(t), new Date(2026, 10, 15, 14, 31));
  assert.equal(e.bandejas.A, null);
  assert.equal(e.activa, 'A');
  assert.ok(K.progresoEstabilidad(e.buffer) < 1);
});

test('guarda sola al estabilizarse', () => {
  let e = K.elegirBandeja(K.crearEstado(), 'A');
  for (const t of [52, 52.1, 52, 51.9, 52]) e = K.registrarLectura(e, L(t), new Date(2026, 10, 15, 14, 31));
  assert.equal(e.bandejas.A.lectura.temp_suelo_c, 52);
  assert.equal(e.bandejas.A.hora, '14:31');
  assert.equal(e.bandejas.A.origen, 'vivo');
  assert.equal(e.activa, null);
});

test('elegir de nuevo la misma bandeja la vuelve a medir', () => {
  let e = K.guardarGrabada(K.crearEstado(), 'B', L(31), new Date());
  e = K.elegirBandeja(e, 'B');
  assert.equal(e.bandejas.B, null);
  assert.equal(e.activa, 'B');
});

test('frase de cierre con A y C', () => {
  const b = {A: {lectura: L(52)}, B: null, C: {lectura: L(33)}};
  assert.match(K.fraseCierre(b, 700), /19 °C más caliente que el cubierto/);
  assert.match(K.fraseCierre(b, 700), /satélite no lo ve/);
});

test('frase de cierre suma salitre si B supera el umbral', () => {
  const b = {A: {lectura: L(52)}, B: {lectura: {...L(31), agua_raw: 880}}, C: {lectura: L(33)}};
  assert.match(K.fraseCierre(b, 700), /posible salitre/);
});

test('frase de cierre honesta si casi no hay diferencia', () =>
  assert.match(K.fraseCierre({A: {lectura: L(33.4)}, B: null, C: {lectura: L(33)}}, 700), /casi lo mismo/));

test('sin A o sin C no hay frase', () =>
  assert.equal(K.fraseCierre({A: {lectura: L(52)}, B: null, C: null}, 700), null));

test('lectura grabada y umbral por defecto', () => {
  const demo = {meta: {umbrales: null}, bandejas: {A_pelada_seca: [L(50), L(52)], B_salitrosa: [], C_rastrojo: []}};
  assert.equal(K.lecturaGrabada(demo, 'A').temp_suelo_c, 52);
  assert.equal(K.lecturaGrabada(demo, 'B'), null);
  assert.equal(K.umbralSalitre(demo), 700);
  assert.equal(K.umbralSalitre({meta: {umbrales: {conductividad_salitre_raw: 650}}}), 650);
});

test('zona por parámetro, con valor por defecto', () => {
  const v = ['zona_1_riego_salitre', 'zona_2_secano_este'];
  assert.equal(K.zonaDesdeParametro('zona_1_riego_salitre', v), 'zona_1_riego_salitre');
  assert.equal(K.zonaDesdeParametro('cualquiera', v), 'zona_2_secano_este');
  assert.equal(K.zonaDesdeParametro(null, v), 'zona_2_secano_este');
});

test('teclas en mayúscula o minúscula', () => {
  assert.equal(K.letraDesdeTecla('a'), 'A');
  assert.equal(K.letraDesdeTecla('C'), 'C');
  assert.equal(K.letraDesdeTecla('r'), 'R');
  assert.equal(K.letraDesdeTecla('x'), null);
});

test('aire del satélite para el mes', () => {
  const clima = {zonas: {z: {nombre: 'Secano', periodos: {normal: {meses: [...Array(12)].map((_, i) => ({mes: i + 1, tmax_c: 20 + i}))}}}}};
  assert.deepEqual(K.aireSatelite(clima, 'z', 11), {tmax_c: 30, nombreZona: 'Secano'});
  assert.equal(K.aireSatelite(clima, 'otra', 11), null);
});
