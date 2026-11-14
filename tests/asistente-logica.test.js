// Pruebas de la lógica del asistente de inicio (web/asistente-logica.js).
// Diseño: docs/superpowers/specs/2026-11-14-asistente-y-mapa-design.md
const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../web/asistente-logica.js');

const ZONAS_PRUEBA = {
  zona_1_riego_salitre: {num: 1, lugar: 'La Banda', nombre: 'Área de riego del Río Dulce', riego: true},
  zona_2_secano_este: {num: 2, lugar: 'Quimilí', nombre: 'Secano agrícola del este', riego: false},
  zona_3_monte_semiarido: {num: 3, lugar: 'Campo Gallo', nombre: 'Chaco semiárido norte', riego: false},
  zona_4_bajos_submeridionales: {num: 4, lugar: 'Añatuya', nombre: 'Bajos submeridionales', riego: false},
  zona_5_sur_serrano: {num: 5, lugar: 'Ojo de Agua', nombre: 'Sur serrano y salinas', riego: false}
};

// Almacén de mentira, como localStorage
const almacen = (inicial = {}) => {
  const d = {...inicial};
  return {getItem: k => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, datos: d};
};

test('las respuestas por defecto son la Zona 2 y nada respondido', () => {
  assert.deepEqual(A.respuestasPorDefecto(), {zona: 'zona_2_secano_este', riego: null, ganado: null, maq: null, prio: [], hecho: false});
});

test('normalizar descarta lo inválido y deja lo válido', () => {
  const n = A.normalizar({zona: 'zona_9', riego: 'si', ganado: true, maq: false,
    prio: ['agua', 'agua', 'xx', 'suelo', 'forraje', 'ingreso'], hecho: 'true'}, ZONAS_PRUEBA);
  assert.equal(n.zona, 'zona_2_secano_este');          // zona que no existe → por defecto
  assert.equal(n.riego, null);                         // "si" no es un booleano
  assert.equal(n.ganado, true);
  assert.equal(n.maq, false);
  assert.deepEqual(n.prio, ['agua', 'suelo', 'forraje']);   // sin repetidos, sin desconocidos, máximo 3
  assert.equal(n.hecho, false);                        // solo vale exactamente true
});

test('normalizar acepta una zona válida y hecho verdadero', () => {
  const n = A.normalizar({zona: 'zona_4_bajos_submeridionales', hecho: true}, ZONAS_PRUEBA);
  assert.equal(n.zona, 'zona_4_bajos_submeridionales');
  assert.equal(n.hecho, true);
});

test('leer devuelve lo guardado', () => {
  const guardado = JSON.stringify({v: 1, zona: 'zona_3_monte_semiarido', riego: false, ganado: true, maq: null, prio: ['salitre'], hecho: true});
  const l = A.leer(almacen({[A.CLAVE]: guardado}), ZONAS_PRUEBA);
  assert.deepEqual(l, {zona: 'zona_3_monte_semiarido', riego: false, ganado: true, maq: null, prio: ['salitre'], hecho: true});
});

test('leer usa los valores por defecto si el almacén falla o los datos están rotos', () => {
  const defecto = A.respuestasPorDefecto();
  assert.deepEqual(A.leer(null, ZONAS_PRUEBA), defecto);
  assert.deepEqual(A.leer({getItem() { throw new Error('bloqueado'); }}, ZONAS_PRUEBA), defecto);
  assert.deepEqual(A.leer(almacen({[A.CLAVE]: 'esto no es json'}), ZONAS_PRUEBA), defecto);
  assert.deepEqual(A.leer(almacen({[A.CLAVE]: '{"v":2,"zona":"zona_1_riego_salitre","hecho":true}'}), ZONAS_PRUEBA), defecto);
  assert.deepEqual(A.leer(almacen({[A.CLAVE]: 'null'}), ZONAS_PRUEBA), defecto);
});

test('guardar escribe {v:1,…} en la clave y avisa si falló', () => {
  const a = almacen();
  const r = {zona: 'zona_5_sur_serrano', riego: null, ganado: false, maq: true, prio: ['agua'], hecho: true};
  assert.equal(A.guardar(a, r), true);
  assert.equal(A.CLAVE, 'biosat.asistente.v1');
  assert.deepEqual(JSON.parse(a.datos[A.CLAVE]), {v: 1, ...r});
  assert.equal(A.guardar({setItem() { throw new Error('lleno'); }}, r), false);   // no propaga el error
  assert.equal(A.guardar(null, r), false);
});

test('alternarPrio agrega, quita, no pasa de 3 y no modifica la lista original', () => {
  const original = ['agua'];
  assert.deepEqual(A.alternarPrio(original, 'suelo'), ['agua', 'suelo']);
  assert.deepEqual(original, ['agua']);
  assert.deepEqual(A.alternarPrio(['agua', 'suelo'], 'agua'), ['suelo']);
  assert.deepEqual(A.alternarPrio(['agua', 'suelo', 'forraje'], 'salitre'), ['agua', 'suelo', 'forraje']);   // ya hay 3
  assert.deepEqual(A.alternarPrio(['agua', 'suelo', 'forraje'], 'agua'), ['suelo', 'forraje']);              // quitar siempre se puede
  assert.deepEqual(A.alternarPrio(['agua'], 'xx'), ['agua']);                                                // id desconocido
});

test('riegoEfectivo: manda la respuesta; sin responder, la zona', () => {
  assert.equal(A.riegoEfectivo(null, true), true);
  assert.equal(A.riegoEfectivo(null, false), false);
  assert.equal(A.riegoEfectivo(false, true), false);
  assert.equal(A.riegoEfectivo(true, false), true);
});

test('aEstado completa lo que falta con los valores de siempre', () => {
  const e = A.aEstado(A.respuestasPorDefecto(), ZONAS_PRUEBA);
  assert.equal(e.zona, 'zona_2_secano_este');
  assert.equal(e.riego, false);                        // el de la Zona 2
  assert.equal(e.ganado, true);
  assert.equal(e.maq, false);
  assert.deepEqual([...e.prio].sort(), ['agua', 'suelo']);
  assert.ok(e.prio instanceof Set);
});

test('aEstado respeta lo respondido, y el riego de la Zona 1 cuando no se respondió', () => {
  const sinResponder = A.aEstado({...A.respuestasPorDefecto(), zona: 'zona_1_riego_salitre'}, ZONAS_PRUEBA);
  assert.equal(sinResponder.riego, true);
  const respondido = A.aEstado({zona: 'zona_1_riego_salitre', riego: false, ganado: false, maq: true, prio: ['forraje'], hecho: true}, ZONAS_PRUEBA);
  assert.equal(respondido.riego, false);
  assert.equal(respondido.ganado, false);
  assert.equal(respondido.maq, true);
  assert.deepEqual([...respondido.prio], ['forraje']);
});

test('debeAbrir: solo la primera vez, o siempre con ?asistente=1', () => {
  assert.equal(A.debeAbrir({hecho: false}, ''), true);
  assert.equal(A.debeAbrir({hecho: true}, ''), false);
  assert.equal(A.debeAbrir({hecho: true}, '?x=1&asistente=1'), true);
  assert.equal(A.debeAbrir({hecho: true}, '?asistente=0'), false);
});

test('resumen nombra la zona, lo que tenés y lo que te preocupa', () => {
  const r = A.resumen({zona: 'zona_2_secano_este', riego: false, ganado: true, maq: false, prio: ['agua'], hecho: true}, ZONAS_PRUEBA);
  assert.deepEqual(r, {num: 2, pueblo: 'Quimilí', nombre: 'Secano agrícola del este', tiene: ['hacienda'], preocupa: ['agua']});
});
