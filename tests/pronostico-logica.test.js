// Pruebas de la lógica del pronóstico de Meteomatics (web/pronostico-logica.js): días vigentes,
// resumen de la semana y fecha local.
// Diseño: docs/superpowers/specs/2026-11-15-inicio-pc-y-meteomatics-design.md (B) y D-34.
// Los datos son el pronóstico real de la Zona 2 bajado el 14/11/2026, copiado acá a propósito:
// data/meteomatics_santiago_zonas.json se renueva todos los días y estas pruebas no pueden depender de él.
//
// Convención de Meteomatics (docs de la API, "Interval parameters"): los intervalos son "right-bounded".
// precip_24h:mm fechado el 16/11 00:00 UTC es la lluvia del 15/11 00 UTC al 16/11 00 UTC, o sea del día 15/11.
// Por eso cada fila del JSON describe el día ANTERIOR a su fecha. wind_speed_10m:ms es instantáneo
// (00 UTC = 21 h de Argentina) y no sirve para el día; solo se usa el promedio de 24 h si viene.
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

test('un valor de 24 h fechado el 16/11 00 UTC describe el 15/11 (intervalos hacia atrás)', () => {
  const r = P.resumen([dia('2026-11-16', 31.2, 20.3, 7, 0, 0, 1)], '2026-11-15');
  assert.equal(r.n, 1);
  assert.equal(r.dias[0].fecha, '2026-11-15');
  assert.equal(r.dias[0].lluvia, 7);
});

test('Zona 2 el 15/11: 6 días vigentes (15 al 20/11), 52 mm (26 el mar 17/11) y 5 noches con hoja mojada', () => {
  const r = P.resumen(Z2_14NOV, '2026-11-15');
  assert.equal(r.vigente, true);
  assert.equal(r.n, 6);
  assert.equal(Math.round(r.lluviaTotal), 52);
  assert.equal(r.diaMasLluvia.fecha, '2026-11-17');
  assert.equal(Math.round(r.diaMasLluvia.mm), 26);
  assert.equal(r.diasCalor, 0);
  assert.equal(r.diasHelada, 0);
  assert.equal(r.diasHojaMojada, 5);
});

test('los 136 mm del pronóstico del 14/11 son de ese día: el 15/11 ya no cuentan', () => {
  const r = P.resumen(Z2_14NOV, '2026-11-15');
  assert.ok(r.dias.every(d => d.lluvia !== 136.06));
  assert.equal(P.resumen(Z2_14NOV, '2026-11-14').diaMasLluvia.mm, 136.06);
  assert.equal(P.resumen(Z2_14NOV, '2026-11-14').diaMasLluvia.fecha, '2026-11-14');
});

test('cada día vigente trae fecha, máxima, mínima, lluvia, helada y hoja mojada', () => {
  const d = P.resumen(Z2_14NOV, '2026-11-15').dias[0];
  assert.deepEqual(d, {fecha: '2026-11-15', tmax: 31.2, tmin: 20.3, lluvia: 0, helada: false, hojaMojada: false, vientoKmh: null});
});

test('el 13/11 todavía cuenta: 8 días y uno de más de 38 °C (41,8 °C)', () => {
  const r = P.resumen(Z2_14NOV, '2026-11-13');
  assert.equal(r.n, 8);
  assert.equal(r.diasCalor, 1);
});

test('el 21/11 el pronóstico bajado el 14/11 está vencido', () => {
  const r = P.resumen(Z2_14NOV, '2026-11-21');
  assert.equal(r.vigente, false);
  assert.equal(r.n, 0);
});

test('sin pronóstico, no está vigente y no rompe', () => {
  assert.equal(P.resumen(undefined, '2026-11-15').vigente, false);
  assert.equal(P.resumen([], '2026-11-15').vigente, false);
  assert.equal(P.resumen(null, '2026-11-15').n, 0);
});

test('-999 y null son "sin dato": no se suman ni se cuentan', () => {
  const r = P.resumen([dia('2026-11-16', 30, 20, -999, 0, 0, 1), dia('2026-11-17', 30, 20, 10, 0, 0, 1)], '2026-11-15');
  assert.equal(r.lluviaTotal, 10);
  assert.equal(r.dias[0].lluvia, null);
});

test('si ningún día trae lluvia, el total es null (no 0)', () => {
  const r = P.resumen([dia('2026-11-16', 30, 20, -999, 0, 0, 1), dia('2026-11-17', 30, 20, null, 0, 0, 1)], '2026-11-15');
  assert.equal(r.lluviaTotal, null);
  assert.equal(r.diaMasLluvia, null);
});

test('el viento instantáneo (wind_speed_10m, 21 h) no se usa para "pulverizar": sin promedio, no hay dato', () => {
  const r = P.resumen(Z2_14NOV, '2026-11-15');
  assert.ok(r.dias.every(d => d.vientoKmh === null));
  assert.equal(r.diasVientoBajo, 0);
});

test('con el promedio de 24 h: 4,2 m/s son 15,12 km/h y no cuenta como bajo; 4,1 m/s son 14,76 km/h y sí', () => {
  const conMedia = (fecha, ms) => ({fecha: `${fecha}T00:00:00Z`, 'wind_speed_mean_10m_24h:ms': ms});
  const r = P.resumen([conMedia('2026-11-16', 4.2), conMedia('2026-11-17', 4.1)], '2026-11-15');
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
  assert.equal(P.TEXTOS.hoja, '{n} noches con hoja mojada (favorece hongos)');
});

test('máxima de hoy para la pantalla del kit: la del día de hoy, no la del archivo fechado hoy', () => {
  assert.equal(P.maximaDeHoy(P.resumen(Z2_14NOV, '2026-11-15'), '2026-11-15'), 31.2);
  assert.equal(P.maximaDeHoy(P.resumen(Z2_14NOV, '2026-11-21'), '2026-11-21'), null);
  assert.equal(P.maximaDeHoy(P.resumen([dia('2026-11-17', 30, 20, 0, 0, 0, 1)], '2026-11-15'), '2026-11-15'), null);
  assert.equal(P.maximaDeHoy(P.resumen([dia('2026-11-16', -999, 20, 0, 0, 0, 1)], '2026-11-15'), '2026-11-15'), null);
  assert.equal(P.TEXTOS.kitHoy, 'Pronóstico para hoy (Meteomatics, 9 km): máxima {t} °C.');
});

test('hayViento dice si hay promedio de viento: sin dato, la tarjeta no puede decir "0 días con viento bajo"', () => {
  assert.equal(P.resumen(Z2_14NOV, '2026-11-15').hayViento, false);
  assert.equal(P.resumen([{fecha: '2026-11-16T00:00:00Z', 'wind_speed_mean_10m_24h:ms': 2}], '2026-11-15').hayViento, true);
  assert.equal(P.TEXTOS.criterioCalor, 'Más de 38 °C es un criterio del equipo.');
});

test('los días de la semana y el "Hoy" salen de TEXTOS (para el inglés, D-35)', () => {
  const dias = P.TEXTOS.diasSemana;
  assert.deepEqual(dias, ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']);
  assert.equal(P.TEXTOS.hoy, 'Hoy');
  try {
    P.TEXTOS.diasSemana = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    assert.equal(P.fechaCorta('2026-11-15'), 'Sun 15/11');
  } finally { P.TEXTOS.diasSemana = dias; }
});
