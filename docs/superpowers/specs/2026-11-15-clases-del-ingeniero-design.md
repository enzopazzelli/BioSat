# Diseño corto: clasificación del lote con los cortes del ingeniero (D-41)

**Fecha:** 15/11/2026 · **Pedido de:** Enzo ("sumá la clasificación por clases con los cortes del ingeniero") · **Base:** D-38 a D-40

## Para qué

El ingeniero leyó el NDVI del lote de la Zona 1 en tres clases: rojo = maleza, amarillo = zona afectada y verde = vigoroso. Pasar esa lectura a números permite decir **qué % del lote está en cada clase**, y lo mismo **dentro de cada sector**, y ver un mapa con esas tres clases.

**Decisión de Enzo:** los cortes **se cargan en la app**. El ingeniero los escribe y no queda ningún número inventado en el código (D-33).

## Cómo funciona

- **Dónde se cargan:** en la tarjeta "Tu lote, visto por el dron" aparece el bloque **"Clases del ingeniero"**, solo con un vuelo con NDVI. Tiene:
  - **dos cortes de NDVI** (`bajo` y `alto`, entre −1 y 1, con `bajo` < `alto`);
  - **tres nombres**: debajo de `bajo`, entre los dos y arriba de `alto`. El formulario viene con los nombres que dio el ingeniero para este lote ("Maleza", "Zona afectada", "Vigoroso") como texto de ejemplo, pero **no se aplica nada hasta tocar "Aplicar"**.
- **Qué muestra:**
  - **En la tarjeta:** "Clases del ingeniero (cortes cargados en este navegador): Maleza 12 % · Zona afectada 31 % · Vigoroso 57 %". El % es de la superficie con dato.
  - **En el visor:** una capa nueva, **"Dron · clases del ingeniero"**, pintada en rojo, amarillo y verde, con su leyenda: los tres nombres y sus rangos de NDVI.
  - **En cada sector:** la misma partición dentro del polígono.
- **Bordes de las clases:** `NDVI < bajo` es la primera clase, `bajo ≤ NDVI < alto` la segunda y `NDVI ≥ alto` la tercera. Los píxeles sin dato no cuentan.
- **Dónde se guarda:** los cortes y los nombres quedan con el vuelo, en el navegador (IndexedDB, D-39), así vuelven al reabrir la app. Un vuelo nuevo arranca sin clases. "Borrar clases" las quita.
- **Exportar sectores:** el GeoJSON suma `clases: {nombres, cortes, porcentajes}` en cada sector que tenga clases (contrato §11).
- **Inglés:** los textos de la interfaz sí. Los nombres de las clases quedan como los escribió el ingeniero.

## Lo que no hace

- Proponer cortes: no se calcula ninguno automático, ni se toma la escala de 0 a 0,8 de la app como si fuera la del ingeniero.
- Más de tres clases.
- Afirmar la clase en otro lote: los cortes son de este vuelo.

## Pruebas

- **Lógica pura (`dron-logica.js`):**
  - `clasificar(valores, cortes)` da los conteos y porcentajes, con los bordes exactos y sin contar el sin dato;
  - `validarClases({cortes, nombres})` rechaza `bajo ≥ alto`, cortes fuera de [−1, 1] y nombres vacíos;
  - el texto de la tarjeta.
- **Sectores:** el % por clase dentro de un polígono, con la grilla chica de las pruebas de D-39.
- **En el navegador:** con el archivo de prueba multiespectral (NDVI 0,5 y 0) y cortes 0,25 y 0,6:
  - lote: 30 % / 70 % / 0 %;
  - la capa de clases, la leyenda y los sectores;
  - guardado y restauración al recargar;
  - en inglés.

  Después, con el `NDVI.tif` real cuando el ingeniero pase sus cortes.
