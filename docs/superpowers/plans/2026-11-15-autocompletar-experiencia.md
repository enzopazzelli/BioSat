# Autocompletar para grabar el video (web/experiencia) · plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** con `?demo=1`, que la página de Vale tenga un botón "Autocompletar" en "Nuevo campo" y en "Nueva observación" para grabar el video sin tipear.

**Architecture:** un archivo nuevo, `web/experiencia/demo-autocompletar.js`, con los valores y la lógica pura (se exporta para Node, como el resto del proyecto) más el armado de los botones, que solo se ejecuta en el navegador y con `?demo=1`. Se carga después de `app.js`. El único cambio en el código de Vale es esa etiqueta `<script>` en `index.html`.

**Tech Stack:** JavaScript sin dependencias; pruebas con `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-15-autocompletar-experiencia-design.md`

## Global Constraints

- Sin `?demo=1`, el botón no existe: no se crea ni se ve, y la página queda como está.
- Campo: nombre `Lote Capital · Zona 1`, zona `zona_1_riego_salitre`, latitud `-28.0129`, longitud `-64.2297`, cultivo vacío y una nota de que es un campo de ejemplo.
- Observación: fuente `drone`, sector `Norte`. El resumen y el detalle dicen qué revisar, no un hallazgo (D-33).
- El botón solo llena los campos: guardar queda a cargo de quien graba.
- Textos en castellano y en inglés, según `document.documentElement.lang`, que es el idioma que pone la página.

## Review Focus

- **Cambiar de idioma con el formulario abierto:** el texto del botón pasa al otro idioma (se observa el atributo `lang` del `<html>`).
- **Autocompletar un formulario que ya tenía datos:** los reemplaza todos, incluido el cultivo, que queda vacío.
- **Llenar los campos sin disparar eventos:** si la página escucha `input` o `change`, no se entera. Por eso se dispara `input` y `change` en cada campo.
- **Las coordenadas tienen que caer en el lote:** la prueba lee el recuadro de `repo-lots.js`, no lo copia.
- **`?demo=1` con otros parámetros** (`?lang=en&demo=1`): tiene que activarse igual.

---

### Task 1: Autocompletar con `?demo=1`

**Files:**
- Create: `web/experiencia/demo-autocompletar.js`
- Modify: `web/experiencia/index.html` (una línea, después de `<script src="app.js" defer></script>`)
- Test: `tests/experiencia.test.js` (se suman pruebas)
- Docs: `docs/reglas-y-bitacora.md` (D-48)

**Interfaces:**
- Produces: `DemoAutocompletar = {activo(search: string): boolean, CAMPO: {nombre, zona, lat, lon, cultivo, notas: {es, en}}, OBSERVACION: {es: {titulo, fuente, sector, resumen, detalle}, en: {...}}, TEXTOS: {es: {boton}, en: {boton}}}`. En Node se exporta con `module.exports`; en el navegador queda en `window.DemoAutocompletar`.

- [ ] **Step 1: Escribir las pruebas que fallan** en `tests/experiencia.test.js`:
  - `activo`: `activo('?demo=1')` y `activo('?lang=en&demo=1')` dan `true`; `activo('')`, `activo('?demo=0')` y `activo('?demo')` dan `false`;
  - `CAMPO.zona === 'zona_1_riego_salitre'` y aparece en el `ZONES` de `app.js`; `CAMPO.lat` y `CAMPO.lon` caen dentro del `bbox` de `capital_zona1` leído de `repo-lots.js`; `CAMPO.cultivo === ''`;
  - `OBSERVACION.es.fuente === 'drone'` y `OBSERVACION.es.sector === 'Norte'`; los resúmenes en castellano y en inglés dicen qué revisar (`/recorrer|revisar/i` y `/walk|check/i`);
  - castellano e inglés tienen las mismas claves en `OBSERVACION`, `TEXTOS` y `CAMPO.notas`;
  - `index.html` carga `demo-autocompletar.js` después de `app.js` y no tiene ningún botón de autocompletar escrito en el HTML: el botón solo lo crea el script, con `?demo=1`.
- [ ] **Step 2: Correr** `node --test tests/experiencia.test.js`. Tiene que fallar porque no existe `demo-autocompletar.js`.
- [ ] **Step 3: Implementar `demo-autocompletar.js`.**
  - Con `activo(location.search)` y el DOM listo, se crea un botón `button-secondary` (`type="button"`, id `demoAutocompletarCampo`) dentro de `#fieldForm .form-actions`, y otro (id `demoAutocompletarObs`) junto a `#cancelObservation`.
  - Al tocarlos, llenan `#fieldName`, `#fieldZone`, `#fieldCrop`, `#fieldLat`, `#fieldLon` y `#fieldNotes`, o `#obsTitle`, `#obsSource`, `#obsSector`, `#obsSummary` y `#obsDetail`. Disparan `input` y `change` en cada campo.
  - El idioma sale de `document.documentElement.lang`. Un `MutationObserver` sobre `lang` vuelve a poner el texto de los botones.
  - Se suma `<script src="demo-autocompletar.js" defer></script>` después de `app.js`.
- [ ] **Step 4: Correr** `node --test "tests/*.test.js"`: todo en verde. En el navegador (`scripts/captura-movil.mjs` con `EVAL`):
  - con `?demo=1`, el botón existe y llena el formulario;
  - sin `?demo=1`, no existe;
  - no hay errores de JavaScript.
- [ ] **Step 5: Documentar D-48** en la bitácora y hacer el commit en una rama nueva.
