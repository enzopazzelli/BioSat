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
- **D-22 (Equipo de 4 integrantes):**
  - El equipo queda formado por **Enzo, Santi, Vale y Sara**.
  - Reparto propuesto, a confirmar entre los cuatro:
    - **Enzo:** clima y app (F1, F5).
    - **Santi:** suelo AIZAL e IA con Landsat (F2, F3).
    - **Vale:** rotaciones y agronomía de las 5 zonas (F4).
    - **Sara:** kit Arduino y coordinación de la entrega (F6, F7).
  - Se actualizaron el [PLAN](../PLAN.md) (roles, carpetas, cronograma y frentes), el README y los contratos de datos.
- **D-23 (Trabajo en paralelo con ramas y planes individuales):**
  - **Ramas:** cada integrante trabaja en la suya: `enzo-app`, `santi-datos-ia`, `vale-rotaciones` y `sara-arduino-entrega`. Se integra a `main` con *Pull Requests* en cada hito: Hito 0 (sáb 16:30), Checkpoint 1, Checkpoint 2 y congelamiento.
  - **Planes personales:** las tareas con casillas pasan del PLAN a los planes de [`planes/`](../planes/README.md). Cada uno tilda en su archivo, sin conflictos. El README cuenta el avance por persona.
  - **Libertad de cada uno:** los planes son un punto de partida; cada integrante decide cómo abordar su parte. Lo fijo es el objetivo común, los contratos y los hitos.
  - **Archivos compartidos y decisiones:** los compartidos los edita solo Enzo en `main`. Las decisiones se anotan en cada plan y Enzo las pasa a esta bitácora.
  - **Plantillas:** se suben con todo en `null` los 4 archivos compartidos, para que la app se pueda programar desde el principio. Se suma el contrato de las imágenes del visor (`data/imagenes/`).
- **D-24 (Checkpoint 1: clima 1981-2025 y app v1 publicada):**
  - **Clima:** `scripts/descargar_nasa_power.py` baja 1981-2025 para las 5 zonas y genera `data/clima_zonas.json`. Trae normal y reciente, ET0, balance, heladas, rangos, anomalía de humedad, escenarios de temperatura y datos año por año. El contrato §1 se actualizó con este formato.
  - **App v1:** `web/` lee los JSON de `data/` y se publica en GitHub Pages: https://enzopazzelli.github.io/BioSat/web/
  - **Motor:** los puntajes salen de reglas fijas sobre los atributos y el calendario de cada rotación (la leguminosa suma solo si no es monocultivo).
  - **Datos que faltan:** mientras Vale no cargue las rotaciones, la app usa el borrador del equipo y lo avisa. Las imágenes del visor salen de Planetary Computer hasta que Santi exporte las de Earth Engine.
  - **Sin internet:** Leaflet y las imágenes van dentro de `web/`. La caché cruda de NASA POWER no se sube al repo.
- **D-25 (Propuesta de la profesora: zonificación AIZAL y modelo predictivo de desmontes):**
  - La profesora de Sistemas de IA propone zonificar la provincia en 5 zonas con las variables de clima y suelo de AIZAL, y hacer un modelo predictivo de desmontes por zona. Santi está de acuerdo.
  - **Zonificación:** k-means sobre clima (B03-B08) y suelo (B09-B18) estandarizados, comparado con las 5 zonas de BioSat → `data/zonificacion_aizal.json`.
  - **Historia de desmontes:** el mapa que menciona (desde 1976) es casi seguro la base del LART (FAUBA-INTA), publicada en monitoreodesmonte.com.ar, que hoy da error de base de datos. Mientras tanto se usa MapBiomas Chaco (1985-2023) o Hansen (2001-2023).
  - **Modelo:** regresión logística, random forest y un modelo temporal (LSTM o Transformer), con validación temporal (entrena hasta 2015, prueba 2016-2023) → `data/desmonte_zonas.json`. Base en `scripts/gee_zonas_y_desmonte.js`.
  - **Qué queda fuera:** la CNN sobre parches de Landsat. Los meses de suelo pelado se calculan con el método de umbral.
  - **Cómo se lo contamos a la profesora:** se le manda un audio con este enfoque y el documento de validación actualizado.
- **D-26 (Informe de clima corregido y app lista para los datos de D-25):**
  - **Informe:** `docs/analisis-datos-nasa-santiago.md` se regeneró con un script desde `data/clima_zonas.json` (1981-2025, las 5 zonas). Se borraron el JSON viejo (2020-2025, con errores) y sus descargas crudas.
  - **App:** suma el panel "presión de desmonte en tu zona", con nivel relativo entre zonas, serie anual y métricas. También el grupo AIZAL en la ficha de la zona y la capa de zonas AIZAL en el visor.
  - **Arduino:** la conexión queda lista con la interfaz `window.BioSatArduino` (contratos §6).
  - **Pruebas:** la app funciona en celular (390 px, sin desbordes) y sin internet.
- **D-27 (Pantalla del kit para el jurado, guía "Del kit al campo" y Arduino Uno por USB):**
  - **Pantalla del kit:** `web/kit.html?zona=` muestra las 3 bandejas en grande, para la mesa del jurado. Se elige la bandeja con A, B o C (o con los botones) y la lectura se guarda sola cuando se estabiliza (menos de 0,3 °C en 5 lecturas). Sin Arduino usa las lecturas grabadas y lo avisa; sin grabadas dice "sin lectura". Cierra con la diferencia entre suelo pelado y cubierto frente al aire que ve NASA POWER.
  - **Guía:** `web/campo.html` cuenta en una pantalla cómo se lleva el kit a un campo: 3 a 6 estaciones fijas, un receptor LoRa en el casco y la app. Los costos van marcados "a confirmar".
  - **Hardware de la demo:** Arduino Uno por USB con Web Serial (Chrome o Edge). El ESP32 con LoRa queda para las estaciones de campo.
  - **Para Sara:** calentar las bandejas con una lámpara antes de la demo, así se ve la diferencia. El umbral de salitre va en `meta.umbrales` (contratos §6).
  - **Diseños:** `docs/superpowers/specs/2026-11-14-visor-kit-jurado-design.md` y `docs/superpowers/specs/2026-11-14-guia-del-kit-al-campo-design.md`.
- **D-28 (Sugerencias de la organización: asistente de inicio, mapa real y app más fácil):**
  - **Qué pidieron:** una persona de la organización de la NASA Space Apps vio la app y sugirió un botón de idioma EN/ES, que el Paso 1 se entienda mejor y simule un mapa de Santiago del Estero, pensado para gente grande, y que toda la app sea más fácil y amena.
  - **Asistente de inicio:** 4 preguntas, una por pantalla y con letra y botones grandes (dónde queda tu campo, qué tenés, qué te preocupa y un resumen). Aparece solo la primera vez, se puede saltar y se reabre con "Cambiar mis respuestas" o con `?asistente=1`. Las respuestas se guardan en el navegador y, si no se puede guardar, todo sigue andando.
  - **Mapa real:** el contorno de Santiago del Estero con sus 27 departamentos (IGN, vía geoBoundaries, CC BY 3.0 IGO), pintados por zona, con botones grandes por pueblo. Las zonas se dibujan por departamento, en forma aproximada, y el mapa lo dice. Contrato §9.
  - **Corrección de datos:** el departamento *General Taboada*, donde queda Añatuya, figuraba en la Zona 2 y pasa a la Zona 4; *Quebrachos* queda solo en la Zona 5.
  - **App más fácil:** una frase simple al comienzo de los pasos 2 y 3, calculada con los datos; suelo, satélite y desmonte dentro de un "Ver el detalle técnico" plegado; letra base de 17 px. El panel del sensor se deja a la vista porque es lo que se muestra en la demo.
  - **Idioma EN/ES:** queda para la etapa siguiente, con su propio diseño. Los textos nuevos ya viven en objetos con claves para poder traducirlos.
  - **Diseño y plan:** `docs/superpowers/specs/2026-11-14-asistente-y-mapa-design.md` y `docs/superpowers/plans/2026-11-14-asistente-y-mapa.md`.
- **D-29 (Contraseña de Meteomatics: se deja como está, por practicidad):**
  - **Situación:** la clave de la cuenta de Meteomatics del hackathon entró en el código con el PR #5 (commit `6488ad7`) y salió en `ce7f282`. Desde entonces el script la lee de `METEOMATICS_PASSWORD`, pero la clave vieja sigue en el historial público de Git.
  - **Decisión (Enzo):** no se cambia la contraseña. Es una decisión de practicidad: es la cuenta del hackathon, Meteomatics no entra en la app y cambiarla no suma nada a la demo. Deja de figurar como urgente.
  - **Si cambia algo:** si se viera un uso indebido de la cuenta, se cambia la clave en el sitio de Meteomatics en ese momento.
- **D-30 (Datos reales de Earth Engine reemplazan al prototipo simulado):**
  - **Qué se encontró:** en el repaso del 14/11 apareció que el modelo de desmontes, la historia de desmontes, el riesgo por zona, el suelo y la zonificación de `main` salían de un prototipo con **datos simulados** (`np.random` y valores escritos a mano), y que las imágenes "de Earth Engine" eran copias de las de Planetary Computer.
  - **Decisión (Enzo):** rehacer todo con datos reales, con lo que más confianza dé y simulando lo menos posible. Se usa Google Earth Engine desde Python, con el proyecto de Enzo (nivel Comunidad, no comercial).
  - **Qué cambia:**
    - El pipeline vive en `ia_desmonte/`.
    - El prototipo pasa a `archivo/prototipo-ia-simulado/`, con un aviso.
    - **Fuentes:** Hansen v1.13 (desmontes 2001-2025), SoilGrids 2.0, TerraClimate, Landsat 2021-2025, ESA WorldCover, GRIP4, WDPA, WorldPop y NASADEM.
    - **Validación del modelo:** entrena con el monte de 2008 y se prueba con el desmonte 2016-2025.
    - Cada número lleva su fuente, su método y su confianza (alta, media o baja).
  - **Las métricas cambian:** las del prototipo (AUC 0,986) no eran reales. Las nuevas son más bajas y defendibles. Están en `docs/datos-y-metodos.md`, que se genera solo a partir de los JSON. Antes de grabar el pitch, Santi y Sara tienen que usar estas.
  - **Hallazgos de la corrida:**
    - En Earth Engine, el nitrógeno de SoilGrids viene en mg/kg (se verificó contra la API de ISRIC).
    - GRIP4 está en `GRIP4/Central-South-America`.
    - La zonificación real da una silueta más baja que la del prototipo, y el JSON lo dice.
  - **Resultados principales:**
    - Random forest elegido por validación cruzada (AUC 0,78); en la prueba 2016-2025 da 0,63, con una tasa base del 9 %.
    - La caída entre las dos cifras se explica como hipótesis (Ley de Bosques), no como hecho. Para probarla hay un plan listo para que lo ejecute alguien más adelante: `docs/superpowers/plans/2026-11-15-validacion-ley-de-bosques.md` (entrenar dentro del régimen de la ley, 2012 → 2017, y sumar la categoría del OTBN como predictor).
    - Las etiquetas de Hansen se leen a 30 m: a 250 m el promedio inflaba la tasa de desmonte al 23 %.
  - **Diseño y plan:** `docs/superpowers/specs/2026-11-14-datos-reales-design.md` y `docs/superpowers/plans/2026-11-14-datos-reales.md`.
- **D-31 (App para el celular: Inicio simple y Reporte completo):**
  - **Por qué:** a Enzo le dijeron que la web mostraba demasiados datos juntos y podía confundir. Sara consultó a una productora: en los primeros 30 segundos tiene que ver un semáforo, qué le conviene sembrar y un botón para medir con la sonda. Val sumó que primero hay que configurar el campo, con el asistente.
  - **Qué se hizo:**
    - **Inicio** (`web/index.html`): banda del semáforo con ícono y palabra (BIEN, ATENCIÓN o CUIDADO), una razón y una acción; "Lo que mejor encaja" (la primera del motor, nunca "Sembrá X") con la próxima siembra, los meses de suelo pelado ("2 → 0") y la tira de 12 meses; y la barra fija con Medir con la sonda y WhatsApp.
    - **Reporte** (`#reporte`): una página con 7 secciones abiertas, cada una con un título que es su conclusión y un plegable "Para tu ingeniero"; Guardar PDF (imprime solo el Reporte) y Compartir.
    - **Vista detallada:** la página de antes se conserva con su diseño en `web/completo.html`, a pedido de Enzo, como otra forma de ver el reporte completo.
    - **Asistente:** la pregunta 1 nombra la característica de la zona ("Área de riego del Río Dulce") y abajo sus localidades; antes mostraba una ciudad como si fuera toda la zona. Con `?asistente=0` no se abre solo (para links de demo y capturas).
  - **Semáforo:**
    - **Antes de medir**, muestra lo típico de la zona en el mes actual (clima 2021-2025 y lotes pelados de Landsat). Hay 4 señales y gana la peor:

      | Señal | Atención | Cuidado |
      |---|---|---|
      | Falta de agua | 50 a 100 mm | más de 100 mm |
      | Días de más de 35 °C | 5 a 10 | más de 10 |
      | Días con helada | 2 a 5 | más de 5 |
      | Lotes con suelo pelado | 25 % a 50 % | 50 % o más |

    - **Después de medir**, manda la lectura de la sonda ("Tu lote, medido hoy").
    - **Los umbrales son un criterio del equipo**, no una norma agronómica, y la app lo dice.
  - **Hallazgos al revisar:**
    - Con las prioridades por defecto, en la Zona 5 el motor pone primera la rotación actual, y la app lo dice así.
    - Había textos viejos (suelo "AIZAL V4", "pendiente", "borrador") que se corrigieron en las dos páginas, con una prueba que los vigila.
    - La revisión a 390 px se hace con `scripts/captura-movil.mjs`, que emula un celular, porque Chrome sin ventana no baja de 500 px.
  - **Diseño, maquetas y plan:**
    - `docs/superpowers/specs/2026-11-15-app-celular-y-reporte-design.md`;
    - https://claude.ai/artifact/2JyKEp1U46KhQXMCiM2ZSz;
    - `docs/superpowers/plans/2026-11-15-app-celular-y-reporte.md`.
