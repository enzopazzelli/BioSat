/* BioSat · lógica de los sectores del lote (sin interfaz), D-39.
   Superficie, NDVI dentro de un sector, numeración, estados, GeoJSON y textos. El dibujo y el guardado están en sectores.js.
   Un sector es un lugar PARA REVISAR en el campo, no un diagnóstico (D-33): la causa la escribe una persona.
   Diseño: docs/superpowers/specs/2026-11-15-lector-dron-etapa-2-design.md.
   Se usa en el navegador (window.SectoresLogica, después de dron-logica.js) y en Node (module.exports). */
(function () {
  const DL = typeof module !== 'undefined' && module.exports ? require('./dron-logica.js') : window.DronLogica;
  const ESTADOS = ['revisar', 'revisado', 'descartado'];
  const M_GRADO = 111320;

  // Textos con claves, listos para traducir (D-35).
  const TEXTOS = {
    locale: 'es-AR',
    titulo: 'Sectores del lote',
    marcar: 'Marcar un sector',
    exportar: 'Exportar',
    importar: 'Importar',
    dibujando: 'Tocá el mapa para sumar puntos ({n} hasta ahora). Con 3 o más, cerrá el sector.',
    deshacer: 'Deshacer punto',
    cerrar: 'Cerrar sector',
    cancelar: 'Cancelar',
    guardadoAviso: 'Se guarda en este navegador. Para pasarlo, exportá el archivo.',
    noGuardado: 'No se pudo guardar en este navegador: exportá los sectores para no perderlos.',
    vacio: 'Todavía no hay sectores. Marcá uno sobre el mapa: es un lugar para revisar en el campo.',
    estadoRevisar: 'Para revisar en el campo',
    estadoRevisado: 'Revisado',
    estadoDescartado: 'Descartado',
    sector: 'Sector {n}',
    nota: 'Nota (lo que se ve desde el dron)',
    hallazgo: 'Qué se encontró en el lote',
    borrar: 'Borrar',
    confirmarBorrar: '¿Borrar el sector {n}?',
    ha: '{ha} ha',
    m2: '{m2} m²',
    ndviLinea: 'NDVI mediano {ndvi} · {pct} % sin cobertura activa (vuelo del {fecha})',
    sinNdvi: 'Sin NDVI: el sector no cae sobre una imagen con NDVI.',
    importados: 'Se cargaron {ok} sectores. Repetidos: {rep}. No se pudieron leer: {mal}.',
    noGeojson: 'El archivo no es un GeoJSON de sectores.',
    inicioUno: ' · 1 sector para revisar',
    inicioVarios: ' · {n} sectores para revisar'
  };
  const fmt = (txt, datos) => String(txt).replace(/\{(\w+)\}/g, (_, k) => datos[k]);

  // ---------- Superficie ----------
  // Proyección local equirectangular a la latitud media y fórmula del área de un polígono. Puntos: [[lat, lon], ...].
  function areaHa(puntos) {
    if (!Array.isArray(puntos) || puntos.length < 3) return 0;
    const lat0 = puntos.reduce((a, p) => a + p[0], 0) / puntos.length, k = Math.cos(lat0 * Math.PI / 180);
    const xy = puntos.map(([lat, lon]) => [lon * M_GRADO * k, lat * M_GRADO]);
    let s = 0;
    for (let i = 0, j = xy.length - 1; i < xy.length; j = i++) s += xy[j][0] * xy[i][1] - xy[i][0] * xy[j][1];
    return Math.abs(s) / 2 / 10000;
  }

  // ---------- NDVI dentro de un sector ----------
  function dentro(lat, lon, puntos) {
    let adentro = false;
    for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
      const [yi, xi] = puntos[i], [yj, xj] = puntos[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) adentro = !adentro;
    }
    return adentro;
  }
  // Píxeles del NDVI achicado cuyo centro cae dentro del sector. null si no hay ninguno válido.
  function ndviEnPoligono(n, puntos, umbral) {
    if (!n || !n.valores || !Array.isArray(puntos) || puntos.length < 3) return null;
    const [[s, o], [no, e]] = n.recuadro, dx = (e - o) / n.ancho, dy = (no - s) / n.alto;
    const lats = puntos.map(p => p[0]), lons = puntos.map(p => p[1]);
    const i0 = Math.max(0, Math.floor((Math.min(...lons) - o) / dx)), i1 = Math.min(n.ancho - 1, Math.ceil((Math.max(...lons) - o) / dx));
    const j0 = Math.max(0, Math.floor((no - Math.max(...lats)) / dy)), j1 = Math.min(n.alto - 1, Math.ceil((no - Math.min(...lats)) / dy));
    const sel = [];
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (dentro(no - (j + 0.5) * dy, o + (i + 0.5) * dx, puntos)) sel.push(n.valores[j * n.ancho + i]);
    }
    const r = DL.resumenNdvi(Float32Array.from(sel), umbral);
    return r.validos ? r : null;
  }

  // ---------- Sectores ----------
  const siguienteNumero = sectores => (sectores || []).reduce((m, s) => Math.max(m, s.n || 0), 0) + 1;

  function nuevoSector(sectores, {puntos, ndvi, vuelo, ahora}) {
    const n = siguienteNumero(sectores);
    return {id: `s${n}-${ahora}`, n, puntos, ha: areaHa(puntos), ndvi: ndvi || null, vuelo: vuelo || null,
      nota: '', estado: 'revisar', hallazgo: '', creado: ahora, actualizado: ahora};
  }

  function conCambios(sector, cambios, ahora) {
    const out = Object.assign({}, sector);
    if (cambios && ESTADOS.includes(cambios.estado)) out.estado = cambios.estado;
    if (cambios && typeof cambios.nota === 'string') out.nota = cambios.nota;
    if (cambios && typeof cambios.hallazgo === 'string') out.hallazgo = cambios.hallazgo;
    out.actualizado = ahora;
    return out;
  }

  // ---------- GeoJSON (contrato de datos §11) ----------
  const r7 = v => Math.round(v * 1e7) / 1e7;
  const clave = puntos => puntos.map(([a, b]) => `${r7(a)},${r7(b)}`).join(';');

  function aGeoJSON(sectores, {umbral}) {
    return {type: 'FeatureCollection', features: (sectores || []).map(s => {
      const anillo = s.puntos.map(([lat, lon]) => [lon, lat]);
      anillo.push(anillo[0]);
      return {type: 'Feature', geometry: {type: 'Polygon', coordinates: [anillo]}, properties: {
        n: s.n, estado: s.estado, nota: s.nota, hallazgo: s.hallazgo, ha: Math.round(s.ha * 100) / 100,
        ndvi_mediano: s.ndvi ? s.ndvi.mediana : null, fraccion_sin_cobertura: s.ndvi ? s.ndvi.fraccionBajo : null,
        umbral_ndvi: s.ndvi ? umbral : null, vuelo_fecha: s.vuelo ? s.vuelo.fecha : null,
        vuelo_archivo: s.vuelo ? s.vuelo.archivo : null, creado: s.creado, actualizado: s.actualizado}};
    })};
  }

  // Suma los polígonos del archivo como sectores nuevos (numerados después de los que hay). Saltea lo que no es
  // polígono y no duplica: un polígono con los mismos puntos que uno que ya está cuenta como repetido.
  function deGeoJSON(obj, sectores, ahora) {
    const out = {nuevos: [], salteados: 0, repetidos: 0, error: null};
    if (!obj || obj.type !== 'FeatureCollection' || !Array.isArray(obj.features)) return Object.assign(out, {error: 'noGeojson'});
    const vistas = new Set((sectores || []).map(s => clave(s.puntos || [])));
    let todos = (sectores || []).slice();
    for (const f of obj.features) {
      const g = f && f.geometry, p = (f && f.properties) || {};
      const anillos = !g ? [] : g.type === 'Polygon' ? [g.coordinates && g.coordinates[0]]
        : g.type === 'MultiPolygon' ? (g.coordinates || []).map(c => c && c[0]) : [];
      if (!anillos.length) { out.salteados++; continue; }
      for (const a of anillos) {
        const ok = Array.isArray(a) && a.every(c => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]));
        if (!ok || a.length < 4) { out.salteados++; continue; }
        const puntos = a.slice(0, -1).map(([lon, lat]) => [lat, lon]);
        if (vistas.has(clave(puntos))) { out.repetidos++; continue; }
        vistas.add(clave(puntos));
        const ndvi = Number.isFinite(p.ndvi_mediano) ? {mediana: p.ndvi_mediano, fraccionBajo: p.fraccion_sin_cobertura ?? null, validos: null} : null;
        const vuelo = p.vuelo_fecha || p.vuelo_archivo ? {id: null, fecha: p.vuelo_fecha || null, archivo: p.vuelo_archivo || null} : null;
        const s = Object.assign(nuevoSector(todos, {puntos, ndvi, vuelo, ahora}), {
          estado: ESTADOS.includes(p.estado) ? p.estado : 'revisar',
          nota: typeof p.nota === 'string' ? p.nota : '', hallazgo: typeof p.hallazgo === 'string' ? p.hallazgo : ''});
        out.nuevos.push(s);
        todos = todos.concat(s);
      }
    }
    return out;
  }

  // Superficie para mostrar: hectáreas con un decimal desde 0,1 ha; debajo, metros cuadrados (un sector chico no es "0,0 ha").
  function superficieTexto(ha) {
    const nf = (v, d) => v.toLocaleString(TEXTOS.locale, {minimumFractionDigits: d, maximumFractionDigits: d});
    return ha >= 0.1 ? fmt(TEXTOS.ha, {ha: nf(ha, 1)}) : fmt(TEXTOS.m2, {m2: nf(Math.round(ha * 10000), 0)});
  }

  // ---------- Línea del Inicio ----------
  function lineaSectores(sectores) {
    const n = (sectores || []).filter(s => s.estado === 'revisar').length;
    return n === 0 ? '' : n === 1 ? TEXTOS.inicioUno : fmt(TEXTOS.inicioVarios, {n});
  }

  const L = {ESTADOS, TEXTOS, areaHa, ndviEnPoligono, siguienteNumero, nuevoSector, conCambios, aGeoJSON, deGeoJSON, lineaSectores, superficieTexto};
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else window.SectoresLogica = L;
})();
