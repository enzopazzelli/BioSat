# Sectores del lote con el dron, etapa 2: implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el ingeniero o el asesor marque sectores sobre el mapa del lote, los mida (superficie y NDVI), anote lo que ve y lo que encuentra en el campo, y tenga todo en el celular sin internet: la imagen del dron, los sectores y la línea del Inicio.

**Architecture:** Hay un módulo puro nuevo, `web/sectores-logica.js` (superficie, NDVI dentro del polígono, numeración, estados, GeoJSON y textos, con pruebas). Dos módulos de navegador: `web/dron-guardado.js` (IndexedDB para el vuelo) y `web/sectores.js` (dibujo, tarjeta, guardado de los sectores en `localStorage`, exportar e importar). `dron.js` guarda y restaura el vuelo, y `app.js` llama a `BioSatSectores.render()` desde `renderTodo`.

**Tech Stack:** JavaScript sin compilar ni npm, Leaflet (ya está), IndexedDB, `localStorage`, `node --test` y `scripts/captura-movil.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-15-lector-dron-etapa-2-design.md` (D-39). Base: la etapa 1, `docs/superpowers/specs/2026-11-15-lector-dron-design.md` (D-38).

## Global Constraints

- Sin servidor ni npm. Tiene que andar sin internet y a 390 px sin desbordes.
- **Lo que se guarda:**
  - **el vuelo**, en IndexedDB: base `biosat`, versión 1, almacén `vuelo`, clave `actual`;
  - **los sectores**, en `localStorage`, clave `biosat.sectores.v1`, con la forma `{version: 1, sectores: [...]}`;
  - **el .tif original no se guarda.**
- Estados de un sector: `revisar` (inicial), `revisado` y `descartado`. Un sector nace "para revisar en el campo". "Qué se encontró" (`hallazgo`) se muestra solo con `revisado` o `descartado`.
- El umbral de NDVI sale de `DIAG.meta.umbral_ndvi` (0,25), como en la etapa 1.
- GeoJSON exportado:
  - `FeatureCollection` de `Polygon` en `[lon, lat]`, con el anillo cerrado;
  - propiedades `n`, `estado`, `nota`, `hallazgo`, `ha`, `ndvi_mediano`, `fraccion_sin_cobertura`, `umbral_ndvi`, `vuelo_fecha`, `vuelo_archivo`, `creado` y `actualizado`;
  - archivo `biosat-sectores-AAAA-MM-DD.geojson`.
- Importar suma: los sectores importados se numeran después del mayor `n`, los polígonos repetidos (los mismos puntos) se saltean y no se borra nada.
- Un vuelo a la vez: abrir otro reemplaza al guardado. Cada sector guarda `vuelo: {id, fecha, archivo}` y la ficha dice con qué vuelo se midió.
- **D-35:** cada texto nuevo tiene clave en `SectoresLogica.TEXTOS` o `DronLogica.TEXTOS`, y su inglés en `web/textos-en.js` (`modulos.sectores` y `modulos.dron`).
- **D-33:** un sector es "para revisar", no una causa. Sin NDVI se dice "Sin NDVI", y nunca se muestra un número de otro vuelo como si fuera del actual.
- Commits sin la línea `Co-Authored-By`. Se trabaja en la rama `enzo-sectores`, en un worktree. Se integra a `main` con la aprobación de Enzo.

## Review Focus

1. **El navegador no deja guardar el vuelo** (IndexedDB bloqueado o sin espacio): la app sigue, la caja del dron avisa "No se pudo guardar el vuelo en este navegador" y no hay excepciones. Prueba en el navegador con `indexedDB` anulado (tarea 3).
2. **`localStorage` lleno o bloqueado al guardar un sector:** el sector queda en pantalla y la tarjeta avisa que se exporte. Prueba en el navegador con `setItem` que tira un error (tarea 4).
3. **Un sector sobre una foto RGB, o fuera de la imagen:** "Sin NDVI", sin números. Pruebas de lógica (tarea 1) y en el navegador con el archivo de prueba RGB (tarea 4).
4. **Tocar el mapa sin estar dibujando, o cambiar de zona a mitad de un dibujo:** no se crean sectores ni puntos sueltos, y el dibujo se cancela. Prueba en el navegador (tarea 4).
5. **Importar dos veces el mismo archivo:** no se duplican sectores. La segunda vez dice que eran repetidos. Prueba de lógica (tarea 2) y en el navegador (tarea 5).

---

### Task 1: Cuentas de los sectores

**Files:**
- Create: `web/sectores-logica.js` (UMD como `web/dron-logica.js`: `window.SectoresLogica` y `module.exports`)
- Test: `tests/sectores-logica.test.js`

**Interfaces:**
- Produces:
  - `areaHa(puntos: [lat, lon][]) -> number`
  - `ndviEnPoligono(n: {valores: Float32Array, ancho, alto, recuadro: [[sur, oeste], [norte, este]]}|null, puntos, umbral) -> {mediana, fraccionBajo, validos}|null`
  - `siguienteNumero(sectores) -> number`
  - `nuevoSector(sectores, {puntos, ndvi, vuelo: {id, fecha, archivo}|null, ahora: string}) -> Sector`
  - `conCambios(sector, {estado?, nota?, hallazgo?}, ahora) -> Sector`
  - `Sector = {id, n, puntos, ha, ndvi, vuelo, nota, estado, hallazgo, creado, actualizado}`

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
const S = require('../web/sectores-logica.js');
const CUAD = [[-28, -64], [-28, -63.999], [-27.999, -63.999], [-27.999, -64]];
test('areaHa: cuadrado de 0,001° a -28° y su mitad', () => {
  assert.ok(Math.abs(S.areaHa(CUAD) - 1.094) < 0.005);
  assert.ok(Math.abs(S.areaHa(CUAD.slice(0, 3)) - 0.547) < 0.003);
});
// Grilla de 4 × 2 píxeles de 0,001°, fila de arriba primero. Izquierda NDVI 0,5 (con un píxel sin dato); derecha 0.
const G = {valores: Float32Array.from([0.5, 0.5, 0, 0, 0.5, NaN, 0, 0]), ancho: 4, alto: 2, recuadro: [[-28.002, -64], [-28, -63.996]]};
const pol = (o, e) => [[-28.002, o], [-28.002, e], [-28, e], [-28, o]];
test('ndviEnPoligono usa los píxeles cuyo centro cae adentro', () => {
  assert.deepEqual(S.ndviEnPoligono(G, pol(-64, -63.998), 0.25), {mediana: 0.5, fraccionBajo: 0, validos: 3});
  assert.deepEqual(S.ndviEnPoligono(G, pol(-63.998, -63.996), 0.25), {mediana: 0, fraccionBajo: 1, validos: 4});
  assert.equal(S.ndviEnPoligono(G, pol(-63.9, -63.8), 0.25), null);
  assert.equal(S.ndviEnPoligono(null, pol(-64, -63.998), 0.25), null);
});
test('siguienteNumero no repite aunque se borren sectores', () => {
  assert.equal(S.siguienteNumero([]), 1);
  assert.equal(S.siguienteNumero([{n: 1}, {n: 4}]), 5);
});
test('nuevoSector nace para revisar; conCambios acepta solo estados válidos', () => {
  const s = S.nuevoSector([{n: 2}], {puntos: CUAD, ndvi: null, vuelo: null, ahora: '2026-11-15T13:00:00Z'});
  assert.equal(s.n, 3); assert.equal(s.estado, 'revisar'); assert.equal(s.nota, ''); assert.equal(s.hallazgo, '');
  assert.ok(Math.abs(s.ha - 1.094) < 0.005);
  const r = S.conCambios(s, {estado: 'revisado', hallazgo: 'suelo compactado'}, '2026-11-15T14:00:00Z');
  assert.equal(r.estado, 'revisado'); assert.equal(r.hallazgo, 'suelo compactado'); assert.equal(r.actualizado, '2026-11-15T14:00:00Z');
  assert.equal(S.conCambios(r, {estado: 'cualquiera'}, 'x').estado, 'revisado');
});
```

- [ ] **Step 2: Correr y ver que fallan.** `node --test tests/sectores-logica.test.js`. Esperado: FAIL ("Cannot find module").
- [ ] **Step 3: Implementar.**
  - **Superficie:** proyección local equirectangular a la latitud media (111 320 m por grado; en longitud, por el coseno de la latitud) y fórmula del área de un polígono.
  - **NDVI:** centro del píxel (i, j) en `lon = oeste + (i + 0,5)·(este − oeste)/ancho` y `lat = norte − (j + 0,5)·(norte − sur)/alto`; punto en polígono por paridad; `resumenNdvi` de `DronLogica` (`require('./dron-logica.js')` en Node o `window.DronLogica` en el navegador); null si `validos` es 0.
  - **`id`:** `'s' + n + '-' + ahora`.
- [ ] **Step 4: Correr y ver que pasan.** Esperado: PASS (4).
- [ ] **Step 5: Commit.** `git add web/sectores-logica.js tests/sectores-logica.test.js && git commit -m "D-39: cuentas de los sectores (superficie, NDVI dentro del poligono, numero y estados)"`

### Task 2: GeoJSON, línea del Inicio y textos, con su inglés

**Files:**
- Modify: `web/sectores-logica.js`, `web/textos-en.js` (`modulos.sectores`)
- Test: `tests/sectores-logica.test.js`, `tests/textos-en.test.js`

**Interfaces:**
- Consumes: `Sector` (tarea 1).
- Produces:
  - `aGeoJSON(sectores, {umbral}) -> FeatureCollection`
  - `deGeoJSON(obj, sectores, ahora) -> {nuevos: Sector[], salteados: number, repetidos: number, error: 'noGeojson'|null}` (`Polygon` y `MultiPolygon`; solo el anillo exterior)
  - `lineaSectores(sectores) -> string`
  - `TEXTOS` con las claves `titulo`, `marcar`, `exportar`, `importar`, `dibujando`, `deshacer`, `cerrar`, `cancelar`, `guardadoAviso`, `noGuardado`, `vacio`, `estadoRevisar`, `estadoRevisado`, `estadoDescartado`, `nota`, `hallazgo`, `borrar`, `confirmarBorrar`, `ha`, `ndviLinea`, `sinNdvi`, `importados`, `noGeojson`, `inicioUno`, `inicioVarios` y `locale`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
const S1 = {id: 's1-x', n: 1, puntos: CUAD, ha: 1.094, ndvi: {mediana: 0.18, fraccionBajo: 0.72, validos: 900},
  vuelo: {id: 'NDVI.tif|1|2026-11-03', fecha: '2026-11-03', archivo: 'NDVI.tif'}, nota: 'mancha clara', estado: 'revisado',
  hallazgo: 'suelo compactado', creado: 'a', actualizado: 'b'};
test('aGeoJSON y deGeoJSON: ida y vuelta, [lon, lat], anillo cerrado y renumerado', () => {
  const g = S.aGeoJSON([S1], {umbral: 0.25});
  assert.equal(g.type, 'FeatureCollection');
  const c = g.features[0].geometry.coordinates[0];
  assert.deepEqual(c[0], [-64, -28]); assert.deepEqual(c[0], c[c.length - 1]);
  assert.equal(g.features[0].properties.ndvi_mediano, 0.18); assert.equal(g.features[0].properties.vuelo_archivo, 'NDVI.tif');
  const r = S.deGeoJSON(g, [{n: 3, puntos: [[0, 0], [0, 1], [1, 1]]}], 'ahora');
  assert.equal(r.nuevos.length, 1); assert.equal(r.nuevos[0].n, 4);
  assert.deepEqual(r.nuevos[0].puntos, CUAD);
  assert.equal(r.nuevos[0].estado, 'revisado'); assert.equal(r.nuevos[0].hallazgo, 'suelo compactado');
});
test('deGeoJSON saltea lo que no es polígono, no duplica y rechaza lo que no es GeoJSON', () => {
  const g = S.aGeoJSON([S1], {umbral: 0.25});
  g.features.push({type: 'Feature', geometry: {type: 'Point', coordinates: [-64, -28]}, properties: {}});
  const r = S.deGeoJSON(g, [S1], 'ahora');
  assert.equal(r.nuevos.length, 0); assert.equal(r.repetidos, 1); assert.equal(r.salteados, 1);
  assert.equal(S.deGeoJSON({foo: 1}, [], 'ahora').error, 'noGeojson');
});
test('lineaSectores cuenta solo los que quedan para revisar', () => {
  assert.equal(S.lineaSectores([]), '');
  assert.equal(S.lineaSectores([{estado: 'revisar'}]), ' · 1 sector para revisar');
  assert.equal(S.lineaSectores([{estado: 'revisar'}, {estado: 'revisar'}, {estado: 'revisado'}]), ' · 2 sectores para revisar');
});
```

En `tests/textos-en.test.js`, la misma prueba que la de `modulos.dron` (D-38) para `modulos.sectores`: existe, no hay claves que sobran y cada texto tiene las mismas marcas.

- [ ] **Step 2: Correr y ver que fallan.** Esperado: FAIL ("S.aGeoJSON is not a function" y "falta modulos.sectores").
- [ ] **Step 3: Implementar.** Al importar, el estado que no sea válido pasa a `revisar` y la nota y el hallazgo se toman como texto. Un polígono es repetido si sus puntos (redondeados a 1e-7) son iguales a los de un sector que ya está.
- [ ] **Step 4: Correr y ver que pasan.** `node --test "tests/*.test.js"`. Esperado: todas en verde.
- [ ] **Step 5: Commit.** `git commit -am "D-39: GeoJSON de los sectores (ida y vuelta, sin duplicar), linea del Inicio y textos con su ingles"`

### Task 3: Guardar y restaurar el vuelo

**Files:**
- Modify: `web/dron-logica.js` (`idVuelo`, `paqueteVuelo`, `vueloDePaquete` y textos `guardadoVuelo`, `borrarVuelo`, `noGuardadoVuelo` con su inglés), `web/dron.js`, `web/app.js` (motivos `restaurado` y `borrado`), `web/index.html` (script), `scripts/captura-movil.mjs` (`EVAL2`)
- Create: `web/dron-guardado.js`
- Test: `tests/dron-logica.test.js` y la prueba en el navegador

**Interfaces:**
- Produces:
  - `idVuelo(estado) -> string` (`` `${nombre}|${bytes}|${fecha || ''}` ``)
  - `paqueteVuelo(estado, ndvi: {valores, ancho, alto}|null, png: Blob, ahora) -> {version: 1, id, estado, ndvi, png, guardado}`. `estado` va sin `url`, `leyendo`, `aviso` ni `error`.
  - `vueloDePaquete(p) -> {estado, ndvi, png}|null`. Devuelve null si `version !== 1` o si faltan `png` o `estado.recuadro`.
  - `window.BioSatGuardado = {guardar(paquete): Promise<boolean>, leer(): Promise<object|null>, borrar(): Promise<void>}`. Nunca tira errores: si falla, devuelve false o null.
  - `BioSatDron.ndviActual() -> {valores, ancho, alto, recuadro, vuelo: {id, fecha, archivo}}|null` y `BioSatDron.borrarGuardado(): Promise<void>`.
  - Motivos nuevos de `alCambiar`: `'restaurado'` (no mueve el mapa) y `'borrado'`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
test('paqueteVuelo y vueloDePaquete: ida y vuelta, con el NDVI como Float32Array', () => {
  const e = {nombre: 'NDVI.tif', bytes: 10, fecha: '2026-11-03', tipo: 'ndvi', recuadro: [[-28, -64], [-27.9, -63.9]], url: 'blob:x', leyendo: false, error: null};
  const p = D.paqueteVuelo(e, {valores: Float32Array.from([0.1, 0.2]), ancho: 2, alto: 1}, new Blob(['png']), 'ahora');
  assert.equal(p.id, 'NDVI.tif|10|2026-11-03'); assert.equal(p.estado.url, undefined);
  const r = D.vueloDePaquete(structuredClone(p));
  assert.ok(r.ndvi.valores instanceof Float32Array); assert.equal(r.ndvi.valores[1], Float32Array.from([0.2])[0]);
  assert.equal(r.estado.tipo, 'ndvi');
  assert.equal(D.vueloDePaquete({...p, version: 2}), null);
  assert.equal(D.vueloDePaquete({...p, png: null}), null);
});
```

- [ ] **Step 2: Correr y ver que falla.** Esperado: FAIL ("D.paqueteVuelo is not a function").
- [ ] **Step 3: Implementar.**
  - **`dron-guardado.js`:** IndexedDB con `onupgradeneeded`, que crea el almacén. Todo dentro de try/catch.
  - **En `dron.js`:**
    - guardar `datos.ndvi` cuando hay NDVI;
    - después de `'nuevo'` y `'cambio'` (salvo en los estados `pendiente_*`), armar el PNG (`fetch(estado.url).then(r => r.blob())`) y llamar a `BioSatGuardado.guardar`; si devuelve false, `estado.avisoGuardado = TEXTOS.noGuardadoVuelo`;
    - al arrancar, `leer()` → `vueloDePaquete` → `estado` (con `url = URL.createObjectURL(png)` y `restaurado: true`) y `datos.ndvi`, y luego `avisar('restaurado')`;
    - la caja muestra `guardadoVuelo` con el nombre y un botón `borrarVuelo`.
  - **`app.js`:** con `'restaurado'` o `'borrado'`, solo `renderTodo()`.
  - **`captura-movil.mjs`:** si hay `EVAL2`, después de `EVAL` hace `Page.reload`, espera 4000 ms e imprime `EVAL2: ...`.
- [ ] **Step 4: Correr las pruebas.** `node --test "tests/*.test.js"`. Esperado: todas en verde.
- [ ] **Step 5: Probar en el navegador.** Servir en el 8042. Con `ZONA=zona_2_secano_este`:
  - `EVAL` abre `dron_multi_utm20s.tif`;
  - `EVAL2` lee `BioSatDron.estado()` después de recargar. Esperado: `tipo` 'ndvi', `restaurado` true, una capa del dron en el mapa, `#inicioDronTxt` con "NDVI mediano 0,50" y `ndviActual().valores.length` mayor que 0;
  - otra corrida con `EVAL` que pone `window.indexedDB = undefined` antes de abrir el archivo. Esperado: la caja muestra `noGuardadoVuelo`, sin errores de JavaScript;
  - "Borrar el vuelo guardado", recargar: no hay vuelo.
- [ ] **Step 6: Commit.** `git add web scripts tests && git commit -m "D-39: el vuelo achicado y su NDVI quedan guardados en el navegador y se restauran al volver"`

### Task 4: Marcar sectores y la tarjeta

**Files:**
- Create: `web/sectores.js`
- Modify: `web/index.html` (tarjeta `#sectoresCard` después de `#dronFicha` y el script `sectores-logica.js` y `sectores.js` antes de `app.js`), `web/app.js` (`renderTodo` llama a `BioSatSectores.render()` después de `renderVisor`; `Idioma.registrar('sectores', ...)`), `web/estilos.css`
- Test: `tests/vistas.test.js` y la prueba en el navegador

**Interfaces:**
- Consumes: tareas 1 a 3, `visor` (de `app.js`), `DIAG` y `DronLogica.fechaCorta`.
- Produces:
  - `window.BioSatSectores = {render(): void, lista(): Sector[], dibujando(): boolean}`
  - Dentro de `#sectoresCard`: `#sectMarcar`, `#sectDibujo` (con `#sectDeshacer`, `#sectCerrar`, `#sectCancelar`), `#sectLista` (una ficha `[data-sector="<id>"]` por sector) y `#sectAviso`.

- [ ] **Step 1: Prueba que falla, en `tests/vistas.test.js`:**

```js
test('D-39: tarjeta de sectores en el Reporte, con sus scripts antes de app.js', () => {
  for (const id of ['sectoresCard', 'sectMarcar', 'sectDibujo', 'sectLista', 'sectAviso']) assert.ok(idsIndex.has(id), id);
  for (const s of ['sectores-logica.js', 'sectores.js']) assert.ok(index.indexOf(s) > 0 && index.indexOf(s) < index.indexOf('app.js'), s);
  assert.ok(index.indexOf('id="sectoresCard"') > index.indexOf('id="dronFicha"'));
});
```

  Correr `node --test tests/vistas.test.js`. Esperado: FAIL.
- [ ] **Step 2: Implementar `web/sectores.js` y la tarjeta.**
  - **Dibujo:**
    - "Marcar un sector" activa el modo: los `click` del mapa suman puntos, se ven un `L.polyline` y marcadores, y se apaga `doubleClickZoom`;
    - "Cerrar sector" (desde 3 puntos) arma el sector con `nuevoSector`, con el NDVI de `ndviEnPoligono(BioSatDron.ndviActual(), puntos, umbral)` y el vuelo de `ndviActual().vuelo`. Lo guarda y abre su ficha;
    - "Cancelar" o un cambio de zona (`render()` con otra `state.zona`) cancelan el dibujo;
    - fuera del modo, los toques no hacen nada.
  - **Capa:** un `L.layerGroup` propio, que **no** va en `visor.layers`, con un polígono por sector. El color sale del estado: `--accent` para revisar y `--muted` para revisado y descartado. El número va como etiqueta. Tocar un polígono lleva a su ficha.
  - **Ficha:**
    - número, estado (los 3 como botones), superficie;
    - `ndviLinea` con la fecha de su vuelo, o `sinNdvi`;
    - `<textarea>` de nota y, con revisado o descartado, de hallazgo. Se guardan en `change`;
    - botón Borrar con `confirm(confirmarBorrar)`;
    - tocar el título de la ficha (`[data-sector-ir]`) lleva el mapa al sector (`visor.map.fitBounds` del polígono);
    - para el PDF, la nota y el hallazgo también van en un `<p class="solo-print">`.
  - **Guardado:** `localStorage` dentro de try/catch. Si falla, `#sectAviso` muestra `noGuardado` y el sector queda en memoria.
  - **CSS:** `.solo-print{display:none}` y, en `@media print`, `.sect-ficha textarea{display:none}` y `.solo-print{display:block}`.
- [ ] **Step 3: Correr las pruebas.** `node --test "tests/*.test.js"`. Esperado: todas en verde.
- [ ] **Step 4: Probar en el navegador** (8042, `ZONA=zona_2_secano_este`, `#satelite`). Abrir `dron_multi_utm20s.tif` y marcar con `visor.map.fire('click', {latlng: L.latLng(lat, lon)})`:
  - **un sector en la mitad izquierda del archivo** (NDVI 0,5): ficha con "NDVI mediano 0,50 · 0 % sin cobertura activa (vuelo del 03/11)";
  - **otro en la mitad derecha** (NDVI 0): "NDVI mediano 0,00 · 100 % …";
  - **cambiar el estado** del primero a revisado y escribir un hallazgo: queda en `localStorage`;
  - **un toque con el modo apagado:** la lista no cambia;
  - **tocar el título de la ficha 1:** el centro del mapa queda dentro del polígono del sector 1;
  - **empezar a dibujar y cambiar de zona:** el dibujo se cancela;
  - **con `dron_rgb_utm20s.tif`:** un sector nuevo dice "Sin NDVI";
  - **con `Storage.prototype.setItem` tirando un error:** `#sectAviso` muestra `noGuardado` y no hay errores de JavaScript;
  - **capturas** a 390 px y a 1440 px.
- [ ] **Step 5: Commit.** `git add web tests && git commit -m "D-39: marcar sectores sobre el mapa, ficha con estado, nota y que se encontro, guardados en el navegador"`

### Task 5: Exportar, importar, el PDF y la línea del Inicio

**Files:**
- Modify: `web/sectores.js`, `web/index.html` (`#sectExportar`, `#sectImportar`, `<input type="file" id="sectArchivo" accept=".geojson,.json" hidden>`), `web/app.js` (`renderDron` suma `SectoresLogica.lineaSectores(BioSatSectores.lista())` a la línea del Inicio)
- Test: `tests/vistas.test.js` y la prueba en el navegador

**Interfaces:**
- Consumes: `aGeoJSON`, `deGeoJSON` y `lineaSectores` (tarea 2), y `BioSatSectores.lista()` (tarea 4).
- Produces: un botón de exportar que descarga el archivo y un botón de importar que suma sectores y escribe en `#sectAviso` el texto `importados` (con `{ok}`, `{rep}` y `{mal}`) o `noGeojson`.

- [ ] **Step 1: Prueba que falla**

```js
test('D-39: exportar e importar sectores', () => {
  assert.ok(idsIndex.has('sectExportar') && idsIndex.has('sectImportar'));
  assert.match(index, /id="sectArchivo"[^>]*accept="\.geojson,\.json"/);
});
```

  Esperado: FAIL.
- [ ] **Step 2: Implementar.**
  - **Exportar:** `Blob` con `JSON.stringify(aGeoJSON(...), null, 2)`, enlace temporal con `download = 'biosat-sectores-AAAA-MM-DD.geojson'` y `URL.revokeObjectURL` al final.
  - **Importar:** `FileReader` → `JSON.parse` (si falla, `noGeojson`) → `deGeoJSON` → sumar y guardar → aviso.
  - **Línea del Inicio:** `renderDron` agrega `lineaSectores` antes del enlace.
- [ ] **Step 3: Correr las pruebas.** Esperado: todas en verde.
- [ ] **Step 4: Probar en el navegador:**
  - con 2 sectores, uno en revisar: `#inicioDronTxt` termina en `· 1 sector para revisar`;
  - exportar: el `href` del enlace tiene un `FeatureCollection` con 2 polígonos;
  - borrar todo (`localStorage.removeItem`) e importar ese mismo texto con la función de importación (con un `File` hecho en el `EVAL`): vuelven los 2;
  - importarlo otra vez: el aviso dice 2 repetidos y siguen siendo 2;
  - importar un texto que no es JSON: `noGeojson`;
  - el mismo flujo con `?lang=en`.
- [ ] **Step 5: Commit.** `git commit -am "D-39: exportar e importar sectores en GeoJSON, sectores en el PDF y en la linea del Inicio"`

### Task 6: Documentación

**Files:**
- Modify: `docs/reglas-y-bitacora.md` (D-39), `docs/contratos-de-datos.md` (§11, el GeoJSON de sectores), `docs/estado-del-proyecto.md`, `planes/1-enzo.md` (casillas de la etapa 2), `README.md` (`python -X utf8 scripts/actualizar_readme.py`)

- [ ] **Step 1: Bitácora D-39.** Qué hace, las decisiones de Enzo (para el ingeniero en el campo; enfoque B), las decisiones del diseñador (las 7 de la entrega del diseño), lo que se guarda y dónde, los límites y las pruebas.
- [ ] **Step 2: Contrato §11.** El `FeatureCollection` con sus propiedades y un ejemplo de 1 sector.
- [ ] **Step 3: Estado, plan de Enzo y README.** Correr el script del README. Esperado: "README.md actualizado." o "ya estaba al día".
- [ ] **Step 4: Suite completa.** `node --test "tests/*.test.js"` y `python -X utf8 -m pytest -q ia_desmonte/pruebas`. Esperado: todo en verde.
- [ ] **Step 5: Commit.** `git commit -am "D-39: documentacion de la etapa 2 (sectores del lote)"`

**Pendiente fuera del plan:** probarlo con el `NDVI.tif` real cuando llegue, y en un celular de verdad.
