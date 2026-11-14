/* BioSat · ventana del asistente de inicio.
   No conoce a app.js: recibe las zonas y las respuestas, y avisa con alCerrar().
   Uso:  BioSatAsistente.abrir({zonas, respuestas, mapa, alCerrar})
   Diseño: docs/superpowers/specs/2026-11-14-asistente-y-mapa-design.md */
(function () {
  const L = window.AsistenteLogica;

  // ------------------------------------------------------------------ Textos
  // Todos los textos de la ventana están acá, por pantalla, para poder traducirlos después.
  const TEXTOS = {
    comun: {
      progreso: 'Pregunta {n} de 4',
      atras: '← Atrás',
      siguiente: 'Siguiente →',
      saltar: 'Saltar',
      saltarAyuda: 'Saltar el asistente',
      si: 'Sí',
      no: 'No'
    },
    p1: {
      titulo: '¿Dónde queda tu campo?',
      ayuda: 'Tocá tu pueblo, o el color en el mapa.',
      grupo: 'Zona de tu campo',
      mapaAlt: 'Mapa de Santiago del Estero con las 5 zonas',
      depTitulo: '{nombre} · zona {num}',
      mapaPie: 'Límites: IGN, vía geoBoundaries (CC BY 3.0 IGO). Las zonas se dibujan por departamento, en forma aproximada. El clima de cada una sale de un punto de NASA POWER.',
      elegida: 'elegida'
    },
    p2: {
      titulo: '¿Qué tenés en tu campo?',
      ayuda: 'Tocá para cambiar entre Sí y No. Si no sabés, seguí adelante.',
      riego: {t: 'Riego', d: 'agua para regar los cultivos'},
      hacienda: {t: 'Hacienda', d: 'vacas, cabras u otros animales'},
      maq: {t: 'Sembradora o rolo', d: 'para sembrar sin arar'}
    },
    p3: {
      titulo: '¿Qué te preocupa más?',
      ayuda: 'Elegí hasta 3. Podés dejarlo en blanco.',
      lleno: 'Ya elegiste 3. Sacá uno para cambiarlo.',
      agua: 'Ahorrar agua',
      salitre: 'Frenar el salitre',
      suelo: 'Cuidar el suelo',
      forraje: 'Tener más pasto',
      ingreso: 'Que rinda en plata'
    },
    p4: {
      titulo: 'Esto es lo que entendimos',
      ayuda: '',
      campo: 'Tu campo',
      tiene: 'Tenés',
      preocupa: 'Te preocupa',
      nada: 'Nada en particular',
      aviso: 'Después lo podés cambiar cuando quieras.',
      terminar: 'Ver mi campo →',
      zona: 'Zona {num} · {pueblo}',
      riego: 'Riego',
      hacienda: 'Hacienda',
      maq: 'Sembradora o rolo'
    }
  };

  // Íconos de trazo (viewBox 24), propios. Los emojis se ven distinto en cada celular.
  const ICONOS = {
    riego: '<path d="M12 3v6M9 6.5l3 3 3-3"/><path d="M3 14c3-3 6 3 9 0s6 3 9 0"/><path d="M3 19c3-3 6 3 9 0s6 3 9 0"/>',
    hacienda: '<path d="M5 8C3 8 2 7 2 5c2 0 3 1 3 3zM19 8c2 0 3-1 3-3-2 0-3 1-3 3z"/><path d="M5 8h14v5a7 7 0 0 1-14 0z"/><circle cx="9.5" cy="12" r=".9"/><circle cx="14.5" cy="12" r=".9"/><path d="M9.5 17h5"/>',
    maq: '<circle cx="7" cy="17" r="3.5"/><circle cx="18" cy="18" r="2.5"/><path d="M3 17V9h7l2 4h4l2 3M10 9V5h4"/>',
    agua: '<path d="M12 3c3 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-6.5 6-11z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
    salitre: '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/>',
    suelo: '<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 12l9 4 9-4M3 16l9 4 9-4"/>',
    forraje: '<path d="M12 21V9"/><path d="M12 14c-4 0-6-3-6-7 4 0 6 3 6 7zM12 12c0-4 2-7 6-7 0 4-2 7-6 7z"/>',
    ingreso: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9c-.5-1-1.5-1.5-2.7-1.5-1.5 0-2.6.8-2.6 2s1 1.7 2.8 2.2 2.8 1 2.8 2.3-1.2 2-2.8 2c-1.3 0-2.4-.6-2.9-1.6M12 6v1.5M12 16.5V18"/>'
  };
  const icono = (id) => `<svg class="asist-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONOS[id] || ''}</svg>`;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const fmt = (txt, datos) => String(txt).replace(/\{(\w+)\}/g, (_, k) => (k in datos ? datos[k] : ''));
  const PANTALLAS = 4;
  const TEMAS = ['agua', 'salitre', 'suelo', 'forraje', 'ingreso'];
  const TARJETAS = ['riego', 'hacienda', 'maq'];

  // Mapa de la pantalla 1: un trazo por departamento, pintado con el color de su zona, y un círculo numerado
  // en el punto de cada zona. Tocar un departamento o un círculo elige la zona (los botones son lo accesible).
  function htmlMapa(mapa, zonaId, zonas) {
    if (!mapa || !Array.isArray(mapa.departamentos) || !Array.isArray(mapa.viewBox)) return '';
    const idPorNum = {};
    for (const [id, z] of Object.entries(zonas)) idPorNum[z.num] = id;
    const elegida = zonas[zonaId].num;
    const [ancho, alto] = mapa.viewBox;
    const deps = mapa.departamentos.map((d) =>
      `<path class="asist-dep z${d.zona}${d.zona === elegida ? ' on' : ''}" d="${esc(d.d)}" data-asist-mapa-zona="${esc(idPorNum[d.zona])}"><title>${esc(fmt(TEXTOS.p1.depTitulo, {nombre: d.nombre, num: d.zona}))}</title></path>`).join('');
    const puntos = Object.entries(mapa.puntos || {}).map(([num, p]) =>
      `<g class="asist-pto z${num}${Number(num) === elegida ? ' on' : ''}" data-asist-mapa-zona="${esc(idPorNum[num])}"><circle cx="${p.x}" cy="${p.y}" r="13"/><text x="${p.x}" y="${p.y}">${esc(num)}</text></g>`).join('');
    return `<svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${esc(TEXTOS.p1.mapaAlt)}">${deps}${puntos}</svg>
      <figcaption>${esc(TEXTOS.p1.mapaPie)}</figcaption>`;
  }

  // ------------------------------------------------------------------ Ventana
  let ventana = null;
  const abierto = () => !!ventana;

  function abrir(opciones) {
    if (ventana) return;
    const zonas = opciones.zonas;
    const previo = document.activeElement;
    const r = L.normalizar(opciones.respuestas, zonas);
    let pantalla = 0;
    let aviso = '';

    const raiz = document.createElement('div');
    raiz.className = 'asist';
    raiz.setAttribute('role', 'dialog');
    raiz.setAttribute('aria-modal', 'true');
    raiz.setAttribute('aria-labelledby', 'asist-titulo');
    raiz.innerHTML = `<div class="asist-caja">
      <button type="button" class="asist-saltar" data-asist-saltar aria-label="${esc(TEXTOS.comun.saltarAyuda)}">${esc(TEXTOS.comun.saltar)}</button>
      <div class="asist-barra" aria-hidden="true">${'<span></span>'.repeat(PANTALLAS)}</div>
      <p class="asist-pregunta"></p>
      <h2 id="asist-titulo" tabindex="-1"></h2>
      <p class="asist-ayuda"></p>
      <div class="asist-cuerpo"></div>
      <p class="asist-aviso" role="status" aria-live="polite"></p>
      <div class="asist-pie">
        <button type="button" class="asist-atras" data-asist-atras></button>
        <button type="button" class="asist-sig" data-asist-sig></button>
      </div></div>`;
    document.body.appendChild(raiz);
    ventana = raiz;

    // El resto de la página no recibe foco ni lector de pantalla mientras está abierta.
    const apagados = [];
    for (const el of document.body.children) {
      if (el !== raiz && !el.hasAttribute('inert')) { el.setAttribute('inert', ''); apagados.push(el); }
    }
    const overflowPrevio = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const q = (s) => raiz.querySelector(s);
    const valorTarjeta = (id) => {
      if (id === 'riego') return L.riegoEfectivo(r.riego, zonas[r.zona].riego);
      if (id === 'hacienda') return r.ganado === null ? true : r.ganado;   // el mismo supuesto de siempre de la app
      return r.maq === null ? false : r.maq;
    };
    const guardarTarjeta = (id, v) => { if (id === 'riego') r.riego = v; else if (id === 'hacienda') r.ganado = v; else r.maq = v; };

    function cuerpoP1() {
      const botones = Object.entries(zonas).map(([id, z]) => {
        const on = id === r.zona;
        return `<button type="button" class="asist-zona z${z.num}${on ? ' on' : ''}" role="radio" aria-checked="${on}" data-asist-zona="${esc(id)}">
          <span class="asist-num" aria-hidden="true">${z.num}</span>
          <span class="asist-zt"><strong>${esc(z.lugar)}</strong><span>${esc(z.nombre)}</span></span>
          <span class="asist-ok" aria-hidden="true">${on ? '✓' : ''}</span></button>`;
      }).join('');
      const mapa = htmlMapa(opciones.mapa, r.zona, zonas);
      return `<div class="asist-p1${mapa ? '' : ' sin-mapa'}">${mapa ? `<figure class="asist-mapa">${mapa}</figure>` : ''}
        <div class="asist-zonas" role="radiogroup" aria-label="${esc(TEXTOS.p1.grupo)}">${botones}</div></div>`;
    }
    function cuerpoP2() {
      return '<div class="asist-tarjetas">' + TARJETAS.map((id) => {
        const on = valorTarjeta(id), t = TEXTOS.p2[id];
        return `<button type="button" class="asist-tarjeta${on ? ' on' : ''}" role="switch" aria-checked="${on}" data-asist-tarjeta="${id}">
          ${icono(id)}<span class="asist-tt"><strong>${esc(t.t)}</strong><span>${esc(t.d)}</span></span>
          <span class="asist-sn">${esc(on ? TEXTOS.comun.si + ' ✓' : TEXTOS.comun.no)}</span></button>`;
      }).join('') + '</div>';
    }
    function cuerpoP3() {
      return '<div class="asist-temas">' + TEMAS.map((id) => {
        const on = r.prio.includes(id);
        return `<button type="button" class="asist-tema${on ? ' on' : ''}" aria-pressed="${on}" data-asist-prio="${id}">${icono(id)}<span>${esc(TEXTOS.p3[id])}</span></button>`;
      }).join('') + '</div>';
    }
    function cuerpoP4() {
      const res = L.resumen(r, zonas);
      const fila = (t, v) => `<div class="asist-fila"><dt>${esc(t)}</dt><dd>${esc(v)}</dd></div>`;
      const tiene = res.tiene.length ? res.tiene.map((k) => TEXTOS.p4[k]).join(', ') : TEXTOS.p4.nada;
      const preocupa = res.preocupa.length ? res.preocupa.map((k) => TEXTOS.p3[k]).join(', ') : TEXTOS.p4.nada;
      return `<dl class="asist-resumen">${fila(TEXTOS.p4.campo, fmt(TEXTOS.p4.zona, res) + ' · ' + res.nombre)}${fila(TEXTOS.p4.tiene, tiene)}${fila(TEXTOS.p4.preocupa, preocupa)}</dl>
        <p class="asist-nota">${esc(TEXTOS.p4.aviso)}</p>`;
    }
    const CUERPOS = [cuerpoP1, cuerpoP2, cuerpoP3, cuerpoP4];

    function dibujar(moverFoco) {
      const t = TEXTOS['p' + (pantalla + 1)];
      raiz.querySelectorAll('.asist-barra span').forEach((s, i) => s.classList.toggle('on', i <= pantalla));
      q('.asist-pregunta').textContent = fmt(TEXTOS.comun.progreso, {n: pantalla + 1});
      q('#asist-titulo').textContent = t.titulo;
      q('.asist-ayuda').textContent = t.ayuda;
      q('.asist-ayuda').hidden = !t.ayuda;
      q('.asist-cuerpo').innerHTML = CUERPOS[pantalla]();
      q('.asist-aviso').textContent = aviso;
      const atras = q('.asist-atras');
      atras.textContent = TEXTOS.comun.atras;
      atras.style.visibility = pantalla === 0 ? 'hidden' : 'visible';
      q('.asist-sig').textContent = pantalla === PANTALLAS - 1 ? TEXTOS.p4.terminar : TEXTOS.comun.siguiente;
      if (moverFoco) q('#asist-titulo').focus();
    }

    // Al redibujar se reemplazan los botones: el foco vuelve al mismo, para quien usa el teclado.
    function enfocar(selector) { const el = raiz.querySelector(selector); if (el) el.focus(); }

    function cerrar(motivo) {
      ventana = null;
      raiz.remove();
      for (const el of apagados) el.removeAttribute('inert');
      document.documentElement.style.overflow = overflowPrevio;
      if (previo && typeof previo.focus === 'function') previo.focus();
      opciones.alCerrar({...r, hecho: true}, motivo);
    }

    function irA(n) {
      // Al salir de la pantalla 2, lo que se ve en las tarjetas pasa a ser la respuesta.
      if (pantalla === 1 && n > pantalla) for (const id of TARJETAS) guardarTarjeta(id, valorTarjeta(id));
      pantalla = n; aviso = '';
      dibujar(true);
    }

    raiz.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-asist-saltar')) return cerrar('saltar');
      if (b.hasAttribute('data-asist-atras')) return irA(Math.max(0, pantalla - 1));
      if (b.hasAttribute('data-asist-sig')) return pantalla === PANTALLAS - 1 ? cerrar('terminar') : irA(pantalla + 1);
      if (b.dataset.asistZona) { r.zona = b.dataset.asistZona; dibujar(false); return enfocar(`[data-asist-zona="${b.dataset.asistZona}"]`); }
      if (b.dataset.asistTarjeta) { guardarTarjeta(b.dataset.asistTarjeta, !valorTarjeta(b.dataset.asistTarjeta)); dibujar(false); return enfocar(`[data-asist-tarjeta="${b.dataset.asistTarjeta}"]`); }
      if (b.dataset.asistPrio) {
        const antes = r.prio.length;
        r.prio = L.alternarPrio(r.prio, b.dataset.asistPrio);
        aviso = (r.prio.length === antes && !r.prio.includes(b.dataset.asistPrio)) ? TEXTOS.p3.lleno : '';
        dibujar(false);
        enfocar(`[data-asist-prio="${b.dataset.asistPrio}"]`);
      }
    });
    // Tocar un departamento del mapa elige la zona, igual que el botón.
    raiz.addEventListener('click', (e) => {
      const z = e.target.closest('[data-asist-mapa-zona]');
      if (z) { r.zona = z.dataset.asistMapaZona; dibujar(false); enfocar('.asist-zona.on'); }
    });

    raiz.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); return cerrar('saltar'); }
      if (e.key !== 'Tab') return;
      const f = [...raiz.querySelectorAll('button:not([disabled]), [tabindex="0"]')].filter((x) => x.offsetParent !== null && getComputedStyle(x).visibility !== 'hidden');
      if (!f.length) return;
      const primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === q('#asist-titulo'))) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    });

    dibujar(true);
  }

  window.BioSatAsistente = {abrir, abierto, TEXTOS};
})();
