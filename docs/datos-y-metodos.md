# Datos y métodos de BioSat

> **Este documento se genera solo** con `python -X utf8 -m ia_desmonte.informe`, a partir de los JSON de `data/`. No se edita a mano: si cambia un dato, se vuelve a correr el pipeline (`ia_desmonte/`).

**Fecha de los datos:** 2026-11-15 · **Código:** [`ia_desmonte/`](../ia_desmonte/README.md) · **Contratos:** [`contratos-de-datos.md`](contratos-de-datos.md)

## 1. En pocas palabras

- Todos los números de suelo, desmonte, zonificación, suelo pelado e imágenes salen de **fuentes públicas y citables**, procesadas con Google Earth Engine y Python. No hay datos simulados.
- Un primer prototipo usó datos simulados: se retiró del repositorio y sus métricas no se usan.
- Cada dato lleva su **confianza** (alta, media o baja) con el criterio de la sección 9.
- El modelo de desmontes se prueba con **años que no vio** (entrena con monte y predictores al 2008 y desmonte 2009-2015; prueba con monte y predictores al 2015 y desmonte 2016-2025). Se eligió random forest porque tiene el AUC más alto en la validación cruzada del entrenamiento (0,78, contra 0,77 de gradient boosting y 0,71 de regresión logística). En la prueba 2016-2025, que no se usó para elegir, mide AUC 0,63 (gradient boosting 0,63, regresión logística 0,62).

## 2. Fuentes

| Dato | Fuente | Para qué |
|---|---|---|
| Desmontes 2001-2025 (30 m) | Hansen Global Forest Change v1.13 (UMD, Landsat) | Historia, etiquetas del modelo, % de monte |
| Suelo 0-30 cm (250 m) | SoilGrids 2.0 (ISRIC) | pH, textura, carbono, nitrógeno, densidad, CIC |
| Clima 1991-2020 (4 km) | TerraClimate (U. Idaho) | PDSI, déficit hídrico, zonificación |
| Imágenes 2000-2025 (30 m) | Landsat 5, 7, 8 y 9 Collection 2 Level-2 (NASA/USGS) | Suelo pelado y visor |
| Cobertura 2021 (10 m) | ESA WorldCover v200 | Dónde hay cultivos y pastizales |
| Caminos | GRIP4 (Meijer y otros, 2018) | Distancia a caminos |
| Áreas protegidas | WDPA (UNEP-WCMC) | Predictor del modelo |
| Población (100 m) | WorldPop 2000-2020 | Predictor del modelo |
| Relieve (30 m) | NASADEM (NASA) | Pendiente |
| Límites de las zonas | geoBoundaries ARG ADM2 (IGN) | Unión de los departamentos de cada zona |

Las 5 zonas se arman **juntando sus departamentos**, igual que el mapa de la app. El clima del calendario sigue saliendo de NASA POWER (`clima_zonas.json`).

## 3. Suelo por zona

Media, mediana y percentiles 10 y 90 por zona a 250 m. Suelo: promedio 0-30 cm ponderado por espesor. Se mide sobre tierra agropecuaria (WorldCover clases 30 y 40); si hay menos de 2000 píxeles, sobre la zona completa (ver area_medida).

| Zona | pH | Arcilla % | Arena % | Carbono g/kg | Nitrógeno g/kg | Densidad g/cm³ |
|---|---|---|---|---|---|---|
| Zona 1 · Riego del Río Dulce | 7,09 (6,88 a 7,25) | 20,7 (15,6 a 25,3) | 36,4 (29,1 a 48,6) | 13,1 (11,7 a 14,7) | 1,23 (1,07 a 1,40) | 1,35 (1,31 a 1,38) |
| Zona 2 · Secano del este | 7,07 (6,80 a 7,28) | 26,0 (16,9 a 33,9) | 25,9 (12,6 a 41,4) | 15,1 (13,6 a 17,2) | 1,46 (1,30 a 1,62) | 1,36 (1,33 a 1,39) |
| Zona 3 · Chaco semiárido norte | 7,00 (6,75 a 7,25) | 24,9 (20,8 a 29,4) | 30,9 (20,1 a 38,9) | 14,9 (13,2 a 16,9) | 1,46 (1,31 a 1,64) | 1,36 (1,32 a 1,39) |
| Zona 4 · Bajos submeridionales | 7,13 (6,90 a 7,30) | 31,1 (26,1 a 37,1) | 21,5 (15,4 a 32,1) | 16,6 (14,8 a 18,2) | 1,37 (1,23 a 1,55) | 1,34 (1,31 a 1,38) |
| Zona 5 · Sur serrano y salinas | 7,06 (6,80 a 7,30) | 20,5 (14,6 a 28,4) | 36,1 (27,6 a 44,6) | 14,1 (12,1 a 16,4) | 1,27 (1,08 a 1,48) | 1,34 (1,30 a 1,38) |

Entre paréntesis, el rango del 10 al 90 % de los píxeles: muestra cuánto varía el suelo dentro de la zona.

| Zona | Monte 2025 (% de la zona) | Distancia al monte (km) | Distancia a caminos (km) | PDSI 1991-2020 | Dónde se midió |
|---|---|---|---|---|---|
| Zona 1 · Riego del Río Dulce | 31,0 | 0,73 | 1,41 | -0,54 | tierra agropecuaria |
| Zona 2 · Secano del este | 32,8 | 0,28 | 1,79 | -0,30 | tierra agropecuaria |
| Zona 3 · Chaco semiárido norte | 61,0 | 0,24 | 1,75 | 0,03 | tierra agropecuaria |
| Zona 4 · Bajos submeridionales | 19,6 | 0,87 | 1,69 | -0,52 | tierra agropecuaria |
| Zona 5 · Sur serrano y salinas | 30,3 | 0,92 | 1,57 | -0,61 | tierra agropecuaria |

## 4. Desmontes

### Historia (Hansen, 2001-2025)

| Zona | Desmonte total (ha) | Año con más desmonte | Promedio 2021-2025 (ha/año) | Monte 2025 (%) |
|---|---|---|---|---|
| Zona 1 · Riego del Río Dulce | 217.266 | 2006 (17.846 ha) | 3.225 | 31,0 |
| Zona 2 · Secano del este | 762.400 | 2011 (90.871 ha) | 19.915 | 32,8 |
| Zona 3 · Chaco semiárido norte | 742.927 | 2008 (61.506 ha) | 27.380 | 61,0 |
| Zona 4 · Bajos submeridionales | 264.947 | 2005 (28.282 ha) | 4.486 | 19,6 |
| Zona 5 · Sur serrano y salinas | 166.324 | 2007 (17.500 ha) | 2.494 | 30,3 |

**Cuánto depende de qué se llama "monte".** Con distintos umbrales de cobertura arbórea del 2000:

| Umbral de cobertura | Zona | Monte 2025 (%) | Desmonte 2016-2025 (ha) |
|---|---|---|---|
| 10 % | Zona 1 · Riego del Río Dulce | 34,3 | 51.971 |
| 10 % | Zona 2 · Secano del este | 31,0 | 220.633 |
| 10 % | Zona 3 · Chaco semiárido norte | 60,8 | 291.184 |
| 10 % | Zona 4 · Bajos submeridionales | 21,9 | 68.435 |
| 10 % | Zona 5 · Sur serrano y salinas | 35,5 | 48.486 |
| 25 % | Zona 1 · Riego del Río Dulce | 28,1 | 45.196 |
| 25 % | Zona 2 · Secano del este | 28,6 | 208.221 |
| 25 % | Zona 3 · Chaco semiárido norte | 57,3 | 279.567 |
| 25 % | Zona 4 · Bajos submeridionales | 17,4 | 60.617 |
| 25 % | Zona 5 · Sur serrano y salinas | 28,0 | 43.577 |
| 30 % | Zona 1 · Riego del Río Dulce | 26,2 | 42.908 |
| 30 % | Zona 2 · Secano del este | 27,9 | 203.760 |
| 30 % | Zona 3 · Chaco semiárido norte | 55,9 | 275.144 |
| 30 % | Zona 4 · Bajos submeridionales | 16,1 | 58.017 |
| 30 % | Zona 5 · Sur serrano y salinas | 25,6 | 41.745 |

### Modelo predictivo

- **Validación:** entrena con monte y predictores al 2008 y desmonte 2009-2015; prueba con monte y predictores al 2015 y desmonte 2016-2025.
- **Muestra:** 10000 puntos de entrenamiento, 10000 de prueba y 10000 para el riesgo actual, al azar dentro del monte y sin balancear clases.
- **Predictores:** dist_sin_monte_m, dist_desmonte_previo_m, dist_desmonte_reciente_m, monte_1km_pct, dist_caminos_m, pendiente_grados, area_protegida, poblacion_densidad, deficit_hidrico_mm, arcilla_pct, ph, zona.
- **Línea de base:** en la prueba se desmontó el 9,0 % de los puntos. Un modelo que adivina al azar tiene AUC 0,50 y AUC de precisión-exhaustividad igual a esa proporción.

| Método | AUC validación cruzada (entrenamiento) | AUC prueba 2016-2025 | AUC precisión-exhaustividad | F1 | Exactitud | Kappa |
|---|---|---|---|---|---|---|
| Regresión logística | 0,71 | 0,62 | 0,12 | 0,18 | 0,77 | 0,06 |
| Random forest ✓ | 0,78 | 0,63 | 0,13 | 0,20 | 0,76 | 0,08 |
| Gradient boosting | 0,77 | 0,63 | 0,13 | 0,18 | 0,81 | 0,08 |

Se eligió random forest porque tiene el AUC más alto en la validación cruzada del entrenamiento (0,78, contra 0,77 de gradient boosting y 0,71 de regresión logística). En la prueba 2016-2025, que no se usó para elegir, mide AUC 0,63 (gradient boosting 0,63, regresión logística 0,62).

**Cómo leer la diferencia.** Dentro de su época el modelo distingue bien (0,78), pero al predecir la década siguiente baja a 0,63: el patrón del desmonte cambió entre los dos períodos. Una hipótesis, que este trabajo no prueba, es la entrada en vigencia de la Ley de Bosques (26.331) y el ordenamiento territorial de la provincia hacia 2009-2010. Por eso el riesgo por zona sirve para **comparar zonas**, no como pronóstico exacto de cada lote. Probar la hipótesis queda como trabajo futuro.

**Riesgo por zona** (probabilidad de que un píxel de monte se desmonte en los próximos ~10 años si sigue el patrón 2016-2025):

| Zona | Riesgo medio | Puntos de monte | Confianza |
|---|---|---|---|
| Zona 1 · Riego del Río Dulce | 0,053 | 1203 | media |
| Zona 2 · Secano del este | 0,155 | 1683 | media |
| Zona 3 · Chaco semiárido norte | 0,079 | 4685 | media |
| Zona 4 · Bajos submeridionales | 0,069 | 1134 | media |
| Zona 5 · Sur serrano y salinas | 0,054 | 1295 | media |

**Proyección 2026-2029:** se eligió el promedio de los últimos 3 años, que tuvo el menor error al predecir 2019-2025 con lo que se sabía hasta 2018 (error de 31,2 % en hectáreas). Confianza baja.

| Zona | 2026 | 2027 | 2028 | 2029 |
|---|---|---|---|---|
| Zona 1 · Riego del Río Dulce | 3.168 | 3.168 | 3.168 | 3.168 |
| Zona 2 · Secano del este | 19.573 | 19.573 | 19.573 | 19.573 |
| Zona 3 · Chaco semiárido norte | 29.173 | 29.173 | 29.173 | 29.173 |
| Zona 4 · Bajos submeridionales | 5.088 | 5.088 | 5.088 | 5.088 |
| Zona 5 · Sur serrano y salinas | 2.851 | 2.851 | 2.851 | 2.851 |

## 5. Zonificación

k-means (scikit-learn, n_init=20) sobre 11 variables estandarizadas, con 6000 píxeles al azar de toda la provincia a 1000 m. El mapa asigna cada píxel al centro más cercano en Earth Engine. k = 5, como propuso la cátedra (D-25). Silueta media con k = 5: 0.268. La mejor silueta se da con k = 2 (0.343); se mantiene k = 5 para conversar con las 5 zonas de BioSat.

Silueta por cantidad de grupos: k = 2: 0,343, k = 3: 0,246, k = 4: 0,256, k = 5: 0,268, k = 6: 0,237, k = 7: 0,230, k = 8: 0,230.

| Grupo | Nombre | Área (%) | Lluvia (mm) | Déficit (mm) | Máx. verano (°C) | Mín. invierno (°C) | pH | Arcilla (%) | Carbono (g/kg) |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Llanura semiárida cálida (Chaco Seco y Secano Este) | 38,2 | 620 | 941 | 35,0 | 7,1 | 6,91 | 22,8 | 15,2 |
| 1 | Llanura semiárida arenosa (Río Dulce y transición sur) | 28,0 | 587 | 979 | 34,7 | 5,0 | 7,07 | 17,6 | 13,1 |
| 2 | Llanura arcillosa con riesgo de anegamiento (Bajos) | 21,1 | 771 | 771 | 34,1 | 5,8 | 7,14 | 30,6 | 16,0 |
| 3 | Sierras y pedemonte fresco (Sierras del Sudoeste) | 10,4 | 661 | 858 | 33,3 | 4,5 | 6,86 | 19,5 | 14,4 |
| 4 | Humedales y paleocauces con alta materia orgánica | 2,2 | 737 | 797 | 33,8 | 5,3 | 7,05 | 27,5 | 24,8 |

| Zona de BioSat | Grupo que domina | Coincidencia (%) |
|---|---|---|
| Zona 1 · Riego del Río Dulce | 1 | 58,8 |
| Zona 2 · Secano del este | 0 | 55,0 |
| Zona 3 · Chaco semiárido norte | 0 | 85,4 |
| Zona 4 · Bajos submeridionales | 2 | 58,8 |
| Zona 5 · Sur serrano y salinas | 1 | 49,3 |

## 6. Meses de suelo pelado y fragilidad

600 puntos al azar sobre cultivos por zona. En cada punto, NDVI mediano (a 100 m) de cada mes calendario (2021-2025, sin nubes). Mes pelado: al menos la mitad de los puntos con NDVI < 0.25. Sensibilidad con 0,20 y 0,30: si cambia, el mes queda en meses_dudosos.

| Zona | Meses (■ pelado, ? dudoso) | Meses pelados | Fragilidad (0-100) | Monte 2015 desmontado en 2016-2025 (%) |
|---|---|---|---|---|
| Zona 1 · Riego del Río Dulce | EFMAMJj?a?s?o?n?D | 0 | 44,1 | 5,1 |
| Zona 2 · Secano del este | e?FMAMJj?a?S■?O■?N■?D■? | 4 | 57,9 | 17,2 |
| Zona 3 · Chaco semiárido norte | e?FMAMJj?a?S■?O■?N■?D■? | 4 | 63,8 | 8,6 |
| Zona 4 · Bajos submeridionales | EFMAMj?j?a?s?O■?N■?D■? | 3 | 50,5 | 8,1 |
| Zona 5 · Sur serrano y salinas | EFMAMJj?a?s?O■?n?D | 1 | 24,4 | 4,8 |

**Fórmula de fragilidad:** `100 * (0,35 * min(dias_calor_40 / 40, 1) + 0,30 * meses_pelados / 12 + 0,20 * min(deficit_mm / 1200, 1) + 0,15 * riesgo_desmonte)`. Es orientativa: los pesos los eligió el equipo (confianza baja).

## 7. Imágenes del visor

| Zona | Capa | Período | Escenas en la mediana |
|---|---|---|---|
| Z1 | verano | 2024-12-01 a 2025-03-31 | 32 |
| Z1 | invierno | 2025-06-01 a 2025-10-31 | 44 |
| Z2 | verano | 2024-12-01 a 2025-03-31 | 35 |
| Z2 | invierno | 2025-06-01 a 2025-10-31 | 42 |
| Z3 | verano | 2024-12-01 a 2025-03-31 | 22 |
| Z3 | invierno | 2025-06-01 a 2025-10-31 | 28 |
| Z3 | año 2000 | 2000-08-01 a 2000-11-30 | 19 |
| Z4 | verano | 2024-12-01 a 2025-03-31 | 33 |
| Z4 | invierno | 2025-06-01 a 2025-10-31 | 43 |
| Z5 | verano | 2024-12-01 a 2025-03-31 | 35 |
| Z5 | invierno | 2025-06-01 a 2025-10-31 | 49 |

## 8. Limitaciones

- **Hansen** mide pérdida de cobertura arbórea, no "desmonte legal": puede incluir incendios y no registra el monte que vuelve a crecer. En el monte abierto del Chaco puede subestimar raleos.
- **SoilGrids** es un modelo global a 250 m: sirve para comparar zonas, no reemplaza un análisis de suelo del lote.
- **GRIP4** es una red de caminos de 2018 y se usa igual en todos los cortes del modelo.
- **NDVI** no distingue el suelo pelado del rastrojo, y no hay datos de campo para medir su exactitud.
- **El riesgo** es una probabilidad estadística a partir del patrón 2016-2025: no anticipa cambios de ley, de precios ni de controles.
- **La fragilidad** combina datos reales con pesos elegidos por el equipo: es orientativa.

## 9. Criterio de confianza

| Confianza | Cuándo | Ejemplos |
|---|---|---|
| alta | Observación directa de satélite o producto de referencia con exactitud publicada | Historia de desmontes (Hansen) |
| media | Modelo global, o método con umbral sin validación local, con su incertidumbre a la vista | Suelo (SoilGrids), meses de suelo pelado, riesgo del modelo, zonificación |
| baja | Supuestos fuertes o pesos elegidos a mano | Fragilidad, proyección, riesgo con menos de 100 puntos |

## 10. Cómo volver a calcularlo

```bash
export EE_PROJECT=<id>
python -X utf8 -m ia_desmonte.correr_todo
python -X utf8 -m ia_desmonte.informe
```

Detalle en [`ia_desmonte/README.md`](../ia_desmonte/README.md). Registro de la última corrida: `ia_desmonte/salidas/registro_corrida.json`.
