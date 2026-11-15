// Que el sketch, la tabla de pines y el esquema cuenten lo mismo.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..', 'arduino');
const pines = JSON.parse(fs.readFileSync(path.join(RAIZ, 'esquema', 'pines.json'), 'utf8'));
const sketch = fs.readFileSync(path.join(RAIZ, 'biosat_estacion_campo', 'biosat_estacion_campo.ino'), 'utf8');

const definesDelSketch = () => {
  const out = {};
  for (const m of sketch.matchAll(/^#define\s+(PIN_\w+)\s+(\w+)/gm)) out[m[1]] = m[2];
  return out;
};
// "D3" -> "3", "A0" -> "A0" (así se escribe en el sketch)
const comoEnSketch = (pin) => pin.startsWith('D') ? pin.slice(1) : pin;

test('cada pin de la tabla con define coincide con el #define del sketch', () => {
  const d = definesDelSketch();
  const conDefine = pines.conexiones.filter(c => c.define);
  assert.equal(conDefine.length, 15, 'LEDs, buzzer, DHT, 3 analógicos, alimentación de la sonda y 6 del LCD');
  for (const c of conDefine) assert.equal(d[c.define], comoEnSketch(c.pin), `${c.define} debería ser ${c.pin}`);
});

test('el sketch no define pines que la tabla no conoce', () => {
  const enTabla = new Set(pines.conexiones.map(c => c.define).filter(Boolean));
  for (const nombre of Object.keys(definesDelSketch())) assert.ok(enTabla.has(nombre), `${nombre} no está en pines.json`);
});

test('ningún pin de señal se usa dos veces', () => {
  const usados = pines.conexiones.map(c => c.pin).filter(p => p && !['5V', 'GND'].includes(p));
  assert.equal(new Set(usados).size, usados.length);
});

test('todos los pines existen en un Arduino Uno', () => {
  for (const c of pines.conexiones.filter(x => x.pin)) assert.match(c.pin, /^(5V|GND|D([2-9]|1[0-3])|A[0-5])$/, c.pin);
});

test('el pin que mide el LM35 y los que miden humedad y luz son analógicos', () => {
  for (const nombre of ['PIN_AGUA', 'PIN_LM35', 'PIN_LDR']) {
    const c = pines.conexiones.find(x => x.define === nombre);
    assert.match(c.pin, /^A[0-3]$/, nombre);
  }
});

test('el LCD va en paralelo a 4 bits y la sonda se alimenta desde un pin digital', () => {
  assert.match(sketch, /LiquidCrystal\s+lcd\(PIN_LCD_RS,\s*PIN_LCD_E,\s*PIN_LCD_D4,\s*PIN_LCD_D5,\s*PIN_LCD_D6,\s*PIN_LCD_D7\)/);
  const rw = pines.conexiones.find(c => c.componente === 'lcd' && c.terminal === '5 RW');
  assert.equal(rw.pin, 'GND', 'RW tiene que ir a GND');
});

test('cada terminal de cada componente tiene una conexión', () => {
  for (const comp of pines.componentes) {
    for (const t of comp.terminales) {
      const conectado = pines.conexiones.some(c => (c.componente === comp.id && c.terminal === t) ||
        (c.enlace && c.enlace.componente === comp.id && c.enlace.terminal === t));
      assert.ok(conectado, `${comp.id} · ${t}`);
    }
  }
});

test('la velocidad del puerto del sketch es la del lector (9600)', () => {
  assert.match(sketch, /Serial\.begin\(9600\)/);
  assert.equal(require('../arduino/lector-web-serial.js').BAUDIOS, 9600);
});

test('el sketch manda las 7 claves del contrato §6', () => {
  for (const k of ['t', 'agua_raw', 'temp_suelo_c', 'temp_aire_c', 'hum_aire_pct', 'luz_raw', 'semaforo']) {
    assert.ok(sketch.includes(`\\"${k}\\"`), `falta la clave ${k}`);
  }
});

// La línea que arma mandarLinea() del sketch, reconstruida con sus mismos fragmentos de texto
// y valores de ejemplo, tiene que ser un JSON que el lector entienda.
test('la línea del sketch es JSON válido y el lector la entiende', () => {
  const L = require('../arduino/lector-web-serial.js');
  // se reemplazan las 3 llamadas a imprimirNumero por sus valores, en el orden en que aparecen
  const cuerpo = sketch.match(/void mandarLinea\([^)]*\)\s*\{([\s\S]*?)\n\}/)[1];
  assert.equal([...cuerpo.matchAll(/imprimirNumero/g)].length, 3);
  const armar = (suelo, aire, hum) => {
    let i = 0;
    const vals = [suelo, aire, hum];
    const lectura = {t: 12345, agua: 512, luz: 870, semaforo: 'rojo'};
    let texto = '';
    for (const m of cuerpo.matchAll(/Serial\.print(?:ln)?\(([^;]*)\);|imprimirNumero\([^;]*\);/g)) {
      if (m[0].startsWith('imprimirNumero')) { texto += vals[i++]; continue; }
      const arg = m[1].trim();
      const f = arg.match(/^F\("((?:[^"\\]|\\.)*)"\)$/);
      if (f) texto += f[1].replace(/\\"/g, '"');
      else if (arg === 'millis()') texto += lectura.t;
      else if (arg === 'agua') texto += lectura.agua;
      else if (arg === 'luz') texto += lectura.luz;
      else if (arg === 'NOMBRE_SEMAFORO[s]') texto += lectura.semaforo;
      else throw new Error('print desconocido: ' + arg);
    }
    return texto;
  };
  const normal = armar('41.2', '33.0', '28');
  assert.deepEqual(L.parsearLinea(normal), {t: 12345, agua_raw: 512, temp_suelo_c: 41.2, temp_aire_c: 33, hum_aire_pct: 28, luz_raw: 870, semaforo: 'rojo'});
  const sinDht = armar('41.2', 'null', 'null');
  const l = L.parsearLinea(sinDht);
  assert.equal(l.temp_aire_c, null);
  assert.equal(l.hum_aire_pct, null);
  assert.equal(l.temp_suelo_c, 41.2);
  assert.ok(normal.length < 150, 'la línea tiene que ser corta: ' + normal.length);
});

test('el esquema SVG y la tabla de conexiones están al día con pines.json', () => {
  const G = require('../arduino/esquema/generar-esquema.js');
  const p = G.leerPines();
  const leer = (n) => fs.readFileSync(path.join(RAIZ, 'esquema', n), 'utf8').replace(/\r\n/g, '\n');   // git en Windows pasa los archivos a CRLF
  assert.equal(leer(G.ARCHIVOS.svg), G.construirSvg(p), 'corré: node arduino/esquema/generar-esquema.js');
  assert.equal(leer(G.ARCHIVOS.tabla), G.construirTabla(p), 'corré: node arduino/esquema/generar-esquema.js');
});

// Variante con un sensor de humedad de tierra resistivo (horquilla), en lugar del de nivel de agua (15/11).
const RUTA_HUMEDAD = path.join(RAIZ, 'biosat_estacion_humedad_suelo', 'biosat_estacion_humedad_suelo.ino');
test('la variante con sensor de humedad de tierra usa los mismos pines que el programa original', () => {
  const variante = fs.readFileSync(RUTA_HUMEDAD, 'utf8');
  const defs = s => Object.fromEntries([...s.matchAll(/^#define\s+(PIN_\w+)\s+(\w+)/gm)].map(m => [m[1], m[2]]));
  assert.deepEqual(defs(variante), defs(sketch));
});
test('la variante da vuelta la lectura: el sensor resistivo da un número alto con tierra seca', () => {
  const variante = fs.readFileSync(RUTA_HUMEDAD, 'utf8');
  assert.match(variante, /return 1023 - crudo;/);
  assert.match(variante, /Serial\.print\(F\(",\\"agua_raw\\":"\)\)/);   // manda el mismo dato que lee la app
});
