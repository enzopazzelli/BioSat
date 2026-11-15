# Tarjetas, barras y accesibilidad: implementación (D-42)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tarjetas cortas con lo clave a la vista y el detalle desplegable, barras en lugar del gráfico de puntos y mínimos de accesibilidad (letra y botones).

**Spec:** `docs/superpowers/specs/2026-11-15-tarjetas-y-accesibilidad-design.md`

## Global Constraints

- Sección 2 a 390 px con las tarjetas cerradas: **menos de 3000 px** (hoy, 7586).
- Ningún `font-size` menor a `.75rem`. Textos de lectura (`.hint`, `.gis-note`, listas y párrafos de las tarjetas) en `.875rem` o más.
- `.capa`, los botones de las tarjetas y los `summary` con `min-height:44px`.
- **Detalle:** `<details class="rot-mas">` con "Ver todo el detalle"; adentro va todo lo de hoy, sin perder nada.
- **Lo que gana y paga:** como máximo 2 ✔ y 2 ✘ en el resumen; ✔ y ✘ con `aria-hidden` y listas con título.
- **Textos nuevos:** en `TEXTOS_REPORTE` con su inglés en `appReporte`.
- Commits sin `Co-Authored-By`. Rama `enzo-tarjetas`. Se muestra antes de integrar.

## Review Focus

1. **Imprimir:** los `<details>` nuevos salen abiertos en el PDF. Ya hay un código que abre todos los de `#vista-reporte`. Prueba en el navegador.
2. **La rotación actual y las tarjetas no viables** (`.off`): el resumen se arma bien. Prueba en el navegador.
3. **Vista detallada (`completo.html`):** usa las mismas funciones; sin errores. Prueba en el navegador.
4. **Modo oscuro:** las barras y las ✔/✘ se ven. Captura.
5. **Inglés:** los textos nuevos traducidos y los nombres de las rotaciones en inglés. Prueba en el navegador.

### Task 1: Mínimos de accesibilidad en los estilos

- **Prueba en `vistas.test.js`:** ningún `font-size:.Xrem` menor a `.75rem` en `estilos.css`; `.hint` en `.875rem` o más; `.capa` con `min-height:44px`.
- **Implementar** en `web/estilos.css`.
- **Verificar** a 390 px que no se desborda nada (Inicio, Reporte y kit).
- **Commit.**

### Task 2: Tarjeta corta con detalle desplegable

- **Prueba:** `app.js` arma `<details class="rot-mas">` con `TEXTOS_REPORTE.verDetalle`. El resumen usa `t.gana.slice(0, 2)` y `t.cuesta.slice(0, 2)`. La tira lleva `role="img"` y `aria-label`.
- **Implementar** en `renderCards`, con las claves nuevas en `TEXTOS_REPORTE` y su inglés, y el CSS de `.rot-resumen`, `.gp` (gana y paga) y `.rot-mas`.
- **Verificar** en el navegador: menos de 3000 px a 390, el detalle completo al abrir, la impresión abre los detalles, `completo.html` sin errores y el inglés.
- **Commit.**

### Task 3: Barras de lo que se gana y lo que se paga

- **Prueba:** `index.html` y `completo.html` tienen `#tradeBarras` y el `<details>` del gráfico de puntos (con `#tradeSvg` adentro).
- **Implementar** `renderTrade`: barras (agua con la marca de la lluvia del año y meses protegidos) y el texto de ayuda. El gráfico de puntos sigue dentro del `<details>`.
- **Verificar** en el navegador los números de cada fila, el modo oscuro y la PC.
- **Commit.**

### Task 4: Documentación

- Bitácora D-42, estado y README. Suites completas. Commit.
