# Módulo: Química, Nutrición y Fertilidad Edáfica

> **Pilar Agronómico:** Pilar 4 (Química y Nutrición del Suelo)  
> **Secciones de Cultivo:** Sección B (Leguminosas fijadoras: Soja/Garbanzo - viabilidad de fijación biológica según pH) y Sección A (Aporte de N tras cosecha)

### Descripción General
Línea base química del suelo: reserva de Nitrógeno total, Capacidad de Intercambio Catiónico (CIC), Carbono Orgánico (SOM) y pH en agua.

---

## Tabla Resumen de Variables (AIZAL V4)

| Código | Banda | Nombre de la Capa | Período / Fuente | Res. Fuente | Unidad | Área Temática |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **B09** | `b09` | **Capacidad de intercambio de cationes** | SoilGrids 2.0 (2020) | 250 m | `mmol(c)/kg` | Biofísica · Edáfico |
| **B11** | `b11` | **Nitrógeno** | SoilGrids 2.0 (2020) | 250 m | `cg/kg` | Biofísica · Edáfico |
| **B13** | `b13` | **Densidad de carbono orgánico** | SoilGrids 2.0 (2020) | 250 m | `g/dm³` | Biofísica · Edáfico |
| **B14** | `b14` | **Stock de carbono orgánico** | SoilGrids 2.0 (2020) | 250 m | `t/ha` | Biofísica · Edáfico |
| **B15** | `b15` | **Contenido de carbono orgánico** | SoilGrids 2.0 (2020) | 250 m | `dg/kg` | Biofísica · Edáfico |
| **B16** | `b16` | **Índice de pH en solución de agua** | SoilGrids 2.0 (2020) | 250 m | `pH × 10` | Biofísica · Edáfico |

---

## Detalle de Fichas Técnicas

### [B09] Capacidad de intercambio de cationes
* **Banda en el Stack AIZAL:** `b09`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `mmol(c)/kg`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Indica cuántos sitios de intercambio de cationes posee el suelo; en ellos pueden retenerse nutrientes esenciales para el crecimiento de las plantas, especialmente calcio, magnesio y potasio. Depende principalmente del contenido de arcilla y de materia orgánica: suelos ricos en ambos poseen mayor CIC.
* **Procesamiento Realizado:** Se calculó la media de la variable Capacidad de intercambio de cationes de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: mmol(c)/kg. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 13

### [B11] Nitrógeno
* **Banda en el Stack AIZAL:** `b11`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `cg/kg`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** El nitrógeno se considera a menudo sinónimo de fertilidad del suelo. Controla el crecimiento de las hojas.
* **Procesamiento Realizado:** Se calculó la media de la variable Nitrógeno de las profundidades S1: 0-5 cm; S2: 5- 15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: cg/kg. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 15

### [B13] Densidad de carbono orgánico
* **Banda en el Stack AIZAL:** `b13`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `g/dm³`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Cantidad de carbono orgánico por unidad de volumen de suelo.
* **Procesamiento Realizado:** Se calculó la media de la variable Densidad de carbono orgánico de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: g/dm³. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 17

### [B14] Stock de carbono orgánico
* **Banda en el Stack AIZAL:** `b14`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `t/ha`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Cantidad de carbono orgánico del suelo por unidad de superficie.
* **Procesamiento Realizado:** Se calculó la media de la variable Stock de carbono orgánico de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: t/ha. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 18

### [B15] Contenido de carbono orgánico
* **Banda en el Stack AIZAL:** `b15`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `dg/kg`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** Cantidad de carbono orgánico por unidad de masa de suelo. Es probablemente el indicador más importante de la salud del suelo: suelos ricos en carbono orgánico poseen condiciones favorables para su productividad.
* **Procesamiento Realizado:** Se calculó la media de la variable Contenido de carbono orgánico de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: dg/kg. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 19

### [B16] Índice de pH en solución de agua
* **Banda en el Stack AIZAL:** `b16`
* **Área Temática:** Biofísica · Edáfico
* **Estado en V4:** Sin cambios (de V3)
* **Unidad:** `pH × 10`
* **Período de Referencia:** SoilGrids 2.0 (2020)
* **Resolución de la Fuente:** 250 m
* **Resolución en AIZAL:** 500 m, coordenadas geográficas WGS84 (EPSG:4326)
* **Descripción Técnica:** El pH indica el estado ácido-base del suelo, que influye en la disponibilidad de nutrientes, la movilidad de iones beneficiosos y perjudiciales y la ecología de los microorganismos del suelo.
* **Procesamiento Realizado:** Se calculó la media de la variable Índice de pH en solución de agua de las profundidades S1: 0-5 cm; S2: 5-15 cm; S3: 15-30 cm. La imagen resultante representa el valor medio de la variable en la profundidad de 0-30 cm. Unidad de medida: pH × 10. En V4 la banda se conserva sin cambios respecto de V3 (SoilGrids no publicó una versión nueva).
* **Cambios respecto de V3:** Sin cambios respecto de V3. Se actualizó la cita bibliográfica de SoilGrids 2.0, ya publicada (Poggio et al., 2021). 20

