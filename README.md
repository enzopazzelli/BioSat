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
| Imágenes de 30 m, 2016-2025 | Landsat 8/9 (NASA/USGS) | Meses de suelo pelado y desmonte |
| Cobertura del suelo por año | MapBiomas Chaco | Etiquetas reales para entrenar y medir la IA |
| Suelo y paisaje (38 variables, 500 m) | AIZAL V4 (SoilGrids, TerraClimate, OSM) | pH, textura, carbono, nitrógeno, distancia a caminos y a monte |
| Sensores en tierra | Kit Arduino (suelo, humedad/conductividad, luz, aire) | Comparar satélite y suelo |
| El productor | Entrevista y formulario de la app | Rotación actual, prioridades y límites (riego, maquinaria, mercado) |

**Cómo funciona, técnicamente:**
1. **Datos:** scripts en Python bajan y resumen cada fuente en archivos JSON por zona (`data/`, ver [contratos](docs/contratos-de-datos.md)).
2. **IA:** una red **CNN + LSTM / Transformer** sobre series de Landsat detecta suelo pelado y desmonte. Se compara contra un método simple (umbrales de NDVI/NBR) con métricas medidas.
3. **Motor de reglas transparente:** usa secciones de cultivo (A gramíneas, B leguminosas, C raíces profundas, D coberturas) y las prioridades del productor para ordenar las rotaciones **y explicar por qué**.
4. **App web estática** (HTML + JavaScript): se publica en GitHub Pages, funciona sin internet y lee el Arduino por Web Serial.

**Por qué es diferente y qué aporta:**
- **Hecha para un lugar real:** está pensada para las 4 zonas de Santiago del Estero, con rotaciones revisadas por un productor de la zona. No es un mapa genérico "para cualquier punto del mundo".
- **Espacio + tierra:** une los datos satelitales de la NASA con mediciones en el suelo, en vivo.
- **IA que se puede medir:** no da por buena la IA; la compara contra un método simple y muestra los números.
- **Suelo del Gran Chaco:** usa datos locales de suelo (AIZAL), que fuera de EE. UU. casi nadie tiene a mano.
- **Honesta:** cada dato muestra su fuente y su incertidumbre, los dilemas quedan a la vista (por ejemplo, una cobertura protege el suelo pero gasta agua) y la herramienta **apoya, no reemplaza** al productor ni al agrónomo.

---

## Estado del proyecto

Avance por frente, contado desde las casillas de [PLAN.md](PLAN.md):

<!-- AUTO:AVANCE:INICIO -->
| Frente | Avance | Tareas |
|---|---|---|
| F1 · Clima con datos bien medidos (Enzo) | `░░░░░░░░░░` 0% | 0/9 |
| F2 · Suelo y paisaje con AIZAL (Santi) | `░░░░░░░░░░` 0% | 0/8 |
| F3 · IA con Landsat: suelo pelado y desmonte (Santi) | `░░░░░░░░░░` 0% | 0/12 |
| F4 · Rotaciones y agronomía (Tercer integrante) | `░░░░░░░░░░` 0% | 0/8 |
| F5 · App web y motor de reglas (Enzo) | `░░░░░░░░░░` 0% | 0/15 |
| F6 · Kit Arduino "Espacio vs. Tierra" (Enzo, con armado del tercer integrante) | `░░░░░░░░░░` 0% | 0/5 |
| F7 · Entrega y presentación (todos; coordina el tercer integrante) | `░░░░░░░░░░` 0% | 0/11 |
| **Total** | `░░░░░░░░░░` **0%** | **0/68** |
<!-- AUTO:AVANCE:FIN -->

**Últimas decisiones:**

<!-- AUTO:DECISIONES:INICIO -->
- **D-19**: Visor GIS con Google Earth Engine
- **D-18**: Análisis de zonas
- **D-17**: Lectura del video del desafío
- **D-16**: Correcciones científicas a los datos de clima
- **D-15**: Unificación del repositorio y plan para 3 integrantes
- **D-14**: Actualización integral de la guía de recursos oficiales + IA Landsat

Todas las decisiones están en la [bitácora](docs/reglas-y-bitacora.md).
<!-- AUTO:DECISIONES:FIN -->

---

## Equipo

| Quién | Rol | Frentes del plan |
|---|---|---|
| Enzo | Integración, app y Arduino | F1 Clima · F5 App y motor · F6 Arduino |
| Santi | Suelo, satélite e IA | F2 Suelo AIZAL · F3 IA Landsat |
| _Tercer integrante (a confirmar)_ | Campo, agronomía y relato | F4 Rotaciones · F7 Entrega |

El detalle de tareas, la ruta de trabajo y los diagramas están en **[PLAN.md](PLAN.md)**.

---

## Estructura del repositorio

<!-- AUTO:ESTRUCTURA:INICIO -->
```text
BioSat/
├── CONTEXTO.md                                               <-- Contexto inicial del 13/11 (histórico)
├── ESTRUCTURA_DATOS.md                                       <-- Arquitectura de datos y módulos AIZAL
├── NASA Space Apps Challenge - awards.mhtml                  <-- Premios globales y datos del equipo
├── NASA Space Apps Challenge.mhtml                           <-- Recursos oficiales (pestaña Resources)
├── NASA Space Apps Challenge.pdf                             <-- Enunciado oficial (pestaña Details)
├── PLAN.md                                                   <-- Plan de trabajo: roles, ruta y tareas
├── README.md                                                 <-- Portada del proyecto (se actualiza sola)
├── data/                                                     <-- Datos y contratos JSON que lee la app
│   ├── nasa_power_santiago_zonas.json                        <-- Clima NASA POWER 2020-2025 (se reemplaza, ver PLAN F1)
│   ├── resumen_mensual_santiago.csv                          <-- Resumen climático mensual por zona
│   ├── datos_cruzados_aizal/                                 <-- Catálogo AIZAL V4: 38 variables de suelo, clima y paisaje
│   │   ├── CATALOGO_MAESTRO_VARIABLES.md                     <-- Índice de módulos y reglas que disparan
│   │   ├── 01_Clima_y_Balance_Hidrico/ (2 archivos)          <-- B01-B08: agua, lluvia, sequía, temperatura
│   │   ├── 02_Vegetacion_Fenologia_y_Paisaje/ (2 archivos)   <-- B19-B23, B30-B31: paisaje, NDVI, monte
│   │   ├── 03_Quimica_Nutricion_Suelo/ (2 archivos)          <-- B09, B11, B13-B16: nitrógeno, pH, carbono
│   │   ├── 04_Fisica_Suelo_y_Topografia/ (2 archivos)        <-- B10, B12, B17-B18, B24-B25: textura, relieve
│   │   ├── 05_Logistica_Antropico_y_Servicios/ (2 archivos)  <-- B26-B29, B32-B37: caminos, población
│   │   └── 06_Embeddings_IA_AlphaEarth/ (2 archivos)         <-- Embeddings AlphaEarth 64D (DeepMind)
│   └── raw_nasa_power/ (4 archivos)                          <-- Descargas crudas de NASA POWER
├── docs/                                                     <-- Documentación del equipo
│   ├── AIZAL_Fichas_Variables_V4_2026.pdf                    <-- Fichas oficiales de las variables AIZAL V4
│   ├── analisis-datos-nasa-santiago.md                       <-- Hallazgos climáticos 2020-2025 (a corregir, ver PLAN F1)
│   ├── contratos-de-datos.md                                 <-- Formato de los JSON que comparten los frentes
│   ├── cruce-de-datos.md                                     <-- Qué sale de cruzar NASA POWER, AIZAL y Landsat; análisis de zonas
│   ├── documentacion-tecnica-agronomica.md                   <-- Secciones de cultivo A/B/C/D y reglas de rotación
│   ├── glosario.md                                           <-- Términos técnicos en lenguaje de productor
│   ├── plan-de-pasos-y-agentes.md                            <-- Plan anterior (reemplazado por PLAN.md)
│   ├── recursos-desafio.md                                   <-- Los 26 recursos oficiales y cómo los usamos
│   ├── reglas-y-bitacora.md                                  <-- Reglas de oro y bitácora de decisiones
│   ├── resena-desafio.md                                     <-- Reseña del desafío y guía de entrevista
│   ├── transcripcion-video-desafio.md                        <-- Transcripción del video del desafío (los 4 verbos)
│   └── zonas-santiago-y-kit-arduino.md                       <-- Las 4 zonas, sus rotaciones y el kit Arduino
└── scripts/                                                  <-- Herramientas para bajar y procesar datos
    ├── actualizar_readme.py                                  <-- Regenera las secciones automáticas del README
    ├── descargar_nasa_power.py                               <-- Descarga y resume NASA POWER por zona
    ├── earth_engine_embeddings.js                            <-- Ejemplo GEE de embeddings (falta adaptar a SdE)
    ├── gee_exportar_zonas.js                                 <-- Earth Engine: estadísticas e imágenes por zona para la app
    └── gee_visor_biosat.js                                   <-- Visor GIS en Earth Engine: 2000 vs 2025, NDVI, desmonte, zonas IA
```
<!-- AUTO:ESTRUCTURA:FIN -->

---

## Inicio rápido

**Bajar y resumir el clima de NASA POWER** (no necesita cuenta):

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
- **Avance:** sale de las casillas `- [ ]` / `- [x]` de [PLAN.md](PLAN.md).
- **Decisiones:** salen de la [bitácora](docs/reglas-y-bitacora.md).
- **Estructura:** sale de los archivos del repo. Para darle descripción a un archivo nuevo, agregalo en `DESCRIPCIONES` dentro del script.
- **Qué no tocar a mano:** lo que está entre las marcas `<!-- AUTO:... -->`, porque se pisa. El resto del README sí se edita a mano.
- **Después de un push:** como el robot puede subir un commit, hacé `git pull --rebase` antes de tu próximo push.

---

## Reglas rápidas para colaborar

1. **Antes de empezar:** leer [PLAN.md](PLAN.md) y [docs/contratos-de-datos.md](docs/contratos-de-datos.md). Los agentes de IA también.
2. **Carpetas:** cada rol trabaja en sus carpetas (ver PLAN §2).
3. **Antes de cada push:** `git pull --rebase`. Commits chicos y sin la línea `Co-Authored-By`.
4. **Datos faltantes:** van como `null`. **Nunca inventar números.**
5. **Registro:** cada decisión va a la bitácora y cada término nuevo al glosario.
