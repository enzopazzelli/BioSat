# BioSat — Field Shift: Adapting Farms with NASA Data

> **NASA Space Apps Challenge 2026** · Desafío: *Field Shift: Adapting Farms with NASA Data*
> Sede: **Santiago del Estero, Argentina** · Equipo: **BioSat**

---

## En pocas palabras

**Qué vamos a hacer:** una app web que ayuda a un productor de **Santiago del Estero** a elegir una **rotación de cultivos** que cuide su suelo y aguante el calor extremo, la sequía y el salitre.

**En qué consiste:** el productor elige su zona y lo que le importa (agua, salitre, suelo, forraje, ingreso). La app le muestra:
- **El calendario de su lote:** cuándo hace demasiado calor, cuándo hiela, cuándo falta agua y cuándo el suelo queda pelado.
- **3 rotaciones comparadas:** su rotación actual y 2 alternativas. Cada una explica por qué se sugiere, qué evidencia la respalda, qué beneficios tiene, qué falta saber y qué riesgos debe revisar un agrónomo local.
- **Un simulador:** "¿y si llueve menos o hace más calor?".

En la demo, un **kit Arduino con 3 bandejas de suelo** mide en vivo lo que el satélite no ve de cerca.

**Qué consume:**

| Entrada | Fuente | Para qué |
|---|---|---|
| Clima diario 1981-2025 | NASA POWER (API abierta) | Calor, heladas, lluvia y balance de agua por zona |
| Imágenes de 30 m | Landsat 5/7/8/9 (NASA/USGS) | Meses de suelo pelado y visor del lote |
| Historia de desmontes | LART desde 1976 (si se consigue) · MapBiomas Chaco · Hansen | Etiquetas del modelo predictivo de desmontes |
| Suelo y paisaje (38 variables, 500 m) | AIZAL V4 (SoilGrids, TerraClimate, OSM) | pH, textura, carbono, nitrógeno, distancias; zonificación y predictores del desmonte |
| Pronóstico a 7-10 días | Meteomatics (ECMWF, cuenta del hackathon) | Alertas de helada y lluvia próximas (en integración) |
| Sensores en tierra | Kit Arduino (suelo, humedad/conductividad, luz, aire) | Comparar satélite y suelo |
| El productor | Entrevista y formulario de la app | Rotación actual, prioridades y límites (riego, maquinaria, mercado) |

**Cómo funciona, técnicamente:**
1. **Datos:** scripts en Python bajan y resumen cada fuente en archivos JSON por zona (`data/`, ver [contratos](docs/contratos-de-datos.md)).
2. **IA:** con las variables de AIZAL se **zonifica la provincia** (k-means) y se entrena un **modelo predictivo de desmontes por zona**. Se comparan una regresión logística, un random forest y un modelo temporal (LSTM o Transformer), validados con años que el modelo no vio. Los meses de suelo pelado salen de Landsat con un método simple.
3. **Motor de reglas transparente:** usa secciones de cultivo (A gramíneas, B leguminosas, C raíces profundas, D coberturas) y las prioridades del productor para ordenar las rotaciones **y explicar por qué**.
4. **App web estática** (HTML + JavaScript): se publica en GitHub Pages, funciona sin internet y lee el Arduino por Web Serial.

**Por qué es diferente y qué aporta:**
- **Hecha para un lugar real:** está pensada para las 5 zonas de Santiago del Estero, con las rotaciones de la Zona 5 revisadas por un productor de la zona (las otras cuatro, todavía sin validar). No es un mapa genérico "para cualquier punto del mundo".
- **Espacio + tierra:** une los datos satelitales de la NASA con mediciones en el suelo, en vivo.
- **IA que se puede medir:** no da por buena la IA; la compara contra un método simple y muestra los números.
- **Suelo del Gran Chaco:** usa datos locales de suelo (AIZAL), que fuera de EE. UU. casi nadie tiene a mano.
- **Honesta:** cada dato muestra su fuente y su incertidumbre, los dilemas quedan a la vista (por ejemplo, una cobertura protege el suelo pero gasta agua) y la herramienta **apoya, no reemplaza** al productor ni al agrónomo.

---

## Estado del proyecto

Avance de cada integrante, contado desde las casillas de su plan en [`planes/`](planes/README.md). Se actualiza cuando cada uno integra su rama a `main`. **Panorama completo, con lo que falta y los riesgos: [docs/estado-del-proyecto.md](docs/estado-del-proyecto.md).**

<!-- AUTO:AVANCE:INICIO -->
| Persona | Rama | Avance | Tareas |
|---|---|---|---|
| [Enzo · Integración y app](planes/1-enzo.md) | `enzo-app` | `▓▓▓▓▓▓▓▓░░` 85% | 44/52 |
| [Santi · Suelo, satélite e IA](planes/2-santi.md) | `santi-datos-ia` | `▓▓▓▓▓▓▓▓░░` 76% | 22/29 |
| [Vale · Campo y agronomía](planes/3-vale.md) | `vale-rotaciones` | `▓▓▓▓▓▓▓░░░` 74% | 17/23 |
| [Sara · Kit Arduino y relato](planes/4-sara.md) | `sara-arduino-entrega` | `▓▓░░░░░░░░` 20% | 5/25 |
| **Total** | | `▓▓▓▓▓▓▓░░░` **68%** | **88/129** |
<!-- AUTO:AVANCE:FIN -->

### Lo más urgente

1. **Kit Arduino: está programado, falta armarlo y probarlo.** El sketch, el lector Web Serial, el esquema y la [guía de armado en protoboard](arduino/GUIA-PROTOBOARD.md) están en [`arduino/`](arduino/README.md) (Enzo se hizo cargo; D-32: el kit para principiantes alcanza). Falta armar el kit, sellar el LM35, calibrar y grabar lecturas reales. **La entrega** (guion, video y página del proyecto) sigue sin empezar: congelamiento hoy a las 15:00, entrega a las 19:00.
2. **La app muestra cosas que no son ciertas (D-33). Para quien lo tome antes de las 15:00 (Vale preguntó).**
   - **El problema:** el semáforo y la sección 4 dicen "suelo pelado", pero el satélite (NDVI < 0,25) no lo distingue del rastrojo ni del pasto seco. Además, el número depende mucho del umbral: en la Zona 2, en noviembre, da 11 %, 84 % o 92 % de lotes con NDVI 0,20, 0,25 o 0,30. También hay otras cosas falsas:
     - la tabla de métodos muestra "CNN + LSTM" y "CNN + Transformer", que nunca se corrieron;
     - hay textos que nombran MapBiomas y LART, que no se usan;
     - los grupos AIZAL no tienen nombre.
   - **Formas de arreglarlo:**
     1. Llamarlo por lo que mide, "lotes sin verde (pelados o con rastrojo seco)". **Es la recomendada:** unos 45 min.
     2. Mostrar la duda, con el rango de los 3 umbrales.
     3. Sacar el suelo pelado del semáforo.

     Con cualquiera, se corrigen la tabla y los textos y se ponen nombres a los grupos (Santi o Vale los confirman).
   - **Plan con los pasos y los lugares exactos del código:** [`docs/superpowers/plans/2026-11-15-app-sin-datos-falsos.md`](docs/superpowers/plans/2026-11-15-app-sin-datos-falsos.md).
3. **Datos reales de Earth Engine (D-30):** suelo, desmontes, zonificación, suelo pelado e imágenes ahora salen de fuentes reales (`ia_desmonte/`). **Las métricas del pitch cambian:** usar solo las de [`docs/datos-y-metodos.md`](docs/datos-y-metodos.md). El visor de Earth Engine sigue sin publicar.
4. **Vale: confirmar `requiere_hacienda` y el permiso del productor.** Enzo completó 7 valores según el texto de cada rotación, y la entrevista deja pendiente el permiso por escrito para usar sus frases.
5. **Enzo: probar el lector con el Arduino real, ensayar la pantalla del kit en la pantalla grande y probar la app nueva sin internet en el celular.**
   - La app para el celular (D-31) ya está en `main` y se probó en un celular de verdad.
   - Con D-34, el Inicio va en dos columnas en la PC y el pronóstico de Meteomatics entra en la app. Se renueva solo todos los días a las 06:00; el secreto ya está cargado.
   - Con D-35, el botón `ES | EN` pasa a inglés el asistente, el Inicio, el marco del Reporte, el kit y la guía del campo. Para mandarle la app a un jurado: `https://enzopazzelli.github.io/BioSat/web/?lang=en`. Lo que sigue en español (el cuerpo del Reporte y la vista detallada) lo avisa en inglés.

### Lo que falta, por persona

Sale solo de las casillas sin tildar de cada plan. Panorama completo y riesgos: [docs/estado-del-proyecto.md](docs/estado-del-proyecto.md).

<!-- AUTO:PENDIENTE:INICIO -->
<details>
<summary><b>Enzo</b>: 8 pendientes (<a href="planes/1-enzo.md">plan completo</a>)</summary>

- Último merge de funciones a `main` _(Congelamiento)_
- Revisar el README final con Sara _(Entrega)_
- Dejar `main` estable con la app publicada _(Entrega)_
- Idioma, etapa 2: el cuerpo del Reporte (textos dentro de `app.js`), los plegables, la vista detallada y los textos largos de las rotaciones (con la revisión de Vale) _(Sugerencias de la organización)_
- Mostrar en la app y en el README el link del visor de Earth Engine cuando Santi lo publique _(Agregadas por Enzo)_
- Ensayar `web/kit.html` y `web/campo.html` en la pantalla grande de la demo, con el kit conectado _(Agregadas por Enzo)_
- Cerrar `PLAN.md`: sumar kit y guía en la sección 1 y contestar las preguntas abiertas _(Agregadas por Enzo)_
- Probar de nuevo la app publicada en el celular y sin internet después del último merge _(Agregadas por Enzo)_

</details>

<details>
<summary><b>Santi</b>: 7 pendientes (<a href="planes/2-santi.md">plan completo</a>)</summary>

- Correr `scripts/gee_visor_biosat.js`, publicarlo como Earth Engine App y pasarles el link a Enzo y a Sara _(Checkpoint 1)_
- Sumar lo que responda la profesora al audio y al documento _(Congelamiento)_
- Pasarle a Sara las métricas, el mapa de riesgo, una captura del visor y la comparación 2000 contra 2025 _(Congelamiento)_
- Opcional: usar los embeddings AlphaEarth como variable extra del modelo o de la zonificación _(Congelamiento)_
- Ayudar con el video y la página: explicar el modelo en 20 segundos _(Entrega)_
- En `scripts/descargar_meteomatics.py`, cambiar `wind_speed_10m:ms` (instantáneo, a las 21 h de Argentina) por `wind_speed_mean_10m_24h:ms`, el promedio del día. Sin eso, la tarjeta de la... _(Agregadas por Enzo)_
- Confirmar con la documentación o el soporte de Meteomatics si `frost_warning_24h:idx` mira las 24 h anteriores o las siguientes. Hoy la app la cuenta como de las 24 h anteriores, como los... _(Agregadas por Enzo)_

</details>

<details>
<summary><b>Vale</b>: 6 pendientes (<a href="planes/3-vale.md">plan completo</a>)</summary>

- Revisar la parte agronómica del guion y participar del ensayo _(Entrega)_
- Confirmar los 7 `requiere_hacienda` que completó Enzo en `data/rotaciones_santiago.json` (Zona 3 las 3, Zona 4 alternativa 2, Zona 5 las 3) _(Agregadas por Enzo)_
- Conseguir por escrito el permiso del productor para nombrar el campo y usar sus frases (la entrevista lo deja pendiente) _(Agregadas por Enzo)_
- Validar las zonas 1 a 4 con un productor o un agrónomo del INTA, o dejarlas "sin validar" a propósito y decirlo en la presentación _(Agregadas por Enzo)_
- Corregir en la evidencia de la Zona 5 el dato que cita humedad en raíces: hoy apunta a los meses de clima, que no tienen ese campo _(Agregadas por Enzo)_
- Revisar los 15 nombres de las rotaciones en inglés (`web/textos-en.js`, sección `rotaciones`, D-35): los tradujo el equipo y falta tu revisión agronómica _(Agregadas por Enzo)_

</details>

<details>
<summary><b>Sara</b>: 20 pendientes (<a href="planes/4-sara.md">plan completo</a>)</summary>

- Pasarte a tu rama (`git switch sara-arduino-entrega`) _(Hito 0)_
- Confirmar la hora exacta y el formato de la entrega en la guía del participante (desde el celular, porque en la PC falla el sitio) y avisar al grupo _(Hito 0)_
- Armar las 3 bandejas: pelada y seca, salitrosa y con rastrojo _(Checkpoint 1)_
- Calibrar los umbrales con las bandejas reales _(Checkpoint 1)_
- Guion borrador de 2-3 minutos con el zoom de escalas del video de la NASA (50 km → 500 m → 30 m → 1 m² → el productor) y los 4 verbos _(Checkpoint 1)_
- Grabar lecturas reales de las 3 bandejas en `data/arduino_bandejas_demo.json` _(Checkpoint 2)_
- Buscar una foto de astronauta del Chaco santiagueño (eol.jsc.nasa.gov) _(Checkpoint 2)_
- Preparar la comparación 2000 contra 2025 de Campo Gallo (desmonte) para el pitch _(Checkpoint 2)_
- Video o diapositivas, según el formato que pidan _(Congelamiento)_
- Borrador de la página del proyecto en Space Apps: resumen, datos de la NASA usados, links al repo y a la app _(Congelamiento)_
- Declarar el uso de herramientas de IA, si la guía lo pide _(Congelamiento)_
- Revisar las reglas de uso de marcas (logos de la NASA) _(Congelamiento)_
- Hacer 2 ensayos completos de la demo con todo el equipo _(Entrega)_
- Revisar el README final con Enzo _(Entrega)_
- Subir la entrega con margen antes del cierre _(Entrega)_
- Armar el kit con el esquema de `arduino/esquema/`: sellar el LM35, conectar el LCD en paralelo y comprobar 5 V y GND antes de enchufar _(Armado y prueba del kit)_
- Probar el sketch en la placa con todos los sensores y verificar que la pantalla del kit lo lee (cerrar antes el Monitor serie del IDE) _(Armado y prueba del kit)_
- Calibrar el LM35 con 2 temperaturas y el umbral de salitre con las bandejas A, B y C (pasos en `arduino/README.md`) _(Armado y prueba del kit)_
- Crear la carpeta `entrega/` con el guion, el video o las diapositivas y la página del proyecto _(Agregadas por Enzo)_
- Decidir el plan B del kit: si las bandejas no llegan, grabar lecturas reales en `data/arduino_bandejas_demo.json` y marcarlas como grabadas _(Agregadas por Enzo)_

</details>
<!-- AUTO:PENDIENTE:FIN -->

**Últimas decisiones:**

<!-- AUTO:DECISIONES:INICIO -->
- **D-35**: Botón de idioma ES/EN, etapa 1: lo que se ve primero, en inglés
- **D-34**: Inicio en la PC y el pronóstico de Meteomatics entra en la app
- **D-33**: Hallazgo: la app muestra cosas que no son ciertas; plan para corregirlas antes de la demo
- **D-32**: El kit para principiantes alcanza para la estación de BioSat: guía de protoboard
- **D-31**: App para el celular: Inicio simple y Reporte completo
- **D-30**: Datos reales de Earth Engine reemplazan al prototipo simulado

Todas las decisiones están en la [bitácora](docs/reglas-y-bitacora.md).
<!-- AUTO:DECISIONES:FIN -->

---

## Equipo

| # | Quién | Rol | Frentes | Rama | Plan |
|---|---|---|---|---|---|
| 1 | Enzo | Integración y app | F1 Clima · F5 App y motor | `enzo-app` | [planes/1-enzo.md](planes/1-enzo.md) |
| 2 | Santi | Suelo, satélite e IA | F2 Suelo y zonificación AIZAL · F3 Modelo de desmontes | `santi-datos-ia` | [planes/2-santi.md](planes/2-santi.md) |
| 3 | Vale | Campo y agronomía | F4 Rotaciones | `vale-rotaciones` | [planes/3-vale.md](planes/3-vale.md) |
| 4 | Sara | Kit Arduino y relato | F6 Arduino · F7 Entrega (coordina) | `sara-arduino-entrega` | [planes/4-sara.md](planes/4-sara.md) |

Cómo trabajamos en paralelo (ramas, reglas e hitos de integración): **[planes/README.md](planes/README.md)**.

El detalle de tareas, la ruta de trabajo y los diagramas están en **[PLAN.md](PLAN.md)**.

---

## Estructura del repositorio

<!-- AUTO:ESTRUCTURA:INICIO -->
```text
BioSat/
├── CONTEXTO.md                                               <-- Contexto inicial del 13/11 (histórico)
├── ESTRUCTURA_DATOS.md                                       <-- Arquitectura de datos y módulos AIZAL
├── NASA Space Apps Challenge - awards.mhtml                  <-- Premios globales y datos del equipo
├── NASA Space Apps Challenge.mhtml                           <-- Recursos oficiales (pestaña Resources)
├── NASA Space Apps Challenge.pdf                             <-- Enunciado oficial (pestaña Details)
├── PLAN.md                                                   <-- Plan de trabajo: roles, ruta y tareas
├── README.md                                                 <-- Portada del proyecto (se actualiza sola)
├── archivo/                                                  <-- Material archivado que no alimenta la app
│   └── prototipo-ia-simulado/ (38 archivos)                  <-- Primer prototipo de IA con datos SIMULADOS (no se usa; ver LEEME-PRIMERO.md)
├── arduino/                                                  <-- Kit Arduino: sketch, lector Web Serial, esquema y guía de armado
│   ├── GUIA-PROTOBOARD.md                                    <-- Guía de armado en protoboard · Estación de campo BioSat
│   ├── lector-web-serial.js                                  <-- Lee el Arduino por USB desde Chrome o Edge (window.BioSatArduino)
│   ├── README.md                                             <-- Guía del kit: cómo armarlo, cargarlo, calibrarlo y usarlo con la app
│   ├── biosat_estacion_campo/                                <-- Sketch del Arduino Uno (línea JSON cada 2 s, LCD y LEDs)
│   │   └── biosat_estacion_campo.ino
│   └── esquema/                                              <-- Esquema de conexiones: pines.json es la fuente; el resto se genera
│       ├── componentes-disponibles.webp                      <-- Las piezas que tiene el equipo
│       ├── concepto-original.jpeg                            <-- Imagen del plan inicial (con LCD I2C; no es la que se arma)
│       ├── esquema-conexiones.svg                            <-- Esquema de conexiones (generado)
│       ├── generar-esquema.js                                <-- Regenera el esquema SVG y la tabla desde pines.json
│       ├── pines.json                                        <-- Fuente única de los pines y cables del kit
│       └── tabla-de-conexiones.md                            <-- Tabla de cables por pin y por componente (generada)
├── data/                                                     <-- Datos y contratos JSON que lee la app
│   ├── arduino_bandejas_demo.json                            <-- Lecturas grabadas del kit (Sara) · plantilla vacía
│   ├── clima_zonas.json                                      <-- Clima NASA POWER 1981-2025 de las 5 zonas (lo lee la app)
│   ├── desmonte_zonas.json                                   <-- Desmontes Hansen 2001-2025, modelo validado en el tiempo y riesgo por zona · real
│   ├── diagnostico_landsat_ia.json                           <-- Meses de suelo pelado con Landsat 2021-2025 y fragilidad (Earth Engine) · real
│   ├── meteomatics_santiago_zonas.json                       <-- Pronóstico de 7 días de Meteomatics por zona (Santi) · lo lee la app y se renueva todos los días (D-34)
│   ├── resumen_mensual_santiago.csv                          <-- Normal 1991-2020 por mes y zona, para planilla
│   ├── rotaciones_santiago.json                              <-- 15 rotaciones de las 5 zonas (Vale) · Zona 5 validada por un productor, el resto sin validar
│   ├── santiago_mapa.json                                    <-- Mapa de Santiago del Estero: 27 departamentos pintados por zona (IGN, vía geoBoundaries)
│   ├── suelo_zonas.json                                      <-- Suelo por zona: SoilGrids 0-30 cm sobre tierra agropecuaria (Earth Engine) · real
│   ├── zonificacion_aizal.json                               <-- Zonificación k-means sobre TerraClimate y SoilGrids, 5 grupos (Earth Engine) · real
│   ├── datos_cruzados_aizal/                                 <-- Catálogo AIZAL V4: 38 variables de suelo, clima y paisaje
│   │   ├── CATALOGO_MAESTRO_VARIABLES.md                     <-- Índice de módulos y reglas que disparan
│   │   ├── 01_Clima_y_Balance_Hidrico/ (2 archivos)          <-- B01-B08: agua, lluvia, sequía, temperatura
│   │   ├── 02_Vegetacion_Fenologia_y_Paisaje/ (2 archivos)   <-- B19-B23, B30-B31: paisaje, NDVI, monte
│   │   ├── 03_Quimica_Nutricion_Suelo/ (2 archivos)          <-- B09, B11, B13-B16: nitrógeno, pH, carbono
│   │   ├── 04_Fisica_Suelo_y_Topografia/ (2 archivos)        <-- B10, B12, B17-B18, B24-B25: textura, relieve
│   │   ├── 05_Logistica_Antropico_y_Servicios/ (2 archivos)  <-- B26-B29, B32-B37: caminos, población
│   │   └── 06_Embeddings_IA_AlphaEarth/ (2 archivos)         <-- Embeddings AlphaEarth 64D (DeepMind)
│   └── imagenes/ (23 archivos)                               <-- Compuestos de mediana Landsat del visor y mapa de la zonificación (Earth Engine)
├── docs/ (35 archivos)                                       <-- Documentación del equipo
├── ia_desmonte/                                              <-- Pipeline de datos reales con Earth Engine: suelo, desmontes, zonificación, suelo pelado e imágenes
│   ├── __init__.py
│   ├── comun.py
│   ├── correr_todo.py
│   ├── desmonte.py
│   ├── imagenes.py
│   ├── informe.py
│   ├── proyeccion.py
│   ├── README.md                                             <-- iadesmonte/ · Datos reales de suelo, desmonte, zonificaci...
│   ├── suelo.py
│   ├── suelo_pelado.py
│   ├── zonas.py
│   ├── zonificacion.py
│   ├── pruebas/                                              <-- Pruebas de Python del pipeline (pytest)
│   │   ├── __init__.py
│   │   ├── test_comun.py
│   │   ├── test_desmonte.py
│   │   ├── test_informe.py
│   │   ├── test_proyeccion.py
│   │   ├── test_suelo.py
│   │   ├── test_suelo_pelado.py
│   │   ├── test_zonas.py
│   │   └── test_zonificacion.py
│   └── salidas/ (12 archivos)                                <-- Muestras de Earth Engine y registro de la corrida (permiten reentrenar sin cuenta)
├── planes/                                                   <-- Plan de cada integrante y cómo trabajamos en ramas
│   ├── 1-enzo.md                                             <-- Plan de Enzo · integración y app (rama enzo-app)
│   ├── 2-santi.md                                            <-- Plan de Santi · suelo, satélite e IA (rama santi-datos-ia)
│   ├── 3-vale.md                                             <-- Plan de Vale · campo y agronomía (rama vale-rotaciones)
│   ├── 4-sara.md                                             <-- Plan de Sara · Arduino y relato (rama sara-arduino-entrega)
│   └── README.md                                             <-- Objetivo común, ramas, reglas e hitos de integración
├── scripts/                                                  <-- Herramientas para bajar y procesar datos
│   ├── actualizar_readme.py                                  <-- Regenera las secciones automáticas del README
│   ├── captura-movil.mjs                                     <-- Captura la app emulando un celular de 390 px, u otro ancho con ANCHO (Chrome)
│   ├── descargar_meteomatics.py                              <-- Descarga el pronóstico de Meteomatics por zona; no pisa el archivo si falla una zona
│   ├── descargar_nasa_power.py                               <-- Descarga y resume NASA POWER por zona
│   ├── earth_engine_embeddings.js                            <-- Ejemplo GEE de embeddings (falta adaptar a SdE)
│   ├── gee_exportar_zonas.js                                 <-- Earth Engine: estadísticas e imágenes por zona para la app
│   ├── gee_visor_biosat.js                                   <-- Visor GIS en Earth Engine: 2000 vs 2025, NDVI, desmonte, zonas IA
│   ├── gee_zonas_y_desmonte.js                               <-- Earth Engine: zonificación AIZAL y modelo predictivo de desmontes
│   ├── generar_mapa_santiago.py                              <-- Genera data/santiago_mapa.json desde geoBoundaries
│   └── pruebas/                                              <-- Pruebas de Python de los scripts (pytest, sin internet)
│       └── test_descargar_meteomatics.py
├── tests/                                                    <-- Pruebas de Node (node --test tests/*.test.js)
│   ├── arduino-pines.test.js
│   ├── asistente-logica.test.js
│   ├── datos-contratos.test.js                               <-- Prueba la forma de los datos reales de ia_desmonte/
│   ├── frases-logica.test.js
│   ├── idioma-logica.test.js                                 <-- Prueba la lógica del idioma: solo español e inglés (D-35)
│   ├── inicio-logica.test.js                                 <-- Prueba el semáforo, la próxima siembra y el WhatsApp del Inicio
│   ├── kit-logica.test.js
│   ├── lector-serial.test.js
│   ├── mapa-santiago.test.js
│   ├── pronostico-logica.test.js                             <-- Prueba el resumen y el vencimiento del pronóstico de Meteomatics
│   ├── textos-en.test.js                                     <-- Prueba que el inglés no tenga huecos ni claves sobrantes (D-35)
│   └── vistas.test.js                                        <-- Prueba las vistas Inicio, Reporte y la vista detallada (completo.html)
└── web/ (44 archivos)                                        <-- App web BioSat (abrir con un servidor: ver Inicio rápido)
```
<!-- AUTO:ESTRUCTURA:FIN -->

---

## Inicio rápido

**Ver la app publicada:** https://enzopazzelli.github.io/BioSat/web/

- **Pantalla del kit** (mesa del jurado, teclas A, B y C): https://enzopazzelli.github.io/BioSat/web/kit.html
- **Guía "Del kit al campo":** https://enzopazzelli.github.io/BioSat/web/campo.html
- **Reporte completo:** https://enzopazzelli.github.io/BioSat/web/#reporte · **Vista detallada** (la página de antes): https://enzopazzelli.github.io/BioSat/web/completo.html
- **Saltear el asistente** (para links de demo): agregar `?asistente=0` a la dirección.

**Pruebas** (Node 22): `node --test tests/*.test.js` · **Ver la app como en un celular de 390 px** (con la app servida): `node scripts/captura-movil.mjs "http://localhost:8000/web/" inicio.png`

**Bajar y resumir el clima de NASA POWER** (no necesita cuenta; genera `data/clima_zonas.json`):

```bash
python scripts/descargar_nasa_power.py
```

**Ver la app en tu compu.** Hay que abrirla con un servidor local, porque el navegador no deja leer los JSON si abrís el HTML con doble clic:

```bash
python -m http.server 8000
# y abrir http://localhost:8000/web/
```

**Google Earth Engine** (se pegan en el [Code Editor](https://code.earthengine.google.com) y se corren con "Run"):

- `scripts/gee_visor_biosat.js`: visor GIS de la provincia (2000 contra 2025, NDVI, suelo pelado, desmonte, zonas IA). Se puede publicar como Earth Engine App.
- `scripts/gee_exportar_zonas.js`: estadísticas e imágenes por zona para la app.
- `scripts/gee_zonas_y_desmonte.js`: zonificación con AIZAL (k-means) y modelo predictivo de desmontes con validación temporal.
- `scripts/earth_engine_embeddings.js`: compara embeddings AlphaEarth entre años.

**Actualizar este README a mano** (normalmente no hace falta, ver abajo):

```bash
python scripts/actualizar_readme.py
```

---

## Documentación

| Para… | Leer |
|---|---|
| Ver cómo viene todo y qué falta | [docs/estado-del-proyecto.md](docs/estado-del-proyecto.md) |
| Tener toda la memoria de lo que hay en el repo | [docs/memoria-del-proyecto.md](docs/memoria-del-proyecto.md) |
| Saber qué hacer y quién lo hace | [PLAN.md](PLAN.md) |
| Saber el formato de los datos compartidos | [docs/contratos-de-datos.md](docs/contratos-de-datos.md) |
| Entender el desafío | [docs/resena-desafio.md](docs/resena-desafio.md) · [docs/recursos-desafio.md](docs/recursos-desafio.md) |
| Ver los datos y su arquitectura | [ESTRUCTURA_DATOS.md](ESTRUCTURA_DATOS.md) · [catálogo AIZAL](data/datos_cruzados_aizal/CATALOGO_MAESTRO_VARIABLES.md) · [análisis NASA](docs/analisis-datos-nasa-santiago.md) |
| Entender la agronomía y las reglas | [docs/documentacion-tecnica-agronomica.md](docs/documentacion-tecnica-agronomica.md) · [docs/zonas-santiago-y-kit-arduino.md](docs/zonas-santiago-y-kit-arduino.md) |
| Conocer las reglas del equipo y las decisiones | [docs/reglas-y-bitacora.md](docs/reglas-y-bitacora.md) · [docs/glosario.md](docs/glosario.md) |
| Ver la entrevista al productor de la Zona 5 | [docs/entrevista-productor-bella-criolla.md](docs/entrevista-productor-bella-criolla.md) |
| Ver el modelo de IA de desmontes | [ia_desmonte/README.md](ia_desmonte/README.md) · [docs/integracion-meteomatics.md](docs/integracion-meteomatics.md) |
| Ver el contexto del primer día | [CONTEXTO.md](CONTEXTO.md) |

---

## Cómo se mantiene actualizado este README

Las secciones **Estado del proyecto**, **Lo que falta**, **Últimas decisiones** y **Estructura del repositorio** se generan solas:

- **Cuándo:** en cada `push` a `main`, GitHub Actions corre [`scripts/actualizar_readme.py`](scripts/actualizar_readme.py) y, si algo cambió, sube el README actualizado.
- **Lo que falta:** las casillas sin tildar de cada plan, agrupadas por persona.
- **Avance:** sale de las casillas `- [ ]` / `- [x]` de los planes de [`planes/`](planes/README.md).
- **Decisiones:** salen de la [bitácora](docs/reglas-y-bitacora.md).
- **Estructura:** sale de los archivos del repo. Para darle descripción a un archivo nuevo, agregalo en `DESCRIPCIONES` dentro del script.
- **Qué no tocar a mano:** lo que está entre las marcas `<!-- AUTO:... -->`, porque se pisa. El resto del README sí se edita a mano.
- **Después de un push:** como el robot puede subir un commit, hacé `git pull --rebase` antes de tu próximo push.

---

## Reglas rápidas para colaborar

1. **Antes de empezar:** leer [planes/README.md](planes/README.md), tu plan y [docs/contratos-de-datos.md](docs/contratos-de-datos.md). Los agentes de IA también.
2. **Ramas y archivos:** cada uno trabaja en su rama y en sus archivos; nadie sube directo a `main`. Se integra con un *Pull Request* en cada hito.
3. **Para traer lo de los demás:** `git fetch origin && git merge origin/main`. Commits chicos y sin la línea `Co-Authored-By`.
4. **Datos faltantes:** van como `null`. **Nunca inventar números.**
5. **Registro:** cada decisión va a la bitácora y cada término nuevo al glosario.
