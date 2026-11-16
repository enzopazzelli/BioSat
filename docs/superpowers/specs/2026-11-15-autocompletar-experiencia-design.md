# Autocompletar para grabar el video en la página de Vale (web/experiencia) · diseño corto

**Fecha:** 15/11/2026, 22:45 · **Pedido por:** Enzo ("un autocompletar rápido a la experiencia de Vale para poder grabar un video más rápido") · **Aprobado:** sí, en la conversación.

## Para qué

Para grabar el recorrido de `web/experiencia/` (D-46) sin tipear en vivo. Es una ayuda para el equipo, no una función para el productor.

## Qué hace

- **Un botón "Autocompletar"** en el formulario "Nuevo campo" y en el diálogo "Nueva observación". Llena los campos; guardar queda en manos de quien graba, así el video muestra el recorrido.
- **Campo:**
  - nombre "Lote Capital · Zona 1", zona 1;
  - latitud −28.0129 y longitud −64.2297, el centro del recorte satelital del lote `capital_zona1` (D-40), donde cae el `NDVI.tif` real del ingeniero (corrección: la comparación con Sentinel-2 y Landsat la elige la página por los bordes del TIFF, no por el campo);
  - cultivo vacío (no se sabe cuál es) y una nota que dice que es un campo de ejemplo para la demo.
- **Observación:** fuente "Dron", sector "Norte", y un resumen y un detalle escritos como algo para revisar en el campo, no como un hallazgo (D-33).
- **Solo con `?demo=1`** en la dirección. Sin ese parámetro, el botón no existe en la página.
- Castellano e inglés, como el resto de la página.

## Fuera de alcance

- El TIFF no se autocompleta: el navegador obliga a elegirlo a mano, y en el video tiene que ser el `NDVI.tif` real, no un archivo de prueba.
- No cambia nada del modo normal de la página ni de la app principal.

## Enfoques considerados

1. **Botón con `?demo=1`, que llena el formulario** (elegido): el video muestra el flujo real y quien entra por el link normal no ve nada distinto.
2. Crear el campo ya guardado al abrir la página con `?demo=1`: es más rápido, pero en el video no se ve cómo se crea un campo.
3. Botón siempre visible: es más simple, pero lo verían el jurado y los productores.
