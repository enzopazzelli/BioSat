# Módulo: Física del Suelo, Relieve y Topografía

> **Pilar Agronómico:** Pilar 3 (Física y Anclaje del Suelo)  
> **Secciones de Cultivo:** Sección C (Raíces pivotantes descompactadoras: Girasol, Nabo) y Sección D (Control de escorrentía en pendientes)

### Descripción General
Textura edáfica (Arcilla, Limo, Arena), densidad aparente (compactación base), pedregosidad y modelo de elevación para estimar erosión y retención de agua.

---

## Tabla Resumen de Variables (AIZAL V4)

| Código | Banda | Nombre de la Capa | Período / Fuente | Res. Fuente | Unidad | Área Temática |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **B10** | `b10` | **Fragmentos gruesos** | SoilGrids 2.0 (2020) | 250 m | `cm³/dm³` | Biofísica · Edáfico |
| **B12** | `b12` | **Contenido de arcilla** | SoilGrids 2.0 (2020) | 250 m | `g/kg` | Biofísica · Edáfico |
| **B17a** | `b17a` | **Arena** | SoilGrids 2.0 (2020) | 250 m | `g/kg` | Biofísica · Edáfico |
| **B17b** | `b17b` | **Limo** | SoilGrids 2.0 (2020) | 250 m | `g/kg` | Biofísica · Edáfico |
| **B18** | `b18` | **Densidad aparente** | SoilGrids 2.0 (2020) | 250 m | `cg/cm³` | Biofísica · Edáfico |
| **B24** | `b24` | **Elevación** | Copernicus DEM GLO-30, versión 2024_1 (datos TanDEM-X 2011-2015) | 30 m | `m s. n. m.` | Biofísica · Topográfico |
| **B25** | `b25` | **Diversidad topográfica** | 2011 | 270 m | `Índice (0-1)` | Biofísica · Topográfico |

---

## Detalle de Fichas Técnicas

### [B10] Fragmentos gruesos
* **Banda en el Stack AIZAL:** `b10`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `cm³/dm³`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Proporción volumétrica de fragmentos minerales mayores de 2 mm en el suelo. Se relaciona con la granulometría del suelo, la capacidad de retención de agua y la profundidad efectiva para las raíces.
* **Procesamiento Realizado:** Se calculó la media de la variable Fragmentos gruesos de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: cm³/dm³. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 14

### [B12] Contenido de arcilla
* **Banda en el Stack AIZAL:** `b12`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `g/kg`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** La arcilla tiene fuertes propiedades de retención de agua y nutrientes y de intercambio de cationes. Un suelo arcilloso presenta un alto nivel de fertilidad química e influye en el rendimiento de los cultivos.
* **Procesamiento Realizado:** Se calculó la media de la variable Contenido de arcilla de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: g/kg. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 16

### [B17a] Arena
* **Banda en el Stack AIZAL:** `b17a`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `g/kg`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Fracción mineral cuyo tamaño tiene como límite superior 2 mm e inferior 0,05 mm.
* **Procesamiento Realizado:** Se calculó la media de la variable Arena de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: g/kg. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 21

### [B17b] Limo
* **Banda en el Stack AIZAL:** `b17b`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `g/kg`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Fracción mineral cuyo tamaño tiene como límite superior 0,05 mm e inferior 0,002 mm. En esta fracción se encuentran minerales heredados o transformados y la meteorización es más intensa. No tiene propiedades coloidales y le imprime inestabilidad a la estructura del suelo.
* **Procesamiento Realizado:** Se calculó la media de la variable Limo de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: g/kg. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 22

### [B18] Densidad aparente
* **Banda en el Stack AIZAL:** `b18`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `cg/cm³`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Masa de suelo seco en estufa dividida por el volumen total, que incluye el volumen de los sólidos y el de los poros (ISO 11272).
* **Procesamiento Realizado:** Se calculó la media de la variable Densidad aparente de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: cg/cm³. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 23

### [B24] Elevación
* **Banda en el Stack AIZAL:** `b24`
* **Área Temática:** Biofísica · Topográfico
* **Estado en V4:** Actualizada en V4
* **Unidad:** `m s. n. m.`
* **Período de Referencia:** Copernicus DEM GLO-30, versión 2024_1 (datos TanDEM-X 2011-2015)
* **Resolución de la Fuente:** 30 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Altitud: distancia vertical entre un punto de la superficie terrestre y el nivel medio del mar, expresada en metros sobre el nivel del mar (m s. n. m.).
* **Procesamiento Realizado:** Mosaico del modelo digital de superficie Copernicus DEM GLO-30 (banda DEM) sobre el Gran Chaco.
* **Cambios respecto de V3:** Reemplaza SRTM v4 (90 m) por Copernicus DEM GLO-30 (30 m, versión 2024_1). 29

### [B25] Diversidad topográfica
* **Banda en el Stack AIZAL:** `b25`
* **Área Temática:** Biofísica · Topográfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `Índice (0-1)`
* **Período de Referencia:** 2011
* **Resolución de la Fuente:** 270 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Variable sustituta que representa la variedad de condiciones de temperatura y humedad disponibles para las especies como hábitats locales. Expresa la lógica de que una mayor variedad de nichos climáticos topográficos debería soportar una mayor diversidad (especialmente de plantas) y la persistencia de las especies ante el cambio climático.
* **Procesamiento Realizado:** Producto Global ALOS Topographic Diversity del catálogo de GEE, sin procesamiento. Se conserva la banda de V3.
* **Cambios respecto de V3:** Sin cambios respecto de V3 (no existe una versión nueva del producto). 30

