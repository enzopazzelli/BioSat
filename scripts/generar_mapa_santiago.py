#!/usr/bin/env python3
"""BioSat · genera data/santiago_mapa.json: el contorno de Santiago del Estero con sus 27 departamentos,
pintados por zona, para el mapa del asistente de inicio.

Uso:
    python -X utf8 scripts/generar_mapa_santiago.py            # baja el archivo de geoBoundaries y escribe el JSON
    python -X utf8 scripts/generar_mapa_santiago.py --origen archivo.geojson   # usa un archivo ya bajado

Fuente: geoBoundaries ARG ADM2 (año 2020), que a su vez es del Instituto Geográfico Nacional (IGN),
licencia CC BY 3.0 IGO. Solo biblioteca estándar. Diseño: docs/superpowers/specs/2026-11-14-asistente-y-mapa-design.md
Contrato del archivo: docs/contratos-de-datos.md §9.

Cómo se asigna cada departamento a una zona (se aplica la primera regla que corresponda):
  1. "punto":  el departamento que contiene el punto de NASA POWER de la zona.
  2. "lista":  el departamento que la app ya nombra en ZONAS[...].deptos (web/app.js).
  3. "cercana": la zona cuyo punto de NASA POWER esté más cerca del centro del departamento (en plano).
"""
import argparse
import json
import math
import os
import sys
import tempfile
import unicodedata
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = ('https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/ARG/ADM2/'
       'geoBoundaries-ARG-ADM2_simplified.geojson')
SALIDA = os.path.join(RAIZ, 'data', 'santiago_mapa.json')

# Los 27 departamentos de Santiago del Estero, como los escribe geoBoundaries (sin tildes y en minúscula).
DEPARTAMENTOS = {
    'aguirre', 'alberdi', 'atamisqui', 'avellaneda', 'banda', 'belgrano', 'capital', 'choya', 'copo', 'figueroa',
    'general taboada', 'guasayan', 'jimenez', 'juan f. ibarra', 'loreto', 'mitre', 'moreno', 'ojo de agua',
    'pelegrini', 'quebrachos', 'rivadavia', 'robles', 'rio hondo', 'salavina', 'san martin', 'sarmiento', 'silipica'}
# Nombre para mostrar cuando geoBoundaries lo escribe distinto.
NOMBRES = {'Pelegrini': 'Pellegrini', 'Ojo de agua': 'Ojo de Agua'}
# Caja de la provincia: sirve para descartar los homónimos de otras provincias (la "Capital" de Tucumán, etc.).
CAJA = (-65.3, -30.9, -61.6, -25.2)   # lon mínima, lat mínima, lon máxima, lat máxima

# Mismos departamentos que ZONAS[...].deptos de web/app.js (escritos como en geoBoundaries).
LISTA = {
    1: ['banda', 'robles', 'capital', 'san martin', 'silipica'],
    2: ['moreno', 'juan f. ibarra'],
    3: ['alberdi', 'copo', 'pelegrini', 'figueroa'],
    4: ['aguirre', 'mitre', 'belgrano', 'rivadavia', 'general taboada'],
    5: ['ojo de agua', 'quebrachos', 'choya', 'guasayan'],
}
ZONAS = {1: 'zona_1_riego_salitre', 2: 'zona_2_secano_este', 3: 'zona_3_monte_semiarido',
         4: 'zona_4_bajos_submeridionales', 5: 'zona_5_sur_serrano'}

ESCALA = 100       # unidades del cuadro por grado de latitud
MARGEN = 8         # unidades de margen alrededor de la provincia
TOLERANCIA = 0.3   # Douglas-Peucker, en unidades del cuadro (1 unidad ≈ 1,1 km)


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').strip()


def anillos(geom):
    polis = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    return [r for p in polis for r in p]


def caja(geom):
    pts = [p for r in anillos(geom) for p in r]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def contiene(geom, x, y):
    """Punto en polígono (par-impar sobre todos los anillos)."""
    dentro = False
    for a in anillos(geom):
        j = len(a) - 1
        for i in range(len(a)):
            xi, yi = a[i][:2]
            xj, yj = a[j][:2]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                dentro = not dentro
            j = i
    return dentro


def centro(geom):
    """Centroide (en plano, lon/lat) del anillo más grande."""
    mejor, area_max = None, -1
    for a in anillos(geom):
        area = 0.0
        for i in range(len(a)):
            x1, y1 = a[i][:2]
            x2, y2 = a[(i + 1) % len(a)][:2]
            area += x1 * y2 - x2 * y1
        if abs(area) > area_max:
            area_max, mejor = abs(area), a
    a = mejor
    area = cx = cy = 0.0
    for i in range(len(a)):
        x1, y1 = a[i][:2]
        x2, y2 = a[(i + 1) % len(a)][:2]
        c = x1 * y2 - x2 * y1
        area += c
        cx += (x1 + x2) * c
        cy += (y1 + y2) * c
    if area == 0:
        b = caja(geom)
        return (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
    area /= 2
    return cx / (6 * area), cy / (6 * area)


def douglas_peucker(pts, tol):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    largo = math.hypot(dx, dy)
    mejor, idx = -1.0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / largo if largo else math.hypot(x - x1, y - y1)
        if d > mejor:
            mejor, idx = d, i
    if mejor <= tol:
        return [pts[0], pts[-1]]
    return douglas_peucker(pts[:idx + 1], tol)[:-1] + douglas_peucker(pts[idx:], tol)


def bajar(origen):
    if origen:
        return origen
    destino = os.path.join(tempfile.mkdtemp(prefix='biosat_mapa_'), 'ARG_ADM2.geojson')
    print('Bajando', URL)
    urllib.request.urlretrieve(URL, destino)
    return destino


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--origen', help='archivo GeoJSON de geoBoundaries ya bajado')
    args = ap.parse_args()

    with open(bajar(args.origen), encoding='utf-8') as f:
        datos = json.load(f)
    with open(os.path.join(RAIZ, 'data', 'clima_zonas.json'), encoding='utf-8') as f:
        clima = json.load(f)['zonas']
    puntos = {z: (clima[ZONAS[z]]['lat'], clima[ZONAS[z]]['lon']) for z in ZONAS}

    # 1. Los 27 departamentos de Santiago del Estero
    elegidos = []
    for f in datos['features']:
        nombre = f['properties']['shapeName']
        b = caja(f['geometry'])
        cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
        if norm(nombre) in DEPARTAMENTOS and CAJA[0] <= cx <= CAJA[2] and CAJA[1] <= cy <= CAJA[3] \
                and not (norm(nombre) == 'capital' and cx < -65):
            elegidos.append((nombre, norm(nombre), f['geometry']))
    if len(elegidos) != 27:
        sys.exit(f'Se esperaban 27 departamentos y salieron {len(elegidos)}')

    # 2. Zona de cada departamento
    por_lista = {n: z for z, ns in LISTA.items() for n in ns}
    asignados = []
    for nombre, n, geom in elegidos:
        zona_punto = next((z for z, (la, lo) in puntos.items() if contiene(geom, lo, la)), None)
        if zona_punto:
            zona, origen = zona_punto, 'punto'
        elif n in por_lista:
            zona, origen = por_lista[n], 'lista'
        else:
            cx, cy = centro(geom)
            zona = min(puntos, key=lambda z: (puntos[z][1] - cx) ** 2 + (puntos[z][0] - cy) ** 2)
            origen = 'cercana'
        asignados.append((NOMBRES.get(nombre, nombre), zona, origen, geom))

    # 3. Proyección al cuadro del mapa (longitud × cos de la latitud media) y simplificación
    pts = [p for _, _, _, g in asignados for r in anillos(g) for p in r]
    x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
    y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
    k = math.cos(math.radians((y0 + y1) / 2))
    X = lambda lon: (lon - x0) * k * ESCALA + MARGEN
    Y = lambda lat: (y1 - lat) * ESCALA + MARGEN
    ancho = round((x1 - x0) * k * ESCALA + 2 * MARGEN, 1)
    alto = round((y1 - y0) * ESCALA + 2 * MARGEN, 1)

    def trazo(geom):
        partes = []
        for a in anillos(geom):
            proy = [(X(p[0]), Y(p[1])) for p in a]
            if proy and proy[0] == proy[-1]:
                proy = proy[:-1]
            simple = douglas_peucker(proy + [proy[0]], TOLERANCIA)[:-1]
            if len(simple) < 3:
                continue
            partes.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in simple) + 'Z')
        return ''.join(partes)

    salida = {
        'meta': {
            'fuente': 'geoBoundaries ARG ADM2 (año 2020), del Instituto Geográfico Nacional (IGN) y UNHCR/OCHA ROLAC',
            'licencia': 'CC BY 3.0 IGO',
            'url': URL,
            'generado_por': 'scripts/generar_mapa_santiago.py',
            'fecha': '2026-11-14',
            'notas': 'Las zonas se dibujan por departamento, en forma aproximada: el clima de cada zona sale de un punto de NASA POWER. '
                     'Regla de asignación: punto de la zona dentro del departamento, lista de la app, o la zona más cercana.'
        },
        'viewBox': [ancho, alto],
        'departamentos': [{'nombre': n, 'zona': z, 'origen': o, 'd': trazo(g)} for n, z, o, g in
                          sorted(asignados, key=lambda a: (a[1], a[0]))],
        'puntos': {str(z): {'x': round(X(lo), 1), 'y': round(Y(la), 1)} for z, (la, lo) in puntos.items()},
    }
    with open(SALIDA, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    cuenta = {o: sum(1 for a in asignados if a[2] == o) for o in ('punto', 'lista', 'cercana')}
    print(f'Escrito {os.path.relpath(SALIDA, RAIZ)}: {os.path.getsize(SALIDA) / 1024:.1f} KB, '
          f'{len(asignados)} departamentos {cuenta}, cuadro {ancho} x {alto}')


if __name__ == '__main__':
    main()
