/* BioSat · lógica del lector de imágenes de dron (sin interfaz), D-38.
   Coordenadas, tipo de imagen, NDVI, zona del lote y textos. La lectura del archivo está en dron.js.
   Diseño: docs/superpowers/specs/2026-11-15-lector-dron-design.md.
   Regla (D-33): sin banda infrarroja no hay NDVI; la fecha, el sistema y la resolución salen del archivo o del usuario.
   Se usa en el navegador (window.DronLogica) y en Node (module.exports). */
(function () {
  // ---------- Coordenadas ----------
  const UTM = (zona, sur) => `+proj=utm +zone=${zona}${sur ? ' +south' : ''} +datum=WGS84 +units=m +no_defs`;

  // Definición de proj4 para los sistemas que la app entiende; null para cualquier otro.
  function defProj4(epsg) {
    if (epsg === 4326) return '+proj=longlat +datum=WGS84 +no_defs';
    if (epsg === 3857) return '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs';
    if (epsg >= 32601 && epsg <= 32660) return UTM(epsg - 32600, false);
    if (epsg >= 32701 && epsg <= 32760) return UTM(epsg - 32700, true);
    if (epsg >= 5343 && epsg <= 5349) {   // POSGAR 2007, fajas 1 a 7 (sistema oficial argentino)
      const n = epsg - 5342;
      return `+proj=tmerc +lat_0=-90 +lon_0=${-72 + 3 * (n - 1)} +k=1 +x_0=${n * 1000000 + 500000} +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs`;
    }
    return null;
  }

  // Código EPSG a partir de las GeoKeys del GeoTIFF. 32767 = "definido por el usuario": no se puede usar.
  function epsgDe(geoKeys) {
    if (!geoKeys) return null;
    const ok = c => Number.isInteger(c) && c > 0 && c !== 32767 ? c : null;
    if (geoKeys.GTModelTypeGeoKey === 2) return ok(geoKeys.GeographicTypeGeoKey);
    return ok(geoKeys.ProjectedCSTypeGeoKey) ?? ok(geoKeys.GeographicTypeGeoKey);
  }

  // Recuadro recto en latitud y longitud que envuelve las 4 esquinas transformadas: [[sur, oeste], [norte, este]].
  function recuadroLatLon(bbox, aLonLat) {
    const [x0, y0, x1, y1] = bbox;
    const esquinas = [[x0, y0], [x0, y1], [x1, y0], [x1, y1]].map(([x, y]) => aLonLat(x, y));
    const lons = esquinas.map(p => p[0]), lats = esquinas.map(p => p[1]);
    return [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]];
  }

  // Metros por píxel a lo ancho, aproximado con 111 320 m por grado × cos(latitud media).
  function metrosPorPixel(recuadro, anchoPx) {
    const [[s, o], [n, e]] = recuadro;
    return (e - o) * 111320 * Math.cos(((s + n) / 2) * Math.PI / 180) / anchoPx;
  }

  const L = {defProj4, epsgDe, recuadroLatLon, metrosPorPixel};
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else window.DronLogica = L;
})();
