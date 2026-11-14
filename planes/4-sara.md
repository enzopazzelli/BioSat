# Plan de Sara · Kit Arduino y relato

> **Este plan es un punto de partida.** Sara decide cómo abordarlo: el armado del kit, el formato del video y el estilo del relato. Lo que conviene sostener es lo compartido: el [objetivo común](README.md#objetivo-común), los [contratos de datos](../docs/contratos-de-datos.md) y los horarios de integración.

| | |
|---|---|
| **Rama** | `sara-arduino-entrega` |
| **Frentes** | F6 Kit Arduino · F7 Entrega y presentación (coordina) |
| **Archivos propios** | `arduino/`, `entrega/`, `data/arduino_bandejas_demo.json` |
| **Recibís de** | Enzo: la app publicada · Santi: métricas, capturas y link del visor · Vale: testimonio del productor |
| **Entregás** | A Enzo: el lector del Arduino y las lecturas grabadas · A todos: la hora de entrega, el guion, el video y la página del proyecto |

## Tu objetivo

Mostrar en vivo que el suelo pelado se calienta y se seca mucho más que el cubierto, y lograr que el jurado entienda la historia de BioSat en 2 minutos y que la entrega llegue a tiempo.

**Cómo aporta al objetivo común:** el kit responde a lo que pide el desafío sobre satélite contra medición en tierra. El relato es lo que ve el jurado antes que la app.

## Checklist

### Hito 0 · Sáb 16:30
- [ ] Pasarte a tu rama (`git switch sara-arduino-entrega`)
- [ ] Confirmar la hora exacta y el formato de la entrega en la guía del participante (desde el celular, porque en la PC falla el sitio) y avisar al grupo
- [ ] Revisar que el kit tenga los sensores (agua, LM35, LDR, DHT11), los LEDs y la pantalla LCD
- [x] Textos del kit corregidos: el LDR mide luz, no NDVI, y el sensor de agua no separa salitre de humedad sin calibrar (D-20)

### Checkpoint 1 · Sáb 20:30
- [ ] Sketch `arduino/biosat_estacion_campo/biosat_estacion_campo.ino` que mande una línea JSON cada 2 segundos (contrato §5)
- [ ] Armar las 3 bandejas: pelada y seca, salitrosa y con rastrojo
- [ ] Calibrar los umbrales con las bandejas reales
- [ ] Guion borrador de 2-3 minutos con el zoom de escalas del video de la NASA (50 km → 500 m → 30 m → 1 m² → el productor) y los 4 verbos

### Checkpoint 2 · Dom 09:30
- [ ] Lector Web Serial como módulo propio (`arduino/lector-web-serial.js`) con una función simple para que Enzo lo sume a la app
- [ ] Grabar lecturas reales de las 3 bandejas en `data/arduino_bandejas_demo.json`
- [ ] Buscar una foto de astronauta del Chaco santiagueño (eol.jsc.nasa.gov)
- [ ] Preparar la comparación 2000 contra 2025 de Campo Gallo (desmonte) para el pitch

### Congelamiento · Dom 15:00
- [ ] Video o diapositivas, según el formato que pidan
- [ ] Borrador de la página del proyecto en Space Apps: resumen, datos de la NASA usados, links al repo y a la app
- [ ] Declarar el uso de herramientas de IA, si la guía lo pide
- [ ] Revisar las reglas de uso de marcas (logos de la NASA)

### Entrega · Dom 19:00
- [ ] Hacer 2 ensayos completos de la demo con todo el equipo
- [ ] Revisar el README final con Enzo
- [ ] Subir la entrega con margen antes del cierre

## Listo cuando

- La demo funciona con el Arduino conectado y también sin él.
- La entrega está subida a Space Apps y la demo se ensayó 2 veces.

## Si algo se traba

- **Arduino inestable el domingo a las 12:00:** la app usa las lecturas grabadas.
- **Falta el video:** se usan diapositivas con capturas de la app.

## Para leer antes de arrancar

[`planes/README.md`](README.md) · [`docs/contratos-de-datos.md`](../docs/contratos-de-datos.md) §5 · [`docs/transcripcion-video-desafio.md`](../docs/transcripcion-video-desafio.md) · [`docs/zonas-santiago-y-kit-arduino.md`](../docs/zonas-santiago-y-kit-arduino.md) §1

## Mis decisiones

- *(Anotá acá lo que decidas en el camino. Enzo lo pasa a la bitácora en cada hito.)*
