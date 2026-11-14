/* BioSat · lector del Arduino por USB (Web Serial).
   Contrato: docs/contratos-de-datos.md §6. Funciona en Chrome y Edge (no en Firefox ni Safari).
   Deja disponible en el navegador:
     window.BioSatArduino = { soportado(), conectar(alLeer), desconectar() }
   y en Node (para las pruebas): parsearLinea, crearAcumulador, hayWebSerial. */
(function () {
  const BAUDIOS = 9600;                 // tiene que coincidir con Serial.begin() del sketch
  const MAX_LINEA = 1000;               // una línea del sketch mide menos de 150 caracteres
  const SEMAFOROS = ['verde', 'amarillo', 'rojo'];
  const CAMPOS_NUM = ['t', 'agua_raw', 'temp_suelo_c', 'temp_aire_c', 'hum_aire_pct', 'luz_raw'];

  const hayWebSerial = (nav) => !!(nav && 'serial' in nav);

  // Convierte una línea de texto en una lectura, o null si no es una línea del sketch.
  // Los valores que no son números finitos pasan a null: la app los muestra como "—".
  function parsearLinea(texto) {
    const s = String(texto || '').trim();
    if (!s || s[0] !== '{') return null;
    let o;
    try { o = JSON.parse(s); } catch (e) { return null; }
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    if (!CAMPOS_NUM.some(k => k in o)) return null;
    const lectura = {};
    for (const k of CAMPOS_NUM) lectura[k] = typeof o[k] === 'number' && Number.isFinite(o[k]) ? o[k] : null;
    lectura.semaforo = SEMAFOROS.includes(o.semaforo) ? o.semaforo : null;
    return lectura;
  }

  // Junta los trozos que llegan por el puerto y devuelve las lecturas de las líneas completas.
  function crearAcumulador() {
    let resto = '';
    return {
      agregar(trozo) {
        resto += trozo;
        const partes = resto.split('\n');
        resto = partes.pop();
        if (resto.length > MAX_LINEA) resto = '';   // basura sin salto de línea: no dejar crecer
        const salida = [];
        for (const p of partes) {
          const l = parsearLinea(p);
          if (l) salida.push(l);
        }
        return salida;
      }
    };
  }

  const K = {parsearLinea, crearAcumulador, hayWebSerial, BAUDIOS};
  if (typeof module !== 'undefined' && module.exports) { module.exports = K; return; }

  // ---------------------------------------------------------------- navegador
  let puerto = null, lector = null, activo = false;

  async function cerrar() {
    activo = false;
    try { if (lector) await lector.cancel(); } catch (e) { /* ya estaba cerrado */ }
    try { if (puerto) await puerto.close(); } catch (e) { /* ya estaba cerrado */ }
    lector = null; puerto = null;
  }

  async function leer(alLeer) {
    const acum = crearAcumulador();
    const decodificador = new TextDecoder();
    try {
      while (activo && puerto && puerto.readable) {
        lector = puerto.readable.getReader();
        try {
          while (activo) {
            const {value, done} = await lector.read();
            if (done) break;
            for (const l of acum.agregar(decodificador.decode(value, {stream: true}))) alLeer(l);
          }
        } finally { lector.releaseLock(); }
      }
    } catch (e) { /* cable desconectado o puerto cerrado: se termina la lectura */ }
    await cerrar();
  }

  window.BioSatArduino = {
    soportado: () => hayWebSerial(navigator),
    // Pide el puerto al usuario, lo abre y devuelve apenas queda abierto; las lecturas siguen
    // llegando a alLeer(lectura) hasta que se llame a desconectar() o se saque el cable.
    conectar: async (alLeer) => {
      if (!hayWebSerial(navigator)) throw new Error('Este navegador no tiene Web Serial: usá Chrome o Edge.');
      await cerrar();
      puerto = await navigator.serial.requestPort();
      await puerto.open({baudRate: BAUDIOS});
      activo = true;
      leer(alLeer);
    },
    desconectar: cerrar
  };
})();
