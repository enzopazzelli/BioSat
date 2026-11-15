# Plan: que la app no muestre cosas falsas en la demo (D-33)

> **Para quien lo tome** (Vale preguntó por esta tarea). Lo puede hacer una persona o un agente. Conviene terminarlo **antes del congelamiento (domingo 15:00)**.
>
> **Pedido de Enzo (15/11):** "que la app no muestre cosas falsas en la demo". No se trata de medir datos nuevos, sino de que la app diga bien lo que ya hay.
>
> **Falta decidir** cuál de las 3 formas de arreglar el problema 1 se usa (ver más abajo). La recomendada es la 1. Si nadie decide otra cosa, se hace la 1.

---

## El problema

Salió del repaso de los datos del 15/11 a la mañana. Son 4 cosas que el jurado puede ver en la app y que no son ciertas o no se entienden.

### 1. El satélite no mide "suelo pelado", y la app dice que sí (el más grave)

- **Qué mide de verdad:** `ia_desmonte/suelo_pelado.py` marca un lote como "pelado" cuando su NDVI mediano del mes es menor a **0,25**. Un NDVI bajo quiere decir **poca vegetación verde**, y eso incluye el suelo pelado, **el rastrojo y el pasto seco**. El propio JSON lo avisa (`data/diagnostico_landsat_ia.json`, `meta.notas`): "El NDVI no distingue el suelo pelado del rastrojo".
- **No hay forma de medir la exactitud:** no hay datos de campo. Por eso `evaluacion.metodos.umbral_ndvi.exactitud` y `f1` están en `null`, **y eso es correcto: no hay que llenarlos**.
- **El número depende mucho del umbral.** Fracción de lotes "pelados" en **noviembre**, con los 3 umbrales que ya calcula el pipeline:

  | Zona | NDVI < 0,20 | NDVI < 0,25 (el que usa la app) | NDVI < 0,30 | Meses "dudosos" en el año |
  |---|---|---|---|---|
  | 1 · Riego del Río Dulce | 7 % | 44 % | 61 % | 5 |
  | 2 · Secano del este | 11 % | 84 % | 92 % | 7 |
  | 3 · Monte semiárido | 14 % | 79 % | 90 % | 7 |
  | 4 · Bajos submeridionales | 6 % | 67 % | 80 % | 7 |
  | 5 · Sur serrano | 1 % | 38 % | 61 % | 5 |

  Un mes es "dudoso" (`meses_dudosos`) cuando, con otro umbral, cambiaría de pelado a cubierto o al revés. En **todas** las zonas, **cada mes que la app muestra como pelado es dudoso** (zonas 2 y 3: septiembre a diciembre; zona 4: octubre a diciembre; zona 5: octubre; la zona 1 no tiene meses pelados).
- **Dónde la app lo presenta como cierto:**
  - **Semáforo del Inicio** (`web/app.js:695`, `datosInicio`): toma `fraccion_pelado` del mes y la pasa a `semaforoZona` (`web/inicio-logica.js:64`), con cortes de 25 % y 50 % (`inicio-logica.js:45`). El texto (`inicio-logica.js:15`) dice "unos {n} de cada 10 lotes de la zona **tienen el suelo pelado**". Ejemplo: la Zona 2 en noviembre da **CUIDADO** con 0,25; con 0,20 esa señal daría **BIEN**.
  - **Reporte, sección 1** (`web/app.js:792`): el mismo semáforo, aplicado a cada mes.
  - **Reporte, sección 4** (`#satelite`): la tira de meses (`web/app.js:514-517`, con los textos "suele estar pelado" y "suele estar cubierto") y el texto de arriba (`web/index.html:210` y `web/completo.html:143`).
  - **Explicación del semáforo** (`web/index.html:318`): "lotes con el suelo pelado".
  - **Visor** (`web/index.html:185` y `web/completo.html:105`): "en invierno, los lotes pelados".
- **La app no usa `meses_dudosos`** en ningún lado.

### 2. La tabla de métodos muestra métodos que nunca se corrieron

`web/app.js:520-528` (Reporte, sección 4, y vista detallada):

- La tabla tiene 3 filas fijas, **"Umbral de NDVI y NBR"**, **"CNN + LSTM"** y **"CNN + Transformer"**, todas con "—". Son nombres del prototipo simulado (D-30). Ninguno se corrió.
- El método real se llama `umbral_ndvi`, y no está en la lista. Por eso la nota de abajo dice **"Método usado: sin definir"**.

### 3. Textos que nombran fuentes que no se usan

- `web/app.js:303`: "La serie anual sale del mapa de desmontes (LART, **MapBiomas** o Hansen)". Sale solo de Hansen v1.13 (`data/desmonte_zonas.json`, `meta.fuente`).
- `web/app.js:510`: "Los carga Santi desde AIZAL V4 (SoilGrids, TerraClimate, **MapBiomas**)". Solo aparece si no carga el suelo, pero es falso.
- `web/app.js:528`: "Lo calcula Santi con etiquetas reales de **MapBiomas Chaco**". Solo aparece si no carga el diagnóstico, pero es falso: no hay etiquetas.

### 4. Los grupos AIZAL no tienen nombre y la app los llama "AIZAL"

- `web/app.js:263` muestra "Zonificación AIZAL: grupo 2". El número no le dice nada a nadie.
- `nombre` está en `null` a propósito (`ia_desmonte/zonificacion.py:71`): según `meta.notas`, "el nombre de cada grupo lo pone el equipo mirando su perfil". Nadie lo puso todavía.
- No es la zonificación AIZAL oficial: es un k-means del equipo con las **mismas variables** que AIZAL V4. Decir "Zonificación AIZAL" puede hacer creer que es la oficial.

### Lo que NO es un problema (no tocar)

- **Monte nativo** (`suelo_zonas.json`, `monte_nativo_pct`): el valor está en las 5 zonas (de 20 % a 61 %). Lo que está en `null` son la mediana, el rango y la cantidad de píxeles, que no se aplican a un porcentaje de área.
- **Meses de suelo pelado de cada rotación** (`web/index.html:51` y `web/app.js:69`, `98`, `491`, `573`, `582`, `594`, `626`): salen del calendario de cada rotación que cargó Vale (la letra `D`), no del satélite. Ahí "suelo pelado" es correcto: es lo que la rotación hace con el lote.
- **`exactitud` y `f1` en `null`:** están bien así. **No inventar números** (regla 1 del proyecto).

---

## Formas de arreglar el problema 1 (elegir una)

Ejemplo con la Zona 2 en noviembre, que hoy muestra `CUIDADO · unos 8 de cada 10 lotes de la zona tienen el suelo pelado`.

### Forma 1 · Llamarlo por lo que mide (recomendada, unos 45 min)

```
CUIDADO · lotes sin verde
Unos 8 de cada 10 lotes de la zona están sin verde (pelados o con rastrojo seco).
```

- **Qué cambia:** solo los textos. La lógica, los umbrales y los números quedan iguales. En "Para tu ingeniero" se suma cuánto cambia el número con otro umbral.
- **A favor:** lo que dice pasa a ser cierto. El semáforo conserva sus 4 señales (D-31) y es el arreglo más rápido.
- **En contra:** la señal sigue dependiendo de un umbral elegido por el equipo. Pero eso ya se aclara en la app: "los umbrales son un criterio del equipo".

### Forma 2 · Mostrar la duda (1 a 1,5 h)

```
ATENCIÓN · puede haber suelo pelado
Entre 1 y 9 de cada 10 lotes, según cómo se lea la imagen.
```

- **Qué cambia:** en los meses dudosos, la señal no pasa de ATENCIÓN y muestra el rango de los 3 umbrales. La tira de meses dibuja distinto los meses dudosos. Hay que cambiar la lógica de `inicio-logica.js` y sus pruebas.
- **A favor:** es la más honesta con la incertidumbre.
- **En contra:** el rango es tan amplio que no le dice nada al productor, y frente al jurado puede parecer que el dato no sirve. Lleva más tiempo.

### Forma 3 · Sacar el suelo pelado del semáforo (unos 45 min)

- **Qué cambia:** el semáforo queda con 3 señales de clima (falta de agua, calor y heladas). La tira de meses de la sección 4 se queda, con el aviso "estimación sin validar".
- **A favor:** el semáforo no depende de nada dudoso.
- **En contra:** se pierde la señal más ligada al problema central de BioSat (el suelo pelado), y el semáforo de D-31 pasa de 4 señales a 3.

---

## Arreglos que van con cualquier forma

1. **Tabla de métodos** (`web/app.js:520-528`):
   - Dejar una sola fila con el método real: `{umbral_ndvi: 'Umbral de NDVI (0,25)'}`.
   - Mostrar "sin medir" en lugar de "—" cuando la exactitud o el F1 son `null`.
   - Sumar a la nota el texto de `DIAG.evaluacion.datos_de_prueba` ("sin datos de campo: no hay exactitud medible"). Con la clave nueva, "Método usado" deja de decir "sin definir".
2. **Textos con fuentes falsas:**
   - `app.js:303`: usar la fuente del JSON (`DESMONTE.meta.fuente`) o escribir "Hansen v1.13".
   - `app.js:510`: dejar "Sin datos de suelo todavía (SoilGrids 2.0)".
   - `app.js:528`: dejar "Sin datos de suelo pelado para esta zona".
3. **Grupos AIZAL:**
   - En `web/app.js:263`, cambiar "Zonificación AIZAL: grupo X" por "Zonificación con las variables de AIZAL: {nombre}".
   - Ponerles nombre a los grupos. Abajo hay una propuesta, sacada del perfil de cada grupo. **La confirman Santi o Vale antes de subirla.**

### Propuesta de nombres para los grupos (a confirmar)

Perfil medio de cada grupo (`data/zonificacion_aizal.json`). En negrita, el valor en el que el grupo se distingue de los otros 4.

| Grupo | Área | Lluvia (mm) | Déficit (mm) | Tmáx / Tmín (°C) | Arcilla / Arena (%) | Carbono (g/kg) | Pendiente (°) | Domina en | Nombre propuesto |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 38 % | 620 | 941 | **35,0 / 7,1** | 23 / 34 | 15,2 | 0,07 | Zona 3 (85 %) y Zona 2 (55 %) | Llanura cálida y seca |
| 1 | 28 % | **587** | **979** | 34,7 / 5,0 | 18 / **44** | 13,1 | 0,12 | Zona 1 (59 %) y Zona 5 (49 %) | Llanura seca y arenosa |
| 2 | 21 % | **771** | **771** | 34,1 / 5,8 | **31** / 21 | 16,0 | 0,09 | Zona 4 (59 %) | Llanura húmeda y arcillosa |
| 3 | 10 % | 661 | 858 | 33,3 / **4,5** | 20 / 36 | 14,4 | **0,70** | — | Con relieve y más fresco (¿sierras?) |
| 4 | 2 % | 737 | 797 | 33,8 / 5,3 | 27 / 29 | **24,8** | 0,09 | — | Suelos con más materia orgánica |

- Los nombres solo describen el perfil, para que sean ciertos por construcción. Los lugares (por ejemplo, si el grupo 3 son las sierras de Guasayán, Ambargasta y Sumampa, o si el grupo 4 son bañados) **hay que confirmarlos mirando el mapa** (`data/imagenes/`, capa "Zonas AIZAL" del visor) antes de nombrarlos así.
- **Dónde van los nombres:** en un diccionario `NOMBRES = {0: '...', ...}` dentro de `armar_json` (`ia_desmonte/zonificacion.py:71`), para que la próxima corrida no los borre. Los números de grupo son estables: el k-means usa una semilla fija y la muestra queda guardada en `ia_desmonte/salidas/zonificacion_muestra.csv`. Si no hay acceso a Earth Engine para correr de nuevo, se escriben los mismos nombres a mano en `data/zonificacion_aizal.json` y se deja anotado en la bitácora.

---

## Pasos (con la forma 1)

1. **Rama:** trabajar en tu rama con `main` al día. Para Vale: `git switch vale-rotaciones` y `git merge origin/main`, porque la rama tiene 41 commits de atraso.
2. **Textos del semáforo** (`web/inicio-logica.js`). La clave `pelado`, los umbrales y la lógica no se tocan:
   - línea 15: `'unos {n} de cada 10 lotes de la zona están sin verde (pelados o con rastrojo seco)'`;
   - línea 22: `'Si tu lote está pelado, conviene cubrirlo: un rastrojo o una cobertura lo protegen del sol y del viento.'`;
   - línea 30: `pelado: 'lotes sin verde'`.
3. **Explicación del semáforo** (`web/index.html:318`): cambiar "lotes con el suelo pelado" por "lotes sin verde (pelados o con rastrojo seco: el satélite no los distingue)".
4. **Sección 4 y visor:**
   - `web/index.html:210` y `web/completo.html:143`: "Meses en que la mayoría de los lotes de tu zona se ven sin verde en las imágenes (pelados o con rastrojo seco):".
   - `web/app.js:516`: "suele verse sin verde" y "suele verse verde".
   - `web/index.html:185` y `web/completo.html:105`: "en invierno, los lotes sin verde".
5. **Para tu ingeniero** (plegable de la sección 4, `#satelite`): sumar una línea calculada con los datos, sin números fijos en el código. Por ejemplo: "Con un umbral de NDVI de 0,20, en {mes} se ven sin verde {a} de cada 10 lotes; con 0,30, {b}. No hay datos de campo para elegir el umbral." Los datos están en `fraccion_pelado_umbral_020` y `fraccion_pelado_umbral_030`.
6. **Arreglos comunes:** los 3 de la sección anterior (tabla de métodos, textos con fuentes falsas, grupos AIZAL).
7. **Pruebas:**
   - Ampliar la prueba de `tests/vistas.test.js:105` ("los textos viejos") para que falle si vuelven a aparecer `CNN + LSTM`, `MapBiomas`, `LART` o "tienen el suelo pelado" en `web/app.js` o `web/inicio-logica.js`.
   - Si se ponen los nombres, sumar en `tests/datos-contratos.test.js:38` que cada grupo tenga `nombre` de texto.
   - Las pruebas de lógica de `tests/inicio-logica.test.js` deberían seguir pasando, porque la clave `pelado` no cambia. Si alguna compara textos, actualizarla.
   - Correr `node --test "tests/*.test.js"`: hoy son 112 y tienen que quedar todas en verde.
8. **Mirarlo como lo va a ver el jurado:**
   - Servir la app con `python -m http.server 8000`.
   - Sacar capturas a 390 px de la Zona 2:
     ```
     ZONA=zona_2_secano_este node scripts/captura-movil.mjs "http://localhost:8000/web/index.html" inicio.png
     ZONA=zona_2_secano_este node scripts/captura-movil.mjs "http://localhost:8000/web/index.html#reporte" reporte.png 1400
     ```
   - Revisar el semáforo, la sección 4 y la tabla de métodos. Repetir con la vista detallada (`web/completo.html`).
9. **Inglés (D-35):** si cambiás un texto en español que tiene clave en `web/textos-en.js` (por ejemplo, `senal.pelado`, `accion.pelado` y `razonCorta.pelado` de `inicio-logica.js`, o la tabla de métodos), actualizá también el inglés con el mismo sentido ("fields without green (bare or with dry residue)"). La prueba `tests/textos-en.test.js` avisa si una clave sobra.
10. **Documentar** (regla del proyecto):
   - completar D-33 en `docs/reglas-y-bitacora.md` con la forma elegida y quién la hizo;
   - sumar en `docs/contratos-de-datos.md` §3 que `meses_suelo_pelado` y `fraccion_pelado` miden "sin verde" (pelado o rastrojo seco);
   - actualizar `docs/estado-del-proyecto.md`;
   - regenerar el README con `python -X utf8 scripts/actualizar_readme.py`;
   - si cambian los nombres AIZAL, regenerar `docs/datos-y-metodos.md` con `ia_desmonte/informe.py`.
11. **Integrar:** pedirle a Enzo que lo integre a `main`, antes de las 15:00.

## Listo cuando

- Ningún texto de la app dice que el satélite ve "suelo pelado"; dice "sin verde (pelado o rastrojo seco)". La excepción son los meses pelados de cada rotación, que salen del calendario de Vale.
- La tabla de métodos muestra solo el umbral de NDVI, con "sin medir", y "Método usado" ya no dice "sin definir".
- No aparecen MapBiomas, LART ni CNN en la app.
- Los grupos se muestran con nombre (confirmado por Santi o Vale) o, si no llegan, como "grupo N" con el texto "con las variables de AIZAL".
- Todas las pruebas en verde y las capturas a 390 px revisadas.
