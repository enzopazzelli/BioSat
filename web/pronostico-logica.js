/* BioSat · lógica del pronóstico de Meteomatics (sin interfaz): días vigentes, resumen de la semana
   y fecha local. Diseño: docs/superpowers/specs/2026-11-15-inicio-pc-y-meteomatics-design.md (B), D-34.
   Lee data/meteomatics_santiago_zonas.json (pronóstico de 7 días, ECMWF 9 km, bajado por scripts/descargar_meteomatics.py).
   Un día que ya pasó no se cuenta, y un pronóstico sin días vigentes se muestra como vencido, nunca como actual.
   -999 (el "sin dato" de Meteomatics) y null no se suman ni se cuentan.
   Se usa en el navegador (window.PronosticoLogica) y en Node (module.exports). */
(function () {
  // Criterios del equipo, de docs/integracion-meteomatics.md §5. La tarjeta lo aclara.
  const UMBRALES = {calorC: 38, vientoKmh: 15};

  // Textos con claves, listos para traducir.
  const TEXTOS = {
    titulo: 'Esta semana en tu zona',
    sub: 'Próximos {n} días',
    hoy: 'Hoy',
    diasSemana: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    fuente: 'Pronóstico de Meteomatics (modelo europeo ECMWF, 9 km), bajado el {fecha}.',
    vencido: 'Pronóstico vencido (bajado el {fecha}). Se actualiza todos los días.',
    complemento: 'El semáforo muestra lo típico de {mes}; esto es lo que se anuncia para estos días.',
    lluvia: '{mm} mm de lluvia en total (la mayor, el {dia}: {mmDia} mm)',
    sinLluvia: 'Sin lluvia anunciada',
    calor: '{n} días de más de 38 °C',
    helada: '{n} días con alerta de helada',
    hoja: '{n} noches con hoja mojada (favorece hongos)',
    viento: '{n} días con viento de menos de 15 km/h (para pulverizar)',
    criterio: 'Más de 38 °C y viento de menos de 15 km/h son criterios del equipo.',
    criterioCalor: 'Más de 38 °C es un criterio del equipo.',
    tabla: {dia: 'Día', temp: 'Máx / mín', lluvia: 'Lluvia', helada: 'Helada', hoja: 'Hoja mojada (noche)', si: 'Sí', no: '—'}
  };

  const dato = v => (typeof v === 'number' && Number.isFinite(v) && v !== -999) ? v : null;
  const dos = n => String(n).padStart(2, '0');

  // Fecha local (no UTC): a las 22:30 de Argentina sigue siendo hoy.
  function hoyLocalISO(date) {
    return `${date.getFullYear()}-${dos(date.getMonth() + 1)}-${dos(date.getDate())}`;
  }

  // 'YYYY-MM-DD' → 'dom 15/11'
  function fechaCorta(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    return `${TEXTOS.diasSemana[new Date(a, m - 1, d).getDay()]} ${dos(d)}/${dos(m)}`;
  }

  // Meteomatics: los parámetros de intervalo son "right-bounded" (docs de la API, Date/Time, "Interval parameters").
  // precip_24h:mm fechado el 16/11 00:00 UTC es la lluvia del 15/11 00 UTC al 16/11 00 UTC: cada fila describe
  // el día ANTERIOR a su fecha. Los valores instantáneos de esa fila (hoja mojada) son de las 00 UTC = 21 h de
  // Argentina de ese mismo día anterior, o sea de su noche.
  function diaAnterior(iso) {
    const [a, m, d] = iso.split('-').map(Number), f = new Date(Date.UTC(a, m - 1, d - 1));
    return `${f.getUTCFullYear()}-${dos(f.getUTCMonth() + 1)}-${dos(f.getUTCDate())}`;
  }

  function leerDia(x) {
    // Solo el promedio de 24 h sirve para "viento bajo para pulverizar". wind_speed_10m:ms es instantáneo
    // (21 h de Argentina) y no se usa: sin promedio, el viento queda sin dato.
    const viento = dato(x['wind_speed_mean_10m_24h:ms']);
    return {
      fecha: diaAnterior(String(x.fecha).slice(0, 10)),
      tmax: dato(x['t_max_2m_24h:C']),
      tmin: dato(x['t_min_2m_24h:C']),
      lluvia: dato(x['precip_24h:mm']),
      helada: dato(x['frost_warning_24h:idx']) === 1,
      hojaMojada: dato(x['leaf_wetness:idx']) === 1,
      vientoKmh: viento === null ? null : viento * 3.6
    };
  }

  function resumen(dias, hoyISO) {
    const vig = (Array.isArray(dias) ? dias : []).filter(x => x && x.fecha).map(leerDia).filter(d => d.fecha >= hoyISO);
    const conLluvia = vig.filter(d => d.lluvia !== null);
    const mayor = conLluvia.reduce((m, d) => (!m || d.lluvia > m.lluvia ? d : m), null);
    return {
      vigente: vig.length > 0,
      n: vig.length,
      dias: vig,
      lluviaTotal: conLluvia.length ? conLluvia.reduce((s, d) => s + d.lluvia, 0) : null,
      diaMasLluvia: mayor ? {fecha: mayor.fecha, mm: mayor.lluvia} : null,
      diasCalor: vig.filter(d => d.tmax !== null && d.tmax > UMBRALES.calorC).length,
      diasHelada: vig.filter(d => d.helada).length,
      diasHojaMojada: vig.filter(d => d.hojaMojada).length,
      diasVientoBajo: vig.filter(d => d.vientoKmh !== null && d.vientoKmh < UMBRALES.vientoKmh).length,
      hayViento: vig.some(d => d.vientoKmh !== null)
    };
  }

  const P = {UMBRALES, TEXTOS, hoyLocalISO, fechaCorta, resumen};
  if (typeof module !== 'undefined' && module.exports) module.exports = P;
  else window.PronosticoLogica = P;
})();
