"""
Script de integración de la API de Meteomatics (NASA Space Apps Challenge 2026).
Descarga pronóstico operativo de 7 días y métricas microclimáticas de alta resolución (ECMWF 9 km)
para las 5 Zonas Agroecológicas de Santiago del Estero.

Cuenta: hackathon_nasa_space_apps_gallardo_santiagoignacio
"""

import json
import os
import urllib.request
import base64
from datetime import datetime, timezone, timedelta

USER = os.getenv("METEOMATICS_USERNAME", "hackathon_nasa_space_apps_gallardo_santiagoignacio")
PASS = os.getenv("METEOMATICS_PASSWORD", "")

ZONAS = [
    {
        "id": "zona_1_riego_salitre",
        "nombre": "Zona 1: Área de Riego del Río Dulce",
        "lat": -27.73,
        "lon": -64.17
    },
    {
        "id": "zona_2_secano_este",
        "nombre": "Zona 2: Secano Agrícola del Este",
        "lat": -27.65,
        "lon": -62.42
    },
    {
        "id": "zona_3_monte_semiarido",
        "nombre": "Zona 3: Chaco Semiárido Norte",
        "lat": -26.58,
        "lon": -62.85
    },
    {
        "id": "zona_4_bajos_submeridionales",
        "nombre": "Zona 4: Bajos Submeridionales",
        "lat": -28.46,
        "lon": -62.83
    },
    {
        "id": "zona_5_sur_serrano",
        "nombre": "Zona 5: Sur Serrano y Salinas",
        "lat": -29.50,
        "lon": -63.70
    }
]

# Exactamente 10 parámetros (límite de la suscripción por request)
PARAMETROS = [
    "t_2m:C",
    "t_max_2m_24h:C",
    "t_min_2m_24h:C",
    "precip_24h:mm",
    "evapotranspiration_24h:mm",
    "soil_moisture_deficit:mm",
    "leaf_wetness:idx",
    "frost_warning_24h:idx",
    "wind_speed_10m:ms",
    "relative_humidity_2m:p"
]

def obtener_auth_header():
    auth_str = base64.b64encode(f"{USER}:{PASS}".encode("ascii")).decode("ascii")
    return {"Authorization": f"Basic {auth_str}"}

def descargar_pronostico_zona(zona):
    params_str = ",".join(PARAMETROS)
    t_start = datetime.now(timezone.utc).strftime("%Y-%m-%dT00:00:00Z")
    t_end = (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%dT00:00:00Z")
    time_range = f"{t_start}--{t_end}:P1D"
    
    url = f"https://api.meteomatics.com/{time_range}/{params_str}/{zona['lat']},{zona['lon']}/json"

    req = urllib.request.Request(url, headers=obtener_auth_header())
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Error descargando {zona['nombre']}: {e}")
        return None

def main():
    if not PASS:
        print("Aviso de Seguridad: La variable de entorno METEOMATICS_PASSWORD no está definida.")
        print("Uso: export METEOMATICS_PASSWORD='tu_clave_de_meteomatics'")
        print("El archivo existente data/meteomatics_santiago_zonas.json se conserva intacto.")
        return

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    salida = {
        "fuente": "Meteomatics Weather & Agro API (ECMWF IFS 9 km / Modelos Globales)",
        "evento": "NASA Space Apps Challenge 2026",
        "fecha_generacion": datetime.now(timezone.utc).isoformat(),
        "cuenta_hackathon": USER,
        "descripcion": "Pronóstico microclimático y agronómico operativo de 7 días para soporte en decisiones de siembra, secado de coberturas y alerta de fitopatógenos.",
        "parametros_incluidos": {
            "t_2m:C": "Temperatura media diaria del aire a 2 m (°C)",
            "t_max_2m_24h:C": "Temperatura máxima diaria (°C) - Detección de golpes de calor",
            "t_min_2m_24h:C": "Temperatura mínima diaria (°C) - Ventana de heladas",
            "precip_24h:mm": "Precipitación acumulada en 24 h (mm)",
            "evapotranspiration_24h:mm": "Evapotranspiración diaria acumulada (mm) - Demanda hídrica",
            "soil_moisture_deficit:mm": "Déficit de humedad en el suelo (mm) - Estrés hídrico",
            "leaf_wetness:idx": "Índice de mojamiento foliar (0/1) - Alerta de hongos fitopatógenos",
            "frost_warning_24h:idx": "Alerta de helada en 24 h (0=No, 1=Sí)",
            "wind_speed_10m:ms": "Velocidad de viento media (m/s) - Ventana de pulverización y deriva",
            "relative_humidity_2m:p": "Humedad relativa del aire (%)"
        },
        "zonas": []
    }

    for z in ZONAS:
        print(f"Descargando Meteomatics para {z['nombre']}...")
        data = descargar_pronostico_zona(z)
        if data and "data" in data:
            dias_dict = {}
            for p in data["data"]:
                p_name = p["parameter"]
                for pt in p["coordinates"][0]["dates"]:
                    d_str = pt["date"]
                    val = pt["value"]
                    if d_str not in dias_dict:
                        dias_dict[d_str] = {"fecha": d_str}
                    dias_dict[d_str][p_name] = val

            salida["zonas"].append({
                "id": z["id"],
                "nombre": z["nombre"],
                "lat": z["lat"],
                "lon": z["lon"],
                "pronostico_7_dias": list(dias_dict.values())
            })

    out_file = os.path.join(data_dir, "meteomatics_santiago_zonas.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(salida, f, indent=2, ensure_ascii=False)

    print(f"\n¡Éxito total! Datos guardados en:\n -> {out_file}")

if __name__ == "__main__":
    main()
