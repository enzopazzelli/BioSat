# Diseño: Inicio en la PC y pronóstico de Meteomatics en la app (D-34)

**Fecha:** domingo 15/11/2026, 11:00 · **Pedido de Enzo** · **Tamaño:** cambio chico, en dos partes. Va antes del congelamiento (15:00).

## Por qué

- **Inicio en la PC:** "cuando abro la app desde el navegador de la PC se ve la vista del celular pero con bordes". Enzo quiere un cambio mínimo para que en la compu se note la diferencia. El Inicio tiene un ancho máximo de 560 px en cualquier pantalla (`web/estilos.css:362`).
- **Meteomatics:** "da info valiosa". La app muestra lo **típico** de cada mes (NASA POWER), pero no lo que viene **esta semana**. Ejemplo: en la Zona 2, el semáforo dice "faltan unos 110 mm de agua", y el pronóstico bajado el 14/11 anunciaba 136 mm de lluvia para el 15/11 y hojas mojadas en 6 de los 7 días. El pronóstico ya está en `data/meteomatics_santiago_zonas.json` (Santi, 14/11), pero la app nunca lo lee.

## Objetivos

1. En pantallas de 1024 px o más, el Inicio se ve como una pantalla de compu: dos columnas, sin la franja del celular con bordes.
2. El productor ve en el Inicio y en el Reporte qué viene en los próximos días en su zona.
3. El pronóstico de la app publicada se renueva solo, todos los días, sin exponer la contraseña.

## Lo que no se hace (no-objetivos)

- El semáforo **no** usa el pronóstico: sigue mostrando lo típico del mes (D-31). Cambiar su lógica a horas del congelamiento es riesgoso.
- La vista detallada (`web/completo.html`) no suma la tarjeta.
- La app no llama a la API de Meteomatics desde el navegador.

## Lo que haría fallar el trabajo aunque funcione (anti-objetivos)

- Mostrar un pronóstico vencido como si fuera actual. Va contra D-33: "que la app no muestre cosas falsas".
- Que la contraseña de Meteomatics llegue al navegador o al repo.
- Que cambie cómo se ve en el celular (390 px), salvo la tarjeta nueva.

## Restricciones

- La app es estática (GitHub Pages) y tiene que andar sin internet.
- Hay que usar JavaScript sin dependencias y lógica pura con pruebas `node --test`, como en `inicio-logica.js`.
- La contraseña solo vive en una variable de entorno (D-29).

## Formas consideradas

- **Inicio en la PC:**
  - **(1, elegida)** Dos columnas desde 1024 px, solo con CSS.
  - (2) Una sola columna más ancha, de unos 760 px. Se descartó porque sigue pareciendo un celular estirado.
  - (3) Abrir el Reporte directo en la PC. Se descartó porque cambia el recorrido de D-31.
- **Meteomatics:**
  - **(1 y 2, elegidas)** Tarjeta "Esta semana en tu zona" con su vencimiento y actualización diaria con GitHub Actions.
  - (3, si sobra tiempo) Una línea "hoy, a 9 km" en la pantalla del kit, como escalón de la escalera de escalas.
  - (Descartada hoy) Que el semáforo use el pronóstico.

## Diseño

### A. Inicio en dos columnas (desde 1024 px)

- `#vista-inicio` pasa a ser una grilla de 2 columnas iguales:
  - **izquierda:** `.ini-banda` a toda la altura, con el color del semáforo;
  - **derecha:** `.ini-cuerpo` arriba y `.ini-barra` abajo.
- En cada columna, el contenido queda centrado con el ancho actual (`.ini-wrap`, 560 px).
- En la PC, la barra deja de estar pegada abajo (`position: static`) y pierde el borde superior: los botones quedan debajo de lo que mejor encaja.
- Por debajo de 1024 px no cambia nada.

```
┌──────────────────────────┬──────────────────────────────────┐
│ ZONA 2           Cambiar │ LO QUE MEJOR ENCAJA              │
│ Secano agrícola del este │ Colchón de rastrojo: Soja + …    │
│ ⚠ CUIDADO                │ [Próxima siembra] [Meses pelado] │
│ Faltan unos 110 mm…      │ [ tira de 12 meses             ] │
│ [Conviene mantener…]     │ [ Esta semana en tu zona       ] │
│  (fondo del semáforo)    │ [Medir con la sonda] [WhatsApp]  │
└──────────────────────────┴──────────────────────────────────┘
```

### B. Tarjeta "Esta semana en tu zona"

- **Datos:** `data/meteomatics_santiago_zonas.json`, buscando la zona por `id` (los ids son los mismos de la app).
- **Lógica pura** en `web/pronostico-logica.js`, con pruebas en `tests/pronostico-logica.test.js`. Recibe los días del pronóstico y la fecha de hoy, y devuelve:
  - **los días vigentes:** desde hoy (fecha local) en adelante. Los días que ya pasaron no se cuentan;
  - **el resumen:**
    - lluvia total y el día de más lluvia;
    - días con máxima de más de 38 °C;
    - días con alerta de helada (`frost_warning_24h = 1`);
    - días con hoja mojada (`leaf_wetness = 1`);
    - días con viento de menos de 15 km/h, para pulverizar (`wind_speed_10m` viene en m/s y se pasa a km/h);
  - **si está vencido:** cuando no queda ningún día vigente.

  Los umbrales de 38 °C y 15 km/h salen de `docs/integracion-meteomatics.md` §5. Son un criterio del equipo y la tarjeta lo dice.
- **Dónde va:**
  - **Inicio:** dentro de `.ini-cuerpo`, después de la tira de 12 meses. En el celular queda debajo de la tira; en la PC, en la columna derecha.
  - **Reporte, sección 1 ("Tu año"):** la misma tarjeta, con una fila por día (día, máxima y mínima, lluvia e íconos de helada y hoja mojada).
- **Textos:**
  - La tarjeta dice siempre de dónde viene el dato: "Pronóstico de Meteomatics (modelo europeo ECMWF, 9 km), bajado el {fecha}".
  - Si quedan menos de 7 días, dice "próximos {n} días".
  - **Si está vencido**, muestra "Pronóstico vencido (bajado el {fecha}). Se actualiza todos los días" y ningún número.
  - Si no carga el JSON, la tarjeta no aparece.
- Lo que el semáforo dice ("lo típico") no cambia. La tarjeta lo complementa: "Lo típico de noviembre es seco; esta semana se anuncian {mm} mm".

### C. Actualización diaria del pronóstico

- **Tarea nueva** `.github/workflows/actualizar-meteomatics.yml`, armada como `actualizar-readme.yml`:
  - corre todos los días a las 06:00 de Argentina (`cron: '0 9 * * *'`), y también a mano;
  - ejecuta `python3 scripts/descargar_meteomatics.py` con `METEOMATICS_PASSWORD` desde los **secretos del repo**;
  - sube `data/meteomatics_santiago_zonas.json` con un commit del robot, solo si cambió.
- **Si la descarga falla** (sin contraseña, cuenta vencida o error de la API), no se pisa el archivo anterior. La tarjeta lo va a mostrar vencido cuando corresponda.
- **Lo hace Enzo:** cargar el secreto `METEOMATICS_PASSWORD` en GitHub (Settings → Secrets and variables → Actions). La cuenta es la del hackathon (Santi).

### D. Si sobra tiempo: escalón de 9 km en la pantalla del kit

Debajo de la línea de NASA POWER de `web/kit.html` va: "Pronóstico para hoy (Meteomatics, 9 km): máxima {t} °C". La línea aparece solo si el pronóstico está vigente.

## Pruebas y verificación

- **Pruebas de `pronostico-logica`:**
  - un día pasado no se cuenta;
  - el pronóstico vencido;
  - los conteos con los datos reales de la Zona 2;
  - la conversión de m/s a km/h.
- **`tests/vistas.test.js`:** la tarjeta existe en `index.html`.
- **`tests/datos-contratos.test.js`:** la forma del JSON de Meteomatics.
- **Capturas a 390, 768, 1024, 1440 y 1920 px** del Inicio y del Reporte, para ver el celular igual que antes y las dos columnas desde 1024 px.

## Documentación

- D-34 en la bitácora.
- El JSON de Meteomatics en `docs/contratos-de-datos.md`.
- La casilla "Decidir si Meteomatics entra" de `planes/1-enzo.md` queda tildada: entra como tarjeta.
- Actualizar el estado, la memoria del proyecto y el README (con el script). También anotar en el estado que Sara arma el kit en un simulador web.

## Lo que queda a criterio de quien lo construye

- Los íconos.
- El orden exacto de los datos en la tarjeta.
- El formato de la fecha.
- Los nombres de las clases de CSS.
