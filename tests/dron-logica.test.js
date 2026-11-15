// Pruebas del lector de dron (web/dron-logica.js, D-38): coordenadas, tipo de imagen, NDVI, zona del lote y textos.
// Diseño: docs/superpowers/specs/2026-11-15-lector-dron-design.md · Plan: docs/superpowers/plans/2026-11-15-lector-dron-etapa-1.md
const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../web/dron-logica.js');
const proj4 = require('../web/vendor/proj4.js');

test('defProj4: UTM sur y norte, WGS84, POSGAR 2007 faja 4 y desconocido', () => {
  assert.equal(D.defProj4(32720), '+proj=utm +zone=20 +south +datum=WGS84 +units=m +no_defs');
  assert.equal(D.defProj4(32620), '+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs');
  assert.equal(D.defProj4(4326), '+proj=longlat +datum=WGS84 +no_defs');
  assert.equal(D.defProj4(5346), '+proj=tmerc +lat_0=-90 +lon_0=-63 +k=1 +x_0=4500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
  assert.match(D.defProj4(3857), /\+proj=merc \+a=6378137/);
  assert.equal(D.defProj4(22185), null);
});

test('epsgDe: proyectado, geográfico, definido por el usuario y sin GeoKeys', () => {
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32720}), 32720);
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 2, GeographicTypeGeoKey: 4326}), 4326);
  assert.equal(D.epsgDe({GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32767}), null);
  assert.equal(D.epsgDe(null), null);
});

test('recuadroLatLon envuelve las 4 esquinas (UTM 20 S, simétrico al meridiano -63)', () => {
  const r = D.recuadroLatLon([499000, 6999000, 501000, 7001000], (x, y) => proj4(D.defProj4(32720), 'WGS84', [x, y]));
  assert.ok(r[0][0] < r[1][0] && r[0][1] < -63 && r[1][1] > -63);
  assert.ok(Math.abs((r[0][1] + r[1][1]) / 2 + 63) < 1e-9);
  assert.ok(Math.abs((r[1][1] - r[0][1]) - 0.0202) < 0.0005);
});

test('metrosPorPixel: 0,01° de longitud a -27° en 100 px', () => {
  assert.ok(Math.abs(D.metrosPorPixel([[-27.01, -63.01], [-27, -63]], 100) - 9.92) < 0.05);
});
