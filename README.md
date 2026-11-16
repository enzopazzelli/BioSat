# BioSat — Field Shift: Adapting Farms with NASA Data

> **NASA Space Apps Challenge 2026** · Desafío: *Field Shift: Adapting Farms with NASA Data*
> Sede: **Santiago del Estero, Argentina** · Equipo: **BioSat** (Enzo, Santi, Vale y Sara)

- **App:** https://enzopazzelli.github.io/BioSat/web/ · en inglés: https://enzopazzelli.github.io/BioSat/web/?lang=en
- **Reporte completo:** https://enzopazzelli.github.io/BioSat/web/#reporte · **Vista detallada:** https://enzopazzelli.github.io/BioSat/web/completo.html
- **Propuesta de experiencia (prototipo):** https://enzopazzelli.github.io/BioSat/web/experiencia/

**English summary.** BioSat is a free, mobile-first web app that helps farmers in Santiago del Estero (Argentina's dry Chaco) choose crop rotations that keep the soil covered and cope with heat, drought, frost and salinity. It combines NASA POWER climate data and Landsat imagery with regional soil data, a 7-day forecast and the farmer's own drone flights. All data comes from public, citable sources. Machine-learning models are reported with their real scores, and the app always shows where each number comes from. It supports the agronomist; it never replaces them.

---

## El problema

En Santiago del Estero, el invierno y la primavera son secos, y en verano se pasan los 40 °C. Después de la cosecha, muchos lotes quedan sin cobertura durante meses: el sol calienta el suelo, el viento lo erosiona y, donde se riega, la evaporación sube el salitre de una napa poco profunda. El suelo pelado también deja menos pasto para la hacienda en la seca, mientras el monte nativo sigue retrocediendo. El productor decide qué sembrar con poca información local, y la mayoría de las herramientas globales no están pensadas para esta región.

## Qué hace BioSat

- **Cuatro preguntas para empezar:** dónde está el campo (en un mapa real de las 5 zonas de la provincia), con qué cuenta el productor (riego, hacienda, maquinaria) y qué le preocupa (agua, salitre, suelo, forraje o ingreso).
- **Inicio:**
  - el semáforo de su zona en el mes, con cuatro señales: lluvia contra evapotranspiración de referencia (ET0), días de más de 35 °C, heladas y lotes sin cobertura vegetal activa vistos por Landsat;
  - la tarjeta **"Tu lote, desde el dron"**;
  - la rotación que mejor encaja, la próxima siembra, los meses de suelo pelado y el pronóstico de 7 días.
- **Tu lote, desde el dron:** el productor abre su propio vuelo (GeoTIFF) y la app lo lee en el navegador. El archivo no sale del equipo.
  - Calcula el NDVI y el porcentaje del lote sin cobertura activa, y permite marcar los sectores para recorrer.
  - Si hay un recorte satelital preparado del lote (hoy, un lote piloto), compara el vuelo con Sentinel-2 (10 m) y Landsat (30 m) en la misma superficie.
  - La tarjeta siempre muestra la fecha del vuelo.
- **Reporte completo,** que se guarda en PDF o se comparte por WhatsApp. Tiene 6 secciones:
  1. el año mes a mes;
  2. su rotación contra 2 alternativas, con lo que gana y lo que paga cada una (15 rotaciones, 3 por zona);
  3. un simulador con menos lluvia y hasta +2,5 °C;
  4. el suelo, el monte y el riesgo de desmonte desde el satélite;
  5. una lista para charlar con el ingeniero;
  6. de dónde sale cada dato.
- **Castellano e inglés,** con el botón ES/EN o `?lang=en`.

## Datos

| Dato | Fuente | Para qué |
|---|---|---|
| Clima diario 1981-2025 (~50 km) | **NASA POWER** | Calor, heladas, lluvia y balance de agua por zona |
| Imágenes 2000-2025 (30 m) | **Landsat 5, 7, 8 y 9**, Collection 2 Level-2 (**NASA/USGS**) | Meses sin cobertura activa (2021-2025) y el visor |
| Relieve (30 m) | **NASADEM** (NASA) | Pendiente |
| Desmontes 2001-2025 (30 m) | Hansen Global Forest Change v1.13 (University of Maryland, a partir de Landsat) | Historia, % de monte y etiquetas del modelo |
| Pronóstico de 7 días (9 km) | Meteomatics (modelo ECMWF) | "Esta semana en tu zona" |
| Imagen del lote piloto (10 m) | Copernicus Sentinel-2 (ESA) | Comparación con el dron |
| Variables del Gran Chaco | AIZAL V4 (AIZAL-IA, proyecto Euroclima+ "Vivir y Producir en el Bosque Chaqueño") | Marco de variables de clima y suelo (B03-B18) para la zonificación y los indicadores de suelo |
| Suelo 0-30 cm (250 m) | SoilGrids 2.0 (ISRIC) | pH, textura, carbono, nitrógeno y densidad aparente |
| Clima 1991-2020 (4 km) | TerraClimate (University of Idaho) | Zonificación y déficit hídrico |
| Cobertura 2021 (10 m) | ESA WorldCover v200 | Dónde hay cultivos y pastizales |
| Caminos, áreas protegidas y población | GRIP4, WDPA (UNEP-WCMC) y WorldPop | Predictores del modelo de desmonte |
| Límites de departamentos | geoBoundaries (IGN Argentina) | Las 5 zonas y el mapa |
| Rotaciones | Equipo BioSat, revisadas por un productor de la Zona 5 | Las zonas 1 a 4 todavía no están validadas, y la app lo dice |
| Vuelo de dron | El GeoTIFF de cada productor | NDVI del lote, a centímetros |

Las capas satelitales y de suelo se procesaron en **Google Earth Engine**. Las imágenes Landsat del visor son composiciones de mediana hechas ahí.

## Cómo funciona

- **Cobertura del suelo:**
  - se toma el NDVI mensual de Landsat 2021-2025 en 600 puntos al azar sobre cultivos de cada zona;
  - un mes cuenta como "sin cobertura activa" cuando al menos la mitad de los puntos tiene NDVI menor a 0,25;
  - se prueba también con 0,20 y 0,30, y la app avisa cuánto cambia el resultado según el umbral.
- **Zonificación:** un k-means con k = 5 sobre las variables de clima y suelo de AIZAL, tomadas de sus fuentes originales. Da una silueta de 0,27. Es una zonificación del equipo, no la oficial de AIZAL.
- **Riesgo de desmonte:**
  - se compararon regresión logística, random forest y gradient boosting, y se eligió random forest (AUC 0,78 en validación cruzada);
  - en años que el modelo no vio (2016-2025) baja a AUC 0,63, así que se usa para **comparar zonas**, no para predecir un lote;
  - la app muestra esos números.
- **Rotaciones:** un motor de reglas a la vista ordena las rotaciones según las prioridades del productor y explica por qué.
- **Sin datos inventados:** si un dato falta, la app dice "sin dato".

Detalle completo, con métricas y limitaciones: [`docs/datos-y-metodos.md`](docs/datos-y-metodos.md). Formato de cada archivo de `data/`: [`docs/contratos-de-datos.md`](docs/contratos-de-datos.md).

## Uso de inteligencia artificial

- **En el producto:** los modelos k-means y random forest (scikit-learn) descritos arriba, con sus métricas.
- **En la investigación:** Antigravity (Google).
- **En el desarrollo:** Claude (Anthropic), con Claude Code, y Codex (OpenAI) ayudaron a programar, a escribir los scripts de datos y las pruebas, a documentar y a traducir.
- **Revisión y origen de los datos:** el equipo revisó todo lo que hicieron estas herramientas. Los datos salen de las fuentes citadas, no de la IA, y las imágenes de la app son de Landsat, Sentinel-2 y vuelos de dron reales.

## Limitaciones

- El clima y las señales del satélite son promedios de la zona, no mediciones del lote.
- El NDVI no distingue el suelo descubierto del rastrojo seco.
- SoilGrids es un modelo global: no reemplaza un análisis de suelo.
- Hansen mide pérdida de cobertura arbórea, que no es lo mismo que desmonte legal.
- La herramienta **apoya, no reemplaza,** el criterio del productor y del ingeniero.

## Correrla en la compu

La app es estática (HTML y JavaScript). Hay que abrirla con un servidor local, porque el navegador no deja leer los JSON si se abre el HTML con doble clic:

```bash
python -m http.server 8000
# y abrir http://localhost:8000/web/
```

- **Pruebas** (Node 22): `node --test tests/*.test.js` · Python: `python -m pytest ia_desmonte/pruebas scripts/pruebas`
- **Clima de NASA POWER** (no necesita cuenta): `python scripts/descargar_nasa_power.py`
- **Datos de Earth Engine:** `ia_desmonte/` (ver su README). Necesita un proyecto de Google Earth Engine.
- **Ver la app como en un celular de 390 px:** `node scripts/captura-movil.mjs "http://localhost:8000/web/" inicio.png`

## Estructura del repositorio

<!-- AUTO:ESTRUCTURA:INICIO -->
```text
BioSat/
├── NASA Space Apps Challenge - awards.mhtml                  <-- Premios globales y datos del equipo
├── NASA Space Apps Challenge.mhtml                           <-- Recursos oficiales (pestaña Resources)
├── README.md                                                 <-- Portada del proyecto (se actualiza sola)
├── data/                                                     <-- Datos y contratos JSON que lee la app
│   ├── clima_zonas.json                                      <-- Clima NASA POWER 1981-2025 de las 5 zonas (lo lee la app)
│   ├── desmonte_zonas.json                                   <-- Desmontes Hansen 2001-2025, modelo validado en el tiempo y riesgo por zona · real
│   ├── diagnostico_landsat_ia.json                           <-- Meses de suelo pelado con Landsat 2021-2025 y fragilidad (Earth Engine) · real
│   ├── meteomatics_santiago_zonas.json                       <-- Pronóstico de 7 días de Meteomatics por zona (Santi) · lo lee la app y se renueva todos los días (D-34)
│   ├── resumen_mensual_santiago.csv                          <-- Normal 1991-2020 por mes y zona, para planilla
│   ├── rotaciones_santiago.json                              <-- 15 rotaciones de las 5 zonas (Vale) · Zona 5 validada por un productor, el resto sin validar
│   ├── santiago_mapa.json                                    <-- Mapa de Santiago del Estero: 27 departamentos pintados por zona (IGN, vía geoBoundaries)
│   ├── suelo_zonas.json                                      <-- Suelo por zona: SoilGrids 0-30 cm sobre tierra agropecuaria (Earth Engine) · real
│   ├── zonificacion_aizal.json                               <-- Zonificación k-means sobre TerraClimate y SoilGrids, 5 grupos (Earth Engine) · real
│   ├── datos_cruzados_aizal/                                 <-- Catálogo AIZAL V4: 38 variables de suelo, clima y paisaje
│   │   ├── CATALOGO_MAESTRO_VARIABLES.md                     <-- Índice de módulos y reglas que disparan
│   │   ├── 01_Clima_y_Balance_Hidrico/ (2 archivos)          <-- B01-B08: agua, lluvia, sequía, temperatura
│   │   ├── 02_Vegetacion_Fenologia_y_Paisaje/ (2 archivos)   <-- B19-B23, B30-B31: paisaje, NDVI, monte
│   │   ├── 03_Quimica_Nutricion_Suelo/ (2 archivos)          <-- B09, B11, B13-B16: nitrógeno, pH, carbono
│   │   ├── 04_Fisica_Suelo_y_Topografia/ (2 archivos)        <-- B10, B12, B17-B18, B24-B25: textura, relieve
│   │   ├── 05_Logistica_Antropico_y_Servicios/ (2 archivos)  <-- B26-B29, B32-B37: caminos, población
│   │   └── 06_Embeddings_IA_AlphaEarth/ (2 archivos)         <-- Embeddings AlphaEarth 64D (DeepMind)
│   └── imagenes/ (29 archivos)                               <-- Compuestos de mediana Landsat del visor y mapa de la zonificación (Earth Engine)
├── docs/                                                     <-- Documentación del equipo
│   ├── contratos-de-datos.md                                 <-- Formato de los JSON que comparten los frentes
│   └── datos-y-metodos.md                                    <-- Fuentes, métodos, métricas reales y limitaciones de los datos (se genera solo)
├── ia_desmonte/                                              <-- Pipeline de datos reales con Earth Engine: suelo, desmontes, zonificación, suelo pelado e imágenes
│   ├── __init__.py
│   ├── comun.py
│   ├── correr_todo.py
│   ├── desmonte.py
│   ├── imagenes.py
│   ├── informe.py
│   ├── proyeccion.py
│   ├── README.md                                             <-- iadesmonte/ · Datos reales de suelo, desmonte, zonificaci...
│   ├── recorte_lote.py
│   ├── suelo.py
│   ├── suelo_pelado.py
│   ├── zonas.py
│   ├── zonificacion.py
│   ├── pruebas/                                              <-- Pruebas de Python del pipeline (pytest)
│   │   ├── __init__.py
│   │   ├── test_comun.py
│   │   ├── test_desmonte.py
│   │   ├── test_informe.py
│   │   ├── test_paleta.py
│   │   ├── test_proyeccion.py
│   │   ├── test_recorte_lote.py
│   │   ├── test_suelo.py
│   │   ├── test_suelo_pelado.py
│   │   ├── test_zonas.py
│   │   └── test_zonificacion.py
│   └── salidas/ (12 archivos)                                <-- Muestras de Earth Engine y registro de la corrida (permiten reentrenar sin cuenta)
├── scripts/                                                  <-- Herramientas para bajar y procesar datos
│   ├── actualizar_readme.py                                  <-- Regenera las secciones automáticas del README
│   ├── captura-movil.mjs                                     <-- Captura la app emulando un celular de 390 px, u otro ancho con ANCHO (Chrome)
│   ├── descargar_meteomatics.py                              <-- Descarga el pronóstico de Meteomatics por zona; no pisa el archivo si falla una zona
│   ├── descargar_nasa_power.py                               <-- Descarga y resume NASA POWER por zona
│   ├── earth_engine_embeddings.js                            <-- Ejemplo GEE de embeddings (falta adaptar a SdE)
│   ├── gee_exportar_zonas.js                                 <-- Earth Engine: estadísticas e imágenes por zona para la app
│   ├── gee_visor_biosat.js                                   <-- Visor GIS en Earth Engine: 2000 vs 2025, NDVI, desmonte, zonas IA
│   ├── gee_zonas_y_desmonte.js                               <-- Earth Engine: zonificación AIZAL y modelo predictivo de desmontes
│   ├── generar_mapa_santiago.py                              <-- Genera data/santiago_mapa.json desde geoBoundaries
│   └── pruebas/                                              <-- Pruebas de Python de los scripts (pytest, sin internet)
│       └── test_descargar_meteomatics.py
├── tests/                                                    <-- Pruebas de Node (node --test tests/*.test.js)
│   ├── asistente-logica.test.js
│   ├── datos-contratos.test.js                               <-- Prueba la forma de los datos reales de ia_desmonte/
│   ├── dron-logica.test.js
│   ├── experiencia.test.js
│   ├── frases-logica.test.js
│   ├── idioma-logica.test.js                                 <-- Prueba la lógica del idioma: solo español e inglés (D-35)
│   ├── inicio-logica.test.js                                 <-- Prueba el semáforo, la próxima siembra y el WhatsApp del Inicio
│   ├── kit-archivado.test.js
│   ├── mapa-santiago.test.js
│   ├── pronostico-logica.test.js                             <-- Prueba el resumen y el vencimiento del pronóstico de Meteomatics
│   ├── satelite-logica.test.js
│   ├── sectores-logica.test.js
│   ├── textos-en.test.js                                     <-- Prueba que el inglés no tenga huecos ni claves sobrantes (D-35)
│   ├── vistas.test.js                                        <-- Prueba las vistas Inicio, Reporte y la vista detallada (completo.html)
│   └── fixtures/
│       ├── dron_multi_utm20s.tif
│       ├── dron_ndvi_4326.tif
│       ├── dron_rgb_utm20s.tif
│       ├── dron_sin_coordenadas.tif
│       ├── generar_tif_prueba.py
│       └── lotes/ (4 archivos)
└── web/ (63 archivos)                                        <-- App web BioSat (abrir con un servidor: ver Inicio rápido)
```
<!-- AUTO:ESTRUCTURA:FIN -->

> La sección de estructura la actualiza `scripts/actualizar_readme.py`. Un workflow de GitHub Actions la corre después de cada push a `main`.
