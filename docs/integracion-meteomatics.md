# Integración de Meteomatics en BioSat (NASA Space Apps Challenge 2026)

> **Autor:** Santiago Gallardo (Suelo, Satélite e IA · BioSat)  
> **Fecha:** 14 de Noviembre de 2026  
> **Cuenta Oficial:** `hackathon_nasa_space_apps_gallardo_santiagoignacio`  
> **Suscripción Activa:** `model_select_plus_all_1k` / `premium_all_1k` (ECMWF IFS 9 km, 1.000 req/día, histórico y pronóstico 1900–2028).  
> **Script Asociado:** [`scripts/descargar_meteomatics.py`](../scripts/descargar_meteomatics.py)  
> **Dataset Generado:** [`data/meteomatics_santiago_zonas.json`](../data/meteomatics_santiago_zonas.json)

---

## 1. Por qué Meteomatics es un Diferencial para BioSat

En el proyecto **BioSat** contábamos con dos pilares de datos:
1. **NASA POWER:** Reanálisis histórico (1981–2025) a escala regional gruesa (~50 km) con un retraso operativo de 2 a 4 días.
2. **AIZAL V4 / SoilGrids:** Propiedades estáticas de suelo y paisaje a 500 m.

**El problema a resolver:**  
El agricultor no solo toma decisiones mirando los últimos 10 años; necesita saber **qué va a pasar en los próximos 7 a 10 días** en su lote:
* *"¿Va a helar pasado mañana si siembro la vicia ahora?"*
* *"¿Llegará una tormenta fuerte justo cuando el suelo esté pelado?"*
* *"¿Habrá condiciones de mojamiento foliar que desaten un ataque de hongos en la leguminosa?"*

**El aporte de Meteomatics:**  
Meteomatics cubre exactamente el escalón intermedio en la **"Escalera de Escalas"**:
* Aumenta la resolución espacial de los 50 km de NASA POWER a **9 km (modelo europeo ECMWF IFS)**.
* Proporciona **Nowcasting y Pronóstico Operativo a 7–10 días**.
* Introduce parámetros microclimáticos y agronómicos que ningún satélite óptico puede medir de forma continua.

---

## 2. Los 10 Parámetros Seleccionados y su Función Agronómica

La API fue consultada y testeada exitosamente con un paquete optimizado de 10 variables (el límite de la suscripción por llamada):

| Parámetro en API | Nombre y Unidad | Qué mide físicamente | Cómo se aplica en BioSat |
|---|---|---|---|
| **`soil_moisture_deficit:mm`** | Déficit de Humedad del Suelo (`mm`) | Cantidad de milímetros de agua que le faltan al perfil para alcanzar capacidad de campo. | **Balance Hídrico del Lote:** Si el déficit supera los 120 mm, el motor de reglas desaconseja cultivos exigentes de verano (Maíz) y sugiere diferir siembra o pasar a Sorgo/Girasol. |
| **`leaf_wetness:idx`** | Índice de Mojamiento Foliar (`0 o 1`) | Presencia de agua líquida sobre el follaje (por rocío prolongado o lluvia). | **Alerta Fitosanitaria Temprana:** Si `leaf_wetness = 1` coincide con temperaturas entre 20 °C y 28 °C durante más de 48 h, se dispara la alerta de riesgo de hongos foliares (roya, mancha marrón) en leguminosas (Sección B). |
| **`frost_warning_24h:idx`** | Alerta de Helada en 24 h (`0 o 1`) | Alerta binaria cuando la temperatura superficial desciende a umbrales de congelamiento. | **Protección de Emergencia y Secado:** Define el momento exacto para quemar/rolar el cultivo de cobertura invernal (Sección D) o frena la siembra temprana de granos sensibles. |
| **`evapotranspiration_24h:mm`** | Evapotranspiración acumulada (`mm/día`) | Pérdida combinada de vapor por evaporación de suelo y transpiración vegetal. | **Demanda Hídrica Inmediata:** Modela qué tan rápido se está vaciando el "tanque" del suelo durante la semana de proyección. |
| **`precip_24h:mm`** | Precipitación acumulada (`mm/día`) | Lluvia pronosticada día a día. | **Riesgo de Erosión en Suelo Pelado:** Si se pronostican más de 30 mm y Landsat indica que el lote está descubierto, se activa la alerta de escorrentía severa. |
| **`t_max_2m_24h:C`** | Temperatura Máxima (`°C`) | Pico térmico esperado del día. | **Golpes de Calor:** Detecta si la floración coincidirá con días de más de 35 °C / 40 °C (aborto de flores en soja/maíz). |
| **`t_min_2m_24h:C`** | Temperatura Mínima (`°C`) | Mínima nocturna esperada. | **Ventanas Térmicas:** Evalúa si la especie sembrada soportará el frío en otoño/invierno. |
| **`wind_speed_10m:ms`** | Velocidad de Viento (`m/s`) | Viento medio a 10 metros de altura. | **Ventana de Pulverización (Deriva):** Si el viento supera los 4 m/s (15 km/h), desaconseja la aplicación de herbicidas para secado químico de coberturas. |
| **`relative_humidity_2m:p`** | Humedad Relativa (`%`) | Porcentaje de saturación de vapor en el aire. | **Microclima de Dosel:** Cruza con el sensor DHT11 del kit Arduino para validar la representatividad de la estación regional en el lote. |
| **`t_2m:C`** | Temperatura Media (`°C`) | Temperatura media a 2 m. | **Cálculo de Días-Grado (GDD):** Proyección del ritmo de desarrollo fenológico hacia la cosecha. |

---

## 3. Articulación con las 5 Zonas Agroecológicas de Santiago del Estero

El script [`scripts/descargar_meteomatics.py`](../scripts/descargar_meteomatics.py) descarga de forma periódica el pronóstico de 7 días para las 5 zonas de trabajo:

```text
1. Zona 1: Área de Riego del Río Dulce (-27.73, -64.17)
   -> Alerta: Cruce de alta evapotranspiración con suelo pelado (riesgo de salinización por evaporación de napa).

2. Zona 2: Secano Agrícola del Este (-27.65, -62.42)
   -> Alerta: Déficit hídrico en suelo previo a la siembra de gruesa y días con Tmax > 38 °C.

3. Zona 3: Chaco Semiárido Norte (-26.58, -62.85)
   -> Alerta: Escasez de agua y necesidad de rastrojo para amortiguar radiación extrema.

4. Zona 4: Bajos Submeridionales (-28.46, -62.83)
   -> Alerta: Lluvias intensas acumuladas que generan encharcamiento prolongado en suelos arcillosos.

5. Zona 5: Sur Serrano y Salinas (-29.50, -63.70)
   -> Alerta: Alertas de heladas y vientos fuertes en áreas con pendiente pronunciada.
```

---

## 4. Estructura de Salida Generada

El script genera el archivo [`data/meteomatics_santiago_zonas.json`](../data/meteomatics_santiago_zonas.json), estructurado de la siguiente manera:

```json
{
  "fuente": "Meteomatics Weather & Agro API (ECMWF IFS 9 km / Modelos Globales)",
  "evento": "NASA Space Apps Challenge 2026",
  "cuenta_hackathon": "hackathon_nasa_space_apps_gallardo_santiagoignacio",
  "zonas": [
    {
      "id": "zona_1_riego_salitre",
      "nombre": "Zona 1: Área de Riego del Río Dulce",
      "lat": -27.73,
      "lon": -64.17,
      "pronostico_7_dias": [
        {
          "fecha": "2026-11-14T00:00:00Z",
          "t_2m:C": 37.0,
          "t_max_2m_24h:C": 42.4,
          "t_min_2m_24h:C": 27.4,
          "precip_24h:mm": 0.0,
          "evapotranspiration_24h:mm": 8.82,
          "soil_moisture_deficit:mm": 169.9,
          "leaf_wetness:idx": 0,
          "frost_warning_24h:idx": 0,
          "wind_speed_10m:ms": 4.6,
          "relative_humidity_2m:p": 25.4
        }
      ]
    }
  ]
}
```

---

## 5. Estado Actual y Qué Falta para su Integración en la App

> **Actualización 15/11 (D-34): integrado (opción A).** La app muestra la tarjeta "Esta semana en tu zona" en el Inicio y en el Reporte, con los umbrales de esta sección (máxima de más de 38 °C y viento de menos de 15 km/h). La pantalla del kit suma la máxima de hoy a 9 km. El pronóstico se renueva todos los días con `.github/workflows/actualizar-meteomatics.yml`, y la contraseña va en el secreto `METEOMATICS_PASSWORD`. Contrato: [`contratos-de-datos.md`](contratos-de-datos.md) §10.
>
> **Ojo con el tiempo de cada valor:** los parámetros de 24 h miran hacia atrás. `precip_24h:mm` fechado el 16/11 00 UTC es la lluvia del 15/11. Además, `wind_speed_10m:ms` es **instantáneo** (00 UTC = 21 h de Argentina), no la "velocidad media" que dice la tabla de la sección 2. **Pendiente (Santi):**
> - cambiar `wind_speed_10m:ms` por `wind_speed_mean_10m_24h:ms` en `PARAMETROS` del script, para tener el promedio del día;
> - confirmar si `frost_warning_24h:idx` mira las 24 h anteriores o las siguientes.
>
> Lo que sigue abajo es el estado del 14/11, antes de integrarlo.

### ¿Cómo se usa hoy en BioSat?
* **Datos ya disponibles:** Se generó [`data/meteomatics_santiago_zonas.json`](../data/meteomatics_santiago_zonas.json) con los pronósticos a 7 días para las 5 zonas agroecológicas, cubriendo los 10 parámetros críticos (déficit hídrico, evapotranspiración, riesgo de helada, mojamiento foliar, viento, Tmax, Tmin, etc.).
* **Complementariedad:** Funciona como el eslabón de **alta resolución (9 km ECMWF)** y **tiempo real** que complementa la base climática histórica multidecadal de NASA POWER (1981–2025, 50 km).
* **Seguridad:** El script de descarga [`scripts/descargar_meteomatics.py`](../scripts/descargar_meteomatics.py) lee las credenciales desde variables de entorno (`METEOMATICS_USERNAME` y `METEOMATICS_PASSWORD`), manteniendo el repositorio público 100% seguro y libre de secretos en texto plano.

### ¿Qué falta para integrarlo en la Web (`web/app.js`)?
Para que el usuario de la app web vea este pronóstico en vivo:
1. **Carga en `web/app.js`:** Agregar `cargarJSON('../data/meteomatics_santiago_zonas.json')` dentro de `cargarDatos()`.
2. **Tarjeta de Alertas de Corto Plazo (7 Días):** Renderizar en la pestaña "Tu campo" una caja con:
   * Alerta de helada en 24–48 h (índice 0/1).
   * Alerta de estrés térmico (días previstos con Tmax > 38 °C).
   * Alerta de mojamiento foliar / fitopatógenos (riesgo fúngico en leguminosas).
   * Viento medio para ventana de pulverización y deriva (< 15 km/h).
3. **Decisión del equipo para la Demo del Jurado:**
   * **Opción A (Activa en la demo):** Mostrar una tarjeta informativa compacta "Pronóstico a 7 días (Meteomatics / ECMWF 9 km)" en la app.
   * **Opción B (Documentada para la entrega):** Mantener la demo enfocada en el pilar satelital NASA + kit Arduino, y presentar Meteomatics en el informe/video como la extensión operacional inmediata para el productor cuando la app pase a despliegue en campo.
