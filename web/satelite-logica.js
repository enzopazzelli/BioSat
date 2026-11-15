/* BioSat · lógica del satélite del lote (sin interfaz), D-40.
   Rótulo honesto de la resolución de Landsat en el visor, y comparación del NDVI del dron con el de un recorte
   satelital (Sentinel-2 a 10 m o Landsat a 30 m) en la misma superficie.
   Diseño: docs/superpowers/specs/2026-11-15-satelite-del-lote-design.md.
   Se usa en el navegador (window.SateliteLogica, después de dron-logica.js) y en Node (module.exports). */
(function () {
  const DL = typeof module !== 'undefined' && module.exports ? require('./dron-logica.js') : window.DronLogica;

  const TEXTOS = {
    locale: 'es-AR',
    visorSrc: 'Landsat · unos {m} m por píxel en este visor (original de 30 m)'
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

  const L = {TEXTOS, metrosPorPixelZona, rotuloResolucion};
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else window.SateliteLogica = L;
})();
