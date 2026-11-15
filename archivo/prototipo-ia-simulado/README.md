# 🛰️ Espacio de Trabajo: `santi-task`
### Zonificación Edafo-Climática (K-Means) y Predicción de Desmonte (Random Forest)

> **Ubicación:** `/Users/santig56/Desktop/Nasa/santi-task`  
> **Autor:** Santi (Frente 2: Suelo/Zonificación & Frente 3: IA Desmonte)  
> **Proyecto:** BioSat · NASA Space Apps Challenge 2026  
> **Estado:** 100% Validado en local. Listo y ordenado para integrar al repositorio `BioSat` cuando se autorice.

---

## 🚀 Inicio Rápido: Ejecución Automatizada del Pipeline

Para correr el pipeline "Zero-Touch" completo (actualiza datos, re-entrena modelos, genera gráficos, imprime el reporte PDF y registra el histórico):

```bash
# Modo Automático (prioriza bandeja manual o base activa)
python3 santi-task/python/pipeline_automatizado.py

# Modo API (consulta fuentes remotas satelitales)
python3 santi-task/python/pipeline_automatizado.py --modo api

# Modo Manual (procesa CSVs dejados en data/entrada_manual/)
python3 santi-task/python/pipeline_automatizado.py --modo manual
```

📖 **Guía detallada de operación:** [`INSTRUCCIONES_PIPELINE.md`](file:///Users/santig56/Desktop/Nasa/santi-task/INSTRUCCIONES_PIPELINE.md)

---

## 📁 Estructura del Directorio Limpio y Ordenado

```text
santi-task/
├── README.md                                   <- Este índice general
├── INSTRUCCIONES_PIPELINE.md                   <- MANUAL DE OPERACIÓN DEL PIPELINE
│
├── BioSat_IA_Zonificacion_y_Desmonte.ipynb     <- NOTEBOOK JUPYTER PRINCIPAL (con gráficos pre-renderizados)
│
├── registros/                                  <- REPORTES PDF HISTÓRICOS Y REGISTROS
│   ├── INDICE_REGISTROS.md                     <- Índice cronológico de reportes generados
│   ├── Reporte_IA_BioSat_20261114_151536.pdf   <- Reporte ejecutivo en PDF (3 páginas, limpio FPDF)
│   └── registro_metricas_20261114_151536.json  <- Registro estructurado JSON para APIs y pdfplumber
│
├── graficos_y_resultados/                      <- Gráficos activos de alta resolución (300 DPI)
│   ├── 01_codo_y_silueta_kmeans.png            <- Gráfico del Codo vs Silueta (K=5 óptimo)
│   ├── 02_heatmap_perfiles_clusters.png        <- Heatmap de propiedades biofísicas por cluster
│   ├── 03_matriz_correspondencia_zonas.png     <- Matriz de cruce con las 5 zonas BioSat (100%)
│   ├── 04_curvas_roc_modelos.png               <- Curvas ROC (RF AUC 0.973 vs Logística AUC 0.984)
│   ├── 05_matrices_confusion.png               <- Matrices de confusión en test temporal 2016-2023
│   ├── 06_importancia_variables_rf.png         <- Ponderación Gini (Caminos y contagio = 73.3%)
│   ├── 07_serie_historica_desmonte.png         <- Serie anual de desmonte en ha (Hansen 2001-2023)
│   ├── 08_riesgo_desmonte_por_zona.png         <- Score de riesgo medio por celda BioSat (0 a 1)
│   ├── resumen_metricas_modelos.csv            <- Tabla comparativa de métricas en CSV
│   │
│   ├── explicaciones/                          <- SUB-CARPETA: Explicación detallada del porqué de cada cosa
│   │   ├── 01_explicacion_seleccion_k.md       <- Por qué K=5 y no K=3 o K=4 (análisis matemático)
│   │   ├── 02_explicacion_perfiles_clusters.md <- Interpretación agronómica de cada cluster
│   │   ├── 03_explicacion_correspondencia.md   <- Por qué coincide 100% con las 5 zonas BioSat
│   │   ├── 04_explicacion_curvas_roc.md        <- Rigor de la validación temporal out-of-time
│   │   ├── 05_explicacion_matrices_confusion.md<- Balance de errores (falsos positivos/negativos)
│   │   ├── 06_explicacion_importancia_variables.md <- El trío de accesibilidad humana (73.3%)
│   │   ├── 07_explicacion_series_historicas.md <- Ciclo histórico de expansión y Ley de Bosques
│   │   ├── 08_explicacion_riesgo_por_zona.md   <- Cómo afecta las rotaciones de cultivo en BioSat
│   │   └── INFORME_COMPLETO_EVALUACION.md      <- White Paper completo para el jurado y la cátedra
│   │
│   └── historial/                              <- Resguardo de gráficos de versiones anteriores
│       ├── HISTORIAL.md                        <- Bitácora de versiones y métricas
│       └── version_20261114_144548/            <- Snapshot de versión previa
│
├── data/                                       <- Datasets estructurados en CSV y contratos oficiales JSON
│   ├── entrada_manual/                         <- BANDEJA DE ENTRADA para nuevos CSVs manuales
│   ├── gee_exports/                            <- Exportaciones de Google Earth Engine
│   ├── zonas_bioclima_suelo.csv                <- Variables edafo-climáticas consolidadas
│   ├── desmonte_entrenamiento_2001_2015.csv    <- 3.000 muestras balanceadas (corte <=2015)
│   ├── desmonte_prueba_2016_2023.csv           <- 3.000 muestras independientes (corte 2016-2023)
│   ├── serie_historica_desmonte_zonas.csv      <- Hectáreas anuales desmontadas por zona
│   ├── zonificacion_aizal.json                 <- CONTRATO §7 (poblado con datos reales)
│   └── desmonte_zonas.json                     <- CONTRATO §8 (poblado con datos reales)
│
├── gee/                                        <- Módulo Google Earth Engine LIMPIO Y CONSOLIDADO
│   ├── README_GEE.md                           <- Cuándo usar y cuándo NO usar GEE
│   └── biosat_gee_pipeline_completo.js         <- ÚNICO script maestro consolidado para GEE Code Editor
│
└── python/                                     <- Scripts ejecutables del pipeline
    ├── pipeline_automatizado.py                <- SCRIPT PRINCIPAL ZERO-TOUCH (Ingesta, Modelado, PDF)
    ├── extraer_metricas_pdf.py                 <- Lector interoperable con pdfplumber y JSON
    ├── actualizar_pipeline.py                  <- Actualizador y archivador de versiones
    ├── compilar_notebook.py                    <- Generador del notebook Jupyter
    └── exportar_graficos_y_metricas.py         <- Generador de imágenes en alta resolución
```

---

## 📌 Enlaces Rápidos a la Documentación
- 📖 **Instrucciones del Pipeline:** [`INSTRUCCIONES_PIPELINE.md`](file:///Users/santig56/Desktop/Nasa/santi-task/INSTRUCCIONES_PIPELINE.md)
- 📄 **Último Reporte PDF Generado:** [`registros/Reporte_IA_BioSat_20261114_151536.pdf`](file:///Users/santig56/Desktop/Nasa/santi-task/registros/Reporte_IA_BioSat_20261114_151536.pdf)
- 📊 **Notebook Principal:** [`BioSat_IA_Zonificacion_y_Desmonte.ipynb`](file:///Users/santig56/Desktop/Nasa/santi-task/BioSat_IA_Zonificacion_y_Desmonte.ipynb)
- 🖼️ **Carpeta de Gráficos:** [`graficos_y_resultados/`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/)
- 📑 **Informe Maestro para Cátedra y Jurado:** [`INFORME_COMPLETO_EVALUACION.md`](file:///Users/santig56/Desktop/Nasa/santi-task/graficos_y_resultados/explicaciones/INFORME_COMPLETO_EVALUACION.md)
