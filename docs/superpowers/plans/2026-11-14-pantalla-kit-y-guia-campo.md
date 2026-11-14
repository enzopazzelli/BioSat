# Pantalla del kit y guía "Del kit al campo": plan de construcción

> **Para agentes:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguir el avance.

**Objetivo:** dos páginas nuevas de la app.
- `web/kit.html`: las 3 bandejas en vivo para la mesa del jurado.
- `web/campo.html`: la guía visual de cómo se lleva BioSat a un campo real.

Las dos se abren desde el panel del sensor de la app.

**Arquitectura:** HTML y JavaScript sin instalación, como el resto de `web/`.
- **Lógica sin interfaz:** las reglas de la pantalla del kit (estado de las bandejas, cuándo una lectura está estable, frase de cierre) van en `web/kit-logica.js`. Se prueba con el corredor de pruebas que trae Node (`node --test`).
- **Lógica con interfaz:** `web/kit.js` solo conecta esa lógica con la página, el teclado y el lector del Arduino.
- **La guía:** es contenido estático.

**Tecnología:** HTML, CSS y JavaScript del navegador. Node 22 solo para las pruebas (`node:test`, sin dependencias). Chrome sin ventana para verificar las páginas.

**Especificaciones:**
- `docs/superpowers/specs/2026-11-14-visor-kit-jurado-design.md`
- `docs/superpowers/specs/2026-11-14-guia-del-kit-al-campo-design.md`

## Restricciones generales

- **Sin internet:** todo funciona sin conexión. Las fuentes de Google son opcionales y caen a las del sistema; no se cargan otros recursos externos.
- **Nunca números inventados:** sin Arduino y sin lecturas grabadas, cada bandeja dice **"sin lectura"**.
- **Lector del Arduino:** se usa la interfaz de contratos §6 sin cambios: `window.BioSatArduino.soportado()`, `conectar(alLeer)`, `desconectar()`. Se carga con `<script src="../arduino/lector-web-serial.js" defer onerror="this.remove()">`.
- **Lecturas grabadas:** se leen de `data/arduino_bandejas_demo.json`, con las claves de bandeja `A_pelada_seca`, `B_salitrosa` y `C_rastrojo`.
- **Lectura estable:** la temperatura del suelo cambia menos de **0,3 °C** en las últimas **5 lecturas** (10 segundos).
- **Umbral de salitre:** sale de `meta.umbrales.conductividad_salitre_raw` del archivo de lecturas grabadas; si no está, **700** (escala 0 a 1023).
- **Zona:** viene del parámetro `?zona=`; si falta o no existe, `zona_2_secano_este`.
- **Teclado:** A, B y C eligen bandeja (sin importar mayúsculas), R reinicia y F pone pantalla completa. Se ignoran las teclas repetidas por mantenerlas apretadas.
- **Textos:** en español rioplatense, de cara al jurado.
- **Commits:** sin la línea `Co-Authored-By`, en la rama `enzo-app`.

## Puntos a revisar

1. **Sin Arduino y sin lecturas grabadas:** elegir una bandeja no rompe nada, la tarjeta dice "sin lectura" y no aparece frase de cierre. (Tarea 2, verificación con el arnés.)
2. **Lector presente, pero el navegador no tiene Web Serial** (por ejemplo, Firefox): el botón "Conectar Arduino" queda deshabilitado con la explicación. (Tarea 2.)
3. **Lecturas que nunca se estabilizan:** la bandeja se queda "estabilizando", no se guarda sola y la barra no llega al 100 %. (Tarea 1, prueba `no guarda si no se estabiliza`.)
4. **Tecla mantenida o en minúscula:** una sola acción y las dos formas funcionan. (Tarea 1, prueba de `letraDesdeTecla`; Tarea 2, `e.repeat` ignorado.)
5. **`?zona=` inválida o ausente:** usa la Zona 2 sin error. (Tarea 1, prueba de `zonaDesdeParametro`.)

---

### Task 1: Lógica de la pantalla del kit

**Archivos:**
- Crear: `web/kit-logica.js`
- Prueba: `tests/kit-logica.test.js`

**Interfaces:**
- **Produce:** el objeto `KitLogica`. En el navegador queda en `window.KitLogica`; en Node se exporta con `module.exports`.
- **Bandejas y lecturas:**
  - `BANDEJAS_ORDEN = ['A','B','C']`.
  - `CLAVE_GRABADA = {A:'A_pelada_seca', B:'B_salitrosa', C:'C_rastrojo'}`.
  - `Lectura`: objeto con `temp_suelo_c`, `agua_raw`, `luz_raw`, `temp_aire_c`, `hum_aire_pct` y `semaforo`, como la línea JSON de contratos §6.
- **Estado:**
  - `crearEstado() -> {bandejas:{A:null,B:null,C:null}, activa:null, buffer:[]}`. Cada bandeja guardada es `{lectura, hora:'HH:MM', origen:'vivo'|'grabada'}`.
  - `elegirBandeja(estado, letra) -> estado`: la deja activa, vacía el buffer y borra lo guardado de esa bandeja (volver a medir).
  - `registrarLectura(estado, lectura, ahora: Date) -> estado`: suma al buffer (máximo 10). Si hay bandeja activa y `estaEstable(buffer)`, la guarda con `origen:'vivo'` y deja `activa = null`.
  - `guardarGrabada(estado, letra, lectura, ahora) -> estado`: guarda al instante con `origen:'grabada'`.
  - `reiniciar() -> crearEstado()`.
- **Estabilidad:**
  - `estaEstable(buffer, umbralC = 0.3, n = 5) -> boolean`.
  - `progresoEstabilidad(buffer, umbralC = 0.3, n = 5) -> number` entre 0 y 1: `len/n` si faltan lecturas; 1 si está estable; 0,9 si no.
- **Datos:**
  - `lecturaGrabada(demo, letra) -> Lectura|null`: la última lectura de `demo.bandejas[CLAVE_GRABADA[letra]]`.
  - `umbralSalitre(demo) -> number`: `demo.meta.umbrales.conductividad_salitre_raw`, o 700.
  - `fraseCierre(bandejas, umbral) -> string|null`.
  - `zonaDesdeParametro(valor, zonasValidas: string[], porDefecto = 'zona_2_secano_este') -> string`.
  - `letraDesdeTecla(key: string) -> 'A'|'B'|'C'|'R'|'F'|null`.
  - `aireSatelite(clima, zonaId, mes: 1..12) -> {tmax_c:number, nombreZona:string}|null`, con el mes del período normal de `clima.zonas[zonaId]`.

- [ ] **Paso 1: escribir las pruebas que fallan** en `tests/kit-logica.test.js` (`node:test` + `node:assert/strict`, carga con `require('../web/kit-logica.js')`):

```js
const L = (t) => ({temp_suelo_c: t, agua_raw: 400, luz_raw: 500, temp_aire_c: 30, hum_aire_pct: 40, semaforo: 'verde'});
test('estable con 5 lecturas que varían menos de 0,3 °C', () => assert.equal(K.estaEstable([L(50),L(50.1),L(50.2),L(50.1),L(50)]), true));
test('no estable con menos de 5 lecturas', () => assert.equal(K.estaEstable([L(50),L(50),L(50),L(50)]), false));
test('no guarda si no se estabiliza', () => {
  let e = K.elegirBandeja(K.crearEstado(), 'A');
  for (const t of [40,42,44,46,48,50]) e = K.registrarLectura(e, L(t), new Date(2026,10,15,14,31));
  assert.equal(e.bandejas.A, null); assert.equal(e.activa, 'A'); assert.ok(K.progresoEstabilidad(e.buffer) < 1);
});
test('guarda sola al estabilizarse', () => {
  let e = K.elegirBandeja(K.crearEstado(), 'A');
  for (const t of [52,52.1,52,51.9,52]) e = K.registrarLectura(e, L(t), new Date(2026,10,15,14,31));
  assert.equal(e.bandejas.A.lectura.temp_suelo_c, 52); assert.equal(e.bandejas.A.hora, '14:31');
  assert.equal(e.bandejas.A.origen, 'vivo'); assert.equal(e.activa, null);
});
test('elegir de nuevo la misma bandeja la vuelve a medir', () => {
  let e = K.guardarGrabada(K.crearEstado(), 'B', L(31), new Date());
  e = K.elegirBandeja(e, 'B'); assert.equal(e.bandejas.B, null); assert.equal(e.activa, 'B');
});
test('frase de cierre con A y C', () => {
  const b = {A:{lectura:L(52)}, B:null, C:{lectura:L(33)}};
  assert.match(K.fraseCierre(b, 700), /19 °C más caliente que el cubierto/);
  assert.match(K.fraseCierre(b, 700), /satélite no lo ve/);
});
test('frase de cierre suma salitre si B supera el umbral', () => {
  const b = {A:{lectura:L(52)}, B:{lectura:{...L(31), agua_raw: 880}}, C:{lectura:L(33)}};
  assert.match(K.fraseCierre(b, 700), /posible salitre/);
});
test('frase de cierre honesta si casi no hay diferencia', () =>
  assert.match(K.fraseCierre({A:{lectura:L(33.4)}, B:null, C:{lectura:L(33)}}, 700), /casi lo mismo/));
test('sin A o sin C no hay frase', () => assert.equal(K.fraseCierre({A:{lectura:L(52)}, B:null, C:null}, 700), null));
test('lectura grabada y umbral por defecto', () => {
  const demo = {meta:{umbrales:null}, bandejas:{A_pelada_seca:[L(50), L(52)], B_salitrosa:[], C_rastrojo:[]}};
  assert.equal(K.lecturaGrabada(demo, 'A').temp_suelo_c, 52); assert.equal(K.lecturaGrabada(demo, 'B'), null);
  assert.equal(K.umbralSalitre(demo), 700);
  assert.equal(K.umbralSalitre({meta:{umbrales:{conductividad_salitre_raw: 650}}}), 650);
});
test('zona por parámetro, con valor por defecto', () => {
  const v = ['zona_1_riego_salitre','zona_2_secano_este'];
  assert.equal(K.zonaDesdeParametro('zona_1_riego_salitre', v), 'zona_1_riego_salitre');
  assert.equal(K.zonaDesdeParametro('cualquiera', v), 'zona_2_secano_este');
  assert.equal(K.zonaDesdeParametro(null, v), 'zona_2_secano_este');
});
test('teclas en mayúscula o minúscula', () => {
  assert.equal(K.letraDesdeTecla('a'), 'A'); assert.equal(K.letraDesdeTecla('C'), 'C');
  assert.equal(K.letraDesdeTecla('r'), 'R'); assert.equal(K.letraDesdeTecla('x'), null);
});
test('aire del satélite para el mes', () => {
  const clima = {zonas:{z:{nombre:'Secano', periodos:{normal:{meses:[...Array(12)].map((_, i) => ({mes:i+1, tmax_c:20+i}))}}}}};
  assert.deepEqual(K.aireSatelite(clima, 'z', 11), {tmax_c:30, nombreZona:'Secano'});
  assert.equal(K.aireSatelite(clima, 'otra', 11), null);
});
```

- [ ] **Paso 2: correr las pruebas para ver que fallan.** Comando: `node --test tests/` · Esperado: FALLAN con "Cannot find module '../web/kit-logica.js'".

- [ ] **Paso 3: implementar `web/kit-logica.js`** con las funciones de Interfaces. Detalles:
  - Envolverlo para que funcione en los dos lados: `(function(){ ... if (typeof module !== 'undefined') module.exports = K; else window.KitLogica = K; })();`.
  - Hora con `toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit', hour12:false})`.
  - **Frase de cierre:** `d = round(A − C)`.
    - Si `d >= 1`: `El suelo pelado está ${d} °C más caliente que el cubierto. El satélite no lo ve: mide el aire de 50 km.`
    - Si no: `Pelado y cubierto marcan casi lo mismo (${d} °C): falta que la lámpara caliente las bandejas.`
    - Si `B.lectura.agua_raw >= umbral`, se suma: ` En la bandeja salitrosa, la conductividad muy alta avisa posible salitre.`

- [ ] **Paso 4: correr las pruebas para ver que pasan.** Comando: `node --test tests/` · Esperado: todas en PASS (13 pruebas).

- [ ] **Paso 5: commit.** `git add web/kit-logica.js tests/kit-logica.test.js && git commit -m "Logica de la pantalla del kit con pruebas"`

### Task 2: Pantalla del kit `web/kit.html`

**Archivos:**
- Crear: `web/kit.html`, `web/kit.css`, `web/kit.js`

**Interfaces:**
- **Usa:** todo `KitLogica` (Tarea 1), `window.BioSatArduino` (contratos §6), `data/clima_zonas.json` y `data/arduino_bandejas_demo.json`.
- **Produce:**
  - la página `web/kit.html?zona=<zona_id>`, que la Tarea 4 enlaza;
  - un link "Del kit al campo" que apunta a `campo.html`, que hace la Tarea 3;
  - un link "Volver a la app" que apunta a `index.html`.

- [ ] **Paso 1: escribir el marcado de `web/kit.html`.**
  - **Head:** `<title>BioSat · Pantalla del kit</title>`, las mismas fuentes de Google que `index.html` y `kit.css`.
  - **Scripts:** el lector (`defer`, `onerror="this.remove()"`), `kit-logica.js` y `kit.js` (`defer`).
  - **Encabezado:** "BioSat · Espacio contra tierra · {nombre de la zona}" con los botones "Conectar Arduino", "Pantalla completa (F)", "Reiniciar (R)", "Del kit al campo" y "Volver a la app".
  - **Tres tarjetas** `<section class="bandeja" data-letra="A|B|C">`, con nombre, temperatura en grande, humedad y conductividad, luz, aire, semáforo, estado y una barra de progreso.
  - **Tres botones** "A · Pelada y seca", "B · Salitrosa" y "C · Con rastrojo", con `data-elegir`.
  - **Franja del satélite** (`#satelite`), **frase de cierre** (`#cierre`, `hidden` hasta que haya frase) y **ayuda de teclas**: "Teclas: A, B, C para elegir bandeja · R reinicia · F pantalla completa".

- [ ] **Paso 2: escribir `web/kit.css`.**
  - **Tema:** único, oscuro y de alto contraste: fondo `#10161a`, tarjetas `#1b2622`, texto `#e8eee9`, borde "en vivo" `#f2c14e`, rojo `#B42318`, verde `#2F7D32`. Tipografías Barlow Condensed para los números y Hanken Grotesk para el texto, con los mismos respaldos que la app.
  - **Tamaños:** temperatura con `font-size: clamp(56px, 9vw, 140px)`, frase de cierre `clamp(22px, 3vw, 40px)`.
  - **Distribución:** tarjetas en una fila de 3 columnas; en una sola columna por debajo de 700 px.

- [ ] **Paso 3: escribir `web/kit.js`.**
  - **Al cargar:** lee los dos JSON con `fetch` (los dos tolerantes a error). La zona sale de `zonaDesdeParametro(new URLSearchParams(location.search).get('zona'), Object.keys(clima.zonas))`.
  - **Franja del satélite:** `aireSatelite(clima, zona, new Date().getMonth()+1)`, como "Satélite (NASA POWER, celda de 50 km): máxima media del aire en {mes} {tmax} °C".
  - **Elegir bandeja:**
    - **Sin Arduino conectado:** si hay lectura grabada, `guardarGrabada`; si no, la tarjeta queda "sin lectura".
    - **Con Arduino conectado:** `elegirBandeja`.
  - **Teclado:** escucha `keydown`, ignora `e.repeat` y usa `letraDesdeTecla`.
  - **Botón del Arduino:**
    - Se habilita si `window.BioSatArduino?.soportado()`; si no, queda deshabilitado con el `title` "Este navegador no permite leer el puerto USB: usá Chrome o Edge" o "Falta el lector de Sara (arduino/lector-web-serial.js)".
    - Al conectar, cada lectura pasa por `registrarLectura`.
  - **Pantalla completa:** con `requestFullscreen` y el rechazo atrapado.
  - **Dibujar:** una función `dibujar(estado)` pinta las tarjetas.
    - Estados: vacía "esperando", activa "en vivo · estabilizando" con la barra de `progresoEstabilidad`, guardada "guardada HH:MM" o "lectura grabada".
    - Cierre: `fraseCierre(estado.bandejas, umbralSalitre(demo))` en `#cierre`, visible solo si no es `null`.

- [ ] **Paso 4: verificar con un arnés en Chrome sin ventana** (copia descartable en el scratchpad, que no se sube):
  - **Verificación 1:** servir el repo y abrir `kit.html` con `--dump-dom`. Esperado:
    - las 3 tarjetas;
    - "sin lectura" al elegir, con las plantillas en `null`;
    - el botón del Arduino deshabilitado;
    - la franja del satélite con la máxima de noviembre de la Zona 2;
    - sin errores de carga.
  - **Verificación 2:** en una copia con lecturas grabadas de prueba (A 52 °C, B 31 °C con `agua_raw` 880, C 33 °C), una página arnés carga `kit.html` en un iframe y simula las teclas `a`, `b` y `c`. Esperado:
    - las 3 tarjetas "lectura grabada";
    - `#cierre` con "19 °C más caliente" y "posible salitre".
  - **Verificación 3:** con un lector falso (`soportado:()=>true` y `conectar` que manda 5 lecturas estables), elegir A deja la tarjeta "guardada".
  - **Verificación 4:** con el ancho de iframe en 390 px, sin desbordes horizontales.

- [ ] **Paso 5: commit.** `git add web/kit.html web/kit.css web/kit.js && git commit -m "Pantalla del kit para la mesa del jurado"`

### Task 3: Guía "Del kit al campo" `web/campo.html`

**Archivos:**
- Crear: `web/campo.html`, `web/campo.css`

**Interfaces:**
- **Usa:** los tokens de color y las tipografías de `web/estilos.css` (se enlaza primero) para seguir el tema de la app.
- **Produce:** la página `web/campo.html`, enlazada desde `kit.html` (Tarea 2) y desde la app (Tarea 4).

- [ ] **Paso 1: escribir `web/campo.html`** con el contenido exacto del diseño de la guía (secciones 1 a 5).
  - **Recorrido:** título, frase de enlace y diagrama de 4 nodos (HTML y CSS, sin imágenes).
  - **Contenido:** los 5 pasos numerados, la tabla de lo que hace falta por estación con los costos "a confirmar" y el recuadro "Lo que no reemplaza".
  - **Enlaces:** "Volver a la pantalla del kit" (`kit.html`) y "Volver a la app" (`index.html`).
  - **Head:** `<title>BioSat · Del kit al campo</title>`.

- [ ] **Paso 2: escribir `web/campo.css`.**
  - Diagrama en fila que pasa a columna por debajo de 700 px.
  - Pasos en 5 columnas, después 2 columnas y después 1.
  - Textos grandes para leer de lejos.
  - Todo con los tokens de `estilos.css` (`--bg`, `--surface`, `--ink`, `--accent`, `--line`, `--muted`), así funcionan el tema claro y el oscuro.

- [ ] **Paso 3: verificar en Chrome sin ventana.** Esperado:
  - `--dump-dom` con los 5 pasos y la tabla;
  - sin desbordes a 390 px (iframe del arnés);
  - con `--host-resolver-rules` que bloquean todo lo externo, la página se ve completa.

- [ ] **Paso 4: commit.** `git add web/campo.html web/campo.css && git commit -m "Guia Del kit al campo"`

### Task 4: Enlaces desde la app y documentación

**Archivos:**
- Modificar:
  - `web/index.html` (panel del sensor, al lado de `#btnArduino`);
  - `web/app.js` (función `renderPaneles`);
  - `docs/contratos-de-datos.md` §6;
  - `planes/1-enzo.md`;
  - `docs/reglas-y-bitacora.md`;
  - `scripts/actualizar_readme.py` (`DESCRIPCIONES`).

**Interfaces:**
- **Usa:** `web/kit.html?zona=` (Tarea 2) y `web/campo.html` (Tarea 3).

- [ ] **Paso 1: botones en el panel del sensor.**
  - En `web/index.html`, sumar debajo de `#btnArduino` dos enlaces con aspecto de botón: `<a class="btn" id="linkKit" href="kit.html">Pantalla del kit</a>` y `<a class="capa" href="campo.html">Del kit al campo</a>`.
  - En `renderPaneles()` de `web/app.js`, actualizar `#linkKit` con `href = 'kit.html?zona=' + state.zona`.

- [ ] **Paso 2: contratos §6.** Sumar que `meta.umbrales` de `data/arduino_bandejas_demo.json` puede traer `{"conductividad_salitre_raw": N}`, usado por la pantalla del kit (700 si falta).

- [ ] **Paso 3: plan, bitácora y README.**
  - En `planes/1-enzo.md`, sumar y tildar: "Pantalla del kit para la mesa del jurado (`web/kit.html`)" y "Guía Del kit al campo (`web/campo.html`)".
  - En la bitácora, sumar **D-27**: pantalla del kit, guía y Arduino Uno por USB para la demo.
  - En el README (`DESCRIPCIONES`), sumar descripciones para `web/kit.html`, `web/kit.js`, `web/kit-logica.js`, `web/kit.css`, `web/campo.html`, `web/campo.css` y `tests`.

- [ ] **Paso 4: verificar.** `node --test tests/` en PASS, `node --check` de los 3 archivos JS y `--dump-dom` de `index.html` con `#linkKit` apuntando a `kit.html?zona=zona_2_secano_este`.

- [ ] **Paso 5: commit y push a `enzo-app`.** `git commit -m "Enlaces a la pantalla del kit y la guia; documentacion (D-27)" && git push origin enzo-app`
