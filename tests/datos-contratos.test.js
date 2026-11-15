// Pruebas de contrato de los datos reales que genera ia_desmonte/ (docs/contratos-de-datos.md §2, §3, §5, §7 y §8).
// Comprueban la forma de los JSON y que no queden rastros del prototipo simulado (archivo/prototipo-ia-simulado/).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DATA = path.join(__dirname, '..', 'data');
const leer = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const ZONAS = ['zona_1_riego_salitre', 'zona_2_secano_este', 'zona_3_monte_semiarido',
  'zona_4_bajos_submeridionales', 'zona_5_sur_serrano'];
const CONF = ['alta', 'media', 'baja'];
const numONull = v => v === null || (typeof v === 'number' && Number.isFinite(v));

function metaCompleta(meta, nombre) {
  for (const k of ['fuente', 'metodo', 'generado_por', 'fecha']) assert.ok(meta[k], `${nombre}: falta meta.${k}`);
  assert.doesNotMatch(String(meta.generado_por), /santi-task|compilar_notebook|Pipeline IA Santi/, `${nombre}: apunta al prototipo simulado`);
  assert.ok(fs.existsSync(path.join(__dirname, '..', meta.generado_por.split(' ')[0])), `${nombre}: no existe ${meta.generado_por}`);
}

test('suelo_zonas.json: 5 zonas, cada campo con valor, código, confianza y rango', () => {
  const j = leer('suelo_zonas.json');
  metaCompleta(j.meta, 'suelo');
  assert.deepEqual(Object.keys(j.zonas), ZONAS);
  for (const z of ZONAS) {
    const campos = Object.entries(j.zonas[z]).filter(([, v]) => v && typeof v === 'object' && 'valor' in v);
    assert.equal(campos.length, 11, z);
    for (const [k, v] of campos) {
      assert.ok(numONull(v.valor), `${z}.${k}.valor`);
      assert.ok(v.codigo, `${z}.${k}.codigo`);
      assert.ok(CONF.includes(v.confianza), `${z}.${k}.confianza`);
      assert.ok(v.rango_p10_p90 === null || (Array.isArray(v.rango_p10_p90) && v.rango_p10_p90.length === 2), `${z}.${k}.rango`);
    }
    assert.ok(['tierra agropecuaria', 'zona completa'].includes(j.zonas[z].area_medida), `${z}.area_medida`);
  }
});

test('zonificacion_aizal.json: 5 grupos con perfil real, área que suma 100 y comparación con las 5 zonas', () => {
  const j = leer('zonificacion_aizal.json');
  metaCompleta(j.meta, 'zonificacion');
  assert.equal(j.meta.k, 5);
  assert.ok(typeof j.meta.silueta_media === 'number' && j.meta.silueta_media > -1 && j.meta.silueta_media <= 1);
  assert.equal(j.grupos.length, 5);
  const area = j.grupos.reduce((s, g) => s + g.area_pct, 0);
  assert.ok(area > 99 && area < 101, `área total ${area}`);
  for (const g of j.grupos) for (const v of Object.values(g.perfil)) assert.ok(numONull(v));
  assert.deepEqual(Object.keys(j.comparacion_biosat), ZONAS);
  assert.ok(fs.existsSync(path.join(__dirname, '..', j.meta.imagen.archivo)), 'falta el PNG de la zonificación');
});

test('diagnostico_landsat_ia.json: 12 meses, fracciones, dudosos y fragilidad entre 0 y 100', () => {
  const j = leer('diagnostico_landsat_ia.json');
  metaCompleta(j.meta, 'diagnostico');
  assert.deepEqual(Object.keys(j.zonas), ZONAS);
  for (const z of ZONAS) {
    const d = j.zonas[z];
    assert.equal(d.meses_suelo_pelado.length, 12);
    assert.ok(d.meses_suelo_pelado.every(v => typeof v === 'boolean'));
    assert.equal(d.meses_dudosos.length, 12);
    assert.equal(d.fraccion_pelado.length, 12);
    assert.ok(d.fraccion_pelado.every(numONull));
    assert.ok(d.indice_fragilidad_0_100 === null || (d.indice_fragilidad_0_100 >= 0 && d.indice_fragilidad_0_100 <= 100));
    assert.ok(CONF.includes(d.confianza) && CONF.includes(d.confianza_fragilidad));
    assert.ok(d.formula_fragilidad.includes('min('));
  }
});

test('imagenes/escenas.json: compuestos de Earth Engine, livianos y distintos de las vistas previas de web/img', () => {
  const e = leer(path.join('imagenes', 'escenas.json'));
  const huellas = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'ia_desmonte', 'salidas', 'huellas_web_img.json'), 'utf8'));
  const CAPAS = {invierno: ['invierno_rgb', 'invierno_ndvi'], verano: ['verano_rgb', 'verano_ndvi'], anio2000: ['2000_rgb']};
  for (const [z, m] of Object.entries(e)) {
    assert.equal(m.bbox.length, 4);
    for (const [est, capas] of Object.entries(CAPAS)) {
      if (!m[est]) continue;
      assert.doesNotMatch(m[est].item, /L2SP/, `${z}.${est}: es una escena suelta, no un compuesto`);
      assert.ok(m[est].fecha && m[est].periodo && m[est].n_escenas > 0, `${z}.${est}`);
      for (const c of capas) {
        const f = path.join(DATA, 'imagenes', `${z}_${c}.png`);
        assert.ok(fs.existsSync(f), `falta ${f}`);
        assert.ok(fs.statSync(f).size < 400 * 1024, `${f} pesa más de 400 KB`);
        const h = huellas[`${z}_${c}`];
        assert.ok(h && h.png && h.webp && h.png !== h.webp, `${z}_${c}: igual a la vista previa de web/img`);
      }
    }
  }
});

test('desmonte_zonas.json: serie 2001-2025 real, riesgo entre 0 y 1, método elegido = mayor AUC', () => {
  const j = leer('desmonte_zonas.json');
  metaCompleta(j.meta, 'desmonte');
  assert.deepEqual(Object.keys(j.zonas), ZONAS);
  const met = j.evaluacion.metodos;
  const clasif = ['regresion_logistica', 'random_forest', 'gradient_boosting'];
  const mejor = clasif.reduce((a, b) => (met[b].auc > met[a].auc ? b : a));
  assert.equal(j.evaluacion.metodo_elegido, mejor);
  assert.ok(j.evaluacion.tasa_base > 0 && j.evaluacion.tasa_base < 1);
  assert.ok(!('temporal_lstm_o_transformer' in met), 'queda la clave vieja del modelo temporal');
  assert.ok(typeof met.temporal.error_ha_pct === 'number');
  for (const z of ZONAS) {
    const d = j.zonas[z];
    assert.equal(d.desmonte_ha_por_anio.desde, 2001);
    assert.equal(d.desmonte_ha_por_anio.valores.length, 25);
    assert.ok(d.riesgo_medio_0_1 === null || (d.riesgo_medio_0_1 >= 0 && d.riesgo_medio_0_1 <= 1));
    assert.notEqual(d.confianza, 'alta', `${z}: el riesgo no puede tener confianza alta`);
    assert.ok(d.riesgo_n < 100 ? d.confianza === 'baja' : d.confianza === 'media');
    assert.deepEqual(d.proyeccion_ha.anios, [2026, 2027, 2028, 2029]);
  }
});

test('la app lee las claves que existen en desmonte_zonas.json', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'web', 'app.js'), 'utf8');
  const nom = app.match(/const NOM = \{([^}]*)\}/)[1];
  const claves = [...nom.matchAll(/(\w+):'/g)].map(m => m[1]);
  const met = leer('desmonte_zonas.json').evaluacion.metodos;
  for (const k of claves) assert.ok(k in met, `la app pide evaluacion.metodos.${k} y no está`);
  assert.ok(claves.includes('temporal') && claves.includes('gradient_boosting'));
});
