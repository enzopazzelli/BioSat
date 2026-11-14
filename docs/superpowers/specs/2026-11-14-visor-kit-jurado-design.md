# Diseño: pantalla del kit para la mesa del jurado

**Fecha:** 14/11/2026 · **Responsable:** Enzo (`enzo-app`) · **Estado:** para aprobar

## Para qué

Durante los ~10 minutos frente al jurado, la app de BioSat se muestra en una pantalla y el kit Arduino, con las 3 bandejas, queda en una mesa al lado, conectado a la PC por USB.

Mientras alguien pasa los sensores de bandeja en bandeja, esta pantalla muestra en vivo lo que miden. Tiene que leerse de lejos y dejar dos ideas:

1. **El suelo pelado se calienta y se seca mucho más que el cubierto.**
2. **Eso no se ve desde el satélite**, que mide el aire en celdas de 50 km. Es la respuesta al punto del desafío sobre satélite contra medición en tierra.

## Qué tiene que hacer

- **Página propia a pantalla completa:** `web/kit.html`, que se abre desde un botón "Pantalla del kit" en el panel del sensor de la app. Recibe la zona elegida (`?zona=...`).
- **Diseño "las 3 bandejas lado a lado"** (opción A de los bocetos):
  - **Tarjetas:** una por bandeja (A pelada y seca, B salitrosa, C con rastrojo), con la temperatura del suelo en grande, humedad y conductividad, luz y semáforo.
  - **Franja de abajo:** lo que dice NASA POWER para la zona, con la máxima media del aire del mes actual, normal 1991-2020, según `data/clima_zonas.json`.
  - **Al final:** una frase de cierre en grande, por ejemplo *"El suelo pelado está 19 °C más caliente que el cubierto. El satélite no lo ve: mide el aire de 50 km."*
- **Elegir bandeja desde la PC:** teclas **A**, **B** y **C**, y también botones en pantalla.
  - Al elegir una, esa tarjeta pasa a "en vivo".
  - Cuando la lectura se estabiliza, queda **guardada sola**.
  - Volver a elegir la misma bandeja la mide de nuevo. **R** reinicia todo.
- **Datos en vivo:**
  - **Con Arduino:** usa el lector de Sara (`window.BioSatArduino`, contratos §6) con un botón "Conectar Arduino".
  - **Sin Arduino o sin lector:** muestra las lecturas grabadas de `data/arduino_bandejas_demo.json` y avisa que son grabadas.
  - **Sin ninguna de las dos:** muestra "sin lectura" (nunca valores de ejemplo).

## Qué no hace

- No cambia el hardware ni el contrato del Arduino: no hay botones en el kit ni campo `"bandeja"` en la línea JSON.
- No muestra gráficos de historia ni permite editar umbrales desde la pantalla.
- No usa el ESP32 ni Wi-Fi: Arduino Uno por cable USB.

## Qué la haría fallar aunque funcione

- Mostrar números inventados como si fueran medidos.
- Necesitar internet: tiene que funcionar con lo que hay en `web/vendor/` y `data/`.
- Letra chica: tiene que leerse desde unos metros.

## Restricciones

- **El LM35 tarda un par de minutos en estabilizarse** en la tierra, así que la pantalla muestra una barrita de "estabilizando" hasta que la lectura se calma.
- **Preparación de la demo (Sara):** las 3 bandejas a la misma temperatura no muestran diferencia. Hay que calentarlas con una lámpara desde antes de que llegue el jurado.
- **Navegador:** Web Serial funciona solo en Chrome o Edge.

## Formas de construirlo

| Opción | A favor | En contra |
|---|---|---|
| 1. `arduino/visor.html`, de Sara | Trabajo en paralelo; queda junto al sketch y la calibración | Repite estilos de la app |
| **2. `web/kit.html`, de Enzo (elegida)** | **Comparte estilos y código con la app; queda más prolija** | **Suma trabajo a Enzo; Sara depende de él para ajustes** |
| 3. "Modo jurado" dentro de la app | Lo más integrado | Engorda `app.js` y genera choques si dos lo tocan |

**Elegida por Enzo: la 2.**

## Lo que decidió Enzo

- Diseño A (3 bandejas lado a lado).
- Elegir bandeja con teclas A, B y C, y con botones en pantalla.
- Página `web/kit.html`, construida por Enzo.

## Decisiones mías (para revisar)

- **Guardado:** guarda sola al estabilizarse; volver a elegir la bandeja vuelve a medir; **R** reinicia.
- **Lectura estable:** la temperatura del suelo cambia menos de 0,3 °C en los últimos 10 segundos (5 líneas del Arduino). El umbral se ajusta al calibrar.
- **Frase de cierre:** compara la temperatura del suelo de A (pelada) con la de C (rastrojo). Si B superó el umbral de conductividad, suma "posible salitre". El umbral sale de `meta.umbrales` de las lecturas grabadas; si no está, de un valor por defecto que se ajusta al calibrar.
- **Aspecto:** un solo tema oscuro de alto contraste, pensado para proyector o TV, con los colores y las tipografías de la app.
- **Pantalla completa:** botón y tecla **F**.

## Lo que queda para quien la construye

- Tamaños exactos de letra y detalles visuales.
- Cómo se reparte el código (por ejemplo, `web/kit.js` aparte).
- Qué se reutiliza de `app.js` y de `estilos.css`.
