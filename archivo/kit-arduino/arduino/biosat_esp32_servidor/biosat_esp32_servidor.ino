/* BioSat · ESP32 con servidor web · PASO 1: solo el servidor, todavía sin sensores.
 *
 * El ESP32 arma su propia red WiFi ("BioSat-Kit"). Con el celular o la compu conectados a esa red,
 * se abre http://192.168.4.1 y se ve una página con las lecturas, que se actualiza cada 2 segundos.
 * No depende del WiFi del lugar de la demo.
 *
 *   /          la página
 *   /lectura   la lectura en JSON, con las claves de docs/contratos-de-datos.md §6
 *
 * En este paso los sensores todavía no están: cada valor va en null y la página muestra "—".
 * Nunca se inventan números. Los sensores se suman de a uno en los próximos pasos.
 *
 * Placa: Herramientas → Placa → esp32 → "ESP32 Dev Module". Monitor serie a 115200.
 */
#include <WiFi.h>
#include <WebServer.h>

// ------------------------------------------------------------------ Red WiFi del kit (editar acá)
const char* RED = "BioSat-Kit";
const char* CLAVE = "biosat2026";   // al menos 8 letras. Es solo para la demo: cambiala si querés

WebServer servidor(80);

// ------------------------------------------------------------------ La página (se guarda en la memoria del ESP32)
const char PAGINA[] PROGMEM = R"html(<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BioSat · Kit de campo</title>
<style>
body{font-family:system-ui,sans-serif;margin:0;padding:16px;background:#f4f1ea;color:#1c2b22}
h1{font-size:22px;margin:0 0 4px}
.nota{font-size:14px;color:#4d5c52;margin:0 0 16px}
.grilla{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.dato{background:#fff;border-radius:12px;padding:12px;font-size:14px}
.dato b{display:block;font-size:26px;margin-top:4px}
#estado{margin-top:14px;font-size:14px}
</style></head><body>
<h1>BioSat · Kit de campo</h1>
<p class="nota">Paso 1: el servidor del ESP32 anda. Los sensores se suman en los próximos pasos; mientras tanto se ven como "—".</p>
<div class="grilla">
  <div class="dato">Temperatura del suelo<b id="temp_suelo_c">—</b></div>
  <div class="dato">Humedad del suelo (0 a 1023)<b id="agua_raw">—</b></div>
  <div class="dato">Luz al ras (0 a 1023)<b id="luz_raw">—</b></div>
  <div class="dato">Temperatura del aire<b id="temp_aire_c">—</b></div>
  <div class="dato">Humedad del aire<b id="hum_aire_pct">—</b></div>
  <div class="dato">Semáforo<b id="semaforo">—</b></div>
</div>
<p id="estado">Esperando la primera lectura…</p>
<script>
const UNIDADES = {temp_suelo_c: ' °C', agua_raw: '', luz_raw: '', temp_aire_c: ' °C', hum_aire_pct: ' %', semaforo: ''};
async function leer() {
  try {
    const r = await fetch('/lectura', {cache: 'no-store'});
    const d = await r.json();
    for (const k in UNIDADES) {
      const v = d[k];
      document.getElementById(k).textContent = (v === null || v === undefined) ? '—' : v + UNIDADES[k];
    }
    document.getElementById('estado').textContent = 'Conectado · el ESP32 lleva ' + Math.round(d.t / 1000) + ' s prendido';
  } catch (e) {
    document.getElementById('estado').textContent = 'Sin conexión con el ESP32';
  }
}
leer();
setInterval(leer, 2000);
</script>
</body></html>)html";

// ------------------------------------------------------------------ Respuestas
void enviarPagina() {
  servidor.send_P(200, "text/html; charset=utf-8", PAGINA);
}

void enviarLectura() {
  // Paso 1: sin sensores. Cada valor va en null, como pide el contrato cuando no hay dato.
  String json = "{\"t\":" + String(millis()) +
                ",\"agua_raw\":null,\"temp_suelo_c\":null,\"temp_aire_c\":null"
                ",\"hum_aire_pct\":null,\"luz_raw\":null,\"semaforo\":null}";
  servidor.sendHeader("Cache-Control", "no-store");
  servidor.send(200, "application/json", json);
}

void noEncontrado() {
  servidor.send(404, "text/plain; charset=utf-8", "No existe. Probá con / o con /lectura");
}

// ------------------------------------------------------------------ Programa
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("# BioSat ESP32 · paso 1: servidor web");

  WiFi.mode(WIFI_AP);
  if (!WiFi.softAP(RED, CLAVE)) {
    Serial.println("# No se pudo crear la red WiFi. ¿La clave tiene al menos 8 letras?");
    return;
  }
  Serial.print("# Red WiFi: ");
  Serial.print(RED);
  Serial.print("  · clave: ");
  Serial.println(CLAVE);
  Serial.print("# Conectate a esa red y abrí http://");
  Serial.println(WiFi.softAPIP());   // 192.168.4.1

  servidor.on("/", enviarPagina);
  servidor.on("/lectura", enviarLectura);
  servidor.onNotFound(noEncontrado);
  servidor.begin();
  Serial.println("# Servidor listo");
}

void loop() {
  servidor.handleClient();
}
