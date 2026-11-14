# Módulo: Embeddings Satelitales IA (AlphaEarth Foundations)

> **Pilar Agronómico:** Agrupamiento No Supervisado y Transferencia de Conocimiento entre Lotes  
> **Secciones de Cultivo:** Detección de patrones espectro-temporales homogéneos y búsqueda de lotes análogos exitosos en el Gran Chaco

### Descripción General
Representación multivariada aprendida por IA (Google DeepMind, 64 dimensiones, píxel de 10 m) que resume un año de reflectancia óptica, radar y relieve.

---

## Tabla Resumen de Variables (AIZAL V4)

| Código | Banda | Nombre de la Capa | Período / Fuente | Res. Fuente | Unidad | Área Temática |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **IA** | `emb` | **Embeddings satelitales AlphaEarth 2024 (64 dimensiones)** | 2024 | 10 m | `Adimensional (componentes de un vector unitario, entre −1 y 1)` | Representación aprendida (IA) · Multivariada |

---

## Detalle de Fichas Técnicas

### [IA] Embeddings satelitales AlphaEarth 2024 (64 dimensiones)
* **Banda en el Stack AIZAL:** `emb`
* **Área Temática:** Representación aprendida (IA) · Multivariada
* **Estado en V4:** Variable nueva (IA)
* **Unidad:** `Adimensional (componentes de un vector unitario, entre −1 y 1)`
* **Período de Referencia:** 2024
* **Resolución de la Fuente:** 10 m
* **Resolución en AIZAL:** 500 m (asset precalculado)
* **Descripción Técnica:** Representación multivariada aprendida por un modelo de IA de Google DeepMind (AlphaEarth Foundations). Cada píxel de 10 m tiene un vector de 64 valores (A00 a A63), de longitud unitaria, que resume un año completo de observaciones ópticas (Sentinel-2, Landsat), de radar (Sentinel-1), LiDAR, clima y relieve. Los valores individuales no tienen un significado físico directo: lo importante es la similitud entre vectores. Dos sitios con vectores parecidos tienen una "firma" satelital parecida, es decir, paisajes parecidos.
* **Procesamiento Realizado:** Paso 4 del script de actualización: se tomó la colección GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL del año 2024 y se agregó a 500 m (promedio), guardando los valores × 10.000 como enteros (asset set_datos_v4_embeddings_2024). En la app: (1) se resumen las 64 bandas en sus 6 primeras componentes principales, calculadas en el área de interés; (2) se multiplican por un factor 0,5, de modo que el bloque completo pesa como una variable más del ranking del experto. Si el asset no existe, la app los lee de la colección original de 10 m (más lento). Uso en AIZAL-IA Opcional en el paso 2 (variable 39). Se usa también en la similitud entre paisajes (similitud coseno en todo el Gran Chaco) y como capa de referencia (vista RGB de las dimensiones A01, A16 y A09). No se escala a [0, 1] ni se incluye en el promedio por GUPa.
* **Cambios respecto de V3:** Variable nueva en AIZAL-IA (2026). 43

