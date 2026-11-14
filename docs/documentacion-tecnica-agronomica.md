# Documentación Técnica y Agronómica: Simulador de Rotación de Cultivos ("Cambio de Rumbo")

> **Propósito del documento:** Registro consolidado del marco conceptual, reglas biológicas de cultivo, auditoría de conjuntos de datos (NASA / USDA / USGS / FAO), arquitectura de armonización y manejo de incertidumbre para el desarrollo de una herramienta de apoyo a la toma de decisiones (DSS) orientada a la rotación de cultivos resiliente.

---

## 1. Definición del Problema y Alcance del Sistema

### 1.1 El Problema Real a Resolver
El desafío principal en la agricultura actual **no es la falta de mediciones climáticas**, sino la **incertidumbre agronómica y económica** que frena al productor cuando necesita abandonar esquemas de cultivo rígidos y degradantes (ej. *Maíz → Soja → Maíz*):

1. **Ventanas de suelo desnudo:** Periodos de varios meses entre cosecha y siembra en los que el lote queda sin cobertura vegetal. Las lluvias intensas erosionan la capa fértil por escorrentía en lugar de infiltrarse.
2. **Descalce hídrico:** Siembra de cultivos de alta demanda hídrica en ventanas temporales o regiones donde la humedad del suelo y las reservas subterráneas muestran tendencias negativas.
3. **Riesgo de cambio a ciegas:** Incorporar cultivos de cobertura, leguminosas fijadoras de nitrógeno o especies tolerantes a la sequía sin saber si agotarán la humedad para el cultivo siguiente, si son incompatibles con herbicidas previos o si tienen demanda comercial cercana.

### 1.2 Objetivo de la Herramienta (DSS)
Construir un simulador de escenarios (*"¿Qué pasaría si...?"*) que:
* **Diagnostique el historial reciente del lote (5–10 años):** Identifique semanas de suelo desprotegido, puntos críticos de estrés térmico/hídrico y riesgo de erosión.
* **Compare al menos 3 estrategias de rotación:** Contraste la rotación actual (línea base) contra alternativas de regeneración de suelo y diversificación hídrica/comercial.
* **Transparente sus límites:** Indique explícitamente qué variables los satélites **no pueden medir**, asignando niveles de confianza y señalando dónde se requiere validación humana en campo.

> **Principio Rector:** La herramienta complementa y potencia el criterio del agricultor y del agrónomo local; **nunca los reemplaza**.

---

## 2. Fundamentos Agronómicos: Los 5 Pilares de la Planta

Para evitar perderse en el volumen de datos ambientales, el modelo parte de los **5 requerimientos fisiológicos** que cualquier cultivo necesita para germinar y desarrollarse sano:

| Pilar Fisiológico | Qué ocurre en la planta | Consecuencia si falla |
| :--- | :--- | :--- |
| **1. Balance Hídrico** | Requiere humedad superficial para germinar, agua disponible en zona radicular durante el crecimiento y drenaje adecuado para evitar asfixia. | Estrés hídrico (cierre de estomas, caída de flores/granos) o pudrición radicular por anegamiento. |
| **2. Régimen Térmico y Luz** | Necesita radiación solar para fotosíntesis y acumular unidades térmicas (**Días-Grado**) dentro de umbrales seguros para completar su ciclo. | Heladas tardías/tempranas queman tejidos; olas de calor en floración esterilizan el polen. |
| **3. Física y Anclaje del Suelo** | Necesita estructura suelta para expandir raíces, buena tasa de infiltración y estabilidad superficial frente a lluvia y viento. | Compactación subsuperficial (*piso de arado*) limita raíces; pendientes desnudas sufren erosión hídrica. |
| **4. Química y Nutrición** | Requiere disponibilidad de macronutrientes (**N, P, K**), materia orgánica y un **pH equilibrado** que habilite la absorción mineral. | Deficiencias nutricionales o bloqueo químico (ej. acidez extrema impide la fijación biológica de nitrógeno). |
| **5. Sanidad y Entorno Limpio** | Requiere un suelo libre de inóculos de patógenos acumulados y sin residuos fitotóxicos de herbicidas de campañas previas. | Ataques severos de hongos/nemátodos específicos o muerte de plántulas por residualidad (*carryover*). |

---

## 3. Taxonomía Funcional de Cultivos y Reglas de Rotación

En lugar de modelar cientos de especies de forma aislada, el motor agronómico clasifica los cultivos en **4 secciones funcionales** según lo que extraen y lo que aportan al ecosistema del lote:

### 3.1 Secciones Funcionales de Plantas

#### Sección A: Gramíneas Extractivas (Alto Consumo)
* **Especies tipo:** Maíz, Sorgo, Trigo, Cebada.
* **Requerimientos:** Alta demanda de **Nitrógeno** y agua (el maíz exige alta humedad estival; el sorgo tolera déficit hídrico; el trigo aprovecha ciclos frescos).
* **Aporte al sistema:** Generan alto volumen de rastrojo rico en carbono que protege el suelo tras la cosecha, reduce la evaporación y frena la erosión.
* **Pasivo que dejan:** Agotan el nitrógeno disponible y acumulan plagas/hongos específicos de gramíneas.

#### Sección B: Leguminosas Fijadoras de Nitrógeno
* **Especies tipo:** Soja, Garbanzo, Lenteja, Arveja, Alfalfa, Trébol.
* **Requerimientos:** Suelos bien drenados, **pH cercano a neutro** (sensibles a acidez) y buen nivel de Fósforo. No requieren fertilización nitrogenada externa.
* **Aporte al sistema:** Simbiosis radicular con bacterias (*Rhizobium*) que fijan nitrógeno atmosférico, dejándolo disponible para el cultivo siguiente.
* **Pasivo que dejan:** Producen poco rastrojo y de rápida descomposición, dejando el suelo expuesto a erosión si no se cubre después.

#### Sección C: Oleaginosas y Raíces Pivotantes Profundas
* **Especies tipo:** Girasol, Canola (Colza), Nabo forrajero.
* **Requerimientos:** Perfiles de suelo profundos sin capas rocosas; alta tolerancia a estrés térmico e hídrico moderado.
* **Aporte al sistema:** Raíces pivotantes gruesas que rompen capas compactadas (*descompactación biológica*), reciclan nutrientes lixiviados en profundidad y cortan ciclos de plagas de gramíneas y leguminosas.
* **Pasivo que dejan:** Extraen humedad de capas profundas; si la recarga invernal es baja, el cultivo siguiente inicia con menor reserva.

#### Sección D: Cultivos de Cobertura / Puente (No Comerciales)
* **Especies tipo:** Centeno, Avena negra, Vicia villosa (o consociaciones gramínea + leguminosa).
* **Requerimientos:** Bajas exigencias térmicas; crecen en otoño/invierno con humedad residual. No se cosechan para grano: se rolan o secan antes de la siembra comercial.
* **Aporte al sistema:** Cubren el suelo durante ventanas críticas de barbecho, evitan erosión, suprimen malezas por competencia de luz e incrementan la materia orgánica.
* **Pasivo que dejan:** Exigen precisión en la fecha de terminación/secado para no consumir el agua necesaria para el cultivo comercial de primavera.

### 3.2 Reglas Lógicas de Secuenciación
1. **Regla de Balance de Nitrógeno:** Tras una **Sección A** (extractiva), priorizar una **Sección B** (fijadora) para reducir dependencia de fertilizantes sintéticos.
2. **Regla de Cero Suelo Desnudo:** Tras una **Sección B** (bajo rastrojo), intercalar una **Sección D** (cobertura invernal) siempre que el historial de lluvias muestre riesgo erosivo fuera de temporada.
3. **Regla de Adaptación Hídrica y Física:** Ante tendencias negativas de humedad o estrés térmico recurrente, sustituir cultivos exigentes de la **Sección A** (Maíz) por especies rústicas de **Sección A** (Sorgo) o **Sección C** (Girasol) que además descompactan el perfil.
4. **Regla Sanitaria (Ruptura de Ciclos):** Prohibir la repetición consecutiva de la misma sección funcional en la misma ventana estacional; exigir al menos **3 secciones distintas** en un ciclo de 3 años.

---

## 4. Auditoría de Datos: Mapeo de los 24 Datasets a los 8 Core

Al evaluar los 24 conjuntos de datos disponibles frente a los 5 pilares fisiológicos, se concluye que **8 datasets principales (Core)** cubren toda la capacidad observacional remota necesaria para el MVP, mientras que el resto actúa como contexto secundario o redundante.

### 4.1 Matriz de Decisión: Pilar vs. Datos Necesarios

| Pilar / Dimensión | Datasets CORE (Indispensables) | Datasets Secundarios / Redundantes | Dato Faltante (Input del Agricultor) |
| :--- | :--- | :--- | :--- |
| **1. Balance Hídrico** | • **SMAP** (humedad superficial 5 cm y congelación)<br>• **GPM / IMERG** (precipitación y tormentas)<br>• **ECOSTRESS** o **OpenET** (evapotranspiración real) | • *GRACE-FO* (escala ~300 km, solo contexto de acuífero regional)<br>• *NLDAS/GLDAS* (redunda con SMAP+GPM)<br>• *CoCoRaHS / NWIS* (validación puntual) | • Disponibilidad de riego en parcela.<br>• Cupo/volumen de agua disponible. |
| **2. Régimen Térmico y Luz** | • **NASA POWER** (series diarias limpias sin nubes para Días-Grado y heladas)<br>• **ECOSTRESS** (picos reales de temperatura superficial en parcela) | • *PRISM* (alta precisión en EE. UU., pero NASA POWER cubre la lógica térmica globalmente) | • Fechas objetivo de siembra y cosecha. |
| **3. Física y Anclaje del Suelo** | • **SRTM** (elevación, pendiente y escorrentía)<br>• **USDA SSURGO** (textura, drenaje, retención hídrica) | • *STATSGO2* (menor resolución que SSURGO)<br>• *Web Soil Survey* (interfaz web de SSURGO) | • Compactación profunda (*prueba de pala* a 25–30 cm). |
| **4. Química y Nutrición** | • *Ningún satélite mide química edáfica; línea base estimada con **SSURGO*** | • *FAO GAEZ* (idoneidad agroclimática macro) | • **pH actual y salinidad**.<br>• **Niveles reales de N-P-K** (análisis de suelo). |
| **5. Sanidad e Historial** | • **USDA CDL** (historial anual de cultivos a 30 m)<br>• **Landsat** (NDVI a 30 m para detectar semanas de suelo desnudo) | • *MODIS/VIIRS* (píxel 250–1000 m, redunda con Landsat)<br>• *NAIP, NLCD, LANDFIRE, GEDI* (contexto visual y vegetación perenne circundante) | • **Herbicidas aplicados** (últimos 12–24 meses).<br>• Plagas, nemátodos o malezas resistentes. |
| **6. Viabilidad Operativa** | • **USDA AMS** (precios de commodities y demanda regional) | • *NASS QuickStats, Ag Data Commons* | • **Maquinaria disponible** (sembradoras/cabezales).<br>• Distancia real a acopio o comprador. |

### 4.2 Catálogo Completo de Referencia (24 Datasets) y Aclaraciones Técnicas

#### Grupo A: Observación Satelital y Clima (NASA - Cobertura Global)
1. **SMAP:** Humedad superficial del suelo (primeros 5 cm) y estado congelado/descongelado (9–36 km, cada 2–3 días). *Límite: No detecta humedad en profundidad radicular.*
2. **GPM (IMERG):** Tasa y acumulación de lluvias y tormentas extremas (~10 km, subdiaria a mensual).
3. **Landsat:** Reflectancia superficial, NDVI, vigor vegetal y suelo desnudo (30 m, cada 8–16 días).
4. **MODIS / VIIRS:** Índices de vegetación (NDVI) y fenología (250–1000 m, diaria). *Nota crítica: Miden cobertura y verdor vegetal, **NO** fertilidad química ni nutrientes del suelo.*
5. **ECOSTRESS:** Temperatura de la superficie terrestre (LST) y evapotranspiración (ET) (~70 m, cada 3–5 días). *Clave física: Ante estrés hídrico, la planta cierra estomas, deja de transpirar y eleva su temperatura superficial.*
6. **GRACE y GRACE-FO:** Anomalías gravitacionales que miden cambios en masas de agua subterránea/acuíferos (~300 km, mensual). *Uso exclusivo para tendencias hídricas regionales a largo plazo.*
7. **GEDI:** Láser LiDAR orbital que mide altura de dosel y biomasa aérea (huellas de 25 m). *Útil para evaluar cortinas forestales y vegetación perenne perimetral que frenan erosión eólica y albergan controladores biológicos.*
8. **NASA POWER:** Parámetros meteorológicos y radiación solar diarios, interpolados y **sin huecos por nubosidad** (~50 km). *Ideal para calcular Días-Grado y ventanas de heladas.*
9. **SRTM:** Modelo Digital de Elevación (30 m) para derivar pendientes, dirección de flujo y riesgo de erosión hídrica.

#### Grupo B: Suelos, Cobertura Terrestre e Imágenes Aéreas (Cobertura EE. UU.)
10. **USDA SSURGO / STATSGO2:** Propiedades físicas del suelo (textura, drenaje, grupo hidrológico, retención de agua y materia orgánica base). SSURGO a escala de parcela; STATSGO2 regional.
11. **USDA Web Soil Survey (WSS):** Portal oficial de consulta de datos SSURGO e idoneidad de tierras.
12. **USDA CDL (CropScape):** Clasificación anual del tipo exacto de cultivo sembrado por píxel (30 m).
13. **USGS NLCD:** Cobertura terrestre multidecadal (cultivos, bosques, pastizales, humedales; 30 m).
14. **NAIP:** Fotografía aérea de ultra alta resolución (~1 m) en temporada de cultivo para delimitación fina de lotes.
15. **USFS LANDFIRE:** Capas de vegetación perenne, estructura del paisaje y modelos de combustible (30 m).

#### Grupo C: Hidrología, Evapotranspiración y Clima de Alta Precisión
16. **NLDAS / GLDAS:** Sistemas asimilados en cuadrícula (temperatura, lluvia, humedad de suelo, radiación y ET subdiaria; GLDAS global, NLDAS Norteamérica a 12 km).
17. **OpenET:** Evapotranspiración real a escala de campo mediante ensamble de modelos satelitales (30 m, Oeste de EE. UU.).
18. **PRISM:** Normales climáticas de 30 años, temperaturas y fechas de heladas ajustadas por topografía (800 m–4 km, EE. UU.).
19. **USGS NWIS:** Registros in situ de niveles freáticos y caudal de ríos/arroyos (EE. UU.).
20. **CoCoRaHS:** Red ciudadana de pluviómetros diarios para validar estimaciones satelitales de lluvia (Norteamérica).

#### Grupo D: Datos Agronómicos, Productivos y de Mercado
21. **FAO GAEZ:** Idoneidad agroclimática global por cultivo y limitaciones edáficas (~9 km, Global).
22. **USDA Ag Data Commons:** Repositorio abierto de estudios agronómicos, fenología y prácticas de manejo (EE. UU.).
23. **USDA NASS QuickStats:** Estadísticas históricas de rendimientos y superficies por condado/estado (EE. UU.).
24. **USDA AMS (Market News):** Cotizaciones de commodities, tendencias de demanda y precios regionales (EE. UU.).

> **Nota de Alcance Geográfico para el Prototipo:** Dado que los satélites NASA y FAO GAEZ son globales pero los datos granulares de suelo (SSURGO), historial de cultivos (CDL) y precios (AMS) son exclusivos de Estados Unidos, el MVP debe situarse en condados agrícolas de EE. UU. para garantizar continuidad de datos sin huecos.

---

## 5. Lagunas de Información (*Data Gaps*) y Arquitectura Híbrida

Los satélites observan la atmósfera y los primeros centímetros del suelo, pero son ciegos a variables críticas bajo superficie y al historial de decisiones humanas:

### 5.1 Las 4 Brechas Críticas del Satélite
1. **Química y física subsuperficial:** pH actual, salinidad, niveles reales de N-P-K disponibles, compactación profunda (*piso de arado* a 25–30 cm) y presencia de patógenos/nemátodos.
2. **Memoria química y labranza:** Residualidad de herbicidas (*carryover*) aplicados en los últimos 12–24 meses (capaces de matar leguminosas o coberturas sensibles) y sistema de labranza (siembra directa vs. convencional).
3. **Capacidad operativa de la granja:** Disponibilidad real de sembradoras de grano fino, cabezales específicos, presencia de ganado e infraestructura/cupos de riego en el lote.
4. **Logística hiperlocal:** Distancia real a acopios o plantas procesadoras (<50 km) y disponibilidad local de semillas e inoculantes.

### 5.2 Estrategia de Mitigación (*Human-in-the-Loop*)

| Dato Faltante | Mecanismo en el Software | Acción Requerida del Usuario |
| :--- | :--- | :--- |
| **Riego, maquinaria y ganado** | **Filtros duros previos:** Descartan automáticamente rotaciones inviables antes de ejecutar el modelo. | Responde un cuestionario inicial de 5 preguntas simples. |
| **pH, N-P-K y compactación** | **Etiqueta de Confianza + Muestreo Dirigido:** Usa SSURGO con indicador *"Confianza Media"* y marca coordenadas exactas en el mapa (zonas de estrés ECOSTRESS / pendientes SRTM). | Realiza análisis de suelo o prueba de pala en los puntos georreferenciados sugeridos. |
| **Herbicidas y plagas** | **Checklist de Validación Pre-Siembra:** Bloquea la confirmación definitiva hasta revisar incompatibilidades químicas frecuentes. | Verifica su cuaderno de campo con un agrónomo local. |
| **Compradores cercanos** | Muestra precios regionales USDA AMS como rango estimado neto de flete. | Confirma precio puesto en acopio local. |

---

## 6. Arquitectura Técnica de Procesamiento y UX

### 6.1 Armonización y Cubo de Datos
Para cruzar fuentes con resoluciones dispares, el backend normaliza todas las capas a una **grilla común de análisis de 30 m × 30 m con paso temporal semanal**:
* **Downscaling de Humedad (SMAP):** Combina la serie temporal de SMAP (9–36 km, cada 2–3 días) con la variación espacial de temperatura superficial de ECOSTRESS (70 m), elevación SRTM (30 m) y textura de SSURGO para estimar humedad relativa a nivel de sub-parcela.
* **Índice de Riesgo de Erosión Estacional:** Cruza las semanas de suelo desnudo (NDVI bajo en Landsat + calendario de cultivo CDL) con eventos de lluvia extrema (GPM IMERG) y pendiente del terreno (SRTM).
* **Balance Hídrico y Estrés Térmico:** Resta la evapotranspiración real (ECOSTRESS / OpenET) a la precipitación efectiva (GPM) más reserva inicial (SMAP), detectando zonas críticas donde la LST supera el umbral fisiológico del cultivo.

### 6.2 Diseño Centrado en el Agricultor (UX)
* **Traducción de jerga científica:**
  * *Anomalía negativa de NDVI + pico ET ECOSTRESS* → **"Alerta de Sed del Cultivo: Mayor transpiración que reserva hídrica en el sector norte."**
  * *Reflectancia de suelo desnudo en Landsat* → **"145 días/año con suelo desprotegido expuesto a erosión."**
* **Controles de Prioridad:** Deslizadores (0–100%) para ponderar *Ahorro de Agua*, *Salud del Suelo / Anti-erosión* y *Rentabilidad a Corto Plazo*.

---

## 7. Estructura de Salida: Comparativa de 3 Estrategias de Rotación

Toda recomendación generada por el sistema debe presentarse comparando como mínimo tres escenarios bajo el siguiente esquema estandarizado:

| Dimensión de Análisis | Estrategia A: Línea Base (Actual) | Estrategia B: Resiliencia Hídrica y Suelo | Estrategia C: Diversificación Climática y Mercado |
| :--- | :--- | :--- | :--- |
| **Secuencia Propuesta** | Detectada automáticamente vía **USDA CDL** (ej. *Maíz → Soja → Maíz*). | Incorpora **Sección D** (cobertura) y **Sección B** (leguminosa) (ej. *Maíz → Centeno → Soja → Trigo + Trébol*). | Incorpora cultivos rústicos **Sección A/C** (ej. *Sorgo → Garbanzo → Girasol*). |
| **Justificación** | Diagnóstico del estado actual y proyección de desgaste si no se interviene. | Frenar erosión invernal, aumentar infiltración y fijar nitrógeno biológico. | Reducir consumo hídrico total ante caída de napas y romper ciclos de plagas. |
| **Evidencia NASA / USDA** | Semanas de suelo desnudo (**Landsat**), picos de calor en floración (**ECOSTRESS**). | Pendiente (**SRTM**) + lluvias intensas (**GPM**) + retención hídrica en parcelas vecinas con cobertura (**SMAP + CDL**). | Tendencia térmica (**NASA POWER**), menor ET acumulada del sorgo (**OpenET**) y precios (**USDA AMS**). |
| **Beneficios Esperados** | Maquinaria y canales comerciales ya conocidos por el productor. | Menor pérdida de suelo, descompactación radicular y ahorro de fertilizante nitrogenado. | Estabilidad de rinde en años secos y ruptura total de plagas del maíz/soja. |
| **Lagunas de Datos** | Sin medición real de compactación profunda ni niveles actuales de P/K. | Costo local de semilla de cobertura y ventana operativa de secado. | Existencia de comprador/acopio local a menos de 50 km para cultivos alternativos. |
| **Riesgos a Validar** | Degradación progresiva de materia orgánica y vulnerabilidad a sequía severa. | Consumo excesivo de humedad primaveral por el centeno si se seca tarde. | Residualidad de herbicidas previos (*carryover*) sobre garbanzo o girasol. |