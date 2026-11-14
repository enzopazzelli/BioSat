# Informe Detallado: Qué Descubrimos en los Datos Reales de la NASA sobre Santiago del Estero

> **Fuente de los datos:** API Agroclimatológica **NASA POWER** (Modelo MERRA-2 de la NASA).
> **Volumen procesado:** **8.768 registros diarios** (**2.192 días seguidos por cada una de las 4 zonas**, desde el `01/01/2020` hasta el `31/12/2025`), guardados en [`data/nasa_power_santiago_zonas.json`](../data/nasa_power_santiago_zonas.json) y [`data/resumen_mensual_santiago.csv`](../data/resumen_mensual_santiago.csv).

---

## 1. Los 5 Grandes Descubrimientos Provinciales (La "Radiografía" de Santiago del Estero)

Al analizar día por día los últimos 6 años completos de datos satelitales y de reanálisis de la NASA en las 4 zonas de la provincia, aparecen **5 patrones contundentes** que explican por qué los productores santiagueños sufren pérdidas y por qué es urgente cambiar las rotaciones:

### Hallazgo 1: Un tercio del año supera los 35 °C (y los días de > 40 °C se duplicaron)
- En toda la provincia hay entre **100 y 126 días al año con máximas superiores a 35 °C** (el umbral donde el polen del maíz o la flor de la soja sufren aborto térmico y la planta frena su crecimiento).
- **Lo más grave es la tendencia reciente:** Comparando `2020–2021` contra `2023–2025`, la cantidad de días de **calor extremo (> 40 °C) casi se duplicó** en todas las zonas:
  - En el **Norte / Monte (Campo Gallo)** pasó de **17–27 días > 40 °C** a **41, 44 y 49 días > 40 °C por año** en 2023, 2024 y 2025, con un **récord absoluto de 47,35 °C** (09/12/2022).
  - En el **Secano Este (Quimilí/Bandera)** llegó a **46,50 °C a mitad de octubre** (16/10/2023), antes siquiera de que empiece el verano.
  - En **La Banda / Robles** se registró una **ola de calor ininterrumpida de 33 días seguidos por encima de 35 °C** (diciembre 2021 – enero 2022).

### Hallazgo 2: Sequías de 130 a 163 días seguidos sin una sola lluvia útil (< 2 mm)
- Santiago del Estero no tiene lluvias repartidas: tiene un **corte total de agua en otoño-invierno-primavera**.
- La NASA registra rachas continuas sin ninguna lluvia mayor a 2 mm de:
  - **129 días seguidos** en **Zona 1 (La Banda)** (junio a octubre de 2020).
  - **131 días seguidos** en **Zona 2 (Quimilí)** y **130 días** en **Zona 3 (Campo Gallo)**.
  - **¡163 días seguidos (casi 5 meses y medio sin llover)!** en **Zona 4 (Añatuya)**, terminando recién el 6 de octubre de 2024.

### Hallazgo 3: El "Efecto Embudo" de la lluvia (Cuando llueve, cae de golpe en suelo pelado)
- Casi el **80 % de la lluvia anual cae entre noviembre y marzo**, con un pico violento en **marzo** (entre **140 mm y 227 mm** en un solo mes).
- Además, la NASA detectó **diluvios extremos en 24 horas**:
  - **207,0 mm en un solo día** en **La Banda / Robles** (23/03/2021).
  - **109,8 mm en un solo día** en **Quimilí / Bandera** (06/03/2022).
  - **98,3 mm en un solo día** en **Campo Gallo** (07/03/2022) y **89,2 mm** en **Añatuya** (06/03/2022).
- **Qué significa esto para el suelo:** Si ese chaparrón de 100 o 200 mm cae sobre un suelo desnudo o recién desmontado, la gota golpea la tierra, sella los poros ("planchado"), **el agua no infiltra**, corre llevándose los nutrientes y, en los bajos, provoca inundación.

### Hallazgo 4: Las 3 Estaciones Reales del Año Agrícola Santiagueño
Los datos mensuales de la NASA muestran que el campo santiagueño no vive 4 estaciones clásicas, sino **3 etapas muy marcadas**:

| Etapa del Año | Meses | Qué pasa según la NASA | El peligro para el productor |
|---|---|---|---|
| **1. La Olla a Presión (Calor + Lluvias Torrenciales)** | **Noviembre a Marzo** | Máximas medias de **34 a 37,7 °C** (22 a 24 días > 35 °C en enero). Caen entre **80 y 226 mm/mes**. El tanque del suelo (`GWETROOT`) sube a su máximo en marzo. | Si sembraste temprano (septiembre/octubre), la floración cae en pleno fuego de diciembre/enero. Por eso en Santiago ganan las **siembras tardías (diciembre/enero)** de maíz, sorgo o algodón. |
| **2. El Cierre de Canilla y Heladas** | **Mayo a Agosto** | La lluvia cae casi a **cero** (2,6 a 10 mm/mes en julio-agosto). Hay entre **4 y 10 días con riesgo de helada agronómica (≤ 3 °C)**, con mínimas absolutas de hasta **-1,96 °C** (01/07/2025). | Si cosechaste en mayo y dejaste el campo pelado, empieza la pérdida lenta de humedad subterránea y la subida del salitre en zonas de napa alta. |
| **3. El Embudo Crítico (Calor Temprano + Tanque Vacío)** | **Septiembre y Octubre** | **El momento más peligroso del año:**Todavía casi no llueve en septiembre (5 a 13 mm), el agua en las raíces (`GWETROOT`) toca su **mínimo anual**, ¡pero la temperatura ya salta a **31–34 °C** con picos de **46 °C**! | Si tenías un cultivo de cobertura vivo y no lo secaste en agosto, en septiembre te vacía el tanque de agua. Y si el suelo está pelado, el sol y el viento norte lo calcinan. |

### Hallazgo 5: La diferencia crítica de Humedad en Raíces (`GWETROOT`) entre zonas
- La zona de **Secano Este (Quimilí / Bandera)** es la que tiene el "tanque subterráneo" más ajustado: baja hasta el **37,2 % en septiembre** y nunca pasa del **47,3 % en marzo** en promedio.
- En cambio, la **Zona 1 (Riego / Río Dulce)** mantiene entre **44,5 % y 56,4 %** (y llegó al **79,0 %** tras el diluvio de marzo de 2021), lo que explica físicamente por qué allí el problema número uno no es solo la falta de agua, sino **el ascenso de la napa con sales (salitre)** cuando el sol evapora desde la superficie.

---

## 2. Análisis Detallado Zona por Zona (Números Reales 2020–2025)

---

### Zona 1: Área de Riego del Río Dulce — Suelos Salitrosos (`Lat -27.73, Lon -64.17`)
*Departamentos: Banda, Robles, Capital, San Martín, Silípica (La Banda / Beltrán / Fernández).*

#### A. Récords e Indicadores Anuales (NASA POWER)
- **Lluvia anual promedio:** `810,7 mm` (Año más seco: `2024` con `588,3 mm` | Año más húmedo: `2021` con `1.168,9 mm`).
- **Evapotranspiración anual (`EVPTRNS`):** `309,9 mm` (llegó a `635,5 mm` en 2021).
- **Días de calor > 35 °C:** `111,7 días/año` (pico de **137 días** en 2024).
- **Días de calor extremo > 40 °C:** `28,9 días/año` (subió de `14 días` en 2021 a **36 días** en 2025).
- **Temperatura máxima récord:** **45,54 °C** (17 de diciembre de 2023).
- **Temperatura mínima récord:** **-1,96 °C** (1 de julio de 2025) — `9,6 días/año` con riesgo de helada agronómica.
- **Tormenta máxima en 1 día:** **207,05 mm** (23 de marzo de 2021).
- **Racha seca más larga (< 2 mm):** **129 días seguidos** (terminó el 19/10/2020).

#### B. Qué revelan los datos mes a mes
1. **Exceso de agua en fin de verano:** En marzo llueven **226,7 mm** en promedio y la humedad en raíces (`GWETROOT`) llega al pico de **56,4 %** (con picos diarios del **79 %**). Sumado al riego por inundación, la napa freática queda muy cerca de la superficie.
2. **La trampa del salitre entre mayo y octubre:** En mayo (`8,8 mm`), julio (`3,8 mm`), agosto (`3,3 mm`) y septiembre (`5,2 mm`) prácticamente deja de llover, pero en agosto y septiembre las máximas ya promedian **26,4 °C y 31,0 °C**.
3. **Conclusión científica para BioSat:** Cuando el productor cosecha algodón o maíz en otoño y deja el lote **desnudo (pelado)** durante esos 5 meses secos y soleados, el sol funciona como una "mecha" que chupa el agua de la napa hacia arriba. El agua se evapora y **toda la sal queda depositada en los primeros centímetros del suelo** (lo que mide nuestro sensor de conductividad del **Kit Arduino**).
   - **Por eso las rotaciones ganadoras en Zona 1** son: 1) tapar el invierno con **Cebada + Melilotus alba** (sombra al suelo = no sube el salitre) y 2) usar **Alfalfa / Sorgo** (raíces profundas que bajan el nivel de la napa).

---

### Zona 2: Secano Agrícola del Este — Poca Agua y Calor Extremo (`Lat -27.65, Lon -62.42`)
*Departamentos: Moreno, Juan F. Ibarra, Gral. Taboada (Quimilí / Bandera / Sachayoj / Otumpa).*

#### A. Récords e Indicadores Anuales (NASA POWER)
- **Lluvia anual promedio:** `677,8 mm` — **133 mm menos que en La Banda**, y sin agua de riego (Año más seco: `2020` con `557,9 mm` y `2024` con `583,9 mm`).
- **Días de calor > 35 °C:** `111,0 días/año` (pico de **128 días** en 2024).
- **Días de calor extremo > 40 °C:** `30,3 días/año` (pico de **40 días > 40 °C** en 2022 y **39 días** en 2025).
- **Temperatura máxima récord:** **46,50 °C** (16 de octubre de 2023).
- **Temperatura mínima récord:** **-0,94 °C** (1 de julio de 2025) — `5,7 días/año` con riesgo de helada.
- **Humedad en raíces (`GWETROOT`):** La más baja de las 4 zonas (`37,2 %` en septiembre a `47,3 %` en marzo).

#### B. Qué revelan los datos mes a mes
1. **El bache seco de invierno-primavera:** Entre julio (`2,6 mm`), agosto (`3,2 mm`) y septiembre (`7,7 mm`) caen apenas **13,5 mm en tres meses enteros**, llevando la humedad radicular a su piso crítico de **37,2 %**.
2. **Golpe de horno en primavera y verano:** En octubre ya hay **11,5 días > 35 °C** (con récords de **46,5 °C**), y en enero hay **24 días > 35 °C** y **7,5 días > 40 °C**.
3. **Conclusión científica para BioSat:**
   - Hacer **soja sobre soja** en Quimilí/Bandera deja el suelo casi sin rastrojo; cuando caen los **171,9 mm de marzo** (con tormentas de hasta **110 mm en un día**), el agua se escapa sin entrar al perfil.
   - Rotar con **Maíz tardío o Sorgo granífero** (sembrados en diciembre/enero, cuando ya llovieron `83 mm` en noviembre y `93 mm` en diciembre) asegura agua en floración (febrero/marzo) y deja un **colchón grueso de caña y rastrojo** que frena los 50 °C de temperatura en tierra (medidos con el `LM35` del Arduino).
   - Y si se incluye **Vicia + Centeno** como puente verde, los datos de la NASA demuestran por qué **es obligatorio secarlo antes de agosto**: antes de que el `GWETROOT` caiga al 37 %.

---

### Zona 3: Chaco Semiárido y Monte — Desmonte y Silvopastoril (`Lat -26.58, Lon -62.85`)
*Departamentos: Alberdi, Copo, Pellegrini, Figueroa, Ojo de Agua, Choya, Loreto (Campo Gallo / Monte Quemado).*

#### A. Récords e Indicadores Anuales (NASA POWER)
- **Lluvia anual promedio:** `685,5 mm` (Año más seco: `2022` con `592,2 mm` y `2024` con `604,1 mm`).
- **Días de calor > 35 °C:** **126,4 días/año** (¡llegó a **146 días** en 2023 y **144 días** en 2024!).
- **Días de calor extremo > 40 °C:** **36,2 días/año** (subió sin parar: `17 días` en 2021 → `39` en 2022 → `41` en 2023 → `44` en 2024 → **49 días > 40 °C** en 2025).
- **Temperatura máxima récord:** **47,35 °C** (9 de diciembre de 2022).
- **Racha seca más larga (< 2 mm):** **130 días seguidos**.

#### B. Qué revelan los datos mes a mes (y su conexión con Landsat `CNN + RNN + Transformer`)
1. **El régimen térmico más extremo del país:** Casi **50 días al año por encima de los 40 °C** en 2025 y más de **4 meses enteros del año superando los 35 °C**.
2. **Qué pasa cuando se desmonta a cero:** Mientras el suelo está cubierto por el monte nativo (algarrobo, quebracho), la copa de los árboles frena la radiación solar directa y mantiene el microclima. Cuando nuestro módulo de **IA con Landsat (`CNN + RNN + Transformer`)** detecta un **área en proceso de desmonte o suelo expuesto**, ese suelo desnudo recibe de lleno esos **126 a 146 días de > 35 °C**, destruyendo la materia orgánica y volando el suelo con el viento norte en los meses secos de julio (`3,0 mm`), agosto (`4,1 mm`) y septiembre (`8,9 mm`).
3. **Conclusión científica para BioSat:** En esta zona, la rotación no puede ser agricultura convencional descubierta; necesita **cultivos ultrarresistentes al calor y la sequía (Sorgo doble propósito, Mijo, Poroto Caupí)** e integración **Agro-Silvopastoril (Algarrobo blanco + Pasturas megatérmicas como Buffel Grass / Gatton Panic)**, donde la sombra arbórea —verificada por el sensor `LDR` y `DHT11` del Arduino— protege la humedad y da forraje para el ganado en el bache invernal.

---

### Zona 4: Bajos Submeridionales — Inundación y Sequía Salina (`Lat -28.46, Lon -62.83`)
*Departamentos: Aguirre, Mitre, Belgrano, Rivadavia, Quebrachos (Añatuya / Los Juríes / Pinto / Selva).*

#### A. Récords e Indicadores Anuales (NASA POWER)
- **Lluvia anual promedio:** `695,9 mm` (Año más seco: `2020` con `569,1 mm`).
- **Días de calor > 35 °C:** `100,0 días/año` (`27,7 días/año > 40 °C`, máxima récord de **46,21 °C** el 09/12/2022).
- **Días con riesgo de helada (≤ 3 °C):** `9,2 días/año` (**18 días de helada** en el invierno de 2024; mínima récord de **-1,69 °C**).
- **Racha seca más larga (< 2 mm):** **¡163 días seguidos sin lluvias útiles!** (del 27 de abril al 6 de octubre de 2024).

#### B. Qué revelan los datos mes a mes
1. **El latigazo entre inundación y grieta salina:** Entre noviembre (`94,8 mm`), diciembre (`104,7 mm`), enero (`114,0 mm`) y marzo (`139,5 mm`) caen casi **540 mm** en terrenos con pendiente prácticamente cero (`SRTM`). Los suelos arcillosos no drenan y se encharcan.
2. **Luego vienen 5 meses y medio secos y con heladas:** De mayo a septiembre casi no llueve (hasta **163 días seguidos secos**) y caen hasta **18 heladas en un invierno** (como en 2024). El barro se seca como ladrillo, se agrieta y sube el salitre.
3. **Conclusión científica para BioSat:** Los monocultivos de verano fracasan tanto por falta de piso/asfixia en marzo como por sequía y salitre en primavera. La salida que respaldan los datos es:
   - **Girasol de siembra temprana** (aprovecha la humedad acumulada en otoño, mete raíz pivotante y se cosecha en diciembre/enero antes del pico de inundación de marzo).
   - **Biodrenaje con *Melilotus alba* (trébol de olor) + Grama Rhodes / Agropiro + Sorgo forrajero**, cuyas raíces abren canales en la arcilla para que el agua infiltre y mantienen el suelo tapado todo el año contra el salitre.

---

## 3. Tabla Comparativa Rápida de las 4 Zonas (Resumen de Bolsillo)

| Indicador Real NASA POWER (2020–2025) | Zona 1: Riego y Salitre *(La Banda)* | Zona 2: Secano Este *(Quimilí)* | Zona 3: Monte Semiárido *(Campo Gallo)* | Zona 4: Bajos *(Añatuya)* |
|---|---|---|---|---|
| **Lluvia media anual** | **810,7 mm** (+ Riego) | **677,8 mm** (Secano) | **685,5 mm** (Secano) | **695,9 mm** (Bajos) |
| **Mes más lluvioso (promedio)** | Marzo (`226,7 mm`) | Marzo (`171,9 mm`) | Marzo (`151,7 mm`) | Marzo (`139,5 mm`) |
| **Meses más secos (< 10 mm)** | May, Jul, Ago, Sep | Jul, Ago, Sep | Jul, Ago, Sep | Jul, Ago |
| **Racha máxima sin lluvia (< 2 mm)** | **129 días** | **131 días** | **130 días** | **163 días** |
| **Máximo diluvio en 1 solo día** | **207,1 mm** (23/03/21) | **109,8 mm** (06/03/22) | **98,3 mm** (07/03/22) | **89,2 mm** (06/03/22) |
| **Días al año > 35 °C (promedio)** | **111,7 días** | **111,0 días** | **126,4 días** | **100,0 días** |
| **Días > 40 °C (2021 → 2025)** | `14` → **36 días** | `10` → **39 días** | `17` → **49 días** | `15` → **35 días** |
| **Temperatura máxima récord** | **45,5 °C** | **46,5 °C** *(en oct)* | **47,4 °C** | **46,2 °C** |
| **Días riesgo helada (≤ 3 °C)** | **9,6 días/año** | **5,7 días/año** | **4,4 días/año** | **9,2 días/año** |
| **Agua en raíces (`GWETROOT` mín–máx)** | `44,5 %` – `56,4 %` | `37,2 %` – `47,3 %` | `46,1 %` – `54,6 %` | `41,1 %` – `49,9 %` |
