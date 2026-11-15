# Estación de campo BioSat con ESP32 y MicroPython

[`main.py`](main.py) hace lo mismo que el programa del Arduino Uno con el sensor de humedad de tierra ([`../biosat_estacion_humedad_suelo/`](../biosat_estacion_humedad_suelo/)). Cada 2 segundos mide, muestra en el LCD y en 3 LEDs, y manda por USB la misma línea JSON ([`docs/contratos-de-datos.md`](../../docs/contratos-de-datos.md) §6):

```json
{"t":12345,"agua_raw":512,"temp_suelo_c":41.2,"temp_aire_c":33.0,"hum_aire_pct":28,"luz_raw":870,"semaforo":"rojo"}
```

**Estado (15/11):** escrito y con las cuentas probadas en la PC (`python -m pytest tests/test_esp32_micropython.py`). **Todavía no se probó en un ESP32 de verdad**, ni se compiló con el compilador de MicroPython.

## Diferencias con el Uno (lo importante)

- **El ESP32 trabaja a 3,3 V, no a 5 V.** Nada que mande 5 V puede ir a un pin del ESP32. Por eso el LCD lleva **RW a GND**: así nunca le manda nada de vuelta.
- **El LM35 necesita al menos 4 V.** Se alimenta del pin **VIN** (los 5 V del USB). Su salida es baja (10 mV por °C) y no le hace daño al ESP32.
- **El LCD se alimenta con 5 V** (VIN), con el contraste y la luz de fondo como en el Uno. Los datos salen a 3,3 V: la mayoría de los LCD 16x2 los leen bien.
- **El DHT11, la fotoresistencia y el sensor de humedad van a 3,3 V** (pin **3V3**), no a 5 V.
- **La escala:** el ESP32 lee de 0 a 65535 y el programa la pasa a 0–1023, para que `agua_raw` y `luz_raw` signifiquen lo mismo que en el Uno. Igual, **el umbral de salitre hay que recalibrarlo**, porque el sensor trabaja con otra tensión.
- **La velocidad del USB:** MicroPython habla a **115200**, y el lector de la app (`arduino/lector-web-serial.js`) abre el puerto a **9600**. Para leer el ESP32 desde la app hay que sumarle al lector la opción de 115200. Hoy no hace falta, porque la app no muestra el kit (D-43).

## Conexiones

Los números son los GPIO. En la placa pueden estar rotulados como `D25`, `G25`, `IO25` o solo `25`.

| Pieza | Pin de la pieza | Va a |
|---|---|---|
| **LM35** | +Vs | **VIN (5 V)** |
| | OUT | **GPIO 34** |
| | GND | GND |
| **Sensor de humedad** (módulo) | VCC | **GPIO 33** (se prende solo al medir) |
| | AO | **GPIO 35** |
| | GND | GND |
| | DO | sin conectar |
| **Fotoresistencia** | un lado | **3V3** |
| | el otro lado (nodo) | **GPIO 32**, y una resistencia de **10 kΩ** del nodo a GND |
| **DHT11** (módulo) | + | **3V3** |
| | S (DATA) | **GPIO 4** |
| | − | GND |
| **LED verde / amarillo / rojo** | pata larga (+) | **GPIO 25 / 26 / 27** |
| | pata corta (−) | por una resistencia de 220 Ω a GND |
| **Buzzer** | (+) | **GPIO 13** |
| | (−) | GND |
| **LCD 16x2** | 1 VSS, 5 RW, 16 K | GND |
| | 2 VDD | **VIN (5 V)** |
| | 3 V0 | cursor del potenciómetro (sus extremos a VIN y GND) |
| | 15 A (luz) | VIN por una resistencia de 220 Ω |
| | 4 RS / 6 E | **GPIO 22 / 23** |
| | 11 D4 / 12 D5 / 13 D6 / 14 D7 | **GPIO 21 / 19 / 18 / 17** |

- **Pines que se evitan a propósito:** 0, 2, 5, 12 y 15 (deciden cómo arranca la placa), 1 y 3 (el USB), 6 a 11 (la memoria) y 34 a 39 como salidas (son solo de entrada).
- **Si la placa es un ESP32 WROVER** (con PSRAM), el GPIO 17 no está libre: pasar D7 al **GPIO 5** y cambiar `PIN_LCD_D7` en `main.py`.
- **Los sensores analógicos usan el ADC1** (GPIO 32 a 39), que sigue andando si algún día se prende el wifi.

## Cargarlo con Thonny (lo más simple)

1. Instalar [Thonny](https://thonny.org) y enchufar el ESP32 por USB.
2. **Instalar MicroPython en la placa** (una sola vez): **Herramientas → Opciones → Intérprete**, elegir **MicroPython (ESP32)** y el puerto, y **Instalar o actualizar MicroPython**. Elegir la familia **ESP32** y la variante **Espressif · ESP32 / WROOM** (o la que corresponda).
3. Abrir `arduino/biosat_estacion_esp32/main.py` y **Archivo → Guardar como → Dispositivo MicroPython**, con el nombre **`main.py`**.
4. Apretar el botón **EN** (reset) de la placa. En la consola de Thonny tiene que aparecer una línea JSON cada 2 segundos.
5. **Para cambiar el programa,** apretar **Detener** en Thonny: corta el programa y deja editar.

**Verificar:** al arrancar se prenden los 3 LEDs 0,6 s, el LCD muestra "BioSat" y después las lecturas, y con la horquilla al aire `agua_raw` da cerca de 0.

## Si algo no anda

| Síntoma | Qué mirar |
|---|---|
| Thonny no encuentra la placa | Cable USB de datos (no solo de carga). Algunos ESP32 necesitan el driver CP210x o CH340 |
| `temp_suelo_c` en `null` o muy bajo | El LM35 tiene que ir a **VIN**, no a 3V3. Con la cara plana hacia vos: +Vs, OUT, GND |
| `temp_aire_c` en `null` | DHT11 a **3V3** y S en el GPIO 4. Mismos pasos que en la guía del Uno (sección 9.1) |
| El LCD no prende | Igual que en el Uno (guía, sección 9.2), pero con VDD y la luz de fondo en **VIN** |
| `agua_raw` siempre cerca de 0 | VCC del módulo en el **GPIO 33** y AO en el **35** |
| `ImportError: no module named 'dht'` | El firmware no es el de ESP32: reinstalarlo (paso 2) |

El resto (calibrar con las bandejas, la lámpara y el semáforo) es igual que con el Uno: [`../GUIA-PROTOBOARD-HUMEDAD-SUELO.md`](../GUIA-PROTOBOARD-HUMEDAD-SUELO.md), secciones 6 y 7. Los valores de calibración están al principio de `main.py`.
