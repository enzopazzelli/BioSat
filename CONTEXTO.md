# Contexto de trabajo — BioDat (NASA Space Apps 2026)

> Abrir esto primero. Resume dónde quedamos el **13/11/2026** para retomar mañana.

## Qué es este proyecto

Participación del equipo en **NASA Space Apps Challenge 2026**, desafío **"Field Shift: Adapting Farms with NASA Data"**.
Objetivo del desafío: una herramienta que ayude a un agricultor a **comparar rotaciones de cultivos** usando datos de la NASA + suelo local + características de cultivos + sus prioridades, para mejorar la salud del suelo y adaptarse al clima.

## Archivos en la carpeta

| Archivo | Qué tiene |
|---|---|
| `NASA Space Apps Challenge.pdf` | Enunciado oficial (pestaña *Details*) |
| `NASA Space Apps Challenge.mhtml` | Recursos oficiales (pestaña *Resources*) |
| `NASA Space Apps Challenge - awards.mhtml` | Los 10 Premios Globales de la NASA y datos del equipo (`BioSat` — sede Santiago del Estero) |
| `docs/recursos-desafio.md` | Resumen del enunciado + los 26 recursos clasificados y cómo se accede a cada uno |
| `docs/resena-desafio.md` | Reseña del desafío: qué piden, qué sabemos, qué se puede hacer |
| `docs/glosario.md` | Glosario vivo de términos satelitales, agronómicos, de IA (CNN/RNN/Transformer) y sensores Arduino |
| `docs/reglas-y-bitacora.md` | Reglas de oro del proyecto, alineación con los premios de la NASA y bitácora de decisiones |
| `docs/zonas-santiago-y-kit-arduino.md` | Kit AltaNet Arduino + ESP32, las 4 Zonas de Santiago del Estero y el módulo IA `CNN + RNN + Transformer` con Landsat |
| `docs/analisis-datos-nasa-santiago.md` | **Informe detallado de los hallazgos climáticos y agronómicos reales de la NASA (2020–2025) en las 4 zonas de Santiago del Estero** |
| `docs/plan-de-pasos-y-agentes.md` | **Hoja de ruta paso a paso (Pasos 0 al 6) y guía para trabajar con 2 agentes en paralelo sin pisarse** |
| `scripts/descargar_nasa_power.py` | Script en Python que descarga y procesa los datos diarios de NASA POWER para las 4 zonas |
| `data/nasa_power_santiago_zonas.json` | Datos reales procesados de NASA POWER (2020–2025, 2.192 días por zona) listos para usar en la app |
| `data/resumen_mensual_santiago.csv` | Tabla mensual limpia (48 filas: 12 meses × 4 zonas) en formato CSV |
| `CONTEXTO.md` | Este archivo |

## Lo que pasó hoy (13/11)

1. Arrancamos la planificación. La carpeta estaba vacía.
2. La web oficial (spaceappschallenge.org) **no abre desde esta PC** por un error de certificado SSL. Se guardó la página a mano (PDF + MHTML) y se trabajó desde ahí.
3. Se leyó el enunciado completo y se revisaron los **26 enlaces de recursos** (19 se pudieron leer; 7 no cargaron: CropScape, suelos NRCS, NAIP, AMS Market News, NWIS, Earthdata Search, GES DISC).
4. Se **probó la API de NASA POWER**: funciona, sin cuenta, responde en menos de 1 s.

## Hallazgos clave

- **El enunciado pide algo concreto:** comparar **al menos 3 rotaciones, incluida la actual**. Para cada una: por qué se sugiere, qué evidencia la respalda, beneficios, información que falta y riesgos que debe revisar alguien local. Y dejar claro que la herramienta **apoya, no reemplaza** al agricultor.
- **Más de la mitad de los recursos son solo de EE. UU.** (suelo por lote, historial de cultivos CDL, precios, PRISM). Fuera de EE. UU. quedan los satélites globales, ERA5 y FAO GAEZ.
- **NASA POWER** alcanza como base: datos diarios desde 1981 en cualquier punto del mundo (temperatura, lluvia, humedad del suelo en raíces `GWETROOT`, evapotranspiración `EVPTRNS`). Contra: celdas de ~50 km.
- **AppEEARS** (requiere Earthdata Login) es el camino corto a los satélites: devuelve en CSV series de NDVI (MODIS), SMAP, ECOSTRESS, HLS y SRTM para un punto o polígono.
- **FAO GAEZ v5**: aptitud de cultivos a 1 km con escenarios climáticos hasta 2100. Responde "¿este cultivo seguirá encajando en 2040?".
- **Descartables:** GEDI, LANDFIRE, NLCD, NWIS, CoCoRaHS.
- **Competencia:** ya hay repos públicos para este desafío (FieldShift, FarmStack, Field-Shift). Casi todos son planificadores genéricos "para cualquier punto del mapa" basados en NASA POWER. Destacar = resolver bien el caso de un agricultor real.

## Lo que dijo el equipo

- "Sí, seguramente podemos consultar algo mañana" → **hay un agricultor real para consultar el 14/11**.

## Decisiones tomadas

- Trabajar con el texto oficial guardado en la carpeta (no con fuentes secundarias).
- Dejar fuera GEDI, LANDFIRE, NLCD, NWIS y CoCoRaHS.
- *Todavía no se eligió enfoque ni tecnología.* Eso depende de las preguntas abiertas.

## Preguntas abiertas (en orden de importancia)

1. **¿Dónde está la finca del agricultor y qué cultiva hoy?** Define si vamos por la ruta EE. UU. (datos por lote) o global (POWER + AppEEARS + GAEZ), y cuál es "la rotación actual".
2. **Confirmar fechas:** fuentes externas dicen **14–15/11/2026**. Revisar las reglas del evento local (qué se puede preparar antes).
3. **¿Quiénes son el equipo y qué saben hacer?** (programación, diseño, datos, agronomía). Define el alcance realista en 48 h.
4. ¿Cómo y dónde se entrega? (formato de la presentación final del evento).

## Pendientes antes de arrancar

- [ ] Crear cuenta **Earthdata Login** (NASA) → habilita AppEEARS, GES DISC, Giovanni.
- [ ] Crear cuenta **Copernicus** (CDS para ERA5; Data Space para Sentinel‑2).
- [ ] Si la finca está en EE. UU.: pedir clave de **NASS QuickStats** (llega por email).
- [ ] Llevar la **guía de entrevista al agricultor** (ver `docs/resena-desafio.md`).
- [ ] Responder las preguntas abiertas de arriba.

## Notas técnicas

- Llamada de prueba a POWER que funcionó:
  `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR,GWETROOT,EVPTRNS&community=AG&longitude=-98.5&latitude=40.0&start=20250101&end=20250105&format=JSON`
- spaceappschallenge.org falla por SSL desde esta PC → si hace falta otra página del sitio, guardarla a mano en la carpeta.
- El enunciado usa "SI" donde normalmente diría IA/AI ("SI techniques").
