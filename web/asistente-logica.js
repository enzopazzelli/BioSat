/* BioSat · lógica del asistente de inicio (sin interfaz).
   Se usa en el navegador (window.AsistenteLogica) y en las pruebas de Node (module.exports).
   Diseño: docs/superpowers/specs/2026-11-14-asistente-y-mapa-design.md */
(function () {
  const CLAVE = 'biosat.asistente.v1';
  const VERSION = 1;
  const ZONA_POR_DEFECTO = 'zona_2_secano_este';
  const MAX_PRIO = 3;
  const PRIO_IDS = ['agua', 'salitre', 'suelo', 'forraje', 'ingreso'];
  const PRIO_POR_DEFECTO = ['agua', 'suelo'];

  const esBooleano = (v) => (typeof v === 'boolean' ? v : null);

  const respuestasPorDefecto = () => ({zona: ZONA_POR_DEFECTO, riego: null, ganado: null, maq: null, prio: [], hecho: false});

  // Deja solo lo válido: lo que no sirve vuelve a su valor por defecto, sin error.
  function normalizar(obj, zonas) {
    const base = respuestasPorDefecto();
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return base;
    const prio = [];
    if (Array.isArray(obj.prio)) {
      for (const id of obj.prio) {
        if (PRIO_IDS.includes(id) && !prio.includes(id) && prio.length < MAX_PRIO) prio.push(id);
      }
    }
    return {
      zona: zonas && Object.prototype.hasOwnProperty.call(zonas, obj.zona) ? obj.zona : base.zona,
      riego: esBooleano(obj.riego),
      ganado: esBooleano(obj.ganado),
      maq: esBooleano(obj.maq),
      prio,
      hecho: obj.hecho === true
    };
  }

  // Lee las respuestas guardadas. Si el almacén no existe, falla o trae algo roto o de otra versión: valores por defecto.
  function leer(almacen, zonas) {
    try {
      const crudo = almacen && almacen.getItem(CLAVE);
      if (!crudo) return respuestasPorDefecto();
      const o = JSON.parse(crudo);
      if (!o || o.v !== VERSION) return respuestasPorDefecto();
      return normalizar(o, zonas);
    } catch (e) {
      return respuestasPorDefecto();
    }
  }

  function guardar(almacen, respuestas) {
    try {
      almacen.setItem(CLAVE, JSON.stringify({v: VERSION, ...respuestas}));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Agrega o quita un tema. Con 3 elegidos no deja agregar, pero quitar siempre se puede.
  function alternarPrio(prio, id) {
    if (!PRIO_IDS.includes(id)) return [...prio];
    if (prio.includes(id)) return prio.filter((x) => x !== id);
    if (prio.length >= MAX_PRIO) return [...prio];
    return [...prio, id];
  }

  // La respuesta de la persona manda; si no respondió (null), vale el riego de la zona.
  const riegoEfectivo = (respuesta, riegoDeLaZona) => (typeof respuesta === 'boolean' ? respuesta : !!riegoDeLaZona);

  // Convierte las respuestas en el `state` de app.js, completando lo que falta con los valores de siempre.
  function aEstado(respuestas, zonas) {
    const r = normalizar(respuestas, zonas);
    return {
      zona: r.zona,
      riego: riegoEfectivo(r.riego, zonas[r.zona].riego),
      ganado: r.ganado === null ? true : r.ganado,
      maq: r.maq === null ? false : r.maq,
      prio: new Set(r.prio.length ? r.prio : PRIO_POR_DEFECTO)
    };
  }

  // Abre solo la primera vez; con ?asistente=1 se abre siempre (demos y pruebas).
  function debeAbrir(respuestas, buscar) {
    if (/(?:^|[?&])asistente=1(?:&|$)/.test(String(buscar || ''))) return true;
    return !(respuestas && respuestas.hecho === true);
  }

  // Datos para la pantalla de resumen: sin textos, que van en TEXTOS.
  function resumen(respuestas, zonas) {
    const r = normalizar(respuestas, zonas);
    const z = zonas[r.zona];
    const tiene = [];
    if (riegoEfectivo(r.riego, z.riego)) tiene.push('riego');
    if (r.ganado === true) tiene.push('hacienda');
    if (r.maq === true) tiene.push('maq');
    return {num: z.num, pueblo: z.lugar, nombre: z.nombre, tiene, preocupa: r.prio};
  }

  const A = {CLAVE, ZONA_POR_DEFECTO, MAX_PRIO, PRIO_IDS, PRIO_POR_DEFECTO,
             respuestasPorDefecto, normalizar, leer, guardar, alternarPrio, riegoEfectivo, aEstado, debeAbrir, resumen};
  if (typeof module !== 'undefined' && module.exports) module.exports = A;
  else window.AsistenteLogica = A;
})();
