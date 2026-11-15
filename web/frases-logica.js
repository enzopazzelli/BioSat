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
    antesVarias: 'Si elegís «{nombre}», son {n} cosas para revisar con tu agrónomo antes de decidir.',
    mesesDuros: '{a} y {b} son los meses más duros en tu zona.',
    mesesTranquilos: 'Ningún mes se destaca por calor, helada, falta de agua o suelo pelado en tu zona.',
    sueloMonte: 'Suelo con pH {ph} y monte en el {monte} % de la zona.',
    meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    locale: 'es-AR'   // formato de los números (D-35: en inglés, 'en-US')
  };

  const fmt = (txt, datos) => String(txt).replace(/\{(\w+)\}/g, (_, k) => datos[k]);
  const numero = (n) => typeof n === 'number' && Number.isFinite(n);
  const texto = (s) => typeof s === 'string' && s.trim() !== '';
  // Mismo formato que nf() de app.js: sin decimales y con coma para los miles.
  const entero = (n) => Number(n).toLocaleString(TEXTOS.locale, {minimumFractionDigits: 0, maximumFractionDigits: 0});

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
    const g = Number(grados).toLocaleString(TEXTOS.locale, {minimumFractionDigits: 0, maximumFractionDigits: 1});
    const a = entero(diasAntes), b = entero(diasDespues);
    return a === b ? fmt(TEXTOS.calorMasIgual, {pueblo, g, a}) : fmt(TEXTOS.calorMas, {pueblo, g, a, b});
  }

  // Paso 5: cuántas cosas hay que revisar con el agrónomo para la rotación elegida.
  function fraseAntesDeDecidir(nombre, cantidad) {
    if (!texto(nombre) || !Number.isInteger(cantidad) || cantidad < 1) return null;
    return fmt(cantidad === 1 ? TEXTOS.antesUna : TEXTOS.antesVarias, {nombre: nombre.trim(), n: cantidad});
  }

  // Reporte, sección 1: los 2 meses de mayor nivel del semáforo (empate: más falta de agua), en orden del calendario.
  // `meses`: 12 elementos {nivel, falta} que salen de InicioLogica.semaforoZona.
  function fraseMesesDuros(meses) {
    if (!Array.isArray(meses) || meses.length !== 12 || !meses.every(m => m && numero(m.nivel))) return null;
    const orden = meses.map((m, i) => ({i, nivel: m.nivel, falta: numero(m.falta) ? m.falta : 0}))
      .sort((x, y) => (y.nivel - x.nivel) || (y.falta - x.falta));
    if (orden[0].nivel === 0) return TEXTOS.mesesTranquilos;
    const [a, b] = orden.slice(0, 2).map(x => x.i).sort((x, y) => x - y);
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    return fmt(TEXTOS.mesesDuros, {a: cap(TEXTOS.meses[a]), b: TEXTOS.meses[b]});
  }

  // Reporte, sección 4: pH del suelo y % de la zona con monte.
  function fraseSueloMonte(ph, montePct) {
    if (!numero(ph) || !numero(montePct)) return null;
    const uno = Number(ph).toLocaleString(TEXTOS.locale, {minimumFractionDigits: 1, maximumFractionDigits: 1});
    return fmt(TEXTOS.sueloMonte, {ph: uno, monte: entero(montePct)});
  }

  const F = {TEXTOS, fraseCalor, fraseMejorRotacion, fraseCalorMas, fraseAntesDeDecidir, fraseMesesDuros, fraseSueloMonte};
  if (typeof module !== 'undefined' && module.exports) module.exports = F;
  else window.FrasesLogica = F;
})();
