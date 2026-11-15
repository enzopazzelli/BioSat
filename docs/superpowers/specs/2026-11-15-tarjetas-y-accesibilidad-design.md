# Diseño: tarjetas de las alternativas, "lo que se gana y lo que se paga" y accesibilidad (D-42)

**Fecha:** 15/11/2026 · **Pedido de:** Enzo y su grupo · **Sección:** Reporte, sección 2 ("Tu rotación y 2 alternativas"), en `index.html` y `completo.html`

## 1. Para qué

El grupo pide:
- **Tarjetas más amigables:** lo clave a la vista y el resto desplegable.
- Que **lo que se gana y lo que se paga** se entienda en el celular.
- Mejoras de accesibilidad en la misma línea.

**Lo que se midió a 390 px (15/11):**
- La sección 2 mide **7586 px** (unas 9 pantallas) y cada alternativa unos 2500 px. Cada tarjeta muestra, sin plegar:
  - secuencia, tira de 12 meses, ajuste con 2 a 5 filas de prioridades, avisos y 3 cifras;
  - "Lo que ganás / Lo que te cuesta" en dos columnas angostas (renglones de 2 o 3 palabras);
  - riesgo en años reales, reglas, las 5 preguntas de la NASA y "¿Qué tan seguros estamos?".
- **El gráfico de puntos** "Lo que se gana y lo que se paga" corta los nombres ("Alternativa · Colchón de r…"), tiene letra de ejes muy chica y necesita un párrafo para entenderse.
- **Accesibilidad:**
  - el contraste del texto gris está bien (5,4 a 6,2 en claro y 7,8 en oscuro; el mínimo es 4,5);
  - la app deja hacer zoom, marca el foco y respeta "reducir movimiento";
  - pero hay **34 estilos con letra de menos de 13 px**, y los botones `.capa` miden unos 32 px de alto (lo recomendado para tocar es 44).

**Decisiones de Enzo (15/11):**
- La tarjeta corta lleva **lo que el diseño propuso**: nombre, ajuste a sus prioridades, tira de 12 meses y **dos cosas que gana (✔) y dos que paga (✘)**, en una sola columna. Todo lo demás va en **"Ver todo el detalle"**.
- El gráfico se reemplaza por **barras (A)**. El de puntos pasa a "Para tu ingeniero".

## 2. Objetivos, no objetivos y lo que no puede pasar

**Objetivos**
- Con las tarjetas cerradas, la sección 2 a 390 px mide **menos de 3000 px**: menos de la mitad que hoy.
- Lo que gana y lo que paga se lee en una sola columna, con ✔ y ✘ además del color.
- Barras legibles en el celular, con el nombre completo y el número escrito.
- Letra mínima y botones de 44 px en los lugares que tocamos.

**No objetivos**
- Cambiar cómo se ordenan o puntúan las rotaciones, o sus datos.
- Rediseñar las otras secciones del Reporte o el Inicio (solo heredan el tamaño mínimo de letra y de los botones).
- Traducir el cuerpo del Reporte (etapa 2 de D-35). Solo los textos nuevos van con su inglés.

**Lo que no puede pasar**
- Perder información: todo lo que hoy muestra la tarjeta sigue estando, desplegado en el detalle.
- Que el PDF salga con las tarjetas cerradas. El PDF ya abre todos los plegables del Reporte, y se mantiene.
- Que algo se entienda solo por el color.

## 3. Cómo funciona

### 3.1 La tarjeta

```
┌───────────────────────────────────────┐
│ 1º ALTERNATIVA 1                      │
│ Colchón de rastrojo: Soja + Maíz…     │  (nombre completo)
│ ▮▮▮▮▮▮▮▮▮▮▯▯  (tira de 12 meses)      │
│ Se ajusta a tus prioridades: 67 %     │
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▭▭▭▭               │
│ ⛔/⚠ aviso (si hay)                    │
│ ✔ 6 meses menos de suelo pelado       │
│ ✔ Frena más el salitre                │
│ ✘ Necesita sembradora o rolo          │
│ ✘ Menor margen bruto que la soja      │
│ ▸ Ver todo el detalle                 │
└───────────────────────────────────────┘
```

- **La rotación de hoy** ("Actual") lleva, en lugar de ✔ y ✘: "Es tu punto de partida: las otras se comparan contra esta".
- **Si no gana nada**, dice "✔ Poco, frente a lo que hacés hoy"; si no paga nada, no hay línea ✘.
- **"Ver todo el detalle"** es un `<details>` nativo (anda con teclado y con lector de pantalla, y sin internet). Adentro va todo lo de hoy, en este orden:
  1. secuencia;
  2. ajuste por prioridad;
  3. 3 cifras;
  4. **todo** lo que gana y paga (las listas completas);
  5. riesgo en años reales;
  6. reglas;
  7. las 5 preguntas;
  8. "¿Qué tan seguros estamos?".
- **La tira de 12 meses** suma `role="img"` y una descripción ("Meses de suelo pelado: sep, oct…", o "Sin meses de suelo pelado").

### 3.2 "Lo que se gana y lo que se paga" con barras

- **Título y bajada:** "Agua que pide y meses que protege el suelo", con la ayuda "Menos agua es mejor; más meses protegidos es mejor".
- **Una fila por rotación,** en el mismo orden que las tarjetas: "Hoy" para la actual, y "1º", "2º" y así para las alternativas. Cada fila tiene el nombre completo y dos barras con su número escrito:
  - **Agua que pide** (mm por año). Escala de 0 al máximo entre las rotaciones y la lluvia del año, con una marca de "Lluvia del año: N mm" en la barra.
  - **Suelo protegido** (meses de 12).
- **Las barras van con `aria-hidden`:** el número está escrito al lado, así que el lector de pantalla lee el texto.
- **El gráfico de puntos actual** pasa a un `<details>` "Para tu ingeniero: el mismo dato en un gráfico".

### 3.3 Accesibilidad (en toda la app)

- **Letra:**
  - ningún `font-size` menor a `.75rem` (12 px);
  - los textos de lectura (`.hint`, listas y párrafos de las tarjetas, `.gis-note`) en al menos `.875rem` (14 px).
- **Botones:** los `.capa`, los botones de las tarjetas y el resumen de los `<details>` con `min-height: 44px`.
- **Lo que gana y lo que paga:** ✔ y ✘ (con `aria-hidden`) más el título de cada lista, para lectores de pantalla.
- **Textos nuevos:** con clave en `TEXTOS_REPORTE` y su inglés (`appReporte` en `textos-en.js`).

## 4. Pruebas

- **`tests/vistas.test.js`:**
  - la tarjeta usa `<details class="rot-mas">` con "Ver todo el detalle";
  - el resumen muestra como máximo 2 ✔ y 2 ✘;
  - existe el contenedor de las barras y el `<details>` del gráfico de puntos;
  - `estilos.css` no tiene `font-size` menor a `.75rem`, y `.capa` tiene `min-height:44px`.
- **En el navegador:**
  - la sección 2 a 390 px mide menos de 3000 px con las tarjetas cerradas;
  - al abrir "Ver todo el detalle" aparece todo lo de antes (las 5 preguntas, las reglas y el riesgo);
  - las barras muestran los números de agua y meses de cada rotación;
  - la vista de impresión abre los detalles;
  - en la PC (1440 px), en modo oscuro y en inglés, sin errores.

## 5. Cómo se trabaja

Una rama `enzo-tarjetas`, con plan corto. Se muestra antes de integrar a `main`.
