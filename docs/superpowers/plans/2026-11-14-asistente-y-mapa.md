# Asistente de inicio y mapa de Santiago del Estero · Plan de construcción

> **Para quien lo ejecute:** usar `superpowers:executing-plans` (en línea) y seguir las tareas en orden. Las casillas `- [ ]` marcan cada paso.

**Objetivo:** un asistente de 4 preguntas con un mapa real de Santiago del Estero para el Paso 1, y una app más fácil de leer para gente grande.

**Arquitectura:** tres archivos nuevos separan la lógica de la interfaz. `web/asistente-logica.js` (sin interfaz, con pruebas de Node, como `kit-logica.js`), `web/asistente.js` y `web/asistente.css` (la ventana, que no conoce a `app.js`) y `data/santiago_mapa.json` (generado una vez por un script). `app.js` solo conecta: abre el asistente, recibe las respuestas y las pasa a `state`.

**Tecnologías:** HTML y JavaScript sin proceso de compilación, Node 22 con `node:test`, Python 3 con biblioteca estándar solo para generar el mapa, Chrome sin ventana para verificar.

**Diseño:** `docs/superpowers/specs/2026-11-14-asistente-y-mapa-design.md`. Es la autoridad: si este plan y el diseño no coinciden, gana el diseño.

## Restricciones generales

- Sin internet en la app, sin librerías nuevas, sin números inventados.
- **Todo texto nuevo va en un objeto `TEXTOS` con claves**, agrupado por pantalla; nada suelto en el código ni en el HTML. (El idioma EN/ES viene después.)
- Íconos: SVG propios (monocromáticos, trazo simple), no emojis.
- Los `id` de zonas (`zona_1_riego_salitre`…) y de prioridades (`agua`, `salitre`, `suelo`, `forraje`, `ingreso`) **no cambian**. El motor de reglas no se toca.
- Todo acceso a `localStorage` va dentro de `try/catch`. Clave: `biosat.asistente.v1`.
- El asistente usa atributos `data-asist-*` propios: `app.js` ya escucha cualquier clic en `[data-zona]` y `[data-prio]`, y no deben chocar.
- Letra del asistente de 18 px o más, botones de 48 px o más, sin desbordes a 360 px.
- Pruebas: `node --test tests/*.test.js`. Chrome: `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --no-first-run --user-data-dir=<scratch>/chrome-limpio --virtual-time-budget=15000 --dump-dom URL`, con `python -m http.server 8765 --bind 127.0.0.1` en segundo plano y un arnés con `iframe` para anchos de celular.
- Commits en `enzo-app`, sin la línea `Co-Authored-By`. **No integrar a `main` sin aprobación de Enzo.**

## Puntos a revisar

1. **`localStorage` bloqueado, vacío o con datos rotos:** la app abre con los valores por defecto, el asistente aparece en cada visita y nunca hay error en la consola. (Tarea 1, pruebas de `leer` y `guardar`; Tarea 3, arnés.)
2. **`hecho` y `?asistente=1`:** con `hecho` verdadero no se abre solo; con `?asistente=1` se abre igual. Esc equivale a "Saltar". (Tarea 1 y Tarea 3.)
3. **El pueblo de cada zona cae sobre un departamento de su mismo color.** En particular, Añatuya sobre General Taboada, que hoy está mal asignado en `ZONAS`. (Tarea 4, prueba de datos.)
4. **Foco y teclado:** al abrir, el foco entra al diálogo; Tab no se escapa; al cerrar, vuelve al botón que lo abrió. (Tarea 2.)
5. **Riego:** la respuesta de la persona manda sobre el valor de la zona, y `null` usa el de la zona. (Tarea 1.)

---

### Task 1: Lógica del asistente `web/asistente-logica.js`

**Archivos:**
- Crear: `web/asistente-logica.js`
- Prueba: `tests/asistente-logica.test.js`

**Interfaces:**
- **Produce** (`module.exports` en Node y `window.AsistenteLogica` en el navegador), con `zonas` = el objeto `ZONAS` de `app.js` (`{id: {num, lugar, nombre, riego}}`):
  - constantes `CLAVE = 'biosat.asistente.v1'`, `ZONA_POR_DEFECTO = 'zona_2_secano_este'`, `MAX_PRIO = 3`, `PRIO_IDS = ['agua','salitre','suelo','forraje','ingreso']`, `PRIO_POR_DEFECTO = ['agua','suelo']`
  - `respuestasPorDefecto()` → `{zona, riego:null, ganado:null, maq:null, prio:[], hecho:false}`
  - `normalizar(obj, zonas)` → respuestas válidas: zona inexistente → por defecto; `riego`, `ganado` y `maq` solo `true`, `false` o `null`; `prio` sin repetidos, sin `id` desconocidos y recortada a 3; `hecho` solo si es exactamente `true`
  - `leer(almacen, zonas)` → respuestas; `almacen` es un objeto con `getItem` (puede ser `null`, lanzar error o devolver JSON roto o de otra versión: en todos esos casos, por defecto)
  - `guardar(almacen, respuestas)` → `true` si guardó, `false` si falló; guarda `{v:1, ...respuestas}`
  - `alternarPrio(prio, id)` → lista nueva: agrega o quita; si ya hay 3, agregar no hace nada; `id` desconocido se ignora
  - `riegoEfectivo(respuesta, riegoDeLaZona)` → la respuesta si es booleana; si es `null`, el de la zona
  - `aEstado(respuestas, zonas)` → `{zona, riego, ganado, maq, prio:Set}` para `state` de `app.js`: `ganado` `null` → `true`, `maq` `null` → `false`, `prio` vacía → `PRIO_POR_DEFECTO`
  - `debeAbrir(respuestas, buscar)` → `true` si `hecho` es falso o `buscar` (ej. `'?asistente=1'`) trae `asistente=1`
  - `resumen(respuestas, zonas)` → `{num, pueblo, nombre, tiene:[…claves 'riego'|'hacienda'|'maq' que sean verdaderas], preocupa:[…ids]}` (sin textos: los textos van en `TEXTOS`)

- [ ] **Step 1: escribir `tests/asistente-logica.test.js`** con un `ZONAS_PRUEBA` de 5 zonas (solo la 1 con `riego:true`) y estas pruebas, una por comportamiento:
  - `respuestasPorDefecto` devuelve la Zona 2 y todo sin responder.
  - `normalizar` descarta una zona inexistente, convierte `"si"` en `null`, deja `prio:['agua','agua','xx','suelo','forraje','ingreso']` en `['agua','suelo','forraje']` y no deja pasar `hecho:"true"`.
  - `leer` devuelve lo guardado; con `almacen` nulo, con `getItem` que lanza, con texto que no es JSON y con `{v:2}` devuelve los valores por defecto.
  - `guardar` escribe `{v:1,…}` en la clave `biosat.asistente.v1` y devuelve `true`; con `setItem` que lanza, devuelve `false` y no propaga el error.
  - `alternarPrio`: agrega, quita, no pasa de 3 y no modifica la lista original.
  - `riegoEfectivo`: `riegoEfectivo(null, true)` es `true`; `riegoEfectivo(false, true)` es `false`.
  - `aEstado`: con todo sin responder da `ganado:true`, `maq:false`, `prio` con `agua` y `suelo` y `riego` el de la zona.
  - `debeAbrir`: `hecho:false` es `true`; `hecho:true` es `false`; `hecho:true` con `'?x=1&asistente=1'` es `true`.
  - `resumen` de la Zona 2 con `ganado:true` y `prio:['agua']` da `{num:2, pueblo:'Quimilí', tiene:['hacienda'], preocupa:['agua']}`.
- [ ] **Step 2: correr** `node --test tests/asistente-logica.test.js`. Esperado: falla con "Cannot find module".
- [ ] **Step 3: implementar `web/asistente-logica.js`** con las firmas de arriba, en el mismo formato que `web/kit-logica.js` (función autoejecutable; exporta a `module.exports` o a `window.AsistenteLogica`).
- [ ] **Step 4: correr** `node --test tests/*.test.js`. Esperado: todo pasa (las 34 existentes y las nuevas).
- [ ] **Step 5: commit** `git add web/asistente-logica.js tests/asistente-logica.test.js && git commit -m "Logica del asistente de inicio con pruebas"`.

### Task 2: Ventana del asistente `web/asistente.js` y `web/asistente.css`

**Archivos:**
- Crear: `web/asistente.js`, `web/asistente.css`

**Interfaces:**
- **Usa:** `window.AsistenteLogica` (Tarea 1).
- **Produce:** `window.BioSatAsistente.abrir(opciones)`, con `opciones = {zonas, respuestas, mapa, alCerrar}`:
  - `zonas`: el `ZONAS` de `app.js`
  - `respuestas`: las respuestas normalizadas con las que arranca
  - `mapa`: opcional. Datos de `data/santiago_mapa.json` (Tarea 4); si falta, la pantalla 1 muestra solo los botones
  - `alCerrar(respuestas, motivo)`: `motivo` es `'terminar'` o `'saltar'`; las respuestas ya llevan `hecho:true`
- Además `BioSatAsistente.abierto()` → `true` si la ventana está abierta (lo usa la prueba).

- [ ] **Step 1: `web/asistente.js`**, con `TEXTOS` (claves por pantalla) y `ICONOS` (SVG de trazo para `riego`, `hacienda`, `maq`, `agua`, `salitre`, `suelo`, `pasto`, `plata`), y la ventana:
  - Diálogo `role="dialog"` `aria-modal="true"` con título; una pregunta por pantalla, con barra de avance y la etiqueta **"Pregunta N de 4"**; botones "← Atrás", "Siguiente →" y "Saltar".
  - **Pantalla 1:** 5 botones `role="radio"` con el pueblo (`ZONAS[id].lugar`) en letra grande y el nombre de la zona (`ZONAS[id].nombre`) debajo, y un contenedor `.asist-mapa` (oculto si no hay `mapa`). **Pantalla 2:** tarjetas de sí o no para riego, hacienda y sembradora o rolo; riego arranca con `riegoEfectivo(respuestas.riego, ZONAS[zona].riego)`. **Pantalla 3:** 5 temas con ícono, hasta 3 (`alternarPrio`), con un aviso cuando ya hay 3. **Pantalla 4:** resumen (`resumen()`) y botón "Ver mi campo →".
  - Las pantallas 2 y 3 se pueden dejar en blanco. "Siguiente" siempre está habilitado.
  - **Foco:** al abrir, va al título; Tab y Mayús+Tab quedan dentro del diálogo; Esc equivale a "Saltar"; al cerrar, el foco vuelve al elemento que estaba activo antes.
  - Textos con voseo y sin jerga ("Sembradora o rolo · para sembrar sin arar").
- [ ] **Step 2: `web/asistente.css`**: pantalla completa, letra de 18 px o más, botones de 48 px o más, selección con borde grueso y texto (no solo color), `prefers-reduced-motion`. A partir de 700 px de ancho, mapa a la izquierda y botones a la derecha; por debajo, el mapa arriba con `max-height:40vh` y los botones debajo. Colores con los tokens de `estilos.css`.
- [ ] **Step 3: verificar con un arnés en Chrome** (copia descartable en el scratchpad, no se sube) que carga `asistente-logica.js` y `asistente.js` con un `ZONAS` de prueba y llama a `abrir`. Esperado:
  - 4 pantallas en orden y el texto "Pregunta 1 de 4" a "Pregunta 4 de 4".
  - Todos los botones miden 48 px o más de alto y el texto 18 px o más (medido con `getComputedStyle`).
  - Elegir la Zona 4 y tres temas: el cuarto tema no se agrega y aparece el aviso. El resumen nombra "Zona 4 · Añatuya".
  - Esc llama a `alCerrar(…, 'saltar')` con `hecho:true`; "Ver mi campo" llama con `'terminar'`.
  - El foco empieza dentro del diálogo, Tab no sale de él y al cerrar vuelve al botón que lo abrió.
  - En un iframe de 360 px no hay desborde horizontal.
- [ ] **Step 4: commit** `git add web/asistente.js web/asistente.css && git commit -m "Ventana del asistente de inicio"`.

### Task 3: Conectar el asistente con la app

**Archivos:**
- Modificar: `web/index.html`, `web/app.js`, `web/estilos.css`

**Interfaces:**
- **Usa:** `AsistenteLogica` y `BioSatAsistente` (Tareas 1 y 2).
- **Produce:** al cargar, el asistente se abre solo la primera vez (o con `?asistente=1`); la sección Paso 1 muestra la tarjeta "Tu campo" con el botón "Cambiar mis respuestas".

- [ ] **Step 1: `web/index.html`:**
  - Cargar `asistente.css` y, con `defer`, `asistente-logica.js` y `asistente.js` antes de `app.js`.
  - Reemplazar el contenido de `.campo` del Paso 1 (mapa chico, lista de zonas, prioridades, interruptores) por una tarjeta **"Tu campo"** con zona, pueblo, qué tenés, qué te preocupa y el botón "Cambiar mis respuestas". Conservar `#zonaFicha`.
- [ ] **Step 2: `web/app.js`:**
  - En `ZONAS`, sacar *General Taboada* de la Zona 2 y sumarla a la Zona 4 (`deptos`).
  - Tras `cargarDatos()` y antes de `renderTodo`, leer las respuestas con `AsistenteLogica.leer(localStorage, ZONAS)` (dentro de `try/catch`), aplicarlas a `state` con `aEstado` y, si `debeAbrir(respuestas, location.search)`, abrir el asistente con `alCerrar` que guarda (`guardar`), vuelve a aplicar a `state`, llama a `renderTodo()` y deja el foco en el Paso 2.
  - "Cambiar mis respuestas" abre el asistente en la pregunta 1 con lo guardado.
  - **Quitar** lo que ya no existe en la página: `renderMapa`, `renderZonas` (conservando la parte de `#zonaFicha`), `renderPrefs`, y los manejadores de `#limRiego`, `#limGanado`, `#limMaq`, `[data-prio]` y `[data-zona]`. Ajustar `renderTodo` y `renderClima`.
  - `state.riego` y `state.zona` se calculan con `aEstado`; el valor de `ZONAS[zona].riego` solo vale cuando la persona no respondió.
- [ ] **Step 3: `web/estilos.css`:** estilos de la tarjeta "Tu campo"; sacar lo que quedó sin uso (`.locator`, `.zona-btn`, `.chips` del Paso 1) solo si ya nada lo usa.
- [ ] **Step 4: verificar en Chrome** (servidor local y perfil limpio). Esperado:
  - **Primera visita:** el diálogo está abierto; la consola no tiene errores.
  - Responder y "Ver mi campo": se cierra, la tarjeta "Tu campo" muestra las respuestas y `localStorage['biosat.asistente.v1']` tiene `hecho:true`.
  - **Recarga:** no se abre solo. Con `?asistente=1` sí se abre y trae lo guardado.
  - Esc con el diálogo abierto lo cierra y guarda `hecho:true`.
  - **`localStorage` bloqueado** (arnés que lo reemplaza por uno que lanza error): la app carga, el asistente se abre y no hay errores.
  - Elegir la Zona 1 y dejar el riego sin responder deja `state.riego` en verdadero; responder "No" lo deja en falso.
  - `node --test tests/*.test.js` y `node --check web/app.js` pasan.
- [ ] **Step 5: commit** `git add web/index.html web/app.js web/estilos.css && git commit -m "Asistente de inicio conectado con la app; General Taboada pasa a la Zona 4"`.

### Task 4: Datos del mapa `data/santiago_mapa.json`

**Archivos:**
- Crear: `scripts/generar_mapa_santiago.py`, `data/santiago_mapa.json`, `tests/mapa-santiago.test.js`
- Modificar: `docs/contratos-de-datos.md` (agregar §9)

**Interfaces:**
- **Produce** `data/santiago_mapa.json`:
  `{meta:{fuente, licencia, url, generado_por, fecha, notas}, viewBox:[ancho, alto], departamentos:[{nombre, zona:1..5, origen:'punto'|'lista'|'cercana', d:"M…Z"}], puntos:{"1":{x,y},…,"5":{x,y}}}`. Las coordenadas ya vienen proyectadas al `viewBox` (longitud × cos 27,9°), así que la app dibuja sin hacer cuentas.

- [ ] **Step 1: `tests/mapa-santiago.test.js`:**
  - 27 departamentos, nombres únicos y `zona` entre 1 y 5.
  - Cada zona tiene al menos un departamento.
  - **El punto de cada zona cae dentro de un departamento de esa misma zona**, y el departamento de la Zona 4 que lo contiene es *General Taboada*. (La prueba hace punto-en-polígono sobre los trazos `d`.)
  - `origen` es uno de los tres valores permitidos; hay 5 `'punto'`, 15 `'lista'` y 7 `'cercana'`.
  - El archivo pesa menos de 80 KB y `meta` cita al IGN, geoBoundaries y la licencia CC BY 3.0 IGO.
- [ ] **Step 2: correr** esa prueba. Esperado: falla porque el archivo no existe.
- [ ] **Step 3: `scripts/generar_mapa_santiago.py`** (solo biblioteca estándar):
  - Baja `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/ARG/ADM2/geoBoundaries-ARG-ADM2_simplified.geojson` a una carpeta temporal.
  - Elige los 27 departamentos de Santiago del Estero por nombre y por ubicación (caja de la provincia, descartando homónimos como la "Capital" de Tucumán).
  - Asigna zona con la regla del diseño, en este orden: (1) el departamento que contiene el punto de NASA POWER de la zona; (2) el que ya nombra `ZONAS[...].deptos`; (3) la zona de punto más cercano al centro del departamento (centro en plano).
  - Simplifica los contornos con Douglas-Peucker (a mano) a un redondeo de 0,1 en el `viewBox`, proyecta y escribe el JSON.
- [ ] **Step 4: correr** el script y luego `node --test tests/*.test.js`. Esperado: la prueba nueva pasa. Si el archivo pasa de 80 KB, subir la tolerancia de simplificación.
- [ ] **Step 5: `docs/contratos-de-datos.md` §9:** formato del archivo, cómo se asigna cada departamento a una zona, la fuente y su licencia, y la aclaración de que es una aproximación y que el clima sale del punto de cada zona.
- [ ] **Step 6: commit** `git add scripts/generar_mapa_santiago.py data/santiago_mapa.json tests/mapa-santiago.test.js docs/contratos-de-datos.md && git commit -m "Datos del mapa de Santiago del Estero (IGN, 27 departamentos)"`.

### Task 5: Dibujar el mapa en la pantalla 1

**Archivos:**
- Modificar: `web/asistente.js`, `web/asistente.css`, `web/app.js`

**Interfaces:**
- **Usa:** `data/santiago_mapa.json` (Tarea 4) y `opciones.mapa` de la Tarea 2.

- [ ] **Step 1: `web/app.js`:** cargar `../data/santiago_mapa.json` con `.catch(() => null)` (como los otros archivos tolerantes) y pasarlo como `mapa` a `BioSatAsistente.abrir`.
- [ ] **Step 2: `web/asistente.js`:** en `.asist-mapa`, un SVG con un `<path>` por departamento pintado con el color de su zona, un círculo con el número de cada zona en su punto, la zona elegida resaltada (borde grueso y los demás departamentos más claros), y el pie con la fuente y la aproximación, desde `TEXTOS`: "Límites: IGN, vía geoBoundaries (CC BY 3.0 IGO). Las zonas se dibujan por departamento, en forma aproximada. El clima de cada una sale de un punto de NASA POWER." Tocar un departamento o un círculo elige la zona, igual que el botón, y los dos muestran la selección. El mapa tiene `role="img"` con una descripción; **los botones son lo accesible**.
- [ ] **Step 3: `web/asistente.css`:** cinco colores de zona como variables (claro y oscuro) que se distingan entre sí y con daltonismo. Validarlos con `scripts/validate_palette.js` de la skill `dataviz` (modo claro y oscuro) y ajustar los que fallen.
- [ ] **Step 4: verificar en Chrome.** Esperado:
  - 27 `<path>` y 5 círculos numerados; tocar un departamento de la Zona 4 marca el botón "Añatuya".
  - Sin `mapa` (archivo ausente) la pantalla 1 muestra solo los botones, sin errores.
  - A 360 px el mapa no pasa de `40vh` y no hay desborde; sin internet, se ve igual.
  - Captura del mapa y de la pantalla 1 en escritorio y en celular, para que Enzo las revise.
- [ ] **Step 5: commit** `git add web/asistente.js web/asistente.css web/app.js && git commit -m "Mapa real de Santiago del Estero en la pregunta 1"`.

### Task 6: El resto de la app, más fácil de entender

**Archivos:**
- Crear: `web/frases-logica.js`, `tests/frases-logica.test.js`
- Modificar: `web/index.html`, `web/app.js`, `web/estilos.css`

**Interfaces:**
- **Produce** (`window.FrasesLogica` y `module.exports`), todas devuelven `null` si falta algún dato:
  - `fraseCalor(pueblo, diasNormal, diasReciente)` → "En {pueblo}, los días de más de 40 °C pasaron de {A} a {B} por año."
  - `fraseMejorRotacion(nombre)` → "Para lo que elegiste, la primera opción es «{nombre}»."

- [ ] **Step 1: `tests/frases-logica.test.js`:** las dos frases con datos de ejemplo (con los números formateados como en `nf` de `app.js`), y `null` cuando falta el pueblo, un número o el nombre. Correr: falla.
- [ ] **Step 2: `web/frases-logica.js`** con las dos funciones y los textos en `TEXTOS`. Correr: pasa.
- [ ] **Step 3: frases en la página:** un `<p class="en-una-frase">` arriba del Paso 2 y del Paso 3, llenado desde `app.js` con `FrasesLogica` y los datos que ya calcula (`sum(cn, m => m.d40)` y `sum(cr, m => m.d40)`, y `ranking()[0]`). Si la frase es `null`, el `<p>` queda oculto.
- [ ] **Step 4: detalle técnico plegado:** envolver los paneles de suelo, satélite e IA, desmonte y sensor del Paso 2, la tabla de métodos y las reglas del motor en `<details class="detalle-tecnico"><summary>Ver el detalle técnico</summary>…</details>`, cerrados al cargar. No se borra nada ni se cambian los `id`.
- [ ] **Step 5: lectura cómoda en `web/estilos.css`:** tamaño base de 17 px, interlineado 1,55, áreas de toque de 44 px o más para botones, chips y enlaces de pasos, foco visible. **Sin tocar `kit.css`**. Reemplazar en lo que lee el productor "celda de NASA POWER (½° × ⅝°)", "rolo o sembradora de grano fino" y "Recuperar el suelo" por los textos simples del diseño; los términos técnicos quedan dentro de los detalles plegados.
- [ ] **Step 6: ficha de la zona en lenguaje simple:** en `renderZonas` (la parte de `#zonaFicha`), mostrar el pueblo, el nombre de la zona y el problema (`ZONAS[...].problema`); los departamentos y el punto de NASA POWER con coordenadas pasan a una línea chica dentro de un `<details>`. Los textos nuevos van en `TEXTOS`.
- [ ] **Step 7: verificar en Chrome.** Esperado: las dos frases aparecen con los números de `clima_zonas.json` y se ocultan si se pasa un dato faltante; los `<details>` arrancan cerrados y `#kit`, `#antes-de-decidir` y el visor siguen funcionando; a 360 px no hay desborde; `kit.html` se ve igual que antes. `node --test tests/*.test.js` pasa.
- [ ] **Step 8: commit** `git add web/frases-logica.js tests/frases-logica.test.js web/index.html web/app.js web/estilos.css && git commit -m "Frases simples, detalle tecnico plegado y lectura mas comoda"`.

### Task 7: Documentación y cierre

**Archivos:**
- Modificar: `docs/reglas-y-bitacora.md`, `planes/1-enzo.md`, `scripts/actualizar_readme.py`, `README.md`

- [ ] **Step 1:** bitácora **D-28**: sugerencias de la organización, asistente de 4 preguntas, mapa real con departamentos del IGN, corrección de General Taboada (Zona 2 → Zona 4) y el idioma como etapa siguiente.
- [ ] **Step 2:** en `planes/1-enzo.md`, sumar y tildar "Asistente de inicio", "Mapa de Santiago del Estero", "App más fácil de entender" y sumar sin tildar "Botón de idioma EN/ES".
- [ ] **Step 3:** en `DESCRIPCIONES` del README, `web/asistente-logica.js`, `web/asistente.js`, `web/asistente.css`, `web/frases-logica.js`, `data/santiago_mapa.json` y `scripts/generar_mapa_santiago.py`. Correr `python -X utf8 scripts/actualizar_readme.py`.
- [ ] **Step 4: verificación final.** `node --test tests/*.test.js` y `node --check` de los JS nuevos pasan; recorrido completo en Chrome (primera visita, recarga, `?asistente=1`, Esc, `localStorage` bloqueado, 360 px, sin internet) sin errores en la consola; `kit.html` y `campo.html` siguen abriendo.
- [ ] **Step 5: commit y push de la rama.** `git add -A docs planes scripts README.md && git commit -m "Documentacion del asistente y el mapa (D-28)" && git push origin enzo-app`. **No integrar a `main`: ofrecer el PR a Enzo.**
