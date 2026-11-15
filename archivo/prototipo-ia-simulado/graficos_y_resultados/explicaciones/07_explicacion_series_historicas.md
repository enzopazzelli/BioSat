# Explicación Técnica: Serie Histórica Anual de Desmonte (2001-2023)

> **Gráfico Asociado:** [`../07_serie_historica_desmonte.png`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/07_serie_historica_desmonte.png)  
> **Tema:** Dinámica Temporal del Chaco Seco · Frente 3

---

## 1. La Curva Histórica de Deforestación en Santiago del Estero
El gráfico refleja la serie temporal de pérdida de cobertura boscosa anual en hectáreas (Hansen Global Forest Change v1.11 / Landsat 30m) para las celdas de las 5 zonas entre 2001 y 2023:

- **Período de Expansión Explosiva (2001–2007):**  
  Marcado por el boom del precio internacional de los granos y la adopción masiva del paquete tecnológico (soja transgénica + glifosato + siembra directa). Las Zonas 2 (Secano Quimilí) y 3 (Copo) alcanzaron picos superiores a las 5.000 ha/año por celda.
- **Punto de Inflexión (2007–2009):**  
  Sanción de la Ley Nacional de Bosques (Ley 26.331) y el ordenamiento territorial de bosques nativos (OTBN). A partir de allí, el desmonte formal disminuye.
- **Período Reciente (2015–2023):**  
  Tasas anuales menores pero sostenidas. La Zona 3 (Copo) se mantiene como el área con mayor actividad absoluta (~1.500 ha/año), mientras que la Zona 2 estabiliza su pérdida en ~600 ha/año debido a que el monte remanente ya es muy escaso.
- **Zonas 1, 4 y 5:**  
  Mantienen niveles históricos bajos (<100 ha/año) debido a limitaciones edáficas (salitre), hidromórficas (inundación) o topográficas (serranía).

---

## 2. Aplicación en el Modelo Temporal
Esta serie alimenta el modelo autorregresivo que proyecta el desmonte anual para el período 2024–2028 en [`desmonte_zonas.json`](file:///Users/santig56/Desktop/Nasa/santi-task/data/desmonte_zonas.json), permitiendo al simulador estimar cuántas hectáreas de monte nativo desaparecerán en el entorno del productor en los próximos 5 años si no se implementan incentivos de rotación sustentable.
