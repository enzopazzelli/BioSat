# App para el celular y reporte completo · Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usar superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`).

**Objetivo:** la app pasa a tener un Inicio simple para el celular (semáforo, lo que mejor encaja y la sonda) y un Reporte completo en una sola página, con PDF y compartir.

**Arquitectura:** una sola página (`web/index.html`) con dos vistas, `#inicio` y `#reporte`, que se cambian con el hash. La lógica nueva es pura y tiene pruebas (`web/inicio-logica.js`). `app.js` la usa y reusa los `render…()` de siempre, que ahora viven dentro del Reporte.

**Tecnología:** HTML, CSS y JS sin compilación. Pruebas con `node --test` (Node 22).

**Diseño:** `docs/superpowers/specs/2026-11-15-app-celular-y-reporte-design.md`. Maquetas: https://claude.ai/artifact/2JyKEp1U46KhQXMCiM2ZSz (B · ELEGIDA y Reporte · ELEGIDO).

## Restricciones generales

- **Ubicación del trabajo:** la copia `D:/User/Desktop/BioSat-app`, en la rama `enzo-app`. Los commits van sin la línea `Co-Authored-By`, y nada se sube sin aprobación de Enzo.
- **Sin librerías nuevas ni compilación.** La app tiene que andar sin internet. El WhatsApp y Compartir avisan si no hay conexión.
- **Sin números escritos a mano en la interfaz:** todo sale de los JSON. Los datos faltantes se muestran como "sin dato" o la frase no aparece.
- **Textos:** van en objetos con claves, en lenguaje simple. Nunca "Sembrá X": se dice "Lo que mejor encaja".
- **Accesibilidad:**
  - el semáforo lleva ícono y palabra, no solo color;
  - los botones miden 44 px o más;
  - el texto sobre la banda tiene contraste de 4,5:1 o más;
  - se mantiene el modo oscuro.
- **Pruebas:** `node --test tests/*.test.js` tiene que quedar en verde (hoy son 71 en esta rama).

## Qué revisar especialmente

1. **Zona sin `fraccion_pelado`:** con los datos viejos de esta rama, la señal de suelo pelado se omite y el semáforo sale con las otras tres. Nunca `NaN` ni `undefined` en pantalla.
2. **La rotación de hoy es la primera del ranking:** el Inicio dice "Tu rotación de hoy ya es la que mejor encaja" y la tira muestra solo "Hoy".
3. **El botón "atrás" del celular en el Reporte:** vuelve al Inicio (navegación con `hashchange`), no cierra la app.
4. **Imprimir:** solo sale el Reporte, con los plegables abiertos y sin la barra fija.
5. **Celular sin Web Serial:** "Medir con la sonda" explica qué hacer y no queda mudo.

---

### Task 1: Lógica del Inicio (`web/inicio-logica.js`)

**Archivos:**
- Crear: `web/inicio-logica.js`
- Prueba: `tests/inicio-logica.test.js`

**Interfaces que produce** (`window.InicioLogica` en el navegador y `module.exports` en Node):
- `NIVELES = ['bien', 'atencion', 'cuidado']`
- `semaforoZona(mesIdx, m, fraccionPelado)`:
  - `m` = `{falta, d35, helada}`, del mes `mesIdx` (0 a 11);
  - devuelve `{nivel: 0|1|2, senales: [{id, valor, nivel}], razon: string, accion: string}`.
- `semaforoSonda(lectura)`: `{nivel, razon}`, o `null` si la lectura no tiene `semaforo`.
- `proximaSiembra(secuencia, mesIdx)`: `{cultivo, mes}` (`mes` de 1 a 12), o `null`.
- `mesesPelados(cal)`: cuenta los `'D'` de un texto de 12 letras (C, V, R, D), como `r.cal` en `app.js`.
- `textoWhatsApp({zona, mes, nivelTexto, razonCorta, rotacion, siembraMes, enlace})`: string.
- `TEXTOS`: las palabras del nivel, las plantillas de razón y acción y el texto de WhatsApp.

**Umbrales** (diseño 4.3), con señales que valen 0, 1 o 2:

| Señal | 0 | 1 | 2 |
|---|---|---|---|
| `falta` | < 50 | 50 a 100 | > 100 |
| `d35` | < 5 | 5 a 10 | > 10 |
| `helada` | < 2 | 2 a 5 | > 5 |
| `pelado` (fracción) | < 0,25 | 0,25 a 0,5 | ≥ 0,5 |

`pelado` en `null` o `undefined` se omite. El nivel es el máximo de las señales. La razón usa hasta 2 señales de nivel 1 o más, de mayor a menor. La acción es la de la señal más alta, o la de "bien".

- [ ] **Paso 1: pruebas que fallan** (casos con datos reales de la Zona 5, clima 2021-2025):

```js
test('Zona 5 en noviembre da ATENCIÓN por agua, calor y suelo pelado', () => {
  const s = L.semaforoZona(10, {falta: 92, d35: 8, helada: 0}, 0.382);
  assert.equal(s.nivel, 1);
  assert.deepEqual(s.senales.filter(x => x.nivel > 0).map(x => x.id).sort(), ['d35', 'falta', 'pelado']);
  assert.match(s.razon, /92|90/); assert.ok(!/undefined|NaN/.test(s.razon + s.accion));
});
test('Zona 5 en octubre da CUIDADO (falta 131 mm, 53 % pelado)', () => {
  assert.equal(L.semaforoZona(9, {falta: 131, d35: 4, helada: 0}, 0.525).nivel, 2);
});
test('Zona 5 en abril da BIEN', () => {
  const s = L.semaforoZona(3, {falta: 35, d35: 0, helada: 0}, 0);
  assert.equal(s.nivel, 0); assert.equal(s.accion, L.TEXTOS.accion.bien);
});
test('sin fracción de suelo pelado, la señal se omite', () => {
  const s = L.semaforoZona(10, {falta: 20, d35: 0, helada: 0}, null);
  assert.equal(s.nivel, 0); assert.ok(!s.senales.some(x => x.id === 'pelado'));
});
test('la sonda manda: rojo es CUIDADO y sin semáforo devuelve null', () => {
  assert.equal(L.semaforoSonda({semaforo: 'rojo', temp_suelo_c: 41.2, agua_raw: 300}).nivel, 2);
  assert.equal(L.semaforoSonda({temp_suelo_c: 30}), null);
});
test('próxima siembra es circular e incluye el mes actual', () => {
  const sec = [{cultivo: 'Pastura', siembra_mes: 11}, {cultivo: 'Verdeo', siembra_mes: 3}];
  assert.deepEqual(L.proximaSiembra(sec, 10), {cultivo: 'Pastura', mes: 11});   // noviembre
  assert.deepEqual(L.proximaSiembra(sec, 11), {cultivo: 'Verdeo', mes: 3});     // diciembre → marzo
  assert.equal(L.proximaSiembra([], 0), null);
});
test('meses pelados cuenta las D', () => { assert.equal(L.mesesPelados('CCCCCRRRDDCC'), 2); });
test('texto de WhatsApp completo y sin huecos', () => {
  const t = L.textoWhatsApp({zona: 'Sur serrano y salinas', mes: 'noviembre', nivelTexto: 'ATENCIÓN',
    razonCorta: 'falta agua', rotacion: 'Verdeo de invierno', siembraMes: 'marzo', enlace: 'https://x/web/'});
  assert.match(t, /Sur serrano y salinas/); assert.match(t, /https:\/\/x\/web\//); assert.ok(!/undefined|\{/.test(t));
});
```

- [ ] **Paso 2:** `node --test tests/inicio-logica.test.js`. Esperado: FAIL (no existe el módulo).
- [ ] **Paso 3:** implementar `web/inicio-logica.js` con el mismo esqueleto que `web/frases-logica.js`: una IIFE con `module.exports` o `window`. Las razones llevan los números redondeados ("faltan unos 90 mm"; la fracción como "casi 4 de cada 10 lotes", con `Math.round(f * 10)`).
- [ ] **Paso 4:** pasa la prueba nueva y siguen pasando las 71.
- [ ] **Paso 5:** commit: "Logica del Inicio: semaforo de la zona y de la sonda, proxima siembra y WhatsApp".

### Task 2: Asistente, pregunta 1 con la característica de la zona

**Archivos:**
- Modificar:
  - `web/asistente-logica.js`: suma `etiquetaZona(z)` → `{titulo: z.nombre, detalle: z.zona || z.lugar}` y `resumen()` suma `localidades`.
  - `web/asistente.js`: la pregunta 1 usa `etiquetaZona`; `TEXTOS.p1.ayuda` = "Tocá tu zona, o el color en el mapa."; `TEXTOS.p4.zona` = "Zona {num} · {nombre}".
- Prueba: `tests/asistente-logica.test.js`

- [ ] **Paso 1: prueba que falla.** `etiquetaZona(ZONAS_PRUEBA.zona_1_riego_salitre)` da `titulo` 'Área de riego del Río Dulce'. Con `zona: 'La Banda · Robles · Beltrán'`, `detalle` da ese texto; sin `zona`, cae en `lugar`. Además, un control de texto: `fs.readFileSync('web/asistente.js')` no contiene `Tocá tu pueblo` ni `{pueblo}`.
- [ ] **Paso 2:** falla.
- [ ] **Paso 3:** implementar. En `cuerpoP1()`, `<strong>${esc(et.titulo)}</strong><span>${esc(et.detalle)}</span>`. Revisar que `app.js` (`TEXTOS_CAMPO` y el resumen de "Tu campo") no muestre el pueblo como nombre de la zona.
- [ ] **Paso 4:** pasan todas.
- [ ] **Paso 5:** commit: "Asistente: la pregunta 1 nombra la caracteristica de la zona y abajo sus localidades".

### Task 3: Dos vistas en `index.html` (Inicio y Reporte) y navegación

**Archivos:**
- Modificar:
  - `web/index.html`:
    - `<section id="vista-inicio">` con el marcado nuevo del Inicio (diseño 4.2);
    - `<section id="vista-reporte" hidden>` que reúne las secciones actuales en el orden de 4.6, con su encabezado, los chips y los botones de exportar;
    - se va la `<nav class="steps">`.
  - `web/app.js`: `mostrarVista(id)` y el escucha de `hashchange` (`#reporte` muestra el Reporte; cualquier otro, el Inicio). Al cambiar de vista, el foco va al título de la vista.
- Prueba: `tests/vistas.test.js`

- [ ] **Paso 1: prueba que falla** (lee los archivos como texto):
  - `index.html` tiene `id="vista-inicio"` y `id="vista-reporte"`;
  - **cada `$('#x')` y `querySelector('#x')` de `app.js` tiene su `id="x"` en `index.html`**, como guarda contra romper un `render…()`;
  - `index.html` carga `inicio-logica.js` antes que `app.js`.
- [ ] **Paso 2:** falla.
- [ ] **Paso 3:** reorganizar. Los bloques existentes se **mueven sin cambiar sus `id`** a sus secciones del Reporte:
  1. `#calendario` y las cifras;
  2. `#comparar`;
  3. `#simulador`;
  4. el contenido de `#detalleTecnico` y del visor;
  5. el sensor;
  6. `#antes-de-decidir`;
  7. el pie con las fuentes.

  Cada sección lleva `<h2 class="conclusion" id="concl-N">`, y sus números técnicos van en `<details class="para-ingeniero">`.
- [ ] **Paso 4:** pasan todas. A mano: `python -m http.server 8000`, abrir `/web/` y `/web/#reporte`, y revisar la consola sin errores.
- [ ] **Paso 5:** commit: "Una pagina con dos vistas: Inicio y Reporte".

### Task 4: `renderInicio()` y estilos del Inicio

**Archivos:**
- Modificar:
  - `web/app.js`: `renderInicio()` usa `InicioLogica` y `ranking()[0]`; se llama desde `renderTodo()` y cuando llega una lectura de la sonda.
  - `web/estilos.css`: banda, tira de meses, barra fija y los tokens `--sem-bien`, `--sem-atencion`, `--sem-cuidado` y `--sem-tinta`, en claro y en oscuro.

**Datos que usa:**
- Del mes: `clima('reciente', 0, 0)[mes]` → `falta = et0 - lluvia`, `d35`, `helada`.
- `DIAG.zonas[zona].fraccion_pelado?.[mes] ?? null`.
- Si `state.vivo` tiene `semaforo`, `semaforoSonda(state.vivo)` reemplaza al de la zona y el rótulo pasa a "Tu lote, medido hoy".

- [ ] **Paso 1: prueba que falla** (en `tests/vistas.test.js`): `estilos.css` define `--sem-bien`, `--sem-atencion`, `--sem-cuidado` y `--sem-tinta`, tanto en `:root` como en el bloque oscuro. `index.html` tiene `id="inicioNivel"`, `id="inicioRazon"`, `id="inicioAccion"`, `id="inicioRotacion"`, `id="inicioTira"`, `id="btnSonda"`, `id="btnWhatsapp"` e `id="irReporte"`.
- [ ] **Paso 2:** falla.
- [ ] **Paso 3:** implementar como la maqueta B.
  - **Banda:** fondo `var(--sem-…)` y texto `var(--sem-tinta)`. Contraste: comprobar a mano con los colores elegidos que la tinta sobre cada fondo dé 4,5:1 o más.
  - **Tira de meses:** 12 celdas por fila con las clases `st-C`, `st-V`, `st-R` y `st-D` (los colores `--st-*` que ya existen), y el mes actual marcado.
  - **Si la primera del ranking es la actual:** solo la fila "Hoy" y la frase de 4.4.
- [ ] **Paso 4:** pasan todas. A mano, a 390 px de ancho: Zona 5 en noviembre muestra ATENCIÓN; probar las 5 zonas y el modo oscuro.
- [ ] **Paso 5:** commit: "Inicio: semaforo de la zona, lo que mejor encaja y tira de meses".

### Task 5: Botones del Inicio (sonda y WhatsApp)

**Archivos:**
- Modificar: `web/app.js`

- [ ] **Paso 1: prueba que falla** (en `tests/inicio-logica.test.js`): `TEXTOS.sondaNoDisponible` existe y menciona Chrome o Edge.
- [ ] **Paso 2:** falla.
- [ ] **Paso 3:** implementar.
  - **`#btnSonda`:** si `BioSatArduino.soportado()`, llama a `conectar()` y vuelve a dibujar el Inicio con `state.vivo`. Si no, muestra `TEXTOS.sondaNoDisponible` y un enlace a `kit.html?zona=…`.
  - **`#btnWhatsapp`:** arma el texto con `textoWhatsApp` (enlace = `location.href` sin hash). Si hay `navigator.share`, lo usa; si no, abre `https://wa.me/?text=` + `encodeURIComponent(texto)`.
- [ ] **Paso 4:** pasan todas. A mano: en una computadora sin la placa, el botón de la sonda explica qué hacer; WhatsApp abre el enlace con el texto.
- [ ] **Paso 5:** commit: "Inicio: medir con la sonda y mandar por WhatsApp".

### Task 6: Reporte (conclusiones, chips, PDF y Compartir)

**Archivos:**
- Modificar: `web/app.js` (`renderConclusiones()`), `web/estilos.css` (estilos del Reporte y `@media print`) y `web/frases-logica.js` (frases nuevas para las conclusiones que falten).
- Prueba: `tests/frases-logica.test.js` y `tests/vistas.test.js`

- [ ] **Paso 1: pruebas que fallan.**
  - `FrasesLogica.fraseMesesDuros(meses)` da "{Mes} y {mes} son los meses más duros…" a partir de las señales del semáforo por mes (los 2 meses de mayor nivel; si empatan, el de más falta de agua). Si no hay datos, da `null`.
  - `estilos.css` tiene `@media print`, que oculta `#vista-inicio` y la barra fija y muestra `#vista-reporte`.
- [ ] **Paso 2:** fallan.
- [ ] **Paso 3:** implementar.
  - **Las 7 conclusiones** de 4.6: 1 con `fraseMesesDuros`, 2 con `fraseMejorRotacion`, 3 con `fraseCalorMas`, 4 con el suelo y el monte (pH, % de monte), 5 con lo que midió la sonda o "Todavía no mediste tu lote", 6 con `fraseAntesDeDecidir` y 7 con un texto fijo.
  - **Chips:** enlaces `#rep-N`.
  - **Guardar PDF:** abre los `details` y llama a `window.print()`.
  - **Compartir:** usa `navigator.share`; si no está, `navigator.clipboard.writeText` y avisa "Enlace copiado".
- [ ] **Paso 4:** pasan todas. A mano: imprimir a PDF desde Chrome (vista previa), donde sale solo el Reporte.
- [ ] **Paso 5:** commit: "Reporte: conclusiones, accesos rapidos, PDF y compartir".

### Task 7: Revisión en el navegador, documentos y bitácora

**Archivos:**
- Modificar: `docs/reglas-y-bitacora.md` (D-31), `planes/1-enzo.md` (casillas), `docs/memoria-del-proyecto.md` (§2 La app) y `scripts/actualizar_readme.py` (descripción de `web/inicio-logica.js`).

- [ ] **Paso 1:** capturas con Chrome sin ventana, a 390×900, de `/web/` y `/web/#reporte`. Mirarlas y comparar con las maquetas.

  `"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless --screenshot=… --window-size=390,900 http://localhost:8000/web/`

  Corregir lo que no coincida.
- [ ] **Paso 2:** D-31 en la bitácora: "Inicio simple para el celular y reporte completo". Plan de Enzo, memoria y README regenerados.
- [ ] **Paso 3:** `node --test tests/*.test.js`: todo en verde.
- [ ] **Paso 4:** commit: "D-31: app para el celular y reporte completo; documentos al dia". Avisarle a Enzo para que revise antes de integrar.
