/* BioSat · lógica del lector de imágenes de dron (sin interfaz), D-38.
   Coordenadas, tipo de imagen, NDVI, zona del lote y textos. La lectura del archivo está en dron.js.
   Diseño: docs/superpowers/specs/2026-11-15-lector-dron-design.md.
   Regla (D-33): sin banda infrarroja no hay NDVI; la fecha, el sistema y la resolución salen del archivo o del usuario.
   Se usa en el navegador (window.DronLogica) y en Node (module.exports). */
(function () {
  // Textos con claves, listos para traducir (D-35). La tarea 4 suma los de la tarjeta y el Inicio.
  const TEXTOS = {
    locale: 'es-AR',
    avisoTamano: 'El archivo pesa {gb} GB: puede tardar mucho o no entrar en la memoria de un celular. Si se traba, probá en una computadora.'
  };
  const fmt = (txt, datos) => String(txt).replace(/\{(\w+)\}/g, (_, k) => datos[k]);
  const valido = (v, sinDato) => Number.isFinite(v) && (sinDato === null || sinDato === undefined || v !== sinDato);

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

  // ---------- Tipo de imagen y bandas ----------
  // ficha = {bandas, bits: [...], formato: 'uint'|'int'|'float', fotometrica} (PhotometricInterpretation: 2 = RGB).
  function tipoImagen(f) {
    const bits = f.bits || [];
    if ((f.bandas === 3 || f.bandas === 4) && bits.length && bits.every(b => b === 8) && f.fotometrica === 2) return 'rgb';
    if (f.bandas >= 4) return 'multi';
    if (f.bandas === 1 && f.formato === 'float') return 'una_decimal';
    return 'gris';
  }

  // Una banda decimal parece un NDVI ya calculado si hay datos y todos están entre -1 y 1. Igual se le pregunta al usuario.
  function pareceNdvi(valores, sinDato) {
    let hay = false;
    for (const v of valores) {
      if (!valido(v, sinDato)) continue;
      if (v < -1 || v > 1) return false;
      hay = true;
    }
    return hay;
  }

  // Descripción de cada banda desde la etiqueta GDAL_METADATA (Item name="DESCRIPTION" sample="k").
  function descripcionesBandas(xml, n) {
    const out = Array(n).fill('');
    if (!xml) return out;
    for (const m of String(xml).matchAll(/<Item\s+([^>]*)>([^<]*)<\/Item>/g)) {
      const attr = k => (m[1].match(new RegExp(k + '="([^"]*)"', 'i')) || [])[1];
      const k = Number(attr('sample'));
      if (/^description$/i.test(attr('name') || '') && Number.isInteger(k) && k >= 0 && k < n)
        out[k] = m[2].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
    }
    return out;
  }

  // Banda roja e infrarroja según la descripción (índices desde 0). Sin descripción, no se adivina.
  function bandasSugeridas(desc) {
    const esBorde = t => /red\s*-?\s*edge|rededge|borde/i.test(t);
    const rojo = desc.findIndex(t => /\b(red|rojo)\b/i.test(t) && !esBorde(t));
    const nir = desc.findIndex(t => /\bnir\b|near.?infra|infrarrojo/i.test(t));
    return {rojo: rojo < 0 ? null : rojo, nir: nir < 0 ? null : nir};
  }

  // ---------- NDVI ----------
  // NDVI = (NIR - Rojo) / (NIR + Rojo). NaN donde hay sin dato, máscara alfa en 0 o NIR + Rojo = 0.
  function ndvi(rojo, nir, sinDato, mascara) {
    const out = new Float32Array(rojo.length);
    for (let i = 0; i < rojo.length; i++) {
      const r = rojo[i], n = nir[i], s = n + r;
      out[i] = (mascara && mascara[i] === 0) || !valido(r, sinDato) || !valido(n, sinDato) || s === 0 ? NaN : (n - r) / s;
    }
    return out;
  }

  // Mediana y fracción de los valores válidos por debajo del umbral (estricto).
  function resumenNdvi(valores, umbral) {
    const v = Float32Array.from(valores).filter(Number.isFinite).sort();
    if (!v.length) return {mediana: null, fraccionBajo: null, validos: 0};
    const m = v.length >> 1;
    const mediana = v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
    let bajo = 0;
    for (const x of v) if (x < umbral) bajo++;
    return {mediana, fraccionBajo: bajo / v.length, validos: v.length};
  }

  // ---------- Fecha y tamaño ----------
  // DateTime de TIFF: "AAAA:MM:DD HH:MM:SS" → "AAAA-MM-DD".
  function fechaDeTiff(s) {
    const m = /^(\d{4}):(\d{2}):(\d{2})/.exec(s || '');
    if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return null;
    return `${m[1]}-${m[2]}-${m[3]}`;
  }

  const GB = 1024 ** 3;
  function avisoTamano(bytes) {
    if (!(bytes > GB)) return null;
    return fmt(TEXTOS.avisoTamano, {gb: (bytes / GB).toLocaleString(TEXTOS.locale, {maximumFractionDigits: 1})});
  }

  // ---------- Zona del lote (mapa del asistente: data/santiago_mapa.json) ----------
  // El mapa está en coordenadas de dibujo: x es lineal en la longitud e y en la latitud. La transformación se deduce
  // de los puntos de NASA POWER (puntosSvg[n] = {x, y}; puntosGeo[n] = {lat, lon}) por mínimos cuadrados.
  function ajuste(pares) {
    const n = pares.length, mx = pares.reduce((a, p) => a + p[0], 0) / n, my = pares.reduce((a, p) => a + p[1], 0) / n;
    const sxy = pares.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0), sxx = pares.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
    const pend = sxy / sxx;
    return [pend, my - pend * mx];
  }
  function transformacionMapa(puntosSvg, puntosGeo) {
    const ns = Object.keys(puntosGeo).filter(n => puntosSvg[n]);
    const [ax, bx] = ajuste(ns.map(n => [puntosGeo[n].lon, puntosSvg[n].x]));
    const [ay, by] = ajuste(ns.map(n => [puntosGeo[n].lat, puntosSvg[n].y]));
    return {ax, bx, ay, by};
  }

  // Path SVG con M, L y Z absolutos → anillos de [x, y].
  function parsearPath(d) {
    const anillos = [];
    let actual = null;
    for (const m of String(d).matchAll(/([MLZ])\s*(?:(-?[\d.]+)[,\s]+(-?[\d.]+))?/gi)) {
      const c = m[1].toUpperCase();
      if (c === 'M') { actual = [[+m[2], +m[3]]]; anillos.push(actual); }
      else if (c === 'L' && actual) actual.push([+m[2], +m[3]]);
      else if (c === 'Z') actual = null;
    }
    return anillos;
  }

  // Punto dentro de un conjunto de anillos, por paridad (sirve para huecos y para varias partes).
  function dentro(x, y, anillos) {
    let adentro = false;
    for (const a of anillos) {
      for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
        const [xi, yi] = a[i], [xj, yj] = a[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) adentro = !adentro;
      }
    }
    return adentro;
  }

  // Departamento y zona de BioSat del punto; null si cae fuera de Santiago del Estero.
  function zonaDelPunto(lat, lon, mapa, t) {
    const x = t.ax * lon + t.bx, y = t.ay * lat + t.by;
    for (const dep of (mapa && mapa.departamentos) || []) {
      if (!dep._anillos) Object.defineProperty(dep, '_anillos', {value: parsearPath(dep.d)});
      if (dentro(x, y, dep._anillos)) return {departamento: dep.nombre, zona: dep.zona};
    }
    return null;
  }

  const L = {TEXTOS, defProj4, epsgDe, recuadroLatLon, metrosPorPixel, tipoImagen, pareceNdvi, descripcionesBandas,
    bandasSugeridas, ndvi, resumenNdvi, fechaDeTiff, avisoTamano, transformacionMapa, parsearPath, zonaDelPunto};
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else window.DronLogica = L;
})();
