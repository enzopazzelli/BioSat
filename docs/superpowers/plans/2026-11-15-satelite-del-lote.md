# Rótulo honesto de Landsat y recorte satelital del lote: implementación (D-40)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el visor diga la resolución real de Landsat, y que un lote con vuelo de dron tenga un recorte de Sentinel-2 (10 m) y Landsat (30 m) de una pasada cercana al vuelo, con el NDVI comparado con el del dron en la misma superficie.

**Architecture:**
- **`ia_desmonte/recorte_lote.py`:** baja los recortes de Earth Engine. La lógica pura (recuadro, elegir la pasada, armar el JSON) se prueba con pytest, sin internet.
- **`web/satelite-logica.js`:** módulo puro con los rótulos, el solape de recuadros, la comparación por celdas y los textos.
- **`app.js`:** carga `data/imagenes/lotes/lotes.json` y, si el vuelo cae sobre un lote, suma sus capas, la cortina y la línea de comparación.

**Tech Stack:** Python (earthengine-api, tifffile, numpy, Pillow, pytest), JavaScript sin compilar, Leaflet, `node --test` y `scripts/captura-movil.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-15-satelite-del-lote-design.md`

## Global Constraints

- **Sentinel-2:** `COPERNICUS/S2_SR_HARMONIZED`, nubes con `SCL` (se descartan 3, 8, 9, 10 y 11) y ventana de ±20 días.
- **Landsat:** `LANDSAT/LC08/C02/T1_L2` y `LANDSAT/LC09/C02/T1_L2`, nubes con `QA_PIXEL` (bits 1 a 4) y ventana de ±30 días.
- **Mínimo de píxeles limpios en el recuadro:** 95 %. **Margen alrededor del lote:** 200 m.
- **NDVI:** misma paleta y rango de la app, de 0 a 0,8 con `#a50026, #f46d43, #fee08b, #d9ef8b, #66bd63, #006837`.
- **Comparación:** una celda del satélite cuenta si al menos la mitad de los píxeles del dron que caen en ella son válidos.
- **Salida:**
  - `data/imagenes/lotes/<lote>/{s2_rgb,s2_ndvi,l8_rgb,l8_ndvi}.png` y `lote.json`;
  - índice `data/imagenes/lotes/lotes.json` = `{lotes: [{nombre, recuadro: [oeste, sur, este, norte], ruta}]}`.
- **D-33:** siempre se muestran la fecha de la pasada y los días al vuelo. Sin pasada limpia, la fuente queda en `null` con su motivo.
- **D-35:** textos con clave en `SateliteLogica.TEXTOS` y su inglés en `modulos.satelite`.
- Commits sin `Co-Authored-By`. Rama `enzo-satelite-lote`, en un worktree. Se integra con la aprobación de Enzo.

## Review Focus

1. **El vuelo no cae sobre ningún recorte** (otro lote): no aparecen capas ni línea, sin errores. Prueba con `solapan` (tarea 3) y en el navegador con `drone.tif`, el de Corrientes (tarea 4).
2. **Un recorte con una fuente en `null`** (sin pasada limpia): se ve solo la otra fuente, y la tarjeta dice el motivo. Prueba en el navegador con un `lote.json` de prueba con Landsat en `null` (tarea 4).
3. **Un vuelo sin fecha:** la línea muestra la fecha de la pasada, sin días al vuelo. Prueba de `lineaComparacion` (tarea 3).
4. **Un dron casi sin píxeles válidos sobre las celdas:** no se compara, y la función devuelve null. Prueba de `compararNdvi` (tarea 3).
5. **`lotes.json` ausente** (la app publicada antes de correr el script): la app sigue igual. Prueba en el navegador (tarea 4).

---

### Task 1: Rótulo honesto de Landsat

**Files:**
- Create: `web/satelite-logica.js` (UMD: `window.SateliteLogica` y `module.exports`) y `tests/satelite-logica.test.js`
- Modify: `web/index.html` y `web/completo.html` (rótulo del visor con `id="visorSrc"`; el del panel del satélite con `data-i18n="satNdviSrc"` y el texto "Landsat 8/9 · NDVI a 100 m"), `web/app.js` (`renderVisor` escribe `#visorSrc` cuando carga la imagen), `web/textos-en.js` (`html.satNdviSrc` y `modulos.satelite`), `web/index.html` (script antes de `app.js`)

**Interfaces:**
- Produces: `metrosPorPixelZona(bbox: [oeste, sur, este, norte], anchoPx) -> number`, `rotuloResolucion(metros) -> string` y `TEXTOS.visorSrc = 'Landsat · unos {m} m por píxel en este visor (original de 30 m)'`.

- [ ] **Step 1: Pruebas que fallan**

```js
const SL = require('../web/satelite-logica.js');
test('el rótulo del visor dice la resolución real de la imagen de la zona', () => {
  assert.ok(Math.abs(SL.metrosPorPixelZona([-64.57, -28.03, -63.77, -27.43], 640) - 123) < 1);
  assert.equal(SL.rotuloResolucion(123.4), 'Landsat · unos 120 m por píxel en este visor (original de 30 m)');
  assert.equal(SL.rotuloResolucion(31), 'Landsat · unos 30 m por píxel en este visor (original de 30 m)');
});
```

  En `tests/vistas.test.js`: `index` y `completo` ya no tienen `Landsat · 30 m` ni `Landsat 8/9 · 30 m`, sí tienen `id="visorSrc"` y `NDVI a 100 m`. En `tests/textos-en.test.js`: la prueba de marcas de `modulos.satelite`, como la de D-39.
- [ ] **Step 2: Correr y ver que fallan.** `node --test "tests/*.test.js"`. Esperado: FAIL.
- [ ] **Step 3: Implementar.** Redondeo: a 10 m desde 50 m; por debajo, a 5 m. En `renderVisor`, al evento `load` de la primera capa de Landsat, `#visorSrc` recibe `rotuloResolucion(metrosPorPixelZona(im.meta.bbox, img.naturalWidth))`. Con la capa del dron o de un recorte, el rótulo es el de esa capa (tarea 4).
- [ ] **Step 4: Correr y ver que pasan**, y en el navegador `#visorSrc` de la Zona 1 = "Landsat · unos 120 m por píxel en este visor (original de 30 m)".
- [ ] **Step 5: Commit.** `"D-40: el visor dice la resolucion real de Landsat (unos 120 m por pixel) y el panel del satelite, NDVI a 100 m"`

### Task 2: Script del recorte satelital del lote

**Files:**
- Create: `ia_desmonte/recorte_lote.py` y `ia_desmonte/pruebas/test_recorte_lote.py`

**Interfaces:**
- Produces (lógica pura):
  - `recuadro_de_tif(ruta, margen_m=200) -> [oeste, sur, este, norte]`. Solo para EPSG:4326; con otro sistema, `SystemExit` con el mensaje "usá --bbox".
  - `elegir_pasada(pasadas: list[{'id', 'fecha': 'AAAA-MM-DD', 'limpio': float}], fecha_vuelo: str|None, ventana_dias: int, minimo=0.95) -> (dict|None, motivo: str|None)`.
  - `armar_lote_json(nombre, recuadro, fecha_vuelo, fuentes: {'s2': dict|None, 'l8': dict|None}, motivos) -> dict`.
  - Cada fuente es `{escena, fecha, dias_al_vuelo, limpio, resolucion_m, rgb, ndvi_png, ndvi: {ancho, alto, recuadro, valores}}`.
- CLI: `python -X utf8 -m ia_desmonte.recorte_lote --tif <ruta> [--fecha AAAA-MM-DD] --nombre <lote> [--bbox o,s,e,n]`. Escribe los archivos y agrega o actualiza el lote en `lotes.json`.

- [ ] **Step 1: Pruebas que fallan** (sin internet):
  - `recuadro_de_tif('tests/fixtures/dron_ndvi_4326.tif', 0)` coincide con el recuadro del archivo (±1e-9) y con 200 m de margen se agranda unos 0,0018° en latitud;
  - `elegir_pasada` elige la pasada más cercana a la fecha dentro de la ventana, descarta las que tienen `limpio` menor a 0,95, sin fecha toma la limpia más reciente y sin candidatas devuelve `(None, 'sin pasada limpia a ±20 días del vuelo')`;
  - `armar_lote_json` deja en `null` la fuente sin pasada y guarda su motivo.
- [ ] **Step 2: Correr y ver que fallan.** `python -X utf8 -m pytest -q ia_desmonte/pruebas/test_recorte_lote.py`. Esperado: FAIL (ImportError).
- [ ] **Step 3: Implementar.**
  - **Lógica pura:** como arriba.
  - **Parte de Earth Engine** (`iniciar_ee()` de `comun.py`): por fuente, la colección filtrada por recuadro y ventana (sin fecha, los últimos 120 días). Para cada imagen, el porcentaje limpio en el recuadro (`reduceRegion` de la máscara, escala nativa). Después `elegir_pasada`.
  - **Exportar:** `getThumbURL` en color real (S2: B4, B3, B2 de 0 a 3000; Landsat: SR_B4, SR_B3, SR_B2 escaladas de 0 a 0,3) y en NDVI con la paleta, a escala nativa. Los valores del NDVI salen de `sampleRectangle` (con NaN donde hay nube o falta dato).
- [ ] **Step 4: Correr y ver que pasan.** Esperado: todo en verde, y las 39 pruebas de `ia_desmonte/pruebas` siguen igual.
- [ ] **Step 5: Commit.** `"D-40: script del recorte satelital del lote (Sentinel-2 10 m y Landsat 30 m, pasada limpia cercana al vuelo)"`

### Task 3: Comparación dron contra satélite (lógica pura)

**Files:**
- Modify: `web/satelite-logica.js` y `web/textos-en.js`
- Test: `tests/satelite-logica.test.js`

**Interfaces:**
- Consumes: el NDVI del dron (`BioSatDron.ndviActual()`, D-39) y `lote.json` (tarea 2).
- Produces:
  - `solapan(rDron: [[s, o], [n, e]], recuadroLote: [o, s, e, n]) -> boolean`;
  - `compararNdvi(dron: {valores, ancho, alto, recuadro: [[s, o], [n, e]]}, sat: {valores, ancho, alto, recuadro: [o, s, e, n]}) -> {dron, sat, celdas}|null`;
  - `lineaComparacion(c, fuente: {nombre, resolucion_m, fecha, dias_al_vuelo}, fechaVuelo) -> string`.

- [ ] **Step 1: Pruebas que fallan**
  - **`compararNdvi`:**
    - el satélite es una grilla de 2 × 1 sobre el mismo recuadro que un dron de 4 × 2;
    - la celda izquierda tiene en el dron [0,5; 0,5; 0,5; NaN] y en el satélite 0,4; la derecha tiene [NaN, NaN, NaN, 0] y en el satélite 0,1, así que no cuenta (menos de la mitad válida);
    - resultado esperado: `{dron: 0.5, sat: 0.4, celdas: 1}`;
    - con todos los píxeles del dron en NaN, devuelve null.
  - **`solapan`:** verdadero y falso con dos recuadros.
  - **`lineaComparacion`:**
    - con fecha del vuelo: `'En la misma superficie: NDVI mediano 0,50 con el dron y 0,40 con Sentinel-2 (10 m, 03/11, 2 días antes del vuelo).'`;
    - con la pasada el mismo día: `'el mismo día del vuelo'`;
    - sin fecha del vuelo: `'(10 m, pasada del 03/11)'`.
- [ ] **Step 2: Correr y ver que fallan.**
- [ ] **Step 3: Implementar.** Cada píxel del dron se asigna a la celda del satélite que contiene su centro. Se toma la mediana de los dos lados sobre las celdas que cuentan. La fecha va con `DronLogica.fechaCorta`.
- [ ] **Step 4: Correr y ver que pasan** (con la prueba de marcas del inglés).
- [ ] **Step 5: Commit.** `"D-40: comparacion del NDVI del dron y del satelite en la misma superficie"`

### Task 4: El recorte en la app

**Files:**
- Modify: `web/app.js` (`cargarLotesSat(base)`, capas y cortina en `renderVisor`, línea en `renderDron`) y `web/textos-en.js`
- Create: `tests/fixtures/lotes/lotes.json` y `tests/fixtures/lotes/prueba/lote.json`, más PNG chicos. Es un lote **sintético** sobre el archivo `dron_multi_utm20s.tif`, con Sentinel-2 y Landsat en `null`. Lo genera `tests/fixtures/generar_tif_prueba.py`.
- Test: `tests/vistas.test.js` y la prueba en el navegador

**Interfaces:**
- Consumes: tareas 1 y 3.
- Produces:
  - `window.LOTES_SAT` (lotes cargados);
  - `cargarLotesSat(base = '../data/imagenes/lotes/') -> Promise`, que sin `lotes.json` deja `[]` sin error;
  - capas `sat_s2_rgb`, `sat_s2_ndvi`, `sat_l8_rgb` y `sat_l8_ndvi`;
  - cortina `satelite_dron`, con el satélite en NDVI abajo y el dron arriba.

- [ ] **Step 1: Prueba que falla** en `tests/vistas.test.js`: `app.js` define `cargarLotesSat` y la carga en `cargarDatos` no rompe si falta el archivo (`.catch`).
- [ ] **Step 2: Implementar y correr las pruebas.**
- [ ] **Step 3: En el navegador** (8044), con `EVAL`: `cargarLotesSat('/tests/fixtures/lotes/')`, abrir `dron_multi_utm20s.tif` y `renderTodo()`. Esperado:
  - el visor tiene la capa `sat_s2_ndvi` y la cortina `satelite_dron`;
  - la tarjeta tiene la línea de comparación de Sentinel-2 y el motivo de Landsat en `null`;
  - con `drone.tif` (Corrientes), no aparecen capas del recorte;
  - sin `lotes.json`, no hay errores;
  - capturas a 390 px.
- [ ] **Step 4: Commit.** `"D-40: el recorte satelital del lote en el visor, la cortina satelite contra dron y la comparacion en la tarjeta"`

### Task 5: Correr el recorte real y documentar

- [ ] **Step 1: Correr el script.** Con `EE_PROJECT` (lo pasa Enzo): `python -X utf8 -m ia_desmonte.recorte_lote --tif D:/User/Desktop/NDVI.tif --nombre capital_zona1 [--fecha <fecha del vuelo>]`. Esperado: `data/imagenes/lotes/capital_zona1/` con los PNG y `lote.json`, y el lote en `lotes.json`. **Sin `EE_PROJECT`, este paso queda pendiente y se anota.**
- [ ] **Step 2: En el navegador**, con el `NDVI.tif` real: capas, cortina y la línea de comparación con números reales.
- [ ] **Step 3: Documentar.**
  - **Bitácora D-40:** qué se encontró (unos 125 m por píxel, medianas de varios meses, el recuadro es la celda de clima), las decisiones, la lectura del ingeniero (rojo = maleza, amarillo = zona afectada, verde = vigoroso, en este lote; hacen falta sus cortes para usarla) y la prueba del `NDVI.tif` (382,6 MB, 15 s, NDVI mediano 0,42, 9 % sin cobertura activa).
  - **Contrato de datos §12** (`lote.json`), estado, plan de Enzo y README.
- [ ] **Step 4: Suites completas y commit.** `"D-40: documentacion del rotulo de Landsat y del recorte satelital del lote"`
