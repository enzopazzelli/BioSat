// D-44: el kit Arduino se archivó (archivo/kit-arduino/) y el dron toma su lugar en el Inicio.
// Estas pruebas cuidan que nada de la app vuelva a cargar o enlazar el kit, y que el dron esté donde estaba la sonda.
// Para volver a usar el kit: archivo/kit-arduino/README.md y docs/reglas-y-bitacora.md, D-44.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const EN = require('../web/textos-en.js');

const RAIZ = path.join(__dirname, '..');
const WEB = path.join(RAIZ, 'web');
const leer = (f) => fs.readFileSync(path.join(WEB, f), 'utf8');
const existe = (r) => fs.existsSync(path.join(RAIZ, r));
const index = leer('index.html'), app = leer('app.js');

test('los archivos del kit están en archivo/kit-arduino/ y ya no en la app', () => {
  for (const r of ['arduino', 'web/kit.html', 'web/kit.js', 'web/kit.css', 'web/kit-logica.js', 'web/campo.html',
    'web/campo.css', 'data/arduino_bandejas_demo.json']) assert.ok(!existe(r), `${r} tendría que estar archivado`);
  for (const r of ['archivo/kit-arduino/README.md', 'archivo/kit-arduino/arduino/lector-web-serial.js',
    'archivo/kit-arduino/web/kit.html', 'archivo/kit-arduino/data/arduino_bandejas_demo.json']) assert.ok(existe(r), r);
});

test('ninguna página ni script de la app carga o enlaza el kit', () => {
  const archivos = fs.readdirSync(WEB).filter(f => /\.(html|js|css)$/.test(f) && f !== 'textos-en.js');
  const prohibido = /arduino|lector-web-serial|BioSatArduino|kit\.html|campo\.html|data-solo-kit|btnSonda|semaforoSonda|bandeja/i;
  for (const f of archivos) {
    const sinComentarios = leer(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.doesNotMatch(sinComentarios, prohibido, f);
  }
  assert.doesNotMatch(JSON.stringify(EN), /probe|Arduino|kit screen/i, 'el inglés tampoco habla del kit');
});

test('el Inicio tiene la tarjeta del dron y su botón en el lugar de la sonda', () => {
  for (const id of ['inicioDron', 'inicioDronT', 'inicioDronTitulo', 'inicioDronCifras', 'inicioDronNotas', 'inicioDronLink',
    'btnDron', 'btnDronTxt']) assert.match(index, new RegExp(`id="${id}"`), id);
  const barra = index.slice(index.indexOf('class="ini-botones"'), index.indexOf('id="inicioAviso"'));
  assert.ok(barra.indexOf('id="btnDron"') !== -1 && barra.indexOf('id="btnDron"') < barra.indexOf('id="btnWhatsapp"'),
    'el botón del dron va primero en la barra, donde estaba la sonda');
  // La tarjeta va antes de "Lo que mejor encaja": es el dato de hoy.
  assert.ok(index.indexOf('id="inicioDron"') < index.indexOf('id="inicioMejorT"'));
  assert.match(app, /closest\('#btnDron'\)/);
  assert.match(app, /\$\('#dronArchivo'\)/);
  assert.match(app, /DronLogica\.tarjetaInicio\(/);
});

test('las secciones del Reporte se numeran de 1 a 6 sin saltos, en castellano y en inglés', () => {
  for (const tipo of ['repChip', 'repSec']) {
    const visibles = [...index.matchAll(new RegExp(`data-i18n="${tipo}(\\d)"[^>]*>(\\d) · `, 'g'))];
    assert.deepEqual(visibles.map(m => +m[2]), [1, 2, 3, 4, 5, 6], `${tipo} en castellano`);
    assert.deepEqual(visibles.map(m => +EN.html[tipo + m[1]].split(' · ')[0]), [1, 2, 3, 4, 5, 6], `${tipo} en inglés`);
  }
  assert.doesNotMatch(index, /id="sonda"|href="#sonda"/);
});
