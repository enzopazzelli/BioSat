# Glosario de Términos — BioSat (NASA Space Apps 2026)

> **Regla de oro de este documento:** Ningún término técnico entra al proyecto ni a la pantalla del agricultor sin su traducción a lenguaje cotidiano. Si surge una sigla nueva, se agrega aquí.

---

## 1. Variables que miden los satélites y modelos (Clima, Agua y Vegetación)

| Término / Sigla | Qué significa (para el equipo) | Cómo se traduce al agricultor |
|---|---|---|
| **NDVI** (*Normalized Difference Vegetation Index*) | Índice óptico (de -1 a +1) que calcula cuánta luz roja absorbe la clorofila y cuánta infrarroja rebota la hoja sana. Valores < 0,2 indican suelo desnudo o rastrojo seco; > 0,6 indican cultivo cerrado y vigoroso. | **"Qué tan verde y cubierto está el lote"**. Sirve para ver desde arriba qué meses el campo quedó pelado y cuándo el cultivo estuvo en su pico o sufrió estrés. |
| **EVI** (*Enhanced Vegetation Index*) | Similar al NDVI, pero corrige distorsiones de la atmósfera y del brillo del suelo, y no se satura tan rápido cuando el cultivo tiene mucha biomasa. | **"Vigor del cultivo"**, especialmente útil cuando el cultivo ya cerró el surco y es muy denso. |
| **Evapotranspiración (ET / `EVPTRNS`)** | Suma del agua que se evapora directamente de la tierra más el agua que transpiran las plantas por sus hojas hacia el aire (medida en mm/día o mm/mes). | **"El agua que gasta el lote"** (lo que transpira el cultivo + lo que se evapora del suelo por el sol y el viento). |
| **Humedad en zona de raíces (`GWETROOT`)** | Parámetro de NASA POWER (de 0 a 1, o 0 % a 100 %) que estima qué tan llenos de agua están los poros del suelo hasta donde llegan las raíces (~1 metro). | **"El tanque de agua guardado bajo tierra"** disponible para que las raíces tomen. |
| **Humedad superficial (`GWETTOP` / SMAP)** | Agua contenida en los primeros 5 cm del suelo. Cambia muy rápido después de una lluvia o un día de sol fuerte. | **"Humedad en la cama de siembra"** (los primeros centímetros de tierra donde germina la semilla). |
| **Anomalía de humedad** | Diferencia entre la humedad actual del suelo y el promedio histórico para esa misma fecha en los últimos 20–40 años. | **"Si el suelo hoy está más seco o más húmedo de lo normal para esta época del año"**. |
| **Balance hídrico** | Resta simple: `Agua que entra (lluvia + riego) − Agua que sale (evapotranspiración + escurrimiento)`. | **"La cuenta corriente de agua del lote"**: si entra más de lo que se gasta, el suelo ahorra agua; si sale más, entra en déficit. |
| **Estrés térmico / Golpe de calor** | Cantidad de días en que la temperatura máxima (`T2M_MAX`) supera el umbral que daña al cultivo (ej. > 32–35 °C en floración de maíz o trigo). | **"Días de calor extremo que queman polen o frenan el crecimiento"**. |
| **Riesgo de helada (`T2M_MIN`)** | Probabilidad histórica de que la temperatura mínima baje de 0 °C (helada meteorológica) o de 2–3 °C en casilla (helada agronómica a nivel del suelo). | **"Fechas en que todavía puede caer una helada tardía o arrancar una helada temprana"**. |
| **Periodo de suelo desnudo (*Bare-field period*)** | Meses entre la cosecha de un cultivo y la siembra del siguiente en los que la tierra no tiene plantas vivas ni cobertura suficiente. | **"Meses con el campo pelado"**, expuesto a que el sol lo seque, el viento lo vuele o el agua de lluvia lo erosione. |
| **Infiltración vs. Escorrentía** | Qué porcentaje de una lluvia logra entrar a la tierra (infiltración) vs. qué porcentaje corre por arriba llevándose tierra fértil (escorrentía). | **"Agua que entra al suelo vs. agua que se escapa del lote y lava la tierra"**. |
| **GRilla / Resolución espacial** | Tamaño del "píxel" o cuadrado de terreno que promedia un satélite (ej. 10 m en Sentinel-2, 30 m en Landsat vs. 50 km en NASA POWER). | **"El tamaño de la lupa del satélite"**: algunos ven el clima de todo el departamento (50 km) y otros ven cada lote y cortina de monte (30 m). |
| **SI (*Synthetic Intelligence* / IA)** | En el enunciado de NASA se usa "SI" para referirse a técnicas de Inteligencia Artificial, aprendizaje profundo y fusión estadística de datos. | **"El motor inteligente"** que cruza décadas de fotos satelitales y datos de clima para encontrar patrones que a simple vista no se ven. |
| **CNN (*Red Neuronal Convolucional*)** | Modelo de aprendizaje profundo especializado en "ver" imágenes: detecta bordes, texturas, parches de monte, suelo pelado y surcos en cada foto satelital **Landsat**. | **"El ojo espacial"**: mira la foto satelital de tu campo y distingue dónde hay monte sano, dónde se está desmontando y dónde quedó la tierra pelada. |
| **RNN (*Red Neuronal Recurrente / LSTM*)** | Modelo de aprendizaje profundo que tiene "memoria" secuencial: lee una serie de datos ordenada en el tiempo (mes a mes, año a año) para entender cómo evoluciona el lote. | **"La memoria del lote"**: recuerda cómo venía el campo en los meses anteriores para saber si está mejorando o degradándose. |
| **Transformer (Atención Temporal)** | Arquitectura moderna de IA que usa "mecanismos de atención" para comparar cualquier momento del pasado con el presente (ej. relacionar un desmonte de hace 3 años más una sequía de hace 1 año con la pérdida de humedad de hoy). | **"El detector de causas a largo plazo"**: conecta lo que pasó hace varios años en el campo (un desmonte o una gran sequía) con el problema que tiene el suelo hoy. |

---

## 2. Satélites, misiones y fuentes de datos de la NASA (y aliadas)

| Fuente / Misión | Qué es y qué resolución tiene | Para qué lo usamos en BioSat |
|---|---|---|
| **NASA POWER** (*Prediction Of Worldwide Energy Resources*) | Base global diaria de clima y agroclimatología de la NASA desde 1981 hasta hoy. Grilla de ~50 km (0,5°). API abierta sin clave. | **Nuestra base histórica zonal:** lluvia diaria (`PRECTOTCORR`), temperaturas máx/mín (`T2M_MAX`, `T2M_MIN`), humedad radicular (`GWETROOT`), evapotranspiración (`EVPTRNS`) y radiación solar. |
| **SMAP** (*Soil Moisture Active Passive*) | Satélite de la NASA que mide con radar/radiómetro la humedad en los primeros 5 cm del suelo cada 2–3 días (resolución de 9 a 36 km). | Ver cómo responde la humedad regional de los suelos a las sequías y lluvias desde 2015. |
| **MODIS / VIIRS** | Sensores a bordo de satélites de NASA/NOAA que toman fotos diarias de toda la Tierra a 250 m–1 km desde el año 2000. | Armar la serie larga (20+ años) de **NDVI** para detectar en qué meses históricos la zona queda sin vegetación. |
| **Landsat (NASA/USGS) y Sentinel-2 (ESA) / HLS** | Satélites ópticos de alta resolución (10 m a 30 m por píxel) que pasan cada 2 a 5 días. **HLS** (*Harmonized Landsat Sentinel*) une ambos en un solo producto de la NASA. | **Ver el lote específico del agricultor:** detectar suelo desnudo, cobertura de rastrojo y diferencias de vigor dentro del propio campo. |
| **ECOSTRESS** | Sensor térmico de la NASA instalado en la Estación Espacial Internacional (~70 m de resolución). Mide la temperatura de las plantas y su evapotranspiración. | Detectar **"fiebre en el cultivo"**: cuando a una planta le falta agua, cierra sus poros (estomas) y se calienta antes de ponerse amarilla. |
| **GPM / IMERG** | Constelación de satélites que mide lluvia y tormentas cada 30 minutos a ~10 km de resolución. | Detectar lluvias torrenciales o eventos extremos que causan erosión o anegamiento. |
| **SRTM** (*Shuttle Radar Topography Mission*) | Mapa global de elevación y topografía en 3D a 30 m de resolución, medido por el transbordador espacial de la NASA. | Calcular la **pendiente del lote** y hacia dónde escurre el agua cuando llueve fuerte. |
| **GRACE / GRACE-FO** | Par de satélites gemelos que miden cambios minúsculos en la gravedad terrestre para estimar cuánta agua subterránea se está ganando o perdiendo a escala de toda una cuenca (cientos de km). | Mostrar si las napas y acuíferos de toda la región se están agotando a largo plazo. |
| **GLDAS / ERA5** | Modelos globales que combinan satélites y estaciones meteorológicas para reconstruir el clima y la humedad del suelo hora por hora desde 1940/1979. | Respaldo climático continuo para validar tendencias largas de temperatura y agua. |
| **FAO GAEZ v5** (*Global Agro-Ecological Zones*) | Atlas global (1 km) de la FAO y el IIASA que cruza suelo y clima para calcular qué cultivos son aptos hoy y cuáles lo serán en 2040–2100 bajo cambio climático (escenarios SSP). | Responderle al productor: **"¿Este cultivo que hoy funciona va a seguir rindiendo acá dentro de 15 o 20 años?"**. |
| **AppEEARS** | Plataforma de la NASA (requiere cuenta gratuita Earthdata) que extrae y recorta datos de MODIS, SMAP, ECOSTRESS, HLS y SRTM para una coordenada o polígono y los entrega en CSV. | Nuestro **atajo técnico** para no bajar gigabytes de imágenes satelitales crudas. |

---

## 3. Términos agronómicos clave del desafío

| Término | Qué es | Por qué importa al elegir una rotación |
|---|---|---|
| **Rotación de cultivos** | Secuencia planificada de distintos cultivos en el mismo lote a lo largo de las campañas (ej. Trigo/Soja → Maíz → Girasol). | Evita agotar siempre los mismos nutrientes y corta el ciclo de plagas, malezas y enfermedades. |
| **Cultivo de cobertura (o cultivo de servicio / puente verde)** | Cultivo que se siembra entre dos cosechas comerciales (ej. vicia, centeno, avena, melilotus) **no para vender el grano**, sino para proteger y mejorar el suelo. | Tapa el suelo desnudo, frena malezas, evita la erosión y mejora la infiltración. **Su dilema:** consume agua que hay que vigilar en zonas semiáridas. |
| **Barbecho** | Periodo en que el lote descansa sin cultivo vivo entre una cosecha y la próxima siembra. | Sirve para **juntar y guardar agua de lluvia en el suelo**, pero si queda sin rastrojo deja la tierra desprotegida. |
| **Rastrojo** | Restos secos de tallos y hojas que quedan cubriendo el suelo después de cosechar (clave en siembra directa). | Funciona como un **"colchón"**: frena el golpe de la gota de lluvia, reduce la evaporación por sol y alimenta la vida del suelo. |
| **Leguminosas y Fijación de Nitrógeno** | Familia de plantas (soja, vicia, arveja, garbanzo, poroto, alfalfa) que se asocian con bacterias en sus raíces para atrapar nitrógeno del aire y meterlo al suelo. | Dejan **"fertilizante natural gratis"** para el cultivo que viene después (por ejemplo, una vicia antes de un maíz). |
| **Cultivos de raíz profunda / pivotante** | Plantas como girasol, cártamo, alfalfa o nabo forrajero cuyas raíces bajan hondo o perforan capas duras. | Funcionan como **"subsoladores biológicos"**: abren canales para que el agua infiltre y buscan humedad donde otros cultivos no llegan. |
| **Cultivos tolerantes a sequía** | Especies como sorgo, mijo o garbanzo que producen grano con menos agua o resisten pausas de lluvia. | Son el **"seguro climático"** de la rotación cuando se pronostica un año seco (ej. año Niña) o en zonas semiáridas. |
| **Salinización / Suelo salitroso** | Acumulación de sales solubles en la superficie del suelo. Ocurre mucho cuando la napa de agua subterránea está cerca y el sol evapora el agua desde un suelo pelado, dejando la sal arriba (**ascenso capilar**). | **"Cuando sube el salitre y quema el lote"**. Si el suelo queda desnudo en Santiago del Estero, el sol chupa el agua desde abajo y deja una costra blanca de sal donde no nacen los cultivos sensibles. |
| **Secano vs. Área de Riego** | En **secano** el cultivo depende 100 % de la lluvia que cae; en **riego** se aporta agua de río o canal (ej. Río Dulce o Salado). | Define la regla del juego: en secano hay que cuidar cada gota de lluvia; en riego hay que evitar que suba la napa y el salitre. |
| **Sistema Silvopastoril / Monte** | Integración de árboles nativos (como el algarrobo, que además es leguminosa y da sombra), pasturas resistentes y ganado. | **"Producir con el monte, no contra el monte"**: la sombra de los árboles baja hasta 10 °C la temperatura del suelo y frena la evaporación. |

---

## 4. Términos del Kit AltaNet Arduino Uno R3 + ESP32 ("Verdad de Campo")

> El enunciado pide: *"Clarify how satellite observations differ from ground-based measurements, and how combining both may improve accuracy."* Aquí entran los componentes reales de nuestro **Kit AltaNet (Arduino Uno R3 + ESP32 USB-C)**.

| Componente del Kit | Qué mide o hace en BioSat | Cómo complementa al satélite de la NASA |
|---|---|---|
| **Placas Arduino Uno R3 y ESP32 USB-C** | Los microcontroladores del kit. El Uno R3 conecta directo por USB (5V) y el **ESP32** suma **Wi-Fi y Bluetooth** integrados. | Reciben las lecturas de los sensores en la tierra y las mandan en vivo a la aplicación para compararlas con la NASA. |
| **Sensor DHT11** | Mide **temperatura y humedad relativa del aire** a la altura del cultivo. | Detecta el **microclima real del lote** (ej. cuánto baja la temperatura del aire bajo cobertura/monte frente al promedio regional de 50 km de NASA POWER). |
| **Sensor de temperatura LM35** | Sensor analógico de precisión para medir la **temperatura directa de contacto con el suelo**. | En Santiago del Estero, un suelo pelado al sol puede pasar los **50 °C** aunque el aire esté a 38 °C. El LM35 muestra cómo el rastrojo protege la tierra del golpe de calor. |
| **Módulo sensor de agua / humedad / conductividad** | Placa con pistas metálicas paralelas que mide cuánta corriente pasa por el agua/barro del suelo (entrada analógica `A0`). | **Doble función clave:** 1) Detecta presencia de agua en suelo superficial; 2) Como funciona por conductividad eléctrica, **detecta suelos salitrosos** (el agua con salitre conduce mucha más corriente que el agua dulce). |
| **Fotorresistencia (LDR)** | Mide cuánta luz solar llega hasta el ras del suelo. | Es el **"NDVI de bolsillo"**: si al suelo le da el sol directo (mucha luz = suelo pelado), se evapora el agua y sube el salitre; si hay rastrojo o cultivo cubriendo (poca luz), el suelo está protegido. |
| **Pantalla LCD 16x2 + LEDs (Verde/Amarillo/Rojo) + Buzzer** | Indicadores visuales y sonoros del kit en terreno. | Permite que el productor (y el jurado en la mesa) vea al instante el diagnóstico en la pantalla física y el semáforo de riesgo sin siquiera mirar la computadora. |
| **Potenciómetro / Botones** | Controles manuales analógicos y digitales incluidos en el kit. | Permiten cambiar de zona de Santiago del Estero o simular escenarios de sequía/lluvia directamente desde la maqueta física durante la demo. |
