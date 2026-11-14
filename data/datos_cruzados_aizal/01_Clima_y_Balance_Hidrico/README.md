# Módulo: Clima y Balance Hídrico

> **Pilar Agronómico:** Pilar 1 (Balance Hídrico) y Pilar 2 (Régimen Térmico y Luz)  
> **Secciones de Cultivo:** Sección A (Gramíneas extractivas: Maíz/Sorgo), Sección C (Oleaginosas: Girasol) y Sección D (Coberturas invernales: Centeno)

### Descripción General
Variables meteorológicas, oferta de lluvia, demanda evaporativa y severidad de sequía para determinar el balance hídrico del lote y las ventanas térmicas seguras.

---

## Tabla Resumen de Variables (AIZAL V4)

| Código | Banda | Nombre de la Capa | Período / Fuente | Res. Fuente | Unidad | Área Temática |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **B01** | `b01` | **Distancia a cursos de agua** | HydroSHEDS Free Flowing Rivers (2019) | Red derivada de HydroSHEDS (15 arc-seg) | `m` | Biofísica · Agua |
| **B02** | `b02` | **Distancia a cuerpos de agua permanente** | 1984-2021 (JRC Global Surface Water v1.4) | 30 m | `m` | Biofísica · Agua |
| **B03** | `b03` | **Evapotranspiración promedio anual** | 1991-2020 (normal climatológica OMM) | ≈ 4,6 km (1/24°) | `mm/año` | Biofísica · Clima |
| **B04** | `b04` | **Precipitación promedio anual** | 1991-2020 | ≈ 4,6 km (1/24°) | `mm/año` | Biofísica · Clima |
| **B05** | `b05` | **Índice de severidad de la sequía de Palmer (PDSI)** | 1991-2020 | ≈ 4,6 km (1/24°) | `Adimensional` | Biofísica · Clima |
| **B06** | `b06` | **Temperatura mínima promedio** | 1991-2020 | ≈ 4,6 km (1/24°) | `°C` | Biofísica · Clima |
| **B07** | `b07` | **Temperatura máxima promedio** | 1991-2020 | ≈ 4,6 km (1/24°) | `°C` | Biofísica · Clima |
| **B08** | `b08` | **Albedo** | 2020-2024 | 500 m | `Adimensional (0-1)` | Biofísica · Clima |

---

## Detalle de Fichas Técnicas

### [B01] Distancia a cursos de agua
* **Banda en el Stack AIZAL:** `b01`
* **Área Temática:** Biofísica · Agua
* **Estado en V4:** Actualizada en V4
* **Unidad:** `m`
* **Período de Referencia:** HydroSHEDS Free Flowing Rivers (2019)
* **Resolución de la Fuente:** Red derivada de HydroSHEDS (15 arc-seg)
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto al curso de agua más cercano.
* **Procesamiento Realizado:** Se seleccionaron los ríos de la base HydroSHEDS Free Flowing Rivers (WWF) con orden de río RIV_ORD ≤ 7 (1 = ríos más caudalosos; valores mayores incluyen ríos menores) en un entorno de 50 km alrededor del Gran Chaco, se rasterizaron y se calculó la distancia. La distancia se calculó con el algoritmo fastDistanceTransform de GEE, a 500 m de resolución en proyección UTM 20S (EPSG:32720), con una distancia máxima calculada de 256 km (512 píxeles); los valores mayores se fijan en 256 km.
* **Cambios respecto de V3:** Nueva fuente vectorial (HydroSHEDS Free Flowing Rivers, con filtro por orden de río) y cálculo homogéneo de distancias a 500 m en UTM 20S. 5

### [B02] Distancia a cuerpos de agua permanente
* **Banda en el Stack AIZAL:** `b02`
* **Área Temática:** Biofísica · Agua
* **Estado en V4:** Actualizada en V4
* **Unidad:** `m`
* **Período de Referencia:** 1984-2021 (JRC Global Surface Water v1.4)
* **Resolución de la Fuente:** 30 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Distancia lineal, en metros, desde cualquier punto al cuerpo de agua permanente más cercano.
* **Procesamiento Realizado:** Se consideró agua permanente a los píxeles con ocurrencia de agua ≥ 75 % del tiempo en la serie 1984-2021 (banda occurrence de JRC Global Surface Water v1.4). La máscara de 30 m se agregó a 500 m (una celda es agua si contiene algún píxel de agua) sobre el Gran Chaco ampliado en 100 km, para considerar los cuerpos de agua cercanos al límite. La distancia se calculó con el algoritmo fastDistanceTransform de GEE, a 500 m de resolución en proyección UTM 20S (EPSG:32720), con una distancia máxima calculada de 256 km (512 píxeles); los valores mayores se fijan en 256 km.
* **Cambios respecto de V3:** Reemplaza HydroSHEDS por JRC Global Surface Water (30 m, 1984-2021), con un umbral explícito de permanencia (75 %). 6

### [B03] Evapotranspiración promedio anual
* **Banda en el Stack AIZAL:** `b03`
* **Área Temática:** Biofísica · Clima
* **Estado en V4:** Actualizada en V4
* **Unidad:** `mm/año`
* **Período de Referencia:** 1991-2020 (normal climatológica OMM)
* **Resolución de la Fuente:** ≈ 4,6 km (1/24°)
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Es la transmisión de agua de la tierra a la atmósfera por procesos de evaporación de la superficie del suelo y transpiración de las plantas (Wang y Dickinson, 2012). Es un parámetro clave en el balance de energía del sistema Tierra-Atmósfera, importante para el uso y manejo del agua, la detección de estrés hídrico vegetal, la predicción del rendimiento de los cultivos, el cálculo del balance hídrico y la caracterización climática de regiones (Segura-Castruita y Ortiz-Solorio, 2017). Se utiliza la evapotranspiración real (actual) de TerraClimate.
* **Procesamiento Realizado:** Se sumó la evapotranspiración real mensual (banda aet, factor de escala 0,1) de cada año de la serie 1991-2020 y luego se obtuvo el promedio de los totales anuales.
* **Cambios respecto de V3:** Período actualizado a la normal climatológica 1991-2020 (V3: 1958-2018). 7

### [B04] Precipitación promedio anual
* **Banda en el Stack AIZAL:** `b04`
* **Área Temática:** Biofísica · Clima
* **Estado en V4:** Actualizada en V4
* **Unidad:** `mm/año`
* **Período de Referencia:** 1991-2020
* **Resolución de la Fuente:** ≈ 4,6 km (1/24°)
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Agua en estado líquido o sólido que cae sobre la superficie terrestre. La cantidad, frecuencia y distribución espacial y temporal de las precipitaciones es muy variable, por lo que es una de las variables centrales en la caracterización climática regional.
* **Procesamiento Realizado:** Se sumó la precipitación mensual (banda pr) de cada año de la serie 1991-2020 y luego se obtuvo el promedio de los totales anuales.
* **Cambios respecto de V3:** Período actualizado a 1991-2020 (V3: 1958-2018). 8

### [B05] Índice de severidad de la sequía de Palmer (PDSI)
* **Banda en el Stack AIZAL:** `b05`
* **Área Temática:** Biofísica · Clima
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Adimensional`
* **Período de Referencia:** 1991-2020
* **Resolución de la Fuente:** ≈ 4,6 km (1/24°)
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** El Índice de Severidad de Sequía de Palmer (PDSI, por sus siglas en inglés) mide la deficiencia de humedad. Se basa en el concepto de demanda-suministro de agua, teniendo en cuenta el déficit entre la precipitación real y la necesaria para mantener las condiciones de humedad climática normales. Requiere como datos de entrada la evapotranspiración potencial, la precipitación mensual y el contenido de agua útil del suelo. Valores negativos indican sequía.
* **Procesamiento Realizado:** Se obtuvo el PDSI mínimo de cada año de la serie (banda pdsi, factor de escala 0,01) y luego el promedio de los mínimos anuales.
* **Cambios respecto de V3:** Período actualizado a 1991-2020 (V3: 1958-2015). 9

### [B06] Temperatura mínima promedio
* **Banda en el Stack AIZAL:** `b06`
* **Área Temática:** Biofísica · Clima
* **Estado en V4:** Actualizada en V4
* **Unidad:** `°C`
* **Período de Referencia:** 1991-2020
* **Resolución de la Fuente:** ≈ 4,6 km (1/24°)
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Menor temperatura de una zona a lo largo de un período. La temperatura del aire varía en función de la latitud, la elevación y las circulaciones atmosféricas a gran escala, y es sensible a los patrones climáticos predominantes y a las condiciones de la superficie local. Es uno de los principales elementos para delimitar los tipos de clima (FECYT, 2004).
* **Procesamiento Realizado:** Promedio de la temperatura mínima mensual (banda tmmn, factor de escala 0,1) de todos los meses de la serie 1991-2020.
* **Cambios respecto de V3:** Período actualizado a 1991-2020 (V3: 1958-2018). 10

### [B07] Temperatura máxima promedio
* **Banda en el Stack AIZAL:** `b07`
* **Área Temática:** Biofísica · Clima
* **Estado en V4:** Actualizada en V4
* **Unidad:** `°C`
* **Período de Referencia:** 1991-2020
* **Resolución de la Fuente:** ≈ 4,6 km (1/24°)
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Mayor temperatura de una zona a lo largo de un período. La temperatura del aire varía en función de la latitud, la elevación y las circulaciones atmosféricas a gran escala, y es sensible a los patrones climáticos predominantes y a las condiciones de la superficie local (FECYT, 2004).
* **Procesamiento Realizado:** Promedio de la temperatura máxima mensual (banda tmmx, factor de escala 0,1) de todos los meses de la serie 1991-2020.
* **Cambios respecto de V3:** Período actualizado a 1991-2020 (V3: 1958-2018). 11

### [B08] Albedo
* **Banda en el Stack AIZAL:** `b08`
* **Área Temática:** Biofísica · Clima
* **Estado en V4:** Actualizada en V4
* **Unidad:** `Adimensional (0-1)`
* **Período de Referencia:** 2020-2024
* **Resolución de la Fuente:** 500 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Proporción de la radiación incidente que la superficie terrestre refleja hacia el espacio. Es uno de los componentes más importantes de los efectos biofísicos (alteraciones climáticas causadas por cambios en las propiedades físicas de la superficie) en el sistema climático. Es el cociente entre los flujos radiativos ascendente y descendente; por lo tanto, es una magnitud adimensional.
* **Procesamiento Realizado:** Promedio del albedo de cielo blanco en onda corta (banda Albedo_WSA_shortwave, factor de escala 0,001) del producto diario MODIS MCD43A3 versión 6.1 para el período 2020-2024.
* **Cambios respecto de V3:** Producto MODIS versión 6.1 (V3: v006, año 2017) y promedio de cinco años (2020- 2024) en lugar de un solo año. 12

