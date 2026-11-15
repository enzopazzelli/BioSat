// BioSat · captura de la app emulando un celular de 390 px (Chrome DevTools Protocol, sin dependencias).
// Sirve para revisar el Inicio y el Reporte como se ven en el teléfono: Chrome sin ventana no baja de 500 px
// de ancho, así que una captura común no muestra el diseño de celular.
//
// Uso (con la app servida: python -m http.server 8000). EVAL2 (D-39): después de EVAL recarga la página y corre otro código.
// Uso:
//   node scripts/captura-movil.mjs "http://localhost:8000/web/index.html" inicio.png [alto] [oscuro]
//   ZONA=zona_5_sur_serrano node scripts/captura-movil.mjs "http://localhost:8000/web/index.html#reporte" reporte.png 1400
//   EVAL='document.title' node scripts/captura-movil.mjs "http://localhost:8000/web/" x.png   (corre JS y muestra el resultado)
//   ANCHO=1440 node scripts/captura-movil.mjs "http://localhost:8000/web/index.html" pc.png 1100   (otro ancho, D-34;
//     por defecto 390; desde 800 px se emula una compu en lugar de un celular)
// Imprime el ancho de la pantalla contra el ancho del contenido (si el segundo es mayor, algo se sale de la pantalla)
// y los errores de JavaScript de la página. Necesita Chrome instalado (variable CHROME para otra ruta).
import {spawn} from 'node:child_process';
import {writeFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const [url, salida, alto = '2400', oscuro] = process.argv.slice(2);
const ANCHO = Number(process.env.ANCHO || 390);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const puerto = 9300 + Math.floor(Math.random() * 500);
const perfil = mkdtempSync(join(tmpdir(), 'biosat-cdp-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${puerto}`,
  `--user-data-dir=${perfil}`, 'about:blank'], {stdio: 'ignore'});
const espera = (ms) => new Promise(r => setTimeout(r, ms));

let ws;
for (let i = 0; i < 40 && !ws; i++) {
  try {
    const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
    const pag = lista.find(t => t.type === 'page');
    if (pag) ws = new WebSocket(pag.webSocketDebuggerUrl);
  } catch { await espera(250); }
}
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const errores = [];
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
});
const cdp = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({id: i, method, params})); });

await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', {width: ANCHO, height: Number(alto), deviceScaleFactor: 1, mobile: ANCHO < 800});
if (oscuro) await cdp('Emulation.setEmulatedMedia', {features: [{name: 'prefers-color-scheme', value: 'dark'}]});
await cdp('Page.enable');
await cdp('Page.navigate', {url});
await espera(2500);
if (process.env.ZONA) {   // respuestas del asistente ya guardadas, para ver una zona concreta
  const r = {v: 1, zona: process.env.ZONA, riego: false, ganado: true, maq: false, prio: [], hecho: true};
  await cdp('Runtime.evaluate', {expression: `localStorage.setItem('biosat.asistente.v1', ${JSON.stringify(JSON.stringify(r))})`});
  await cdp('Page.reload'); await espera(2500);
}
await espera(1500);
if (process.env.EVAL) {   // código para probar algo en la página (devuelve un texto)
  const ev = await cdp('Runtime.evaluate', {expression: process.env.EVAL, awaitPromise: true, returnByValue: true});
  console.log('EVAL:', JSON.stringify(ev.result && ev.result.value));
}
if (process.env.EVAL2) {   // D-39: recarga la página (mismo perfil: queda lo guardado) y corre un segundo código
  await cdp('Page.reload'); await espera(4000);
  const ev = await cdp('Runtime.evaluate', {expression: process.env.EVAL2, awaitPromise: true, returnByValue: true});
  console.log('EVAL2:', JSON.stringify(ev.result && ev.result.value));
}
const r = await cdp('Runtime.evaluate', {expression: 'innerWidth + "x" + document.documentElement.scrollWidth', returnByValue: true});
const shot = await cdp('Page.captureScreenshot', {format: 'png'});
writeFileSync(salida, Buffer.from(shot.data, 'base64'));
console.log(`ancho de pantalla x ancho del contenido: ${r.result.value}`);
console.log(errores.length ? 'ERRORES: ' + errores.join(' | ') : 'sin errores de JavaScript');
ws.close(); chrome.kill();
