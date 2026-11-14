# Explicación Técnica: Presión de Desmonte y Riesgo Medio por Zona

> **Gráfico Asociado:** [`../08_riesgo_desmonte_por_zona.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/08_riesgo_desmonte_por_zona.png)  
> **Tema:** Calibración Zonal y Accionabilidad Agronómica · Contrato §8

---

## 1. El Score de Riesgo Continuo (0 a 1)
El modelo Random Forest entrenado en modo probabilidad (`setOutputMode('PROBABILITY')`) calculó la probabilidad de desmonte para cada píxel de monte remanente al año 2023. Al promediar estos valores dentro de cada celda BioSat, obtenemos el score de riesgo medio por zona:

| Zona | Monte Remanente 2023 | Score de Riesgo (0 a 1) | Nivel de Alerta |
| :--- | :---: | :---: | :---: |
| **Zona 3: Monte Semiárido (Copo)** | 64.2% | **0.58** | 🚨 **Alerta Crítica (Máxima Presión)** |
| **Zona 2: Secano Este (Quimilí)** | 21.4% | **0.38** | ⚠️ **Alerta Moderada-Alta** |
| **Zona 4: Bajos Submeridionales** | 16.5% | **0.16** | 🟢 **Bajo Riesgo** |
| **Zona 5: Sur Serrano (Sumampa)** | 44.8% | **0.11** | 🟢 **Bajo Riesgo** |
| **Zona 1: Área de Riego (Río Dulce)** | 7.8% | **0.08** | 🟢 **Muy Bajo Riesgo** |

---

## 2. ¿Cómo influye este dato en el Motor de Reglas de BioSat?
El score de riesgo de desmonte no es un dato pasivo de visualización: **altera las recomendaciones del simulador de rotaciones:**

1. **En Zonas de Riesgo Crítico (Zona 3 · Score 0.58):**  
   - El motor penaliza la apertura de nuevos lotes.  
   - Prioriza esquemas de **Manejo de Bosques con Ganadería Integrada (MBGI)** y rotaciones con pasturas megatérmicas bajo monte (Gatton Panic / Buffel Grass).
   - Activa tarjetas de alerta sobre créditos de carbono y sellos de exportación libre de deforestación (Reglamento EUDR de la Unión Europea).

2. **En Zonas de Riesgo Moderado (Zona 2 · Score 0.38):**  
   - Fomenta la conservación estricta de las cortinas rompevientos y relictos de monte para frenar la erosión eólica y regular el balance hídrico local.

3. **En Zonas de Bajo Riesgo (Zonas 1, 4 y 5):**  
   - El motor se enfoca en los problemas edáficos locales: mitigación de salinidad en Zona 1, manejo de anegamiento en Zona 4, y prevención de erosión en laderas en Zona 5.
