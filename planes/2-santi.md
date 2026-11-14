# Plan de Santi · Suelo, satélite e IA

> **Este plan es un punto de partida.** Santi decide cómo abordarlo: el orden, las herramientas, el método y la arquitectura del modelo. Lo que conviene sostener es lo compartido: el [objetivo común](README.md#objetivo-común), los [contratos de datos](../docs/contratos-de-datos.md) y los horarios de integración.

| | |
|---|---|
| **Rama** | `santi-datos-ia` |
| **Frentes** | F2 Suelo AIZAL · F3 IA con Landsat |
| **Archivos propios** | `ia_landsat/`, `scripts/*.js`, `data/datos_cruzados_aizal/`, `data/suelo_zonas.json`, `data/diagnostico_landsat_ia.json`, `data/imagenes/`, `ESTRUCTURA_DATOS.md`, `docs/cruce-de-datos.md` |
| **Recibís de** | Vale: zona protagonista y ubicación del campo del productor · la profesora: respuestas al documento de validación |
| **Entregás** | A Enzo: suelo, diagnóstico de IA e imágenes del visor · A Sara: métricas, capturas y el link del visor de Earth Engine |

## Tu objetivo

Sumar la información local de suelo que pide el desafío y cumplir la idea de la profesora (CNN + RNN + Transformer con Landsat) de forma que se pueda **medir y defender**.

**Cómo aporta al objetivo común:** pone en la app el suelo de cada zona, los meses en que el suelo queda pelado y el desmonte. Además, es nuestra mejor carta para los expertos de la NASA en aprendizaje automático.

## Checklist

### Hito 0 · Sáb 16:30
- [ ] Pasarte a tu rama (`git switch santi-datos-ia`)
- [ ] Confirmar acceso al stack AIZAL V4 en Google Earth Engine; si no hay, plan B SoilGrids
- [ ] Subir `docs/CONTEXTONASA.md` o sacar su link del catálogo AIZAL

### Checkpoint 1 · Sáb 20:30
- [ ] Correr `scripts/gee_visor_biosat.js`, publicarlo como Earth Engine App y pasarles el link a Enzo y a Sara
- [ ] Correr `scripts/gee_exportar_zonas.js`: estadísticas por zona e imágenes en `data/imagenes/`
- [ ] Extraer de AIZAL por zona: pH, textura, carbono, nitrógeno, densidad aparente, PDSI, distancia a caminos y a monte, y % de monte nativo
- [ ] Guardar `data/suelo_zonas.json` con fuente y confianza por dato (las 5 zonas)
- [ ] Bajar las series Landsat 8/9 (2016-2025), calcular NDVI, NBR y BSI y armar compuestos mensuales

### Checkpoint 2 · Dom 09:30
- [ ] Armar etiquetas reales con MapBiomas Chaco (o Hansen) para entrenar y evaluar
- [ ] Método simple de referencia: umbrales de NDVI y NBR
- [ ] Modelo CNN + LSTM
- [ ] Modelo CNN + Transformer temporal, para comparar
- [ ] Evaluar los 3 métodos con zonas que el modelo no vio (exactitud y F1) y guardar la tabla
- [ ] Decidir qué método usa la app (si ninguno supera al umbral, se usa el umbral)
- [ ] Calcular los meses de suelo pelado por zona y el % de desmonte reciente
- [ ] Definir el índice de fragilidad como fórmula visible
- [ ] Guardar `data/diagnostico_landsat_ia.json`, solo con valores calculados

### Congelamiento · Dom 15:00
- [ ] Agrupar la provincia en zonas parecidas (k-means sobre AlphaEarth) y comparar con las 5 zonas
- [ ] Adaptar `scripts/earth_engine_embeddings.js` a Santiago del Estero
- [ ] Sumar lo que responda la profesora al documento de validación
- [ ] Pasarle a Sara las métricas, una captura del visor y la comparación 2000 contra 2025

### Entrega · Dom 19:00
- [ ] Ayudar con el video y la página: explicar el modelo en 20 segundos

## Listo cuando

- Hay una tabla de métricas que compara los 3 métodos.
- `data/suelo_zonas.json` y `data/diagnostico_landsat_ia.json` tienen solo valores calculados.
- El visor de Earth Engine tiene un link público.

## Si algo se traba

- **Sin acceso a AIZAL a las 18:30:** SoilGrids por punto.
- **Sin series Landsat a las 21:30:** seguir con las escenas que haya y con el método de umbrales.
- **El modelo no supera al umbral el domingo a las 09:30:** la app usa el umbral y el modelo se muestra como experimento, con sus métricas.

## Para leer antes de arrancar

[`planes/README.md`](README.md) · [`docs/contratos-de-datos.md`](../docs/contratos-de-datos.md) §2 y §3 · [`docs/cruce-de-datos.md`](../docs/cruce-de-datos.md) · [`docs/BioSat-cruce-de-datos-validacion.docx`](../docs/BioSat-cruce-de-datos-validacion.docx)

## Mis decisiones

- *(Anotá acá lo que decidas en el camino. Enzo lo pasa a la bitácora en cada hito.)*
