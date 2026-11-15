#!/usr/bin/env python3
"""
Actualiza las secciones automáticas del README de BioSat.

Qué hace:
  1. AVANCE:      cuenta las tareas [ ] y [x] de cada frente en PLAN.md.
  1b. PENDIENTE:  lista, por persona, las casillas sin tildar de su plan.
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
PLANES = RAIZ / "planes"
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
    "data/clima_zonas.json": "Clima NASA POWER 1981-2025 de las 5 zonas (lo lee la app)",
    "data/resumen_mensual_santiago.csv": "Normal 1991-2020 por mes y zona, para planilla",
    "data/suelo_zonas.json": "Suelo por zona: SoilGrids 0-30 cm sobre tierra agropecuaria (Earth Engine) · real",
    "data/diagnostico_landsat_ia.json": "Meses de suelo pelado con Landsat 2021-2025 y fragilidad (Earth Engine) · real",
    "data/zonificacion_aizal.json": "Zonificación k-means sobre TerraClimate y SoilGrids, 5 grupos (Earth Engine) · real",
    "data/desmonte_zonas.json": "Desmontes Hansen 2001-2025, modelo validado en el tiempo y riesgo por zona · real",
    "data/rotaciones_santiago.json": "15 rotaciones de las 5 zonas (Vale) · Zona 5 validada por un productor, el resto sin validar",
    "data/arduino_bandejas_demo.json": "Lecturas grabadas del kit (Sara) · plantilla vacía",
    "data/meteomatics_santiago_zonas.json": "Pronóstico de 7 días de Meteomatics por zona (Santi) · lo lee la app y se renueva todos los días (D-34)",
    "docs/entrevista-productor-bella-criolla.md": "Entrevista al productor de la Zona 5 y cruce con los datos (Vale)",
    "docs/integracion-meteomatics.md": "Cómo se integra Meteomatics (Santi)",
    "docs/memoria-del-proyecto.md": "Memoria de todo lo que hay en el repo: partes, datos, decisiones y pendientes",
    "docs/mockup/biosat-mockup.html": "Mockup original de la app (reemplazado por web/)",
    "docs/estado-del-proyecto.md": "Panorama general: qué está hecho, qué falta y qué riesgos hay",
    "ia_desmonte": "Pipeline de datos reales con Earth Engine: suelo, desmontes, zonificación, suelo pelado e imágenes",
    "ia_desmonte/salidas": "Muestras de Earth Engine y registro de la corrida (permiten reentrenar sin cuenta)",
    "ia_desmonte/pruebas": "Pruebas de Python del pipeline (pytest)",
    "archivo": "Material archivado que no alimenta la app",
    "archivo/prototipo-ia-simulado": "Primer prototipo de IA con datos SIMULADOS (no se usa; ver LEEME-PRIMERO.md)",
    "docs/datos-y-metodos.md": "Fuentes, métodos, métricas reales y limitaciones de los datos (se genera solo)",
    "tests/datos-contratos.test.js": "Prueba la forma de los datos reales de ia_desmonte/",
    "tests/inicio-logica.test.js": "Prueba el semáforo, la próxima siembra y el WhatsApp del Inicio",
    "tests/vistas.test.js": "Prueba las vistas Inicio, Reporte y la vista detallada (completo.html)",
    "tests/pronostico-logica.test.js": "Prueba el resumen y el vencimiento del pronóstico de Meteomatics",
    "scripts/captura-movil.mjs": "Captura la app emulando un celular de 390 px, u otro ancho con ANCHO (Chrome)",
    "scripts/descargar_meteomatics.py": "Descarga el pronóstico de Meteomatics por zona; no pisa el archivo si falla una zona",
    "scripts/pruebas": "Pruebas de Python de los scripts (pytest, sin internet)",
    "data/imagenes": "Compuestos de mediana Landsat del visor y mapa de la zonificación (Earth Engine)",
    "planes": "Plan de cada integrante y cómo trabajamos en ramas",
    "planes/README.md": "Objetivo común, ramas, reglas e hitos de integración",
    "planes/1-enzo.md": "Plan de Enzo · integración y app (rama enzo-app)",
    "planes/2-santi.md": "Plan de Santi · suelo, satélite e IA (rama santi-datos-ia)",
    "planes/3-vale.md": "Plan de Vale · campo y agronomía (rama vale-rotaciones)",
    "planes/4-sara.md": "Plan de Sara · Arduino y relato (rama sara-arduino-entrega)",
    "docs/BioSat-cruce-de-datos-validacion.docx": "Documento para que la profesora valide el enfoque",
    ".gitignore": "Archivos que git no sube",
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
    "docs/analisis-datos-nasa-santiago.md": "Informe de clima 1981-2025 de las 5 zonas (generado desde los datos)",
    "docs/contratos-de-datos.md": "Formato de los JSON que comparten los frentes",
    "docs/cruce-de-datos.md": "Qué sale de cruzar NASA POWER, AIZAL y Landsat; análisis de zonas",
    "docs/transcripcion-video-desafio.md": "Transcripción del video del desafío (los 4 verbos)",
    "docs/documentacion-tecnica-agronomica.md": "Secciones de cultivo A/B/C/D y reglas de rotación",
    "docs/glosario.md": "Términos técnicos en lenguaje de productor",
    "docs/plan-de-pasos-y-agentes.md": "Plan anterior (reemplazado por PLAN.md)",
    "docs/recursos-desafio.md": "Los 26 recursos oficiales y cómo los usamos",
    "docs/reglas-y-bitacora.md": "Reglas de oro y bitácora de decisiones",
    "docs/resena-desafio.md": "Reseña del desafío y guía de entrevista",
    "docs/zonas-santiago-y-kit-arduino.md": "Las 5 zonas, sus rotaciones y el kit Arduino",
    "scripts": "Herramientas para bajar y procesar datos",
    "scripts/actualizar_readme.py": "Regenera las secciones automáticas del README",
    "scripts/descargar_nasa_power.py": "Descarga y resume NASA POWER por zona",
    "scripts/earth_engine_embeddings.js": "Ejemplo GEE de embeddings (falta adaptar a SdE)",
    "scripts/gee_visor_biosat.js": "Visor GIS en Earth Engine: 2000 vs 2025, NDVI, desmonte, zonas IA",
    "scripts/gee_exportar_zonas.js": "Earth Engine: estadísticas e imágenes por zona para la app",
    "scripts/gee_zonas_y_desmonte.js": "Earth Engine: zonificación AIZAL y modelo predictivo de desmontes",
    "web": "App web BioSat (abrir con un servidor: ver Inicio rápido)",
    "web/index.html": "Página de la app",
    "web/app.js": "Lógica de la app: datos, motor, calendario, simulador y visor",
    "web/estilos.css": "Estilos de la app",
    "web/asistente-logica.js": "Lógica del asistente de inicio, sin interfaz (con pruebas)",
    "web/asistente.js": "Ventana del asistente de inicio: 4 preguntas y el mapa",
    "web/asistente.css": "Estilos del asistente de inicio (letra y botones grandes)",
    "web/frases-logica.js": "Frases simples que resumen cada paso (con pruebas)",
    "data/santiago_mapa.json": "Mapa de Santiago del Estero: 27 departamentos pintados por zona (IGN, vía geoBoundaries)",
    "scripts/generar_mapa_santiago.py": "Genera data/santiago_mapa.json desde geoBoundaries",
    "web/kit.html": "Pantalla del kit para la mesa del jurado (3 bandejas en vivo)",
    "web/kit.js": "Pantalla del kit: teclado, Arduino y dibujo de las bandejas",
    "web/kit-logica.js": "Lógica de la pantalla del kit, sin interfaz (con pruebas)",
    "web/kit.css": "Estilos de la pantalla del kit (tema oscuro de alto contraste)",
    "web/campo.html": "Guía Del kit al campo: del kit a estaciones fijas en el lote",
    "web/campo.css": "Estilos de la guía Del kit al campo",
    "tests": "Pruebas de Node (node --test tests/*.test.js)",
    "web/img": "Imágenes Landsat de vista previa (Planetary Computer)",
    "web/vendor": "Leaflet, para el mapa sin internet",
    "web/datos-borrador": "Rotaciones borrador: respaldo si una zona no tiene sus 3 rotaciones",
    "arduino": "Kit Arduino: sketch, lector Web Serial, esquema y guía de armado",
    "arduino/README.md": "Guía del kit: cómo armarlo, cargarlo, calibrarlo y usarlo con la app",
    "arduino/biosat_estacion_campo": "Sketch del Arduino Uno (línea JSON cada 2 s, LCD y LEDs)",
    "arduino/lector-web-serial.js": "Lee el Arduino por USB desde Chrome o Edge (window.BioSatArduino)",
    "arduino/esquema": "Esquema de conexiones: pines.json es la fuente; el resto se genera",
    "arduino/esquema/pines.json": "Fuente única de los pines y cables del kit",
    "arduino/esquema/generar-esquema.js": "Regenera el esquema SVG y la tabla desde pines.json",
    "arduino/esquema/esquema-conexiones.svg": "Esquema de conexiones (generado)",
    "arduino/esquema/tabla-de-conexiones.md": "Tabla de cables por pin y por componente (generada)",
    "arduino/esquema/concepto-original.jpeg": "Imagen del plan inicial (con LCD I2C; no es la que se arma)",
    "arduino/esquema/componentes-disponibles.webp": "Las piezas que tiene el equipo",
    "ia_landsat": "Módulo de IA con imágenes Landsat",
    "entrega": "Material para la presentación y la entrega",
}

# Carpetas que se muestran resumidas ("(N archivos)") aunque estén arriba.
COLAPSAR = {"data/raw_nasa_power", "archivo/prototipo-ia-simulado", "ia_desmonte/salidas"}
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


def contar_casillas(texto):
    tareas = re.findall(r"^\s*[-*]\s+\[( |x|X)\]", texto, re.M)
    return sum(1 for t in tareas if t.lower() == "x"), len(tareas)


def seccion_avance():
    # Si hay planes individuales (planes/N-nombre.md), el avance se cuenta por persona.
    planes = sorted(p for p in PLANES.glob("*.md") if p.name.lower() != "readme.md")
    if planes:
        filas = ["| Persona | Rama | Avance | Tareas |", "|---|---|---|---|"]
        th = tt = 0
        for p in planes:
            texto = leer(p)
            titulo = re.search(r"^# (?:Plan de )?(.+)$", texto, re.M)
            nombre = titulo.group(1).strip() if titulo else p.stem
            rama = re.search(r"\*\*Rama\*\*\s*\|\s*`([^`]+)`", texto)
            h, t = contar_casillas(texto)
            th += h; tt += t
            pct = round(100 * h / t) if t else 0
            enlace = f"[{nombre.replace('|', '/')}](planes/{p.name})"
            filas.append(f"| {enlace} | `{rama.group(1) if rama else '-'}` | `{barra(h, t)}` {pct}% | {h}/{t} |")
        pct = round(100 * th / tt) if tt else 0
        filas.append(f"| **Total** | | `{barra(th, tt)}` **{pct}%** | **{th}/{tt}** |")
        return "\n".join(filas)

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


# ------------------------------------------------------------ PENDIENTE

def seccion_pendiente():
    """Lista, por persona, las casillas sin tildar de su plan (con el hito al que pertenecen)."""
    planes = sorted(p for p in PLANES.glob("*.md") if p.name.lower() != "readme.md")
    bloques = []
    for p in planes:
        texto = leer(p)
        titulo = re.search(r"^# (?:Plan de )?(.+)$", texto, re.M)
        nombre = titulo.group(1).strip() if titulo else p.stem
        hito = ""
        abiertas = []
        for linea in texto.splitlines():
            h = re.match(r"^###\s+(.*)", linea)
            if h:
                hito = re.sub(r"\s*·.*$", "", h.group(1)).strip()
                continue
            if re.match(r"^## ", linea):
                hito = ""
                continue
            m = re.match(r"^\s*[-*]\s+\[ \]\s+(.*)", linea)
            if m:
                tarea = re.sub(r"\s+", " ", m.group(1)).strip()
                if len(tarea) > 190:
                    tarea = tarea[:187].rstrip() + "..."
                abiertas.append(f"- {tarea}" + (f" _({hito})_" if hito else ""))
        persona = nombre.split("·")[0].strip()
        if abiertas:
            bloques.append(
                f'<details>\n<summary><b>{persona}</b>: {len(abiertas)} pendientes '
                f'(<a href="planes/{p.name}">plan completo</a>)</summary>\n\n'
                + "\n".join(abiertas) + "\n\n</details>")
        else:
            bloques.append(f"**{persona}**: sin pendientes. ✅")
    return "\n\n".join(bloques) if bloques else "_No hay planes individuales todavía._"


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
    nuevo = reemplazar(nuevo, "PENDIENTE", seccion_pendiente())
    nuevo = reemplazar(nuevo, "DECISIONES", seccion_decisiones())
    nuevo = reemplazar(nuevo, "ESTRUCTURA", seccion_estructura())

    if nuevo == original:
        print("README.md ya estaba al día.")
        return 0
    if "--check" in sys.argv:
        print("README.md está desactualizado: corré  python scripts/actualizar_readme.py")
        return 1
    README.write_text(nuevo, encoding="utf-8")
    print("README.md actualizado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
