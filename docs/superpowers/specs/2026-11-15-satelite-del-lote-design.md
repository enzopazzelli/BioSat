# Diseño: rótulo honesto de Landsat y recorte satelital del lote (D-40)

**Fecha:** domingo 15/11/2026 · **Pedido de:** Enzo ("que el Landsat mejore la imagen porque no se ve en muy buena calidad; el lote del .tif queda abajo del recuadro punteado") · **Base:** D-38 y D-39 (dron), D-30 (imágenes de Earth Engine)

---

## 1. Para qué

**Lo que se encontró (15/11):**
- Las imágenes de Landsat del visor se exportaron de 640 px de ancho para cubrir unos 80 km (`ia_desmonte/imagenes.py`, `ANCHO = 640`): **cada píxel mide unos 125 m**, no 30 m. El rótulo "Landsat · 30 m" exagera (D-33).
- Además son **medianas de 4 a 5 meses**. Por ejemplo, el "invierno" de la Zona 1 junta 44 pasadas de junio a octubre de 2025, así que no corresponden a la fecha del vuelo del dron.
- El recuadro punteado es la celda de clima de NASA POWER (unos 50 km alrededor del punto de La Banda), **no la imagen de Landsat**. El lote del `NDVI.tif` (Zona 1, departamento Capital, unas 50 ha) está a 32 km de ese punto: fuera del recuadro, pero dentro de la imagen de Landsat, a 1,9 km de su borde sur.

**Decisión de Enzo (15/11): opciones 1 y 2.**
1. **Rótulo honesto:** decir la resolución real de lo que se ve.
2. **Recorte satelital del lote:** Sentinel-2 a 10 m y Landsat a 30 m reales, solo alrededor del lote, con una pasada cercana a la fecha del vuelo y con su NDVI. Sirve para comparar en el mismo lote "satélite contra dron", con números.

## 2. Objetivos, no objetivos y lo que no puede pasar

**Objetivos**
- El visor dice la resolución real de la imagen de Landsat de la zona (unos 125 m por píxel) y que el original es de 30 m.
- El panel "Lo que ve el satélite" dice que su NDVI se calculó a 100 m (`meta.metodo` de `diagnostico_landsat_ia.json`).
- Un script que genera, para un lote, recortes de **Sentinel-2 (10 m)** y **Landsat 8/9 (30 m)** de una pasada sin nubes cercana a la fecha del vuelo: color real y NDVI, más los valores del NDVI en una grilla chica.
- En la app, si el vuelo del dron cae sobre un recorte:
  - el visor suma las capas "Sentinel-2 · 10 m · fecha" y "Landsat · 30 m · fecha" (color y NDVI);
  - suma la cortina "Satélite contra dron";
  - la tarjeta del dron compara **el NDVI mediano en la misma superficie**: dron contra satélite, y a cuántos días del vuelo fue la pasada.

**No objetivos**
- Generar recortes desde la app: no hay servidor. Los recortes se generan con el script y se publican como datos, uno por lote de la demo.
- Volver a exportar las imágenes de las zonas con más resolución (opción 3) o sumar un fondo satelital por internet (opción 4).
- Corregir el NDVI del satélite contra el del dron: se muestran los dos, con su resolución y su fecha.

**Lo que no puede pasar (D-33)**
- Mostrar una pasada como "del día del vuelo" si no lo es. Siempre va su fecha y a cuántos días del vuelo está.
- Comparar NDVI de superficies distintas. El satélite se resume solo en las celdas que caen sobre píxeles válidos del dron.
- Un recorte con nubes. Si no hay pasada limpia en la ventana, se dice y no se genera esa capa.

## 3. Cómo funciona

### 3.1 Rótulo (opción 1)

- **Visor:** el rótulo pasa a "Landsat · unos {m} m por píxel en este visor (original de 30 m)". `{m}` se calcula con el recuadro de la zona (`escenas.json`) y el ancho real del PNG, que se lee cuando la imagen carga. No se escribe a mano.
- **Panel "Lo que ve el satélite":** el rótulo pasa a "Landsat 8/9 · NDVI a 100 m".
- **Inglés:** los dos rótulos.

### 3.2 Recorte del lote (opción 2)

**Script** `ia_desmonte/recorte_lote.py --tif <ruta del GeoTIFF del dron> --fecha AAAA-MM-DD --nombre <lote>`:
- **Recuadro:** se lee del GeoTIFF con `tifffile` (lo mismo que hace la app), más un margen de 200 m. No hace falta escribirlo a mano.
- **Sentinel-2:** `COPERNICUS/S2_SR_HARMONIZED`, con la máscara de nubes de la banda `SCL` (se descartan nubes, sombras y cirros). Se elige la pasada con al menos 95 % de píxeles limpios en el recuadro, la más cercana a la fecha dentro de ±20 días.
- **Landsat:** `LANDSAT/LC08/C02/T1_L2` y `LANDSAT/LC09/C02/T1_L2`, con la máscara `QA_PIXEL`, el mismo criterio y ±30 días.
- **Salida** en `data/imagenes/lotes/<lote>/`:
  - `s2_rgb.png`, `s2_ndvi.png`, `l8_rgb.png` y `l8_ndvi.png`, con la escala de color de la app (NDVI de 0 a 0,8 con la misma paleta);
  - `lote.json`, con el recuadro y, para cada fuente: escena, fecha, días al vuelo, porcentaje limpio, resolución y la grilla de NDVI (`{ancho, alto, valores}` a la resolución nativa, unas decenas de miles de valores para 50 ha).
- **Índice** `data/imagenes/lotes/lotes.json`: la lista de lotes con su recuadro.
- **Si no hay pasada limpia en la ventana**, esa fuente queda en `null` con el motivo.
- **Antes de tener la fecha del vuelo**, el script puede correr con `--fecha` vacía. Toma la pasada limpia más reciente y lo dice en `lote.json` (`"fecha_vuelo": null`). Cuando llegue la fecha, se vuelve a correr.

**App:**
- Carga `lotes.json` junto con las imágenes.
- Si el recuadro del vuelo abierto se superpone con un lote, suma sus capas al visor, cada una con fecha y resolución en el rótulo.
- Suma la cortina "Satélite contra dron": el satélite abajo y el dron arriba.
- **Comparación** (función pura, con pruebas): para cada celda del satélite se toman los píxeles del NDVI del dron (achicado) que caen adentro. Si al menos la mitad son válidos, la celda cuenta. De las celdas que cuentan, se toma la mediana del NDVI del satélite y la mediana del dron en esa misma superficie. La tarjeta dice:

  > "En la misma superficie: NDVI mediano 0,42 con el dron y 0,38 con Sentinel-2 (10 m, 03/11, 2 días antes del vuelo)."

  Si el vuelo no tiene fecha, la línea dice la fecha de la pasada, sin "días del vuelo".
- **Inglés:** todos los textos nuevos.

## 4. Pruebas

- **Python (`ia_desmonte/pruebas/test_recorte_lote.py`, sin internet):**
  - elegir la pasada más cercana dentro de la ventana;
  - descartar las que tienen menos de 95 % limpio;
  - sin pasada, `null` con motivo;
  - recuadro con margen desde un GeoTIFF de prueba (`tests/fixtures`).
- **JS (`node --test`):**
  - la comparación por celdas con grillas chicas inventadas, incluida una celda con menos de la mitad de píxeles válidos, que no cuenta;
  - el texto con y sin fecha del vuelo;
  - el rótulo de la resolución;
  - la superposición de recuadros.
- **En el navegador:** con el `NDVI.tif` real y el recorte generado, a 390 px y en la PC, en español y en inglés.

## 5. Lo que hace falta de Enzo

- **El ID del proyecto de Earth Engine** (`EE_PROJECT`), el mismo con que se corrió D-30. Las credenciales están en la PC; falta el proyecto.
- **La fecha del vuelo.** Mientras tanto, el recorte se arma con la pasada limpia más reciente, que lleva su propia fecha en el rótulo.
- **Permiso para publicar el recorte del lote.** Los recortes van a `data/` y a la app publicada, así que el lote queda ubicable en el mapa, igual que con el dron.

## 6. Cómo se trabaja

Una rama (`enzo-satelite-lote`) en un worktree, con un plan de tareas. La opción 1 va primero porque es chica y no depende de nada. Se integra a `main` con la aprobación de Enzo.
