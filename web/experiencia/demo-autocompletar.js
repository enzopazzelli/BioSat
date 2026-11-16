/* BioSat · autocompletar para grabar el video de la página de Vale (D-48).
   Solo con ?demo=1 en la dirección: suma un botón que llena "Nuevo campo" y otro que llena "Nueva observación".
   Guardar queda a cargo de quien graba, así el video muestra el recorrido. Sin ?demo=1 no se crea nada.
   Diseño: docs/superpowers/specs/2026-11-15-autocompletar-experiencia-design.md */
(function () {
  // Centro del recorte satelital del lote capital_zona1 (D-40), donde cae el NDVI.tif real del ingeniero.
  // (La comparación con Sentinel-2 y Landsat la elige la página por los bordes del TIFF, no por este campo.)
  const CAMPO = {
    nombre: 'Lote Capital · Zona 1',
    zona: 'zona_1_riego_salitre',
    lat: -28.0129,
    lon: -64.2297,
    cultivo: '',   // no se sabe qué hay sembrado en ese lote: no se inventa
    notas: {
      es: 'Campo de ejemplo para la demo: es el lote del vuelo de dron de julio de 2026.',
      en: 'Sample field for the demo: it is the field of the July 2026 drone flight.'
    }
  };

  // Una tarea para el campo, no un hallazgo (D-33): no dice qué hay en el lote, dice qué mirar.
  const OBSERVACION = {
    es: {
      titulo: 'Recorrer el sector norte',
      fuente: 'drone',
      sector: 'Norte',
      resumen: 'Revisar en el campo la cobertura del sector norte antes de decidir la próxima siembra.',
      detalle: 'Comparar lo que muestra el NDVI del vuelo con lo que se ve en el lote: suelo descubierto, maleza o rastrojo seco.'
    },
    en: {
      titulo: 'Walk the north sector',
      fuente: 'drone',
      sector: 'North',
      resumen: 'Check the cover of the north sector in the field before deciding the next sowing.',
      detalle: 'Compare what the flight NDVI shows with what you see in the field: bare soil, weeds or dry crop residue.'
    }
  };

  const TEXTOS = {es: {boton: 'Autocompletar (demo)'}, en: {boton: 'Autofill (demo)'}};

  // true solo si la dirección trae demo=1 (también junto con otros parámetros).
  function activo(search) {
    return new URLSearchParams(search || '').get('demo') === '1';
  }

  const D = {activo, CAMPO, OBSERVACION, TEXTOS};
  if (typeof module !== 'undefined' && module.exports) { module.exports = D; return; }
  window.DemoAutocompletar = D;

  // ---------- Navegador ----------
  const idioma = () => (document.documentElement.lang || '').toLowerCase().startsWith('en') ? 'en' : 'es';

  // Pone el valor y avisa con input y change, por si la página escucha esos eventos.
  function poner(selector, valor) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.value = valor;
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }
  function llenarCampo() {
    poner('#fieldName', CAMPO.nombre);
    poner('#fieldZone', CAMPO.zona);
    poner('#fieldCrop', CAMPO.cultivo);
    poner('#fieldLat', String(CAMPO.lat));
    poner('#fieldLon', String(CAMPO.lon));
    poner('#fieldNotes', CAMPO.notas[idioma()]);
  }
  function llenarObservacion() {
    const o = OBSERVACION[idioma()];
    poner('#obsTitle', o.titulo);
    poner('#obsSource', o.fuente);
    poner('#obsSector', o.sector);
    poner('#obsSummary', o.resumen);
    poner('#obsDetail', o.detalle);
  }
  function boton(id, alTocar) {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = id;
    b.className = 'button button-secondary';
    b.addEventListener('click', alTocar);
    return b;
  }
  function rotular() {
    document.querySelectorAll('#demoAutocompletarCampo, #demoAutocompletarObs')
      .forEach(b => { b.textContent = TEXTOS[idioma()].boton; });
  }
  function armar() {
    if (!activo(location.search)) return;
    const acciones = document.querySelector('#fieldForm .form-actions');
    if (acciones && !document.getElementById('demoAutocompletarCampo')) acciones.appendChild(boton('demoAutocompletarCampo', llenarCampo));
    // En el diálogo de la observación va en una fila propia, arriba de Cancelar y Guardar: adentro de esa fila
    // (flex, sin salto de línea) desbordaba el diálogo a 390 px en castellano.
    const cancelar = document.getElementById('cancelObservation');
    if (cancelar && !document.getElementById('demoAutocompletarObs')) {
      const fila = cancelar.parentNode;
      fila.parentNode.insertBefore(boton('demoAutocompletarObs', llenarObservacion), fila);
    }
    rotular();
    // La página cambia el idioma poniendo lang en <html>: el botón lo sigue.
    new MutationObserver(rotular).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', armar);
  else armar();
})();
