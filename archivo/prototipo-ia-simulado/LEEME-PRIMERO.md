# Prototipo de IA con datos simulados (archivado)

> **Atención: todo lo de esta carpeta usa datos simulados.** No alimenta la app y sus números no son reales.

## Qué es

Es el primer prototipo de Santi para la zonificación y el modelo de desmontes (D-25 y D-28). Sirvió para armar el método: los pasos, los modelos y el reporte.

## Por qué no se usa

- `python/compilar_notebook.py` **genera con `np.random`** las tablas de entrenamiento y de prueba del modelo de desmontes. Lo que dice "2001-2015" y "2016-2023" son dos semillas distintas, no años.
- La historia de desmontes por zona, el riesgo por zona y los valores de suelo y clima de `data/zonas_bioclima_suelo.csv` están **escritos a mano**.
- Por eso sus métricas (por ejemplo, AUC 0,986 y silueta 0,563) **no miden nada real**. Lo mismo vale para los gráficos, el PDF y los registros de esta carpeta.

## Dónde están los datos reales

En [`ia_desmonte/`](../../ia_desmonte/), calculados con Google Earth Engine a partir de Hansen, SoilGrids, TerraClimate, Landsat y ESA WorldCover. Fuentes, métodos, métricas y limitaciones: [`docs/datos-y-metodos.md`](../../docs/datos-y-metodos.md).

Se archivó el 14/11/2026 (decisión D-30 de la [bitácora](../../docs/reglas-y-bitacora.md)).
