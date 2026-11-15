# Diseño: botón de idioma ES/EN (D-35)

**Fecha:** domingo 15/11/2026, 11:20 · **Pedido de Enzo** · **Sugerencia de la organización de Space Apps** (D-28) · **Tamaño:** proyecto en 2 etapas. La etapa 1 tiene que estar antes del congelamiento (15:00).

## Por qué

Enzo: "Si bien nosotros elegimos algo para Santiago del Estero, esto debe poder verse en inglés". El objetivo es que alguien que no lee español, como un jurado internacional, entienda la app. Hoy toda la app está solo en español (`<html lang="es">`) y no hay nada en inglés.

## Objetivos

0. **Solo dos idiomas: español (el de siempre) e inglés.** No es un sistema para cualquier idioma (aclaración de Enzo).
1. Un botón `ES | EN` cambia el idioma sin recargar la página, así también funciona sin internet.
2. La app recuerda el idioma elegido.
3. Un link con `?lang=en` abre la app directo en inglés, para mandárselo a un jurado.
4. En inglés, lo que se ve primero queda completo: el asistente, el Inicio (con el pronóstico), la pantalla del kit, la guía del campo y el marco del Reporte (títulos, conclusiones, botones y navegación).
5. Los números y meses siguen el idioma: "33.7 °C" y "November" en inglés; "33,7 °C" y "noviembre" en español.

## Lo que no se hace (no-objetivos)

- **No es etapa 1:**
  - el cuerpo detallado del Reporte, que está escrito dentro de `app.js`;
  - los plegables "Para tu ingeniero";
  - la vista detallada (`completo.html`);
  - los textos largos de las rotaciones (evidencia, beneficios, riesgos y qué falta saber).

  Todo eso es la etapa 2.
- No se usa un traductor automático externo, porque necesita internet y no controlamos qué dice.
- No se traducen los nombres de lugar: Quimilí, La Banda y Río Dulce quedan iguales.

## Lo que haría fallar el trabajo aunque funcione (anti-objetivos)

- Que una pantalla en inglés parezca completa cuando no lo está. Lo que sigue en español tiene que avisarlo en inglés:
  - en el Reporte, "Some details of this report are still in Spanish.";
  - en la vista detallada, "This detailed view is only in Spanish for now.".
- Que la agronomía traducida se presente como revisada. Los nombres de las rotaciones en inglés son traducción del equipo, **pendiente de revisión de Vale**, y así queda anotado.
- Romper el español: con `ES`, la app tiene que verse exactamente como hoy.
- Chocar con D-33. Los textos en español no se mueven de su lugar.

## Restricciones

- JavaScript sin dependencias; lógica pura probada con `node --test`.
- Sin internet; nada externo.
- D-33 (que puede estar haciendo Vale) cambia textos de `inicio-logica.js`, `app.js` e `index.html`. Por eso el inglés vive en un archivo aparte y los textos en español quedan donde están.

## Formas consideradas

- **(1, elegida) Por etapas, el inglés en un archivo aparte:** primero lo que se ve primero, con aviso donde queda español. Llega antes de las 15:00.
- (2) Todo de una vez, con las 4.200 palabras de las rotaciones. Lleva 5 o 6 horas y no llega al congelamiento; además, la agronomía quedaría sin la revisión de Vale.
- (3) Traductor automático de Google. Se descartó porque necesita internet y traduce mal términos como "salitre" o "rastrojo". Va contra "nada falso".
- **Mecanismo (decisión del constructor):** cambiar los textos en el lugar y volver a dibujar, sin recargar la página. Recargar no funcionaría sin internet en GitHub Pages, porque la app no tiene un service worker.

## Diseño (etapa 1)

### A. Lógica del idioma: `web/idioma-logica.js` (pura, con pruebas)

- `elegirIdioma(search, guardado)`:
  - devuelve `'en'` si `search` trae `lang=en`, y `'es'` si trae `lang=es`;
  - si no trae ninguno, devuelve `guardado` cuando es `'es'` o `'en'`;
  - si no, devuelve `'es'`.
- `locale(idioma)`: `'en-US'` o `'es-AR'`.
- `fusionar(es, en)`: devuelve un objeto nuevo con la forma de `es` y los textos de `en` donde existen. Una clave que falta en `en` queda en español; nunca queda vacía ni `undefined`. Funciona con objetos y arreglos anidados.

### B. Diccionario: `web/textos-en.js`

- `window.TEXTOS_EN = {html: {...}, modulos: {...}, zonas: {...}, rotaciones: {...}, meses: [...], mesesCortos: [...]}`.
  - **`html`:** textos de los elementos marcados con `data-i18n="clave"` en el HTML (y `data-i18n-attr="aria-label:clave"` para atributos).
  - **`modulos`:** textos en inglés con las mismas claves que los objetos `TEXTOS` de `InicioLogica`, `PronosticoLogica`, `FrasesLogica` y el asistente, y que `TEXTOS_INICIO`, `TEXTOS_REPORTE`, `TEXTOS_CAMPO` y `TEXTOS_PASOS` de `app.js`.
  - **`zonas`:** `{zona_1_riego_salitre: {nombre, problema}, ...}`. Las localidades no cambian.
  - **`rotaciones`:** `{z2_actual: 'Soybean monoculture…', ...}`, solo nombres y por `id`. Si la rotación no está, su nombre queda en español.
- El archivo empieza con un comentario: "Los nombres de las rotaciones son traducción del equipo, pendiente de revisión de Vale".

### C. Cambio de idioma: `web/idioma.js` (navegador)

- **Al cargar:**
  - toma el idioma con `elegirIdioma(location.search, localStorage)`;
  - guarda una copia en español de cada objeto de textos;
  - si el idioma es `en`, aplica el inglés **antes del primer dibujo**.
- **Aplicar un idioma:**
  - en cada objeto de textos, reemplaza el contenido en su lugar con `fusionar(copiaES, EN)` (o con la copia en español);
  - hace lo mismo con los meses y con los nombres de zonas y rotaciones;
  - recorre los `[data-i18n]`: guarda el español en `data-es` la primera vez y pone el texto que corresponde;
  - pone `document.documentElement.lang`;
  - guarda el idioma en `localStorage` (`biosat.idioma`, dentro de try/catch);
  - avisa con el evento `biosat:idioma`, y cada página vuelve a dibujar: `app.js` llama a `renderTodo()` y redibuja el asistente si está abierto.
- **Los números** usan `locale(idioma)`: `nf` en `app.js` y en `kit.js` lee el idioma actual.
- **Botón:** `<div class="idioma" role="group" aria-label="Idioma / Language">` con dos botones, `ES` y `EN`, y `aria-pressed`. Va en:
  - la banda del Inicio, junto a "Cambiar";
  - la cabecera del Reporte, junto a "← Volver";
  - el asistente;
  - la barra de la pantalla del kit;
  - la guía del campo.

### D. Qué queda en inglés en la etapa 1

- **Asistente:** las 4 preguntas, los nombres y características de las zonas, y las prioridades.
- **Inicio:**
  - la banda del semáforo (`InicioLogica.TEXTOS`);
  - lo que mejor encaja y el nombre de la rotación;
  - las cifras, la tira de 12 meses y su leyenda;
  - la validación, la tarjeta del pronóstico, los botones, los avisos de la sonda y el texto de WhatsApp.
- **Reporte:**
  - el título y el subtítulo;
  - Guardar PDF y Compartir;
  - los chips de navegación;
  - los títulos de las 7 secciones y sus conclusiones (`TEXTOS_REPORTE` y `FrasesLogica`);
  - la tarjeta del pronóstico;
  - el aviso "Some details of this report are still in Spanish.".
- **Pantalla del kit** (`kit.html` y `kit.js`) y **guía del campo** (`campo.html`), completas.
- **Vista detallada:** si el idioma es `en`, muestra arriba el aviso "This detailed view is only in Spanish for now." y un link al Inicio.

### E. Etapa 2 (después, sin fecha)

- Sacar a claves los textos que quedan escritos dentro de `app.js` y traducirlos.
- Los plegables y la vista detallada.
- Los textos largos de las rotaciones, revisados por Vale.

## Pruebas

- **`tests/idioma-logica.test.js`:**
  - `elegirIdioma`: el parámetro gana sobre lo guardado; un valor guardado inválido da `'es'`;
  - `locale`;
  - `fusionar`: una clave que falta queda en español, se respetan los anidados y arreglos, y no se modifica el original.
- **`tests/textos-en.test.js`:**
  - cada clave de `html` existe como `data-i18n` en alguna página, y cada `data-i18n` tiene su traducción, así no hay huecos ni sobras;
  - cada clave de `modulos.*` existe en el objeto en español correspondiente, para no traducir algo que no existe;
  - cada `id` de `rotaciones` existe en `data/rotaciones_santiago.json`;
  - ningún texto en inglés está vacío.
- **Capturas a 390 y 1440 px** de la Zona 2 en inglés: Inicio, Reporte, asistente, kit y campo. El ancho de pantalla tiene que coincidir con el del contenido y no tiene que haber errores de JS.
- **Con `ES`, las 130 pruebas actuales siguen pasando** y las capturas se ven iguales que hoy.

## Coordinación con D-33

En el plan de D-33 (`docs/superpowers/plans/2026-11-15-app-sin-datos-falsos.md`) se suma un paso: si cambiás un texto en español que tiene su traducción en `web/textos-en.js`, actualizá también el inglés.

## Lo que queda a criterio de quien lo construye

- Las palabras exactas de cada traducción, cuidando que se lean simples, como en español.
- Las clases de CSS del botón.
- El orden de carga de los scripts (`idioma-logica.js`, `textos-en.js` e `idioma.js` van antes de `app.js`).
