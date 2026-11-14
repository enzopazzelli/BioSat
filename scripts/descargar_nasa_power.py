"""
Script para descargar y procesar datos reales de NASA POWER (2020-2025, 2.192 días por zona)
para las 4 Zonas Agroecológicas de Santiago del Estero (Proyecto BioSat).

Regla BioSat: Código claro, en español y con respaldo local en JSON/CSV.
"""

import json
import csv
import os
import time
import urllib.request
from collections import defaultdict

# Definición de las 4 Zonas Agroecológicas de Santiago del Estero
ZONAS_SANTIAGO = [
    {
        "id": "zona_1_riego_salitre",
        "nombre": "Zona 1: Área de Riego del Río Dulce (Suelos Salitrosos)",
        "referencia": "La Banda / Robles / Beltrán",
        "lat": -27.73,
        "lon": -64.17,
        "problematica_clave": "Salinización por ascenso de napa freática cuando el suelo queda desnudo y alta evaporación."
    },
    {
        "id": "zona_2_secano_este",
        "nombre": "Zona 2: Secano Agrícola del Este (Poca Agua y Calor Extremo)",
        "referencia": "Quimilí / Bandera (Moreno / Taboada)",
        "lat": -27.65,
        "lon": -62.42,
        "problematica_clave": "Agricultura sin riego, bache seco en invierno-primavera, golpes de calor (>35 °C) y pérdida de rastrojo."
    },
    {
        "id": "zona_3_monte_semiarido",
        "nombre": "Zona 3: Chaco Semiárido y Monte (Desmonte y Sistemas Silvopastoriles)",
        "referencia": "Campo Gallo / Monte Quemado / Ojo de Agua",
        "lat": -26.58,
        "lon": -62.85,
        "problematica_clave": "Escasez severa de agua, vulnerabilidad por desmonte a cero, erosión térmica y falta de forraje en invierno."
    },
    {
        "id": "zona_4_bajos_submeridionales",
        "nombre": "Zona 4: Bajos Submeridionales (Inundación Alternada con Sequía Salina)",
        "referencia": "Añatuya / Los Juríes / Pinto",
        "lat": -28.46,
        "lon": -62.83,
        "problematica_clave": "Pendiente casi nula, suelos arcillosos que se encharcan con lluvias fuertes y se agrietan con salitre en la seca."
    }
]

# Los 5 parámetros clave de NASA POWER (Comunidad Agroclimatológica 'AG')
# T2M_MAX: Temp. máxima diaria (°C)
# T2M_MIN: Temp. mínima diaria (°C)
# PRECTOTCORR: Lluvia diaria corregida (mm/día)
# GWETROOT: Humedad en zona de raíces (0 a 1)
# EVPTRNS: Evapotranspiración / transpiración (mm/día)
PARAMETROS = "T2M_MAX,T2M_MIN,PRECTOTCORR,GWETROOT,EVPTRNS"

FECHA_INICIO = "20200101"
FECHA_FIN = "20251231"
ANIOS = list(range(2020, 2026))  # 6 años completos (2.192 días por zona)

NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]


def descargar_zona(zona, raw_path):
    # Si ya se descargó antes, reutilizar archivo local para rapidez
    if os.path.exists(raw_path) and os.path.getsize(raw_path) > 10000:
        print(f"Usando caché local existente para {zona['nombre']}...")
        with open(raw_path, "r", encoding="utf-8") as f:
            return json.load(f)

    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point"
        f"?parameters={PARAMETROS}"
        f"&community=AG"
        f"&longitude={zona['lon']}"
        f"&latitude={zona['lat']}"
        f"&start={FECHA_INICIO}"
        f"&end={FECHA_FIN}"
        f"&format=JSON"
    )
    print(f"Descargando NASA POWER para {zona['nombre']} ({zona['lat']}, {zona['lon']})...")
    t0 = time.time()
    with urllib.request.urlopen(url, timeout=60) as resp:
        datos = json.loads(resp.read().decode("utf-8"))
    print(f" -> Descargado en {round(time.time() - t0, 1)} s")
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(datos, f)
    return datos


def procesar_datos_zona(zona, raw_json):
    param_data = raw_json["properties"]["parameter"]
    fechas = sorted(param_data["T2M_MAX"].keys())

    acum_mes = {m: defaultdict(list) for m in range(1, 13)}
    lluvia_por_anio_mes = defaultdict(float)
    et_por_anio_mes = defaultdict(float)
    dias_calor_35_por_anio_mes = defaultdict(int)
    dias_calor_40_por_anio_mes = defaultdict(int)
    dias_helada_agro_por_anio_mes = defaultdict(int)
    dias_tormenta_fuerte_por_anio_mes = defaultdict(int)

    for fecha in fechas:
        anio = int(fecha[:4])
        mes = int(fecha[4:6])
        clave_am = (anio, mes)

        tmax = param_data["T2M_MAX"].get(fecha, -999)
        tmin = param_data["T2M_MIN"].get(fecha, -999)
        rain = param_data["PRECTOTCORR"].get(fecha, -999)
        gwet_root = param_data["GWETROOT"].get(fecha, -999)
        evp = param_data["EVPTRNS"].get(fecha, -999)

        if tmax > -900:
            acum_mes[mes]["tmax"].append(tmax)
            if tmax >= 35.0:
                dias_calor_35_por_anio_mes[clave_am] += 1
            if tmax >= 40.0:
                dias_calor_40_por_anio_mes[clave_am] += 1

        if tmin > -900:
            acum_mes[mes]["tmin"].append(tmin)
            # Helada agronómica (<= 3 °C a 2m equivale a riesgo de 0 °C a ras del suelo)
            if tmin <= 3.0:
                dias_helada_agro_por_anio_mes[clave_am] += 1

        if rain > -900:
            lluvia_por_anio_mes[clave_am] += rain
            if rain >= 30.0:
                dias_tormenta_fuerte_por_anio_mes[clave_am] += 1

        if evp > -900:
            et_por_anio_mes[clave_am] += evp

        if gwet_root > -900:
            acum_mes[mes]["gwet_root"].append(gwet_root * 100.0)

    resumen_mensual = []
    lluvia_anual_prom = 0.0
    et_anual_prom = 0.0

    for mes in range(1, 13):
        lluvias_mes = [lluvia_por_anio_mes[(a, mes)] for a in ANIOS]
        ets_mes = [et_por_anio_mes[(a, mes)] for a in ANIOS]
        calor35_mes = [dias_calor_35_por_anio_mes[(a, mes)] for a in ANIOS]
        calor40_mes = [dias_calor_40_por_anio_mes[(a, mes)] for a in ANIOS]
        heladas_mes = [dias_helada_agro_por_anio_mes[(a, mes)] for a in ANIOS]
        tormentas_mes = [dias_tormenta_fuerte_por_anio_mes[(a, mes)] for a in ANIOS]

        prom_lluvia = round(sum(lluvias_mes) / len(lluvias_mes), 1)
        prom_et = round(sum(ets_mes) / len(ets_mes), 1)
        balance_hidrico = round(prom_lluvia - prom_et, 1)

        lluvia_anual_prom += prom_lluvia
        et_anual_prom += prom_et

        fila_mes = {
            "mes_num": mes,
            "mes_nombre": NOMBRES_MESES[mes - 1],
            "temp_max_prom_c": round(sum(acum_mes[mes]["tmax"]) / len(acum_mes[mes]["tmax"]), 1),
            "temp_min_prom_c": round(sum(acum_mes[mes]["tmin"]) / len(acum_mes[mes]["tmin"]), 1),
            "dias_calor_mayor_35c": round(sum(calor35_mes) / len(calor35_mes), 1),
            "dias_calor_extremo_mayor_40c": round(sum(calor40_mes) / len(calor40_mes), 1),
            "dias_riesgo_helada_menor_3c": round(sum(heladas_mes) / len(heladas_mes), 1),
            "lluvia_prom_mm": prom_lluvia,
            "evapotranspiracion_prom_mm": prom_et,
            "balance_hidrico_mm": balance_hidrico,
            "humedad_raices_gwetroot_pct": round(sum(acum_mes[mes]["gwet_root"]) / len(acum_mes[mes]["gwet_root"]), 1),
            "dias_lluvia_intensa_mayor_30mm": round(sum(tormentas_mes) / len(tormentas_mes), 2)
        }
        resumen_mensual.append(fila_mes)

    return {
        "id": zona["id"],
        "nombre": zona["nombre"],
        "referencia": zona["referencia"],
        "coordenadas": {"lat": zona["lat"], "lon": zona["lon"]},
        "periodo_analizado": "2020-2025 (2.192 días diarios reales — NASA POWER)",
        "problematica_clave": zona["problematica_clave"],
        "indicadores_anuales": {
            "lluvia_anual_promedio_mm": round(lluvia_anual_prom, 1),
            "evapotranspiracion_anual_mm": round(et_anual_prom, 1),
            "balance_hidrico_anual_mm": round(lluvia_anual_prom - et_anual_prom, 1),
            "dias_anuales_calor_mayor_35c": round(sum(m["dias_calor_mayor_35c"] for m in resumen_mensual), 1),
            "dias_anuales_calor_mayor_40c": round(sum(m["dias_calor_extremo_mayor_40c"] for m in resumen_mensual), 1),
            "dias_anuales_riesgo_helada": round(sum(m["dias_riesgo_helada_menor_3c"] for m in resumen_mensual), 1),
            "humedad_raices_minima_anual_pct": min(m["humedad_raices_gwetroot_pct"] for m in resumen_mensual),
            "humedad_raices_maxima_anual_pct": max(m["humedad_raices_gwetroot_pct"] for m in resumen_mensual)
        },
        "calendario_mensual": resumen_mensual
    }


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    raw_dir = os.path.join(data_dir, "raw_nasa_power")
    os.makedirs(raw_dir, exist_ok=True)

    resultado_general = {
        "fuente": "NASA POWER Agroclimatology API (MERRA-2)",
        "periodo": "2020-01-01 a 2025-12-31 (2.192 días diarios por zona)",
        "provincia": "Santiago del Estero, Argentina",
        "zonas": []
    }

    filas_csv = []

    for zona in ZONAS_SANTIAGO:
        raw_path = os.path.join(raw_dir, f"{zona['id']}_raw.json")
        raw_json = descargar_zona(zona, raw_path)

        procesado = procesar_datos_zona(zona, raw_json)
        resultado_general["zonas"].append(procesado)

        for m in procesado["calendario_mensual"]:
            filas_csv.append({
                "zona_id": zona["id"],
                "zona_nombre": zona["nombre"],
                "lat": zona["lat"],
                "lon": zona["lon"],
                **m
            })

    out_json = os.path.join(data_dir, "nasa_power_santiago_zonas.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(resultado_general, f, ensure_ascii=False, indent=2)

    out_csv = os.path.join(data_dir, "resumen_mensual_santiago.csv")
    if filas_csv:
        with open(out_csv, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=list(filas_csv[0].keys()))
            writer.writeheader()
            writer.writerows(filas_csv)

    print(f"\nListo. Archivos guardados en:\n - {out_json}\n - {out_csv}")


if __name__ == "__main__":
    main()
