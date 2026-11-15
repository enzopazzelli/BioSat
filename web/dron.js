/* BioSat · lector de imágenes de dron en el navegador (D-38).
   Lee un GeoTIFF con geotiff.js (de a partes y achicado), lo ubica con proj4js y lo dibuja en un canvas.
   El archivo nunca sale del equipo y no se guarda. La lógica pura está en dron-logica.js.
   Lee de app.js (mismo ámbito global): CLIMA, DIAG y MAPA.
   Diseño: docs/superpowers/specs/2026-11-15-lector-dron-design.md. */
(function () {
  const L = window.DronLogica;
  const MAX_LADO = 2048;
  // Colores del NDVI: los mismos que Landsat (ia_desmonte/imagenes.py y .ramp de estilos.css), de 0 a 0,8.
  const RAMPA = {min: 0, max: 0.8, colores: ['#a50026', '#f46d43', '#fee08b', '#d9ef8b', '#66bd63', '#006837']
    .map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)))};

  let estado = null, datos = null;
  const oyentes = [];
  const $ = s => document.querySelector(s);
  const T = () => L.TEXTOS;
  const fmt = (t, d) => String(t).replace(/\{(\w+)\}/g, (_, k) => d[k]);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);

  function avisar(motivo) {
    renderCaja();
    oyentes.forEach(fn => { try { fn(motivo); } catch (e) { console.error(e); } });
  }

  // ---------- Dibujo ----------
  function lienzo(ancho, alto, pintar) {
    const c = document.createElement('canvas');
    c.width = ancho; c.height = alto;
    const ctx = c.getContext('2d'), img = ctx.createImageData(ancho, alto);
    for (let i = 0; i < ancho * alto; i++) {
      const p = pintar(i);
      if (p) { img.data[i * 4] = p[0]; img.data[i * 4 + 1] = p[1]; img.data[i * 4 + 2] = p[2]; img.data[i * 4 + 3] = 255; }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }
  function colorNdvi(v) {
    if (!Number.isFinite(v)) return null;
    const t = Math.min(1, Math.max(0, (v - RAMPA.min) / (RAMPA.max - RAMPA.min))) * (RAMPA.colores.length - 1);
    const i = Math.min(RAMPA.colores.length - 2, Math.floor(t)), f = t - i, a = RAMPA.colores[i], b = RAMPA.colores[i + 1];
    return [0, 1, 2].map(k => Math.round(a[k] + (b[k] - a[k]) * f));
  }
  function grises(banda, sinDato) {
    let min = Infinity, max = -Infinity;
    for (const v of banda) if (Number.isFinite(v) && v !== sinDato) { if (v < min) min = v; if (v > max) max = v; }
    const r = max > min ? max - min : 1;
    return lienzo(datos.ancho, datos.alto, i => {
      const v = banda[i];
      if (!Number.isFinite(v) || v === sinDato || (datos.mascara && datos.mascara[i] === 0)) return null;
      const g = Math.round((v - min) / r * 255);
      return [g, g, g];
    });
  }

  // ---------- Zona del lote ----------
  function ubicar(recuadro) {
    if (typeof MAPA === 'undefined' || !MAPA || typeof CLIMA === 'undefined') return {zonaLote: null, departamento: null};
    const geo = Object.fromEntries(Object.entries(CLIMA).filter(([, z]) => z && z.lat !== undefined)
      .map(([id, z]) => [id[5], {lat: z.lat, lon: z.lon}]));
    const t = L.transformacionMapa(MAPA.puntos, geo);
    const lat = (recuadro[0][0] + recuadro[1][0]) / 2, lon = (recuadro[0][1] + recuadro[1][1]) / 2;
    const z = L.zonaDelPunto(lat, lon, MAPA, t);
    return z ? {zonaLote: z.zona, departamento: z.departamento} : {zonaLote: null, departamento: null};
  }
  const umbral = () => (typeof DIAG !== 'undefined' && DIAG.meta && typeof DIAG.meta.umbral_ndvi === 'number') ? DIAG.meta.umbral_ndvi : 0.25;

  // ---------- NDVI ----------
  function aplicarNdvi(valores, bandas) {
    estado.tipo = 'ndvi';
    estado.bandas = bandas;
    estado.resumen = L.resumenNdvi(valores, umbral());
    estado.url = lienzo(datos.ancho, datos.alto, i => colorNdvi(valores[i]));
  }
  function elegirBandas(rojo, nir) {
    if (!datos || !estado || rojo === nir) return;
    const r = datos.bandas[rojo], n = datos.bandas[nir];
    if (!r || !n) return;
    aplicarNdvi(L.ndvi(r, n, datos.sinDato, datos.mascara), {rojo, nir});
    avisar('cambio');
  }
  function confirmarNdvi(si) {
    if (!datos || !estado || estado.tipo !== 'pendiente_ndvi') return;
    if (si) aplicarNdvi(Float32Array.from(datos.bandas[0], v => Number.isFinite(v) && v !== datos.sinDato ? v : NaN), null);
    else estado.tipo = 'gris';
    avisar('cambio');
  }
  function ponerFecha(iso) {
    if (!estado || !/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return;
    estado.fecha = iso;
    avisar('cambio');
  }

  // ---------- Lectura ----------
  // Lee el archivo achicado de a franjas de filas, para no tener nunca el original entero en memoria
  // (readRasters con width y height lee primero la ventana a resolución completa). Unos 16 millones de valores por franja.
  async function leerAchicado(img, w0, h0, ancho, alto, n) {
    if (ancho === w0 && alto === h0) return Array.from(await img.readRasters({interleave: false}));
    const filas = Math.max(64, Math.floor(16e6 / (w0 * n)));
    let out = null;
    for (const t of L.tramos(h0, alto, filas)) {
      const r = await img.readRasters({window: [0, t.r0, w0, t.r1], width: ancho, height: t.o1 - t.o0, interleave: false});
      if (!out) out = Array.from(r, b => new b.constructor(ancho * alto));
      r.forEach((b, i) => out[i].set(b, t.o0 * ancho));
    }
    return out;
  }

  async function abrir(blob, nombre) {
    estado = {nombre: nombre || (blob && blob.name) || '', bytes: blob ? blob.size : 0, tipo: null, error: null, url: null,
      resumen: null, bandas: null, descripciones: [], fecha: null, zonaLote: null, departamento: null, leyendo: true,
      aviso: L.avisoTamano(blob ? blob.size : 0)};
    datos = null;
    renderCaja();
    try {
      const tiff = await GeoTIFF.fromBlob(blob), img = await tiff.getImage(), fd = img.fileDirectory;
      const bandas = img.getSamplesPerPixel();
      const ficha = {bandas, bits: Array.from(fd.BitsPerSample || [8]), fotometrica: fd.PhotometricInterpretation,
        formato: ({1: 'uint', 2: 'int', 3: 'float'})[(fd.SampleFormat || [1])[0]] || 'uint'};
      const geoKeys = img.getGeoKeys(), epsg = L.epsgDe(geoKeys);
      if (!epsg) return fallar(T().sinCoordenadas);
      const def = L.defProj4(epsg);
      if (!def) return fallar(fmt(T().epsgDesconocido, {epsg}));
      const aLonLat = epsg === 4326 ? (x, y) => [x, y] : (x, y) => proj4(def, 'WGS84', [x, y]);
      const recuadro = L.recuadroLatLon(img.getBoundingBox(), aLonLat);
      const w0 = img.getWidth(), h0 = img.getHeight(), k = Math.min(1, MAX_LADO / Math.max(w0, h0));
      const ancho = Math.max(1, Math.round(w0 * k)), alto = Math.max(1, Math.round(h0 * k));
      // Un COG trae versiones reducidas y máscaras: se lee la más chica que alcanza y su máscara de área válida.
      const imagenes = [];
      for (let i = 0, n = await tiff.getImageCount(); i < n; i++) {
        const im = i === 0 ? img : await tiff.getImage(i);
        imagenes.push({i, im, ancho: im.getWidth(), alto: im.getHeight(), bandas: im.getSamplesPerPixel(), sub: im.fileDirectory.NewSubfileType || 0});
      }
      const vista = imagenes[L.elegirVista(imagenes, ancho)];
      const rasters = await leerAchicado(vista.im, vista.ancho, vista.alto, ancho, alto, bandas);
      const iMasc = L.elegirMascara(imagenes, vista.ancho, vista.alto);
      let mascara = null;
      if (iMasc !== null) {
        try { mascara = (await leerAchicado(imagenes[iMasc].im, vista.ancho, vista.alto, ancho, alto, 1))[0]; }
        catch (e) { console.warn('BioSat dron: no se pudo leer la máscara', e); }
      }
      const sinDato = img.getGDALNoData();
      const tipo = L.tipoImagen(ficha);
      datos = {bandas: Array.from(rasters), ancho, alto, sinDato: sinDato === null ? null : Number(sinDato),
        mascara: tipo === 'rgb' && bandas === 4 ? rasters[3] : mascara};
      Object.assign(estado, {ficha, epsg, recuadro, anchoOriginal: w0, altoOriginal: h0, anchoCalculo: ancho,
        metrosPixel: L.metrosPorPixel(recuadro, ancho), fecha: L.fechaDeTiff(fd.DateTime), leyendo: false,
        descripciones: L.descripcionesBandas(fd.GDAL_METADATA, bandas)}, ubicar(recuadro));
      if (tipo === 'rgb') {
        const [r, g, b] = datos.bandas, m = datos.mascara, ycc = ficha.fotometrica === 6;
        estado.tipo = 'rgb';
        estado.url = lienzo(ancho, alto, i => (m && m[i] === 0) ? null : (ycc ? L.ycbcrARgb(r[i], g[i], b[i]) : [r[i], g[i], b[i]]));
      } else if (tipo === 'multi') {
        const s = L.bandasSugeridas(estado.descripciones);
        if (s.rojo !== null && s.nir !== null)
          aplicarNdvi(L.ndvi(datos.bandas[s.rojo], datos.bandas[s.nir], datos.sinDato, datos.mascara), s);
        else { estado.tipo = 'pendiente_bandas'; estado.url = grises(datos.bandas[0], datos.sinDato); }
      } else if (tipo === 'una_decimal' && L.pareceNdvi(datos.bandas[0], datos.sinDato)) {
        estado.tipo = 'pendiente_ndvi';
        estado.url = grises(datos.bandas[0], datos.sinDato);
      } else {
        estado.tipo = 'gris';
        estado.url = grises(datos.bandas[0], datos.sinDato);
      }
      avisar('nuevo');
    } catch (e) {
      console.warn('BioSat dron:', e);
      fallar(T().noEsTiff);
    }
  }
  function fallar(msg) {
    datos = null;
    estado = Object.assign(estado || {}, {error: msg, url: null, leyendo: false, tipo: null, resumen: null});
    avisar('error');
  }

  // ---------- Caja del visor (#dronBox) ----------
  function renderCaja() {
    const caja = $('#dronBox');
    if (!caja) return;
    $('#dronCajaT').textContent = T().caja;
    $('#dronAbrir').textContent = T().abrir;
    $('#dronPrivado').textContent = T().privado;
    const out = $('#dronEstado');
    if (!estado) { out.innerHTML = ''; return; }
    const partes = [];
    if (estado.aviso) partes.push(`<p class="hint">${esc(estado.aviso)}</p>`);
    if (estado.leyendo) partes.push(`<p class="hint">${esc(T().leyendo)}</p>`);
    if (estado.error) partes.push(`<p class="dron-error">${esc(estado.error)}</p>`);
    if (estado.tipo === 'pendiente_bandas') {
      const ops = estado.descripciones.map((d, i) => `<option value="${i}">${esc(d ? fmt(T().bandaDesc, {n: i + 1, desc: d}) : fmt(T().banda, {n: i + 1}))}</option>`).join('');
      partes.push(`<p class="hint">${esc(fmt(T().elegirBandas, {n: estado.descripciones.length}))}</p>
        <label class="dron-campo">${esc(T().bandaRoja)} <select id="dronRojo">${ops}</select></label>
        <label class="dron-campo">${esc(T().bandaNir)} <select id="dronNir">${ops}</select></label>
        <button type="button" class="capa" id="dronCalcular">${esc(T().calcular)}</button>`);
    }
    if (estado.tipo === 'pendiente_ndvi') {
      partes.push(`<p class="hint">${esc(T().esNdvi)}</p>
        <div class="capas"><button type="button" class="capa" data-dron-ndvi="si">${esc(T().siNdvi)}</button>
        <button type="button" class="capa" data-dron-ndvi="no">${esc(T().noNdvi)}</button></div>`);
    }
    out.innerHTML = partes.join('');
  }

  document.addEventListener('click', e => {
    if (e.target.closest('#dronAbrir')) { $('#dronArchivo').click(); return; }
    if (e.target.closest('#dronCalcular')) { elegirBandas(Number($('#dronRojo').value), Number($('#dronNir').value)); return; }
    const b = e.target.closest('[data-dron-ndvi]');
    if (b) confirmarNdvi(b.dataset.dronNdvi === 'si');
  });
  document.addEventListener('change', e => {
    if (e.target.id !== 'dronArchivo') return;
    const f = e.target.files && e.target.files[0];
    if (f) abrir(f, f.name);
    e.target.value = '';   // así se puede volver a abrir el mismo archivo
  });
  if (window.Idioma) Idioma.alCambiar(renderCaja);
  document.addEventListener('DOMContentLoaded', renderCaja);

  window.BioSatDron = {abrir, estado: () => estado, alCambiar: fn => oyentes.push(fn), elegirBandas, confirmarNdvi, ponerFecha,
    render: renderCaja};
})();
