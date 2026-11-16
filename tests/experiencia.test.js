// D-47: la página de Vale (web/experiencia/, D-46) tiene que encontrar sus imágenes Landsat en GitHub Pages.
// El código armaba las rutas en su carpeta images/, que se subió con una sola imagen: las demás daban 404.
// Las imágenes viven en data/imagenes/ (las genera ia_desmonte), igual que para la app.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const EXP = path.join(__dirname, '..', 'web', 'experiencia');
const leer = (f) => fs.readFileSync(path.join(EXP, f), 'utf8');
const existe = (rel) => fs.existsSync(path.resolve(EXP, rel.split('?')[0]));

test('cada ruta de imagen Landsat de las zonas existe, para las 5 zonas, verano e invierno, RGB y NDVI', () => {
  const app = leer('app.js');
  const prefijos = [...new Set([...app.matchAll(/`([^`$]*)z\$\{(?:number|zoneNumber)\}_/g)].map(m => m[1]))];
  assert.ok(prefijos.length >= 1, 'no se encontraron las rutas de las imágenes en app.js');
  const faltan = [];
  for (const pre of prefijos) for (let n = 1; n <= 5; n++) for (const est of ['verano', 'invierno']) for (const tipo of ['rgb', 'ndvi']) {
    const rel = `${pre}z${n}_${est}_${tipo}.png`;
    if (!existe(rel)) faltan.push(rel);
  }
  assert.deepEqual(faltan, []);
});

test('la imagen inicial del encabezado y las del recorte del lote existen', () => {
  const hero = leer('index.html').match(/id="heroSatellite"[^>]*src="([^"]+)"/);
  assert.ok(hero, 'falta la imagen del encabezado');
  assert.ok(existe(hero[1]), hero[1]);
  const lotes = [...leer('repo-lots.js').matchAll(/"(rgb|ndvi)":\s*"([^"]+)"/g)].map(m => m[2]);
  assert.ok(lotes.length >= 4, 'no se encontraron las imágenes del lote');
  assert.deepEqual(lotes.filter(r => !existe(r)), []);
});

// D-48: autocompletar para grabar el video, solo con ?demo=1.
const DEMO = path.join(EXP, 'demo-autocompletar.js');
const cargarDemo = () => require(DEMO);

test('D-48: el autocompletar se activa solo con demo=1 en la dirección', () => {
  const D = cargarDemo();
  assert.equal(D.activo('?demo=1'), true);
  assert.equal(D.activo('?lang=en&demo=1'), true);
  for (const s of ['', '?demo=0', '?demo', '?lang=en']) assert.equal(D.activo(s), false, s);
});

test('D-48: el campo de ejemplo es de la Zona 1 y cae dentro del lote del vuelo real', () => {
  const D = cargarDemo();
  assert.equal(D.CAMPO.zona, 'zona_1_riego_salitre');
  assert.match(leer('app.js'), /const ZONES = \['zona_1_riego_salitre'/);
  assert.equal(D.CAMPO.nombre, 'Lote Capital · Zona 1');
  assert.equal(D.CAMPO.cultivo, '');
  const lote = leer('repo-lots.js').match(/"name":\s*"capital_zona1",\s*"bbox":\s*\[([^\]]+)\]/);
  assert.ok(lote, 'no se encontró el recuadro de capital_zona1');
  const [oeste, sur, este, norte] = lote[1].split(',').map(Number);
  assert.ok(D.CAMPO.lon > oeste && D.CAMPO.lon < este, 'longitud fuera del lote');
  assert.ok(D.CAMPO.lat > sur && D.CAMPO.lat < norte, 'latitud fuera del lote');
});

test('D-48: la observación de ejemplo es del dron y dice qué revisar, no un hallazgo', () => {
  const D = cargarDemo();
  assert.equal(D.OBSERVACION.es.fuente, 'drone');
  assert.equal(D.OBSERVACION.es.sector, 'Norte');
  assert.match(D.OBSERVACION.es.resumen, /recorrer|revisar/i);
  assert.match(D.OBSERVACION.en.resumen, /walk|check/i);
});

test('D-48: castellano e inglés tienen las mismas claves', () => {
  const D = cargarDemo();
  for (const obj of [D.OBSERVACION, D.TEXTOS]) assert.deepEqual(Object.keys(obj.es).sort(), Object.keys(obj.en).sort());
  assert.equal(typeof D.CAMPO.notas.es, 'string');
  assert.equal(typeof D.CAMPO.notas.en, 'string');
  assert.match(D.CAMPO.notas.es, /ejemplo/i);
  assert.match(D.CAMPO.notas.en, /sample|example/i);
});

test('D-48: index.html carga el autocompletar después de app.js y no trae el botón escrito', () => {
  const html = leer('index.html');
  const app = html.indexOf('<script src="app.js" defer></script>');
  const demo = html.indexOf('<script src="demo-autocompletar.js" defer></script>');
  assert.ok(app !== -1 && demo > app, 'demo-autocompletar.js tiene que cargarse después de app.js');
  assert.doesNotMatch(html, /demoAutocompletar/, 'el botón solo lo crea el script, con ?demo=1');
});
