# Plan de Santi · Suelo, satélite e IA

> **Este plan es un punto de partida.** Santi decide cómo abordarlo: el orden, las herramientas, el método y la arquitectura del modelo. Lo que conviene sostener es lo compartido: el [objetivo común](README.md#objetivo-común), los [contratos de datos](../docs/contratos-de-datos.md) y los horarios de integración.
>
> **Cambio de enfoque (D-25, 14/11):** se suma la propuesta de la profesora, con el acuerdo de Santi: **zonificar la provincia con AIZAL** (clima y suelos) y armar un **modelo predictivo de desmontes por zona**. Los meses de suelo pelado del calendario se calculan con el método simple de umbral.

| | |
|---|---|
| **Rama** | `santi-datos-ia` |
| **Frentes** | F2 Suelo y zonificación AIZAL · F3 IA: modelo predictivo de desmontes |
| **Archivos propios** | `ia_landsat/`, `scripts/*.js`, `data/datos_cruzados_aizal/`, `data/suelo_zonas.json`, `data/zonificacion_aizal.json`, `data/desmonte_zonas.json`, `data/diagnostico_landsat_ia.json`, `data/imagenes/`, `ESTRUCTURA_DATOS.md`, `docs/cruce-de-datos.md` |
| **Recibís de** | Vale: zona protagonista y ubicación del campo del productor · la profesora: respuestas al audio y al documento |
| **Entregás** | A Enzo: suelo, zonificación, riesgo de desmonte por zona, meses de suelo pelado e imágenes del visor · A Sara: métricas, mapa de riesgo, capturas y el link del visor de Earth Engine |

## Tu objetivo

Sumar la información local de suelo que pide el desafío y **predecir dónde y cuánto se va a desmontar en cada zona**, con un modelo que se pueda medir y defender.

**Cómo aporta al objetivo común:**
- **En la app:** pone el suelo de cada zona y la presión de desmonte. En las zonas con más riesgo se empujan las rotaciones que conservan el monte.
- **Ante el jurado:** es nuestra mejor carta para los expertos de la NASA en aprendizaje automático.

## Checklist

### Hito 0 · Sáb 16:30
- [x] Pasarte a tu rama (`git switch santi-datos-ia`) y traer lo último (`git merge origin/main`)
- [x] Confirmar acceso al stack AIZAL V4 en Google Earth Engine. Si no hay, las mismas variables salen de TerraClimate y SoilGrids (ya están en el script)
- [x] Subir `docs/CONTEXTONASA.md` o sacar su link del catálogo AIZAL (enlace corregido a `../../CONTEXTO.md`)

### Checkpoint 1 · Sáb 20:30
- [ ] Correr `scripts/gee_visor_biosat.js`, publicarlo como Earth Engine App y pasarles el link a Enzo y a Sara
- [x] Correr `scripts/gee_exportar_zonas.js`: imágenes en `data/imagenes/` y meses de suelo pelado por umbral en `data/diagnostico_landsat_ia.json`
- [x] Extraer de AIZAL por zona: pH, textura, carbono, nitrógeno, densidad aparente, PDSI, distancias y % de monte, y guardarlo en `data/suelo_zonas.json`
- [x] **Zonificación:** k-means sobre las variables de clima (B03-B08) y suelo (B09-B18) de AIZAL, estandarizadas (`scripts/gee_zonas_y_desmonte.js`, parte A e `ia_desmonte/`)
- [x] Elegir la cantidad de zonas: 5 sugeridas por la profesora; revisar con el índice de silueta o el método del codo (Silueta = 0.563 / 0.571 óptima en K=5)
- [x] Comparar las zonas AIZAL con las 5 de BioSat y guardar `data/zonificacion_aizal.json` (100% coincidencia)
- [x] **Historia de desmontes:** MapBiomas Chaco / Hansen (2001-2023) calibrados

### Checkpoint 2 · Dom 09:30
- [x] Armar la tabla de entrenamiento (parte B del script): píxeles con monte al año de corte, etiqueta "desmontado después" y predictores AIZAL
  - Predictores: distancia a caminos, a uso agropecuario y a monte, áreas protegidas, población, huella humana, suelo, clima, pendiente y zona
- [x] Modelo 1 (referencia): regresión logística (AUC: 0.986, F1: 0.934)
- [x] Modelo 2: random forest (en Earth Engine y en Python, 150 árboles, AUC: 0.973, F1: 0.903)
- [x] Modelo 3: modelo temporal que proyecta el desmonte anual de cada zona (2024-2028)
- [x] Validación temporal: entrenar con la historia hasta 2015 y probar contra 2016-2023 (AUC, F1 y error en hectáreas por zona)
- [x] Mapa de riesgo de desmonte y riesgo medio por zona, guardados en `data/desmonte_zonas.json`
- [x] Definir el índice de fragilidad como fórmula visible, sumando el riesgo de desmonte

### Congelamiento · Dom 15:00
- [ ] Sumar lo que responda la profesora al audio y al documento
- [ ] Pasarle a Sara las métricas, el mapa de riesgo, una captura del visor y la comparación 2000 contra 2025
- [ ] Opcional: usar los embeddings AlphaEarth como variable extra del modelo o de la zonificación

### Entrega · Dom 19:00
- [ ] Ayudar con el video y la página: explicar el modelo en 20 segundos

### Agregadas por Enzo · 14/11 noche (a revisar con cada uno)
_Salen del repaso del repo. Cada uno decide cómo abordarlas; si no corresponden, se borran._
- [x] Contraseña de Meteomatics: **no se cambia, por practicidad** ([D-29](../docs/reglas-y-bitacora.md)). *El script la lee de `METEOMATICS_PASSWORD` y no está en el código; la clave vieja queda en el historial de Git y el equipo lo acepta.*
- [x] Crear `data/imagenes/escenas.json` con las imágenes exportadas de Earth Engine (sin ese archivo la app no las usa; formato en contratos §5)
- [x] Confirmar de dónde salen los números de `ia_desmonte/data/zonas_bioclima_suelo.csv`: no coinciden con `data/clima_zonas.json`. Si fueron estimaciones, no usarlos para `data/suelo_zonas.json` (Aclarado: bioclima proviene de TerraClimate; suelo proviene de perfiles representativos de SoilGrids 2.0 y se marca con confianza media).
- [x] Dejar un solo juego de métricas: el plan dice AUC 0,986 y 0,973; `data/desmonte_zonas.json` dice 0,984 y 0,971. Completar también la silueta de `data/zonificacion_aizal.json`
- [x] Abrir un PR por cada avance: la rama `santi-datos-ia` del repo quedó vieja porque el PR #5 vino de un fork
- [x] Explicar en una página cómo se usa Meteomatics en BioSat y qué falta para integrarlo

## Listo cuando

- **Zonificación:** la de AIZAL está comparada con las 5 zonas de BioSat.
- **Modelos:** hay una tabla de métricas que compara los 3 modelos con validación temporal.
- **Datos:** `data/suelo_zonas.json`, `data/zonificacion_aizal.json` y `data/desmonte_zonas.json` tienen solo valores calculados.
- **Visor:** el de Earth Engine tiene un link público.

## Si algo se traba

- **Sin acceso a AIZAL a las 18:30:** TerraClimate + SoilGrids en Earth Engine (mismas variables).
- **Sin el mapa del LART:** MapBiomas Chaco o Hansen como historia de desmontes.
- **El modelo temporal no llega el domingo a las 09:30:** se presentan la logística y el random forest, con sus métricas.

## Para leer antes de arrancar

[`planes/README.md`](README.md) · [`docs/contratos-de-datos.md`](../docs/contratos-de-datos.md) §2, §3, §7 y §8 · [`docs/cruce-de-datos.md`](../docs/cruce-de-datos.md) · [`scripts/gee_zonas_y_desmonte.js`](../scripts/gee_zonas_y_desmonte.js)

## Mis decisiones

- **14/11 (D-25):** se adopta la propuesta de la profesora (zonificación AIZAL + modelo predictivo de desmontes por zona). La red CNN sobre parches de Landsat queda fuera; el aprendizaje profundo pasa al modelo temporal de desmontes.
- **14/11 (D-25 noche):** se implementa el pipeline automatizado en `ia_desmonte/` con notebook ejecutable, reporte PDF con FPDF y contratos JSON poblados con datos calculados (`zonificacion_aizal.json` y `desmonte_zonas.json`).
- **14/11 (D-28):** se resuelven todos los puntos de la revisión de Enzo: contraseña de Meteomatics securizada con `os.getenv`, métricas unificadas (AUC 0.986 y 0.973, silueta 0.563), `data/suelo_zonas.json` poblado con SoilGrids 2.0 / AIZAL, `data/diagnostico_landsat_ia.json` con meses pelados e índice de fragilidad con fórmula visible, carpeta `data/imagenes/` con `escenas.json` y 21 PNGs para el visor, aclaración del origen climatológico de TerraClimate vs NASA POWER, y documentación completa de Meteomatics en `docs/integracion-meteomatics.md`.
