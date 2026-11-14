# Diseño: asistente de inicio y mapa de Santiago del Estero

**Fecha:** 14/11/2026 · **Responsable:** Enzo (`enzo-app`) · **Estado:** aprobado por Enzo en la conversación (formato del asistente, mapa y orden de trabajo)

## Por qué

Una persona de la organización de la NASA Space Apps vio la app y dejó dos sugerencias:

1. **Botón de idioma EN/ES** en toda la app.
2. **Que el Paso 1 sea más intuitivo y simule un mapa de Santiago del Estero, pensado para gente grande.** Dijeron que el gráfico no se entendía, sugirieron un asistente que vaya configurando la app, y que todo lo que tiene la app puede ser difícil de entender: hay que mejorar las visuales y hacerla más fácil y amena.

**Este documento cubre el punto 2** (asistente, mapa y simplificación del resto de la app). El idioma se diseña después, en un documento aparte, porque reescribir los textos del Paso 1 antes de traducirlos evita traducir dos veces. Para que el idioma sea fácil más adelante, **todos los textos nuevos se escriben ya en un diccionario con claves** (ver "Restricciones").

**Quién usa la app:** un productor o una productora de Santiago del Estero, de edad avanzada, que la abre por primera vez, probablemente en el celular, y no sabe leer un mapa técnico. También el jurado, que la ve en una pantalla grande en unos minutos.

## Qué tiene que hacer

### 1. Asistente de inicio (4 pantallas)

Una ventana que ocupa toda la pantalla, **una pregunta por pantalla**, con una barra de avance arriba (**"Pregunta N de 4"**, no "Paso": la página principal ya tiene sus Paso 1 a 5 y no deben confundirse) y los botones "← Atrás" y "Siguiente →".

| # | Pantalla | Qué se responde | Cuánto se puede saltear |
|---|---|---|---|
| 1 | **¿Dónde queda tu campo?** | La zona (1 de 5), con el mapa y 5 botones por pueblo | Obligatoria, pero con una zona ya elegida (Zona 2) |
| 2 | **¿Qué tenés en tu campo?** | Riego, hacienda, sembradora o rolo: tarjetas de sí o no con ícono y una frase simple | Se puede saltear |
| 3 | **¿Qué te preocupa más?** | Hasta 3 de 5 temas, con ícono | Se puede saltear |
| 4 | **Esto es lo que entendimos** | Resumen de lo elegido y botón **"Ver mi campo →"** | — |

Textos de la pantalla 2, sin jerga:
- **Riego** · "agua para regar los cultivos".
- **Hacienda** · "vacas, cabras u otros animales".
- **Sembradora o rolo** · "para sembrar sin arar". (Es lo que hoy dice "rolo o sembradora de grano fino".)

Temas de la pantalla 3 y a qué prioridad de la app corresponden (los `id` no cambian):

| Texto en el asistente | `id` | Texto actual en la app |
|---|---|---|
| Ahorrar agua | `agua` | Ahorrar agua |
| Frenar el salitre | `salitre` | Frenar el salitre |
| Cuidar el suelo | `suelo` | Recuperar el suelo |
| Tener más pasto | `forraje` | Sumar forraje |
| Que rinda en plata | `ingreso` | Ingreso este año |

**Comportamiento:**
- Aparece **solo la primera vez**. Las respuestas se guardan en el navegador y la próxima vez no vuelve a aparecer.
- Siempre hay **"Saltar"** (cierra con las respuestas que haya hasta ese momento; si no se eligió nada, queda la Zona 2 y las prioridades de siempre) y, desde la página principal, **"Cambiar mis respuestas"** (vuelve a abrir el asistente con lo guardado).
- Al terminar o saltar, la página queda en el calendario del lote, ya configurada.
- **Qué se guarda** (clave `biosat.asistente.v1`): `{v:1, zona, riego, ganado, maq, prio, hecho}`. `zona` es un `id` de zona; `riego`, `ganado` y `maq` son verdadero, falso o `null` (sin responder); `prio` es una lista de `id` con **máximo 3**; `hecho` es verdadero cuando el asistente se cerró.
- **`hecho` pasa a verdadero** al tocar "Ver mi campo", "Saltar" o la tecla Esc (que equivale a "Saltar"). Con `hecho` verdadero el asistente no vuelve a abrirse solo. **"Cambiar mis respuestas" lo abre igual**, en la pregunta 1, con lo guardado. Para demos y pruebas, abrir la página con **`?asistente=1`** lo fuerza.
- **Datos viejos o rotos:** si no se puede leer el JSON, falta una clave o la zona no existe, se usan los valores por defecto (Zona 2) y se ignora lo inválido, sin error. Los `id` de prioridad desconocidos se descartan.
- **Cómo se conecta con la app que ya existe:** `state.zona`, `state.riego`, `state.ganado`, `state.maq` y `state.prio` son los mismos que hoy, y el motor ya acepta **varias prioridades a la vez** (`puntaje()` suma las elegidas y `ranking()` ordena): no cambia nada del motor.
- **Riego:** hoy elegir la Zona 1 pone `riego` en verdadero por defecto. En el asistente, la pregunta de riego **empieza con ese valor de la zona** y **la respuesta de la persona manda**: si respondió, se respeta aunque cambie de zona; si no respondió (`null`), vale el de la zona.
- Si el navegador no deja guardar (ventana privada, bloqueo), todo funciona igual pero el asistente aparece en cada visita. Nunca da error.
- Se puede usar con el teclado (Tab, Enter, Esc para saltar) y con lector de pantalla: es un diálogo con título, foco que no se escapa y botones con nombre.
- Letra del asistente de **al menos 18 px**, botones de **al menos 48 px de alto**, contraste suficiente, sin depender solo del color.
- A **360 px** de ancho no hay desborde horizontal. A partir de 700 px de ancho, el mapa va a la izquierda y los botones a la derecha; por debajo, el mapa arriba (con altura máxima) y los botones debajo.
- Funciona **sin internet**.

### 2. Mapa de Santiago del Estero

El mapa de la pantalla 1 es el **contorno real de la provincia con sus 27 departamentos**, pintados con el color de la zona de BioSat a la que pertenecen. Encima, un círculo con el número de cada zona (en el punto de NASA POWER) y, al lado, **5 botones grandes** con el nombre del pueblo de cada zona:

| Zona | Pueblo (letra grande) | Nombre de la zona (debajo, el que ya usa la app en `ZONAS[...].nombre`) |
|---|---|---|
| 1 | La Banda | Área de riego del Río Dulce |
| 2 | Quimilí | Secano agrícola del este |
| 3 | Campo Gallo | Chaco semiárido norte |
| 4 | Añatuya | Bajos submeridionales |
| 5 | Ojo de Agua | Sur serrano y salinas |

No se inventan nombres nuevos: los nombres de zona son los que ya están en la app, la ficha y el contrato.

Se elige tocando el color del mapa o el botón: las dos formas hacen lo mismo y la zona elegida se ve resaltada en las dos. **Los botones son lo que usan los lectores de pantalla**; el mapa no tiene que ser accesible por sí solo.

**De dónde salen los datos del mapa:**
- Límites de departamentos: **geoBoundaries ARG ADM2, año 2020, que a su vez es del Instituto Geográfico Nacional (IGN)**, licencia CC BY 3.0 IGO. Hay que **citar la fuente en el mapa** ("Límites: IGN, vía geoBoundaries (CC BY 3.0 IGO)").
- Se genera una vez con un script (`scripts/generar_mapa_santiago.py`, que corre Enzo con internet; solo se sube el resultado). Descarga `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/ARG/ADM2/geoBoundaries-ARG-ADM2_simplified.geojson`, usa solo la biblioteca estándar de Python y simplifica los contornos con Douglas-Peucker hecho a mano. Se guarda como `data/santiago_mapa.json` (contrato §9, a agregar). La app **no** baja nada de internet para dibujarlo.
- El archivo original pesa 5,5 MB y trae todo el país: **no se sube al repositorio**. El script lo baja, selecciona los 27 departamentos de Santiago del Estero (por nombre y ubicación, descartando los homónimos de otras provincias, como "Capital" de Tucumán), simplifica los contornos y escribe un JSON chico (objetivo: **menos de 80 KB**).

**Cómo se asigna cada departamento a una zona** (decisión de este diseño, a documentar en el contrato). Se aplica la primera regla que corresponda:

1. **El departamento que contiene el punto de NASA POWER de una zona es de esa zona** (5 departamentos). Así el pueblo del botón siempre cae sobre un departamento de su mismo color. Esto **corrige un error de la lista actual**: `ZONAS` pone a *General Taboada* en la Zona 2, pero el punto de la Zona 4 (Añatuya, su cabecera) cae dentro de General Taboada. Pasa a la **Zona 4**, y se corrige el texto de `deptos` en `app.js`.
2. Si no, el departamento va a la zona que ya lo nombra en `ZONAS[...].deptos` (15 departamentos).
3. Si no, va a la **zona cuyo punto de NASA POWER esté más cerca** del centro del departamento (7 departamentos: Jiménez, Loreto y Río Hondo → Zona 1; Avellaneda, Salavina y Sarmiento → Zona 4; Atamisqui → Zona 5). *Quebrachos* figuraba en las zonas 4 y 5 a la vez; se saca de la lista de la Zona 4 y queda en la 5 por lista.

Cada departamento guarda de dónde salió su asignación (`"punto"`, `"lista"` o `"cercana"`). El centro se calcula en plano (longitud y latitud), sin librerías.
- **El mapa es una aproximación y lo dice:** "Las zonas se dibujan por departamento, en forma aproximada. El clima de cada una sale de un punto de NASA POWER." El dato de clima no cambia: sigue saliendo del punto de cada zona.

### 3. El resto de la app, más fácil de entender

Cambios acotados, que se pueden verificar:

1. **Una frase simple al comienzo de cada paso (2 a 5)** que resume lo importante, **calculada con los datos de la app, nunca escrita a mano con números**. Por ejemplo, el Paso 2: "En {pueblo}, los días de más de 40 °C pasaron de {A} a {B} por año." Paso 3: "Para lo que elegiste, la primera opción es «{nombre de la rotación}»." (sale de `ranking()[0]`, que ya existe) Si falta el dato, la frase no aparece.
2. **Detalle técnico plegado.** Lo que hoy compite con lo importante (paneles de suelo, satélite e IA, desmonte y sensor; tablas de métodos; reglas del motor) queda dentro de un "Ver el detalle técnico" que arranca cerrado. Nada se borra.
3. **Paso 1 de la página principal:** el bloque actual (mapa chico, lista de zonas, prioridades, interruptores y ficha) se reemplaza por una tarjeta **"Tu campo"** con lo elegido (zona, pueblo, qué tenés, qué te preocupa) y el botón "Cambiar mis respuestas". Sigue la ficha de la zona, escrita en lenguaje simple.
4. **Lenguaje:** se reemplazan términos como "celda de NASA POWER (½° × ⅝°)", "rolo o sembradora de grano fino" y "Recuperar el suelo" donde aparezcan en lo que lee el productor. Los términos técnicos quedan en el detalle plegado.
5. **Lectura más cómoda:** tamaño de letra base de **17 px** (hoy 15), interlineado 1,55, áreas de toque de al menos 44 px, foco visible. El cambio es de `estilos.css`, que usan la app y la guía del campo (que ya fija sus propios tamaños); **la pantalla del kit tiene su propio `kit.css` y no se toca**.

## Qué no hace

- **No agrega el idioma EN/ES.** Es la tercera etapa y tiene su propio diseño. Esta etapa solo deja los textos nuevos listos para traducir.
- No cambia el motor de reglas, los puntajes, los contratos de clima, suelo, diagnóstico, rotaciones o Arduino.
- No agrega datos nuevos ni números nuevos.
- No cambia la pantalla del kit ni la guía "Del kit al campo".
- No hay cuentas, registro ni envío de datos a ningún servidor.

## Qué sería un fracaso (aunque funcione)

- Que una persona grande siga sin entender qué elegir en la primera pantalla.
- Que el asistente tape o esconda el "apoya, no reemplaza" y la incertidumbre: **la app tiene que seguir siendo honesta**.
- Que aparezca un número inventado o un mapa que parezca más exacto de lo que es.
- Que la app deje de funcionar sin internet, o que el asistente trabe la demo del jurado (el asistente se puede saltear con una tecla y un clic).
- Tratar a la persona con condescendencia: el tono es respetuoso y directo, en "vos".

## Restricciones

- App estática (HTML y JavaScript sin proceso de compilación) y sin internet. Sin librerías nuevas.
- **Textos listos para traducir:** todo texto nuevo vive en un objeto `TEXTOS` con claves (no escrito suelto dentro del código ni del HTML), agrupado por pantalla. El idioma, más adelante, solo agrega las traducciones.
- **Íconos:** SVG propios dentro del código (monocromáticos, trazo simple), no emojis. Los emojis se ven distinto en cada celular y en algunos Android viejos no aparecen. Ícono para riego, hacienda, sembradora, agua, salitre, suelo, pasto y plata.
- **Lógica sin interfaz** en un archivo aparte (`web/asistente-logica.js`, que se usa en el navegador y en las pruebas de Node), como se hizo con `kit-logica.js`.
- **Guardado:** una sola clave en `localStorage`, `biosat.asistente.v1`, con `{zona, riego, ganado, maq, prio, hecho}`. Todo acceso a `localStorage` va dentro de `try/catch`.
- Los `id` de zonas (`zona_1_riego_salitre`…) y de prioridades (`agua`, `salitre`, `suelo`, `forraje`, `ingreso`) no cambian.
- Sin números inventados. Nada de sacar de la app las advertencias de confianza.
- Commits sin la línea `Co-Authored-By`, como en el resto del proyecto.

## Formas de construirlo

### Formato del asistente (se mostró con bocetos)

| Opción | A favor | En contra |
|---|---|---|
| **A · Una pregunta por pantalla (elegida)** | **Letra y botones enormes, una sola decisión a la vez, barra de avance** | **3 o 4 pantallas antes de ver el calendario** |
| B · Las 3 preguntas en una página | Más rápido | Es la misma sensación de "mucho a la vez" que hoy |
| C · Como una charla | Cercano | Cuesta más hacerlo bien y accesible, y traducirlo |

### Mapa

| Opción | A favor | En contra |
|---|---|---|
| A · Zonas de colores, se toca el color | Muestra hasta dónde llega cada zona | Hay que "leer" un mapa |
| B · Mapa gris y 5 pueblos | Más limpio | No muestra el alcance de cada zona |
| **C · Mapa de colores y 5 botones por pueblo (elegida)** | **Se puede elegir por nombre sin leer el mapa; el mapa sigue ahí** | **Ocupa más lugar; en el celular los botones van debajo** |

### Dónde vive el asistente

| Opción | A favor | En contra |
|---|---|---|
| **Ventana a pantalla completa dentro de la misma página (elegida)** | **Ya tiene los datos cargados; no hay otra página que mantener; se salta con un clic** | **Hay que cuidar el foco y el teclado** |
| Página aparte (`inicio.html`) | Más simple de aislar | Otra página para mantener, traducir y probar; hay que pasar las respuestas a la app |
| Bloque dentro del Paso 1 que se despliega | Sin ventana | No resuelve que el Paso 1 hoy es denso |

### Cómo se obtiene el mapa

| Opción | A favor | En contra |
|---|---|---|
| **Generar una vez un JSON chico con un script (elegida)** | **Sin internet, liviano, reproducible, con la fuente citada** | **Un script y un contrato más** |
| Bajar el GeoJSON del país al abrir la app | Cero preparación | 5,5 MB, necesita internet, rompe el modo sin conexión |
| Dibujar el contorno a mano | Rápido | Inexacto y sin fuente: parece más preciso de lo que es |

## Orden de trabajo (decidido)

1. **Asistente** (con su lógica y pruebas).
2. **Mapa** (script, datos y dibujo).
3. **Simplificación del resto** (frases, detalle plegado, lectura cómoda).
4. **Idioma EN/ES**, con diseño propio. Las rotaciones de Vale en inglés pasan por su revisión.

Cada etapa queda publicada y funcionando por separado. Para el congelamiento del domingo a las 15:00 alcanzan las etapas 1 a 3.

## Cómo se verifica

- **Cómo se corren:** `node --test tests/*.test.js` (no hay `package.json`; Node 22). Chrome sin ventana con `chrome.exe --headless=new --virtual-time-budget=15000 --dump-dom URL` contra un servidor local (`python -m http.server`).
- **Pruebas de Node** para la lógica del asistente: guardar y leer respuestas (incluyendo `localStorage` bloqueado o con datos viejos o rotos), máximo de 3 temas, zona inválida, resumen, "Saltar".
- **Pruebas de Node** para los datos del mapa: 27 departamentos, cada zona con al menos uno, todos los `id` de zona válidos, tamaño menor a 80 KB, contornos válidos, **y que el punto de cada zona caiga en un departamento de esa misma zona**.
- **Chrome sin ventana**, en una copia descartable: primera visita (aparece), segunda (no aparece), "Cambiar mis respuestas", `localStorage` bloqueado, tecla Esc, 360 px sin desbordes, sin internet.
- **Capturas** del asistente y del mapa para que Enzo las revise antes de integrar a `main`.

## Lo que queda a criterio de quien construye

- Dibujo exacto de los íconos y animaciones de transición (con `prefers-reduced-motion` respetado).
- Nivel de simplificación de los contornos, mientras el archivo quede por debajo de 80 KB y la provincia se reconozca.
- Colores definitivos de las 5 zonas, mientras se distingan entre sí y con daltonismo (se valida con el script de la skill `dataviz`).
- Redacción final de las frases simples, mientras salgan de los datos y mantengan el tono.
