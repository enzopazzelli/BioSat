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
- [x] Pasarte a tu rama (`git switch enzo-app`)
- [x] Traer el mockup al repo como base de `web/` (está en el link del mockup)
- [x] Hacer que `web/` lea los JSON de `data/` (las plantillas ya están) y muestre "sin dato" donde haya `null`

### Checkpoint 1 · Sáb 20:30
- [x] Ampliar `scripts/descargar_nasa_power.py` a 1981-2025 y sumar la Zona 5 (Ojo de Agua, -29.50, -63.69)
- [x] Calcular lo normal (1991-2020) y lo reciente (2021-2025)
- [x] Calcular la demanda de agua (ET0 Hargreaves) y el balance lluvia − ET0; `EVPTRNS` viene en MJ/m²/día
- [x] Agregar rangos entre años, probabilidad y fechas típicas de helada, y la humedad en raíces como anomalía
- [x] Generar `data/clima_zonas.json` según el contrato
- [x] Paso 1 (zona, prioridades, límites) y paso 2 (calendario del lote) con datos reales
- [ ] Paso 3 (comparador de 3 rotaciones con los 5 puntos) con las rotaciones de la zona protagonista de Vale
- [x] Integrar en `main` lo que esté listo y publicar la app v1 en GitHub Pages
- [x] Pasar a la bitácora las decisiones anotadas en los planes de cada uno

### Checkpoint 2 · Dom 09:30
- [x] Motor de reglas transparente (secciones A/B/C/D + prioridades) que ordena las rotaciones y explica por qué
- [x] Bloque "qué ganás y qué te cuesta" y gráfico de compensaciones
- [x] Riesgo como frecuencia ("en 1 de cada 5 años…")
- [x] Etiquetas de confianza en cada dato
- [x] Visor GIS del lote con las imágenes de `data/imagenes/` (de Santi)
- [x] Las 5 zonas cargadas con suelo y diagnóstico de IA (lo que haya; el resto, "sin dato")
- [ ] Integrar en `main` y pasar decisiones a la bitácora

### Congelamiento · Dom 15:00
- [x] Paso 4 (simulador de lluvia y temperatura) y paso 5 (lista para el agrónomo)
- [ ] Sumar el lector del Arduino de Sara (`arduino/lector-web-serial.js`) con respaldo de lecturas grabadas
- [x] "Apoya, no reemplaza" y fuente de cada dato visibles en toda la app
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

- **Clima (14/11):** `data/clima_zonas.json` suma escenarios de temperatura y datos año por año para el simulador y el riesgo. Actualicé el contrato §1.
- **Puntajes del motor:** salen de reglas fijas sobre los atributos y el calendario de cada rotación, no de números puestos a mano. La leguminosa suma un punto solo si no es monocultivo.
- **Rotaciones:** mientras Vale no cargue las 3 de una zona, la app usa el borrador del equipo (`web/datos-borrador/`) y lo avisa en pantalla.
- **Imágenes:** la app usa `data/imagenes/` (Earth Engine, de Santi) si existe; si no, las de Planetary Computer en `web/img/`.
- **Sin internet:** Leaflet y las imágenes van dentro de `web/`. Las fuentes tipográficas caen a las del sistema.
- **Caché de NASA POWER 1981-2025:** no se sube (está en `.gitignore`); el script la vuelve a bajar en segundos.
- **App publicada (Checkpoint 1):** https://enzopazzelli.github.io/BioSat/web/
- **Pendiente:** `data/nasa_power_santiago_zonas.json` queda como versión vieja (2020-2025, con errores) hasta corregir el informe de análisis.
