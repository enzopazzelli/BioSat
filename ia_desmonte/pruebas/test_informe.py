"""El informe se arma con los JSON reales de data/: estas pruebas corren después del pipeline."""
import json

from ia_desmonte.comun import DATA, ZONAS
from ia_desmonte.informe import generar


def _leer(nombre):
    return json.loads((DATA / nombre).read_text(encoding='utf-8'))


def test_informe_cita_las_metricas_tal_cual_estan_en_el_json():
    texto = generar()
    met = _leer('desmonte_zonas.json')['evaluacion']['metodos']
    for k in ('regresion_logistica', 'random_forest', 'gradient_boosting'):
        assert f"{met[k]['auc']:.2f}".replace('.', ',') in texto, k
        assert f"{met[k]['auc_cv']:.2f}".replace('.', ',') in texto, k
    assert 'hipótesis' in texto and 'validacion-ley-de-bosques' in texto   # la caída entre validación cruzada y prueba se explica como hipótesis, no como hecho
    assert _leer('desmonte_zonas.json')['evaluacion']['justificacion_metodo'] in texto


def test_informe_tiene_todas_las_zonas_y_no_repite_numeros_simulados():
    texto = generar()
    for z in ZONAS:
        assert f'Zona {z[5]}' in texto
    assert '0,986' not in texto and '0.986' not in texto
    assert 'Validado científicamente' not in texto
