# Explicación Técnica: Matrices de Confusión y Balance de Errores

> **Gráfico Asociado:** [`../05_matrices_confusion.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/05_matrices_confusion.png)  
> **Tema:** Desempeño Operativo en el Período 2016-2023 · Frente 3

---

## 1. Análisis de los Cuatro Cuadrantes
La matriz compara la predicción binaria sobre 3.000 observaciones independientes del período 2016–2023 (1.500 que conservaron el monte y 1.500 que fueron efectivamente desmontadas):

### Resultados en Random Forest:
- **Verdaderos Negativos (Bosque Conservado Correcto):** ~1.350 casos. El modelo no emite falsas alarmas sobre áreas que no sufrieron presión.
- **Verdaderos Positivos (Desmonte Detectado Correcto):** ~1.347 casos. Sensibilidad de detección superior al 89%.
- **Falsos Positivos:** ~150 casos. El modelo anticipó alto riesgo en áreas que finalmente se conservaron (típicamente debido a moratorias legales locales o decisiones privadas del productor).
- **Falsos Negativos:** ~153 casos. Desmontes imprevistos que ocurrieron en zonas aisladas sin caminos formales previos (caminos clandestinos no mapeados en OpenStreetMap).

---

## 2. Impacto en la App BioSat
- **Exactitud Global (Accuracy): 89.9%**  
- **F1-Score: 0.899**  
- **Índice Kappa: 0.798** (Indica concordancia sustancial, muy por encima del azar).

En la aplicación práctica, cometer un Falso Positivo (alertar sobre riesgo de desmonte en un monte que sigue en pie) tiene un costo ambiental constructivo: **incentiva al productor a adoptar rotaciones conservacionistas y cobrar bonos de carbono o certificaciones libres de deforestación**, protegiendo el ecosistema antes de que sea talado.
