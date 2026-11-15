# BioSat: mejoras para convertir la demo en un producto viable

> **Estado (15/11, Enzo):** integrado a `main` (D-37). **Aplicado:** el texto del agua del semáforo (§4, "Revisar el semáforo"): ahora dice lluvia contra la evaporación de referencia (ET0). **Decidido:** el resto se usa como "cómo seguimos" en el pitch y no se construye ahora. **Falta:** subir la minuta citada como base.

**Fecha:** 15 de noviembre de 2026  
**Base:** minuta `minuta_mejoras_app_drones_sensores_2026-11-15.md`, auditoría de BioSat y revisión de `main` en el commit [`bdb680a`](https://github.com/enzopazzelli/BioSat/commit/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef).  
**Naturaleza:** propuesta de producto para decidir y validar. Las ideas M-01 a M-07 vienen de la minuta; las prioridades, criterios de aceptación y secuencia que siguen son una recomendación de esta auditoría. M-08 está expresamente pendiente de confirmación. No se modificó el repositorio.

## 1. Diagnóstico ejecutivo

BioSat ya es una **demo funcional por zona**: ofrece clima histórico y pronóstico, mapas e imágenes satelitales, tres rotaciones por cada una de cinco zonas, un simulador, un reporte imprimible y conexión por Web Serial al kit. También tiene una primera estructura para móvil y escritorio. La fuente de esos datos y sus límites aparecen en [Datos y métodos](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/docs/datos-y-metodos.md).

El salto a producto requiere cambiar la unidad de trabajo de **«una zona de Santiago del Estero» a «un lote identificado, con sectores, fechas, historia y responsable»**. Hoy el navegador lee JSON estáticos por zona; no hay en el flujo principal carga de polígonos de lotes, vuelos de dron, campañas, observaciones del asesor ni expedientes de recomendaciones. El visor compara capas disponibles de Landsat, pero no produce por sí mismo una intervención georreferenciada del lote. [Carga de datos de la app](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/web/app.js#L1025-L1049).

**Conclusión:** sirve para explicar un concepto y explorar información regional. Para uso productivo debe completar un circuito verificable: **registrar lote → reunir evidencia → detectar sectores → verificar en campo → aprobar una recomendación → entregar y seguir el resultado**. Un índice o color de mapa debe disparar una revisión, no presentarse como diagnóstico de causa.

### Avances recientes que ya no deben figurar como pendientes

- La interfaz satelital ya usa «sin cobertura vegetal activa» y reconoce que el NDVI no distingue suelo descubierto de rastrojo seco. Conviene mantener la distinción entre ese **dato zonal observado** y los meses «pelados» **planificados en el calendario de una rotación**. [Interfaz del reporte](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/web/index.html).
- La tabla del diagnóstico satelital ya muestra únicamente el umbral de NDVI ejecutado y «sin medir» para exactitud y F1. [Implementación](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/web/app.js#L525-L544).
- Los cinco grupos de zonificación ya tienen nombres. [Datos de zonificación](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/data/zonificacion_aizal.json).
- Se incorporaron pronóstico Meteomatics y opciones de idioma. Esto suma valor, pero el pronóstico y los datos de hackathon necesitan una operación sostenible para un servicio permanente.

## 2. Sugerencias de la minuta, contrastadas con la app

| ID | Necesidad recogida en la minuta | Situación actual comprobada | Trabajo para un producto | Prioridad propuesta |
|---|---|---|---|---|
| **M-01** | Cruzar historia del lote, satélite, dron y observaciones del asesor. | Hay datos históricos **por zona** y algunas lecturas del kit; no hay ficha ni historial de lote, carga de vuelo ni observación profesional asociada a un polígono. | Crear expediente de lote y campaña con fuentes fechadas y georreferenciadas. | **P0** |
| **M-02** | Comparar fechas y fuentes visualmente. | El visor permite comparar algunas capas Landsat de una zona. No equivale a comparar el mismo lote y sector entre vuelos, satélite y visitas. | Línea de tiempo por lote; vista lado a lado y control de opacidad; misma extensión y escala; variación por sector. | **P1** |
| **M-03** | Índices y mapas interpretables; mapas de calor y curvas de nivel cuando correspondan. | Hay NDVI, imágenes y zonificación regional. No hay procesamiento multiespectral de dron ni mapas de calor/curvas de nivel del lote como salidas verificadas. | Definir índices necesarios, procesamiento, leyendas, unidades, umbrales y resolución. Curvas de nivel solo con datos altimétricos aptos. | **P1** |
| **M-04** | Relieve o nivelación para manejo hídrico, si los datos alcanzan. | El relieve existe como insumo de modelos regionales, no como análisis de nivelación del campo. | Piloto de escurrimiento/anegamiento con elevación adecuada y verificación de terreno; decidir luego si se ofrece. | **P2 condicional** |
| **M-05** | Delimitar sectores y recomendar intervención localizada. | La app ordena rotaciones por zona; no delimita áreas de intervención dentro de un lote. | Polígonos de hallazgos, superficie, evidencia, prioridad y acción propuesta; aprobación del asesor antes de entregar. | **P0/P1** |
| **M-06** | Informe por lote que diga qué se detectó, dónde y qué hacer. | Hay reporte por zona y botón «Guardar PDF» que usa la impresión del navegador. No queda una versión de informe vinculada a un lote y campaña. | Informe con mapa, sectores, evidencia, incertidumbre, visita requerida, decisión aprobada y seguimiento. | **P0** |
| **M-07** | Circuito captura → procesamiento → interpretación → entrega. | Hay scripts y una demo, pero no un flujo operativo de servicio con estados y responsables. | Definir responsables, controles de calidad, revisión agronómica, plazo de entrega y soporte. | **P0** |
| **M-08** | Posible uso del mapa en maquinaria. | La minuta lo registra con menor certeza; no se verificó como requisito aprobado. | Confirmar equipos y formatos antes de diseñar exportaciones de prescripción. | **Decisión pendiente** |

**P0** = necesario para un piloto útil y honesto; **P1** = mejora central para vender y repetir el servicio; **P2** = extensión dependiente de datos y demanda.

## 3. Primera versión productiva recomendada

### Alcance

Empezar con **uno o pocos lotes piloto** en la región cubierta, con un productor y un asesor definidos. Para cada lote, admitir: límite geográfico, cultivo/campaña, prácticas e incidencias históricas disponibles, al menos dos observaciones satelitales comparables, un relevamiento de dron **si existe**, y observaciones de campo. La ausencia del dron no debe bloquear el expediente; debe quedar visible que esa fuente falta.

La salida inicial debe ser un **mapa de sectores para revisar**, con evidencia y una acción propuesta por el asesor. No prometer dosis automáticas de agroquímicos ni ahorros porcentuales hasta validar ambos con casos reales. La rotación regional actual puede quedar como contexto, claramente separada del diagnóstico del lote.

### Recorrido mínimo del usuario

1. **Alta del lote:** dibujar o importar su contorno; registrar titular autorizado, superficie, cultivo, campaña y asesor. Verificar que el polígono y la superficie coincidan con el campo.
2. **Carga de antecedentes:** fechas de siembra, cosecha, riego, aplicaciones, problemas observados, análisis de suelo y rendimiento si el productor los posee. Cada registro indica quién lo aportó y cuándo.
3. **Carga de mediciones:** imágenes satelitales, dron multiespectral y sensores con fecha, ubicación, unidad, método y calidad. Aceptar «sin dato» cuando corresponda.
4. **Exploración:** comparar la misma zona del lote entre fechas y fuentes; mostrar mapa, leyenda, resolución y una ficha sencilla de qué significa cada índice.
5. **Hallazgo:** delimitar sectores y registrar hipótesis, evidencia, nivel de confianza y qué comprobar en campo. Diferenciar claramente «anomalía detectada» de «causa confirmada».
6. **Revisión agronómica:** el asesor acepta, corrige o descarta el hallazgo y deja una acción concreta, su alcance y los riesgos de aplicarla.
7. **Entrega y seguimiento:** generar un informe versionado, compartirlo con permisos, registrar la intervención realizada y comparar el resultado con la línea de base.

## 4. Requisitos que faltan para sostener el servicio

### Datos y procesamiento

- **Modelo de datos por lote:** identificadores estables para productor, lote, sector, campaña, medición, vuelo, visita, hallazgo, recomendación e informe. Cada resultado debe guardar fuente, fecha de captura, fecha de procesamiento, geometría, resolución, método y versión del algoritmo.
- **Entradas geográficas:** definir formatos aceptados para contornos y capas (por ejemplo, GeoJSON para geometrías y GeoTIFF para rasters), sistemas de coordenadas, tamaños máximos y validación de archivos. Documentar qué formatos produce realmente el proveedor de dron antes de fijar la integración.
- **Calidad de imagen:** registrar nubosidad y huecos en satélite; georreferenciación, cobertura, calibración radiométrica y calidad del mosaico en dron. Señalar cuando dos fechas o fuentes no son comparables por estación, escala o procesamiento.
- **Índices:** elegir pocos indicadores para la primera versión y explicar qué detectan y qué no. Validar umbrales con observaciones de campo. No asignar una causa agronómica solo por un valor de NDVI.
- **Sensores:** probar el kit en hardware real, calibrar, documentar unidades y ubicación, y guardar lecturas con hora y estado de calidad. El [archivo de demostración sigue vacío](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/data/arduino_bandejas_demo.json); cualquier lectura de simulador debe quedar etiquetada como simulada.
- **Reproducibilidad:** conservar el dato fuente o su referencia verificable, parámetros de procesamiento y versión de cada mapa. Poder reconstruir un informe anterior.

### Agronomía y validación

- Validar con productores o asesores las rotaciones de las zonas 1 a 4; hoy figuran [sin validar](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/data/rotaciones_santiago.json). Confirmar condiciones como disponibilidad de hacienda, riego, maquinaria y mercado antes de presentarlas como alternativas aplicables.
- Hacer visitas o muestreos de referencia sobre sectores con y sin alerta. Medir falsos positivos, falsos negativos y utilidad de cada mapa; publicar esos resultados junto con las limitaciones.
- Tratar el modelo de desmonte como contexto comparativo regional. Su [AUC de prueba temporal ronda 0,63](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/docs/datos-y-metodos.md#modelo-predictivo); no usar su probabilidad como predicción precisa de un lote ni como fundamento único de una intervención.
- Revisar el semáforo: la resta lluvia − ET0 es una estimación climática de referencia, no la demanda hídrica de un cultivo concreto ni el agua disponible en el perfil. Mostrar esa distinción en el resultado principal. [Regla actual](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/web/app.js#L852-L854).

### Aplicación y operación

- **Persistencia y acceso:** la web estática actual puede seguir como demo pública. Un expediente de lotes requiere almacenamiento, control de acceso por productor/asesor, copias de seguridad, historial de cambios y recuperación. Definir quién puede ver un lote y quién puede aprobar una recomendación.
- **Compartir un resultado fiel:** el botón actual comparte [la URL genérica del reporte](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/web/app.js#L869-L876); las respuestas personales se leen desde el navegador. Un informe productivo debe tener ID, versión y enlace autorizado para que destinatario y emisor vean la misma información.
- **Actualización y continuidad:** vigilar fecha, errores y vencimiento de cada fuente. Definir costo y alternativa para pronóstico, imágenes, procesamiento y almacenamiento. El proyecto ya contempla una advertencia de pronóstico vencido; hay que convertirla en monitoreo y soporte operacional.
- **Trabajo en campo:** comprobar conectividad real antes de anunciar uso sin internet. Si es requisito, definir qué datos se descargan, cómo se guardan observaciones sin señal y cómo se sincronizan sin perder cambios.
- **Privacidad y permisos:** obtener autorización para usar ubicación precisa, imágenes, datos productivos y testimonios; establecer retención, exportación y borrado. La documentación actual señala pendiente el permiso escrito para nombrar al productor entrevistado.
- **Credenciales:** rotar la contraseña de Meteomatics que la documentación reconoce en el historial de Git antes de operar el producto con terceros; mantener secretos fuera del repositorio y limitar su acceso. [Estado documentado](https://github.com/enzopazzelli/BioSat/blob/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/docs/estado-del-proyecto.md).

## 5. Diseño de la web y del informe

Estas recomendaciones provienen de la estructura de [HTML y CSS](https://github.com/enzopazzelli/BioSat/tree/bdb680a8c1bee6bdf0f3bc64a11ca9a61becd3ef/web); no sustituyen una prueba de usabilidad con productores.

- **Dos entradas claras:** «Explorar datos de mi zona» para la demo pública y «Abrir mi lote» para el servicio productivo. Así una estimación regional no parece una medición del campo.
- **Mapa como centro de trabajo:** contorno del lote siempre visible, selector de fecha y fuente, comparación lado a lado o con cortina, escala y leyenda persistentes. Mostrar la resolución de cada capa en el mismo lugar; evitar que una imagen de 30 m parezca una medición puntual.
- **Una ficha por hallazgo:** *qué se observa*, *dónde*, *cuándo*, *con qué dato*, *qué podría significar*, *qué comprobar* y *acción aprobada*. Un color solo nunca debe ser la conclusión.
- **Resumen ejecutivo antes del detalle:** tres hallazgos principales, superficie afectada y próximos pasos. El reporte técnico completo puede seguir en secciones plegables.
- **Botones según dispositivo:** en móvil, priorizar «Ver mapa», «Registrar observación» y «Compartir informe». Mostrar «Conectar sonda USB» únicamente cuando el navegador y el hardware lo permitan.
- **Confianza visible:** junto a cada número o mapa, indicar fuente, fecha, cobertura del dato y si es observado, estimado, inferido o propuesto por el asesor.
- **Accesibilidad y campo:** etiquetas legibles a la luz del sol, contraste suficiente, estados expresados también con texto e iconos, controles táctiles amplios y exportación PDF que conserve mapas, leyendas y fuentes.

## 6. Orden de trabajo y criterios de salida

| Etapa | Entregable | Criterio para considerarla terminada |
|---|---|---|
| **0. Delimitar el producto** | Usuario objetivo, alcance del piloto, roles y datos disponibles de lotes reales. | Productor, asesor y operador del dron acuerdan qué decisión se intentará mejorar y qué información pueden aportar. |
| **1. Expediente por lote (P0)** | Alta de lote, campaña, antecedentes, fuentes y observaciones. | Se puede abrir el mismo lote en otra sesión y reconstruir la procedencia de todos sus datos. |
| **2. Hallazgo e informe (P0)** | Sectores dibujados, revisión profesional e informe versionado. | Un productor puede ubicar el sector, entender la evidencia y saber qué revisar o hacer; un asesor puede aprobar o rechazar la propuesta. |
| **3. Comparación e índices (P1)** | Línea de tiempo, satélite/dron, índices seleccionados y control de calidad. | Una comparación conserva misma geometría, fechas y escala visibles; las capas no comparables se advierten. |
| **4. Piloto medido (P1)** | Casos reales con seguimiento de intervenciones. | Se registran alertas acertadas y erradas, tiempo de entrega, superficie revisada/tratada y resultado posterior. |
| **5. Extensiones (P2)** | Relieve hídrico, automatización y eventual exportación a maquinaria. | Se incorporan solo después de demostrar calidad de datos, utilidad y compatibilidad requerida. |

### Indicadores del piloto

Medir, por lote y campaña: porcentaje de hallazgos confirmados en campo; tiempo desde captura hasta informe; porcentaje de informes que terminan en una decisión documentada; superficie inspeccionada y tratada; insumos, agua, combustible y pasadas antes/después cuando exista una comparación válida; satisfacción y repetición de uso de productor y asesor. **No prometer porcentajes de ahorro** a partir de la minuta: establecer una línea de base y calcularlos sobre casos reales.

## 7. Decisiones que debe tomar el equipo antes de desarrollar más

1. **Cliente y decisión principal:** ¿se vende como apoyo al productor, herramienta del asesor, servicio de monitoreo con dron o combinación? ¿Cuál es la primera decisión concreta que mejora?
2. **Lote piloto y datos:** ¿qué productor autoriza el uso de su información y qué campañas, vuelos, sensores y verificaciones de campo existen realmente?
3. **Responsabilidad profesional:** ¿quién firma o aprueba una recomendación localizada y cuáles resultados quedan como «sector para revisar»?
4. **Dron:** ¿quién vuela y procesa, qué cámara y productos entrega, con qué frecuencia y costo? ¿Qué formatos y precisión son posibles?
5. **M-08 maquinaria:** confirmar si se quiere exportar prescripción, a qué equipos y en qué formatos. Mantener fuera del alcance inicial hasta obtener esa respuesta.
6. **Servicio:** definir precio o costo piloto, tiempo de respuesta, soporte, permisos de datos y continuidad de las fuentes externas.

## 8. Límite de esta evaluación

La minuta resume audios e indica que algunas interpretaciones son inciertas; por eso este documento **no atribuye prioridades, acuerdos ni compromisos de entrega al experto**. La auditoría se basó en el repositorio y su documentación al commit citado. No se ejecutó un vuelo, no se calibró el kit físico, no se validaron las recomendaciones en campo y no se verificó visualmente la web publicada en un navegador durante esta revisión. Esas pruebas forman parte de la etapa piloto.
