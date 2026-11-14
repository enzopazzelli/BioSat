# Diseño: guía "Del kit al campo"

**Fecha:** 14/11/2026 · **Responsable:** Enzo (`enzo-app`) · **Estado:** aprobado por Enzo (14/11)

## Para qué

Mostrarle al jurado, justo después de la demo de las bandejas, que BioSat se puede llevar a un campo real: unas pocas estaciones fijas que miden en tierra lo que el satélite no ve. Es corta y visual: se lee en menos de un minuto en la misma pantalla de la demo. **No es** un manual de instalación para el productor.

## Qué tiene que hacer

Una página `web/campo.html` de la app, con el tema de la app (claro u oscuro según el dispositivo), con:

1. **Título y frase de enlace:** "Del kit al campo". Lo que vieron en las bandejas, llevado a un campo de verdad.
2. **Diagrama del recorrido:**
   - Satélite (NASA POWER 50 km · Landsat 30 m).
   - 3 a 6 estaciones (suelo y aire cada 15-30 min).
   - Receptor en el casco (radio LoRa, 5-15 km en llano).
   - App BioSat ("tu lote contra tu zona").
3. **Los 5 pasos numerados:**
   1. Elegir los ambientes (loma, bajo, salitre, monte, agrícola; los marcan Landsat y AIZAL).
   2. Instalar las estaciones (una por ambiente y un par cubierto contra pelado).
   3. Conectarlas (LoRa al casco; Wi-Fi si están cerca).
   4. Calibrar (muestras de suelo y conductímetro al instalar).
   5. Mirar tu lote (alertas de calor, humedad y salitre junto al dato del satélite).
4. **Lo que hace falta por estación:**
   - ESP32 con LoRa;
   - sondas de temperatura del suelo a 5 y 20 cm;
   - sensor de humedad capacitivo;
   - sensor de aire y pluviómetro;
   - panel solar, batería, caja y poste.

   Costos aproximados: estación USD 150-400, receptor USD 200-500, **marcados "a confirmar"**.
5. **Lo que no reemplaza:** el análisis de suelo, la prueba de pala, el criterio del productor y la consulta al agrónomo.

**Botones para abrirla:**
- desde la pantalla del kit (`web/kit.html`);
- desde el panel del sensor de la app.

## Qué no hace

- No es un manual paso a paso con modelos de sensores ni diagramas de cableado.
- No muestra datos de estaciones reales (todavía no existen).

## Restricciones

- Funciona sin internet: no carga nada externo.
- Se lee de lejos: pocas palabras y letra grande.
- Los costos son estimaciones y se dicen así.

## Formas de construirlo

| Opción | A favor | En contra |
|---|---|---|
| **1. Página en la app `web/campo.html` (elegida)** | **Se muestra en vivo después de las bandejas; queda publicada; sirve para capturas del pitch** | **Una página más para Enzo** |
| 2. Infografía en `entrega/`, de Sara | No suma trabajo a Enzo | No queda en la app |
| 3. Documento en `docs/` | Lo más rápido | Poco visual para el jurado |

## Decisiones mías (aprobadas con el boceto)

- Tema de la app y botones desde la pantalla del kit y el panel del sensor.
- Contenido estático en el HTML, sin datos.
