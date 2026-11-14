// Pruebas de los datos del mapa (data/santiago_mapa.json), generados por scripts/generar_mapa_santiago.py.
// Contrato: docs/contratos-de-datos.md §9.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RUTA = path.join(__dirname, '..', 'data', 'santiago_mapa.json');
const mapa = JSON.parse(fs.readFileSync(RUTA, 'utf8'));
const deps = mapa.departamentos;

// "M1,2L3,4Z M5,6L7,8Z" → [[[1,2],[3,4]], [[5,6],[7,8]]]
function anillos(d) {
  return d.split('M').filter(Boolean).map(s => s.replace(/Z\s*$/, '').split('L')
    .map(p => p.trim().split(',').map(Number)));
}
function dentro(x, y, d) {   // punto en polígono, par-impar sobre todos los anillos
  let adentro = false;
  for (const a of anillos(d)) {
    for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
      const [xi, yi] = a[i], [xj, yj] = a[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) adentro = !adentro;
    }
  }
  return adentro;
}

test('hay 27 departamentos con nombre único y zona de 1 a 5', () => {
  assert.equal(deps.length, 27);
  assert.equal(new Set(deps.map(d => d.nombre)).size, 27);
  for (const d of deps) assert.ok(Number.isInteger(d.zona) && d.zona >= 1 && d.zona <= 5, `${d.nombre}: zona ${d.zona}`);
});

test('cada zona tiene al menos un departamento', () => {
  for (let z = 1; z <= 5; z++) assert.ok(deps.some(d => d.zona === z), `la zona ${z} no tiene departamentos`);
});

test('el pueblo de cada zona cae sobre un departamento de su mismo color', () => {
  for (let z = 1; z <= 5; z++) {
    const p = mapa.puntos[String(z)];
    assert.ok(p && p.x > 0 && p.y > 0 && p.x < mapa.viewBox[0] && p.y < mapa.viewBox[1], `punto de la zona ${z} fuera del mapa`);
    const dueño = deps.filter(d => dentro(p.x, p.y, d.d));
    assert.equal(dueño.length, 1, `el punto de la zona ${z} tiene que caer en un solo departamento`);
    assert.equal(dueño[0].zona, z, `el punto de la zona ${z} cae en ${dueño[0].nombre}, que es de la zona ${dueño[0].zona}`);
  }
});

test('Añatuya (Zona 4) cae sobre General Taboada, que antes figuraba en la Zona 2', () => {
  const p = mapa.puntos['4'];
  const dueño = deps.find(d => dentro(p.x, p.y, d.d));
  assert.equal(dueño.nombre, 'General Taboada');
  assert.equal(dueño.zona, 4);
  assert.equal(dueño.origen, 'punto');
});

test('cada departamento dice de dónde salió su zona: 5 por punto, 15 por lista y 7 por cercanía', () => {
  const cuenta = o => deps.filter(d => d.origen === o).length;
  for (const d of deps) assert.ok(['punto', 'lista', 'cercana'].includes(d.origen), `${d.nombre}: ${d.origen}`);
  assert.equal(cuenta('punto'), 5);
  assert.equal(cuenta('lista'), 15);
  assert.equal(cuenta('cercana'), 7);
});

test('los 7 departamentos que van por cercanía quedan en la zona esperada', () => {
  const esperado = {'Jiménez': 1, 'Loreto': 1, 'Río Hondo': 1, 'Avellaneda': 4, 'Salavina': 4, 'Sarmiento': 4, 'Atamisqui': 5};
  const real = Object.fromEntries(deps.filter(d => d.origen === 'cercana').map(d => [d.nombre, d.zona]));
  assert.deepEqual(real, esperado);
});

test('los contornos son trazos válidos dentro del cuadro del mapa', () => {
  for (const d of deps) {
    const a = anillos(d.d);
    assert.ok(a.length >= 1, d.nombre);
    for (const anillo of a) {
      assert.ok(anillo.length >= 3, `${d.nombre}: un anillo con menos de 3 puntos`);
      for (const [x, y] of anillo) {
        assert.ok(Number.isFinite(x) && Number.isFinite(y), `${d.nombre}: coordenada inválida`);
        assert.ok(x >= 0 && y >= 0 && x <= mapa.viewBox[0] && y <= mapa.viewBox[1], `${d.nombre}: fuera del cuadro`);
      }
    }
  }
});

test('el archivo es chico (menos de 80 KB) y cita la fuente y la licencia', () => {
  assert.ok(fs.statSync(RUTA).size < 80 * 1024, `pesa ${fs.statSync(RUTA).size} bytes`);
  const m = JSON.stringify(mapa.meta);
  assert.match(m, /IGN|Instituto Geogr[aá]fico Nacional/);
  assert.match(m, /geoBoundaries/);
  assert.match(m, /CC BY 3\.0 IGO/);
});
