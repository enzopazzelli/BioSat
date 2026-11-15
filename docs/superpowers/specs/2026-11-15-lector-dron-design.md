# Diseño: lector de imágenes de dron en la app (D-38)

**Fecha:** domingo 15/11/2026 · **Pedido de:** Enzo · **Base:** D-37 (sugerencia del ingeniero y hoja de ruta de Vale, `docs/superpowers/plans/2026-11-15-hoja-de-ruta-producto-viable.md`)

---

## 1. Para qué

BioSat hoy trabaja con datos típicos o pasados por zona: el clima de NASA POWER, las medianas de Landsat 2021-2025 y la historia de desmontes. Un ingeniero sugirió sumar **imágenes de dron actualizadas** como diferencial, y Enzo lo resume así: "nuestra app solo trabaja con datos históricos, pero se necesita mejorar la toma de decisión".

El lector le da a BioSat **un dato del presente y del lote**. El productor o el asesor abre en la app el .tif de su vuelo y lo ve sobre el mapa de su zona. Si la cámara lo permite, ve también el NDVI del lote al lado de lo que Landsat dice de la zona y, en la segunda etapa, puede marcar sectores para revisar en el campo. Completa la escalera de escalas que ya cuenta la app: NASA POWER (50 km) → Meteomatics (9 km) → Landsat (30 m) → **dron (centímetros)** → sonda (un punto).

**Decisiones de Enzo (15/11):**
- Construir un **lector**: cada uno abre su propio archivo. No hay un vuelo cargado en el repositorio. Enzo busca un .tif real para la demo.
- **Nivel 2:** ver la imagen y leerla (NDVI y comparación con la zona). **Después, nivel 3:** marcar sectores.
- **Todo en el navegador** (enfoque A) y una **herramienta propia** para dibujar sectores.

## 2. Objetivos, no objetivos y lo que no puede pasar

**Objetivos**
- Abrir un GeoTIFF de dron desde el celular o la PC, sin internet y sin subirlo a ningún lado.
- Mostrarlo en su lugar sobre el mapa del Reporte y compararlo con Landsat usando la cortina que ya existe.
- Si hay banda roja e infrarroja (o el archivo ya es un NDVI): mapa de NDVI del lote, NDVI mediano, porcentaje de la superficie sin cobertura vegetal activa y comparación honesta con la zona.
- Decir en qué departamento y zona de BioSat cae el lote, y avisar si no coincide con la zona elegida.
- **Etapa 2:** dibujar sectores, anotar qué revisar, ver su NDVI, guardarlos en el navegador, exportarlos e importarlos (GeoJSON) y sacarlos en el PDF.

**No objetivos (por ahora)**
- Usuarios, cuentas o una nube compartida (el "expediente por lote" de la hoja de ruta).
- Guardar el .tif o la imagen: se vuelve a abrir cada vez. Lo que se guarda es el resumen del vuelo y los sectores.
- Armar mosaicos u ortorrectificar fotos sueltas: el archivo tiene que ser un ortomosaico ya procesado.
- Leer un juego de un .tif por banda (como entregan algunas cámaras multiespectrales): primero, un solo archivo.
- Índices de color calculados solo con RGB (VARI, ExG), curvas de nivel o relieve, y prescripciones para maquinaria (M-08).
- Cambiar el semáforo del Inicio con el dato del dron.

**Lo que no puede pasar, aunque funcione (reglas D-33)**
- Mostrar un NDVI cuando el archivo no tiene banda infrarroja.
- Presentar el porcentaje de suelo sin cobertura como diagnóstico de una causa. Es un sector **para revisar**.
- Decir que la imagen es de la zona elegida cuando no cae ahí.
- Inventar la fecha, la cámara o la resolución: salen del archivo, las pone el usuario o se muestran como "sin dato".
- Que el archivo del productor salga de su equipo.

## 3. Restricciones

- **App estática** en GitHub Pages, sin servidor ni paquetes de npm. Las librerías van copiadas en `web/vendor/`, como Leaflet.
- **Celular primero:** 390 px de ancho y memoria limitada. Las imágenes de dron pueden pesar cientos de MB.
- **Sin internet:** todo lo necesario va en `web/vendor/`.
- **Idioma (D-35):** cada texto nuevo tiene su clave y su inglés en `web/textos-en.js`.
- **Pruebas:** la lógica pura va en un módulo con pruebas de `node --test`, como `inicio-logica.js`.
- **Documentar todo:** bitácora (D-38), contrato de datos del GeoJSON exportado, estado y README.

## 4. Enfoques considerados

| Enfoque | A favor | En contra | Decisión |
|---|---|---|---|
| **A. Todo en el navegador:** geotiff.js lee el archivo de a partes (`fromBlob`) y achicado; proj4js pasa sus coordenadas a latitud y longitud; un canvas arma la imagen para Leaflet. | El archivo no sale del equipo, anda sin internet, no hay que instalar nada y la lógica se puede probar. | Dos librerías nuevas (unos 200 KB). Un archivo enorme puede ser lento en el celular. | **Elegido por Enzo** |
| B. Convertir antes con Python y que la app abra el resultado. | Usa lo que ya existe y nada pesa en el navegador. | No es un lector: cada productor necesitaría Python. | Queda como plan de rescate si el .tif de la demo no anda en el navegador. |
| C. Complemento de Leaflet que dibuja el GeoTIFF por partes. | Maneja mejor los archivos gigantes. | 3 o 4 librerías y no calcula el NDVI ni sus números. | Descartado. |

**Sectores:** herramienta propia: tocar puntos, cerrar y anotar. **Elegida por Enzo.** Leaflet.draw se descartó porque es viejo y anda peor con el dedo.

## 5. Cómo funciona

### 5.1 Dónde aparece

En la sección 4 del Reporte (`index.html`, `#satelite`), dentro del visor, debajo de las capas de Landsat:

```
┌ Visor del lote ─────────────────── Landsat · 30 m ┐
│ [mapa: Landsat + imagen del dron + recuadro]      │
│ Capas: Color real · invierno | ... | Dron 03/11   │
│ Comparar con cortina: ... | Landsat contra dron   │
│                                                   │
│ Imagen de tu dron                                 │
│ [ Abrir un .tif de dron ]                         │
│ Tu archivo no sale de este equipo.                │
└───────────────────────────────────────────────────┘
┌ Tu lote, visto por el dron ───────────────────────┐
│ Vuelo del 03/11/2026 · 4,2 cm por píxel           │
│ Cae en Moreno (Zona 2) ✓                          │
│ NDVI mediano del lote: 0,41                       │
│ 18 % de la superficie sin cobertura vegetal       │
│ activa (NDVI < 0,25)                              │
│ Tu zona en noviembre, según Landsat 2021-2025:    │
│ 8 de cada 10 lotes con NDVI mediano < 0,25.       │
│ Con ese mismo criterio, tu lote se vería          │
│ con cobertura activa.                             │
│ ▸ Para tu ingeniero: bandas usadas, calibración,  │
│   resolución de cálculo, sistema de coordenadas   │
└───────────────────────────────────────────────────┘
```

La vista detallada (`completo.html`) no lleva el lector, solo un enlace "Para abrir una imagen de dron, usá el Reporte". Decisión del diseñador: evitar duplicar la interfaz.

### 5.2 Abrir y entender el archivo

1. `<input type="file" accept=".tif,.tiff">`. Se lee con `GeoTIFF.fromBlob(archivo)`, que no carga el archivo entero en memoria.
2. **Ficha del archivo:** ancho y alto, cantidad de bandas, tipo de dato, sin dato (`GDAL_NODATA` o banda alfa), descripción de las bandas si el archivo la trae (`GDAL_METADATA`), fecha (`DateTime`) y sistema de coordenadas (GeoKeys).
3. **Qué tipo de imagen es** (función pura, con pruebas):
   - **Foto RGB:** 3 o 4 bandas de 8 bits, RGB. Se ve en color. **Sin NDVI**, y la app lo dice: "Este archivo es una foto en color (RGB): no trae la banda infrarroja que hace falta para el NDVI".
   - **NDVI ya calculado:** 1 banda decimal con valores entre −1 y 1. La app pregunta "¿Este archivo es un NDVI?" y solo lo usa como NDVI si el usuario confirma.
   - **Multiespectral:** 4 bandas o más. El usuario elige cuál es la roja y cuál la infrarroja. Si las descripciones de las bandas dicen "Red" y "NIR", vienen elegidas. Hay atajos para cámaras conocidas, con el orden de bandas de su fabricante (por ejemplo, MicaSense RedEdge: B, G, R, RE, NIR). Sin descripción ni atajo, no se adivina.
   - **Otra cosa** (1 banda entera, etcetera): se ve en grises, sin NDVI.
4. **Ubicación:** el recuadro del archivo (`getBoundingBox`) se pasa a latitud y longitud con proj4js. Los sistemas que entiende:
   - WGS84 geográfico (EPSG:4326);
   - WGS84 UTM norte y sur (EPSG:326xx y 327xx);
   - Web Mercator (EPSG:3857);
   - POSGAR 2007, fajas 1 a 7 (EPSG:5343 a 5349), el sistema oficial argentino.

   Con otro sistema, la app dice cuál es ("EPSG:xxxx") y que no puede ubicarlo en el mapa. Leaflet necesita un recuadro recto en latitud y longitud, así que se usa el que envuelve las 4 esquinas transformadas. Para un lote de pocos kilómetros, el desvío es de centímetros a pocos metros, y "Para tu ingeniero" lo aclara.
5. **Achicar:** se lee con `readRasters({width, height})` a un máximo de 2048 px en el lado largo, para dibujar y para calcular. Los números del NDVI se calculan sobre esa versión, y "Para tu ingeniero" dice de cuántos metros por píxel es. Si el archivo pesa más de 1 GB, la app avisa antes de leerlo.
6. **Dibujar:** un canvas pinta la foto RGB, o el NDVI con la misma rampa de colores del NDVI de Landsat (`#rampa`). Se pasa a Leaflet como `imageOverlay`, encima de Landsat, y aparece como capa "Dron · fecha" y como comparación "Landsat contra dron" en la cortina.

### 5.3 Leer el lote (nivel 2)

Todo en un módulo puro, `web/dron-logica.js`, con pruebas:

- **NDVI** = (NIR − Rojo) / (NIR + Rojo), sin contar los píxeles sin dato ni los que dan NIR + Rojo = 0.
- **NDVI mediano del lote** y **porcentaje de la superficie con NDVI < umbral**. El umbral sale de `diagnostico_landsat_ia.json` (`meta.umbral_ndvi`, hoy 0,25), así el dron y Landsat usan el mismo criterio.
- **Comparación con la zona, sin mezclar medidas.** Landsat cuenta **lotes** (un lote "sin cobertura" tiene NDVI mediano < 0,25); el dron mide **superficie dentro de un lote**. Por eso:
  - El NDVI mediano del lote se compara con el criterio de Landsat: "con ese mismo criterio, tu lote se vería con / sin cobertura activa".
  - El porcentaje de superficie se muestra como el detalle que solo da el dron, no como si fuera la misma cifra que la de la zona.
  - El mes de la comparación es el del vuelo, no el de hoy.
- **Fecha del vuelo:** del archivo. Si no viene, el usuario la escribe. Sin fecha, no hay comparación por mes, y la app lo dice.
- **Zona del lote:** el centro de la imagen se ubica en `data/santiago_mapa.json` (departamentos con su zona). El mapa está en coordenadas de dibujo: la transformación desde latitud y longitud se agrega a `meta` desde `scripts/generar_mapa_santiago.py`, o se deduce de los 5 puntos de NASA POWER (decisión del diseñador). Hay tres casos:
  - si cae en la zona elegida, se dice;
  - si cae en otra zona, la app avisa y ofrece cambiar;
  - si cae fuera de Santiago del Estero, la app avisa que la comparación con las zonas no aplica.
- **Calibración:** la app no puede saber si el mosaico está calibrado a reflectancia, así que siempre aclara "si el mosaico no está calibrado a reflectancia, el NDVI es aproximado".

### 5.4 Sectores (nivel 3, segunda etapa)

- **Dibujar:** el botón "Marcar un sector" activa el modo dibujo. Cada toque en el mapa suma un punto; hay botones "Deshacer punto", "Cerrar sector" (con 3 puntos o más) y "Cancelar".
- **Ficha de cada sector:**
  - superficie en hectáreas;
  - si hay NDVI: NDVI mediano y porcentaje sin cobertura activa dentro del sector;
  - una nota libre ("qué se ve, qué revisar");
  - un estado: **"Para revisar en el campo"** (al crearlo), "Revisado" o "Descartado". La causa la confirma el campo, no el color.
- Se puede marcar un sector sin imagen de dron, sobre Landsat, y entonces no tiene NDVI.
- **Guardar:** en `localStorage` (`biosat.sectores.v1`), junto con un resumen del vuelo (nombre del archivo, fecha, recuadro y números del lote). La app lo dice: "Se guarda en este navegador". Al volver, los sectores se ven aunque no se haya reabierto el .tif.
- **Compartir:** "Exportar sectores" descarga un GeoJSON con los polígonos en latitud y longitud y sus datos. "Importar" lo carga en otra app. El formato va al contrato de datos (§11).
- **PDF:** en la sección 4 sale la lista de sectores con sus datos. El mapa sale con lo que muestra la pantalla.

## 6. Texto e idioma

Todos los textos nuevos van en `DronLogica.TEXTOS`, con claves, se registran con `Idioma.registrar('dron', ...)` y tienen su inglés en `web/textos-en.js`. El vocabulario sigue a D-33: "sin cobertura vegetal activa (suelo descubierto o rastrojo seco)".

## 7. Pruebas y verificación

- **`tests/dron-logica.test.js`:**
  - tipo de imagen;
  - definición de proj4 según EPSG (UTM sur, POSGAR);
  - recuadro desde las 4 esquinas;
  - NDVI con sin dato y con ceros;
  - mediana y porcentaje bajo el umbral;
  - textos de la comparación (con y sin fecha, con y sin NIR, otra zona, fuera de la provincia);
  - fecha del `DateTime` de TIFF;
  - punto en polígono y zona del lote;
  - área de un polígono en hectáreas;
  - GeoJSON de ida y vuelta (etapa 2).
- **Archivos de prueba:** 2 o 3 GeoTIFF chicos y **sintéticos** (RGB, multiespectral en UTM 20 S, NDVI en EPSG:4326), generados con un script en Python (`tifffile` y `numpy`). Viven en `tests/fixtures/`. Son datos de prueba: **nunca se muestran en la app como un vuelo real.**
- **En el navegador** con `scripts/captura-movil.mjs`, a 390 px y en la PC: abrir cada archivo de prueba (con una función expuesta para la prueba o con `DOM.setFileInputFiles` del protocolo de Chrome), medir la capa y leer los textos; en español y en inglés; sin errores de JavaScript.
- **Con el .tif real de Enzo:** el criterio final de la etapa 1.

## 8. Lo que queda para quien lo construya

- Versiones exactas de geotiff.js (2.1.x) y proj4js (2.x). Se copian a `web/vendor/` con su licencia, desde un CDN permitido.
- Cómo pasar latitud y longitud al mapa de departamentos (§5.3).
- La forma de la lista de bandas para la multiespectral y los atajos de cámara, siempre con fuente.
- Estilos, siguiendo los de `.visor` y `.capas`.

## 9. Etapas

1. **Etapa 1, nivel 2:** lector, ubicación, NDVI, comparación, capa y cortina, inglés, pruebas y documentación. Termina cuando se abre el .tif real de Enzo y se lee bien.
2. **Etapa 2, nivel 3:** sectores, guardado en el navegador, exportar e importar, PDF, pruebas y documentación.

Cada etapa tiene su plan, se trabaja en una rama y se integra a `main` con la aprobación de Enzo.
