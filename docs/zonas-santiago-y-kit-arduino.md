# Kit Arduino + Zonas de Santiago del Estero — Diseño Funcional BioSat

> **Actualización (D-18 y D-20):**
> - **Zona 3:** pasa a ser solo el norte chaqueño (Campo Gallo, Monte Quemado).
> - **Zona 5 "Sur serrano y salinas":** el sur se separa en esta zona nueva, confirmada en D-21, porque su clima es muy distinto (ver [`cruce-de-datos.md`](cruce-de-datos.md) §4). Sus rotaciones todavía son un borrador.
> - **Kit:** se corrigieron los textos de los sensores de agua y de luz para no prometer más de lo que miden.

> **Propósito de este documento:** Dejar documentado el inventario real de nuestro kit de hardware (**AltaNet Arduino Uno R3 + ESP32 USB-C**) y cómo se articula con los datos satelitales de la **NASA** para cubrir las **4 grandes zonas y problemáticas agroecológicas de Santiago del Estero**.

---

## 1. Nuestro Hardware: Kit AltaNet Arduino Uno R3 + ESP32 USB-C (`MLA-1727769125`)

Este kit combina la sencillez clásica de Arduino con conectividad moderna e incluye los sensores exactos para medir en tierra (**"Verdad de Campo" / *Ground Truth***) lo que los satélites de la NASA observan desde el espacio.

### 1.1. Placas de desarrollo incluidas ("El Cerebro")

| Placa | Características | Rol en BioSat |
|---|---|---|
| **Arduino Uno R3 Compatible (ATmega328P)** | Lógica de 5V, 6 entradas analógicas (`A0`–`A5`), 14 pines digitales. Conexión directa por cable USB a la PC. | Ideal para conectar directamente todos los sensores en la protoboard de 830 puntos y transmitir lecturas en tiempo real por Puerto Serie USB sin fallos de red. |
| **ESP32 con puerto USB-C (38 pines)** | Doble núcleo, lógica de 3.3V, **Wi-Fi y Bluetooth (BLE) integrados**. | Permite enviar las lecturas de los sensores de forma inalámbrica por Wi-Fi a la aplicación web o levantar un panel directo en el celular del agricultor. |

### 1.2. Sensores del kit y su traducción agronómica en BioSat

| Componente del Kit | Qué mide electrónicamente | Qué mide en el campo (Aplicación BioSat) | Cómo se cruza con los datos de la NASA |
|---|---|---|---|
| **Módulo Sensor de Agua / Conductividad** *(placa roja/azul con pistas paralelas)* | Mide cuánta corriente eléctrica pasa entre las pistas metálicas según la humedad y los iones disueltos en el agua. | **Humedad superficial y conductividad.**<br>• Tierra seca: lectura baja.<br>• Tierra húmeda: lectura media.<br>• Tierra húmeda **con sales disueltas**: lectura muy alta.<br>La lectura sube con el agua **y** con la sal: para separar salitre de humedad hay que calibrarlo con las bandejas. Es una alerta, no reemplaza un análisis de conductividad. | Cruza con **NASA POWER (`GWETROOT` / `EVPTRNS`)** y **SMAP**: cuando la NASA muestra alta evaporación y suelo pelado en la zona de riego, este sensor confirma en el lote si ya subió el salitre a la superficie. |
| **Sensor de Temperatura `LM35`** | Termómetro analógico de precisión (10 mV por cada °C) por contacto directo. | **Temperatura de la tierra (cama de siembra).**<br>En Santiago del Estero, con 38 °C de aire, un suelo pelado al sol supera los **50 °C** (mata raíces y bacterias), mientras que bajo rastrojo o sombra de monte se mantiene fresco (~32 °C). | Cruza con **NASA POWER (`T2M_MAX`)** y **ECOSTRESS**: muestra la diferencia real entre la temperatura regional del aire y lo que sufre el suelo cuando no tiene cobertura. |
| **Sensor `DHT11`** | Temperatura (0–50 °C) y Humedad Relativa del aire (20–90 %). | **Microclima a la altura del cultivo.**<br>Mide qué tan seco y caluroso está el aire que rodea las hojas. | Cruza con **NASA POWER (`EVPTRNS`)**: explica de forma tangible por qué en los días secos y ventosos de Santiago el cultivo transpira y gasta más agua. |
| **Fotorresistencia `LDR`** | Varía su resistencia según cuánta luz recibe. | **Indicador de cobertura del suelo (sombra).**<br>Colocado al ras de la tierra:<br>• **Mucha luz** = Suelo pelado/desnudo.<br>• **Poca luz** = Suelo protegido por rastrojo, cultivo de cobertura o árboles del monte.<br>No mide NDVI: solo ve luz visible, no infrarrojo. | Se compara con el **NDVI de Landsat / MODIS**: el satélite dice qué tan verde está la zona; el LDR muestra si al sol le pega directo a la tierra en ese metro cuadrado. |
| **Pantalla `LCD 16x2` + LEDs (Verde, Amarillo, Rojo) + Buzzer** | Salidas visuales y sonoras en la protoboard. | **Diagnóstico autónomo en el lote:**<br>• **LED Verde:** Suelo cubierto y húmedo.<br>• **LED Amarillo:** Alerta de calor o pérdida de humedad.<br>• **LED Rojo + Buzzer:** ¡Suelo pelado al sol o alerta de salitre! | Permite que el agricultor (y el jurado en la mesa) vea la alerta física al instante sin depender solo del monitor. |
| **Potenciómetro (10kΩ) y Botones** | Entradas manuales analógicas y digitales. | Permiten seleccionar qué zona de Santiago del Estero se está evaluando o simular un escenario de sequía/calor desde la propia maqueta. | Conecta la maqueta física con los *sliders* de escenarios de la interfaz web. |

### 1.3. Otros componentes incluidos en el maletín AltaNet (inventario de respaldo)
- Protoboard de 830 puntos + cables jumper (macho-macho y macho-hembra).
- Servomotor SG90, motor paso a paso 28BYJ-48 con driver ULN2003, módulo Relé de 1 canal (útil si queremos mostrar que el sistema activa o corta una bomba de riego cuando detecta humedad o salitre).
- Matriz LED 8x8, displays de 7 segmentos (1 y 4 dígitos), teclado matricial 4x4, módulo RFID, módulo RTC (reloj), control remoto IR, joystick, sensor de sonido, resistencias (220Ω, 1kΩ, 10kΩ) y broche de batería 9V.

### 1.4. La Demo Física para el Jurado ("Las 3 Bandejas de Suelo Santiagueño")
En la mesa de presentación podemos tener **3 pequeños recipientes reales** para clavar los sensores en vivo:
1. **Recipiente A — "Barbecho pelado y seco":** Tierra seca a plena luz → `LDR` al máximo (suelo desnudo), humedad en 0, `LM35` caliente → **LED Rojo**.
2. **Recipiente B — "Suelo salitroso":** Tierra húmeda con agua con sal → El sensor de conductividad se dispara → La pantalla LCD y la Web App avisan: **"ALERTA SALITRE: Recomienda cobertura + raíces profundas (Alfalfa/Melilotus)"**.
3. **Recipiente C — "Suelo con Rastrojo / Monte":** Tierra húmeda tapada con pasto seco/hojas → `LDR` marca sombra protectora, humedad conservada y menor temperatura → **LED Verde**.

---

## 2. Cobertura Provincial: Las 5 Zonas Agroecológicas de Santiago del Estero

Para no depender de un único lote y lograr el máximo **Impacto Local (*Local Impact*)**, **BioSat** organiza la provincia de Santiago del Estero en sus **4 grandes realidades productivas**, cada una con sus coordenadas reales para consultar **NASA POWER / AppEEARS / FAO GAEZ** y sus **3 estrategias de rotación comparadas**.

---

### Zona 1: Área de Riego del Río Dulce (Suelos Salitrosos y Napa Alta)
- **Departamentos representativos:** Banda, Robles, Capital, San Martín, Silípica (ej. La Banda / Beltrán / Fernández).
- **Coordenada de referencia NASA:** `Lat -27.73, Lon -64.17`
- **Problemática principal:**
  - Se riega tradicionalmente por manto/inundación. Esto levanta la napa freática (agua subterránea con sales).
  - Cuando se cosecha el cultivo de verano y el lote queda **pelado (suelo desnudo)** durante el otoño e invierno, el sol y el viento evaporan el agua superficial. Por **ascenso capilar**, el agua subterránea sube y deja una costra blanca de **salitre** en la superficie que degrada el suelo y quema los cultivos siguientes.
- **Qué ven la NASA y el Kit Arduino:**
  - **NASA:** Alta demanda evaporativa (`EVPTRNS`) todo el año + caída brusca de `NDVI` (suelo desnudo) entre mayo y septiembre + relieve muy plano (`SRTM`).
  - **Arduino:** El sensor de agua/conductividad detecta **alta salinidad** en el barro superficial y el `LDR` confirma que el sol pega directo sobre la tierra.
- **Las 3 Estrategias de Rotación a comparar:**
  1. **Rotación Actual (Línea base):** *Algodón (o Maíz) → Barbecho desnudo de invierno → Algodón.*
     - *Riesgo:* 5 meses de suelo pelado; máxima evaporación y subida de salitre; plagas del algodón (picudo) que no se cortan.
  2. **Alternativa 1 (Escudo Antisalitre de Invierno):** *Algodón → Cultivo de cobertura tolerante a sal (**Cebada forrajera + Melilotus alba**) → Maíz.*
     - *Por qué se sugiere:* Mantiene el suelo sombreado en otoño/invierno (baja evaporación = la sal no sube) y el *Melilotus* (leguminosa) fija nitrógeno y tolera suelos salitrosos.
     - *Vacío / Riesgo a revisar:* Ajustar la fecha de secado/rolado de la cobertura y medir la conductividad eléctrica del agua de riego.
  3. **Alternativa 2 (Bomba Biológica Profunda):** *Pastura de **Alfalfa** (3–4 años) en rotación con **Sorgo granífero / forrajero** y **Trigo**.*
     - *Por qué se sugiere:* La alfalfa tiene raíces de varios metros que consumen agua profunda, **deprimen la napa freática** para que no suba el salitre, fijan nitrógeno y dan fardos de alto valor comercial en la zona de riego.

---

### Zona 2: Secano Agrícola del Este (Poca Agua, Golpes de Calor y Suelo Desprotegido)
- **Departamentos representativos:** Moreno, Juan F. Ibarra, General Taboada, Alberdi, Jiménez (ej. Quimilí, Bandera, Sachayoj, Otumpa).
- **Coordenada de referencia NASA:** `Lat -27.65, Lon -62.42`
- **Problemática principal:**
  - Agricultura 100 % a **secano** (sin riego; todo depende de la lluvia).
  - Invierno y primavera muy secos; lluvias concentradas de noviembre a marzo, pero con tormentas intensas y veranos de calor extremo (> 40 °C).
  - Si se hace monocultivo de soja, queda muy poco rastrojo: el suelo queda pelado medio año, se compacta, el agua de las tormentas se escapa sin infiltrar y el calor calcina la materia orgánica.
- **Qué ven la NASA y el Kit Arduino:**
  - **NASA:** Desplome de la humedad en zona de raíces (`GWETROOT`) entre junio y octubre, picos de estrés térmico (`T2M_MAX` > 35 °C) en diciembre–enero, y bajo `NDVI` invernal.
  - **Arduino:** El sensor `LM35` muestra cómo el suelo sin rastrojo levanta más de 45–50 °C al sol y pierde toda la humedad superficial.
- **Las 3 Estrategias de Rotación a comparar:**
  1. **Rotación Actual (Línea base):** *Soja de verano → Barbecho largo desnudo (6 meses) → Soja.*
     - *Riesgo:* Pobre aporte de carbono, rastrojo que desaparece rápido, suelo desprotegido ante lluvias torrenciales y pérdida progresiva de infiltración.
  2. **Alternativa 1 (Colchón de Rastrojo y Raíces):** *Soja → Barbecho con rastrojo → **Maíz tardío o Sorgo granífero** → Soja.*
     - *Por qué se sugiere:* Sembrar maíz tardío o sorgo en diciembre/enero esquiva el bache seco de primavera, aporta gran volumen de caña/rastrojo que tapa el suelo todo el invierno siguiente y mejora la infiltración del agua de lluvia.
     - *Vacío / Riesgo a revisar:* Verificar distancia a puerto/mercado para el grano de sorgo o maíz y control de malezas en barbecho.
  3. **Alternativa 2 (Puente Verde Regulado por Humedad):** *Soja → **Vicia villosa + Centeno** (cultivo de servicio en otoño) → Maíz tardío.*
     - *Por qué se sugiere:* La vicia fija nitrógeno biológico para el maíz y el centeno deja cobertura contra el sol y las malezas.
     - *El gran dilema que muestra BioSat (Riesgo local):* Si el otoño arranca con el "tanque" bajo (`GWETROOT` < 40 %), hay que **secar/rolar el cultivo de cobertura temprano (agosto)** para que no se tome el agua que necesita el maíz en el verano.

---

### Zona 3: Chaco Semiárido Norte y Monte Santiagueño (Escasez Hídrica y Sistemas Silvopastoriles)
- **Departamentos representativos:** Copo, Alberdi, Pellegrini, Figueroa (ej. Monte Quemado, Campo Gallo). *El sur (Ojo de Agua, Choya, Guasayán) pasó a la Zona 5.*
- **Coordenada de referencia NASA:** `Lat -26.58, Lon -62.85` *(Norte/Monte)*
- **Problemática principal:**
  - Menor régimen de lluvias (450 a 600 mm al año) y estación seca muy larga (hasta 6–7 meses sin lluvias importantes).
  - Si se elimina todo el monte nativo y el suelo queda expuesto al sol y al viento norte, se degrada y erosiona rápidamente.
  - Los productores ganaderos y de agricultura familiar sufren el **"bache forrajero" de invierno/primavera** (falta de pasto y agua para cabras y vacas).
- **Qué ven la NASA y el Kit Arduino:**
  - **NASA:** Enorme contraste térmico superficial (**ECOSTRESS**) y de verdor (**MODIS NDVI**) entre las parcelas con cobertura arbórea/pastura y los lotes pelados; proyecciones **FAO GAEZ v5** que advierten mayor estrés térmico hacia 2040.
  - **Arduino:** El `LDR` y el `DHT11`/`LM35` demuestran en vivo que bajo la media sombra del monte (algarrobo), la temperatura del suelo baja drásticamente y la humedad dura el doble.
- **Las 3 Estrategias de Rotación / Manejo a comparar:**
  1. **Rotación Actual (Línea base):** *Lote desmontado con Maíz/Zapallo a secano en verano → Suelo pelado con sobrepastoreo de rastrojo en invierno.*
     - *Riesgo:* Alta tasa de pérdida de cosecha en años secos, suelo compactado por pisoteo y sin cobertura en los meses de viento y sol.
  2. **Alternativa 1 (Rotación Ultrarresistente a Sequía):** ***Sorgo doble propósito (grano + silo/forraje)** o **Mijo** → **Poroto Caupí / Poroto Mung** (leguminosas de ciclo corto resistentes al calor).*
     - *Por qué se sugiere:* El sorgo y el mijo necesitan mucha menos agua que el maíz para dar grano y forraje; el poroto caupí fija nitrógeno en climas cálidos y aporta proteína para la familia o el ganado.
  3. **Alternativa 2 (Sistema Agro-Silvopastoril — Monte + Pastura + Leguminosa):** *Conservación/implantación de **Algarrobo blanco (`Neltuma alba`)** + pastura megatérmica (**Buffel Grass / Gatton Panic**) consociada con leguminosa forrajera y franjas de **Sorgo/Tuna forrajera**.*
     - *Por qué se sugiere:* El algarrobo es una **leguminosa arbórea nativa de raíz profunda**: fija nitrógeno, da chaucha nutritiva en primavera/verano y su media sombra protege al pasto y al suelo del golpe de calor extremo.

---

### Zona 4: Bajos Submeridionales y Llanuras Deprimidas (Inundación Alternada con Sequía Salina)
- **Departamentos representativos:** Aguirre, Mitre, Belgrano, Rivadavia, Quebrachos (ej. Añatuya, Pinto, Malbrán, Selva).
- **Coordenada de referencia NASA:** `Lat -28.46, Lon -62.83`
- **Problemática principal:**
  - Terrenos extremadamente planos (`SRTM` con pendiente cercana a 0 %) y suelos arcillosos pesados con presencia de sales y sodio.
  - Sufren los dos extremos: cuando llueve mucho en verano/otoño se encharcan o inundan por falta de escurrimiento, y en invierno/primavera se secan, se agrietan y aflora el salitre.
- **Qué ven la NASA y el Kit Arduino:**
  - **NASA:** Pendiente nula en **SRTM**, picos de lluvia intensa en **GPM / NASA POWER** seguidos de meses secos, y anomalías marcadas de humedad superficial en **SMAP**.
  - **Arduino:** El sensor de agua/conductividad detecta tanto el anegamiento (nivel alto de agua) como la alta conductividad salina.
- **Las 3 Estrategias de Rotación a comparar:**
  1. **Rotación Actual (Línea base):** *Siembra oportunista de Soja o Maíz cuando el piso lo permite → Suelo descubierto el resto del año.*
     - *Riesgo:* Pérdida total si llueve de más (asfixia radicular) o si se corta el agua y sube la sal.
  2. **Alternativa 1 (Cosecha Segura de Ciclo Adaptado):** ***Girasol** (siembra temprana de agosto/septiembre) → **Sorgo granífero** → **Trigo/Cebada** (según agua acumulada en otoño).*
     - *Por qué se sugiere:* El girasol explora el suelo con raíz pivotante y se cosecha en diciembre/enero antes de las lluvias que anegan los bajos, y el sorgo tolera tanto sequía como encharcamientos temporales.
  3. **Alternativa 2 (Biodrenaje y Regeneración Salina):** *Consociación de **Melilotus alba (Trébol de olor)** + **Agropiro / Grama Rhodes** en rotación con **Sorgo forrajero**.*
     - *Por qué se sugiere:* Las raíces del *Melilotus* y la *Grama Rhodes* abren poros en el suelo arcilloso (mejoran la infiltración para que no se encharque), cubren el suelo todo el año para frenar el salitre y fijan nitrógeno.

---

### Zona 5: Sur Serrano y Salinas (Más Heladas, Menos Calor Extremo y Pendientes)
- **Departamentos representativos:** Ojo de Agua, Quebrachos, Choya, Guasayán (ej. Villa Ojo de Agua, Sumampa, Frías).
- **Coordenada de referencia NASA:** `Lat -29.50, Lon -63.69`
- **Por qué es otra zona (NASA POWER, normal 1991-2020):**
  - Unos **20 días de helada por año**, contra 5 a 10 en las otras zonas.
  - Solo **2,2 días por año de más de 40 °C**, contra 14 a 17.
  - Lluvia de 739 mm.
- **Problemática principal:** sierras con pendientes que se erosionan si quedan peladas, salinas al oeste (Ambargasta), ganadería de cría y caprina y bache de forraje en invierno.
- **Las 3 Estrategias de Rotación (borrador, a validar con productores del sur y el INTA):**
  1. **Rotación Actual (Línea base):** *Maíz o sorgo de verano → pastoreo del rastrojo hasta dejar el suelo pelado.*
  2. **Alternativa 1 (Verdeo de invierno):** *Sorgo forrajero → centeno o avena de pastoreo, que toleran las heladas y dan pasto verde en el bache de invierno.*
  3. **Alternativa 2 (Silvopastoril con pastura que aguante el frío):** *Monte + pasto llorón o gatton panic, con franjas de sorgo forrajero.* El buffel grass, que se usa en el norte, sufre con heladas fuertes.

---

## 3. Módulo de IA ("SI") con Imágenes Landsat de la NASA: `CNN + RNN + Transformer`

> **Origen:** Sugerencia de la cátedra de *Sistemas de Inteligencia Artificial*:
> *"Con imágenes Landsat de la NASA pueden proponer detección de áreas en proceso de desmonte usando aprendizaje profundo (CNN + RNN + Transformers). Tiene que ser con imágenes de la NASA, por eso les sugiero Landsat."*

### 3.1. Por qué esta arquitectura encaja al 100 % en *Field Shift* y en Santiago del Estero

En el enunciado oficial ([`NASA Space Apps Challenge.pdf`](../NASA%20Space%20Apps%20Challenge.pdf), sección *SI, Modeling, and Data Fusion*), la NASA sugiere:
- Usar datos de **Landsat** (resolución de 30 m, archivo histórico desde los años 80 hasta **Landsat 8 y 9**).
- Comparar distintos enfoques de IA (*"SI or statistical approaches"*) para **detectar transiciones estacionales, periodos de suelo desnudo (*bare-field periods*) y estrés en la vegetación**.

En **Santiago del Estero** (Región del Parque Chaqueño), el **desmonte o la pérdida de cortinas forestales** es el evento crítico que transforma un suelo estable en un suelo vulnerable a la voladura, al golpe de calor (> 50 °C en tierra) y a la subida del salitre.

Si conectamos la detección de desmonte con la recomendación de rotaciones, logramos **cerrar el círculo completo**:

```
[Imágenes Landsat 8/9 de la NASA (30 m)] + [Serie climática NASA POWER]
                        │
                        ▼
   1. CNN (Red Convolucional — "El Ojo Espacial")
      Analiza cada imagen Landsat (bandas Rojo, Infrarrojo Cercano NIR, SWIR)
      y clasifica cada sector del campo:
      • Monte nativo denso
      • Área en proceso de desmonte / raleo
      • Suelo desnudo (barbecho pelado o cicatriz de desmonte)
      • Cultivo / Cobertura activa
                        │
                        ▼
   2. RNN / LSTM (Red Recurrente — "La Memoria Mes a Mes")
      Sigue la secuencia temporal de los últimos meses para distinguir:
      • ¿Es un barbecho agrícola normal entre dos cosechas?
      • ¿O es un desmonte progresivo donde el suelo quedó descubierto de forma permanente?
                        │
                        ▼
   3. Transformer Temporal ("Atención de Largo Plazo")
      Cruza los cambios de varios años en Landsat con los eventos extremos
      de NASA POWER (sequías, olas de calor) para calcular el
      "Índice de Fragilidad Post-Desmonte / Suelo Desnudo".
                        │
                        ▼
   4. Motor de Decisión BioSat (Las 3 Estrategias de Rotación)
      Si detecta "Área en proceso de desmonte o suelo expuesto crónico":
      → Descarta rotaciones que dejen barbecho pelado.
      → Prioriza Rotación Silvopastoril (Algarrobo + Pastura Megatérmica)
        o Cobertura Inmediata de Raíz Profunda para frenar la desertificación.
```

### 3.2. Cómo explicarlo fácil (para el usuario y para el jurado)

| Componente de IA | Qué hace técnicamente | Cómo se lo explicamos al productor y al jurado |
|---|---|---|
| **Imágenes Landsat (NASA)** | Bandas multiespectrales a 30 m (Rojo `B4`, Infrarrojo Cercano `B5` para NDVI, e Infrarrojo de Onda Corta `B6/B7` para suelo desnudo y humedad). | **"La radiografía del lote a 30 metros"**: permite ver cada cuadro del campo, las cortinas de monte y dónde quedó la tierra pelada. |
| **CNN (Convolucional)** | Extrae características espaciales (bordes de lotes, parches de monte, textura de suelo desnudo). | **"Detecta el dónde"**: identifica en el mapa qué hectáreas tienen monte, cuáles están en proceso de desmonte y cuáles tienen cultivo. |
| **RNN (Recurrente / LSTM)** | Modela la transición secuencial entre fechas consecutivas de pasadas de Landsat (cada 8–16 días). | **"Detecta el ritmo"**: diferencia si el campo se peló por 60 días entre cosecha y siembra, o si está perdiendo el monte mes tras mes. |
| **Transformer** | Aplica *Self-Attention* sobre la serie multianual completa (Landsat + Clima NASA POWER). | **"Detecta el impacto acumulado"**: evalúa cuánto castigo térmico e hídrico acumuló ese lote desde que perdió su cobertura original y qué rotación necesita para recuperarse. |

