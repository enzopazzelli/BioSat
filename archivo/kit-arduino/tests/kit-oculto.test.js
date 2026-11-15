// D-43: el kit Arduino no se muestra en la app mientras se termina de armar.
// Un solo interruptor: la regla [data-solo-kit]{display:none!important} de web/estilos.css.
// Para volver a mostrarlo: docs/reglas-y-bitacora.md, D-43.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const EN = require('../web/textos-en.js');

const WEB = path.join(__dirname, '..', 'web');
const leer = (f) => fs.readFileSync(path.join(WEB, f), 'utf8');
const index = leer('index.html'), completo = leer('completo.html'), css = leer('estilos.css');

const etiqueta = (html, patron, nombre) => {
  const m = html.match(patron);
  assert.ok(m, `no se encontró ${nombre}`);
  return m[0];
};

test('el interruptor del kit está en la hoja de estilos', () => {
  assert.match(css, /\[data-solo-kit\]\s*\{\s*display:\s*none\s*!important\s*;?\s*\}/);
});

test('lo del kit está marcado para ocultarse en el Inicio, el Reporte y la vista detallada', () => {
  assert.match(etiqueta(index, /<button[^>]*id="btnSonda"[^>]*>/, 'el botón Medir con la sonda'), /data-solo-kit/);
  assert.match(etiqueta(index, /<section[^>]*id="sonda"[^>]*>/, 'la sección 5 del Reporte'), /data-solo-kit/);
  assert.match(etiqueta(index, /<a[^>]*href="#sonda"[^>]*>/, 'el chip de la sonda'), /data-solo-kit/);
  assert.match(etiqueta(completo, /<article[^>]*panel-sensor[^>]*>/, 'el panel del sensor de la vista detallada'), /data-solo-kit/);
});

test('el Inicio no habla de medir con la sonda fuera de lo que se oculta', () => {
  const nota = etiqueta(index, /<p[^>]*id="semaforoMetodo"[^>]*>[\s\S]*?<\/p>/, 'la nota del semáforo');
  const sinKit = nota.replace(/<span data-solo-kit>[\s\S]*?<\/span>/g, '');
  assert.doesNotMatch(sinKit, /sonda|antes de medir/i);
});

test('la barra del Inicio no deja un hueco cuando falta un botón', () => {
  const regla = etiqueta(css, /\.ini-botones\{[^}]*\}/, 'la regla de .ini-botones');
  assert.doesNotMatch(regla, /repeat\(2/, 'con 2 columnas fijas, WhatsApp quedaría en la mitad');
  assert.match(regla, /grid-auto-flow:\s*column/);
});

test('las secciones visibles del Reporte se numeran sin saltos, en castellano y en inglés', () => {
  const ocultas = new Set([...index.matchAll(/<a\s[^>]*>/g)].map(m => m[0])
    .filter(a => /data-solo-kit/.test(a) && /data-i18n="repChip(\d)"/.test(a))
    .map(a => a.match(/repChip(\d)/)[1]));
  assert.deepEqual([...ocultas], ['5']);
  for (const tipo of ['repChip', 'repSec']) {
    const visibles = [...index.matchAll(new RegExp(`data-i18n="${tipo}(\\d)"[^>]*>(\\d) · `, 'g'))]
      .filter(m => !ocultas.has(m[1]));
    assert.equal(visibles.length, 6, tipo);
    assert.deepEqual(visibles.map(m => +m[2]), [1, 2, 3, 4, 5, 6], `${tipo} en castellano`);
    assert.deepEqual(visibles.map(m => +EN.html[tipo + m[1]].split(' · ')[0]), [1, 2, 3, 4, 5, 6], `${tipo} en inglés`);
  }
});
