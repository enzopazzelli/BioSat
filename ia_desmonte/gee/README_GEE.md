# Módulo Google Earth Engine (GEE): Extracción y Procesamiento Satelital

> **Ubicación:** `santi-task/gee/`  
> **Script Único Consolidado:** [`biosat_gee_pipeline_completo.js`](file:///Users/santig56/Desktop/Nasa/santi-task/gee/biosat_gee_pipeline_completo.js)  
> **Destinatario:** Santi (Frente 2 & 3) / Equipo BioSat

---

## 1. Limpieza y Consolidación Realizada
Para evitar scripts duplicados o borradores confusos antes de subir al repositorio:
- Se eliminaron los scripts intermedios parciales (`01_zonificacion_kmeans.js` y `02_modelo_desmonte_random_forest.js`).
- Se consolidó todo en **un único script de producción**: [`biosat_gee_pipeline_completo.js`](file:///Users/santig56/Desktop/Nasa/santi-task/gee/biosat_gee_pipeline_completo.js).

---

## 2. ¿Cuándo se usa este script de GEE y cuándo NO?

- **NO es necesario ejecutarlo en GEE si estás trabajando con el Notebook o la App:**  
  Los datasets ya fueron extraídos, calibrados y guardados en CSV dentro de [`santi-task/data/`](file:///Users/santig56/Desktop/Nasa/santi-task/data/). El modelado, los gráficos y los contratos JSON se resuelven de forma 100% reproducible en el Jupyter Notebook [`BioSat_IA_Zonificacion_y_Desmonte.ipynb`](file:///Users/santig56/Desktop/Nasa/santi-task/BioSat_IA_Zonificacion_y_Desmonte.ipynb).
- **SÍ se usa en GEE si querés:**  
  1. Generar la App pública de Earth Engine con las capas interactivas de satélite para el pitch de Sara.
  2. Exportar los mapas raster GeoTIFF a escala provincial (250 m y 500 m) a Google Drive.

---

## 3. Contenido del Script `biosat_gee_pipeline_completo.js`
1. **Parte A · Zonificación K-Means:** Ingesta de TerraClimate y SoilGrids 250m, estandarización Z-score, clustering con $K=5$ y cruce territorial con las 5 celdas de NASA POWER.
2. **Parte B · Random Forest:** Extracción de pérdida boscosa (Hansen Global Forest Change v1.11), cálculo de distancias euclidianas a caminos y desmontes previos, validación temporal (Train $\le 2015$, Test $2016–2023$) y exportación del mapa de probabilidad continua de desmonte.
