# Botón de idioma ES/EN, etapa 1: plan de implementación (D-35)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** un botón `ES | EN` que pasa a inglés el asistente, el Inicio, el marco del Reporte, la pantalla del kit y la guía del campo, sin recargar la página, y avisa en inglés lo que sigue en español.

**Architecture:**
- `web/idioma-logica.js` es la lógica pura con pruebas: elegir el idioma, el locale y aplicar textos en su lugar.
- `web/textos-en.js` es el diccionario en inglés.
- `web/idioma.js` hace el cambio en el navegador: cada objeto de textos se registra con `Idioma.registrar(nombre, objeto)`, que guarda una copia en español y reemplaza el contenido en su lugar al cambiar de idioma. El HTML usa `data-i18n`, y al cambiar se avisa a las páginas para que vuelvan a dibujar.
- Los textos en español no se mueven, para no chocar con D-33.

**Tech Stack:** HTML, CSS y JS sin dependencias; `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-15-idioma-es-en-design.md`

## Global Constraints

- **Solo dos idiomas: español (los textos de siempre) e inglés (`web/textos-en.js`).** No es un sistema para cualquier idioma: el botón tiene dos opciones, `ES` y `EN`, y cualquier otro valor guardado o en la URL abre en español.
- Con `ES`, la app se ve exactamente como hoy y las 130 pruebas actuales siguen en verde.
- Nada externo; sin recargar la página (funciona sin internet).
- Idioma: `?lang=en` o `?lang=es` en la URL ganan sobre lo guardado en `localStorage` (`biosat.idioma`, siempre dentro de try/catch); por defecto, `es`.
- Números con el locale `en-US` o `es-AR`.
- No se traducen los nombres de lugar.
- Avisos fijos, copia exacta: "Some details of this report are still in Spanish." (Reporte) y "This detailed view is only in Spanish for now." (vista detallada).
- `web/textos-en.js` empieza con este comentario: "Los nombres de las rotaciones son traducción del equipo, pendiente de revisión de Vale."
- Commits sin `Co-Authored-By`, en la rama `enzo-app`. Se integra a `main` solo con la aprobación de Enzo.

## Review Focus

1. **Volver a ES después de EN:** se espera que todo, incluso lo dibujado por JS, vuelva al español exacto de antes, sin mezclas (prueba de ida y vuelta de `aplicarEnLugar` en la tarea 1 y captura ES después de EN en la tarea 2).
2. **Una clave en inglés que no existe en español** (un error de tipeo): se espera que la prueba lo detecte y que en la app no aparezca `undefined` (tarea 1, `fusionar`, y prueba de claves en la tarea 2).
3. **`localStorage` bloqueado** (navegador en modo privado): se espera que el botón igual cambie el idioma (try/catch en `idioma.js`; captura con `EVAL` en la tarea 2).
4. **Cambiar el idioma con el asistente abierto:** se espera que el asistente se redibuje en el idioma nuevo sin perder la respuesta marcada (tarea 3).
5. **El texto en inglés es más largo** y desborda a 390 px: se espera que el ancho de pantalla siga igual al del contenido en todas las capturas EN (tareas 2 a 5).

---

### Task 0: Rama

- [ ] `git switch enzo-app && git merge --ff-only main`. Esperado: avanza sin conflictos.

### Task 1: Lógica del idioma

**Files:**
- Create: `web/idioma-logica.js` (`window.IdiomaLogica` y `module.exports`)
- Test: `tests/idioma-logica.test.js`

**Interfaces:**
- Produces:
  - `elegirIdioma(search: string, guardado: string|null) -> 'es'|'en'`
  - `locale(idioma) -> 'en-US'|'es-AR'`
  - `fusionar(es, en) -> objeto nuevo`, con la forma de `es` y los textos de `en` donde son texto y existen en `es`. No toca los originales.
  - `aplicarEnLugar(destino, fuente) -> void`: deja `destino` igual a `fuente` sin cambiar la identidad de los objetos ni de los arreglos (en objetos asigna clave por clave; en arreglos reemplaza los elementos).
  - `copiaProfunda(x)`: copia con `JSON` (los textos son datos planos).
  - `clavesSobrantes(es, en) -> string[]`: las rutas de `en` que no existen en `es`, como `"p1.titulo"`.

- [ ] **Step 1: pruebas que fallan:**
  - `elegirIdioma('?lang=en', 'es') === 'en'`, `('?zona=x&lang=es', 'en') === 'es'`, `('', 'en') === 'en'` y `('', null) === 'es'`; cualquier otro valor (por ejemplo `'fr'` guardado o `?lang=pt`) da `'es'`, porque solo hay español e inglés;
  - `locale('en') === 'en-US'` y `locale('es') === 'es-AR'`;
  - `fusionar({a: 'hola', b: {c: 'chau', d: 3}, m: ['ene', 'feb']}, {b: {c: 'bye'}, m: ['Jan']})` es igual a `{a: 'hola', b: {c: 'bye', d: 3}, m: ['Jan', 'feb']}`, y el `es` original no cambia;
  - una clave de `en` que no está en `es` no aparece en el resultado;
  - **ida y vuelta:** se toma `o`, se guarda `es = copiaProfunda(o)`, se hace `aplicarEnLugar(o, fusionar(es, en))` y después `aplicarEnLugar(o, es)`; queda `deepEqual(o, es)`, y `o.b` es el mismo objeto que antes (identidad);
  - `clavesSobrantes({a: 'x', b: {c: 'y'}}, {a: 'X', b: {z: 'Z'}, q: 'Q'})` es igual a `['b.z', 'q']`.
- [ ] **Step 2:** `node --test tests/idioma-logica.test.js`. Esperado: FAIL, porque el módulo no existe.
- [ ] **Step 3:** implementar.
- [ ] **Step 4:** `node --test "tests/*.test.js"` en verde.
- [ ] **Step 5:** commit con el mensaje `D-35: logica del idioma (elegir, fusionar y aplicar en el lugar) con pruebas`.

### Task 2: Cambio de idioma en el navegador + el Inicio en inglés

**Files:**
- Create:
  - `web/textos-en.js` (`window.TEXTOS_EN` y `module.exports`);
  - `web/idioma.js` (`window.Idioma`);
  - `tests/textos-en.test.js`.
- Modify:
  - `web/index.html`: scripts `idioma-logica.js`, `textos-en.js` e `idioma.js` antes de `asistente-logica.js` (línea 16); `<div class="idioma" data-idioma-boton></div>` en `.ini-campo` junto a `#btnCambiarInicio`; `data-i18n` en los textos fijos del Inicio (líneas 29 a 70).
  - `web/app.js`: registrar los textos, usar `Idioma.nf`, poner los nombres de las rotaciones y volver a dibujar al cambiar.
  - `web/estilos.css`: el botón `.idioma`.

**Interfaces:**
- Consumes: `IdiomaLogica` (tarea 1).
- Produces (`window.Idioma`):
  - `actual() -> 'es'|'en'`
  - `registrar(nombre: string, objeto)`: guarda la copia en español y aplica `TEXTOS_EN.modulos[nombre]` si el idioma es `en`.
  - `cambiar(idioma)`
  - `alCambiar(fn)`
  - `nf(n, decimales)`
  - `texto(clave) -> string`: de `TEXTOS_EN.html` en `en`, o del `data-es` guardado en `es`.
- Comportamiento:
  - al cargar, aplica los `[data-i18n]` y los `[data-i18n-attr="atributo:clave"]`;
  - muestra los `[data-solo-en]` solo en `en`;
  - pone `<html lang>`;
  - dibuja en cada `[data-idioma-boton]` dos botones (`ES`, `EN`) con `aria-pressed` y `aria-label="Idioma / Language"`.
- `TEXTOS_EN = {html: {}, modulos: {}, rotaciones: {}}`. Nombres en `modulos`:
  - `inicio` → `InicioLogica.TEXTOS`;
  - `pronostico` → `PronosticoLogica.TEXTOS`;
  - `frases` → `FrasesLogica.TEXTOS`;
  - `asistente` → `BioSatAsistente.TEXTOS`;
  - `appInicio` → `TEXTOS_INICIO`, `appReporte` → `TEXTOS_REPORTE`, `appCampo` → `TEXTOS_CAMPO`;
  - `meses` → `MES_L`, `mesesCortos` → `MES`;
  - `estado` → `ESTADO` (solo los `label`);
  - `zonas` → `ZONAS` (solo `nombre` y `problema`);
  - `kit` → los textos de `kit.js` (tarea 5).
- `rotaciones`: `{id: 'English name'}` para los 15 ids de `data/rotaciones_santiago.json`.
- `app.js`:
  - `nf` pasa a `(n, d=0) => window.Idioma ? Idioma.nf(n, d) : …` (con `es-AR` de respaldo);
  - después de `cargarDatos()`, registra los objetos;
  - guarda `r.nombreEs` y aplica `r.nombre = (Idioma.actual() === 'en' && TEXTOS_EN.rotaciones[r.id]) || r.nombreEs`;
  - `Idioma.alCambiar(() => { nombres de rotaciones; renderTodo(); })`.

- [ ] **Step 1: pruebas que fallan** (`tests/textos-en.test.js`):
  - cada `data-i18n` de `index.html`, `kit.html`, `campo.html` y `completo.html` tiene su clave en `TEXTOS_EN.html`, y cada clave de `html` se usa en alguna página;
  - `clavesSobrantes(InicioLogica.TEXTOS, EN.modulos.inicio)` está vacío, y lo mismo para `pronostico` y `frases`; para `asistente`, cargando `asistente.js` en `vm` con `window` de prueba;
  - para `appInicio`, `appReporte` y `appCampo`, cada clave de primer nivel aparece como `clave:` en el texto de `web/app.js`;
  - cada `id` de `rotaciones` existe en `data/rotaciones_santiago.json` y las 15 tienen traducción;
  - ningún texto en inglés queda vacío (recorrido de todo `TEXTOS_EN`).
- [ ] **Step 2:** `node --test tests/textos-en.test.js`. Esperado: FAIL, porque no existe `textos-en.js`.
- [ ] **Step 3:** escribir `textos-en.js` con las traducciones del Inicio, la tarjeta del pronóstico, los meses, los estados, las zonas y las rotaciones. Escribir `idioma.js`, los `data-i18n` del Inicio, el botón y el registro en `app.js`.
- [ ] **Step 4:** `node --test "tests/*.test.js"` en verde.
- [ ] **Step 5: capturas** con `ZONA=zona_2_secano_este`:
  - `index.html?lang=en` a 390 y 1440 px: todo el Inicio en inglés y "Nov" y números con punto;
  - `index.html?lang=es`: igual que antes;
  - con `EVAL` que llama a `Idioma.cambiar('en')` y después a `Idioma.cambiar('es')`, el `innerText` del Inicio es igual al de una carga en español;
  - con `EVAL` que hace `localStorage.setItem=()=>{throw 1}` y llama a `Idioma.cambiar('en')`, `document.documentElement.lang === 'en'`.

  En todas las capturas, el ancho de pantalla tiene que coincidir con el del contenido y no tiene que haber errores de JS.
- [ ] **Step 6:** commit con el mensaje `D-35: boton ES/EN y el Inicio en ingles`.

### Task 3: El asistente en inglés

**Files:**
- Modify: `web/asistente.js` (botón `[data-idioma-boton]` en la cabecera de la ventana; `Idioma.alCambiar` vuelve a dibujar la pregunta actual con las mismas respuestas), `web/textos-en.js` (`modulos.asistente`).

- [ ] **Step 1:** la prueba de claves del asistente de la tarea 2 pasa a exigir que `modulos.asistente` tenga `comun`, `p1`, `p2`, `p3` y `p4`, todos los de `TEXTOS` (FAIL).
- [ ] **Step 2:** traducir y conectar el redibujo.
- [ ] **Step 3:** `node --test "tests/*.test.js"` en verde. Captura de `index.html?lang=en&asistente=1` a 390 px: las 4 preguntas en inglés, el ancho sin desbordes y sin errores de JS.
- [ ] **Step 4:** commit con el mensaje `D-35: el asistente en ingles`.

### Task 4: El marco del Reporte en inglés y el aviso en la vista detallada

**Files:**
- Modify:
  - `web/index.html`: `data-i18n` en "← Volver", el eyebrow del Reporte, Guardar PDF, Compartir, los 7 chips, los eyebrows de sección y los títulos fijos; el botón `[data-idioma-boton]` en la cabecera; `<p class="rep-aviso-en" data-solo-en data-i18n="repAvisoEs" hidden>` debajo del subtítulo.
  - `web/completo.html`: `<div data-solo-en hidden>` arriba, con `data-i18n="completoAvisoEs"` y un link al Inicio (`data-i18n="completoVolver"`); cargar `idioma-logica.js`, `textos-en.js` e `idioma.js`.
  - `web/textos-en.js`: `modulos.appReporte`, `modulos.frases` y las claves `html` del Reporte.

- [ ] **Step 1:** las pruebas de claves de `html` y `appReporte` (tarea 2) fallan por las claves nuevas sin traducción.
- [ ] **Step 2:** traducir y marcar.
- [ ] **Step 3:** `node --test "tests/*.test.js"` en verde.
- [ ] **Step 4: capturas.**
  - `index.html?lang=en#reporte` a 390 px: título, subtítulo ("Zone 2 · no irrigation · …"), botones, chips, conclusiones y el aviso "Some details of this report are still in Spanish.".
  - `completo.html?lang=en`: el aviso arriba.
  - Con `lang=es`, ningún aviso a la vista.
- [ ] **Step 5:** commit con el mensaje `D-35: el marco del Reporte en ingles y aviso en la vista detallada`.

### Task 5: La pantalla del kit y la guía del campo en inglés

**Files:**
- Modify:
  - `web/kit.html` y `web/campo.html`: los 3 scripts del idioma, `data-i18n` en todos los textos fijos y el botón en la cabecera;
  - `web/kit.js`: sacar sus frases a un objeto `TEXTOS`, registrarlo como `kit`, que `nf` use `Idioma.nf`, que el mes salga de un arreglo registrado como `meses`, y volver a dibujar con `alCambiar`;
  - `web/textos-en.js`.

- [ ] **Step 1:** la prueba de claves de `html` (tarea 2) falla por las marcas nuevas; se suma la prueba de `modulos.kit` contra el `TEXTOS` de `kit.js` (cargado en `vm`).
- [ ] **Step 2:** traducir y conectar.
- [ ] **Step 3:** `node --test "tests/*.test.js"` en verde.
- [ ] **Step 4: capturas** de `kit.html?lang=en&zona=zona_2_secano_este` a 1440 y 390 px, y de `campo.html?lang=en` a 390 y 1440 px: todo en inglés, sin desbordes y sin errores de JS.
- [ ] **Step 5:** commit con el mensaje `D-35: la pantalla del kit y la guia del campo en ingles`.

### Task 6: Documentación

- [ ] **Bitácora:** sumar D-35, con qué quedó en inglés, qué no, el aviso y las rotaciones pendientes de revisión de Vale.
- [ ] **Plan de D-33:** sumar el paso "si cambiás un texto en español que tiene clave en `web/textos-en.js`, actualizá el inglés".
- [ ] **`planes/1-enzo.md`:** la casilla del idioma queda con la nota "etapa 1 hecha (D-35); etapa 2 pendiente", y se suma la casilla de la etapa 2.
- [ ] **`planes/3-vale.md`:** sumar la casilla "Revisar los 15 nombres de rotaciones en inglés de `web/textos-en.js`".
- [ ] **Estado, memoria y script del README:** sumar las descripciones de `web/idioma-logica.js`, `tests/idioma-logica.test.js` y `tests/textos-en.test.js`, y regenerar.
- [ ] `node --test "tests/*.test.js"` en verde y `actualizar_readme.py --check` con salida 0.
- [ ] Commit con el mensaje `D-35: documentacion (bitacora, planes, estado y README)`.
- [ ] Pedirle a Enzo la aprobación para integrar a `main`.
