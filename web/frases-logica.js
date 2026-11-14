/* BioSat · frases simples que resumen cada paso (sin interfaz).
   Cada frase sale de los datos de la app. Si falta un dato devuelve null y la frase no se muestra:
   nunca se escribe un número a mano. Se usa en el navegador (window.FrasesLogica) y en Node (module.exports). */
(function () {
  // Textos con claves, listos para traducir.
  const TEXTOS = {
    calor: 'En {pueblo}, los días de más de 40 °C pasaron de {a} a {b} por año.',
    calorIgual: 'En {pueblo}, hay unos {a} días por año de más de 40 °C.',
    mejor: 'Para lo que elegiste, la primera opción es «{nombre}».',
    mejorDefecto: 'Con lo que más suele importar (agua y suelo), la primera opción es «{nombre}».',
    calorMas: 'Con {g} °C más, los días de más de 40 °C en {pueblo} pasarían de {a} a {b} por año.',
    calorMasIgual: 'Con {g} °C más, los días de más de 40 °C en {pueblo} casi no cambiarían: unos {a} por año.',
    antesUna: 'Si elegís «{nombre}», es 1 cosa para revisar con tu agrónomo antes de decidir.',
    antesVarias: 'Si elegís «{nombre}», son {n} cosas para revisar con tu agrónomo antes de decidir.'
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

  // Con los temas de siempre (la persona no eligió ninguno) no se dice "lo que elegiste".
  function fraseMejorRotacion(nombre, porDefecto) {
    if (!texto(nombre)) return null;
    return fmt(porDefecto ? TEXTOS.mejorDefecto : TEXTOS.mejor, {nombre: nombre.trim()});
  }

  // Paso 4: cuánto pesa un aumento de temperatura en los días de más de 40 °C.
  function fraseCalorMas(pueblo, grados, diasAntes, diasDespues) {
    if (!texto(pueblo) || !numero(grados) || grados <= 0 || !numero(diasAntes) || !numero(diasDespues)) return null;
    const g = Number(grados).toLocaleString('es-AR', {minimumFractionDigits: 0, maximumFractionDigits: 1});
    const a = entero(diasAntes), b = entero(diasDespues);
    return a === b ? fmt(TEXTOS.calorMasIgual, {pueblo, g, a}) : fmt(TEXTOS.calorMas, {pueblo, g, a, b});
  }

  // Paso 5: cuántas cosas hay que revisar con el agrónomo para la rotación elegida.
  function fraseAntesDeDecidir(nombre, cantidad) {
    if (!texto(nombre) || !Number.isInteger(cantidad) || cantidad < 1) return null;
    return fmt(cantidad === 1 ? TEXTOS.antesUna : TEXTOS.antesVarias, {nombre: nombre.trim(), n: cantidad});
  }

  const F = {TEXTOS, fraseCalor, fraseMejorRotacion, fraseCalorMas, fraseAntesDeDecidir};
  if (typeof module !== 'undefined' && module.exports) module.exports = F;
  else window.FrasesLogica = F;
})();
