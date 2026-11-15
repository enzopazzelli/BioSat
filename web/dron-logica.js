/* BioSat · lógica del lector de imágenes de dron (sin interfaz), D-38.
   Coordenadas, tipo de imagen, NDVI, zona del lote y textos. La lectura del archivo está en dron.js.
   Diseño: docs/superpowers/specs/2026-11-15-lector-dron-design.md.
   Regla (D-33): sin banda infrarroja no hay NDVI; la fecha, el sistema y la resolución salen del archivo o del usuario.
   Se usa en el navegador (window.DronLogica) y en Node (module.exports). */
(function () {
  // Textos con claves, listos para traducir (D-35). La tarea 4 suma los de la tarjeta y el Inicio.
  const TEXTOS = {
    locale: 'es-AR',
    // Caja del visor (dron.js)
    caja: 'Imagen de tu dron',
    abrir: 'Abrir un .tif de dron',
    privado: 'Tu archivo no sale de este equipo: la app lo lee acá y no lo guarda.',
    leyendo: 'Leyendo la imagen…',
    avisoTamano: 'El archivo pesa {gb} GB: puede tardar mucho o no entrar en la memoria de un celular. Si se traba, probá en una computadora.',
    sinCoordenadas: 'Este archivo no trae coordenadas: la app no puede ubicarlo en el mapa. Hace falta un ortomosaico georreferenciado (GeoTIFF).',
    epsgDesconocido: 'Este archivo usa el sistema de coordenadas EPSG:{epsg}, que la app no reconoce: no puede ubicarlo en el mapa.',
    noEsTiff: 'No se pudo leer el archivo como GeoTIFF. Elegí un .tif o .tiff de un vuelo de dron.',
    elegirBandas: 'Este archivo tiene {n} bandas. Elegí cuál es la roja y cuál la infrarroja (NIR) para calcular el NDVI. Si no sabés, fijate en el programa que armó el mosaico.',
    bandaRoja: 'Banda roja',
    bandaNir: 'Banda infrarroja (NIR)',
    banda: 'Banda {n}',
    bandaDesc: 'Banda {n} · {desc}',
    calcular: 'Calcular NDVI',
    esNdvi: 'Este archivo tiene una sola banda con valores entre -1 y 1. ¿Es un mapa de NDVI?',
    siNdvi: 'Sí, es NDVI',
    noNdvi: 'No',
    fechaVuelo: 'Fecha del vuelo',
    fechaSinDato: 'fecha sin dato',
    capa: 'Dron · {fecha}',
    cmp: 'Landsat contra dron',
    cmpIzq: '← Landsat',
    cmpDer: 'Dron →',
    // Tarjeta del Reporte (app.js)
    titulo: 'Tu lote, visto por el dron',
    paraIngeniero: 'Para tu ingeniero',
    cambiarZona: 'Cambiar a la Zona {n}',
    cmpMediana: 'NDVI mediano del lote: {ndvi}.',
    cmpSuperficie: '{pct} % de la superficie sin cobertura vegetal activa (NDVI menor a {umbral}).',
    cmpZona: 'Tu zona en {mes}, según Landsat {periodo}: {n} de cada 10 lotes con NDVI mediano menor a {umbral}.',
    cmpZonaSinDato: 'Tu zona en {mes}: sin dato de Landsat para comparar.',
    cmpSinFecha: 'Sin la fecha del vuelo no se puede comparar con tu zona: escribila arriba.',
    cmpCriterioCon: 'Con ese mismo criterio, tu lote se vería con cobertura activa.',
    cmpCriterioSin: 'Con ese mismo criterio, tu lote se vería sin cobertura activa.',
    cmpRgb: 'Este archivo es una foto en color (RGB): no trae la banda infrarroja que hace falta para el NDVI.',
    cmpGris: 'Este archivo no trae las bandas para calcular el NDVI: se muestra en grises.',
    cmpOtraZona: 'La imagen está en {departamento} (Zona {n}), no en la zona elegida.',
    cmpFuera: 'La imagen está fuera de Santiago del Estero: la comparación con las zonas no aplica.',
    // Para tu ingeniero
    fichaBandas: 'Rojo: banda {rojo} · infrarrojo: banda {nir}.',
    fichaNdviArchivo: 'NDVI tomado del archivo: confirmaste que la banda es un NDVI.',
    fichaCalibracion: 'Si el mosaico no está calibrado a reflectancia, el NDVI es aproximado.',
    fichaSistema: 'Sistema de coordenadas: EPSG:{epsg}.',
    fichaTamano: 'Archivo de {ancho} × {alto} píxeles. Los números se calculan sobre una versión de {calculo} píxeles de ancho, de unos {res} por píxel.',
    fichaRecuadro: 'La imagen se ubica con un recuadro recto en latitud y longitud: en un lote de pocos kilómetros, el desvío es de centímetros a pocos metros.',
    // Línea del Inicio (app.js)
    inicioSinVuelo: '¿Tenés una imagen de dron? Abrila en el Reporte',
    inicioPendiente: 'Tu imagen de dron necesita un paso más en el Reporte.',
    verEnMapa: 'Ver en el mapa →',
    linea: 'Tu lote, según el dron ({fecha}): {detalle}.',
    lineaNdvi: 'NDVI mediano {ndvi} · {pct} % sin cobertura activa',
    lineaRgb: 'foto en color, sin NDVI',
    lineaGris: 'imagen sin NDVI',
    lineaOtraZona: 'Está en la Zona {n}, no en la elegida.',
    lineaFuera: 'Está fuera de Santiago del Estero.'
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

  // ---------- Textos de la tarjeta, del Inicio y de "Para tu ingeniero" ----------
  // r = {tipo: 'ndvi'|'rgb'|'gris'|'pendiente', fecha: 'AAAA-MM-DD'|null, mediana, fraccionBajo, zonaLote, departamento, zonaElegida}
  const num = (v, d) => v.toLocaleString(TEXTOS.locale, {minimumFractionDigits: d, maximumFractionDigits: d});
  // Día y mes en el orden del idioma (es-AR: 03/11; en-US: 11/03), con dos dígitos. Del idioma se toma solo el orden:
  // es-AR devuelve "3/11" aunque se pida '2-digit'.
  function diaMes(f) {
    if (!f) return TEXTOS.fechaSinDato;
    const orden = new Intl.DateTimeFormat(TEXTOS.locale, {day: 'numeric', month: 'numeric', timeZone: 'UTC'})
      .formatToParts(new Date(Date.UTC(2000, 10, 3))).map(p => p.type).filter(t => t === 'day' || t === 'month');
    const partes = {day: f.slice(8, 10), month: f.slice(5, 7)};
    return orden.map(t => partes[t]).join('/');
  }
  const pct = f => Math.round(f * 100);
  const enOtraZona = r => r.zonaLote !== null && r.zonaLote !== undefined && r.zonaLote !== r.zonaElegida;
  const fuera = r => r.zonaLote === null || r.zonaLote === undefined;

  function lineaInicio(r) {
    if (!r) return TEXTOS.inicioSinVuelo;
    if (r.tipo === 'pendiente') return TEXTOS.inicioPendiente;
    const detalle = r.tipo === 'ndvi' && r.mediana !== null && r.mediana !== undefined
      ? fmt(TEXTOS.lineaNdvi, {ndvi: num(r.mediana, 2), pct: pct(r.fraccionBajo)})
      : (r.tipo === 'rgb' ? TEXTOS.lineaRgb : TEXTOS.lineaGris);
    const partes = [fmt(TEXTOS.linea, {fecha: diaMes(r.fecha), detalle})];
    if (fuera(r)) partes.push(TEXTOS.lineaFuera);
    else if (enOtraZona(r)) partes.push(fmt(TEXTOS.lineaOtraZona, {n: r.zonaLote}));
    return partes.join(' ');
  }

  // z = {fraccionZonaMes, mesNombre, periodo, umbral}. Landsat cuenta lotes; el dron mide superficie: no se mezclan.
  // Solo se compara con la zona si el lote cae en la zona elegida (si no, sería comparar con otro lugar).
  function comparacion(r, z) {
    const out = [];
    if (fuera(r)) out.push(TEXTOS.cmpFuera);
    else if (enOtraZona(r)) out.push(fmt(TEXTOS.cmpOtraZona, {departamento: r.departamento, n: r.zonaLote}));
    if (r.tipo === 'rgb') return out.concat(TEXTOS.cmpRgb);
    if (r.tipo === 'gris') return out.concat(TEXTOS.cmpGris);
    if (r.tipo !== 'ndvi' || r.mediana === null || r.mediana === undefined) return out;
    const umbral = num(z.umbral, 2);
    out.push(fmt(TEXTOS.cmpMediana, {ndvi: num(r.mediana, 2)}));
    out.push(fmt(TEXTOS.cmpSuperficie, {pct: pct(r.fraccionBajo), umbral}));
    if (fuera(r) || enOtraZona(r)) return out;
    if (!r.fecha) out.push(TEXTOS.cmpSinFecha);
    else if (z.fraccionZonaMes === null || z.fraccionZonaMes === undefined) out.push(fmt(TEXTOS.cmpZonaSinDato, {mes: z.mesNombre}));
    else out.push(fmt(TEXTOS.cmpZona, {mes: z.mesNombre, periodo: z.periodo, n: Math.round(z.fraccionZonaMes * 10), umbral}));
    out.push(r.mediana < z.umbral ? TEXTOS.cmpCriterioSin : TEXTOS.cmpCriterioCon);
    return out;
  }

  // f = {tipo, bandas: {rojo, nir}|null (desde 0), epsg, metrosPixel, anchoOriginal, altoOriginal, anchoCalculo}
  function fichaTecnica(f) {
    const out = [];
    if (f.tipo === 'ndvi') {
      out.push(f.bandas ? fmt(TEXTOS.fichaBandas, {rojo: f.bandas.rojo + 1, nir: f.bandas.nir + 1}) : TEXTOS.fichaNdviArchivo);
      out.push(TEXTOS.fichaCalibracion);
    }
    if (f.epsg) out.push(fmt(TEXTOS.fichaSistema, {epsg: f.epsg}));
    if (f.anchoOriginal) {
      const m = f.metrosPixel, res = m < 1 ? `${Math.max(1, Math.round(m * 100))} cm` : `${num(m, 1)} m`;
      out.push(fmt(TEXTOS.fichaTamano, {ancho: f.anchoOriginal, alto: f.altoOriginal, calculo: f.anchoCalculo, res}));
    }
    out.push(TEXTOS.fichaRecuadro);
    return out;
  }

  const L = {TEXTOS, defProj4, epsgDe, recuadroLatLon, metrosPorPixel, tipoImagen, pareceNdvi, descripcionesBandas,
    bandasSugeridas, ndvi, resumenNdvi, fechaDeTiff, avisoTamano, transformacionMapa, parsearPath, zonaDelPunto,
    lineaInicio, comparacion, fichaTecnica, fechaCorta: diaMes};
  if (typeof module !== 'undefined' && module.exports) module.exports = L;
  else window.DronLogica = L;
})();
