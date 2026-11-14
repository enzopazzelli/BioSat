#!/usr/bin/env python3
"""
Actualiza las secciones automáticas del README de BioSat.

Qué hace:
  1. AVANCE:      cuenta las tareas [ ] y [x] de cada frente en PLAN.md.
  2. DECISIONES:  copia las últimas decisiones de docs/reglas-y-bitacora.md.
  3. ESTRUCTURA:  dibuja el árbol de archivos del repositorio.

Solo reemplaza lo que está entre las marcas
    <!-- AUTO:NOMBRE:INICIO -->  y  <!-- AUTO:NOMBRE:FIN -->
Todo lo demás del README se edita a mano.

Uso:
    python scripts/actualizar_readme.py           # actualiza README.md
    python scripts/actualizar_readme.py --check   # solo avisa si está desactualizado (sale con 1)

GitHub Actions lo corre solo en cada push a main
(ver .github/workflows/actualizar-readme.yml). Solo usa la biblioteca estándar.
"""

import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
README = RAIZ / "README.md"
PLAN = RAIZ / "PLAN.md"
BITACORA = RAIZ / "docs" / "reglas-y-bitacora.md"

# Descripción corta de cada archivo o carpeta que aparece en el árbol.
# Si agregás algo nuevo y querés que tenga descripción, sumalo acá.
# Los .md sin descripción usan su primer título "# ...".
DESCRIPCIONES = {
    "README.md": "Portada del proyecto (se actualiza sola)",
    "PLAN.md": "Plan de trabajo: roles, ruta y tareas",
    "CONTEXTO.md": "Contexto inicial del 13/11 (histórico)",
    "ESTRUCTURA_DATOS.md": "Arquitectura de datos y módulos AIZAL",
    "NASA Space Apps Challenge.pdf": "Enunciado oficial (pestaña Details)",
    "NASA Space Apps Challenge.mhtml": "Recursos oficiales (pestaña Resources)",
    "NASA Space Apps Challenge - awards.mhtml": "Premios globales y datos del equipo",
    "data": "Datos y contratos JSON que lee la app",
    "data/nasa_power_santiago_zonas.json": "Clima NASA POWER 2020-2025 (se reemplaza, ver PLAN F1)",
    "data/resumen_mensual_santiago.csv": "Resumen climático mensual por zona",
    "data/raw_nasa_power": "Descargas crudas de NASA POWER",
    "data/datos_cruzados_aizal": "Catálogo AIZAL V4: 38 variables de suelo, clima y paisaje",
    "data/datos_cruzados_aizal/CATALOGO_MAESTRO_VARIABLES.md": "Índice de módulos y reglas que disparan",
    "data/datos_cruzados_aizal/01_Clima_y_Balance_Hidrico": "B01-B08: agua, lluvia, sequía, temperatura",
    "data/datos_cruzados_aizal/02_Vegetacion_Fenologia_y_Paisaje": "B19-B23, B30-B31: paisaje, NDVI, monte",
    "data/datos_cruzados_aizal/03_Quimica_Nutricion_Suelo": "B09, B11, B13-B16: nitrógeno, pH, carbono",
    "data/datos_cruzados_aizal/04_Fisica_Suelo_y_Topografia": "B10, B12, B17-B18, B24-B25: textura, relieve",
    "data/datos_cruzados_aizal/05_Logistica_Antropico_y_Servicios": "B26-B29, B32-B37: caminos, población",
    "data/datos_cruzados_aizal/06_Embeddings_IA_AlphaEarth": "Embeddings AlphaEarth 64D (DeepMind)",
    "docs": "Documentación del equipo",
    "docs/AIZAL_Fichas_Variables_V4_2026.pdf": "Fichas oficiales de las variables AIZAL V4",
    "docs/analisis-datos-nasa-santiago.md": "Hallazgos climáticos 2020-2025 (a corregir, ver PLAN F1)",
    "docs/contratos-de-datos.md": "Formato de los JSON que comparten los frentes",
    "docs/cruce-de-datos.md": "Qué sale de cruzar NASA POWER, AIZAL y Landsat; análisis de zonas",
    "docs/transcripcion-video-desafio.md": "Transcripción del video del desafío (los 4 verbos)",
    "docs/documentacion-tecnica-agronomica.md": "Secciones de cultivo A/B/C/D y reglas de rotación",
    "docs/glosario.md": "Términos técnicos en lenguaje de productor",
    "docs/plan-de-pasos-y-agentes.md": "Plan anterior (reemplazado por PLAN.md)",
    "docs/recursos-desafio.md": "Los 26 recursos oficiales y cómo los usamos",
    "docs/reglas-y-bitacora.md": "Reglas de oro y bitácora de decisiones",
    "docs/resena-desafio.md": "Reseña del desafío y guía de entrevista",
    "docs/zonas-santiago-y-kit-arduino.md": "Las 4 zonas, sus rotaciones y el kit Arduino",
    "scripts": "Herramientas para bajar y procesar datos",
    "scripts/actualizar_readme.py": "Regenera las secciones automáticas del README",
    "scripts/descargar_nasa_power.py": "Descarga y resume NASA POWER por zona",
    "scripts/earth_engine_embeddings.js": "Ejemplo GEE de embeddings (falta adaptar a SdE)",
    "scripts/gee_visor_biosat.js": "Visor GIS en Earth Engine: 2000 vs 2025, NDVI, desmonte, zonas IA",
    "scripts/gee_exportar_zonas.js": "Earth Engine: estadísticas e imágenes por zona para la app",
    "web": "App web BioSat",
    "arduino": "Código del kit Arduino",
    "ia_landsat": "Módulo de IA con imágenes Landsat",
    "entrega": "Material para la presentación y la entrega",
}

# Carpetas que se muestran resumidas ("(N archivos)") aunque estén arriba.
COLAPSAR = {"data/raw_nasa_power"}
# Las carpetas a esta profundidad o más se muestran resumidas.
PROFUNDIDAD_MAX = 2
# Una carpeta con más elementos que esto se muestra resumida.
MAX_ELEMENTOS = 15
# Cuántas decisiones de la bitácora mostrar.
ULTIMAS_DECISIONES = 6


def leer(ruta):
    return ruta.read_text(encoding="utf-8") if ruta.exists() else ""


# ---------------------------------------------------------------- AVANCE

def barra(hechas, total, ancho=10):
    llenos = round(ancho * hechas / total) if total else 0
    return "▓" * llenos + "░" * (ancho - llenos)


def seccion_avance():
    texto = leer(PLAN)
    if not texto:
        return "_Todavía no hay PLAN.md._"

    frentes = []
    actual = None
    for linea in texto.splitlines():
        titulo = re.match(r"^(#{1,6})\s+(.*)", linea)
        if titulo:
            # Cada "### ..." abre un frente; cualquier otro título lo cierra.
            actual = None
            if titulo.group(1) == "###":
                actual = {"nombre": titulo.group(2).strip(), "hechas": 0, "total": 0}
                frentes.append(actual)
            continue
        tarea = re.match(r"^\s*[-*]\s+\[( |x|X)\]", linea)
        if tarea and actual is not None:
            actual["total"] += 1
            if tarea.group(1).lower() == "x":
                actual["hechas"] += 1

    frentes = [f for f in frentes if f["total"]]
    if not frentes:
        return "_PLAN.md todavía no tiene tareas con casillas._"

    filas = ["| Frente | Avance | Tareas |", "|---|---|---|"]
    for f in frentes:
        pct = round(100 * f["hechas"] / f["total"])
        nombre = f["nombre"].replace("|", "/")
        filas.append(f"| {nombre} | `{barra(f['hechas'], f['total'])}` {pct}% | {f['hechas']}/{f['total']} |")
    hechas = sum(f["hechas"] for f in frentes)
    total = sum(f["total"] for f in frentes)
    pct = round(100 * hechas / total)
    filas.append(f"| **Total** | `{barra(hechas, total)}` **{pct}%** | **{hechas}/{total}** |")
    return "\n".join(filas)


# ------------------------------------------------------------ DECISIONES

def seccion_decisiones():
    texto = leer(BITACORA)
    decisiones = re.findall(r"^- \*\*(D-\d+)\s*\((.+?)\):\*\*", texto, re.M)
    if not decisiones:
        return "_Todavía no hay decisiones en la bitácora._"
    ultimas = decisiones[-ULTIMAS_DECISIONES:]
    lineas = [f"- **{codigo}**: {titulo.replace('`', '')}" for codigo, titulo in reversed(ultimas)]
    lineas.append("")
    lineas.append("Todas las decisiones están en la [bitácora](docs/reglas-y-bitacora.md).")
    return "\n".join(lineas)


# ------------------------------------------------------------ ESTRUCTURA

def archivos_del_repo():
    """Archivos versionados + nuevos no ignorados (sin carpetas ocultas)."""
    try:
        salida = subprocess.run(
            ["git", "-c", "core.quotepath=off", "ls-files", "-z",
             "--cached", "--others", "--exclude-standard"],
            cwd=RAIZ, capture_output=True, check=True,
        ).stdout.decode("utf-8")
        rutas = {r for r in salida.split("\0") if r}
    except (OSError, subprocess.CalledProcessError):
        rutas = {p.relative_to(RAIZ).as_posix() for p in RAIZ.rglob("*") if p.is_file()}
    return sorted(
        r for r in rutas
        if (RAIZ / r).is_file() and not any(parte.startswith(".") for parte in r.split("/"))
    )


def construir_arbol(rutas):
    arbol = {}
    for ruta in rutas:
        nodo = arbol
        partes = ruta.split("/")
        for carpeta in partes[:-1]:
            nodo = nodo.setdefault(carpeta + "/", {})
        nodo[partes[-1]] = None
    return arbol


def contar_archivos(nodo):
    return sum(1 if hijo is None else contar_archivos(hijo) for hijo in nodo.values())


def descripcion(clave):
    if clave in DESCRIPCIONES:
        return DESCRIPCIONES[clave]
    if clave.endswith(".md"):
        for linea in leer(RAIZ / clave).splitlines():
            if linea.startswith("# "):
                titulo = re.sub(r"[*_`]", "", linea[2:]).strip()
                return titulo if len(titulo) <= 60 else titulo[:57] + "..."
    return ""


def lineas_arbol(nodo, prefijo="", ruta="", profundidad=0):
    # Primero archivos, después carpetas; cada grupo en orden alfabético.
    items = sorted(nodo.items(), key=lambda kv: (kv[1] is not None, kv[0].lower()))
    salida = []
    for i, (nombre, hijo) in enumerate(items):
        ultimo = i == len(items) - 1
        rama = "└── " if ultimo else "├── "
        clave = (ruta + nombre).rstrip("/")
        if hijo is None:
            salida.append((prefijo + rama + nombre, descripcion(clave)))
            continue
        resumir = clave in COLAPSAR or profundidad >= PROFUNDIDAD_MAX or len(hijo) > MAX_ELEMENTOS
        etiqueta = nombre
        if resumir:
            n = contar_archivos(hijo)
            etiqueta += f" ({n} archivo{'s' if n != 1 else ''})"
        salida.append((prefijo + rama + etiqueta, descripcion(clave)))
        if not resumir:
            salida += lineas_arbol(hijo, prefijo + ("    " if ultimo else "│   "),
                                   ruta + nombre, profundidad + 1)
    return salida


def seccion_estructura():
    lineas = lineas_arbol(construir_arbol(archivos_del_repo()))
    ancho = max(len(izq) for izq, _ in lineas) + 2
    cuerpo = [izq.ljust(ancho) + f"<-- {der}" if der else izq for izq, der in lineas]
    return "```text\nBioSat/\n" + "\n".join(cuerpo) + "\n```"


# ------------------------------------------------------------------ MAIN

def reemplazar(texto, nombre, contenido):
    patron = re.compile(
        rf"(<!-- AUTO:{nombre}:INICIO -->)(.*?)(<!-- AUTO:{nombre}:FIN -->)", re.S)
    if not patron.search(texto):
        print(f"Aviso: README.md no tiene las marcas AUTO:{nombre}; se saltea.", file=sys.stderr)
        return texto
    return patron.sub(lambda m: f"{m.group(1)}\n{contenido}\n{m.group(3)}", texto)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

    original = leer(README)
    if not original:
        print("No existe README.md", file=sys.stderr)
        return 1

    nuevo = original
    nuevo = reemplazar(nuevo, "AVANCE", seccion_avance())
    nuevo = reemplazar(nuevo, "DECISIONES", seccion_decisiones())
    nuevo = reemplazar(nuevo, "ESTRUCTURA", seccion_estructura())

    if nuevo == original:
        print("README.md ya estaba al día.")
        return 0
    if "--check" in sys.argv:
        print("README.md está desactualizado: corré  python scripts/actualizar_readme.py")
        return 1
    README.write_text(nuevo, encoding="utf-8", newline="\n")
    print("README.md actualizado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
