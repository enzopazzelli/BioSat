# Explicación Técnica: Curvas ROC y Validación Temporal Out-of-Time

> **Gráfico Asociado:** [`../04_curvas_roc_modelos.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/04_curvas_roc_modelos.png)  
> **Tema:** Evaluación Comparativa de Modelos Supervisados · Frente 3

---

## 1. El Rigor Metodológico: Validación Temporal (Out-of-Time)
En problemas de detección de deforestación por satélite, el error más común es hacer una partición aleatoria de píxeles (`train_test_split(random_state=...)`). Esto genera **fuga de datos (data leakage)** y autocorrelación espacial: el modelo memoriza píxeles vecinos del mismo lote en el mismo año, inflando falsamente el rendimiento.

Para evitar esto, implementamos una **validación temporal estricta**:
- **Conjunto de Entrenamiento:** Predictores calculados a 2008 $\rightarrow$ Eventos de desmonte entre 2009 y 2015.
- **Conjunto de Prueba Independiente:** Predictores calculados a 2015 $\rightarrow$ Eventos de desmonte reales ocurridos entre 2016 y 2023.

El modelo es evaluado en el "futuro", exactamente como operará en la vida real.

---

## 2. Comparación de Curvas ROC y Valores AUC
- **Regresión Logística (Baseline Lineal):** $\text{AUC} = \mathbf{0.984}$.
- **Random Forest (150 Árboles):** $\text{AUC} = \mathbf{0.971}$.
- **Árbol Simple CART:** $\text{AUC} = \mathbf{0.892}$.

### ¿Por qué la Regresión Logística tiene un AUC ligeramente superior?
La presión de desmonte en Santiago del Estero está gobernada por fuerzas de accesibilidad física continuas y monótonas: a menor distancia a un camino y a menor distancia al borde del monte, mayor es la probabilidad de tala. La Regresión Logística modela estas transiciones continuas de forma suave mediante la función sigmoide sin saltos discretos.

### ¿Por qué se elige Random Forest como modelo definitivo?
Aunque la Regresión Logística obtiene un AUC ligeramente mayor en datos globales, **Random Forest es superior para predecir no linealidades críticas en el territorio**:
- Si la pendiente supera los 3.5 grados, el desmonte es prácticamente nulo independientemente de la cercanía a un camino.
- Si una parcela está dentro de un Área Protegida declarada (Parque Nacional Copo), la probabilidad cae a cero aun estando al lado de un lote desmontado.
Random Forest captura estas interacciones umbral y reglas combinadas sin necesidad de ingeniería manual de características.
