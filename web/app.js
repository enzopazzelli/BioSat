/* BioSat · app web v1. Lee los JSON de data/ (ver docs/contratos-de-datos.md). */
let CLIMA = {}, IMG = {}, ROT = {}, FUENTE_ROT = {}, SUELO_Z = {}, DIAG = {}, ARDUINO = null, FUENTE_IMG = '', ZONIF = {}, DESMONTE = {};

const MES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MES_L = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const ESTADO = {
  C:{label:'Cultivo en pie', color:'var(--st-cultivo)'},
  V:{label:'Cobertura o pastura', color:'var(--st-cobertura)'},
  R:{label:'Rastrojo', color:'var(--st-rastrojo)'},
  D:{label:'Suelo pelado', color:'var(--st-desnudo)'}
};

const ZONAS = {
  zona_1_riego_salitre:{num:1, nombre:'Área de riego del Río Dulce', lugar:'La Banda', zona:'La Banda · Robles · Beltrán', deptos:'Banda, Robles, Capital, San Martín, Silípica', problema:'Se riega por manto y la napa salina queda cerca. Si el lote queda pelado en la seca, el sol evapora y sube el salitre.', riego:true},
  zona_2_secano_este:{num:2, nombre:'Secano agrícola del este', lugar:'Quimilí', zona:'Quimilí · Bandera · Sachayoj', deptos:'Moreno, Juan F. Ibarra', problema:'Todo depende de la lluvia: invierno y primavera secos, veranos de más de 40 °C y poco rastrojo si se hace soja sobre soja.', riego:false},
  zona_3_monte_semiarido:{num:3, nombre:'Chaco semiárido norte', lugar:'Campo Gallo', zona:'Campo Gallo · Monte Quemado', deptos:'Alberdi, Copo, Pellegrini, Figueroa', problema:'Estación seca larga, desmonte y falta de pasto en invierno para la hacienda.', riego:false},
  zona_4_bajos_submeridionales:{num:4, nombre:'Bajos submeridionales', lugar:'Añatuya', zona:'Añatuya · Los Juríes · Pinto', deptos:'Aguirre, Mitre, Belgrano, Rivadavia, General Taboada', problema:'Llanura plana y arcillosa: se anega con las lluvias de verano y se agrieta con salitre en la seca.', riego:false},
  zona_5_sur_serrano:{num:5, nombre:'Sur serrano y salinas', lugar:'Ojo de Agua', zona:'Ojo de Agua · Sumampa · Quebrachos', deptos:'Ojo de Agua, Quebrachos, Choya, Guasayán', problema:'Clima más fresco que el resto: unas 20 heladas por año y pocos días de más de 40 °C. Sierras con pendientes que se erosionan, salinas al oeste y ganadería de cría y caprina. Las rotaciones todavía son un borrador a validar con productores del sur.', riego:false}
};

const PRIO = [
  {id:'agua', label:'Ahorrar agua'},
  {id:'salitre', label:'Frenar el salitre'},
  {id:'suelo', label:'Recuperar el suelo'},
  {id:'forraje', label:'Sumar forraje'},
  {id:'ingreso', label:'Ingreso este año'}
];

const SUELO = [
  ['pH del suelo', 'ph', '', 'B16', 'Debajo de 5,8 las leguminosas fijan poco nitrógeno.'],
  ['Arcilla', 'arcilla_pct', '%', 'B12', 'Mucha arcilla guarda agua pero se encharca.'],
  ['Carbono orgánico', 'carbono_organico_g_kg', 'g/kg', 'B15', 'Sube con rastrojo y coberturas; es la vida del suelo.'],
  ['Nitrógeno', 'nitrogeno_g_kg', 'g/kg', 'B11', 'Si es bajo, conviene sumar una leguminosa.'],
  ['Densidad aparente', 'densidad_aparente_g_cm3', 'g/cm³', 'B18', 'Alta quiere decir suelo compactado.'],
  ['Distancia a caminos', 'distancia_caminos_km', 'km', 'B36', 'Lejos de un camino, cuesta vender un cultivo nuevo.']
];

const BANDEJAS = {
  A:{nombre:'A · Pelada y seca', clave:'A_pelada_seca'},
  B:{nombre:'B · Salitrosa', clave:'B_salitrosa'},
  C:{nombre:'C · Con rastrojo', clave:'C_rastrojo'}
};

const state = {zona:'zona_2_secano_este', prio:new Set(['agua','suelo']), riego:false, ganado:true, maq:false,
  periodo:'normal', dT:0, dP:0, elegida:null, bandeja:'A', vivo:null};

const $ = s => document.querySelector(s);
const nf = (n, d=0) => Number(n).toLocaleString('es-AR', {minimumFractionDigits:d, maximumFractionDigits:d});
const sum = (a, f=x=>x) => a.reduce((s,x)=>s+f(x), 0);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mix = (token, pct) => `color-mix(in oklab, var(${token}) ${Math.round(pct)}%, var(--surface))`;
const signo = n => (n > 0 ? '+' : n < 0 ? '−' : '') + nf(Math.abs(n), 1);

function clima(periodo = state.periodo, dT = state.dT, dP = state.dP){
  const i = Math.round(dT / 0.5), f = 1 + dP / 100;
  return CLIMA[state.zona][periodo].map(m => ({
    tmax:m.tmax + dT, tmin:m.tmin + dT, lluvia:m.lluvia * f, p10:m.lluvia_p10 * f, p90:m.lluvia_p90 * f, med:m.lluvia_med * f,
    tormentas:m.tormentas30 * f, helada:m.helada3, probHelada:m.prob_helada0,
    d35:m.d35[i], d40:m.d40[i], et0:m.et0[i], balance:m.lluvia * f - m.et0[i], humedad:m.humedad, humedadAnom:m.humedadAnom
  }));
}
const escenario = () => state.dT !== 0 || state.dP !== 0;
const nombrePeriodo = () => state.periodo === 'normal' ? '1991–2020' : '2021–2025';

/* ---------- Motor ---------- */
function metricas(r, c){
  const pel = [...r.cal].flatMap((s,i) => s === 'D' ? [i] : []);
  return {
    pelados: pel.length, mesesPel: pel,
    calor: [...r.cal].reduce((a,s,i) => a + (s === 'C' ? c[i].d40 : 0), 0),
    tormentas: pel.reduce((a,i) => a + c[i].tormentas, 0)
  };
}
function puntaje(r){
  const ps = PRIO.filter(p => state.prio.has(p.id));
  const det = ps.map(p => {
    let v = r.attr[p.id], nota = '';
    if (v === null || v === undefined){ v = 0; nota = 'sin dato'; }
    if (p.id === 'forraje' && r.req.ganado && !state.ganado){ v = Math.max(0, v - 2); nota = 'sin hacienda se aprovecha poco'; }
    return {p, v, nota};
  });
  const pct = ps.length ? Math.round(100 * sum(det, d => d.v) / (3 * ps.length)) : null;
  const avisos = []; let viable = true;
  if (r.req.riego && !state.riego){ viable = false; avisos.push(['crit','Necesita riego']); }
  if (r.req.ganado && !state.ganado) avisos.push(['warn','Pensada con hacienda']);
  if (r.req.maquinaria && !state.maq) avisos.push(['warn','Necesita rolo o sembradora (se puede contratar)']);
  return {pct, det, avisos, viable};
}
function reglas(r){
  const s = r.seq.map(x => x.s), n = s.length, secs = new Set(s);
  const hayA = s.includes('A');
  const r1 = s.every((x,i) => x !== 'A' || ['B','D'].includes(s[(i+1) % n]));
  const repite = n === 1 || s.some((x,i) => x === s[(i+1) % n]);
  return [
    ['Después de una gramínea (A) viene una leguminosa (B) o una cobertura (D)', hayA ? r1 : null],
    ['No repite la misma sección seguida', !repite],
    ['Usa al menos 3 secciones distintas en el ciclo', secs.size >= 3],
    ['Cero meses de suelo pelado', !r.cal.includes('D')]
  ];
}
function ranking(){
  return ROT[state.zona].map(r => ({r, p:puntaje(r)}))
    .sort((a,b) => (b.p.viable - a.p.viable) || ((b.p.pct ?? 0) - (a.p.pct ?? 0)));
}

/* ---------- Confianza ---------- */
const CF = {
  temp:['alta','Temperatura de un modelo con celdas de 50 km. Sirve para tu zona; en tu lote puede variar 1 o 2 °C.'],
  helada:['media','Se mide a 2 m de altura. A ras del suelo puede helar más seguido.'],
  lluvia:['media','La lluvia cambia mucho en pocos kilómetros y la celda de 50 km la promedia.'],
  balance:['media','La demanda de agua se estima con una fórmula simple (Hargreaves).'],
  racha:['media','Sale de la lluvia del modelo; un pluviómetro en el campo puede marcar otra cosa.'],
  rot:['baja','Año tipo de la rotación: lo armó el equipo y todavía no lo validó un productor ni un agrónomo.'],
  puntaje:['baja','Sale de reglas fijas sobre la rotación (ver "¿Cómo ordena BioSat?"). Es baja mientras las rotaciones no estén validadas.'],
  expo:['media','30 años reales de NASA POWER cruzados con el año tipo de la rotación, que es un supuesto.'],
  agua:['baja','Estimación simple con coeficientes de cultivo de la FAO. Sirve para comparar, no para regar.'],
  celda:['media','Todo lo que cae dentro de la celda comparte los mismos números de clima.']
};
const cf = k => `<span class="conf ${CF[k][0]}" tabindex="0" data-tip="Confianza ${CF[k][0]}: ${CF[k][1]}">${CF[k][0]}</span>`;
const CONF_FILA = {'Calor de más de 35 °C':'temp', 'Calor de más de 40 °C':'temp', 'Helada':'helada', 'Lluvia':'lluvia', 'Lluvia menos demanda':'balance'};

/* ---------- Compensaciones y riesgo ---------- */
// Coeficiente de cultivo simplificado (FAO-56): qué parte de la demanda de agua usa cada estado del suelo.
const KC = {C:0.85, V:0.6, R:0.15, D:0.25};
const aguaPide = (r, c) => [...r.cal].reduce((a,s,i) => a + c[i].et0 * KC[s], 0);
const actualDe = () => ROT[state.zona].find(x => x.tipo === 'Actual');
const ATTR_GANA = {salitre:'Frena más el salitre', suelo:'Recupera más el suelo', forraje:'Suma forraje para la hacienda'};
function trade(r, c){
  const a = actualDe();
  if (r === a) return {base:true};
  const mr = metricas(r, c), ma = metricas(a, c);
  const gana = [], cuesta = [];
  const dPel = mr.pelados - ma.pelados, dTor = mr.tormentas - ma.tormentas, dCal = mr.calor - ma.calor;
  const dAgua = aguaPide(r, c) - aguaPide(a, c);
  if (dPel < 0) gana.push(`${-dPel} meses menos de suelo pelado`);
  if (dTor < -0.05) gana.push(`${nf(-dTor,1)} tormentas fuertes menos por año sobre suelo pelado`);
  for (const k of Object.keys(ATTR_GANA)) if (r.attr[k] > a.attr[k]) gana.push(ATTR_GANA[k]);
  if (dCal < -0.5) gana.push(`${nf(-dCal,1)} días menos de más de 40 °C con cultivo en pie`);
  if (dAgua < -20) gana.push(`Pide unos ${nf(-dAgua)} mm menos de agua por año`);
  if (dAgua > 20) cuesta.push(`Pide unos ${nf(dAgua)} mm más de agua por año`);
  if (dCal > 0.5) cuesta.push(`${nf(dCal,1)} días más de 40 °C con cultivo en pie`);
  if (r.attr.ingreso < a.attr.ingreso) cuesta.push('Menos ingreso el primer año');
  if (r.req.maquinaria) cuesta.push('Necesita rolo o sembradora de grano fino');
  if (r.req.ganado) cuesta.push('Necesita hacienda para aprovechar el forraje');
  cuesta.push(r.riesgo[0]);
  return {gana:gana.slice(0, 4), cuesta:cuesta.length > 4 ? [...cuesta.slice(0, 3), cuesta[cuesta.length - 1]] : cuesta};
}
function frecuencia(r){
  const yrs = CLIMA[state.zona].anios[state.periodo], i = Math.round(state.dT / 0.5);
  const calor = yrs.map(y => [...r.cal].reduce((a,s,m) => a + (s === 'C' ? y.d40[i][m] : 0), 0)).sort((a,b) => a - b);
  const torm = yrs.map(y => [...r.cal].reduce((a,s,m) => a + (s === 'D' ? y.t30[m] : 0), 0));
  const q = p => calor[Math.min(calor.length - 1, Math.floor(p * calor.length))];
  return {n:yrs.length, med:q(0.5), p80:q(0.8), conTorm:torm.filter(t => t > 0).length, pelado:r.cal.includes('D')};
}
function renderTrade(){
  const c = clima(), rots = ROT[state.zona], P = sum(c, m => m.lluvia);
  const pts = rots.map(r => ({r, x:aguaPide(r, c), y:12 - metricas(r, c).pelados}));
  const W = 640, H = 300, L = 56, Rm = 24, T = 24, B = 46;
  const xs = pts.map(p => p.x).concat(P);
  const x0 = Math.floor((Math.min(...xs) - 60) / 100) * 100, x1 = Math.ceil((Math.max(...xs) + 60) / 100) * 100;
  const sx = v => L + (v - x0) / (x1 - x0) * (W - L - Rm), sy = v => T + (12 - v) / 12 * (H - T - B);
  const paso = (x1 - x0) > 900 ? 200 : 100;
  let g = '';
  for (let v = x0; v <= x1; v += paso) g += `<line class="tg" x1="${sx(v)}" x2="${sx(v)}" y1="${T}" y2="${H - B}"/><text class="tx" x="${sx(v)}" y="${H - B + 16}" text-anchor="middle">${nf(v)}</text>`;
  for (const v of [0,3,6,9,12]) g += `<line class="tg" x1="${L}" x2="${W - Rm}" y1="${sy(v)}" y2="${sy(v)}"/><text class="tx" x="${L - 8}" y="${sy(v) + 4}" text-anchor="end">${v}</text>`;
  const izqP = sx(P) > W - 190;
  g += `<line class="tp" x1="${sx(P)}" x2="${sx(P)}" y1="${T}" y2="${H - B}"/><text class="tpl" x="${sx(P) + (izqP ? -6 : 6)}" y="${T + 12}" text-anchor="${izqP ? 'end' : 'start'}">Lluvia del año: ${nf(P)} mm</text>`.replace(`y="${T + 12}"`, `y="${H - B - 8}"`);
  g += `<text class="tax" x="${(L + W - Rm) / 2}" y="${H - 8}" text-anchor="middle">Agua que pide el lote (mm por año)</text>`;
  g += `<text class="tax" transform="translate(14 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle">Meses con suelo protegido</text>`;
  const cajas = [];   // lugar que ocupa cada etiqueta, para que no se pisen
  pts.forEach((p, k) => {
    const act = p.r.tipo === 'Actual', izq = sx(p.x) > W - 210, dx = izq ? -13 : 13, an = izq ? 'end' : 'start';
    const ancho = Math.max(p.r.tipo.length, p.r.nombre.length) * 6.2;
    const x0 = izq ? sx(p.x) - 13 - ancho : sx(p.x) + 13, x1 = x0 + ancho;
    let dy = 0;
    while (cajas.some(c => x0 < c.x1 && x1 > c.x0 && Math.abs(sy(p.y) + dy - c.y) < 28)) dy += 30;
    cajas.push({x0, x1, y:sy(p.y) + dy});
    g += `<g data-tip="${p.r.tipo}: ${esc(p.r.nombre)}\nPide unos ${nf(p.x)} mm de agua por año\n${p.y} meses con suelo protegido">
      <circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="8" class="${act ? 'pt-act' : 'pt-alt'}"/>
      <text class="pl" x="${sx(p.x) + dx}" y="${sy(p.y) - 6 + dy}" text-anchor="${an}">${p.r.tipo}</text>
      <text class="pls" x="${sx(p.x) + dx}" y="${sy(p.y) + 9 + dy}" text-anchor="${an}">${esc(p.r.nombre)}</text></g>`;
  });
  $('#tradeSvg').innerHTML = g;
  $('#tradeConf').innerHTML = `Agua que pide ${cf('agua')} · meses protegidos ${cf('rot')}`;
}

/* ---------- Visor GIS ---------- */
const ZKEY = {zona_1_riego_salitre:'z1', zona_2_secano_este:'z2', zona_3_monte_semiarido:'z3', zona_4_bajos_submeridionales:'z4', zona_5_sur_serrano:'z5'};
const CAPAS = [
  {id:'invierno_rgb', label:'Color real · invierno'},
  {id:'verano_rgb', label:'Color real · verano'},
  {id:'invierno_ndvi', label:'Verdor (NDVI) · invierno'},
  {id:'verano_ndvi', label:'Verdor (NDVI) · verano'},
  {id:'2000_rgb', label:'Color real · año 2000'}
];
const CMP = [
  {id:'no', label:'Sin comparar'},
  {id:'estacion', label:'Verano contra invierno (verdor)', a:'verano_ndvi', b:'invierno_ndvi', izq:'← Verano', der:'Invierno →'},
  {id:'desmonte', label:'2000 contra 2025 (desmonte)', a:'2000_rgb', b:'invierno_rgb', izq:'← 2000', der:'2025 →'}
];
const visor = {map:null, capa:'invierno_rgb', cmp:'no', cortina:50, layers:[], zonaVista:null};
const fechaTxt = f => f.split('-').reverse().join('/');
function escenaDe(z, capa){ const m = IMG[z].meta; return capa.startsWith('2000') ? m.anio2000 : m[capa.split('_')[0]]; }
function aplicarCortina(){
  if (visor.cmp === 'no' || !visor.layers[1]) return;
  const el = visor.layers[1].getElement && visor.layers[1].getElement();
  if (el) el.style.clipPath = `inset(0 0 0 ${visor.cortina}%)`;
}
function renderVisor(){
  const z = ZKEY[state.zona], im = IMG[z];
  if (!im){ $('#capas').innerHTML = '<p class="hint">Sin imágenes para esta zona todavía.</p>'; return; }
  if (!im.img[visor.capa]) visor.capa = 'invierno_rgb';
  const cmpOk = CMP.filter(x => x.id === 'no' || (im.img[x.a] && im.img[x.b]));
  if (!cmpOk.some(x => x.id === visor.cmp)) visor.cmp = 'no';
  $('#capas').innerHTML = CAPAS.filter(k => im.img[k.id]).map(k => { const e = escenaDe(z, k.id);
    return `<button type="button" class="capa" data-capa="${k.id}" aria-pressed="${visor.cmp === 'no' && k.id === visor.capa}">${k.label}<small>${e ? fechaTxt(e.fecha) : ''}</small></button>`; }).join('');
  $('#cmps').innerHTML = cmpOk.map(x => `<button type="button" class="capa" data-cmp="${x.id}" aria-pressed="${x.id === visor.cmp}">${x.label}</button>`).join('');
  const cm = CMP.find(x => x.id === visor.cmp);
  $('#cortinaBox').hidden = visor.cmp === 'no';
  if (cm.izq){ $('#cortIzq').textContent = cm.izq; $('#cortDer').textContent = cm.der; $('#cortina').value = visor.cortina; }
  const mostrar = visor.cmp === 'no' ? [visor.capa] : [cm.a, cm.b];
  $('#rampa').hidden = !mostrar.some(id => id.endsWith('ndvi'));
  $('#escena').innerHTML = mostrar.map(id => escenaDe(z, id)).filter(Boolean)
    .map(e => `${e.item} · ${fechaTxt(e.fecha)}${e.nubes !== undefined ? ` · nubes ${nf(e.nubes,1)} %` : ''}`).join('<br>');
  $('#celdaNota').innerHTML = `Recuadro punteado: la celda de NASA POWER (unos 50 km) ${cf('celda')}`;
  const b = im.meta.bbox, bounds = [[b[1], b[0]], [b[3], b[2]]];
  const lat = CLIMA[state.zona].lat, lon = CLIMA[state.zona].lon;
  if (!window.L){
    $('#mapaGis').innerHTML = `<img src="${im.img[mostrar[mostrar.length - 1]]}" alt="Imagen Landsat de la zona" style="width:100%;height:100%;object-fit:contain">`;
    return;
  }
  const acento = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0E5E4B';
  if (!visor.map){
    visor.map = L.map('mapaGis', {zoomSnap:0.25, attributionControl:true});
    L.control.scale({imperial:false}).addTo(visor.map);
    visor.map.attributionControl.setPrefix(false).addAttribution('Landsat (NASA/USGS) vía ' + FUENTE_IMG);
  }
  visor.layers.forEach(l => l.remove());
  visor.layers = mostrar.map(id => L.imageOverlay(im.img[id], bounds, {alt:'Imagen Landsat'}).addTo(visor.map));
  const zi = zonifImagen();
  $('#zonifBox').innerHTML = zi
    ? `<button type="button" class="capa" data-zonif aria-pressed="${!!visor.zonif}">Zonas AIZAL (k-means)<small>D-25</small></button>`
    : '<p class="hint">La capa de zonas AIZAL aparece cuando Santi la exporte.</p>';
  if (zi && visor.zonif) visor.layers.push(L.imageOverlay(zi.url, zi.bounds, {opacity:0.55, alt:'Zonas AIZAL'}).addTo(visor.map));
  visor.layers.push(L.rectangle([[lat - 0.25, lon - 0.3125], [lat + 0.25, lon + 0.3125]], {color:acento, weight:2, dashArray:'6 5', fill:false, interactive:false}).addTo(visor.map));
  visor.layers.push(L.circleMarker([lat, lon], {radius:6, color:'#ffffff', weight:2, fillColor:acento, fillOpacity:1}).bindTooltip('Punto de NASA POWER de la zona').addTo(visor.map));
  if (visor.zonaVista !== state.zona){
    visor.map.setMaxBounds(null); visor.map.setMinZoom(0);
    visor.map.fitBounds(bounds, {animate:false});
    visor.map.setMinZoom(visor.map.getZoom() - 1);
    visor.map.setMaxBounds(L.latLngBounds(bounds).pad(0.3));
    visor.zonaVista = state.zona;
  }
  aplicarCortina();
}

/* ---------- Zonificación AIZAL y presión de desmonte (D-25) ---------- */
function zonifTexto(){
  const c = ((ZONIF.comparacion_biosat || {})[state.zona]) || {};
  if (c.grupo_mayoritario === null || c.grupo_mayoritario === undefined) return '';
  const g = (ZONIF.grupos || []).find(x => x.id === c.grupo_mayoritario) || {};
  return `<span class="mono">Zonificación AIZAL: grupo ${esc(g.nombre || c.grupo_mayoritario)}${c.coincidencia_pct != null ? ` (${nf(c.coincidencia_pct)} % de la celda)` : ''}</span>`;
}
function zonifImagen(){
  const im = ZONIF.meta && ZONIF.meta.imagen;
  if (!im || !im.archivo || !Array.isArray(im.bbox) || im.bbox.length !== 4) return null;
  const [w, s, e, n] = im.bbox;
  return {url:'../' + im.archivo, bounds:[[s, w], [n, e]]};
}
function nivelDesmonte(){
  const zs = DESMONTE.zonas || {};
  const r = (zs[state.zona] || {}).riesgo_medio_0_1;
  if (r === null || r === undefined) return {r:null, nivel:null};
  const orden = Object.entries(zs).map(([id, z]) => [id, z.riesgo_medio_0_1])
    .filter(([, v]) => v !== null && v !== undefined).sort((a, b) => b[1] - a[1]);
  const puesto = orden.findIndex(([id]) => id === state.zona) + 1, n = orden.length, tramo = Math.ceil(n * 0.4);
  return {r, puesto, n, nivel: puesto <= tramo ? 'alta' : puesto > n - tramo ? 'baja' : 'media'};
}
function renderDesmonte(){
  const dz = (DESMONTE.zonas || {})[state.zona] || {};
  const nd = nivelDesmonte();
  $('#desmonteNivel').innerHTML = nd.nivel
    ? `<b>${nf(nd.r * 100)} %</b><span class="nivel ${nd.nivel}">${nd.nivel}</span><span class="hint">${nd.puesto}.ª de ${nd.n} zonas</span>`
    : '<b>—</b><span class="hint">sin dato</span>';
  $('#desmonteTexto').textContent = nd.nivel
    ? 'Probabilidad media de que se desmonte el monte que queda en tu zona, según el modelo.' + (nd.nivel === 'alta' ? ' Es de las zonas con más presión: conviene priorizar rotaciones que conserven el monte.' : '')
    : 'Sin datos todavía. Lo calcula Santi con el modelo predictivo de desmontes (propuesta de la profesora).';

  const s = dz.desmonte_ha_por_anio || {}, vals = Array.isArray(s.valores) ? s.valores : null;
  const p = dz.proyeccion_ha || {}, pv = Array.isArray(p.valores) ? p.valores : [];
  if (vals && vals.length){
    const W = 320, H = 90, todos = vals.concat(pv), max = Math.max(...todos, 1), bw = W / todos.length;
    const y = v => H - 12 - v / max * (H - 16);
    let g = vals.map((v, i) => `<rect class="b" x="${(i * bw + 0.5).toFixed(1)}" y="${y(v).toFixed(1)}" width="${Math.max(1, bw - 1).toFixed(1)}" height="${(H - 12 - y(v)).toFixed(1)}" rx="1" data-tip="${(s.desde || 0) + i}: ${nf(v)} ha"/>`).join('');
    if (pv.length) g += `<polyline class="p" points="${pv.map((v, j) => `${((vals.length + j + 0.5) * bw).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`;
    const fin = (p.anios && p.anios.length) ? p.anios[p.anios.length - 1] : (s.desde || 0) + vals.length - 1;
    g += `<text class="ax" x="0" y="${H}">${s.desde ?? ''}</text><text class="ax" x="${W}" y="${H}" text-anchor="end">${fin}</text>`;
    $('#desmonteSerie').innerHTML = g;
    $('#desmonteSerieNota').textContent = pv.length ? 'Barras: historia. Línea punteada: proyección del modelo temporal.' : 'Historia de desmontes de la zona.';
  } else {
    $('#desmonteSerie').innerHTML = '<text class="ax" x="160" y="48" text-anchor="middle">sin dato</text>';
    $('#desmonteSerieNota').textContent = 'La serie anual sale del mapa de desmontes (LART, MapBiomas o Hansen).';
  }

  const ev = DESMONTE.evaluacion || {}, met = ev.metodos || {};
  const NOM = {regresion_logistica:'Regresión logística', random_forest:'Random forest', temporal_lstm_o_transformer:'LSTM o Transformer'};
  const num = v => v === null || v === undefined ? '—' : nf(v, 2);
  $('#desmonteMetodos').innerHTML = Object.entries(NOM).map(([k, nom]) => {
    const x = met[k] || {};
    const ultima = k === 'temporal_lstm_o_transformer' ? (x.error_ha_pct == null ? '—' : `error ${nf(x.error_ha_pct)} %`) : num(x.f1);
    return `<tr><td>${nom}${k === ev.metodo_elegido ? ' ✓' : ''}</td><td>${num(x.auc)}</td><td>${ultima}</td></tr>`;
  }).join('');
  $('#desmonteNota').textContent = DESMONTE.meta && DESMONTE.meta.validacion
    ? `Validación: ${DESMONTE.meta.validacion}. Historia: ${DESMONTE.meta.historia || 'sin dato'}.`
    : 'Validación prevista: entrenar con la historia hasta 2015 y probar con 2016-2023.';
}

/* ---------- Lector del Arduino (lo aporta Sara: arduino/lector-web-serial.js) ---------- */
function botonArduino(){
  const lector = window.BioSatArduino, btn = $('#btnArduino');
  if (lector && typeof lector.soportado === 'function' && lector.soportado()){
    btn.disabled = false; btn.className = 'btn'; btn.title = '';
    btn.textContent = state.vivo ? 'Arduino conectado' : 'Conectar Arduino por USB';
  } else {
    btn.disabled = true; btn.className = 'btn-off';
    btn.title = lector ? 'Este navegador no permite leer el puerto USB: usá Chrome o Edge' : 'No se encontró el lector (arduino/lector-web-serial.js)';
  }
}

/* ---------- Paso 1 ---------- */
/* ---------- Paso 1 y asistente de inicio ---------- */
// Lo que respondió la persona (ver asistente-logica.js). El asistente le pasa las respuestas a `state`.
let respuestas = null, MAPA = null;
const TEXTOS_CAMPO = {titulo:'Tu campo', zona:'Zona', tiene:'Tenés', preocupa:'Te preocupa', nada:'Nada en particular', cambiar:'Cambiar mis respuestas'};
function almacen(){ try { return window.localStorage; } catch (e) { return null; } }
function aplicarRespuestas(r){ Object.assign(state, AsistenteLogica.aEstado(r, ZONAS), {elegida:null}); }
function iniciarRespuestas(){
  respuestas = window.AsistenteLogica ? AsistenteLogica.leer(almacen(), ZONAS) : null;
  if (respuestas) aplicarRespuestas(respuestas);
}
function irAlCalendario(){
  const s = $('#calendario');
  s.setAttribute('tabindex', '-1');
  s.focus({preventScroll:true});
  s.scrollIntoView();
}
function abrirAsistente(){
  if (!window.BioSatAsistente || !window.AsistenteLogica) return;
  BioSatAsistente.abrir({zonas:ZONAS, respuestas:respuestas, mapa:MAPA, alCerrar:r => {
    respuestas = AsistenteLogica.normalizar(r, ZONAS);
    AsistenteLogica.guardar(almacen(), respuestas);
    aplicarRespuestas(respuestas);
    renderTodo();
    irAlCalendario();
  }});
}
function renderTuCampo(){
  const T = window.BioSatAsistente && BioSatAsistente.TEXTOS;
  const z = ZONAS[state.zona], c = CLIMA[state.zona];
  if (T){
    const tiene = [state.riego && T.p4.riego, state.ganado && T.p4.hacienda, state.maq && T.p4.maq].filter(Boolean);
    const preocupa = PRIO.filter(p => state.prio.has(p.id)).map(p => T.p3[p.id]);
    $('#tuCampo').innerHTML = `<h3>${TEXTOS_CAMPO.titulo}</h3><dl class="tc-lista">
      <div><dt>${TEXTOS_CAMPO.zona}</dt><dd>${z.num} · ${esc(z.lugar)} · ${esc(z.nombre)}</dd></div>
      <div><dt>${TEXTOS_CAMPO.tiene}</dt><dd>${esc(tiene.length ? tiene.join(', ') : TEXTOS_CAMPO.nada)}</dd></div>
      <div><dt>${TEXTOS_CAMPO.preocupa}</dt><dd>${esc(preocupa.length ? preocupa.join(', ') : TEXTOS_CAMPO.nada)}</dd></div></dl>
      <button type="button" class="btn" id="btnCambiar">${TEXTOS_CAMPO.cambiar}</button>`;
  }
  $('#zonaFicha').innerHTML = `<strong>Zona ${z.num} · ${esc(z.nombre)}</strong><p>${esc(z.problema)}</p>
    <span class="mono">Departamentos: ${esc(z.deptos)} · punto NASA POWER ${nf(c.lat,2)}°, ${nf(c.lon,2)}°</span>` + zonifTexto();
}

/* ---------- Paso 2 ---------- */
function renderStats(){
  const z = CLIMA[state.zona], cn = clima('normal', 0, 0), cr = clima('reciente', 0, 0), c = clima();
  const d40n = sum(cn, m => m.d40), d40r = sum(cr, m => m.d40);
  const serie = z.d40_por_anio, max = Math.max(...serie), W = 300, H = 46, bw = W / serie.length;
  const bars = serie.map((v,i) => {
    const y = 1981 + i, h = Math.max(1, (v / max) * (H - 12));
    return `<rect class="b ${y >= 2021 ? 'rec' : ''}" x="${(i * bw + 0.5).toFixed(1)}" y="${(H - 10 - h).toFixed(1)}" width="${(bw - 1.2).toFixed(1)}" height="${h.toFixed(1)}" rx="1" data-tip="${y}: ${v} días de más de 40 °C"/>`;
  }).join('');
  const falta = sum(c, m => m.et0) - sum(c, m => m.lluvia);
  $('#stats').innerHTML = `
    <div class="card stat"><span class="lbl">Días de más de 40 °C por año ${cf('temp')}</span>
      <span class="big">${nf(d40n)} <small>→</small> ${nf(d40r)}</span>
      <span class="sub">Promedio 1991–2020 contra 2021–2025. Cada barra es un año desde 1981.</span>
      <svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Días de más de 40 °C por año, 1981 a 2025">${bars}
        <text class="ax" x="0" y="${H}">1981</text><text class="ax" x="${W}" y="${H}" text-anchor="end">2025</text></svg></div>
    <div class="card stat"><span class="lbl">Agua que falta en el año ${cf('balance')}</span>
      <span class="big">${nf(falta)} <small>mm</small></span>
      <span class="sub">Llueven ${nf(sum(c, m => m.lluvia))} mm y la demanda de agua es ${nf(sum(c, m => m.et0))} mm (${nombrePeriodo()}${escenario() ? ', con escenario' : ''}).</span></div>
    <div class="card stat"><span class="lbl">Época de heladas ${cf('helada')}</span>
      <span class="big">${z.helada_primera.slice(0,5)} <small>a</small> ${z.helada_ultima.slice(0,5)}</span>
      <span class="sub">Primera y última helada típicas (mínima de 3 °C o menos), 1991–2020.</span></div>
    <div class="card stat"><span class="lbl">Racha más larga sin lluvia útil ${cf('racha')}</span>
      <span class="big">${z.racha_seca[0]} <small>días</small></span>
      <span class="sub">Menos de 2 mm por día; terminó el ${z.racha_seca[1]}. Récord de calor: ${nf(z.record_tmax[0],1)} °C el ${z.record_tmax[1]}.</span></div>`;
}
function renderCalendario(){
  const c = clima(), rots = ROT[state.zona];
  const z = ZONAS[state.zona];
  $('#calLede').textContent = `Zona ${z.num} · ${z.nombre}. Promedios por mes de ${nombrePeriodo()} con datos diarios de NASA POWER, y cómo queda el suelo en cada rotación.`;
  let h = `<div></div>` + MES.map((m,i) => `<div class="h" title="${MES_L[i]}">${m}</div>`).join('');
  const fila = (label, sub, cells) => h += `<div class="rl"><span>${label} ${cf(CONF_FILA[label] || 'rot')}</span><small>${sub}</small></div>` + cells.join('');
  const txt = (pct) => pct > 55 ? 'color:var(--on-strong)' : '';
  fila('Calor de más de 35 °C', 'días por mes', c.map((m,i) => { const p = Math.min(100, m.d35 / 28 * 100);
    return `<div class="cell" style="background:${mix('--heat', p)};${txt(p)}" data-tip="${MES_L[i]}: ${nf(m.d35,1)} días de más de 35 °C\nMáxima media ${nf(m.tmax,1)} °C">${m.d35 >= 0.5 ? nf(m.d35) : ''}</div>`; }));
  fila('Calor de más de 40 °C', 'días por mes', c.map((m,i) => { const p = Math.min(100, m.d40 / 12 * 100);
    return `<div class="cell" style="background:${mix('--heat', p)};${txt(p)}" data-tip="${MES_L[i]}: ${nf(m.d40,1)} días de más de 40 °C">${m.d40 >= 0.5 ? nf(m.d40) : ''}</div>`; }));
  fila('Helada', 'días con mínima ≤ 3 °C', c.map((m,i) => { const p = Math.min(100, m.helada / 8 * 100);
    return `<div class="cell" style="background:${mix('--frost', p)};${txt(p)}" data-tip="${MES_L[i]}: ${nf(m.helada,1)} días con helada\nHeló al menos un día (≤ 0 °C) en el ${m.probHelada} % de los años">${m.helada >= 0.5 ? nf(m.helada) : ''}</div>`; }));
  const maxR = Math.max(...c.map(m => m.p90), 1);
  fila('Lluvia', 'mm por mes · línea: años secos a húmedos', c.map((m,i) =>
    `<div class="cell tall" data-tip="${MES_L[i]}: ${nf(m.lluvia)} mm en promedio\n1 de cada 10 años, menos de ${nf(m.p10)} mm\n1 de cada 10 años, más de ${nf(m.p90)} mm">
      <span class="whisk" style="bottom:${m.p10 / maxR * 100}%;height:${(m.p90 - m.p10) / maxR * 100}%"></span>
      <span class="bar" style="height:${m.lluvia / maxR * 100}%"></span><span class="v">${nf(m.lluvia)}</span></div>`));
  const maxB = Math.max(...c.map(m => Math.abs(m.balance)), 1);
  fila('Lluvia menos demanda', 'mm: abajo falta agua', c.map((m,i) => {
    const hgt = Math.abs(m.balance) / maxB * 48;
    return `<div class="cell tall" data-tip="${MES_L[i]}: llueven ${nf(m.lluvia)} mm y la demanda es ${nf(m.et0)} mm\nBalance ${signo(m.balance)} mm"><span class="zero"></span>
      <span class="bal ${m.balance < 0 ? 'neg' : 'pos'}" style="height:${hgt}%"></span></div>`; }));
  h += `<div class="grp">Cómo queda el suelo en cada rotación (año tipo)</div>`;
  for (const r of rots){
    fila(r.tipo, r.nombre, [...r.cal].map((s,i) =>
      `<div class="cell st st-${s}" data-tip="${r.tipo} · ${MES_L[i]}\n${ESTADO[s].label}${s === 'D' && c[i].tormentas > 0.05 ? `\nTormentas de más de 30 mm: ${nf(c[i].tormentas,1)} por año` : ''}"></div>`));
  }
  $('#cal').innerHTML = h;
  $('#legend').innerHTML = `<span><i class="sw" style="background:${mix('--heat',70)}"></i>Días de calor</span>
    <span><i class="sw" style="background:${mix('--frost',70)}"></i>Días de helada</span>
    <span><i class="sw" style="background:var(--rain)"></i>Lluvia</span>
    <span><i class="sw" style="background:var(--deficit)"></i>Falta agua</span>` +
    Object.entries(ESTADO).map(([k,e]) => `<span><i class="sw st-${k}"></i>${e.label}</span>`).join('');
  $('#tabla').innerHTML = `<table><thead><tr><th>Mes</th><th>Máx. °C</th><th>Mín. °C</th><th>Días &gt;35</th><th>Días &gt;40</th><th>Heladas</th><th>Lluvia mm</th><th>Demanda mm</th><th>Balance mm</th><th>Humedad raíces</th></tr></thead><tbody>` +
    c.map((m,i) => `<tr><td>${MES_L[i]}</td><td>${nf(m.tmax,1)}</td><td>${nf(m.tmin,1)}</td><td>${nf(m.d35,1)}</td><td>${nf(m.d40,1)}</td><td>${nf(m.helada,1)}</td><td>${nf(m.lluvia)}</td><td>${nf(m.et0)}</td><td>${signo(m.balance)}</td><td>${m.humedad == null ? '—' : nf(m.humedad * 100) + ' %' + (state.periodo === 'reciente' && m.humedadAnom != null ? ' (' + signo(m.humedadAnom * 100) + ')' : '')}</td></tr>`).join('') +
    `<tr><td><b>Año</b></td><td></td><td></td><td>${nf(sum(c,m=>m.d35))}</td><td>${nf(sum(c,m=>m.d40))}</td><td>${nf(sum(c,m=>m.helada))}</td><td>${nf(sum(c,m=>m.lluvia))}</td><td>${nf(sum(c,m=>m.et0))}</td><td>${signo(sum(c,m=>m.balance))}</td><td></td></tr></tbody></table>`;
  const chip = $('#escChip');
  chip.hidden = !escenario();
  if (escenario()) chip.innerHTML = `<strong>Escenario activo:</strong> lluvia ${state.dP > 0 ? '+' : ''}${state.dP} %, temperatura +${nf(state.dT,1)} °C <button type="button" id="escReset">Volver a lo normal</button>`;
  renderInsights(c);
}
function renderInsights(c){
  const z = CLIMA[state.zona], actual = ROT[state.zona][0];
  let peor = 0, pv = -1;
  c.forEach((m,i) => { const v = m.d35 * (m.med < 25 ? 2 : 1) - m.lluvia / 50; if (v > pv && m.med < 40){ pv = v; peor = i; } });
  const pel = [...actual.cal].flatMap((s,i) => s === 'D' ? [MES_L[i]] : []);
  const tormPel = [...actual.cal].reduce((a,s,i) => a + (s === 'D' ? c[i].tormentas : 0), 0);
  const humedo = c.reduce((b,m,i) => m.lluvia > c[b].lluvia ? i : b, 0);
  $('#insights').innerHTML = `
    <div class="ins" style="--ins:var(--heat)"><strong>El mes más peligroso: ${MES_L[peor]}</strong>
      Llueven ${nf(c[peor].lluvia)} mm y ya hay ${nf(c[peor].d35)} días de más de 35 °C. Un suelo pelado se calienta y se seca.</div>
    <div class="ins" style="--ins:var(--rain)"><strong>La lluvia llega de golpe</strong>
      El mes más lluvioso es ${MES_L[humedo]}, con ${nf(c[humedo].lluvia)} mm. Si cae sobre suelo pelado, escurre en vez de entrar.</div>
    <div class="ins" style="--ins:var(--st-desnudo)"><strong>Tu rotación de hoy deja ${pel.length} meses pelado</strong>
      ${pel.length ? `De ${pel[0]} a ${pel[pel.length - 1]}, con ${nf(tormPel,1)} tormentas de más de 30 mm por año en esos meses.` : 'No deja meses de suelo pelado.'}</div>
    <div class="ins" style="--ins:var(--frost)"><strong>Heladas entre ${z.helada_primera.slice(0,5)} y ${z.helada_ultima.slice(0,5)}</strong>
      ${nf(sum(c, m => m.helada))} días de helada por año. Cuidado con coberturas o siembras tempranas en esa ventana.</div>`;
}
function renderPaneles(){
  // Suelo (AIZAL V4, de Santi)
  const sz = (SUELO_Z.zonas || {})[state.zona] || {};
  let haySuelo = false;
  $('#soil').innerHTML = SUELO.map(([n, campo, unidad, cod, why]) => {
    const d = sz[campo] || {}, v = d.valor;
    const tiene = v !== null && v !== undefined;
    if (tiene) haySuelo = true;
    const conf = d.confianza ? ` <span class="conf ${esc(d.confianza)}" data-tip="Confianza informada en data/suelo_zonas.json">${esc(d.confianza)}</span>` : '';
    return `<div><dt>${n}</dt><dd>${tiene ? nf(v, 1) + (unidad ? ' ' + unidad : '') : 'sin dato'} · ${cod}${conf}</dd><span class="why">${why}</span></div>`;
  }).join('');
  $('#soilNota').textContent = haySuelo
    ? `Fuente: ${(SUELO_Z.meta && SUELO_Z.meta.fuente) || 'AIZAL V4'}.`
    : 'Sin datos todavía. Los carga Santi desde AIZAL V4 (SoilGrids, TerraClimate, MapBiomas).';

  // Satélite e IA (de Santi)
  const dz = (DIAG.zonas || {})[state.zona] || {};
  const mp = Array.isArray(dz.meses_suelo_pelado) && dz.meses_suelo_pelado.length === 12 ? dz.meses_suelo_pelado : null;
  $('#miniSat').innerHTML = MES.map((m, i) => mp
    ? `<span class="${mp[i] ? 'st-D' : ''}" data-tip="${MES_L[i]}: ${mp[i] ? 'suele estar pelado' : 'suele estar cubierto'}"></span>`
    : '<span>?</span>').join('');
  $('#miniSatLbl').innerHTML = MES.map(m => `<span>${m[0]}</span>`).join('');
  const ev = DIAG.evaluacion || {}, met = ev.metodos || {};
  const NOMBRES = {umbral_ndvi_nbr:'Umbral de NDVI y NBR', cnn_lstm:'CNN + LSTM', cnn_transformer:'CNN + Transformer'};
  const num = v => v === null || v === undefined ? '—' : nf(v, 2);
  $('#metodos').innerHTML = Object.entries(NOMBRES).map(([k, n]) => {
    const x = met[k] || {};
    return `<tr><td>${n}${k === ev.metodo_elegido ? ' ✓' : ''}</td><td>${num(x.exactitud)}</td><td>${num(x.f1)}</td></tr>`;
  }).join('');
  $('#satNota').textContent = mp
    ? `Método usado: ${NOMBRES[ev.metodo_elegido] || 'sin definir'}. Etiquetas: ${(DIAG.meta && DIAG.meta.etiquetas) || 'sin dato'}.`
    : 'Pendiente. Lo calcula Santi con etiquetas reales de MapBiomas Chaco; la app usa el método que mejor mida. Las imágenes reales ya se ven en el visor del lote, arriba.';

  // Sensor en tierra (lecturas grabadas por Sara)
  $('#trays').innerHTML = Object.entries(BANDEJAS).map(([k, b]) =>
    `<button type="button" aria-pressed="${k === state.bandeja}" data-bandeja="${k}">${b.nombre}</button>`).join('');
  const b = BANDEJAS[state.bandeja];
  const lect = (ARDUINO && ARDUINO.bandejas && ARDUINO.bandejas[b.clave]) || [];
  const u = state.vivo || (lect.length ? lect[lect.length - 1] : null);
  const val = (v, suf = '') => v === null || v === undefined ? '—' : (typeof v === 'number' ? nf(v, Number.isInteger(v) ? 0 : 1) : esc(v)) + suf;
  $('#read').innerHTML = `<div><b>${val(u && u.temp_suelo_c, ' °C')}</b><span>Temperatura del suelo (LM35)</span></div>
    <div><b>${val(u && u.agua_raw)}</b><span>Humedad y conductividad (0 a 1023)</span></div>
    <div><b>${val(u && u.luz_raw)}</b><span>Luz al ras del suelo (0 a 1023)</span></div>
    <div><b>${val(u && u.temp_aire_c, ' °C')} · ${val(u && u.hum_aire_pct, ' %')}</b><span>Aire (DHT11)</span></div>`;
  const sem = u && u.semaforo;
  $('#semaforo').innerHTML = `<span class="luces" aria-hidden="true"><i class="r ${sem === 'rojo' ? 'on' : ''}"></i><i class="a ${sem === 'amarillo' ? 'on' : ''}"></i><i class="v ${sem === 'verde' ? 'on' : ''}"></i></span>`
    + `<span>${sem ? '<strong>' + esc(sem.charAt(0).toUpperCase() + sem.slice(1)) + '</strong>' : 'Sin lecturas todavía.'}</span>`;
  const c = clima();
  $('#vs').innerHTML = `<strong>Espacio contra tierra</strong>
    <span>NASA POWER ve tu zona en celdas de 50 km: en enero la máxima media del aire es ${nf(c[0].tmax, 1)} °C.</span>
    <span>El sensor mide un metro cuadrado${u && u.temp_suelo_c != null ? `: la bandeja marca ${val(u.temp_suelo_c, ' °C')} en el suelo` : ''}. Juntos dicen cuánto pesa la cobertura.</span>`;
  botonArduino();
  $('#linkKit').href = 'kit.html?zona=' + encodeURIComponent(state.zona);
  $('#sensorNota').textContent = state.vivo ? 'En vivo desde el Arduino (Web Serial).' : lect.length
    ? `Lecturas grabadas del kit (${(ARDUINO.meta && ARDUINO.meta.fecha) || 'sin fecha'}).`
    : 'Sin lecturas grabadas todavía: las carga Sara. En la demo se leen en vivo por Web Serial.';
}

/* ---------- Paso 3 ---------- */
function renderCards(){
  const c = clima(), rk = ranking();
  const z = ZONAS[state.zona];
  const prios = PRIO.filter(p => state.prio.has(p.id)).map(p => p.label.toLowerCase());
  $('#cmpLede').textContent = prios.length
    ? `Zona ${z.num}. Ordenadas según lo que marcaste: ${prios.join(', ')}.`
    : `Zona ${z.num}. Marcá al menos una prioridad en el paso 1 para ordenarlas.`;
  $('#cmpLede').textContent += ' ' + (FUENTE_ROT[state.zona] || '');
  if (nivelDesmonte().nivel === 'alta') $('#cmpLede').textContent += ' Tu zona tiene presión de desmonte alta: conviene priorizar las rotaciones que conservan el monte.';
  $('#cards').innerHTML = rk.map(({r, p}, idx) => {
    const m = metricas(r, c);
    const t = trade(r, c), fq = frecuencia(r);
    const lista = a => a.map(x => `<li>${esc(x)}</li>`).join('');
    const bloqueTrade = t.base
      ? `<div class="tradeoff base"><p>Es tu punto de partida: las otras dos rotaciones se comparan contra esta.</p></div>`
      : `<div class="tradeoff"><div class="gana"><h4>Lo que ganás</h4><ul>${lista(t.gana) || '<li>Poco, frente a lo que hacés hoy</li>'}</ul></div><div class="cuesta"><h4>Lo que te cuesta</h4><ul>${lista(t.cuesta)}</ul></div></div>`;
    const bloqueRiesgo = `<div class="riesgo"><h4>Riesgo en años reales ${cf('expo')}</h4>
      <p>Año típico: <b>${fq.med}</b> días de más de 40 °C con el cultivo en pie. En 1 de cada 5 años: <b>${fq.p80} o más</b>.</p>
      <p>${fq.pelado ? `Tormentas de más de 30 mm sobre suelo pelado: en <b>${Math.round(fq.conTorm / fq.n * 10)} de cada 10 años</b> hubo al menos una.` : 'No deja suelo pelado: las tormentas caen sobre suelo cubierto.'}</p>
      <p class="hint">${fq.n} años de NASA POWER (${nombrePeriodo()})${fq.n < 10 ? '; con tan pocos años es una estimación gruesa' : ''}${escenario() ? ', con el escenario del paso 4' : ''}.</p></div>`;
    const falta0 = r.falta[0].charAt(0).toLowerCase() + r.falta[0].slice(1);
    const bloqueSeguro = `<p class="seguro"><strong>¿Qué tan seguros estamos?</strong> Clima ${cf('temp')} · año tipo de la rotación ${cf('rot')} · puntaje ${cf('puntaje')}. Lo que más podría cambiar esta recomendación: ${esc(falta0)}.</p>`;
    const seq = r.seq.map(x => `<span class="crop"><span class="sec-l" title="Sección ${x.s}">${x.s}</span>${esc(x.n)}</span>`).join('<span class="arrow" aria-hidden="true">→</span>');
    const strip = [...r.cal].map((s,i) => `<span class="st-${s}" data-tip="${MES_L[i]}: ${ESTADO[s].label}"></span>`).join('');
    const pr = p.det.map(d => `<div><span>${d.p.label}${d.nota ? ` <em class="hint">(${d.nota})</em>` : ''}</span><span class="dots" aria-label="${d.v} de 3">${[0,1,2].map(k => `<i class="${k < d.v ? 'on' : ''}"></i>`).join('')}</span></div>`).join('');
    const reg = reglas(r).map(([t, ok]) => `<li><span class="${ok === null ? 'na' : ok ? 'ok' : 'no'}" aria-hidden="true">${ok === null ? '–' : ok ? '✓' : '✗'}</span><span>${t}${ok === null ? ' (no aplica)' : ''}</span></li>`).join('');
    const evid = [
      m.pelados ? `Deja ${m.pelados} meses de suelo pelado (${m.mesesPel.map(i => MES[i]).join(', ')}), con ${nf(m.tormentas,1)} tormentas de más de 30 mm por año en esos meses (NASA POWER, ${nombrePeriodo()}).` : `No deja meses de suelo pelado en el año tipo.`,
      `Días de más de 40 °C con el cultivo en pie: ${nf(m.calor,1)} por año (NASA POWER, ${nombrePeriodo()}${escenario() ? ', con escenario' : ''}).`,
      ...r.evid
    ];
    return `<article class="card rot ${p.viable ? '' : 'off'}">
      <div class="rot-h"><span class="rank">${idx + 1}<sup>º</sup></span><span class="kind">${r.tipo}</span><h3>${esc(r.nombre)}</h3></div>
      <div class="seq">${seq}</div>
      <div><div class="strip">${strip}</div><div class="strip-lbl">${MES.map(x => `<span>${x[0]}</span>`).join('')}</div></div>
      <div class="score"><div class="score-top"><span>Cuánto se ajusta a tus prioridades ${cf('puntaje')}</span><b>${p.pct === null ? '—' : p.pct + ' %'}</b></div>
        <div class="meter"><i style="width:${p.pct ?? 0}%"></i></div><div class="prio-rows">${pr}</div></div>
      ${p.avisos.length ? `<div class="avisos">${p.avisos.map(([t,x]) => `<span class="aviso ${t}">${t === 'crit' ? '⛔' : '⚠'} ${x}</span>`).join('')}</div>` : ''}
      <div class="expo">
        <div><b>${m.pelados}</b><span>meses de suelo pelado</span></div>
        <div><b>${nf(m.calor,1)}</b><span>días de más de 40 °C con cultivo en pie</span></div>
        <div><b>${nf(m.tormentas,1)}</b><span>tormentas fuertes sobre suelo pelado</span></div>
      </div>
      ${bloqueTrade}
      ${bloqueRiesgo}
      <ul class="reglas">${reg}</ul>
      <div class="cinco">
        <div><h4>1 · Por qué se sugiere</h4><p>${esc(r.porque)}</p></div>
        <div><h4>2 · Qué evidencia la respalda</h4><ul>${evid.map(e => `<li>${e}</li>`).join('')}</ul></div>
        <div><h4>3 · Qué beneficios puede dar</h4><ul>${r.benef.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div><h4>4 · Qué falta saber</h4><ul>${r.falta.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div><h4>5 · Riesgos para revisar en el lugar</h4><ul>${r.riesgo.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>
      ${bloqueSeguro}
    </article>`;
  }).join('');
}

/* ---------- Paso 4 ---------- */
function renderSim(){
  $('#simP').value = state.dP; $('#simT').value = state.dT;
  $('#simPout').textContent = `${state.dP > 0 ? '+' : ''}${state.dP} %`;
  $('#simTout').textContent = `+${nf(state.dT,1)} °C`;
  const b = clima(state.periodo, 0, 0), e = clima();
  const fila = (lbl, vb, ve, unidad, peorSiSube = true, d = 0) => {
    const dif = ve - vb, cls = Math.abs(dif) < 0.05 ? '' : ((dif > 0) === peorSiSube ? 'delta-up' : 'delta-down');
    return `<div><span>${lbl}</span><b>${nf(vb,d)} → <span class="${cls}">${nf(ve,d)}</span></b><span>${unidad}</span></div>`;
  };
  const rows = ROT[state.zona].map(r => {
    const mb = metricas(r, b), me = metricas(r, e);
    const d = me.calor - mb.calor;
    return `<tr><td>${r.tipo}: ${esc(r.nombre)}</td><td>${mb.pelados}</td><td>${nf(mb.calor,1)} → <span class="${d > 0.05 ? 'delta-up' : ''}">${nf(me.calor,1)}</span></td><td>${nf(mb.tormentas,1)} → ${nf(me.tormentas,1)}</td></tr>`;
  }).join('');
  $('#simOut').innerHTML = `
    <div><h3>Tu zona en el año (${nombrePeriodo()})</h3><p class="hint">Antes → con el escenario elegido.</p></div>
    <div class="anual">
      ${fila('Días de más de 35 °C', sum(b,m=>m.d35), sum(e,m=>m.d35), 'por año')}
      ${fila('Días de más de 40 °C', sum(b,m=>m.d40), sum(e,m=>m.d40), 'por año')}
      ${fila('Lluvia', sum(b,m=>m.lluvia), sum(e,m=>m.lluvia), 'mm por año', false)}
      ${fila('Agua que falta', -sum(b,m=>m.balance), -sum(e,m=>m.balance), 'mm por año')}
    </div>
    <div class="tabla-scroll"><table>
      <thead><tr><th>Rotación</th><th>Meses pelado</th><th>Días &gt;40 °C con cultivo</th><th>Tormentas sobre suelo pelado</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <p class="hint">Con más calor, las rotaciones con cultivo en pie en diciembre y enero suman más días de estrés. Las que tapan el suelo con pastura o rastrojo no cambian sus meses pelados.</p>`;
}

/* ---------- Paso 5 ---------- */
function renderDecidir(){
  const rk = ranking();
  if (!rk.some(x => x.r.id === state.elegida)) state.elegida = rk[0].r.id;
  $('#elegir').innerHTML = rk.map(({r, p}, i) => `<label class="radio"><input type="radio" name="elegida" value="${r.id}" ${r.id === state.elegida ? 'checked' : ''}>
    <span><strong>${i + 1}º · ${esc(r.nombre)}</strong><small>${r.tipo}${p.pct !== null ? ` · ${p.pct} % de ajuste` : ''}</small></span></label>`).join('');
  const r = ROT[state.zona].find(x => x.id === state.elegida);
  const items = [
    ...r.falta.map(t => [t, 'Qué falta saber']),
    ...r.riesgo.map(t => ['Revisar: ' + t.charAt(0).toLowerCase() + t.slice(1), 'Riesgo']),
    ['Análisis de suelo: pH, salinidad (conductividad), sodio y N-P-K', 'El satélite no lo mide'],
    ['Prueba de pala a 25–30 cm para ver si hay piso de arado', 'El satélite no lo mide'],
    ['Herbicidas usados en los últimos 24 meses que puedan dañar el cultivo nuevo', 'Tu cuaderno de campo'],
    ['Comprador o acopio a menos de 50 km para lo que vas a cosechar', 'Mercado'],
    ['Semilla e inoculante disponibles a tiempo', 'Logística']
  ];
  $('#listaTitulo').textContent = `${r.nombre} · Zona ${ZONAS[state.zona].num}`;
  $('#checklist').innerHTML = items.map(([t, who], i) => `<li><label><input type="checkbox" id="chk-${i}"><span>${esc(t)}<span class="who">${who}</span></span></label></li>`).join('');
  $('#listaTxt').value = `BioSat · Lista para revisar con el agrónomo\n${r.nombre} (Zona ${ZONAS[state.zona].num}: ${ZONAS[state.zona].nombre})\n\n` + items.map(([t]) => `[ ] ${t}`).join('\n');
}

/* ---------- Render general y eventos ---------- */
function renderTodo(){ renderTuCampo(); renderStats(); renderCalendario(); renderPaneles(); renderDesmonte(); renderTrade(); renderCards(); renderSim(); renderDecidir(); renderVisor(); }
function renderClima(){ renderStats(); renderCalendario(); renderPaneles(); renderTrade(); renderCards(); renderSim(); }
document.addEventListener('click', e => {
  const cb = e.target.closest('[data-capa]');
  if (cb){ visor.capa = cb.dataset.capa; visor.cmp = 'no'; renderVisor(); return; }
  const mb = e.target.closest('[data-cmp]');
  if (mb){ visor.cmp = mb.dataset.cmp; renderVisor(); }
});
$('#cortina').addEventListener('input', e => { visor.cortina = Number(e.target.value); aplicarCortina(); });
document.addEventListener('click', e => {
  if (e.target.closest('[data-zonif]')){ visor.zonif = !visor.zonif; renderVisor(); }
});
$('#btnArduino').addEventListener('click', async () => {
  try {
    await window.BioSatArduino.conectar(lectura => { state.vivo = lectura; renderPaneles(); });
  } catch (err) {
    $('#sensorNota').textContent = 'No se pudo conectar el Arduino: ' + err.message;
  }
});


document.addEventListener('click', e => {
  if (e.target.closest('#btnCambiar')){ abrirAsistente(); return; }
  const tb = e.target.closest('[data-bandeja]');
  if (tb){ state.bandeja = tb.dataset.bandeja; renderPaneles(); return; }
  const ps = e.target.closest('#presets button');
  if (ps){ state.dP = Number(ps.dataset.p); state.dT = Number(ps.dataset.t); renderClima(); return; }
  if (e.target.closest('#escReset')){ state.dP = 0; state.dT = 0; renderClima(); return; }
});
$('#simP').addEventListener('input', e => { state.dP = Number(e.target.value); renderClima(); });
$('#simT').addEventListener('input', e => { state.dT = Number(e.target.value); renderClima(); });
$('#perNormal').addEventListener('click', () => { state.periodo = 'normal'; $('#perNormal').setAttribute('aria-pressed','true'); $('#perReciente').setAttribute('aria-pressed','false'); renderClima(); });
$('#perReciente').addEventListener('click', () => { state.periodo = 'reciente'; $('#perReciente').setAttribute('aria-pressed','true'); $('#perNormal').setAttribute('aria-pressed','false'); renderClima(); });
$('#elegir').addEventListener('change', e => { if (e.target.name === 'elegida'){ state.elegida = e.target.value; renderDecidir(); } });
$('#copiar').addEventListener('click', () => {
  const txt = $('#listaTxt').value, ok = () => { $('#copiado').textContent = 'Lista copiada.'; };
  try {
    navigator.clipboard.writeText(txt).then(ok, () => { const t = $('#listaTxt'); t.hidden = false; t.select(); $('#copiado').textContent = 'Seleccioná el texto y copialo.'; });
  } catch (err) { const t = $('#listaTxt'); t.hidden = false; t.select(); $('#copiado').textContent = 'Seleccioná el texto y copialo.'; }
});

// Tooltip
const tip = $('#tip');
function moverTip(e){ const w = tip.offsetWidth, h = tip.offsetHeight; let x = e.clientX + 14, y = e.clientY + 14;
  if (x + w > innerWidth - 8) x = e.clientX - w - 14; if (y + h > innerHeight - 8) y = e.clientY - h - 14;
  tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px'; }
document.addEventListener('pointerover', e => { const t = e.target.closest('[data-tip]'); if (!t){ tip.hidden = true; return; } tip.textContent = t.dataset.tip; tip.hidden = false; moverTip(e); });
document.addEventListener('pointermove', e => { if (!tip.hidden) moverTip(e); });
document.addEventListener('scroll', () => { tip.hidden = true; }, {passive:true});

// Paso activo en la barra
const links = [...document.querySelectorAll('.steps a')];
if ('IntersectionObserver' in window){
  const io = new IntersectionObserver(ents => {
    ents.forEach(en => { if (en.isIntersecting) links.forEach(a => { if (a.dataset.sec === en.target.id) a.setAttribute('aria-current','step'); else a.removeAttribute('aria-current'); }); });
  }, {rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('main > section').forEach(s => io.observe(s));
}
links[0].setAttribute('aria-current','step');

/* ---------- Carga de datos (docs/contratos-de-datos.md) ---------- */
async function cargarJSON(ruta){
  const r = await fetch(ruta, {cache:'no-cache'});
  if (!r.ok) throw new Error(`${ruta}: ${r.status}`);
  return r.json();
}

// Clima: de data/clima_zonas.json al formato interno de la app
function adaptarClima(j){
  const out = {};
  const mes = m => ({tmax:m.tmax_c, tmin:m.tmin_c, lluvia:m.lluvia_mm.media, lluvia_p10:m.lluvia_mm.p10,
    lluvia_med:m.lluvia_mm.mediana, lluvia_p90:m.lluvia_mm.p90, tormentas30:m.tormentas_30mm,
    helada3:m.dias_helada_3c, prob_helada0:m.prob_helada_pct, d35:m.dias_calor_35, d40:m.dias_calor_40,
    et0:m.et0_mm, humedad:m.humedad_raices, humedadAnom:m.humedad_raices_anomalia});
  const anio = a => ({a:a.anio, d40:a.dias_calor_40, t30:a.tormentas_30mm});
  for (const [id, z] of Object.entries(j.zonas)){
    out[id] = {lat:z.lat, lon:z.lon,
      normal:z.periodos.normal.meses.map(mes), reciente:z.periodos.reciente.meses.map(mes),
      anios:{normal:z.periodos.normal.anios.map(anio), reciente:z.periodos.reciente.anios.map(anio)},
      helada_primera:z.anual.primera_helada_tipica || '—', helada_ultima:z.anual.ultima_helada_tipica || '—',
      record_tmax:[z.anual.record_tmax.c, z.anual.record_tmax.fecha],
      racha_seca:[z.anual.racha_seca_max.dias, z.anual.racha_seca_max.termino],
      d40_por_anio:z.serie_dias_calor_40.valores};
  }
  return out;
}

// Rotaciones: del contrato (§4) al formato interno. Los puntajes salen de reglas fijas y visibles.
const EST = {cultivo:'C', cobertura:'V', rastrojo:'R', desnudo:'D'};
function adaptarRotaciones(lista){
  let alt = 0;
  return lista.map(r => {
    const cal = (r.calendario || []).map(s => EST[s] || 'D').join('');
    const meses = [...cal], completo = meses.length === 12;
    const pelados = meses.filter(s => s === 'D').length;
    const cubiertosSeca = [4, 5, 6, 7, 8, 9].filter(i => meses[i] && meses[i] !== 'D').length;  // mayo a octubre
    const at = r.atributos || {};
    const secciones = new Set((r.secuencia || []).map(x => x.seccion));
    const sumaLeguminosa = at.aporte_nitrogeno === 'positivo' && secciones.size >= 2 ? 1 : 0;
    return {
      id:r.id, tipo:r.tipo === 'actual' ? 'Actual' : `Alternativa ${++alt}`, nombre:r.nombre || 'Sin nombre',
      seq:(r.secuencia || []).map(x => ({n:x.cultivo, s:x.seccion})),
      cal,
      attr:{
        agua:{baja:3, media:2, alta:1}[at.demanda_agua] ?? null,
        salitre:completo ? Math.round(cubiertosSeca / 6 * 3) : null,
        suelo:completo ? Math.min(3, Math.round((12 - pelados) / 12 * 2) + sumaLeguminosa) : null,
        forraje:at.forraje === true ? 3 : at.forraje === false ? 0 : null,
        ingreso:{alto:3, medio:2, bajo:1}[at.ingreso] ?? null
      },
      req:{riego:!!at.requiere_riego, ganado:!!at.requiere_hacienda,
        maquinaria:!!at.maquinaria_especial && at.maquinaria_especial !== 'ninguna'},
      porque:r.por_que || 'Sin dato.',
      evid:(r.evidencia || []).map(e => `${esc(e.texto)} <span class="cita">${e.fuente ? 'Fuente: ' + esc(e.fuente) : 'Fuente a citar.'}</span>`),
      benef:(r.beneficios && r.beneficios.length) ? r.beneficios : ['Sin dato.'],
      falta:(r.que_falta_saber && r.que_falta_saber.length) ? r.que_falta_saber : ['Sin dato.'],
      riesgo:(r.riesgos_revision_local && r.riesgos_revision_local.length) ? r.riesgos_revision_local : ['Sin dato.']
    };
  });
}

// Imágenes del visor: primero las de Earth Engine (Santi), si no las de Planetary Computer (web/img)
const CAPAS_ID = ['invierno_rgb', 'verano_rgb', 'invierno_ndvi', 'verano_ndvi', '2000_rgb'];
async function cargarImagenes(){
  const opciones = [['../data/imagenes/', 'png', 'Google Earth Engine'], ['img/', 'webp', 'Microsoft Planetary Computer']];
  for (const [base, ext, fuente] of opciones){
    try {
      const meta = await cargarJSON(base + 'escenas.json');
      const out = {};
      for (const [z, m] of Object.entries(meta)){
        const img = {};
        for (const c of CAPAS_ID){
          const k = c.startsWith('2000') ? 'anio2000' : c.split('_')[0];
          if (m[k]) img[c] = `${base}${z}_${c}.${ext}`;
        }
        out[z] = {meta:m, img};
      }
      FUENTE_IMG = fuente;
      return out;
    } catch (e) { /* se prueba la siguiente fuente */ }
  }
  return {};
}

async function cargarDatos(){
  const [clima, rotVale, rotBorrador, suelo, diag, arduino, zonif, desmonte] = await Promise.all([
    cargarJSON('../data/clima_zonas.json'),
    cargarJSON('../data/rotaciones_santiago.json').catch(() => ({zonas:{}})),
    cargarJSON('datos-borrador/rotaciones_borrador.json'),
    cargarJSON('../data/suelo_zonas.json').catch(() => ({})),
    cargarJSON('../data/diagnostico_landsat_ia.json').catch(() => ({})),
    cargarJSON('../data/arduino_bandejas_demo.json').catch(() => null),
    cargarJSON('../data/zonificacion_aizal.json').catch(() => ({})),
    cargarJSON('../data/desmonte_zonas.json').catch(() => ({}))
  ]);
  CLIMA = adaptarClima(clima);
  SUELO_Z = suelo; DIAG = diag; ARDUINO = arduino; ZONIF = zonif; DESMONTE = desmonte;
  for (const z of Object.keys(ZONAS)){
    const v = (rotVale.zonas || {})[z], b = (rotBorrador.zonas || {})[z];
    const deVale = v && Array.isArray(v.rotaciones) && v.rotaciones.length >= 3;
    ROT[z] = adaptarRotaciones(((deVale ? v : b) || {}).rotaciones || []);
    FUENTE_ROT[z] = deVale
      ? `Rotaciones cargadas por Vale (${v.validado_por || 'sin validar'}).`
      : 'Rotaciones: borrador del equipo, sin validar todavía.';
  }
  IMG = await cargarImagenes();
}

cargarDatos().then(() => {
  iniciarRespuestas();
  renderTodo();
  if (window.AsistenteLogica && AsistenteLogica.debeAbrir(respuestas, location.search)) abrirAsistente();
}).catch(err => {
  console.error(err);
  document.querySelector('main').insertAdjacentHTML('afterbegin',
    `<div class="wrap"><div class="aviso-carga"><strong>No se pudieron cargar los datos.</strong>
     <p>Abrí la app con un servidor: desde la carpeta del repositorio corré <code>python -m http.server 8000</code> y entrá a <code>http://localhost:8000/web/</code>, o usá el link de GitHub Pages.</p>
     <p class="hint">Detalle: ${esc(err.message)}</p></div></div>`);
});

