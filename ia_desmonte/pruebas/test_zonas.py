from ia_desmonte.comun import ZONAS
from ia_desmonte.zonas import departamentos_por_zona, zonas_geojson


def test_cada_departamento_tiene_una_zona():
    d = departamentos_por_zona()
    todos = [x for v in d.values() for x in v]
    assert sorted(d) == ZONAS and len(todos) == 27 and len(set(todos)) == 27
    assert 'general taboada' in d['zona_4_bajos_submeridionales']
    assert 'pelegrini' in d['zona_3_monte_semiarido']   # así lo escribe geoBoundaries


def test_zonas_geojson_tiene_5_features_con_geometria():
    fc = zonas_geojson()
    assert [f['properties']['zona'] for f in fc['features']] == ZONAS
    assert [f['properties']['num'] for f in fc['features']] == [1, 2, 3, 4, 5]
    assert all(f['geometry']['type'] in ('Polygon', 'MultiPolygon') for f in fc['features'])


def test_geometrias_validas_y_area_de_la_provincia():
    import math
    from shapely.geometry import shape
    total = 0
    for f in zonas_geojson()['features']:
        g = shape(f['geometry'])
        assert g.is_valid, f['properties']['zona']
        total += g.area * 111.32 ** 2 * math.cos(math.radians(g.centroid.y))
    assert abs(total - 136351) / 136351 < 0.02   # superficie oficial de Santiago del Estero
