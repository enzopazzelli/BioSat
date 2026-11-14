# BioSat — Field Shift: Adapting Farms with NASA Data

> **NASA Space Apps Challenge 2026** · Desafío: *Field Shift: Adapting Farms with NASA Data*  
> Sede: Santiago del Estero, Argentina · Equipo: **BioSat**

---

## 🌾 Sobre el Proyecto

**BioSat** es un sistema de apoyo a la toma de decisiones (**DSS**) diseñado para que agricultores y agrónomos evalúen y comparen **estrategias de rotación de cultivos resilientes** frente al cambio climático y la degradación del suelo.

La herramienta combina:
1. **Datos Satelitales Globales de la NASA y Copernicus:** Clima diario sin huecos (NASA POWER), humedad del suelo (SMAP), evapotranspiración (ECOSTRESS / OpenET), relieve (SRTM / Copernicus DEM) y vigor vegetal (Landsat / Sentinel-2).
2. **Cubo Biofísico Regional (AIZAL V4):** 38 variables edáficas, climáticas y de cobertura terrestre a 500 m, junto con embeddings satelitales multivariados de Google DeepMind (AlphaEarth 2024).
3. **Reglas Agronómicas Biológicas:** Motor que balancea el nitrógeno, minimiza las ventanas de suelo desnudo, promueve la descompactación biológica y rompe ciclos de plagas mediante la alternancia de 4 secciones funcionales de cultivo.
4. **Validación Humana (*Human-in-the-Loop*):** Reconocimiento explícito de lo que el satélite no puede medir (compactación profunda a pala, herbicidas residuales, maquinaria disponible y acopios locales).

---

## 📁 Estructura del Repositorio

```text
BioSat/
├── README.md                              <-- Este archivo
├── ESTRUCTURA_DATOS.md                    <-- Guía detallada de la arquitectura de datos
├── CONTEXTO.md                            <-- Bitácora del proyecto y decisiones de equipo
├── data/
│   ├── resumen_mensual_santiago.csv       <-- Resumen climático mensual (Santiago del Estero)
│   ├── nasa_power_santiago_zonas.json     <-- Series diarias NASA POWER (2020-2025)
│   ├── raw_nasa_power/                    <-- Descargas crudas por zona agroecológica
│   └── datos_cruzados_aizal/              <-- Cubo de datos cruzados AIZAL V4 (38 variables)
│       ├── CATALOGO_MAESTRO_VARIABLES.md
│       ├── 01_Clima_y_Balance_Hidrico/
│       ├── 02_Vegetacion_Fenologia_y_Paisaje/
│       ├── 03_Quimica_Nutricion_Suelo/
│       ├── 04_Fisica_Suelo_y_Topografia/
│       ├── 05_Logistica_Antropico_y_Servicios/
│       └── 06_Embeddings_IA_AlphaEarth/
├── docs/
│   ├── documentacion-tecnica-agronomica.md <-- Fundamentos del simulador y los 5 pilares
│   ├── analisis-datos-nasa-santiago.md    <-- Informe de hallazgos climáticos 2020-2025
│   ├── AIZAL_Fichas_Variables_V4_2026.pdf <-- Fichas técnicas completas de variables AIZAL
│   ├── glosario.md                        <-- Términos satelitales, agronómicos y de IA
│   ├── plan-de-pasos-y-agentes.md         <-- Hoja de ruta de desarrollo multi-agente
│   ├── recursos-desafio.md                <-- Auditoría de los recursos oficiales NASA
│   ├── reglas-y-bitacora.md               <-- Criterios de evaluación y bitácora
│   ├── resena-desafio.md                  <-- Reseña del desafío Field Shift
│   └── zonas-santiago-y-kit-arduino.md    <-- Zonas locales y módulo de sensores
└── scripts/
    ├── descargar_nasa_power.py            <-- Extracción de series diarias NASA POWER
    └── earth_engine_embeddings.js         <-- Script GEE para embeddings satelitales
```

---

## 🚀 Inicio Rápido

### Consulta de Datos Estructurados
Para explorar la documentación técnica de las variables, consulta [ESTRUCTURA_DATOS.md](ESTRUCTURA_DATOS.md) o navega por los módulos en `data/datos_cruzados_aizal/`.

### Descarga de Series de NASA POWER
```bash
python scripts/descargar_nasa_power.py
```

### Script de Google Earth Engine
El script `scripts/earth_engine_embeddings.js` puede ejecutarse directamente en el Code Editor de Google Earth Engine para evaluar similitudes interanuales con la colección `GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL`.

---

## 📄 Documentación Técnica

* **[ESTRUCTURA_DATOS.md](ESTRUCTURA_DATOS.md):** Especificación completa de capas, bandas, resoluciones y fuentes de datos.
* **[docs/documentacion-tecnica-agronomica.md](docs/documentacion-tecnica-agronomica.md):** Fundamentos agronómicos, las 4 secciones funcionales y la matriz de los 5 pilares fisiológicos.
* **[docs/analisis-datos-nasa-santiago.md](docs/analisis-datos-nasa-santiago.md):** Análisis de 5 años de datos de temperatura, lluvia, evapotranspiración y humedad radicular en Santiago del Estero.
