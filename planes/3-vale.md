# Plan de Vale · Campo y agronomía

> **Este plan es un punto de partida.** Vale decide cómo abordarlo: a quién consultar, en qué orden escribir las rotaciones y qué fuentes usar. Lo que conviene sostener es lo compartido: el [objetivo común](README.md#objetivo-común), los [contratos de datos](../docs/contratos-de-datos.md) y los horarios de integración.

| | |
|---|---|
| **Rama** | `vale-rotaciones` |
| **Frente** | F4 Rotaciones y agronomía (incluye validar la Zona 5) |
| **Archivos propios** | `data/rotaciones_santiago.json`, `docs/zonas-santiago-y-kit-arduino.md`, `docs/documentacion-tecnica-agronomica.md`, `docs/glosario.md` |
| **Recibís de** | El productor (entrevista) · el INTA o productores del sur (Zona 5) · Enzo: datos de clima para la evidencia |
| **Entregás** | A Enzo: las rotaciones de las 5 zonas · A Santi: la zona protagonista y la ubicación del campo · A Sara: el testimonio del productor |

## Tu objetivo

Que las 3 rotaciones de cada zona sean creíbles para un productor santiagueño y respondan los 5 puntos que pide la NASA: por qué se sugiere, qué evidencia la respalda, qué beneficios tiene, qué falta saber y qué riesgos hay que revisar.

**Cómo aporta al objetivo común:** sin rotaciones bien hechas, la app no tiene nada que comparar. El productor real es lo que más nos diferencia de los otros equipos.

## Checklist

### Hito 0 · Sáb 16:30
- [x] Pasarte a tu rama (`git switch vale-rotaciones`)
- [x] Coordinar la entrevista con el productor (guía en [`docs/resena-desafio.md`](../docs/resena-desafio.md) §10, con permiso para usar su caso)
- [x] Repasar las rotaciones borrador de [`docs/zonas-santiago-y-kit-arduino.md`](../docs/zonas-santiago-y-kit-arduino.md) y del mockup como punto de partida

### Checkpoint 1 · Sáb 20:30
- [ ] Entrevistar al productor (guía lista para "Bella Criolla"; falta que responda)
- [x] Elegir la zona protagonista y avisar a Santi (ubicación del campo) y a Enzo
- [x] Escribir las 3 rotaciones de la zona protagonista con los 5 puntos, la sección A/B/C/D de cada cultivo y el calendario de 12 meses
- [ ] Revisarlas con el productor
- [x] Guardar la zona protagonista en `data/rotaciones_santiago.json` según el contrato

### Checkpoint 2 · Dom 09:30
- [x] Escribir las rotaciones de las otras 4 zonas (versión corta)
- [ ] Validar las rotaciones borrador de la Zona 5 con el INTA o con productores del sur
- [x] Definir los atributos de cada rotación (demanda de agua, nitrógeno, forraje, ingreso), que hoy en el mockup son de ejemplo
- [x] Citar la fuente de cada afirmación agronómica (INTA, trabajos publicados)
- [x] Guardar las 5 zonas (15 rotaciones) en `data/rotaciones_santiago.json`

### Congelamiento · Dom 15:00
- [ ] Revisar los textos agronómicos de la app: que no haya errores ni promesas de más
- [ ] Revisar "qué falta saber" y los riesgos de cada rotación (arman la lista del paso 5)
- [ ] Sumar al glosario los términos agronómicos nuevos

### Entrega · Dom 19:00
- [ ] Pasarle a Sara una frase o testimonio del productor (con su permiso) para el pitch
- [ ] Revisar la parte agronómica del guion y participar del ensayo

## Listo cuando

- `data/rotaciones_santiago.json` tiene las 15 rotaciones (5 zonas × 3).
- La zona protagonista está validada por el productor.
- Cada afirmación agronómica tiene su fuente.

## Si algo se traba

- **Sin entrevista a las 15:30:** la Zona 2 (secano) queda como protagonista y las fichas se validan por mensaje o teléfono.
- **Sin validación de la Zona 5:** se presenta como borrador, con la advertencia visible.

## Para leer antes de arrancar

[`planes/README.md`](README.md) · [`docs/contratos-de-datos.md`](../docs/contratos-de-datos.md) §4 · [`docs/documentacion-tecnica-agronomica.md`](../docs/documentacion-tecnica-agronomica.md) (secciones A/B/C/D)

## Mis decisiones

- **Productor real y Zona Protagonista (Sáb 16:35):** El caso real relevado es el **Establecimiento "Bella Criolla"**, ubicado en la zona de **San Francisco, cerca del Río Utis (Departamento Quebrachos, sur de Santiago del Estero)**. Tienen **ganadería vacuna y caprina** y **siembran pasturas**. Esto consolida a la **Zona 5 (`zona_5_sur_serrano`)** como la **Zona Protagonista** del proyecto y adapta las 3 estrategias de rotación a la realidad del corredor del Río Utis (transición entre lomas serranas y bañados salinos del Utis, con 20,4 heladas/año).
- **Borrador de testimonio (SIMULADO, no lo dijo el productor; no usar en el pitch hasta que él lo confirme o lo reemplace con sus palabras):** *"Acá en Bella Criolla, cerca del Río Utis, cuando entran las 20 heladas de junio y julio se nos quema el Gatton y entre agosto y octubre nos quedamos sin pasto para las cabras y las vacas; si pelamos el lote, en los bajos sube el salitre y en las lomas el primer chaparrón de noviembre se lleva la tierra. Tener una herramienta que nos marque cuándo meter Grama Rhodes con Melilotus o cuándo cortar el pastoreo según el agua que queda abajo nos salva el invierno."*
