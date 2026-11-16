/* Device-local cache of rendered previews. The original TIFF remains in account storage. */
(() => {
  'use strict';
  const NAME = 'biosat-tiff-previews-v1';
  const MAX_ENTRIES = 24;
  const MAX_BYTES = 48 * 1024 * 1024;
  const MAX_PREVIEW_BYTES = 12 * 1024 * 1024;

  const path = (owner, id, slide, mode) =>
    '/ui/.preview-cache/' + [owner.toLowerCase(), id, String(slide), mode].map(encodeURIComponent).join('/');
  const request = (owner, id, slide, mode) => new Request(new URL(path(owner,id,slide,mode), location.origin));
  const available = () => typeof caches !== 'undefined' && !!window.isSecureContext;
  const matchingMode = (requested, result) => result?.mode === requested ||
    (requested === 'color' && result?.mode === 'gray' && result?.colorAvailable === false);

  async function get(owner, id, slide, mode) {
    if (!available() || !owner) return null;
    try {
      const cache = await caches.open(NAME);
      const response = await cache.match(request(owner,id,slide,mode));
      if (!response) return null;
      const result = await response.json();
      if (result?.slideIndex !== slide || !matchingMode(mode,result) ||
          typeof result?.url !== 'string' || !result.url.startsWith('data:image/png;base64,')) {
        await cache.delete(request(owner,id,slide,mode));
        return null;
      }
      return result;
    } catch { return null; }
  }

  async function put(owner, id, slide, mode, result) {
    if (!available() || !owner || typeof result?.url !== 'string' ||
        result.url.length > MAX_PREVIEW_BYTES || !matchingMode(mode,result)) return false;
    try {
      const body = JSON.stringify(result);
      const cache = await caches.open(NAME);
      await cache.put(request(owner,id,slide,mode), new Response(body, {
        headers:{'content-type':'application/json','x-biosat-bytes':String(body.length)}
      }));
      const keys = await cache.keys();
      let bytes = 0;
      const entries = [];
      for (const key of keys) {
        const response = await cache.match(key);
        const size = Number(response?.headers.get('x-biosat-bytes')) || 0;
        entries.push({key,size});
        bytes += size;
      }
      while (entries.length > MAX_ENTRIES || bytes > MAX_BYTES) {
        const oldest = entries.shift();
        await cache.delete(oldest.key);
        bytes -= oldest.size;
      }
      return true;
    } catch { return false; }
  }

  async function removeFile(owner, id) {
    if (!available() || !owner) return;
    try {
      const cache = await caches.open(NAME);
      const prefix = new URL('/ui/.preview-cache/' + [owner.toLowerCase(),id].map(encodeURIComponent).join('/') + '/',location.origin).href;
      for (const key of await cache.keys()) if (key.url.startsWith(prefix)) await cache.delete(key);
    } catch {}
  }

  window.BioSatPreviewCache = {get,put,removeFile};
})();
