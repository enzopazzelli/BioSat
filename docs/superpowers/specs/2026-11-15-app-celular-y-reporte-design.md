# Diseño: app para el celular (Inicio simple) y reporte completo

**Fecha:** 15/11/2026, madrugada · **Rama:** `enzo-app` (copia de trabajo `../BioSat-app`) · **Pedido por:** Enzo, con aportes de Sara, Val y una productora consultada por Sara · **Maquetas:** https://claude.ai/artifact/2JyKEp1U46KhQXMCiM2ZSz (elegidas: "B · ELEGIDA" y "Reporte · ELEGIDO")

## 1. Por qué

Le dijeron a Enzo que la web tiene muchos datos juntos y que puede confundir. Hoy es una sola página larga con 5 pasos: calendario, cifras clave, visor, sensor, detalle técnico, 3 tarjetas de rotación, simulador y lista para el agrónomo. Enzo quiere algo **de calidad visual, simple y pensado para el celular**, que no pierda calidad de datos, y un **reporte completo** para profundizar, exportar y compartir.

**Quién lo usa:** el productor de Santiago del Estero, desde el celular. El reporte también lo lee el productor, que actúa o se lo pasa a su ingeniero o asesor.

**Lo que tiene que llevarse en 30 segundos** (Sara y la productora consultada, con el acuerdo de Val y Enzo):
1. Un **semáforo** grande que diga si su suelo está bien o en riesgo.
2. **Qué le conviene sembrar.**
3. Un botón **"Medir con la sonda"**.

Antes de eso, la persona **configura su campo** con el asistente de 4 preguntas que ya existe (Val).

## 2. Objetivos, no objetivos y lo que lo haría fracasar

**Objetivos**
1. **Una pantalla de Inicio** con las 3 cosas, legible al sol y con una mano.
2. **Un Reporte completo** en una sola página, con las secciones abiertas, para guardar como PDF y compartir.
3. **Que todo lo que se muestra salga de los datos**, con su fuente y su confianza, igual que hoy.
4. **La primera pregunta del asistente nombra la zona por su característica**, no por una ciudad.

**No objetivos**
- El botón EN/ES (etapa siguiente).
- Cambiar `kit.html` y `campo.html`.
- Cambiar los datos, que son otro trabajo (rama `santi-datos-ia`).
- Meteomatics (D-29).

**Lo que lo haría fracasar aunque funcione**
- Que el Inicio vuelva a llenarse de datos.
- Un semáforo que parezca medir el lote cuando muestra lo típico de la zona.
- Un "Sembrá X" que suene a orden: la app apoya y no reemplaza al ingeniero, y las zonas 1 a 4 todavía no están validadas.
- Perder lo que hoy funciona: el motor, el simulador, el visor, la sonda, el uso sin internet y las 71 pruebas.

## 3. Formas de hacerlo (elegida: A)

| | Cómo | A favor | En contra |
|---|---|---|---|
| **A · elegida** | Una sola página con dos vistas: Inicio y Reporte (`#reporte`) | Reusa el motor, el calendario, el simulador, el visor y el lector; los datos cargan una vez; anda sin internet; el PDF imprime solo la vista Reporte | `app.js` crece y hay que ordenarlo |
| B | Dos páginas (`index.html` y `reporte.html`) | Código más separado | Cada una carga los datos y hay que pasar la zona y las respuestas entre ambas; más puntos de falla |
| C | Solo cambiar estilos y plegar lo que hay | Rápido | No resuelve "mucha información" |

Enzo eligió la A el 15/11.

## 4. Diseño

### 4.1 Recorrido

1. **Primera vez:** el asistente de 4 preguntas (como hoy, con la pregunta 1 corregida, ver 4.5) y después el Inicio.
2. **Las siguientes veces:** directo al Inicio, con las respuestas guardadas. "Cambiar" reabre el asistente.
3. **Del Inicio, "Ver el reporte completo"** lleva a la vista Reporte (`#reporte`); "← Volver" regresa.
4. **Los cambios de zona, prioridades o escenario** se reflejan en las dos vistas.

### 4.2 Inicio (maqueta "B · ELEGIDA")

De arriba abajo, en una columna de hasta 560 px (en una computadora queda centrada):

1. **Banda del semáforo**, que ocupa todo el ancho con el color del nivel:
   - Arriba: "Tu campo · Zona N", el **nombre de la zona en grande** (Barlow, unos 28 px), sus localidades y el botón **Cambiar**.
   - El nivel: **ícono + palabra grande** (BIEN / ATENCIÓN / CUIDADO). Nunca solo el color.
   - El rótulo de la fuente: "Tu zona en {mes}" o, si se midió, "Tu lote, medido hoy".
   - La **razón** en una frase.
   - La **acción** en una caja oscura, en una frase.
2. **Lo que mejor encaja en tu campo:**
   - El nombre de la rotación en grande.
   - Dos cifras: **Próxima siembra** (el mes) y **Meses de suelo pelado** ("2 → 0", lo de hoy contra la propuesta).
   - La **tira de 12 meses**: "Hoy" contra la propuesta, con los colores de cultivo, cobertura, rastrojo y pelado, y el mes actual marcado.
   - El estado de validación ("Revisada por un productor de la zona" o "Todavía sin validar en la zona").
3. **Barra al pie, fija:**
   - **Medir con la sonda** (principal) y **WhatsApp**.
   - Debajo, el enlace **Ver el reporte completo →** y la línea "Apoya, no reemplaza, el criterio de tu ingeniero".

### 4.3 El semáforo (opción C)

- **El mes actual** es el del celular (`new Date().getMonth()`). El semáforo del Inicio **no cambia con el simulador**: muestra lo típico, sin escenarios.
- **Antes de medir, lo típico de la zona en el mes actual:**
  - **Datos:** el período reciente (2021-2025) de `clima_zonas.json` y `fraccion_pelado` de `diagnostico_landsat_ia.json`. Si falta esa fracción, la señal se omite.
  - **Señales**, cada una vale 0, 1 o 2:

| Señal | 0 · bien | 1 · atención | 2 · cuidado |
|---|---|---|---|
| Falta de agua (ET0 − lluvia, mm del mes) | < 50 | 50 a 100 | > 100 |
| Días de más de 35 °C | < 5 | 5 a 10 | > 10 |
| Días con helada (`helada3`) | < 2 | 2 a 5 | > 5 |
| Lotes con suelo pelado (fracción) | < 0,25 | 0,25 a 0,5 | ≥ 0,5 |

  - **Nivel:** el máximo de las señales (0 BIEN, 1 ATENCIÓN, 2 CUIDADO).
  - **Razón:** las señales en 1 o 2, de mayor a menor y hasta 2, con frases fijas que llevan los números reales ("faltan unos 90 mm", "unos 8 días de más de 35 °C", "casi 4 de cada 10 lotes con el suelo pelado").
  - **Acción:** la de la señal más alta (agua o pelado: cubrir el suelo; calor: cuidar la cobertura y no sembrar en los días más fuertes; helada: cuidar los cultivos sensibles). Si está en BIEN: "Buen momento para planificar la próxima siembra".
  - **Cómo se calcula:** los umbrales y el método se explican en el Reporte (sección 7) como **criterio del equipo**, no como norma agronómica.
- **Después de medir con la sonda**, el nivel sale de la lectura del kit (`semaforo`: verde, amarillo o rojo, como ya lo calcula el sketch):
  - El rótulo cambia a **"Tu lote, medido hoy"**.
  - La razón sale de esa lectura: temperatura del suelo y humedad o conductividad.
  - Si la lectura no trae `semaforo`, se mantiene el de la zona.

### 4.4 "Lo que mejor encaja"

- **Es la primera de `ranking()`**, el motor actual, con las prioridades del asistente. No hay un motor nuevo.
- **Si la primera es la rotación de hoy:** "Tu rotación de hoy ya es la que mejor encaja", y la tira muestra solo "Hoy".
- **Próxima siembra:** el cultivo de su `secuencia` cuyo `siembra_mes` llega antes, contando desde el mes actual (el mes actual incluido), y en forma circular.
- **Meses de suelo pelado:** se cuentan los `desnudo` del `calendario` de la rotación de hoy y de la propuesta.
- **Redacción:** nunca "Sembrá X". Se dice "Lo que mejor encaja" más "Próxima siembra".

### 4.5 Asistente, pregunta 1

- **Cada botón de zona:** arriba, en negrita, la **característica** (`ZONAS[z].nombre`, por ejemplo "Área de riego del Río Dulce"); abajo, más chico, sus **localidades** (`ZONAS[z].zona`, "La Banda · Robles · Beltrán").
- **Ayuda:** "Tocá tu zona, o el color en el mapa."
- **Resumen** (pregunta 4) y "Tu campo": "Zona {num} · {nombre de la zona}".

### 4.6 Reporte (maqueta "Reporte · ELEGIDO")

Es una sola página con las secciones abiertas.

**Arriba:**
- "← Volver".
- "Reporte de tu campo", la zona, lo que tiene el campo y el mes y año.
- **Guardar PDF** y **Compartir**.
- Accesos rápidos en fila (chips) a cada sección.

**Las 7 secciones.** Cada una empieza con un **título que es la conclusión**, calculada con datos como en `frases-logica.js`, y termina con un plegable **"Para tu ingeniero: fuentes y confianza"**:

1. **Tu año, mes a mes:** el calendario actual (calor, heladas, lluvia, suelo pelado), la tabla y el cambio de período.
2. **Tu rotación y 2 alternativas:** las 3 tarjetas actuales (por qué, evidencia, beneficios, qué falta saber y riesgos), "lo que se gana y lo que se paga" y cómo ordena BioSat.
3. **¿Y si el clima viene peor?:** el simulador actual.
4. **Tu suelo y tu monte, desde el satélite:**
   - suelo con su rango y su confianza;
   - suelo pelado por mes;
   - presión de desmonte;
   - zonificación;
   - visor Landsat.

   Usa los campos nuevos de los datos reales cuando estén (`rango_p10_p90`, `meses_dudosos`, `riesgo_n`, `temporal`) y funciona con los viejos.
5. **Lo que midió la sonda:** el panel actual del sensor y el enlace a la pantalla del kit.
6. **Para charlar con tu ingeniero:** la lista actual, con "Copiar la lista".
7. **De dónde salen los datos:** las fuentes, qué es real y qué es de ejemplo, cómo se calcula el semáforo y el enlace a `docs/datos-y-metodos.md` cuando exista.

**Exportar y compartir:**
- **Guardar PDF:** `window.print()` con una hoja de estilos de impresión que muestra solo el Reporte, en una columna, con los plegables abiertos, sin barra fija ni botones y con cortes de página entre secciones.
- **Compartir:** `navigator.share` con el título y el enlace, si está disponible; si no, copia el enlace y avisa "Enlace copiado".

### 4.7 WhatsApp

- **El texto se arma con los datos:** "BioSat · {zona} · {mes}: {NIVEL} ({razón corta}). Lo que mejor encaja: {rotación} (próxima siembra: {mes}). Revisalo con tu ingeniero. {enlace a la app}".
- **Cómo se manda:** con `https://wa.me/?text=…` en una pestaña nueva. Si hay `navigator.share`, se ofrece ese menú, que también incluye WhatsApp.

### 4.8 Sonda

- **"Medir con la sonda"** usa el lector actual (`window.BioSatArduino`).
- **Si el navegador no puede leer el USB:** explica "Este celular o navegador no puede leer la sonda por USB: usá Chrome o Edge en una computadora", y ofrece abrir `kit.html`.
- **Si hay lecturas grabadas** en `arduino_bandejas_demo.json`, se pueden mostrar marcadas como "grabadas".

### 4.9 Código

- **Lógica nueva, pura y con pruebas:** `web/inicio-logica.js` (`window.InicioLogica` y `module.exports`, como `frases-logica.js`):
  - `semaforoZona(mes, datosMes, fraccionPelado)` → `{nivel, senales, razon, accion}`;
  - `semaforoSonda(lectura)` → `{nivel, razon}` o `null`;
  - `proximaSiembra(secuencia, mesActual)` → `{cultivo, mes}`;
  - `mesesPelados(calendario)` → número;
  - `textoWhatsApp(datos)` → texto.

  Todos los textos van en `TEXTOS`, con claves.
- **`web/index.html`:** se reorganiza en `<section id="inicio">` y `<section id="reporte">`. Los bloques actuales pasan dentro del Reporte, con sus mismos `id`, así los `render…()` siguen andando.
- **`web/app.js`:**
  - Suma `renderInicio()` y la navegación entre vistas (con `hashchange`, para que "atrás" del celular vuelva al Inicio).
  - Los títulos-conclusión de cada sección.
  - "Compartir" y el WhatsApp.
- **`web/estilos.css`:**
  - Estilos del Inicio (banda, tira de meses y barra fija).
  - Estilos del Reporte (chips y secciones).
  - `@media print`.
- **Los colores siguen los tokens actuales**, con dos agregados:
  - `--sem-bien`, `--sem-atencion`, `--sem-cuidado`, para el fondo de la banda;
  - `--sem-tinta`, para el texto sobre la banda, con contraste de 4,5:1 o más.
  - El modo oscuro se mantiene.
- **`web/asistente.js`:** la pregunta 1 y el resumen (4.5).

### 4.10 Pruebas

- **Nuevas en Node** (`tests/inicio-logica.test.js`):
  - umbrales del semáforo, con casos de la Zona 5 en noviembre (ATENCIÓN), octubre (CUIDADO) y abril (BIEN), tomados de los datos reales;
  - una señal sin dato se omite;
  - la sonda manda sobre la zona;
  - la próxima siembra es circular (en noviembre, con siembras en marzo y noviembre, da noviembre);
  - el conteo de meses pelados;
  - el texto de WhatsApp, sin `undefined` y con el enlace;
  - el asistente muestra el nombre de la zona y no el pueblo en la pregunta 1.
- **Las 71 actuales siguen en verde.**
- **Revisión a mano en el navegador:**
  - a 390 px y en una computadora;
  - sin internet;
  - con modo oscuro;
  - imprimir a PDF;
  - "atrás" del celular.

## 5. Restricciones

- **Mismas reglas:** sin números escritos a mano en la interfaz, datos faltantes como "sin dato", textos en lenguaje simple y con claves, y funciona sin internet (el WhatsApp y Compartir necesitan conexión: si no hay, avisan).
- **Sin librerías nuevas:** se mantiene HTML, CSS y JS sin compilación.
- **Tiempos:** congelamiento el domingo a las 15:00 y entrega a las 19:00. El Inicio va primero, el Reporte reorganizado después y el PDF al final.

## 6. Lo que queda para quien construye

- El orden interno de `app.js`, los nombres de las clases CSS y cómo se resuelve la barra fija con el teclado abierto.
- Los textos exactos de razón y acción, siguiendo el tono de las maquetas.
- **Decisiones que tomé yo (Enzo las puede cambiar):**
  - los umbrales del semáforo (tabla de 4.3);
  - el período reciente (2021-2025) como "lo típico";
  - la redacción "Lo que mejor encaja" en vez de "Sembrá";
  - el WhatsApp con wa.me;
  - las secciones del Reporte en el orden de 4.6.
