# Guía Completa de Recursos del Desafío — Qué Trae Cada Página, Qué Se Puede Sacar y Cómo Lo Usamos en BioSat

> **Fuente:** Pestaña oficial *Resources* (`NASA Space Apps Challenge.mhtml`) y pestaña *Details* (`NASA Space Apps Challenge.pdf`).
> **Propósito de este documento:** Explicar en lenguaje claro **qué tiene adentro cada una de las 26 páginas oficiales**, **qué datos concretos se pueden extraer de cada una**, **cómo se conectan con Santiago del Estero** y **cómo implementamos la sugerencia de la profesora de Sistemas de IA (`Landsat + CNN + RNN + Transformer` para detección de desmonte)**.

---

## 1. Resumen Rápido: Qué pide el desafío con estos recursos

El desafío **"Field Shift: Adapting Farms with NASA Data"** pide combinar observaciones de la Tierra de la NASA con datos locales de suelo, características de los cultivos y prioridades del productor para **comparar al menos 3 estrategias de rotación (incluida la actual)**.

De los **26 enlaces oficiales** que da la NASA en la pestaña *Resources*:
- **13 son Globales (sirven directamente en Santiago del Estero, Argentina):** Satélites de la NASA, ESA y modelos de la FAO/ECMWF.
- **13 son Exclusivos de EE. UU. (USDA / USGS):** Sirven como referencia de qué tipo de variables locales importan, y en **BioSat** los cubrimos con nuestras **fuentes locales + el Kit Arduino + ESP32 en tierra**.

---

## 2. Los 13 Recursos Globales (Sirven en Santiago del Estero): Qué trae cada página y qué se puede sacar

---

### 1. NASA POWER (*Prediction Of Worldwide Energy Resources*)
- **Enlace oficial:** https://power.larc.nasa.gov/
- **Qué trae la página:**
  - Un visor interactivo (*Data Access Viewer*) para hacer clic en cualquier punto del mapa mundial y descargar datos en CSV/JSON/NetCDF.
  - Una **API REST abierta y gratuita (sin cuenta ni clave)** dividida en la comunidad Agroclimatológica (`community=AG`), Energías Renovables (`RE`) y Edificios (`SB`).
  - Documentación completa de más de 100 parámetros diarios, mensuales y climatológicos desde **1981 hasta hoy**.
- **Qué se puede sacar de ahí:**
  - **Temperaturas diarias a 2 metros:** Máxima (`T2M_MAX`), mínima (`T2M_MIN`), media (`T2M`) y punto de rocío (`T2MDEW`) → para contar **días de golpe de calor (> 35 °C y > 40 °C)** y **días con riesgo de helada (≤ 3 °C)**.
  - **Lluvia diaria corregida (`PRECTOTCORR`):** Milímetros por día → para calcular lluvia mensual, rachas de sequía y tormentas torrenciales (> 30 mm/día).
  - **Humedad del suelo:** En la zona de raíces hasta ~1 m (`GWETROOT`), en la capa superficial de 0–5 cm (`GWETTOP`) y perfil total (`GWETPROF`), expresados de `0` (seco) a `1` (saturado).
  - **Evapotranspiración / Transpiración (`EVPTRNS`):** Milímetros de agua que pierde/consume el lote por día.
  - **Radiación solar (`ALLSKY_SFC_SW_DWN`) y Humedad Relativa (`RH2M`).**
- **Estado en BioSat:** ✅ **YA DESCARGADO Y PROCESADO** para las 4 zonas de Santiago del Estero (`2020–2025`, 8.768 días) en [`data/nasa_power_santiago_zonas.json`](../data/nasa_power_santiago_zonas.json) y [`data/resumen_mensual_santiago.csv`](../data/resumen_mensual_santiago.csv).

---

### 2. Landsat (NASA / USGS) — *Eje del Módulo de IA de la Profesora*
- **Enlace oficial en Resources:** https://earthexplorer.usgs.gov/ *(y acceso rápido por API/recorte vía **NASA AppEEARS** o **Microsoft Planetary Computer / AWS STAC**)*.
- **Qué trae la página (EarthExplorer):**
  - El archivo histórico civil más largo de imágenes satelitales de la Tierra (desde 1972 hasta hoy con **Landsat 8 y Landsat 9**).
  - Buscador por coordenadas o polígono, filtro por fecha y por porcentaje de nubes, con previsualización rápida y descarga de escenas multiespectrales corregidas (*Collection 2 Level-2 Surface Reflectance* y *Surface Temperature*).
- **Qué se puede sacar de ahí (a 30 metros de resolución cada 8 días combinando Landsat 8 y 9):**
  - **Bandas visibles (`B2` Azul, `B3` Verde, `B4` Rojo):** Fotos en color real para ver el avance de los desmontes, caminos, cortinas forestales y lotes en Santiago del Estero.
  - **Banda Infrarrojo Cercano (`B5` — NIR):** La clorofila sana rebota el infrarrojo; al cruzarla con el Rojo (`B4`) se obtiene el **NDVI** a 30 metros (distingue lote verde vs. lote pelado).
  - **Bandas Infrarrojo de Onda Corta (`B6` — SWIR1 y `B7` — SWIR2):** Ideales para medir **suelo desnudo, rastrojo seco, humedad superficial y cicatrices de desmonte** mediante dos índices clave:
    - **NBR (*Normalized Burn/Clearing Ratio* = `(B5 - B7) / (B5 + B7)`):** Cae en picada apenas se desmonta o quema el monte nativo.
    - **BSI (*Bare Soil Index* — Índice de Suelo Desnudo):** Resalta en rojo brillante las hectáreas que quedaron con la tierra totalmente pelada.
  - **Banda Térmica (`B10` — TIRS):** Temperatura de la superficie del suelo a 30–100 m (muestra cómo un lote desmontado y pelado levanta mucha más temperatura que el monte vecino).
- **Cómo se usa con la sugerencia de la profesora (`CNN + RNN + Transformer`):** Ver **Sección 4** de este documento.

---

### 3. MODIS (NASA LP DAAC)
- **Enlace oficial:** https://lpdaac.usgs.gov/products/
- **Qué trae la página:**
  - Catálogo de productos terrestres de los satélites **Terra y Aqua** de la NASA desde el año **2000 hasta hoy** (resolución de **250 m a 1 km**).
- **Qué se puede sacar de ahí:**
  - **Producto `MOD13Q1` / `MYD13Q1` (250 metros, cada 16 días):** Series continuas de **25 años de NDVI y EVI** sin huecos por nubes.
  - **Producto `MOD11A2` (1 km):** Temperatura superficial diurna y nocturna.
  - **Producto `MOD16A2` (500 m):** Evapotranspiración global.
- **Para qué sirve en BioSat:** Mientras Landsat ve el detalle a 30 m cada 8–16 días, MODIS da una curva suave de 25 años para ver en qué meses exactos del año cada zona de Santiago del Estero suele quedar con el suelo descubierto.

---

### 4. VIIRS (NASA / NOAA en Earthdata Search)
- **Enlace oficial:** https://search.earthdata.nasa.gov/search?q=VIIRS
- **Qué trae la página:**
  - Buscador **Earthdata Search** de la NASA filtrado por el sensor **VIIRS** (a bordo de los satélites NOAA-20 y NOAA-21, continuador moderno de MODIS a **375 m – 750 m** de resolución diaria).
- **Qué se puede sacar de ahí:**
  - Índices de vegetación (`VNP13A1`), temperatura superficial y anomalías térmicas/focos de calor diarios (muy útil cuando el desmonte se acompaña de quema de acordonados).

---

### 5. SMAP (*Soil Moisture Active Passive* — NASA)
- **Enlace oficial:** https://www.earthdata.nasa.gov/data/platforms/space-based-platforms/smap
- **Qué trae la página:**
  - Portal de la misión SMAP de la NASA, con acceso a mapas globales de humedad superficial del suelo (primeros **5 cm**) y humedad en zona radicular asimilada (productos **L3 y L4** a **9 km – 36 km** cada 2–3 días desde 2015).
- **Qué se puede sacar de ahí:**
  - Anomalías de humedad superficial regional y velocidad de secado del suelo después de una lluvia.
- **Para qué sirve en BioSat:** Es el espejo espacial directo de nuestro **sensor de humedad/conductividad del Kit Arduino**: SMAP muestra la humedad de toda la comarca (9 km) y el Arduino mide la humedad y el salitre en el metro cuadrado real del lote.

---

### 6. GPM & IMERG (*Global Precipitation Measurement* — NASA)
- **Enlace oficial:** https://gpm.nasa.gov/data *(y visor directo en [NASA Worldview](https://worldview.earthdata.nasa.gov/))*
- **Qué trae la página:**
  - Datos de la constelación internacional de satélites de lluvia liderada por la NASA, cuyo producto estrella (**IMERG**) entrega mapas globales de lluvia cada **30 minutos** a **~10 km (0,1°)** de resolución.
  - La página aclara un truco muy útil para el hackathon: **desde NASA Worldview se pueden descargar directamente imágenes de alta resolución de las capas IMERG**.
- **Qué se puede sacar de ahí:**
  - Intensidad de tormentas torrenciales (como los diluvios de marzo en Santiago del Estero) y mapas visuales de acumulación de lluvia para poner en la interfaz.

---

### 7. SRTM (*Shuttle Radar Topography Mission* — NASA)
- **Enlace oficial:** https://www.earthdata.nasa.gov/data/instruments/srtm
- **Qué trae la página:**
  - Modelo Digital de Elevación (DEM) global en 3D a **30 metros de resolución** tomado por el radar del Transbordador Espacial Endeavour.
- **Qué se puede sacar de ahí:**
  - **Altura sobre el nivel del mar (m s.n.m.) y porcentaje de pendiente de cada lote:**
    - En **Zona 3 (Guasayán / Ojo de Agua)**: detecta pendientes donde el suelo pelado sufre **erosión hídrica y cárcavas** cuando llueve fuerte.
    - En **Zona 1 (Río Dulce) y Zona 4 (Añatuya / Bajos Submeridionales)**: confirma pendientes de **< 0,1 % (llanura deprimida)** donde el agua no escurre, se encharca y sube la napa salina.

---

### 8. ECOSTRESS (NASA JPL en la Estación Espacial Internacional)
- **Enlace oficial:** https://ecostress.jpl.nasa.gov/data
- **Qué trae la página:**
  - Radiómetro térmico instalado en la Estación Espacial Internacional (ISS) que mide la temperatura de las plantas y del suelo a **~70 metros de resolución** en distintos horarios del día.
- **Qué se puede sacar de ahí:**
  - **Temperatura de Superficie Terrestre (`LST`)**, **Evapotranspiración instantánea (`ET`)** e **Índice de Estrés Hídrico (`ESI`)**.
- **Para qué sirve en BioSat:** Demuestra desde el espacio que una parcela desmontada y pelada en Santiago del Estero actúa como un "horno" (+10 a +15 °C más caliente que el monte nativo o que un lote con cobertura/rastrojo), exactamente lo mismo que medimos en tierra con el sensor **`LM35`** de nuestro Kit Arduino.

---

### 9. NLDAS / GLDAS (*Land Data Assimilation Systems* — NASA)
- **Enlace oficial:** https://www.earthdata.nasa.gov/ *(buscando `GLDAS` en Earthdata Search o Giovanni)*.
- **Qué trae la página:**
  - Modelos globales (`GLDAS`, 0,25°) que fusionan satélites y estaciones cada 3 horas desde 1948/2000 para estimar humedad del suelo en 4 capas de profundidad (0–10 cm, 10–40 cm, 40–100 cm, 100–200 cm), temperatura del suelo y escorrentía.
- **Qué se puede sacar de ahí:**
  - Series continuas de temperatura y humedad del suelo por profundidad. (En BioSat ya tenemos `GWETROOT` y `EVPTRNS` diarios desde NASA POWER, que es mucho más rápido de consultar).

---

### 10. FAO GAEZ v5 (*Global Agro-Ecological Zones* — FAO / IIASA)
- **Enlace oficial:** https://gaez.fao.org/
- **Qué trae la página:**
  - Visor interactivo y descarga gratuita de capas globales a **1 km de resolución** sobre aptitud agroclimática y edáfica para **más de 50 cultivos** (maíz, soja, trigo, sorgo, algodón, girasol, alfalfa, garbanzo, poroto, mijo, etc.).
- **Qué se puede sacar de ahí:**
  - **Rinde potencial en secano vs. riego** en cada zona de Santiago del Estero.
  - **Limitaciones de suelo** (salinidad, alcalinidad/sodio, drenaje pobre).
  - **Proyecciones futuras de Cambio Climático (2040, 2070, 2100 bajo escenarios SSP1-2.6, SSP3-7.0 y SSP5-8.5):** Permite responderle al agricultor santiagueño si su cultivo actual seguirá siendo viable en 2040 cuando aumenten aún más los días de > 40 °C.

---

### 11. GEDI (*Global Ecosystem Dynamics Investigation* — NASA LiDAR)
- **Enlace oficial:** https://gedi.umd.edu/data
- **Qué trae la página:**
  - Datos del láser LiDAR de la NASA montado en la Estación Espacial Internacional, que mide en 3D la **altura de los árboles, la densidad del dosel (copa) y la biomasa aérea (toneladas de carbono por hectárea)**.
- **Qué se puede sacar de ahí (Revalorizado con la idea de la profesora):**
  - Aunque ayer parecía descartable para lotes de soja o trigo, **en Santiago del Estero (Zona 3: Chaco Semiárido y Monte)** GEDI permite cuantificar la **altura y biomasa del monte nativo (quebracho y algarrobo)** antes y después del desmonte o raleo, complementando las imágenes **Landsat** del modelo `CNN + RNN + Transformer`.

---

### 12. Copernicus Sentinel-2 (Agencia Espacial Europea — ESA)
- **Enlace oficial:** https://dataspace.copernicus.eu/
- **Qué trae la página:**
  - El navegador **Copernicus Browser** (funciona sin cuenta para ver y descargar capturas, y con cuenta gratuita para bajar datos crudos o usar API) con imágenes multiespectrales cada **5 días** a **10 y 20 metros de resolución**.
- **Qué se puede sacar de ahí:**
  - Imágenes ópticas de **10 metros** (3 veces más nítidas que Landsat) y bandas de **Borde Rojo (*Red-Edge*)** específicas para detectar estrés temprano por falta de nitrógeno o salinidad dentro de un lote.

---

### 13. ERA5: Reanálisis Climático Global (ECMWF / Copernicus)
- **Enlace oficial:** https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview
- **Qué trae la página:**
  - El archivo climático horario más completo del mundo desde **1940 hasta hoy** (temperatura de aire, temperatura de suelo en 4 niveles, viento, radiación y lluvia).
- **Qué se puede sacar de ahí:**
  - Viento horario (viento norte desecante en Santiago del Estero) y temperatura del suelo desde 1940 si se requiere extender aún más la serie de NASA POWER.

---

## 3. Los 13 Recursos Exclusivos de EE. UU.: Qué traen y cómo los reemplazamos en Santiago del Estero

La mitad de los enlaces oficiales apuntan a agencias de Estados Unidos (USDA / USGS). **Es muy importante conocer qué trae cada uno** porque muestran qué variables espera ver el jurado, y cómo las cubrimos nosotros en Argentina:

| # | Recurso Oficial (EE. UU.) | Qué trae su página web y qué se saca de ahí | Con qué lo reemplazamos en **BioSat (Santiago del Estero)** |
|---|---|---|---|
| **14** | **USDA Ag Data Commons**<br>https://www.nal.usda.gov/services/agdatacommons | Repositorio de investigaciones agrícolas abiertas (ensayos de cultivos de cobertura, rotación y manejo de suelos). | Ensayos agronómicos locales del **INTA Santiago del Estero / Quimilí** (fechas de secado de vicia/centeno, melilotus en suelos salinos y sistemas silvopastoriles). |
| **15** | **Web Soil Survey (WSS)**<br>https://websoilsurvey.nrcs.usda.gov/app/ | Mapa interactivo de suelos de EE. UU. a escala de lote (textura, materia orgánica, drenaje, salinidad, capacidad de retención de agua). | Cartas de Suelos del **INTA / GeoINTA** + **SoilGrids (ISRIC 250 m)** + lectura física directa con nuestro **Kit Arduino** (conductividad/salitre y humedad). |
| **16** | **USDA NRCS SSURGO / STATSGO2**<br>https://www.nrcs.usda.gov/resources/data-and-reports/soils | Base de datos descargable detrás de Web Soil Survey para meter propiedades de suelo en modelos de IA. | Perfiles edáficos de las **4 Zonas Agroecológicas de Santiago del Estero** documentados en BioSat. |
| **17** | **Cropland Data Layer (CDL): CropScape**<br>https://nassgeodata.gmu.edu/CropScape/ | Mapa satelital anual de EE. UU. (10–30 m) que dice exactamente qué cultivo se sembró cada año en cada lote (maíz, soja, algodón, alfalfa). | En Argentina: **Mapa Nacional de Cultivos (INTA)** + clasificación propia con **Landsat (`CNN + RNN + Transformer`)** + lo que declara el productor en la pantalla. |
| **18** | **PRISM Climate Data**<br>https://prism.oregonstate.edu/ | Grilla climática de EE. UU. (800 m) con normales de 30 años y fechas de primera/última helada. | **NASA POWER** (procesado día por día en `data/nasa_power_santiago_zonas.json`, incluyendo conteo exacto de heladas ≤ 3 °C y calor > 35/40 °C). |
| **19** | **National Agriculture Imagery Program (NAIP)**<br>https://naip-usdaonline.hub.arcgis.com/ | Fotos aéreas de EE. UU. a 1 metro de resolución para ver bordes de lotes y surcos. | **Sentinel-2 (10 m)** y **Landsat 8/9 (30 m)** + medición al ras del suelo con el **Kit Arduino**. |
| **20** | **USGS National Land Cover Database (NLCD)**<br>https://www.usgs.gov/centers/eros/science/national-land-cover-database | Mapa multidecadal a 30 m de uso del suelo en EE. UU. (bosque, pastura, cultivo, humedal). | En nuestra región: **Landsat (30 m)** procesado por nuestro módulo **`CNN + RNN + Transformer`** (y referencia de *MapBiomas Chaco*). |
| **21** | **CoCoRaHS**<br>https://www.cocorahs.org/Maps | Red de pluviómetros ciudadanos en Norteamérica para validar lluvias satelitales en tierra. | **Nuestro Kit Arduino + ESP32** actuando como estación de validación en tierra (*Ground Truth*) frente a los satélites de la NASA. |
| **22** | **USGS National Water Information Systems (NWIS)**<br>https://waterdata.usgs.gov/nwis | Nivel de napas freáticas y caudal de ríos en EE. UU. | Datos de la cuenca del **Río Dulce y Río Salado** + detección de salitre por ascenso de napa con el sensor conductivo del **Kit Arduino**. |
| **23** | **USDA AMS Market News**<br>https://www.ams.usda.gov/market-news | Precios diarios y demanda de granos, algodón y forrajes en EE. UU. | Precios y canales comerciales locales en Santiago del Estero (algodón en desmotadoras locales, maíz/soja/sorgo, fardos de alfalfa y ganadería caprina/bovina). |
| **24** | **USDA NASS QuickStats**<br>https://quickstats.nass.usda.gov/ | Estadísticas históricas de rindes y hectáreas sembradas por condado en EE. UU. | Estadísticas por departamento de Santiago del Estero (Estimaciones Agrícolas de Argentina) e idoneidad **FAO GAEZ**. |
| **25** | **OpenET**<br>https://openetdata.org/ | Evapotranspiración satelital a 30 m (con Landsat) lote por lote en el oeste de EE. UU. (y expansión a Brasil). | Combinación de **NASA POWER (`EVPTRNS`)** + **ECOSTRESS (~70 m)** + temperatura/humedad medida por **`DHT11` y `LM35`** en el Arduino. |
| **26** | **USFS LANDFIRE**<br>https://www.landfire.gov/ | Capas de vegetación y carga de combustible para incendios en EE. UU. | Índice `NBR` y `NDVI` sobre **Landsat 8/9** en el monte santiagueño. |

---

## 4. Cómo Implementamos las Sugerencias de la Profesora de Sistemas de IA

> **Mensajes de la profesora (14/11/2026 — 11:03 hs):**
> 1. *"Con imágenes Landsat de la NASA pueden proponer detección de áreas en proceso de desmonte usando aprendizaje profundo (CNN + RNN + transformers)"*
> 2. *"Tiene que ser con imágenes de la NASA, por eso les sugiero Landsat"*

### 4.1. Por qué la sugerencia de la profesora es brillante para BioSat
1. **Usa un recurso 100 % oficial de la lista de la NASA (`Landsat`, Recurso #2):** Cumple estrictamente la regla de usar datos espaciales de la NASA.
2. **Ataca la raíz del problema ambiental y productivo de Santiago del Estero:** El Parque Chaqueño santiagueño es una de las regiones con mayor presión de desmonte de Sudamérica. Cuando un lote pasa de monte nativo a desmonte sin cobertura, los **126 días de calor > 35 °C** y los **diluvios de marzo** que descubrimos en **NASA POWER** destruyen la estructura del suelo en pocos años.
3. **Se conecta directamente con el objetivo del desafío (*Field Shift*):** El modelo de Aprendizaje Profundo (`CNN + RNN + Transformer`) no se queda solo en "denunciar un desmonte", sino que **diagnostica el grado de fragilidad del lote y alimenta automáticamente el recomendador de las 3 estrategias de rotación**:
   - Si el lote presenta **desmonte reciente o pérdida de cortinas forestales**, la herramienta bloquea las rotaciones con barbecho pelado y prioriza **Sistemas Agro-Silvopastoriles (Algarrobo + Pasturas megatérmicas + Leguminosas)** o **Coberturas de Raíz Profunda**.

### 4.2. De dónde sacamos las imágenes Landsat de Santiago del Estero sin trabarnos
Tenemos **3 vías gratuitas y rápidas** para obtener los parches multitemporales de **Landsat 8 y 9 (Collection 2 Level-2, 30 m)** de nuestras 4 zonas de Santiago del Estero:
1. **API STAC abierta (AWS Earth Search / Microsoft Planetary Computer):** Permite descargar por script en Python (sin necesidad de esperar colas manuales) los recortes exactos de las bandas de **Landsat 8/9 (`B2, B3, B4, B5, B6, B7, B10`)** para las coordenadas de Campo Gallo, Quimilí, La Banda y Añatuya entre 2018 y 2025.
2. **NASA AppEEARS** (con cuenta Earthdata): Entrega series temporales de reflectancia Landsat/HLS recortadas por polígono.
3. **USGS EarthExplorer** (`https://earthexplorer.usgs.gov/`): El portal oficial citado en la pestaña *Resources*.

### 4.3. Qué hace cada parte de la Red Híbrida (`CNN + RNN + Transformer`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ENTRADA: Secuencia de imágenes NASA Landsat 8/9 (30 m) de un lote       │
│ en Santiago del Estero (t = 1, 2, ..., T fechas entre 2018 y 2025)      │
│ Bandas: Rojo (B4), Infrarrojo Cercano NIR (B5), SWIR1 (B6), SWIR2 (B7)  │
│ Índices calculados: NDVI (verdor), NBR (monte/desmonte), BSI (pelado)   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 1: CNN (Red Neuronal Convolucional 2D — "El Ojo Espacial")        │
│ • Pasa filtros convolucionales (3×3) sobre cada imagen Landsat.         │
│ • Detecta texturas espaciales: bordes geométricos de topadoras/rolos,   │
│   cortinas forestales, parches de monte denso vs. tierra pelada.        │
│ • Extrae un vector de características espaciales por cada fecha (f_t).  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 2: RNN / Bi-LSTM (Red Recurrente — "La Memoria Mes a Mes")        │
│ • Recibe en orden cronológico los vectores (f_1, f_2, ..., f_T).        │
│ • Distingue un cambio reversible (cosecha de maíz → barbecho corto →    │
│   siembra) de un cambio irreversible (Monte nativo → Raleo → Desmonte). │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ETAPA 3: Transformer Temporal (Multi-Head Self-Attention)               │
│ • Cruza toda la historia del lote en Landsat con las variables de       │
│   NASA POWER (días > 40 °C, racha seca de 130 días, lluvias extremas).  │
│ • Calcula qué momentos críticos tuvieron más peso ("Atención") en la    │
│   degradación actual del suelo.                                         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SALIDA (hacia la App de BioSat y el Agricultor):                        │
│ 1. Mapa de clasificación del lote (% Monte, % En Desmonte, % Pelado).   │
│ 2. Índice de Fragilidad Post-Desmonte (0 a 100%).                       │
│ 3. Ajuste directo de las 3 Estrategias de Rotación recomendadas.        │
└─────────────────────────────────────────────────────────────────────────┘
```
