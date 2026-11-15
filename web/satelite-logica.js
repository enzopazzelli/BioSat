/* BioSat · lógica del satélite del lote (sin interfaz), D-40.
   Rótulo honesto de la resolución de Landsat en el visor, y comparación del NDVI del dron con el de un recorte
   satelital (Sentinel-2 a 10 m o Landsat a 30 m) en la misma superficie.
   Diseño: docs/superpowers/specs/2026-11-15-satelite-del-lote-design.md.
   Se usa en el navegador (window.SateliteLogica, después de dron-logica.js) y en Node (module.exports). */
(function () {
  const DL = typeof module !== 'undefined' && module.exports ? require('./dron-logica.js') : window.DronLogica;

  const TEXTOS = {
    locale: 'es-AR',
    visorSrc: 'Landsat · unos {m} m por píxel en este visor (original de 30 m)',
    cmpLinea: 'En la misma superficie: NDVI mediano {dron} con el dron y {sat} con {fuente} ({res} m, {cuando}).',
    cmpAntes: '{fecha}, {n} días antes del vuelo',
    cmpAntesUno: '{fecha}, 1 día antes del vuelo',
    cmpDespues: '{fecha}, {n} días después del vuelo',
    cmpDespuesUno: '{fecha}, 1 día después del vuelo',
    cmpMismoDia: '{fecha}, el mismo día del vuelo',
    cmpPasada: 'pasada del {fecha}',
    cmpMesVuelo: 'pasada del {fecha}, en el mes del vuelo',
    capa: '{fuente} · {res} m · {tipo} · {fecha}',
    capaColor: 'color',
    capaNdvi: 'índice de vegetación (NDVI)',
    cmpSat: 'Satélite contra dron',
    cmpSatIzq: '← Satélite',
    cmpSatDer: 'Dron →',
    srcSat: '{fuente} · {res} m por píxel · pasada del {fecha}',
    srcDron: 'Dron · unos {res} por píxel en este visor',
    sinFuente: '{fuente}: {motivo}.'
  };
  const fmt = (txt, datos) => String(txt).replace(/\{(\w+)\}/g, (_, k) => datos[k]);

  // Metros por píxel de la imagen de la zona: ancho del recuadro [oeste, sur, este, norte] en metros / ancho del PNG.
  function metrosPorPixelZona(bbox, anchoPx) {
    const [o, s, e, n] = bbox;
    return (e - o) * 111320 * Math.cos(((s + n) / 2) * Math.PI / 180) / anchoPx;
  }
  // Redondeo para leer: a 10 m desde 50 m; por debajo, a 5 m.
  function rotuloResolucion(metros) {
    const m = metros >= 50 ? Math.round(metros / 10) * 10 : Math.round(metros / 5) * 5;
    return fmt(TEXTOS.visorSrc, {m});
  }

  // ---------- Dron contra satélite en la misma superficie ----------
  // rDron = [[sur, oeste], [norte, este]] (como el dron); recuadro del lote = [oeste, sur, este, norte] (como lote.json).
  function solapan(rDron, r) {
    const [[s, o], [n, e]] = rDron;
    return o < r[2] && e > r[0] && s < r[3] && n > r[1];
  }
  const mediana = v => { const a = v.slice().sort((x, y) => x - y), m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
  // Cada píxel del dron va a la celda del satélite que contiene su centro. Una celda cuenta si al menos la mitad de sus
  // píxeles del dron son válidos y el satélite tiene dato. Mediana de cada lado sobre las celdas que cuentan.
  function compararNdvi(dron, sat) {
    if (!dron || !sat || !dron.valores || !sat.valores) return null;
    const [[ds, dO], [dn, de]] = dron.recuadro, [so, ss, se, sn] = sat.recuadro;
    const n = sat.ancho * sat.alto, total = new Uint32Array(n), validos = new Uint32Array(n);
    const porCelda = Array.from({length: n}, () => []);
    for (let j = 0; j < dron.alto; j++) for (let i = 0; i < dron.ancho; i++) {
      const lon = dO + (i + 0.5) * (de - dO) / dron.ancho, lat = dn - (j + 0.5) * (dn - ds) / dron.alto;
      const ci = Math.floor((lon - so) / (se - so) * sat.ancho), cj = Math.floor((sn - lat) / (sn - ss) * sat.alto);
      if (ci < 0 || cj < 0 || ci >= sat.ancho || cj >= sat.alto) continue;
      const k = cj * sat.ancho + ci, v = dron.valores[j * dron.ancho + i];
      total[k]++;
      if (Number.isFinite(v)) { validos[k]++; porCelda[k].push(v); }
    }
    const vd = [], vs = [];
    for (let k = 0; k < n; k++) {
      const s = sat.valores[k];
      if (total[k] && validos[k] * 2 >= total[k] && Number.isFinite(s)) { vs.push(s); vd.push(...porCelda[k]); }
    }
    return vs.length ? {dron: mediana(vd), sat: mediana(vs), celdas: vs.length} : null;
  }

  function lineaComparacion(c, f, fechaVuelo) {
    const nf = v => v.toLocaleString(TEXTOS.locale, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const fecha = DL.fechaCorta(f.fecha), d = f.dias_al_vuelo;
    const cuando = /^\d{4}-\d{2}$/.test(fechaVuelo || '') ? fmt(TEXTOS.cmpMesVuelo, {fecha})
      : !fechaVuelo || d === null || d === undefined ? fmt(TEXTOS.cmpPasada, {fecha})
      : d === 0 ? fmt(TEXTOS.cmpMismoDia, {fecha})
      : fmt(Math.abs(d) === 1 ? (d < 0 ? TEXTOS.cmpAntesUno : TEXTOS.cmpDespuesUno) : (d < 0 ? TEXTOS.cmpAntes : TEXTOS.cmpDespues), {fecha, n: Math.abs(d)});
    return fmt(TEXTOS.cmpLinea, {dron: nf(c.dron), sat: nf(c.sat), fuente: f.nombre, res: f.resolucion_m, cuando});
  }

  const L = {TEXTOS, metrosPorPixelZona, rotuloResolucion, solapan, compararNdvi, lineaComparacion};
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else window.SateliteLogica = L;
})();
