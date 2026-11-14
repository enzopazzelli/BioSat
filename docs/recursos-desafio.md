# Field Shift: Adapting Farms with NASA Data — resumen del desafío y recursos

Fuente: página oficial guardada el 13/11/2026 (`NASA Space Apps Challenge.pdf` = pestaña Details, `NASA Space Apps Challenge.mhtml` = pestaña Resources).
Dificultad: Intermedio / Avanzado. Temas: Earth Science, Software, Arts & Multimedia.

## Qué pide (en una línea)

Una herramienta de apoyo a decisiones que combine observaciones de la NASA con suelo local, características de cultivos y prioridades del agricultor para **explorar estrategias de rotación** que mejoren la salud del suelo y la resiliencia al clima y al agua. Apoya, **no reemplaza**, el criterio del agricultor.

## Lo que el enunciado describe como resultado (checklist)

- Comparar **al menos 3 estrategias de rotación, incluida la actual**.
- Para cada estrategia: **por qué se sugiere**, **qué evidencia la respalda**, **beneficios**, **vacíos de información** y **riesgos que requieren revisión local**.
- Señalar: periodos de **suelo desnudo**, estaciones en que los cultivos actuales son **más vulnerables**, oportunidades para **cortar ciclos de plagas**, **reducir demanda de agua**, **mejorar infiltración** o **sumar ingresos**.
- Que el agricultor pueda **ingresar sus prioridades y restricciones** (agua disponible, maquinaria, mercado).
- Ser entendible para agricultores **sin experiencia técnica ni geoespacial**.
- Explicar la **incertidumbre** del modelo y dónde hace falta validación local.

Consideraciones opcionales: explicar términos (evapotranspiración, anomalías de humedad, NDVI, riesgo de helada, balance hídrico); diferencia satélite vs. medición en suelo; comparar enfoques de IA/estadística; armonizar resoluciones a una grilla común; mapas interactivos, líneas de tiempo, superposiciones, **sliders de escenarios** (lluvia/temperatura); explicar cómo aportan las leguminosas, los cultivos de cobertura, los de raíz profunda y los tolerantes a sequía.

## Recursos — por cobertura geográfica

### Globales (sirven en cualquier país)

| Recurso | Qué aporta | Notas |
|---|---|---|
| NASA POWER | Temperatura, humedad, radiación, lluvia diarias desde 1981; heladas, estrés térmico | API sin clave; grilla gruesa (~0,5°) |
| GPM / IMERG | Precipitación, tormentas extremas, tendencias | ~0,1°; requiere login Earthdata |
| SMAP | Humedad superficial del suelo, cada 2–3 días, desde 2015 | 9–36 km; requiere login Earthdata |
| MODIS / VIIRS | NDVI, índices de vegetación, estrés, suelo desnudo | 250 m–1 km, desde 2000 |
| Landsat | Reflectancia, NDVI a 30 m | Archivo largo |
| Sentinel‑2 (ESA) | NDVI/EVI, suelo desnudo, estrés a 10–20 m | Mejor resolución gratuita |
| ECOSTRESS | Temperatura de superficie y evapotranspiración (~70 m) | Desde 2018, pasadas irregulares |
| SRTM | Elevación → pendiente, escorrentía, erosión | Estático |
| GLDAS | Humedad de suelo, ET, clima en serie continua | NLDAS es la versión EE. UU. |
| ERA5 (ECMWF) | Clima horario de reanálisis, desde 1940 | Rellena huecos de estaciones |
| FAO GAEZ | Aptitud agroclimática por cultivo, limitaciones de suelo | Ideal para filtrar cultivos candidatos |
| GRACE / GRACE‑FO | Tendencias de agua subterránea | Muy grueso (cientos de km); solo en Details |
| GEDI | Biomasa y estructura de dosel | Poco útil en cultivos bajos |

### Solo EE. UU.

| Recurso | Qué aporta |
|---|---|
| Web Soil Survey / SSURGO / STATSGO2 | Suelo a nivel de lote: textura, materia orgánica, drenaje, erosión, capacidad de retención |
| Cropland Data Layer (CropScape) | **Cultivo por año a 30 m → rotación actual real** de cada lote |
| PRISM | Clima con efecto topográfico, normales de 30 años, fechas de helada |
| NAIP | Fotos aéreas a 1 m |
| NLCD | Uso/cobertura del suelo a 30 m |
| NLDAS | Versión EE. UU. de GLDAS |
| CoCoRaHS | Lluvia medida por voluntarios (Norteamérica) |
| USGS NWIS | Agua subterránea, caudales |
| USDA AMS Market News / NASS QuickStats | Precios, rindes y superficies por condado |
| OpenET | Evapotranspiración a nivel de lote (oeste de EE. UU.) |
| LANDFIRE | Vegetación y combustibles |
| USDA Ag Data Commons | Datasets agrícolas abiertos (mayormente EE. UU.) |

## Acceso práctico (revisado el 13/11/2026)

### Nivel 1: sin cuenta, funciona ya
- **NASA POWER API** — probada y funciona. `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR,GWETROOT,EVPTRNS&community=AG&longitude=-98.5&latitude=40.0&start=20250101&end=20250105&format=JSON`
  - Responde en menos de 1 s, sin clave. Hasta 20 parámetros por pedido. Formatos JSON/CSV/NetCDF/ICASA.
  - Datos diarios desde 1981. Meteorología (MERRA‑2) a ½°×⅝° y radiación a 1°×1°.
  - Además de temperatura y lluvia trae **humedad del suelo en la zona de raíces (GWETROOT)** y **evapotranspiración (EVPTRNS)**.
- **Copernicus Browser** — permite ver Sentinel‑2 sin cuenta.

### Nivel 2: cuenta gratuita, conviene crearla HOY
- **Earthdata Login** (NASA). Da acceso a:
  - **AppEEARS**: series de tiempo por punto o polígono en CSV/GeoTIFF/NetCDF de MODIS (NDVI), VIIRS, SMAP, ECOSTRESS, HLS (Landsat+Sentinel a 30 m, cada 1,6 días), SRTM/NASADEM y Daymet. Tiene API. Es la vía más corta a los satélites.
  - **GES DISC / Giovanni**: IMERG y GLDAS recortados por región.
- **Copernicus CDS** (ERA5): GRIB, licencia CC‑BY, hay que aceptar la licencia en la web.
- **Copernicus Data Space** (Sentinel Hub / openEO / STAC / Jupyter).
- **NASS QuickStats API key** (EE. UU.): llega por email. Hasta 50.000 registros por pedido, JSON/CSV.

### Nivel 3: pesado o poco útil para 48 h
- EarthExplorer (escenas Landsat completas, login), SMAP crudo en HDF5, EarthData Search (aplicación web).
- **Descartables:** GEDI (solo bosques), LANDFIRE (combustibles para incendios), NLCD (solo contexto), NWIS (solo si hay riego con pozo), CoCoRaHS (solo para validar lluvia).

### Datos puntuales que importan
- **CDL**: pasó de 30 m a **10 m desde 2024**. El CDL 2025 salió en febrero de 2026. El visor ACTIVE CDL (Google Earth Engine) consulta el historial de cultivos.
- **GAEZ v5**: 1 km, línea base 2020 y **escenarios climáticos SSP1‑2.6 / SSP3‑7.0 / SSP5‑8.5 hasta 2100**. Sirve para responder "¿este cultivo seguirá encajando en 2040?". Global.
- **OpenET**: ET a 30 m diaria/mensual. Oeste de EE. UU., con expansión a Brasil. API y Google Earth Engine.
- **PRISM**: 800 m / 4 km, diario desde 1981, normales 1991–2020. Solo EE. UU.
- **VIIRS**: Suomi NPP dejó de operar el 2/11/2026. Usar NOAA‑20/21.
- **IMERG**: la versión Final V07 llega hasta sep‑2025. Para lo reciente, usar Late Run.
- **Soil Data Access** (SSURGO): servicio web sin login. Se cae de 00:00 a 02:00 hora de Montaña de EE. UU. cada noche.

### No se pudieron revisar desde aquí
CropScape (certificado SSL rechazado), página de suelos NRCS y NAIP (timeout), AMS Market News y NWIS (403), Earthdata Search y GES DISC (solo cargan con JavaScript).

## Implicancia para planificar

Más de la mitad de los recursos curados son **solo de EE. UU.** Elegir una finca en EE. UU. da suelo a nivel de lote, la rotación actual sacada del CDL y datos de mercado. Fuera de EE. UU. hay que apoyarse en los satélites globales, ERA5 y GAEZ, más suelo de fuentes no listadas (p. ej. SoilGrids) o nacionales, y **la rotación actual tiene que cargarla el agricultor**.
