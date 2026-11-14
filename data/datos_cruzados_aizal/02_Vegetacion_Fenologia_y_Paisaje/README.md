# Módulo: Vegetación, Fenología y Dinámica de Paisaje

> **Pilar Agronómico:** Pilar 5 (Sanidad vegetal, dinámica de dosel y servicios ecosistémicos)  
> **Secciones de Cultivo:** Sección D (Cultivos de cobertura para frenar suelo desnudo) y amortiguamiento biológico contra plagas

### Descripción General
Métricas de absorción lumínica, estacionalidad del verdor vegetal (NDVI/IPSE), heterogeneidad espacial y proximidad a coberturas nativas y agrícolas.

---

## Tabla Resumen de Variables (AIZAL V4)

| Código | Banda | Nombre de la Capa | Período / Fuente | Res. Fuente | Unidad | Área Temática |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **B19** | `b19` | **Riqueza del paisaje** | 2023 | 30 m (MapBiomas); ventana de 1000 m | `Número de clases` | Biofísica · Paisaje |
| **B20** | `b20` | **Fragmentación del paisaje** | 2023 | 30 m (MapBiomas); ventana de 1000 m | `Fracción (0-1)` | Biofísica · Paisaje |
| **B21** | `b21` | **Dominancia del paisaje** | 2023 | 30 m (MapBiomas); ventana de 1000 m | `Adimensional (nats)` | Biofísica · Paisaje |
| **B22** | `b22` | **Diversidad del paisaje** | 2023 | 30 m (MapBiomas); ventana de 1000 m | `Adimensional (nats)` | Biofísica · Paisaje |
| **B23** | `b23` | **Índice de provisión de servicios ecosistémicos (IPSE)** | 2001-2024 | 250 m | `Adimensional (0-1)` | Biofísica · Paisaje |
| **B30** | `b30` | **Distancia a uso agropecuario** | 2023 | 30 m | `m` | Socioeconómica · Antrópica |
| **B31** | `b31` | **Distancia a uso forestal (vegetación leñosa natural)** | 2023 | 30 m | `m` | Socioeconómica · Antrópica |

---

## Detalle de Fichas Técnicas

### [B19] Riqueza del paisaje
* **Banda en el Stack AIZAL:** `b19`
* **Área Temática:** Biofísica · Paisaje
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Número de clases`
* **Período de Referencia:** 2023
* **Resolución de la Fuente:** 30 m (MapBiomas); ventana de 1000 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Número de clases de cobertura y uso del suelo distintas presentes en una celda de paisaje de 1 km. Indica la heterogeneidad composicional del paisaje (Turner, 1989; Forman, 1995).
* **Procesamiento Realizado:** Se calculó en Google Earth Engine (reemplaza al módulo PATTERN de TerrSet usado en V3) sobre el mapa de cobertura de MapBiomas Chaco Colección 5, año 2023, completado con MapBiomas Brasil Colección 10 donde no hay dato válido. Para cada celda de 1000 m (ventana de análisis) se calculó la proporción p de cada clase de cobertura (todas las clases de la leyenda, excepto 27 "no observado"), agregando los píxeles de 30 m en dos etapas (30 m → 300 m → 1000 m) en proyección UTM 20S. La riqueza es la cantidad de clases con proporción mayor que cero en la ventana.
* **Cambios respecto de V3:** Cálculo en GEE sobre MapBiomas Chaco Col. 5 (2023) en lugar de TerrSet PATTERN sobre la Col. 2 (2019). Se corrige la definición: cuenta clases de cobertura, no especies arbóreas. 24

### [B20] Fragmentación del paisaje
* **Banda en el Stack AIZAL:** `b20`
* **Área Temática:** Biofísica · Paisaje
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Fracción (0-1)`
* **Período de Referencia:** 2023
* **Resolución de la Fuente:** 30 m (MapBiomas); ventana de 1000 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Grado de subdivisión del paisaje en parches. Una fragmentación alta suele asociarse a la modificación intensa del territorio por acciones antrópicas, que se traduce en pérdida de hábitats naturales y en la disminución o extinción local de especies.
* **Procesamiento Realizado:** Se calculó en Google Earth Engine (reemplaza al módulo PATTERN de TerrSet usado en V3) sobre el mapa de cobertura de MapBiomas Chaco Colección 5, año 2023, completado con MapBiomas Brasil Colección 10 donde no hay dato válido. Para cada celda de 1000 m (ventana de análisis) se calculó la proporción p de cada clase de cobertura (todas las clases de la leyenda, excepto 27 "no observado"), agregando los píxeles de 30 m en dos etapas (30 m → 300 m → 1000 m) en proyección UTM 20S. Se identificaron los píxeles de borde (píxeles de 30 m cuyo vecindario de 3 × 3 contiene otra clase) y la fragmentación es la fracción de píxeles de borde en la ventana.
* **Cambios respecto de V3:** Nuevo indicador calculado en GEE (fracción de borde) sobre MapBiomas Chaco Col. 5 (2023); V3 usaba el índice de fragmentación de TerrSet PATTERN (Col. 2, 2019). 25

### [B21] Dominancia del paisaje
* **Banda en el Stack AIZAL:** `b21`
* **Área Temática:** Biofísica · Paisaje
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Adimensional (nats)`
* **Período de Referencia:** 2023
* **Resolución de la Fuente:** 30 m (MapBiomas); ventana de 1000 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Grado en que una o pocas clases de cobertura predominan en el paisaje. Es complementaria de la diversidad: vale 0 cuando todas las clases presentes tienen la misma proporción y crece cuando una clase ocupa la mayor parte de la celda (O'Neill et al., 1988).
* **Procesamiento Realizado:** Se calculó en Google Earth Engine (reemplaza al módulo PATTERN de TerrSet usado en V3) sobre el mapa de cobertura de MapBiomas Chaco Colección 5, año 2023, completado con MapBiomas Brasil Colección 10 donde no hay dato válido. Para cada celda de 1000 m (ventana de análisis) se calculó la proporción p de cada clase de cobertura (todas las clases de la leyenda, excepto 27 "no observado"), agregando los píxeles de 30 m en dos etapas (30 m → 300 m → 1000 m) en proyección UTM 20S. Dominancia D = ln(n) − H, donde n es la riqueza (B19) y H la diversidad de Shannon (B22).
* **Cambios respecto de V3:** Cálculo en GEE con la fórmula de O'Neill et al. (1988) sobre MapBiomas Chaco Col. 5 (2023); V3 usaba TerrSet PATTERN × 10.000 sobre la Col. 2 (2019). 26

### [B22] Diversidad del paisaje
* **Banda en el Stack AIZAL:** `b22`
* **Área Temática:** Biofísica · Paisaje
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Adimensional (nats)`
* **Período de Referencia:** 2023
* **Resolución de la Fuente:** 30 m (MapBiomas); ventana de 1000 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Medida de la variedad de clases de cobertura y de la uniformidad de su distribución dentro de una unidad de paisaje.
* **Procesamiento Realizado:** Se calculó en Google Earth Engine (reemplaza al módulo PATTERN de TerrSet usado en V3) sobre el mapa de cobertura de MapBiomas Chaco Colección 5, año 2023, completado con MapBiomas Brasil Colección 10 donde no hay dato válido. Para cada celda de 1000 m (ventana de análisis) se calculó la proporción p de cada clase de cobertura (todas las clases de la leyenda, excepto 27 "no observado"), agregando los píxeles de 30 m en dos etapas (30 m → 300 m → 1000 m) en proyección UTM 20S. Índice de diversidad de Shannon H = −Σ pᵢ · ln(pᵢ).
* **Cambios respecto de V3:** Cálculo en GEE (Shannon) sobre MapBiomas Chaco Col. 5 (2023); V3 usaba TerrSet PATTERN × 10.000 sobre la Col. 2 (2019). 27

### [B23] Índice de provisión de servicios ecosistémicos (IPSE)
* **Banda en el Stack AIZAL:** `b23`
* **Área Temática:** Biofísica · Paisaje
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Adimensional (0-1)`
* **Período de Referencia:** 2001-2024
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** El IPSE se basa en atributos de la dinámica estacional de la captura de carbono, cuantificados a través del índice de vegetación normalizado (NDVI): el promedio anual del NDVI, indicador de la energía lumínica absorbida por la vegetación, y el coeficiente de variación intraanual del NDVI, descriptor de la estacionalidad. Proporciona información sobre los cambios espaciales y temporales en la provisión de servicios ecosistémicos y es particularmente sensible a los cambios en el uso del suelo (Paruelo et al., 2016).
* **Procesamiento Realizado:** Para cada año se calculó IPSE = NDVI medio × (1 − CV intraanual del NDVI) a partir de MODIS MOD13Q1 versión 6.1 (composiciones de 16 días; sólo píxeles con calidad SummaryQA ≤ 1). El valor final es el promedio de los IPSE anuales 2001- 2024.
* **Cambios respecto de V3:** Serie extendida a 2001-2024 (V3: 2000-2017), MODIS v6.1 y filtro de calidad explícito. 28

### [B30] Distancia a uso agropecuario
* **Banda en el Stack AIZAL:** `b30`
* **Área Temática:** Socioeconómica · Antrópica
* **Estado en V4:** Actualizada en V4
* **Unidad:** `m`
* **Período de Referencia:** 2023
* **Resolución de la Fuente:** 30 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto al píxel más cercano con uso agropecuario (agricultura, cultivos y pasturas implantadas).
* **Procesamiento Realizado:** Sobre el mapa de cobertura de MapBiomas Chaco Col. 5 (2023), completado con MapBiomas Brasil Col. 10, se seleccionaron las clases de uso agropecuario: 14 área agropecuaria, 15 pastura, 18 agricultura, 19 cultivos anuales, 57 cultivo simple, 58 cultivo múltiple y 36 cultivo arbustivo. La máscara de 30 m se agregó a 500 m (una celda es agropecuaria si contiene algún píxel de esas clases) sobre el Gran Chaco ampliado en 100 km. La distancia se calculó con el algoritmo fastDistanceTransform de GEE, a 500 m de resolución en proyección UTM 20S (EPSG:32720), con una distancia máxima calculada de 256 km (512 píxeles); los valores mayores se fijan en 256 km.
* **Cambios respecto de V3:** MapBiomas Chaco Col. 5 (2023) en lugar de Col. 2 (2019). Se incluyen las pasturas implantadas además de los cultivos. Se corrige la unidad consignada en V3 (metros, no metros cuadrados). 35

### [B31] Distancia a uso forestal (vegetación leñosa natural)
* **Banda en el Stack AIZAL:** `b31`
* **Área Temática:** Socioeconómica · Antrópica
* **Estado en V4:** Actualizada en V4
* **Unidad:** `m`
* **Período de Referencia:** 2023
* **Resolución de la Fuente:** 30 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto al píxel más cercano con vegetación natural leñosa (bosque).
* **Procesamiento Realizado:** Sobre el mapa de cobertura de MapBiomas Chaco Col. 5 (2023), completado con MapBiomas Brasil Col. 10, se seleccionaron las clases de vegetación natural leñosa: 3 leñosa cerrada, 4 leñosa abierta y 6 leñosa inundable (no se incluyen la leñosa dispersa, 45, ni las plantaciones forestales, 9). La máscara de 30 m se agregó a 500 m sobre el Gran Chaco ampliado en 100 km. La distancia se calculó con el algoritmo fastDistanceTransform de GEE, a 500 m de resolución en proyección UTM 20S (EPSG:32720), con una distancia máxima calculada de 256 km (512 píxeles); los valores mayores se fijan en 256 km.
* **Cambios respecto de V3:** MapBiomas Chaco Col. 5 (2023) en lugar de Col. 2 (2019), con las clases de bosque explícitas. Se corrige el procesamiento descripto en V3 (que mencionaba la subclase "Cultivos agrícolas") y la unidad (metros). 36

