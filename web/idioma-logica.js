/* BioSat · lógica del idioma (sin interfaz): solo español (los textos de siempre) e inglés (web/textos-en.js).
   Diseño: docs/superpowers/specs/2026-11-15-idioma-es-en-design.md (A), D-35.
   Se usa en el navegador (window.IdiomaLogica) y en Node (module.exports). */
(function () {
  const IDIOMAS = ['es', 'en'];
  const valido = x => IDIOMAS.includes(x);
  const esObjeto = x => x !== null && typeof x === 'object' && !Array.isArray(x);

  // ?lang=en|es gana; si no, lo guardado; si no, español. Cualquier otro valor se ignora.
  function elegirIdioma(search, guardado) {
    const m = /[?&]lang=([a-z]+)/.exec(search || '');
    if (m && valido(m[1])) return m[1];
    return valido(guardado) ? guardado : 'es';
  }

  const locale = idioma => idioma === 'en' ? 'en-US' : 'es-AR';

  const copiaProfunda = x => JSON.parse(JSON.stringify(x));

  // Objeto nuevo con la forma de `es` y los textos de `en` donde existen. Lo que falta queda en español.
  function fusionar(es, en) {
    if (Array.isArray(es)) return es.map((v, i) => fusionar(v, Array.isArray(en) ? en[i] : undefined));
    if (esObjeto(es)) {
      const r = {};
      for (const k of Object.keys(es)) r[k] = fusionar(es[k], esObjeto(en) ? en[k] : undefined);
      return r;
    }
    return typeof es === 'string' && typeof en === 'string' && en !== '' ? en : es;
  }

  // Deja `destino` igual a `fuente` sin cambiar la identidad de sus objetos y arreglos
  // (app.js y los módulos guardan referencias a sus objetos de textos).
  function aplicarEnLugar(destino, fuente) {
    if (Array.isArray(destino) && Array.isArray(fuente)) {
      fuente.forEach((v, i) => {
        if ((esObjeto(destino[i]) || Array.isArray(destino[i])) && typeof v === 'object' && v !== null) aplicarEnLugar(destino[i], v);
        else destino[i] = v;
      });
      return;
    }
    for (const k of Object.keys(fuente)) {
      const v = fuente[k];
      if ((esObjeto(destino[k]) || Array.isArray(destino[k])) && typeof v === 'object' && v !== null) aplicarEnLugar(destino[k], v);
      else destino[k] = v;
    }
  }

  // Rutas de `en` que no existen en `es` (por ejemplo 'p1.titulo'): traducciones de claves que no existen.
  function clavesSobrantes(es, en, prefijo = '') {
    if (!esObjeto(en)) return [];
    const r = [];
    for (const k of Object.keys(en)) {
      const ruta = prefijo ? `${prefijo}.${k}` : k;
      if (!esObjeto(es) || !(k in es)) r.push(ruta);
      else if (esObjeto(en[k])) r.push(...clavesSobrantes(es[k], en[k], ruta));
    }
    return r;
  }

  const I = {IDIOMAS, elegirIdioma, locale, copiaProfunda, fusionar, aplicarEnLugar, clavesSobrantes};
  if (typeof module !== 'undefined' && module.exports) module.exports = I;
  else window.IdiomaLogica = I;
})();
