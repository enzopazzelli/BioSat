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
- [x] Paso 3 (comparador de 3 rotaciones con los 5 puntos) con las rotaciones de la zona protagonista de Vale
- [x] Integrar en `main` lo que esté listo y publicar la app v1 en GitHub Pages
- [x] Pasar a la bitácora las decisiones anotadas en los planes de cada uno

### Checkpoint 2 · Dom 09:30
- [x] Motor de reglas transparente (secciones A/B/C/D + prioridades) que ordena las rotaciones y explica por qué
- [x] Bloque "qué ganás y qué te cuesta" y gráfico de compensaciones
- [x] Riesgo como frecuencia ("en 1 de cada 5 años…")
- [x] Etiquetas de confianza en cada dato
- [x] Visor GIS del lote con las imágenes de `data/imagenes/` (de Santi)
- [x] Las 5 zonas cargadas con suelo y diagnóstico de IA (lo que haya; el resto, "sin dato")
- [x] Panel "presión de desmonte en tu zona" (lee `data/desmonte_zonas.json`) y zonificación AIZAL como capa del visor
- [x] Integrar en `main` y pasar decisiones a la bitácora

### Congelamiento · Dom 15:00
- [x] Paso 4 (simulador de lluvia y temperatura) y paso 5 (lista para el agrónomo)
- [x] Pantalla del kit para la mesa del jurado (`web/kit.html`)
- [x] Guía Del kit al campo (`web/campo.html`)
- [x] Sumar el lector del Arduino de Sara (`arduino/lector-web-serial.js`) con respaldo de lecturas grabadas *(hecho y probado con un puerto simulado; falta probarlo con el Arduino real)*
- [x] "Apoya, no reemplaza" y fuente de cada dato visibles en toda la app
- [x] Probar en celular y sin internet
- [x] Corregir `docs/analisis-datos-nasa-santiago.md` con los datos nuevos
- [ ] Último merge de funciones a `main`

### Entrega · Dom 19:00
- [ ] Revisar el README final con Sara
- [ ] Dejar `main` estable con la app publicada

### Sugerencias de la organización · 14/11 noche
- [x] Asistente de inicio de 4 preguntas (`web/asistente.js`, `web/asistente-logica.js`)
- [x] Mapa real de Santiago del Estero en la pregunta 1 (`data/santiago_mapa.json`)
- [x] App más fácil de entender: frases simples, detalle técnico plegado y letra más grande
- [x] Botón de idioma EN/ES en toda la app *(etapa 1 hecha, D-35: asistente, Inicio, marco del Reporte, kit y guía del campo)*
- [ ] Idioma, etapa 2: el cuerpo del Reporte (textos dentro de `app.js`), los plegables, la vista detallada y los textos largos de las rotaciones (con la revisión de Vale)

### Agregadas por Enzo · 14/11 noche (a revisar con cada uno)
_Salen del repaso del repo. Cada uno decide cómo abordarlas; si no corresponden, se borran._
- [ ] Mostrar en la app y en el README el link del visor de Earth Engine cuando Santi lo publique
- [x] Verificar que el visor use las imágenes de Earth Engine cuando Santi suba `data/imagenes/escenas.json` *(D-30: compuestos reales de Earth Engine)*
- [x] Decidir si Meteomatics entra en la app (alertas a 7-10 días, `data/meteomatics_santiago_zonas.json`) o queda fuera de la demo *(15/11: entra como tarjeta "Esta semana en tu zona", D-34)*
- [ ] Ensayar `web/kit.html` y `web/campo.html` en la pantalla grande de la demo, con el kit conectado
- [ ] Cerrar `PLAN.md`: sumar kit y guía en la sección 1 y contestar las preguntas abiertas
- [ ] Probar de nuevo la app publicada en el celular y sin internet después del último merge

### App para el celular y reporte completo · 15/11 (D-31)
- [x] Inicio simple: semáforo de la zona (o de la sonda), lo que mejor encaja con la tira de 12 meses, Medir con la sonda y WhatsApp
- [x] Reporte completo en una sola página con 7 secciones abiertas, conclusiones calculadas, Guardar PDF y Compartir
- [x] Conservar la página de antes como vista detallada (`web/completo.html`)
- [x] Asistente: la pregunta 1 nombra la característica de la zona y abajo sus localidades
- [x] Probar el Inicio y el Reporte en un celular de verdad *(Enzo, 15/11: se ve bien)*
- [x] Revisión final de las ramas `santi-datos-ia` y `enzo-app` antes de integrar la app a `main` *(15/11: `santi-datos-ia` no tiene nada fuera de `main`; `enzo-app` quedó integrada entera)*

### Inicio en la PC y pronóstico de Meteomatics · 15/11 (D-34)
- [x] Inicio en dos columnas desde 1024 px (solo CSS; el celular no cambia)
- [x] Tarjeta "Esta semana en tu zona" en el Inicio y en el Reporte, que nunca muestra un pronóstico vencido como actual (`web/pronostico-logica.js`, con pruebas)
- [x] Actualización diaria del pronóstico con GitHub Actions; el script no pisa el archivo si falla una zona
- [x] Pantalla del kit: la máxima de hoy a 9 km entre NASA POWER y la sonda
- [x] Cargar el secreto `METEOMATICS_PASSWORD` en GitHub (Settings → Secrets and variables → Actions) y correr una vez el workflow "Actualizar pronostico de Meteomatics" *(15/11 11:06: corrió bien y subió el pronóstico del 15 al 22/11, commit `4ea751a`)*

### Lector de imágenes de dron · 15/11 (D-38)
- [x] Etapa 1: abrir un GeoTIFF de dron en el Reporte, verlo en el mapa con la cortina Landsat contra dron, NDVI del lote comparado con la zona y la línea del Inicio (`web/dron-logica.js` y `web/dron.js`, con pruebas)
- [x] Probar la etapa 1 con un .tif real (lo consigue Enzo): tamaño, bandas, sistema de coordenadas, tiempo de lectura *(15/11: `drone.tif`, foto RGB de 33,6 MB en UTM 21 S, cerca de Corrientes; se lee en 1,2 a 1,6 s en Chrome; ver D-38)*
- [ ] Probarlo en un celular de verdad
- [x] Etapa 2: marcar sectores con nota, estado y qué se encontró; el vuelo y los sectores guardados en el navegador para el campo sin internet; exportar e importar (GeoJSON) y en el PDF (D-39, `web/sectores-logica.js` y `web/sectores.js`, con pruebas)
- [x] Probar la etapa 2 con el `NDVI.tif` real de un DJI multiespectral (lo consigue Enzo) *(15/11: 382,6 MB, Zona 1 Capital, NDVI mediano 0,42; ver D-39)*

### Satélite del lote · 15/11 (D-40)
- [x] Rótulo honesto de Landsat (unos 120 m por píxel en el visor; NDVI a 100 m en el panel)
- [x] Recorte satelital del lote (Sentinel-2 10 m y Landsat 30 m) en el visor, con la cortina y la comparación del NDVI con el dron (`ia_desmonte/recorte_lote.py`, `web/satelite-logica.js`)
- [ ] Correr el recorte real del lote de la Zona 1 (falta `EE_PROJECT` y la fecha del vuelo)
- [ ] Volver a exportar las imágenes NDVI de Landsat de las zonas con la paleta de la leyenda (hoy no coinciden)

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
- **Presión de desmonte (D-26):** la app muestra el riesgo medio de la zona, la serie anual y las métricas de los 3 modelos. El nivel (alta, media o baja) es relativo: compara la zona con las otras 4, sin umbrales fijos. Si es alta, el paso 3 lo avisa.
- **Zonificación AIZAL:** la ficha de la zona muestra el grupo AIZAL y el visor suma la capa si Santi exporta la imagen (contratos §7, `meta.imagen`).
- **Arduino:** definí en contratos §6 la interfaz `window.BioSatArduino` (`soportado`, `conectar`, `desconectar`). La app carga `arduino/lector-web-serial.js` si existe; si no, usa las lecturas grabadas.
- **Pruebas:** en Chrome headless, a 390 px de ancho no hay desbordes. Sin internet (todo lo externo bloqueado) se dibuja completa. Con datos de prueba, el panel de desmonte, el grupo AIZAL y el botón del Arduino funcionan.
- **Informe de clima (D-26):** `docs/analisis-datos-nasa-santiago.md` se regeneró desde los datos 1981-2025. Se borraron el JSON viejo (2020-2025, con errores) y sus descargas crudas.
