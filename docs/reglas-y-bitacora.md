# Reglas de Trabajo y Bitácora de Decisiones — BioSat

> **Equipo:** BioSat · **Sede local:** Santiago del Estero · **Desafío:** *Field Shift: Adapting Farms with NASA Data* (NASA Space Apps 2026)

---

## Parte 1: Reglas de Oro del Proyecto

Estas 4 reglas son obligatorias para todo lo que diseñemos, escribamos o programemos en estas 48 horas:

### 1. Fácil para el usuario (El agricultor primero)
- **Cero jerga sin traducir:** En la interfaz nunca aparece una sigla suelta (`NDVI`, `GWETROOT`, `EVPTRNS`) sin su equivalente humano inmediato (*"Cobertura verde"*, *"Agua en las raíces"*, *"Consumo de agua"*). Consultar siempre [`docs/glosario.md`](glosario.md).
- **3 pasos claros, no un panel de la NASA:** El productor no viene a admirar mapas científicos; viene a responder:
  1. *¿Qué le pasa a mi campo durante el año?* (Diagnóstico / Calendario del lote + lectura en tierra).
  2. *¿Qué rotaciones puedo comparar según mis prioridades?* (Actual vs. Alternativa 1 vs. Alternativa 2, con sus 5 puntos claros).
  3. *¿Qué pasa si el clima viene peor y qué debo revisar antes de sembrar?* (Simulador de sequía/calor + advertencias locales).
- **Humildad siempre visible:** Toda recomendación incluye qué información falta y recuerda que **la herramienta apoya, pero no reemplaza** la decisión del productor ni del agrónomo.

### 2. Fácil para el desarrollador (KISS: Simple, Modular y Robusto)
- **Arquitectura sin fricción:** Nada de infraestructuras pesadas, bases de datos complejas ni dependencias que tarden horas en configurar. Datos cacheados en archivos JSON/CSV limpios + conexión directa a la API de NASA POWER (que no pide clave) y lectura simple por puerto serie / JSON para el kit Arduino.
- **Tolerancia a fallos en la demo (Modo Offline/Cache):** Toda consulta a la NASA o al sensor Arduino debe tener un **respaldo local guardado en el proyecto**. Si el internet o un cable falla durante la presentación ante el jurado, la app sigue funcionando sin romperse.
- **Código legible y separado por responsabilidades:**
  - `data/`: Datos descargados de NASA y perfiles de cultivos/rotaciones en JSON/CSV legibles por humanos.
  - `motor/` (o lógica): Reglas claras y transparentes (nada de "cajas negras" imposibles de explicar al jurado).
  - `ui/`: Pantallas limpias con textos en español llano.
  - `arduino/`: Sketch `.ino` simple y comentado línea por línea.

### 3. Lenguaje sencillo en todo el repositorio
- Si una explicación no la entiende en 10 segundos alguien que no es ni climatólogo ni programador senior, **está mal escrita y se simplifica**.
- Comentarios en el código en español explicando *el porqué agronómico*, no solo el cómo técnico.

### 4. Documentación constante y confirmación paso a paso
- Cada vez que se toma una decisión de diseño, arquitectura, datos o hardware, se registra en la **Bitácora de Decisiones** (Parte 2 de este documento).
- Cada vez que aparece un concepto técnico nuevo, se suma a [`docs/glosario.md`](glosario.md).
- **Confirmación de cambios importantes:** Antes de pasar de una etapa a la siguiente, revisamos y confirmamos el resultado con el equipo.

---

## Parte 2: Lo que valora la NASA (Análisis de `awards.mhtml`)

Según la página oficial de premios (`NASA Space Apps Challenge - awards.mhtml`), el jurado evalúa los proyectos rumbo a los **10 Premios Globales**. Así se alinea **BioSat** con los premios donde tenemos mayor ventaja competitiva:

| Premio de la NASA | Qué premia exactamente | Cómo lo gana BioSat |
|---|---|---|
| **Local Impact** *(Impacto Local)* | El proyecto con mayor potencial de impacto real en su comunidad local. | Resolviendo el problema real de un productor de nuestra región (**Santiago del Estero**, donde el estrés térmico, la estación seca marcada y el manejo del agua/cobertura en el suelo son críticos). |
| **Best Use of Data** *(Mejor Uso de Datos)* | Hacer accesibles los datos espaciales o usarlos en una aplicación única. | Traducir datos crudos de la NASA (POWER, NDVI, GAEZ) al **"Calendario del Lote"** comprensible por cualquier agricultor + cruzarlos con el sensor en tierra. |
| **Best Use of Science** *(Mejor Uso de la Ciencia)* | Uso más válido de la ciencia y del método científico. | Mostrar tanto la hipótesis satelital como la **validación física en suelo (Arduino)** y ser honestos con la incertidumbre y los *trade-offs* agronómicos (ej. cobertura vs. consumo de agua). |
| **Best Use of Technology** *(Mejor Uso de Tecnología)* | Uso más innovador de la tecnología. | Hibridar **Espacio + Tierra**: conectar la macro-escala satelital de la NASA (50 km / 10 m) con un **Kit Arduino clásico** de bajo costo clavado en la maceta/lote para medir microclima y suelo en tiempo real. |
| **Best Use of Storytelling** y **Art & Technology** | Comunicar el potencial de los datos abiertos mediante una historia clara y visual. | Contar la historia desde los ojos del productor real, usando visualizaciones intuitivas en vez de gráficos científicos fríos. |

---

## Parte 3: Bitácora de Decisiones

### Día 1 — 13/11/2026
- **D-01 (Fuentes oficiales):** Como `spaceappschallenge.org` da error de certificado SSL en esta PC, se guardaron las páginas oficiales localmente (`NASA Space Apps Challenge.pdf` y `.mhtml`) para trabajar sobre los requisitos exactos.
- **D-02 (Filtro de recursos):** Se revisaron los 26 recursos del desafío. Se descartaron por irrelevantes para cultivos agrícolas: *GEDI, LANDFIRE, NLCD, NWIS y CoCoRaHS*.
- **D-03 (Motor climático base):** Se probó con éxito la API de **NASA POWER** (sin clave, < 1 s de respuesta, datos diarios desde 1981 con temperatura, lluvia, humedad radicular `GWETROOT` y evapotranspiración `EVPTRNS`).

### Día 2 — 14/11/2026
- **D-04 (Sede y equipo identificados):** En `NASA Space Apps Challenge - awards.mhtml` queda registrado el equipo **BioSat** participando en la sede local **Santiago del Estero**.
- **D-05 (Reglas de proyecto e idioma):** Se establecen las 4 reglas de oro en [`docs/reglas-y-bitacora.md`](reglas-y-bitacora.md): facilidad para el usuario, simplicidad para el desarrollador, lenguaje sencillo y documentación/bitácora constante.
- **D-06 (Glosario vivo):** Se crea [`docs/glosario.md`](glosario.md) traduciendo todas las siglas satelitales, agronómicas y de sensores a lenguaje llano para el desarrollador y para el agricultor.
- **D-07 (Evaluación de integración con Kit Arduino clásico):** Se incorpora en el diseño la opción de sumar un **Kit Arduino clásico** como estación de "Verdad de Campo" (*Ground Truth*), respondiendo directamente al punto del enunciado de la NASA: *"Clarify how satellite observations differ from ground-based measurements, and how combining both may improve accuracy"*.
- **D-08 (Identificación del Kit de Hardware):** El kit disponible es el **Combo AltaNet Arduino Uno R3 + ESP32 USB-C (Wi-Fi/Bluetooth)** (`MLA-1727769125`), que incluye sensores `DHT11` (temp/humedad aire), `LM35` (temp suelo), módulo de agua/conductividad (humedad y detección de salitre), fotorresistencias `LDR` (cobertura de rastrojo/sombra), pantalla `LCD 16x2`, semáforo de LEDs, buzzer y potenciómetro. Documentado en [`docs/zonas-santiago-y-kit-arduino.md`](zonas-santiago-y-kit-arduino.md).
- **D-09 (Enfoque territorial — Zonas de Santiago del Estero):** En lugar de un único lote aislado o un mapa genérico, el proyecto **BioSat** abarcará toda la provincia de **Santiago del Estero** dividida en sus 4 zonas y problemáticas reales (1: Suelos salitrosos y área de riego; 2: Secano agrícola con déficit hídrico y golpes de calor; 3: Monte / Chaco semiárido y sistemas silvopastoriles; 4: Bajos inundables/salinos), con 3 estrategias de rotación comparadas para cada una en [`docs/zonas-santiago-y-kit-arduino.md`](zonas-santiago-y-kit-arduino.md).
- **D-10 (Integración de IA Profunda `CNN + RNN + Transformer` con Landsat):** Se incorpora la sugerencia de la cátedra de *Sistemas de Inteligencia Artificial* de utilizar imágenes **Landsat** de la NASA con una arquitectura híbrida (**CNN** espacial + **RNN/LSTM** secuencial + **Transformer** de atención temporal) para detectar áreas en proceso de desmonte y suelo expuesto crónico, conectando ese diagnóstico directamente con la recomendación de rotaciones regenerativas y sistemas silvopastoriles del desafío *Field Shift*.
- **D-11 (Descarga de datos reales NASA POWER para Santiago del Estero):** Se creó [`scripts/descargar_nasa_power.py`](../scripts/descargar_nasa_power.py) y se descargaron y procesaron **2.192 días reales (2020–2025)** por cada una de las 4 zonas de Santiago del Estero en [`data/nasa_power_santiago_zonas.json`](../data/nasa_power_santiago_zonas.json) y [`data/resumen_mensual_santiago.csv`](../data/resumen_mensual_santiago.csv).
- **D-12 (Hoja de ruta y coordinación multi-agente):** Se creó [`docs/plan-de-pasos-y-agentes.md`](plan-de-pasos-y-agentes.md) con los pasos 0 al 6 detallados, la separación por carpetas independientes y los contratos JSON en `data/` para poder trabajar con dos agentes en simultáneo sin conflictos de archivos.
- **D-13 (Informe profundo de hallazgos NASA en Santiago del Estero):** Se analizaron los **8.768 registros diarios** descargados (récords térmicos, rachas de sequía, diluvios en 24 h y evolución año por año 2020–2025) y se documentaron en [`docs/analisis-datos-nasa-santiago.md`](analisis-datos-nasa-santiago.md).
- **D-14 (Actualización integral de la guía de recursos oficiales + IA Landsat):** Se reescribió y amplió [`docs/recursos-desafio.md`](recursos-desafio.md) detallando qué trae cada una de las **26 páginas oficiales**, qué datos se pueden extraer de cada una, cómo se reemplazan en Santiago del Estero los 13 recursos exclusivos de EE. UU. (incluyendo la revalorización de **GEDI** para biomasa del monte chaqueño), y cómo se implementa paso a paso la arquitectura **`Landsat + CNN + RNN + Transformer`** sugerida por la profesora de Sistemas de IA.
- **D-15 (Unificación del repositorio y plan para 3 integrantes):**
  - Se incorpora el aporte de Santi: el catálogo AIZAL V4 en `data/datos_cruzados_aizal/`, [`ESTRUCTURA_DATOS.md`](../ESTRUCTURA_DATOS.md) y [`docs/documentacion-tecnica-agronomica.md`](documentacion-tecnica-agronomica.md).
  - [`PLAN.md`](../PLAN.md) pasa a ser el único plan del equipo: 3 roles, 7 frentes, ruta del 14 y 15/11 y puntos de decisión. Reemplaza a `docs/plan-de-pasos-y-agentes.md`.
  - Se crean los contratos de datos compartidos en [`docs/contratos-de-datos.md`](contratos-de-datos.md).
  - El README se actualiza solo con [`scripts/actualizar_readme.py`](../scripts/actualizar_readme.py) y GitHub Actions.
  - El prototipo se sitúa en Santiago del Estero (D-09), lo que prevalece sobre la nota de la documentación técnica que proponía EE. UU.
  - El motor de reglas usa las secciones de cultivo A/B/C/D.
- **D-16 (Correcciones científicas a los datos de clima):**
  - `EVPTRNS` de NASA POWER viene en MJ/m²/día, no en mm. Por eso el balance hídrico actual da positivo (+400 a +500 mm al año), cuando lluvia − ET0 (Hargreaves) da entre −890 y −1.020 mm.
  - 6 años (2020-2025) no alcanzan para hablar de "lo normal" ni de tendencias: se usará 1981-2025, con la normal 1991-2020.
  - Medido así, el aumento del calor extremo se confirma. En la Zona 3 hubo 17 días al año de más de 40 °C en 1991-2020 y 38 en 2021-2025; los 4 años más calurosos de la serie son 2022-2025.
  - La corrección queda como tarea del Frente 1 del [PLAN](../PLAN.md).
- **D-17 (Lectura del video del desafío):**
  - La [transcripción](transcripcion-video-desafio.md) no es el formato de entrega: es la presentación del desafío. Confirma las fechas (14 y 15/11) y resume lo que esperan en cuatro verbos: comparar rotaciones, revelar compensaciones, comprender el riesgo y hacer visible la incertidumbre.
  - Se suman al PLAN el bloque "qué ganás y qué te cuesta", el gráfico de compensaciones, el riesgo como frecuencia y las etiquetas de confianza.
  - Los expertos del desafío trabajan con fotos de astronautas desde la Estación Espacial y con aprendizaje automático. Por eso el pitch usa el zoom de escalas (50 km → 30 m → 1 m²), busca una foto de astronauta del Chaco y muestra métricas del modelo de IA.
- **D-18 (Análisis de zonas):**
  - Con la normal 1991-2020 de NASA POWER en 10 puntos ([`cruce-de-datos.md`](cruce-de-datos.md) §4), el sur (Ojo de Agua, Sumampa) resulta otra zona: 2,2 días al año de más de 40 °C contra 14-17 y 20 heladas contra 5-10.
  - Se propone separarlo como Zona 5 "Sur serrano y salinas". El oeste (Pellegrini, Jiménez) y el sureste (Selva) quedan como candidatos.
  - Se validará con un agrupamiento de embeddings AlphaEarth en Earth Engine.
- **D-19 (Visor GIS con Google Earth Engine):**
  - Se crean [`scripts/gee_visor_biosat.js`](../scripts/gee_visor_biosat.js) y [`scripts/gee_exportar_zonas.js`](../scripts/gee_exportar_zonas.js). El primero es el visor interactivo: comparación 2000 contra 2025, NDVI, suelo pelado, desmonte, relieve y zonas IA; se puede publicar como Earth Engine App. El segundo exporta estadísticas e imágenes por zona.
  - El mockup usa las mismas imágenes Landsat, bajadas de Microsoft Planetary Computer.
  - La app final mostrará imágenes exportadas desde Earth Engine, así funciona sin internet.
- **D-20 (Zona 5 operativa y revisión de la documentación):**
  - **Zona 5 en el mockup:** pasa a ser una zona completa, con clima diario real de NASA POWER 1981-2025 (calendario, simulador y riesgo), imágenes Landsat y 3 rotaciones borrador (rastrojo pastoreado, verdeo de invierno, silvopastoril con pastura tolerante al frío) que hay que validar.
  - **Documentos revisados:**
    - [`zonas-santiago-y-kit-arduino.md`](zonas-santiago-y-kit-arduino.md): Zona 3 solo norte, nueva sección Zona 5, textos del kit corregidos.
    - [`glosario.md`](glosario.md): términos nuevos y corrección de `EVPTRNS`.
    - [`analisis-datos-nasa-santiago.md`](analisis-datos-nasa-santiago.md): aviso de errores conocidos.
    - [`recursos-desafio.md`](recursos-desafio.md): unidad de `EVPTRNS` y estado de los datos.
    - [`contratos-de-datos.md`](contratos-de-datos.md): Zona 5 y la relación con la exportación de Earth Engine.
    - [`resena-desafio.md`](resena-desafio.md) y [`ESTRUCTURA_DATOS.md`](../ESTRUCTURA_DATOS.md): notas de vigencia.
    - README y PLAN.
- **D-21 (Zona 5 confirmada):**
  - El equipo confirma que BioSat trabaja con **5 zonas**. La Zona 5 "Sur serrano y salinas" (Ojo de Agua, Sumampa, Quebrachos, Choya, Guasayán) entra a la demo.
  - [`cruce-de-datos.md`](cruce-de-datos.md) se actualiza:
    - tabla oficial de las 5 zonas;
    - dos cruces nuevos: riesgo de erosión en pendientes (NASADEM × suelo pelado × tormentas) y tolerancia a heladas por especie;
    - imágenes del visor para las 5 zonas.
  - Siguen pendientes la validación de las rotaciones de la Zona 5 (Frente 4) y su inclusión en la descarga de clima (Frente 1).
