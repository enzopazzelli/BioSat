# Lector de imágenes de dron, etapa 1: implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el productor o el asesor abra en la app el GeoTIFF de su dron, lo vea en su lugar sobre el mapa del Reporte y, si la cámara lo permite, lea el NDVI del lote al lado de lo que Landsat dice de su zona. Además, que aparezca una línea en el Inicio.

**Architecture:** Hay un módulo puro, `web/dron-logica.js` (navegador y Node, con pruebas), con las coordenadas, el tipo de imagen, el NDVI, la zona del lote y los textos. Al lado va un módulo de navegador, `web/dron.js`, que lee el archivo con geotiff.js, lo pasa a latitud y longitud con proj4js, lo dibuja en un canvas y avisa a `app.js`. `app.js` lo suma al visor (capa y cortina), a una tarjeta de la sección 4 y al Inicio.

**Tech Stack:** JavaScript sin compilar ni npm. geotiff.js 2.1.3 y proj4js 2.12.1 copiados en `web/vendor/`. Leaflet (ya está). `node --test`. Python con `tifffile` y `numpy` solo para generar los archivos de prueba.

**Spec:** `docs/superpowers/specs/2026-11-15-lector-dron-design.md` (etapas 1 y 2; este plan cubre la etapa 1).

## Global Constraints

- Sin servidor y sin npm. Las librerías se copian a `web/vendor/` con su licencia, desde `https://cdn.jsdelivr.net/npm/geotiff@2.1.3/dist-browser/geotiff.js` (+ `LICENSE`) y `https://cdn.jsdelivr.net/npm/proj4@2.12.1/dist/proj4.js` (+ `LICENSE.md`).
- Tiene que andar sin internet y a 390 px de ancho, sin desbordes.
- El archivo del usuario nunca sale de su equipo. No se guarda en la etapa 1.
- **D-33:**
  - sin banda infrarroja, no hay NDVI;
  - vocabulario: "sin cobertura vegetal activa (suelo descubierto o rastrojo seco)";
  - la fecha, el sistema de coordenadas y la resolución salen del archivo o del usuario; si no, "sin dato";
  - un sector o un porcentaje es "para revisar", no una causa.
- El umbral de NDVI sale de `DIAG.meta.umbral_ndvi` (hoy 0,25). El período de Landsat sale de `DIAG.meta.periodo` (hoy "2021-2025").
- Colores del NDVI: los mismos que Landsat, de 0 a 0,8 con `#a50026, #f46d43, #fee08b, #d9ef8b, #66bd63, #006837` (`ia_desmonte/imagenes.py` y `.ramp` de `web/estilos.css`).
- Lado más largo para dibujar y calcular: 2048 px como máximo. Aviso si el archivo pesa más de 1 GB (1024³ bytes).
- Sistemas de coordenadas: EPSG 4326, 3857, 32601-32660, 32701-32760 y 5343-5349 (POSGAR 2007, fajas 1 a 7).
- **D-35:** cada texto nuevo vive en `DronLogica.TEXTOS` (o en el HTML con `data-i18n`) y tiene su inglés en `web/textos-en.js`.
- Commits sin la línea `Co-Authored-By` (regla del equipo).
- Se trabaja en la rama `enzo-dron`, en un worktree. Se integra a `main` solo con la aprobación de Enzo.

## Review Focus

1. **Un .tif real grande y sin teselas en un celular:** que no congele la página sin aviso. Tiene que verse "Leyendo la imagen…" y, si pasa de 1 GB, el aviso antes de leer. Prueba: `avisoTamano` (tarea 2) y medición con el .tif real (tarea 7).
2. **Un TIFF sin coordenadas, o con un sistema que la app no conoce:** mensaje claro y ninguna capa en el mapa. Prueba: `epsgDe` y `defProj4` devuelven `null` (tarea 1), y un archivo de prueba sin GeoKeys en el navegador (tarea 5).
3. **Bordes sin dato o banda alfa:** no pueden contarse como "sin cobertura". Prueba: `ndvi` con `sinDato` y con máscara (tarea 2) y el archivo multiespectral con una fila sin dato (tarea 5).
4. **Abrir un segundo archivo, o cambiar de zona o de idioma con el dron abierto:** la capa se reemplaza, la cuenta se recalcula y no quedan capas viejas. Prueba en el navegador (tarea 6), incluido el botón "Cambiar a la Zona N".
5. **Cancelar el selector o elegir un archivo que no es TIFF:** mensaje, nada se rompe. Prueba en el navegador (tarea 5).

---

### Task 1: Coordenadas y las dos librerías

**Files:**
- Create: `web/vendor/geotiff.js`, `web/vendor/geotiff-LICENSE`, `web/vendor/proj4.js`, `web/vendor/proj4-LICENSE.md`
- Create: `web/dron-logica.js` (estructura UMD como `web/inicio-logica.js`: `window.DronLogica` y `module.exports`)
- Test: `tests/dron-logica.test.js`

**Interfaces:**
- Produces:
  - `defProj4(epsg: number) -> string|null`
  - `epsgDe(geoKeys: object|null) -> number|null`
  - `recuadroLatLon(bbox: [minX, minY, maxX, maxY], aLonLat: (x, y) => [lon, lat]) -> [[sur, oeste], [norte, este]]`
  - `metrosPorPixel(recuadro, anchoPx: number) -> number`

- [ ] **Step 1: Copiar las librerías.** Descargar las 4 URL de las Global Constraints a los archivos de arriba con `curl -sSfL`. Control: `head -c 300` de cada `.js` muestra el encabezado de la librería y su versión.

- [ ] **Step 2: Escribir las pruebas que fallan**

```js
const D = require('../web/dron-logica.js');
const proj4 = require('../web/vendor/proj4.js');
test('defProj4: UTM sur y norte, WGS84, POSGAR 2007 faja 4 y desconocido', () => {
  assert.equal(D.defProj4(32720), '+proj=utm +zone=20 +south +datum=WGS84 +units=m +no_defs');
  assert.equal(D.defProj4(32620), '+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs');
  assert.equal(D.defProj4(4326), '+proj=longlat +datum=WGS84 +no_defs');
  assert.equal(D.defProj4(5346), '+proj=tmerc +lat_0=-90 +lon_0=-63 +k=1 +x_0=4500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
  assert.match(D.defProj4(3857), /\+proj=merc \+a=6378137/);
  assert.equal(D.defProj4(22185), null);
});
test('epsgDe: proyectado, geográfico, definido por el usuario y sin GeoKeys', () => {
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32720}), 32720);
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 2, GeographicTypeGeoKey: 4326}), 4326);
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32767}), null);
  assert.equal(D.epsgDe(null), null);
});
test('recuadroLatLon envuelve las 4 esquinas (UTM 20 S, simétrico al meridiano -63)', () => {
  const r = D.recuadroLatLon([499000, 6999000, 501000, 7001000], (x, y) => proj4(D.defProj4(32720), 'WGS84', [x, y]));
  assert.ok(r[0][0] < r[1][0] && r[0][1] < -63 && r[1][1] > -63);
  assert.ok(Math.abs((r[0][1] + r[1][1]) / 2 + 63) < 1e-9);
  assert.ok(Math.abs((r[1][1] - r[0][1]) - 0.0202) < 0.0005);
});
test('metrosPorPixel: 0,01° de longitud a -27° en 100 px', () => {
  assert.ok(Math.abs(D.metrosPorPixel([[-27.01, -63.01], [-27, -63]], 100) - 9.92) < 0.05);
});
```

- [ ] **Step 3: Correr y ver que fallan.** `node --test tests/dron-logica.test.js`. Esperado: FAIL ("Cannot find module '../web/dron-logica.js'").

- [ ] **Step 4: Implementar en `web/dron-logica.js`.** POSGAR 2007 faja n = epsg − 5342: `lon_0 = -72 + 3·(n−1)` y `x_0 = n·1 000 000 + 500 000`. Para 3857, la definición estándar de Web Mercator. Metros por grado: 111 320 · cos(latitud media).

- [ ] **Step 5: Correr y ver que pasan.** `node --test tests/dron-logica.test.js`. Esperado: PASS (4).

- [ ] **Step 6: Commit.** `git add web/vendor/geotiff.js web/vendor/geotiff-LICENSE web/vendor/proj4.js web/vendor/proj4-LICENSE.md web/dron-logica.js tests/dron-logica.test.js && git commit -m "D-38: coordenadas del dron (EPSG a proj4, recuadro, metros por pixel) y librerias geotiff.js 2.1.3 y proj4js 2.12.1"`

### Task 2: Tipo de imagen, bandas, NDVI y resumen

**Files:**
- Modify: `web/dron-logica.js`
- Test: `tests/dron-logica.test.js`

**Interfaces:**
- Produces:
  - `tipoImagen({bandas, bits: number[], formato: 'uint'|'int'|'float', fotometrica: number}) -> 'rgb'|'multi'|'una_decimal'|'gris'`
  - `pareceNdvi(valores, sinDato: number|null) -> boolean`
  - `descripcionesBandas(xmlGdal: string|undefined, n: number) -> string[]`
  - `bandasSugeridas(descripciones: string[]) -> {rojo: number|null, nir: number|null}` (índices desde 0)
  - `ndvi(rojo, nir, sinDato: number|null, mascara?: Uint8Array) -> Float32Array` (NaN donde no hay dato)
  - `resumenNdvi(valores: Float32Array, umbral: number) -> {mediana: number|null, fraccionBajo: number|null, validos: number}`
  - `fechaDeTiff(s: string|undefined) -> 'YYYY-MM-DD'|null`
  - `avisoTamano(bytes: number) -> string|null`

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
test('tipoImagen', () => {
  assert.equal(D.tipoImagen({bandas: 3, bits: [8, 8, 8], formato: 'uint', fotometrica: 2}), 'rgb');
  assert.equal(D.tipoImagen({bandas: 4, bits: [8, 8, 8, 8], formato: 'uint', fotometrica: 2}), 'rgb');
  assert.equal(D.tipoImagen({bandas: 5, bits: [16, 16, 16, 16, 16], formato: 'uint', fotometrica: 1}), 'multi');
  assert.equal(D.tipoImagen({bandas: 4, bits: [16, 16, 16, 16], formato: 'uint', fotometrica: 1}), 'multi');
  assert.equal(D.tipoImagen({bandas: 1, bits: [32], formato: 'float', fotometrica: 1}), 'una_decimal');
  assert.equal(D.tipoImagen({bandas: 1, bits: [16], formato: 'uint', fotometrica: 1}), 'gris');
});
test('pareceNdvi: todo lo válido entre -1 y 1', () => {
  assert.equal(D.pareceNdvi(Float32Array.from([-0.2, 0.5, 0.9, -9999]), -9999), true);
  assert.equal(D.pareceNdvi(Float32Array.from([0.2, 1.7]), null), false);
  assert.equal(D.pareceNdvi(Float32Array.from([NaN, NaN]), null), false);
});
test('descripcionesBandas lee GDAL_METADATA y bandasSugeridas no confunde red edge con rojo', () => {
  const xml = '<GDALMetadata><Item name="DESCRIPTION" sample="2" role="description">Red</Item><Item name="DESCRIPTION" sample="3" role="description">NIR</Item></GDALMetadata>';
  assert.deepEqual(D.descripcionesBandas(xml, 5), ['', '', 'Red', 'NIR', '']);
  assert.deepEqual(D.descripcionesBandas(undefined, 2), ['', '']);
  assert.deepEqual(D.bandasSugeridas(['Blue', 'Green', 'Red', 'NIR', 'RedEdge']), {rojo: 2, nir: 3});
  assert.deepEqual(D.bandasSugeridas(['Red edge', 'Red', 'Near Infrared']), {rojo: 1, nir: 2});
  assert.deepEqual(D.bandasSugeridas(['Rojo', 'Infrarrojo cercano']), {rojo: 0, nir: 1});
  assert.deepEqual(D.bandasSugeridas(['', '', '']), {rojo: null, nir: null});
});
test('ndvi: sin dato, 0/0 y máscara alfa quedan en NaN', () => {
  const v = D.ndvi(Uint16Array.from([100, 0, 50, 7]), Uint16Array.from([300, 0, 50, 7]), 7);
  assert.ok(Math.abs(v[0] - 0.5) < 1e-6 && Number.isNaN(v[1]) && v[2] === 0 && Number.isNaN(v[3]));
  const m = D.ndvi(Uint8Array.from([10, 10]), Uint8Array.from([30, 30]), null, Uint8Array.from([255, 0]));
  assert.ok(Math.abs(m[0] - 0.5) < 1e-6 && Number.isNaN(m[1]));
});
test('resumenNdvi: mediana y fracción por debajo del umbral (estricto), sin contar NaN', () => {
  assert.deepEqual(D.resumenNdvi(Float32Array.from([0.1, 0.2, 0.3, 0.6, NaN]), 0.25), {mediana: 0.25, fraccionBajo: 0.5, validos: 4});
  assert.deepEqual(D.resumenNdvi(Float32Array.from([NaN]), 0.25), {mediana: null, fraccionBajo: null, validos: 0});
});
test('fechaDeTiff y avisoTamano', () => {
  assert.equal(D.fechaDeTiff('2026:11:03 10:30:00'), '2026-11-03');
  assert.equal(D.fechaDeTiff(''), null);
  assert.equal(D.fechaDeTiff('basura'), null);
  assert.equal(D.avisoTamano(200e6), null);
  assert.equal(typeof D.avisoTamano(1.5 * 1024 ** 3), 'string');
});
```

(La mediana de [0,1; 0,2; 0,3; 0,6] es 0,25 con un margen de 1e-9: usar `assert.ok(Math.abs(...) < 1e-9)` si la suma en coma flotante no da exacto.)

- [ ] **Step 2: Correr y ver que fallan.** `node --test tests/dron-logica.test.js`. Esperado: FAIL en las 6 pruebas nuevas ("D.tipoImagen is not a function").

- [ ] **Step 3: Implementar.** Los criterios:
  - `rgb`: 3 o 4 bandas, todas de 8 bits, `fotometrica === 2`.
  - `multi`: 4 bandas o más que no son `rgb`.
  - `una_decimal`: 1 banda `float`.
  - `gris`: cualquier otro caso.
  - Rojo: `/\b(red|rojo)\b/i` que no coincida con `/red\s*edge|rededge|borde/i`. NIR: `/\bnir\b|near.?infra|infrarrojo/i`.
  - El texto de `avisoTamano` va en `TEXTOS.avisoTamano`, con `{gb}` formateado con `TEXTOS.locale`.

- [ ] **Step 4: Correr y ver que pasan.** `node --test tests/dron-logica.test.js`. Esperado: PASS (10).

- [ ] **Step 5: Commit.** `git commit -am "D-38: tipo de imagen, bandas, NDVI con sin dato y mascara, resumen del lote"` (agregando el test si es nuevo).

### Task 3: En qué departamento y zona cae el lote

**Files:**
- Modify: `web/dron-logica.js`
- Test: `tests/dron-logica.test.js`

**Interfaces:**
- Consumes: `data/santiago_mapa.json` (`departamentos[]` con `nombre`, `zona` y `d`, un path SVG con `M`, `L` y `Z` absolutos; `puntos[n] = {x, y}`) y `data/clima_zonas.json` (`zonas[id] = {lat, lon}`, donde la zona n es la del id `zona_n_*`).
- Produces:
  - `transformacionMapa(puntosSvg, puntosGeo: {n: {lat, lon}}) -> {ax, bx, ay, by}` (con `x = ax·lon + bx` e `y = ay·lat + by`, por mínimos cuadrados)
  - `parsearPath(d: string) -> Array<Array<[x, y]>>`
  - `zonaDelPunto(lat, lon, mapa, t) -> {departamento: string, zona: number}|null`

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
const MAPA = require('../data/santiago_mapa.json'), CLIMA = require('../data/clima_zonas.json');
const GEO = Object.fromEntries(Object.entries(CLIMA.zonas).map(([id, z]) => [id[5], {lat: z.lat, lon: z.lon}]));
test('transformacionMapa reproduce los 5 puntos de NASA POWER del mapa', () => {
  const t = D.transformacionMapa(MAPA.puntos, GEO);
  for (const n of Object.keys(GEO)) {
    assert.ok(Math.abs(t.ax * GEO[n].lon + t.bx - MAPA.puntos[n].x) < 0.2, n);
    assert.ok(Math.abs(t.ay * GEO[n].lat + t.by - MAPA.puntos[n].y) < 0.2, n);
  }
});
test('parsearPath separa los anillos', () => {
  const a = D.parsearPath('M0,0L10,0L10,10L0,10ZM20,20L30,20L30,30Z');
  assert.equal(a.length, 2); assert.equal(a[0].length, 4); assert.deepEqual(a[1][2], [30, 30]);
});
test('zonaDelPunto: el punto de cada zona cae en su zona; Buenos Aires queda afuera', () => {
  const t = D.transformacionMapa(MAPA.puntos, GEO);
  for (const n of Object.keys(GEO)) assert.equal(D.zonaDelPunto(GEO[n].lat, GEO[n].lon, MAPA, t).zona, Number(n));
  assert.equal(D.zonaDelPunto(-34.6, -58.4, MAPA, t), null);
});
```

- [ ] **Step 2: Correr y ver que fallan.** Esperado: FAIL ("D.transformacionMapa is not a function").
- [ ] **Step 3: Implementar.** Regresión lineal en cada eje por separado. Punto en polígono por paridad (par/impar) sobre todos los anillos de cada departamento.
- [ ] **Step 4: Correr y ver que pasan.** Esperado: PASS (13).
- [ ] **Step 5: Commit.** `git commit -am "D-38: departamento y zona del lote con el mapa del asistente"`

### Task 4: Textos de la tarjeta, del Inicio y de "Para tu ingeniero", con su inglés

**Files:**
- Modify: `web/dron-logica.js` (`TEXTOS` y las funciones), `web/textos-en.js` (`modulos.dron`)
- Test: `tests/dron-logica.test.js`, `tests/textos-en.test.js`

**Interfaces:**
- Consumes: el resumen de la tarea 2.
- Produces:
  - `TEXTOS` (claves usadas en las tareas 5 y 6: `abrir`, `privado`, `leyendo`, `avisoTamano`, `sinCoordenadas`, `epsgDesconocido`, `noEsTiff`, `elegirBandas`, `bandaRoja`, `bandaNir`, `calcular`, `esNdvi`, `siNdvi`, `noNdvi`, `fechaVuelo`, `capa`, `cmp`, `cmpIzq`, `cmpDer`, `titulo`, `inicioSinVuelo`, `inicioPendiente`, `verEnMapa`, `cambiarZona`, `locale`)
  - `lineaInicio(r: Resumen|null) -> string`
  - `comparacion(r: Resumen, z: {fraccionZonaMes: number|null, mesNombre: string, periodo: string, umbral: number}) -> string[]`
  - `fichaTecnica(f: {tipo, bandas: {rojo, nir}|null, epsg, metrosPixel, anchoOriginal, altoOriginal, anchoCalculo}) -> string[]`
  - `Resumen = {tipo: 'ndvi'|'rgb'|'gris'|'pendiente', fecha: 'YYYY-MM-DD'|null, mediana, fraccionBajo, zonaLote: number|null, departamento: string|null, zonaElegida: number}`. `app.js` lo arma desde `BioSatDron.estado()` (tarea 5): `tipo` vale 'pendiente' mientras el estado es `pendiente_bandas` o `pendiente_ndvi`; `mediana` y `fraccionBajo` salen de `estado.resumen`; `zonaElegida` es el número de `state.zona`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
const R = {tipo: 'ndvi', fecha: '2026-11-03', mediana: 0.41, fraccionBajo: 0.18, zonaLote: 2, departamento: 'Moreno', zonaElegida: 2};
test('lineaInicio en sus casos', () => {
  assert.equal(D.lineaInicio(null), '¿Tenés una imagen de dron? Abrila en el Reporte');
  assert.equal(D.lineaInicio(R), 'Tu lote, según el dron (03/11): NDVI mediano 0,41 · 18 % sin cobertura activa.');
  assert.equal(D.lineaInicio({...R, tipo: 'rgb'}), 'Tu lote, según el dron (03/11): foto en color, sin NDVI.');
  assert.equal(D.lineaInicio({...R, tipo: 'gris'}), 'Tu lote, según el dron (03/11): imagen sin NDVI.');
  assert.equal(D.lineaInicio({...R, tipo: 'pendiente'}), 'Tu imagen de dron necesita un paso más en el Reporte.');
  assert.equal(D.lineaInicio({...R, fecha: null}), 'Tu lote, según el dron (fecha sin dato): NDVI mediano 0,41 · 18 % sin cobertura activa.');
  assert.equal(D.lineaInicio({...R, zonaLote: 5}), 'Tu lote, según el dron (03/11): NDVI mediano 0,41 · 18 % sin cobertura activa. Está en la Zona 5, no en la elegida.');
  assert.equal(D.lineaInicio({...R, zonaLote: null, departamento: null}), 'Tu lote, según el dron (03/11): NDVI mediano 0,41 · 18 % sin cobertura activa. Está fuera de Santiago del Estero.');
});
const Z = {fraccionZonaMes: 0.843, mesNombre: 'noviembre', periodo: '2021-2025', umbral: 0.25};
test('comparacion: no mezcla lotes con superficie y usa el mes del vuelo', () => {
  assert.deepEqual(D.comparacion(R, Z), [
    'NDVI mediano del lote: 0,41.',
    '18 % de la superficie sin cobertura vegetal activa (NDVI menor a 0,25).',
    'Tu zona en noviembre, según Landsat 2021-2025: 8 de cada 10 lotes con NDVI mediano menor a 0,25.',
    'Con ese mismo criterio, tu lote se vería con cobertura activa.']);
  assert.equal(D.comparacion({...R, mediana: 0.2}, Z)[3], 'Con ese mismo criterio, tu lote se vería sin cobertura activa.');
  assert.equal(D.comparacion({...R, fecha: null}, Z)[2], 'Sin la fecha del vuelo no se puede comparar con tu zona: escribila arriba.');
  assert.deepEqual(D.comparacion({...R, tipo: 'rgb'}, Z), ['Este archivo es una foto en color (RGB): no trae la banda infrarroja que hace falta para el NDVI.']);
  assert.equal(D.comparacion({...R, zonaLote: 5, departamento: 'Ojo de Agua'}, Z)[0], 'La imagen está en Ojo de Agua (Zona 5), no en la zona elegida.');
  const fuera = D.comparacion({...R, zonaLote: null, departamento: null}, Z);
  assert.equal(fuera[0], 'La imagen está fuera de Santiago del Estero: la comparación con las zonas no aplica.');
  assert.ok(!fuera.some(t => t.startsWith('Tu zona en')));
});
test('fichaTecnica: bandas desde 1, calibración y recuadro', () => {
  const t = D.fichaTecnica({tipo: 'ndvi', bandas: {rojo: 2, nir: 3}, epsg: 32720, metrosPixel: 0.042, anchoOriginal: 9000, altoOriginal: 6000, anchoCalculo: 2048});
  assert.ok(t.includes('Rojo: banda 3 · infrarrojo: banda 4.'));
  assert.ok(t.includes('Si el mosaico no está calibrado a reflectancia, el NDVI es aproximado.'));
  assert.ok(t.some(s => s.includes('EPSG:32720')));
  assert.ok(t.some(s => s.includes('9000 × 6000') && s.includes('2048')));
});
```

En `tests/textos-en.test.js`:

```js
test('D-38: el dron tiene su inglés con las mismas marcas', () => {
  const es = require('../web/dron-logica.js').TEXTOS, en = EN.modulos.dron;
  const marcas = t => [...String(t).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  assert.ok(en, 'falta modulos.dron');
  assert.deepEqual(I.clavesSobrantes(es, en), []);
  for (const k of Object.keys(es)) if (typeof es[k] === 'string') assert.deepEqual(marcas(en[k]), marcas(es[k]), k);
});
```

- [ ] **Step 2: Correr y ver que fallan.** `node --test tests/dron-logica.test.js tests/textos-en.test.js`. Esperado: FAIL ("D.lineaInicio is not a function" y "falta modulos.dron").
- [ ] **Step 3: Implementar** las funciones, armadas con `fmt` y `TEXTOS`:
  - la fecha va como `dd/mm`;
  - los números con `TEXTOS.locale`: 2 decimales para el NDVI, enteros para el porcentaje;
  - "N de cada 10" redondeado.

  El inglés de cada clave, con el mismo sentido. Vocabulario: "without active green cover", "reference evapotranspiration" si aparece, "for your agronomist".
- [ ] **Step 4: Correr y ver que pasan.** `node --test "tests/*.test.js"`. Esperado: todas en verde (158 más las nuevas).
- [ ] **Step 5: Commit.** `git commit -am "D-38: textos del dron (tarjeta, Inicio y Para tu ingeniero) con su ingles"`

### Task 5: Leer el archivo en el navegador y mostrarlo en el mapa

**Files:**
- Create: `tests/fixtures/generar_tif_prueba.py` y sus 4 salidas en `tests/fixtures/`: `dron_rgb_utm20s.tif`, `dron_multi_utm20s.tif`, `dron_ndvi_4326.tif`, `dron_sin_coordenadas.tif`
- Create: `web/dron.js`
- Modify: `web/index.html` (scripts y `#dronBox` dentro de `.visor-side`, después de `#zonifBox`), `web/app.js` (`renderVisor`, `aplicarCortina`, registrar `dron` en `Idioma`), `web/estilos.css`
- Test: `tests/vistas.test.js` y la prueba en el navegador

**Interfaces:**
- Consumes: todo `DronLogica`, `GeoTIFF` (global de geotiff.js), `proj4` (global), `DIAG`, `MAPA`, `CLIMA` y `state` de `app.js`.
- Produces:
  - `window.BioSatDron = {abrir(blob: Blob, nombre?: string): Promise<void>, estado(): Estado|null, alCambiar(fn: () => void): void, elegirBandas(rojo: number, nir: number): void, confirmarNdvi(si: boolean): void, ponerFecha(iso: string): void}`
  - `Estado = {nombre, bytes, tipo: 'rgb'|'ndvi'|'gris'|'pendiente_bandas'|'pendiente_ndvi', ficha, epsg, recuadro, metrosPixel, anchoOriginal, altoOriginal, anchoCalculo, url: string|null, resumen: {mediana, fraccionBajo, validos}|null, bandas: {rojo, nir}|null, descripciones: string[], fecha, zonaLote, departamento, error: string|null}`
  - `app.js` expone `CLIMA`, `MAPA` y `DIAG` como ya lo hace (variables globales del script). `dron.js` los lee al calcular.

- [ ] **Step 1: Archivos de prueba.** `generar_tif_prueba.py` (con `tifffile` y `numpy`, sin pyproj) escribe GeoTIFF con las etiquetas 33550 (ModelPixelScale), 33922 (ModelTiepoint), 34735 (GeoKeyDirectory), 42112 (GDAL_METADATA), 42113 (GDAL_NODATA) y 306 (DateTime). Son datos sintéticos de prueba y el docstring lo dice:
  - **`dron_rgb_utm20s.tif`:** 3 bandas uint8, 120 × 80 px, EPSG:32720, 0,05 m por píxel, centrado en el punto de la Zona 2 (−27,65; −62,42). Las coordenadas UTM se calculan una vez con `web/vendor/proj4.js` y quedan como constante en el script. DateTime `2026:11:03 10:30:00`.
  - **`dron_multi_utm20s.tif`:** 5 bandas uint16 (descripciones `Blue, Green, Red, NIR, RedEdge`), 100 × 60 px, mismo lugar y fecha, `GDAL_NODATA` 0.
    - fila 0: todo en 0 (sin dato);
    - resto: columnas 0-69 con Red 1000 y NIR 3000 (NDVI 0,5); columnas 70-99 con Red 1000 y NIR 1000 (NDVI 0).
    - **Esperado: mediana 0,5 y fracción bajo 0,25 = 0,3.**
  - **`dron_ndvi_4326.tif`:** 1 banda float32, todo 0,1, 50 × 50 px, EPSG:4326, centrado en el punto de la Zona 5 (−29,5; −63,69), sin DateTime.
  - **`dron_sin_coordenadas.tif`:** 3 bandas uint8, sin GeoKeys.

  Correr `python -X utf8 tests/fixtures/generar_tif_prueba.py`. Esperado: 4 archivos de menos de 100 KB cada uno.
- [ ] **Step 2: Prueba que falla, en `tests/vistas.test.js`:**

```js
test('D-38: index.html carga el lector de dron sin internet y tiene su caja en el visor', () => {
  for (const s of ['vendor/geotiff.js', 'vendor/proj4.js', 'dron-logica.js', 'dron.js']) assert.match(index, new RegExp(`<script src="${s}" defer>`), s);
  assert.ok(index.indexOf('dron.js') < index.indexOf('app.js'));
  assert.ok(idsIndex.has('dronBox') && idsIndex.has('dronArchivo'));
  assert.match(index, /id="dronArchivo"[^>]*accept="\.tif,\.tiff"/);
});
```

  Correr `node --test tests/vistas.test.js`. Esperado: FAIL.
- [ ] **Step 3: Implementar `web/dron.js`, `#dronBox` y la integración en `app.js`.**
  - **`#dronBox`:** título "Imagen de tu dron", `<input type="file" id="dronArchivo" accept=".tif,.tiff">` con su etiqueta-botón, el texto `privado` y una zona `#dronEstado` (`role="status"`) para leyendo, errores, la elección de bandas (dos `<select>` y "Calcular NDVI"), la confirmación del NDVI y el aviso de tamaño.
  - **Lectura:** `GeoTIFF.fromBlob(blob)`, primera imagen.
    - **Ficha:**
      - `getWidth`, `getHeight` y `getSamplesPerPixel`;
      - `fileDirectory.BitsPerSample`, `SampleFormat` (1 uint, 2 int, 3 float), `PhotometricInterpretation`, `DateTime` y `GDAL_METADATA`;
      - `getGDALNoData()`, `getGeoKeys()` y `getBoundingBox()`.
    - **Coordenadas:** sin `epsgDe` o sin `defProj4`, error `sinCoordenadas` o `epsgDesconocido` y ninguna capa.
    - **Achicar:** `readRasters({width, height, interleave: false})` con el lado largo ≤ 2048.
    - **Máscara:** en RGB, la banda 4 (alfa) es la máscara.
  - **Dibujar:**
    - canvas con la foto, el NDVI con la rampa de las Global Constraints o grises (min–max de lo válido);
    - lo que no tiene dato queda transparente;
    - `url = canvas.toDataURL('image/png')`.
  - **Al terminar:** calcular `zonaDelPunto` con el centro del recuadro y llamar a los oyentes de `alCambiar`.
  - **Errores:** "no es TIFF" o cancelar → `noEsTiff` en `#dronEstado`, sin excepciones sin atrapar.
  - **`app.js`:**
    - si `BioSatDron.estado()` tiene `url`, `CAPAS` suma `{id: 'dron', label: TEXTOS.capa con la fecha}` y `CMP` suma `{id: 'landsat_dron', a: 'invierno_rgb', b: 'dron', izq: TEXTOS.cmpIzq, der: TEXTOS.cmpDer}`;
    - en `renderVisor`, la URL y el recuadro de la capa `dron` salen del estado, no de `im.img` ni del recuadro de la zona;
    - cuando llega un archivo nuevo: `visor.capa = 'dron'`, `visor.cmp = 'no'`, `setMaxBounds(null)`, `setMinZoom(0)`, `fitBounds(estado.recuadro)` y `renderTodo()`;
    - registrar `Idioma.registrar('dron', DronLogica.TEXTOS)`.
- [ ] **Step 4: Correr las pruebas.** `node --test "tests/*.test.js"`. Esperado: todas en verde.
- [ ] **Step 5: Probar en el navegador.** Servir con `python -m http.server 8040` y, con `ZONA=zona_2_secano_este`, correr `scripts/captura-movil.mjs` sobre `http://localhost:8040/web/index.html#satelite`. Con `EVAL`, hacer `fetch` del archivo de prueba, `BioSatDron.abrir(blob, nombre)`, esperar y leer el estado:
  - **multi:** `tipo` 'ndvi', bandas `{rojo: 2, nir: 3}`, `resumen.mediana` 0,5, `fraccionBajo` 0,3, `zonaLote` 2, fecha `2026-11-03`. En el mapa, una imagen `img.leaflet-image-layer` con un ancho de más de 50 px. Sin errores de JavaScript.
  - **rgb:** `tipo` 'rgb', `resumen` null, `zonaLote` 2.
  - **ndvi_4326:** `tipo` 'pendiente_ndvi`; después de `confirmarNdvi(true)`, `tipo` 'ndvi', mediana 0,1, `zonaLote` 5, fecha null.
  - **sin_coordenadas:** `error` igual a `TEXTOS.sinCoordenadas` y ninguna capa nueva.
  - **Un archivo que no es TIFF** (`new Blob(['hola'])`): `error` igual a `TEXTOS.noEsTiff`.

  Mirar la captura a 390 px: no se desborda.
- [ ] **Step 6: Commit.** `git add tests/fixtures web/dron.js web/index.html web/app.js web/estilos.css tests/vistas.test.js && git commit -m "D-38: lector de GeoTIFF en el navegador, capa del dron y cortina Landsat contra dron"`

### Task 6: La tarjeta del Reporte, la línea del Inicio y la vista detallada

**Files:**
- Modify: `web/index.html`, `web/completo.html`, `web/app.js` (`renderInicio`, una función nueva `renderDron()` llamada desde `renderTodo`), `web/textos-en.js` (las claves `html` nuevas), `web/estilos.css`
- Test: `tests/vistas.test.js`, `tests/textos-en.test.js` (el que ya controla `data-i18n`) y la prueba en el navegador

**Interfaces:**
- Consumes: `BioSatDron.estado()`, `lineaInicio`, `comparacion` y `fichaTecnica` (tarea 4); `DIAG.zonas[state.zona].fraccion_pelado[mesDelVuelo]`, `DIAG.meta.periodo`, `DIAG.meta.umbral_ndvi` y `MES_L`.
- Produces:
  - `#dronFicha` (tarjeta, `hidden` sin vuelo) con `#dronComparacion` (lista), `#dronFecha` (`<input type="date">`, visible solo sin fecha) y `<details class="para-ingeniero">` con `#dronTecnica`;
  - `#inicioDron`, primer hijo de `.ini-cuerpo`, con `#inicioDronTxt` y el enlace `#inicioDronLink` a `#satelite`;
  - en `completo.html`, `<p class="hint" id="dronEnReporte">` con un enlace a `index.html#satelite`;
  - `#dronCambiarZona` (botón dentro de `#dronFicha`, visible solo si `zonaLote` existe y no es la elegida), con el texto `TEXTOS.cambiarZona` ("Cambiar a la Zona {n}"). Al tocarlo: `respuestas = {...respuestas, zona: <id de la zona n>}`, `AsistenteLogica.guardar(almacen(), respuestas)`, `aplicarRespuestas(respuestas)` y `renderTodo()`.

- [ ] **Step 1: Prueba que falla**

```js
test('D-38: tarjeta del dron en el Reporte, línea en el Inicio y aviso en la vista detallada', () => {
  for (const id of ['dronFicha', 'dronComparacion', 'dronFecha', 'dronTecnica', 'dronCambiarZona', 'inicioDron', 'inicioDronTxt', 'inicioDronLink']) assert.ok(idsIndex.has(id), id);
  assert.match(index, /id="inicioDronLink"[^>]*href="#satelite"/);
  assert.ok(index.indexOf('id="inicioDron"') < index.indexOf('class="ini-mejor"'));
  assert.match(completo, /id="dronEnReporte"[\s\S]*?href="index\.html#satelite"/);
});
```

  Correr `node --test tests/vistas.test.js`. Esperado: FAIL.
- [ ] **Step 2: Implementar.**
  - `renderDron()` llena la tarjeta con `comparacion(...)` y `fichaTecnica(...)`. El mes es el de la fecha del vuelo. Sin fecha, `fraccionZonaMes` va null y se muestra `#dronFecha`, cuyo `change` llama a `BioSatDron.ponerFecha`.
  - `renderInicio` escribe `lineaInicio(...)` y `TEXTOS.verEnMapa` en el enlace.
  - Los textos fijos nuevos del HTML llevan `data-i18n` y tienen su inglés en `EN.html`.
  - En la sección 7 del Reporte ("Datos"), sumar la línea "Imagen de dron: la abre cada uno desde su equipo; no se guarda ni se sube", con su inglés.
- [ ] **Step 3: Correr las pruebas.** `node --test "tests/*.test.js"`. Esperado: todas en verde.
- [ ] **Step 4: Probar en el navegador**, como en la tarea 5:
  - **multi, luego volver al Inicio** (`location.hash = ''`): `#inicioDronTxt` = `Tu lote, según el dron (03/11): NDVI mediano 0,50 · 30 % sin cobertura activa.` y `#dronComparacion` empieza con `NDVI mediano del lote: 0,50.`
  - **El mismo flujo con `?lang=en`:** el texto en inglés, sin español mezclado en la línea.
  - **`Idioma.cambiar('en')` con el dron abierto:** la capa sigue (un solo `img.leaflet-image-layer` del dron) y la línea cambia de idioma.
  - **Abrir el rgb después del multi:** la línea dice `foto en color, sin NDVI` y hay una sola capa del dron.
  - **ndvi_4326 con la Zona 2 elegida:** la línea termina en `Está en la Zona 5, no en la elegida.` Al tocar `#dronCambiarZona`, `state.zona` pasa a `zona_5_sur_serrano`, la línea ya no dice "no en la elegida" y la capa del dron sigue en el mapa.
  - **ndvi_4326 antes de confirmar** (estado `pendiente_ndvi`): `#inicioDronTxt` = `Tu imagen de dron necesita un paso más en el Reporte.`
  - **Sin vuelo:** `#inicioDronTxt` = `¿Tenés una imagen de dron? Abrila en el Reporte`.

  Capturas a 390 px y a 1440 px: no se desborda nada.
- [ ] **Step 5: Commit.** `git commit -am "D-38: tarjeta del dron en el Reporte, linea del Inicio y aviso en la vista detallada"`

### Task 7: Documentación y prueba con el .tif real

**Files:**
- Modify: `docs/reglas-y-bitacora.md` (D-38), `docs/estado-del-proyecto.md`, `README.md` (con `python -X utf8 scripts/actualizar_readme.py`), `planes/1-enzo.md` (las casillas de la etapa 1)
- Test: suite completa y el .tif real

- [ ] **Step 1: Bitácora D-38.** Qué se hizo, las decisiones de Enzo (lector; nivel 2 y después el 3; todo en el navegador; la línea del Inicio), las decisiones del diseñador (sin atajos por cámara, el lector solo en el Reporte, el .tif no se guarda), los sistemas de coordenadas, los límites (2048 px, aviso de 1 GB, recuadro recto, la calibración) y que los archivos de prueba son sintéticos.
- [ ] **Step 2: Estado y README.** Correr `python -X utf8 scripts/actualizar_readme.py`. Esperado: "README.md actualizado." o "ya estaba al día".
- [ ] **Step 3: Suite completa.** `node --test "tests/*.test.js"` y `python -X utf8 -m pytest -q ia_desmonte/pruebas`. Esperado: todo en verde.
- [ ] **Step 4: Prueba con el .tif real de Enzo.** Abrirlo en Chrome, en la PC y en el celular. Anotar en D-38:
  - tamaño, bandas, tipo y EPSG;
  - tiempo de lectura;
  - qué mostró la tarjeta;
  - si algo no anduvo.

  Si no se puede leer en el navegador, se anota y se evalúa el plan B del diseño (convertir con Python). **La etapa 1 termina cuando el .tif real se lee bien.**
- [ ] **Step 5: Commit.** `git commit -am "D-38: documentacion de la etapa 1 del lector de dron"`
