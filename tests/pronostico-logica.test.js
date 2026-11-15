// Pruebas de la lógica del pronóstico de Meteomatics (web/pronostico-logica.js): días vigentes,
// resumen de la semana y fecha local.
// Diseño: docs/superpowers/specs/2026-11-15-inicio-pc-y-meteomatics-design.md (B).
// Los datos son el pronóstico real de la Zona 2 bajado el 14/11/2026, copiado acá a propósito:
// data/meteomatics_santiago_zonas.json se renueva todos los días y estas pruebas no pueden depender de él.
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../web/pronostico-logica.js');

const dia = (fecha, tmax, tmin, lluvia, helada, hoja, viento) => ({
  fecha: `${fecha}T00:00:00Z`, 't_max_2m_24h:C': tmax, 't_min_2m_24h:C': tmin, 'precip_24h:mm': lluvia,
  'frost_warning_24h:idx': helada, 'leaf_wetness:idx': hoja, 'wind_speed_10m:ms': viento
});
const Z2_14NOV = [
  dia('2026-11-14', 41.8, 22.5, 0.0, 0, 0, 4.8),
  dia('2026-11-15', 35.3, 20.5, 136.06, 0, 1, 0.6),
  dia('2026-11-16', 31.2, 20.3, 0.0, 0, 0, 2.2),
  dia('2026-11-17', 33.6, 21.9, 1.59, 0, 1, 2.4),
  dia('2026-11-18', 29.5, 21.8, 26.13, 0, 1, 1.9),
  dia('2026-11-19', 27.4, 20.4, 18.83, 0, 1, 1.2),
  dia('2026-11-20', 30.3, 21.4, 5.1, 0, 1, 5.3),
  dia('2026-11-21', 26.8, 17.3, 0.45, 0, 1, 2.6)
];

test('Zona 2 el 15/11: 7 días vigentes, 188 mm (136 el domingo), 6 con hoja mojada y 6 con viento bajo', () => {
  const r = P.resumen(Z2_14NOV, '2026-11-15');
  assert.equal(r.vigente, true);
  assert.equal(r.n, 7);
  assert.equal(Math.round(r.lluviaTotal), 188);
  assert.equal(r.diaMasLluvia.fecha, '2026-11-15');
  assert.equal(Math.round(r.diaMasLluvia.mm), 136);
  assert.equal(r.diasCalor, 0);
  assert.equal(r.diasHelada, 0);
  assert.equal(r.diasHojaMojada, 6);
  assert.equal(r.diasVientoBajo, 6);
});

test('cada día vigente trae fecha corta, máxima, mínima, lluvia, helada, hoja mojada y viento en km/h', () => {
  const d = P.resumen(Z2_14NOV, '2026-11-15').dias[0];
  assert.equal(d.fecha, '2026-11-15');
  assert.equal(d.tmax, 35.3);
  assert.equal(d.tmin, 20.5);
  assert.equal(d.lluvia, 136.06);
  assert.equal(d.helada, false);
  assert.equal(d.hojaMojada, true);
  assert.equal(Math.round(d.vientoKmh * 100) / 100, 2.16);
});

test('el 14/11 todavía cuenta: 8 días y uno de más de 38 °C', () => {
  const r = P.resumen(Z2_14NOV, '2026-11-14');
  assert.equal(r.n, 8);
  assert.equal(r.diasCalor, 1);
});

test('el 22/11 el pronóstico está vencido', () => {
  const r = P.resumen(Z2_14NOV, '2026-11-22');
  assert.equal(r.vigente, false);
  assert.equal(r.n, 0);
});

test('sin pronóstico, no está vigente y no rompe', () => {
  assert.equal(P.resumen(undefined, '2026-11-15').vigente, false);
  assert.equal(P.resumen([], '2026-11-15').vigente, false);
  assert.equal(P.resumen(null, '2026-11-15').n, 0);
});

test('-999 y null son "sin dato": no se suman ni se cuentan', () => {
  const r = P.resumen([dia('2026-11-15', 30, 20, -999, 0, 0, null), dia('2026-11-16', 30, 20, 10, 0, 0, 2)], '2026-11-15');
  assert.equal(r.lluviaTotal, 10);
  assert.equal(r.dias[0].lluvia, null);
  assert.equal(r.dias[0].vientoKmh, null);
  assert.equal(r.diasVientoBajo, 1);
});

test('si ningún día trae lluvia, el total es null (no 0)', () => {
  const r = P.resumen([dia('2026-11-15', 30, 20, -999, 0, 0, 1), dia('2026-11-16', 30, 20, null, 0, 0, 1)], '2026-11-15');
  assert.equal(r.lluviaTotal, null);
  assert.equal(r.diaMasLluvia, null);
});

test('viento: 4,2 m/s son 15,12 km/h y no cuenta como bajo; 4,1 m/s son 14,76 km/h y sí', () => {
  const r = P.resumen([dia('2026-11-15', 30, 20, 0, 0, 0, 4.2), dia('2026-11-16', 30, 20, 0, 0, 0, 4.1)], '2026-11-15');
  assert.equal(Math.round(r.dias[0].vientoKmh * 100) / 100, 15.12);
  assert.equal(r.diasVientoBajo, 1);
});

test('la fecha de hoy es la local: a las 22:30 del 15/11 sigue siendo el 15/11', () => {
  assert.equal(P.hoyLocalISO(new Date(2026, 10, 15, 22, 30)), '2026-11-15');
  assert.equal(P.hoyLocalISO(new Date(2026, 0, 5, 0, 5)), '2026-01-05');
});

test('fecha corta para la tarjeta: "dom 15/11"', () => {
  assert.equal(P.fechaCorta('2026-11-15'), 'dom 15/11');
  assert.equal(P.fechaCorta('2026-11-18'), 'mié 18/11');
});

test('umbrales y textos fijados en el diseño', () => {
  assert.deepEqual(P.UMBRALES, {calorC: 38, vientoKmh: 15});
  assert.equal(P.TEXTOS.fuente, 'Pronóstico de Meteomatics (modelo europeo ECMWF, 9 km), bajado el {fecha}.');
  assert.equal(P.TEXTOS.vencido, 'Pronóstico vencido (bajado el {fecha}). Se actualiza todos los días.');
  assert.equal(P.TEXTOS.criterio, 'Más de 38 °C y viento de menos de 15 km/h son criterios del equipo.');
});

test('máxima de hoy para la pantalla del kit: solo si el pronóstico trae el día de hoy', () => {
  assert.equal(P.maximaDeHoy(P.resumen(Z2_14NOV, '2026-11-15'), '2026-11-15'), 35.3);
  assert.equal(P.maximaDeHoy(P.resumen(Z2_14NOV, '2026-11-22'), '2026-11-22'), null);
  assert.equal(P.maximaDeHoy(P.resumen([dia('2026-11-16', 30, 20, 0, 0, 0, 1)], '2026-11-15'), '2026-11-15'), null);
  assert.equal(P.maximaDeHoy(P.resumen([dia('2026-11-15', -999, 20, 0, 0, 0, 1)], '2026-11-15'), '2026-11-15'), null);
  assert.equal(P.TEXTOS.kitHoy, 'Pronóstico para hoy (Meteomatics, 9 km): máxima {t} °C.');
});
