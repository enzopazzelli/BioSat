# Diseño: datos reales de suelo, desmonte, zonificación y suelo pelado

**Fecha:** 14/11/2026, noche · **Rama:** `santi-datos-ia` · **Pedido por:** Enzo · **Integra a `main`:** solo con aprobación de Enzo

## 1. Por qué

En el análisis del repo del 14/11 apareció que casi todos los números del frente de Santi (F2 y F3) no salen de datos reales. Esos números ya están en `main` y la app se los muestra al jurado:

- **Entrenamiento y prueba del modelo de desmontes:** se generan con `np.random` y una fórmula inventada (`ia_desmonte/python/compilar_notebook.py:77-122`). "2001-2015" y "2016-2023" son dos semillas.
- **Historia de desmontes, riesgo por zona y valores de suelo:** están escritos a mano.
- **Silueta de la zonificación:** sale de 5 filas copiadas con ruido.
- **Imágenes del visor:** las "de Earth Engine" son copias de las de Planetary Computer.

Enzo quiere que estos datos **lleguen limpios y claros**, que haya **todo lo real que se pueda y que se simule lo menos posible**, con la mayor confianza posible y con el origen de cada número a la vista. Es la base del argumento "app honesta" del pitch y lo que van a mirar los expertos en aprendizaje automático del jurado.

## 2. Objetivos, no objetivos y lo que lo haría fracasar

**Objetivos**
1. Que `data/suelo_zonas.json`, `data/desmonte_zonas.json`, `data/zonificacion_aizal.json`, `data/diagnostico_landsat_ia.json` y `data/imagenes/` salgan de **fuentes públicas y citables**, procesadas por un script del repo que cualquiera con cuenta de Earth Engine puede volver a correr.
2. Que el modelo de desmontes tenga **validación en el tiempo de verdad** y métricas honestas, aunque sean más bajas que las de hoy.
3. Que cada archivo diga **de dónde sale cada número, con qué método, en qué fecha y con qué confianza**, siguiendo un criterio de confianza escrito (sección 6).
4. Que la app siga andando sin cambios grandes: se respetan los contratos de `docs/contratos-de-datos.md` y lo que cambia se documenta.
5. Que el prototipo simulado salga del camino de la app y quede rotulado como tal.

**No objetivos (quedan afuera)**
- El rediseño de la app (es el proyecto siguiente).
- Las redes LSTM, Transformer o CNN. Con 24 años de historia por zona, un modelo profundo no se justifica.
- Meteomatics (D-29) y los embeddings AlphaEarth.
- Publicar el visor como Earth Engine App: eso se hace a mano en el editor web y no depende de este trabajo.

**Lo que lo haría fracasar aunque funcione**
- Que quede **un solo número sin origen comprobable**, o una confianza "alta" que no se pueda justificar.
- Que se rompa la app publicada o deje de andar sin internet.
- Que se coma el tiempo de la app y de la entrega. El congelamiento es el domingo a las 15:00, y la meta es tener los datos listos y revisados **el domingo a media mañana**.

## 3. Restricciones

- **Earth Engine:** proyecto de Cloud de Enzo, nivel Comunidad (150 horas de EECU). El ID se lee de la variable de entorno `EE_PROJECT` y **no se escribe en el repo**. El login lo hace Enzo una vez (`earthengine authenticate`).
- **Esta PC:** Windows, Python 3.13, con numpy, pandas, scikit-learn, scipy, matplotlib y Pillow. Se suma `earthengine-api` y nada más que haga falta compilar.
- **Límites de Earth Engine:** las consultas interactivas (`getInfo`) devuelven a lo sumo unos 5.000 elementos. Las muestras se piden por tandas.
- **La app es estática y anda sin internet:** los resultados se guardan como JSON y PNG chicos en `data/`.
- **Regla del equipo:** los datos faltantes van como `null`. Nunca inventar números.

## 4. Formas de hacerlo (elegida: A)

| | Cómo | A favor | En contra |
|---|---|---|---|
| **A · elegida** | Script de Python en el repo que usa Earth Engine para el cálculo pesado (estadísticas por zona, muestreo de píxeles, compuestos de Landsat) y scikit-learn acá para los modelos | Mismas fuentes que la propuesta de la profesora y los scripts de JS que ya están; se itera rápido; puedo comprobar cada número | Para volver a correrlo hace falta una cuenta de Earth Engine |
| B | Bajar los rásters públicos (Hansen, SoilGrids, OSM) y procesarlos en esta PC; Earth Engine solo para Landsat | Reproducible sin cuenta | Más código y más descargas (unos 430 MB solo de Hansen) y más frágil para una noche |
| C | Correr a mano los scripts de JS en el editor web y bajar los CSV de Drive | Nada que instalar | Enzo copia, corre y baja archivos; las exportaciones tardan; no se puede iterar |

Enzo eligió la A el 14/11, al pasar el ID del proyecto.

## 5. Diseño

### 5.1 Las zonas como polígonos

- Las 5 zonas de BioSat se arman **juntando los 27 departamentos** con la misma asignación de `data/santiago_mapa.json`: Zona 1 tiene 8 departamentos, la 2 tiene 2, la 3 tiene 4, la 4 tiene 8 y la 5 tiene 5. Así coinciden con el mapa que ve el productor y cubren toda la provincia sin huecos.
- La geometría sale de **geoBoundaries ARG ADM2**, la misma fuente que el mapa, y se sube a Earth Engine como `FeatureCollection`.
- **El clima** sigue saliendo del punto de NASA POWER de cada zona (`clima_zonas.json`) y no se toca.

### 5.2 Suelo por zona (`suelo_zonas.json`, contrato §2)

- **Fuente:** SoilGrids 2.0 en Earth Engine (`projects/soilgrids-isric/*_mean`), a 250 m.
- **Variables:** pH, arcilla, arena, limo, carbono orgánico, nitrógeno y densidad aparente.
- **Profundidad:** promedio de 0 a 30 cm, ponderado por espesor (0-5, 5-15 y 15-30 cm). Las unidades se convierten a las del contrato.
- **Dónde se mide:** sobre la **tierra agropecuaria** de cada zona, es decir, cultivos y pastizales de ESA WorldCover 2021 (clases 40 y 30), porque es el suelo que le importa al productor. Si una zona tiene poca tierra agropecuaria, se usa toda la zona y se avisa.
- **Además del valor:** cada variable guarda la mediana, el rango del 10 al 90 % (`rango_p10_p90`) y la cantidad de píxeles. Si Earth Engine tiene las capas de incertidumbre de SoilGrids, también se informa su incertidumbre media.
- **El resto de los campos del contrato:**
  - `pdsi`: PDSI medio de TerraClimate, 1991-2020.
  - `distancia_caminos_km`: distancia media de la tierra agropecuaria al camino más cercano. Sale de GRIP4 (Global Roads Inventory, catálogo comunitario de Earth Engine); si no está, de OpenStreetMap.
  - `distancia_monte_km`: distancia media de la tierra agropecuaria al monte que queda.
  - `monte_nativo_pct`: porcentaje de la zona con monte en 2024 (ver 5.3).
- **Confianza:** "media" (sección 6).

### 5.3 Monte e historia de desmontes

- **Fuente:** Hansen Global Forest Change **v1.12** (`UMD/hansen/global_forest_change_2024_v1_12`), Landsat a 30 m, con pérdidas de 2001 a 2024.
- **Qué cuenta como monte:** cobertura arbórea del 2000 de **25 % o más**. Es un parámetro escrito en el script y en el JSON, y el informe muestra cuánto cambia con 10 % y con 30 %.
- **Monte en un año dado:** monte del 2000 menos lo perdido hasta ese año. Hansen no registra el monte que vuelve a crecer, y eso se dice.
- **Serie anual por zona:** hectáreas desmontadas por año entre 2001 y 2024 (`desmonte_ha_por_anio`), calculadas con el área real de cada píxel.
- **Si alcanza el tiempo:** contrastar con MapBiomas Chaco (si su asset es accesible) y dar el porcentaje de coincidencia como control independiente.

### 5.4 Modelo predictivo de desmontes (`desmonte_zonas.json`, contrato §8)

- **Validación en el tiempo, como pide el contrato:**
  - **Entrenamiento:** píxeles con monte en 2008, predictores calculados al 2008, y la etiqueta "se desmontó entre 2009 y 2015".
  - **Prueba:** píxeles con monte en 2015, predictores al 2015, y la etiqueta "se desmontó entre 2016 y 2024".
  - El modelo nunca ve el período de prueba.
- **Muestra:** puntos al azar dentro del monte de toda la provincia, **sin balancear las clases**, para que las probabilidades salgan calibradas. Unos 15.000 puntos por período, pedidos por tandas, con semilla fija.
- **Predictores, todos calculados al año de corte:**
  - distancia a zonas sin monte;
  - distancia a desmontes anteriores;
  - distancia a caminos (GRIP4, es fija y se avisa);
  - pendiente (NASADEM);
  - si el punto está en un área protegida (WDPA);
  - densidad de población (WorldPop, año más cercano al corte);
  - déficit hídrico (TerraClimate 1991-2020);
  - arcilla y pH (SoilGrids);
  - la zona de BioSat.
- **Modelos:**
  - regresión logística como referencia;
  - random forest;
  - gradient boosting (`HistGradientBoostingClassifier`).
- **Métricas sobre la prueba:** AUC, F1, exactitud, kappa, **AUC de precisión y exhaustividad** y la proporción de desmonte real, que es la línea de base. El umbral para F1 se elige en el entrenamiento, no en la prueba.
- **Elección del modelo:** el de mayor AUC en la prueba. **La justificación se escribe sola a partir de los números**, así no puede contradecirlos.
- **Riesgo por zona:**
  - Se reentrena el modelo elegido con los datos de 2015 a 2024.
  - Se aplica al monte que queda en 2024, con los predictores al 2024.
  - `riesgo_medio_0_1` es el promedio por zona. Significa: "probabilidad de que un píxel de monte se desmonte en los próximos ~9 años si sigue el patrón de 2016-2024". Esa frase va en el JSON.
  - Con cada riesgo se guarda la cantidad de puntos usados. Si una zona tiene menos de 100 puntos de monte (puede pasar en la Zona 1), su confianza baja a "baja" y se avisa.
- **Mapa de riesgo:** el mismo modelo se entrena en Earth Engine (`smileRandomForest` con las mismas muestras) para pintar un PNG del riesgo. Es opcional: si no llega, queda afuera.
- **Proyección 2025-2028 por zona:**
  - Se comparan tres métodos simples sobre la serie anual: el promedio de los últimos 3 años, la tendencia lineal de los últimos 8 años y el suavizado de Holt.
  - Se prueban contra el pasado: con datos hasta 2018 se predice 2019-2024.
  - Se elige el de menor error en hectáreas (`error_ha_pct`).
  - En el contrato, la clave `temporal_lstm_o_transformer` pasa a llamarse `temporal`, con el nombre del método elegido. La app cambia una línea para leerla.

### 5.5 Zonificación (`zonificacion_aizal.json`, contrato §7)

- **Variables por píxel, estandarizadas:**
  - de TerraClimate 1991-2020: lluvia anual, déficit hídrico, máxima del mes más caluroso y mínima del mes más frío;
  - de SoilGrids, de 0 a 30 cm: pH, arcilla, arena, carbono orgánico, densidad aparente y capacidad de intercambio catiónico;
  - pendiente.
- **Método:** k-means de scikit-learn sobre unos 6.000 píxeles al azar de toda la provincia.
- **Cuántos grupos:** se informa la silueta para k entre 2 y 8. Se usa **k = 5**, como propuso la profesora, y si otro k da mejor silueta, se dice.
- **Perfil de cada grupo:** medias en unidades reales y porcentaje del área. El `nombre` de cada grupo queda en `null` para que lo ponga el equipo, como dice el contrato.
- **Comparación con BioSat:** para cada zona, qué grupo domina y en qué porcentaje. Puede no coincidir al 100 %, y se dice.
- **El nombre del archivo:** se mantiene `zonificacion_aizal.json` por el contrato. En `meta` se aclara que se usan las mismas variables de AIZAL V4 (B03-B18), tomadas directamente de sus fuentes originales (TerraClimate y SoilGrids).
- **Mapa de grupos:** cada píxel se asigna en Earth Engine al centro más cercano. El resultado es un PNG para el visor (`meta.imagen`).

### 5.6 Meses de suelo pelado (`diagnostico_landsat_ia.json`, contrato §3)

- **Fuente:** Landsat 8 y 9 Collection 2 Level-2, de 2021 a 2025, con nubes y sombras enmascaradas con `QA_PIXEL`.
- **Dónde:** solo sobre cultivos (ESA WorldCover 2021, clase 40).
- **Cálculo:** para cada mes y cada zona, la fracción de píxeles de cultivo con NDVI mediano **menor a 0,25**. Un mes es "pelado" si esa fracción llega a 0,5, como dice el contrato.
- **Sensibilidad:** se recalcula con umbrales de 0,20 y 0,30. Si un mes cambia de estado con el umbral, queda marcado como dudoso.
- **Por mes también se guardan:** la fracción y la cantidad de observaciones limpias, porque en verano hay muchas nubes.
- **Rastrojo:** el NDVI no distingue el suelo pelado del rastrojo. Se dice en las notas. Calcular el NDTI para separarlos queda como mejora opcional.
- **Evaluación:** sin datos de campo no hay exactitud medible. El bloque `evaluacion` queda en `null`, con el motivo.
- **Monte y desmonte reciente:** `monte_actual_pct` es el porcentaje de la zona con monte en 2024. `desmonte_reciente_pct` es el porcentaje del monte de 2015 que se perdió entre 2016 y 2024. Los dos salen de Hansen (5.3).
- **Índice de fragilidad:**
  - Se recalcula con datos reales y la misma fórmula visible. Los días de más de 40 °C y el déficit hídrico salen del período `reciente` (2021-2025) de `clima_zonas.json`.
  - Lo calcula el script a partir de los archivos del repo, así se puede reproducir.
  - Los pesos son una elección del equipo, no están calibrados, y el JSON lo dice.
  - Confianza: "baja".

### 5.7 Imágenes del visor (`data/imagenes/`, contrato §5)

- **Compuestos de Landsat 8 y 9 hechos en Earth Engine:**
  - verano: mediana de diciembre de 2024 a marzo de 2025;
  - invierno: mediana de junio a octubre de 2025;
  - en RGB y en NDVI, para el recuadro del contrato.
  - Para la Zona 3, además, un compuesto del 2000 con Landsat 5 y 7.
- **`escenas.json`** dice la verdad: período, cantidad de escenas usadas y que es una mediana.
- **Tamaño:** los PNG quedan cerca de 300 KB cada uno o menos. Si se pasa, se baja la paleta.
- **Las copias de Planetary Computer** salen de `data/imagenes/`. Las de `web/img/` siguen como respaldo, rotuladas como Planetary Computer.

### 5.8 Organización del código y de los archivos

- **El pipeline nuevo vive en `ia_desmonte/`**, que es la carpeta de este frente. Un módulo por parte:
  - `ia_desmonte/zonas.py`
  - `ia_desmonte/suelo.py`
  - `ia_desmonte/desmonte.py`
  - `ia_desmonte/zonificacion.py`
  - `ia_desmonte/suelo_pelado.py`
  - `ia_desmonte/imagenes.py`
  - `ia_desmonte/correr_todo.py`
- **Muestras intermedias:** las tablas de Earth Engine se guardan en `ia_desmonte/salidas/` como CSV, con un registro de corrida que dice qué datasets, versiones, semillas, tamaños de muestra y fecha se usaron.
- **Reentrenar sin Earth Engine:** los modelos se pueden volver a entrenar sin cuenta a partir de esos CSV.
- **El prototipo simulado se archiva:** pasa a `archivo/prototipo-ia-simulado/` con un README que dice claramente que **usa datos simulados y no alimenta la app**. Eso incluye el notebook, los CSV, los gráficos, el PDF y los registros. Queda como antecedente del método, fuera del camino de los datos.
- **Informe para el equipo y el pitch:** `docs/datos-y-metodos.md` reúne las fuentes, los métodos, las métricas, la tabla de confianza y las limitaciones.
- **Documentos que se actualizan:**
  - `docs/contratos-de-datos.md` (§2, §3, §7 y §8, con los campos nuevos);
  - la bitácora (decisión nueva);
  - `planes/2-santi.md`, con las métricas reales y las casillas;
  - `docs/estado-del-proyecto.md`, `docs/memoria-del-proyecto.md` y las descripciones de `scripts/actualizar_readme.py`.

### 5.9 Pruebas

Una prueba nueva de Node (`tests/datos-contratos.test.js`) comprueba sobre los JSON reales:

- que respetan su contrato;
- que no hay `NaN`;
- que los meses vienen de a 12;
- que las confianzas son "alta", "media" o "baja";
- que cada `meta` tiene fuente, método y fecha;
- que el `metodo_elegido` del modelo de desmontes es el de mayor AUC en la prueba;
- que ningún archivo de `data/` apunta al prototipo simulado.

Las 71 pruebas actuales tienen que seguir en verde.

## 6. Criterio de confianza

| Confianza | Cuándo se usa | Ejemplos en este trabajo |
|---|---|---|
| **alta** | Observación directa de satélite o estación, o producto de referencia con exactitud publicada para este uso | Historia de desmontes con Hansen (área perdida por año) |
| **media** | Producto modelado a escala global, o método con umbral sin validación local, con su incertidumbre informada | Suelo de SoilGrids, meses de suelo pelado, riesgo del modelo (validado en el tiempo pero con predictores globales), zonificación |
| **baja** | Depende de supuestos fuertes o de pesos elegidos a mano | Índice de fragilidad, proyección 2025-2028 |

## 7. Lo que queda para quien construye

- **Decisiones que tomé yo (Enzo las puede cambiar):** monte = cobertura arbórea de 25 % o más; el suelo se mide sobre tierra agropecuaria y no sobre toda la zona; el prototipo se archiva en lugar de borrarse; la proyección usa métodos simples en lugar de redes; el umbral de NDVI es 0,25, con sensibilidad a 0,20 y 0,30.
- **Si Hansen v1.12 no está en Earth Engine:** usar v1.11 (pérdidas hasta 2023) y probar con 2016-2023.
- **WorldPop llega hasta 2020:** para el corte de 2024 se usa 2020, y se anota.

- La cantidad exacta de puntos por tanda, la escala de cálculo de las distancias (30 o 100 m, según cuánto cuesten) y cómo se reparte el trabajo entre Earth Engine y Python.
- Los nombres internos de las funciones y el formato del registro de corrida.
- Si algún asset del catálogo comunitario (GRIP4, MapBiomas Chaco, incertidumbre de SoilGrids) no está accesible, usar la alternativa escrita arriba y anotarlo en el JSON y en el informe.

## 8. Qué cambia para el equipo

- **Las métricas del pitch cambian:** las de hoy (AUC 0,986) son de datos simulados. Las nuevas van a ser más bajas y defendibles. Hay que avisarle a Santi y a Sara antes de grabar nada.
- **La app** muestra los números nuevos sin cambios de diseño. Solo cambia la lectura de la clave `temporal`. El rediseño viene después.
