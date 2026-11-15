/* BioSat · textos en inglés (D-35). Solo hay dos idiomas: español (los textos de siempre, en su lugar)
   e inglés (este archivo). Lo que no está acá queda en español.
   Los nombres de las rotaciones son traducción del equipo, pendiente de revisión de Vale.
   Si cambiás un texto en español que tiene su clave acá, actualizá también el inglés.
   Diseño: docs/superpowers/specs/2026-11-15-idioma-es-en-design.md (B).
   Se usa en el navegador (window.TEXTOS_EN) y en Node (module.exports). */
(function () {
  const TEXTOS_EN = {
    // Textos fijos del HTML: elementos con data-i18n="clave" (o data-i18n-attr="atributo:clave").
    html: {
      iniCambiar: 'Change',
      iniMejorT: 'Best fit for your farm',
      iniSiembra: 'Next sowing',
      iniPelados: 'Months of bare soil',
      iniPie: 'Supports, does not replace, your agronomist’s judgment.',
      iniSonda: 'Measure with the probe',
      iniIrReporte: 'See the full report →',
      iniPronoAria: 'This week in your area'
    },

    // Objetos de textos de cada módulo, con las mismas claves que en español.
    modulos: {
      // web/inicio-logica.js · InicioLogica.TEXTOS
      inicio: {
        nivel: ['GOOD', 'CAUTION', 'WARNING'],
        rotulo: {zona: 'Your area in {mes} · typical', sonda: 'Your field, measured today'},
        senal: {
          falta: 'crops need about {n} mm more water than the rain gives',
          pelado: 'about {n} out of 10 fields in the area have bare soil',
          d35: 'there are about {n} days above 35 °C',
          helada: 'there are about {n} frost days'
        },
        razonBien: 'No strong heat, no frost and no big water shortage: usually a calm month in your area.',
        accion: {
          falta: 'Keep the soil covered until the rains come.',
          pelado: 'Cover the soil: crop residue or a cover crop protects it from sun and wind.',
          d35: 'Look after the soil cover and avoid sowing on the hottest days.',
          helada: 'Watch out for frost-sensitive crops.',
          bien: 'A good time to plan the next sowing.'
        },
        sonda: ['Your field’s soil is fine.', 'Your field’s soil needs attention.',
          'Your field’s soil is at risk: hot or dry.'],
        sondaTemp: 'The probe reads {t} °C in the soil.',
        y: ' and ',
        locale: 'en-US',
        razonCorta: {falta: 'water shortage', pelado: 'bare soil', d35: 'strong heat', helada: 'frost'},
        sinConexion: 'No internet connection: you can send the message when the signal comes back.',
        sondaError: 'Could not connect the probe. Check that it is plugged in by USB and pick its port when the browser asks.',
        sondaNoDisponible: 'This phone or browser cannot read the probe over USB. Use Chrome or Edge on a computer, or open the kit screen.',
        whatsapp: {
          inicio: 'BioSat · {zona} · {mes}: {nivel}',
          razon: ' ({razon})',
          mejor: '. Best fit: {rotacion}',
          siembra: ' (next sowing: {mes})',
          cierre: '. Check it with your agronomist. {enlace}'
        }
      },

      // web/pronostico-logica.js · PronosticoLogica.TEXTOS
      pronostico: {
        titulo: 'This week in your area',
        sub: 'Next {n} days',
        hoy: 'Today',
        diasSemana: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        fuente: 'Meteomatics forecast (European ECMWF model, 9 km), downloaded {fecha}.',
        vencido: 'Forecast expired (downloaded {fecha}). It updates every day.',
        complemento: 'The traffic light shows what is typical for {mes}; this is what is forecast for these days.',
        lluvia: '{mm} mm of rain in total (the most on {dia}: {mmDia} mm)',
        sinLluvia: 'No rain forecast',
        calor: '{n} days above 38 °C',
        helada: '{n} days with a frost warning',
        hoja: '{n} nights with wet leaves (favors fungi)',
        viento: '{n} days with wind under 15 km/h (for spraying)',
        criterio: 'Above 38 °C and wind under 15 km/h are team criteria.',
        criterioCalor: 'Above 38 °C is a team criterion.',
        kitHoy: 'Forecast for today (Meteomatics, 9 km): high of {t} °C.',
        tabla: {dia: 'Day', temp: 'High / low', lluvia: 'Rain', helada: 'Frost', hoja: 'Wet leaves (night)', si: 'Yes', no: '—'}
      },

      // web/asistente.js · BioSatAsistente.TEXTOS
      asistente: {
        comun: {
          progreso: 'Question {n} of 4',
          atras: '← Back',
          siguiente: 'Next →',
          saltar: 'Skip',
          saltarAyuda: 'Skip the assistant',
          si: 'Yes',
          no: 'No'
        },
        p1: {
          titulo: 'Where is your farm?',
          ayuda: 'Tap your area, or its color on the map.',
          grupo: 'Your farm’s area',
          mapaAlt: 'Map of Santiago del Estero with the 5 areas',
          depTitulo: '{nombre} · area {num}',
          mapaPie: 'Boundaries: IGN, via geoBoundaries (CC BY 3.0 IGO). Areas are drawn by department, approximately. The climate of each one comes from a NASA POWER point.',
          elegida: 'selected'
        },
        p2: {
          titulo: 'What do you have on your farm?',
          ayuda: 'Tap to switch between Yes and No. If you are not sure, just continue.',
          riego: {t: 'Irrigation', d: 'water to irrigate the crops'},
          hacienda: {t: 'Livestock', d: 'cows, goats or other animals'},
          maq: {t: 'No-till seeder or roller', d: 'to sow without plowing'}
        },
        p3: {
          titulo: 'What worries you most?',
          ayuda: 'Choose up to 3. You can leave it blank.',
          lleno: 'You already chose 3. Remove one to change it.',
          agua: 'Save water',
          salitre: 'Stop the salt',
          suelo: 'Look after the soil',
          forraje: 'Have more grass',
          ingreso: 'Make it pay'
        },
        p4: {
          titulo: 'This is what we understood',
          campo: 'Your farm',
          porDefecto: '{lista} (the usual ones)',
          tiene: 'You have',
          preocupa: 'You worry about',
          nada: 'Nothing in particular',
          aviso: 'You can change it later whenever you want.',
          terminar: 'See my farm →',
          zona: 'Area {num} · {nombre}',
          riego: 'Irrigation',
          hacienda: 'Livestock',
          maq: 'No-till seeder or roller'
        }
      },

      // web/app.js · TEXTOS_INICIO
      appInicio: {
        eyebrow: 'Your farm · Zone {num}',
        esActual: 'Your current rotation is already the best fit',
        hoy: 'Today', propuesta: 'With the change',
        validada: 'Reviewed by a local farmer', sinValidar: 'Not yet validated in this area',
        sinDato: 'no data', tira: 'Soil month by month. {detalle}',
        mesesPeladosAria: '{nom}: {n} months of bare soil',
        seguir: 'keep your current rotation',
        abrirKit: 'Open the kit screen'
      },

      // web/app.js · MES_L, MES y ESTADO
      meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      mesesCortos: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      estado: {C: {label: 'Crop growing'}, V: {label: 'Cover crop or pasture'}, R: {label: 'Crop residue'}, D: {label: 'Bare soil'}},

      // web/app.js · ZONAS (solo nombre y problema; los nombres de lugar no se traducen)
      zonas: {
        zona_1_riego_salitre: {
          nombre: 'Río Dulce irrigation area',
          problema: 'Fields are flood-irrigated and the salty water table is close. If a field is left bare in the dry season, the sun evaporates the water and the salt rises.'
        },
        zona_2_secano_este: {
          nombre: 'Eastern rainfed farmland',
          problema: 'Everything depends on rain: dry winters and springs, summers above 40 °C, and little crop residue with soybean after soybean.'
        },
        zona_3_monte_semiarido: {
          nombre: 'Northern semi-arid Chaco',
          problema: 'A long dry season, forest clearing and not enough winter grass for the cattle.'
        },
        zona_4_bajos_submeridionales: {
          nombre: 'Bajos Submeridionales lowlands',
          problema: 'A flat, clayey plain: it floods with the summer rains and cracks with salt in the dry season.'
        },
        zona_5_sur_serrano: {
          nombre: 'Southern hills and salt flats',
          problema: 'Cooler than the rest: about 20 frosts a year and few days above 40 °C. Hills with slopes that erode, salt flats to the west, and cattle and goat raising. The rotations were reviewed by a local farmer.'
        }
      }
    },

    // Nombres de las rotaciones por id (data/rotaciones_santiago.json). Traducción del equipo, pendiente de revisión de Vale.
    rotaciones: {
      z1_actual: 'Cotton after cotton with a bare winter fallow',
      z1_alt1: 'Anti-salt shield: Cotton + Cover crop (Barley + Sweet clover) + Maize',
      z1_alt2: 'Deep biological pump: Alfalfa pasture + Sorghum + Wheat',
      z2_actual: 'Summer soybean monoculture with a long bare fallow',
      z2_alt1: 'Residue blanket: Soybean + Late maize or Grain sorghum',
      z2_alt2: 'Managed green bridge: Soybean + Cover crop (Hairy vetch + Rye) + Late maize',
      z3_actual: 'Cleared field with summer Maize/Squash and winter overgrazing',
      z3_alt1: 'Drought-proof sequence: Dual-purpose sorghum + Cowpea / Millet',
      z3_alt2: 'Agro-silvopastoral system: White carob tree + Buffel grass / Gatton panic + Prickly pear',
      z4_actual: 'Opportunistic Soybean or Maize, with bare soil the rest of the year',
      z4_alt1: 'Escaping waterlogging: Early sunflower + Grain sorghum + Barley/Wheat',
      z4_alt2: 'Biodrainage and salt recovery: White sweet clover + Rhodes grass / Wheatgrass + Forage sorghum',
      z5_actual: 'Warm-season pastures with native forest for the goats, and the winter gap covered with hay bales',
      z5_alt1: 'Winter green forage on the crop field: oats or rye with Sweet clover',
      z5_alt2: 'Pasture suited to each environment and conserved forest: Rhodes grass in the lowlands, a species to evaluate on the higher ground'
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = TEXTOS_EN;
  else window.TEXTOS_EN = TEXTOS_EN;
})();
