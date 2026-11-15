/* BioSat · sectores del lote en el navegador (D-39): dibujo sobre el mapa, capa, tarjeta y guardado.
   Un sector es un lugar PARA REVISAR en el campo: nace "para revisar" y lo que se confirma va en "Qué se encontró".
   Se guarda en localStorage (biosat.sectores.v1). Lee de app.js (mismo ámbito global): visor, state y DIAG.
   La lógica pura está en sectores-logica.js. Diseño: docs/superpowers/specs/2026-11-15-lector-dron-etapa-2-design.md. */
(function () {
  const S = window.SectoresLogica, CLAVE = 'biosat.sectores.v1';
  const T = () => S.TEXTOS;
  const $ = s => document.querySelector(s);
  const fmt = (t, d) => String(t).replace(/\{(\w+)\}/g, (_, k) => d[k]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
  const nf = (v, d) => Number(v).toLocaleString(T().locale, {minimumFractionDigits: d, maximumFractionDigits: d});
  const ahora = () => new Date().toISOString();

  let sectores = leer(), dib = null, capa = null, mapaEnganchado = null, aviso = '', activo = null;

  function leer() {
    try {
      const j = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      return j && j.version === 1 && Array.isArray(j.sectores) ? j.sectores : [];
    } catch (e) { return []; }
  }
  // Si el navegador no deja guardar, el sector queda en pantalla y se avisa que se exporte.
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify({version: 1, sectores})); aviso = ''; return true; }
    catch (e) { aviso = T().noGuardado; return false; }
  }

  const mapa = () => (typeof visor !== 'undefined' && visor.map) || null;
  const umbral = () => (typeof DIAG !== 'undefined' && DIAG.meta && typeof DIAG.meta.umbral_ndvi === 'number') ? DIAG.meta.umbral_ndvi : 0.25;
  const color = estado => getComputedStyle(document.documentElement).getPropertyValue(estado === 'revisar' ? '--accent' : '--muted').trim() || '#0E5E4B';
  const actualizarInicio = () => { if (typeof renderDron === 'function') renderDron(); };

  // ---------- Dibujo ----------
  function enganchar(m) {
    if (mapaEnganchado === m) return;
    m.on('click', e => { if (dib) sumarPunto(e.latlng); });
    capa = L.layerGroup().addTo(m);
    mapaEnganchado = m;
  }
  function empezar() {
    const m = mapa();
    if (!m || dib) return;
    dib = {puntos: [], capa: L.layerGroup().addTo(m), zona: typeof state !== 'undefined' ? state.zona : null};
    m.doubleClickZoom.disable();
    renderTarjeta();
  }
  function terminarDibujo() {
    if (dib) dib.capa.remove();
    dib = null;
    const m = mapa();
    if (m) m.doubleClickZoom.enable();
  }
  function dibujarTemp() {
    dib.capa.clearLayers();
    const c = color('revisar');
    if (dib.puntos.length > 1) L.polyline(dib.puntos, {color: c, weight: 2, dashArray: '4 4', interactive: false}).addTo(dib.capa);
    dib.puntos.forEach(p => L.circleMarker(p, {radius: 5, color: '#ffffff', weight: 1, fillColor: c, fillOpacity: 1, interactive: false}).addTo(dib.capa));
  }
  function sumarPunto(latlng) { dib.puntos.push([latlng.lat, latlng.lng]); dibujarTemp(); renderTarjeta(); }
  function deshacer() { if (!dib) return; dib.puntos.pop(); dibujarTemp(); renderTarjeta(); }
  function cerrar() {
    if (!dib || dib.puntos.length < 3) return;
    const nd = window.BioSatDron && BioSatDron.ndviActual();
    const s = S.nuevoSector(sectores, {puntos: dib.puntos.slice(), ndvi: S.ndviEnPoligono(nd, dib.puntos, umbral()),
      vuelo: nd ? nd.vuelo : null, ahora: ahora()});
    sectores = sectores.concat(s);
    guardar();
    activo = s.id;
    terminarDibujo();
    render();
    actualizarInicio();
    const f = document.querySelector(`[data-sector="${s.id}"]`);
    if (f) f.scrollIntoView({block: 'nearest'});
  }

  // ---------- Capa de sectores ----------
  function renderCapa() {
    if (!capa) return;
    capa.clearLayers();
    for (const s of sectores) {
      const c = color(s.estado);
      L.polygon(s.puntos, {color: c, weight: 2, fillColor: c, fillOpacity: s.estado === 'revisar' ? 0.18 : 0.08})
        .bindTooltip(String(s.n), {permanent: true, direction: 'center', className: 'sect-num'})
        .on('click', () => {
          if (dib) return;   // durante el dibujo, el toque suma un punto (lo maneja el mapa)
          activo = s.id; renderTarjeta();
          const f = document.querySelector(`[data-sector="${s.id}"]`);
          if (f) f.scrollIntoView({block: 'nearest'});
        })
        .addTo(capa);
    }
  }

  // ---------- Tarjeta ----------
  const etiquetaEstado = e => ({revisar: T().estadoRevisar, revisado: T().estadoRevisado, descartado: T().estadoDescartado})[e];
  function lineaNdvi(s) {
    if (!s.ndvi || !Number.isFinite(s.ndvi.mediana)) return T().sinNdvi;
    const pct = Number.isFinite(s.ndvi.fraccionBajo) ? Math.round(s.ndvi.fraccionBajo * 100) : '—';
    const fecha = window.DronLogica ? DronLogica.fechaCorta(s.vuelo && s.vuelo.fecha) : ((s.vuelo && s.vuelo.fecha) || '');
    return fmt(T().ndviLinea, {ndvi: nf(s.ndvi.mediana, 2), pct, fecha});
  }
  function ficha(s) {
    const campo = (k, rotulo) => `<label class="dron-campo">${esc(rotulo)}<textarea data-sector-campo="${k}" rows="2">${esc(s[k])}</textarea></label>
      <p class="solo-print"><strong>${esc(rotulo)}:</strong> ${esc(s[k])}</p>`;
    return `<article class="sect-ficha${s.id === activo ? ' sect-activa' : ''}" data-sector="${esc(s.id)}" data-estado="${esc(s.estado)}">
      <div class="sect-cab"><button type="button" class="sect-ir" data-sector-ir>${esc(fmt(T().sector, {n: s.n}))} · ${esc(etiquetaEstado(s.estado))}</button>
        <span class="mono sect-sup">${esc(S.superficieTexto(s.ha))}</span></div>
      <p class="sect-ndvi">${esc(lineaNdvi(s))}</p>
      <div class="capas sect-estados">${S.ESTADOS.map(e => `<button type="button" class="capa" data-sector-estado="${e}" aria-pressed="${e === s.estado}">${esc(etiquetaEstado(e))}</button>`).join('')}</div>
      ${campo('nota', T().nota)}
      ${s.estado !== 'revisar' ? campo('hallazgo', T().hallazgo) : ''}
      <button type="button" class="capa sect-borrar" data-sector-borrar>${esc(T().borrar)}</button>
    </article>`;
  }
  function renderTarjeta() {
    if (!$('#sectoresCard')) return;
    $('#sectTitulo').textContent = T().titulo;
    $('#sectMarcar').textContent = T().marcar;
    $('#sectMarcar').hidden = !!dib;
    $('#sectDibujo').hidden = !dib;
    if (dib) {
      $('#sectDibujoTxt').textContent = fmt(T().dibujando, {n: dib.puntos.length});
      $('#sectDeshacer').textContent = T().deshacer;
      $('#sectCerrar').textContent = T().cerrar;
      $('#sectCancelar').textContent = T().cancelar;
      $('#sectCerrar').disabled = dib.puntos.length < 3;
    }
    $('#sectLista').innerHTML = sectores.length ? sectores.map(ficha).join('') : `<p class="hint">${esc(T().vacio)}</p>`;
    $('#sectAviso').textContent = aviso || T().guardadoAviso;
    $('#sectAviso').classList.toggle('dron-error', !!aviso);
  }

  // Lo llama app.js en cada renderTodo, después de renderVisor (el mapa ya existe).
  function render() {
    const m = mapa();
    if (m) enganchar(m);
    if (dib && typeof state !== 'undefined' && dib.zona !== state.zona) terminarDibujo();   // cambió la zona: se cancela
    renderCapa();
    renderTarjeta();
  }

  // ---------- Eventos ----------
  const sectorDe = el => { const f = el.closest('[data-sector]'); return f && sectores.find(s => s.id === f.dataset.sector); };
  function reemplazar(nuevo) { sectores = sectores.map(s => s.id === nuevo.id ? nuevo : s); guardar(); }

  document.addEventListener('click', e => {
    if (e.target.closest('#sectMarcar')) return empezar();
    if (e.target.closest('#sectDeshacer')) return deshacer();
    if (e.target.closest('#sectCerrar')) return cerrar();
    if (e.target.closest('#sectCancelar')) { terminarDibujo(); return renderTarjeta(); }
    const s = sectorDe(e.target);
    if (!s) return;
    const be = e.target.closest('[data-sector-estado]');
    if (be) { reemplazar(S.conCambios(s, {estado: be.dataset.sectorEstado}, ahora())); activo = s.id; render(); actualizarInicio(); return; }
    if (e.target.closest('[data-sector-borrar]')) {
      if (!window.confirm(fmt(T().confirmarBorrar, {n: s.n}))) return;
      sectores = sectores.filter(x => x.id !== s.id); guardar(); render(); actualizarInicio(); return;
    }
    if (e.target.closest('[data-sector-ir]') && mapa()) {
      activo = s.id; renderTarjeta();
      mapa().setMaxBounds(null); mapa().setMinZoom(0);
      mapa().fitBounds(L.latLngBounds(s.puntos), {animate: false, padding: [20, 20]});
    }
  });
  document.addEventListener('change', e => {
    const k = e.target.dataset && e.target.dataset.sectorCampo;
    const s = k && sectorDe(e.target);
    if (!s) return;
    reemplazar(S.conCambios(s, {[k]: e.target.value}, ahora()));
    $('#sectAviso').textContent = aviso || T().guardadoAviso;
    $('#sectAviso').classList.toggle('dron-error', !!aviso);
  });

  window.BioSatSectores = {render, lista: () => sectores, dibujando: () => !!dib};
})();
