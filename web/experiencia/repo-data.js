window.BIOSAT_REPO_DATA = {
  "commit": "63c12a7015cb48beb3e32dc76825374ea091bab8",
  "sources": {
    "climate": {
      "name": "NASA POWER (MERRA-2)",
      "date": "2026-11-14",
      "normal": "1991-2020",
      "recent": "2021-2025",
      "scale": "~50 km, punto por zona"
    },
    "soil": {
      "name": "SoilGrids 2.0 + GRIP4",
      "date": "2026-11-14",
      "scale": "250 m, resumen por zona",
      "method": "Media, mediana y percentiles 10 y 90 por zona a 250 m. Suelo: promedio 0-30 cm ponderado por espesor. Se mide sobre tierra agropecuaria (WorldCover clases 30 y 40); si hay menos de 2000 píxeles, sobre la zona completa (ver area_medida)."
    },
    "satellite": {
      "name": "Landsat 8/9 + ESA WorldCover",
      "date": "2026-11-15",
      "period": "2021-2025",
      "method": "600 puntos al azar sobre cultivos por zona. En cada punto, NDVI mediano (a 100 m) de cada mes calendario (2021-2025, sin nubes). Mes pelado: al menos la mitad de los puntos con NDVI < 0.25. Sensibilidad con 0,20 y 0,30: si cambia, el mes queda en meses_dudosos.",
      "evaluation": "sin datos de campo: no hay exactitud medible"
    },
    "deforestation": {
      "name": "Hansen GFC v1.13 + random forest",
      "date": "2026-11-15",
      "aucTest": 0.634,
      "methods": {
        "regresion_logistica": {
          "auc": 0.616,
          "auc_cv": 0.715,
          "f1": 0.176,
          "accuracy": 0.772,
          "kappa": 0.062,
          "pr_auc": 0.119,
          "umbral": 0.182
        },
        "random_forest": {
          "auc": 0.634,
          "auc_cv": 0.778,
          "f1": 0.2,
          "accuracy": 0.76,
          "kappa": 0.084,
          "pr_auc": 0.13,
          "umbral": 0.176
        },
        "gradient_boosting": {
          "auc": 0.629,
          "auc_cv": 0.769,
          "f1": 0.179,
          "accuracy": 0.811,
          "kappa": 0.078,
          "pr_auc": 0.126,
          "umbral": 0.19
        },
        "temporal": {
          "metodo": "promedio_3",
          "error_ha_pct": 31.2
        }
      },
      "chosenMethod": "random_forest",
      "validation": "entrena con monte y predictores al 2008 y desmonte 2009-2015; prueba con monte y predictores al 2015 y desmonte 2016-2025"
    },
    "rotations": {
      "name": "BioSat + bibliografía + revisión local",
      "date": "2026-11-14"
    }
  },
  "zones": {
    "zona_1_riego_salitre": {
      "name": "Área de riego del Río Dulce",
      "lat": -27.73,
      "lon": -64.17,
      "climate": {
        "normal": {
          "rain": 763,
          "et0": 1783,
          "heat40": 16.2,
          "frost": 9.6
        },
        "recent": {
          "rain": 824,
          "et0": 1819,
          "heat40": 30.6,
          "frost": 9.6
        },
        "normalMonthly": [
          {
            "month": 1,
            "rain": 159.1,
            "rainP10": 74.6,
            "rainP90": 268.1,
            "heat35": 18.9,
            "heat40": 3.3,
            "et0": 217.4,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.5,
            "tmin": 21.0,
            "rootMoisture": 0.538,
            "storms30": 1.23
          },
          {
            "month": 2,
            "rain": 126.1,
            "rainP10": 75.6,
            "rainP90": 170.5,
            "heat35": 11.8,
            "heat40": 1.3,
            "et0": 173.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.8,
            "tmin": 20.2,
            "rootMoisture": 0.557,
            "storms30": 0.87
          },
          {
            "month": 3,
            "rain": 106.9,
            "rainP10": 37.2,
            "rainP90": 163.7,
            "heat35": 6.8,
            "heat40": 0.3,
            "et0": 157.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.0,
            "tmin": 18.7,
            "rootMoisture": 0.554,
            "storms30": 0.7
          },
          {
            "month": 4,
            "rain": 53.2,
            "rainP10": 16.7,
            "rainP90": 96.5,
            "heat35": 1.8,
            "heat40": 0,
            "et0": 114.4,
            "frost": 0.0,
            "frostProbability": 0,
            "tmax": 28.8,
            "tmin": 15.6,
            "rootMoisture": 0.541,
            "storms30": 0.13
          },
          {
            "month": 5,
            "rain": 19.8,
            "rainP10": 5.1,
            "rainP90": 38.0,
            "heat35": 0.3,
            "heat40": 0,
            "et0": 87.5,
            "frost": 0.3,
            "frostProbability": 3,
            "tmax": 25.3,
            "tmin": 11.7,
            "rootMoisture": 0.512,
            "storms30": 0.07
          },
          {
            "month": 6,
            "rain": 14.0,
            "rainP10": 1.6,
            "rainP90": 44.6,
            "heat35": 0,
            "heat40": 0,
            "et0": 70.9,
            "frost": 2.4,
            "frostProbability": 10,
            "tmax": 22.9,
            "tmin": 8.5,
            "rootMoisture": 0.494,
            "storms30": 0.07
          },
          {
            "month": 7,
            "rain": 2.8,
            "rainP10": 0.1,
            "rainP90": 5.7,
            "heat35": 0.1,
            "heat40": 0,
            "et0": 79.0,
            "frost": 4.6,
            "frostProbability": 43,
            "tmax": 22.7,
            "tmin": 7.1,
            "rootMoisture": 0.475,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 4.5,
            "rainP10": 0.0,
            "rainP90": 11.4,
            "heat35": 2.1,
            "heat40": 0.1,
            "et0": 110.1,
            "frost": 2.1,
            "frostProbability": 10,
            "tmax": 26.3,
            "tmin": 9.4,
            "rootMoisture": 0.455,
            "storms30": 0
          },
          {
            "month": 9,
            "rain": 14.4,
            "rainP10": 0.8,
            "rainP90": 39.0,
            "heat35": 5.7,
            "heat40": 0.6,
            "et0": 145.1,
            "frost": 0.2,
            "frostProbability": 0,
            "tmax": 29.8,
            "tmin": 12.8,
            "rootMoisture": 0.447,
            "storms30": 0.07
          },
          {
            "month": 10,
            "rain": 55.1,
            "rainP10": 15.2,
            "rainP90": 87.9,
            "heat35": 10.8,
            "heat40": 2.7,
            "et0": 190.5,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.1,
            "tmin": 16.7,
            "rootMoisture": 0.459,
            "storms30": 0.2
          },
          {
            "month": 11,
            "rain": 84.7,
            "rainP10": 27.4,
            "rainP90": 154.8,
            "heat35": 14.7,
            "heat40": 3.5,
            "et0": 210.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 34.8,
            "tmin": 18.6,
            "rootMoisture": 0.482,
            "storms30": 0.37
          },
          {
            "month": 12,
            "rain": 122.4,
            "rainP10": 74.2,
            "rainP90": 162.9,
            "heat35": 18.8,
            "heat40": 4.4,
            "et0": 226.3,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.8,
            "tmin": 20.6,
            "rootMoisture": 0.509,
            "storms30": 0.57
          }
        ],
        "monthly": [
          {
            "month": 1,
            "rain": 118.2,
            "rainP10": 78.0,
            "rainP90": 192.1,
            "heat35": 23.8,
            "heat40": 8.8,
            "et0": 231.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 37.5,
            "tmin": 22.1,
            "rootMoisture": 0.508,
            "storms30": 0.8
          },
          {
            "month": 2,
            "rain": 90.3,
            "rainP10": 40.6,
            "rainP90": 156.2,
            "heat35": 18,
            "heat40": 5.8,
            "et0": 188.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 36.2,
            "tmin": 21.3,
            "rootMoisture": 0.519,
            "storms30": 0.4
          },
          {
            "month": 3,
            "rain": 256.2,
            "rainP10": 90.8,
            "rainP90": 601.8,
            "heat35": 11.8,
            "heat40": 1.2,
            "et0": 159.4,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.9,
            "tmin": 20.0,
            "rootMoisture": 0.57,
            "storms30": 2.4
          },
          {
            "month": 4,
            "rain": 61.9,
            "rainP10": 32.4,
            "rainP90": 134.7,
            "heat35": 1,
            "heat40": 0,
            "et0": 110.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 28.2,
            "tmin": 15.4,
            "rootMoisture": 0.571,
            "storms30": 0
          },
          {
            "month": 5,
            "rain": 9.6,
            "rainP10": 0.9,
            "rainP90": 16.5,
            "heat35": 0.2,
            "heat40": 0,
            "et0": 84.1,
            "frost": 1,
            "frostProbability": 0,
            "tmax": 24.2,
            "tmin": 11.0,
            "rootMoisture": 0.53,
            "storms30": 0
          },
          {
            "month": 6,
            "rain": 49.9,
            "rainP10": 1.9,
            "rainP90": 208.0,
            "heat35": 0.2,
            "heat40": 0,
            "et0": 70.0,
            "frost": 2.8,
            "frostProbability": 40,
            "tmax": 22.5,
            "tmin": 8.4,
            "rootMoisture": 0.503,
            "storms30": 0.2
          },
          {
            "month": 7,
            "rain": 4.5,
            "rainP10": 0.0,
            "rainP90": 12.8,
            "heat35": 0.4,
            "heat40": 0,
            "et0": 80.1,
            "frost": 4.8,
            "frostProbability": 40,
            "tmax": 23.4,
            "tmin": 8.2,
            "rootMoisture": 0.483,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 3.9,
            "rainP10": 0.0,
            "rainP90": 14.2,
            "heat35": 2.2,
            "heat40": 0,
            "et0": 110.6,
            "frost": 1,
            "frostProbability": 0,
            "tmax": 26.4,
            "tmin": 9.3,
            "rootMoisture": 0.459,
            "storms30": 0
          },
          {
            "month": 9,
            "rain": 6.3,
            "rainP10": 1.6,
            "rainP90": 16.4,
            "heat35": 6.8,
            "heat40": 2,
            "et0": 150.4,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 31.1,
            "tmin": 14.0,
            "rootMoisture": 0.444,
            "storms30": 0
          },
          {
            "month": 10,
            "rain": 54.3,
            "rainP10": 8.2,
            "rainP90": 125.1,
            "heat35": 11.2,
            "heat40": 3.2,
            "et0": 191.4,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.3,
            "tmin": 16.9,
            "rootMoisture": 0.459,
            "storms30": 0.4
          },
          {
            "month": 11,
            "rain": 81.9,
            "rainP10": 29.7,
            "rainP90": 115.7,
            "heat35": 15.4,
            "heat40": 3.8,
            "et0": 211.9,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.0,
            "tmin": 18.5,
            "rootMoisture": 0.483,
            "storms30": 0.4
          },
          {
            "month": 12,
            "rain": 87.3,
            "rainP10": 46.7,
            "rainP90": 140.2,
            "heat35": 22.4,
            "heat40": 5.8,
            "et0": 230.4,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 36.5,
            "tmin": 21.2,
            "rootMoisture": 0.49,
            "storms30": 0.2
          }
        ]
      },
      "soil": {
        "ph": 7.09,
        "phConfidence": "media",
        "clay": 20.72,
        "carbon": 13.13,
        "area": "tierra agropecuaria",
        "metrics": {
          "ph": {
            "value": 7.09,
            "range": [
              6.88,
              7.25
            ],
            "confidence": "media",
            "code": "B16",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "arcilla_pct": {
            "value": 20.72,
            "range": [
              15.56,
              25.31
            ],
            "confidence": "media",
            "code": "B12",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "carbono_organico_g_kg": {
            "value": 13.13,
            "range": [
              11.69,
              14.68
            ],
            "confidence": "media",
            "code": "B15",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "nitrogeno_g_kg": {
            "value": 1.23,
            "range": [
              1.07,
              1.4
            ],
            "confidence": "media",
            "code": "B11",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "densidad_aparente_g_cm3": {
            "value": 1.35,
            "range": [
              1.31,
              1.38
            ],
            "confidence": "media",
            "code": "B18",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "distancia_caminos_km": {
            "value": 1.41,
            "range": [
              0.19,
              3.06
            ],
            "confidence": "media",
            "code": "B36",
            "source": "GRIP4 (Meijer y otros, 2018)"
          }
        }
      },
      "satellite": {
        "lowMonths": 0,
        "uncertainMonths": 5,
        "monthlyFraction": [
          0.088,
          0.01,
          0.015,
          0.008,
          0.023,
          0.05,
          0.152,
          0.25,
          0.352,
          0.432,
          0.438,
          0.258
        ],
        "lowFlags": [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false
        ],
        "uncertainFlags": [
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true,
          true,
          false
        ],
        "samplePoints": [
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600
        ],
        "confidence": "media"
      },
      "deforestation": {
        "forestPct": 30.97,
        "risk": 0.053,
        "confidence": "media",
        "history": {
          "desde": 2001,
          "valores": [
            7703.6,
            4849.9,
            15413.8,
            16322.5,
            10976.6,
            17846.5,
            16204.8,
            16620.4,
            9618.5,
            15891.4,
            17420.7,
            6951.9,
            12388.8,
            8588.3,
            6241.7,
            4670.7,
            3982.6,
            3685.5,
            2136.7,
            3627.0,
            3406.2,
            3213.4,
            3280.2,
            3131.6,
            3092.6
          ]
        },
        "projection": {
          "anios": [
            2026,
            2027,
            2028,
            2029
          ],
          "valores": [
            3168.1,
            3168.1,
            3168.1,
            3168.1
          ]
        },
        "historyConfidence": "alta",
        "projectionConfidence": "baja"
      },
      "rotations": {
        "validatedBy": "sin validar",
        "items": [
          {
            "id": "z1_actual",
            "type": "actual",
            "name": "Algodón sobre algodón con barbecho pelado de invierno",
            "sequence": [
              "Algodón"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "rastrojo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Algodón",
                "seccion": "C",
                "siembra_mes": 11,
                "cosecha_mes": 4
              }
            ],
            "evidence": [
              {
                "texto": "Déficit evaporativo de -1.020 mm/año (lluvia normal 763 mm frente a alta demanda atmosférica) que succiona agua salina hacia la superficie cuando el suelo queda desnudo en invierno y primavera.",
                "dato": "clima_zonas.zona_1_riego_salitre.anual.balance_mm",
                "fuente": "NASA POWER (1991-2020)"
              },
              {
                "texto": "Los días de calor extremo (> 40 °C) pasaron de 16,2 días/año en la normal 1991-2020 a 28,9 días/año en 2020-2025, acelerando la evaporación directa desde el suelo pelado.",
                "dato": "clima_zonas.zona_1_riego_salitre.anual.dias_calor_40",
                "fuente": "NASA POWER"
              }
            ],
            "benefits": [
              "Manejo y comercialización de fibra ya conocidos por el productor local.",
              "Permite labores mecánicas de destrucción de rastrojo obligatorias contra el picudo del algodonero."
            ],
            "attributes": {
              "demanda_agua": "alta",
              "aporte_nitrogeno": "negativo",
              "meses_suelo_desnudo": 5,
              "forraje": false,
              "ingreso": "medio",
              "requiere_riego": true,
              "maquinaria_especial": "cosechadora de algodón y desmalezadora de rastrojo",
              "requiere_hacienda": false
            },
            "sources": [
              "INTA EEA Santiago del Estero — Manejo de suelos salinos y sódicos en el Área de Riego del Río Dulce",
              "SENASA / INTA — Programa Nacional de Prevención y Erradicación del Picudo del Algodonero"
            ],
            "reason": "Es el esquema tradicional del área de riego del Río Dulce: deja el lote pelado de junio a octubre tras el deslintado y destrucción de rastrojo, favoreciendo el ascenso capilar de sales desde la napa freática.",
            "missing": [
              "Conductividad eléctrica real del suelo (dS/m) y profundidad actual de la napa freática en el lote.",
              "Calidad salina del turno de agua de riego disponible y nivel de infestación local de picudo."
            ],
            "risks": [
              "Salinización progresiva de la cama de siembra por 5 meses de suelo desnudo expuesto al sol y viento norte.",
              "Acumulación del picudo del algodonero y enfermedades de raíz por falta de rotación con gramíneas."
            ]
          },
          {
            "id": "z1_alt1",
            "type": "alternativa",
            "name": "Escudo antisalitre: Algodón + Cobertura (Cebada + Melilotus) + Maíz",
            "sequence": [
              "Algodón",
              "Cebada forrajera + Melilotus alba",
              "Maíz bajo riego"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "rastrojo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Algodón",
                "seccion": "C",
                "siembra_mes": 11,
                "cosecha_mes": 4
              },
              {
                "cultivo": "Cebada forrajera + Melilotus alba",
                "seccion": "D",
                "siembra_mes": 5,
                "cosecha_mes": 9
              },
              {
                "cultivo": "Maíz bajo riego",
                "seccion": "A",
                "siembra_mes": 12,
                "cosecha_mes": 5
              }
            ],
            "evidence": [
              {
                "texto": "Entre mayo y septiembre la lluvia cae por debajo de 9 mm/mes mientras la máxima ya sube a 31 °C en septiembre; tapar el suelo con cobertura evita que el sol evapore la humedad subsuperficial (GWETROOT ~44-52 %).",
                "dato": "clima_zonas.zona_1_riego_salitre.anual.lluvia_mm",
                "fuente": "NASA POWER"
              },
              {
                "texto": "Evalúa el pH del suelo en el perfil superior para confirmar la buena adaptación del Melilotus alba (trébol de olor) en ambientes alcalinos/salinos.",
                "dato": "suelo_zonas.zona_1_riego_salitre.ph",
                "fuente": "AIZAL V4 (SoilGrids B16)"
              }
            ],
            "benefits": [
              "Cero meses de suelo desnudo: la sombra vegetal y el rastrojo frenan el ascenso capilar de sales.",
              "El Melilotus fija nitrógeno atmosférico para el maíz siguiente y la rotación corta el ciclo del picudo del algodonero.",
              "Posibilidad de aprovechar un pastoreo liviano o corte forrajero de invierno."
            ],
            "attributes": {
              "demanda_agua": "media",
              "aporte_nitrogeno": "positivo",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "alto",
              "requiere_riego": true,
              "maquinaria_especial": "rolo faca o pulverizadora para secado de cobertura",
              "requiere_hacienda": false
            },
            "sources": [
              "INTA EEA Santiago del Estero — Cultivos de cobertura y consociaciones invernales en suelos salinos bajo riego",
              "AIZAL V4 — Módulos de Química (B11, B16) y Clima (B03, B04)"
            ],
            "reason": "Cubre el suelo en el bache seco de mayo a septiembre (cuando llueven apenas 3 a 9 mm/mes) con especies tolerantes a la salinidad, cortando la evaporación superficial que hace subir el salitre y fijando nitrógeno biológico.",
            "missing": [
              "Disponibilidad de turno de riego en otoño (abril-mayo) para implantar la cobertura invernal.",
              "Residualidad de herbicidas usados en el algodón que puedan afectar la emergencia del Melilotus."
            ],
            "risks": [
              "Si el secado o rolado de la cebada y el Melilotus se demora más allá de septiembre, puede consumir la humedad necesaria para la siembra de verano.",
              "Respetar el vacío sanitario obligatorio entre la destrucción del rastrojo de algodón y el cultivo siguiente."
            ]
          },
          {
            "id": "z1_alt2",
            "type": "alternativa",
            "name": "Bomba biológica profunda: Pastura de Alfalfa + Sorgo + Trigo",
            "sequence": [
              "Alfalfa (ciclo 3 años)",
              "Sorgo granífero o forrajero",
              "Trigo de invierno"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Alfalfa (ciclo 3 años)",
                "seccion": "B",
                "siembra_mes": 4,
                "cosecha_mes": 3
              },
              {
                "cultivo": "Sorgo granífero o forrajero",
                "seccion": "A",
                "siembra_mes": 11,
                "cosecha_mes": 4
              },
              {
                "cultivo": "Trigo de invierno",
                "seccion": "A",
                "siembra_mes": 5,
                "cosecha_mes": 10
              }
            ],
            "evidence": [
              {
                "texto": "En marzo se concentran 226,7 mm de lluvia promedio (con récords de 207 mm en 24 h) y la humedad radicular supera el 56 %, elevando la napa; la alfalfa actúa como bomba biológica de drenaje.",
                "dato": "clima_zonas.zona_1_riego_salitre.anual.balance_mm",
                "fuente": "NASA POWER"
              },
              {
                "texto": "Aporta nitrógeno biológico masivo y mejora la estructura física en suelos con limitaciones de densidad aparente y nitrógeno total.",
                "dato": "suelo_zonas.zona_1_riego_salitre.nitrogeno_g_kg",
                "fuente": "AIZAL V4 (SoilGrids B11)"
              }
            ],
            "benefits": [
              "Cobertura viva los 12 meses del año y depresión efectiva de la napa freática para frenar el salitre.",
              "Alto ingreso continuo por venta de fardos o rollos de alfalfa de calidad en la cuenca lechera y ganadera.",
              "Recuperación de la fertilidad nitrogenada y del carbono orgánico del lote tras 3 años de pastura."
            ],
            "attributes": {
              "demanda_agua": "alta",
              "aporte_nitrogeno": "positivo",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "alto",
              "requiere_riego": true,
              "maquinaria_especial": "segadora acondicionadora y enfardadora o rotoenfardadora",
              "requiere_hacienda": false
            },
            "sources": [
              "INTA EEA Santiago del Estero — Producción de alfalfa bajo riego y manejo del agua en el Río Dulce",
              "Basigalup, D. H. (Ed.) — El cultivo de la alfalfa en la Argentina (Ediciones INTA)"
            ],
            "reason": "Las raíces profundas de la alfalfa consumen excedentes hídricos subsuperficiales (en marzo caen 226,7 mm de lluvia media más el riego), deprimen la napa freática salina, fijan nitrógeno y generan fardos de alta rentabilidad local.",
            "missing": [
              "Nivel exacto de nivelación láser del lote para evitar encharcamientos que asfixien la corona de la alfalfa.",
              "Análisis de fósforo disponible (P) y salinidad inicial en los primeros 30 cm antes de sembrar alfalfa."
            ],
            "risks": [
              "La alfalfa es muy sensible al anegamiento prolongado (> 48 h) si el lote no drena bien tras lluvias torrenciales de marzo.",
              "Alta inversión inicial en semilla e implantación que se amortiza a lo largo de 3 a 4 campañas."
            ]
          }
        ]
      }
    },
    "zona_2_secano_este": {
      "name": "Secano agrícola del este",
      "lat": -27.65,
      "lon": -62.42,
      "climate": {
        "normal": {
          "rain": 830,
          "et0": 1716,
          "heat40": 13.6,
          "frost": 6.9
        },
        "recent": {
          "rain": 702,
          "et0": 1775,
          "heat40": 31.6,
          "frost": 6.0
        },
        "normalMonthly": [
          {
            "month": 1,
            "rain": 134.7,
            "rainP10": 71.6,
            "rainP90": 216.7,
            "heat35": 16.4,
            "heat40": 2.6,
            "et0": 206.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.0,
            "tmin": 22.0,
            "rootMoisture": 0.46,
            "storms30": 0.63
          },
          {
            "month": 2,
            "rain": 111.6,
            "rainP10": 52.9,
            "rainP90": 154.2,
            "heat35": 11.7,
            "heat40": 1.6,
            "et0": 168.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.8,
            "tmin": 21.2,
            "rootMoisture": 0.461,
            "storms30": 0.37
          },
          {
            "month": 3,
            "rain": 118.3,
            "rainP10": 41.1,
            "rainP90": 152.9,
            "heat35": 7.3,
            "heat40": 0.3,
            "et0": 154.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.0,
            "tmin": 19.6,
            "rootMoisture": 0.467,
            "storms30": 0.63
          },
          {
            "month": 4,
            "rain": 77.6,
            "rainP10": 24.9,
            "rainP90": 120.5,
            "heat35": 2.3,
            "heat40": 0,
            "et0": 109.4,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 28.4,
            "tmin": 16.4,
            "rootMoisture": 0.476,
            "storms30": 0.4
          },
          {
            "month": 5,
            "rain": 30.4,
            "rainP10": 8.7,
            "rainP90": 63.6,
            "heat35": 0.3,
            "heat40": 0,
            "et0": 84.4,
            "frost": 0.2,
            "frostProbability": 3,
            "tmax": 25.0,
            "tmin": 12.5,
            "rootMoisture": 0.454,
            "storms30": 0.1
          },
          {
            "month": 6,
            "rain": 16.8,
            "rainP10": 4.5,
            "rainP90": 30.5,
            "heat35": 0,
            "heat40": 0,
            "et0": 69.5,
            "frost": 1.9,
            "frostProbability": 13,
            "tmax": 23.1,
            "tmin": 9.9,
            "rootMoisture": 0.43,
            "storms30": 0.03
          },
          {
            "month": 7,
            "rain": 6.5,
            "rainP10": 1.1,
            "rainP90": 12.1,
            "heat35": 0.2,
            "heat40": 0,
            "et0": 78.6,
            "frost": 3.4,
            "frostProbability": 23,
            "tmax": 23.0,
            "tmin": 8.6,
            "rootMoisture": 0.408,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 12.1,
            "rainP10": 0.6,
            "rainP90": 29.7,
            "heat35": 3.2,
            "heat40": 0.1,
            "et0": 108.5,
            "frost": 1.4,
            "frostProbability": 13,
            "tmax": 26.5,
            "tmin": 10.8,
            "rootMoisture": 0.387,
            "storms30": 0
          },
          {
            "month": 9,
            "rain": 21.6,
            "rainP10": 4.0,
            "rainP90": 45.6,
            "heat35": 5.7,
            "heat40": 1.1,
            "et0": 141.7,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 29.6,
            "tmin": 13.8,
            "rootMoisture": 0.382,
            "storms30": 0.03
          },
          {
            "month": 10,
            "rain": 73.8,
            "rainP10": 33.5,
            "rainP90": 114.1,
            "heat35": 9.9,
            "heat40": 2.6,
            "et0": 184.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.6,
            "tmin": 17.3,
            "rootMoisture": 0.402,
            "storms30": 0.2
          },
          {
            "month": 11,
            "rain": 99.9,
            "rainP10": 48.0,
            "rainP90": 168.4,
            "heat35": 11.2,
            "heat40": 2.3,
            "et0": 198.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.7,
            "tmin": 18.9,
            "rootMoisture": 0.433,
            "storms30": 0.57
          },
          {
            "month": 12,
            "rain": 126.4,
            "rainP10": 75.0,
            "rainP90": 216.6,
            "heat35": 14.7,
            "heat40": 3.0,
            "et0": 212.4,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 34.8,
            "tmin": 21.1,
            "rootMoisture": 0.449,
            "storms30": 0.67
          }
        ],
        "monthly": [
          {
            "month": 1,
            "rain": 94.5,
            "rainP10": 60.2,
            "rainP90": 161.8,
            "heat35": 24.8,
            "heat40": 8.4,
            "et0": 225.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 37.5,
            "tmin": 23.3,
            "rootMoisture": 0.418,
            "storms30": 0.4
          },
          {
            "month": 2,
            "rain": 80.6,
            "rainP10": 49.6,
            "rainP90": 129.0,
            "heat35": 18.6,
            "heat40": 6.6,
            "et0": 183.1,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 36.4,
            "tmin": 22.8,
            "rootMoisture": 0.425,
            "storms30": 0.4
          },
          {
            "month": 3,
            "rain": 187.1,
            "rainP10": 75.2,
            "rainP90": 327.0,
            "heat35": 11.8,
            "heat40": 2.8,
            "et0": 154.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.9,
            "tmin": 21.1,
            "rootMoisture": 0.483,
            "storms30": 1.6
          },
          {
            "month": 4,
            "rain": 57.5,
            "rainP10": 12.3,
            "rainP90": 104.5,
            "heat35": 1,
            "heat40": 0,
            "et0": 109.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 28.4,
            "tmin": 16.4,
            "rootMoisture": 0.466,
            "storms30": 0
          },
          {
            "month": 5,
            "rain": 12.3,
            "rainP10": 3.4,
            "rainP90": 25.6,
            "heat35": 0,
            "heat40": 0,
            "et0": 83.2,
            "frost": 0.8,
            "frostProbability": 0,
            "tmax": 24.5,
            "tmin": 12.0,
            "rootMoisture": 0.43,
            "storms30": 0
          },
          {
            "month": 6,
            "rain": 20.1,
            "rainP10": 0.6,
            "rainP90": 81.8,
            "heat35": 0.2,
            "heat40": 0,
            "et0": 69.7,
            "frost": 1.2,
            "frostProbability": 20,
            "tmax": 23.1,
            "tmin": 10.1,
            "rootMoisture": 0.405,
            "storms30": 0.2
          },
          {
            "month": 7,
            "rain": 2.9,
            "rainP10": 0.1,
            "rainP90": 9.3,
            "heat35": 0.8,
            "heat40": 0,
            "et0": 81.7,
            "frost": 3.6,
            "frostProbability": 40,
            "tmax": 24.5,
            "tmin": 10.0,
            "rootMoisture": 0.386,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 3.9,
            "rainP10": 0.1,
            "rainP90": 8.5,
            "heat35": 3.6,
            "heat40": 0,
            "et0": 110.4,
            "frost": 0.4,
            "frostProbability": 0,
            "tmax": 27.1,
            "tmin": 11.1,
            "rootMoisture": 0.374,
            "storms30": 0
          },
          {
            "month": 9,
            "rain": 9.2,
            "rainP10": 4.5,
            "rainP90": 13.0,
            "heat35": 6.4,
            "heat40": 2.6,
            "et0": 148.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 31.0,
            "tmin": 14.8,
            "rootMoisture": 0.372,
            "storms30": 0
          },
          {
            "month": 10,
            "rain": 53.9,
            "rainP10": 13.7,
            "rainP90": 126.4,
            "heat35": 11,
            "heat40": 3,
            "et0": 189.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.3,
            "tmin": 17.4,
            "rootMoisture": 0.387,
            "storms30": 0.4
          },
          {
            "month": 11,
            "rain": 88.6,
            "rainP10": 30.2,
            "rainP90": 134.6,
            "heat35": 14,
            "heat40": 3.2,
            "et0": 202.4,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 34.4,
            "tmin": 19.5,
            "rootMoisture": 0.419,
            "storms30": 0.6
          },
          {
            "month": 12,
            "rain": 91.3,
            "rainP10": 45.9,
            "rainP90": 157.1,
            "heat35": 18.4,
            "heat40": 5,
            "et0": 217.7,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.7,
            "tmin": 21.9,
            "rootMoisture": 0.425,
            "storms30": 0.4
          }
        ]
      },
      "soil": {
        "ph": 7.07,
        "phConfidence": "media",
        "clay": 26.04,
        "carbon": 15.12,
        "area": "tierra agropecuaria",
        "metrics": {
          "ph": {
            "value": 7.07,
            "range": [
              6.8,
              7.28
            ],
            "confidence": "media",
            "code": "B16",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "arcilla_pct": {
            "value": 26.04,
            "range": [
              16.87,
              33.87
            ],
            "confidence": "media",
            "code": "B12",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "carbono_organico_g_kg": {
            "value": 15.12,
            "range": [
              13.56,
              17.18
            ],
            "confidence": "media",
            "code": "B15",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "nitrogeno_g_kg": {
            "value": 1.46,
            "range": [
              1.3,
              1.62
            ],
            "confidence": "media",
            "code": "B11",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "densidad_aparente_g_cm3": {
            "value": 1.36,
            "range": [
              1.33,
              1.39
            ],
            "confidence": "media",
            "code": "B18",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "distancia_caminos_km": {
            "value": 1.79,
            "range": [
              0.22,
              3.97
            ],
            "confidence": "media",
            "code": "B36",
            "source": "GRIP4 (Meijer y otros, 2018)"
          }
        }
      },
      "satellite": {
        "lowMonths": 4,
        "uncertainMonths": 7,
        "monthlyFraction": [
          0.215,
          0.008,
          0.003,
          0.002,
          0.007,
          0.093,
          0.318,
          0.482,
          0.633,
          0.825,
          0.843,
          0.787
        ],
        "lowFlags": [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true
        ],
        "uncertainFlags": [
          true,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true,
          true,
          true
        ],
        "samplePoints": [
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600
        ],
        "confidence": "media"
      },
      "deforestation": {
        "forestPct": 32.77,
        "risk": 0.155,
        "confidence": "media",
        "history": {
          "desde": 2001,
          "valores": [
            8658.7,
            5868.0,
            44927.5,
            52432.8,
            50184.3,
            42432.7,
            69736.7,
            40726.0,
            24316.6,
            33736.8,
            90871.0,
            53809.0,
            33003.7,
            23424.2,
            13785.7,
            19102.9,
            18031.9,
            14386.8,
            8530.1,
            14858.8,
            20387.4,
            20469.7,
            14286.6,
            20726.6,
            23705.1
          ]
        },
        "projection": {
          "anios": [
            2026,
            2027,
            2028,
            2029
          ],
          "valores": [
            19572.8,
            19572.8,
            19572.8,
            19572.8
          ]
        },
        "historyConfidence": "alta",
        "projectionConfidence": "baja"
      },
      "rotations": {
        "validatedBy": "sin validar",
        "items": [
          {
            "id": "z2_actual",
            "type": "actual",
            "name": "Monocultivo de soja de verano con barbecho largo desnudo",
            "sequence": [
              "Soja de verano"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "rastrojo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Soja de verano",
                "seccion": "B",
                "siembra_mes": 12,
                "cosecha_mes": 4
              }
            ],
            "evidence": [
              {
                "texto": "Promedio de 111 días/año con más de 35 °C y más de 30 días/año por encima de 40 °C en el período reciente (con récords de 46,5 °C en octubre), que mineralizan la materia orgánica cuando el suelo está pelado.",
                "dato": "clima_zonas.zona_2_secano_este.anual.dias_calor_40",
                "fuente": "NASA POWER"
              },
              {
                "texto": "Déficit hídrico estructural (830 mm de lluvia normal frente a -886 mm de balance lluvia - ET0) y piso de humedad radicular (GWETROOT) de apenas 37,2 % en septiembre.",
                "dato": "clima_zonas.zona_2_secano_este.anual.balance_mm",
                "fuente": "NASA POWER"
              }
            ],
            "benefits": [
              "Menor costo de implantación que las gramíneas y liquidez comercial inmediata.",
              "Logística, maquinaria y manejo ampliamente difundidos en el este provincial."
            ],
            "attributes": {
              "demanda_agua": "media",
              "aporte_nitrogeno": "neutro",
              "meses_suelo_desnudo": 6,
              "forraje": false,
              "ingreso": "medio",
              "requiere_riego": false,
              "maquinaria_especial": "ninguna",
              "requiere_hacienda": false
            },
            "sources": [
              "INTA EEA Quimilí — Efecto del monocultivo de soja sobre las propiedades físicas y químicas en el Chaco Semiárido",
              "Red de Ensayos de Soja del NEA (INTA)"
            ],
            "reason": "El monocultivo de soja en secano (Quimilí / Bandera) deja un rastrojo escaso y de rápida descomposición (baja relación C/N), exponiendo el suelo desnudo durante 6 meses al calor extremo y a las tormentas de primavera-verano.",
            "missing": [
              "Presencia de piso de arado o compactación subsuperficial a 20-30 cm (prueba de pala o penetrómetro).",
              "Presencia de malezas resistentes a glifosato y nivel de fósforo extractable en el lote."
            ],
            "risks": [
              "6 meses de suelo desnudo provocan planchado superficial, pérdida de infiltración ante tormentas de más de 100 mm en marzo y caída del stock de carbono.",
              "Alto riesgo de quiebre de rinde si una ola de calor (> 40 °C) coincide con el llenado de vainas en febrero."
            ]
          },
          {
            "id": "z2_alt1",
            "type": "alternativa",
            "name": "Colchón de rastrojo: Soja + Maíz tardío o Sorgo granífero",
            "sequence": [
              "Soja de verano",
              "Maíz tardío o Sorgo granífero"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Soja de verano",
                "seccion": "B",
                "siembra_mes": 12,
                "cosecha_mes": 4
              },
              {
                "cultivo": "Maíz tardío o Sorgo granífero",
                "seccion": "A",
                "siembra_mes": 12,
                "cosecha_mes": 6
              }
            ],
            "evidence": [
              {
                "texto": "Concentración de lluvias en verano (marzo aporta 171,9 mm promedio) que recarga la humedad en raíces al 47,3 %, asegurando agua en el período crítico del maíz tardío o sorgo.",
                "dato": "clima_zonas.zona_2_secano_este.anual.lluvia_mm",
                "fuente": "NASA POWER"
              },
              {
                "texto": "El aporte de rastrojo rico en carbono (alta relación C/N) recompone el carbono orgánico edáfico en suelos del secano este.",
                "dato": "suelo_zonas.zona_2_secano_este.carbono_organico_g_kg",
                "fuente": "AIZAL V4 (SoilGrids B15)"
              }
            ],
            "benefits": [
              "Reduce a cero los meses de suelo desnudo gracias al rastrojo persistente de caña de maíz o sorgo.",
              "Mejora la infiltración de las lluvias intensas de verano y reduce la temperatura superficial del suelo en más de 10 °C.",
              "Corta ciclos de enfermedades fúngicas y malezas difíciles del monocultivo de soja."
            ],
            "attributes": {
              "demanda_agua": "media",
              "aporte_nitrogeno": "neutro",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "medio",
              "requiere_riego": false,
              "maquinaria_especial": "sembradora de directa con cuchillas turbo para cortar rastrojo",
              "requiere_hacienda": false
            },
            "sources": [
              "INTA EEA Quimilí — Rotaciones agrícolas y secuencias con gramíneas en el este de Santiago del Estero",
              "AIZAL V4 — Módulos de Carbono Orgánico (B15) y Distancia a Caminos (B36)"
            ],
            "reason": "Alternar leguminosa (Sección B) con gramínea estival tardía (Sección A) ubica la floración del maíz o sorgo en febrero-marzo (cuando llueven 88 a 172 mm/mes) y deja un grueso colchón de rastrojo que protege el suelo todo el invierno.",
            "missing": [
              "Distancia real al acopio y costo de flete para comercializar el grano de sorgo o maíz (B36).",
              "Agua útil almacenada en el perfil a la fecha de siembra en diciembre."
            ],
            "risks": [
              "Menor margen bruto del sorgo o maíz frente a la soja cuando la distancia a puerto supera el umbral económico y no se transforma en carne en origen.",
              "Inmovilización temporal de nitrógeno por el rastrojo de gramínea si no se ajusta la fertilización."
            ]
          },
          {
            "id": "z2_alt2",
            "type": "alternativa",
            "name": "Puente verde regulado: Soja + Cobertura (Vicia villosa + Centeno) + Maíz tardío",
            "sequence": [
              "Soja de verano",
              "Vicia villosa + Centeno (cultivo de servicio)",
              "Maíz tardío"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Soja de verano",
                "seccion": "B",
                "siembra_mes": 12,
                "cosecha_mes": 4
              },
              {
                "cultivo": "Vicia villosa + Centeno (cultivo de servicio)",
                "seccion": "D",
                "siembra_mes": 4,
                "cosecha_mes": 8
              },
              {
                "cultivo": "Maíz tardío",
                "seccion": "A",
                "siembra_mes": 12,
                "cosecha_mes": 6
              }
            ],
            "evidence": [
              {
                "texto": "Entre julio y septiembre apenas llueven 13,5 mm acumulados y el agua en raíces cae al mínimo de 37,2 % en septiembre: por eso la regla agronómica exige secar el puente verde en agosto.",
                "dato": "clima_zonas.zona_2_secano_este.anual.balance_mm",
                "fuente": "NASA POWER"
              },
              {
                "texto": "Compensa la limitación de nitrógeno total del suelo mediante fijación simbiótica de la vicia antes del maíz.",
                "dato": "suelo_zonas.zona_2_secano_este.nitrogeno_g_kg",
                "fuente": "AIZAL V4 (SoilGrids B11)"
              }
            ],
            "benefits": [
              "Aporte de 40 a 80 kg N/ha fijados biológicamente por la Vicia villosa para el maíz tardío.",
              "Control físico de malezas de otoño-invierno (rama negra, yuyo colorado) reduciendo el uso de herbicidas.",
              "Cobertura 100 % del suelo durante los meses de viento norte y tormentas primaverales."
            ],
            "attributes": {
              "demanda_agua": "alta",
              "aporte_nitrogeno": "positivo",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "alto",
              "requiere_riego": false,
              "maquinaria_especial": "rolo faca o equipo pulverizador para terminación temprana en agosto",
              "requiere_hacienda": false
            },
            "sources": [
              "INTA EEA Quimilí / AAPRESID — Red de Cultivos de Servicio en el Chaco Semiárido: manejo del costo hídrico",
              "AIZAL V4 — Química y Nutrición de Suelo (B11, B15)"
            ],
            "reason": "Intercala un cultivo de servicio consociado (Sección D: gramínea + leguminosa) en otoño-invierno que fija nitrógeno biológico para el maíz tardío, suprime malezas resistentes y mantiene raíces vivas sin dejar el suelo desnudo.",
            "missing": [
              "Milímetros de agua útil en los primeros 100 cm de suelo en abril (post-cosecha de soja) para decidir si sembrar el cultivo de servicio.",
              "Historial de herbicidas residuales aplicados en soja que puedan dañar la vicia."
            ],
            "risks": [
              "Compensación crítica (trade-off): si el otoño es muy seco o si la cobertura se seca tarde (septiembre/octubre), el cultivo de servicio consume el agua del perfil y compromete la recarga para el maíz de diciembre.",
              "Costo adicional de semilla de vicia e inoculante específico."
            ]
          }
        ]
      }
    },
    "zona_3_monte_semiarido": {
      "name": "Chaco semiárido norte",
      "lat": -26.58,
      "lon": -62.85,
      "climate": {
        "normal": {
          "rain": 810,
          "et0": 1783,
          "heat40": 17.3,
          "frost": 5.0
        },
        "recent": {
          "rain": 683,
          "et0": 1843,
          "heat40": 38.0,
          "frost": 4.6
        },
        "normalMonthly": [
          {
            "month": 1,
            "rain": 161.3,
            "rainP10": 86.6,
            "rainP90": 244.7,
            "heat35": 16.9,
            "heat40": 2.7,
            "et0": 207.1,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.1,
            "tmin": 21.9,
            "rootMoisture": 0.548,
            "storms30": 1.13
          },
          {
            "month": 2,
            "rain": 131.9,
            "rainP10": 69.1,
            "rainP90": 181.6,
            "heat35": 11.1,
            "heat40": 1.3,
            "et0": 168.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.7,
            "tmin": 21.2,
            "rootMoisture": 0.562,
            "storms30": 0.57
          },
          {
            "month": 3,
            "rain": 113.0,
            "rainP10": 45.4,
            "rainP90": 177.7,
            "heat35": 7.2,
            "heat40": 0.3,
            "et0": 156.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.3,
            "tmin": 19.7,
            "rootMoisture": 0.558,
            "storms30": 0.5
          },
          {
            "month": 4,
            "rain": 61.9,
            "rainP10": 29.4,
            "rainP90": 95.1,
            "heat35": 2.8,
            "heat40": 0,
            "et0": 116.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 29.4,
            "tmin": 16.7,
            "rootMoisture": 0.547,
            "storms30": 0.1
          },
          {
            "month": 5,
            "rain": 25.4,
            "rainP10": 9.3,
            "rainP90": 43.0,
            "heat35": 0.6,
            "heat40": 0,
            "et0": 91.5,
            "frost": 0.1,
            "frostProbability": 3,
            "tmax": 26.2,
            "tmin": 12.8,
            "rootMoisture": 0.516,
            "storms30": 0.03
          },
          {
            "month": 6,
            "rain": 13.4,
            "rainP10": 2.1,
            "rainP90": 32.1,
            "heat35": 0,
            "heat40": 0,
            "et0": 75.7,
            "frost": 1.3,
            "frostProbability": 10,
            "tmax": 24.3,
            "tmin": 10.2,
            "rootMoisture": 0.491,
            "storms30": 0.03
          },
          {
            "month": 7,
            "rain": 4.5,
            "rainP10": 1.1,
            "rainP90": 8.4,
            "heat35": 0.3,
            "heat40": 0,
            "et0": 84.9,
            "frost": 2.8,
            "frostProbability": 20,
            "tmax": 24.2,
            "tmin": 8.9,
            "rootMoisture": 0.473,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 6.8,
            "rainP10": 0.5,
            "rainP90": 18.7,
            "heat35": 4.5,
            "heat40": 0.2,
            "et0": 116.2,
            "frost": 0.8,
            "frostProbability": 3,
            "tmax": 27.8,
            "tmin": 11.4,
            "rootMoisture": 0.463,
            "storms30": 0
          },
          {
            "month": 9,
            "rain": 15.7,
            "rainP10": 4.5,
            "rainP90": 40.4,
            "heat35": 7.7,
            "heat40": 1.6,
            "et0": 149.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 30.9,
            "tmin": 14.6,
            "rootMoisture": 0.464,
            "storms30": 0.03
          },
          {
            "month": 10,
            "rain": 59.9,
            "rainP10": 25.6,
            "rainP90": 99.3,
            "heat35": 12.3,
            "heat40": 4.0,
            "et0": 191.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.8,
            "tmin": 18.2,
            "rootMoisture": 0.476,
            "storms30": 0.13
          },
          {
            "month": 11,
            "rain": 90.6,
            "rainP10": 35.6,
            "rainP90": 154.4,
            "heat35": 14.7,
            "heat40": 3.3,
            "et0": 207.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 34.9,
            "tmin": 19.5,
            "rootMoisture": 0.499,
            "storms30": 0.33
          },
          {
            "month": 12,
            "rain": 126.0,
            "rainP10": 84.2,
            "rainP90": 188.0,
            "heat35": 17.6,
            "heat40": 3.9,
            "et0": 218.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.6,
            "tmin": 21.4,
            "rootMoisture": 0.522,
            "storms30": 0.37
          }
        ],
        "monthly": [
          {
            "month": 1,
            "rain": 94.9,
            "rainP10": 60.9,
            "rainP90": 137.5,
            "heat35": 25.2,
            "heat40": 10.4,
            "et0": 229.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 38.1,
            "tmin": 23.6,
            "rootMoisture": 0.495,
            "storms30": 0.4
          },
          {
            "month": 2,
            "rain": 85.8,
            "rainP10": 63.3,
            "rainP90": 127.3,
            "heat35": 18.8,
            "heat40": 7.4,
            "et0": 186.3,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 36.7,
            "tmin": 22.8,
            "rootMoisture": 0.501,
            "storms30": 0.4
          },
          {
            "month": 3,
            "rain": 165.0,
            "rainP10": 77.3,
            "rainP90": 327.7,
            "heat35": 12.8,
            "heat40": 2.8,
            "et0": 161.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.6,
            "tmin": 21.2,
            "rootMoisture": 0.547,
            "storms30": 1.6
          },
          {
            "month": 4,
            "rain": 63.0,
            "rainP10": 31.5,
            "rainP90": 103.8,
            "heat35": 1.8,
            "heat40": 0,
            "et0": 114.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 29.2,
            "tmin": 16.8,
            "rootMoisture": 0.551,
            "storms30": 0
          },
          {
            "month": 5,
            "rain": 14.6,
            "rainP10": 5.4,
            "rainP90": 33.5,
            "heat35": 0,
            "heat40": 0,
            "et0": 89.0,
            "frost": 0.6,
            "frostProbability": 0,
            "tmax": 25.5,
            "tmin": 12.3,
            "rootMoisture": 0.509,
            "storms30": 0
          },
          {
            "month": 6,
            "rain": 17.0,
            "rainP10": 1.7,
            "rainP90": 67.4,
            "heat35": 0.2,
            "heat40": 0,
            "et0": 74.9,
            "frost": 1.6,
            "frostProbability": 20,
            "tmax": 24.0,
            "tmin": 10.2,
            "rootMoisture": 0.484,
            "storms30": 0.2
          },
          {
            "month": 7,
            "rain": 3.4,
            "rainP10": 0.5,
            "rainP90": 9.4,
            "heat35": 1.6,
            "heat40": 0,
            "et0": 87.9,
            "frost": 2.2,
            "frostProbability": 20,
            "tmax": 25.6,
            "tmin": 10.4,
            "rootMoisture": 0.468,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 4.9,
            "rainP10": 0.1,
            "rainP90": 10.4,
            "heat35": 4.6,
            "heat40": 0,
            "et0": 118.1,
            "frost": 0.2,
            "frostProbability": 0,
            "tmax": 28.3,
            "tmin": 11.6,
            "rootMoisture": 0.462,
            "storms30": 0
          },
          {
            "month": 9,
            "rain": 10.5,
            "rainP10": 7.2,
            "rainP90": 14.7,
            "heat35": 8.6,
            "heat40": 3.2,
            "et0": 154.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.3,
            "tmin": 15.8,
            "rootMoisture": 0.461,
            "storms30": 0
          },
          {
            "month": 10,
            "rain": 44.6,
            "rainP10": 16.7,
            "rainP90": 79.8,
            "heat35": 14.4,
            "heat40": 4.2,
            "et0": 194.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 34.3,
            "tmin": 18.3,
            "rootMoisture": 0.473,
            "storms30": 0.2
          },
          {
            "month": 11,
            "rain": 88.9,
            "rainP10": 28.7,
            "rainP90": 133.9,
            "heat35": 16.8,
            "heat40": 4.2,
            "et0": 207.7,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.2,
            "tmin": 19.8,
            "rootMoisture": 0.495,
            "storms30": 0.2
          },
          {
            "month": 12,
            "rain": 90.2,
            "rainP10": 52.8,
            "rainP90": 144.8,
            "heat35": 22.8,
            "heat40": 5.8,
            "et0": 224.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 36.6,
            "tmin": 22.2,
            "rootMoisture": 0.497,
            "storms30": 0
          }
        ]
      },
      "soil": {
        "ph": 7.0,
        "phConfidence": "media",
        "clay": 24.88,
        "carbon": 14.91,
        "area": "tierra agropecuaria",
        "metrics": {
          "ph": {
            "value": 7.0,
            "range": [
              6.75,
              7.25
            ],
            "confidence": "media",
            "code": "B16",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "arcilla_pct": {
            "value": 24.88,
            "range": [
              20.81,
              29.43
            ],
            "confidence": "media",
            "code": "B12",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "carbono_organico_g_kg": {
            "value": 14.91,
            "range": [
              13.18,
              16.93
            ],
            "confidence": "media",
            "code": "B15",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "nitrogeno_g_kg": {
            "value": 1.46,
            "range": [
              1.31,
              1.64
            ],
            "confidence": "media",
            "code": "B11",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "densidad_aparente_g_cm3": {
            "value": 1.36,
            "range": [
              1.32,
              1.39
            ],
            "confidence": "media",
            "code": "B18",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "distancia_caminos_km": {
            "value": 1.75,
            "range": [
              0.19,
              3.81
            ],
            "confidence": "media",
            "code": "B36",
            "source": "GRIP4 (Meijer y otros, 2018)"
          }
        }
      },
      "satellite": {
        "lowMonths": 4,
        "uncertainMonths": 7,
        "monthlyFraction": [
          0.245,
          0.012,
          0.003,
          0.005,
          0.012,
          0.087,
          0.283,
          0.493,
          0.595,
          0.738,
          0.792,
          0.683
        ],
        "lowFlags": [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true
        ],
        "uncertainFlags": [
          true,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true,
          true,
          true
        ],
        "samplePoints": [
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600
        ],
        "confidence": "media"
      },
      "deforestation": {
        "forestPct": 61.0,
        "risk": 0.079,
        "confidence": "media",
        "history": {
          "desde": 2001,
          "valores": [
            8004.6,
            7009.5,
            31324.9,
            47663.1,
            20631.5,
            13709.9,
            57876.6,
            61505.6,
            42391.9,
            56188.7,
            49981.2,
            42205.9,
            40811.7,
            21009.9,
            12530.6,
            20665.8,
            20505.9,
            17241.6,
            14207.4,
            20562.5,
            27934.8,
            21445.3,
            27681.9,
            31495.1,
            28340.9
          ]
        },
        "projection": {
          "anios": [
            2026,
            2027,
            2028,
            2029
          ],
          "valores": [
            29172.6,
            29172.6,
            29172.6,
            29172.6
          ]
        },
        "historyConfidence": "alta",
        "projectionConfidence": "baja"
      },
      "rotations": {
        "validatedBy": "sin validar",
        "items": [
          {
            "id": "z3_actual",
            "type": "actual",
            "name": "Lote desmontado con Maíz/Zapallo en verano y sobrepastoreo invernal",
            "sequence": [
              "Maíz o Zapallo a secano"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "rastrojo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Maíz o Zapallo a secano",
                "seccion": "A",
                "siembra_mes": 12,
                "cosecha_mes": 4
              }
            ],
            "evidence": [
              {
                "texto": "Los días de más de 40 °C se duplicaron de 17,2 días/año (normal 1991-2020) a 36-38 días/año en 2021-2025 (pico de 49 días en 2025 y récord de 47,35 °C), calcinando el suelo sin sombra arbórea.",
                "dato": "clima_zonas.zona_3_monte_semiarido.anual.dias_calor_40",
                "fuente": "NASA POWER"
              },
              {
                "texto": "Alto índice de fragilidad por exposición del suelo y pérdida de cobertura de monte detectada por satélite.",
                "dato": "diagnostico_landsat_ia.zonas.zona_3_monte_semiarido.indice_fragilidad_0_100",
                "fuente": "Landsat 8/9 + Modelo IA"
              }
            ],
            "benefits": [
              "Producción de grano y alimento de autoconsumo en años de lluvias favorables.",
              "No requiere inversión en implantación de pasturas perennes."
            ],
            "attributes": {
              "demanda_agua": "alta",
              "aporte_nitrogeno": "negativo",
              "meses_suelo_desnudo": 6,
              "forraje": true,
              "ingreso": "bajo",
              "requiere_riego": false,
              "maquinaria_especial": "ninguna",
              "requiere_hacienda": true
            },
            "sources": [
              "INTA EEA Santiago del Estero / AER Monte Quemado — Diagnóstico de sistemas productivos del Chaco Semiárido Norte"
            ],
            "reason": "En el norte semiárido (Campo Gallo / Monte Quemado), sembrar maíz a cielo abierto en lotes desmontados y luego sobrepastorear el rastrojo deja el suelo pelado 6 meses bajo el régimen térmico más extremo del país.",
            "missing": [
              "Grado de compactación superficial por pisoteo animal y pérdida de horizonte A fértil.",
              "Disponibilidad de aguadas y sombra para la hacienda en los meses de septiembre a diciembre."
            ],
            "risks": [
              "Pérdida frecuente de la cosecha de maíz por aborto floral ante olas de calor (> 40 °C) y déficit hídrico (-973 mm/año de balance).",
              "Erosión eólica y térmica severa entre junio y noviembre, y bache forrajero agudo para vacas y cabras."
            ]
          },
          {
            "id": "z3_alt1",
            "type": "alternativa",
            "name": "Secuencia ultrarresistente a sequía: Sorgo doble propósito + Poroto Caupí / Mijo",
            "sequence": [
              "Sorgo doble propósito (grano y diferido)",
              "Poroto Caupí (Vigna unguiculata) o Poroto Mung",
              "Mijo forrajero (Mohair / Panicum miliaceum)"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Sorgo doble propósito (grano y diferido)",
                "seccion": "A",
                "siembra_mes": 12,
                "cosecha_mes": 5
              },
              {
                "cultivo": "Poroto Caupí (Vigna unguiculata) o Poroto Mung",
                "seccion": "B",
                "siembra_mes": 11,
                "cosecha_mes": 3
              },
              {
                "cultivo": "Mijo forrajero (Mohair / Panicum miliaceum)",
                "seccion": "D",
                "siembra_mes": 1,
                "cosecha_mes": 4
              }
            ],
            "evidence": [
              {
                "texto": "Resiste los más de 126 días/año con temperaturas > 35 °C y las rachas de hasta 130 días sin lluvia útil gracias a la latencia vegetativa del sorgo.",
                "dato": "clima_zonas.zona_3_monte_semiarido.anual.dias_calor_35",
                "fuente": "NASA POWER"
              },
              {
                "texto": "El poroto caupí repone nitrógeno en suelos chaqueños de baja materia orgánica sin exigir los regímenes hídricos de la soja.",
                "dato": "suelo_zonas.zona_3_monte_semiarido.nitrogeno_g_kg",
                "fuente": "AIZAL V4 (SoilGrids B11)"
              }
            ],
            "benefits": [
              "Estabilidad de producción de grano y forraje diferido en pie para pasar el invierno seco.",
              "Cobertura de rastrojo durante todo el invierno si se regula la carga animal (dejando al menos 30-40 % de remanente).",
              "Aporte proteico de alta digestibilidad del poroto caupí para suplementación caprina y vacuna."
            ],
            "attributes": {
              "demanda_agua": "baja",
              "aporte_nitrogeno": "positivo",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "medio",
              "requiere_riego": false,
              "maquinaria_especial": "ninguna (adaptable a siembra directa o labranza mínima)",
              "requiere_hacienda": true
            },
            "sources": [
              "INTA EEA Santiago del Estero — Sorgo diferido y leguminosas estivales (Vigna unguiculata) para el Chaco Semiárido"
            ],
            "reason": "Reemplaza al maíz por especies fisiológicamente adaptadas al calor extremo: el sorgo y el mijo tienen máxima eficiencia en uso del agua, y el poroto caupí fija nitrógeno en climas cálidos aportando proteína clave para el ganado y la familia.",
            "missing": [
              "Disponibilidad local de semilla de poroto caupí y sorgo doble propósito antes de las lluvias de noviembre.",
              "Capacidad de apotreramiento (alambre eléctrico) para racionar el pastoreo del sorgo diferido."
            ],
            "risks": [
              "Riesgo de toxicidad por ácido cianhídrico (durrina) si se pastorea el rebrote de sorgo joven estresado por sequía.",
              "Si no se retira la hacienda a tiempo, el sobrepastoreo consume todo el rastrojo y vuelve a dejar el suelo desnudo."
            ]
          },
          {
            "id": "z3_alt2",
            "type": "alternativa",
            "name": "Sistema Agro-Silvopastoril: Algarrobo blanco + Buffel Grass / Gatton Panic + Tuna",
            "sequence": [
              "Algarrobo blanco (Neltuma alba) en cobertura permanente",
              "Pastura megatérmica (Buffel Grass / Gatton Panic)",
              "Franjas de Sorgo forrajero y Tuna forrajera (Opuntia ficus-indica)"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Algarrobo blanco (Neltuma alba) en cobertura permanente",
                "seccion": "B",
                "siembra_mes": 1,
                "cosecha_mes": 12
              },
              {
                "cultivo": "Pastura megatérmica (Buffel Grass / Gatton Panic)",
                "seccion": "A",
                "siembra_mes": 11,
                "cosecha_mes": 10
              },
              {
                "cultivo": "Franjas de Sorgo forrajero y Tuna forrajera (Opuntia ficus-indica)",
                "seccion": "D",
                "siembra_mes": 12,
                "cosecha_mes": 8
              }
            ],
            "evidence": [
              {
                "texto": "Baja incidencia de heladas (5,1 días/año ≤ 3 °C en la normal) que permite la excelente supervivencia de Buffel Grass y Gatton Panic bajo dosel de monte.",
                "dato": "clima_zonas.zona_3_monte_semiarido.anual.dias_helada_3c",
                "fuente": "NASA POWER"
              },
              {
                "texto": "La proximidad y conservación del monte nativo amortigua la temperatura superficial del suelo en más de 12 °C y sostiene los servicios ecosistémicos.",
                "dato": "suelo_zonas.zona_3_monte_semiarido.monte_nativo_pct",
                "fuente": "AIZAL V4 (MapBiomas Chaco)"
              }
            ],
            "benefits": [
              "Cobertura permanente los 12 meses: frena la erosión eólica y reduce la evaporación del suelo bajo la copa de los árboles.",
              "El algarrobo fija nitrógeno profundo y entrega chauchas de alto valor energético/proteico en noviembre-diciembre (justo antes de las lluvias).",
              "La tuna forrajera actúa como reserva de agua viva en pie durante las sequías de más de 120 días."
            ],
            "attributes": {
              "demanda_agua": "baja",
              "aporte_nitrogeno": "positivo",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "alto",
              "requiere_riego": false,
              "maquinaria_especial": "rolo pisador selectivo de baja intensidad (MBGI)",
              "requiere_hacienda": true
            },
            "sources": [
              "INTA EEA Santiago del Estero — Manejo de Bosques con Ganadería Integrada (MBGI) y pasturas megatérmicas",
              "Kunst, C. et al. (INTA) — Rolado selectivo de baja intensidad y sistemas silvopastoriles en la Región Chaqueña"
            ],
            "reason": "Con apenas 5,1 días de helada al año pero 38 días de más de 40 °C, el norte santiagueño requiere la media sombra arbórea del algarrobo (leguminosa nativa de raíz profunda) combinada con pasturas megatérmicas (Buffel/Gatton) y bancos de agua/energía en pencas de tuna.",
            "missing": [
              "Categoría del lote en el Ordenamiento Territorial de Bosques Nativos (OTBN Provincial) antes de realizar rolado selectivo.",
              "Carga animal actual (equivalente vaca y cabra por hectárea) y subdivisión de potreros."
            ],
            "risks": [
              "Requiere clausura inicial del potrero (sin pastoreo en el primer verano) para que la pastura megatérmica semille y afiance raíces.",
              "Rebrote de arbustivas leñosas invasoras (fachinal) si no se maneja adecuadamente el descanso de la pastura."
            ]
          }
        ]
      }
    },
    "zona_4_bajos_submeridionales": {
      "name": "Bajos submeridionales",
      "lat": -28.46,
      "lon": -62.83,
      "climate": {
        "normal": {
          "rain": 756,
          "et0": 1721,
          "heat40": 14.1,
          "frost": 9.7
        },
        "recent": {
          "rain": 721,
          "et0": 1758,
          "heat40": 28.2,
          "frost": 9.6
        },
        "normalMonthly": [
          {
            "month": 1,
            "rain": 129.0,
            "rainP10": 66.6,
            "rainP90": 204.1,
            "heat35": 17.1,
            "heat40": 3.1,
            "et0": 211.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.2,
            "tmin": 21.6,
            "rootMoisture": 0.482,
            "storms30": 0.67
          },
          {
            "month": 2,
            "rain": 108.7,
            "rainP10": 66.4,
            "rainP90": 155.9,
            "heat35": 12.2,
            "heat40": 1.7,
            "et0": 171.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 34.0,
            "tmin": 20.8,
            "rootMoisture": 0.485,
            "storms30": 0.43
          },
          {
            "month": 3,
            "rain": 111.8,
            "rainP10": 52.8,
            "rainP90": 198.3,
            "heat35": 7.4,
            "heat40": 0.6,
            "et0": 155.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.0,
            "tmin": 19.1,
            "rootMoisture": 0.49,
            "storms30": 0.63
          },
          {
            "month": 4,
            "rain": 63.8,
            "rainP10": 16.0,
            "rainP90": 95.7,
            "heat35": 1.9,
            "heat40": 0,
            "et0": 109.2,
            "frost": 0.0,
            "frostProbability": 0,
            "tmax": 28.2,
            "tmin": 15.7,
            "rootMoisture": 0.495,
            "storms30": 0.2
          },
          {
            "month": 5,
            "rain": 25.9,
            "rainP10": 4.7,
            "rainP90": 51.9,
            "heat35": 0.3,
            "heat40": 0,
            "et0": 83.0,
            "frost": 0.3,
            "frostProbability": 3,
            "tmax": 24.7,
            "tmin": 11.9,
            "rootMoisture": 0.473,
            "storms30": 0.03
          },
          {
            "month": 6,
            "rain": 13.2,
            "rainP10": 0.8,
            "rainP90": 31.1,
            "heat35": 0,
            "heat40": 0,
            "et0": 66.8,
            "frost": 2.6,
            "frostProbability": 13,
            "tmax": 22.3,
            "tmin": 8.9,
            "rootMoisture": 0.455,
            "storms30": 0
          },
          {
            "month": 7,
            "rain": 5.2,
            "rainP10": 0.2,
            "rainP90": 13.1,
            "heat35": 0.1,
            "heat40": 0,
            "et0": 75.1,
            "frost": 4.7,
            "frostProbability": 33,
            "tmax": 22.1,
            "tmin": 7.5,
            "rootMoisture": 0.437,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 6.6,
            "rainP10": 0.1,
            "rainP90": 14.6,
            "heat35": 2.3,
            "heat40": 0.1,
            "et0": 105.9,
            "frost": 2.1,
            "frostProbability": 13,
            "tmax": 25.8,
            "tmin": 9.7,
            "rootMoisture": 0.418,
            "storms30": 0.03
          },
          {
            "month": 9,
            "rain": 21.1,
            "rainP10": 1.2,
            "rainP90": 44.1,
            "heat35": 5.2,
            "heat40": 0.7,
            "et0": 139.1,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 29.0,
            "tmin": 13.0,
            "rootMoisture": 0.415,
            "storms30": 0.03
          },
          {
            "month": 10,
            "rain": 60.9,
            "rainP10": 27.5,
            "rainP90": 104.1,
            "heat35": 8.8,
            "heat40": 1.9,
            "et0": 183.5,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.2,
            "tmin": 16.5,
            "rootMoisture": 0.429,
            "storms30": 0.17
          },
          {
            "month": 11,
            "rain": 90.3,
            "rainP10": 49.6,
            "rainP90": 143.3,
            "heat35": 12.4,
            "heat40": 2.2,
            "et0": 202.3,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.9,
            "tmin": 18.6,
            "rootMoisture": 0.451,
            "storms30": 0.4
          },
          {
            "month": 12,
            "rain": 119.1,
            "rainP10": 64.9,
            "rainP90": 171.9,
            "heat35": 16.2,
            "heat40": 3.8,
            "et0": 217.9,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.1,
            "tmin": 20.8,
            "rootMoisture": 0.469,
            "storms30": 0.57
          }
        ],
        "monthly": [
          {
            "month": 1,
            "rain": 118.3,
            "rainP10": 74.1,
            "rainP90": 151.5,
            "heat35": 21.4,
            "heat40": 7.8,
            "et0": 225.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 37.1,
            "tmin": 22.6,
            "rootMoisture": 0.459,
            "storms30": 0.2
          },
          {
            "month": 2,
            "rain": 73.3,
            "rainP10": 44.0,
            "rainP90": 100.6,
            "heat35": 17.6,
            "heat40": 7,
            "et0": 184.3,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 36.3,
            "tmin": 22.2,
            "rootMoisture": 0.458,
            "storms30": 0
          },
          {
            "month": 3,
            "rain": 150.4,
            "rainP10": 88.1,
            "rainP90": 211.9,
            "heat35": 10.8,
            "heat40": 1.2,
            "et0": 154.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.6,
            "tmin": 20.4,
            "rootMoisture": 0.504,
            "storms30": 1.4
          },
          {
            "month": 4,
            "rain": 65.2,
            "rainP10": 11.3,
            "rainP90": 128.3,
            "heat35": 0.4,
            "heat40": 0,
            "et0": 107.6,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 27.8,
            "tmin": 15.4,
            "rootMoisture": 0.502,
            "storms30": 0.4
          },
          {
            "month": 5,
            "rain": 17.9,
            "rainP10": 0.8,
            "rainP90": 45.1,
            "heat35": 0,
            "heat40": 0,
            "et0": 80.9,
            "frost": 1.2,
            "frostProbability": 0,
            "tmax": 24.0,
            "tmin": 11.2,
            "rootMoisture": 0.47,
            "storms30": 0
          },
          {
            "month": 6,
            "rain": 8.0,
            "rainP10": 0.2,
            "rainP90": 29.9,
            "heat35": 0,
            "heat40": 0,
            "et0": 67.0,
            "frost": 2.4,
            "frostProbability": 40,
            "tmax": 22.3,
            "tmin": 8.8,
            "rootMoisture": 0.444,
            "storms30": 0
          },
          {
            "month": 7,
            "rain": 5.8,
            "rainP10": 1.5,
            "rainP90": 17.8,
            "heat35": 0.2,
            "heat40": 0,
            "et0": 77.4,
            "frost": 4.6,
            "frostProbability": 40,
            "tmax": 23.3,
            "tmin": 8.8,
            "rootMoisture": 0.423,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 11.0,
            "rainP10": 0.3,
            "rainP90": 31.6,
            "heat35": 2.2,
            "heat40": 0,
            "et0": 106.2,
            "frost": 1.4,
            "frostProbability": 0,
            "tmax": 26.0,
            "tmin": 9.8,
            "rootMoisture": 0.413,
            "storms30": 0
          },
          {
            "month": 9,
            "rain": 13.8,
            "rainP10": 0.6,
            "rainP90": 33.4,
            "heat35": 5.8,
            "heat40": 1.6,
            "et0": 144.9,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 30.3,
            "tmin": 13.9,
            "rootMoisture": 0.411,
            "storms30": 0
          },
          {
            "month": 10,
            "rain": 45.1,
            "rainP10": 16.8,
            "rainP90": 77.1,
            "heat35": 9.4,
            "heat40": 2.6,
            "et0": 186.5,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.8,
            "tmin": 16.9,
            "rootMoisture": 0.419,
            "storms30": 0.2
          },
          {
            "month": 11,
            "rain": 101.9,
            "rainP10": 58.8,
            "rainP90": 128.0,
            "heat35": 13.8,
            "heat40": 3.4,
            "et0": 205.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 34.3,
            "tmin": 18.8,
            "rootMoisture": 0.45,
            "storms30": 0.4
          },
          {
            "month": 12,
            "rain": 110.6,
            "rainP10": 31.4,
            "rainP90": 172.9,
            "heat35": 17,
            "heat40": 4.6,
            "et0": 218.9,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 35.5,
            "tmin": 21.4,
            "rootMoisture": 0.467,
            "storms30": 0.6
          }
        ]
      },
      "soil": {
        "ph": 7.13,
        "phConfidence": "media",
        "clay": 31.09,
        "carbon": 16.59,
        "area": "tierra agropecuaria",
        "metrics": {
          "ph": {
            "value": 7.13,
            "range": [
              6.9,
              7.3
            ],
            "confidence": "media",
            "code": "B16",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "arcilla_pct": {
            "value": 31.09,
            "range": [
              26.12,
              37.12
            ],
            "confidence": "media",
            "code": "B12",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "carbono_organico_g_kg": {
            "value": 16.59,
            "range": [
              14.77,
              18.22
            ],
            "confidence": "media",
            "code": "B15",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "nitrogeno_g_kg": {
            "value": 1.37,
            "range": [
              1.23,
              1.55
            ],
            "confidence": "media",
            "code": "B11",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "densidad_aparente_g_cm3": {
            "value": 1.34,
            "range": [
              1.31,
              1.38
            ],
            "confidence": "media",
            "code": "B18",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "distancia_caminos_km": {
            "value": 1.69,
            "range": [
              0.19,
              3.68
            ],
            "confidence": "media",
            "code": "B36",
            "source": "GRIP4 (Meijer y otros, 2018)"
          }
        }
      },
      "satellite": {
        "lowMonths": 3,
        "uncertainMonths": 7,
        "monthlyFraction": [
          0.133,
          0.002,
          0.0,
          0.005,
          0.007,
          0.085,
          0.217,
          0.313,
          0.353,
          0.65,
          0.67,
          0.628
        ],
        "lowFlags": [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true
        ],
        "uncertainFlags": [
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true,
          true,
          true,
          true
        ],
        "samplePoints": [
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600
        ],
        "confidence": "media"
      },
      "deforestation": {
        "forestPct": 19.65,
        "risk": 0.069,
        "confidence": "media",
        "history": {
          "desde": 2001,
          "valores": [
            4079.5,
            2240.2,
            12212.3,
            22676.1,
            28282.4,
            21761.1,
            19039.7,
            24476.5,
            5665.7,
            13665.8,
            21466.7,
            12230.1,
            10303.2,
            10757.6,
            6011.3,
            7523.1,
            7244.5,
            4818.4,
            3774.2,
            4290.1,
            4155.5,
            3008.9,
            3241.1,
            5271.3,
            6751.4
          ]
        },
        "projection": {
          "anios": [
            2026,
            2027,
            2028,
            2029
          ],
          "valores": [
            5087.9,
            5087.9,
            5087.9,
            5087.9
          ]
        },
        "historyConfidence": "alta",
        "projectionConfidence": "baja"
      },
      "rotations": {
        "validatedBy": "sin validar",
        "items": [
          {
            "id": "z4_actual",
            "type": "actual",
            "name": "Siembra oportunista de Soja o Maíz y suelo descubierto el resto del año",
            "sequence": [
              "Soja o Maíz oportunista"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "desnudo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Soja o Maíz oportunista",
                "seccion": "B",
                "siembra_mes": 12,
                "cosecha_mes": 4
              }
            ],
            "evidence": [
              {
                "texto": "Contraste extremo entre 139,5 mm de lluvia en marzo sobre suelos sin pendiente y rachas secas de hasta 163 días seguidos en otoño-invierno-primavera.",
                "dato": "clima_zonas.zona_4_bajos_submeridionales.anual.lluvia_mm",
                "fuente": "NASA POWER"
              },
              {
                "texto": "Alto porcentaje de arcilla que impide el drenaje rápido en verano y provoca agrietamiento y ascenso salino cuando el suelo queda desnudo.",
                "dato": "suelo_zonas.zona_4_bajos_submeridionales.arcilla_pct",
                "fuente": "AIZAL V4 (SoilGrids B12)"
              }
            ],
            "benefits": [
              "Permite obtener cosecha comercial únicamente en años con lluvias moderadas y bien distribuidas."
            ],
            "attributes": {
              "demanda_agua": "alta",
              "aporte_nitrogeno": "neutro",
              "meses_suelo_desnudo": 7,
              "forraje": false,
              "ingreso": "bajo",
              "requiere_riego": false,
              "maquinaria_especial": "ninguna",
              "requiere_hacienda": false
            },
            "sources": [
              "INTA EEA Santiago del Estero / AER Añatuya — Caracterización hidro-halomórfica de los Bajos Submeridionales"
            ],
            "reason": "En los bajos planos y arcillosos (Añatuya / Pinto), sembrar cultivos anuales convencionales en verano expone al productor al doble golpe: pérdida por encharcamiento en marzo y 7 meses de suelo agrietado con subida de salitre en la seca.",
            "missing": [
              "Porcentaje de Sodio Intercambiable (PSI) y conductividad eléctrica en el perfil arcilloso.",
              "Cota topográfica fina del lote (microrrelieve de loma, media loma o bajo alcalino)."
            ],
            "risks": [
              "Asfixia radicular y falta de piso para cosechar en marzo-abril cuando ocurren tormentas intensas.",
              "Planchado y salinización superficial durante los 7 meses de barbecho desnudo."
            ]
          },
          {
            "id": "z4_alt1",
            "type": "alternativa",
            "name": "Escape al anegamiento: Girasol temprano + Sorgo granífero + Cebada/Trigo",
            "sequence": [
              "Girasol (raíz pivotante)",
              "Sorgo granífero",
              "Cebada o Trigo (según agua en perfil)"
            ],
            "calendar": [
              "cultivo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Girasol (raíz pivotante)",
                "seccion": "C",
                "siembra_mes": 8,
                "cosecha_mes": 1
              },
              {
                "cultivo": "Sorgo granífero",
                "seccion": "A",
                "siembra_mes": 12,
                "cosecha_mes": 5
              },
              {
                "cultivo": "Cebada o Trigo (según agua en perfil)",
                "seccion": "A",
                "siembra_mes": 5,
                "cosecha_mes": 10
              }
            ],
            "evidence": [
              {
                "texto": "La cosecha estival temprana del girasol esquiva el pico de lluvias de marzo (139,5 mm) y aprovecha la reserva de humedad acumulada en otoño.",
                "dato": "clima_zonas.zona_4_bajos_submeridionales.anual.balance_mm",
                "fuente": "NASA POWER"
              },
              {
                "texto": "La raíz pivotante del girasol perfora suelos de alta densidad aparente, mejorando la macroporosidad para los cultivos siguientes.",
                "dato": "suelo_zonas.zona_4_bajos_submeridionales.densidad_aparente_g_cm3",
                "fuente": "AIZAL V4 (SoilGrids B18)"
              }
            ],
            "benefits": [
              "Descompactación biológica profunda del suelo arcilloso y cobertura de rastrojo en el mes más lluvioso (marzo).",
              "Diversificación de fechas de siembra y cosecha que reduce el riesgo climático y financiero.",
              "Ruptura del ciclo de malezas y patógenos al rotar secciones C y A."
            ],
            "attributes": {
              "demanda_agua": "baja",
              "aporte_nitrogeno": "negativo",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "medio",
              "requiere_riego": false,
              "maquinaria_especial": "cabezal girasolero para la cosecha",
              "requiere_hacienda": false
            },
            "sources": [
              "INTA — Guía práctica para el cultivo de girasol y sorgo en ambientes marginales del NEA/NOA",
              "AIZAL V4 — Física del Suelo (B12, B18)"
            ],
            "reason": "El girasol (Sección C) explora perfiles compactados con su raíz pivotante y se cosecha en diciembre/enero antes de las lluvias que anegan los bajos en marzo; el sorgo tolera tanto sequía como encharcamientos temporales.",
            "missing": [
              "Humedad útil disponible en agosto para lograr una emergencia pareja del girasol.",
              "Presencia de paloma torcaza en la zona y distancia a acopio de girasol."
            ],
            "risks": [
              "Si agosto y septiembre son extremadamente secos, la ventana de siembra del girasol puede retrasarse hasta octubre.",
              "Cuidar el período entre cosecha de girasol y cultivo de invierno manteniendo el rastrojo en pie."
            ]
          },
          {
            "id": "z4_alt2",
            "type": "alternativa",
            "name": "Biodrenaje y regeneración salina: Melilotus alba + Grama Rhodes / Agropiro + Sorgo forrajero",
            "sequence": [
              "Melilotus alba (Trébol de olor)",
              "Grama Rhodes (Chloris gayana) o Agropiro",
              "Sorgo forrajero o granífero"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Melilotus alba (Trébol de olor)",
                "seccion": "B",
                "siembra_mes": 4,
                "cosecha_mes": 11
              },
              {
                "cultivo": "Grama Rhodes (Chloris gayana) o Agropiro",
                "seccion": "A",
                "siembra_mes": 10,
                "cosecha_mes": 9
              },
              {
                "cultivo": "Sorgo forrajero o granífero",
                "seccion": "D",
                "siembra_mes": 11,
                "cosecha_mes": 4
              }
            ],
            "evidence": [
              {
                "texto": "Tolera tanto las 9,7 heladas anuales de la zona como las rachas secas de hasta 163 días, manteniendo el suelo sombreado para que no aflore el salitre.",
                "dato": "clima_zonas.zona_4_bajos_submeridionales.anual.dias_helada_3c",
                "fuente": "NASA POWER"
              },
              {
                "texto": "Adaptada a suelos pesados de alta arcilla y pH elevado donde los cultivos agrícolas anuales fracasan.",
                "dato": "suelo_zonas.zona_4_bajos_submeridionales.ph",
                "fuente": "AIZAL V4 (SoilGrids B16)"
              }
            ],
            "benefits": [
              "Las raíces de Melilotus y Grama Rhodes abren bioporos que duplican la tasa de infiltración del agua de lluvia.",
              "Fijación biológica de nitrógeno y aporte continuo de forraje para ganadería de cría y recría.",
              "Eliminación total del suelo desnudo y lavado gradual de sales hacia capas profundas."
            ],
            "attributes": {
              "demanda_agua": "baja",
              "aporte_nitrogeno": "positivo",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "medio",
              "requiere_riego": false,
              "maquinaria_especial": "sembradora de pasturas o siembra al voleo con rastra liviana",
              "requiere_hacienda": true
            },
            "sources": [
              "INTA EEA Santiago del Estero / INTA Reconquista — Recuperación productiva de Bajos Submeridionales con Grama Rhodes y Melilotus alba"
            ],
            "reason": "En suelos arcillosos e inundables con salinidad, la consociación de Grama Rhodes (gramínea perenne halófita) con Melilotus alba (leguminosa de raíz pivotante que tolera alcalinidad y encharcamiento) actúa como biodrenaje vivo los 12 meses.",
            "missing": [
              "Calidad de agua de bebida para la hacienda en el bajo (contenido de sulfatos y sales totales).",
              "Necesidad de obras simples de manejo de escorrentía en superficie."
            ],
            "risks": [
              "Evitar el pisoteo animal con suelo saturado de agua inmediatamente después de las lluvias de marzo para no destruir la estructura superficial.",
              "Permitir la resiembra natural del Melilotus en primavera retirando o aliviando la carga animal."
            ]
          }
        ]
      }
    },
    "zona_5_sur_serrano": {
      "name": "Sur serrano y salinas",
      "lat": -29.5,
      "lon": -63.69,
      "climate": {
        "normal": {
          "rain": 739,
          "et0": 1577,
          "heat40": 2.2,
          "frost": 20.5
        },
        "recent": {
          "rain": 709,
          "et0": 1608,
          "heat40": 7.0,
          "frost": 20.8
        },
        "normalMonthly": [
          {
            "month": 1,
            "rain": 110.9,
            "rainP10": 56.9,
            "rainP90": 185.0,
            "heat35": 9.9,
            "heat40": 0.6,
            "et0": 201.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.9,
            "tmin": 19.2,
            "rootMoisture": 0.487,
            "storms30": 0.5
          },
          {
            "month": 2,
            "rain": 113.0,
            "rainP10": 59.6,
            "rainP90": 160.4,
            "heat35": 4.7,
            "heat40": 0.2,
            "et0": 160.9,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 31.3,
            "tmin": 18.3,
            "rootMoisture": 0.502,
            "storms30": 0.63
          },
          {
            "month": 3,
            "rain": 111.3,
            "rainP10": 37.3,
            "rainP90": 221.8,
            "heat35": 2.2,
            "heat40": 0,
            "et0": 142.5,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 29.3,
            "tmin": 16.7,
            "rootMoisture": 0.51,
            "storms30": 0.83
          },
          {
            "month": 4,
            "rain": 66.2,
            "rainP10": 11.5,
            "rainP90": 122.1,
            "heat35": 0.1,
            "heat40": 0,
            "et0": 97.7,
            "frost": 0.1,
            "frostProbability": 0,
            "tmax": 25.3,
            "tmin": 13.4,
            "rootMoisture": 0.52,
            "storms30": 0.3
          },
          {
            "month": 5,
            "rain": 25.1,
            "rainP10": 3.7,
            "rainP90": 49.6,
            "heat35": 0,
            "heat40": 0,
            "et0": 71.9,
            "frost": 1,
            "frostProbability": 10,
            "tmax": 21.6,
            "tmin": 9.9,
            "rootMoisture": 0.494,
            "storms30": 0.1
          },
          {
            "month": 6,
            "rain": 10.8,
            "rainP10": 0.6,
            "rainP90": 22.6,
            "heat35": 0,
            "heat40": 0,
            "et0": 57.4,
            "frost": 5,
            "frostProbability": 43,
            "tmax": 19.3,
            "tmin": 7.0,
            "rootMoisture": 0.469,
            "storms30": 0
          },
          {
            "month": 7,
            "rain": 7.0,
            "rainP10": 0.1,
            "rainP90": 21.3,
            "heat35": 0,
            "heat40": 0,
            "et0": 64.6,
            "frost": 8.8,
            "frostProbability": 63,
            "tmax": 19.0,
            "tmin": 5.6,
            "rootMoisture": 0.448,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 6.2,
            "rainP10": 0.0,
            "rainP90": 16.1,
            "heat35": 0.4,
            "heat40": 0,
            "et0": 92.6,
            "frost": 4.7,
            "frostProbability": 37,
            "tmax": 22.6,
            "tmin": 7.5,
            "rootMoisture": 0.423,
            "storms30": 0
          },
          {
            "month": 9,
            "rain": 21.2,
            "rainP10": 3.9,
            "rainP90": 48.3,
            "heat35": 1.2,
            "heat40": 0.0,
            "et0": 124.4,
            "frost": 0.9,
            "frostProbability": 0,
            "tmax": 25.7,
            "tmin": 10.4,
            "rootMoisture": 0.409,
            "storms30": 0.1
          },
          {
            "month": 10,
            "rain": 59.6,
            "rainP10": 23.9,
            "rainP90": 105.8,
            "heat35": 3.6,
            "heat40": 0.3,
            "et0": 168.5,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 29.2,
            "tmin": 13.8,
            "rootMoisture": 0.421,
            "storms30": 0.13
          },
          {
            "month": 11,
            "rain": 90.7,
            "rainP10": 47.5,
            "rainP90": 135.6,
            "heat35": 5.8,
            "heat40": 0.4,
            "et0": 189.0,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 31.1,
            "tmin": 16.1,
            "rootMoisture": 0.45,
            "storms30": 0.57
          },
          {
            "month": 12,
            "rain": 117.0,
            "rainP10": 60.7,
            "rainP90": 180.7,
            "heat35": 8.5,
            "heat40": 0.7,
            "et0": 206.3,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.5,
            "tmin": 18.3,
            "rootMoisture": 0.476,
            "storms30": 0.67
          }
        ],
        "monthly": [
          {
            "month": 1,
            "rain": 125.7,
            "rainP10": 98.4,
            "rainP90": 152.9,
            "heat35": 14,
            "heat40": 2,
            "et0": 208.3,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 34.0,
            "tmin": 20.1,
            "rootMoisture": 0.474,
            "storms30": 1
          },
          {
            "month": 2,
            "rain": 80.5,
            "rainP10": 45.3,
            "rainP90": 133.2,
            "heat35": 10.8,
            "heat40": 2.6,
            "et0": 171.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 33.3,
            "tmin": 19.4,
            "rootMoisture": 0.48,
            "storms30": 0.2
          },
          {
            "month": 3,
            "rain": 131.7,
            "rainP10": 47.9,
            "rainP90": 327.2,
            "heat35": 5.8,
            "heat40": 0,
            "et0": 145.3,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 30.3,
            "tmin": 18.0,
            "rootMoisture": 0.51,
            "storms30": 1
          },
          {
            "month": 4,
            "rain": 62.0,
            "rainP10": 5.0,
            "rainP90": 172.7,
            "heat35": 0,
            "heat40": 0,
            "et0": 96.9,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 25.0,
            "tmin": 13.1,
            "rootMoisture": 0.515,
            "storms30": 0.4
          },
          {
            "month": 5,
            "rain": 13.8,
            "rainP10": 1.5,
            "rainP90": 43.7,
            "heat35": 0,
            "heat40": 0,
            "et0": 71.2,
            "frost": 2.6,
            "frostProbability": 20,
            "tmax": 21.2,
            "tmin": 9.2,
            "rootMoisture": 0.478,
            "storms30": 0
          },
          {
            "month": 6,
            "rain": 7.5,
            "rainP10": 0.4,
            "rainP90": 17.5,
            "heat35": 0,
            "heat40": 0,
            "et0": 57.4,
            "frost": 6.8,
            "frostProbability": 60,
            "tmax": 19.1,
            "tmin": 6.7,
            "rootMoisture": 0.452,
            "storms30": 0
          },
          {
            "month": 7,
            "rain": 7.7,
            "rainP10": 0.4,
            "rainP90": 25.6,
            "heat35": 0,
            "heat40": 0,
            "et0": 66.1,
            "frost": 8,
            "frostProbability": 60,
            "tmax": 19.9,
            "tmin": 6.6,
            "rootMoisture": 0.434,
            "storms30": 0
          },
          {
            "month": 8,
            "rain": 18.3,
            "rainP10": 0.0,
            "rainP90": 74.3,
            "heat35": 0,
            "heat40": 0,
            "et0": 92.1,
            "frost": 3.2,
            "frostProbability": 20,
            "tmax": 22.5,
            "tmin": 7.6,
            "rootMoisture": 0.414,
            "storms30": 0.2
          },
          {
            "month": 9,
            "rain": 9.7,
            "rainP10": 0.5,
            "rainP90": 21.6,
            "heat35": 2.2,
            "heat40": 0.4,
            "et0": 130.5,
            "frost": 0.2,
            "frostProbability": 0,
            "tmax": 27.1,
            "tmin": 11.1,
            "rootMoisture": 0.408,
            "storms30": 0
          },
          {
            "month": 10,
            "rain": 39.6,
            "rainP10": 23.2,
            "rainP90": 80.0,
            "heat35": 4,
            "heat40": 0.2,
            "et0": 170.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 29.6,
            "tmin": 14.1,
            "rootMoisture": 0.407,
            "storms30": 0
          },
          {
            "month": 11,
            "rain": 99.9,
            "rainP10": 50.5,
            "rainP90": 169.4,
            "heat35": 8,
            "heat40": 0.6,
            "et0": 191.8,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 31.5,
            "tmin": 16.3,
            "rootMoisture": 0.447,
            "storms30": 0.8
          },
          {
            "month": 12,
            "rain": 112.3,
            "rainP10": 34.1,
            "rainP90": 206.0,
            "heat35": 9,
            "heat40": 1.2,
            "et0": 206.2,
            "frost": 0,
            "frostProbability": 0,
            "tmax": 32.8,
            "tmin": 18.9,
            "rootMoisture": 0.472,
            "storms30": 1
          }
        ]
      },
      "soil": {
        "ph": 7.06,
        "phConfidence": "media",
        "clay": 20.5,
        "carbon": 14.1,
        "area": "tierra agropecuaria",
        "metrics": {
          "ph": {
            "value": 7.06,
            "range": [
              6.8,
              7.3
            ],
            "confidence": "media",
            "code": "B16",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "arcilla_pct": {
            "value": 20.5,
            "range": [
              14.56,
              28.43
            ],
            "confidence": "media",
            "code": "B12",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "carbono_organico_g_kg": {
            "value": 14.1,
            "range": [
              12.12,
              16.36
            ],
            "confidence": "media",
            "code": "B15",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "nitrogeno_g_kg": {
            "value": 1.27,
            "range": [
              1.08,
              1.48
            ],
            "confidence": "media",
            "code": "B11",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "densidad_aparente_g_cm3": {
            "value": 1.34,
            "range": [
              1.3,
              1.38
            ],
            "confidence": "media",
            "code": "B18",
            "source": "SoilGrids 2.0, 0-30 cm"
          },
          "distancia_caminos_km": {
            "value": 1.57,
            "range": [
              0.19,
              3.19
            ],
            "confidence": "media",
            "code": "B36",
            "source": "GRIP4 (Meijer y otros, 2018)"
          }
        }
      },
      "satellite": {
        "lowMonths": 1,
        "uncertainMonths": 5,
        "monthlyFraction": [
          0.143,
          0.007,
          0.0,
          0.0,
          0.002,
          0.04,
          0.143,
          0.42,
          0.407,
          0.525,
          0.382,
          0.24
        ],
        "lowFlags": [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          false,
          false
        ],
        "uncertainFlags": [
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          true,
          true,
          true,
          true,
          false
        ],
        "samplePoints": [
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600,
          600
        ],
        "confidence": "media"
      },
      "deforestation": {
        "forestPct": 30.29,
        "risk": 0.054,
        "confidence": "media",
        "history": {
          "desde": 2001,
          "valores": [
            6690.4,
            1335.1,
            10201.1,
            16254.3,
            8674.4,
            11832.3,
            17500.4,
            12118.8,
            6946.4,
            13418.5,
            7306.6,
            5063.4,
            5764.5,
            5968.7,
            4103.4,
            6104.1,
            4327.0,
            4072.2,
            2654.1,
            3516.2,
            1883.1,
            2036.4,
            1538.0,
            3386.4,
            3628.6
          ]
        },
        "projection": {
          "anios": [
            2026,
            2027,
            2028,
            2029
          ],
          "valores": [
            2851.0,
            2851.0,
            2851.0,
            2851.0
          ]
        },
        "historyConfidence": "alta",
        "projectionConfidence": "baja"
      },
      "rotations": {
        "validatedBy": "productor",
        "items": [
          {
            "id": "z5_actual",
            "type": "actual",
            "name": "Pasturas megatérmicas con monte para las cabras y bache de invierno cubierto con fardos",
            "sequence": [
              "Pastura megatérmica (Gatton Panic, Buffel o Grama Rhodes)"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "desnudo",
              "desnudo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Pastura megatérmica (Gatton Panic, Buffel o Grama Rhodes)",
                "seccion": "A",
                "siembra_mes": 11,
                "cosecha_mes": 6
              }
            ],
            "evidence": [
              {
                "texto": "20,4 días de helada por año en la normal 1991-2020, el doble o más que el resto de la provincia. Empiezan en mayo y tienen su pico en julio: coincide con lo que cuenta el productor sobre el freno del pasto.",
                "dato": "clima_zonas.zona_5_sur_serrano.anual.dias_helada_3c",
                "fuente": "NASA POWER (1991-2020)"
              },
              {
                "texto": "Falta de agua de 838 mm por año (lluvia menos demanda). Entre junio y septiembre llueven de 6 a 16 mm por mes y la humedad en raíces toca su mínimo en septiembre: por eso el bache llega hasta octubre.",
                "dato": "clima_zonas.zona_5_sur_serrano.anual.balance_mm",
                "fuente": "NASA POWER"
              }
            ],
            "benefits": [
              "Especies que el productor ya conoce y que andan en la zona.",
              "El monte da alimento a las cabras y protege el suelo.",
              "El pastoreo por sectores ya evita agotar el pasto."
            ],
            "attributes": {
              "demanda_agua": "baja",
              "aporte_nitrogeno": "negativo",
              "meses_suelo_desnudo": 2,
              "forraje": true,
              "ingreso": "medio",
              "requiere_riego": false,
              "maquinaria_especial": "ninguna",
              "requiere_hacienda": true
            },
            "sources": [
              "Entrevista al productor de 'Bella Criolla' (Río Utis, Depto. Quebrachos), 14/11/2026 — docs/entrevista-productor-bella-criolla.md",
              "NASA POWER, punto -29.50, -63.69 (1991-2025)"
            ],
            "reason": "Es lo que hace hoy el productor: ganadería de vacas y cabras con monte natural, pasturas megatérmicas (Gatton Panic, Buffel, Grama Rhodes) sembradas con las primeras lluvias de primavera-verano y pastoreo por sectores. Desde mayo o junio el pasto deja de crecer, las heladas queman el pasto verde y entre julio y octubre falta alimento de calidad, que se cubre con reservas, fardos o suplementos. En años secos el suelo queda descubierto y las primeras lluvias fuertes arrastran tierra.",
            "missing": [
              "Hectáreas de monte, pastura y lote de siembra, y cantidad de vacas y cabras (el productor no las dio).",
              "Cuántos meses queda el suelo descubierto: depende de la seca de cada año.",
              "Qué sectores se salinizan y cuáles se anegan con las crecientes del Río Utis.",
              "Cuánto se gasta por año en fardos y suplementos para pasar el invierno."
            ],
            "risks": [
              "Bache de alimento de julio a octubre que obliga a comprar fardos o suplementos.",
              "Suelo descubierto en años secos: las primeras lluvias fuertes (más de 30 mm en un día) arrastran tierra.",
              "Crecientes del Río Utis que anegan los bajos y complican mover la hacienda.",
              "El Buffel tolera mal las heladas fuertes del sur."
            ]
          },
          {
            "id": "z5_alt1",
            "type": "alternativa",
            "name": "Verdeo de invierno en el lote de siembra: avena o centeno con Melilotus",
            "sequence": [
              "Pastura megatérmica en los potreros (se mantiene)",
              "Avena o centeno + Melilotus alba en el lote de siembra"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "cobertura",
              "rastrojo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Pastura megatérmica en los potreros (se mantiene)",
                "seccion": "A",
                "siembra_mes": 11,
                "cosecha_mes": 6
              },
              {
                "cultivo": "Avena o centeno + Melilotus alba en el lote de siembra",
                "seccion": "D",
                "siembra_mes": 3,
                "cosecha_mes": 9
              }
            ],
            "evidence": [
              {
                "texto": "Abril es el mes con más humedad en raíces del año (51,4 %, promedio 2020-2025), justo antes de que se corte la lluvia en mayo.",
                "dato": "clima_zonas.zona_5_sur_serrano.periodos.normal.meses",
                "fuente": "NASA POWER"
              },
              {
                "texto": "Solo 2,2 días por año de más de 40 °C (normal 1991-2020) y 20 heladas: el clima del sur favorece a los cereales de invierno más que en el norte.",
                "dato": "clima_zonas.zona_5_sur_serrano.anual.dias_calor_40",
                "fuente": "NASA POWER (1991-2020)"
              }
            ],
            "benefits": [
              "Pasto verde en julio, agosto y septiembre, los meses que el productor marca como críticos.",
              "Menos compra de fardos y suplementos.",
              "Suelo tapado durante el invierno: menos tierra arrastrada con las primeras lluvias.",
              "El Melilotus suma nitrógeno y tolera suelos con algo de sal."
            ],
            "attributes": {
              "demanda_agua": "media",
              "aporte_nitrogeno": "positivo",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "medio",
              "requiere_riego": false,
              "maquinaria_especial": "sembradora (o siembra al voleo) y alambrado o boyero para reservar el lote",
              "requiere_hacienda": true
            },
            "sources": [
              "Entrevista al productor de 'Bella Criolla' (Río Utis, Depto. Quebrachos), 14/11/2026 — docs/entrevista-productor-bella-criolla.md",
              "NASA POWER, punto -29.50, -63.69 (1991-2025)",
              "INTA — verdeos de invierno y Melilotus alba en la región (cita a confirmar)"
            ],
            "reason": "Ataca el problema que el productor marca como el más grande: pasar el invierno. En marzo y abril todavía llueve (127 y 62 mm) y el suelo tiene la mayor humedad del año. Con esa agua se puede sembrar avena o centeno con Melilotus, que aguantan las heladas, dan pasto verde entre julio y septiembre, tapan el suelo y el Melilotus suma nitrógeno. Puede reducir la compra de fardos.",
            "missing": [
              "Si hay humedad suficiente en marzo-abril en ese lote (el productor lo pone como condición).",
              "Si el suelo del lote lo permite (sal, piso).",
              "Si hay maquinaria para sembrar o si se puede sembrar al voleo.",
              "Costo de la semilla frente a lo que se gasta hoy en fardos."
            ],
            "risks": [
              "Hacen falta alambrados y poder reservar el lote hasta que el pasto esté listo (lo dice el productor).",
              "Si el otoño viene seco, conviene no sembrar.",
              "Terminar el pastoreo a fines de septiembre dejando rastrojo, para no dejar el suelo pelado antes de las lluvias.",
              "El Melilotus puede empastar a las vacas: entrar con cuidado."
            ]
          },
          {
            "id": "z5_alt2",
            "type": "alternativa",
            "name": "Pastura según el ambiente y monte conservado: Grama Rhodes en los bajos, especie a evaluar en las lomas",
            "sequence": [
              "Grama Rhodes en los bajos con salitre",
              "Lomas: Gatton Panic o una especie que aguante más el frío (pasto llorón, a evaluar)",
              "Monte nativo conservado (algarrobo) para ramoneo de las cabras y sombra"
            ],
            "calendar": [
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "cultivo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "rastrojo",
              "cultivo",
              "cultivo"
            ],
            "sequenceDetails": [
              {
                "cultivo": "Grama Rhodes en los bajos con salitre",
                "seccion": "A",
                "siembra_mes": 11,
                "cosecha_mes": 6
              },
              {
                "cultivo": "Lomas: Gatton Panic o una especie que aguante más el frío (pasto llorón, a evaluar)",
                "seccion": "A",
                "siembra_mes": 11,
                "cosecha_mes": 6
              },
              {
                "cultivo": "Monte nativo conservado (algarrobo) para ramoneo de las cabras y sombra",
                "seccion": "B",
                "siembra_mes": 1,
                "cosecha_mes": 12
              }
            ],
            "evidence": [
              {
                "texto": "Con 20,4 heladas por año, en las lomas conviene una especie más tolerante al frío que el Buffel.",
                "dato": "clima_zonas.zona_5_sur_serrano.anual.dias_helada_3c",
                "fuente": "NASA POWER (1991-2020)"
              },
              {
                "texto": "Porcentaje de monte nativo de la zona, para ver cuánto monte queda para conservar.",
                "dato": "suelo_zonas.zona_5_sur_serrano.monte_nativo_pct",
                "fuente": "AIZAL V4 (MapBiomas Chaco)"
              }
            ],
            "benefits": [
              "Cada ambiente con la pastura que mejor le va: menos fracasos de siembra.",
              "El monte da alimento a las cabras, sombra a la hacienda y protege el suelo.",
              "Suelo cubierto todo el año si se respeta el descanso de cada sector."
            ],
            "attributes": {
              "demanda_agua": "baja",
              "aporte_nitrogeno": "neutro",
              "meses_suelo_desnudo": 0,
              "forraje": true,
              "ingreso": "medio",
              "requiere_riego": false,
              "maquinaria_especial": "sembradora de pasturas o siembra al voleo",
              "requiere_hacienda": true
            },
            "sources": [
              "Entrevista al productor de 'Bella Criolla' (Río Utis, Depto. Quebrachos), 14/11/2026 — docs/entrevista-productor-bella-criolla.md",
              "NASA POWER, punto -29.50, -63.69 (1991-2025)",
              "INTA — Grama Rhodes en suelos salinos y manejo silvopastoril (cita a confirmar)"
            ],
            "reason": "Sigue lo que propone el propio productor: no sembrar cualquier pastura en cualquier lugar. Grama Rhodes en los suelos con salinidad, otra especie a evaluar en las partes altas, y conservar el monte porque alimenta a los animales y protege el suelo. Con el pastoreo por sectores, la idea es no llegar a la seca con el suelo pelado.",
            "missing": [
              "Mapa de ambientes del campo: qué partes son loma, bajo con sal o bajo que se anega.",
              "Qué especie conviene en las lomas (el productor dice que hay que evaluarlo).",
              "Si la Grama Rhodes aguanta el tiempo que dura el agua de las crecientes del Utis en esos bajos."
            ],
            "risks": [
              "Las gramíneas solas pierden fuerza con los años si al suelo le falta nitrógeno: sumar una leguminosa como el Melilotus.",
              "Las crecientes del Río Utis anegan los bajos: prever potreros altos para sacar la hacienda.",
              "Controlar las cabras sobre los renovales del monte para que se regenere.",
              "Requiere clausurar la pastura nueva hasta que se afirme."
            ]
          }
        ]
      }
    }
  }
};
