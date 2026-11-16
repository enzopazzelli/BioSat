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
