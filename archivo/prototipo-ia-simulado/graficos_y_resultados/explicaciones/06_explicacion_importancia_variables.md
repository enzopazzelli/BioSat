# Explicación Técnica: Importancia de Variables en Random Forest

> **Gráfico Asociado:** [`../06_importancia_variables_rf.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/06_importancia_variables_rf.png)  
> **Tema:** Explicabilidad de IA y Fuerzas Territoriales · Frente 3

---

## 1. El Hallazgo Central: El "Trío de Accesibilidad" explica el 73.3%
Al analizar la ganancia Gini de las 150 rondas de partición de los árboles de Random Forest, se observa una jerarquía contundente:

1. **Distancia a Caminos / Vías (`dist_caminos_m`): 28.4%**  
   *Mecanismo:* La maquinaria pesada requerida para desmontar (topadoras con cadenas, camiones de flete) exige accesibilidad logística. Las áreas a más de 15 km de un camino transitable tienen una probabilidad de desmonte que se reduce exponencialmente.
2. **Distancia a Desmonte Previo (`dist_desmonte_previo_m`): 24.3%**  
   *Mecanismo (Efecto Contagio):* El desmonte no ocurre como islas aisladas en medio de la nada; avanza como un frente progresivo adyacente a campos agrícolas consolidados que ya cuentan con pozos de agua, silos y electricidad.
3. **Distancia al Borde del Monte (`dist_sin_monte_m`): 20.6%**  
   *Mecanismo (Efecto Borde):* La fragmentación de la matriz forestal facilita la entrada de fuegos y avance agrícola sobre los relictos remanentes.

---

## 2. Los Factores de Freno y Moduladores Biofísicos
- **Pendiente Topográfica (7.8%):** Actúa como un umbral estricto; el relieve serrano de la Zona 5 (Sumampa) frena la agricultura mecanizada extensiva.
- **Áreas Protegidas (5.1%):** Imponen una barrera legal efectiva en parques nacionales y reservas (ej. Copo).
- **Variables de Suelo y Clima (Arcilla, Déficit Hídrico, pH, Población) (~13.8% acumulado):** Definen la rentabilidad agronómica esperada una vez desmontado el lote (suelos con más arcilla y menor déficit son más cotizados).

---

## 3. Valor para el Simulador BioSat
Este resultado demuestra que el desmonte en el Chaco Seco es un **fenómeno primariamente espacial y logístico**, modulado secundariamente por la fertilidad del suelo. El motor de reglas de BioSat utiliza este gradiente para advertir al productor sobre la vulnerabilidad de sus cortinas forestales según su cercanía a caminos y bordes agrícolas.
