# Plan de Enzo · Integración y app

> **Este plan es un punto de partida.** Enzo decide cómo abordarlo: el orden, las herramientas y el método. Lo que conviene sostener es lo compartido: el [objetivo común](README.md#objetivo-común), los [contratos de datos](../docs/contratos-de-datos.md) y los horarios de integración.

| | |
|---|---|
| **Rama** | `enzo-app` |
| **Frentes** | F1 Clima · F5 App y motor · integración en `main` |
| **Archivos propios** | `web/`, `scripts/descargar_nasa_power.py`, `data/clima_zonas.json` y los datos de NASA POWER. También los compartidos (`PLAN.md`, `README.md`, bitácora, contratos), solo en `main` |
| **Recibís de** | Santi: suelo, diagnóstico IA e imágenes · Vale: rotaciones · Sara: lector del Arduino y lecturas grabadas |
| **Entregás** | La app publicada (para todos y para el pitch de Sara) y `data/clima_zonas.json` |

## Tu objetivo

Que un productor recorra los 5 pasos de la app sin ayuda, con números de clima correctos, y entienda de dónde sale cada dato.

**Cómo aporta al objetivo común:** la app es donde se juntan el trabajo de los cuatro y lo que ve el jurado.

## Checklist

### Hito 0 · Sáb 16:30
- [ ] Pasarte a tu rama (`git switch enzo-app`)
- [ ] Traer el mockup al repo como base de `web/` (está en el link del mockup)
- [ ] Hacer que `web/` lea los JSON de `data/` (las plantillas ya están) y muestre "sin dato" donde haya `null`

### Checkpoint 1 · Sáb 20:30
- [ ] Ampliar `scripts/descargar_nasa_power.py` a 1981-2025 y sumar la Zona 5 (Ojo de Agua, -29.50, -63.69)
- [ ] Calcular lo normal (1991-2020) y lo reciente (2021-2025)
- [ ] Calcular la demanda de agua (ET0 Hargreaves) y el balance lluvia − ET0; `EVPTRNS` viene en MJ/m²/día
- [ ] Agregar rangos entre años, probabilidad y fechas típicas de helada, y la humedad en raíces como anomalía
- [ ] Generar `data/clima_zonas.json` según el contrato
- [ ] Paso 1 (zona, prioridades, límites) y paso 2 (calendario del lote) con datos reales
- [ ] Paso 3 (comparador de 3 rotaciones con los 5 puntos) con las rotaciones de la zona protagonista de Vale
- [ ] Integrar en `main` lo que esté listo y publicar la app v1 en GitHub Pages
- [ ] Pasar a la bitácora las decisiones anotadas en los planes de cada uno

### Checkpoint 2 · Dom 09:30
- [ ] Motor de reglas transparente (secciones A/B/C/D + prioridades) que ordena las rotaciones y explica por qué
- [ ] Bloque "qué ganás y qué te cuesta" y gráfico de compensaciones
- [ ] Riesgo como frecuencia ("en 1 de cada 5 años…")
- [ ] Etiquetas de confianza en cada dato
- [ ] Visor GIS del lote con las imágenes de `data/imagenes/` (de Santi)
- [ ] Las 5 zonas cargadas con suelo y diagnóstico de IA (lo que haya; el resto, "sin dato")
- [ ] Integrar en `main` y pasar decisiones a la bitácora

### Congelamiento · Dom 15:00
- [ ] Paso 4 (simulador de lluvia y temperatura) y paso 5 (lista para el agrónomo)
- [ ] Sumar el lector del Arduino de Sara (`arduino/lector-web-serial.js`) con respaldo de lecturas grabadas
- [ ] "Apoya, no reemplaza" y fuente de cada dato visibles en toda la app
- [ ] Probar en celular y sin internet
- [ ] Corregir `docs/analisis-datos-nasa-santiago.md` con los datos nuevos
- [ ] Último merge de funciones a `main`

### Entrega · Dom 19:00
- [ ] Revisar el README final con Sara
- [ ] Dejar `main` estable con la app publicada

## Listo cuando

- Hay un link público que funciona en celular y una copia que funciona sin internet.
- `data/clima_zonas.json` tiene datos reales de las 5 zonas.

## Si algo se traba

- **Falta un JSON de otro:** la app muestra "sin dato" y se sigue.
- **No llega el simulador al congelamiento:** se presenta sin simulador.

## Para leer antes de arrancar

[`planes/README.md`](README.md) · [`docs/contratos-de-datos.md`](../docs/contratos-de-datos.md) · mockup de referencia · [`docs/cruce-de-datos.md`](../docs/cruce-de-datos.md)

## Mis decisiones

- *(Anotá acá lo que decidas en el camino.)*
