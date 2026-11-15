"""Arma docs/datos-y-metodos.md con los números de los JSON de data/ (nunca se tipean a mano).

Uso: python -X utf8 -m ia_desmonte.informe
"""
import csv
import json

from ia_desmonte.comun import DATA, RAIZ, SALIDAS, ZONAS

NOMBRE_ZONA = {'zona_1_riego_salitre': 'Zona 1 · Riego del Río Dulce', 'zona_2_secano_este': 'Zona 2 · Secano del este',
               'zona_3_monte_semiarido': 'Zona 3 · Chaco semiárido norte',
               'zona_4_bajos_submeridionales': 'Zona 4 · Bajos submeridionales',
               'zona_5_sur_serrano': 'Zona 5 · Sur serrano y salinas'}
NOMBRE_METODO = {'regresion_logistica': 'Regresión logística', 'random_forest': 'Random forest',
                 'gradient_boosting': 'Gradient boosting'}
NOMBRE_PROY = {'promedio_3': 'promedio de los últimos 3 años', 'tendencia_8': 'tendencia lineal de los últimos 8 años',
               'holt': 'suavizado de Holt'}
MESES = 'EFMAMJJASOND'


def _leer(nombre):
    return json.loads((DATA / nombre).read_text(encoding='utf-8'))


def _n(v, d=2):
    """Número con coma decimal y punto de miles; guion si falta."""
    if v is None:
        return '—'
    texto = f'{v:,.{d}f}'
    return texto.replace(',', ' ').replace('.', ',').replace(' ', '.')


def _tabla(encabezado, filas):
    lineas = ['| ' + ' | '.join(encabezado) + ' |', '|' + '---|' * len(encabezado)]
    lineas += ['| ' + ' | '.join(str(c) for c in f) + ' |' for f in filas]
    return '\n'.join(lineas)


def _sensibilidad():
    ruta = SALIDAS / 'sensibilidad_umbral_monte.csv'
    if not ruta.exists():
        return None
    with open(ruta, encoding='utf-8') as f:
        return list(csv.reader(f))


def generar():
    suelo, desm = _leer('suelo_zonas.json'), _leer('desmonte_zonas.json')
    zonif, diag = _leer('zonificacion_aizal.json'), _leer('diagnostico_landsat_ia.json')
    escenas = _leer('imagenes/escenas.json')
    ev, met = desm['evaluacion'], desm['evaluacion']['metodos']
    s = []
    s.append('# Datos y métodos de BioSat\n')
    s.append('> **Este documento se genera solo** con `python -X utf8 -m ia_desmonte.informe`, a partir de los JSON de '
             '`data/`. No se edita a mano: si cambia un dato, se vuelve a correr el pipeline (`ia_desmonte/`).\n')
    s.append(f'**Fecha de los datos:** {desm["meta"]["fecha"]} · **Código:** [`ia_desmonte/`](../ia_desmonte/README.md) · '
             '**Contratos:** [`contratos-de-datos.md`](contratos-de-datos.md)\n')

    s.append('## 1. En pocas palabras\n')
    s.append('- Todos los números de suelo, desmonte, zonificación, suelo pelado e imágenes salen de **fuentes públicas y '
             'citables**, procesadas con Google Earth Engine y Python. No hay datos simulados.')
    s.append('- El prototipo anterior usaba datos simulados y quedó archivado en '
             '[`archivo/prototipo-ia-simulado/`](../archivo/prototipo-ia-simulado/LEEME-PRIMERO.md). Sus métricas no se usan.')
    s.append('- Cada dato lleva su **confianza** (alta, media o baja) con el criterio de la sección 9.')
    s.append(f'- El modelo de desmontes se prueba con **años que no vio** ({desm["meta"]["validacion"]}). '
             f'{ev["justificacion_metodo"]}\n')

    s.append('## 2. Fuentes\n')
    s.append(_tabla(['Dato', 'Fuente', 'Para qué'], [
        ['Desmontes 2001-2025 (30 m)', 'Hansen Global Forest Change v1.13 (UMD, Landsat)', 'Historia, etiquetas del modelo, % de monte'],
        ['Suelo 0-30 cm (250 m)', 'SoilGrids 2.0 (ISRIC)', 'pH, textura, carbono, nitrógeno, densidad, CIC'],
        ['Clima 1991-2020 (4 km)', 'TerraClimate (U. Idaho)', 'PDSI, déficit hídrico, zonificación'],
        ['Imágenes 2000-2025 (30 m)', 'Landsat 5, 7, 8 y 9 Collection 2 Level-2 (NASA/USGS)', 'Suelo pelado y visor'],
        ['Cobertura 2021 (10 m)', 'ESA WorldCover v200', 'Dónde hay cultivos y pastizales'],
        ['Caminos', 'GRIP4 (Meijer y otros, 2018)', 'Distancia a caminos'],
        ['Áreas protegidas', 'WDPA (UNEP-WCMC)', 'Predictor del modelo'],
        ['Población (100 m)', 'WorldPop 2000-2020', 'Predictor del modelo'],
        ['Relieve (30 m)', 'NASADEM (NASA)', 'Pendiente'],
        ['Límites de las zonas', 'geoBoundaries ARG ADM2 (IGN)', 'Unión de los departamentos de cada zona'],
    ]) + '\n')
    s.append('Las 5 zonas se arman **juntando sus departamentos**, igual que el mapa de la app. El clima del calendario '
             'sigue saliendo de NASA POWER (`clima_zonas.json`).\n')

    s.append('## 3. Suelo por zona\n')
    s.append(f'{suelo["meta"]["metodo"]}\n')
    campos = [('ph', 'pH', 2), ('arcilla_pct', 'Arcilla %', 1), ('arena_pct', 'Arena %', 1),
              ('carbono_organico_g_kg', 'Carbono g/kg', 1), ('nitrogeno_g_kg', 'Nitrógeno g/kg', 2),
              ('densidad_aparente_g_cm3', 'Densidad g/cm³', 2)]
    filas = []
    for z in ZONAS:
        d = suelo['zonas'][z]
        celdas = []
        for c, _, dec in campos:
            r = d[c]['rango_p10_p90']
            celdas.append(f'{_n(d[c]["valor"], dec)} ({_n(r[0], dec)} a {_n(r[1], dec)})' if r else _n(d[c]['valor'], dec))
        filas.append([NOMBRE_ZONA[z]] + celdas)
    s.append(_tabla(['Zona'] + [t for _, t, _ in campos], filas))
    s.append('\nEntre paréntesis, el rango del 10 al 90 % de los píxeles: muestra cuánto varía el suelo dentro de la zona.\n')
    filas = [[NOMBRE_ZONA[z], _n(suelo['zonas'][z]['monte_nativo_pct']['valor'], 1),
              _n(suelo['zonas'][z]['distancia_monte_km']['valor'], 2), _n(suelo['zonas'][z]['distancia_caminos_km']['valor'], 2),
              _n(suelo['zonas'][z]['pdsi']['valor'], 2), suelo['zonas'][z]['area_medida']] for z in ZONAS]
    s.append(_tabla(['Zona', 'Monte 2025 (% de la zona)', 'Distancia al monte (km)', 'Distancia a caminos (km)',
                     'PDSI 1991-2020', 'Dónde se midió'], filas) + '\n')

    s.append('## 4. Desmontes\n')
    s.append('### Historia (Hansen, 2001-2025)\n')
    filas = []
    for z in ZONAS:
        v = desm['zonas'][z]['desmonte_ha_por_anio']['valores']
        desde = desm['zonas'][z]['desmonte_ha_por_anio']['desde']
        pico = max(range(len(v)), key=lambda i: v[i])
        filas.append([NOMBRE_ZONA[z], _n(sum(v), 0), f'{desde + pico} ({_n(v[pico], 0)} ha)', _n(sum(v[-5:]) / 5, 0),
                      _n(desm['zonas'][z]['monte_actual_pct'], 1)])
    s.append(_tabla(['Zona', 'Desmonte total (ha)', 'Año con más desmonte', 'Promedio 2021-2025 (ha/año)',
                     'Monte 2025 (%)'], filas) + '\n')
    sens = _sensibilidad()
    if sens:
        s.append('**Cuánto depende de qué se llama "monte".** Con distintos umbrales de cobertura arbórea del 2000:\n')
        enc, cuerpo = sens[0], sens[1:]
        s.append(_tabla(['Umbral de cobertura', 'Zona', 'Monte 2025 (%)', 'Desmonte 2016-2025 (ha)'],
                        [[f'{r[0]} %', NOMBRE_ZONA[r[1]], _n(float(r[2]), 1), _n(float(r[3]), 0)] for r in cuerpo]) + '\n')
    s.append('### Modelo predictivo\n')
    s.append(f'- **Validación:** {desm["meta"]["validacion"]}.')
    s.append(f'- **Muestra:** {desm["meta"]["muestras"]["entrenamiento"]} puntos de entrenamiento, '
             f'{desm["meta"]["muestras"]["prueba"]} de prueba y {desm["meta"]["muestras"]["riesgo"]} para el riesgo actual, '
             'al azar dentro del monte y sin balancear clases.')
    s.append(f'- **Predictores:** {", ".join(desm["meta"]["predictores"])}.')
    s.append(f'- **Línea de base:** en la prueba se desmontó el {_n(100 * ev["tasa_base"], 1)} % de los puntos. Un modelo '
             'que adivina al azar tiene AUC 0,50 y AUC de precisión-exhaustividad igual a esa proporción.\n')
    s.append(_tabla(['Método', 'AUC', 'AUC precisión-exhaustividad', 'F1', 'Exactitud', 'Kappa'],
                    [[NOMBRE_METODO[k] + (' ✓' if k == ev['metodo_elegido'] else ''), _n(met[k]['auc']),
                      _n(met[k]['pr_auc']), _n(met[k]['f1']), _n(met[k]['accuracy']), _n(met[k]['kappa'])]
                     for k in NOMBRE_METODO]) + '\n')
    s.append(f'{ev["justificacion_metodo"]}\n')
    s.append(f'**Riesgo por zona** ({desm["meta"]["horizonte_riesgo"]}):\n')
    s.append(_tabla(['Zona', 'Riesgo medio', 'Puntos de monte', 'Confianza'],
                    [[NOMBRE_ZONA[z], _n(desm['zonas'][z]['riesgo_medio_0_1'], 3), desm['zonas'][z]['riesgo_n'],
                      desm['zonas'][z]['confianza']] for z in ZONAS]) + '\n')
    t = met.get('temporal')
    if t:
        anios = desm['zonas'][ZONAS[0]]['proyeccion_ha']['anios']
        s.append(f'**Proyección {anios[0]}-{anios[-1]}:** se eligió el {NOMBRE_PROY.get(t["metodo"], t["metodo"])}, '
                 f'que tuvo el menor error al predecir 2019-2025 con lo que se sabía hasta 2018 '
                 f'(error de {_n(t["error_ha_pct"], 1)} % en hectáreas). Confianza baja.\n')
        s.append(_tabla(['Zona'] + [str(a) for a in anios],
                        [[NOMBRE_ZONA[z]] + [_n(v, 0) for v in desm['zonas'][z]['proyeccion_ha']['valores']]
                         for z in ZONAS]) + '\n')

    s.append('## 5. Zonificación\n')
    s.append(f'{zonif["meta"]["metodo"]} {zonif["meta"]["criterio_k"]}\n')
    s.append('Silueta por cantidad de grupos: ' + ', '.join(f'k = {k}: {_n(v, 3)}'
                                                            for k, v in zonif['meta']['siluetas_por_k'].items()) + '.\n')
    s.append(_tabla(['Grupo', 'Área (%)', 'Lluvia (mm)', 'Déficit (mm)', 'Máx. verano (°C)', 'Mín. invierno (°C)', 'pH',
                     'Arcilla (%)', 'Carbono (g/kg)'],
                    [[g['id'], _n(g['area_pct'], 1), _n(g['perfil']['lluvia_mm'], 0), _n(g['perfil']['deficit_mm'], 0),
                      _n(g['perfil']['tmax_c'], 1), _n(g['perfil']['tmin_c'], 1), _n(g['perfil']['ph'], 2),
                      _n(g['perfil']['arcilla_pct'], 1), _n(g['perfil']['carbono_organico_g_kg'], 1)]
                     for g in zonif['grupos']]) + '\n')
    s.append(_tabla(['Zona de BioSat', 'Grupo que domina', 'Coincidencia (%)'],
                    [[NOMBRE_ZONA[z], zonif['comparacion_biosat'][z]['grupo_mayoritario'],
                      _n(zonif['comparacion_biosat'][z]['coincidencia_pct'], 1)] for z in ZONAS]) + '\n')

    s.append('## 6. Meses de suelo pelado y fragilidad\n')
    s.append(f'{diag["meta"]["metodo"]}\n')
    filas = []
    for z in ZONAS:
        d = diag['zonas'][z]
        cal = ''.join((m.lower() + '?' if dud else m) if not pel else (m + '■' + ('?' if dud else ''))
                      for m, pel, dud in zip(MESES, d['meses_suelo_pelado'], d['meses_dudosos']))
        filas.append([NOMBRE_ZONA[z], cal, d['meses_suelo_pelado_promedio_anual'], _n(d['indice_fragilidad_0_100'], 1),
                      _n(d['desmonte_reciente_pct'], 1)])
    s.append(_tabla(['Zona', 'Meses (■ pelado, ? dudoso)', 'Meses pelados', 'Fragilidad (0-100)',
                     'Monte 2015 desmontado en 2016-2025 (%)'], filas))
    s.append(f'\n**Fórmula de fragilidad:** `{diag["zonas"][ZONAS[0]]["formula_fragilidad"]}`. Es orientativa: los pesos '
             'los eligió el equipo (confianza baja).\n')

    s.append('## 7. Imágenes del visor\n')
    filas = []
    for z, m in escenas.items():
        for est in ('verano', 'invierno', 'anio2000'):
            if est in m:
                filas.append([z.upper(), est.replace('anio', 'año '), m[est]['periodo'], m[est]['n_escenas']])
    s.append(_tabla(['Zona', 'Capa', 'Período', 'Escenas en la mediana'], filas) + '\n')

    s.append('## 8. Limitaciones\n')
    s.append('- **Hansen** mide pérdida de cobertura arbórea, no "desmonte legal": puede incluir incendios y no registra '
             'el monte que vuelve a crecer. En el monte abierto del Chaco puede subestimar raleos.')
    s.append('- **SoilGrids** es un modelo global a 250 m: sirve para comparar zonas, no reemplaza un análisis de suelo del lote.')
    s.append('- **GRIP4** es una red de caminos de 2018 y se usa igual en todos los cortes del modelo.')
    s.append('- **NDVI** no distingue el suelo pelado del rastrojo, y no hay datos de campo para medir su exactitud.')
    s.append('- **El riesgo** es una probabilidad estadística a partir del patrón 2016-2025: no anticipa cambios de ley, de '
             'precios ni de controles.')
    s.append('- **La fragilidad** combina datos reales con pesos elegidos por el equipo: es orientativa.\n')

    s.append('## 9. Criterio de confianza\n')
    s.append(_tabla(['Confianza', 'Cuándo', 'Ejemplos'], [
        ['alta', 'Observación directa de satélite o producto de referencia con exactitud publicada', 'Historia de desmontes (Hansen)'],
        ['media', 'Modelo global, o método con umbral sin validación local, con su incertidumbre a la vista',
         'Suelo (SoilGrids), meses de suelo pelado, riesgo del modelo, zonificación'],
        ['baja', 'Supuestos fuertes o pesos elegidos a mano', 'Fragilidad, proyección, riesgo con menos de 100 puntos'],
    ]) + '\n')

    s.append('## 10. Cómo volver a calcularlo\n')
    s.append('```bash\nexport EE_PROJECT=<id>\npython -X utf8 -m ia_desmonte.correr_todo\npython -X utf8 -m ia_desmonte.informe\n```\n')
    s.append('Detalle en [`ia_desmonte/README.md`](../ia_desmonte/README.md). Registro de la última corrida: '
             '`ia_desmonte/salidas/registro_corrida.json`.\n')
    return '\n'.join(s)


def main():
    destino = RAIZ / 'docs' / 'datos-y-metodos.md'
    destino.write_text(generar(), encoding='utf-8')
    print('Listo:', destino.relative_to(RAIZ))


if __name__ == '__main__':
    main()
