# BioSat — Field Shift: Adapting Farms with NASA Data

> **NASA Space Apps Challenge 2026** · Desafío: *Field Shift: Adapting Farms with NASA Data*
> Sede: **Santiago del Estero, Argentina** · Equipo: **BioSat**

---

## En pocas palabras

**Qué vamos a hacer:** una app web que ayuda a un productor de **Santiago del Estero** a elegir una **rotación de cultivos** que cuide su suelo y aguante el calor extremo, la sequía y el salitre.

**En qué consiste:** el productor elige su zona y lo que le importa (agua, salitre, suelo, forraje, ingreso). La app le muestra:
- **El calendario de su lote:** cuándo hace demasiado calor, cuándo hiela, cuándo falta agua y cuándo el suelo queda pelado.
- **3 rotaciones comparadas:** su rotación actual y 2 alternativas. Cada una explica por qué se sugiere, qué evidencia la respalda, qué beneficios tiene, qué falta saber y qué riesgos debe revisar un agrónomo local.
- **Un simulador:** "¿y si llueve menos o hace más calor?".

En la demo, un **kit Arduino con 3 bandejas de suelo** mide en vivo lo que el satélite no ve de cerca.

**Qué consume:**

| Entrada | Fuente | Para qué |
|---|---|---|
| Clima diario 1981-2025 | NASA POWER (API abierta) | Calor, heladas, lluvia y balance de agua por zona |
| Imágenes de 30 m | Landsat 5/7/8/9 (NASA/USGS) | Meses de suelo pelado y visor del lote |
| Historia de desmontes | LART desde 1976 (si se consigue) · MapBiomas Chaco · Hansen | Etiquetas del modelo predictivo de desmontes |
| Suelo y paisaje (38 variables, 500 m) | AIZAL V4 (SoilGrids, TerraClimate, OSM) | pH, textura, carbono, nitrógeno, distancias; zonificación y predictores del desmonte |
| Sensores en tierra | Kit Arduino (suelo, humedad/conductividad, luz, aire) | Comparar satélite y suelo |
| El productor | Entrevista y formulario de la app | Rotación actual, prioridades y límites (riego, maquinaria, mercado) |

**Cómo funciona, técnicamente:**
1. **Datos:** scripts en Python bajan y resumen cada fuente en archivos JSON por zona (`data/`, ver [contratos](docs/contratos-de-datos.md)).
2. **IA:** con las variables de AIZAL se **zonifica la provincia** (k-means) y se entrena un **modelo predictivo de desmontes por zona**. Se comparan una regresión logística, un random forest y un modelo temporal (LSTM o Transformer), validados con años que el modelo no vio. Los meses de suelo pelado salen de Landsat con un método simple.
3. **Motor de reglas transparente:** usa secciones de cultivo (A gramíneas, B leguminosas, C raíces profundas, D coberturas) y las prioridades del productor para ordenar las rotaciones **y explicar por qué**.
4. **App web estática** (HTML + JavaScript): se publica en GitHub Pages, funciona sin internet y lee el Arduino por Web Serial.

**Por qué es diferente y qué aporta:**
- **Hecha para un lugar real:** está pensada para las 5 zonas de Santiago del Estero, con rotaciones revisadas por un productor de la zona. No es un mapa genérico "para cualquier punto del mundo".
- **Espacio + tierra:** une los datos satelitales de la NASA con mediciones en el suelo, en vivo.
- **IA que se puede medir:** no da por buena la IA; la compara contra un método simple y muestra los números.
- **Suelo del Gran Chaco:** usa datos locales de suelo (AIZAL), que fuera de EE. UU. casi nadie tiene a mano.
- **Honesta:** cada dato muestra su fuente y su incertidumbre, los dilemas quedan a la vista (por ejemplo, una cobertura protege el suelo pero gasta agua) y la herramienta **apoya, no reemplaza** al productor ni al agrónomo.

---

## Estado del proyecto

Avance de cada integrante, contado desde las casillas de su plan en [`planes/`](planes/README.md). Se actualiza cuando cada uno integra su rama a `main`:

<!-- AUTO:AVANCE:INICIO -->
| Persona | Rama | Avance | Tareas |
|---|---|---|---|
| [Enzo · Integración y app](planes/1-enzo.md) | `enzo-app` | `▓▓▓▓▓▓▓▓░░` 80% | 24/30 |
| [Santi · Suelo, satélite e IA](planes/2-santi.md) | `santi-datos-ia` | `▓▓▓▓▓▓░░░░` 57% | 12/21 |
| [Vale · Campo y agronomía](planes/3-vale.md) | `vale-rotaciones` | `▓▓▓▓▓▓▓▓░░` 78% | 14/18 |
| [Sara · Kit Arduino y relato](planes/4-sara.md) | `sara-arduino-entrega` | `▓░░░░░░░░░` 5% | 1/19 |
| **Total** | | `▓▓▓▓▓▓░░░░` **58%** | **51/88** |
<!-- AUTO:AVANCE:FIN -->

**Últimas decisiones:**

<!-- AUTO:DECISIONES:INICIO -->
- **D-27**: Pantalla del kit para el jurado, guía "Del kit al campo" y Arduino Uno por USB
- **D-26**: Informe de clima corregido y app lista para los datos de D-25
- **D-25**: Propuesta de la profesora: zonificación AIZAL y modelo predictivo de desmontes
- **D-24**: Checkpoint 1: clima 1981-2025 y app v1 publicada
- **D-23**: Trabajo en paralelo con ramas y planes individuales
- **D-22**: Equipo de 4 integrantes

Todas las decisiones están en la [bitácora](docs/reglas-y-bitacora.md).
<!-- AUTO:DECISIONES:FIN -->

---

## Equipo

| # | Quién | Rol | Frentes | Rama | Plan |
|---|---|---|---|---|---|
| 1 | Enzo | Integración y app | F1 Clima · F5 App y motor | `enzo-app` | [planes/1-enzo.md](planes/1-enzo.md) |
| 2 | Santi | Suelo, satélite e IA | F2 Suelo y zonificación AIZAL · F3 Modelo de desmontes | `santi-datos-ia` | [planes/2-santi.md](planes/2-santi.md) |
| 3 | Vale | Campo y agronomía | F4 Rotaciones | `vale-rotaciones` | [planes/3-vale.md](planes/3-vale.md) |
| 4 | Sara | Kit Arduino y relato | F6 Arduino · F7 Entrega (coordina) | `sara-arduino-entrega` | [planes/4-sara.md](planes/4-sara.md) |

Cómo trabajamos en paralelo (ramas, reglas e hitos de integración): **[planes/README.md](planes/README.md)**.

El detalle de tareas, la ruta de trabajo y los diagramas están en **[PLAN.md](PLAN.md)**.

---

## Estructura del repositorio

<!-- AUTO:ESTRUCTURA:INICIO -->
```text
BioSat/
├── arduino.jpeg
├── CONTEXTO.md                                               <-- Contexto inicial del 13/11 (histórico)
├── ESTRUCTURA_DATOS.md                                       <-- Arquitectura de datos y módulos AIZAL
├── NASA Space Apps Challenge - awards.mhtml                  <-- Premios globales y datos del equipo
├── NASA Space Apps Challenge.mhtml                           <-- Recursos oficiales (pestaña Resources)
├── NASA Space Apps Challenge.pdf                             <-- Enunciado oficial (pestaña Details)
├── PLAN.md                                                   <-- Plan de trabajo: roles, ruta y tareas
├── README.md                                                 <-- Portada del proyecto (se actualiza sola)
├── data/                                                     <-- Datos y contratos JSON que lee la app
│   ├── arduino_bandejas_demo.json                            <-- Lecturas grabadas del kit (Sara) · plantilla hasta tener datos
│   ├── clima_zonas.json                                      <-- Clima NASA POWER 1981-2025 de las 5 zonas (lo lee la app)
│   ├── desmonte_zonas.json                                   <-- Riesgo y proyección de desmonte por zona (Santi) · plantilla
│   ├── diagnostico_landsat_ia.json                           <-- Meses de suelo pelado por umbral (Santi) · plantilla
│   ├── meteomatics_santiago_zonas.json
│   ├── resumen_mensual_santiago.csv                          <-- Normal 1991-2020 por mes y zona, para planilla
│   ├── rotaciones_santiago.json                              <-- Rotaciones de las 5 zonas (Vale) · plantilla hasta tener datos
│   ├── suelo_zonas.json                                      <-- Suelo por zona (Santi) · plantilla hasta tener datos
│   ├── zonificacion_aizal.json                               <-- Zonificación k-means con AIZAL (Santi) · plantilla hasta tener datos
│   └── datos_cruzados_aizal/                                 <-- Catálogo AIZAL V4: 38 variables de suelo, clima y paisaje
│       ├── CATALOGO_MAESTRO_VARIABLES.md                     <-- Índice de módulos y reglas que disparan
│       ├── 01_Clima_y_Balance_Hidrico/ (2 archivos)          <-- B01-B08: agua, lluvia, sequía, temperatura
│       ├── 02_Vegetacion_Fenologia_y_Paisaje/ (2 archivos)   <-- B19-B23, B30-B31: paisaje, NDVI, monte
│       ├── 03_Quimica_Nutricion_Suelo/ (2 archivos)          <-- B09, B11, B13-B16: nitrógeno, pH, carbono
│       ├── 04_Fisica_Suelo_y_Topografia/ (2 archivos)        <-- B10, B12, B17-B18, B24-B25: textura, relieve
│       ├── 05_Logistica_Antropico_y_Servicios/ (2 archivos)  <-- B26-B29, B32-B37: caminos, población
│       └── 06_Embeddings_IA_AlphaEarth/ (2 archivos)         <-- Embeddings AlphaEarth 64D (DeepMind)
├── docs/ (18 archivos)                                       <-- Documentación del equipo
├── ia_desmonte/
│   ├── BioSat_IA_Zonificacion_y_Desmonte.ipynb
│   ├── INSTRUCCIONES_PIPELINE.md                             <-- 🛰️ Instrucciones de Operación del Pipeline Automatizado B...
│   ├── README.md                                             <-- 🛰️ Espacio de Trabajo: santi-task
│   ├── data/
│   │   ├── desmonte_entrenamiento_2001_2015.csv
│   │   ├── desmonte_prueba_2016_2023.csv
│   │   ├── desmonte_zonas.json
│   │   ├── serie_historica_desmonte_zonas.csv
│   │   ├── zonas_bioclima_suelo.csv
│   │   └── zonificacion_aizal.json
│   ├── gee/
│   │   ├── biosat_gee_pipeline_completo.js
│   │   └── README_GEE.md                                     <-- Módulo Google Earth Engine (GEE): Extracción y Procesamie...
│   ├── graficos_y_resultados/
│   │   ├── 01_codo_y_silueta_kmeans.png
│   │   ├── 02_heatmap_perfiles_clusters.png
│   │   ├── 03_matriz_correspondencia_zonas.png
│   │   ├── 04_curvas_roc_modelos.png
│   │   ├── 05_matrices_confusion.png
│   │   ├── 06_importancia_variables_rf.png
│   │   ├── 07_serie_historica_desmonte.png
│   │   ├── 08_riesgo_desmonte_por_zona.png
│   │   ├── resumen_metricas_modelos.csv
│   │   ├── explicaciones/ (9 archivos)
│   │   └── historial/ (2 archivos)
│   ├── python/
│   │   ├── compilar_notebook.py
│   │   ├── extraer_metricas_pdf.py
│   │   └── pipeline_automatizado.py
│   └── registros/
│       ├── INDICE_REGISTROS.md                               <-- 📂 Índice Histórico de Registros y Reportes PDF
│       ├── registro_metricas_20261114_151536.json
│       └── Reporte_IA_BioSat_20261114_151536.pdf
├── planes/                                                   <-- Plan de cada integrante y cómo trabajamos en ramas
│   ├── 1-enzo.md                                             <-- Plan de Enzo · integración y app (rama enzo-app)
│   ├── 2-santi.md                                            <-- Plan de Santi · suelo, satélite e IA (rama santi-datos-ia)
│   ├── 3-vale.md                                             <-- Plan de Vale · campo y agronomía (rama vale-rotaciones)
│   ├── 4-sara.md                                             <-- Plan de Sara · Arduino y relato (rama sara-arduino-entrega)
│   └── README.md                                             <-- Objetivo común, ramas, reglas e hitos de integración
├── scripts/                                                  <-- Herramientas para bajar y procesar datos
│   ├── actualizar_readme.py                                  <-- Regenera las secciones automáticas del README
│   ├── descargar_meteomatics.py
│   ├── descargar_nasa_power.py                               <-- Descarga y resume NASA POWER por zona
│   ├── earth_engine_embeddings.js                            <-- Ejemplo GEE de embeddings (falta adaptar a SdE)
│   ├── gee_exportar_zonas.js                                 <-- Earth Engine: estadísticas e imágenes por zona para la app
│   ├── gee_visor_biosat.js                                   <-- Visor GIS en Earth Engine: 2000 vs 2025, NDVI, desmonte, zonas IA
│   └── gee_zonas_y_desmonte.js                               <-- Earth Engine: zonificación AIZAL y modelo predictivo de desmontes
├── tests/                                                    <-- Pruebas de Node (node --test tests/*.test.js)
│   └── kit-logica.test.js
└── web/                                                      <-- App web BioSat (abrir con un servidor: ver Inicio rápido)
    ├── app.js                                                <-- Lógica de la app: datos, motor, calendario, simulador y visor
    ├── campo.css                                             <-- Estilos de la guía Del kit al campo
    ├── campo.html                                            <-- Guía Del kit al campo: del kit a estaciones fijas en el lote
    ├── estilos.css                                           <-- Estilos de la app
    ├── index.html                                            <-- Página de la app
    ├── kit-logica.js                                         <-- Lógica de la pantalla del kit, sin interfaz (con pruebas)
    ├── kit.css                                               <-- Estilos de la pantalla del kit (tema oscuro de alto contraste)
    ├── kit.html                                              <-- Pantalla del kit para la mesa del jurado (3 bandejas en vivo)
    ├── kit.js                                                <-- Pantalla del kit: teclado, Arduino y dibujo de las bandejas
    ├── datos-borrador/                                       <-- Rotaciones borrador hasta que Vale cargue las validadas
    │   └── rotaciones_borrador.json
    ├── img/ (22 archivos)                                    <-- Imágenes Landsat de vista previa (Planetary Computer)
    └── vendor/                                               <-- Leaflet, para el mapa sin internet
        ├── leaflet.css
        └── leaflet.js
```
<!-- AUTO:ESTRUCTURA:FIN -->

---

## Inicio rápido

**Ver la app publicada:** https://enzopazzelli.github.io/BioSat/web/

**Bajar y resumir el clima de NASA POWER** (no necesita cuenta; genera `data/clima_zonas.json`):

```bash
python scripts/descargar_nasa_power.py
```

**Ver la app en tu compu** (cuando exista `web/`). Hay que abrirla con un servidor local, porque el navegador no deja leer los JSON si abrís el HTML con doble clic:

```bash
python -m http.server 8000
# y abrir http://localhost:8000/web/
```

**Google Earth Engine** (se pegan en el [Code Editor](https://code.earthengine.google.com) y se corren con "Run"):

- `scripts/gee_visor_biosat.js`: visor GIS de la provincia (2000 contra 2025, NDVI, suelo pelado, desmonte, zonas IA). Se puede publicar como Earth Engine App.
- `scripts/gee_exportar_zonas.js`: estadísticas e imágenes por zona para la app.
- `scripts/gee_zonas_y_desmonte.js`: zonificación con AIZAL (k-means) y modelo predictivo de desmontes con validación temporal.
- `scripts/earth_engine_embeddings.js`: compara embeddings AlphaEarth entre años.

**Actualizar este README a mano** (normalmente no hace falta, ver abajo):

```bash
python scripts/actualizar_readme.py
```

---

## Documentación

| Para… | Leer |
|---|---|
| Saber qué hacer y quién lo hace | [PLAN.md](PLAN.md) |
| Saber el formato de los datos compartidos | [docs/contratos-de-datos.md](docs/contratos-de-datos.md) |
| Entender el desafío | [docs/resena-desafio.md](docs/resena-desafio.md) · [docs/recursos-desafio.md](docs/recursos-desafio.md) |
| Ver los datos y su arquitectura | [ESTRUCTURA_DATOS.md](ESTRUCTURA_DATOS.md) · [catálogo AIZAL](data/datos_cruzados_aizal/CATALOGO_MAESTRO_VARIABLES.md) · [análisis NASA](docs/analisis-datos-nasa-santiago.md) |
| Entender la agronomía y las reglas | [docs/documentacion-tecnica-agronomica.md](docs/documentacion-tecnica-agronomica.md) · [docs/zonas-santiago-y-kit-arduino.md](docs/zonas-santiago-y-kit-arduino.md) |
| Conocer las reglas del equipo y las decisiones | [docs/reglas-y-bitacora.md](docs/reglas-y-bitacora.md) · [docs/glosario.md](docs/glosario.md) |
| Ver el contexto del primer día | [CONTEXTO.md](CONTEXTO.md) |

---

## Cómo se mantiene actualizado este README

Las secciones **Estado del proyecto**, **Últimas decisiones** y **Estructura del repositorio** se generan solas:

- **Cuándo:** en cada `push` a `main`, GitHub Actions corre [`scripts/actualizar_readme.py`](scripts/actualizar_readme.py) y, si algo cambió, sube el README actualizado.
- **Avance:** sale de las casillas `- [ ]` / `- [x]` de los planes de [`planes/`](planes/README.md).
- **Decisiones:** salen de la [bitácora](docs/reglas-y-bitacora.md).
- **Estructura:** sale de los archivos del repo. Para darle descripción a un archivo nuevo, agregalo en `DESCRIPCIONES` dentro del script.
- **Qué no tocar a mano:** lo que está entre las marcas `<!-- AUTO:... -->`, porque se pisa. El resto del README sí se edita a mano.
- **Después de un push:** como el robot puede subir un commit, hacé `git pull --rebase` antes de tu próximo push.

---

## Reglas rápidas para colaborar

1. **Antes de empezar:** leer [planes/README.md](planes/README.md), tu plan y [docs/contratos-de-datos.md](docs/contratos-de-datos.md). Los agentes de IA también.
2. **Ramas y archivos:** cada uno trabaja en su rama y en sus archivos; nadie sube directo a `main`. Se integra con un *Pull Request* en cada hito.
3. **Para traer lo de los demás:** `git fetch origin && git merge origin/main`. Commits chicos y sin la línea `Co-Authored-By`.
4. **Datos faltantes:** van como `null`. **Nunca inventar números.**
5. **Registro:** cada decisión va a la bitácora y cada término nuevo al glosario.
