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
