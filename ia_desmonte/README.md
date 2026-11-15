# `ia_desmonte/` · Datos reales de suelo, desmonte, zonificación y suelo pelado

Pipeline de Python que calcula con **Google Earth Engine** los datos del frente de suelo, satélite e IA, y los deja en `data/` con el formato de [`docs/contratos-de-datos.md`](../docs/contratos-de-datos.md). Reemplaza al prototipo con datos simulados, que quedó archivado en [`archivo/prototipo-ia-simulado/`](../archivo/prototipo-ia-simulado/LEEME-PRIMERO.md) (D-30).

Fuentes, métodos, métricas y limitaciones: **[`docs/datos-y-metodos.md`](../docs/datos-y-metodos.md)**.

## Qué genera cada módulo

| Módulo | Escribe | Qué calcula |
|---|---|---|
| `suelo.py` | `data/suelo_zonas.json` | Suelo de 0 a 30 cm (SoilGrids), PDSI, distancia a caminos y a monte y % de monte por zona |
| `desmonte.py` y `proyeccion.py` | `data/desmonte_zonas.json` | Historia de desmontes 2001-2025 (Hansen), modelo validado en el tiempo, riesgo por zona y proyección 2026-2029 |
| `zonificacion.py` | `data/zonificacion_aizal.json` y `data/imagenes/zonas_aizal.png` | k-means sobre clima y suelo de toda la provincia |
| `suelo_pelado.py` | `data/diagnostico_landsat_ia.json` | Meses de suelo pelado con Landsat 2021-2025 e índice de fragilidad |
| `imagenes.py` | `data/imagenes/*.png` y `escenas.json` | Compuestos de mediana de Landsat para el visor de la app |
| `zonas.py`, `comun.py` | | Las 5 zonas como polígonos (sus departamentos) y utilidades comunes |
| `correr_todo.py` | `salidas/registro_corrida.json` | Corre todo en orden y registra datasets, semillas y versiones |

## Cómo se corre

Hace falta una cuenta de Earth Engine con un proyecto de Google Cloud registrado para uso no comercial.

```bash
pip install earthengine-api
earthengine authenticate                  # una sola vez
export EE_PROJECT=<id-de-tu-proyecto>     # PowerShell: $env:EE_PROJECT = "<id>"
python -X utf8 -m ia_desmonte.correr_todo # todo; o un módulo: python -X utf8 -m ia_desmonte.suelo
```

- El ID del proyecto **no se escribe en el repo**: se lee de `EE_PROJECT`.
- Las muestras que devuelve Earth Engine quedan en `salidas/*.csv`. Si existen, no se vuelven a pedir, así que los modelos se pueden reentrenar **sin cuenta de Earth Engine**. Para pedir muestras nuevas, se borran los CSV.
- Si un módulo falla, no pisa el JSON que ya estaba.

## Pruebas

```bash
python -X utf8 -m pytest ia_desmonte/pruebas -q   # funciones de cálculo (sin Earth Engine)
node --test tests/datos-contratos.test.js         # forma de los JSON generados
```
