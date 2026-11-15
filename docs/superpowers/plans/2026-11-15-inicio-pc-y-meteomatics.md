# Inicio en la PC y pronóstico de Meteomatics: plan de implementación (D-34)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que el Inicio se vea como pantalla de compu desde 1024 px y que el Inicio y el Reporte muestren el pronóstico de Meteomatics de los próximos días, con su vencimiento y una actualización diaria.

**Architecture:** el cálculo vive en un módulo puro nuevo, `web/pronostico-logica.js` (`window.PronosticoLogica` y `module.exports`, igual que `inicio-logica.js`), probado con `node --test`. `app.js` carga el JSON, lo pasa a la lógica y arma la tarjeta en dos lugares. Las dos columnas salen de un solo `@media` en `estilos.css`. La actualización diaria es un workflow de GitHub Actions que corre el script de Santi con un secreto.

**Tech Stack:** HTML, CSS y JS sin dependencias; `node --test`; Python 3 de la biblioteca estándar; GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-15-inicio-pc-y-meteomatics-design.md`

## Global Constraints

- Por debajo de 1024 px el Inicio no cambia, salvo la tarjeta nueva.
- El semáforo no usa el pronóstico.
- `web/completo.html` no lleva la tarjeta.
- Nunca se muestra un pronóstico vencido como actual: sin días vigentes, la tarjeta solo dice "Pronóstico vencido (bajado el {fecha}). Se actualiza todos los días."
- La contraseña de Meteomatics solo vive en `METEOMATICS_PASSWORD`, como secreto de Actions o variable local. Nunca va en el navegador ni en el repo.
- Umbrales: **más de 38 °C** y **viento de menos de 15 km/h** (de `docs/integracion-meteomatics.md` §5). La tarjeta aclara que son un criterio del equipo.
- La fuente se nombra siempre así: "Pronóstico de Meteomatics (modelo europeo ECMWF, 9 km), bajado el {fecha}."
- Los datos que faltan no se inventan: `null` o `-999` (el valor de Meteomatics para "sin dato") cuentan como sin dato.
- Commits sin `Co-Authored-By`. Se trabaja en la rama `enzo-app` y se integra a `main` solo con la aprobación de Enzo.

## Review Focus

1. **La fecha local contra la UTC:** después de las 21:00 de Argentina, la fecha UTC ya es mañana. Se espera que el día de hoy siga contando hasta la medianoche local (prueba en la tarea 1: `hoyLocalISO`).
2. **Valores `-999` o `null` en un día:** se espera que no se sumen ni se cuenten, y que no rompan la tarjeta (prueba en la tarea 1).
3. **Descarga parcial o fallida:** se espera que no se pise el JSON bueno con uno incompleto (protección en el script y validación en el workflow, tarea 4).
4. **Sin JSON o sin la zona** (primera carga sin internet, archivo viejo): se espera que la tarjeta no aparezca y que no haya errores (prueba en la tarea 1 y verificación en la tarea 2).
5. **Modo oscuro:** se espera que la tarjeta use los colores de `:root` (`--surface`, `--ink`, `--muted`) y se lea en los dos temas (captura oscura en la tarea 3).

---

### Task 0: Rama

- [ ] `git switch enzo-app && git merge --ff-only main`. Esperado: avanza sin conflictos, porque `enzo-app` no tiene commits propios.

### Task 1: Lógica del pronóstico

**Files:**
- Create: `web/pronostico-logica.js`
- Test: `tests/pronostico-logica.test.js`

**Interfaces:**
- Produces:
  - `PronosticoLogica.UMBRALES = {calorC: 38, vientoKmh: 15}`
  - `PronosticoLogica.hoyLocalISO(date: Date) -> 'YYYY-MM-DD'`, armada con `getFullYear`, `getMonth` y `getDate` (fecha local, nunca `toISOString`).
  - `PronosticoLogica.resumen(dias: Array|undefined, hoyISO: string) -> {vigente: boolean, n: number, dias: Dia[], lluviaTotal: number|null, diaMasLluvia: {fecha: string, mm: number}|null, diasCalor: number, diasHelada: number, diasHojaMojada: number, diasVientoBajo: number}`
    - `Dia = {fecha: 'YYYY-MM-DD', tmax: number|null, tmin: number|null, lluvia: number|null, helada: boolean, hojaMojada: boolean, vientoKmh: number|null}`
    - Los días se leen de las claves del JSON: `fecha`, `t_max_2m_24h:C`, `t_min_2m_24h:C`, `precip_24h:mm`, `frost_warning_24h:idx`, `leaf_wetness:idx` y `wind_speed_10m:ms`.
    - Vigentes son los días con `fecha.slice(0, 10) >= hoyISO`.
    - `-999`, `null` o un valor que no es número se toman como `null`.
    - El viento se convierte con `km/h = m/s × 3,6`.
  - `PronosticoLogica.TEXTOS`: las plantillas de la tarea 2.

- [ ] **Step 1: escribir las pruebas que fallan.** Usar los 8 días reales de la Zona 2 bajados el 14/11 (`zonas[1].pronostico_7_dias`, del 14 al 21/11), **copiados dentro de la prueba como constante `Z2_14NOV`**. No se leen del archivo, porque la tarea 4 lo renueva todos los días:
  - `resumen(z2, '2026-11-15')`:
    - `vigente === true` y `n === 7`;
    - `Math.round(lluviaTotal) === 188`;
    - `diaMasLluvia.fecha === '2026-11-15'` y `Math.round(diaMasLluvia.mm) === 136`;
    - `diasCalor === 0`, `diasHelada === 0`, `diasHojaMojada === 6` y `diasVientoBajo === 6`.
  - `resumen(z2, '2026-11-14')`: `n === 8` y `diasCalor === 1` (el 14/11 tiene 41,8 °C).
  - `resumen(z2, '2026-11-22')`: `vigente === false` y `n === 0`.
  - `resumen(undefined, '2026-11-15')` y `resumen([], …)`: `vigente === false`, sin error.
  - Un día con `precip_24h:mm: -999` y otro con `wind_speed_10m:ms: null`: ese día suma 0 a la lluvia y no cuenta como viento bajo. Si todos los días traen `-999` de lluvia, `lluviaTotal === null`.
  - `hoyLocalISO(new Date(2026, 10, 15, 22, 30)) === '2026-11-15'`.
  - Viento: `wind_speed_10m:ms: 4.2` da `vientoKmh` 15,12, que no cuenta como bajo; `4.1` da 14,76, que sí cuenta.
- [ ] **Step 2:** correr `node --test tests/pronostico-logica.test.js`. Esperado: FAIL, porque el módulo no existe.
- [ ] **Step 3:** escribir `web/pronostico-logica.js` con la envoltura de `inicio-logica.js` (líneas 6 y 116 a 118).
- [ ] **Step 4:** correr `node --test "tests/*.test.js"`. Esperado: todas en verde, 112 más las nuevas.
- [ ] **Step 5:** commit con el mensaje `D-34: logica del pronostico de Meteomatics (vigencia, resumen y fecha local) con pruebas`.

### Task 2: Tarjeta "Esta semana en tu zona" en el Inicio y en el Reporte

**Files:**
- Modify:
  - `web/index.html`: `<script src="pronostico-logica.js" defer></script>` antes de `app.js` (línea 20); `<section class="prono" id="inicioPronostico" hidden></section>` dentro de `.ini-mejor`, después de `#inicioValidacion` (línea 54); `<div class="prono prono-rep" id="repPronostico" hidden></div>` en `#calendario`, después de `#escChip`.
  - `web/app.js`:
    - global `METEO = null`;
    - en `cargarDatos()`, `cargarJSON('../data/meteomatics_santiago_zonas.json').catch(() => null)`;
    - función nueva `renderPronostico()`, sumada a `renderTodo()` (línea 821).
  - `web/estilos.css`: estilos `.prono`, al lado de los `.ini-*` (cerca de la línea 408), solo con los colores de `:root`.
  - `tests/vistas.test.js`, `tests/datos-contratos.test.js`.

**Interfaces:**
- Consumes: `PronosticoLogica.resumen`, `hoyLocalISO`, `UMBRALES` y `TEXTOS` (tarea 1).
- Produces: los ids `#inicioPronostico` y `#repPronostico`, que usa la tarea 3 para el diseño.

**Textos** (`PronosticoLogica.TEXTOS`, copia exacta):
- `titulo`: "Esta semana en tu zona"
- `sub`: "Próximos {n} días"
- `fuente`: "Pronóstico de Meteomatics (modelo europeo ECMWF, 9 km), bajado el {fecha}."
- `vencido`: "Pronóstico vencido (bajado el {fecha}). Se actualiza todos los días."
- `complemento`: "El semáforo muestra lo típico de {mes}; esto es lo que se anuncia para estos días." *(Cambia la frase del diseño, "Lo típico de noviembre es seco…", para no tener que clasificar el mes como seco o húmedo.)*
- `lluvia`: "{mm} mm de lluvia en total (la mayor, el {dia}: {mmDia} mm)" · `sinLluvia`: "Sin lluvia anunciada"
- `calor`: "{n} días de más de 38 °C"
- `helada`: "{n} días con alerta de helada"
- `hoja`: "{n} días con hoja mojada (favorece hongos)"
- `viento`: "{n} días con viento de menos de 15 km/h (para pulverizar)"
- `criterio`: "Más de 38 °C y viento de menos de 15 km/h son criterios del equipo."
- La fecha se escribe como "dom 15/11". `{fecha}` de bajada sale de `METEO.fecha_generacion`, en hora local, como "14/11 15:16".

**Comportamiento:**
- `renderPronostico()` busca la zona con `METEO.zonas.find(z => z.id === state.zona)`.
- Sin `METEO`, sin la zona o sin `window.PronosticoLogica`, los dos contenedores quedan `hidden`.
- Si está vencido, se muestra solo `titulo` y `vencido`.
- Si no, se muestran `titulo`, `sub`, los 5 renglones, `complemento`, `criterio` y `fuente`.
- `#repPronostico` suma una tabla con una fila por día vigente: "Día", "Máx / mín", "Lluvia", "Helada" (Sí/—) y "Hoja mojada" (Sí/—). Un valor `null` se muestra como "—".
- Si el elemento no existe (en `completo.html`), la función no hace nada.

- [ ] **Step 1: pruebas que fallan.**
  - En `tests/vistas.test.js`, test `'index.html tiene la tarjeta del pronóstico en el Inicio y en el Reporte'`: `idsIndex.has('inicioPronostico')`, `idsIndex.has('repPronostico')` y `assert.match(index, /pronostico-logica\.js/)`.
  - En `tests/datos-contratos.test.js`, test `'meteomatics_santiago_zonas.json: 5 zonas con los ids de la app y días con fecha'`:
    - los ids son `zona_1_riego_salitre` a `zona_5_sur_serrano`;
    - cada zona tiene `pronostico_7_dias.length >= 1`, y cada día tiene `fecha` y la clave `precip_24h:mm`;
    - `fecha_generacion` es una fecha válida.
- [ ] **Step 2:** `node --test "tests/*.test.js"`. Esperado: FAIL solo en la prueba de vistas nueva.
- [ ] **Step 3:** implementar el HTML, `renderPronostico()` y el CSS.
- [ ] **Step 4:** `node --test "tests/*.test.js"`. Esperado: todas en verde. La prueba de ids de `app.js` contra `completo.html` pasa, porque los ids nuevos están solo en `index.html`.
- [ ] **Step 5: ver la tarjeta.**
  - Con `python -m http.server 8000`, correr `ZONA=zona_2_secano_este node scripts/captura-movil.mjs "http://localhost:8000/web/index.html" inicio.png 1600`.
  - Esperado: la tarjeta queda debajo de la tira, con 188 mm (la mayor, dom 15/11: 136 mm), 6 días con hoja mojada y la fuente. Sale `390x390` y no hay errores de JS.
  - Repetir con `#reporte` (alto 2400): la tabla de días aparece en la sección 1.
- [ ] **Step 6:** commit con el mensaje `D-34: tarjeta "Esta semana en tu zona" con el pronostico de Meteomatics en el Inicio y el Reporte`.

### Task 3: El Inicio en dos columnas desde 1024 px

**Files:**
- Modify: `web/estilos.css`, con un solo bloque `@media (min-width:1024px)` después de la línea 408.

**Interfaces:**
- Consumes: la estructura de `#vista-inicio`, con 3 hijos (`.ini-banda`, `.ini-wrap.ini-cuerpo` y `.ini-barra`), y `#inicioPronostico` de la tarea 2.

**Valores:**
- `.vista-inicio`: `display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); grid-template-rows:1fr auto`.
- `.ini-banda`: `grid-column:1; grid-row:1 / span 2; display:flex; align-items:center`.
- `.ini-cuerpo`: `grid-column:2; grid-row:1`.
- `.ini-barra`: `grid-column:2; grid-row:2; position:static; border-top:0; background:transparent`.

La regla `[hidden]{display:none!important}` (`estilos.css:4`) mantiene oculto el Inicio cuando se ve el Reporte.

- [ ] **Step 1: verificación previa.** `ANCHO=1440` con la copia de `captura-movil.mjs` que acepta ancho (o la variable `ANCHO` si se suma al script). Esperado: hoy se ve una sola columna de 560 px.
- [ ] **Step 2:** escribir el bloque `@media`.
- [ ] **Step 3: capturas** del Inicio de la Zona 2 en 390, 768, 1024, 1440 y 1920 px, y en 1440 px con `oscuro`.
  - Esperado en 390 y 768: igual que antes de esta tarea, más la tarjeta.
  - Esperado desde 1024: dos columnas, con el semáforo de color a la izquierda y lo que mejor encaja, la tarjeta y los botones a la derecha.
  - En todos los anchos: ancho de pantalla igual al de contenido y sin errores de JS. En modo oscuro, la tarjeta se lee.
- [ ] **Step 4:** con `EVAL='getComputedStyle(document.getElementById("vista-inicio")).display'` en `index.html#reporte` a 1440 px. Esperado: `"none"`.
- [ ] **Step 5:** `node --test "tests/*.test.js"` en verde y commit con el mensaje `D-34: Inicio en dos columnas desde 1024 px (solo CSS)`.
- [ ] **Step 6 (opcional):** sumar al script `scripts/captura-movil.mjs` la variable `ANCHO` (por defecto 390, `mobile` si es menor a 800) y documentarla en su encabezado. Va en el mismo commit.

### Task 4: Actualización diaria del pronóstico

**Files:**
- Modify: `scripts/descargar_meteomatics.py`, en `main()`, antes de escribir el archivo (línea 138).
- Create: `.github/workflows/actualizar-meteomatics.yml`

**Valores:**
- **Script:** si `len(salida["zonas"]) < len(ZONAS)` o alguna zona trae `pronostico_7_dias` vacío, imprime qué falló, no escribe el archivo y termina con `sys.exit(1)`.
- **Workflow:**
  - `name: Actualizar pronostico de Meteomatics`;
  - `on: schedule: - cron: '0 9 * * *'` (06:00 de Argentina) y `workflow_dispatch`;
  - `permissions: contents: write` y `concurrency: group: actualizar-meteomatics`;
  - los pasos son `actions/checkout@v4`, `actions/setup-node@v4` con `node-version: 22` y `python3 scripts/descargar_meteomatics.py` con `env: METEOMATICS_PASSWORD: ${{ secrets.METEOMATICS_PASSWORD }}`;
  - después, `node --test tests/datos-contratos.test.js` (si falla, no se sube nada);
  - por último, el mismo bloque de commit y push con reintentos de `actualizar-readme.yml` (líneas 27 a 45), sobre `data/meteomatics_santiago_zonas.json` y con el mensaje `Actualizar pronostico de Meteomatics automaticamente`.

- [ ] **Step 1:** correr `python scripts/descargar_meteomatics.py` sin la variable. Esperado: el aviso de seguridad y el archivo sin tocar (`git status` limpio).
- [ ] **Step 2:** sumar la protección al script. Verificarla con un `ZONAS` que tenga un punto inválido, o simulando que `descargar_pronostico_zona` devuelve `None`: sale con código 1 y `git status` sigue limpio.
- [ ] **Step 3:** escribir el workflow.
- [ ] **Step 4:** validar el YAML con `python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/actualizar-meteomatics.yml'))"`, si está PyYAML; si no, revisarlo leyendo contra `actualizar-readme.yml`.
- [ ] **Step 5:** commit con el mensaje `D-34: el pronostico de Meteomatics se actualiza solo todos los dias (GitHub Actions); el script no pisa el archivo si falla una zona`.
- [ ] **Lo hace Enzo:** cargar el secreto `METEOMATICS_PASSWORD` en GitHub (Settings → Secrets and variables → Actions → New repository secret) y correr el workflow a mano una vez (Actions → Actualizar pronostico de Meteomatics → Run workflow).

### Task 5 (si sobra tiempo): escalón de 9 km en la pantalla del kit

**Files:**
- Modify: `web/kit.html` (script `pronostico-logica.js` antes de `kit.js`, línea 13), `web/kit.js` (carga del JSON en la línea 96 y texto en la línea 106).

- [ ] Si `resumen(...).vigente` y el primer día vigente es hoy, sumar al texto de `#satelite`: " Pronóstico para hoy (Meteomatics, 9 km): máxima {tmax} °C." Si no está vigente, el texto queda igual.
- [ ] Verificar con la captura de `web/kit.html?zona=zona_2_secano_este` a 1440 px. Correr `node --test "tests/*.test.js"` en verde y hacer commit con el mensaje `D-34: la pantalla del kit suma el pronostico de hoy a 9 km`.

### Task 6: Documentación e integración

**Files:**
- Modify:
  - `docs/reglas-y-bitacora.md` (D-34);
  - `docs/contratos-de-datos.md` (sección nueva para `meteomatics_santiago_zonas.json`, con las claves que usa la app, la vigencia y el `-999`);
  - `planes/1-enzo.md` (tildar "Decidir si Meteomatics entra", con la nota "entra como tarjeta, D-34", y sumar la casilla "Cargar el secreto METEOMATICS_PASSWORD en GitHub");
  - `docs/estado-del-proyecto.md` (F5, F6 con el kit de Sara en un simulador web, y que la tarjeta ya no da un pronóstico vencido como actual);
  - `docs/memoria-del-proyecto.md`;
  - `docs/integracion-meteomatics.md` §5 (estado: integrado).
- Regenerate: `python -X utf8 scripts/actualizar_readme.py`.

- [ ] **Step 1:** escribir la documentación.
- [ ] **Step 2:** `node --test "tests/*.test.js"` en verde y `python scripts/actualizar_readme.py --check` con salida 0.
- [ ] **Step 3:** commit con el mensaje `D-34: documentacion (bitacora, contratos, planes, estado y README)`.
- [ ] **Step 4:** mostrarle a Enzo las capturas (390 y 1440 px) y pedirle la aprobación para integrar `enzo-app` a `main` con un merge `--no-ff`, hacer el push y el `git pull` del commit del robot.
