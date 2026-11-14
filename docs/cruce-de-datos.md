# Cruce de datos: NASA POWER × AIZAL V4 × Landsat

> **Para qué sirve:** resume qué sale de juntar las fuentes, para qué decisión del productor sirve cada cruce y en qué archivo queda. Es corto a propósito. Los formatos están en [`contratos-de-datos.md`](contratos-de-datos.md) y las tareas en el [PLAN](../PLAN.md).
> **Última actualización:** 14/11/2026. BioSat trabaja con **5 zonas** (D-21) y suma la zonificación AIZAL y el modelo predictivo de desmontes (D-25).

---

## 1. Las fuentes

| Fuente | Qué mide | Tamaño del píxel | Período | Limitación honesta |
|---|---|---|---|---|
| **NASA POWER** | Clima diario: temperatura, lluvia, humedad en raíces | ~50 km | 1981-2025 | Es un modelo de reanálisis, no una medición en el lote |
| **AIZAL V4** | 38 variables de suelo, clima, paisaje y servicios del Gran Chaco | 500 m | Normal 1991-2020, SoilGrids 2020, MapBiomas 2023 | El suelo viene de SoilGrids (modelo); **no trae salinidad** |
| **Landsat 5/7/8/9** | Color y verdor de la superficie, cada 8-16 días | 30 m | 1984-2025 | Las nubes tapan fechas; ve la superficie, no el subsuelo |

**De apoyo**, en los scripts de Google Earth Engine:

| Fuente | Qué aporta |
|---|---|
| NASADEM (NASA) | Relieve y pendiente |
| Hansen Global Forest Change | Desmonte por año, hecho con Landsat |
| ESA WorldCover | Dónde hay lotes agrícolas |
| AlphaEarth | Zonas parecidas, con IA |
| Historia de desmontes | Base del LART (FAUBA-INTA) desde 1976 (monitoreodesmonte.com.ar, hoy caído) · MapBiomas Chaco 1985-2023 · Hansen 2001-2023 |
| Kit Arduino | Medición en tierra |

---

## 2. Lo que sale del cruce

| # | Cruce | Qué sale | Para qué decisión | Dónde queda |
|---|---|---|---|---|
| 1 | Landsat (meses pelados) × POWER (calor y tormentas) | **Exposición del suelo**: cuántos días de más de 35 °C y cuántas tormentas de más de 30 mm caen sobre suelo pelado | Qué rotación tapa el suelo en los meses que más castigan | Calendario y tarjetas de la app |
| 2 | AIZAL (textura B12, B17) × POWER (lluvia − ET0) | **El tanque del suelo**: cuánta agua puede guardar y en qué mes se vacía | Si conviene sembrar una cobertura en otoño y cuándo secarla | Motor de reglas |
| 3 | AIZAL (pH B16, nitrógeno B11) × secciones de cultivo | **¿Funciona una leguminosa acá?**: con pH menor a 5,8 fija poco nitrógeno; con nitrógeno bajo conviene sumar una | Elegir entre las secciones B y D | Motor de reglas |
| 4 | AIZAL (densidad aparente B18) × secciones de cultivo | **Suelo compactado**: sugiere una raíz pivotante (sección C) | Sumar girasol o nabo a la rotación | Motor de reglas |
| 5 | Landsat (desmonte, con etiquetas de MapBiomas o Hansen) × POWER (calor) | **Índice de fragilidad**, con una fórmula visible | Priorizar el sistema silvopastoril o la cobertura inmediata (Zona 3) | `diagnostico_landsat_ia.json` |
| 6 | Landsat (NDVI mes a mes) × POWER (días de más de 40 °C) | **¿Florece con calor?**: el mes de máximo verdor contra los picos de calor | Correr la fecha de siembra (por ejemplo, maíz tardío) | Tarjetas, riesgo |
| 7 | POWER × AIZAL (TerraClimate B03-B07) | **Control cruzado**: dos fuentes independientes del mismo clima | Si coinciden, confianza alta; si no, se avisa | Etiquetas de confianza |
| 8 | AlphaEarth (AIZAL módulo 06) × todo lo anterior | **Zonas parecidas** (agrupamiento k-means) | Validar los límites de las 5 zonas y llevar una rotación que funciona a lugares similares | Visor de Earth Engine |
| 9 | AIZAL (distancia a caminos B36) × rotaciones | **Filtro de mercado**: aviso si el lote está lejos para vender un cultivo nuevo | Descartar o advertir alternativas | Tarjetas, avisos |
| 10 | NASADEM (pendiente) × Landsat (meses pelados) × POWER (tormentas) | **Riesgo de erosión**: suelo pelado en pendiente justo cuando llegan las lluvias fuertes | Tapar el suelo antes del verano en lomas y sierras (Zona 5) | Tarjetas, avisos |
| 11 | POWER (heladas: cuántas y cuándo) × especies de cada rotación | **¿Aguanta el frío?**: ventana de heladas contra coberturas, pasturas y siembras tempranas | Elegir especies tolerantes. En la Zona 5, centeno, avena o pasto llorón antes que buffel | Motor de reglas, tarjetas |
| 12 | Kit Arduino × Landsat × POWER | **Escalera de escalas**: 1 m² contra 30 m contra 50 km | Mostrar qué ve cada uno y qué se pierde | Panel "Espacio contra tierra" |
| 13 | AIZAL (clima B03-B08 + suelo B09-B18) | **Zonificación**: k-means en 5 grupos (propuesta de la profesora) | Validar o ajustar las 5 zonas de BioSat | `zonificacion_aizal.json` |
| 14 | Historia de desmontes × AIZAL (distancias, suelo, clima, áreas protegidas, población) | **Riesgo de desmonte por zona** (modelo predictivo) | En las zonas con más presión, priorizar las rotaciones que conservan el monte | `desmonte_zonas.json` |

**La escalera de escalas (para el pitch):** NASA POWER 50 km → TerraClimate 4,6 km → AIZAL 500 m → Landsat 30 m → sensor 1 m² → el productor.

---

## 3. Lo que el cruce no resuelve

- **Salinidad actual:** ninguna fuente la mide. SoilGrids no tiene conductividad eléctrica. Sale del sensor, de un análisis de suelo o de mapas del INTA.
- **Compactación real, herbicidas usados y altura de la napa:** los cuenta el productor o se miden en el lote.

Por eso existe la lista del paso 5 de la app.

---

## 4. Las 5 zonas de BioSat

**Decisión (D-21):** BioSat trabaja con 5 zonas. La quinta sale de este análisis.

Números de la normal 1991-2020 de NASA POWER:

| Zona | `zona_id` | Punto NASA POWER | Lluvia (mm/año) | Falta de agua (mm/año) | Días > 40 °C | Heladas (≤ 3 °C) | Lo que la define |
|---|---|---|---|---|---|---|---|
| 1 · Riego del Río Dulce | `zona_1_riego_salitre` | La Banda (-27.73, -64.17) | 763 | 1.020 | 16,2 | 9,6 | Riego por manto, napa alta, salitre |
| 2 · Secano del este | `zona_2_secano_este` | Quimilí (-27.65, -62.42) | 830 | 886 | 13,7 | 7,0 | Todo depende de la lluvia; poco rastrojo |
| 3 · Chaco semiárido norte | `zona_3_monte_semiarido` | Campo Gallo (-26.58, -62.85) | 810 | 973 | 17,2 | 5,1 | Monte, desmonte y el calor más extremo |
| 4 · Bajos submeridionales | `zona_4_bajos_submeridionales` | Añatuya (-28.46, -62.83) | 756 | 965 | 14,2 | 9,7 | Se anega en verano y sube el salitre en la seca |
| 5 · Sur serrano y salinas | `zona_5_sur_serrano` | Ojo de Agua (-29.50, -63.69) | 739 | 838 | **2,2** | **20,4** | Heladas, pendientes que se erosionan, ganadería |

*Falta de agua = demanda (ET0 Hargreaves) − lluvia.*

### Cómo llegamos a las 5 zonas

Comparamos los 4 puntos originales con 6 puntos más de la provincia:

| Punto | Lluvia (mm/año) | Falta de agua (mm/año) | Días > 40 °C | Días > 35 °C | Heladas (≤ 3 °C) |
|---|---|---|---|---|---|
| Monte Quemado (extremo norte) | 844 | 949 | 16,6 | 96 | 4,6 |
| Bañados de Figueroa / Salado | 731 | 1.042 | 19,2 | 97 | 7,1 |
| Ojo de Agua y Sumampa (sur) | 739 | 838 | 2,2 | 36 | 20,4 |
| Nueva Esperanza (oeste, pedemonte) | 940 | 738 | 7,9 | 61 | 4,6 |
| Selva / Mar Chiquita (sureste) | 944 | 660 | 5,2 | 50 | 17,7 |

1. **El sur es otra zona.** Ojo de Agua y Sumampa tienen 8 veces menos días de más de 40 °C y el doble de heladas que el resto. Antes estaban dentro de la Zona 3, pero el dato de esa zona es del norte. Por eso nace la **Zona 5** (Ojo de Agua, Sumampa, Quebrachos, Choya, Guasayán).
2. **El norte es uno solo.** Monte Quemado y Campo Gallo dan casi igual, así que la Zona 3 queda como "Chaco semiárido norte".
3. **Los Bañados de Figueroa** tienen el mismo clima que la Zona 1. Lo que los distingue es el agua y el suelo, que se ve con AIZAL y Landsat.
4. **Quedan fuera de la demo** el oeste (Pellegrini, Jiménez) y el sureste (Selva, Mar Chiquita): son más húmedos y menos calurosos. Se nombran en la presentación como próximos pasos.
5. **La celda de 50 km tiene un límite:** Ojo de Agua y Sumampa caen en la misma celda y dan números idénticos. Es un buen ejemplo de incertidumbre para mostrar en la app.

**Pendiente:**
- **Rotaciones de la Zona 5:** son un borrador. Hay que validarlas con productores del sur o con el INTA (Frente 4).
- **Límites de las zonas:** validarlos con la zonificación AIZAL, un k-means sobre clima y suelo propuesto por la profesora (D-25, Frente 2, sección 6).
- **Zonas del INTA:** compararlas con las oficiales. No encontramos una lista publicada de las zonas agroeconómicas homogéneas de la provincia; conviene pedirla a la EEA Santiago del Estero o a la EEA Quimilí.

---

## 5. Zonificación AIZAL y modelo predictivo de desmontes (D-25)

Propuesta de la profesora de Sistemas de IA, con el acuerdo del equipo. La base es [`scripts/gee_zonas_y_desmonte.js`](../scripts/gee_zonas_y_desmonte.js).

**Zonificación:**
- **Método:** k-means sobre las variables de clima (B03-B08) y suelo (B09-B18) de AIZAL, estandarizadas. Si no hay acceso a AIZAL, se usan TerraClimate y SoilGrids.
- **Cantidad de zonas:** 5, como sugiere la profesora. Se revisa con el índice de silueta.
- **Uso:** se compara con las 5 zonas de BioSat.

**Modelo predictivo de desmontes:**
- **Historia:** la base del LART desde 1976, si se consigue; si no, MapBiomas Chaco (1985-2023) o Hansen (2001-2023).
- **Predictores:**
  - distancia a zonas sin monte y a desmontes previos;
  - pendiente y áreas protegidas;
  - población;
  - clima y suelo de AIZAL;
  - la zona.
- **Tres modelos:**
  - regresión logística, como referencia;
  - random forest;
  - un modelo temporal (LSTM o Transformer) que proyecta el desmonte anual de cada zona.
- **Validación temporal:** entrenar con la historia hasta 2015 y probar contra 2016-2023, con AUC, F1 y error en hectáreas por zona.
- **Salida:** un mapa de riesgo y el riesgo medio por zona (`data/desmonte_zonas.json`). En la app se muestra como "presión de desmonte" y empuja las rotaciones que conservan el monte.

**Qué cambia respecto del plan anterior:** la red CNN sobre parches de Landsat queda fuera, porque no tenía etiquetas buenas y no entraba en 48 horas. El aprendizaje profundo pasa al modelo temporal de desmontes. Los meses de suelo pelado del calendario se calculan con el método simple de umbral.

---

## 6. De dónde salen las imágenes del visor

- **Mockup:** recortes de las 5 zonas, bajados con la API abierta de Microsoft Planetary Computer, sin cuenta:
  - Landsat 8/9 de 2025, en verano e invierno.
  - Landsat 5 de 2000 para Campo Gallo (desmonte).
- **App final:** las mismas capas salen de Google Earth Engine:
  - [`scripts/gee_visor_biosat.js`](../scripts/gee_visor_biosat.js) es el visor interactivo, publicable como Earth Engine App.
  - [`scripts/gee_exportar_zonas.js`](../scripts/gee_exportar_zonas.js) exporta las imágenes y las estadísticas de las 5 zonas, para que la app funcione sin internet.
