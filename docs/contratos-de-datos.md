# Contratos de datos — BioSat

> **Para qué sirve:** cada frente del [PLAN](../PLAN.md) produce un archivo en `data/` y la app solo lee esos archivos. Si todos respetamos estos formatos, cada uno trabaja en paralelo sin esperar al otro.
> **Regla de oro:** si un dato falta, va `null` y la app muestra "sin dato". **Nunca se completa con un número inventado ni de ejemplo.**
> **Cambios:** si necesitás cambiar un formato, avisá al equipo y anotalo en la [bitácora](reglas-y-bitacora.md).

Todos los archivos:

- **Formato:** JSON en UTF-8, con nombres de campo en español y sin tildes (`lluvia_mm`, `dias_calor_40`).
- **Zonas:** usan siempre estos 5 identificadores:

| `zona_id` | Zona | Punto NASA POWER |
|---|---|---|
| `zona_1_riego_salitre` | Área de riego del Río Dulce | -27.73, -64.17 |
| `zona_2_secano_este` | Secano agrícola del este | -27.65, -62.42 |
| `zona_3_monte_semiarido` | Chaco semiárido y monte | -26.58, -62.85 |
| `zona_4_bajos_submeridionales` | Bajos submeridionales | -28.46, -62.83 |
| `zona_5_sur_serrano` | Sur serrano y salinas (D-21) | -29.50, -63.69 |

Cada archivo lleva arriba un bloque `meta` con `fuente`, `generado_por` (script o persona), `fecha` y `notas`.

---

## 1. `data/clima_zonas.json` (F1 · Enzo)

Lo genera [`scripts/descargar_nasa_power.py`](../scripts/descargar_nasa_power.py) con NASA POWER diario 1981-2025. Trae lo **normal** (1991-2020) y lo **reciente** (2021-2025) de cada zona.

```json
{
  "meta": {
    "fuente": "NASA POWER (MERRA-2), modelo de reanálisis, celda de ~50 km",
    "generado_por": "scripts/descargar_nasa_power.py",
    "periodo_normal": "1991-2020",
    "periodo_reciente": "2021-2025",
    "escenarios_temperatura_c": [0, 0.5, 1, 1.5, 2, 2.5]
  },
  "zonas": {
    "zona_2_secano_este": {
      "nombre": "Secano agrícola del este", "lat": -27.65, "lon": -62.42,
      "anual": {
        "lluvia_mm": {"normal": 830, "reciente": 0},
        "et0_mm": {"normal": 0, "reciente": 0},
        "balance_mm": {"normal": 0, "reciente": 0},
        "dias_calor_35": {"normal": 0, "reciente": 0},
        "dias_calor_40": {"normal": 0, "reciente": 0},
        "dias_helada_3c": {"normal": 0, "reciente": 0},
        "primera_helada_tipica": "DD/MM", "ultima_helada_tipica": "DD/MM",
        "racha_seca_max": {"dias": 0, "termino": "DD/MM/AAAA"},
        "record_tmax": {"c": 0, "fecha": "DD/MM/AAAA"}
      },
      "serie_dias_calor_40": {"desde": 1981, "valores": [0, 0, 0]},
      "periodos": {
        "normal": {
          "meses": [{
            "mes": 1, "tmax_c": 0, "tmin_c": 0,
            "lluvia_mm": {"media": 0, "p10": 0, "mediana": 0, "p90": 0},
            "tormentas_30mm": 0, "dias_helada_3c": 0, "prob_helada_pct": 0,
            "humedad_raices": 0, "humedad_raices_anomalia": 0,
            "dias_calor_35": [0, 0, 0, 0, 0, 0],
            "dias_calor_40": [0, 0, 0, 0, 0, 0],
            "et0_mm": [0, 0, 0, 0, 0, 0]
          }],
          "anios": [{"anio": 1991, "dias_calor_40": [[0, 0, 0]], "tormentas_30mm": [0, 0, 0]}]
        },
        "reciente": {"meses": [], "anios": []}
      }
    }
  }
}
```

*(Los ceros del ejemplo solo muestran la forma; el archivo real trae los valores calculados.)*

**Cómo leer los campos:**
- **`meses`:** 12 elementos, de enero a diciembre.
- **Listas de 6 valores** (`dias_calor_35`, `dias_calor_40`, `et0_mm`): una por escenario de temperatura (+0 a +2,5 °C). El primero es el clima real; los otros los usa el simulador.
- **`anios`:** trae año por año los días de más de 40 °C por mes (6 listas de 12, una por escenario) y las tormentas por mes. Sirve para el riesgo como frecuencia ("en 1 de cada 5 años…").
- **`balance_mm`:** es lluvia − ET0 (Hargreaves). Negativo = falta agua.
- **`humedad_raices`:** es `GWETROOT` (0 a 1). `humedad_raices_anomalia` es la diferencia contra el mismo mes de 1991-2020; en el período normal vale 0.

---

## 2. `data/suelo_zonas.json` (F2 · Santi)

Suelo y paisaje por zona, a partir de AIZAL V4 (o de SoilGrids como plan B).

```json
{
  "meta": {
    "fuente": "AIZAL V4 (SoilGrids 2.0, TerraClimate, MapBiomas Chaco C5, OSM)",
    "generado_por": "nombre del script o de la persona",
    "fecha": "2026-11-14",
    "notas": "valor medio dentro del polígono de cada zona"
  },
  "zonas": {
    "zona_2_secano_este": {
      "ph": { "valor": null, "codigo": "B16", "confianza": "media" },
      "arcilla_pct": { "valor": null, "codigo": "B12", "confianza": "media" },
      "arena_pct": { "valor": null, "codigo": "B17a", "confianza": "media" },
      "limo_pct": { "valor": null, "codigo": "B17b", "confianza": "media" },
      "carbono_organico_g_kg": { "valor": null, "codigo": "B15", "confianza": "media" },
      "nitrogeno_g_kg": { "valor": null, "codigo": "B11", "confianza": "media" },
      "densidad_aparente_g_cm3": { "valor": null, "codigo": "B18", "confianza": "media" },
      "pdsi": { "valor": null, "codigo": "B05", "confianza": "media" },
      "distancia_caminos_km": { "valor": null, "codigo": "B36", "confianza": "media" },
      "distancia_monte_km": { "valor": null, "codigo": "B31", "confianza": "media" },
      "monte_nativo_pct": { "valor": null, "codigo": "MapBiomas", "confianza": "media" }
    }
  }
}
```

- `confianza` puede ser `"alta"`, `"media"` o `"baja"`. La app la muestra junto a cada dato.
- **Los satélites no miden salinidad ni compactación profunda:** eso queda como "qué falta saber" en las fichas.

---

## 3. `data/diagnostico_landsat_ia.json` (F3 · Santi)

Resultado del módulo de IA con Landsat. **Solo valores calculados por el modelo o el método simple.**

> **Desde D-25:** este archivo guarda los **meses de suelo pelado** calculados con el método de umbral. La comparación de modelos de IA pasó al modelo de desmonte (§8), así que el bloque `evaluacion` de acá puede quedar en `null`.

```json
{
  "meta": {
    "fuente": "Landsat 8/9 Collection 2 Level-2 (30 m)",
    "etiquetas": "MapBiomas Chaco, colección y años usados",
    "generado_por": "ia_landsat/...",
    "fecha": "2026-11-14",
    "periodo": "2016-2025",
    "notas": ""
  },
  "evaluacion": {
    "datos_de_prueba": "descripción de las zonas o píxeles que el modelo no vio",
    "metodos": {
      "umbral_ndvi_nbr": { "exactitud": null, "f1": null },
      "cnn_lstm": { "exactitud": null, "f1": null },
      "cnn_transformer": { "exactitud": null, "f1": null }
    },
    "metodo_elegido": "umbral_ndvi_nbr | cnn_lstm | cnn_transformer"
  },
  "zonas": {
    "zona_3_monte_semiarido": {
      "meses_suelo_pelado": [false, false, false, false, false, false, false, false, false, false, false, false],
      "meses_suelo_pelado_promedio_anual": null,
      "desmonte_reciente_pct": null,
      "monte_actual_pct": null,
      "indice_fragilidad_0_100": null,
      "formula_fragilidad": "texto con la fórmula usada",
      "confianza": "media"
    }
  }
}
```

- `meses_suelo_pelado` tiene 12 valores (enero a diciembre): `true` si en ese mes la zona suele tener el suelo pelado. Va directo al calendario. Si el dato sale de [`scripts/gee_exportar_zonas.js`](../scripts/gee_exportar_zonas.js), vale `true` cuando `prob_pelado_mXX` es 0,5 o más.
- `indice_fragilidad_0_100` se calcula con una **fórmula visible** (por ejemplo, meses pelados × días de calor × lluvias intensas), escrita en `formula_fragilidad`.

---

## 4. `data/rotaciones_santiago.json` (F4 · Vale)

Las 3 rotaciones de cada zona, con los 5 puntos que pide la NASA y los datos que usa el motor.

```json
{
  "meta": {
    "fuente": "Entrevista al productor + INTA + bibliografía (ver 'fuentes' en cada rotación)",
    "generado_por": "nombre",
    "fecha": "2026-11-14",
    "notas": ""
  },
  "zonas": {
    "zona_2_secano_este": {
      "zona_protagonista": true,
      "validado_por": "productor | agrónomo | sin validar",
      "rotaciones": [
        {
          "id": "z2_actual",
          "tipo": "actual",
          "nombre": "Soja sobre soja con barbecho largo",
          "secuencia": [
            { "cultivo": "Soja", "seccion": "B", "siembra_mes": 12, "cosecha_mes": 4 }
          ],
          "calendario": ["cultivo", "cultivo", "cultivo", "cultivo", "rastrojo", "desnudo", "desnudo", "desnudo", "desnudo", "desnudo", "desnudo", "cultivo"],
          "por_que": "texto corto",
          "evidencia": [
            { "texto": "texto corto", "dato": "clima_zonas.zona_2_secano_este.anual.dias_calor_40", "fuente": "NASA POWER" }
          ],
          "beneficios": ["..."],
          "que_falta_saber": ["..."],
          "riesgos_revision_local": ["..."],
          "atributos": {
            "demanda_agua": "baja | media | alta",
            "aporte_nitrogeno": "negativo | neutro | positivo",
            "meses_suelo_desnudo": null,
            "forraje": false,
            "ingreso": "bajo | medio | alto",
            "requiere_riego": false,
            "requiere_hacienda": false,
            "maquinaria_especial": "ninguna | texto"
          },
          "fuentes": ["INTA EEA Santiago del Estero, ..."]
        }
      ]
    }
  }
}
```

- Cada zona tiene **exactamente 3 rotaciones**: una con `"tipo": "actual"` y dos con `"tipo": "alternativa"`.
- `seccion` es la de [`documentacion-tecnica-agronomica.md`](documentacion-tecnica-agronomica.md):
  - **A:** gramíneas.
  - **B:** leguminosas.
  - **C:** raíces profundas.
  - **D:** coberturas.
- `calendario` tiene 12 valores, de enero a diciembre. Valores posibles: `"cultivo"`, `"cobertura"`, `"rastrojo"` o `"desnudo"`.
- `evidencia[].dato` apunta a un campo de otro contrato. Así la app muestra el número real al lado del texto.
- **Puntajes de la app:** salen de estos atributos con reglas fijas y visibles (ver "¿Cómo ordena BioSat?" en la app):
  - **Ahorrar agua:** según `demanda_agua`.
  - **Frenar el salitre:** según los meses de mayo a octubre con el suelo cubierto.
  - **Recuperar el suelo:** según los meses sin suelo pelado, más 1 si suma una leguminosa a una rotación con otras secciones.
  - **Sumar forraje:** según `forraje`.
  - **Ingreso:** según `ingreso`.
- **Mientras una zona no tenga sus 3 rotaciones en este archivo**, la app usa el borrador de `web/datos-borrador/rotaciones_borrador.json` y lo avisa.

---

## 5. Imágenes del visor (F3 · Santi)

Las exporta [`scripts/gee_exportar_zonas.js`](../scripts/gee_exportar_zonas.js) y la app las muestra en el visor del lote.

- **Carpeta:** `data/imagenes/`
- **Nombre:** `zN_<capa>.png`
  - `N` es el número de zona, de 1 a 5.
  - `<capa>` es `invierno_rgb`, `verano_rgb`, `invierno_ndvi`, `verano_ndvi` o `2000_rgb`.
- **Recorte:** el punto de NASA POWER de la zona ± 0,4° de longitud y ± 0,3° de latitud. La app usa ese recuadro para ubicar la imagen en el mapa.
- **Archivo `data/imagenes/escenas.json`:** cuando existe, la app usa estas imágenes en lugar de las de vista previa (`web/img/`). Formato, por zona:

```json
{"z1": {"bbox": [-64.57, -28.03, -63.77, -27.43],
        "invierno": {"item": "ID de escena", "fecha": "AAAA-MM-DD", "nubes": 0.4},
        "verano": {"item": "...", "fecha": "...", "nubes": 0},
        "anio2000": {"item": "...", "fecha": "..."}}}
```

  Solo se muestran las capas cuya estación (`invierno`, `verano`, `anio2000`) figura en el archivo.

---

## 6. Kit Arduino (F6 · Sara)

### Línea por puerto serie (9600 baudios, una cada 2 segundos)

```json
{"t":12345,"agua_raw":512,"temp_suelo_c":41.2,"temp_aire_c":33.0,"hum_aire_pct":28,"luz_raw":870,"semaforo":"rojo"}
```

- **`agua_raw` y `luz_raw`:** son lecturas crudas de 0 a 1023. La app las traduce con los umbrales calibrados en las bandejas.
- **`semaforo`:** puede ser `"verde"`, `"amarillo"` o `"rojo"`.

### Lector para la app: `arduino/lector-web-serial.js` (Sara)

La app lo carga si existe y habilita el botón "Conectar Arduino por USB". Ya está hecho (`arduino/lector-web-serial.js`, con pruebas). `conectar()` vuelve apenas abre el puerto y las lecturas siguen llegando a `alLeer`. Tiene que dejar disponible este objeto:

```js
window.BioSatArduino = {
  soportado: () => 'serial' in navigator,   // true en Chrome o Edge
  conectar: async (alLeer) => { /* pide el puerto, abre a 9600 baudios y llama alLeer(lectura) con cada línea JSON */ },
  desconectar: async () => { /* cierra el puerto */ }
};
```

- `lectura` es el objeto de la línea JSON de arriba (`temp_suelo_c`, `agua_raw`, `luz_raw`, `temp_aire_c`, `hum_aire_pct`, `semaforo`).
- Si el archivo no existe o el navegador no tiene Web Serial, la app usa las lecturas grabadas.

### Respaldo: `data/arduino_bandejas_demo.json`

Lecturas **reales** grabadas durante la calibración. La app las usa si el Arduino no está conectado.

- **`meta.umbrales`:** puede traer `{"conductividad_salitre_raw": N}`, el valor de `agua_raw` desde el que la bandeja avisa posible salitre. Lo usa la pantalla del kit (`web/kit.html`); si falta, toma 700.

```json
{
  "meta": { "fuente": "Kit Arduino BioSat", "fecha": "2026-11-15", "notas": "umbrales usados: ..." },
  "bandejas": {
    "A_pelada_seca": [ { "t": 0, "agua_raw": null, "temp_suelo_c": null, "temp_aire_c": null, "hum_aire_pct": null, "luz_raw": null, "semaforo": null } ],
    "B_salitrosa": [],
    "C_rastrojo": []
  }
}
```

---

## 7. `data/zonificacion_aizal.json` (F2 · Santi)

Zonificación de la provincia con k-means sobre clima y suelo de AIZAL, propuesta por la profesora (D-25). Lo genera [`scripts/gee_zonas_y_desmonte.js`](../scripts/gee_zonas_y_desmonte.js), parte A.

```json
{
  "meta": {
    "fuente": "AIZAL V4 (o TerraClimate + SoilGrids si no hay acceso)",
    "variables": ["b03", "b04", "b05", "b06", "b07", "b08", "b09", "b10", "b11", "b12", "b13", "b14", "b15", "b16", "b17a", "b17b", "b18"],
    "metodo": "k-means sobre variables estandarizadas",
    "k": 5,
    "criterio_k": "silueta | codo | propuesta de la cátedra",
    "escala_m": 500,
    "imagen": {"archivo": "data/imagenes/zonas_aizal.png", "bbox": [-65.3, -30.2, -61.5, -25.5]},
    "generado_por": "scripts/gee_zonas_y_desmonte.js",
    "fecha": null
  },
  "grupos": [
    {"id": 0, "nombre": null, "area_pct": null,
     "perfil": {"lluvia_mm": null, "tmax_c": null, "tmin_c": null, "ph": null, "arcilla_pct": null, "carbono_organico_g_kg": null}}
  ],
  "comparacion_biosat": {
    "zona_1_riego_salitre": {"grupo_mayoritario": null, "coincidencia_pct": null}
  }
}
```

- **`grupos`:** un elemento por grupo. `nombre` lo pone el equipo mirando el perfil (por ejemplo, "Sur fresco y serrano").
- **`meta.imagen`** (opcional): PNG de los grupos con su recuadro `[oeste, sur, este, norte]`. Si está, el visor de la app muestra la capa "Zonas AIZAL".
- **`comparacion_biosat`:** dice qué grupo AIZAL domina en la celda de cada zona de BioSat y en qué porcentaje. Sirve para validar las 5 zonas.

---

## 8. `data/desmonte_zonas.json` (F3 · Santi)

Modelo predictivo de desmontes por zona (D-25). Lo genera la parte B de [`scripts/gee_zonas_y_desmonte.js`](../scripts/gee_zonas_y_desmonte.js), y los modelos de Python completan las métricas.

```json
{
  "meta": {
    "historia": "LART (desde 1976) | MapBiomas Chaco | Hansen GFC v1.11 (2001-2023)",
    "predictores": ["dist_sin_monte", "dist_desmonte_previo", "pendiente", "area_protegida", "poblacion", "clima y suelo AIZAL", "zona_aizal"],
    "validacion": "entrena con predictores al 2008 y desmonte 2009-2015; prueba con predictores al 2015 y desmonte 2016-2023",
    "generado_por": "scripts/gee_zonas_y_desmonte.js + notebook de Santi",
    "fecha": null
  },
  "evaluacion": {
    "metodos": {
      "regresion_logistica": {"auc": null, "f1": null},
      "random_forest": {"auc": null, "f1": null},
      "temporal_lstm_o_transformer": {"error_ha_pct": null}
    },
    "metodo_elegido": null
  },
  "zonas": {
    "zona_3_monte_semiarido": {
      "monte_actual_pct": null,
      "desmonte_ha_por_anio": {"desde": null, "valores": null},
      "riesgo_medio_0_1": null,
      "proyeccion_ha": {"anios": null, "valores": null},
      "confianza": null
    }
  }
}
```

- **`riesgo_medio_0_1`:** probabilidad media de desmonte del monte que queda en la celda de la zona. La app la muestra como "presión de desmonte".
- **`proyeccion_ha`:** sale del modelo temporal (LSTM o Transformer). Si no llega a tiempo, queda en `null`.

---

## 9. `data/santiago_mapa.json` (mapa del asistente · Enzo)

El contorno de Santiago del Estero con sus 27 departamentos, pintados por zona, para el mapa de la primera pregunta del asistente. Lo genera [`scripts/generar_mapa_santiago.py`](../scripts/generar_mapa_santiago.py) (corre una vez, con internet) y la app lo lee sin conexión.

```json
{
  "meta": {"fuente": "geoBoundaries ARG ADM2 (año 2020), del IGN", "licencia": "CC BY 3.0 IGO", "url": "…", "generado_por": "scripts/generar_mapa_santiago.py", "fecha": "2026-11-14", "notas": "…"},
  "viewBox": [322.8, 499.1],
  "departamentos": [
    {"nombre": "General Taboada", "zona": 4, "origen": "punto", "d": "M12.3,45.6L13.1,46.0…Z"}
  ],
  "puntos": {"1": {"x": 0, "y": 0}, "2": {"x": 0, "y": 0}, "3": {"x": 0, "y": 0}, "4": {"x": 0, "y": 0}, "5": {"x": 0, "y": 0}}
}
```

- **`d`:** trazo SVG ya proyectado al cuadro `viewBox` (longitud × coseno de la latitud media), listo para dibujar sin hacer cuentas.
- **`zona`:** número de 1 a 5.
- **`puntos`:** el punto de NASA POWER de cada zona, en el mismo cuadro. Sale de `data/clima_zonas.json`.
- **`origen`:** cómo se asignó el departamento a su zona, aplicando la primera regla que corresponda:
  1. `"punto"`: el departamento contiene el punto de NASA POWER de la zona (5 departamentos). Así el pueblo de cada zona siempre cae sobre un departamento de su mismo color.
  2. `"lista"`: el departamento ya figura en `ZONAS[...].deptos` de `web/app.js` (15).
  3. `"cercana"`: va a la zona de punto más cercano al centro del departamento, calculado en plano (7).
- **Es una aproximación:** las zonas se dibujan por departamento, pero el clima de cada una sale de un punto de NASA POWER (una celda de unos 50 km). La app lo dice debajo del mapa.
- **Fuente y licencia:** Instituto Geográfico Nacional (IGN), vía geoBoundaries, CC BY 3.0 IGO. La app tiene que citarla junto al mapa.
- El archivo original de geoBoundaries (5,5 MB, todo el país) **no se sube al repositorio**.
