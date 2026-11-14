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
