# Explicación Técnica: Correspondencia Territorial con las 5 Zonas BioSat

> **Gráfico Asociado:** [`../03_matriz_correspondencia_zonas.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/03_matriz_correspondencia_zonas.png)  
> **Tema:** Validación Cruzada Territorial · Contrato §7

---

## 1. ¿Qué evalúa esta matriz?
La matriz evalúa la pureza y concordancia entre las **5 zonas fijas de BioSat** (celdas rectangulares de 0.5° × 0.625° tomadas de NASA POWER) y la clasificación generada de forma completamente no supervisada por K-Means sobre las 11 variables continuas de clima y suelo.

---

## 2. Resultado y Diagnóstico
- **Coincidencia del 100.0% en todas las zonas:**
  - Zona 1 (Riego Río Dulce) $\rightarrow$ 100.0% asignada al Cluster 1.
  - Zona 2 (Secano Quimilí) $\rightarrow$ 100.0% asignada al Cluster 0.
  - Zona 3 (Monte Copo) $\rightarrow$ 100.0% asignada al Cluster 4.
  - Zona 4 (Bajos Submeridionales) $\rightarrow$ 100.0% asignada al Cluster 2.
  - Zona 5 (Sur Serrano) $\rightarrow$ 100.0% asignada al Cluster 3.

---

## 3. Implicancia para el Proyecto BioSat
Esta validación cruzada demuestra que:
1. **No existe ambigüedad de límites:** Cada celda representativa elegida por el equipo responde a un arquetipo ambiental químicamente y climáticamente diferenciable.
2. **Robustez ante el jurado:** El equipo puede defender que las 5 zonas de la app web no son divisiones políticas ni arbitrarias, sino que coinciden con los conglomerados generados por algoritmos no supervisados de Machine Learning.
