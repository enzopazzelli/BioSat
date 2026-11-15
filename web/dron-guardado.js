/* BioSat · el vuelo de dron guardado en el navegador (IndexedDB), D-39.
   Guarda la imagen achicada y su NDVI para tenerlos en el campo sin internet. El .tif original no se guarda.
   Nunca tira errores: si el navegador no deja guardar o leer, devuelve false o null y la app sigue sin el vuelo.
   Base `biosat`, versión 1, almacén `vuelo`, clave `actual`. */
(function () {
  const BASE = 'biosat', ALMACEN = 'vuelo', CLAVE = 'actual';

  function abrir() {
    return new Promise((ok, mal) => {
      if (!window.indexedDB) return mal(new Error('sin IndexedDB'));
      const r = indexedDB.open(BASE, 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(ALMACEN)) r.result.createObjectStore(ALMACEN); };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => mal(r.error);
      r.onblocked = () => mal(new Error('IndexedDB bloqueado'));
    });
  }
  async function operar(modo, fn) {
    const db = await abrir();
    try {
      return await new Promise((ok, mal) => {
        const tx = db.transaction(ALMACEN, modo), req = fn(tx.objectStore(ALMACEN));
        tx.oncomplete = () => ok(req && req.result);
        tx.onerror = () => mal(tx.error);
        tx.onabort = () => mal(tx.error || new Error('transacción cancelada'));
      });
    } finally { db.close(); }
  }

  async function guardar(paquete) {
    try { await operar('readwrite', s => s.put(paquete, CLAVE)); return true; }
    catch (e) { console.warn('BioSat: no se pudo guardar el vuelo', e); return false; }
  }
  async function leer() {
    try { return (await operar('readonly', s => s.get(CLAVE))) || null; }
    catch (e) { console.warn('BioSat: no se pudo leer el vuelo guardado', e); return null; }
  }
  async function borrar() {
    try { await operar('readwrite', s => s.delete(CLAVE)); }
    catch (e) { console.warn('BioSat: no se pudo borrar el vuelo guardado', e); }
  }

  window.BioSatGuardado = {guardar, leer, borrar};
})();
