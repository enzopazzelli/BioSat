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
