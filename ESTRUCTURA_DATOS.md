# Estructura de Datos y Arquitectura de Variables — BioSat

Este documento describe la organización de las carpetas de datos del proyecto **BioSat**, su origen satelital/edáfico y su articulación con el motor agronómico para la recomendación y simulación de rotaciones de cultivos resilientes.

> **Nota:**
> - **Árbol de archivos:** el completo y siempre al día está en el [README](README.md) y se genera solo. El árbol de abajo muestra solo la parte de datos.
> - **Qué sale de cruzar los datos:** está en [`docs/cruce-de-datos.md`](docs/cruce-de-datos.md).
> - **Formatos de los JSON compartidos:** están en [`docs/contratos-de-datos.md`](docs/contratos-de-datos.md).

---

## 1. Visión General de la Estructura de Datos

El repositorio organiza los datos en dos niveles complementarios dentro de `data/`:
1. **Series Temporales Climáticas:** Registros diarios y resúmenes mensuales derivados de **NASA POWER** (`data/clima_zonas.json`, `data/resumen_mensual_santiago.csv`).
2. **Cubo Biofísico y Paisajístico (AIZAL V4):** Conjunto normalizado de 38 variables raster y embeddings de IA estructurados en **6 módulos temáticos** dentro de `data/datos_cruzados_aizal/`.

```text
BioSat/
├── ESTRUCTURA_DATOS.md                    <-- Este documento
├── README.md                              <-- Presentación del proyecto BioSat
├── CONTEXTO.md                            <-- Bitácora y contexto del desafío
├── data/
│   ├── resumen_mensual_santiago.csv       <-- Resumen climático mensual por zona
│   ├── clima_zonas.json                   <-- Clima NASA POWER 1981-2025 de las 5 zonas
│   ├── raw_nasa_power/                    <-- Caché local de NASA POWER (no se sube al repo)
│   └── datos_cruzados_aizal/              <-- Cubo de datos cruzados AIZAL V4
│       ├── CATALOGO_MAESTRO_VARIABLES.md  <-- Índice detallado de las 38 bandas
│       ├── 01_Clima_y_Balance_Hidrico/    <-- B01 a B08 (ET, Lluvia, PDSI, Tmin, Tmax, Albedo)
│       ├── 02_Vegetacion_Fenologia_y_Paisaje/ <-- B19 a B23, B30, B31 (IPSE, NDVI, Cobertura)
│       ├── 03_Quimica_Nutricion_Suelo/    <-- B09, B11, B13 a B16 (Nitrógeno, pH, CIC, Carbono)
│       ├── 04_Fisica_Suelo_y_Topografia/  <-- B10, B12, B17a/b, B18, B24, B25 (Textura, Densidad, DEM)
│       ├── 05_Logistica_Antropico_y_Servicios/ <-- B26 a B29, B32 a B37 (Caminos, Población, Huella)
│       └── 06_Embeddings_IA_AlphaEarth/   <-- Representación aprendida 64D (DeepMind 2024)
├── docs/                                  <-- Documentación técnica y agronómica
└── scripts/                               <-- Herramientas de descarga y procesamiento
```

---

## 2. Descripción de los 6 Módulos Temáticos

Cada subcarpeta dentro de `data/datos_cruzados_aizal/` contiene:
* `variables.json`: Esquema estructurado y normalizado listo para consumo en pipelines de Python, modelos de Machine Learning o APIs.
* `README.md`: Documentación técnica completa de cada variable, incluyendo fórmula de cálculo, resolución nativa, período de referencia y función fisiológica.

---

### Módulo 1: Clima y Balance Hídrico
* **Carpeta:** `data/datos_cruzados_aizal/01_Clima_y_Balance_Hidrico/`
* **Variables:** `B01` (Cursos de agua), `B02` (Cuerpos de agua permanente), `B03` (Evapotranspiración promedio anual), `B04` (Precipitación anual), `B05` (Índice de sequía de Palmer - PDSI), `B06` (Temperatura mínima), `B07` (Temperatura máxima), `B08` (Albedo).
* **Fuentes:** TerraClimate (normal 1991–2020), HydroSHEDS, JRC Global Surface Water, MODIS MCD43A3.
* **Impacto Agronómico:**
  * Contrasta la oferta hídrica (`B04`) con la demanda evaporativa (`B03`).
  * Identifica ventanas de heladas (`B06`) para programar siembras de cobertura invernal.
  * Dispara la regla de adaptación cuando el PDSI (`B05`) muestra sequía recurrente, sustituyendo maíz por especies rústicas (sorgo o girasol).

---

### Módulo 2: Vegetación, Fenología y Dinámica de Paisaje
* **Carpeta:** `data/datos_cruzados_aizal/02_Vegetacion_Fenologia_y_Paisaje/`
* **Variables:** `B19` (Riqueza del paisaje), `B20` (Fragmentación), `B21` (Dominancia), `B22` (Diversidad de Shannon), `B23` (Índice de Provisión de Servicios Ecosistémicos - IPSE), `B30` (Distancia a uso agropecuario), `B31` (Distancia a monte nativo).
* **Fuentes:** MapBiomas Chaco (Colección 5, 2023), MODIS MOD13Q1 (2001–2024).
* **Impacto Agronómico:**
  * Cuantifica la dinámica estacional de captura de carbono y vigor fotosintético mediante el IPSE (`B23`, derivado del promedio y coeficiente de variación de NDVI).
  * Detecta semanas críticas de suelo desnudo entre cosecha y siembra.
  * Mide la proximidad a cortinas forestales (`B31`) que atenúan la erosión eólica y proveen controladores biológicos de plagas.

---

### Módulo 3: Química, Nutrición y Fertilidad Edáfica
* **Carpeta:** `data/datos_cruzados_aizal/03_Quimica_Nutricion_Suelo/`
* **Variables:** `B09` (Capacidad de intercambio catiónico - CIC), `B11` (Nitrógeno total del suelo), `B13` (Densidad de carbono orgánico), `B14` (Stock de carbono orgánico), `B15` (Contenido de carbono orgánico), `B16` (pH en solución acuosa).
* **Fuentes:** ISRIC SoilGrids 2.0 (resolución 250 m resampleada a 500 m).
* **Impacto Agronómico:**
  * Establece la línea base de fertilidad nitrogenada (`B11`), disparando la necesidad de incorporar leguminosas fijadoras (Sección B).
  * Evalúa la viabilidad biológica de simbiosis con *Rhizobium* a través del pH (`B16`): valores ácidos (< 5.8) impiden la fijación efectiva de nitrógeno en soja y alfalfa.
  * Estima la capacidad del suelo para retener calcio, magnesio y potasio mediante la CIC (`B09`).

---

### Módulo 4: Física del Suelo, Relieve y Topografía
* **Carpeta:** `data/datos_cruzados_aizal/04_Fisica_Suelo_y_Topografia/`
* **Variables:** `B10` (Fragmentos gruesos), `B12` (Arcilla), `B17a` (Arena), `B17b` (Limo), `B18` (Densidad aparente), `B24` (Elevación digital), `B25` (Diversidad topográfica).
* **Fuentes:** SoilGrids 2.0, Copernicus DEM GLO-30 (versión 2024_1), ALOS.
* **Impacto Agronómico:**
  * Determina la tasa de infiltración y la capacidad de retención de agua disponible (AWC) a partir de la textura (`B12, B17a, B17b`).
  * La densidad aparente (`B18`) señala pisos de compactación, justificando la inclusión de oleaginosas con raíz pivotante profunda (Sección C - Girasol o Nabo forrajero) para descompactación biológica.
  * La elevación (`B24`) permite derivar pendientes y calcular el factor topográfico de pérdida de suelo por escorrentía (ecuación USLE).

---

### Módulo 5: Logística, Antrópico y Acceso a Servicios
* **Carpeta:** `data/datos_cruzados_aizal/05_Logistica_Antropico_y_Servicios/`
* **Variables:** `B26` (Distancia a instituciones), `B27` (Áreas protegidas), `B28` (Población), `B29` (Impacto humano / huella global), `B32` (Centros educativos), `B33` (Centros de salud), `B34` (Accesibilidad), `B35` (Comunidades originarias), `B36` (Distancia a caminos), `B37` (Crecimiento poblacional).
* **Fuentes:** OpenStreetMap, WorldPop R2025A, TNC Global Human Modification, Malaria Atlas Project.
* **Impacto Agronómico:**
  * Filtro de factibilidad económica: calcula el costo de flete hacia acopios locales en función de la distancia a la red vial (`B36`).
  * Evita proponer cultivos comerciales alternativos si la distancia a plantas de recepción excede los radios viables de transporte (< 50 km).

---

### Módulo 6: Embeddings Satelitales IA (AlphaEarth Foundations)
* **Carpeta:** `data/datos_cruzados_aizal/06_Embeddings_IA_AlphaEarth/`
* **Variables:** Vector multivariado de 64 dimensiones (`A00` a `A63`).
* **Fuentes:** Google DeepMind / Google Earth Engine (`GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL`, año 2024).
* **Impacto Agronómico:**
  * Resume un año completo de observaciones ópticas (Sentinel-2, Landsat), radar (Sentinel-1), LiDAR y clima en un vector unitario de 64 números.
  * Permite calcular la similitud por producto punto (coseno del ángulo) entre parcelas para transferir esquemas de rotación exitosos entre zonas con firmas agroecológicas análogas en el Gran Chaco.

---

## 3. Matriz de Integración: Pilares Fisiológicos vs. Módulos de Datos

```
+-----------------------------------+---------------------------------------------------+
| Pilar Fisiológico de la Planta    | Módulos de Datos que lo Alimentan                 |
+-----------------------------------+---------------------------------------------------+
| 1. Balance Hídrico                | 01_Clima_y_Balance_Hidrico (B03, B04, B05)        |
|                                   | 04_Fisica_Suelo_y_Topografia (B12, B17, AWC)      |
+-----------------------------------+---------------------------------------------------+
| 2. Régimen Térmico y Luz          | 01_Clima_y_Balance_Hidrico (B06 Tmin, B07 Tmax)   |
|                                   | NASA POWER (Días-Grado acumulados / GDD)          |
+-----------------------------------+---------------------------------------------------+
| 3. Física y Anclaje del Suelo     | 04_Fisica_Suelo_y_Topografia (B18 Densidad, B24)  |
|                                   | 01_Clima_y_Balance_Hidrico (B04 Lluvias extremas) |
+-----------------------------------+---------------------------------------------------+
| 4. Química y Nutrición            | 03_Quimica_Nutricion_Suelo (B11 N, B16 pH, B09)   |
|                                   | Insumo de Campo (Análisis de N-P-K disponible)    |
+-----------------------------------+---------------------------------------------------+
| 5. Sanidad y Dinámica Vegetal     | 02_Vegetacion_Fenologia_y_Paisaje (B23 IPSE, B31) |
|                                   | 06_Embeddings_IA_AlphaEarth (Similitud fenológica)|
+-----------------------------------+---------------------------------------------------+
| 6. Viabilidad Logística/Comercial | 05_Logistica_Antropico_y_Servicios (B36 Caminos)  |
+-----------------------------------+---------------------------------------------------+
```

---

## 4. Uso Programático (Ejemplo en Python)

Para cargar las especificaciones de cualquier módulo en un script de simulación:

```python
import json
from pathlib import Path

# Cargar variables del módulo de suelo
ruta_modulo = Path("data/datos_cruzados_aizal/03_Quimica_Nutricion_Suelo/variables.json")

with open(ruta_modulo, "r", encoding="utf-8") as f:
    datos_suelo = json.load(f)

print(f"Módulo: {datos_suelo['categoria']}")
for codigo, v in datos_suelo["variables"].items():
    print(f"  [{codigo}] {v['titulo']} ({v['banda']}): {v['unidad']}")
```
