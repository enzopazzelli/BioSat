# Hoja de Ruta y Guía de Trabajo entre Agentes — Proyecto BioSat

> **Para cualquier Agente de IA o desarrollador que se sume al proyecto:**
> Lee este archivo junto con [`CONTEXTO.md`](../CONTEXTO.md) y [`docs/reglas-y-bitacora.md`](reglas-y-bitacora.md) antes de tocar código. Aquí está el plan paso a paso y cómo dividir el trabajo para no pisarnos.

---

## 1. Resumen Ejecutivo: Qué estamos construyendo

- **Equipo:** BioSat · **Sede:** Santiago del Estero, Argentina · **Evento:** NASA Space Apps Challenge 2026
- **Desafío:** *Field Shift: Adapting Farms with NASA Data*
- **Qué hace BioSat en una frase:** Una herramienta de apoyo a la decisión para agricultores de **Santiago del Estero** que combina **1) Clima histórico de la NASA (POWER)**, **2) Detección de desmonte y suelo expuesto con IA profunda sobre imágenes Landsat (`CNN + RNN + Transformer`)**, y **3) Medición física en tierra con un Kit Arduino + ESP32 (*Ground Truth*)**, para comparar **3 estrategias de rotación de cultivos** en cada una de las **4 zonas agroecológicas de la provincia**.

---

## 2. Estado de los Pasos (Qué ya está hecho y qué sigue)

### ✅ Paso 0: Comprensión del desafío, reglas, glosario y diseño zonal *(COMPLETADO)*
- Reglas de oro y bitácora creadas en [`docs/reglas-y-bitacora.md`](reglas-y-bitacora.md).
- Glosario bilingüe (técnico → lenguaje de agricultor) en [`docs/glosario.md`](glosario.md).
- Definición de las **4 Zonas de Santiago del Estero**, inventario del **Kit AltaNet Arduino Uno R3 + ESP32** y diseño conceptual del módulo **Landsat `CNN + RNN + Transformer`** en [`docs/zonas-santiago-y-kit-arduino.md`](zonas-santiago-y-kit-arduino.md).

### ✅ Paso 1: Descarga y procesamiento de datos reales de NASA POWER *(COMPLETADO)*
- Script [`scripts/descargar_nasa_power.py`](../scripts/descargar_nasa_power.py) ejecutado con éxito.
- **2.192 días reales (2020–2025)** descargados y resumidos para las 4 zonas de Santiago del Estero en:
  - [`data/nasa_power_santiago_zonas.json`](../data/nasa_power_santiago_zonas.json)
  - [`data/resumen_mensual_santiago.csv`](../data/resumen_mensual_santiago.csv)

---

### ⏳ Paso 2: Construcción de la Base de Conocimiento de las 3 Rotaciones por Zona *(SIGUIENTE)*
- **Objetivo:** Crear el archivo estructurado [`data/rotaciones_santiago.json`](../data/rotaciones_santiago.json) con las **3 estrategias de rotación** (1 Actual + 2 Alternativas) para cada una de las **4 zonas**, incluyendo los **5 puntos obligatorios del desafío de la NASA**:
  1. *Por qué se sugiere*
  2. *Qué evidencia satelital y en tierra la respalda*
  3. *Qué beneficios ofrece* (suelo, agua, nitrógeno, corte de plagas, ingreso/forraje)
  4. *Qué información falta (vacíos)*
  5. *Qué riesgos requieren revisión local* (ej. consumo de agua del cultivo de cobertura en invierno seco)
- Además, incluir mes a mes (1 a 12) el estado del lote en cada rotación (`cultivo_activo`, `cobertura_viva`, `rastrojo`, `suelo_desnudo`) para dibujar el **Calendario del Lote**.

---

### ⏳ Paso 3: Módulo de IA Profunda con Imágenes Landsat (`CNN + RNN + Transformer`) *(EN PARALELO)*
- **Objetivo:** Implementar el módulo sugerido por la cátedra de *Sistemas de Inteligencia Artificial* dentro de la carpeta `ia_landsat/`.
- **Qué debe hacer:**
  1. Tomar secuencias multianuales de parches **Landsat 8/9 (30 m)** de Santiago del Estero (bandas Rojo `B4`, NIR `B5`, SWIR `B6/B7` e índice `NDVI` / `NBR`).
  2. **Etapa 1 — `CNN` (Espacial):** Clasificar parches en *Monte Nativo*, *En Proceso de Desmonte / Raleo*, *Suelo Desnudo Expuesto* y *Lote Agrícola con Cobertura*.
  3. **Etapa 2 — `RNN / LSTM` (Secuencial):** Analizar la evolución mes a mes para diferenciar un barbecho estacional normal de un desmonte progresivo o abandono de suelo desnudo.
  4. **Etapa 3 — `Transformer Temporal` (Atención):** Cruzar la serie de Landsat con los picos de calor (> 35 °C) y sequía de `data/nasa_power_santiago_zonas.json` para calcular el **Índice de Fragilidad Post-Desmonte (0 a 100)**.
  5. **Salida limpia:** Guardar el resultado en [`data/diagnostico_landsat_ia.json`](../data/diagnostico_landsat_ia.json) para que la interfaz web lo muestre y ajuste automáticamente la recomendación de rotación.

---

### ⏳ Paso 4: Código del Kit Arduino + ESP32 y Simulador de las 3 Bandejas *(EN PARALELO)*
- **Objetivo:** Crear en la carpeta `arduino/` el código listo para cargar en la placa y el puente con la PC.
- **Qué debe incluir:**
  1. `arduino/biosat_estacion_campo/biosat_estacion_campo.ino`:
     - Lee **Sensor de agua/conductividad (`A0`)** → humedad superficial y **alerta de salitre**.
     - Lee **Sensor `LM35` (`A1`)** → temperatura directa de la tierra (golpe de calor en suelo pelado).
     - Lee **Fotorresistencia `LDR` (`A2`)** → radiación al ras del suelo ("NDVI de bolsillo": suelo pelado vs. sombreado por rastrojo/monte).
     - Lee **Sensor `DHT11` (Pin digital)** → temperatura y humedad del aire.
     - Muestra el estado en la **Pantalla `LCD 16x2`**, enciende el **Semáforo de LEDs (Verde / Amarillo / Rojo)** y emite línea JSON por Puerto Serie (`9600 baud`).
  2. `scripts/puente_arduino.py`:
     - Lee el puerto serie USB (o permite elegir en vivo entre las **3 Bandejas de Demo**: *A: Suelo pelado seco*, *B: Suelo salitroso*, *C: Suelo con rastrojo/monte* si el Arduino no está enchufado) y escribe [`data/lectura_arduino_vivo.json`](../data/lectura_arduino_vivo.json).

---

### ⏳ Paso 5: Aplicación Web Interactiva Centrada en el Agricultor (`web/` o `app/`)
- **Objetivo:** Construir una interfaz visual, rápida, en español sencillo y sin dependencias frágiles que una los 3 mundos (**NASA POWER + IA Landsat + Kit Arduino**).
- **Pantallas / Secciones clave:**
  1. **Selector de Zona de Santiago del Estero + Prioridades del Productor** (Ahorrar agua, Frenar salitre, Recuperar suelo desmontado, Sumar forraje/ingreso, Sin riego / Con riego).
  2. **El "Calendario del Lote" (Pieza visual central):** Los 12 meses del año mostrando dónde chocan los +110 días de calor (> 35 °C), las heladas, el bache seco y los meses de suelo pelado frente a cada rotación.
  3. **Panel "Espacio vs. Tierra" (NASA + IA Landsat + Arduino en vivo):** Compara lo que dice el satélite (50 km / 30 m Landsat `CNN+RNN+Transformer`) contra lo que mide el sensor Arduino clavado en la tierra hoy.
  4. **Comparador de las 3 Estrategias de Rotación:** Tarjetas claras con las 5 respuestas obligatorias del desafío.
  5. **Simulador "¿Qué pasa si...?" (Sliders de escenarios):** Ajustar lluvia (-30 % a +20 %), temperatura (+0 °C a +2,5 °C) o estado de desmonte y ver en vivo cómo cambia el riesgo de cada rotación.

---

### ⏳ Paso 6: Guion de Demo en Vivo y Pitch para los Premios de la NASA
- Armar el guion de 2–3 minutos para el jurado conectando la demo de las **3 bandejas del Arduino**, la **detección de desmonte con Landsat (`CNN+RNN+Transformer`)** y el **Calendario del Lote** de Santiago del Estero.

---

## 3. Cómo trabajar con 2 Agentes en paralelo sin pisarse

Si vas a usar **este agente (Agente 1)** y **otro agente (Agente 2)** al mismo tiempo, la clave es que **cada agente trabaje en su propia carpeta** y se comuniquen mediante archivos JSON en `data/`:

| Agente | Rol sugerido | Carpetas que toca | Archivo de salida (Contrato) |
|---|---|---|---|
| **Agente 1** *(ej. este chat)* | **Datos Agronómicos, Interfaz Web y Kit Arduino** (Pasos 2, 4 y 5) | `data/rotaciones_santiago.json`, `arduino/`, `web/` (o `app/`), `docs/` | Consume todos los JSON de `data/` y construye la app y el sketch `.ino` |
| **Agente 2** *(el otro agente)* | **Módulo de IA Profunda Landsat (`CNN + RNN + Transformer`)** (Paso 3) | `ia_landsat/`, `scripts/entrenar_inferir_landsat.py` | Genera `data/diagnostico_landsat_ia.json` con la detección de desmonte por zona |

> *(O a la inversa: tú decides qué paso le asignas a cada agente).*

### Contrato JSON para el Módulo de IA Landsat (`data/diagnostico_landsat_ia.json`)
Para que ambos agentes conecten su trabajo sin errores, el módulo de IA (`ia_landsat/`) puede exportar un JSON con esta estructura simple por cada una de las 4 zonas (`zona_1_riego_salitre`, `zona_2_secano_este`, `zona_3_monte_semiarido`, `zona_4_bajos_submeridionales`):

```json
{
  "modelo": "BioSat-Landsat-Hybrid (CNN + BiLSTM/RNN + Temporal Transformer)",
  "satelite": "NASA/USGS Landsat 8-9 OLI/TIRS (30m)",
  "zonas": {
    "zona_3_monte_semiarido": {
      "estado_detectado": "Área en proceso activo de desmonte / raleo",
      "cobertura_forestal_pct": 28.5,
      "perdida_ultimos_5_anios_pct": 19.2,
      "meses_suelo_desnudo_anual": 6.5,
      "indice_fragilidad_transformer_0_100": 84,
      "alerta_agronomica": "Alta exposición térmica post-desmonte. Prohibido dejar barbecho desnudo; priorizar sistema silvopastoril (Algarrobo + Buffel/Gatton) o cobertura inmediata."
    }
  }
}
```

---

## 4. Recordatorio de Reglas Obligatorias para ambos Agentes

1. **Idioma:** Todo en **español claro y sencillo** (tanto en la interfaz como en los comentarios y documentos).
2. **Cero jerga sin explicación:** Usar siempre las traducciones humanas de [`docs/glosario.md`](glosario.md).
3. **Respaldo Offline:** Ninguna pantalla puede romperse si no hay internet o si el Arduino no está enchufado por USB; siempre debe existir lectura desde los JSON locales en `data/`.
4. **Bitácora viva:** Todo cambio importante se registra en [`docs/reglas-y-bitacora.md`](reglas-y-bitacora.md) y se confirma con el usuario antes de pasar al siguiente bloque.
