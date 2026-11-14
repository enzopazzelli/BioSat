# Contratos de datos — BioSat

> **Para qué sirve:** cada frente del [PLAN](../PLAN.md) produce un archivo en `data/` y la app solo lee esos archivos. Si todos respetamos estos formatos, cada uno trabaja en paralelo sin esperar al otro.
> **Regla de oro:** si un dato falta, va `null` y la app muestra "sin dato". **Nunca se completa con un número inventado ni de ejemplo.**
> **Cambios:** si necesitás cambiar un formato, avisá al equipo y anotalo en la [bitácora](reglas-y-bitacora.md).

Todos los archivos:

- **Formato:** JSON en UTF-8, con nombres de campo en español y sin tildes (`lluvia_mm`, `dias_calor_40`).
- **Zonas:** usan siempre estos 4 identificadores:

| `zona_id` | Zona | Punto NASA POWER |
|---|---|---|
| `zona_1_riego_salitre` | Área de riego del Río Dulce | -27.73, -64.17 |
| `zona_2_secano_este` | Secano agrícola del este | -27.65, -62.42 |
| `zona_3_monte_semiarido` | Chaco semiárido y monte | -26.58, -62.85 |
| `zona_4_bajos_submeridionales` | Bajos submeridionales | -28.46, -62.83 |
| `zona_5_sur_serrano` | Sur serrano y salinas (**en evaluación**, D-18) | -29.50, -63.69 |

Cada archivo lleva arriba un bloque `meta` con `fuente`, `generado_por` (script o persona), `fecha` y `notas`.

---

## 1. `data/clima_zonas.json` (F1 · Enzo)

Clima por zona y por mes, con lo **normal** (1991-2020) y lo **reciente** (2021-2025).

```json
{
  "meta": {
    "fuente": "NASA POWER (MERRA-2), modelo de reanálisis, celda de ~50 km",
    "generado_por": "scripts/descargar_nasa_power.py",
    "fecha": "2026-11-14",
    "periodo_normal": "1991-2020",
    "periodo_reciente": "2021-2025",
    "notas": "ET0 calculada con Hargreaves a partir de T2M_MAX y T2M_MIN"
  },
  "zonas": {
    "zona_2_secano_este": {
      "nombre": "Secano agrícola del este",
      "lat": -27.65,
      "lon": -62.42,
      "anual": {
        "lluvia_mm": { "normal": null, "reciente": null },
        "et0_mm": { "normal": null, "reciente": null },
        "balance_mm": { "normal": null, "reciente": null },
        "dias_calor_35": { "normal": null, "reciente": null },
        "dias_calor_40": { "normal": null, "reciente": null },
        "dias_helada_3c": { "normal": null, "reciente": null },
        "ultima_helada_tipica": "MM-DD",
        "primera_helada_tipica": "MM-DD"
      },
      "meses": [
        {
          "mes": 1,
          "lluvia_mm": { "p10": null, "mediana": null, "p90": null },
          "et0_mm": null,
          "balance_mm": null,
          "dias_calor_35": null,
          "dias_calor_40": null,
          "dias_helada_3c": null,
          "prob_helada_pct": null,
          "humedad_raices_anomalia": null
        }
      ]
    }
  }
}
```

- `meses` tiene siempre 12 elementos, de enero a diciembre.
- `balance_mm` es **lluvia − ET0** (negativo = falta agua).
- `humedad_raices_anomalia` es la diferencia de `GWETROOT` contra su promedio normal del mismo mes (negativo = más seco de lo normal).

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

## 4. `data/rotaciones_santiago.json` (F4 · Tercer integrante)

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

---

## 5. Kit Arduino (F6 · Enzo)

### Línea por puerto serie (9600 baudios, una cada 2 segundos)

```json
{"t":12345,"agua_raw":512,"temp_suelo_c":41.2,"temp_aire_c":33.0,"hum_aire_pct":28,"luz_raw":870,"semaforo":"rojo"}
```

- **`agua_raw` y `luz_raw`:** son lecturas crudas de 0 a 1023. La app las traduce con los umbrales calibrados en las bandejas.
- **`semaforo`:** puede ser `"verde"`, `"amarillo"` o `"rojo"`.

### Respaldo: `data/arduino_bandejas_demo.json`

Lecturas **reales** grabadas durante la calibración. La app las usa si el Arduino no está conectado.

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
