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

// D-33: que la app no muestre cosas falsas en la demo (docs/superpowers/plans/2026-11-15-app-sin-datos-falsos.md).
test('D-33: la app no nombra métodos ni fuentes que no se usaron', () => {
  for (const [nombre, txt] of [['app.js', app], ['index', index], ['completo', completo]]) {
    assert.doesNotMatch(txt, /CNN|MapBiomas|LART/, nombre);
  }
  assert.doesNotMatch(app, /umbral_ndvi_nbr|cnn_lstm|cnn_transformer|sin definir/);
  assert.match(app, /umbral_ndvi:/, 'la tabla de métodos usa el método real');
  assert.match(app, /sin medir/, 'exactitud y F1 en null se muestran como "sin medir"');
});

test('D-33: los textos del satélite dicen "sin cobertura vegetal activa", no "suelo pelado"', () => {
  for (const [nombre, html] of [['index', index], ['completo', completo]]) {
    assert.doesNotMatch(html, /suele quedar con el suelo pelado|los lotes pelados|lotes con el suelo pelado|meses de suelo pelado \(Landsat/, nombre);
    assert.match(html, /sin cobertura vegetal activa/, nombre);
  }
  assert.doesNotMatch(app, /suele estar pelado|suele estar cubierto/);
  assert.doesNotMatch(leer('frases-logica.js'), /o suelo pelado en tu zona/);
});

test('D-33: la zonificación se presenta como del equipo, con las variables de AIZAL y el nombre del grupo', () => {
  assert.doesNotMatch(app, /Zonificación AIZAL: grupo/);
  assert.match(app, /con las variables de AIZAL/);
});

// Leaflet mide su contenedor al crear el mapa. En index.html el visor se arma con el Reporte oculto (0 × 0 px):
// sin volver a medir al mostrarlo, el mapa queda en zoom 0 y la imagen Landsat ocupa 1 px.
test('el visor vuelve a medir el mapa al mostrar el Reporte y no da por encuadrada una zona con el mapa en 0 px', () => {
  const vista = app.slice(app.indexOf('function mostrarVista'), app.indexOf("window.addEventListener('hashchange', mostrarVista)"));
  assert.match(vista, /invalidateSize/, 'mostrarVista tiene que avisarle a Leaflet que el mapa cambió de tamaño');
  assert.match(app, /visor\.zonaVista = visor\.map\.getSize\(\)\.x \? state\.zona : null/, 'con el mapa en 0 px, la zona se encuadra al mostrarlo');
});

test('D-37: la explicación del semáforo aclara que la falta de agua es lluvia contra ET0, no la demanda de un cultivo', () => {
  const metodo = index.slice(index.indexOf('id="semaforoMetodo"'), index.indexOf('</p>', index.indexOf('id="semaforoMetodo"')));
  assert.match(metodo, /evaporación de referencia \(ET0\)/);
  assert.match(metodo, /no es lo que pide un cultivo concreto/);
});

test('D-38: index.html carga el lector de dron sin internet y tiene su caja en el visor', () => {
  for (const s of ['vendor/geotiff.js', 'vendor/proj4.js', 'dron-logica.js', 'dron.js']) assert.match(index, new RegExp(`<script src="${s}" defer>`), s);
  assert.ok(index.indexOf('dron.js') < index.indexOf('app.js'));
  assert.ok(idsIndex.has('dronBox') && idsIndex.has('dronArchivo'));
  assert.match(index, /id="dronArchivo"[^>]*accept="\.tif,\.tiff"/);
});

test('D-38: tarjeta del dron en el Reporte, línea en el Inicio y aviso en la vista detallada', () => {
  for (const id of ['dronFicha', 'dronComparacion', 'dronFecha', 'dronTecnica', 'dronCambiarZona', 'inicioDron', 'inicioDronTxt', 'inicioDronLink']) assert.ok(idsIndex.has(id), id);
  assert.match(index, /id="inicioDronLink"[^>]*href="#satelite"/);
  assert.ok(index.indexOf('id="inicioDron"') < index.indexOf('class="ini-mejor"'));
  assert.match(completo, /id="dronEnReporte"[\s\S]*?href="index\.html#satelite"/);
  assert.match(index, /data-i18n="datosDron"/);
});

test('D-38: la caja del dron se vuelve a dibujar con cada renderTodo (si no, con ?lang=en queda en español)', () => {
  const f = app.slice(app.indexOf('function renderDron'), app.indexOf('function renderDron') + 600);
  assert.match(f, /BioSatDron\.render\(\)/);
});

test('D-39: al restaurar el vuelo guardado, el visor muestra el dron y va al lote cuando el mapa se ve', () => {
  const oyente = app.slice(app.indexOf('BioSatDron.alCambiar('), app.indexOf('BioSatDron.alCambiar(') + 400);
  assert.match(oyente, /motivo === 'nuevo' \|\| motivo === 'restaurado'/);
  const vista = app.slice(app.indexOf('function mostrarVista'), app.indexOf("window.addEventListener('hashchange', mostrarVista)"));
  assert.match(vista, /visor\.irAlDron/);
});

test('D-39: si el vuelo se restauró antes de que app.js termine de arrancar, app.js lo toma igual', () => {
  const ini = app.slice(app.indexOf('BioSatDron.alCambiar('), app.indexOf('BioSatDron.alCambiar(') + 900);
  assert.match(ini, /BioSatDron\.estado\(\)[^\n]*restaurado/);
});

test('D-39: tarjeta de sectores en el Reporte, con sus scripts antes de app.js', () => {
  for (const id of ['sectoresCard', 'sectMarcar', 'sectDibujo', 'sectLista', 'sectAviso']) assert.ok(idsIndex.has(id), id);
  for (const s of ['sectores-logica.js', 'sectores.js']) assert.ok(index.indexOf(s) > 0 && index.indexOf(s) < index.indexOf('app.js'), s);
  assert.ok(index.indexOf('id="sectoresCard"') > index.indexOf('id="dronFicha"'));
});

test('D-39: exportar e importar sectores', () => {
  assert.ok(idsIndex.has('sectExportar') && idsIndex.has('sectImportar'));
  assert.match(index, /id="sectArchivo"[^>]*accept="\.geojson,\.json"/);
});

test('D-40: los rótulos de Landsat dicen la resolución real', () => {
  for (const [nombre, html] of [['index', index], ['completo', completo]]) {
    assert.doesNotMatch(html, /Landsat · 30 m<|Landsat 8\/9 · 30 m/, nombre);
    assert.match(html, /id="visorSrc"/, nombre);
    assert.match(html, /NDVI a 100 m/, nombre);
  }
});

test('D-40: app.js carga los recortes del lote sin romper si falta lotes.json', () => {
  assert.match(app, /async function cargarLotesSat\(base = '\.\.\/data\/imagenes\/lotes\/'\)/);
  const f = app.slice(app.indexOf('async function cargarLotesSat'), app.indexOf('async function cargarLotesSat') + 900);
  assert.match(f, /catch/);
  assert.match(app, /cargarLotesSat\(\)/);
});

test('D-41: la tarjeta del dron tiene el bloque de clases y el visor su leyenda', () => {
  assert.ok(idsIndex.has('dronClases') && idsIndex.has('leyendaClases'));
});

test('en la PC el mapa del visor se estira con la columna de botones, que tiene un alto máximo (sin espacio en blanco)', () => {
  const css = fs.readFileSync(path.join(WEB, 'estilos.css'), 'utf8');
  assert.match(css, /@media \(min-width:901px\)\{#mapaGis\{height:auto;min-height:460px\}\.visor-side\{max-height:760px;overflow-y:auto\}\}/);
  assert.match(app, /new ResizeObserver\(\(\) => visor\.map && visor\.map\.invalidateSize/);
});

test('la cortina: arrastrar hacia el nombre de una capa muestra más de esa capa (Enzo, 15/11: estaba al revés)', () => {
  const f = app.slice(app.indexOf('function aplicarCortina'), app.indexOf('function aplicarCortina') + 800);
  assert.match(f, /inset\(0 0 0 \$\{100 - visor\.cortina\}%\)/);
});
