# Informe Completo de Evaluación: Modelos de IA en BioSat
## Zonificación Agroecológica K-Means y Predicción de Desmonte con Random Forest

> **Documento:** White Paper Metodológico y Defensa de IA  
> **Autor:** Santi (Frente 2: Suelo/Zonificación & Frente 3: IA Desmonte)  
> **Proyecto:** BioSat · NASA Space Apps Challenge 2026  
> **Ubicación:** [`santi-task/graficos_y_resultados/explicaciones/`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/explicaciones/)

---

## 1. Resumen Ejecutivo
Para responder con rigor científico al desafío de la NASA y cumplir con la propuesta metodológica de la cátedra de Sistemas de IA (D-25), el equipo descartó modelos de visión computacional sobre parches satelitales (inviables en tiempo y carentes de etiquetas temporales limpias) y concentró la potencia de Machine Learning en dos arquitecturas clave:
1. **Zonificación Agroecológica no Supervisada (K-Means):** Evaluación cuantitativa mediante el método del codo y coeficiente de silueta ($k=2..6$), demostrando que **$k=5$ es el óptimo bioclimático** (Silueta = 0.571).
2. **Modelo Predictivo de Riesgo de Deforestación (Random Forest vs Regresión Logística):** Entrenamiento con **validación temporal out-of-time** sobre 6.000 observaciones de Hansen GFC (Landsat 30m), obteniendo un **ROC-AUC de 0.971** y un **F1-Score de 0.899** en el período de prueba 2016–2023.
3. **Explicabilidad Espacial:** Se identificó que el **73.3%** de la presión de desmonte está regido por la accesibilidad vial (`dist_caminos_m`: 28.4%), el contagio de desmontes previos (`dist_desmonte_previo_m`: 24.3%) y el efecto borde (`dist_sin_monte_m`: 20.6%).

---

## 2. Índice de Gráficos y Evidencia Experimental

| Gráfico | Archivo PNG | Métrica / Hallazgo Clave |
| :--- | :--- | :--- |
| **1. Codo y Silueta** | [`01_codo_y_silueta_kmeans.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/01_codo_y_silueta_kmeans.png) | $K=5$ maximiza la silueta (**0.571**) frente a $k=4$ (0.535) y $k=6$ (0.507). |
| **2. Perfiles de Clusters** | [`02_heatmap_perfiles_clusters.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/02_heatmap_perfiles_clusters.png) | Aísla nítidamente vertisoles pesados, suelos salitrosos y el macizo forestal. |
| **3. Cruce Territorial** | [`03_matriz_correspondencia_zonas.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/03_matriz_correspondencia_zonas.png) | **100% de coincidencia** entre los clusters K-Means y las 5 zonas de BioSat. |
| **4. Curvas ROC** | [`04_curvas_roc_modelos.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/04_curvas_roc_modelos.png) | Random Forest (**AUC 0.971**) y Logística (**AUC 0.984**) en test temporal 2016–2023. |
| **5. Matrices de Confusión** | [`05_matrices_confusion.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/05_matrices_confusion.png) | Exactitud global del **89.9%** con Kappa de **0.798**. |
| **6. Importancia de Variables** | [`06_importancia_variables_rf.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/06_importancia_variables_rf.png) | Caminos y proximidad antrópica dominan sobre los factores edáficos puros. |
| **7. Serie Histórica** | [`07_serie_historica_desmonte.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/07_serie_historica_desmonte.png) | Pico histórico 2004–2012 y desaceleración post Ley de Bosques. |
| **8. Score de Riesgo Zonal** | [`08_riesgo_desmonte_por_zona.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/08_riesgo_desmonte_por_zona.png) | Zona 3 (Copo, **0.58**) y Zona 2 (Quimilí, **0.38**) concentran la urgencia de conservación. |

---

## 3. Tabla Resumen de Métricas de Modelado

```csv
Modelo,Tipo,ROC-AUC,F1-Score,Accuracy,Cohen-Kappa
Regresión Logística,Paramétrico Lineal,0.9837,0.9246,0.9240,0.8480
Árbol Simple CART,No Paramétrico (Árbol Único),0.8920,0.8310,0.8300,0.6600
Random Forest (150 Árboles),Ensemble Bagging,0.9709,0.8986,0.8990,0.7980
```

---

## 4. Conclusión Metodológica y Articulación con BioSat
1. **Contrato §7 (`zonificacion_aizal.json`):** Validado por K-Means con respaldo matemático y agronómico.
2. **Contrato §8 (`desmonte_zonas.json`):** Provee el score de riesgo medio y la proyección anual de hectáreas que el motor de BioSat utiliza para recomendar rotaciones conservacionistas en zonas bajo presión.
3. **Reproducibilidad Total:** Cualquier evaluador puede re-ejecutar el análisis en 30 segundos corriendo el notebook [`BioSat_IA_Zonificacion_y_Desmonte.ipynb`](file:///Users/santig56/Desktop/Nasa/santi-task/BioSat_IA_Zonificacion_y_Desmonte.ipynb).
