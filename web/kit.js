/* BioSat · pantalla del kit para la mesa del jurado.
   Conecta la lógica (kit-logica.js) con la página, el teclado y el lector del Arduino (contratos §6). */
(function () {
  const K = window.KitLogica;
  const $ = s => document.querySelector(s);
  const T = K.TEXTOS;   // textos en español; web/idioma.js los cambia por los de web/textos-en.js (D-35)
  const fmt = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const nf = (n, d = 0) => window.Idioma ? Idioma.nf(n, d)
    : Number(n).toLocaleString('es-AR', {minimumFractionDigits: d, maximumFractionDigits: d});

  let estado = K.crearEstado(), demo = null, umbral = 700, conectado = false;
  let zona = null, mes = 1, aire = null, tHoy = null, estadoBoton = 'conectar';   // para redibujar al cambiar de idioma
  const sinLectura = new Set();   // bandejas elegidas sin Arduino y sin lectura grabada

  async function cargarJSON(ruta) {
    const r = await fetch(ruta, {cache: 'no-cache'});
    if (!r.ok) throw new Error(`${ruta}: ${r.status}`);
    return r.json();
  }

  const textoAgua = l => l.agua_raw == null ? '—' : nf(l.agua_raw) + (l.agua_raw >= umbral ? T.muyAlta : '');

  function dibujar() {
    for (const letra of K.BANDEJAS_ORDEN) {
      const el = document.querySelector(`.bandeja[data-letra="${letra}"]`);
      const g = estado.bandejas[letra], activa = estado.activa === letra;
      const l = g ? g.lectura : (activa && estado.buffer.length ? estado.buffer[estado.buffer.length - 1] : null);
      el.classList.toggle('en-vivo', activa);
      el.querySelector('.b-temp').textContent = l && l.temp_suelo_c != null ? nf(l.temp_suelo_c, 1) + '°' : '—';
      el.querySelector('.b-agua').textContent = l ? textoAgua(l) : '—';
      el.querySelector('.b-luz').textContent = l && l.luz_raw != null ? nf(l.luz_raw) : '—';
      el.querySelector('.b-aire').textContent = l && l.temp_aire_c != null
        ? `${nf(l.temp_aire_c, 1)} °C · ${l.hum_aire_pct != null ? nf(l.hum_aire_pct) + ' %' : '—'}` : '—';
      el.querySelector('.b-semaforo').className = 'b-semaforo' + (l && l.semaforo ? ' s-' + l.semaforo : '');
      const prog = el.querySelector('.b-prog');
      prog.hidden = !activa;
      if (activa) prog.firstElementChild.style.width = Math.round(K.progresoEstabilidad(estado.buffer) * 100) + '%';
      el.querySelector('.b-estado').textContent = g
        ? (g.origen === 'grabada' ? T.grabada : fmt(T.guardada, {hora: g.hora}))
        : activa ? T.enVivo : sinLectura.has(letra) ? T.sinLectura : T.esperando;
    }
    document.querySelectorAll('[data-elegir]').forEach(b => b.setAttribute('aria-pressed', String(estado.activa === b.dataset.elegir)));
    const frase = K.fraseCierre(estado.bandejas, umbral);
    $('#cierre').textContent = frase || '';
    $('#cierre').hidden = !frase;
  }

  function elegir(letra) {
    sinLectura.delete(letra);
    if (conectado) {
      estado = K.elegirBandeja(estado, letra);
    } else {
      const l = K.lecturaGrabada(demo, letra);
      if (l) estado = K.guardarGrabada(estado, letra, l, new Date());
      else { estado = {...estado, bandejas: {...estado.bandejas, [letra]: null}}; sinLectura.add(letra); }
    }
    dibujar();
  }

  function reiniciar() {
    estado = K.reiniciar();
    sinLectura.clear();
    dibujar();
  }

  function pantallaCompleta() {
    const pedido = document.fullscreenElement ? document.exitFullscreen && document.exitFullscreen()
                                              : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    if (pedido && pedido.catch) pedido.catch(() => {});
  }

  let tituloBoton = null;   // clave del aviso del botón cuando no se puede leer el USB
  function textoBoton() {
    const btn = $('#btnConectar');
    btn.textContent = T[estadoBoton];
    if (tituloBoton) btn.title = T[tituloBoton];
  }

  function prepararArduino() {
    const lector = window.BioSatArduino, btn = $('#btnConectar');
    textoBoton();
    if (!(lector && typeof lector.soportado === 'function' && lector.soportado())) {
      btn.disabled = true;
      tituloBoton = lector ? 'noSoportado' : 'sinLector';
      textoBoton();
      return;
    }
    btn.disabled = false;
    btn.title = '';
    btn.addEventListener('click', async () => {
      try {
        await lector.conectar(lectura => {
          // Se da por conectado con la primera lectura (el lector puede quedarse leyendo sin terminar).
          if (!conectado) { conectado = true; estadoBoton = 'conectado'; textoBoton(); btn.disabled = true; }
          estado = K.registrarLectura(estado, lectura, new Date());
          dibujar();
        });
      } catch (err) {
        estadoBoton = 'noConecto'; textoBoton();
        btn.title = err.message;
      }
    });
  }

  async function iniciar() {
    const [clima, grabadas, meteo] = await Promise.all([
      cargarJSON('../data/clima_zonas.json').catch(() => null),
      cargarJSON('../data/arduino_bandejas_demo.json').catch(() => null),
      cargarJSON('../data/meteomatics_santiago_zonas.json').catch(() => null)
    ]);
    demo = grabadas;
    umbral = K.umbralSalitre(demo);
    zona = K.zonaDesdeParametro(new URLSearchParams(location.search).get('zona'), clima ? Object.keys(clima.zonas) : []);
    mes = new Date().getMonth() + 1;
    aire = clima ? K.aireSatelite(clima, zona, mes) : null;
    // Escalera de escalas (D-34): NASA POWER a 50 km (lo típico) → Meteomatics a 9 km (hoy) → la sonda en el suelo.
    // La línea de 9 km aparece solo si el pronóstico trae el día de hoy: uno vencido no se muestra.
    const P = window.PronosticoLogica, hoy = P ? P.hoyLocalISO(new Date()) : null;
    const zm = P && meteo && Array.isArray(meteo.zonas) ? meteo.zonas.find(x => x.id === zona) : null;
    tHoy = zm ? P.maximaDeHoy(P.resumen(zm.pronostico_7_dias, hoy), hoy) : null;
    textosZona();
    prepararArduino();
    dibujar();
  }

  // Nombre de la zona y línea del satélite, en el idioma elegido (D-35). Los nombres de lugar no se traducen.
  function textosZona() {
    const P = window.PronosticoLogica, EN = window.TEXTOS_EN;
    const enIngles = window.Idioma && Idioma.actual() === 'en' && EN && EN.modulos.zonas[zona];
    $('#titulo').textContent = aire ? (enIngles ? EN.modulos.zonas[zona].nombre : aire.nombreZona) : T.sinClima;
    const nueveKm = tHoy === null || !P ? '' : ` ${P.TEXTOS.kitHoy.replace('{t}', nf(tHoy, 1))}`;
    $('#satelite').textContent = aire
      ? fmt(T.satelite, {mes: T.meses[mes - 1], t: nf(aire.tmax_c, 1), nueveKm})
      : T.sinNasa;
  }

  document.addEventListener('keydown', e => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = K.letraDesdeTecla(e.key);
    if (!k) return;
    e.preventDefault();
    if (k === 'R') reiniciar();
    else if (k === 'F') pantallaCompleta();
    else elegir(k);
  });
  document.querySelectorAll('[data-elegir]').forEach(b => b.addEventListener('click', () => elegir(b.dataset.elegir)));
  $('#btnReiniciar').addEventListener('click', reiniciar);
  $('#btnCompleta').addEventListener('click', pantallaCompleta);

  if (window.Idioma) {
    Idioma.registrar('kit', T);
    Idioma.registrar('pronostico', window.PronosticoLogica && PronosticoLogica.TEXTOS);
    Idioma.alCambiar(() => { if (zona) textosZona(); textoBoton(); dibujar(); });
  }
  iniciar();
})();
