/* BioSat · estación de campo para la mesa del jurado (Arduino Uno R3).
 *
 * Cada 2 segundos manda por USB (9600 baudios) una línea JSON, como pide
 * docs/contratos-de-datos.md §6:
 *   {"t":12345,"agua_raw":512,"temp_suelo_c":41.2,"temp_aire_c":33.0,"hum_aire_pct":28,"luz_raw":870,"semaforo":"rojo"}
 * y muestra lo mismo en el LCD y en 3 LEDs. Si un sensor falla manda null.
 *
 * Conexiones: arduino/esquema/tabla-de-conexiones.md (se genera desde arduino/esquema/pines.json;
 * una prueba revisa que los #define de abajo coincidan con esa tabla).
 * Librerías: "DHT sensor library" y "Adafruit Unified Sensor" (Gestor de bibliotecas).
 * El LCD usa LiquidCrystal, que ya viene con el IDE.
 */
#include <DHT.h>
#include <LiquidCrystal.h>

// ------------------------------------------------------------------ Pines
#define PIN_DHT 2
#define PIN_LED_VERDE 3
#define PIN_LED_AMARILLO 4
#define PIN_LED_ROJO 5
#define PIN_BUZZER 6
#define PIN_LCD_D7 7
#define PIN_LCD_D6 8
#define PIN_LCD_D5 9
#define PIN_LCD_D4 10
#define PIN_LCD_E 11
#define PIN_LCD_RS 12
#define PIN_AGUA A0
#define PIN_LM35 A1
#define PIN_LDR A2
#define PIN_SONDA_VCC A3

// ------------------------------------------------------- Calibración (editar acá)
const unsigned long INTERVALO_MS = 2000;     // una lectura cada 2 s (el DHT11 no da más de 1 por segundo)

// LM35: 10 mV por °C. Con la referencia interna del Uno (1,1 V) cada paso del conversor vale
// 0,1 °C; con la de 5 V valdría 0,5 °C. La referencia real varía hasta ±10 % entre placas:
// se corrige con la ganancia. Calibración de 2 puntos contra un termómetro bueno:
//   ganancia = (T2_real - T1_real) / (T2_leida - T1_leida)
//   offset   = T1_real - T1_leida * ganancia
const float LM35_REFERENCIA_V = 1.1;
const float LM35_GANANCIA = 1.0;
const float LM35_OFFSET_C = 0.0;

// Semáforo del suelo (se ajustan con las bandejas reales).
const float SUELO_ROJO_C = 45.0;             // desde acá, el suelo está en rojo
const float SUELO_AMARILLO_C = 35.0;         // desde acá, amarillo
const int SALITRE_AGUA_RAW = 700;            // conductividad muy alta: avisa posible salitre (0 a 1023)
                                             // El mismo número va en data/arduino_bandejas_demo.json
                                             // → meta.umbrales.conductividad_salitre_raw
const bool BUZZER_ACTIVO = true;

// ------------------------------------------------------------------ Objetos
DHT dht(PIN_DHT, DHT11);
LiquidCrystal lcd(PIN_LCD_RS, PIN_LCD_E, PIN_LCD_D4, PIN_LCD_D5, PIN_LCD_D6, PIN_LCD_D7);

enum Semaforo { VERDE, AMARILLO, ROJO };
const char* const NOMBRE_SEMAFORO[] = {"verde", "amarillo", "rojo"};
const char* const SIGLA_SEMAFORO[] = {"VER", "AMA", "ROJ"};
Semaforo semaforoAnterior = VERDE;

// ------------------------------------------------------------------ Lecturas
// Promedio de n lecturas: baja el ruido del conversor.
int promediar(uint8_t pin, uint8_t n) {
  long suma = 0;
  for (uint8_t i = 0; i < n; i++) {
    suma += analogRead(pin);
    delay(2);
  }
  return (int)(suma / n);
}

// Temperatura del suelo con el LM35. Devuelve NAN si la lectura no es creíble.
float leerSueloC() {
  analogReference(INTERNAL);                 // 1,1 V: 0,1 °C por paso. El pin AREF no se conecta a nada.
  for (uint8_t i = 0; i < 3; i++) { analogRead(PIN_LM35); delay(5); }   // las primeras lecturas tras cambiar la referencia salen mal
  int crudo = promediar(PIN_LM35, 16);
  analogReference(DEFAULT);                  // el resto de los sensores se mide contra 5 V
  for (uint8_t i = 0; i < 3; i++) { analogRead(PIN_AGUA); delay(5); }
  if (crudo >= 1020) return NAN;             // saturado (más de ~109 °C): sensor mal conectado
  float grados = crudo * (LM35_REFERENCIA_V / 1023.0) * 100.0;
  grados = grados * LM35_GANANCIA + LM35_OFFSET_C;
  if (grados < -5.0 || grados > 105.0) return NAN;
  return grados;
}

// Humedad y conductividad. Las pistas se alimentan solo al medir: encendidas todo el tiempo
// se corroen en pocas horas y la lectura se desvía.
int leerAgua() {
  digitalWrite(PIN_SONDA_VCC, HIGH);
  delay(30);
  int crudo = promediar(PIN_AGUA, 8);
  digitalWrite(PIN_SONDA_VCC, LOW);
  return crudo;
}

int leerLuz() {
  return promediar(PIN_LDR, 8);
}

Semaforo calcularSemaforo(float sueloC, int agua) {
  if (isnan(sueloC)) return AMARILLO;        // sin temperatura no se puede decir "verde"
  if (sueloC >= SUELO_ROJO_C) return ROJO;
  if (sueloC >= SUELO_AMARILLO_C || agua >= SALITRE_AGUA_RAW) return AMARILLO;
  return VERDE;
}

// ------------------------------------------------------------------ Salidas
void imprimirNumero(float v, uint8_t decimales) {
  if (isnan(v)) Serial.print(F("null"));
  else Serial.print(v, decimales);
}

void mandarLinea(int agua, float sueloC, float aireC, float humedad, int luz, Semaforo s) {
  Serial.print(F("{\"t\":"));            Serial.print(millis());
  Serial.print(F(",\"agua_raw\":"));     Serial.print(agua);
  Serial.print(F(",\"temp_suelo_c\":")); imprimirNumero(sueloC, 1);
  Serial.print(F(",\"temp_aire_c\":"));  imprimirNumero(aireC, 1);
  Serial.print(F(",\"hum_aire_pct\":")); imprimirNumero(humedad, 0);
  Serial.print(F(",\"luz_raw\":"));      Serial.print(luz);
  Serial.print(F(",\"semaforo\":\""));   Serial.print(NOMBRE_SEMAFORO[s]);
  Serial.println(F("\"}"));
}

void formatear(char* destino, float v, uint8_t ancho) {   // " 52.0" o " --.-"
  if (isnan(v)) {
    for (uint8_t i = 0; i < ancho; i++) destino[i] = (i == ancho - 3) ? '.' : '-';
    destino[ancho] = '\0';
  } else {
    dtostrf(v, ancho, 1, destino);
  }
}

void mostrarLCD(int agua, float sueloC, float aireC, int luz, Semaforo s) {
  char suelo[8], aire[8], linea[20];
  formatear(suelo, sueloC, 5);
  formatear(aire, aireC, 4);
  snprintf(linea, sizeof(linea), "S%sC A%sC", suelo, aire);        // S 52.0C A34.0C
  lcd.setCursor(0, 0); lcd.print(linea);
  snprintf(linea, sizeof(linea), "Ag%4dLz%4d %s", agua, luz, SIGLA_SEMAFORO[s]);
  lcd.setCursor(0, 1); lcd.print(linea);
}

void mostrarLeds(Semaforo s) {
  digitalWrite(PIN_LED_VERDE, s == VERDE);
  digitalWrite(PIN_LED_AMARILLO, s == AMARILLO);
  digitalWrite(PIN_LED_ROJO, s == ROJO);
}

// ------------------------------------------------------------------ Programa
void setup() {
  Serial.begin(9600);                        // el lector de la app (arduino/lector-web-serial.js) usa 9600
  pinMode(PIN_LED_VERDE, OUTPUT);
  pinMode(PIN_LED_AMARILLO, OUTPUT);
  pinMode(PIN_LED_ROJO, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_SONDA_VCC, OUTPUT);
  digitalWrite(PIN_SONDA_VCC, LOW);
  dht.begin();
  lcd.begin(16, 2);
  lcd.print(F("BioSat"));
  lcd.setCursor(0, 1); lcd.print(F("estacion de campo"));

  // Prueba de arranque: los 3 LEDs juntos un instante, para ver que todos están bien conectados.
  digitalWrite(PIN_LED_VERDE, HIGH); digitalWrite(PIN_LED_AMARILLO, HIGH); digitalWrite(PIN_LED_ROJO, HIGH);
  delay(600);
  mostrarLeds(VERDE);
  Serial.println(F("# BioSat estacion de campo v2"));   // el lector ignora lo que no empieza con {
}

void loop() {
  static unsigned long proxima = 0;
  if ((long)(millis() - proxima) < 0) return;
  proxima = millis() + INTERVALO_MS;

  float sueloC = leerSueloC();
  int agua = leerAgua();
  int luz = leerLuz();
  float aireC = dht.readTemperature();       // NAN si el DHT11 no contesta
  float humedad = dht.readHumidity();
  Semaforo s = calcularSemaforo(sueloC, agua);

  mandarLinea(agua, sueloC, aireC, humedad, luz, s);
  mostrarLCD(agua, sueloC, aireC, luz, s);
  mostrarLeds(s);
  if (BUZZER_ACTIVO && s == ROJO && semaforoAnterior != ROJO) tone(PIN_BUZZER, 2000, 150);   // suena solo al pasar a rojo
  semaforoAnterior = s;
}
