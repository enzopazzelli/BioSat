(() => {
  'use strict';

  const words = {
    es: {
      climate: 'Clima y agua', soil: 'Suelo de referencia', satellite: 'Cobertura vista por satélite', forest: 'Monte y desmonte',
      climateIntro: 'Lluvia, demanda atmosférica, calor y heladas de la zona.', soilIntro: 'Propiedades estimadas de 0 a 30 cm de profundidad.',
      satelliteIntro: 'Meses con poca vegetación verde en los cultivos de la zona.', forestIntro: 'Historia de pérdida de monte y presión estimada por un modelo.',
      open: 'Abrir datos completos', regional: 'Referencia regional, no medición del lote', source: 'Fuente original',
      recentRain: 'Lluvia 2021–2025', normalRain: 'Lluvia 1991–2020', recentEt0: 'ET0 2021–2025',
      normalEt0: 'ET0 1991–2020', heat: 'Días >40 °C por año', frost: 'Días ≤3 °C por año',
      climateDetails: 'Comparación anual', climateMonths: 'Lluvia y demanda de agua por mes',
      rain: 'Lluvia', et0: 'ET0', mm: 'mm', days: 'días', climateLimit: 'NASA POWER (MERRA-2) usa un punto por zona y una celda de unos 50 km. ET0 es evaporación de referencia; lluvia menos ET0 no es agua disponible del lote ni la necesidad de un cultivo.',
      soilDetails: 'Seis variables del repositorio', soilRange: 'Rango P10–P90 en la zona', soilLimit: 'SoilGrids 2.0 estima las propiedades del suelo a 250 m; la distancia a caminos proviene de GRIP4. Los valores resumen tierra agropecuaria de la zona y requieren verificación en el lote antes de decidir una intervención.',
      ph: 'pH', clay: 'Arcilla', carbon: 'Carbono orgánico', nitrogen: 'Nitrógeno', density: 'Densidad aparente', roads: 'Distancia a caminos',
      phTip: 'Acidez o alcalinidad; por debajo de 5,8 puede limitar la fijación de nitrógeno de leguminosas.',
      clayTip: 'Influye en retención de agua y drenaje; mucha arcilla puede favorecer el anegamiento.',
      carbonTip: 'Indicador de materia orgánica; el rastrojo y las coberturas pueden ayudar a conservarla.',
      nitrogenTip: 'Nutriente del suelo; una cifra regional no reemplaza un análisis para fertilización.',
      densityTip: 'Puede orientar sobre compactación; se verifica en el lote.',
      roadsTip: 'Dato logístico del repositorio; más distancia puede dificultar comercializar un cultivo nuevo.',
      satelliteDetails: 'Poca cobertura verde, mes a mes', satelliteLegendLow: 'Mayoría de puntos con NDVI bajo',
      satelliteLegendUncertain: 'Cambia con el umbral', satelliteLegendOther: 'Mayoría con verde activo',
      satelliteFraction: 'Puntos con NDVI <0,25', satellitePoints: 'Puntos con dato',
      satelliteLimit: 'Landsat 8/9 (2021–2025): NDVI mediano mensual a 100 m en puntos de cultivo. “Poco verde” incluye suelo descubierto y rastrojo seco: el satélite no los distingue. Sin mediciones de campo, la exactitud y F1 siguen sin medir.',
      lowMonths: 'Meses con poco verde', uncertainMonths: 'Meses dudosos',
      forestRisk: 'Presión de desmonte', forestCover: 'Monte estimado', forestHistory: 'Hectáreas desmontadas por año',
      forestProjection: 'Proyección del modelo', forestModels: 'Modelos comparados',
      forestMethod: 'Modelo', forestAuc: 'AUC prueba', forestF1: 'F1 prueba', chosen: 'elegido',
      logistic: 'Regresión logística', randomForest: 'Random forest', boosting: 'Gradient boosting',
      historyConfidence: 'Serie histórica: confianza', projectionConfidence: 'Proyección: confianza', projectionError: 'Error histórico de la proyección',
      forestLimit: 'Hansen GFC v1.13 identifica pérdida de árboles, pero no el monte que vuelve a crecer. El porcentaje de presión es una probabilidad media para el monte que queda en la zona, no un pronóstico del lote. La proyección tiene baja confianza.',
      confidence: 'Confianza', high: 'alta', medium: 'media', low: 'baja', noData: 'Sin dato',
      rainPreview: 'lluvia anual reciente', lowPreview: 'meses con poco verde', forestPreview: 'de monte estimado'
    },
    en: {
      climate: 'Climate and water', soil: 'Reference soil', satellite: 'Satellite vegetation cover', forest: 'Forest cover and clearing',
      climateIntro: 'Rain, atmospheric demand, heat and frost across the zone.', soilIntro: 'Estimated properties from 0 to 30 cm depth.',
      satelliteIntro: 'Months with little green vegetation in the zone’s cropland.', forestIntro: 'Historical tree-cover loss and model-estimated pressure.',
      open: 'Open full data', regional: 'Regional reference, not a field measurement', source: 'Original source',
      recentRain: 'Rain 2021–2025', normalRain: 'Rain 1991–2020', recentEt0: 'ET0 2021–2025',
      normalEt0: 'ET0 1991–2020', heat: 'Days >40 °C per year', frost: 'Days ≤3 °C per year',
      climateDetails: 'Annual comparison', climateMonths: 'Monthly rain and water demand',
      rain: 'Rain', et0: 'ET0', mm: 'mm', days: 'days', climateLimit: 'NASA POWER (MERRA-2) uses one point per zone and a roughly 50 km cell. ET0 is reference evapotranspiration; rain minus ET0 is neither available field water nor a crop’s water requirement.',
      soilDetails: 'Six repository variables', soilRange: 'P10–P90 range across the zone', soilLimit: 'SoilGrids 2.0 estimates soil properties at 250 m resolution; distance to roads comes from GRIP4. Values summarize agricultural land in the zone and need field verification before an intervention.',
      ph: 'pH', clay: 'Clay', carbon: 'Organic carbon', nitrogen: 'Nitrogen', density: 'Bulk density', roads: 'Distance to roads',
      phTip: 'Acidity or alkalinity; below 5.8, legume nitrogen fixation may be limited.',
      clayTip: 'Affects water retention and drainage; high clay can increase waterlogging.',
      carbonTip: 'An organic matter indicator; residues and cover crops may help conserve it.',
      nitrogenTip: 'A soil nutrient; a regional figure cannot guide field fertilization alone.',
      densityTip: 'May indicate compaction; verify in the field.',
      roadsTip: 'A repository logistics measure; longer distance can make marketing a new crop harder.',
      satelliteDetails: 'Low green cover by month', satelliteLegendLow: 'Most points with low NDVI',
      satelliteLegendUncertain: 'Changes with threshold', satelliteLegendOther: 'Most with active green',
      satelliteFraction: 'Points with NDVI <0.25', satellitePoints: 'Points with data',
      satelliteLimit: 'Landsat 8/9 (2021–2025): monthly median NDVI at 100 m over cropland sample points. “Low green” includes exposed soil and dry residue, which the satellite cannot distinguish. With no field measurements, accuracy and F1 remain unmeasured.',
      lowMonths: 'Low-green months', uncertainMonths: 'Uncertain months',
      forestRisk: 'Clearing pressure', forestCover: 'Estimated tree cover', forestHistory: 'Hectares cleared per year',
      forestProjection: 'Model projection', forestModels: 'Compared models',
      forestMethod: 'Model', forestAuc: 'Test AUC', forestF1: 'Test F1', chosen: 'selected',
      logistic: 'Logistic regression', randomForest: 'Random forest', boosting: 'Gradient boosting',
      historyConfidence: 'Historical series confidence', projectionConfidence: 'Projection confidence', projectionError: 'Historical projection error',
      forestLimit: 'Hansen GFC v1.13 detects tree-cover loss, but not regrowth. Clearing pressure is a mean probability for the remaining tree cover in the zone, not a field forecast. The projection has low confidence.',
      confidence: 'Confidence', high: 'high', medium: 'medium', low: 'low', noData: 'No data',
      rainPreview: 'recent annual rain', lowPreview: 'low-green months', forestPreview: 'estimated tree cover'
    }
  };

  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const pct = value => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  function render({container, zone, sources, commit, language}) {
    const tr = words[language === 'en' ? 'en' : 'es'];
    const locale = language === 'en' ? 'en-US' : 'es-AR';
    const n = (value, digits=0) => finite(value) ? value.toLocaleString(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits}) : '—';
    const month = Array.from({length:12},(_,i)=>new Intl.DateTimeFormat(locale,{month:'short'}).format(new Date(2024,i,1)));
    const conf = value => tr[{alta:'high',media:'medium',baja:'low'}[value]] || tr.noData;
    const value = (label, number, unit='', note='') => `<div class="regional-value"><span>${escape(label)}</span><strong>${escape(number)}<small>${escape(unit)}</small></strong>${note?`<em>${escape(note)}</em>`:''}</div>`;
    const link = (file, source) => `<div class="regional-source"><span>${escape(tr.regional)} · ${escape(source.name)} · ${escape(source.date)}</span><a href="https://github.com/enzopazzelli/BioSat/blob/${encodeURIComponent(commit)}/data/${file}.json" target="_blank" rel="noopener noreferrer">${escape(tr.source)} ↗</a></div>`;
    const card = (kind, icon, title, intro, source, preview, body, file) => `<details class="regional-card regional-card--${kind}"><summary><div class="regional-card-top"><span class="regional-icon" aria-hidden="true">${icon}</span><span class="regional-card-source">${escape(source.name)}</span><span class="regional-open" aria-hidden="true">＋</span></div><h3>${escape(title)}</h3><p>${escape(intro)}</p>${preview}<span class="regional-card-action">${escape(tr.open)} <span aria-hidden="true">↗</span></span></summary><div class="regional-card-detail">${body}${link(file,source)}</div></details>`;
    const heading = text => `<h4 class="regional-detail-title">${escape(text)}</h4>`;
    const note = text => `<p class="regional-limit">${escape(text)}</p>`;

    const climate = zone.climate;
    const rainMax = Math.max(1,...climate.monthly.map(m=>Number(m.rain)||0),...climate.monthly.map(m=>Number(m.et0)||0));
    const climatePreview = `<div class="regional-preview regional-preview--climate"><div><b>${n(climate.recent.rain)} <small>${tr.mm}</small></b><span>${escape(tr.rainPreview)}</span></div><div class="regional-preview-bars" aria-hidden="true"><i style="height:${pct(climate.normal.rain/Math.max(climate.normal.rain,climate.recent.rain)*100)}%"></i><i style="height:${pct(climate.recent.rain/Math.max(climate.normal.rain,climate.recent.rain)*100)}%"></i></div></div>`;
    const climateMonths = climate.monthly.map((m,i)=>`<div class="regional-climate-month" title="${escape(month[i])}: ${n(m.rain,1)} ${tr.mm} ${escape(tr.rain)}, ${n(m.et0,1)} ${tr.mm} ET0"><div class="regional-climate-bars"><i style="height:${pct(m.rain/rainMax*100)}%"></i><i style="height:${pct(m.et0/rainMax*100)}%"></i></div><span>${escape(month[i])}</span></div>`).join('');
    const climateBody = heading(tr.climateDetails)+`<div class="regional-values">${[
      value(tr.normalRain,n(climate.normal.rain),tr.mm),value(tr.recentRain,n(climate.recent.rain),tr.mm),
      value(tr.normalEt0,n(climate.normal.et0),tr.mm),value(tr.recentEt0,n(climate.recent.et0),tr.mm),
      value(tr.heat,n(climate.recent.heat40,1),tr.days),value(tr.frost,n(climate.recent.frost,1),tr.days)
    ].join('')}</div>`+heading(tr.climateMonths)+`<div class="regional-chart-legend"><span class="rain-key">${escape(tr.rain)}</span><span class="et0-key">${escape(tr.et0)}</span></div><div class="regional-climate-chart" role="img" aria-label="${escape(tr.climateMonths)}: ${escape(climate.monthly.map((m,i)=>month[i]+' '+n(m.rain,1)+' '+tr.mm+' '+tr.rain+', '+n(m.et0,1)+' '+tr.mm+' ET0').join('; '))}">${climateMonths}</div>`+note(tr.climateLimit);

    const soil = zone.soil;
    const soilSpecs = [
      ['ph','ph','',1],['arcilla_pct','clay','%',1],['carbono_organico_g_kg','carbon','g/kg',1],
      ['nitrogeno_g_kg','nitrogen','g/kg',2],['densidad_aparente_g_cm3','density','g/cm³',2],['distancia_caminos_km','roads','km',1]
    ];
    const soilPreview = `<div class="regional-preview regional-preview--soil">${[
      value(tr.ph,n(soil.ph,1)),value(tr.clay,n(soil.clay,1),'%'),value(tr.carbon,n(soil.carbon,1),'g/kg')
    ].join('')}</div>`;
    const soilBody = heading(tr.soilDetails)+`<div class="regional-soil-grid">${soilSpecs.map(([key,label,unit,digits])=>{
      const m=soil.metrics?.[key] || {};
      const range=Array.isArray(m.range)&&m.range.length===2 ? `${tr.soilRange}: ${n(m.range[0],digits)}–${n(m.range[1],digits)} ${unit}` : tr.noData;
      return `<div class="regional-soil-item"><div class="regional-soil-number"><span>${escape(tr[label])}</span><strong>${n(m.value,digits)} <small>${escape(unit)}</small></strong></div><p>${escape(tr[label+'Tip'])}</p><small>${escape(range)} · ${escape(tr.confidence)}: ${escape(conf(m.confidence))}<br>${escape(m.source||'')}</small></div>`;
    }).join('')}</div>`+note(tr.soilLimit);

    const sat = zone.satellite;
    const satellitePreview = `<div class="regional-preview regional-preview--satellite"><b>${n(sat.lowMonths)}<small>/12</small></b><span>${escape(tr.lowPreview)}</span><div class="regional-month-strip" aria-hidden="true">${sat.monthlyFraction.map((f,i)=>`<i class="${sat.lowFlags?.[i]?'is-low':sat.uncertainFlags?.[i]?'is-uncertain':''}" style="--fill:${pct(f*100)}%"></i>`).join('')}</div></div>`;
    const satelliteMonths = sat.monthlyFraction.map((f,i)=>`<div class="regional-sat-month ${sat.lowFlags?.[i]?'is-low':sat.uncertainFlags?.[i]?'is-uncertain':''}"><span>${escape(month[i])}</span><b>${n(f*100,0)} %</b><i style="--fill:${pct(f*100)}%" aria-hidden="true"></i><small>${escape(tr.satellitePoints)}: ${n(sat.samplePoints?.[i])}</small></div>`).join('');
    const satelliteBody = `<div class="regional-values">${value(tr.lowMonths,n(sat.lowMonths),' / 12')}${value(tr.uncertainMonths,n(sat.uncertainMonths),' / 12')}</div>`+heading(tr.satelliteDetails)+`<div class="regional-chart-legend"><span class="low-key">${escape(tr.satelliteLegendLow)}</span><span class="uncertain-key">${escape(tr.satelliteLegendUncertain)}</span><span class="other-key">${escape(tr.satelliteLegendOther)}</span></div><p class="regional-chart-caption">${escape(tr.satelliteFraction)}</p><div class="regional-sat-grid">${satelliteMonths}</div>`+note(tr.satelliteLimit);

    const forest = zone.deforestation;
    const history = forest.history?.valores || [];
    const historyStart = forest.history?.desde || 2001;
    const historyMax = Math.max(1,...history);
    const historyBars = history.map((v,i)=>`<i style="height:${Math.max(3,pct(v/historyMax*100))}%" title="${historyStart+i}: ${n(v,0)} ha"></i>`).join('');
    const forestPreview = `<div class="regional-preview regional-preview--forest"><div><b>${n(forest.risk*100,1)} %</b><span>${escape(tr.forestRisk)}</span></div><div><b>${n(forest.forestPct,1)} %</b><span>${escape(tr.forestPreview)}</span></div><div class="regional-forest-spark" aria-hidden="true">${historyBars}</div></div>`;
    const methods = sources.deforestation.methods || {};
    const names = {regresion_logistica:tr.logistic,random_forest:tr.randomForest,gradient_boosting:tr.boosting};
    const methodRows = Object.entries(names).map(([key,label])=>{
      const m=methods[key]||{};
      return `<tr${key===sources.deforestation.chosenMethod?' class="selected"':''}><th scope="row">${escape(label)}${key===sources.deforestation.chosenMethod?` <small>✓ ${escape(tr.chosen)}</small>`:''}</th><td>${n(m.auc,2)}</td><td>${n(m.f1,2)}</td></tr>`;
    }).join('');
    const projection = (forest.projection?.anios||[]).map((year,i)=>value(String(year),n(forest.projection.valores?.[i],0),'ha')).join('');
    const forestBody = `<div class="regional-values">${value(tr.forestCover,n(forest.forestPct,1),'%')}${value(tr.forestRisk,n(forest.risk*100,1),'%')}</div>`+heading(tr.forestHistory)+`<div class="regional-forest-chart" role="img" aria-label="${escape(tr.forestHistory)}: ${escape(history.map((v,i)=>(historyStart+i)+' '+n(v,0)+' ha').join('; '))}">${historyBars}</div><div class="regional-chart-years"><span>${historyStart}</span><span>${historyStart+history.length-1}</span></div><p class="regional-chart-caption">${escape(tr.historyConfidence)}: ${escape(conf(forest.historyConfidence))}</p>`+heading(tr.forestProjection)+`<div class="regional-projection">${projection}</div><p class="regional-chart-caption">${escape(tr.projectionConfidence)}: ${escape(conf(forest.projectionConfidence))} · ${escape(tr.projectionError)}: ${n(methods.temporal?.error_ha_pct,1)} %</p>`+heading(tr.forestModels)+`<div class="regional-table-wrap"><table class="regional-model-table"><thead><tr><th scope="col">${escape(tr.forestMethod)}</th><th scope="col">${escape(tr.forestAuc)}</th><th scope="col">${escape(tr.forestF1)}</th></tr></thead><tbody>${methodRows}</tbody></table></div>`+note(tr.forestLimit);

    container.innerHTML = [
      card('climate','☔',tr.climate,tr.climateIntro,sources.climate,climatePreview,climateBody,'clima_zonas'),
      card('soil','◈',tr.soil,tr.soilIntro,sources.soil,soilPreview,soilBody,'suelo_zonas'),
      card('satellite','▧',tr.satellite,tr.satelliteIntro,sources.satellite,satellitePreview,satelliteBody,'diagnostico_landsat_ia'),
      card('forest','♣',tr.forest,tr.forestIntro,sources.deforestation,forestPreview,forestBody,'desmonte_zonas')
    ].join('');
  }

  window.BioSatRegional = {render};
})();
