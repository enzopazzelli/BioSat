"""Las 5 zonas de BioSat como polígonos: se juntan los 27 departamentos con la misma asignación del mapa.

Fuente de los límites: geoBoundaries ARG ADM2 (IGN), la misma que usa scripts/generar_mapa_santiago.py.
"""
import importlib.util
import json
import urllib.request

from ia_desmonte.comun import DATA, RAIZ, SALIDAS, ZONAS


def _mapa():
    """Importa scripts/generar_mapa_santiago.py por ruta para reusar sus nombres y funciones."""
    ruta = RAIZ / 'scripts' / 'generar_mapa_santiago.py'
    spec = importlib.util.spec_from_file_location('generar_mapa_santiago', ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def departamentos_por_zona():
    """{zona_id: [nombres normalizados como los escribe geoBoundaries]}, según data/santiago_mapa.json."""
    m = _mapa()
    a_geob = {v: k for k, v in m.NOMBRES.items()}  # "Pellegrini" -> "Pelegrini"
    datos = json.loads((DATA / 'santiago_mapa.json').read_text(encoding='utf-8'))
    salida = {z: [] for z in ZONAS}
    for d in datos['departamentos']:
        salida[ZONAS[d['zona'] - 1]].append(m.norm(a_geob.get(d['nombre'], d['nombre'])))
    return salida


def cargar_geojson():
    """Baja el GeoJSON de departamentos de geoBoundaries una sola vez y lo guarda en salidas/."""
    m = _mapa()
    destino = SALIDAS / 'geoBoundaries-ARG-ADM2.geojson'
    if not destino.exists():
        SALIDAS.mkdir(parents=True, exist_ok=True)
        print('Bajando', m.URL)
        urllib.request.urlretrieve(m.URL, destino)
    return json.loads(destino.read_text(encoding='utf-8'))


def zonas_geojson():
    """FeatureCollection de GeoJSON con 5 MultiPolygon (propiedades `zona` y `num`)."""
    m = _mapa()
    por_zona = departamentos_por_zona()
    zona_de = {n: z for z, ns in por_zona.items() for n in ns}
    poligonos = {z: [] for z in ZONAS}
    vistos = set()
    for f in cargar_geojson()['features']:
        nombre = m.norm(f['properties']['shapeName'])
        b = m.caja(f['geometry'])
        cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
        if nombre not in m.DEPARTAMENTOS or not (m.CAJA[0] <= cx <= m.CAJA[2] and m.CAJA[1] <= cy <= m.CAJA[3]):
            continue
        if nombre == 'capital' and cx < -65:  # la Capital de Tucumán
            continue
        g = f['geometry']
        poligonos[zona_de[nombre]].extend(g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']])
        vistos.add(nombre)
    if len(vistos) != 27:
        raise RuntimeError(f'Se esperaban 27 departamentos y salieron {len(vistos)}')
    from shapely.geometry import MultiPolygon, Polygon, mapping
    from shapely.ops import unary_union

    def unir(polis):
        # Los departamentos vecinos comparten bordes: se disuelven para que la geometría sea válida.
        partes = [Polygon(p[0], p[1:]).buffer(0) for p in polis]
        g = unary_union(partes)
        return json.loads(json.dumps(mapping(g if isinstance(g, MultiPolygon) else MultiPolygon([g]))))  # tuplas -> listas

    return {'type': 'FeatureCollection', 'features': [
        {'type': 'Feature', 'properties': {'zona': z, 'num': i + 1}, 'geometry': unir(poligonos[z])}
        for i, z in enumerate(ZONAS)]}


def zonas_fc():
    """Las 5 zonas como ee.FeatureCollection."""
    import ee
    feats = [ee.Feature(ee.Geometry(f['geometry'], None, False), f['properties'])
             for f in zonas_geojson()['features']]
    return ee.FeatureCollection(feats)


def zona_imagen():
    """Imagen con la banda `zona` (1 a 5) para saber a qué zona pertenece cada píxel."""
    import ee
    return zonas_fc().reduceToImage(['num'], ee.Reducer.first()).rename('zona').toInt()
