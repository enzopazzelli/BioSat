# Clases del ingeniero: implementación (D-41)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clasificar el NDVI del vuelo en las tres clases del ingeniero, con cortes y nombres cargados en la app, y mostrar el % por clase en el lote y en cada sector, más una capa con las clases.

**Architecture:**
- **Lógica pura con pruebas:** en `dron-logica.js` (`clasificar`, `validarClases`, `textoClases`) y en `sectores-logica.js` (`valoresEnPoligono`, reusado por `ndviEnPoligono` y por las clases del sector).
- **Interfaz:** en `dron.js` (formulario, guardado con el vuelo, capa de clases), `app.js` (capa del visor y leyenda) y `sectores.js` (línea en la ficha y GeoJSON).

**Spec:** `docs/superpowers/specs/2026-11-15-clases-del-ingeniero-design.md`

## Global Constraints

- **Cortes:** `{cortes: [bajo, alto], nombres: [n1, n2, n3]}`, con −1 ≤ bajo < alto ≤ 1 y nombres no vacíos.
- **Bordes:** `v < bajo` es la clase 0, `bajo ≤ v < alto` la clase 1 y `v ≥ alto` la clase 2. NaN no cuenta.
- **Colores de las clases:** `#a50026` (0), `#fee08b` (1) y `#1a9850` (2).
- **Dónde se guarda:** las clases van en `estado.clases` del dron, así que quedan en el paquete del vuelo (IndexedDB) sin tocar el formato. Un vuelo nuevo arranca sin clases.
- **Texto de ejemplo** del formulario: "Maleza", "Zona afectada" y "Vigoroso" (lo dijo el ingeniero para este lote). No se aplica nada sin tocar "Aplicar".
- Textos de la interfaz en `DronLogica.TEXTOS` y `SectoresLogica.TEXTOS`, con su inglés. Commits sin `Co-Authored-By`. Rama `enzo-clases`.

## Review Focus

1. **Cortes inválidos** (bajo ≥ alto, vacío o un número fuera de rango): mensaje en el formulario y nada se aplica. Prueba de `validarClases` (tarea 1) y en el navegador (tarea 2).
2. **Un vuelo sin NDVI** (foto RGB): el bloque no aparece. Prueba en el navegador (tarea 2).
3. **Recargar con clases aplicadas:** vuelven el % y la capa. Prueba en el navegador con `EVAL2` (tarea 2).
4. **Un sector sin píxeles válidos:** sin línea de clases y sin errores. Prueba de lógica (tarea 1).
5. **Abrir otro vuelo:** las clases del vuelo anterior no se arrastran. Prueba en el navegador (tarea 2).

### Task 1: Lógica de las clases

- **Pruebas** (en `tests/dron-logica.test.js` y `tests/sectores-logica.test.js`):
  - `clasificar(Float32Array [0.1, 0.25, 0.5, 0.6, 0.9, NaN], [0.25, 0.6])` → `{conteos: [1, 2, 2], total: 5, porcentajes: [20, 40, 40]}`;
  - `validarClases` acepta `{cortes: [0.25, 0.6], nombres: ['Maleza', 'Zona afectada', 'Vigoroso']}` y rechaza `[0.6, 0.25]`, `[0.2, 1.5]`, `[NaN, 0.5]` y un nombre vacío. Devuelve `{ok, error}`, con `error` igual a una clave de `TEXTOS`;
  - `textoClases(c, {conteos, total, porcentajes})` → `'Maleza 20 % · Zona afectada 40 % · Vigoroso 40 %'`;
  - `valoresEnPoligono` devuelve los 4 valores de la mitad izquierda de la grilla de prueba de D-39, y `ndviEnPoligono` sigue dando lo mismo;
  - con un polígono afuera, `valoresEnPoligono` devuelve un arreglo vacío.
- **Implementar**, con el inglés de las claves nuevas.
- **Commit:** `"D-41: logica de las clases del ingeniero (clasificar, validar, texto y valores dentro de un sector)"`

### Task 2: Formulario, capa, sectores y guardado

- **Prueba de la página:** `index.html` no necesita marcado nuevo, porque el bloque lo dibuja `dron.js` dentro de `#dronFicha`, en un `#dronClases` que se agrega a la tarjeta. Prueba en `vistas.test.js`: existe `id="dronClases"` en `index.html`.
- **`dron.js`:**
  - `ponerClases(c)` y `quitarClases()`, que guardan con `avisar('cambio')`;
  - la capa de clases (`estado.urlClases`, en un canvas con los 3 colores), que se vuelve a armar al restaurar;
  - `BioSatDron.clases()` → `{c, resumen}|null`.
- **`app.js`:**
  - el formulario (2 inputs numéricos y 3 de texto, con "Aplicar" y "Borrar clases") y el texto con el % en la tarjeta;
  - la capa `dron_clases` en el visor, con una leyenda propia (`#leyendaClases`) que da los 3 nombres y sus rangos.
- **`sectores.js`:** en la ficha, "Clases: …" con `clasificar(valoresEnPoligono(...))`, si hay clases y NDVI. En el GeoJSON, la propiedad `clases: {nombres, cortes, porcentajes}`.
- **En el navegador** (archivo multiespectral de prueba, cortes 0,25 y 0,6):
  - tarjeta: `Maleza 30 % · Zona afectada 70 % · Vigoroso 0 %`;
  - capa y leyenda;
  - sector sobre la mitad izquierda: `Maleza 0 % · Zona afectada 100 % · Vigoroso 0 %`;
  - cortes inválidos: mensaje;
  - recargar: vuelven las clases;
  - otro vuelo: sin clases;
  - foto RGB: sin bloque;
  - en inglés.

  Después, con el `NDVI.tif` real y cortes de prueba.
- **Commit:** `"D-41: clases del ingeniero en la tarjeta, el visor y los sectores, guardadas con el vuelo"`

### Task 3: Documentación

- **Bitácora D-41**, contrato §11 (`clases` en el GeoJSON), estado, plan de Enzo y README. Suites completas.
- **Commit:** `"D-41: documentacion de las clases del ingeniero"`
