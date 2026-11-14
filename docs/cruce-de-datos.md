# Cruce de datos: NASA POWER × AIZAL V4 × Landsat

> **Para qué sirve:** resume qué sale de juntar las tres fuentes, para qué decisión del productor sirve cada cruce y en qué archivo queda. Es corto a propósito. Los formatos están en [`contratos-de-datos.md`](contratos-de-datos.md) y las tareas en el [PLAN](../PLAN.md).

---

## 1. Las tres fuentes

| Fuente | Qué mide | Tamaño del píxel | Período | Limitación honesta |
|---|---|---|---|---|
| **NASA POWER** | Clima diario: temperatura, lluvia, humedad en raíces | ~50 km | 1981-2025 | Es un modelo de reanálisis, no una medición en el lote |
| **AIZAL V4** | 38 variables de suelo, clima, paisaje y servicios del Gran Chaco | 500 m | Normal 1991-2020, SoilGrids 2020, MapBiomas 2023 | El suelo viene de SoilGrids (modelo); **no trae salinidad** |
| **Landsat 5/7/8/9** | Color y verdor de la superficie, cada 8-16 días | 30 m | 1984-2025 | Las nubes tapan fechas; ve la superficie, no el subsuelo |

---

## 2. Lo que sale del cruce

| # | Cruce | Qué sale | Para qué decisión | Dónde queda |
|---|---|---|---|---|
| 1 | Landsat (meses pelados) × POWER (calor y tormentas) | **Exposición del suelo**: cuántos días de más de 35 °C y cuántas tormentas de más de 30 mm caen sobre suelo pelado | Qué rotación tapa el suelo en los meses que más castigan | Calendario y tarjetas de la app |
| 2 | AIZAL (textura B12, B17) × POWER (lluvia − ET0) | **El tanque del suelo**: cuánta agua puede guardar y en qué mes se vacía | Si conviene sembrar una cobertura en otoño y cuándo secarla | Motor de reglas |
| 3 | AIZAL (pH B16, nitrógeno B11) × secciones de cultivo | **¿Funciona una leguminosa acá?**: con pH menor a 5,8 fija poco nitrógeno; con nitrógeno bajo conviene sumar una | Elegir entre las secciones B y D | Motor de reglas |
| 4 | AIZAL (densidad aparente B18) × secciones de cultivo | **Suelo compactado**: sugiere una raíz pivotante (sección C) | Sumar girasol o nabo a la rotación | Motor de reglas |
| 5 | Landsat (desmonte, con etiquetas de MapBiomas o Hansen) × POWER (calor) | **Índice de fragilidad**, con una fórmula visible | Priorizar el sistema silvopastoril o la cobertura inmediata | `diagnostico_landsat_ia.json` |
| 6 | Landsat (NDVI mes a mes) × POWER (días de más de 40 °C) | **¿Florece con calor?**: el mes de máximo verdor contra los picos de calor | Correr la fecha de siembra (por ejemplo, maíz tardío) | Tarjetas, riesgo |
| 7 | POWER × AIZAL (TerraClimate B03-B07) | **Control cruzado**: dos fuentes independientes del mismo clima | Si coinciden, confianza alta; si no, se avisa | Etiquetas de confianza |
| 8 | AlphaEarth (AIZAL módulo 06) × todo lo anterior | **Zonas parecidas** (agrupamiento k-means) | Validar las zonas y llevar una rotación que funciona a lugares similares | Visor de Earth Engine |
| 9 | AIZAL (distancia a caminos B36) × rotaciones | **Filtro de mercado**: aviso si el lote está lejos para vender un cultivo nuevo | Descartar o advertir alternativas | Tarjetas, avisos |
| 10 | Kit Arduino × Landsat × POWER | **Escalera de escalas**: 1 m² contra 30 m contra 50 km | Mostrar qué ve cada uno y qué se pierde | Panel "Espacio contra tierra" |

**La escalera de escalas (para el pitch):** NASA POWER 50 km → TerraClimate 4,6 km → AIZAL 500 m → Landsat 30 m → sensor 1 m² → el productor.

---

## 3. Lo que el cruce no resuelve

- **Salinidad actual:** ninguna de las tres fuentes la mide. SoilGrids no tiene conductividad eléctrica. Sale del sensor, de un análisis de suelo o de mapas del INTA.
- **Compactación real, herbicidas usados y altura de la napa:** los cuenta el productor o se miden en el lote.

Por eso existe la lista del paso 5 de la app.

---

## 4. ¿Alcanzan 4 zonas?

Para la demo, sí. Para cubrir la provincia, el clima dice que no. Comparamos la normal 1991-2020 de NASA POWER en los 4 puntos actuales y en 6 puntos más:

| Punto | Lluvia (mm/año) | Falta de agua (mm/año) | Días > 40 °C | Días > 35 °C | Días de helada (≤ 3 °C) |
|---|---|---|---|---|---|
| Z1 La Banda (riego) | 763 | 1.020 | 16,2 | 92 | 9,6 |
| Z2 Quimilí (secano este) | 830 | 886 | 13,7 | 83 | 7,0 |
| Z3 Campo Gallo (monte norte) | 810 | 973 | 17,2 | 96 | 5,1 |
| Z4 Añatuya (bajos) | 756 | 965 | 14,2 | 84 | 9,7 |
| Monte Quemado (extremo norte) | 844 | 949 | 16,6 | 96 | 4,6 |
| Bañados de Figueroa / Salado | 731 | 1.042 | 19,2 | 97 | 7,1 |
| **Ojo de Agua y Sumampa (sur)** | 739 | 838 | **2,2** | **36** | **20,4** |
| **Nueva Esperanza (oeste, pedemonte)** | **940** | 738 | 7,9 | 61 | 4,6 |
| **Selva / Mar Chiquita (sureste)** | **944** | 660 | 5,2 | 50 | **17,7** |

*Falta de agua = demanda (ET0 Hargreaves) − lluvia.*

**Qué dicen los números:**

1. **El sur es otra zona.** Ojo de Agua y Sumampa tienen 8 veces menos días de más de 40 °C y el doble de heladas que el resto. Hoy aparecen dentro de la Zona 3 (en [`zonas-santiago-y-kit-arduino.md`](zonas-santiago-y-kit-arduino.md)), pero el dato de la Zona 3 es del norte (Campo Gallo). **Propuesta: Zona 5 "Sur serrano y salinas"** (Ojo de Agua, Sumampa, Quebrachos, Choya, Guasayán). Ya está cargada en el mockup como zona en evaluación, con clima real y rotaciones borrador (D-20).
2. **El norte es uno solo.** Monte Quemado y Campo Gallo son casi iguales, así que la Zona 3 queda como "Chaco semiárido norte".
3. **El oeste (Pellegrini, Jiménez) y el sureste (Selva, Mar Chiquita)** son más húmedos y menos calurosos. Son candidatos a zonas 6 y 7 si sobra tiempo. Si no, se nombran como "fuera del alcance de la demo".
4. **Los Bañados de Figueroa** tienen el mismo clima que la Zona 1. Lo que los distingue es el agua y el suelo, que se ve con AIZAL y Landsat, no con NASA POWER.
5. **La celda de 50 km tiene un límite:** Ojo de Agua y Sumampa caen en la misma celda y dan números idénticos. Es un buen ejemplo de incertidumbre para mostrar en la app.

**Cómo hacerlo con un método:** agrupar la provincia en zonas parecidas con los embeddings AlphaEarth y las variables de AIZAL (k-means en Earth Engine; está en [`scripts/gee_visor_biosat.js`](../scripts/gee_visor_biosat.js)). Después hay que compararlas con las zonas del INTA. No encontramos una lista oficial publicada de las zonas agroeconómicas homogéneas de Santiago del Estero; conviene pedirla a la EEA Santiago del Estero o a la EEA Quimilí.

---

## 5. De dónde salen las imágenes del visor

- **Mockup:** recortes Landsat 8/9 de 2025 (verano e invierno) y Landsat 5 de 2000 para Campo Gallo. Se bajaron con la API abierta de Microsoft Planetary Computer, sin cuenta.
- **App final:** las mismas capas salen de Google Earth Engine:
  - [`scripts/gee_visor_biosat.js`](../scripts/gee_visor_biosat.js) es el visor interactivo, publicable como Earth Engine App.
  - [`scripts/gee_exportar_zonas.js`](../scripts/gee_exportar_zonas.js) exporta las imágenes y las estadísticas por zona, para que la app funcione sin internet.
