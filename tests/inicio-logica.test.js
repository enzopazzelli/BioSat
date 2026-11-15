// Pruebas de la lógica del Inicio (web/inicio-logica.js): semáforo de la zona,
// próxima siembra, meses de suelo pelado y texto de WhatsApp.
// Diseño: docs/superpowers/specs/2026-11-15-app-celular-y-reporte-design.md (4.3 a 4.8).
// Los casos de la Zona 5 usan datos reales: clima 2021-2025 de NASA POWER y lotes pelados de Landsat 2021-2025.
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../web/inicio-logica.js');

test('Zona 5 en noviembre da ATENCIÓN por agua, calor y suelo pelado', () => {
  const s = L.semaforoZona(10, {falta: 92, d35: 8, helada: 0}, 0.382);
  assert.equal(s.nivel, 1);
  assert.deepEqual(s.senales.filter(x => x.nivel > 0).map(x => x.id).sort(), ['d35', 'falta', 'pelado']);
  assert.match(s.razon, /90/);
  assert.ok(!/undefined|NaN/.test(s.razon + s.accion));
});

test('Zona 5 en octubre da CUIDADO (falta 131 mm, 53 % de lotes pelados)', () => {
  const s = L.semaforoZona(9, {falta: 131, d35: 4, helada: 0}, 0.525);
  assert.equal(s.nivel, 2);
  assert.equal(s.accion, L.TEXTOS.accion.falta);
});

test('Zona 5 en abril da BIEN y la acción invita a planificar', () => {
  const s = L.semaforoZona(3, {falta: 35, d35: 0, helada: 0}, 0);
  assert.equal(s.nivel, 0);
  assert.equal(s.accion, L.TEXTOS.accion.bien);
});

test('la helada de julio sube el nivel aunque no falte agua', () => {
  const s = L.semaforoZona(6, {falta: 40, d35: 0, helada: 8}, 0.14);
  assert.equal(s.nivel, 2);
  assert.equal(s.accion, L.TEXTOS.accion.helada);
});

test('sin fracción de suelo pelado, la señal se omite y no hay huecos', () => {
  const s = L.semaforoZona(10, {falta: 20, d35: 0, helada: 0}, null);
  assert.equal(s.nivel, 0);
  assert.ok(!s.senales.some(x => x.id === 'pelado'));
  assert.ok(!/undefined|NaN/.test(s.razon + s.accion));
});

test('un dato de clima que falta no rompe el semáforo', () => {
  const s = L.semaforoZona(10, {falta: null, d35: 12, helada: undefined}, 0.1);
  assert.equal(s.nivel, 2);
  assert.deepEqual(s.senales.map(x => x.id).sort(), ['d35', 'pelado']);
});

test('la próxima siembra es circular e incluye el mes actual', () => {
  const sec = [{cultivo: 'Pastura', siembra_mes: 11}, {cultivo: 'Verdeo', siembra_mes: 3}];
  assert.deepEqual(L.proximaSiembra(sec, 10), {cultivo: 'Pastura', mes: 11});   // noviembre
  assert.deepEqual(L.proximaSiembra(sec, 11), {cultivo: 'Verdeo', mes: 3});     // diciembre → marzo
  assert.equal(L.proximaSiembra([], 0), null);
  assert.equal(L.proximaSiembra([{cultivo: 'Monte', siembra_mes: null}], 0), null);
});

test('meses pelados cuenta las D del calendario', () => {
  assert.equal(L.mesesPelados('CCCCCRRRDDCC'), 2);
  assert.equal(L.mesesPelados(''), 0);
});

test('el texto de WhatsApp está completo y sin huecos', () => {
  const t = L.textoWhatsApp({zona: 'Sur serrano y salinas', mes: 'noviembre', nivelTexto: 'ATENCIÓN',
    razonCorta: 'falta agua', rotacion: 'Verdeo de invierno', siembraMes: 'marzo', enlace: 'https://x/web/'});
  assert.match(t, /Sur serrano y salinas/);
  assert.match(t, /https:\/\/x\/web\//);
  assert.ok(!/undefined|\{|\}/.test(t));
});

test('el texto de WhatsApp sin próxima siembra no deja huecos', () => {
  const t = L.textoWhatsApp({zona: 'Zona', mes: 'mayo', nivelTexto: 'BIEN', razonCorta: '', rotacion: 'Tu rotación de hoy',
    siembraMes: null, enlace: 'https://x/'});
  assert.ok(!/undefined|null|\{|\}|\(\)/.test(t));
});

test('razón corta para WhatsApp: hasta 2 señales en atención o cuidado', () => {
  const s = L.semaforoZona(9, {falta: 131, d35: 4, helada: 0}, 0.525);
  assert.equal(L.razonCorta(s.senales), 'falta agua y lotes sin cobertura activa');
  assert.equal(L.razonCorta(L.semaforoZona(3, {falta: 35, d35: 0, helada: 0}, 0).senales), '');
  assert.equal(L.razonCorta(undefined), '');
});

test('hay un aviso para cuando no hay conexión', () => {
  assert.match(L.TEXTOS.sinConexion, /conexión/);
});

test('la razón del semáforo une las señales con TEXTOS.y y formatea con TEXTOS.locale (para el inglés, D-35)', () => {
  const y = L.TEXTOS.y, loc = L.TEXTOS.locale;
  assert.equal(y, ' y ');
  assert.equal(loc, 'es-AR');
  try {
    L.TEXTOS.y = ' and '; L.TEXTOS.locale = 'en-US';
    assert.match(L.semaforoZona(10, {falta: 92, d35: 8, helada: 0}, 0.382).razon, / and /);
  } finally { L.TEXTOS.y = y; L.TEXTOS.locale = loc; }
});

// D-33: el satélite ve poca vegetación verde (NDVI bajo), que puede ser suelo descubierto o rastrojo seco.
// Texto agronómico de Vale (docs/superpowers/plans/2026-11-15-propuesta-mejoras-agronomicas-d33.md, punto 1).
test('D-33: la señal satelital dice "sin cobertura vegetal activa", no "suelo pelado"', () => {
  const s = L.semaforoZona(10, {falta: 0, d35: 0, helada: 0}, 0.843);   // Zona 2, noviembre: CUIDADO
  assert.equal(s.nivel, 2);
  assert.equal(s.razon, 'Unos 8 de cada 10 lotes de la zona están sin cobertura vegetal activa (suelo descubierto o rastrojo seco).');
  assert.doesNotMatch(s.razon, /pelado/);
  assert.equal(s.accion, 'Si tu lote está descubierto, conviene cubrirlo: un rastrojo o una cobertura lo protegen del sol y del viento.');
  assert.equal(L.razonCorta(s.senales), 'lotes sin cobertura activa');
});

test('D-33: sensibilidad al umbral, calculada con los datos del mes (sin números fijos)', () => {
  const dz = {fraccion_pelado_umbral_020: [0.112], fraccion_pelado: [0.843], fraccion_pelado_umbral_030: [0.923]};
  const t = L.sensibilidadPelado(dz, 0, [0.2, 0.25, 0.3], 'noviembre');
  assert.equal(t, 'Cuánto depende del umbral: en noviembre, con un NDVI menor a 0,20 se ven sin cobertura activa 1 de cada 10 lotes; con 0,25 (el que usa la app), 8; con 0,30, 9. No hay datos de campo para elegir el umbral.');
  assert.equal(L.sensibilidadPelado({fraccion_pelado: [0.5]}, 0, [0.2, 0.25, 0.3], 'enero'), null, 'falta un umbral: no se escribe');
  assert.equal(L.sensibilidadPelado(dz, 0, null, 'enero'), null, 'sin los umbrales del archivo: no se escribe');
  assert.equal(L.sensibilidadPelado(undefined, 0, [0.2, 0.25, 0.3], 'enero'), null);
});

// D-37 (hallazgo de la hoja de ruta de Vale): la señal es lluvia − ET0, una referencia climática,
// no lo que pide un cultivo concreto (eso sería ET0 × Kc, que la app usa para cada rotación).
test('la señal de agua dice lluvia contra la evaporación de referencia (ET0), no "lo que pide el cultivo"', () => {
  const s = L.semaforoZona(10, {falta: 110, d35: 0, helada: 0}, null);
  assert.equal(s.razon, 'La lluvia típica queda unos 110 mm por debajo de la evaporación de referencia (ET0).');
  assert.doesNotMatch(s.razon, /pide el cultivo/);
});
