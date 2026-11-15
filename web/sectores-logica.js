/* BioSat · lógica de los sectores del lote (sin interfaz), D-39.
   Superficie, NDVI dentro de un sector, numeración, estados, GeoJSON y textos. El dibujo y el guardado están en sectores.js.
   Un sector es un lugar PARA REVISAR en el campo, no un diagnóstico (D-33): la causa la escribe una persona.
   Diseño: docs/superpowers/specs/2026-11-15-lector-dron-etapa-2-design.md.
   Se usa en el navegador (window.SectoresLogica, después de dron-logica.js) y en Node (module.exports). */
(function () {
  const DL = typeof module !== 'undefined' && module.exports ? require('./dron-logica.js') : window.DronLogica;
  const ESTADOS = ['revisar', 'revisado', 'descartado'];
  const M_GRADO = 111320;

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

  const L = {ESTADOS, areaHa, ndviEnPoligono, siguienteNumero, nuevoSector, conCambios};
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else window.SectoresLogica = L;
})();
