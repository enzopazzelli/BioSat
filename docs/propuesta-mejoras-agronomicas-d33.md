# Propuesta de Mejoras Agronómicas y Metodológicas (D-33)
**Autora:** Vale (Frente 4 · Campo y Agronomía)  
**Fecha:** Domingo 15/11/2026  
**Destinatarios:** Enzo (App / Integración), Santi (Suelo / IA / Earth Engine), Sara (Pitch / Entrega)  
**Referencia:** Complemento al plan [`docs/superpowers/plans/2026-11-15-app-sin-datos-falsos.md`](2026-11-15-app-sin-datos-falsos.md)

---

## Resumen Ejecutivo

El plan D-33 (*"que la app no muestre cosas falsas en la demo"*) es clave para darle solidez técnica y honestidad al proyecto frente al jurado de la NASA. Desde la perspectiva agronómica y de campo, se formulan **4 propuestas de ajuste** que perfeccionan el lenguaje, validan la zonificación con base territorial santiagueña y fundamentan metodológicamente la ausencia de falsas métricas.

---

## 1. Ajuste de Lenguaje: "Sin cobertura verde activa" en vez de "Sin verde"

### El Problema
Decir simplemente *"lotes sin verde"* resulta tosco e impreciso agronómicamente. Para un productor y un técnico de campo:
* El **rastrojo seco** (caña de maíz, rastrojo de sorgo o soja) **sí es cobertura** (protege la estructura física del suelo, frena el impacto de la gota de lluvia y mitiga la evaporación).
* Sin embargo, al estar seco, su reflectancia óptica en el rojo e infrarrojo cercano (NDVI < 0,25) es indistinguible de la tierra desnuda desde el satélite.

### La Propuesta
Adoptar el concepto agronómico estándar de **"cobertura vegetal activa"**:

* **En el semáforo del Inicio (`web/inicio-logica.js`):**  
  > *"Unos {n} de cada 10 lotes de la zona están **sin cobertura vegetal activa (suelo descubierto o rastrojo seco)**."*
* **En la recomendación de acción (`web/inicio-logica.js`):**  
  > *"Si tu lote está descubierto, conviene cubrirlo: un rastrojo o una cobertura lo protegen del sol y del viento."*
* **En la explicación metodológica (`web/index.html` y `web/completo.html`):**  
  > *"Lotes sin cobertura verde activa (suelo descubierto o rastrojo seco: el satélite no los distingue a esta escala)."*
* **En el tooltip del visor mensual (`web/app.js`):**  
  > *"Suele verse sin cobertura activa"* / *"Suele verse con cobertura activa"*.

### Impacto
Educa al agricultor y demuestra al jurado el valor de la **estación en tierra (Kit Arduino)**: el satélite detecta cuándo cesa la actividad fotosintética regional, mientras que el sensor LDR en el lote verifica si la tierra tiene sombra protectora de rastrojo o está expuesta al sol directo.

---

## 2. Validación de Nombres Geográficos para los 5 Grupos AIZAL

### El Problema
El archivo `data/zonificacion_aizal.json` contiene 5 clusters k-means calculados por Earth Engine pero con `nombre: null`. La app los mostraba como *"grupo 0, 1, 2, 3, 4"*, lo cual carece de significado agronómico y comunicacional. La propuesta en D-33 asignó nombres puramente biofísicos descriptivos.

### La Propuesta
Validar y anclar los 5 grupos en las realidades agroecológicas y fisiográficas reales de Santiago del Estero:

| Grupo | % Territorio | Perfil Biofísico Principal | Nombre Propuesto por Vale | Justificación Territorial y Agronómica |
|---|---|---|---|---|
| **0** | 38 % | 620 mm lluvia, 941 mm déficit, 35,0 °C Tmáx, 23 % arcilla | **Llanura semiárida cálida (Chaco Seco y Secano Este)** | Domina ampliamente en Zona 3 (85 %) y Zona 2 (55 %). Corazón agrícola y ganadero a secano con alto estrés térmico estival. |
| **1** | 28 % | 587 mm lluvia (mínima), 44 % arena (máxima), 979 mm déficit | **Llanura semiárida arenosa (Río Dulce y transición sur)** | Domina en Zona 1 (59 %) y Zona 5 (49 %). Suelos livianos de rápida infiltración pero muy susceptibles al déficit hídrico invernal. |
| **2** | 21 % | 771 mm lluvia, 31 % arcilla (máxima), 771 mm déficit | **Llanura arcillosa con riesgo de anegamiento (Bajos)** | Domina en Zona 4 (Bajos Submeridionales, 59 %). Suelos pesados e impermeables con alto riesgo de encharcamiento en marzo y salinización capilar en la seca. |
| **3** | 10 % | 661 mm lluvia, pendiente 0,70° (máxima), 4,5 °C Tmín | **Sierras y pedemonte fresco (Sierras del Sudoeste)** | Corresponde a los cordones serranos de Guasayán, Ambargasta y Ojo de Agua/Sumampa. Mayor riesgo de escorrentía y erosión laminar en laderas. |
| **4** | 2 % | 737 mm lluvia, 24,8 g/kg carbono (máximo), 27 % arcilla | **Humedales y paleocauces con alta materia orgánica** | Depresiones aluviales, bañados y paleocauces con acumulación histórica de sedimentos finos y biomasa vegetal. |

### Impacto
* En la app web (`web/app.js:263`), en vez de *"Zonificación AIZAL: grupo 2"*, se visualizará:  
  > *"Ambiente según variables AIZAL: Llanura arcillosa con riesgo de anegamiento (Bajos)"*.
* Se formaliza la confirmación solicitada a Vale en la sección 4 del plan D-33.

---

## 3. Justificación Metodológica de la Tabla de Modelos de Suelo Pelado

### El Problema
La tabla de evaluación en la sección 4 (`web/app.js:520`) arrastraba nombres del prototipo simulado (*"CNN + LSTM"*, *"CNN + Transformer"*, *"Umbral de NDVI y NBR"*) con valores vacíos (`—`), haciendo que la app reportara *"Método usado: sin definir"*.

### La Propuesta
1. **Reducir la tabla a la técnica real:** Dejar una única fila correspondiente al método implementado:  
   `{ umbral_ndvi: 'Umbral biofísico de NDVI (0,25)' }`.
2. **Reemplazar el guion por "Estimación biofísica directa":** En las columnas de *Exactitud* y *F1-Score*, en lugar de `"null"` o `"—"`, explicitar: `"Sin calibración destructiva"`.
3. **Incorporar nota técnica de transparencia:**
   > *"Metodología: Estimación biofísica directa sobre reflectancia multiespectral de Landsat 8/9. Al no contar con muestreos terrestres georreferenciados destructivos para cada fecha de pasada satelital en el Gran Chaco, no se calculan métricas de clasificación supervisada artificiales. La incertidumbre se explicita mediante la banda de meses dudosos (NDVI 0,20 a 0,30)."*

### Impacto
Evita penalizaciones del jurado por presentar modelos no ejecutados y transforma la ausencia de números inventados en un argumento de **rigor científico y honestidad de datos**.

---

## 4. Coherencia Conceptual: Satélite Regional vs. Calendario de Manejo del Productor

### El Problema
Podría generarse confusión entre los "meses de suelo pelado" reportados a escala regional por el satélite (NDVI < 0,25) y los "meses de suelo pelado" de cada rotación evaluada en el Paso 3.

### La Propuesta
Blindar la coherencia conceptual en los textos de ayuda y reporte:
1. **Dato satelital (Escala Zonal / Macro):** Representa la *observación histórica regional* (qué porcentaje de lotes del departamento suele carecer de biomasa verde en cada mes del año).
2. **Dato de rotación (Escala Lote / Micro):** Representa la *planificación de manejo agronómico* generada por el productor (la letra `D` en el calendario de 12 meses).
3. **Mensaje rector en la interfaz:**  
   > *"El satélite muestra el riesgo histórico de tu zona; tu rotación define si tu lote mantendrá rastrojo protector o quedará expuesto al sol y al viento."*

### Impacto
Refuerza el principio central de BioSat y de las reglas de oro del desafío: **la NASA y los satélites aportan el contexto macroclimático, pero las decisiones de manejo en el lote corresponden al productor**.

---

## Estado de Aplicación

* [x] **Punto 1 (Lenguaje agronómico):** Implementado y verificado en `web/inicio-logica.js`, `web/index.html`, `web/completo.html` y suite de pruebas (`tests/inicio-logica.test.js`).
* [ ] **Punto 2 (Nombres de grupos AIZAL):** Listo para incorporar en `ia_desmonte/zonificacion.py` / `data/zonificacion_aizal.json` con la confirmación de Enzo y Santi.
* [ ] **Punto 3 (Tabla de métodos honesta):** Listo para incorporar en `web/app.js:520` según el diseño D-33.
* [ ] **Punto 4 (Coherencia lote vs satélite):** Coordinar con Sara para el guion del pitch y de la entrega final.
