# Kit Arduino (archivado el 15/11/2026, D-44)

El equipo dejó el kit Arduino y trabaja con imágenes de dron. Desde D-44, **el dato de hoy del lote sale del vuelo del dron** (tarjeta "Tu lote, desde el dron" en el Inicio). La app ya no carga, no enlaza ni muestra nada del kit. Todo lo que se hizo para el kit quedó acá, sin borrar, por si se retoma.

Por qué se archivó (bitácora, D-43 y D-44): el programa corría en la placa, pero el DHT11 daba `null`, el LCD no prendía y la conexión con la app nunca anduvo. No hay lecturas reales grabadas.

## Qué hay

| Carpeta | Qué es | Dónde estaba |
|---|---|---|
| `arduino/` | Programas del Uno (`biosat_estacion_campo`, `biosat_estacion_humedad_suelo`), del ESP32 en MicroPython (`biosat_estacion_esp32`, sin probar en una placa) y en C++ (`biosat_esp32_servidor`, paso 1, sin compilar), el lector Web Serial, el esquema de conexiones y las guías de armado | `arduino/` |
| `web/` | Pantalla del kit para el jurado (`kit.html`, `kit.js`, `kit.css`, `kit-logica.js`) y la guía "Del kit al campo" (`campo.html`, `campo.css`) | `web/` |
| `data/` | `arduino_bandejas_demo.json`: plantilla de las lecturas grabadas (vacía, nunca se cargaron lecturas) | `data/` |
| `tests/` | Pruebas del kit: pines, lógica de la pantalla, lector serial, cuentas del ESP32 y la de D-43 (kit oculto) | `tests/` |

## Si se retoma

- **Las rutas internas quedaron como estaban.** Las páginas y las pruebas de acá apuntan a `../arduino/`, `../web/` y `../data/`. Para usarlas hay que devolverlas a su lugar o corregir esas rutas. No corren solas desde el archivo, y `node --test "tests/*.test.js"` ya no las incluye.
- **Lo que se sacó de la app**, para volver a ponerlo (todo está en el historial de git, antes del commit de D-44):
  - `web/app.js`: la carga de `arduino_bandejas_demo.json`, el panel del sensor (`renderPaneles`), `botonArduino`, `medirConSonda` y la conclusión 5 del Reporte;
  - `web/inicio-logica.js`: `semaforoSonda` y los textos de la sonda;
  - `web/pronostico-logica.js`: `maximaDeHoy` y `kitHoy` (la máxima de hoy de Meteomatics que mostraba la pantalla del kit);
  - `web/index.html` y `web/completo.html`: el `<script>` del lector, el botón "Medir con la sonda", la sección 5 del Reporte y el panel del sensor;
  - `web/textos-en.js`: el inglés de todo lo anterior;
  - `web/estilos.css`: los estilos del panel del sensor (`.trays`, `.read`, `.semaforo`, `.luces`, `.vs`, `.kit-links`, `.btn-off`, `.panel-sensor`).
- **Pendientes que tenía el kit** (bitácora, D-32 a D-43): el DHT11 en `null`, el LCD que no prendía, calibrar el sensor de humedad y el umbral de salitre, el driver CP2102 del ESP32 y la velocidad del lector (9600 contra los 115200 de MicroPython).
- El contrato de la línea JSON del kit sigue escrito en `docs/contratos-de-datos.md` §6, marcado como archivado.
