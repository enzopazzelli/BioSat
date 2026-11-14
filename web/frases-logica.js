/* BioSat · frases simples que resumen cada paso (sin interfaz).
   Cada frase sale de los datos de la app. Si falta un dato devuelve null y la frase no se muestra:
   nunca se escribe un número a mano. Se usa en el navegador (window.FrasesLogica) y en Node (module.exports). */
(function () {
  // Textos con claves, listos para traducir.
  const TEXTOS = {
    calor: 'En {pueblo}, los días de más de 40 °C pasaron de {a} a {b} por año.',
    calorIgual: 'En {pueblo}, hay unos {a} días por año de más de 40 °C.',
    mejor: 'Para lo que elegiste, la primera opción es «{nombre}».'
  };

  const fmt = (txt, datos) => String(txt).replace(/\{(\w+)\}/g, (_, k) => datos[k]);
  const numero = (n) => typeof n === 'number' && Number.isFinite(n);
  const texto = (s) => typeof s === 'string' && s.trim() !== '';
  // Mismo formato que nf() de app.js: sin decimales y con coma para los miles.
  const entero = (n) => Number(n).toLocaleString('es-AR', {minimumFractionDigits: 0, maximumFractionDigits: 0});

  // Días de más de 40 °C: promedio 1991-2020 contra 2021-2025.
  function fraseCalor(pueblo, diasNormal, diasReciente) {
    if (!texto(pueblo) || !numero(diasNormal) || !numero(diasReciente)) return null;
    const a = entero(diasNormal), b = entero(diasReciente);
    return a === b ? fmt(TEXTOS.calorIgual, {pueblo, a}) : fmt(TEXTOS.calor, {pueblo, a, b});
  }

  function fraseMejorRotacion(nombre) {
    return texto(nombre) ? fmt(TEXTOS.mejor, {nombre: nombre.trim()}) : null;
  }

  const F = {TEXTOS, fraseCalor, fraseMejorRotacion};
  if (typeof module !== 'undefined' && module.exports) module.exports = F;
  else window.FrasesLogica = F;
})();
