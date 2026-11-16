(() => {
  'use strict';

  const guestFiles = new Map();
  const ZONES = ['zona_1_riego_salitre','zona_2_secano_este','zona_3_monte_semiarido','zona_4_bajos_submeridionales','zona_5_sur_serrano'];
  const L = {
    es: {
      brandSub:'Inteligencia para cada campo',navHome:'Inicio',navFields:'Mis campos',navAnalysis:'Análisis',eyebrow:'Una nueva manera de mirar tu campo',heroTitle:'Tus datos, <em>más claros.</em><br>Tu campo, mejor entendido.',heroText:'Reuní imágenes, mediciones y observaciones en un mismo lugar. Identificá qué sector conviene revisar y conservá la historia de cada campo.',createField:'Crear mi campo',exploreDemo:'Explorar la vista',heroFoot:'Primero el contexto. Después, el detalle que necesitás.',heroVisualTitle:'Un campo. Muchas capas.',heroVisualSub:'La información importante, en su lugar.',howLabel:'CÓMO SE USA',flowTitle:'Una experiencia que acompaña la decisión.',step1Title:'Ubicá tu campo',step1Text:'Elegí la zona y agregá una ubicación si la tenés. Podés guardar más de un campo.',step2Title:'Sumá evidencia',step2Text:'Adjuntá un TIFF del dron y registrá observaciones. Cada archivo queda asociado al campo.',step3Title:'Revisá lo importante',step3Text:'Leé las tarjetas principales y abrí solo las que necesitan un análisis más profundo.',prototypeNote:'Este prototipo muestra la experiencia propuesta. Las observaciones de ejemplo son ilustrativas; cargar un TIFF aún no ejecuta un análisis agronómico.',myWorkspace:'MI ESPACIO',fieldsTitle:'Mis campos',fieldsLead:'Guardá los datos básicos de cada campo y volvé a ellos cuando lo necesites.',savedFields:'Campos guardados',localSave:'Guardado solo en este navegador. No se sincroniza con otros dispositivos.',fieldCard:'FICHA DE CAMPO',newField:'Nuevo campo',editField:'Editar campo',nameLabel:'Nombre del campo *',namePlaceholder:'Ej. El Algarrobal',zoneLabel:'Zona *',cropLabel:'Cultivo / uso',cropPlaceholder:'Ej. Soja, ganadería',geoOptional:'Ubicación opcional',geoHint:'Si conocés el punto del campo, agregá sus coordenadas.',latLabel:'Latitud',lonLabel:'Longitud',useDeviceLocation:'Usar ubicación actual del dispositivo',geoClarification:'La ubicación del dispositivo solo sirve si estás en el campo. Más adelante se podrá dibujar el límite real del lote.',notesLabel:'Notas del campo',notesPlaceholder:'Información que querés recordar…',saveField:'Guardar campo',updateField:'Guardar cambios',clearForm:'Limpiar',fieldIntelligence:'INTELIGENCIA DE CAMPO',analysisTitle:'Tu campo, de un vistazo.',analysisLead:'Elegí un campo para ver sus archivos, observaciones e historial.',selectedField:'CAMPO SELECCIONADO',noFieldsTitle:'Empezá por tu primer campo',noFieldsText:'Después podrás asociar archivos y observaciones a ese lugar.',currentField:'CAMPO ACTIVO',demoBanner:'Campo de ejemplo: sus observaciones son ilustrativas, no resultados de un análisis real.',visualContext:'CONTEXTO VISUAL',fieldView:'Vista del campo',conceptMap:'Esquema conceptual',noGeoRaster:'Sin mapa georreferenciado procesado',mapDisclaimer:'Este dibujo ayuda a imaginar la futura vista del lote. No representa un mapa real del campo.',addEvidence:'SUMAR EVIDENCIA',droneUpload:'Imagen del dron',dropTitle:'Arrastrá un TIFF o buscá en tu equipo',dropSub:'GeoTIFF / TIFF · uno o más archivos',chooseFiles:'Elegir archivos',uploadWarning:'La carga conserva el archivo en este navegador. El análisis automático aún no está implementado.',attachedFiles:'Archivos adjuntos',observationsLabel:'OBSERVACIONES',observationsTitle:'Lo que merece atención',observationsLead:'Una vista breve primero. Abrí cada tarjeta para ver el contexto completo.',addObservation:'Agregar observación',historyLabel:'TRAZABILIDAD',historyTitle:'Historial del campo',historyLead:'Las acciones se ordenan por fecha para que puedas volver a ver qué cambió.',newObservationLabel:'NUEVA OBSERVACIÓN',observationDialogTitle:'Registrar un hallazgo',manualNotice:'Registrá una observación manual. La interpretación de imágenes del dron requerirá un servicio de procesamiento.',obsTitleLabel:'Título *',obsSourceLabel:'Fuente',obsSectorLabel:'Sector',sectorPlaceholder:'Ej. Norte',obsSummaryLabel:'Resumen *',obsDetailLabel:'Detalle y próximo paso',cancel:'Cancelar',saveObservation:'Guardar observación',
      zone1:'Área de riego del Río Dulce',zone2:'Secano agrícola del este',zone3:'Chaco semiárido norte',zone4:'Bajos submeridionales',zone5:'Sur serrano y salinas',sourceField:'Observación de campo',sourceDrone:'Dron multiespectral',sourceSatellite:'Satélite',sourceOther:'Otra fuente',
      open:'Abrir',edit:'Editar',download:'Descargar',demo:'EJEMPLO',manual:'REGISTRO MANUAL',fullDetail:'Detalle y próximo paso',sample:'Dato ilustrativo de la interfaz.',noObservations:'Todavía no hay observaciones en este campo.',noObservationsSub:'Agregá una observación manual o adjuntá evidencia para preparar el análisis.',noFiles:'Aún no hay archivos TIFF.',noFields:'No hay campos todavía. Creá el primero en el formulario.',coordsUnavailable:'Ubicación no cargada',analysisPending:'Análisis pendiente',fileSaved:'Archivo guardado localmente',filesSaved:'Archivos guardados localmente',fieldSaved:'Campo guardado',fieldUpdated:'Campo actualizado',observationSaved:'Observación guardada',required:'Completá los campos obligatorios.',coordsPair:'Ingresá latitud y longitud juntas.',coordsRange:'Revisá las coordenadas.',geoUnavailable:'La ubicación no está disponible en este navegador.',geoError:'No se pudo obtener la ubicación. Podés escribirla manualmente.',geoSuccess:'Ubicación del dispositivo cargada. Verificá que estés en el campo.',invalidTiff:'Elegí archivos .tif o .tiff.',saveError:'No se pudo guardar en este navegador.',fileSaveError:'No se pudo guardar el TIFF. Revisá el espacio disponible.',missingFile:'El archivo no está disponible en este navegador.',emptyCrop:'Cultivo no indicado',demoName:'El Algarrobal · ejemplo',demoCrop:'Cultivo de ejemplo',demoNotes:'Campo ilustrativo para recorrer la propuesta de BioSat.',demoObs1Title:'Variación de vigor en el sector norte',demoObs1Summary:'Una tarjeta de ejemplo muestra dónde se concentraría la atención del productor.',demoObs1Detail:'En un producto real, este hallazgo incluiría mapa, fecha, índice, comparación histórica y una verificación del asesor antes de recomendar una acción.',demoObs2Title:'Diferencia entre dos fechas',demoObs2Summary:'La vista propuesta permitiría comparar el mismo sector a lo largo del tiempo.',demoObs2Detail:'La comparación exigiría imágenes alineadas, fechas visibles, resolución comparable y registro de cambios en el cultivo o manejo.',demoObs3Title:'Verificación en terreno',demoObs3Summary:'Una observación del asesor ayuda a interpretar lo que señala la imagen.',demoObs3Detail:'La observación profesional serviría para confirmar o descartar una hipótesis y dejar el próximo paso documentado.',eventCreated:'Campo creado',eventUpdated:'Datos del campo actualizados',eventFile:'TIFF adjuntado',eventObservation:'Observación registrada',eventExample:'Ejemplo de observaciones cargado',noHistory:'Todavía no hay movimientos.',fieldInfo:'Datos del campo',coords:'Coordenadas',notProvided:'Sin dato',exampleField:'Campo de demostración'
    },
    en: {
      brandSub:'Intelligence for every field',navHome:'Home',navFields:'My fields',navAnalysis:'Insights',eyebrow:'A clearer way to see your field',heroTitle:'Your data, <em>made clear.</em><br>Your field, better understood.',heroText:'Bring images, measurements and observations together. See which area deserves attention and keep every field’s history in one place.',createField:'Create a field',exploreDemo:'Explore the view',heroFoot:'Start with the context. Open the details when you need them.',heroVisualTitle:'One field. Many layers.',heroVisualSub:'The important information, in its place.',howLabel:'HOW IT WORKS',flowTitle:'A workflow that supports decisions.',step1Title:'Locate your field',step1Text:'Choose a zone and add a location if available. You can save multiple fields.',step2Title:'Add evidence',step2Text:'Attach a drone TIFF and record observations. Each file belongs to a field.',step3Title:'Review what matters',step3Text:'Read the key cards and open only those that need a closer look.',prototypeNote:'This prototype shows a proposed experience. Sample observations are illustrative; uploading a TIFF does not yet run an agronomic analysis.',myWorkspace:'MY WORKSPACE',fieldsTitle:'My fields',fieldsLead:'Save each field’s basic information and come back whenever you need it.',savedFields:'Saved fields',localSave:'Saved only in this browser. It does not sync across devices.',fieldCard:'FIELD PROFILE',newField:'New field',editField:'Edit field',nameLabel:'Field name *',namePlaceholder:'e.g. El Algarrobal',zoneLabel:'Zone *',cropLabel:'Crop / use',cropPlaceholder:'e.g. Soybeans, grazing',geoOptional:'Optional location',geoHint:'Add coordinates if you know the field’s location.',latLabel:'Latitude',lonLabel:'Longitude',useDeviceLocation:'Use this device’s current location',geoClarification:'The device location is useful only if you are at the field. A later version could draw its actual boundary.',notesLabel:'Field notes',notesPlaceholder:'Information you want to remember…',saveField:'Save field',updateField:'Save changes',clearForm:'Clear',fieldIntelligence:'FIELD INTELLIGENCE',analysisTitle:'Your field, at a glance.',analysisLead:'Choose a field to view its files, observations and history.',selectedField:'SELECTED FIELD',noFieldsTitle:'Start with your first field',noFieldsText:'You can then attach files and observations to that place.',currentField:'ACTIVE FIELD',demoBanner:'Sample field: its observations are illustrative, not results of a real analysis.',visualContext:'VISUAL CONTEXT',fieldView:'Field view',conceptMap:'Concept map',noGeoRaster:'No processed georeferenced map',mapDisclaimer:'This drawing illustrates a future field view. It is not a real map of your field.',addEvidence:'ADD EVIDENCE',droneUpload:'Drone image',dropTitle:'Drop a TIFF or browse your device',dropSub:'GeoTIFF / TIFF · one or more files',chooseFiles:'Choose files',uploadWarning:'The file is kept in this browser. Automated analysis is not implemented yet.',attachedFiles:'Attached files',observationsLabel:'OBSERVATIONS',observationsTitle:'What deserves attention',observationsLead:'Get the short view first. Open a card for the full context.',addObservation:'Add observation',historyLabel:'TRACEABILITY',historyTitle:'Field history',historyLead:'Actions are ordered by date so you can revisit what changed.',newObservationLabel:'NEW OBSERVATION',observationDialogTitle:'Record a finding',manualNotice:'Record a manual observation. Interpreting drone imagery will require a processing service.',obsTitleLabel:'Title *',obsSourceLabel:'Source',obsSectorLabel:'Sector',sectorPlaceholder:'e.g. North',obsSummaryLabel:'Summary *',obsDetailLabel:'Detail and next step',cancel:'Cancel',saveObservation:'Save observation',
      zone1:'Río Dulce irrigation area',zone2:'Eastern rainfed farming',zone3:'Northern semiarid Chaco',zone4:'Submeridional lowlands',zone5:'Southern hills and salt flats',sourceField:'Field observation',sourceDrone:'Multispectral drone',sourceSatellite:'Satellite',sourceOther:'Other source',
      open:'Open',edit:'Edit',download:'Download',demo:'SAMPLE',manual:'MANUAL RECORD',fullDetail:'Detail and next step',sample:'Illustrative interface content.',noObservations:'No observations for this field yet.',noObservationsSub:'Add a manual observation or attach evidence to prepare an analysis.',noFiles:'No TIFF files yet.',noFields:'No fields yet. Create your first one in the form.',coordsUnavailable:'Location not added',analysisPending:'Analysis pending',fileSaved:'File saved locally',filesSaved:'Files saved locally',fieldSaved:'Field saved',fieldUpdated:'Field updated',observationSaved:'Observation saved',required:'Complete the required fields.',coordsPair:'Enter latitude and longitude together.',coordsRange:'Check the coordinates.',geoUnavailable:'Location is not available in this browser.',geoError:'Could not get the location. You can enter it manually.',geoSuccess:'Device location added. Check that you are at the field.',invalidTiff:'Choose .tif or .tiff files.',saveError:'Could not save in this browser.',fileSaveError:'Could not save the TIFF. Check available storage.',missingFile:'The file is not available in this browser.',emptyCrop:'Crop not specified',demoName:'El Algarrobal · sample',demoCrop:'Sample crop',demoNotes:'Illustrative field for exploring the BioSat concept.',demoObs1Title:'Variation in the northern sector',demoObs1Summary:'A sample card shows where the producer’s attention would be focused.',demoObs1Detail:'In a real product, this finding would include a map, date, index, historical comparison and advisor review before an action is recommended.',demoObs2Title:'Change between two dates',demoObs2Summary:'The proposed view would compare the same sector over time.',demoObs2Detail:'The comparison would need aligned images, visible dates, comparable resolution and a record of crop or management changes.',demoObs3Title:'Ground verification',demoObs3Summary:'An advisor’s observation helps interpret what an image suggests.',demoObs3Detail:'Professional review would confirm or reject a hypothesis and document the next step.',eventCreated:'Field created',eventUpdated:'Field details updated',eventFile:'TIFF attached',eventObservation:'Observation recorded',eventExample:'Sample observations loaded',noHistory:'No activity yet.',fieldInfo:'Field details',coords:'Coordinates',notProvided:'Not provided',exampleField:'Sample field'
    }
  };
  Object.assign(L.es,{accessTitle:'Accesibilidad',themeTitle:'Apariencia',lightTheme:'Claro',darkTheme:'Oscuro',fontTitle:'Tamaño de letra',fontNormal:'Normal',fontLarge:'Grande',fontXLarge:'Muy grande',authKicker:'TU CUENTA',authLogin:'Iniciar sesión',authRegister:'Crear cuenta',authName:'Tu nombre',authEmail:'Correo electrónico',authPassword:'Contraseña',authConfirm:'Repetir contraseña',authHelp:'Ingresá con tu cuenta para conservar campos e historial en cualquier dispositivo.',authRegisterHelp:'Usá el mismo correo de tu acceso anterior para recuperar los campos que ya guardaste. La contraseña debe tener al menos 12 caracteres.',authGuest:'Seguir sin guardar',authMismatch:'Las contraseñas no coinciden.',authFailure:'No se pudo completar la operación. Revisá los datos e intentá de nuevo.',authInvalid:'Correo o contraseña incorrectos.',authExists:'Ese correo ya tiene una cuenta. Iniciá sesión.',authSuccess:'Sesión iniciada.',authCreated:'Cuenta creada.',authSignedOut:'Sesión cerrada.',authBusy:'Procesando…',close:'Cerrar',accessSaved:'Preferencias guardadas.',accessError:'No se pudieron sincronizar las preferencias.'});
  Object.assign(L.en,{accessTitle:'Accessibility',themeTitle:'Appearance',lightTheme:'Light',darkTheme:'Dark',fontTitle:'Text size',fontNormal:'Normal',fontLarge:'Large',fontXLarge:'Extra large',authKicker:'YOUR ACCOUNT',authLogin:'Sign in',authRegister:'Create account',authName:'Your name',authEmail:'Email address',authPassword:'Password',authConfirm:'Repeat password',authHelp:'Sign in to keep your fields and history on any device.',authRegisterHelp:'Use the same email as your previous access to recover saved fields. Your password must be at least 12 characters.',authGuest:'Continue without saving',authMismatch:'Passwords do not match.',authFailure:'Could not complete the request. Check your details and try again.',authInvalid:'Incorrect email or password.',authExists:'This email already has an account. Sign in.',authSuccess:'Signed in.',authCreated:'Account created.',authSignedOut:'Signed out.',authBusy:'Working…',close:'Close',accessSaved:'Preferences saved.',accessError:'Could not sync preferences.'});

  Object.assign(L.es,{
    prototypeNote:'Los datos del repositorio representan zonas, no tu lote. Los TIFF se guardan aquí, pero todavía no generan un análisis en este prototipo.',
    demoBanner:'Campo de ejemplo. Los datos regionales que aparecen abajo sí vienen del repositorio; no son mediciones de este lote.',
    observationsLabel:'OBSERVACIONES DEL CAMPO',observationsTitle:'Lo que registraste',observationsLead:'Estas notas pertenecen al campo seleccionado y quedan en su historial.',
    regionalLabel:'DATOS DEL REPOSITORIO · CONTEXTO DE ZONA',regionalTitle:'La zona en números',rainChartTitle:'Lluvia media por mes',rainChartPeriod:'NASA POWER · 2021–2025',regionalFoot:'Valores de referencia regional. El clima representa un punto por zona, no una medición dentro del campo.',regionalCardsLabel:'LECTURAS REGIONALES',regionalCardsTitle:'Qué dicen los datos de tu zona',regionalCardsLead:'Abrí cada tarjeta para conocer su fuente, fecha y límites.',rotationsLabel:'ALTERNATIVAS DE LA ZONA',rotationsTitle:'Rotaciones para conversar',regionalBadge:'DATO DE ZONA',sourceDate:'Fuente y fecha',limits:'Cómo interpretarlo',climateCard:'Lluvia y calor',soilCard:'Suelo de referencia',satCard:'Cobertura verde en imágenes',forestCard:'Monte y desmonte',rainMetric:'Lluvia anual reciente',heatMetric:'Días de más de 40 °C',phMetric:'pH del suelo',lowMetric:'Meses con poco verde',mm:'mm',days:'días',months:'meses',noRegional:'No hay datos regionales para esta zona.',climateSummary:'Entre 2021 y 2025, la lluvia media anual fue {recent} mm; en 1991–2020 fue {normal} mm.',climateDetail:'NASA POWER usa un punto representativo de la zona y una celda aproximada de 50 km. La diferencia es contexto climático, no una medición del agua disponible en este lote.',soilSummary:'pH {ph}; arcilla {clay} %; carbono orgánico {carbon} g/kg.',soilDetail:'SoilGrids 2.0 resume estimaciones de suelo a escala regional. Para decidir una intervención hace falta un análisis del lote.',satSummary:'{months} meses suelen mostrar poca vegetación verde; {uncertain} meses cambian al variar el umbral.',satDetail:'Landsat 2021–2025, NDVI menor a 0,25. El método no distingue suelo descubierto de rastrojo seco y no tiene exactitud medida con datos de campo.',forestSummary:'Monte estimado: {forest} % de la zona. Presión de desmonte del modelo: {risk} %.',forestDetail:'Hansen GFC y modelo predictivo por zona. AUC de prueba temporal {auc}; el riesgo sirve para comparar zonas y no predice el destino de este lote.',rotationsDisclaimerUnvalidated:'Estas fichas aún no tienen validación local. Revisalas con un profesional antes de aplicarlas.',rotationsDisclaimerReviewed:'Estas fichas fueron revisadas por un productor de la zona; requieren adaptación y revisión de tu lote.',rotationCurrent:'Actual',rotationAlternative:'Alternativa',rotationSequence:'Secuencia',rotationReason:'Por qué se propone',rotationMissing:'Qué falta saber',rotationRisks:'Riesgos a revisar',sourceOriginal:'Las fichas originales del repositorio están en español.',repoSnapshot:'Instantánea del repositorio',noFieldObservations:'No hay observaciones propias de este campo todavía.',zoneOnly:'Contexto de zona · no medición del lote'
  });
  Object.assign(L.en,{
    prototypeNote:'Repository figures represent zones, not your field. TIFF files are saved here but do not yet generate an analysis in this prototype.',
    demoBanner:'Sample field. The regional figures below come from the repository; they are not measurements of this field.',
    observationsLabel:'FIELD OBSERVATIONS',observationsTitle:'What you recorded',observationsLead:'These notes belong to the selected field and remain in its history.',
    regionalLabel:'REPOSITORY DATA · REGIONAL CONTEXT',regionalTitle:'Your zone in numbers',rainChartTitle:'Average monthly rainfall',rainChartPeriod:'NASA POWER · 2021–2025',regionalFoot:'Regional reference values. Climate represents one point per zone, not a measurement inside this field.',regionalCardsLabel:'REGIONAL READINGS',regionalCardsTitle:'What your zone data says',regionalCardsLead:'Open each card for its source, date and limits.',rotationsLabel:'REGIONAL OPTIONS',rotationsTitle:'Rotations to discuss',regionalBadge:'REGIONAL DATA',sourceDate:'Source and date',limits:'How to interpret it',climateCard:'Rain and heat',soilCard:'Reference soil',satCard:'Green cover in imagery',forestCard:'Forest and clearing',rainMetric:'Recent annual rain',heatMetric:'Days above 40 °C',phMetric:'Soil pH',lowMetric:'Months with low green cover',mm:'mm',days:'days',months:'months',noRegional:'No regional data for this zone.',climateSummary:'From 2021 to 2025, mean annual rainfall was {recent} mm; in 1991–2020 it was {normal} mm.',climateDetail:'NASA POWER uses one representative point per zone and a cell of roughly 50 km. This difference is climate context, not a measurement of available water in this field.',soilSummary:'pH {ph}; clay {clay}%; organic carbon {carbon} g/kg.',soilDetail:'SoilGrids 2.0 summarizes regional soil estimates. A field soil test is needed before deciding on an intervention.',satSummary:'{months} months usually show little green vegetation; {uncertain} months change with the threshold.',satDetail:'Landsat 2021–2025, NDVI below 0.25. The method cannot tell bare soil from dry residue and has no accuracy measured against field data.',forestSummary:'Estimated forest cover: {forest}% of the zone. Model clearing pressure: {risk}%.',forestDetail:'Hansen GFC and a zone-level predictive model. Temporal test AUC {auc}; risk helps compare zones and does not predict what will happen in this field.',rotationsDisclaimerUnvalidated:'These profiles have no local validation yet. Review them with a professional before applying them.',rotationsDisclaimerReviewed:'These profiles were reviewed by a producer in the zone; they still need adaptation and review for your field.',rotationCurrent:'Current',rotationAlternative:'Alternative',rotationSequence:'Sequence',rotationReason:'Why it is proposed',rotationMissing:'What remains to check',rotationRisks:'Risks to review',sourceOriginal:'Original repository profiles are in Spanish.',repoSnapshot:'Repository snapshot',noFieldObservations:'No field observations recorded yet.',zoneOnly:'Regional context · not a field measurement'
  });
  Object.assign(L.es,{
    simKicker:'EJEMPLO DE USO',simTitle:'De los datos a una decisión posible.',simIntro:'Elegí una zona para comparar datos regionales e imágenes y decidir qué verificar en el campo.',simBadge:'EJEMPLO · NO ES UNA RECOMENDACIÓN',simZone:'Zona de referencia',simDecisionTitle:'Qué haría el productor',simDecision:'Revisar un sector con el asesor y un muestreo de suelo antes de decidir una aplicación. El TIFF aportaría detalle cuando exista un procesador de imágenes validado.',simImagesTitle:'Imágenes para contrastar',simWinter:'Invierno 2025',simSummer:'Verano 2024–2025',simRgb:'Color real · Landsat',simNdvi:'NDVI · Landsat',tiffPreviewTitle:'Vista del TIFF cargado',tiffLoading:'Procesando vista previa…',tiffError:'No se pudo generar la vista previa de este TIFF.',tiffNoGeo:'Sin georreferencia reconocida',tiffPreviewNote:'Vista visual del archivo. No implica diagnóstico agronómico.',simRain:'Lluvia anual reciente',simSoil:'pH de referencia',simSat:'Meses con poco verde',simForest:'Monte estimado',simRotation:'Fichas de rotación',simRainContext:'NASA POWER · 2021–2025 · punto regional',simSoilContext:'SoilGrids 2.0 · estimación regional',simSatContext:'Landsat · 2021–2025 · zona',simForestContext:'Hansen GFC · zona',simRotationContext:'Repositorio BioSat · opciones por zona',guestMode:'Explorar sin guardar',accountMode:'Cuenta conectada',accountSignIn:'Iniciar sesión',guestNotice:'Modo invitado: los campos y archivos se borran al cerrar o recargar la página.',cloudNotice:'Tus campos e historial se guardan en tu cuenta y están disponibles en otros dispositivos.',cloudError:'No se pudo sincronizar con tu cuenta. Volvé a intentar.',guestSwitch:'Pasar a modo invitado',accountSwitch:'Volver a mi cuenta',signOut:'Cerrar sesión'
  });
  Object.assign(L.en,{
    simKicker:'USE EXAMPLE',simTitle:'From data to a possible decision.',simIntro:'Choose a zone to compare regional data and imagery and decide what to check in the field.',simBadge:'EXAMPLE · NOT A RECOMMENDATION',simZone:'Reference zone',simDecisionTitle:'What the producer would do',simDecision:'Inspect a sector with an adviser and soil sampling before deciding on an application. A TIFF would add detail once a validated image processor exists.',simImagesTitle:'Images to compare',simWinter:'Winter 2025',simSummer:'Summer 2024–2025',simRgb:'True color · Landsat',simNdvi:'NDVI · Landsat',tiffPreviewTitle:'Uploaded TIFF preview',tiffLoading:'Processing preview…',tiffError:'Could not preview this TIFF.',tiffNoGeo:'No recognized georeference',tiffPreviewNote:'Visual file preview. This is not an agronomic diagnosis.',simRain:'Recent annual rainfall',simSoil:'Reference pH',simSat:'Months with low green cover',simForest:'Estimated forest cover',simRotation:'Rotation profiles',simRainContext:'NASA POWER · 2021–2025 · regional point',simSoilContext:'SoilGrids 2.0 · regional estimate',simSatContext:'Landsat · 2021–2025 · zone',simForestContext:'Hansen GFC · zone',simRotationContext:'BioSat repository · zone options',guestMode:'Explore without saving',accountMode:'Connected account',accountSignIn:'Sign in',guestNotice:'Guest mode: fields and files disappear when the page is closed or reloaded.',cloudNotice:'Your fields and history are stored in your account and available across devices.',cloudError:'Could not sync your account. Please try again.',guestSwitch:'Switch to guest mode',accountSwitch:'Return to my account',signOut:'Sign out'
  });
  Object.assign(L.es,{lotImagesTitle:'Satélite del lote',lotNoMatch:'No hay un recorte satelital publicado que coincida con la ubicación de este TIFF.',lotNoGeo:'El TIFF no tiene una georreferencia compatible para buscar imágenes del mismo lugar.',lotMatchNote:'Coincidencia de recuadros geográficos. La fecha y la resolución del satélite pueden diferir de las del vuelo; todavía no se comparan valores NDVI.',lotSourceS2:'Sentinel-2',lotSourceL8:'Landsat 8',lotScene:'Pasada',lotClean:'Área sin nubes'});
  Object.assign(L.en,{lotImagesTitle:'Satellite images for this field',lotNoMatch:'No published satellite crop overlaps the location of this TIFF.',lotNoGeo:'This TIFF has no supported georeference for finding images of the same area.',lotMatchNote:'The geographic extents overlap. Satellite date and resolution may differ from the flight; NDVI values are not compared yet.',lotSourceS2:'Sentinel-2',lotSourceL8:'Landsat 8',lotScene:'Acquisition',lotClean:'Cloud-free area'});
  L.es.regionalCardsLead='Compará los indicadores y abrí cada tarjeta para ver cifras, método y límites.';
  L.en.regionalCardsLead='Compare the indicators and open each card for figures, methods and limitations.';
  Object.assign(L.es,{monthlyLabel:'TU AÑO · DATOS DE LA ZONA',monthlyTitle:'Mes a mes, cuando lo necesites',monthlyLead:'Abrí un mes para consultar clima, cobertura y la rotación de referencia.',monthlyRecent:'2021–2025',monthlyNormal:'1991–2020',monthlyFoot:'Promedios históricos regionales; no son un pronóstico ni mediciones del lote. La cobertura satelital corresponde a 2021–2025 en ambos períodos.',monthOpen:'Abrir mes',monthDry:'Falta agua',monthFrost:'Heladas',monthHeat:'Calor',monthRain:'Lluvia favorable',monthGreen:'Poco verde',monthStable:'Condiciones mixtas',monthRainMetric:'Lluvia media',monthRainRange:'1 de cada 10 años: menos de {low} mm; 1 de cada 10: más de {high} mm.',monthDemand:'Demanda de agua (ET0)',monthBalance:'Lluvia − demanda',monthHeatMetric:'Días >35 °C / >40 °C',monthFrostMetric:'Días con mínima ≤3 °C',monthFrostChance:'Años con al menos un día de mínima ≤0 °C',monthTemp:'Máxima / mínima media',monthMoisture:'Humedad de raíces estimada',monthSatellite:'Poca vegetación verde en Landsat',monthRotation:'Suelo en rotación ilustrativa',monthCultivo:'Cultivo',monthRastrojo:'Rastrojo',monthDesnudo:'Descubierto',monthNoRotation:'Sin dato',monthSource:'Datos y límites',monthClimateNote:'NASA POWER (MERRA-2): reanálisis para un punto regional de ~50 km; ET0 calculada con Hargreaves. El balance no equivale al agua disponible en el lote.',monthSatNote:'Landsat 2021–2025: fracción estimada de poca vegetación verde. El método no distingue suelo descubierto de rastrojo seco.',monthRotationNote:'El calendario de rotación es un ejemplo del repositorio, no el manejo registrado de este campo.',monthPercent:'%',monthDays:'días'});
  Object.assign(L.en,{monthlyLabel:'YOUR YEAR · REGIONAL DATA',monthlyTitle:'Month by month, when you need it',monthlyLead:'Open a month to inspect climate, cover and the example rotation.',monthlyRecent:'2021–2025',monthlyNormal:'1991–2020',monthlyFoot:'Regional historical averages, not a forecast or field measurements. Satellite cover uses 2021–2025 for both periods.',monthOpen:'Open month',monthDry:'Water shortfall',monthFrost:'Frost',monthHeat:'Heat',monthRain:'Favorable rain',monthGreen:'Low green cover',monthStable:'Mixed conditions',monthRainMetric:'Average rain',monthRainRange:'1 in 10 years: below {low} mm; 1 in 10: above {high} mm.',monthDemand:'Water demand (ET0)',monthBalance:'Rain − demand',monthHeatMetric:'Days >35 °C / >40 °C',monthFrostMetric:'Days with minimum ≤3 °C',monthFrostChance:'Years with at least one day ≤0 °C',monthTemp:'Mean maximum / minimum',monthMoisture:'Estimated root moisture',monthSatellite:'Low green vegetation in Landsat',monthRotation:'Ground in example rotation',monthCultivo:'Crop',monthRastrojo:'Residue',monthDesnudo:'Uncovered',monthNoRotation:'No data',monthSource:'Data and limits',monthClimateNote:'NASA POWER (MERRA-2): reanalysis for one regional point, ~50 km grid; ET0 calculated with Hargreaves. The balance is not field available water.',monthSatNote:'Landsat 2021–2025: estimated fraction with little green vegetation. The method cannot distinguish bare ground from dry residue.',monthRotationNote:'The rotation calendar is a repository example, not the management recorded for this field.',monthPercent:'%',monthDays:'days'});
  Object.assign(L.es,{tiffColor:'A color',tiffGray:'Blanco y negro',tiffHeat:'Mapa de calor',tiffViewModes:'Modo de visualización del TIFF',tiffImage:'Imagen {n} de {total}',tiffBand:'Banda {n} de {total}',tiffComposite:'Composición de bandas',tiffSlide:'Vista {n} de {total}',tiffPrevious:'Vista anterior',tiffNext:'Vista siguiente',tiffHeatNote:'Colorización de intensidad relativa. No mide temperatura ni calcula NDVI.',tiffFalseColorNote:'Composición visual de las tres primeras bandas; no representa color real calibrado.',tiffSingleBandNote:'Este archivo tiene una sola banda; el modo a color no está disponible.',tiffBandNote:'Banda individual del TIFF. Su significado espectral requiere metadatos del sensor.'});
  Object.assign(L.en,{tiffColor:'Color',tiffGray:'Black and white',tiffHeat:'Heat map',tiffViewModes:'TIFF display mode',tiffImage:'Image {n} of {total}',tiffBand:'Band {n} of {total}',tiffComposite:'Band composite',tiffSlide:'View {n} of {total}',tiffPrevious:'Previous view',tiffNext:'Next view',tiffHeatNote:'Relative image intensity coloring. It does not measure temperature or calculate NDVI.',tiffFalseColorNote:'Visual composite of the first three bands; not calibrated true color.',tiffSingleBandNote:'This file has one band; color mode is unavailable.',tiffBandNote:'Individual TIFF band. Its spectral meaning requires sensor metadata.'});
  Object.assign(L.es,{rotationsTitle:'Tres rotaciones para comparar',rotationNumber:'Ficha {n} de 3',rotationNotRanking:'La numeración identifica las tres fichas de la zona; no es un ranking ni una recomendación para tu lote.',rotationMetrics:'Exposición en un año tipo',rotationBare:'Meses de suelo desnudo',rotationHeat:'Días >40 °C con cultivo en pie',rotationStorms:'Tormentas ≥30 mm sobre suelo desnudo',rotationRecentClimate:'Cruce del calendario de la ficha con promedios NASA POWER 2021–2025; no predice el resultado del lote.',rotationCalendar:'Suelo mes a mes',rotationSeqDetail:'Secuencia de cultivos',rotationSection:'Sección',rotationPlant:'Siembra',rotationHarvest:'Cosecha',rotationBenefits:'Beneficios posibles según la ficha',rotationEvidence:'Evidencia indicada en el repositorio',rotationAttributes:'Requisitos y perfil',rotationWater:'Demanda de agua',rotationNitrogen:'Aporte de nitrógeno',rotationIncome:'Ingreso estimado',rotationForage:'Forraje',rotationIrrigation:'Requiere riego',rotationLivestock:'Requiere hacienda',rotationMachinery:'Maquinaria indicada',rotationYes:'Sí',rotationNo:'No',rotationHigh:'Alta',rotationMedium:'Media',rotationLow:'Baja',rotationPositive:'Positivo',rotationNeutral:'Neutro',rotationNegative:'Negativo',rotationSources:'Fuentes citadas en la ficha',rotationSourcesCaveat:'Algunas citas del repositorio aún requieren una referencia bibliográfica exacta.',rotationCrop:'Cultivo',rotationCover:'Cobertura',rotationResidue:'Rastrojo',rotationBareState:'Desnudo'});
  Object.assign(L.en,{rotationsTitle:'Three rotations to compare',rotationNumber:'Profile {n} of 3',rotationNotRanking:'Numbers identify the three regional profiles; they are not a ranking or a recommendation for your field.',rotationMetrics:'Exposure in a typical year',rotationBare:'Months with bare soil',rotationHeat:'Days >40 °C with a crop growing',rotationStorms:'Storms ≥30 mm on bare soil',rotationRecentClimate:'Repository calendar crossed with NASA POWER 2021–2025 averages; it does not predict this field’s outcome.',rotationCalendar:'Ground cover by month',rotationSeqDetail:'Crop sequence',rotationSection:'Section',rotationPlant:'Planting',rotationHarvest:'Harvest',rotationBenefits:'Potential benefits in the profile',rotationEvidence:'Evidence cited by the repository',rotationAttributes:'Requirements and profile',rotationWater:'Water demand',rotationNitrogen:'Nitrogen contribution',rotationIncome:'Estimated income',rotationForage:'Forage',rotationIrrigation:'Requires irrigation',rotationLivestock:'Requires livestock',rotationMachinery:'Equipment listed',rotationYes:'Yes',rotationNo:'No',rotationHigh:'High',rotationMedium:'Medium',rotationLow:'Low',rotationPositive:'Positive',rotationNeutral:'Neutral',rotationNegative:'Negative',rotationSources:'Sources cited in the profile',rotationSourcesCaveat:'Some repository citations still need an exact bibliographic reference.',rotationCrop:'Crop',rotationCover:'Cover',rotationResidue:'Residue',rotationBareState:'Bare'});
  Object.assign(L.es,{heroSatelliteBadge:'LANDSAT · CONTEXTO REGIONAL',heroZoneLabel:'ZONA DE REFERENCIA',heroViewSource:'Ver imagen original ↗',heroCarouselLabel:'Cinco zonas en imágenes satelitales',heroGoZone:'Ver zona {n}',heroPrevious:'Imagen anterior',heroNext:'Imagen siguiente',heroSceneCount:'{n} escenas',heroImageAlt:'Imagen satelital de {zone}',heroImageType:'Compuesto RGB · verano 2024–2025'});
  Object.assign(L.en,{heroSatelliteBadge:'LANDSAT · REGIONAL CONTEXT',heroZoneLabel:'REFERENCE ZONE',heroViewSource:'View original image ↗',heroCarouselLabel:'Five zones in satellite images',heroGoZone:'View zone {n}',heroPrevious:'Previous image',heroNext:'Next image',heroSceneCount:'{n} scenes',heroImageAlt:'Satellite image of {zone}',heroImageType:'RGB composite · summer 2024–2025'});
  Object.assign(L.es,{tiffCacheSaving:'Guardando vista en tu cuenta…',tiffCacheSaved:'Vista guardada en tu cuenta.',tiffCacheLoaded:'Vista recuperada de tu cuenta.',tiffCacheError:'No se pudo guardar esta vista; el TIFF original sigue en tu cuenta.'});
  Object.assign(L.en,{tiffCacheSaving:'Saving view to your account…',tiffCacheSaved:'View saved to your account.',tiffCacheLoaded:'View restored from your account.',tiffCacheError:'Could not save this view; the original TIFF remains in your account.'});
  Object.assign(L.es,{regionalImageBadge:'Imágenes regionales',zoneImagesTitle:'Imágenes de la zona',zoneSeasonLabel:'Temporada',zoneVisualLimit:'Estas imágenes representan la zona, no tu lote. El TIFF del dron se muestra arriba cuando lo adjuntás.',zoneVisualSource:'Compuesto Landsat de la zona',zoneImageOriginal:'Ver imagen original',cacheExplainer:'Las vistas del TIFF se guardan en este dispositivo para abrirlas más rápido y, con cuenta, también en la nube.',cacheExplainerGuest:'En modo invitado, las vistas son temporales y se borran al cerrar o recargar la página.',uploadProgressSending:'Subiendo TIFF',uploadProgressPreparing:'Preparando vista previa mientras se sube el TIFF',tiffCacheLocal:'Vista abierta desde el caché de este dispositivo.',tiffCacheCloud:'Vista recuperada de tu cuenta y guardada en este dispositivo.',tiffCachePending:'Vista lista; el TIFF continúa subiendo.'});
  Object.assign(L.en,{regionalImageBadge:'Regional imagery',zoneImagesTitle:'Zone imagery',zoneSeasonLabel:'Season',zoneVisualLimit:'These images represent the zone, not your field. The drone TIFF appears above after you attach it.',zoneVisualSource:'Regional Landsat composite',zoneImageOriginal:'View original image',cacheExplainer:'TIFF views are stored on this device for faster return visits and, with an account, also in the cloud.',cacheExplainerGuest:'In guest mode, views are temporary and disappear when you close or reload the page.',uploadProgressSending:'Uploading TIFF',uploadProgressPreparing:'Preparing the preview while the TIFF uploads',tiffCacheLocal:'View opened from this device’s cache.',tiffCacheCloud:'View restored from your account and saved on this device.',tiffCachePending:'View ready; the TIFF is still uploading.'});
  Object.assign(L.es,{fieldView:'Imágenes del campo y la zona',uploadWarning:'El TIFF queda asociado a tu campo. La vista se prepara mientras se sube el archivo.'});
  Object.assign(L.en,{fieldView:'Field and zone imagery',uploadWarning:'The TIFF belongs to your field. Its preview is prepared while the file uploads.'});
  let REPO = window.BIOSAT_REPO_DATA || null;
  let SCENES = window.BIOSAT_SCENES_DATA || null;
  let LOTS = window.BIOSAT_LOTS_DATA || [];
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const now = () => new Date().toISOString();
  let language = 'es';
  let state;
  let guestState;
  let accountState;
  let accountUser=null;
  let mode='guest';
  let authMode='login';
  let preferences={theme:'light',fontSize:'normal'};
  let saveQueue=Promise.resolve();
  let previewSelection=null;
  let previewKey='';
  let previewRenderGeneration=0;
  let previewViewer=null;
  let previewResult=null;
  let previewCacheStatus='';
  const previewSessions=new Map();
  const previewResults=new Map();
  const pendingUploads=new Map();
  const failedUploads=new Set();
  let zoneSeason='verano';
  let zoneCacheRegistration=null;
  let lastPrefetchedZone='';
  let previewSlide=0;
  let previewMode='color';
  let toastTimer;
  let monthPeriod='recent';
  let heroSlide=0;

  function t(key){ return L[language][key] ?? key; }
  function locale(){ return language === 'es' ? 'es-AR' : 'en-US'; }
  function date(v){ return new Date(v).toLocaleDateString(locale(),{day:'numeric',month:'short',year:'numeric'}); }
  function size(bytes){ return bytes < 1024*1024 ? (bytes/1024).toFixed(0)+' KB' : (bytes/(1024*1024)).toFixed(1)+' MB'; }
  function toast(message){ const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),3300); }
  function zoneName(id){ const n=ZONES.indexOf(id); return t('zone'+(n+1)); }
  function sourceName(id){ return t({field:'sourceField',drone:'sourceDrone',satellite:'sourceSatellite',other:'sourceOther'}[id] || 'sourceOther'); }
  function fieldById(id){ return state.fields.find(f=>f.id===id); }
  function activeField(){ return fieldById(state.activeId) || state.fields[0] || null; }
  function persist(){
    if(mode==='guest')return true;
    const payload=JSON.stringify(state);
    saveQueue=saveQueue.catch(()=>{}).then(async()=>{
      const response=await fetch('/api/state',{method:'PUT',headers:{'content-type':'application/json'},body:payload});
      if(!response.ok)throw new Error('sync '+response.status);
    }).catch(()=>toast(t('cloudError')));
    return true;
  }
  function addHistory(field,kind,detail){ field.history.unshift({id:uid(),kind,detail,at:now()}); }
  function snapshot(field){ return [field.name,zoneName(field.zone),field.crop||t('notProvided'),field.lat!==null?`${field.lat}, ${field.lon}`:t('notProvided'),field.notes||t('notProvided')].join(' · '); }

  function demoField(){
    const f={id:'demo-field',demo:true,name:'El Algarrobal',zone:ZONES[1],crop:'',lat:null,lon:null,notes:'',createdAt:now(),files:[],observations:[],history:[]};
    addHistory(f,'eventCreated',''); return f;
  }
  function loadState(){
    const sample=demoField(); guestState={version:2,fields:[sample],activeId:sample.id,language:'es'}; state=guestState;
    try{const saved=JSON.parse(localStorage.getItem('biosat-accessibility')||'{}');preferences={theme:saved.theme==='dark'?'dark':'light',fontSize:['normal','large','xlarge'].includes(saved.fontSize)?saved.fontSize:'normal'};}catch(e){}
    applyPreferences();
  }
  async function loadAccount(){
    try{
      const response=await fetch('/api/state',{cache:'no-store'});
      if(!response.ok){accountUser=null;accountState=null;mode='guest';state=guestState;renderAccount();return;}
      const result=await response.json();
      accountUser=result.user;
      accountState=result.state&&Array.isArray(result.state.fields)?result.state:{version:2,fields:[],activeId:null,language};
      state=accountState;mode='account';language=state.language==='en'?'en':'es';
      if(result.preferences){preferences={theme:result.preferences.theme==='dark'?'dark':'light',fontSize:['normal','large','xlarge'].includes(result.preferences.fontSize)?result.preferences.fontSize:'normal'};applyPreferences();}
      applyLanguage();
    }catch(e){}
  }
  function renderAccount(){
    const button=$('#accountButton'); if(!button)return;
    button.textContent=accountUser?(accountUser.displayName||accountUser.email):t('authLogin');
    button.title=accountUser?accountUser.email:t('authLogin');
    $('#signOutButton').hidden=!accountUser;
    $('#signOutButton').title=t('signOut');
    const notice=$('.local-notice span:last-child'); if(notice)notice.textContent=t(mode==='account'?'cloudNotice':'guestNotice');
    const warning=$('.upload-warning'); if(warning)warning.textContent=mode==='account'?(language==='es'?'El TIFF queda asociado a tu cuenta. La vista se prepara mientras se sube; no genera un diagnóstico automático.':'The TIFF is linked to your account. Its preview is prepared during upload; it does not produce an automatic diagnosis.'):(language==='es'?'El TIFF y su vista solo duran esta visita. No generan un diagnóstico automático.':'The TIFF and its preview last only for this visit. They do not produce an automatic diagnosis.');
    const cacheNote=$('.cache-explainer');if(cacheNote)cacheNote.textContent=t(mode==='account'?'cacheExplainer':'cacheExplainerGuest');
  }

  function applyLanguage(){
    document.documentElement.lang=language;
    $$('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
    $$('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml);});
    $$('[data-i18n-placeholder]').forEach(el=>{el.placeholder=t(el.dataset.i18nPlaceholder);});
    $$('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.i18nAria));});
    $('#langToggle').innerHTML=(language==='es'?'EN':'ES')+' <span aria-hidden="true">↗</span>';
    $('#langToggle').setAttribute('aria-label',language==='es'?'Switch to English':'Cambiar a español');
    document.title=language==='es'?'BioSat · Propuesta de experiencia':'BioSat · Experience concept';
    renderZoneOptions(); renderSourceOptions(); renderAll(); renderSimulation(); renderHeroCarousel(); renderAccount();renderAccessibility();renderAuthMode();
  }
  function applyPreferences(){
    document.documentElement.dataset.theme=preferences.theme;
    document.documentElement.dataset.fontSize=preferences.fontSize;
    try{localStorage.setItem('biosat-accessibility',JSON.stringify(preferences));}catch(e){}
    renderAccessibility();
  }
  function renderAccessibility(){
    $$('[data-theme]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===preferences.theme)));
    $$('[data-font-size]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.fontSize===preferences.fontSize)));
  }
  async function updatePreference(key,value){
    preferences[key]=value;applyPreferences();
    if(!accountUser)return;
    try{const response=await fetch('/api/auth/preferences',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(preferences)});if(!response.ok)throw new Error('preferences');}
    catch(e){toast(t('accessError'));}
  }
  function renderAuthMode(){
    const isRegister=authMode==='register';
    $('#authTitle').textContent=t(isRegister?'authRegister':'authLogin');
    $('#authSubmit').textContent=t(isRegister?'authRegister':'authLogin');
    $('#displayNameWrap').hidden=!isRegister;$('#confirmWrap').hidden=!isRegister;
    $('#authName').required=isRegister;$('#authConfirm').required=isRegister;
    $('#authPassword').autocomplete=isRegister?'new-password':'current-password';
    $('#authHelp').textContent=t(isRegister?'authRegisterHelp':'authHelp');
    $('#loginTab').setAttribute('aria-selected',String(!isRegister));
    $('#registerTab').setAttribute('aria-selected',String(isRegister));
    $('#authStatus').hidden=true;
  }
  function openAuth(){authMode='login';$('#authForm').reset();renderAuthMode();$('#authDialog').showModal();$('#authEmail').focus();}
  async function submitAuth(event){
    event.preventDefault();
    const email=$('#authEmail').value.trim(),password=$('#authPassword').value;
    if(authMode==='register'&&password!==$('#authConfirm').value){$('#authStatus').textContent=t('authMismatch');$('#authStatus').hidden=false;return;}
    const submit=$('#authSubmit');submit.disabled=true;submit.textContent=t('authBusy');$('#authStatus').hidden=true;
    try{
      const payload={email,password};if(authMode==='register')payload.displayName=$('#authName').value.trim();
      const response=await fetch('/api/auth/'+authMode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      if(!response.ok){const key=response.status===409?'authExists':response.status===401?'authInvalid':'authFailure';throw new Error(key);}
      await loadAccount();
      if(!accountUser)throw new Error('authFailure');
      $('#authDialog').close();$('#authForm').reset();toast(t(authMode==='register'?'authCreated':'authSuccess'));
    }catch(error){$('#authStatus').textContent=t(error.message||'authFailure');$('#authStatus').hidden=false;}
    finally{submit.disabled=false;submit.textContent=t(authMode==='register'?'authRegister':'authLogin');}
  }
  async function signOut(){
    try{const response=await fetch('/api/auth/logout',{method:'POST'});if(!response.ok)throw new Error('logout');}
    catch(e){toast(t('authFailure'));return;}
    accountUser=null;accountState=null;mode='guest';state=guestState;previewSessions.clear();previewResults.clear();previewViewer=null;previewResult=null;previewKey='';previewSelection=null;previewRenderGeneration++;
    language=state.language==='en'?'en':'es';applyLanguage();toast(t('authSignedOut'));
  }
  function renderHeroCarousel(){
    const zoneId=ZONES[heroSlide],number=heroSlide+1;
    if(!zoneId)return;
    const scene=SCENES?.['z'+number]?.verano;
    $('#heroSatellite').src=`images/z${number}_verano_rgb.png`;
    $('#heroSatellite').alt=fmt(t('heroImageAlt'),{zone:zoneName(zoneId)});
    $('#heroSlideCount').textContent=`${String(number).padStart(2,'0')} / ${String(ZONES.length).padStart(2,'0')}`;
    $('#heroZoneName').textContent=zoneName(zoneId);
    $('#heroImageMeta').textContent=[t('heroImageType'),scene?.n_escenas?fmt(t('heroSceneCount'),{n:scene.n_escenas}):''].filter(Boolean).join(' · ');
    $('#heroSourceLink').href=`https://github.com/enzopazzelli/BioSat/blob/${REPO?.commit||'main'}/data/imagenes/z${number}_verano_rgb.png`;
    $('#heroDots').innerHTML=ZONES.map((_,i)=>`<button type="button" data-hero-slide="${i}" aria-label="${esc(fmt(t('heroGoZone'),{n:i+1}))}" aria-current="${i===heroSlide}"></button>`).join('');
    $('.hero-carousel').setAttribute('aria-label',t('heroCarouselLabel'));
    $('#heroDots').setAttribute('aria-label',t('heroCarouselLabel'));
    $('#heroPrev').setAttribute('aria-label',t('heroPrevious'));
    $('#heroNext').setAttribute('aria-label',t('heroNext'));
  }
  function renderSimulation(){
    const select=$('#simZone'); if(!select||!REPO)return;
    const value=select.value||ZONES[1];
    select.innerHTML=ZONES.map(id=>`<option value="${id}">${esc(zoneName(id))}</option>`).join('');
    select.value=ZONES.includes(value)?value:ZONES[1];
    const z=REPO.zones[select.value]; if(!z)return;
    const evidence=[
      ['simRain',nf(z.climate.recent.rain)+' mm','simRainContext','clima_zonas'],
      ['simSoil',nf(z.soil.ph,1),'simSoilContext','suelo_zonas'],
      ['simSat',nf(z.satellite.lowMonths)+' '+t('months'),'simSatContext','diagnostico_landsat_ia'],
      ['simForest',nf(z.deforestation.forestPct,1)+' %','simForestContext','desmonte_zonas'],
      ['simRotation',nf(z.rotations.items.length),'simRotationContext','rotaciones_santiago']
    ];
    $('#simEvidence').innerHTML=evidence.map(([label,value,source,file],i)=>`<a class="sim-evidence-row" href="${repoLink(file)}" target="_blank" rel="noopener noreferrer"><span class="sim-evidence-icon">${['☁','◇','▧','♧','↺'][i]}</span><div><small>${esc(t(label))}</small><strong>${esc(value)}</strong><span>${esc(t(source))} ↗</span></div></a>`).join('');
    const zoneNumber=ZONES.indexOf(select.value)+1;
    const season=$('#simSeason').value;
    const scene=SCENES?.['z'+zoneNumber]?.[season];
    const base=`images/z${zoneNumber}_${season}_`;
    $('#simRgb').src=base+'rgb.png';
    $('#simNdvi').src=base+'ndvi.png';
    $('#simRgb').alt=`${t('simRgb')} · ${zoneName(select.value)} · ${season}`;
    $('#simNdvi').alt=`${t('simNdvi')} · ${zoneName(select.value)} · ${season}`;
    $('#simImageSource').innerHTML=scene?`${esc(scene.fuente||'Landsat')} · ${esc(scene.periodo||scene.fecha||'')} · ${esc(scene.n_escenas||'—')} ${language==='es'?'escenas':'scenes'} · <a href="https://github.com/enzopazzelli/BioSat/blob/${REPO.commit}/data/imagenes/z${zoneNumber}_${season}_rgb.png" target="_blank" rel="noopener noreferrer">${language==='es'?'Ver original':'View original'} ↗</a>`:'';
  }
  function renderZoneOptions(){
    const sel=$('#fieldZone'), value=sel.value;
    sel.innerHTML='<option value="">'+(language==='es'?'Elegí una zona':'Choose a zone')+'</option>'+ZONES.map((id,i)=>`<option value="${id}">${i+1} · ${esc(zoneName(id))}</option>`).join('');
    sel.value=value;
  }
  function renderSourceOptions(){
    const sel=$('#obsSource'), value=sel.value;
    sel.innerHTML=['field','drone','satellite','other'].map(s=>`<option value="${s}">${esc(sourceName(s))}</option>`).join('');sel.value=value||'field';
  }
  function navigate(view){
    const allowed=['inicio','campos','analisis']; if(!allowed.includes(view))view='inicio';
    $$('.view').forEach(el=>el.hidden=el.id!==`view-${view}`);
    $$('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
    if(location.hash.slice(1)!==view)history.replaceState(null,'','#'+view);
    if(view==='analisis')renderAnalysis();
    if(view==='campos')renderFields();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function renderAll(){renderFields();renderAnalysis();}
  function setFieldView(hasTiff){
    const panel=$('.map-panel'),preview=$('#tiffPreview');
    if(preview.parentElement!==panel)panel.insertBefore(preview,$('#zoneVisual'));
    panel.querySelector('.map-chip').textContent=hasTiff?(language==='es'?'TIFF + contexto regional':'TIFF + regional context'):t('regionalImageBadge');
    preview.hidden=!hasTiff;
  }
  function prefetchZone(zoneId){
    const number=ZONES.indexOf(zoneId)+1,version=REPO?.commit?.slice(0,12);
    if(!zoneCacheRegistration?.active||!number||!version)return;
    const key=number+':'+version;if(key===lastPrefetchedZone)return;
    lastPrefetchedZone=key;zoneCacheRegistration.active.postMessage({zone:number,version});
  }
  function renderZoneVisual(zoneId){
    const number=ZONES.indexOf(zoneId)+1;if(!number)return;
    const version=REPO?.commit?.slice(0,12)||'63c12a7';
    const base=`images/z${number}_${zoneSeason}_`;
    $('#zoneSeason').value=zoneSeason;
    $('#zoneRgb').src=base+'rgb.png?v='+version;
    $('#zoneNdvi').src=base+'ndvi.png?v='+version;
    $('#zoneRgb').alt=t('simRgb')+' · '+zoneName(zoneId)+' · '+zoneSeason;
    $('#zoneNdvi').alt=t('simNdvi')+' · '+zoneName(zoneId)+' · '+zoneSeason;
    const scene=SCENES?.['z'+number]?.[zoneSeason];
    const original=`https://github.com/enzopazzelli/BioSat/blob/${REPO?.commit||version}/data/imagenes/z${number}_${zoneSeason}_`;
    $('#zoneVisualSource').innerHTML=`${esc(scene?.fuente||t('zoneVisualSource'))} · ${esc(scene?.periodo||scene?.fecha||'')}${scene?.n_escenas?' · '+esc(fmt(t('heroSceneCount'),{n:scene.n_escenas})):''} · ${esc(t('zoneImageOriginal'))}: <a href="${original}rgb.png" target="_blank" rel="noopener noreferrer">RGB ↗</a> · <a href="${original}ndvi.png" target="_blank" rel="noopener noreferrer">NDVI ↗</a>`;
    prefetchZone(zoneId);
  }
  function initZoneCache(){
    if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
    navigator.serviceWorker.register('./zone-cache-sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(registration=>{zoneCacheRegistration=registration;const field=activeField();if(field)prefetchZone(field.zone);}).catch(()=>{});
  }
  async function loadRepo(){
    try{
      const response=await fetch('/api/repo',{cache:'no-store'});
      if(!response.ok)return;
      const data=await response.json();
      if(data.repo?.zones){REPO=data.repo;SCENES=data.scenes;LOTS=data.lots||[];previewKey='';renderSimulation();renderHeroCarousel();renderAnalysis();}
    }catch(e){}
  }
  function renderFields(){
    $('#fieldCount').textContent=state.fields.length;
    $('#fieldsList').innerHTML=state.fields.length?state.fields.map(f=>`<div class="field-item ${f.id===state.activeId?'selected':''}"><span class="field-symbol">⌖</span><div><strong>${esc(f.demo?t('demoName'):f.name)}</strong><small>${esc(zoneName(f.zone))}${f.demo?' · '+esc(t('demo')):''}</small></div><div class="field-item-actions"><button type="button" data-open-field="${esc(f.id)}" aria-label="${esc(t('open'))}">↗</button>${f.demo?'':`<button type="button" data-edit-field="${esc(f.id)}" aria-label="${esc(t('edit'))}">✎</button>`}</div></div>`).join(''):`<div class="empty-list">${esc(t('noFields'))}</div>`;
  }
  function renderAnalysis(){
    const f=activeField(); $('#analysisEmpty').hidden=!!f; $('#analysisContent').hidden=!f;
    const sel=$('#activeField'); sel.innerHTML=state.fields.map(x=>`<option value="${esc(x.id)}">${esc(x.demo?t('demoName'):x.name)}</option>`).join('');if(f)sel.value=f.id;
    if(!f){setFieldView(false);previewKey='';previewViewer=null;previewResult=null;return;}
    $('#summaryName').textContent=f.demo?t('demoName'):f.name;
    $('#summaryMeta').textContent=(f.demo?t('demoCrop'):(f.crop||t('emptyCrop')))+(f.notes?' · '+f.notes:'');
    $('#summaryZone').textContent=zoneName(f.zone);
    $('#summaryCoords').textContent=f.lat!==null&&f.lon!==null?`${Number(f.lat).toFixed(4)}, ${Number(f.lon).toFixed(4)}`:t('coordsUnavailable');
    $('#demoBanner').hidden=!f.demo;
    renderRegional(f.zone);
    renderZoneVisual(f.zone);
    $('#fileCount').textContent=f.files.length;
    $('#filesList').innerHTML=f.files.length?f.files.map(x=>`<div class="file-row"><span class="file-icon">▧</span><div class="file-row-main"><strong title="${esc(x.name)}">${esc(x.name)}</strong><small>${esc(size(x.size))} · ${esc(date(x.at))} · ${esc(t('analysisPending'))}</small></div><button type="button" data-preview="${esc(x.id)}" aria-label="${esc(t('open'))}: ${esc(x.name)}">◉</button><button type="button" data-download="${esc(x.id)}" aria-label="${esc(t('download'))}: ${esc(x.name)}">↓</button></div>`).join(''):`<div class="file-empty">${esc(t('noFiles'))}</div>`;
    const pendingForField=previewSelection&&pendingUploads.get(previewSelection)?.fieldId===f.id;
    if(f.files.length||pendingForField){
      setFieldView(true);
      const id=pendingForField||f.files.some(x=>x.id===previewSelection)?previewSelection:f.files[0].id;
      showTiffPreview(id);
    }else{setFieldView(false);$('#lotMatches').hidden=true;previewKey='';previewViewer=null;previewResult=null;}
    $('#observationsList').innerHTML=f.observations.length?f.observations.map(o=>renderObservation(o)).join(''):`<div class="observation-empty">✳<strong>${esc(t('noFieldObservations'))}</strong><span>${esc(t('noObservationsSub'))}</span></div>`;
    $('#historyList').innerHTML=f.history.length?f.history.map(h=>`<div class="timeline-item"><div class="timeline-marker"></div><div class="timeline-content"><strong>${esc(t(h.kind))}</strong><small>${esc(date(h.at))}${h.detail?' · '+esc(h.detail):''}</small></div></div>`).join(''):`<p>${esc(t('noHistory'))}</p>`;
  }
  const fmt = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? '—'));
  const nf = (value, digits=0) => value==null?'—':Number(value).toLocaleString(locale(),{minimumFractionDigits:digits,maximumFractionDigits:digits});
  function repoLink(file){return `https://github.com/enzopazzelli/BioSat/blob/${REPO.commit}/data/${file}.json`;}
  function renderRotations(z){
    const reviewed=z.rotations.validatedBy!=='sin validar';
    $('#rotationsDisclaimer').textContent=t(reviewed?'rotationsDisclaimerReviewed':'rotationsDisclaimerUnvalidated')+' '+t('rotationNotRanking');
    const months=Array.from({length:12},(_,i)=>new Intl.DateTimeFormat(locale(),{month:'short'}).format(new Date(2024,i,1)));
    const list=(items)=>items?.length?`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p>${esc(t('notProvided'))}</p>`;
    const attrKeys={alta:'rotationHigh',media:'rotationMedium',baja:'rotationLow',alto:'rotationHigh',medio:'rotationMedium',bajo:'rotationLow',positivo:'rotationPositive',neutro:'rotationNeutral',negativo:'rotationNegative'};
    const attrValue=value=>attrKeys[value]?t(attrKeys[value]):value??'—';
    const value=(label,item)=>`<div><dt>${esc(t(label))}</dt><dd>${esc(String(item))}</dd></div>`;
    $('#rotationsList').innerHTML=z.rotations.items.map((r,index)=>{
      const a=r.attributes||{},cal=r.calendar||[];
      const bare=cal.filter(state=>state==='desnudo').length;
      const heat=cal.reduce((sum,state,i)=>sum+(state==='cultivo'?Number(z.climate.monthly[i]?.heat40||0):0),0);
      const storms=cal.reduce((sum,state,i)=>sum+(state==='desnudo'?Number(z.climate.monthly[i]?.storms30||0):0),0);
      const sequence=(r.sequenceDetails||[]).map(item=>`<li><strong>${esc(item.cultivo)}</strong><span>${esc(t('rotationSection'))} ${esc(item.seccion)} · ${esc(t('rotationPlant'))}: ${esc(months[item.siembra_mes-1]||'—')} · ${esc(t('rotationHarvest'))}: ${esc(months[item.cosecha_mes-1]||'—')}</span></li>`).join('');
      const calendar=cal.map((state,i)=>{const key={cultivo:'rotationCrop',cobertura:'rotationCover',rastrojo:'rotationResidue',desnudo:'rotationBareState'}[state]||'monthNoRotation';return `<div aria-label="${esc(months[i]+' · '+t(key))}"><span>${esc(months[i])}</span><i class="rot-state rot-state-${esc(state)}" title="${esc(t(key))}"></i></div>`;}).join('');
      const attributes=[value('rotationWater',attrValue(a.demanda_agua)),value('rotationNitrogen',attrValue(a.aporte_nitrogeno)),value('rotationIncome',attrValue(a.ingreso)),value('rotationForage',t(a.forraje?'rotationYes':'rotationNo')),value('rotationIrrigation',t(a.requiere_riego?'rotationYes':'rotationNo')),value('rotationLivestock',t(a.requiere_hacienda?'rotationYes':'rotationNo')),value('rotationMachinery',a.maquinaria_especial||'—')].join('');
      const evidence=(r.evidence||[]).map(item=>`<li>${esc(item.texto)}<small>${esc(item.fuente||'—')}</small></li>`).join('');
      return `<details class="rotation-card"><summary><span class="rotation-kind">${esc(fmt(t('rotationNumber'),{n:index+1}))} · ${esc(t(r.type==='actual'?'rotationCurrent':'rotationAlternative'))}</span><h3>${esc(r.name)}</h3><p>${esc((r.sequence||[]).join(' → '))}</p><span class="rotation-more">${esc(t('open'))} ↗</span></summary><div class="rotation-detail"><div class="rotation-metrics"><h4>${esc(t('rotationMetrics'))}</h4><div>${value('rotationBare',bare)}${value('rotationHeat',nf(heat,1))}${value('rotationStorms',nf(storms,1))}</div><p>${esc(t('rotationRecentClimate'))}</p></div><div class="rotation-detail-grid"><section><h4>${esc(t('rotationSeqDetail'))}</h4><ol class="rotation-sequence">${sequence}</ol></section><section><h4>${esc(t('rotationCalendar'))}</h4><div class="rotation-calendar">${calendar}</div><div class="rotation-legend">${['cultivo','cobertura','rastrojo','desnudo'].map(state=>{const key={cultivo:'rotationCrop',cobertura:'rotationCover',rastrojo:'rotationResidue',desnudo:'rotationBareState'}[state];return `<span><i class="rot-state rot-state-${state}"></i>${esc(t(key))}</span>`;}).join('')}</div></section><section><h4>${esc(t('rotationReason'))}</h4><p>${esc(r.reason||t('notProvided'))}</p><h4>${esc(t('rotationBenefits'))}</h4>${list(r.benefits)}</section><section><h4>${esc(t('rotationAttributes'))}</h4><dl class="rotation-attributes">${attributes}</dl></section><section><h4>${esc(t('rotationMissing'))}</h4>${list(r.missing)}</section><section><h4>${esc(t('rotationRisks'))}</h4>${list(r.risks)}</section></div><details class="rotation-sources"><summary>${esc(t('rotationEvidence'))} · ${esc(t('rotationSources'))}</summary><ul>${evidence}</ul><h4>${esc(t('rotationSources'))}</h4>${list(r.sources)}<p>${esc(t('rotationSourcesCaveat'))} <a href="${repoLink('rotaciones_santiago')}" target="_blank" rel="noopener noreferrer">${esc(REPO.sources.rotations.name)} · ${esc(REPO.sources.rotations.date)} ↗</a></p></details></div></details>`;
    }).join('');
  }
  function renderRegional(zoneId){
    const z=REPO?.zones?.[zoneId];
    $('#repoCommit').textContent=REPO?REPO.commit.slice(0,7):'—';
    if(!z){$('#regionalStats').innerHTML='';$('#rainChart').innerHTML='';$('#regionalCards').innerHTML=`<div class="observation-empty">${esc(t('noRegional'))}</div>`;$('#rotationsList').innerHTML='';$('#monthlyCards').innerHTML='';return;}
    renderMonthly(zoneId);
    const stat=(key,value,unit)=>`<div class="regional-stat"><span>${esc(t(key))}</span><strong>${esc(value)}</strong><small>${esc(unit)}</small></div>`;
    $('#regionalStats').innerHTML=[stat('rainMetric',nf(z.climate.recent.rain),t('mm')),stat('heatMetric',nf(z.climate.recent.heat40,1),t('days')),stat('phMetric',nf(z.soil.ph,1),''),stat('lowMetric',nf(z.satellite.lowMonths),t('months'))].join('');
    const months=language==='es'?['E','F','M','A','M','J','J','A','S','O','N','D']:['J','F','M','A','M','J','J','A','S','O','N','D'];
    const max=Math.max(...z.climate.monthly.map(x=>x.rain),1);
    $('#rainChart').innerHTML=z.climate.monthly.map((m,i)=>`<div class="rain-col" title="${esc(nf(m.rain,1)+' '+t('mm'))}"><div class="rain-track"><span style="height:${Math.max(4,Math.round(m.rain/max*100))}%"></span></div><small>${months[i]}</small></div>`).join('');
    $('#rainChart').setAttribute('aria-label',`${t('rainChartTitle')}: ${z.climate.monthly.map((m,i)=>months[i]+' '+nf(m.rain,1)+' '+t('mm')).join(', ')}`);
    window.BioSatRegional.render({container:$('#regionalCards'),zone:z,sources:REPO.sources,commit:REPO.commit,language});
    renderRotations(z);
  }
  function renderMonthly(zoneId){
    const z=REPO?.zones?.[zoneId];
    const months=monthPeriod==='normal'?z?.climate?.normalMonthly:z?.climate?.monthly;
    const container=$('#monthlyCards');
    $$('[data-month-period]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.monthPeriod===monthPeriod)));
    if(!Array.isArray(months)||months.length!==12){container.innerHTML=`<p class="monthly-unavailable">${esc(t('noRegional'))}</p>`;return;}
    const rotation=z.rotations.items.find(item=>item.type==='actual')||z.rotations.items[0];
    const metric=(label,value,sub='')=>`<div class="month-metric"><span>${esc(label)}</span><strong>${esc(value)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</div>`;
    container.innerHTML=months.map((m,i)=>{
      const month=new Intl.DateTimeFormat(locale(),{month:'long'}).format(new Date(2024,i,1));
      const balance=m.rain-m.et0;
      const green=z.satellite.monthlyFraction?.[i];
      const signal=m.frost>=1?'monthFrost':balance<-60?'monthDry':m.heat35>=8?'monthHeat':balance>=0?'monthRain':green>0.3?'monthGreen':'monthStable';
      const ground=rotation?.calendar?.[i];
      const groundKey={cultivo:'monthCultivo',rastrojo:'monthRastrojo',desnudo:'monthDesnudo'}[ground]||'monthNoRotation';
      const cells=[
        metric(t('monthRainMetric'),`${nf(m.rain,1)} mm`,fmt(t('monthRainRange'),{low:nf(m.rainP10,1),high:nf(m.rainP90,1)})),
        metric(t('monthDemand'),`${nf(m.et0,1)} mm`),
        metric(t('monthBalance'),`${balance>0?'+':''}${nf(balance,1)} mm`),
        metric(t('monthHeatMetric'),`${nf(m.heat35,1)} / ${nf(m.heat40,1)} ${t('monthDays')}`),
        metric(t('monthFrostMetric'),`${nf(m.frost,1)} ${t('monthDays')}`,`${t('monthFrostChance')}: ${nf(m.frostProbability)} %`),
        metric(t('monthTemp'),`${nf(m.tmax,1)} / ${nf(m.tmin,1)} °C`),
        metric(t('monthMoisture'),`${nf(m.rootMoisture*100,0)} %`),
        metric(t('monthSatellite'),green==null?'—':`${nf(green*100,1)} %`),
        metric(t('monthRotation'),t(groundKey))
      ].join('');
      return `<details class="month-card"><summary><span class="month-number">${String(i+1).padStart(2,'0')}</span><span class="month-main"><strong>${esc(month)}</strong><small class="month-signal ${esc(signal)}">${esc(t(signal))}</small></span><span class="month-open" aria-label="${esc(t('monthOpen'))}">＋</span></summary><div class="month-detail"><div class="month-metrics">${cells}</div><details class="month-sources"><summary>${esc(t('monthSource'))}</summary><p>${esc(t('monthClimateNote'))} <a href="${repoLink('clima_zonas')}" target="_blank" rel="noopener noreferrer">${esc(REPO.sources.climate.name)} · ${esc(REPO.sources.climate.date)} ↗</a></p><p>${esc(t('monthSatNote'))} <a href="${repoLink('diagnostico_landsat_ia')}" target="_blank" rel="noopener noreferrer">${esc(REPO.sources.satellite.name)} · ${esc(REPO.sources.satellite.date)} ↗</a></p><p>${esc(t('monthRotationNote'))} <a href="${repoLink('rotaciones_santiago')}" target="_blank" rel="noopener noreferrer">${esc(REPO.sources.rotations.name)} ↗</a></p></details></div></details>`;
    }).join('');
  }
  function renderObservation(o){
    const title=o.demoKey?t(o.demoKey+'Title'):o.title;
    const summary=o.demoKey?t(o.demoKey+'Summary'):o.summary;
    const detail=o.demoKey?t(o.demoKey+'Detail'):(o.detail||t('notProvided'));
    return `<details class="observation"><summary><div class="obs-top"><span class="obs-status ${o.demoKey?'demo':''}">${esc(t(o.demoKey?'demo':'manual'))}</span><span class="obs-arrow">↗</span></div><span class="obs-source">${esc(sourceName(o.source))}</span><h3>${esc(title)}</h3><p>${esc(summary)}</p><div class="obs-footer"><span>${esc(date(o.at))}</span><span>${esc(o.sector||'—')}</span></div></summary><div class="obs-detail"><strong>${esc(t('fullDetail'))}</strong><p>${esc(detail)}</p>${o.demoKey?`<p class="demo-tag">${esc(t('sample'))}</p>`:''}</div></details>`;
  }

  function resetForm(){ $('#fieldForm').reset();$('#fieldId').value='';$('#fieldFormTitle').textContent=t('newField');$('#saveFieldText').textContent=t('saveField'); }
  function editField(id){
    const f=fieldById(id);if(!f||f.demo)return;
    navigate('campos');$('#fieldId').value=f.id;$('#fieldName').value=f.name;$('#fieldZone').value=f.zone;$('#fieldCrop').value=f.crop;$('#fieldLat').value=f.lat??'';$('#fieldLon').value=f.lon??'';$('#fieldNotes').value=f.notes;
    $('#fieldFormTitle').textContent=t('editField');$('#saveFieldText').textContent=t('updateField');$('#fieldName').focus();
  }
  function saveField(e){
    e.preventDefault();const id=$('#fieldId').value;const name=$('#fieldName').value.trim(),zone=$('#fieldZone').value,crop=$('#fieldCrop').value.trim(),notes=$('#fieldNotes').value.trim();
    const latRaw=$('#fieldLat').value.trim(),lonRaw=$('#fieldLon').value.trim();
    if(!name||!zone){toast(t('required'));return;}
    if(!!latRaw!==!!lonRaw){toast(t('coordsPair'));return;}
    const lat=latRaw?Number(latRaw):null,lon=lonRaw?Number(lonRaw):null;
    if((lat!==null&&(!Number.isFinite(lat)||lat < -90||lat > 90))||(lon!==null&&(!Number.isFinite(lon)||lon < -180||lon > 180))){toast(t('coordsRange'));return;}
    let f=id?fieldById(id):null;const wasUpdate=!!f;
    if(f){Object.assign(f,{name,zone,crop,lat,lon,notes});addHistory(f,'eventUpdated',snapshot(f));}
    else{f={id:uid(),demo:false,name,zone,crop,lat,lon,notes,createdAt:now(),files:[],observations:[],history:[]};addHistory(f,'eventCreated',snapshot(f));state.fields.unshift(f);}
    state.activeId=f.id;persist();renderAll();resetForm();toast(t(wasUpdate?'fieldUpdated':'fieldSaved'));navigate('analisis');
  }

  async function putFile(id,file){
    if(mode==='guest'){guestFiles.set(id,file);return;}
    return window.BioSatUpload.send(id,file,(sent,total)=>{
      $('#uploadProgress').hidden=false;
      $('#uploadProgressText').textContent=file.name+' · '+t('uploadProgressSending')+' '+Math.round(sent/Math.max(total,1)*100)+' %';
      $('#uploadMeterFill').style.width=Math.round(sent/Math.max(total,1)*100)+'%';
    });
  }
  async function getFile(id){
    const pending=pendingUploads.get(id);if(pending)return pending.file;
    if(mode==='guest')return guestFiles.get(id);
    const response=await fetch('/api/files/'+encodeURIComponent(id));
    return response.ok?response.blob():null;
  }
  function previewResultKey(id,slide,displayMode){return [mode==='account'?accountUser?.email?.toLowerCase()||'account':'guest',id,slide,displayMode].join(':');}
  function rememberPreview(key,result){previewResults.delete(key);previewResults.set(key,result);if(previewResults.size>12)previewResults.delete(previewResults.keys().next().value);}
  function previewCacheUrl(id,slide,displayMode){
    return `/api/files/${encodeURIComponent(id)}/preview?slide=${slide}&mode=${displayMode}`;
  }
  async function readCachedTiff(id,slide,displayMode){
    const key=previewResultKey(id,slide,displayMode),memory=previewResults.get(key);
    if(memory)return {result:memory,source:'device'};
    if(mode!=='account'||pendingUploads.has(id))return null;
    const owner=accountUser?.email;if(!owner)return null;
    const local=await window.BioSatPreviewCache.get(owner,id,slide,displayMode);
    if(local){rememberPreview(key,local);return {result:local,source:'device'};}
    try{
      const response=await fetch(previewCacheUrl(id,slide,displayMode),{cache:'no-store'});
      if(!response.ok)return null;
      const result=await response.json();
      if(result?.slideIndex!==slide||typeof result.url!=='string'||!result.url.startsWith('data:image/png;base64,'))return null;
      rememberPreview(key,result);
      void window.BioSatPreviewCache.put(owner,id,slide,displayMode,result);
      return {result,source:'cloud'};
    }catch{return null;}
  }
  async function saveCachedTiff(id,slide,displayMode,result,key){
    if(mode!=='account')return;
    const owner=accountUser?.email;if(!owner||failedUploads.has(id))return;
    try{
      const pending=pendingUploads.get(id);
      if(pending)await pending.promise;
      if(failedUploads.has(id)||mode!=='account'||accountUser?.email!==owner)return;
      await window.BioSatPreviewCache.put(owner,id,slide,displayMode,result);
      const response=await fetch(previewCacheUrl(id,slide,displayMode),{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(result)});
      if(!response.ok)throw new Error('cache '+response.status);
      if(key===previewKey&&previewResult===result){previewCacheStatus='saved';const note=$('.tiff-cache-note');if(note)note.textContent=t('tiffCacheSaved');}
    }catch{if(key===previewKey&&previewResult===result){previewCacheStatus='error';const note=$('.tiff-cache-note');if(note)note.textContent=t('tiffCacheError');}}
  }
  function showTiffPreview(id){
    const field=activeField();if(!field)return;
    const key=[mode,field.id,id].join(':');
    if(key!==previewKey){
      previewKey=key;previewSelection=id;previewViewer=previewSessions.get(key)||null;
      previewResult=null;previewSlide=0;previewMode='color';previewCacheStatus='';++previewRenderGeneration;
    }
    setFieldView(true);
    if(previewResult){showRenderedTiff(previewResult);return;}
    renderTiffSlide();
  }
  async function renderTiffSlide(){
    if(!previewSelection)return;
    const key=previewKey,id=previewSelection,slide=previewSlide,requestedMode=previewMode,renderId=++previewRenderGeneration;
    $('#tiffPreviewBody').textContent=t('tiffLoading');
    try{
      const cached=await readCachedTiff(id,slide,requestedMode);
      let result=cached?.result;
      if(renderId!==previewRenderGeneration||key!==previewKey)return;
      if(!result){
        let viewer=previewViewer;
        if(!viewer){
          const blob=await getFile(id);
          if(!blob)throw new Error('File missing');
          viewer=await window.BioSatTiffPreview.create(blob);
          if(renderId!==previewRenderGeneration||key!==previewKey)return;
          previewViewer=viewer;previewSessions.set(key,viewer);
          if(previewSessions.size>3)previewSessions.delete(previewSessions.keys().next().value);
        }
        result=await viewer.render(slide,requestedMode);
        if(renderId!==previewRenderGeneration||key!==previewKey)return;
      }
      if(!cached)rememberPreview(previewResultKey(id,slide,requestedMode),result);
      previewResult=result;previewMode=result.mode;previewCacheStatus=mode==='account'?(cached?.source|| (pendingUploads.has(id)?'pending':'saving')):'';
      showRenderedTiff(result);
      if(!cached)void saveCachedTiff(id,slide,requestedMode,result,key);
    }catch(e){if(renderId===previewRenderGeneration&&key===previewKey){$('#tiffPreviewBody').textContent=t('tiffError');$('#lotMatches').hidden=true;}}
  }
  function showRenderedTiff(result){
      const geo=result.epsg?'EPSG:'+result.epsg:t('tiffNoGeo');
      const kind=result.kind==='rgb'?'RGB':result.kind==='band123'?t('tiffComposite'):result.kind==='band'?fmt(t('tiffBand'),{n:result.bandIndex+1,total:result.bands}):t('tiffGray');
      const viewLabel=result.bandIndex!==null?`${fmt(t('tiffImage'),{n:result.pageIndex+1,total:result.pageCount})} · ${kind}`:fmt(t('tiffImage'),{n:result.pageIndex+1,total:result.pageCount});
      const note=result.mode==='heat'?t('tiffHeatNote'):result.kind==='band123'?t('tiffFalseColorNote'):result.kind==='band'?t('tiffBandNote'):result.bands===1?t('tiffSingleBandNote'):t('tiffPreviewNote');
      const tabs=[['color','tiffColor'],['gray','tiffGray'],['heat','tiffHeat']].map(([value,label])=>`<button type="button" role="tab" data-tiff-mode="${value}" aria-selected="${result.mode===value}" ${value==='color'&&!result.colorAvailable?'disabled':''}>${esc(t(label))}</button>`).join('');
      const cacheText={device:'tiffCacheLocal',cloud:'tiffCacheCloud',pending:'tiffCachePending',saved:'tiffCacheSaved',error:'tiffCacheError',saving:'tiffCacheSaving'};
      $('#tiffPreviewBody').innerHTML=`<div class="tiff-modes" role="tablist" aria-label="${esc(t('tiffViewModes'))}">${tabs}</div><div class="tiff-viewer"><div class="tiff-image-frame"><img src="${result.url}" alt="${esc(viewLabel+' · '+t(result.mode==='color'?'tiffColor':result.mode==='heat'?'tiffHeat':'tiffGray'))}">${result.slideCount>1?`<button type="button" class="tiff-arrow tiff-arrow-prev" data-tiff-step="-1" aria-label="${esc(t('tiffPrevious'))}">‹</button><button type="button" class="tiff-arrow tiff-arrow-next" data-tiff-step="1" aria-label="${esc(t('tiffNext'))}">›</button>`:''}</div><div class="tiff-view-info"><strong>${esc(viewLabel)}</strong>${result.slideCount>1?`<span>${esc(fmt(t('tiffSlide'),{n:result.slideIndex+1,total:result.slideCount}))}</span>`:''}</div></div><p>${esc(result.width)} × ${esc(result.height)} px · ${esc(result.bands)} ${language==='es'?'bandas':'bands'} · ${esc(geo)}</p><small>${esc(note)}</small>${mode==='account'?`<small class="tiff-cache-note" role="status">${esc(t(cacheText[previewCacheStatus]||'tiffCacheSaving'))}</small>`:''}`;
      renderLotMatches(result.geoBounds);
  }
  function renderLotMatches(bounds){
    const container=$('#lotMatches'),body=$('#lotMatchesBody');
    container.hidden=false;
    if(!bounds){body.innerHTML=`<p>${esc(t('lotNoGeo'))}</p>`;return;}
    const match=LOTS.find(lot=>lot.bbox&&bounds[0]<lot.bbox[2]&&bounds[2]>lot.bbox[0]&&bounds[1]<lot.bbox[3]&&bounds[3]>lot.bbox[1]);
    if(!match){body.innerHTML=`<p>${esc(t('lotNoMatch'))}</p>`;return;}
    const cards=['s2','l8'].map(id=>{
      const source=match.sources?.[id];if(!source)return '';
      const name=t(id==='s2'?'lotSourceS2':'lotSourceL8');
      return `<div class="lot-source"><div><strong>${esc(name)} · ${esc(source.resolutionM)} m</strong><small>${esc(source.date||'—')} · ${esc(t('lotClean'))}: ${esc(nf(source.cleanFraction*100,0))} %</small></div><div class="lot-source-images"><figure><img src="${esc(source.rgb)}" alt="${esc(name)} RGB"><figcaption>RGB</figcaption></figure><figure><img src="${esc(source.ndvi)}" alt="${esc(name)} NDVI"><figcaption>NDVI</figcaption></figure></div></div>`;
    }).join('');
    body.innerHTML=`<p class="lot-match-name">${esc(match.name)}</p>${cards}<p class="lot-limit">${esc(t('lotMatchNote'))}</p>`;
  }
  async function handleFiles(files){
    const f=activeField();if(!f)return;let done=0;
    for(const file of files){
      if(!/\.tiff?$/i.test(file.name)){toast(t('invalidTiff'));continue;}
      const header=new Uint8Array(await file.slice(0,4).arrayBuffer());
      if(!((header[0]===73&&header[1]===73&&header[2]===42&&header[3]===0)||(header[0]===77&&header[1]===77&&header[2]===0&&header[3]===42))){toast(t('invalidTiff'));continue;}
      const id=uid();
      $('#uploadProgress').hidden=false;
      $('#uploadProgressText').textContent=file.name+' · '+t('uploadProgressPreparing');
      $('#uploadMeterFill').style.width='0%';
      const promise=putFile(id,file);
      pendingUploads.set(id,{file,promise,fieldId:f.id});
      if(activeField()?.id===f.id)showTiffPreview(id);
      try{
        await promise;
        if(state.fields.includes(f)){
          f.files.unshift({id,name:file.name,size:file.size,type:file.type,at:now()});
          addHistory(f,'eventFile',file.name+' · '+size(file.size));
          done++;
        }
      }catch(e){
        failedUploads.add(id);
        if(mode==='account'&&accountUser?.email)await window.BioSatPreviewCache.removeFile(accountUser.email,id);
        for(const key of previewResults.keys())if(key.includes(':'+id+':'))previewResults.delete(key);
        if(previewSelection===id){previewKey='';previewSelection=null;previewViewer=null;previewResult=null;previewRenderGeneration++;setFieldView(false);}
        toast(t('fileSaveError'));
      }finally{pendingUploads.delete(id);}
    }
    if(done){persist();renderAnalysis();toast(t(done===1?'fileSaved':'filesSaved'));}
    $('#tiffInput').value='';
    $('#uploadProgress').hidden=true;
  }
  async function downloadFile(id){
    if(mode==='account'){
      const name=activeField().files.find(f=>f.id===id)?.name||'imagen.tif';
      const a=document.createElement('a');a.href='/api/files/'+encodeURIComponent(id);a.download=name;document.body.append(a);a.click();a.remove();return;
    }
    try{const blob=await getFile(id);if(!blob){toast(t('missingFile'));return;}const name=activeField().files.find(f=>f.id===id)?.name||'imagen.tif';const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){toast(t('missingFile'));}
  }
  function saveObservation(e){
    e.preventDefault();const f=activeField();if(!f)return;
    const title=$('#obsTitle').value.trim(),summary=$('#obsSummary').value.trim();if(!title||!summary){toast(t('required'));return;}
    const o={id:uid(),title,summary,detail:$('#obsDetail').value.trim(),source:$('#obsSource').value,sector:$('#obsSector').value.trim(),at:now()};
    f.observations.unshift(o);addHistory(f,'eventObservation',title);persist();renderAnalysis();$('#observationForm').reset();$('#observationDialog').close();toast(t('observationSaved'));
  }

  function bind(){
    document.addEventListener('click',e=>{
      const period=e.target.closest('[data-month-period]');if(period){monthPeriod=period.dataset.monthPeriod;const field=activeField();if(field)renderMonthly(field.zone);return;}
      const nav=e.target.closest('[data-view]');if(nav){e.preventDefault();navigate(nav.dataset.view);return;}
      const heroDot=e.target.closest('[data-hero-slide]');if(heroDot){heroSlide=Number(heroDot.dataset.heroSlide);renderHeroCarousel();return;}
      const open=e.target.closest('[data-open-field]');if(open){state.activeId=open.dataset.openField;persist();navigate('analisis');return;}
      const edit=e.target.closest('[data-edit-field]');if(edit){editField(edit.dataset.editField);return;}
      const dl=e.target.closest('[data-download]');if(dl){downloadFile(dl.dataset.download);return;}
      const pv=e.target.closest('[data-preview]');if(pv){previewKey='';showTiffPreview(pv.dataset.preview);return;}
      const tiffMode=e.target.closest('[data-tiff-mode]');if(tiffMode&&!tiffMode.disabled){previewMode=tiffMode.dataset.tiffMode;previewResult=null;renderTiffSlide();return;}
      const tiffStep=e.target.closest('[data-tiff-step]');if(tiffStep&&(previewViewer||previewResult)){const count=previewViewer?.slides.length||previewResult.slideCount;previewSlide=(previewSlide+Number(tiffStep.dataset.tiffStep)+count)%count;previewResult=null;renderTiffSlide();return;}
    });
    $('#accountButton').addEventListener('click',()=>{if(accountUser){toast(accountUser.email);return;}openAuth();});
    $('#signOutButton').addEventListener('click',signOut);
    $('#authForm').addEventListener('submit',submitAuth);
    $('#closeAuth').addEventListener('click',()=>$('#authDialog').close());
    $('#continueGuest').addEventListener('click',()=>$('#authDialog').close());
    $$('[data-auth-mode]').forEach(button=>button.addEventListener('click',()=>{authMode=button.dataset.authMode;renderAuthMode();}));
    $('#accessibilityToggle').addEventListener('click',()=>{const menu=$('#accessibilityMenu');menu.hidden=!menu.hidden;$('#accessibilityToggle').setAttribute('aria-expanded',String(!menu.hidden));});
    $$('[data-theme]').forEach(button=>button.addEventListener('click',()=>updatePreference('theme',button.dataset.theme)));
    $$('[data-font-size]').forEach(button=>button.addEventListener('click',()=>updatePreference('fontSize',button.dataset.fontSize)));
    document.addEventListener('click',event=>{if(!event.target.closest('.accessibility-wrap')){$('#accessibilityMenu').hidden=true;$('#accessibilityToggle').setAttribute('aria-expanded','false');}});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#accessibilityMenu').hidden=true;$('#accessibilityToggle').setAttribute('aria-expanded','false');}});
    $('#langToggle').addEventListener('click',()=>{language=language==='es'?'en':'es';state.language=language;persist();applyLanguage();});
    $('#heroPrev').addEventListener('click',()=>{heroSlide=(heroSlide+ZONES.length-1)%ZONES.length;renderHeroCarousel();});
    $('#heroNext').addEventListener('click',()=>{heroSlide=(heroSlide+1)%ZONES.length;renderHeroCarousel();});
    setInterval(()=>{const card=$('.hero-carousel');if(document.hidden||$('#view-inicio').hidden||card.matches(':hover,:focus-within')||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;heroSlide=(heroSlide+1)%ZONES.length;renderHeroCarousel();},7000);
    $('#fieldForm').addEventListener('submit',saveField);$('#resetField').addEventListener('click',resetForm);
    $('#activeField').addEventListener('change',e=>{state.activeId=e.target.value;persist();renderAll();});
    $('#locateButton').addEventListener('click',()=>{
      if(!navigator.geolocation){toast(t('geoUnavailable'));return;}
      navigator.geolocation.getCurrentPosition(pos=>{$('#fieldLat').value=pos.coords.latitude.toFixed(6);$('#fieldLon').value=pos.coords.longitude.toFixed(6);toast(t('geoSuccess'));},()=>toast(t('geoError')),{enableHighAccuracy:true,timeout:12000});
    });
    $('#tiffInput').addEventListener('change',e=>handleFiles([...e.target.files]));
    const drop=$('#dropzone');['dragenter','dragover'].forEach(name=>drop.addEventListener(name,e=>{e.preventDefault();drop.classList.add('dragover');}));['dragleave','drop'].forEach(name=>drop.addEventListener(name,e=>{e.preventDefault();drop.classList.remove('dragover');}));drop.addEventListener('drop',e=>handleFiles([...e.dataTransfer.files]));
    $('#addObservation').addEventListener('click',()=>$('#observationDialog').showModal());
    $('#closeObservation').addEventListener('click',()=>$('#observationDialog').close());$('#cancelObservation').addEventListener('click',()=>$('#observationDialog').close());
    $('#observationForm').addEventListener('submit',saveObservation);
    $('#simZone').addEventListener('change',renderSimulation);
    $('#simSeason').addEventListener('change',renderSimulation);
    $('#zoneSeason').addEventListener('change',event=>{zoneSeason=event.target.value;const field=activeField();if(field)renderZoneVisual(field.zone);});
    window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
  }
  loadState();bind();applyLanguage();navigate(location.hash.slice(1)||'inicio');loadAccount();loadRepo();initZoneCache();
})();
