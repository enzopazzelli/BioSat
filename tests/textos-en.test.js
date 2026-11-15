// Pruebas del diccionario en inglés (web/textos-en.js, D-35): sin huecos ni sobras.
// Solo hay dos idiomas: español (los textos de siempre, en su lugar) e inglés (este diccionario).
// Diseño: docs/superpowers/specs/2026-11-15-idioma-es-en-design.md (B).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const EN = require('../web/textos-en.js');
const I = require('../web/idioma-logica.js');

const WEB = path.join(__dirname, '..', 'web');
const leer = f => fs.readFileSync(path.join(WEB, f), 'utf8');
const PAGINAS = ['index.html', 'kit.html', 'campo.html', 'completo.html'];
const app = leer('app.js');

// Carga un script de navegador en un sandbox y devuelve lo que dejó en window.
function cargarEnVm(archivo, window = {}) {
  const ctx = {window, document: {addEventListener() {}, querySelector: () => null, querySelectorAll: () => []},
    location: {search: ''}, console};
  vm.createContext(ctx);
  vm.runInContext(leer(archivo), ctx);
  return ctx.window;
}

test('cada data-i18n de las páginas tiene su inglés, y cada clave html se usa en alguna página', () => {
  const usadas = new Set();
  for (const p of PAGINAS) {
    const html = leer(p);
    for (const m of html.matchAll(/data-i18n="([\w-]+)"/g)) usadas.add(m[1]);
    for (const m of html.matchAll(/data-i18n-attr="[\w-]+:([\w-]+)"/g)) usadas.add(m[1]);
  }
  const faltan = [...usadas].filter(k => !(k in EN.html));
  const sobran = Object.keys(EN.html).filter(k => !usadas.has(k));
  assert.deepEqual(faltan, [], 'claves sin traducción');
  assert.deepEqual(sobran, [], 'traducciones que ninguna página usa');
});

test('los módulos en inglés no traducen claves que no existen en español', () => {
  const es = {
    inicio: require('../web/inicio-logica.js').TEXTOS,
    pronostico: require('../web/pronostico-logica.js').TEXTOS,
    frases: require('../web/frases-logica.js').TEXTOS
  };
  for (const [nombre, obj] of Object.entries(es)) {
    if (EN.modulos[nombre]) assert.deepEqual(I.clavesSobrantes(obj, EN.modulos[nombre]), [], nombre);
  }
  assert.ok(EN.modulos.inicio && EN.modulos.pronostico, 'el Inicio y el pronóstico tienen que estar traducidos');
});

test('los textos de app.js traducidos existen en app.js (TEXTOS_INICIO, TEXTOS_REPORTE, TEXTOS_CAMPO, ZONAS)', () => {
  for (const nombre of ['appInicio', 'appReporte', 'appCampo']) {
    for (const k of Object.keys(EN.modulos[nombre] || {})) assert.match(app, new RegExp(`[{,\\s]${k}\\s*:`), `${nombre}.${k}`);
  }
  for (const [z, v] of Object.entries(EN.modulos.zonas || {})) {
    assert.match(app, new RegExp(`${z}:\\{`), z);
    assert.deepEqual(Object.keys(v).filter(k => !['nombre', 'problema'].includes(k)), [], `${z}: solo nombre y problema`);
  }
  assert.equal(EN.modulos.meses.length, 12);
  assert.equal(EN.modulos.mesesCortos.length, 12);
  assert.deepEqual(Object.keys(EN.modulos.estado).sort(), ['C', 'D', 'R', 'V']);
});

test('las 15 rotaciones tienen nombre en inglés y existen en los datos', () => {
  const datos = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'rotaciones_santiago.json'), 'utf8'));
  const ids = Object.values(datos.zonas).flatMap(z => z.rotaciones.map(r => r.id));
  assert.deepEqual(Object.keys(EN.rotaciones).sort(), [...ids].sort());
});

test('ningún texto en inglés está vacío', () => {
  const vacios = [];
  (function recorrer(x, ruta) {
    if (typeof x === 'string') { if (!x.trim()) vacios.push(ruta); return; }
    if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) recorrer(v, `${ruta}.${k}`);
  })(EN, 'EN');
  assert.deepEqual(vacios, []);
});

test('el asistente y el kit en inglés no traducen claves que no existen en español', () => {
  if (EN.modulos.asistente) {
    const w = cargarEnVm('asistente.js', {AsistenteLogica: {}});
    assert.deepEqual(I.clavesSobrantes(w.BioSatAsistente.TEXTOS, EN.modulos.asistente), [], 'asistente');
  }
  assert.ok(EN.modulos.kit, 'falta modulos.kit');
  assert.deepEqual(I.clavesSobrantes(require('../web/kit-logica.js').TEXTOS, EN.modulos.kit), [], 'kit');
  assert.equal(EN.modulos.kit.meses.length, 12);
});

test('el asistente está traducido entero (comun y las 4 preguntas)', () => {
  assert.ok(EN.modulos.asistente, 'falta modulos.asistente');
  assert.deepEqual(Object.keys(EN.modulos.asistente).sort(), ['comun', 'p1', 'p2', 'p3', 'p4']);
});

test('D-33: en inglés, la señal satelital dice "without active green cover", no "bare soil"', () => {
  const ini = EN.modulos.inicio;
  assert.match(ini.senal.pelado, /without active green cover \(bare soil or dry crop residue\)/);
  assert.doesNotMatch(ini.razonCorta.pelado, /bare soil/);
  assert.match(ini.accion.pelado, /bare/);
  assert.doesNotMatch(EN.modulos.frases.mesesTranquilos, /bare soil/);
});
