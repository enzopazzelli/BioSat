#!/usr/bin/env python3
"""
==============================================================================
BioSat · Módulo de Extracción e Interoperabilidad (PDF & JSON)
==============================================================================
Permite a cualquier otro módulo o integrante (Enzo para la web, Sara para Arduino):
  1. Extraer las métricas directamente del PDF usando `pdfplumber`.
  2. O leer el registro JSON estructurado equivalente para integraciones vía API.
"""

import os
import sys
import json
import pdfplumber

def extraer_desde_pdf(pdf_path):
    print(f"\n[EXTRACCIÓN PDFPLUMBER] Leyendo: {pdf_path}")
    if not os.path.exists(pdf_path):
        print(f"Error: No existe el archivo {pdf_path}")
        return None
        
    resultado = {"lineas_clave": []}
    with pdfplumber.open(pdf_path) as pdf:
        texto = pdf.pages[0].extract_text()
        for linea in texto.split('\n'):
            if any(palabra in linea for palabra in ["FECHA Y HORA", "FUENTE", "HUELLA DIGITAL", "Silueta", "Random Forest", "Zona"]):
                resultado["lineas_clave"].append(linea.strip())
                print(f"  • {linea.strip()}")
    return resultado

def extraer_desde_json(json_path):
    print(f"\n[EXTRACCIÓN API / JSON] Leyendo: {json_path}")
    if not os.path.exists(json_path):
        print(f"Error: No existe el archivo {json_path}")
        return None
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("Métricas estructuradas disponibles:")
    print(f"  - Timestamp: {data.get('timestamp')}")
    print(f"  - K-Means Silueta: {data['metricas']['kmeans']['silueta']}")
    print(f"  - Random Forest AUC: {data['metricas']['random_forest']['auc']}")
    print(f"  - Random Forest F1: {data['metricas']['random_forest']['f1']}")
    print(f"  - Riesgo Zona 3: {data['metricas']['riesgo_por_zona']['zona_3_monte_semiarido']}")
    return data

if __name__ == "__main__":
    registros_dir = "/Users/santig56/Desktop/Nasa/santi-task/registros"
    pdfs = [os.path.join(registros_dir, f) for f in os.listdir(registros_dir) if f.endswith(".pdf")]
    jsons = [os.path.join(registros_dir, f) for f in os.listdir(registros_dir) if f.endswith(".json")]
    
    if pdfs:
        extraer_desde_pdf(sorted(pdfs)[-1])
    if jsons:
        extraer_desde_json(sorted(jsons)[-1])
