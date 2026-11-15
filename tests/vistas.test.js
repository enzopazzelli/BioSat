// Pruebas de las vistas de la app (D-31): Inicio y Reporte en web/index.html, y la página de hoy
// conservada como vista detallada en web/completo.html.
// Diseño: docs/superpowers/specs/2026-11-15-app-celular-y-reporte-design.md (4.1, 4.2, 4.6 y 4.6 bis).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WEB = path.join(__dirname, '..', 'web');
const leer = (f) => fs.readFileSync(path.join(WEB, f), 'utf8');
const index = leer('index.html'), completo = leer('completo.html'), app = leer('app.js');
const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const idsIndex = ids(index), idsCompleto = ids(completo);

// Cada '#id' entre comillas, o $('#id…'), que usa app.js.
// Se ignoran los colores ('#ffffff') y los elementos que crea el propio app.js (id="…" dentro de sus plantillas).
const creados = new Set([...app.matchAll(/id="([A-Za-z][\w-]*)"/g)].map(m => m[1]));
const usados = new Set([...app.matchAll(/['"`]#([A-Za-z][\w-]*)['"`]/g), ...app.matchAll(/\$\('#([A-Za-z][\w-]*)/g)]
  .map(m => m[1]).filter(id => !/^[0-9a-fA-F]{3,8}$/.test(id) && !creados.has(id)));

test('index.html tiene las vistas Inicio y Reporte', () => {
  assert.ok(idsIndex.has('vista-inicio'));
  assert.ok(idsIndex.has('vista-reporte'));
});

test('cada id que usa app.js existe en index.html', () => {
  const faltan = [...usados].filter(id => !idsIndex.has(id));
  assert.deepEqual(faltan, []);
});

test('cada id que usa app.js existe en completo.html, salvo los del Inicio y el Reporte nuevos', () => {
  const soloNuevas = new Set([...idsIndex].filter(id => !idsCompleto.has(id)));
  const faltan = [...usados].filter(id => !idsCompleto.has(id) && !soloNuevas.has(id));
  assert.deepEqual(faltan, []);
});

test('completo.html conserva la página de hoy y tiene cómo volver al Inicio', () => {
  for (const id of ['tu-campo', 'calendario', 'comparar', 'simulador', 'antes-de-decidir']) assert.ok(idsCompleto.has(id), id);
  assert.match(completo, /href="index\.html"/);
  assert.match(completo, /data-pagina="completo"/);
});

test('el Reporte de index.html enlaza a la vista detallada', () => {
  assert.match(index, /href="completo\.html"/);
});

test('las dos páginas cargan la lógica del Inicio antes que app.js', () => {
  for (const html of [index, completo]) {
    const a = html.indexOf('inicio-logica.js'), b = html.indexOf('app.js');
    assert.ok(a > 0 && a < b);
  }
});

test('los colores del semáforo existen en claro y en oscuro', () => {
  const css = leer('estilos.css');
  const oscuro = css.slice(css.indexOf('prefers-color-scheme: dark'));
  for (const t of ['--sem-bien', '--sem-atencion', '--sem-cuidado', '--sem-tinta']) {
    assert.match(css, new RegExp(t + ':'), t);
    assert.match(oscuro, new RegExp(t + ':'), t + ' en oscuro');
  }
});

test('el Inicio tiene todos sus elementos', () => {
  for (const id of ['inicioBanda', 'inicioNivel', 'inicioRazon', 'inicioAccion', 'inicioRotacion', 'inicioSiembra',
    'inicioPelados', 'inicioTira', 'inicioValidacion', 'btnSonda', 'btnWhatsapp', 'irReporte', 'btnCambiarInicio']) {
    assert.ok(idsIndex.has(id), id);
  }
});

test('las rotaciones adaptadas conservan el mes de siembra (para la próxima siembra)', () => {
  assert.match(app, /siembra:\s*x\.siembra_mes/);
});

test('app.js conecta los botones del Inicio: sonda, WhatsApp y el aviso sin conexión', () => {
  assert.match(app, /closest\('#btnSonda'\)/);
  assert.match(app, /closest\('#btnWhatsapp'\)/);
  assert.match(app, /wa\.me\/\?text=/);
  assert.match(app, /navigator\.share/);
  assert.match(app, /sondaNoDisponible/);
  assert.match(app, /sinConexion/);
});

test('app.js muestra el error de la sonda en lenguaje simple, no el mensaje técnico', () => {
  assert.match(app, /TEXTOS\.sondaError/);
  assert.doesNotMatch(app, /No se pudo conectar la sonda: ' \+ err\.message/);
});

test('al imprimir sale solo el Reporte, sin el Inicio ni los botones', () => {
  const css = leer('estilos.css'), print = css.slice(css.indexOf('@media print'));
  assert.ok(css.includes('@media print'));
  assert.match(print, /#vista-inicio/);
  assert.match(print, /#vista-reporte/);
  assert.match(print, /\.rep-acciones/);
});

test('app.js conecta Guardar PDF y Compartir, y escribe las 7 conclusiones', () => {
  assert.match(app, /closest\('#btnPdf'\)/);
  assert.match(app, /window\.print\(\)/);
  assert.match(app, /closest\('#btnCompartir'\)/);
  assert.match(app, /clipboard\.writeText/);
  for (let i = 1; i <= 7; i++) assert.ok(idsIndex.has('concl-' + i), 'concl-' + i);
  assert.match(app, /function renderConclusiones/);
});

test('las dos páginas describen los datos reales (D-30), no los textos viejos', () => {
  for (const [nombre, html] of [['index', index], ['completo', completo]]) {
    assert.doesNotMatch(html, /AIZAL V4 · grilla de 500 m/, nombre);
    assert.doesNotMatch(html, /Pendiente hasta que se carguen: suelo/, nombre);
    assert.doesNotMatch(html, /hasta que Vale cargue las validadas/, nombre);
    assert.match(html, /SoilGrids/, nombre);
  }
  assert.doesNotMatch(app, /todavía son un borrador a validar con productores del sur/);
});

test('index.html tiene la tarjeta del pronóstico en el Inicio y en el Reporte', () => {
  assert.ok(idsIndex.has('inicioPronostico'));
  assert.ok(idsIndex.has('repPronostico'));
  assert.match(index, /pronostico-logica\.js/);
});
