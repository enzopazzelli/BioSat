/* TIFF display only. Heat colors represent relative image intensity, not temperature or NDVI. */
(function () {
  const MAX_SIDE=768;
  const clamp=value=>Math.max(0,Math.min(255,Math.round(value)));

  async function readSmall(image,outWidth,outHeight){
    const width=image.getWidth(),height=image.getHeight(),bands=image.getSamplesPerPixel();
    const rowsPerChunk=Math.max(1,Math.floor(4000000/Math.max(width*bands,1)));
    const chunks=Math.min(outHeight,Math.max(1,Math.ceil(height/rowsPerChunk)));
    let raster=null;
    for(let part=0;part<chunks;part++){
      const y0=Math.round(part*height/chunks),y1=Math.round((part+1)*height/chunks);
      const o0=Math.round(part*outHeight/chunks),o1=Math.round((part+1)*outHeight/chunks);
      const rows=await image.readRasters({window:[0,y0,width,y1],width:outWidth,height:o1-o0,interleave:false});
      if(!raster)raster=Array.from(rows,band=>new band.constructor(outWidth*outHeight));
      rows.forEach((band,i)=>raster[i].set(band,o0*outWidth));
    }
    if(!raster)throw new Error('Empty raster');
    return raster;
  }

  function georeference(image){
    let bbox=null,epsg=null,geoBounds=null;
    try{bbox=image.getBoundingBox();}catch{}
    try{const keys=image.getGeoKeys();epsg=keys.ProjectedCSTypeGeoKey||keys.GeographicTypeGeoKey||null;}catch{}
    const projection=code=>{
      if(code===4326)return '+proj=longlat +datum=WGS84 +no_defs';
      if(code===3857)return '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs';
      if(code>=32601&&code<=32660)return `+proj=utm +zone=${code-32600} +datum=WGS84 +units=m +no_defs`;
      if(code>=32701&&code<=32760)return `+proj=utm +zone=${code-32700} +south +datum=WGS84 +units=m +no_defs`;
      if(code>=5343&&code<=5349){const n=code-5342;return `+proj=tmerc +lat_0=-90 +lon_0=${-72+3*(n-1)} +k=1 +x_0=${n*1000000+500000} +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs`;}
      return null;
    };
    if(bbox&&epsg&&projection(epsg)&&window.proj4){
      try{
        const [x0,y0,x1,y1]=bbox;
        const corners=[[x0,y0],[x0,y1],[x1,y0],[x1,y1]].map(point=>epsg===4326?point:proj4(projection(epsg),'WGS84',point));
        const lon=corners.map(p=>p[0]),lat=corners.map(p=>p[1]);
        geoBounds=[Math.min(...lon),Math.min(...lat),Math.max(...lon),Math.max(...lat)];
      }catch{}
    }
    return {bbox,epsg,geoBounds};
  }

  function range(values,fixed){
    if(fixed)return [0,255];
    const sample=[],step=Math.max(1,Math.floor(values.length/40000));
    for(let i=0;i<values.length;i+=step){const v=Number(values[i]);if(Number.isFinite(v))sample.push(v);}
    if(!sample.length)return [0,1];
    sample.sort((a,b)=>a-b);
    const lo=sample[Math.floor((sample.length-1)*0.02)],hi=sample[Math.floor((sample.length-1)*0.98)];
    return hi>lo?[lo,hi]:[lo,lo+1];
  }
  const scaled=(value,limits)=>clamp((Number(value)-limits[0])/Math.max(limits[1]-limits[0],1e-12)*255);
  function heat(value){
    const stops=[[22,55,112],[35,122,181],[82,179,166],[240,209,95],[215,72,55]];
    const pos=Math.min(3.9999,Math.max(0,value/255*4)),i=Math.floor(pos),f=pos-i;
    return stops[i].map((v,k)=>clamp(v*(1-f)+stops[i+1][k]*f));
  }

  async function create(blob){
    if(!window.GeoTIFF)throw new Error('GeoTIFF decoder unavailable');
    const file=await GeoTIFF.fromBlob(blob),count=await file.getImageCount(),entries=[];
    for(let i=0;i<count;i++){
      const image=await file.getImage(i),sub=image.fileDirectory.NewSubfileType||0;
      entries.push({i,image,sub,width:image.getWidth(),height:image.getHeight(),bands:image.getSamplesPerPixel()});
    }
    let pages=entries.filter(entry=>!(entry.sub&1)&&!(entry.sub&4));
    if(!pages.length)pages=entries.filter(entry=>!(entry.sub&4)).slice(0,1);
    if(!pages.length)throw new Error('No displayable image in TIFF');
    const slides=[];
    pages.forEach((page,pageIndex)=>{
      const photo=page.image.fileDirectory.PhotometricInterpretation;
      const rgb=(photo===2||photo===6)&&page.bands>=3;
      slides.push({pageIndex,bandIndex:null});
      if(!rgb&&page.bands>1)for(let bandIndex=0;bandIndex<page.bands;bandIndex++)slides.push({pageIndex,bandIndex});
    });
    const cache=new Map();
    async function readPage(pageIndex){
      if(cache.has(pageIndex))return cache.get(pageIndex);
      const page=pages[pageIndex],next=pages[pageIndex+1]?.i??count;
      const candidates=entries.filter(entry=>entry.i>=page.i&&entry.i<next&&!(entry.sub&4));
      const scale=Math.min(1,MAX_SIDE/Math.max(page.width,page.height));
      const outWidth=Math.max(1,Math.round(page.width*scale)),outHeight=Math.max(1,Math.round(page.height*scale));
      const enough=candidates.filter(entry=>entry.width>=outWidth&&entry.height>=outHeight);
      const source=(enough.length?enough:candidates).reduce((best,entry)=>!best?entry:enough.length?(entry.width<best.width?entry:best):(entry.width>best.width?entry:best),null)||page;
      const raster=await readSmall(source.image,outWidth,outHeight);
      const maskEntry=entries.find(entry=>(entry.sub&4)&&entry.width===source.width&&entry.height===source.height);
      let mask=null;
      if(maskEntry)try{mask=(await readSmall(maskEntry.image,outWidth,outHeight))[0];}catch{}
      let noData=null;
      try{noData=page.image.getGDALNoData();}catch{}
      const data={page,raster,mask,noData:noData===null?null:Number(noData),outWidth,outHeight};
      cache.set(pageIndex,data);
      return data;
    }
    async function render(slideIndex,mode){
      const slide=slides[slideIndex];if(!slide)throw new Error('Invalid image index');
      const {page,raster,mask,noData,outWidth,outHeight}=await readPage(slide.pageIndex);
      const photo=page.image.fileDirectory.PhotometricInterpretation;
      const trueColor=(photo===2||photo===6)&&page.bands>=3;
      const colorAvailable=slide.bandIndex===null&&page.bands>=3;
      const displayMode=mode==='color'&&!colorAvailable?'gray':mode;
      const fixed=trueColor&&Array.from(page.image.fileDirectory.BitsPerSample||[]).slice(0,3).every(bits=>bits===8);
      const limits=raster.map(band=>range(band,fixed));
      const canvas=document.createElement('canvas');canvas.width=outWidth;canvas.height=outHeight;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
      const pixels=ctx.createImageData(outWidth,outHeight);
      for(let i=0;i<outWidth*outHeight;i++){
        const j=i*4;
        const missing=(mask&&mask[i]===0)||(trueColor&&page.bands===4&&raster[3][i]===0)||
          (noData!==null&&Number.isFinite(noData)&&(slide.bandIndex===null?raster.slice(0,Math.min(3,raster.length)).every(band=>band[i]===noData):raster[slide.bandIndex][i]===noData));
        if(missing){pixels.data[j+3]=0;continue;}
        let rgb;
        if(slide.bandIndex!==null||page.bands<3){const band=slide.bandIndex??0,v=scaled(raster[band][i],limits[band]);rgb=[v,v,v];}
        else if(photo===6){const y=raster[0][i],cb=raster[1][i]-128,cr=raster[2][i]-128;rgb=[clamp(y+1.402*cr),clamp(y-0.344136*cb-0.714136*cr),clamp(y+1.772*cb)];}
        else rgb=[scaled(raster[0][i],limits[0]),scaled(raster[1][i],limits[1]),scaled(raster[2][i],limits[2])];
        const intensity=clamp(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]);
        const shown=displayMode==='heat'?heat(intensity):displayMode==='gray'?[intensity,intensity,intensity]:rgb;
        pixels.data[j]=shown[0];pixels.data[j+1]=shown[1];pixels.data[j+2]=shown[2];pixels.data[j+3]=255;
      }
      ctx.putImageData(pixels,0,0);
      return {url:canvas.toDataURL('image/png'),width:page.width,height:page.height,bands:page.bands,
        ...georeference(page.image),date:page.image.fileDirectory.DateTime||null,
        kind:slide.bandIndex!==null?'band':trueColor?'rgb':page.bands>=3?'band123':'gray',
        slideIndex,slideCount:slides.length,pageIndex:slide.pageIndex,pageCount:pages.length,bandIndex:slide.bandIndex,
        mode:displayMode,colorAvailable,heatIsVisual:true};
    }
    return {slides,pages,render};
  }
  window.BioSatTiffPreview=async blob=>(await create(blob)).render(0,'color');
  window.BioSatTiffPreview.create=create;
})();
