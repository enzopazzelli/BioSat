# Datos reales con Earth Engine · Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usar superpowers:executing-plans (o subagent-driven-development) para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`).

**Objetivo:** reemplazar los datos simulados del frente de Santi por datos reales de Earth Engine, con origen, método y confianza en cada número.

**Arquitectura:** un paquete de Python en `ia_desmonte/`, con un módulo por producto. Earth Engine hace el cálculo pesado (estadísticas por zona, muestras de píxeles, compuestos de Landsat) y devuelve tablas chicas. scikit-learn entrena los modelos en esta PC. Cada módulo escribe su JSON en `data/` solo si terminó bien, y guarda sus tablas intermedias en `ia_desmonte/salidas/`.

**Tecnología:** Python 3.13, earthengine-api, numpy, pandas, scikit-learn, Pillow y pytest. Node 22 (`node --test`) para las pruebas de contrato.

**Diseño:** `docs/superpowers/specs/2026-11-14-datos-reales-design.md`. Quien ejecuta lee el diseño y este plan.

**Quedan afuera, por ser opcionales en el diseño:** el contraste con MapBiomas Chaco, el PNG del mapa de riesgo y el NDTI para el rastrojo. Se suman solo si sobra tiempo al final.

## Restricciones generales

- **ID de Earth Engine:** se lee de la variable de entorno `EE_PROJECT` y nunca se escribe en el repo.
- **Dependencias:** solo las de "Tecnología". No se suma nada que haya que compilar.
- **Sin números inventados:** los faltantes van como `null`, y los JSON se escriben con `allow_nan=False`.
- **`meta` de cada JSON:** lleva `fuente`, `metodo`, `generado_por` (ruta del script), `fecha` (AAAA-MM-DD) y `notas`.
- **Confianza:** solo `"alta"`, `"media"` o `"baja"`, según la tabla del diseño (sección 6).
- **Constantes:**
  - semilla `SEMILLA = 2026`;
  - monte = `treecover2000 >= 25`;
  - Hansen = `UMD/hansen/global_forest_change_2024_v1_12` (si no responde, `..._2023_v1_11` y la prueba termina en 2023);
  - umbral de NDVI 0,25, con sensibilidad a 0,20 y 0,30.
- **Los IDs de zona y su orden:**
  1. `zona_1_riego_salitre`
  2. `zona_2_secano_este`
  3. `zona_3_monte_semiarido`
  4. `zona_4_bajos_submeridionales`
  5. `zona_5_sur_serrano`
- **Commits:** sin la línea `Co-Authored-By`. Todo queda en `santi-datos-ia`: no se sube a `main` sin aprobación de Enzo.
- **Pruebas:** las 71 de Node siguen en verde (`node --test tests/*.test.js`). Las de Python corren con `python -X utf8 -m pytest ia_desmonte/pruebas -q`.
- **Para correr un módulo:** `EE_PROJECT=<id> python -X utf8 -m ia_desmonte.<modulo>`, desde la raíz del repo.

## Qué revisar especialmente

1. **Una zona con pocos puntos de monte (Zona 1):** el riesgo se calcula igual, se guarda `n`, y con `n < 100` la confianza es `"baja"`. Nunca `NaN`.
2. **Un mes sin observaciones limpias de Landsat (verano nublado):** la fracción queda `null`, el mes queda en `false` y se marca como dudoso. Nunca `NaN`.
3. **Earth Engine corta una consulta (límite, demora o error):** se reintenta por tandas. Si un módulo falla, **no se pisa** el JSON que ya existe.
4. **Una zona con poca tierra agropecuaria para el suelo:** se usa toda la zona, con `"area_medida": "zona completa"` y una nota.
5. **La app lee claves concretas:**
   - del suelo, `valor` y `confianza`;
   - del desmonte, `riesgo_medio_0_1`, `desmonte_ha_por_anio.valores` y `proyeccion_ha`;
   - de las escenas, `item` y `fecha`.

   Si cambian, la app queda en blanco. Lo cubre la prueba de contrato.

---

### Task 1: Archivar el prototipo simulado y preparar el paquete

**Archivos:**
- Mover: todo `ia_desmonte/*` a `archivo/prototipo-ia-simulado/` (con `git mv`)
- Crear: `archivo/prototipo-ia-simulado/LEEME-PRIMERO.md`, `ia_desmonte/__init__.py`, `ia_desmonte/pruebas/__init__.py`, `ia_desmonte/salidas/.gitkeep`

- [ ] **Paso 1:** `git mv` de cada elemento de `ia_desmonte/` (el notebook, `INSTRUCCIONES_PIPELINE.md`, `README.md`, `data/`, `gee/`, `graficos_y_resultados/`, `python/` y `registros/`) a `archivo/prototipo-ia-simulado/`.
- [ ] **Paso 2:** escribir `LEEME-PRIMERO.md`, en lenguaje simple:
  - "Este prototipo usa **datos simulados** generados con `np.random` (`python/compilar_notebook.py`). Sus métricas (AUC 0,986) **no son reales** y **no alimentan la app**."
  - "Se guarda como antecedente del método. Los datos reales salen de `ia_desmonte/` (ver `docs/datos-y-metodos.md`)."
- [ ] **Paso 3:** crear `ia_desmonte/__init__.py` y `ia_desmonte/pruebas/__init__.py` vacíos, y `ia_desmonte/salidas/.gitkeep`.
- [ ] **Paso 4:** `node --test tests/*.test.js`. Esperado: 71 pruebas en verde.
- [ ] **Paso 5:** commit: "Archivar el prototipo de IA con datos simulados".

### Task 2: Base común y zonas como polígonos

**Archivos:**
- Crear: `ia_desmonte/comun.py`, `ia_desmonte/zonas.py`
- Prueba: `ia_desmonte/pruebas/test_zonas.py`, `ia_desmonte/pruebas/test_comun.py`

**Interfaces que produce:**
- Constantes de `comun.py`:
  - `RAIZ: Path`
  - `SALIDAS: Path` (`RAIZ/'ia_desmonte'/'salidas'`)
  - `DATA: Path`
  - `ZONAS: list[str]` (las 5, en orden)
  - `SEMILLA = 2026`
  - `HANSEN: str`
  - `UMBRAL_MONTE = 25`
  - `BBOX_PROVINCIA = [-65.3, -30.2, -61.5, -25.5]`
- Funciones de `comun.py`:
  - `iniciar_ee() -> None`: lee `EE_PROJECT`; si falta, corta con un mensaje claro.
  - `escribir_json(ruta: Path, dato: dict) -> None`: UTF-8, `indent=2`, `ensure_ascii=False`, `allow_nan=False`, salto de línea final.
  - `meta_base(fuente: str, metodo: str, script: str, notas: str = '', **extra) -> dict`
  - `con_reintentos(fn, intentos: int = 3)`
  - `muestras_por_tandas(imagen: ee.Image, region: ee.Geometry, n: int, escala: int, semilla: int, tanda: int = 4000) -> pd.DataFrame`: varias llamadas a `imagen.sample(...)` con semilla `semilla + i`, que se unen.
- Funciones de `zonas.py`:
  - `departamentos_por_zona() -> dict[str, list[str]]`: nombres normalizados como los escribe geoBoundaries, leídos de `data/santiago_mapa.json`.
  - `cargar_geojson() -> dict`: baja la `URL` de `scripts/generar_mapa_santiago.py` una vez y la guarda en `SALIDAS/geoBoundaries-ARG-ADM2.geojson`.
  - `zonas_geojson() -> dict`: FeatureCollection de GeoJSON con 5 features y las propiedades `zona` (ID) y `num` (1 a 5).
  - `zonas_fc() -> ee.FeatureCollection`
  - `zona_imagen() -> ee.Image`: banda `zona`, con valores 1 a 5.

- [ ] **Paso 1: pruebas que fallan.**

```python
def test_cada_departamento_tiene_una_zona():
    d = departamentos_por_zona()
    todos = [x for v in d.values() for x in v]
    assert sorted(d) == ZONAS and len(todos) == 27 and len(set(todos)) == 27
    assert 'general taboada' in d['zona_4_bajos_submeridionales']
    assert 'pelegrini' in d['zona_3_monte_semiarido']   # así lo escribe geoBoundaries

def test_zonas_geojson_tiene_5_features_con_geometria():
    fc = zonas_geojson()
    assert [f['properties']['zona'] for f in fc['features']] == ZONAS
    assert all(f['geometry']['type'] in ('Polygon', 'MultiPolygon') for f in fc['features'])

def test_escribir_json_rechaza_nan(tmp_path):
    with pytest.raises(ValueError):
        escribir_json(tmp_path / 'x.json', {'a': float('nan')})
```

- [ ] **Paso 2:** `python -X utf8 -m pytest ia_desmonte/pruebas -q`. Esperado: FAIL (no existen los módulos).
- [ ] **Paso 3: implementar.**
  - Reusar `norm`, `NOMBRES`, `CAJA` y `URL` de `scripts/generar_mapa_santiago.py`, importándolo por ruta con `importlib.util`. La inversa de `NOMBRES` pasa de "Pellegrini" a "pelegrini".
  - Para unir los departamentos de cada zona, `ee.Geometry.MultiPolygon` alcanza. No hace falta disolver en la PC: Earth Engine trabaja con la colección de polígonos.
- [ ] **Paso 4:** la prueba pasa. Comprobar Earth Engine a mano: `zonas_fc().size().getInfo() == 5`, y que el área de cada zona sea mayor a 0.
- [ ] **Paso 5:** commit: "Base comun y zonas de BioSat como poligonos para Earth Engine".

### Task 3: Suelo por zona (`data/suelo_zonas.json`)

**Archivos:**
- Crear: `ia_desmonte/suelo.py`
- Prueba: `ia_desmonte/pruebas/test_suelo.py` y `tests/datos-contratos.test.js` (se crea acá, con un bloque por archivo)

**Interfaces:**
- Consume: `comun.*` y `zonas.zonas_fc()`.
- Produce:
  - `ponderar_0_30(a: float, b: float, c: float) -> float`, que calcula `(5a + 10b + 15c) / 30`;
  - `convertir(var: str, crudo: float) -> float`;
  - `armar_json(stats: dict) -> dict`;
  - `main() -> None`.

**Valores fijados:**
- Conversión de unidades de SoilGrids:
  - `phh2o` ÷ 10;
  - `clay`, `sand`, `silt` y `soc` ÷ 10 (g/kg → % y dg/kg → g/kg);
  - `nitrogen` ÷ 100 (cg/kg → g/kg);
  - `bdod` ÷ 100 (cg/cm³ → g/cm³);
  - `cec` ÷ 10 (mmol/kg → cmol/kg).
- Máscara: ESA WorldCover v200, clases 30 y 40. Si hay menos de 2.000 píxeles de 250 m en una zona, se usa la zona completa.
- Estadísticas por zona: media (`valor`), mediana, p10 y p90 (`rango_p10_p90`) y `n_pixeles`.
- Los campos y códigos del contrato §2 se mantienen.
- `pdsi`: TerraClimate 1991-2020, × 0,01.
- `distancia_caminos_km`: GRIP4 (`projects/sat-io/open-datasets/GRIP4/South-America`).
- `distancia_monte_km` y `monte_nativo_pct`: Hansen, monte de 2024.
- Confianza: `"media"` en todos.
- `meta.fuente` cita los IDs de los datasets.

- [ ] **Paso 1: pruebas que fallan.**

```python
def test_ponderar_0_30():
    assert ponderar_0_30(60, 70, 80) == pytest.approx((5*60 + 10*70 + 15*80) / 30)

def test_convertir_unidades():
    assert convertir('phh2o', 81) == 8.1
    assert convertir('nitrogen', 85) == 0.85
    assert convertir('bdod', 136) == 1.36

def test_armar_json_respeta_contrato_y_marca_zona_completa():
    j = armar_json(STATS_EJEMPLO)   # dict armado en la prueba, con una zona a la que le falta tierra agropecuaria
    z = j['zonas']['zona_1_riego_salitre']
    assert set(z) >= {'ph', 'arcilla_pct', 'arena_pct', 'limo_pct', 'carbono_organico_g_kg', 'nitrogeno_g_kg',
                      'densidad_aparente_g_cm3', 'pdsi', 'distancia_caminos_km', 'distancia_monte_km', 'monte_nativo_pct'}
    assert z['ph']['confianza'] == 'media' and len(z['ph']['rango_p10_p90']) == 2
    assert j['zonas']['zona_3_monte_semiarido']['area_medida'] == 'zona completa'
```

En Node (`tests/datos-contratos.test.js`), el bloque del suelo:
  - 5 zonas;
  - cada campo tiene `valor` numérico o `null`, `confianza` válida y `codigo`;
  - `meta` tiene `fuente`, `metodo`, `generado_por` y `fecha`;
  - `generado_por` no menciona `santi-task` ni `compilar_notebook`.

- [ ] **Paso 2:** las dos pruebas fallan (pytest y `node --test tests/datos-contratos.test.js`).
- [ ] **Paso 3:** implementar `suelo.py`. Una sola llamada a `reduceRegions` con los reductores combinados (media, mediana y percentiles 10 y 90) a 250 m. Las distancias se calculan a 100 m. Si `projects/soilgrids-isric/<var>_uncertainty` responde, se suma `incertidumbre_media` a cada variable; si no, se omite y se anota en `meta.notas`.
- [ ] **Paso 4:** correr `python -X utf8 -m ia_desmonte.suelo`, que escribe `data/suelo_zonas.json` y `salidas/suelo_zonas.csv`. Pasan pytest y Node.
- [ ] **Paso 5:** revisar a mano que los valores sean razonables para el Chaco: pH entre 6 y 8,5; arcilla entre 10 y 40 %. Commit: "Suelo por zona real: SoilGrids 0-30 cm sobre tierra agropecuaria".

### Task 4: Historia y modelo de desmontes (`data/desmonte_zonas.json`, sin proyección)

**Archivos:**
- Crear: `ia_desmonte/desmonte.py`
- Prueba: `ia_desmonte/pruebas/test_desmonte.py`; sumar un bloque a `tests/datos-contratos.test.js`

**Interfaces:**
- `PREDICTORES = ['dist_sin_monte_m', 'dist_desmonte_previo_m', 'dist_caminos_m', 'pendiente_grados', 'area_protegida', 'poblacion_densidad', 'deficit_hidrico_mm', 'arcilla_pct', 'ph', 'zona']`
- `serie_anual() -> dict[str, list[float]]`: hectáreas por año 2001 a 2024, por zona.
- `monte_pct(anio: int, umbral: int = UMBRAL_MONTE) -> dict[str, float]`
- `muestras(corte: int, fin: int | None, n: int, semilla: int) -> pd.DataFrame`: columnas `PREDICTORES + ['desmonte']`. Con `fin=None` no hay etiqueta (sirve para el riesgo de 2024).
- `evaluar(train: pd.DataFrame, test: pd.DataFrame) -> dict[str, dict]`: por método `auc`, `f1`, `accuracy`, `kappa`, `pr_auc` y `umbral`, más `tasa_base`.
- `elegir(metodos: dict) -> tuple[str, str]`: devuelve el nombre y la justificación generada.
- `riesgo_por_zona(modelo, df: pd.DataFrame) -> dict[str, dict]`: `{'riesgo': float, 'n': int}`.
- `main() -> None`, que también guarda `salidas/desmonte_modelo.pkl` para la Task 6.

**Valores fijados:**
- Entrenamiento: `muestras(2008, 2015, 15000, SEMILLA)`. Prueba: `muestras(2015, 2024, 15000, SEMILLA + 1)`.
- Riesgo final: reentrenar con la prueba y aplicar a `muestras(2024, None, 15000, SEMILLA + 2)`.
- Distancias con `fastDistanceTransform` a 100 m, con un tope de 25.000 m.
- WorldPop: el año más cercano al corte, con 2020 como máximo.
- Modelos:
  - `LogisticRegression(max_iter=1000)` con estandarización;
  - `RandomForestClassifier(n_estimators=300, min_samples_leaf=5, n_jobs=-1, random_state=SEMILLA)`;
  - `HistGradientBoostingClassifier(random_state=SEMILLA)`.
- `zona` entra como variable categórica (one-hot).
- El umbral de F1 se elige con validación cruzada de 5 partes sobre el entrenamiento.
- Confianza del riesgo: `"media"`, o `"baja"` si `n < 100`.
- La serie histórica tiene confianza `"alta"`.

- [ ] **Paso 1: pruebas que fallan.**

```python
def test_elegir_toma_el_mayor_auc_y_la_justificacion_lo_dice():
    m = {'regresion_logistica': {'auc': .80, 'f1': .4}, 'random_forest': {'auc': .84, 'f1': .45},
         'gradient_boosting': {'auc': .83, 'f1': .47}}
    nombre, texto = elegir(m)
    assert nombre == 'random_forest' and '0,84' in texto and '0,80' in texto

def test_evaluar_con_datos_sinteticos_de_prueba_devuelve_metricas_validas():
    tr, te = tabla_de_juguete(semilla=1), tabla_de_juguete(semilla=2)   # tabla chica armada en la prueba, solo para probar la función
    r = evaluar(tr, te)
    assert set(r) >= {'regresion_logistica', 'random_forest', 'gradient_boosting', 'tasa_base'}
    assert all(0 <= r[k]['auc'] <= 1 for k in ('regresion_logistica', 'random_forest', 'gradient_boosting'))

def test_riesgo_zona_con_pocos_puntos_es_baja():
    r = riesgo_por_zona(ModeloFijo(0.3), tabla_con_zona1_de_40_puntos())
    assert r['zona_1_riego_salitre']['n'] == 40
```

  En Node, el bloque del desmonte:
  - 5 zonas;
  - `desmonte_ha_por_anio.valores` tiene 24 números (2001 a 2024) y `desde` es 2001;
  - `riesgo_medio_0_1` está entre 0 y 1;
  - `evaluacion.metodo_elegido` es el método de mayor `auc`;
  - ninguna confianza dice "alta" en el riesgo.

- [ ] **Paso 2:** las pruebas fallan.
- [ ] **Paso 3:** implementar.
  - **Monte en el año t:** `treecover2000 >= 25` y no (`lossyear` entre 1 y t − 2000).
  - **Etiqueta:** `lossyear` entre t + 1 − 2000 y fin − 2000.
  - Las muestras se toman con `muestras_por_tandas` sobre la máscara de monte del año de corte, con la banda `zona` de `zona_imagen()`.
  - **Escritura:** los campos del contrato §8, más:
    - `riesgo_n`;
    - `evaluacion.tasa_base`;
    - `pr_auc`;
    - `meta.horizonte_riesgo`: "probabilidad de desmonte en los próximos ~9 años si sigue el patrón 2016-2024";
    - `meta.validacion`: "entrena con monte y predictores al 2008 y desmonte 2009-2015; prueba con monte y predictores al 2015 y desmonte 2016-2024";
    - `meta.umbral_monte`: 25.
  - `proyeccion_ha` queda en `null` hasta la Task 5.
  - **Sensibilidad del umbral de monte (diseño 5.3):** `main` guarda `salidas/sensibilidad_umbral_monte.csv` con el monte de 2024 (%) y la pérdida 2016-2024 (ha) por zona, con umbrales de 10, 25 y 30.
- [ ] **Paso 4:** correr `python -X utf8 -m ia_desmonte.desmonte`, que escribe el JSON y `salidas/desmonte_{entrenamiento,prueba,riesgo}.csv`. Pasan pytest y Node.
- [ ] **Paso 5:** revisar a mano que la serie de la Zona 3 muestre el pico de desmonte de mediados de los 2000 y que el AUC esté entre 0,6 y 0,95. Si algo da raro, investigar antes de seguir. Commit: "Desmontes reales: historia Hansen 2001-2024 y modelo validado en el tiempo".

### Task 5: Proyección 2025-2028

**Archivos:**
- Crear: `ia_desmonte/proyeccion.py`
- Modificar: `ia_desmonte/desmonte.py` (`main` suma la proyección)
- Prueba: `ia_desmonte/pruebas/test_proyeccion.py`

**Interfaces:**
- `METODOS = ('promedio_3', 'tendencia_8', 'holt')`
- `predecir(serie: list[float], metodo: str, pasos: int) -> list[float]`: nunca devuelve negativos.
- `backtest(series: dict[str, list[float]], anios: list[int], corte: int = 2018) -> dict[str, float]`: WAPE % sumado sobre las 5 zonas, con `100 · Σ|pred − real| / Σ real` para 2019-2024.
- `elegir_metodo(errores: dict) -> str`: el de menor error.

En el JSON: `evaluacion.metodos.temporal = {'metodo': str, 'error_ha_pct': float}` reemplaza a `temporal_lstm_o_transformer`. `proyeccion_ha = {'anios': [2025, 2026, 2027, 2028], 'valores': [...]}` y la confianza de la proyección es `"baja"`.

- [ ] **Paso 1: pruebas que fallan.**

```python
def test_promedio_3():
    assert predecir([10, 20, 30, 40], 'promedio_3', 2) == [30, 30]

def test_nunca_negativo():
    assert min(predecir([100, 80, 60, 40, 20, 10, 5, 1], 'tendencia_8', 4)) >= 0

def test_backtest_elige_el_menor_error():
    assert elegir_metodo({'promedio_3': 30.0, 'tendencia_8': 12.5, 'holt': 20.0}) == 'tendencia_8'
```

- [ ] **Paso 2:** fallan.
- [ ] **Paso 3:** implementar. Holt elige `alpha` y `beta` en una grilla de 0,1 a 0,9, minimizando el error de un paso solo con los años hasta el corte.
- [ ] **Paso 4:** volver a correr el desmonte (sin repetir el muestreo: los CSV de `salidas/` ya están). Pasan pytest y Node; el bloque de Node verifica que existe `temporal` y que ya no está `temporal_lstm_o_transformer`.
- [ ] **Paso 5:** commit: "Proyeccion de desmontes 2025-2028 con metodos simples probados contra 2019-2024".

### Task 6: Zonificación (`data/zonificacion_aizal.json` y `data/imagenes/zonas_aizal.png`)

**Archivos:**
- Crear: `ia_desmonte/zonificacion.py`
- Prueba: `ia_desmonte/pruebas/test_zonificacion.py`; sumar un bloque a Node

**Interfaces:**
- `VARIABLES = ['lluvia_anual_mm', 'def_hidrico_mm', 'tmax_mes_calido_c', 'tmin_mes_frio_c', 'ph', 'arcilla_pct', 'arena_pct', 'carbono_organico_g_kg', 'densidad_aparente_g_cm3', 'cic_cmolc_kg', 'pendiente_grados']`
- `muestra(n: int = 6000, semilla: int = SEMILLA) -> pd.DataFrame`: `VARIABLES` más `zona`.
- `agrupar(df: pd.DataFrame, k: int = 5, ks=range(2, 9), semilla=SEMILLA) -> dict`: devuelve `siluetas` (dict de k a float), `etiquetas`, `centros_std`, `media` y `desvio`.
- `comparar(df: pd.DataFrame, etiquetas) -> dict[str, dict]`: `{'grupo_mayoritario': int, 'coincidencia_pct': float}`.
- `pintar_mapa(res: dict) -> None`

**Valores fijados:**
- TerraClimate 1991-2020: `pr` en mm por año (suma mensual promediada), `def` × 0,1, `tmmx` y `tmmn` × 0,1.
- Suelo de 0 a 30 cm, igual que en la Task 3.
- Pendiente de NASADEM.
- Muestreo a 1.000 m.
- `KMeans(n_clusters=k, n_init=20, random_state=SEMILLA)`.
- La silueta se calcula sobre la muestra estandarizada.
- `nombre` de cada grupo en `null`.
- `meta.imagen = {'archivo': 'data/imagenes/zonas_aizal.png', 'bbox': BBOX_PROVINCIA}`.
- `meta.notas`: "Mismas variables que AIZAL V4 (B03-B18), tomadas de sus fuentes originales (TerraClimate y SoilGrids)".

- [ ] **Paso 1: pruebas que fallan.** Con una tabla de juguete de 3 grupos bien separados, `agrupar(df, k=3)` da una silueta para k=3 mayor a 0,7, y `comparar` da una coincidencia del 100 % cuando la zona coincide con el grupo. En Node: 5 grupos, `area_pct` suma entre 99 y 101, y `comparacion_biosat` tiene las 5 zonas.
- [ ] **Paso 2:** fallan.
- [ ] **Paso 3:** implementar.
  - **Mapa:** se arma en Earth Engine un `ee.Image` estandarizado con la misma `media` y el mismo `desvio`. Para cada píxel se calcula la distancia a cada uno de los 5 centros y se toma la menor (`ee.Image.cat(...).reduce(ee.Reducer.min(2))` o un `argmin` armado con expresiones).
  - El PNG se exporta con `getThumbURL`, 900 px de ancho, una paleta de 5 colores y la provincia recortada.
- [ ] **Paso 4:** correr el módulo. Pasan pytest y Node. Abrir el PNG y mirar que tenga sentido (por ejemplo, el sur serrano separado).
- [ ] **Paso 5:** commit: "Zonificacion real con k-means sobre TerraClimate y SoilGrids".

### Task 7: Suelo pelado y fragilidad (`data/diagnostico_landsat_ia.json`)

**Archivos:**
- Crear: `ia_desmonte/suelo_pelado.py`
- Prueba: `ia_desmonte/pruebas/test_suelo_pelado.py`; sumar un bloque a Node

**Interfaces:**
- Consume: `data/clima_zonas.json` (anual, período `reciente`: `dias_calor_40` y `balance_mm`) y `data/desmonte_zonas.json` (`riesgo_medio_0_1`).
- Produce:
  - `fracciones(umbrales=(0.20, 0.25, 0.30)) -> dict`: por umbral, zona y mes (12), la fracción o `None`, más `n_obs` por zona y mes.
  - `meses_pelados(por_umbral: dict[float, list]) -> tuple[list[bool], list[bool]]`: devuelve los pelados y los dudosos.
  - `fragilidad(dias40: float, meses: int, deficit: float, riesgo: float) -> float`
  - `main() -> None`

**Valores fijados:**
- Landsat 8 y 9 C2 L2 entre 2021-01-01 y 2025-12-31.
- Máscara de `QA_PIXEL`: bits de nube, sombra, cirro y nieve (1, 3, 4 y 5).
- Escala de reflectancia: `SR_B* · 0,0000275 − 0,2`.
- NDVI = (B5 − B4) / (B5 + B4).
- Mediana por mes calendario sobre los 5 años.
- Solo cultivos (WorldCover clase 40), a 30 m.
- Un mes es pelado si la fracción a 0,25 es 0,5 o más.
- Un mes es dudoso si el estado cambia con 0,20 o con 0,30, o si la fracción es `None`.
- Fragilidad: `100 · (0,35·min(d/40, 1) + 0,30·m/12 + 0,20·min(def/1200, 1) + 0,15·r)`, redondeada a 1 decimal. La fórmula se escribe tal cual en `formula_fragilidad`.
- Confianza: `"media"` para los meses y `"baja"` para la fragilidad, guardadas en `confianza` y `confianza_fragilidad`.
- `evaluacion`: queda `null`, con `datos_de_prueba` = "sin datos de campo: no hay exactitud medible".

- [ ] **Paso 1: pruebas que fallan.**

```python
def test_mes_dudoso_si_cambia_con_el_umbral():
    pu = {0.20: [0.4] + [0.1] * 11, 0.25: [0.55] + [0.1] * 11, 0.30: [0.7] + [0.1] * 11}
    pel, dud = meses_pelados(pu)
    assert pel[0] is True and dud[0] is True and dud[1] is False

def test_mes_sin_datos_es_false_y_dudoso():
    pu = {u: [None] + [0.1] * 11 for u in (0.20, 0.25, 0.30)}
    pel, dud = meses_pelados(pu)
    assert pel[0] is False and dud[0] is True

def test_fragilidad_tope_100():
    assert fragilidad(80, 12, 2000, 1.0) == 100.0
```

  En Node: 12 booleanos en `meses_suelo_pelado` y en `meses_dudosos`, `fraccion_pelado` con 12 números o `null`, y `indice_fragilidad_0_100` entre 0 y 100.
- [ ] **Paso 2:** fallan.
- [ ] **Paso 3:** implementar. Una sola llamada a `reduceRegions` por umbral, con 12 bandas (una por mes, cada una `ndvi_mes < u`) sobre la máscara de cultivos. `n_obs` sale de un `count` sobre la colección enmascarada. `monte_actual_pct` y `desmonte_reciente_pct` se leen del desmonte (`desmonte.monte_pct(2024)`, y la pérdida 2016-2024 sobre el monte de 2015).
- [ ] **Paso 4:** correr el módulo. Pasan pytest y Node.
- [ ] **Paso 5:** commit: "Meses de suelo pelado con Landsat 2021-2025 y fragilidad recalculada".

### Task 8: Imágenes del visor (`data/imagenes/`)

**Archivos:**
- Crear: `ia_desmonte/imagenes.py`
- Modificar: `data/imagenes/*.png` y `data/imagenes/escenas.json` (se reemplazan)
- Prueba: sumar un bloque a Node

**Interfaces:**
- `componer(bbox: list[float], inicio: str, fin: str, sensores: str) -> tuple[ee.Image, int]`: devuelve la mediana enmascarada y la cantidad de escenas.
- `main() -> None`

**Valores fijados:**
- Los `bbox` por zona se toman del `escenas.json` actual.
- Verano: de 2024-12-01 a 2025-03-31. Invierno: de 2025-06-01 a 2025-10-31. Landsat 8 y 9.
- Año 2000, solo para z3: de 2000-08-01 a 2000-11-30, Landsat 5 y 7.
- RGB: bandas 4-3-2 con un estirado fijo (min 0, max 0,3 de reflectancia). NDVI: paleta de marrón a verde, entre 0 y 0,8.
- PNG de 640 px de ancho. Si pasa los 300 KB, se convierte con Pillow a paleta de 256 colores.
- `escenas.json`: `item` = "Mediana Landsat 8/9 · N escenas", `fecha` = el centro del período, `periodo` = "AAAA-MM-DD a AAAA-MM-DD", `n_escenas` y `fuente` = "Google Earth Engine". `nubes` no va.

- [ ] **Paso 1: prueba que falla (Node).**
  - Cada PNG que figura en `escenas.json` existe y pesa menos de 400 KB.
  - Ninguna `item` contiene `LC08_L2SP` ni `LC09_L2SP` (eran las escenas sueltas).
  - **Ningún PNG de `data/imagenes/` es idéntico byte a byte a su par de `web/img/`.** Se compara el hash del PNG contra el hash de los píxeles decodificados que se guarda en `ia_desmonte/salidas/huellas_web_img.json`, generado en el paso 3.
- [ ] **Paso 2:** falla.
- [ ] **Paso 3:** implementar y correr. Guardar las huellas (hash SHA-256 de los píxeles RGB) de `web/img/*.webp` y de los PNG nuevos en `salidas/huellas_web_img.json`.
- [ ] **Paso 4:** pasa Node. Abrir 2 o 3 imágenes y mirarlas: que sean verosímiles y que no tengan cuñas en blanco.
- [ ] **Paso 5:** commit: "Imagenes del visor: compuestos de mediana Landsat hechos en Earth Engine".

### Task 9: Orquestador, registro de corrida y lectura en la app

**Archivos:**
- Crear: `ia_desmonte/correr_todo.py`
- Modificar: `web/app.js:306-313` (tabla de métodos del desmonte)
- Prueba: bloque final en Node: lo que lee la app

**Interfaces:**
- `correr_todo.main(solo: list[str] | None = None) -> None`: corre en orden `suelo`, `desmonte`, `zonificacion`, `suelo_pelado` e `imagenes`.
- Escribe `ia_desmonte/salidas/registro_corrida.json` con: la fecha y hora, los IDs y versiones de los datasets, `SEMILLA`, `UMBRAL_MONTE`, los tamaños de muestra, las versiones de las librerías y el resultado de cada módulo (correcto o error con su mensaje).

- [ ] **Paso 1: prueba que falla (Node).** Lee `web/app.js` y los JSON, y comprueba:
  - que cada clave de método que dibuja la tabla del desmonte exista en `desmonte_zonas.json`;
  - que exista `evaluacion.metodos.temporal.error_ha_pct`.
- [ ] **Paso 2:** falla, porque la app todavía pide `temporal_lstm_o_transformer`.
- [ ] **Paso 3: cambiar `NOM` en `web/app.js`.**

```js
const NOM = {regresion_logistica:'Regresión logística', random_forest:'Random forest', gradient_boosting:'Gradient boosting', temporal:'Proyección (método simple)'};
```

  La fila `temporal` muestra el `error ${error_ha_pct} %` y el nombre del método.
- [ ] **Paso 4:** pasan todas las pruebas de Node (las 71 más las nuevas). Correr `python -m http.server 8000`, abrir `http://localhost:8000/web/` y comprobar que cargan sin errores:
  - el suelo;
  - el desmonte;
  - el visor;
  - la capa "Zonas AIZAL".
- [ ] **Paso 5:** commit: "Orquestador con registro de corrida y la app lee la proyeccion nueva".

### Task 10: Informe y documentos al día

**Archivos:**
- Crear: `docs/datos-y-metodos.md`, `ia_desmonte/README.md`
- Modificar:
  - `docs/contratos-de-datos.md` §2, §3, §7 y §8;
  - `docs/reglas-y-bitacora.md` (D-30);
  - `planes/2-santi.md`;
  - `docs/estado-del-proyecto.md`;
  - `docs/memoria-del-proyecto.md`;
  - `scripts/actualizar_readme.py` (`DESCRIPCIONES`).

- [ ] **Paso 1:** `docs/datos-y-metodos.md`, en lenguaje simple:
  - una tabla de fuentes con su ID y versión;
  - el método de cada producto;
  - las métricas reales, con la tasa base;
  - la tabla de confianza;
  - las limitaciones: Hansen no ve el monte que vuelve a crecer, GRIP4 es de 2018, SoilGrids es un modelo global, el NDVI no separa el rastrojo y no hay validación de campo;
  - cómo volver a correrlo.

  Todos los números se copian de los JSON generados, no se escriben de memoria.
- [ ] **Paso 2:** contratos con los campos nuevos:
  - `rango_p10_p90`, `n_pixeles` y `area_medida`;
  - `meses_dudosos`, `fraccion_pelado`, `n_obs` y `confianza_fragilidad`;
  - `riesgo_n`, `pr_auc`, `tasa_base` y `temporal`.
- [ ] **Paso 3:** D-30 en la bitácora: "Datos reales de Earth Engine reemplazan al prototipo simulado". Plan de Santi: métricas reales y nota del cambio. `estado-del-proyecto.md` y `memoria-del-proyecto.md` al día. `DESCRIPCIONES` para `ia_desmonte/*` y `archivo/`. Regenerar el README con `python -X utf8 scripts/actualizar_readme.py`.
- [ ] **Paso 4:** correr `node --test tests/*.test.js` y `python -X utf8 -m pytest ia_desmonte/pruebas -q`: todo en verde. Buscar restos con `grep -rn "0.986\|0,986\|Validado científicamente\|Compuesto GEE Mediana L8/9" data docs web README.md planes`. Esperado: nada fuera de `archivo/` y de la bitácora histórica.
- [ ] **Paso 5:** commit: "Informe de datos y metodos, contratos y bitacora al dia (D-30)". Avisarle a Enzo para que revise antes de integrar a `main`.
