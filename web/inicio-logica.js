/* BioSat · lógica del Inicio (sin interfaz): semáforo de la zona y de la sonda, próxima siembra,
   meses de suelo pelado y texto para WhatsApp.
   Diseño: docs/superpowers/specs/2026-11-15-app-celular-y-reporte-design.md (4.3 a 4.8).
   Todo sale de los datos: si falta un dato, la señal se omite y nunca se escribe un número a mano.
   Se usa en el navegador (window.InicioLogica) y en Node (module.exports). */
(function () {
  const NIVELES = ['bien', 'atencion', 'cuidado'];

  // Textos con claves, listos para traducir.
  const TEXTOS = {
    nivel: ['BIEN', 'ATENCIÓN', 'CUIDADO'],
    rotulo: {zona: 'Tu zona en {mes} · lo típico', sonda: 'Tu lote, medido hoy'},
    senal: {
      falta: 'faltan unos {n} mm de agua para lo que pide el cultivo',
      pelado: 'unos {n} de cada 10 lotes de la zona tienen el suelo pelado',
      d35: 'hay unos {n} días de más de 35 °C',
      helada: 'hay unos {n} días con helada'
    },
    razonBien: 'Ni calor fuerte, ni heladas, ni una falta grande de agua: suele ser un mes tranquilo en tu zona.',
    accion: {
      falta: 'Conviene mantener el suelo cubierto hasta que lleguen las lluvias.',
      pelado: 'Conviene cubrir el suelo: un rastrojo o una cobertura lo protegen del sol y del viento.',
      d35: 'Cuidá la cobertura y evitá sembrar en los días de más calor.',
      helada: 'Cuidado con los cultivos sensibles a la helada.',
      bien: 'Buen momento para planificar la próxima siembra.'
    },
    sonda: ['El suelo de tu lote está bien.', 'El suelo de tu lote necesita atención.',
      'El suelo de tu lote está en riesgo: caliente o seco.'],
    sondaTemp: 'La sonda marca {t} °C en el suelo.',
    razonCorta: {falta: 'falta agua', pelado: 'suelo pelado', d35: 'mucho calor', helada: 'heladas'},
    sinConexion: 'No hay conexión a internet: el mensaje se puede mandar cuando vuelva la señal.',
    sondaError: 'No se pudo conectar la sonda. Revisá que esté enchufada por USB y elegí su puerto cuando el navegador lo pida.',
    sondaNoDisponible: 'Este celular o navegador no puede leer la sonda por USB. Usá Chrome o Edge en una computadora, o abrí la pantalla del kit.',
    whatsapp: {
      inicio: 'BioSat · {zona} · {mes}: {nivel}',
      razon: ' ({razon})',
      mejor: '. Lo que mejor encaja: {rotacion}',
      siembra: ' (próxima siembra: {mes})',
      cierre: '. Revisalo con tu ingeniero. {enlace}'
    }
  };

  // Umbrales del semáforo de la zona (diseño 4.3): [desde atención, desde cuidado].
  // falta, d35 y helada: < a → 0; de a a b → 1; > b → 2. pelado: < a → 0; < b → 1; ≥ b → 2.
  const UMBRALES = {falta: [50, 100], d35: [5, 10], helada: [2, 5], pelado: [0.25, 0.5]};
  const ORDEN = ['falta', 'pelado', 'd35', 'helada'];   // prioridad cuando dos señales empatan

  const fmt = (txt, datos) => String(txt).replace(/\{(\w+)\}/g, (_, k) => datos[k]);
  const numero = (n) => typeof n === 'number' && Number.isFinite(n);
  const mayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  function nivelDe(id, v) {
    const [a, b] = UMBRALES[id];
    if (id === 'pelado') return v < a ? 0 : (v < b ? 1 : 2);
    return v < a ? 0 : (v <= b ? 1 : 2);
  }
  function cantidad(id, v) {
    if (id === 'falta') return Math.round(v / 10) * 10;
    if (id === 'pelado') return Math.round(v * 10);
    return Math.round(v);
  }

  // Semáforo de la zona para el mes `mesIdx` (0 a 11). `m` = {falta, d35, helada}; `fraccionPelado` de 0 a 1 o null.
  function semaforoZona(mesIdx, m, fraccionPelado) {
    const valores = {falta: m && m.falta, d35: m && m.d35, helada: m && m.helada, pelado: fraccionPelado};
    const senales = ORDEN.filter(id => numero(valores[id]))
      .map(id => ({id, valor: valores[id], nivel: nivelDe(id, valores[id])}));
    const nivel = senales.reduce((mx, s) => Math.max(mx, s.nivel), 0);
    const altas = senales.filter(s => s.nivel > 0)
      .sort((x, y) => (y.nivel - x.nivel) || (ORDEN.indexOf(x.id) - ORDEN.indexOf(y.id)));
    const frases = altas.slice(0, 2).map(s => fmt(TEXTOS.senal[s.id], {n: cantidad(s.id, s.valor)}));
    const razon = frases.length ? mayuscula(frases.join(' y ')) + '.' : TEXTOS.razonBien;
    const accion = altas.length ? TEXTOS.accion[altas[0].id] : TEXTOS.accion.bien;
    return {mes: mesIdx, nivel, senales, razon, accion};
  }

  // Semáforo medido con la sonda: manda sobre el de la zona. Sin `semaforo` en la lectura, devuelve null.
  function semaforoSonda(lectura) {
    if (!lectura || !(lectura.semaforo in {verde: 1, amarillo: 1, rojo: 1})) return null;
    const nivel = {verde: 0, amarillo: 1, rojo: 2}[lectura.semaforo];
    const t = numero(lectura.temp_suelo_c) ? ' ' + fmt(TEXTOS.sondaTemp,
      {t: lectura.temp_suelo_c.toLocaleString('es-AR', {maximumFractionDigits: 1})}) : '';
    return {nivel, razon: TEXTOS.sonda[nivel] + t};
  }

  // El cultivo de la secuencia que se siembra antes, contando desde el mes actual (incluido) y dando la vuelta al año.
  function proximaSiembra(secuencia, mesIdx) {
    const mes = mesIdx + 1;
    const conMes = (secuencia || []).filter(s => Number.isInteger(s.siembra_mes) && s.siembra_mes >= 1 && s.siembra_mes <= 12);
    if (!conMes.length) return null;
    const s = conMes.reduce((mejor, x) => ((x.siembra_mes - mes + 12) % 12 < (mejor.siembra_mes - mes + 12) % 12 ? x : mejor));
    return {cultivo: s.cultivo, mes: s.siembra_mes};
  }

  // Cuenta los meses de suelo pelado ('D') de un calendario de 12 letras (C cultivo, V cobertura, R rastrojo, D pelado).
  function mesesPelados(cal) {
    return [...String(cal || '')].filter(c => c === 'D').length;
  }

  // Las señales en atención o cuidado, en pocas palabras (para WhatsApp): hasta 2, de mayor a menor.
  function razonCorta(senales) {
    return (senales || []).filter(s => s.nivel > 0)
      .sort((x, y) => (y.nivel - x.nivel) || (ORDEN.indexOf(x.id) - ORDEN.indexOf(y.id)))
      .slice(0, 2).map(s => TEXTOS.razonCorta[s.id]).join(' y ');
  }

  function textoWhatsApp(d) {
    const w = TEXTOS.whatsapp;
    let t = fmt(w.inicio, {zona: d.zona, mes: d.mes, nivel: d.nivelTexto});
    if (d.razonCorta) t += fmt(w.razon, {razon: d.razonCorta});
    t += fmt(w.mejor, {rotacion: d.rotacion});
    if (d.siembraMes) t += fmt(w.siembra, {mes: d.siembraMes});
    return t + fmt(w.cierre, {enlace: d.enlace});
  }

  const L = {NIVELES, TEXTOS, UMBRALES, semaforoZona, semaforoSonda, proximaSiembra, mesesPelados, razonCorta, textoWhatsApp};
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else window.InicioLogica = L;
})();
