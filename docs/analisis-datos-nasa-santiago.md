# Informe: qué dicen los datos de clima de la NASA sobre Santiago del Estero

> **Fuente:** NASA POWER (MERRA-2), datos diarios 1981-2025, un punto por zona ([`data/clima_zonas.json`](../data/clima_zonas.json)). Es un modelo de reanálisis con celdas de unos 50 km: describe **la zona**, no un lote en particular.
> **Cómo se compara:** lo **normal** es el promedio 1991-2020 y lo **reciente** es 2021-2025. Cinco años son pocos para hablar de tendencia: se presentan como "lo que viene pasando".
> **Demanda de agua:** ET0 con la fórmula de Hargreaves (temperatura máxima y mínima).
> **Cómo se generó:** con un script, directamente desde `data/clima_zonas.json` y la caché diaria de NASA POWER (D-26). Reemplaza la versión anterior, que usaba solo 2020-2025 y tenía mal la unidad de la evapotranspiración (D-16).

---

## 1. Los hallazgos principales

1. **Falta agua todo el año.** En las 5 zonas la demanda de agua supera a la lluvia: faltan entre 838 y 1.020 mm por año. Un suelo pelado pierde la poca agua que guarda.
2. **El calor extremo se duplicó en el centro, el norte y el este.** En la Zona 3 (Campo Gallo) los días de más de 40 °C pasaron de 17,3 por año (1991-2020) a 38,0 (2021-2025). Los años con más días de calor extremo desde 1981 son casi todos recientes.
3. **La lluvia llega concentrada.** Entre noviembre y marzo cae la mayor parte, con días de más de 100 mm. Si cae sobre suelo pelado, escurre en vez de entrar.
4. **El invierno y la primavera son secos.** De junio a septiembre llueve muy poco y septiembre-octubre junta poca agua con calor que ya supera los 35 °C.
5. **El sur es otro clima.** En la Zona 5 (Ojo de Agua) hay 2,2 días de más de 40 °C por año y 20,5 días de helada: el problema ahí es el frío, no el calor (D-18).

---

## 2. Tabla de las 5 zonas

| Zona | Lluvia mm/año (normal → reciente) | Agua que falta (mm/año) | Días > 40 °C (normal → reciente) | Heladas por año | Época de heladas | Racha seca máx. (días) | Día más lluvioso desde 1981 |
|---|---|---|---|---|---|---|---|
| 1 · Área de riego del Río Dulce (La Banda) | 763 → 824 | 1.020 | 16,2 → **30,6** | 9,6 | 19/06 a 12/08 | 162 | 207 mm (23/03/2021) |
| 2 · Secano agrícola del este (Quimilí) | 830 → 702 | 886 | 13,6 → **31,6** | 6,9 | 25/06 a 01/08 | 131 | 135 mm (16/03/2019) |
| 3 · Chaco semiárido norte (Campo Gallo) | 810 → 683 | 973 | 17,3 → **38,0** | 5,0 | 26/06 a 29/07 | 131 | 112 mm (05/01/2011) |
| 4 · Bajos submeridionales (Añatuya) | 756 → 721 | 965 | 14,1 → **28,2** | 9,7 | 18/06 a 02/08 | 163 | 103 mm (05/01/2011) |
| 5 · Sur serrano y salinas (Ojo de Agua) | 739 → 709 | 838 | 2,2 → **7,0** | 20,5 | 30/05 a 28/08 | 144 | 100 mm (02/02/2015) |

*Agua que falta = ET0 − lluvia, normal 1991-2020. Helada = mínima de 3 °C o menos a 2 m de altura.*

---

## 3. Zona por zona

### Zona 1: Área de riego del Río Dulce (La Banda, -27,73°, -64,17°)

- **Agua:**
  - Llueven 763 mm por año en lo normal (1991-2020) y 824 mm en 2021-2025.
  - La demanda de agua (ET0) es de 1.783 mm, así que **faltan 1.020 mm por año**.
  - El mes más lluvioso es enero (159 mm en promedio).
  - Meses con menos de 10 mm: julio, agosto.
- **Calor:**
  - Días de más de 35 °C: 92 por año en lo normal y 113 en 2021-2025.
  - Días de más de 40 °C: pasan de 16,2 a **30,6**.
  - Años con más días de más de 40 °C desde 1981: 2025 (36), 2022 (35), 1989 (34), 2003 (34).
  - Récord: 47,4 °C el 23/11/2003.
- **Heladas:** 9,6 días por año con mínima de 3 °C o menos, típicamente entre el 19/06 y el 12/08.
- **Extremos de lluvia:**
  - Racha más larga sin lluvia útil (menos de 2 mm por día): 162 días, terminó el 05/11/2009.
  - Día más lluvioso desde 1981: 207 mm el 23/03/2021.
- **Mes más peligroso para un suelo pelado:** septiembre: llueven 14 mm y ya hay 6 días de más de 35 °C.
- **Humedad en raíces 2021-2025:** el mes más seco respecto de lo normal fue febrero (anomalía de -3,8 puntos de `GWETROOT`).

### Zona 2: Secano agrícola del este (Quimilí, -27,65°, -62,42°)

- **Agua:**
  - Llueven 830 mm por año en lo normal (1991-2020) y 702 mm en 2021-2025.
  - La demanda de agua (ET0) es de 1.716 mm, así que **faltan 886 mm por año**.
  - El mes más lluvioso es enero (135 mm en promedio).
  - Meses con menos de 10 mm: julio.
- **Calor:**
  - Días de más de 35 °C: 83 por año en lo normal y 111 en 2021-2025.
  - Días de más de 40 °C: pasan de 13,6 a **31,6**.
  - Años con más días de más de 40 °C desde 1981: 2022 (40), 2025 (39), 2023 (37), 2024 (32).
  - Récord: 46,5 °C el 16/10/2023.
- **Heladas:** 6,9 días por año con mínima de 3 °C o menos, típicamente entre el 25/06 y el 01/08.
- **Extremos de lluvia:**
  - Racha más larga sin lluvia útil (menos de 2 mm por día): 131 días, terminó el 20/10/2020.
  - Día más lluvioso desde 1981: 135 mm el 16/03/2019.
- **Mes más peligroso para un suelo pelado:** septiembre: llueven 22 mm y ya hay 6 días de más de 35 °C.
- **Humedad en raíces 2021-2025:** el mes más seco respecto de lo normal fue enero (anomalía de -4,2 puntos de `GWETROOT`).

### Zona 3: Chaco semiárido norte (Campo Gallo, -26,58°, -62,85°)

- **Agua:**
  - Llueven 810 mm por año en lo normal (1991-2020) y 683 mm en 2021-2025.
  - La demanda de agua (ET0) es de 1.783 mm, así que **faltan 973 mm por año**.
  - El mes más lluvioso es enero (161 mm en promedio).
  - Meses con menos de 10 mm: julio, agosto.
- **Calor:**
  - Días de más de 35 °C: 96 por año en lo normal y 128 en 2021-2025.
  - Días de más de 40 °C: pasan de 17,3 a **38,0**.
  - Años con más días de más de 40 °C desde 1981: 2025 (49), 2024 (44), 2023 (41), 2022 (39).
  - Récord: 47,4 °C el 09/12/2022.
- **Heladas:** 5,0 días por año con mínima de 3 °C o menos, típicamente entre el 26/06 y el 29/07.
- **Extremos de lluvia:**
  - Racha más larga sin lluvia útil (menos de 2 mm por día): 131 días, terminó el 25/09/1995.
  - Día más lluvioso desde 1981: 112 mm el 05/01/2011.
- **Mes más peligroso para un suelo pelado:** septiembre: llueven 16 mm y ya hay 8 días de más de 35 °C.
- **Humedad en raíces 2021-2025:** el mes más seco respecto de lo normal fue febrero (anomalía de -6,1 puntos de `GWETROOT`).

### Zona 4: Bajos submeridionales (Añatuya, -28,46°, -62,83°)

- **Agua:**
  - Llueven 756 mm por año en lo normal (1991-2020) y 721 mm en 2021-2025.
  - La demanda de agua (ET0) es de 1.721 mm, así que **faltan 965 mm por año**.
  - El mes más lluvioso es enero (129 mm en promedio).
  - Meses con menos de 10 mm: julio, agosto.
- **Calor:**
  - Días de más de 35 °C: 84 por año en lo normal y 99 en 2021-2025.
  - Días de más de 40 °C: pasan de 14,1 a **28,2**.
  - Años con más días de más de 40 °C desde 1981: 2022 (39), 2025 (35), 2006 (33), 2003 (29).
  - Récord: 47,1 °C el 02/11/2009.
- **Heladas:** 9,7 días por año con mínima de 3 °C o menos, típicamente entre el 18/06 y el 02/08.
- **Extremos de lluvia:**
  - Racha más larga sin lluvia útil (menos de 2 mm por día): 163 días, terminó el 18/09/2008.
  - Día más lluvioso desde 1981: 103 mm el 05/01/2011.
- **Mes más peligroso para un suelo pelado:** septiembre: llueven 21 mm y ya hay 5 días de más de 35 °C.
- **Humedad en raíces 2021-2025:** el mes más seco respecto de lo normal fue febrero (anomalía de -2,7 puntos de `GWETROOT`).

### Zona 5: Sur serrano y salinas (Ojo de Agua, -29,50°, -63,69°)

- **Agua:**
  - Llueven 739 mm por año en lo normal (1991-2020) y 709 mm en 2021-2025.
  - La demanda de agua (ET0) es de 1.577 mm, así que **faltan 838 mm por año**.
  - El mes más lluvioso es diciembre (117 mm en promedio).
  - Meses con menos de 10 mm: julio, agosto.
- **Calor:**
  - Días de más de 35 °C: 36 por año en lo normal y 54 en 2021-2025.
  - Días de más de 40 °C: pasan de 2,2 a **7,0**.
  - Años con más días de más de 40 °C desde 1981: 2022 (15), 2025 (11), 2003 (8), 1986 (7).
  - Récord: 43,8 °C el 11/11/1988.
- **Heladas:** 20,5 días por año con mínima de 3 °C o menos, típicamente entre el 30/05 y el 28/08.
- **Extremos de lluvia:**
  - Racha más larga sin lluvia útil (menos de 2 mm por día): 144 días, terminó el 27/09/1995.
  - Día más lluvioso desde 1981: 100 mm el 02/02/2015.
- **Mes más peligroso para un suelo pelado:** septiembre: llueven 21 mm y ya hay 1 días de más de 35 °C.
- **Humedad en raíces 2021-2025:** el mes más seco respecto de lo normal fue febrero (anomalía de -2,2 puntos de `GWETROOT`).

---

## 4. Qué significa para las rotaciones

- **Tapar el suelo en la seca** (mayo a octubre) con rastrojo, coberturas o pasturas reduce la pérdida de agua y el ascenso de sales (Zonas 1 y 4).
- **Correr la siembra** para que la floración no caiga en diciembre-enero, los meses con más días de más de 40 °C (siembras tardías de maíz o sorgo en las Zonas 2 y 3).
- **Secar a tiempo las coberturas de invierno**, antes de septiembre, cuando el agua del suelo está en su mínimo (Zona 2).
- **En el sur, elegir especies que aguanten las heladas** (Zona 5).

Estas ideas son las que la app convierte en el calendario del lote, el riesgo por frecuencia y la comparación de rotaciones.
