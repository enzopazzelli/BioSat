# Diseño: sectores del lote con el dron, etapa 2 (D-39)

**Fecha:** domingo 15/11/2026 · **Pedido de:** Enzo · **Base:** etapa 1 (D-38), `docs/superpowers/specs/2026-11-15-lector-dron-design.md` §5.4, y la hoja de ruta de Vale (D-37)

---

## 1. Para qué

La etapa 1 deja **ver** el lote: la imagen del dron, su NDVI y la comparación con la zona. La etapa 2 deja **señalar dónde ir a mirar**. El ingeniero o el asesor encierra en el mapa las manchas que le llaman la atención, las mide, anota qué ve y, cuando recorre el lote, registra qué encontró.

Sigue el circuito de la hoja de ruta (D-37): detectar → verificar en el campo → registrar. Una mancha en el mapa es un sector **para revisar**, no un diagnóstico.

**Para quién (decisión de Enzo, 15/11):** el ingeniero o el asesor que recorre el campo con el celular. Para el jurado sirve igual, porque muestra que la app no confunde una mancha con una causa.

**Vuelo:** se va a probar con un `NDVI.tif` real de un DJI multiespectral, que la etapa 1 ya lee. `fertilizer.tfw` (Zona 1, Capital, unas 50 ha, 1 m por píxel) llegó sin su `.tif`. Por el nombre, puede ser una prescripción de fertilizante de DJI Terra, que **no** es un NDVI. Queda fuera de esta etapa (§2).

## 2. Objetivos, no objetivos y lo que no puede pasar

**Objetivos**
- Marcar sectores sobre el mapa: tocar puntos, deshacer, cerrar y cancelar.
- Ficha de cada sector:
  - número y superficie en hectáreas;
  - NDVI mediano y porcentaje sin cobertura vegetal activa dentro del sector, si hay NDVI;
  - con qué vuelo se midió;
  - **nota** (lo que se ve desde el dron) y **estado** cambiable: *para revisar*, *revisado* o *descartado*;
  - **"Qué se encontró"** (lo que se confirmó en el lote), separado de la nota.
- **Todo queda en el celular, sin internet** (enfoque B, decisión de Enzo): se abre el .tif una vez y después están la imagen, el NDVI, los sectores y la línea del Inicio, aunque se cierre la app o no haya señal. Un sector nuevo marcado en el lote calcula su NDVI en el momento.
- Exportar e importar los sectores en GeoJSON. La lista sale en el PDF del Reporte.
- La línea del Inicio suma cuántos sectores quedan para revisar.

**No objetivos (por ahora)**
- Cuentas, nube o varias personas editando lo mismo: el "expediente por lote" de la hoja de ruta.
- Varios vuelos a la vez, o comparar el mismo sector entre fechas: se guarda **un vuelo**, el último abierto.
- Mover los puntos de un sector ya cerrado: se borra y se vuelve a marcar.
- Guardar el .tif original: se guarda la **versión achicada** que dibuja la app (hasta 2048 px) y su NDVI.
- Mapas de prescripción (dosis por píxel, como podría ser `fertilizer`) y exportar para la maquinaria (M-08).
- Leer un archivo por banda (rojo y NIR sueltos).

**Lo que no puede pasar (D-33)**
- Un sector con un NDVI medido con un vuelo distinto del que se ve, sin decirlo. Cada sector muestra con qué vuelo se midió.
- Perder sectores sin aviso. Si el navegador no puede guardar, lo dice.
- Presentar un sector como causa. El estado inicial es *para revisar*, y la causa va en "Qué se encontró", que la escribe una persona.
- Decir que la imagen está guardada cuando el navegador la borró. Si falta, la app pide volver a abrir el .tif.

## 3. Restricciones

Las mismas de la etapa 1:
- app estática, sin npm;
- celular primero, a 390 px;
- sin internet;
- textos con clave y en inglés (D-35);
- lógica pura con pruebas de `node --test`;
- documentar todo.

Además, **cuánto se puede guardar:**
- `localStorage` guarda unos 5 MB: alcanza para los sectores, no para la imagen.
- La imagen y el NDVI achicados pesan de 10 a 20 MB y van a **IndexedDB**.
- El navegador puede borrar IndexedDB si le falta espacio: la app lo tiene que soportar.

## 4. Enfoques considerados

**Qué se guarda (elegido por Enzo: B)**

| Enfoque | A favor | En contra |
|---|---|---|
| A. Solo sectores y resumen del vuelo, en `localStorage` | Poco código | En el campo no está la imagen si no se reabre el .tif, y los sectores nuevos quedan sin NDVI |
| **B. Además, la imagen y el NDVI achicados, en IndexedDB** | En el lote, sin internet, está todo y los sectores nuevos miden su NDVI | Más código. El navegador puede borrar los datos y hay que detectarlo |

**Cómo dibujar (elegido por Enzo en la etapa 1):** una herramienta propia sobre Leaflet. Se descartó Leaflet.draw porque es viejo y anda peor con el dedo.

## 5. Cómo funciona

### 5.1 Pantalla

Una tarjeta nueva, **"Sectores del lote"**, en la sección 4, debajo de la tarjeta del dron. Se ve siempre, con o sin dron:

```
┌ Sectores del lote ────────────────────────────────┐
│ [ Marcar un sector ]   [ Exportar ]  [ Importar ] │
│                                                   │
│ 1 · Para revisar en el campo              2,4 ha  │
│   NDVI mediano 0,18 · 72 % sin cobertura activa   │
│   (vuelo del 03/11)                               │
│   Nota: mancha clara al norte, ¿anegamiento?      │
│   [Revisado] [Descartado]  [Borrar]               │
│ 2 · Revisado                              0,9 ha  │
│   ...                                             │
│   Qué se encontró: suelo compactado en la entrada │
│                                                   │
│ Se guarda en este navegador. Para pasarlo,        │
│ exportá el archivo.                               │
└───────────────────────────────────────────────────┘
```

**Marcar:**
- Durante el dibujo, la tarjeta muestra "Tocá el mapa para sumar puntos" con **Deshacer punto**, **Cerrar sector** (desde 3 puntos) y **Cancelar**.
- En el mapa se ven los puntos y la línea que los une. Mientras se dibuja, se apaga el zoom con doble toque.
- Al cerrar, el sector se guarda y se abre su ficha para escribir la nota.

**Ficha:**
- La nota y "Qué se encontró" son campos de texto. "Qué se encontró" aparece cuando el estado es *revisado* o *descartado*.
- Los cambios se guardan al salir del campo.
- Tocar un sector en el mapa lleva a su ficha. Tocar un sector de la lista lleva el mapa a ese sector.

**En el mapa:** cada sector es un polígono con su número, con color según el estado: *para revisar* con el acento; *revisado* y *descartado*, apagados.

### 5.2 Lo que se guarda

**Vuelo** (IndexedDB, base `biosat`, almacén `vuelo`, clave `actual`):
- lo que ya tiene el estado de la etapa 1: nombre, bytes, tipo, fecha, EPSG, recuadro, tamaños, metros por píxel, bandas, resumen, zona y departamento;
- además: la imagen dibujada (PNG, como `Blob`), el NDVI achicado (`Float32Array`, o null) con su ancho y alto, un `id` del vuelo (nombre, bytes y fecha) y la fecha en que se guardó.

**Al abrir la app:**
- `dron.js` lee el vuelo guardado y lo restaura **sin mover el mapa**. La caja del dron dice "Vuelo guardado en este navegador: {nombre}" y ofrece **Borrar el vuelo guardado**.
- Si no lo puede guardar (falta de espacio) o leer (lo borró el navegador), lo dice y la app sigue funcionando sin él.

**Sectores** (`localStorage`, `biosat.sectores.v1`): `{version: 1, sectores: [...]}`. Cada sector tiene:
- `id`, número `n` y los puntos `[[lat, lon], ...]` (sin repetir el primero);
- superficie `ha` y `ndvi: {mediana, fraccionBajo, validos}` o null;
- `vuelo: {id, fecha}` o null;
- `nota`, `estado` (`revisar`, `revisado` o `descartado`) y `hallazgo`;
- fechas de creación y de cambio.

**Abrir un vuelo nuevo:** reemplaza al guardado. Los sectores siguen, cada uno con los números de su vuelo. Si un sector se midió con otro vuelo o sin vuelo, la ficha lo dice ("medido con el vuelo del 03/11", "sin NDVI").

### 5.3 Cuentas (lógica pura, con pruebas)

- **Superficie:** proyección local equirectangular a la latitud media y fórmula del área de un polígono, en hectáreas. Para un lote de pocos kilómetros, el error es despreciable frente a lo que se marca con el dedo.
- **NDVI dentro del sector:**
  - se toman los píxeles del NDVI achicado cuyo centro cae dentro del polígono (punto en polígono, sobre el recuadro del vuelo);
  - con esos valores, `resumenNdvi` y el mismo umbral que Landsat (`meta.umbral_ndvi`);
  - si el sector no toca la imagen o no tiene píxeles válidos, el NDVI queda en null y la ficha lo dice.
- **Número de sector:** el siguiente al mayor que existe, así no se repite aunque se borren sectores.

### 5.4 Compartir

**Exportar:**
- Descarga `biosat-sectores-AAAA-MM-DD.geojson`, un `FeatureCollection` de polígonos en latitud y longitud (orden GeoJSON: `[lon, lat]`, anillo cerrado).
- Propiedades de cada sector: `n`, `estado`, `nota`, `hallazgo`, `ha`, `ndvi_mediano`, `fraccion_sin_cobertura`, `umbral_ndvi`, `vuelo_fecha`, `vuelo_archivo`, `creado`, `actualizado`.
- El formato va al contrato de datos (§11, nuevo).

**Importar:**
- Abre un `.geojson` o `.json` y suma sus polígonos como sectores nuevos, renumerados después de los que hay.
- Lo que no es un polígono se saltea, y la app dice cuántos se cargaron y cuántos no.
- No se borra nada de lo que ya había.

**PDF:** la tarjeta de sectores sale en la sección 4, con todos sus campos.

### 5.5 Inicio

La línea del dron suma, si hay sectores para revisar, " · 2 sectores para revisar" (o "1 sector"). Como el vuelo queda guardado, la línea sigue ahí al volver a abrir la app.

### 5.6 Idioma

Todos los textos nuevos van en `DronLogica.TEXTOS` (o en un módulo de sectores con sus `TEXTOS`) y en `web/textos-en.js`.

## 6. Pruebas y verificación

**Pruebas de `node --test`:**
- superficie en hectáreas: un cuadrado de 0,001° a −28° de latitud y un triángulo;
- NDVI en el polígono: una grilla chica con valores conocidos, un polígono afuera y píxeles sin dato;
- número del sector nuevo;
- cambios de estado;
- GeoJSON de ida y vuelta, con un archivo que trae un punto (se saltea) y uno que no es GeoJSON;
- armar y leer el vuelo guardado: el NDVI vuelve como `Float32Array`;
- la línea del Inicio con sectores.

**En el navegador**, con `scripts/captura-movil.mjs`, que suma `EVAL2`: recarga la página y corre un segundo código, para probar que todo se restaura.
- Abrir el archivo de prueba multiespectral.
- Marcar un sector simulando toques en el mapa (`visor.map.fire('click', {latlng})`) sobre la mitad con NDVI 0,5 y otro sobre la mitad con NDVI 0. Medianas esperadas: 0,5 y 0.
- Cambiar el estado y anotar.
- Recargar y comprobar que vuelven la imagen, los sectores y la línea del Inicio.
- Exportar, borrar e importar.
- Borrar el vuelo guardado.
- A 390 px y en la PC, en español y en inglés, sin errores.

**Con el `NDVI.tif` real**, cuando llegue: es el criterio final.

## 7. Lo que queda para quien lo construya

- Si los sectores van en `dron-logica.js` o en un `sectores-logica.js` aparte (recomendado si crece mucho).
- Los colores exactos de los polígonos por estado, siguiendo los tokens de `estilos.css`.
- Cómo se enfoca la ficha al tocar un polígono.
- El texto exacto del aviso cuando falla el guardado.

## 8. Cómo se trabaja

Una rama (`enzo-sectores`) en un worktree, con plan propio. Se integra a `main` con la aprobación de Enzo.
