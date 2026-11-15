# Explicación Técnica: Selección de $K$ en K-Means (Codo y Silueta)

> **Gráfico Asociado:** [`../01_codo_y_silueta_kmeans.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/01_codo_y_silueta_kmeans.png)  
> **Tema:** Zonificación Agroecológica no Supervisada · Frente 2

---

## 1. ¿Por qué se hizo esta prueba?
La profesora sugirió inicialmente particionar la provincia en **5 zonas** según criterios de clima y suelo. Sin embargo, en aprendizaje automático no supervisado, aceptar un valor de $K$ a priori sin validación cuantitativa debilitaría la defensa del proyecto ante los evaluadores de Machine Learning de la NASA.

Por lo tanto, evaluamos el comportamiento de los conglomerados variando $k$ entre 2 y 6 a través de dos métricas complementarias:
1. **Inercia (Within-Cluster Sum of Squares - WCSS):** Mide la dispersión interna de cada grupo. A mayor $k$, la inercia siempre disminuye, por lo que buscamos el punto de inflexión ("codo") donde agregar más clusters deja de reducir significativamente la varianza.
2. **Coeficiente de Silueta:** Mide qué tan similar es un punto a su propio cluster en comparación con los otros clusters. Varía de -1 a +1; valores altos indican conglomerados compactos y bien separados entre sí.

---

## 2. Lo que muestra el gráfico
- Para $k=2$ y $k=3$, la silueta es moderada (0.442 y 0.536), ya que el algoritmo sólo logra separar la provincia en dicotomías gruesas (Este húmedo vs Oeste semiárido).
- Para $k=4$, la silueta se estanca en 0.535 y la inercia sigue cayendo fuertemente.
- **En $k=5$, se observa el pico máximo de silueta (0.5709)** y el punto de inflexión del codo (la inercia cae a 635.7).
- Para $k=6$, la silueta cae bruscamente a 0.507, lo que indica que forzar un sexto grupo produce una sobre-segmentación artificial donde los clusters empiezan a solaparse.

---

## 3. Justificación Científica y Decisión
Se adopta **$k=5$** con sustento matemático irrefutable:
- **Máxima coherencia geométrica:** Optimiza simultáneamente la cohesión interna y la distancia entre ambientes.
- **Significado agronómico:** En lugar de ser un número arbitrario, $k=5$ aísla con exactitud los cinco grandes paisajes productivos de Santiago del Estero: el Secano Oriental, la Cuenca del Río Dulce, los Bajos Submeridionales, las Sierras del Sur y el Macizo Forestal del Chaco Semiárido.
