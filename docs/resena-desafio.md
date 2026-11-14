# Reseña del desafío — Field Shift: Adapting Farms with NASA Data

*NASA Space Apps Challenge 2026 · Dificultad: Intermedio / Avanzado · Temas: Earth Science, Software, Arts & Multimedia*
*Fuente: enunciado oficial guardado en `NASA Space Apps Challenge.pdf`. Detalle de datos en `docs/recursos-desafio.md`.*

> **Reseña inicial (13/11).** Varias cosas que acá figuran "a decidir" ya se decidieron. Por ejemplo, el enfoque por zonas (D-09) y las zonas (D-18). Ver la [bitácora](reglas-y-bitacora.md) y el [PLAN](../PLAN.md). La guía de entrevista de la sección 10 sigue vigente.

---

## 1. El desafío en una frase

Crear una herramienta que ayude a un agricultor a **explorar y comparar rotaciones de cultivos** usando datos de la NASA, su suelo, las características de cada cultivo y sus propias prioridades, para **cuidar el suelo y adaptarse a un clima que cambia**.

## 2. Por qué existe

Los agricultores enfrentan temperaturas que cambian, lluvias menos predecibles, falta de agua, clima extremo y suelos que se degradan. Elegir un cultivo nuevo para la rotación es difícil: **lo que mejora el suelo en un lugar puede gastar demasiada agua, traer enfermedades, no tener mercado o no entrar en la temporada en otro lugar.**

El enunciado dice que se inspira en **familias con varias generaciones en el campo** que vivieron temporadas en las que una mejor herramienta los habría ayudado. Este es el tono que buscan: algo cercano y útil, no un panel para científicos.

## 3. Qué piden

Todo el enunciado está escrito como "you may" (pueden), así que **nada es estrictamente obligatorio**. Igual, el entregable que describen con más claridad es este:

**Comparar al menos 3 estrategias de rotación, incluida la actual.** Para cada una, explicar:

1. **Por qué** se sugiere
2. **Qué evidencia** la respalda (los datos)
3. **Qué beneficios** podría dar
4. **Qué información falta**
5. **Qué riesgos** tiene que revisar el agricultor o un agrónomo local

Además, la herramienta puede mostrar:
- Cuándo el campo suele quedar **sin cubrir (suelo desnudo)**
- En qué estaciones los cultivos actuales son **más vulnerables**
- Oportunidades para **cortar ciclos de plagas**, **gastar menos agua**, **mejorar la infiltración** o **sumar ingresos**

Y debe ser:
- **Entendible** para alguien sin formación técnica ni de mapas
- **Personalizable**: el agricultor carga sus prioridades y límites (agua, maquinaria, mercado)
- **Honesta**: explica la incertidumbre y recuerda que **apoya, no reemplaza** el criterio del agricultor

Extras que sugieren: explicar términos (evapotranspiración, NDVI, anomalías de humedad, riesgo de helada, balance hídrico), comparar satélite contra medición en el suelo, mapas interactivos, líneas de tiempo, **sliders de escenarios** ("¿y si llueve menos?"), y explicar cómo aportan las leguminosas, los cultivos de cobertura, los de raíz profunda y los tolerantes a sequía.

## 4. Cómo se evalúa

En ediciones anteriores, el jurado global de Space Apps evaluó **impacto, creatividad, validez (que sea científicamente sólido y factible), relevancia para el desafío y presentación**. **Hay que verificar los criterios y el formato de entrega de 2026** en las reglas del evento.

Como el desafío incluye **Arts & Multimedia**, la forma de contarlo y lo visual pesan.

## 5. Qué sabemos de los datos (en lenguaje de agricultor)

| Pregunta del agricultor | De dónde sale | Alcance |
|---|---|---|
| ¿Cuándo hiela? ¿Cuándo hace demasiado calor? | NASA POWER (temp. mín/máx diaria desde 1981) | Global, ~50 km |
| ¿Llueve menos que antes? ¿Hay más tormentas fuertes? | NASA POWER, GPM IMERG (~10 km), ERA5 | Global |
| ¿Cuándo le falta agua al suelo? | POWER `GWETROOT`, SMAP (9–36 km), GLDAS | Global |
| ¿Cuánta agua consume el cultivo? | POWER `EVPTRNS`, ECOSTRESS (~70 m), OpenET (30 m, oeste de EE. UU.) | Global / EE. UU. |
| ¿Cuándo queda el campo pelado? ¿Cuándo sufre el cultivo? | NDVI de MODIS (250 m), HLS (30 m), Sentinel‑2 (10 m) | Global |
| ¿Tengo riesgo de erosión? | SRTM (pendiente) + lluvias intensas + meses de suelo desnudo | Global |
| ¿Este cultivo va a seguir sirviendo aquí en 2040? | FAO GAEZ v5 (escenarios climáticos hasta 2100, 1 km) | Global |
| ¿Qué suelo tengo? | SSURGO (EE. UU.); fuera: SoilGrids (ISRIC, global, no está en la lista) o la fuente nacional (p. ej. INTA en Argentina); **o el propio agricultor** | Variable |
| ¿Qué rotación vengo haciendo? | Cropland Data Layer (EE. UU., 10 m desde 2024); fuera de EE. UU.: **lo cuenta el agricultor** | EE. UU. / entrevista |
| ¿Hay mercado para ese cultivo? | USDA AMS / NASS (EE. UU.); fuera: **el agricultor** | EE. UU. / entrevista |

**La vía más rápida para obtener datos:** NASA POWER (sin cuenta, probado y funciona) + AppEEARS (cuenta Earthdata gratuita; devuelve CSV de NDVI, SMAP, ECOSTRESS, HLS y SRTM para un punto o polígono) + GAEZ v5.

**Limitación honesta:** casi todos los datos globales son más gruesos que un lote. Lo correcto es hablar de **"las condiciones de tu zona"** y combinarlas con lo que el agricultor sabe de su campo. El propio enunciado lo pide.

## 6. Un poco de agronomía que el desafío espera que expliquemos

- **Leguminosas** (soja, arveja, vicia, alfalfa, trébol): fijan nitrógeno del aire y reducen la necesidad de fertilizante.
- **Cultivos de cobertura**: tapan el suelo cuando estaría desnudo. Reducen la erosión, mejoran la infiltración y suman materia orgánica. **Ojo: también consumen agua.** En zonas secas pueden quitarle humedad al cultivo siguiente. Este es justamente el tipo de dilema que el enunciado quiere que la herramienta muestre.
- **Cultivos de raíz profunda** (alfalfa, girasol, nabo forrajero): rompen la compactación y aprovechan agua y nutrientes más profundos.
- **Tolerantes a sequía** (sorgo, mijo, algunos cereales de invierno): reducen el riesgo en años secos.
- **Rotar familias de cultivos** corta los ciclos de plagas y enfermedades que se acumulan con el monocultivo.
- **Forrajes y pasturas**: pueden sumar ingresos si hay ganado y descansan el suelo.

## 7. Qué se puede hacer

### Recorrido propuesto (idea base, a validar)

1. **Ubicar el lote** en un mapa.
2. **Contar la rotación actual** y elegir prioridades (ahorrar agua, mejorar el suelo, sumar ingresos, reducir erosión) y límites (riego sí/no, maquinaria, mercado).
3. **Ver el "calendario del lote"**: un año dibujado con heladas, calor, meses secos y meses de suelo desnudo, sacado de 20–40 años de datos de la NASA.
4. **Comparar 3 rotaciones** (la actual + 2 alternativas) en fichas con las 5 explicaciones que pide el enunciado.
5. **Probar escenarios**: "¿y si llueve 20 % menos?", "¿y si hace 1,5 °C más?" (sliders).
6. **Llevarse una lista** de qué revisar con un agrónomo antes de decidir.

### La pieza visual que puede destacar: el calendario del lote

```
                 E   F   M   A   M   J   J   A   S   O   N   D
Rotación actual  [==== cultivo de verano ====]      ..pelado..
Alternativa 1    [==== cultivo de verano ====][= cobertura =]
Alternativa 2    [== leguminosa ==]  [==== cereal de invierno ====]

Heladas (POWER)                      ▓▓  ▓▓  ▓▓
Calor >35 °C     ▓▓  ▓▓                                      ▓▓
Suelo seco                       ▓▓  ▓▓  ▓▓
Suelo desnudo (NDVI)                              ▓▓  ▓▓  ▓▓
```

En una sola imagen se ve **qué rotación deja el suelo cubierto, cuál esquiva las heladas y cuál choca con los meses secos**. Responde directamente a "periodos de suelo desnudo" y "estaciones vulnerables" del enunciado.

### Dónde entra la IA ("SI" en el enunciado)

Opciones, de más simple a más compleja:

- **Reglas transparentes + estadística**: calcular riesgos (días de helada, déficit hídrico, tendencias de lluvia), puntuar cada rotación según las prioridades y mostrar el cálculo. Es explicable y rápido de construir.
- **Detección de patrones**: buscar en las series de tiempo de POWER y NDVI las ventanas de estrés, las transiciones de estación y los años anómalos.
- **Modelo de lenguaje como "traductor"**: convierte los números en explicaciones simples y cita el dato del que sale cada frase. **Nunca decide la rotación.** Explica lo que las reglas calcularon.

*Propuesta (a validar):* combinar las tres. Las reglas y la estadística deciden, y la IA de lenguaje solo redacta. Así cumplimos con "explicar la incertidumbre" y no recomendamos nada que no podamos justificar.

### Enfoques posibles (sin decidir)

| Enfoque | Qué es | A favor | En contra |
|---|---|---|---|
| **A. Caso real a fondo** | La herramienta, mostrada con la finca del agricultor que consultamos | Historia real, validación local (el enunciado la pide), datos verificables, nos diferencia | La demo depende de un solo caso; hay que mostrar que se puede replicar |
| **B. Herramienta global** | Cualquier punto del mapa, rotaciones genéricas | Parece más "producto" | Es lo que ya hacen otros equipos; más difícil que sea correcto en todas partes |
| **C. Mapa regional** | Zonas de vulnerabilidad de una región y rotaciones sugeridas por zona | Muy visual | Se aleja del agricultor individual, que es el foco del enunciado |

*Inclinación inicial:* **A, construida de forma que funcione para cualquier punto** (B como capacidad, A como historia). Se decide después de saber dónde está la finca y quién forma el equipo.

## 8. Cómo diferenciarnos

- **Un agricultor real** con nombre, cultivos y problemas reales, que revisó las sugerencias. Casi nadie lo va a tener.
- **Mostrar los dilemas, no esconderlos**: "esta cobertura protege el suelo pero consume agua en tu mes más seco".
- **El calendario del lote** como imagen central.
- **Mirar al futuro** con GAEZ v5: no solo "qué pasó", sino "qué va a seguir funcionando".
- **Honestidad sobre los datos**: decir siempre de dónde sale cada número y con qué resolución.

## 9. Riesgos y cómo cubrirlos

| Riesgo | Cómo cubrirlo |
|---|---|
| Los datos son más gruesos que el lote | Hablar de "tu zona" y sumar el conocimiento del agricultor |
| AppEEARS puede tardar en procesar | Pedir los datos apenas sepamos la ubicación; guardar copia local para la demo |
| Recomendar algo agronómicamente incorrecto | Reglas basadas en fuentes, revisión del agricultor, avisos claros |
| 48 horas no alcanzan para todo | Priorizar recorrido + calendario + 3 fichas; lo demás es extra |
| Pantallas demasiado técnicas | Mostrárselas al agricultor y preguntar qué entiende |
| La web oficial no abre desde esta PC | Guardar a mano las páginas necesarias |

## 10. Guía de entrevista al agricultor (para mañana)

**Antes de empezar:** pedir permiso para usar su caso (y nombre o fotos, si acepta) en la presentación.

**Su campo**
1. ¿Dónde está el campo? (ubicación aproximada o un punto en el mapa)
2. ¿Cuántas hectáreas? ¿Tiene riego o depende de la lluvia?
3. ¿Qué tipo de suelo tiene? ¿Hay partes que se inundan, se lavan o se compactan?

**Su rotación actual**
4. ¿Qué cultivó en los últimos 3–5 años, en orden?
5. ¿En qué meses siembra y cosecha cada cultivo? ¿Cuándo queda el campo sin nada?

**Sus problemas**
6. ¿Qué le preocupa más hoy? (agua, heladas, calor, plagas, erosión, precios)
7. ¿Notó cambios en el clima en los últimos años? ¿Cuáles?
8. ¿Hubo algún año que salió muy mal? ¿Qué pasó?

**Sus prioridades y límites**
9. Si pudiera mejorar una sola cosa, ¿cuál sería?
10. ¿Probó cultivos de cobertura, leguminosas o pasturas? ¿Cómo le fue?
11. ¿Qué no podría hacer aunque quisiera? (maquinaria, mano de obra, mercado, dinero)
12. ¿Tiene ganado o vende forraje?

**Sobre la herramienta**
13. ¿Qué tendría que mostrarle una herramienta para que confíe en ella?
14. ¿La usaría en el celular o en la computadora?

## 11. Preguntas abiertas del equipo

Ver `CONTEXTO.md` → *Preguntas abiertas*.
