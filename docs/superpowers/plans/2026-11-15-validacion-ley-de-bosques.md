# Validación del modelo de desmontes en el régimen de la Ley de Bosques · Plan para ejecutar después

> **Estado:** pendiente, para que lo ejecute alguien del equipo más adelante. No cambia nada de lo que la app muestra hoy.
> **Antecedente:** D-30 en `docs/reglas-y-bitacora.md` y la sección 4 de `docs/datos-y-metodos.md`.

## 1. La hipótesis

- **Lo que se observó:** el modelo de desmontes (random forest) distingue bien dentro de su época: AUC 0,78 en validación cruzada con el monte de 2008 y el desmonte 2009-2015. Pero al predecir la década siguiente (monte de 2015 y desmonte 2016-2025) baja a **AUC 0,63**.
- **La hipótesis:** el patrón del desmonte cambió entre los dos períodos porque entró en vigencia la **Ley de Bosques (Ley 26.331, 2007)** y el **Ordenamiento Territorial de Bosques Nativos (OTBN)** de Santiago del Estero (aprobado hacia 2009-2010). El OTBN asigna a cada parcela de monte una categoría de conservación:
  - **I (rojo):** no se puede desmontar;
  - **II (amarillo):** uso sostenible, sin desmonte;
  - **III (verde):** se puede desmontar con permiso.

  Desde ahí, dónde se desmonta depende mucho de esa categoría, y el modelo no la conoce.
- **Lo que hoy NO se sabe:** si la caída se debe a la ley, a otros cambios (precios de la soja, sequías, controles) o a que faltan predictores. **No está probado.**

## 2. Qué hay que probar

1. **El modelo dentro del régimen de la ley:**
   - Entrenar con el monte de 2012 y el desmonte 2013-2017.
   - Probar con el monte de 2017 y el desmonte 2018-2025.
   - Si el AUC de la prueba sube con respecto al 0,63 actual, es un indicio de que el cambio de régimen pesaba.
2. **El OTBN como predictor:**
   - Sumar la categoría de cada punto (I, II, III o "sin categoría") como variable.
   - Comparar el AUC con y sin esa variable, en la misma división temporal.
3. **Contraste:** repetir el punto 1 sin el OTBN y el punto 2 con la división actual (2008 → 2015), para separar los dos efectos.

## 3. Datos que hacen falta

| Dato | Dónde | Cómo se usa |
|---|---|---|
| Hansen v1.13 | Earth Engine (ya en uso) | Etiquetas y predictores, igual que hoy |
| **OTBN de Santiago del Estero** (polígonos con categoría I, II o III) | Secretaría de Ambiente de la Nación (Sistema de Información Forestal) o la Dirección de Bosques de la provincia. **Hay que conseguirlo: no está en Earth Engine** | Se baja como GeoJSON o shapefile y se le asigna la categoría a cada punto **en la PC**, con el mismo método de `zonas.py` (`shapely.contains_xy`). No hace falta subirlo a Earth Engine, que en este proyecto no permite assets |

Si el OTBN no se consigue a tiempo, se hace solo el punto 1 y se dice así.

## 4. Tareas para quien lo ejecute

> Seguir las reglas del repo: datos faltantes en `null`, nunca inventar números, commits sin `Co-Authored-By`, y documentar cada decisión en la bitácora.

### Task 1: Cortes nuevos de las muestras
- **Archivos:** `ia_desmonte/desmonte.py`
- **Qué hacer:** sumar a `CORTES` los cortes `'ley_entrenamiento': (2012, 2017, SEMILLA + 10)` y `'ley_prueba': (2017, ULTIMO_ANIO, SEMILLA + 11)`.
  - `bajar_rejilla(2012)` y `bajar_rejilla(2017)` bajan las grillas nuevas, unos 2 minutos cada una.
  - Las muestras se toman con `python -X utf8 -m ia_desmonte.desmonte muestra ley_entrenamiento` (unos 30 minutos cada una, y se pueden correr en paralelo).
- **Prueba:** que `CORTES` tenga los dos cortes nuevos y que el CSV de cada uno tenga 10.000 filas, sin `NaN` en `PREDICTORES`.

### Task 2: Categoría del OTBN por punto
- **Archivos:**
  - `ia_desmonte/otbn.py` (nuevo): `categoria_otbn(df) -> pd.Series` con valores 1, 2, 3 o 0 si no tiene categoría;
  - el GeoJSON en `ia_desmonte/salidas/otbn.geojson`, con su fuente y fecha anotadas en `ia_desmonte/README.md`.
- **Prueba:** puntos de juguete dentro y fuera de polígonos de prueba dan la categoría correcta.

### Task 3: Comparación
- **Archivos:** `ia_desmonte/validacion_ley.py` (nuevo), que escribe `ia_desmonte/salidas/validacion_ley.json`.
- **Qué compara:** la tabla de AUC (validación cruzada y prueba), el AUC de precisión-exhaustividad y la tasa base para 4 combinaciones:

  | División temporal | Sin OTBN | Con OTBN |
  |---|---|---|
  | 2008 → 2015 (la actual) | ✓ | ✓ |
  | 2012 → 2017 (régimen de la ley) | ✓ | ✓ |

- **Prueba:** que el JSON tenga las 4 combinaciones y que cada una tenga `auc`, `auc_cv`, `pr_auc` y `tasa_base`.

### Task 4: Informe y decisión
- Sumar una sección "Validación en el régimen de la Ley de Bosques" a `ia_desmonte/informe.py`, que se genera desde `validacion_ley.json`.
- Anotar en la bitácora qué se encontró. Si la hipótesis se sostiene, decidir con el equipo si el modelo de la app pasa a entrenarse con 2012 → 2017 y a usar el OTBN; eso es una decisión nueva, con su propio número.
- **Criterio para decir "se sostiene":** el AUC de la prueba sube al menos 0,05 con la división 2012 → 2017, o sube al menos 0,05 al sumar el OTBN. Si no sube, se dice que la hipótesis no se confirmó y se dejan los datos.

## 5. Costo estimado

Unas 2 horas de Earth Engine (nivel Comunidad, muy por debajo del cupo) y unas 3 horas de trabajo, más el tiempo de conseguir el OTBN.
