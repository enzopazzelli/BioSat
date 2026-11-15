/* BioSat · lógica de la pantalla del kit (sin interfaz).
   Se usa en el navegador (window.KitLogica) y en las pruebas de Node (module.exports).
   Diseño: docs/superpowers/specs/2026-11-14-visor-kit-jurado-design.md */
(function () {
  const BANDEJAS_ORDEN = ['A', 'B', 'C'];
  const CLAVE_GRABADA = {A: 'A_pelada_seca', B: 'B_salitrosa', C: 'C_rastrojo'};
  const UMBRAL_SALITRE_POR_DEFECTO = 700;   // escala 0 a 1023 del sensor de agua
  const MAX_BUFFER = 10;

  const crearEstado = () => ({bandejas: {A: null, B: null, C: null}, activa: null, buffer: []});
  const reiniciar = () => crearEstado();
  const hora = (fecha) => fecha.toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit', hour12: false});

  function elegirBandeja(estado, letra) {
    return {bandejas: {...estado.bandejas, [letra]: null}, activa: letra, buffer: []};
  }

  // Estable: la temperatura del suelo cambia menos de umbralC en las últimas n lecturas
  function estaEstable(buffer, umbralC = 0.3, n = 5) {
    if (buffer.length < n) return false;
    const t = buffer.slice(-n).map(l => l.temp_suelo_c);
    return Math.max(...t) - Math.min(...t) < umbralC;
  }

  function progresoEstabilidad(buffer, umbralC = 0.3, n = 5) {
    if (buffer.length < n) return buffer.length / n;
    return estaEstable(buffer, umbralC, n) ? 1 : 0.9;
  }

  function registrarLectura(estado, lectura, ahora) {
    const buffer = [...estado.buffer, lectura].slice(-MAX_BUFFER);
    if (estado.activa && estaEstable(buffer)) {
      return {
        bandejas: {...estado.bandejas, [estado.activa]: {lectura, hora: hora(ahora), origen: 'vivo'}},
        activa: null,
        buffer
      };
    }
    return {...estado, buffer};
  }

  function guardarGrabada(estado, letra, lectura, ahora) {
    return {bandejas: {...estado.bandejas, [letra]: {lectura, hora: hora(ahora), origen: 'grabada'}}, activa: null, buffer: []};
  }

  function lecturaGrabada(demo, letra) {
    const lista = demo && demo.bandejas && demo.bandejas[CLAVE_GRABADA[letra]];
    return Array.isArray(lista) && lista.length ? lista[lista.length - 1] : null;
  }

  function umbralSalitre(demo) {
    const u = demo && demo.meta && demo.meta.umbrales && demo.meta.umbrales.conductividad_salitre_raw;
    return typeof u === 'number' ? u : UMBRAL_SALITRE_POR_DEFECTO;
  }

  // Textos de la pantalla del kit (kit.js y la frase de cierre), con claves para el inglés (D-35, web/textos-en.js).
  const TEXTOS = {
    cierreMas: 'El suelo pelado está {d} °C más caliente que el cubierto. El satélite no lo ve: mide el aire de 50 km.',
    cierreIgual: 'Pelado y cubierto marcan casi lo mismo ({d} °C): falta que la lámpara caliente las bandejas.',
    cierreSalitre: ' En la bandeja salitrosa, la conductividad muy alta avisa posible salitre.',
    muyAlta: ' · muy alta',
    grabada: 'lectura grabada',
    guardada: 'guardada {hora}',
    enVivo: '● en vivo · estabilizando',
    sinLectura: 'sin lectura',
    esperando: 'esperando',
    conectar: 'Conectar Arduino',
    conectado: 'Arduino conectado',
    noConecto: 'No se pudo conectar',
    noSoportado: 'Este navegador no permite leer el puerto USB: usá Chrome o Edge',
    sinLector: 'No se encontró el lector (arduino/lector-web-serial.js)',
    satelite: 'Satélite (NASA POWER, celda de 50 km): máxima media del aire en {mes}, {t} °C.{nueveKm} ¿Y el suelo?',
    sinNasa: 'Sin datos de NASA POWER para esta zona.',
    sinClima: 'Zona sin datos de clima',
    meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  };
  const fmt = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => o[k]);

  function fraseCierre(bandejas, umbral) {
    if (!bandejas.A || !bandejas.C) return null;
    const d = Math.round(bandejas.A.lectura.temp_suelo_c - bandejas.C.lectura.temp_suelo_c);
    let frase = fmt(d >= 1 ? TEXTOS.cierreMas : TEXTOS.cierreIgual, {d});
    if (bandejas.B && bandejas.B.lectura.agua_raw >= umbral) frase += TEXTOS.cierreSalitre;
    return frase;
  }

  function zonaDesdeParametro(valor, zonasValidas, porDefecto = 'zona_2_secano_este') {
    return zonasValidas.includes(valor) ? valor : porDefecto;
  }

  function letraDesdeTecla(key) {
    const k = String(key || '').toUpperCase();
    return ['A', 'B', 'C', 'R', 'F'].includes(k) ? k : null;
  }

  function aireSatelite(clima, zonaId, mes) {
    const z = clima && clima.zonas && clima.zonas[zonaId];
    if (!z) return null;
    const m = z.periodos.normal.meses.find(x => x.mes === mes);
    return m ? {tmax_c: m.tmax_c, nombreZona: z.nombre} : null;
  }

  const K = {BANDEJAS_ORDEN, CLAVE_GRABADA, crearEstado, reiniciar, elegirBandeja, registrarLectura, guardarGrabada,
             estaEstable, progresoEstabilidad, lecturaGrabada, umbralSalitre, fraseCierre, zonaDesdeParametro,
             letraDesdeTecla, aireSatelite, TEXTOS};
  if (typeof module !== 'undefined' && module.exports) module.exports = K;
  else window.KitLogica = K;
})();
