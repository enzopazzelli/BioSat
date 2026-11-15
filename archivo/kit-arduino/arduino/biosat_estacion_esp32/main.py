# BioSat · estación de campo con ESP32 y MicroPython.
# Hace lo mismo que el programa del Arduino Uno (arduino/biosat_estacion_humedad_suelo/): cada 2 segundos mide,
# muestra en el LCD y en 3 LEDs, y manda por USB una línea JSON con el formato de docs/contratos-de-datos.md §6:
#   {"t":12345,"agua_raw":512,"temp_suelo_c":41.2,"temp_aire_c":33.0,"hum_aire_pct":28,"luz_raw":870,"semaforo":"rojo"}
# Conexiones, cómo cargarlo y diferencias con el Uno: README.md de esta carpeta.
# Las cuentas (sin hardware) se prueban en la PC con: python -m pytest tests/test_esp32_micropython.py
import time

try:
    import machine  # noqa: F401  (solo existe en la placa)
    EN_LA_PLACA = True
except ImportError:  # en la PC, para las pruebas de las cuentas
    EN_LA_PLACA = False

# ------------------------------------------------------------------ Pines (GPIO del ESP32)
PIN_LM35 = 34         # ADC1, solo entrada. El LM35 se alimenta con 5 V (VIN): con 3,3 V no funciona
PIN_AGUA = 35         # ADC1, solo entrada. AO del sensor de humedad de tierra
PIN_LDR = 32          # ADC1. Nodo entre la fotoresistencia (a 3V3) y la de 10 kΩ (a GND)
PIN_SONDA_VCC = 33    # VCC del sensor de humedad: se prende solo al medir, así la horquilla no se corroe
PIN_DHT = 4
PIN_LED_VERDE = 25
PIN_LED_AMARILLO = 26
PIN_LED_ROJO = 27
PIN_BUZZER = 13
PIN_LCD_RS = 22
PIN_LCD_E = 23
PIN_LCD_D4 = 21
PIN_LCD_D5 = 19
PIN_LCD_D6 = 18
PIN_LCD_D7 = 17       # en un ESP32 WROVER (con PSRAM) el 17 no está libre: usar el 5

# ------------------------------------------------------------------ Calibración (editar acá)
INTERVALO_MS = 2000          # una lectura cada 2 s (el DHT11 no da más de 1 por segundo)
LM35_GANANCIA = 1.0          # calibración de 2 puntos, igual que en el Uno (guía, sección 7)
LM35_OFFSET_C = 0.0
SUELO_ROJO_C = 45.0
SUELO_AMARILLO_C = 35.0
SALITRE_AGUA_RAW = 700       # RECALIBRAR con las bandejas: la escala del ESP32 no es la del Uno
BUZZER_ACTIVO = True
USAR_LCD = True

LM35_SATURADO_UV = 1000000   # con la atenuación de 0 dB, el conversor llega a ~1 V (unos 100 °C)
CLAVES = ('t', 'agua_raw', 'temp_suelo_c', 'temp_aire_c', 'hum_aire_pct', 'luz_raw', 'semaforo')
SEMAFOROS = ('verde', 'amarillo', 'rojo')
SIGLAS = {'verde': 'VER', 'amarillo': 'AMA', 'rojo': 'ROJ'}


# ------------------------------------------------------------------ Cuentas (sin hardware, se prueban en la PC)
def a_10_bits(u16):
    """El ESP32 lee de 0 a 65535; la app espera de 0 a 1023, como el Uno."""
    return max(0, min(1023, int(u16) >> 6))


def grados_lm35(uv):
    """Microvoltios del LM35 a °C (10 mV por °C). None si la lectura no es creíble."""
    if uv is None or uv >= LM35_SATURADO_UV:
        return None
    grados = uv / 10000.0 * LM35_GANANCIA + LM35_OFFSET_C
    if grados < -5.0 or grados > 105.0:
        return None
    return grados


def agua_desde_crudo(crudo10):
    """El sensor resistivo da 1023 con la horquilla seca y baja al mojarse: se da vuelta, como en el Uno."""
    return 1023 - crudo10


def calcular_semaforo(suelo_c, agua):
    if suelo_c is None:
        return 'amarillo'            # sin temperatura no se puede decir "verde"
    if suelo_c >= SUELO_ROJO_C:
        return 'rojo'
    if suelo_c >= SUELO_AMARILLO_C or agua >= SALITRE_AGUA_RAW:
        return 'amarillo'
    return 'verde'


def _numero(v, decimales):
    return 'null' if v is None else ('%.' + str(decimales) + 'f') % v


def linea_json(t, agua, suelo_c, aire_c, humedad, luz, semaforo):
    return ('{"t":%d,"agua_raw":%d,"temp_suelo_c":%s,"temp_aire_c":%s,"hum_aire_pct":%s,"luz_raw":%d,"semaforo":"%s"}'
            % (t, agua, _numero(suelo_c, 1), _numero(aire_c, 1), _numero(humedad, 0), luz, semaforo))


def textos_lcd(agua, suelo_c, aire_c, luz, semaforo):
    """Las 2 filas de 16 letras: 'S 31.2C A30.0C' y 'Ag 512Lz 870 VER', como en el Uno."""
    suelo = ' --.-' if suelo_c is None else '%5.1f' % suelo_c
    aire = '--.-' if aire_c is None else '%4.1f' % aire_c
    fila1 = ('S%sC A%sC' % (suelo, aire))[:16]
    fila2 = ('Ag%4dLz%4d %s' % (agua, luz, SIGLAS[semaforo]))[:16]
    return fila1 + ' ' * (16 - len(fila1)), fila2 + ' ' * (16 - len(fila2))


# ------------------------------------------------------------------ LCD 16x2 en paralelo (4 bits), sin bibliotecas
class LCD:
    def __init__(self, rs, e, d4, d5, d6, d7):
        from machine import Pin
        self.rs = Pin(rs, Pin.OUT)
        self.e = Pin(e, Pin.OUT)
        self.d = [Pin(p, Pin.OUT) for p in (d4, d5, d6, d7)]
        self.rs.value(0)
        self.e.value(0)
        time.sleep_ms(50)
        for espera in (5, 1, 1):     # secuencia de arranque del controlador HD44780
            self._nibble(0x03)
            time.sleep_ms(espera)
        self._nibble(0x02)           # pasa a 4 bits
        time.sleep_ms(1)
        for c in (0x28, 0x0C, 0x06, 0x01):   # 2 filas, pantalla prendida, escribir a la derecha, borrar
            self.comando(c)

    def _nibble(self, n):
        for i, pin in enumerate(self.d):
            pin.value((n >> i) & 1)
        self.e.value(1)
        time.sleep_us(1)
        self.e.value(0)
        time.sleep_us(50)

    def _byte(self, b, rs):
        self.rs.value(rs)
        self._nibble(b >> 4)
        self._nibble(b & 0x0F)

    def comando(self, c):
        self._byte(c, 0)
        if c in (0x01, 0x02):
            time.sleep_ms(2)

    def escribir(self, fila, texto):
        self.comando(0x80 | (0x40 if fila else 0x00))
        for letra in texto[:16]:
            self._byte(ord(letra), 1)


# ------------------------------------------------------------------ Estación (con hardware)
class Estacion:
    def __init__(self):
        from machine import ADC, Pin
        import dht
        cero_db = ADC.ATTN_0DB
        once_db = getattr(ADC, 'ATTN_11DB', getattr(ADC, 'ATTN_12DB', 3))
        self.lm35 = ADC(Pin(PIN_LM35))
        self.lm35.atten(cero_db)                 # 0 a ~1 V: buena resolución para los 10 mV por °C
        self.agua = ADC(Pin(PIN_AGUA))
        self.agua.atten(once_db)                 # 0 a ~3,3 V
        self.ldr = ADC(Pin(PIN_LDR))
        self.ldr.atten(once_db)
        self.sonda_vcc = Pin(PIN_SONDA_VCC, Pin.OUT, value=0)
        self.dht = dht.DHT11(Pin(PIN_DHT))
        self.leds = {'verde': Pin(PIN_LED_VERDE, Pin.OUT), 'amarillo': Pin(PIN_LED_AMARILLO, Pin.OUT),
                     'rojo': Pin(PIN_LED_ROJO, Pin.OUT)}
        self.pin_buzzer = Pin(PIN_BUZZER, Pin.OUT, value=0)
        self.lcd = None
        if USAR_LCD:
            self.lcd = LCD(PIN_LCD_RS, PIN_LCD_E, PIN_LCD_D4, PIN_LCD_D5, PIN_LCD_D6, PIN_LCD_D7)
            self.lcd.escribir(0, 'BioSat          ')
            self.lcd.escribir(1, 'estacion ESP32  ')
        self.anterior = 'verde'

    def _promedio_u16(self, adc, n):
        suma = 0
        for _ in range(n):
            suma += adc.read_u16()
            time.sleep_ms(2)
        return suma // n

    def leer_suelo_c(self):
        try:
            suma = 0
            for _ in range(16):
                suma += self.lm35.read_uv()      # microvoltios, con la calibración de fábrica del ESP32
                time.sleep_ms(2)
            uv = suma // 16
        except AttributeError:                   # firmware viejo sin read_uv: aproximado (0 dB ≈ 1 V a fondo)
            uv = self._promedio_u16(self.lm35, 16) * 1000000 // 65535
        return grados_lm35(uv)

    def leer_agua(self):
        self.sonda_vcc.value(1)
        time.sleep_ms(50)
        crudo = a_10_bits(self._promedio_u16(self.agua, 8))
        self.sonda_vcc.value(0)
        return agua_desde_crudo(crudo)

    def leer_luz(self):
        return a_10_bits(self._promedio_u16(self.ldr, 8))

    def leer_aire(self):
        try:
            self.dht.measure()
            return float(self.dht.temperature()), float(self.dht.humidity())
        except OSError:                          # el DHT11 no contestó: null, como en el Uno
            return None, None

    def mostrar_leds(self, semaforo):
        for nombre, led in self.leds.items():
            led.value(1 if nombre == semaforo else 0)

    def pitar(self):
        from machine import PWM, Pin
        try:
            pwm = PWM(self.pin_buzzer, freq=2000, duty_u16=32768)
        except TypeError:                        # firmware viejo: duty de 0 a 1023
            pwm = PWM(self.pin_buzzer, freq=2000, duty=512)
        time.sleep_ms(150)
        pwm.deinit()
        self.pin_buzzer = Pin(PIN_BUZZER, Pin.OUT, value=0)

    def prueba_de_arranque(self):
        for led in self.leds.values():
            led.value(1)
        time.sleep_ms(600)
        self.mostrar_leds('verde')

    def medir_y_mandar(self):
        suelo = self.leer_suelo_c()
        agua = self.leer_agua()
        luz = self.leer_luz()
        aire, humedad = self.leer_aire()
        semaforo = calcular_semaforo(suelo, agua)
        print(linea_json(time.ticks_ms(), agua, suelo, aire, humedad, luz, semaforo))
        if self.lcd:
            fila1, fila2 = textos_lcd(agua, suelo, aire, luz, semaforo)
            self.lcd.escribir(0, fila1)
            self.lcd.escribir(1, fila2)
        self.mostrar_leds(semaforo)
        if BUZZER_ACTIVO and semaforo == 'rojo' and self.anterior != 'rojo':
            self.pitar()                         # suena solo al pasar a rojo
        self.anterior = semaforo


def main():
    estacion = Estacion()
    estacion.prueba_de_arranque()
    print('# BioSat estacion de campo ESP32 MicroPython v1')   # la app ignora lo que no empieza con {
    proxima = time.ticks_ms()
    while True:
        if time.ticks_diff(time.ticks_ms(), proxima) < 0:
            time.sleep_ms(20)
            continue
        proxima = time.ticks_add(time.ticks_ms(), INTERVALO_MS)
        estacion.medir_y_mandar()


if EN_LA_PLACA:
    main()
