# Módulo: Logística, Antrópico y Acceso a Servicios

> **Pilar Agronómico:** Pilar 6 (Viabilidad Operativa y Logística Comercial)  
> **Secciones de Cultivo:** Comercialización de cosechas alternativas (Sorgo, Garbanzo, Canola) y costo de fletes hacia acopios cercanos (<50 km)

### Descripción General
Distancia a la red vial, conectividad con poblados, huella antrópica y áreas protegidas para evaluar la viabilidad comercial y el acceso a maquinaria.

---

## Tabla Resumen de Variables (AIZAL V4)

| Código | Banda | Nombre de la Capa | Período / Fuente | Res. Fuente | Unidad | Área Temática |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **B26** | `b26` | **Distancia a instituciones** | 2016 | 500 m | `m` | Político-institucional · Infraestructura |
| **B27** | `b27` | **Distancia a áreas protegidas** | Versión vigente de la WDPA al momento del procesamiento (2026) | Polígonos | `m` | Político-institucional · Normativo |
| **B28** | `b28` | **Población** | 2025 | 100 m | `Personas por celda de 100 m (≈ personas/ha)` | Socioeconómica · Antrópica |
| **B29** | `b29` | **Impacto humano** | 2020 | 300 m | `Índice (0-1)` | Socioeconómica · Antrópica |
| **B32** | `b32` | **Distancia a centros educativos** | 2019 | 500 m | `m` | Socioeconómica · Servicio |
| **B33** | `b33` | **Distancia a centros de salud** | [completar: año de la extracción de OpenStreetMap usada en V3] | 500 m | `m` | Socioeconómica · Servicio |
| **B34** | `b34` | **Accesibilidad** | 2015 | ≈ 1 km | `Minutos` | Socioeconómica · Servicio |
| **B35** | `b35` | **Distancia a comunidades originarias** | 2017 | 500 m | `m` | Socioeconómica · Servicio |
| **B36** | `b36` | **Distancia a caminos** | 2017 | 500 m | `m` | Socioeconómica · Servicio |
| **B37** | `b37` | **Crecimiento poblacional** | 2015-2025 | 100 m | `Personas por celda de 100 m` | Socioeconómica · Social |

---

## Detalle de Fichas Técnicas

### [B26] Distancia a instituciones
* **Banda en el Stack AIZAL:** `b26`
* **Área Temática:** Político-institucional · Infraestructura
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `m`
* **Período de Referencia:** 2016
* **Resolución de la Fuente:** 500 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto a la institución pública relacionada con el agro más cercana.
* **Procesamiento Realizado:** Se integraron capas de puntos de Argentina, Paraguay y Bolivia: para Argentina, la base de datos del Ministerio de Agroindustria; para Bolivia y Paraguay, relevamiento manual con expertos locales. Las distancias se calcularon con fastDistanceTransform en GEE y se exportaron a 500 m. Se conserva la banda de V3; el script V4 la recalcula automáticamente cuando se carga un asset de puntos actualizado.
* **Cambios respecto de V3:** Sin cambios: pendiente de recopilar las capas nacionales actualizadas. Se corrigió la resolución consignada en V3 (500 m). 31

### [B27] Distancia a áreas protegidas
* **Banda en el Stack AIZAL:** `b27`
* **Área Temática:** Político-institucional · Normativo
* **Estado en V4:** Actualizada en V4
* **Unidad:** `m`
* **Período de Referencia:** Versión vigente de la WDPA al momento del procesamiento (2026)
* **Resolución de la Fuente:** Polígonos
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto al área protegida más cercana (nacional, provincial/departamental o de otra categoría registrada).
* **Procesamiento Realizado:** Se tomaron los polígonos de la Base de Datos Mundial de Áreas Protegidas (WDPA, colección WCMC/WDPA/current/polygons) en un entorno de 300 km alrededor del Gran Chaco, excluyendo las áreas con estado "Propuesta" y las marinas. La distancia se calculó con el algoritmo fastDistanceTransform de GEE, a 500 m de resolución en proyección UTM 20S (EPSG:32720), con una distancia máxima calculada de 256 km (512 píxeles); los valores mayores se fijan en 256 km.
* **Cambios respecto de V3:** Reemplaza las capas nacionales de 2010 por la WDPA vigente (fuente única para los países del Gran Chaco, incluido Brasil). 32

### [B28] Población
* **Banda en el Stack AIZAL:** `b28`
* **Área Temática:** Socioeconómica · Antrópica
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Personas por celda de 100 m (≈ personas/ha)`
* **Período de Referencia:** 2025
* **Resolución de la Fuente:** 100 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distribución de la población humana: número estimado de personas que residen en cada celda de la grilla de 100 m en el año 2025 (proyecto WorldPop).
* **Procesamiento Realizado:** Mosaico de la población estimada para 2025 del conjunto WorldPop Global, versión R2025A (colección WorldPop/GP/100m/R2025A/v1/pop).
* **Cambios respecto de V3:** Año 2025 de WorldPop R2025A (V3: estimación 2015). 33

### [B29] Impacto humano
* **Banda en el Stack AIZAL:** `b29`
* **Área Temática:** Socioeconómica · Antrópica
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Índice (0-1)`
* **Período de Referencia:** 2020
* **Resolución de la Fuente:** 300 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Grado de modificación humana del territorio: cambios en los ecosistemas, la biodiversidad y los recursos naturales causados directa o indirectamente por los seres humanos (asentamientos, agricultura, infraestructura de transporte y energía, extracción, entre otros).
* **Procesamiento Realizado:** Banda All_threats_combined del índice Global Human Modification versión 3 de The Nature Conservancy (colección TNC/HM/v3/300m_c), año 2020.
* **Cambios respecto de V3:** Índice GHM versión 3, año 2020, a 300 m (V3: versión 2016, 1 km). 34

### [B32] Distancia a centros educativos
* **Banda en el Stack AIZAL:** `b32`
* **Área Temática:** Socioeconómica · Servicio
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `m`
* **Período de Referencia:** 2019
* **Resolución de la Fuente:** 500 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto al centro educativo más cercano.
* **Procesamiento Realizado:** Se tomaron los puntos de centros educativos de Argentina, Paraguay y Bolivia y se calcularon las distancias con fastDistanceTransform en GEE; se exportó a 500 m. Se conserva la banda de V3; el script V4 la recalcula automáticamente cuando se carga un asset de puntos actualizado.
* **Cambios respecto de V3:** Sin cambios: pendiente de recopilar las capas nacionales actualizadas. 37

### [B33] Distancia a centros de salud
* **Banda en el Stack AIZAL:** `b33`
* **Área Temática:** Socioeconómica · Servicio
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `m`
* **Período de Referencia:** [completar: año de la extracción de OpenStreetMap usada en V3]
* **Resolución de la Fuente:** 500 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto al centro de salud más cercano.
* **Procesamiento Realizado:** Se tomaron los puntos de centros de salud de OpenStreetMap (OSM) y se calcularon las distancias con fastDistanceTransform en GEE; se exportó a 500 m. Por decisión del equipo (2/11/2026) se conserva la distancia lineal de V3. Alternativa evaluada y no adoptada: tiempo de viaje motorizado a centros de salud (Malaria Atlas Project, 2019, en minutos), que cambiaría el significado de la variable.
* **Cambios respecto de V3:** Sin cambios. Para actualizarla con el mismo método, cargar en el script V4 los puntos nuevos (registros nacionales + OpenStreetMap). 38

### [B34] Accesibilidad
* **Banda en el Stack AIZAL:** `b34`
* **Área Temática:** Socioeconómica · Servicio
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `Minutos`
* **Período de Referencia:** 2015
* **Resolución de la Fuente:** ≈ 1 km
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Tiempo de viaje terrestre hasta el área densamente poblada más cercana. Las áreas densamente pobladas se definen como áreas contiguas con 1500 o más habitantes por km², o con mayoría de cobertura edificada coincidente con un centro de población de al menos 50.000 habitantes.
* **Procesamiento Realizado:** Se utilizó el mapa Accessibility to Cities 2015 del Malaria Atlas Project (Weiss et al., 2018), obtenido mediante un modelo de superficie de fricción con la red vial, el uso del suelo y las ciudades del Global Human Settlement Layer, y se exportó a 500 m. Se conserva la banda de V3.
* **Cambios respecto de V3:** Sin cambios (no existe una versión global nueva del producto). Se ajustó la redacción del procesamiento para reflejar el método del producto original (verificar con el procesamiento de V3). 39

### [B35] Distancia a comunidades originarias
* **Banda en el Stack AIZAL:** `b35`
* **Área Temática:** Socioeconómica · Servicio
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `m`
* **Período de Referencia:** 2017
* **Resolución de la Fuente:** 500 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto a la comunidad originaria más cercana.
* **Procesamiento Realizado:** Se tomaron las comunidades de Argentina, Paraguay y Bolivia y se calcularon las distancias con fastDistanceTransform en GEE; se exportó a 500 m. Se conserva la banda de V3; el script V4 la recalcula automáticamente cuando se carga un asset actualizado (puntos o polígonos).
* **Cambios respecto de V3:** Sin cambios: pendiente de recopilar las capas nacionales actualizadas. 40

### [B36] Distancia a caminos
* **Banda en el Stack AIZAL:** `b36`
* **Área Temática:** Socioeconómica · Servicio
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `m`
* **Período de Referencia:** 2017
* **Resolución de la Fuente:** 500 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto al camino más cercano. La accesibilidad es fundamental para la actividad agropecuaria si se tiene en cuenta la distancia a los mercados (Lambin et al., 2003; Müller et al., 2012; Volante et al., 2016).
* **Procesamiento Realizado:** Se tomaron las líneas de caminos de OpenStreetMap (OSM) y se calcularon las distancias con fastDistanceTransform en GEE; se exportó a 500 m. Se conserva la banda de V3; el script V4 la recalcula automáticamente cuando se carga un extracto actualizado de OSM.
* **Cambios respecto de V3:** Sin cambios: pendiente de un extracto actualizado de OpenStreetMap. Se corrige la unidad consignada en V3 (metros). 41

### [B37] Crecimiento poblacional
* **Banda en el Stack AIZAL:** `b37`
* **Área Temática:** Socioeconómica · Social
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Personas por celda de 100 m`
* **Período de Referencia:** 2015-2025
* **Resolución de la Fuente:** 100 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Cambio en el número estimado de personas que residen en cada celda de 100 m entre 2015 y 2025 (proyecto WorldPop). Valores positivos indican crecimiento; negativos, despoblamiento.
* **Procesamiento Realizado:** Diferencia entre la población WorldPop R2025A del año 2025 y la del año 2015 (misma versión, para que ambos años sean comparables).
* **Cambios respecto de V3:** Período 2015-2025 con una única versión de WorldPop (V3: diferencia 2020-2015, con años de versiones distintas). 42

