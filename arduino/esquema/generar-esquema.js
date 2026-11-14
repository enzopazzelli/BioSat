#!/usr/bin/env node
/* BioSat · genera el esquema de conexiones del kit a partir de arduino/esquema/pines.json.
 *
 *   node arduino/esquema/generar-esquema.js          escribe esquema-conexiones.svg y tabla-de-conexiones.md
 *   node arduino/esquema/generar-esquema.js --check  avisa (código 1) si los archivos quedaron desactualizados
 *
 * Para cambiar un cable: editar pines.json (y el #define del sketch), volver a correr este script.
 * Una prueba (tests/arduino-pines.test.js) revisa que sketch, tabla y esquema cuenten lo mismo.
 */
const fs = require('node:fs');
const path = require('node:path');

const CABLES = {rojo: '#C62828', negro: '#212121', amarillo: '#E0A800', verde: '#2E8B57', azul: '#1F6FB5', naranja: '#E67E22'};
const FUENTE_TEXTO = 'Arial, Helvetica, sans-serif';
const FUENTE_MONO = "Consolas, Menlo, 'Courier New', monospace";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n) => Math.round(n * 10) / 10;

// ------------------------------------------------------------------ Esquema (SVG)
function construirSvg(pines) {
  const X_ARDUINO = 40, ANCHO_ARDUINO = 230, X_BORDE = X_ARDUINO + ANCHO_ARDUINO;   // borde derecho de la placa
  const X_RIEL_5V = 310, X_RIEL_GND = 340;
  const X_CAJA = 560, ANCHO_CAJA = 360, X_TERMINAL = X_CAJA;
  const Y0 = 110, ALTO_ENCABEZADO = 44, ALTO_FILA = 22, SEPARACION = 16;

  // posición de cada terminal
  let y = Y0;
  const cajas = pines.componentes.map(c => {
    const caja = {c, y, alto: ALTO_ENCABEZADO + c.terminales.length * ALTO_FILA + 8};
    caja.filas = {};
    c.terminales.forEach((t, i) => { caja.filas[t] = y + ALTO_ENCABEZADO + i * ALTO_FILA + ALTO_FILA / 2; });
    y += caja.alto + SEPARACION;
    return caja;
  });
  const yFin = y - SEPARACION;
  const caja = (id) => cajas.find(k => k.c.id === id);
  const yTerminal = (con) => caja(con.componente).filas[con.terminal];

  // notas a pie de página
  const notas = [];
  const marca = (con) => {
    if (!con.nota) return '';
    let i = notas.indexOf(con.nota);
    if (i < 0) { notas.push(con.nota); i = notas.length - 1; }
    return ` [${i + 1}]`;
  };

  const partes = [];
  const wire = (puntos, color, ancho = 2) =>
    partes.push(`<polyline points="${puntos.map(p => `${num(p[0])},${num(p[1])}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${ancho}" stroke-linejoin="round" stroke-linecap="round"/>`);
  const punto = (x, yy, color) => partes.push(`<circle cx="${num(x)}" cy="${num(yy)}" r="3.5" fill="${color}"/>`);

  // pines de señal: cada uno queda a la altura de su terminal, así el cable va recto
  const senales = pines.conexiones.filter(c => c.pin && !['5V', 'GND'].includes(c.pin));
  const enRiel = (pin) => pines.conexiones.filter(c => c.pin === pin);
  const yMin = Y0 + 14;

  // cables de señal
  const pinesArduino = [];
  for (const con of senales) {
    const yy = yTerminal(con);
    wire([[X_BORDE, yy], [X_TERMINAL, yy]], CABLES[con.cable] || '#555');
    pinesArduino.push({pin: con.pin, y: yy, define: con.define});
  }

  // rieles de alimentación y tierra
  const y5V = yMin, yGND = yMin + 28;
  for (const [nombre, xRiel, yPin, color] of [['5V', X_RIEL_5V, y5V, CABLES.rojo], ['GND', X_RIEL_GND, yGND, CABLES.negro]]) {
    const cons = enRiel(nombre);
    const yUlt = Math.max(...cons.map(yTerminal));
    wire([[X_BORDE, yPin], [xRiel, yPin], [xRiel, yUlt]], color, 3);
    for (const con of cons) {
      const yy = yTerminal(con);
      wire([[xRiel, yy], [X_TERMINAL, yy]], color);
      punto(xRiel, yy, color);
    }
    pinesArduino.push({pin: nombre, y: yPin});
  }

  // enlaces entre componentes (ej.: cursor del potenciómetro con V0 del LCD)
  const hechos = new Set();
  for (const con of pines.conexiones.filter(c => c.enlace)) {
    const clave = [`${con.componente}.${con.terminal}`, `${con.enlace.componente}.${con.enlace.terminal}`].sort().join('|');
    if (hechos.has(clave)) continue;
    hechos.add(clave);
    const y1 = yTerminal(con);
    const y2 = caja(con.enlace.componente).filas[con.enlace.terminal];
    const xs = X_CAJA + ANCHO_CAJA;
    wire([[xs, y1], [xs + 26, y1], [xs + 26, y2], [xs, y2]], CABLES[con.cable] || '#555');
    punto(xs, y1, CABLES[con.cable] || '#555'); punto(xs, y2, CABLES[con.cable] || '#555');
  }

  // placa Arduino
  const altoPlaca = yFin - Y0 + 40;
  const placa = [
    `<rect x="${X_ARDUINO}" y="${Y0 - 20}" width="${ANCHO_ARDUINO}" height="${altoPlaca}" rx="10" fill="#E6F1F2" stroke="#00797F" stroke-width="2.5"/>`,
    `<text x="${X_ARDUINO + 16}" y="${Y0 + 8}" font-family="${FUENTE_TEXTO}" font-size="18" font-weight="700" fill="#00595E">ARDUINO UNO R3</text>`,
    `<text x="${X_ARDUINO + 16}" y="${Y0 + 28}" font-family="${FUENTE_TEXTO}" font-size="12" fill="#35777B">cable USB a la PC</text>`,
    `<text x="${X_ARDUINO + 16}" y="${yFin - 4}" font-family="${FUENTE_TEXTO}" font-size="12" fill="#35777B">AREF: sin conectar</text>`
  ];
  for (const p of pinesArduino) {
    placa.push(`<text x="${X_BORDE - 12}" y="${num(p.y + 4)}" text-anchor="end" font-family="${FUENTE_MONO}" font-size="14" font-weight="700" fill="#00595E">${esc(p.pin)}</text>`);
    if (p.define) placa.push(`<text x="${X_ARDUINO + 16}" y="${num(p.y + 4)}" font-family="${FUENTE_MONO}" font-size="11" fill="#5B8E91">${esc(p.define)}</text>`);
    placa.push(`<circle cx="${X_BORDE}" cy="${num(p.y)}" r="4" fill="#00797F"/>`);
  }

  // cajas de componentes
  const dibujoCajas = [];
  for (const k of cajas) {
    dibujoCajas.push(`<rect x="${X_CAJA}" y="${k.y}" width="${ANCHO_CAJA}" height="${k.alto}" rx="8" fill="#FFFFFF" stroke="#8A9A9B" stroke-width="1.5"/>`);
    dibujoCajas.push(`<text x="${X_CAJA + 14}" y="${k.y + 19}" font-family="${FUENTE_TEXTO}" font-size="15" font-weight="700" fill="#1B2A2B">${esc(k.c.nombre)}</text>`);
    dibujoCajas.push(`<text x="${X_CAJA + 14}" y="${k.y + 35}" font-family="${FUENTE_TEXTO}" font-size="11.5" fill="#5A6B6C">${esc(k.c.detalle)}</text>`);
    for (const t of k.c.terminales) {
      const yy = k.filas[t];
      const con = pines.conexiones.find(c => c.componente === k.c.id && c.terminal === t);
      const destino = con ? (con.pin || '↔') : '';
      dibujoCajas.push(`<circle cx="${X_TERMINAL}" cy="${num(yy)}" r="4" fill="#FFFFFF" stroke="#455A5B" stroke-width="1.5"/>`);
      dibujoCajas.push(`<text x="${X_CAJA + 14}" y="${num(yy + 4)}" font-family="${FUENTE_TEXTO}" font-size="12.5" fill="#1B2A2B">${esc(t)}${esc(con ? marca(con) : '')}</text>`);
      dibujoCajas.push(`<text x="${X_CAJA + ANCHO_CAJA - 12}" y="${num(yy + 4)}" text-anchor="end" font-family="${FUENTE_MONO}" font-size="12" fill="#5A6B6C">${esc(destino)}</text>`);
    }
  }

  // leyenda y notas
  const xLey = X_ARDUINO, yLey = yFin + 40;
  const leyenda = [`<text x="${xLey}" y="${yLey}" font-family="${FUENTE_TEXTO}" font-size="13" font-weight="700" fill="#1B2A2B">Colores de cable</text>`];
  Object.entries(CABLES).forEach(([n, c], i) => {
    const xx = xLey + i * 110;
    leyenda.push(`<line x1="${xx}" y1="${yLey + 18}" x2="${xx + 26}" y2="${yLey + 18}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`);
    leyenda.push(`<text x="${xx + 32}" y="${yLey + 22}" font-family="${FUENTE_TEXTO}" font-size="12" fill="#1B2A2B">${n}</text>`);
  });
  const textoNotas = notas.map((n, i) => `<text x="${xLey}" y="${yLey + 52 + i * 19}" font-family="${FUENTE_TEXTO}" font-size="12.5" fill="#33494A">[${i + 1}] ${esc(n)}</text>`);
  const yPie = yLey + 52 + notas.length * 19 + 14;
  const alto = yPie + 22;
  const ancho = X_CAJA + ANCHO_CAJA + 60;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}" role="img" aria-label="Esquema de conexiones del kit BioSat">`,
    `<rect width="100%" height="100%" fill="#FFFFFF"/>`,
    `<text x="${X_ARDUINO}" y="40" font-family="${FUENTE_TEXTO}" font-size="24" font-weight="700" fill="#1B2A2B">BioSat · Esquema de conexiones del kit</text>`,
    `<text x="${X_ARDUINO}" y="64" font-family="${FUENTE_TEXTO}" font-size="13" fill="#5A6B6C">${esc(pines.placa)} · ${esc(pines.alimentacion)}</text>`,
    `<text x="${X_ARDUINO}" y="82" font-family="${FUENTE_TEXTO}" font-size="12" fill="#5A6B6C">Cada línea une un pin de la placa con un terminal. Los rieles rojo y negro son 5 V y GND.</text>`,
    ...placa, ...partes, ...dibujoCajas, ...leyenda, ...textoNotas,
    `<text x="${X_ARDUINO}" y="${yPie}" font-family="${FUENTE_TEXTO}" font-size="11" fill="#8A9A9B">Generado desde arduino/esquema/pines.json con node arduino/esquema/generar-esquema.js · no se edita a mano</text>`,
    `</svg>`, ''
  ].join('\n');
}

// ------------------------------------------------------------------ Tabla (Markdown)
function construirTabla(pines) {
  const nombre = (id) => pines.componentes.find(c => c.id === id).nombre;
  const L = [];
  L.push('# Tabla de conexiones del kit', '');
  L.push('> Se genera sola desde [`pines.json`](pines.json) con `node arduino/esquema/generar-esquema.js`. No se edita a mano.', '');
  L.push(`**Placa:** ${pines.placa}. **Alimentación:** ${pines.alimentacion}`, '');
  L.push(`**Piezas:** ${pines.inventario}`, '');
  L.push('![Esquema de conexiones](esquema-conexiones.svg)', '');
  L.push('## Por pin de la placa', '');
  L.push('| Pin | En el sketch | Va a | Cable |', '|---|---|---|---|');
  const rank = (p) => p === '5V' ? 0 : p === 'GND' ? 1 : p[0] === 'D' ? 10 + Number(p.slice(1)) : 40 + Number(p.slice(1));
  const porPin = new Map();
  for (const c of pines.conexiones.filter(x => x.pin)) {
    if (!porPin.has(c.pin)) porPin.set(c.pin, []);
    porPin.get(c.pin).push(c);
  }
  for (const pin of [...porPin.keys()].sort((a, b) => rank(a) - rank(b))) {
    const cons = porPin.get(pin);
    const va = cons.map(c => `${nombre(c.componente)} · ${c.terminal}`).join('; ');
    const def = cons.find(c => c.define);
    const cables = [...new Set(cons.map(c => c.cable))].join(', ');
    L.push(`| **${pin}** | ${def ? '`' + def.define + '`' : '—'} | ${va} | ${cables} |`);
  }
  L.push('', '## Por componente', '');
  L.push('| Componente | Terminal | Pin | Cable | Nota |', '|---|---|---|---|---|');
  for (const comp of pines.componentes) {
    for (const t of comp.terminales) {
      const c = pines.conexiones.find(x => x.componente === comp.id && x.terminal === t);
      const destino = c.pin || (c.enlace ? `${nombre(c.enlace.componente)} · ${c.enlace.terminal}` : '');
      L.push(`| ${t === comp.terminales[0] ? `**${comp.nombre}**` : ''} | ${t} | ${destino} | ${c.cable} | ${c.nota || ''} |`);
    }
  }
  L.push('');
  return L.join('\n');
}

// ------------------------------------------------------------------ Programa
function leerPines() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'pines.json'), 'utf8'));
}
const ARCHIVOS = {svg: 'esquema-conexiones.svg', tabla: 'tabla-de-conexiones.md'};

if (require.main === module) {
  const pines = leerPines();
  const salida = {[ARCHIVOS.svg]: construirSvg(pines), [ARCHIVOS.tabla]: construirTabla(pines)};
  const verificar = process.argv.includes('--check');
  let desactualizado = false;
  for (const [nombre, contenido] of Object.entries(salida)) {
    const ruta = path.join(__dirname, nombre);
    const actual = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : null;
    if (verificar) { if (actual !== contenido) { console.error('Desactualizado: ' + nombre); desactualizado = true; } }
    else { fs.writeFileSync(ruta, contenido, 'utf8'); console.log('Escrito ' + nombre); }
  }
  process.exit(desactualizado ? 1 : 0);
}

module.exports = {construirSvg, construirTabla, leerPines, ARCHIVOS};
