"""
Descarga y procesa el clima diario de NASA POWER (1981-2025) para las 5 zonas de BioSat.

Qué genera (ver docs/contratos-de-datos.md §1):
  - data/clima_zonas.json          -> lo que lee la app (calendario, simulador y riesgo)
  - data/resumen_mensual_santiago.csv -> la normal 1991-2020 por mes, para mirar en una planilla

Decisiones (D-16, D-21):
  - Lo "normal" es el promedio 1991-2020; lo "reciente", 2021-2025.
  - La demanda de agua es la ET0 de Hargreaves (con T2M_MAX y T2M_MIN). No se usa EVPTRNS,
    que NASA POWER entrega en energía (MJ/m²/día), no en milímetros.
  - Helada = mínima de 3 °C o menos a 2 m. Tormenta = 30 mm o más en un día.
  - La humedad en raíces (GWETROOT, 0 a 1) se muestra como anomalía contra lo normal del mismo mes.
  - Para el simulador se recalculan calor y ET0 sumando +0 a +2,5 °C a cada día real.

Uso:
    python scripts/descargar_nasa_power.py          # usa la caché si existe
    python scripts/descargar_nasa_power.py --bajar  # fuerza la descarga

Regla BioSat: código claro, en español y con respaldo local.
"""

import csv
import datetime as dt
import json
import math
import os
import statistics as st
import sys
import time
import urllib.request

ZONAS = [
    {"id": "zona_1_riego_salitre", "nombre": "Área de riego del Río Dulce", "lat": -27.73, "lon": -64.17},
    {"id": "zona_2_secano_este", "nombre": "Secano agrícola del este", "lat": -27.65, "lon": -62.42},
    {"id": "zona_3_monte_semiarido", "nombre": "Chaco semiárido norte", "lat": -26.58, "lon": -62.85},
    {"id": "zona_4_bajos_submeridionales", "nombre": "Bajos submeridionales", "lat": -28.46, "lon": -62.83},
    {"id": "zona_5_sur_serrano", "nombre": "Sur serrano y salinas", "lat": -29.50, "lon": -63.69},
]
PARAMETROS = "T2M_MAX,T2M_MIN,PRECTOTCORR,GWETROOT"
INICIO, FIN = "19810101", "20251231"
NORMAL = (1991, 2020)
RECIENTE = (2021, 2025)
ESCENARIOS = [0, 0.5, 1, 1.5, 2, 2.5]   # °C que se suman a cada día para el simulador

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(RAIZ, "data")
CACHE = os.path.join(DATA, "raw_nasa_power")


def descargar(zona):
    ruta = os.path.join(CACHE, f"{zona['id']}_1981_2025.json")
    if os.path.exists(ruta) and "--bajar" not in sys.argv:
        with open(ruta, encoding="utf-8") as f:
            return json.load(f)
    url = ("https://power.larc.nasa.gov/api/temporal/daily/point"
           f"?parameters={PARAMETROS}&community=AG&longitude={zona['lon']}&latitude={zona['lat']}"
           f"&start={INICIO}&end={FIN}&format=JSON")
    print(f"Descargando {zona['nombre']}...")
    t0 = time.time()
    with urllib.request.urlopen(url, timeout=180) as r:
        datos = json.loads(r.read().decode("utf-8"))["properties"]["parameter"]
    print(f"  listo en {time.time() - t0:.1f} s")
    os.makedirs(CACHE, exist_ok=True)
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(datos, f)
    return datos


def radiacion_extraterrestre_mm(lat, dia_juliano):
    """Ra de FAO-56 (ec. 21), pasada a mm/día de agua evaporada (× 0,408)."""
    phi = math.radians(lat)
    dr = 1 + 0.033 * math.cos(2 * math.pi * dia_juliano / 365)
    decl = 0.409 * math.sin(2 * math.pi * dia_juliano / 365 - 1.39)
    ws = math.acos(-math.tan(phi) * math.tan(decl))
    ra = 24 * 60 / math.pi * 0.0820 * dr * (ws * math.sin(phi) * math.sin(decl)
                                            + math.cos(phi) * math.cos(decl) * math.sin(ws))
    return ra * 0.408


def et0_hargreaves(tmax, tmin, ra_mm):
    return 0.0023 * ra_mm * ((tmax + tmin) / 2 + 17.8) * math.sqrt(max(tmax - tmin, 0))


def acumular(zona, d, desde, hasta):
    """Junta los valores diarios por (año, mes)."""
    tx, tn, pr, gw = d["T2M_MAX"], d["T2M_MIN"], d["PRECTOTCORR"], d["GWETROOT"]
    acc = {}
    for k in sorted(tx):
        anio, mes = int(k[:4]), int(k[4:6])
        if not (desde <= anio <= hasta) or tx[k] < -900 or tn[k] < -900:
            continue
        fecha = dt.date(anio, mes, int(k[6:]))
        ra = radiacion_extraterrestre_mm(zona["lat"], fecha.timetuple().tm_yday)
        e = acc.setdefault((anio, mes), {"lluvia": 0.0, "tormentas": 0, "heladas": 0, "helo": False,
                                          "tmax": [], "tmin": [], "gwet": [],
                                          "d35": [0] * len(ESCENARIOS), "d40": [0] * len(ESCENARIOS),
                                          "et0": [0.0] * len(ESCENARIOS)})
        lluvia = max(pr.get(k, 0), 0)
        e["lluvia"] += lluvia
        e["tormentas"] += lluvia >= 30
        e["heladas"] += tn[k] <= 3
        e["helo"] = e["helo"] or tn[k] <= 0
        e["tmax"].append(tx[k])
        e["tmin"].append(tn[k])
        if gw.get(k, -999) > -900:
            e["gwet"].append(gw[k])
        for i, delta in enumerate(ESCENARIOS):
            e["d35"][i] += tx[k] + delta >= 35
            e["d40"][i] += tx[k] + delta >= 40
            e["et0"][i] += et0_hargreaves(tx[k] + delta, tn[k] + delta, ra)
    return acc


def percentil(valores, p):
    v = sorted(valores)
    return v[min(len(v) - 1, max(0, round(p * (len(v) - 1))))]


def resumir_periodo(acc, humedad_normal=None):
    anios = sorted({a for a, _ in acc})
    meses = []
    for m in range(1, 13):
        es = [acc[(a, m)] for a in anios if (a, m) in acc]
        lluvias = [e["lluvia"] for e in es]
        gwet = [x for e in es for x in e["gwet"]]
        humedad = round(st.mean(gwet), 3) if gwet else None
        base = humedad_normal[m - 1] if humedad_normal else humedad
        meses.append({
            "mes": m,
            "tmax_c": round(st.mean(x for e in es for x in e["tmax"]), 1),
            "tmin_c": round(st.mean(x for e in es for x in e["tmin"]), 1),
            "lluvia_mm": {"media": round(st.mean(lluvias), 1), "p10": round(percentil(lluvias, .1), 1),
                          "mediana": round(percentil(lluvias, .5), 1), "p90": round(percentil(lluvias, .9), 1)},
            "tormentas_30mm": round(st.mean(e["tormentas"] for e in es), 2),
            "dias_helada_3c": round(st.mean(e["heladas"] for e in es), 1),
            "prob_helada_pct": round(100 * sum(e["helo"] for e in es) / len(es)),
            "humedad_raices": humedad,
            "humedad_raices_anomalia": round(humedad - base, 3) if humedad is not None and base is not None else None,
            "dias_calor_35": [round(st.mean(e["d35"][i] for e in es), 1) for i in range(len(ESCENARIOS))],
            "dias_calor_40": [round(st.mean(e["d40"][i] for e in es), 1) for i in range(len(ESCENARIOS))],
            "et0_mm": [round(st.mean(e["et0"][i] for e in es), 1) for i in range(len(ESCENARIOS))],
        })
    por_anio = [{"anio": a,
                 "dias_calor_40": [[acc[(a, m)]["d40"][i] if (a, m) in acc else 0 for m in range(1, 13)]
                                   for i in range(len(ESCENARIOS))],
                 "tormentas_30mm": [acc[(a, m)]["tormentas"] if (a, m) in acc else 0 for m in range(1, 13)]}
                for a in anios]
    return {"meses": meses, "anios": por_anio}


def resumen_anual(per):
    meses = per["meses"]
    lluvia = sum(m["lluvia_mm"]["media"] for m in meses)
    et0 = sum(m["et0_mm"][0] for m in meses)
    return {"lluvia_mm": round(lluvia), "et0_mm": round(et0), "balance_mm": round(lluvia - et0),
            "dias_calor_35": round(sum(m["dias_calor_35"][0] for m in meses), 1),
            "dias_calor_40": round(sum(m["dias_calor_40"][0] for m in meses), 1),
            "dias_helada_3c": round(sum(m["dias_helada_3c"] for m in meses), 1)}


def procesar(zona, d):
    tx, tn, pr = d["T2M_MAX"], d["T2M_MIN"], d["PRECTOTCORR"]
    normal = resumir_periodo(acumular(zona, d, *NORMAL))
    humedad_normal = [m["humedad_raices"] for m in normal["meses"]]
    reciente = resumir_periodo(acumular(zona, d, *RECIENTE), humedad_normal)

    # Fechas típicas de helada (mediana 1991-2020 de la primera y la última del año)
    primeras, ultimas = [], []
    for a in range(NORMAL[0], NORMAL[1] + 1):
        dias = [dt.date(a, int(k[4:6]), int(k[6:])).timetuple().tm_yday
                for k in tn if k.startswith(str(a)) and -900 < tn[k] <= 3]
        if dias:
            primeras.append(min(dias))
            ultimas.append(max(dias))
    dd_mm = lambda j: (dt.date(2001, 1, 1) + dt.timedelta(days=round(j) - 1)).strftime("%d/%m")

    claves = sorted(tx)
    record = max(claves, key=lambda k: tx[k])
    racha = mejor = 0
    fin = None
    for k in claves:
        racha = racha + 1 if 0 <= pr[k] < 2 else 0
        if racha > mejor:
            mejor, fin = racha, k
    fecha = lambda k: f"{k[6:]}/{k[4:6]}/{k[:4]}"
    an_n, an_r = resumen_anual(normal), resumen_anual(reciente)
    return {
        "nombre": zona["nombre"], "lat": zona["lat"], "lon": zona["lon"],
        "anual": {k: {"normal": an_n[k], "reciente": an_r[k]} for k in an_n} | {
            "primera_helada_tipica": dd_mm(st.median(primeras)) if primeras else None,
            "ultima_helada_tipica": dd_mm(st.median(ultimas)) if ultimas else None,
            "racha_seca_max": {"dias": mejor, "termino": fecha(fin)},
            "record_tmax": {"c": round(tx[record], 1), "fecha": fecha(record)},
        },
        "serie_dias_calor_40": {"desde": int(INICIO[:4]),
                                "valores": [sum(1 for k in tx if k.startswith(str(a)) and tx[k] >= 40)
                                            for a in range(int(INICIO[:4]), int(FIN[:4]) + 1)]},
        "periodos": {"normal": normal, "reciente": reciente},
    }


def main():
    salida = {
        "meta": {
            "fuente": "NASA POWER (MERRA-2), modelo de reanálisis, celda de ~50 km",
            "generado_por": "scripts/descargar_nasa_power.py",
            "fecha": dt.date.today().isoformat(),
            "periodo_normal": f"{NORMAL[0]}-{NORMAL[1]}",
            "periodo_reciente": f"{RECIENTE[0]}-{RECIENTE[1]}",
            "escenarios_temperatura_c": ESCENARIOS,
            "notas": "ET0 de Hargreaves con T2M_MAX y T2M_MIN; balance = lluvia − ET0. Helada = mínima ≤ 3 °C. "
                     "Tormenta = lluvia ≥ 30 mm en un día. Las listas de 6 valores corresponden a los escenarios "
                     "de temperatura (+0 a +2,5 °C).",
        },
        "zonas": {},
    }
    filas = []
    for zona in ZONAS:
        z = procesar(zona, descargar(zona))
        salida["zonas"][zona["id"]] = z
        a = z["anual"]
        print(f"{zona['id']}: lluvia {a['lluvia_mm']['normal']} mm, balance {a['balance_mm']['normal']} mm, "
              f"días > 40 °C {a['dias_calor_40']['normal']} → {a['dias_calor_40']['reciente']}")
        for m in z["periodos"]["normal"]["meses"]:
            filas.append({"zona_id": zona["id"], "zona_nombre": zona["nombre"], "lat": zona["lat"], "lon": zona["lon"],
                          "mes": m["mes"], "tmax_c": m["tmax_c"], "tmin_c": m["tmin_c"],
                          "lluvia_media_mm": m["lluvia_mm"]["media"], "lluvia_p10_mm": m["lluvia_mm"]["p10"],
                          "lluvia_p90_mm": m["lluvia_mm"]["p90"], "et0_mm": m["et0_mm"][0],
                          "balance_mm": round(m["lluvia_mm"]["media"] - m["et0_mm"][0], 1),
                          "dias_calor_35": m["dias_calor_35"][0], "dias_calor_40": m["dias_calor_40"][0],
                          "dias_helada_3c": m["dias_helada_3c"], "prob_helada_pct": m["prob_helada_pct"],
                          "tormentas_30mm": m["tormentas_30mm"], "humedad_raices": m["humedad_raices"]})

    with open(os.path.join(DATA, "clima_zonas.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(salida, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(DATA, "resumen_mensual_santiago.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(filas[0].keys()))
        w.writeheader()
        w.writerows(filas)
    print("Listo: data/clima_zonas.json y data/resumen_mensual_santiago.csv (normal 1991-2020)")


if __name__ == "__main__":
    main()
