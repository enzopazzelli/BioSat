/* BioSat · cambio de idioma en el navegador (D-35). Solo español (los textos de siempre) e inglés (web/textos-en.js).
   Cambia los textos en su lugar y avisa para volver a dibujar: no recarga la página, así funciona sin internet.
   Uso:
     Idioma.registrar('inicio', InicioLogica.TEXTOS)  → guarda la copia en español y aplica el inglés si corresponde
     Idioma.alCambiar(fn)                              → fn(idioma) después de cada cambio (para volver a dibujar)
     Idioma.cambiar('en' | 'es'), Idioma.actual(), Idioma.nf(n, decimales), Idioma.rotacion(id)
   En el HTML: data-i18n="clave", data-i18n-attr="atributo:clave", data-solo-en (solo se ve en inglés)
   y <div data-idioma-boton></div> donde va el botón ES | EN.
   Diseño: docs/superpowers/specs/2026-11-15-idioma-es-en-design.md (C). */
(function () {
  const I = window.IdiomaLogica;
  const EN = window.TEXTOS_EN || {html: {}, modulos: {}, rotaciones: {}};
  const CLAVE = 'biosat.idioma';
  let guardado = null;
  try { guardado = localStorage.getItem(CLAVE); } catch (e) { /* navegador sin almacenamiento: se usa el idioma por defecto */ }
  let actual = I.elegirIdioma(location.search, guardado);
  const registrados = [], oyentes = [];

  function aplicarObjeto(r) {
    I.aplicarEnLugar(r.objeto, actual === 'en' ? I.fusionar(r.es, EN.modulos[r.nombre]) : r.es);
  }

  function registrar(nombre, objeto) {
    if (!objeto || registrados.some(r => r.objeto === objeto)) return;
    const r = {nombre, objeto, es: I.copiaProfunda(objeto)};
    registrados.push(r);
    if (actual === 'en') aplicarObjeto(r);
  }

  function pintarBotones() {
    document.querySelectorAll('[data-idioma-boton]').forEach(caja => {
      if (!caja.dataset.listo) {
        caja.classList.add('idioma');
        caja.setAttribute('role', 'group');
        caja.setAttribute('aria-label', 'Idioma / Language');
        caja.innerHTML = '<button type="button" data-lang="es" lang="es">ES</button><button type="button" data-lang="en" lang="en">EN</button>';
        caja.addEventListener('click', e => {
          const b = e.target.closest('[data-lang]');
          if (b) { e.stopPropagation(); cambiar(b.dataset.lang); }
        });
        caja.dataset.listo = '1';
      }
      caja.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === actual)));
    });
  }

  function aplicarHtml() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (!('es' in el.dataset)) el.dataset.es = el.textContent;
      const en = EN.html[el.dataset.i18n];
      el.textContent = actual === 'en' && en ? en : el.dataset.es;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const [attr, clave] = el.dataset.i18nAttr.split(':'), guarda = 'es' + attr.replace(/\W/g, '');
      if (!(guarda in el.dataset)) el.dataset[guarda] = el.getAttribute(attr) || '';
      const en = EN.html[clave];
      el.setAttribute(attr, actual === 'en' && en ? en : el.dataset[guarda]);
    });
    document.querySelectorAll('[data-solo-en]').forEach(el => { el.hidden = actual !== 'en'; });
    document.documentElement.lang = actual;
    pintarBotones();
  }

  function cambiar(idioma) {
    if (!I.IDIOMAS.includes(idioma) || idioma === actual) { pintarBotones(); return; }
    actual = idioma;
    try { localStorage.setItem(CLAVE, idioma); } catch (e) { /* sin almacenamiento: el cambio vale para esta visita */ }
    try {   // si el link traía ?lang=, se actualiza para que al recargar no vuelva al idioma anterior
      const u = new URL(location.href);
      if (u.searchParams.has('lang')) { u.searchParams.set('lang', idioma); history.replaceState(history.state, '', u); }
    } catch (e) { /* sin history: no pasa nada */ }
    registrados.forEach(aplicarObjeto);
    aplicarHtml();
    oyentes.forEach(fn => { try { fn(actual); } catch (e) { console.error(e); } });
  }

  const nf = (n, d = 0) => Number(n).toLocaleString(I.locale(actual), {minimumFractionDigits: d, maximumFractionDigits: d});
  const rotacion = id => (actual === 'en' && EN.rotaciones[id]) || null;

  // pintar(): dibuja los botones ES | EN que aparecieron después de cargar (por ejemplo, en el asistente).
  window.Idioma = {actual: () => actual, registrar, cambiar, alCambiar: fn => oyentes.push(fn), nf, rotacion, pintar: pintarBotones};
  aplicarHtml();   // los scripts van con defer: el HTML ya está armado
})();
