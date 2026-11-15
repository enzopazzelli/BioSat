# Memoria del proyecto BioSat

**Corte:** sábado 14/11/2026, noche · **Estado de `main`:** commit `203bd21` más lo de este documento · **App:** https://enzopazzelli.github.io/BioSat/web/

Este documento junta **todo lo que hay en el repositorio**, qué hace cada parte, de dónde sale cada dato y qué decisiones se tomaron, para que cualquiera del equipo (o un agente de IA) retome el trabajo sin releer la conversación. Para el avance al día y las alertas, mirar [`estado-del-proyecto.md`](estado-del-proyecto.md) y el [README](../README.md), que se actualiza solo.

---

## 1. Qué es

BioSat es una app web estática (HTML y JavaScript, sin proceso de compilación, sin internet) para el desafío **Field Shift: Adapting Farms with NASA Data** de NASA Space Apps 2026, sede Santiago del Estero. Ayuda a un productor a comparar **3 rotaciones** (la actual y 2 alternativas) en su zona, con calor, heladas, lluvia, suelo pelado, riesgo de desmonte y un kit Arduino que mide el suelo en vivo. **Apoya, no reemplaza**, al productor ni al agrónomo.

- **Equipo:** Enzo (integración y app, y ahora también el kit Arduino de Sara), Santi (suelo, satélite e IA), Vale (campo y agronomía), Sara (relato y entrega).
- **Repo:** https://github.com/enzopazzelli/BioSat · GitHub Pages desde la raíz de `main`, con `.nojekyll`.
- **Flujo:** una rama por persona, `main` es lo publicado. Los commits **no llevan `Co-Authored-By`**.

## 2. La app (`web/`)

| Archivo | Qué hace |
|---|---|
| `index.html`, `app.js`, `estilos.css` | La app (D-31): **Inicio** para el celular (semáforo de la zona o de la sonda, lo que mejor encaja con la tira de 12 meses, Medir con la sonda y WhatsApp) y **Reporte** completo en una página (`#reporte`, 7 secciones abiertas, Guardar PDF y Compartir) |
| `completo.html` | La página de antes (5 pasos), conservada como **vista detallada** del reporte completo. Usa el mismo `app.js`; el asistente no se abre solo |
| `inicio-logica.js` | Lógica del Inicio sin interfaz y con pruebas: semáforo (umbrales de la bitácora D-31), próxima siembra, meses pelados, textos de WhatsApp |
| `asistente-logica.js`, `asistente.js`, `asistente.css` | Asistente de inicio de 4 preguntas con el mapa real. Aparece la primera vez; `?asistente=1` lo fuerza. Respuestas en `localStorage` (`biosat.asistente.v1`), tolerante a que esté bloqueado |
| `frases-logica.js` | Frases calculadas con los datos (si falta un dato, no se muestran): una por paso y las conclusiones del Reporte (meses más duros, suelo y monte) |
| `kit.html`, `kit.js`, `kit-logica.js`, `kit.css` | Pantalla del kit para la mesa del jurado: 3 bandejas, teclas A, B y C, guarda sola al estabilizarse |
| `campo.html`, `campo.css` | Guía "Del kit al campo": del kit a estaciones fijas con LoRa |
| `img/`, `vendor/`, `datos-borrador/` | Imágenes Landsat de respaldo (Planetary Computer), Leaflet, rotaciones borrador de respaldo |

Cómo se conecta: `app.js` lee los JSON de `../data/`; las respuestas del asistente pasan a `state` (zona, riego, hacienda, sembradora, temas) y el motor de reglas no cambia. Todos los textos nuevos viven en objetos con claves (`TEXTOS`, `TEXTOS_PASOS`), listos para la etapa del idioma.

## 3. Datos (`data/`) y su origen

| Archivo | Contenido | Dueño | Origen y confianza |
|---|---|---|---|
| `clima_zonas.json` | Clima diario 1981-2025 de las 5 zonas, ET0, normal 1991-2020 contra 2021-2025 | Enzo | NASA POWER (MERRA-2, ~50 km). Completo |
| `rotaciones_santiago.json` | 15 rotaciones (5 zonas × 3) | Vale | Zona 5 validada por un productor (audio); zonas 1 a 4 **sin validar**. `requiere_hacienda` lo completó Enzo según el texto: Vale debe confirmarlo |
| `suelo_zonas.json` | 11 variables por zona, con rango del 10 al 90 % | `ia_desmonte/suelo.py` | SoilGrids 2.0 de 0 a 30 cm sobre tierra agropecuaria (Earth Engine). Confianza media |
| `diagnostico_landsat_ia.json` | Meses de suelo pelado (NDVI < 0,25, con meses dudosos), fragilidad | `ia_desmonte/suelo_pelado.py` | Landsat 8 y 9 2021-2025 en 3.000 puntos de cultivo. Meses: confianza media; fragilidad: baja |
| `zonificacion_aizal.json` | k-means con 5 grupos sobre clima y suelo | `ia_desmonte/zonificacion.py` | TerraClimate + SoilGrids + NASADEM, 6.000 píxeles. Silueta 0,27 (la mejor, 0,34 con k=2) |
| `desmonte_zonas.json` | Historia 2001-2025, riesgo, proyección y métricas | `ia_desmonte/desmonte.py` | Hansen v1.13 (30 m). Random forest: AUC 0,78 en validación cruzada y 0,63 en la prueba 2016-2025 |
| `meteomatics_santiago_zonas.json` | Pronóstico a 7 días por zona | Santi | Meteomatics (ECMWF 9 km). **Todavía no entra en la app** |
| `arduino_bandejas_demo.json` | Lecturas grabadas de las 3 bandejas | Enzo (kit) | Plantilla **vacía**; `meta.umbrales.conductividad_salitre_raw` (700 por defecto) |
| `santiago_mapa.json` | 27 departamentos pintados por zona | Enzo | IGN vía geoBoundaries (CC BY 3.0 IGO). Lo genera `scripts/generar_mapa_santiago.py` |
| `imagenes/` | 21 compuestos de mediana Landsat + mapa de la zonificación + `escenas.json` | `ia_desmonte/imagenes.py` | Earth Engine (D-30). Unos 6 MB |
| `datos_cruzados_aizal/`, `raw_nasa_power/`, `resumen_mensual_santiago.csv` | Catálogo AIZAL V4 (38 variables), descargas crudas, resumen para planilla | Santi / Enzo | |

El formato de cada archivo está en [`contratos-de-datos.md`](contratos-de-datos.md): §1 clima, §2 suelo, §3 diagnóstico, §4 rotaciones, §5 imágenes, §6 Arduino, §7 zonificación, §8 desmontes, §9 mapa.

**Las 5 zonas:** 1 Área de riego del Río Dulce (La Banda), 2 Secano agrícola del este (Quimilí), 3 Chaco semiárido norte (Campo Gallo), 4 Bajos submeridionales (Añatuya), 5 Sur serrano y salinas (Ojo de Agua, la protagonista). Un departamento pertenece a la zona cuyo punto de NASA POWER contiene; si no, a la que lo nombra la lista; si no, a la más cercana. *General Taboada* pasó de la Zona 2 a la 4.

## 4. Kit Arduino (`arduino/`)

Arduino Uno por USB con Web Serial (Chrome o Edge). Una línea JSON cada 2 segundos (`agua_raw`, `temp_suelo_c`, `temp_aire_c`, `hum_aire_pct`, `luz_raw`, `semaforo`).

- `biosat_estacion_campo/`: sketch que compila para el Uno (33 % de la memoria de programa). LM35 con referencia de 1,1 V, promedios, sonda que se alimenta solo al medir, `null` si un sensor falla.
- `lector-web-serial.js`: `window.BioSatArduino` (`soportado`, `conectar`, `desconectar`), probado con un puerto simulado.
- `esquema/`: `pines.json` es la **fuente única**; `generar-esquema.js` genera el SVG y la tabla de cables; una prueba falla si el sketch, la tabla o el dibujo dejan de coincidir. Incluye la imagen del plan original y la de las piezas disponibles.
- Piezas reales: LCD común sin I2C (paralelo, 4 bits), sensor de nivel de agua (mide conductividad), LM35, DHT11, fotoresistencia, LEDs, buzzer, potenciómetro.
- **Falta** armarlo, sellar el LM35, probar en la placa, calibrar (ganancia y offset del LM35, umbral de salitre) y grabar lecturas reales. Guía completa en [`arduino/README.md`](../arduino/README.md).

## 5. Scripts (`scripts/`) y pruebas (`tests/`)

- `descargar_nasa_power.py` (clima), `descargar_meteomatics.py` (lee `METEOMATICS_PASSWORD`), `generar_mapa_santiago.py` (mapa), `actualizar_readme.py` (regenera las secciones automáticas del README; lo corre GitHub Actions).
- `gee_visor_biosat.js`, `gee_exportar_zonas.js`, `gee_zonas_y_desmonte.js`, `earth_engine_embeddings.js`: se pegan en el Code Editor de Earth Engine.
- **71 pruebas** con `node --test tests/*.test.js` (Node 22): kit, lector, esquema del Arduino, asistente, frases y datos del mapa.

## 6. IA (`ia_desmonte/`)

Trabajo de Santi: notebook de zonificación y modelo de desmontes, pipeline automatizado con reporte PDF, gráficos y explicaciones, y registros de métricas. Se compara regresión logística, random forest y un modelo temporal, validados con años que el modelo no vio (entrena hasta 2015, prueba 2016-2023). El suelo pelado sale por umbral, **no por IA**: conviene decirlo así en el pitch.

## 7. Documentos (`docs/`)

| Documento | Para qué |
|---|---|
| `estado-del-proyecto.md` | Panorama: qué está hecho, qué falta, riesgos |
| `memoria-del-proyecto.md` | Este documento |
| `reglas-y-bitacora.md` | Reglas del equipo y decisiones **D-01 a D-28** |
| `contratos-de-datos.md`, `glosario.md` | Formatos de datos y términos (incluye los ganaderos de Vale) |
| `cruce-de-datos.md`, `BioSat-cruce-de-datos-validacion.docx` | Enfoque y datos, para que la profesora valide |
| `entrevista-productor-bella-criolla.md` | Transcripción y cruce con los datos (Zona 5) |
| `integracion-meteomatics.md`, `analisis-datos-nasa-santiago.md`, `zonas-santiago-y-kit-arduino.md`, `documentacion-tecnica-agronomica.md` | Análisis y apoyo técnico |
| `resena-desafio.md`, `recursos-desafio.md`, `transcripcion-video-desafio.md` | El desafío y el video de la NASA |
| `mockup/biosat-mockup.html` | Mockup original de la app (1,4 MB, autónomo salvo fuentes de Google y Leaflet por CDN). Quedó reemplazado por `web/` |
| `superpowers/specs/`, `superpowers/plans/` | Diseños y planes de construcción: visor del kit, guía del campo, asistente y mapa |

Fuera de `docs/`: `PLAN.md` (plan general y ruta), `planes/` (plan y checklist de cada persona), `CONTEXTO.md` (histórico del 13/11), `ESTRUCTURA_DATOS.md`.

## 8. Cómo se llegó hasta acá (línea de tiempo del 14 y 15/11)

**Sábado 14/11**

1. Repo unificado, README que se actualiza solo, plan y mockup (D-15 a D-17).
2. Análisis de zonas, visor GIS en Earth Engine y Zona 5 confirmada (D-18 a D-21).
3. Equipo de 4 y trabajo en ramas con planes individuales (D-22, D-23).
4. App v1 publicada con clima corregido 1981-2025 (D-24).
5. Propuesta de la profesora: zonificación AIZAL y modelo predictivo de desmontes (D-25, D-26).
6. Pantalla del kit, guía "Del kit al campo" y Arduino Uno por USB (D-27).
7. Kit Arduino completo (sketch, lector, esquema) y el repaso del repo con lo que falta por persona.
8. Sugerencias de la organización: asistente de inicio, mapa real y app más fácil (D-28). El idioma EN/ES quedó para después.

**Domingo 15/11**

9. Datos reales de Earth Engine en lugar del prototipo simulado; las métricas del pitch cambian (D-30).
10. App para el celular: Inicio simple, Reporte completo con PDF y vista detallada (D-31). Integrada en `main` y probada en un celular de verdad.
11. Guía de armado en protoboard: el kit para principiantes alcanza para la estación (D-32, `arduino/GUIA-PROTOBOARD.md`).
12. Revisión de ramas a las 10:00: no queda trabajo sin integrar en `main`.
13. Hallazgo: la app dice "suelo pelado" donde el satélite solo ve poca vegetación verde, y muestra modelos y fuentes que no se usan. Plan para corregirlo antes de la demo (D-33, `docs/superpowers/plans/2026-11-15-app-sin-datos-falsos.md`).
14. El Inicio va en dos columnas en la PC, y el pronóstico de Meteomatics (ECMWF, 9 km) entra en la app: tarjeta "Esta semana en tu zona" en el Inicio y el Reporte, la máxima de hoy en la pantalla del kit y una actualización diaria con GitHub Actions (D-34).

## 9. Pendientes y alertas

- **Idioma EN/ES:** última etapa de las sugerencias de la organización; necesita diseño propio. Las rotaciones de Vale en inglés pasan por su revisión.
- **App sin datos falsos (D-33):** "suelo pelado" del satélite → "sin verde", tabla de métodos real, textos sin MapBiomas ni LART y nombres de los grupos AIZAL. Plan con 3 formas de arreglarlo en `docs/superpowers/plans/2026-11-15-app-sin-datos-falsos.md`.
- **Kit Arduino:** armado con `arduino/GUIA-PROTOBOARD.md`, sellado del LM35, calibración y lecturas reales (sin ellas, la pantalla del kit solo anda en vivo).
- **Entrega:** guion, video o diapositivas, página del proyecto en Space Apps, declaración de uso de IA, 2 ensayos, hora y formato de entrega.
- **Santi:** publicar el visor de Earth Engine; verificar la fragilidad y los meses de suelo pelado. La contraseña de Meteomatics no se cambia, por practicidad (D-29).
- **Vale:** confirmar los 7 `requiere_hacienda`, conseguir por escrito el permiso del productor y validar (o declarar sin validar) las zonas 1 a 4.
- **Enzo:** ensayar la pantalla del kit en la pantalla grande y cerrar `PLAN.md`. El pronóstico de Meteomatics ya se renueva solo todos los días (D-34).
- **Detalles menores de la última revisión** (no impiden nada): flechita de los plegables, tamaños de letra y botones menores a 44 px, tema elegido en la pregunta 3 solo por color, zonas del asistente sin flechas del teclado, restos en `app.js` y la carpeta `web/` colapsada en el README.

## 10. Reglas que no se rompen

1. **Datos faltantes van como `null`. Nunca inventar números.**
2. Cada dato muestra su fuente y su confianza; la app dice cuándo es una estimación.
3. Funciona **sin internet**.
4. Cada decisión va a la bitácora y cada término nuevo al glosario.
5. Integrar a `main` solo con aprobación de Enzo.
6. Commits sin `Co-Authored-By`.

## 11. Cómo trabajar con el repo

```bash
python -m http.server 8000        # y abrir http://localhost:8000/web/
node --test "tests/*.test.js"     # 126 pruebas (con el patrón entre comillas; "node --test tests/" no las encuentra)
python -X utf8 -m pytest scripts/pruebas -q      # pruebas de los scripts (sin internet)
ANCHO=1440 node scripts/captura-movil.mjs "http://localhost:8000/web/index.html" pc.png 1100   # la app en otro ancho
python -X utf8 scripts/actualizar_readme.py
node arduino/esquema/generar-esquema.js          # regenera el esquema del Arduino
python -X utf8 scripts/generar_mapa_santiago.py  # regenera el mapa (necesita internet)
```
