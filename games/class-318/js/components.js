var FIAB=FIAB||{};FIAB.assetManager=function(o){o=o||{};var debug=o.debug||false;var _self=this;if(!FIAB.imageManager||!FIAB.audioManager){if(debug){console.log('***ERROR*** FIAB.assetManager - imageManager or audioManager plugin does not exist');}
return{isSupported:false};}
var imageManager=new FIAB.imageManager({debug:debug,images:o.images||null});var audioManager=new FIAB.audioManager({debug:debug,forceWebaudio:o.forceWebaudio||false,forceHtml5Audio:o.forceHtml5Audio||false,muted:o.muted||false,isSingleChannel:o.isSingleChannel||false});if(!audioManager.isSupported){if(debug){console.log('***ERROR*** FIAB.assetManager - audioManager could not be instantiated');}
return{isSupported:false};}
this.isSupported=true;this.addImages=function(a){return imageManager.add(a);};this.getImage=function(id,suppressErrors){return imageManager.get(id,suppressErrors);};this.getImageData=function(id,suppressErrors){return imageManager.getData(id,suppressErrors);};this.loadImages=function(o){return imageManager.load(o);};this.loadImagesByClass=function(cl,o){return imageManager.loadByClass(cl,o);};this.isMuted=function(){return audioManager.isMuted();};this.getAudioFormat=function(){return audioManager.getFormat();};this.getAudioModuleType=function(){return audioManager.getModuleType();};this.getAudio=function(id,suppressErrors){return audioManager.get(id,suppressErrors);};this.addAudio=function(a){return audioManager.add(a);};this.loadAudio=function(o){return audioManager.load(o);};this.loadAudioByClass=function(cl,o){return audioManager.loadByClass(cl,o);};this.getAudioData=function(id,suppressErrors){return audioManager.getData(id,suppressErrors);};this.play=function(id,o){return audioManager.play(id,o);};this.stop=function(id){return audioManager.stop(id);};this.stopAll=function(o){return audioManager.stopAll(o);};this.mute=function(){return audioManager.mute();};this.unMute=function(){return audioManager.unMute();};this.toggleMute=function(){return audioManager.toggleMute();};this.add=function(o){var r={};if(o.images){r.images=_self.addImages(o.images);}
if(o.audio){r.audio=_self.addAudio(o.audio);}
return r;};this.load=function(o){o=o||{};var audioPercentLoaded=o.audio?0:100;var imagePercentLoaded=o.images?0:100;var complete=o.audio?(o.images?0:1):(o.images?1:2);var handleFileLoad=function(id,type){var percentLoaded=Math.floor(((audioPercentLoaded+imagePercentLoaded)/200)*100);if(o.onFileLoad){o.onFileLoad(id,percentLoaded,type);}};var handleComplete=function(){complete=complete+1;if(complete===2&&o.onComplete){o.onComplete();}};var handleImageLoad=function(id,percent){imagePercentLoaded=percent;handleFileLoad(id,'image');};var handleAudioLoad=function(id,percent){audioPercentLoaded=percent;handleFileLoad(id,'audio');};var areImagesLoading=true;if(o.images){imagePercentLoaded=0;areImagesLoading=_self.loadImages({images:o.images?(o.images==='all'?null:o.images):null,onImageLoad:handleImageLoad,onComplete:handleComplete});}
var isAudioLoading=true;if(o.audio){isAudioLoading=_self.loadAudio({audio:o.audio?(o.audio==='all'?null:o.audio):null,onAudioLoad:handleAudioLoad,onComplete:handleComplete});}
return(areImagesLoading&&isAudioLoading);};this.loadByClass=function(o){o=o||{};var audioPercentLoaded=o.audio?0:100;var imagePercentLoaded=o.images?0:100;var complete=o.audio?(o.images?0:1):(o.images?1:2);var handleFileLoad=function(id,type){var percentLoaded=Math.floor(((audioPercentLoaded+imagePercentLoaded)/200)*100);if(o.onFileLoad){o.onFileLoad(id,percentLoaded,type);}};var handleComplete=function(){complete=complete+1;if(complete===2&&o.onComplete){o.onComplete();}};var handleImageLoad=function(id,percent){imagePercentLoaded=percent;handleFileLoad(id,'image');};var handleAudioLoad=function(id,percent){audioPercentLoaded=percent;handleFileLoad(id,'audio');};var areImagesLoading=true;if(o.images){imagePercentLoaded=0;areImagesLoading=_self.loadImagesByClass(o.images,{onImageLoad:handleImageLoad,onComplete:handleComplete});}
var isAudioLoading=true;if(o.audio){isAudioLoading=_self.loadAudioByClass(o.audio,{onAudioLoad:handleAudioLoad,onComplete:handleComplete});}
return(areImagesLoading&&isAudioLoading);};this.get=function(id){if(!id){if(debug){console.log('***ERROR*** FIAB.assetManager - No "id" argument passed to the "get" method - string expected');}
return null;}
var el=_self.getImage(id,true)||_self.getAudio(id,true);if(!el&&debug){console.log('***ERROR*** FIAB.assetManager - Could not "get" image or audio with id '+id);}
return el;};this.getData=function(id){if(!id){if(debug){console.log('***ERROR*** FIAB.assetManager - No "id" argument passed to the "getData" method - string expected');}
return null;}
var el=_self.getImageData(id,true)||_self.getAudioData(id,true);if(!el&&debug){console.log('***ERROR*** FIAB.assetManager - Could not "getData" for image or audio with id '+id);}
return el;};};var FIAB=FIAB||{};FIAB.audioManager=function(o){o=o||{};var _self=this;var debug=o.debug||false;var audioManagerOptions={debug:debug,muted:o.muted||false,isSingleChannel:o.isSingleChannel||false};var audioManager=null;if(o.forceWebaudio){if(FIAB.webAudio_audioManager){audioManager=new FIAB.webAudio_audioManager(audioManagerOptions);}else{if(debug){console.log('***ERROR*** FIAB.audioManager - forcing webAudio, however the required plugin "FIAB.webAudio_audioManager" is not available');}}}else if(o.forceHtml5Audio){if(FIAB.html5_audioManager){audioManager=new FIAB.html5_audioManager(audioManagerOptions);}else{if(debug){console.log('***ERROR*** FIAB.audioManager - forcing webAudio, however the required plugin "FIAB.webAudio_audioManager" is not available');}}}else{audioManager=new FIAB.webAudio_audioManager(audioManagerOptions);if(!audioManager.isSupported){audioManager=new FIAB.html5_audioManager(audioManagerOptions);}}
if(!audioManager.isSupported){if(debug){console.log('***ERROR*** FIAB.audioManager - Could not instantiate an audioManager');}
return audioManager;}
this.isSupported=true;this.isMuted=function(){return audioManager.isMuted();};this.getFormat=function(){return audioManager.getFormat();};this.getModuleType=function(){return audioManager.getModuleType();};this.get=function(id,suppressErrors){return audioManager.get(id,suppressErrors);};this.add=function(a){return audioManager.add(a);};this.load=function(o){return audioManager.load(o);};this.loadByClass=function(cl,o){return audioManager.loadByClass(cl,o);};this.getData=function(id){return audioManager.getData(id);};this.play=function(id,o){return audioManager.play(id,o);};this.stop=function(id){return audioManager.stop(id);};this.stopAll=function(o){return audioManager.stopAll(o);};this.mute=function(){return audioManager.mute();};this.unMute=function(){return audioManager.unMute();};this.toggleMute=function(){return audioManager.toggleMute();};};var FIAB=FIAB||{};FIAB.browser_detect=function(){this.browser=null;this.version=null;this.OS=null;this.browsers=[{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera",versionSearch:"Version"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}];this.operatingSystems=[{string:navigator.userAgent,subString:"PlayBook",identity:"PlayBook"},{string:navigator.userAgent,subString:"Playbook",identity:"PlayBook"},{string:navigator.platform,subString:"Win",identity:"Windows"},{string:navigator.platform,subString:"Mac",identity:"Mac"},{string:navigator.userAgent,subString:"iPhone",identity:"iPhone/iPod"},{string:navigator.userAgent,subString:"iPad",identity:"iPad"},{string:navigator.platform,subString:"Linux",identity:"Linux"},{string:navigator.userAgent,subString:"Silk",identity:"Kindle"},{string:navigator.userAgent,subString:"Linux",identity:"Probably-Kindle"}];this.init=function(){this.browser=this.searchString(this.browsers)||null;this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||null;this.OS=this.searchString(this.operatingSystems)||null;};this.searchString=function(data){for(var i=0;i<data.length;i++){var dataString=data[i].string;var dataProp=data[i].prop;this.versionSearchString=data[i].versionSearch||data[i].identity;if(dataString){if(dataString.indexOf(data[i].subString)!=-1){return data[i].identity;}}else if(dataProp){return data[i].identity;}}};this.searchVersion=function(dataString){var index=dataString.indexOf(this.versionSearchString);if(index==-1){return;}
return parseFloat(dataString.substring(index+this.versionSearchString.length+1));};this.init();return{OS:this.OS,browser:this.browser,version:this.version};};var FIAB=FIAB||{};FIAB.canvasManager=function(o){o=o||{};var options={container:o.container||null,width:o.width||720,height:o.height||440,scaleMethod:o.scaleMethod||'limit',drawLines:o.drawLines||false,debug:o.debug||false,pollInterval:o.pollInterval||100,onSizeChange:o.onSizeChange||null,autoUpdate:o.autoUpdate===false?false:true,isProblematicDevice:o.isProblematicDevice||false};var canvas=document.createElement('canvas');if(!canvas){if(options.debug){console.log('***ERROR*** FIAB.canvasManager - canvas element is not supported in this browser');}
return{isSupported:false};}
var _self=this;var wrapper=document.createElement('div');wrapper.className='fiab_canvas_manager';wrapper.style.position='absolute';wrapper.style.margin='0px';wrapper.style.padding='0px';wrapper.style.left='0px';wrapper.style.top='0px';wrapper.style.right='auto';wrapper.style.bottom='auto';wrapper.style.overflow='hidden';wrapper.appendChild(canvas);canvas.style.position='absolute';canvas.style.margin='0px';canvas.style.padding='0px';var lastContainerHeight=0;var lastContainerWidth=0;var isApplied=false;var container=null;var scaleMethods=['limit','stretch','fill','contain','cover'];var lastPoll=0;var RAF=(function(interval){if(window.requestAnimationFrame){return function(callback){window.requestAnimationFrame(callback);};}
var vendors=['ms','moz','webkit','o'];var method=null;for(var x=0;x<vendors.length;++x){if(window[vendors[x]+'RequestAnimationFrame']){method=window[vendors[x]+'RequestAnimationFrame'];break;}}
if(method){return function(callback){method(callback);};}
var polyFill=function(callback){if(!callback){return false;}
setTimeout(function(){callback();},interval);};return polyFill;})(o.updateInterval||100);var getElement=function(el){if(typeof el==='string'){var firstChar=el.substr(0,1);if(firstChar==='.'){return document.getElementsByClassName(el.replace('.',''))[0];}else if(firstChar==='#'){return document.getElementById(el.replace('#',''));}else{return document.getElementsByTagName(el)[0];}}else{return el;}};var setHeight=function(h){if(!h&&h!==0){return false;}
canvas.height=parseInt(h);return true;};var setWidth=function(w){if(!w&&w!==0){return false;}
canvas.width=parseInt(w);return true;};var setDimensions=function(w,h){var widthSet=setWidth(w);var heightSet=setHeight(h);return(widthSet&&heightSet);};var drawLines=function(){var ctx=canvas.getContext("2d");ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(canvas.width,0);ctx.lineTo(canvas.width,canvas.height);ctx.lineTo(0,canvas.height);ctx.lineTo(0,0);ctx.lineTo(canvas.width,canvas.height);ctx.moveTo(0,canvas.height);ctx.lineTo(canvas.width,0);ctx.lineWidth=3;ctx.stroke();};var paint=function(){if(!isApplied){return false;}
wrapper.style.height=lastContainerHeight+'px';wrapper.style.width=lastContainerWidth+'px';var canvasHeight=canvas.height;var canvasWidth=canvas.width;var heightRatio,widthRatio,containerRatio,canvasRatio,newHeight,newWidth;if(options.scaleMethod==='limit'){var isWithinBounds=lastContainerWidth>=canvas.width&&lastContainerHeight>=canvas.height;if(!isWithinBounds){heightRatio=lastContainerHeight/canvas.height;widthRatio=lastContainerWidth/canvas.width;canvasHeight=(heightRatio<widthRatio)?lastContainerHeight:parseInt(canvas.height*(lastContainerWidth/canvas.width));canvasWidth=(heightRatio<widthRatio)?parseInt(canvas.width*(lastContainerHeight/canvas.height)):lastContainerWidth;}
canvas.style.height=canvasHeight+'px';canvas.style.width=canvasWidth+'px';canvas.style.top=options.isProblematicDevice?'0px':Math.round((lastContainerHeight-canvasHeight)/2)+'px';canvas.style.left=options.isProblematicDevice?'0px':Math.round((lastContainerWidth-canvasWidth)/2)+'px';if(options.isProblematicDevice){wrapper.style.height=canvasHeight+'px';wrapper.style.width=canvasWidth+'px';wrapper.style.top=Math.round((lastContainerHeight-canvasHeight)/2)+'px';wrapper.style.left=Math.round((lastContainerWidth-canvasWidth)/2)+'px';}}else if(options.scaleMethod==='stretch'){canvas.style.width='100%';canvas.style.height='100%';canvas.style.top='0px';canvas.style.left='0px';}else if(options.scaleMethod==='fill'){canvas.width=lastContainerWidth;canvas.height=lastContainerHeight;canvas.style.width=lastContainerWidth+'px';canvas.style.height=lastContainerHeight+'px';canvas.style.top='0px';canvas.style.left='0px';}else if(options.scaleMethod==='contain'){canvasRatio=canvas.width/canvas.height;widthRatio=canvas.width/lastContainerWidth;heightRatio=canvas.height/lastContainerHeight;var str=(heightRatio>=widthRatio)?'width':'height';newWidth=(heightRatio>=widthRatio)?parseInt(lastContainerHeight*canvasRatio):lastContainerWidth;newHeight=(heightRatio>=widthRatio)?lastContainerHeight:parseInt(lastContainerWidth/canvasRatio);canvas.style.height=newHeight+'px';canvas.style.width=newWidth+'px';canvas.style.top=parseInt((lastContainerHeight-newHeight)/2)+'px';canvas.style.left=parseInt((lastContainerWidth-newWidth)/2)+'px';}else if(options.scaleMethod==='cover'){containerRatio=lastContainerWidth/lastContainerHeight;canvasRatio=canvas.width/canvas.height;newWidth=(containerRatio>=canvasRatio)?lastContainerWidth:parseInt(lastContainerHeight*canvasRatio);newHeight=(containerRatio>=canvasRatio)?parseInt(lastContainerWidth/canvasRatio):lastContainerHeight;canvas.style.width=newWidth+'px';canvas.style.height=newHeight+'px';canvas.style.left=(containerRatio>=canvasRatio)?'0px':Math.round((lastContainerWidth-newWidth)/2)+'px';canvas.style.top=(containerRatio>=canvasRatio)?Math.round((lastContainerHeight-newHeight)/2)+'px':'0px';}
if(options.drawLines){drawLines();}};var poll=function(force,onInit){var now=new Date().getTime();if(now-lastPoll<options.pollInterval&&force!==true){if(options.autoUpdate){RAF(poll);}
return false;}
lastPoll=now;var tagName=container.nodeName||container.tagName||'';if(tagName.toLowerCase()==='body'){container.style.height=window.innerHeight+'px';container.style.width=window.innerWidth+'px';}
var styles=getComputedStyle(container);var containerWidth=parseInt(styles.width);var containerHeight=parseInt(styles.height);if(containerHeight!==lastContainerHeight||containerWidth!==lastContainerWidth){lastContainerWidth=containerWidth;lastContainerHeight=containerHeight;paint();if(options.onSizeChange&&onInit!==true){options.onSizeChange(_self.getData());}}
if(options.autoUpdate){RAF(poll);}
return true;};var setScaleMethod=function(m){var l=scaleMethods.length,i=0;var isAllowedMethod=false;for(i=0;i<l;i++){if(scaleMethods[i]===m){isAllowedMethod=true;break;}}
if(!isAllowedMethod){options.scaleMethod='limit';return false;}
options.scaleMethod=m;return true;};this.isSupported=true;this.setContainer=function(e){if(!e){if(options.debug){console.log('***ERROR*** FIAB.canvasManager - container element not specified in setContainer method');}
return false;}
var el=getElement(e);if(!el){if(options.debug){console.log('***ERROR*** FIAB.canvasManager - DOM element not found when '+e+' was requested in setContainer method');}
return false;}
if(isApplied){container.removeChild(wrapper);}
container=el;var pos=el.style.position||getComputedStyle(el).position;var tagName=el.tagName||el.nodeName||'';if(pos!=='absolute'&&pos!=='relative'&&tagName.toLowerCase()!=='body'){if(options.debug){console.warn('***WARNING*** FIAB.canvasManager - Canvas element may not be positioned as expected because the parent container is not positioned absolutely or relatively. Element below:');console.log(el);}}
container.appendChild(wrapper);if(isApplied){poll(true);}
isApplied=true;return true;};this.getData=function(){return{container:{element:container},canvas:{element:canvas,defaultWidth:canvas.width,defaultHeight:canvas.height,onScreenWidth:canvas.style.width==='auto'?canvas.width:parseInt(canvas.style.width),onScreenHeight:canvas.style.height==='auto'?canvas.height:parseInt(canvas.style.height),top:parseInt(canvas.style.top),left:parseInt(canvas.style.left)},wrapper:{element:wrapper,height:lastContainerHeight,width:lastContainerWidth},scaleMethod:options.scaleMethod,pollInterval:options.pollInterval};};this.getCanvas=function(){return canvas;};this.getWrapper=function(){return wrapper;};this.getContainer=function(){return container;};this.setHeight=function(h){if(setHeight(h)){paint();return true;}
return false;};this.setWidth=function(w){if(setWidth(w)){paint();return true;}
return false;};this.setDimensions=function(w,h){var widthSet=setWidth(w);var heightSet=setHeight(h);paint();return(widthSet&&heightSet);};this.setAutoUpdate=function(set){options.autoUpdate=set;if(set){poll(true);}};this.setDebug=function(val){options.debug=val;return true;};this.setScaleMethod=function(m){var success=setScaleMethod(m);if(success){paint();}
return success;};this.update=function(){poll(true);return true;};this.setOnSizeChange=function(val){options.onSizeChange=val?val:null;return(val?true:false);};this.setPollInterval=function(val){if(!val){return false;}
options.pollInterval=val;return true;};setScaleMethod(options.scaleMethod);_self.setContainer(options.container||document.getElementsByTagName('body')[0]);setDimensions(options.width,options.height);poll(false,true);};var FIAB=FIAB||{};FIAB.html5_audioManager=function(o){var a=document.createElement('audio');if(!(a.canPlayType)){return{isSupported:false};}
var audioFormat=a.canPlayType('audio/ogg')?'ogg':a.canPlayType('audio/mpeg')?'mp3':a.canPlayType('audio/wav')?'wav':null;if(!audioFormat){return{isSupported:false};}
this.isSupported=true;a=null;o=o||{};var isSingleChannel=o.isSingleChannel||false;var singleAudioEl=null;if(isSingleChannel){singleAudioEl=new Audio();singleAudioEl.preload=false;}
var _self=this;var moduleType='html5';var audio=[];var debug=o.debug||false;var isMuted=o.muted||false;var Audio_element=function(o){o=o||{};var _self=this;this.id=o.id||'';this.path=o.path||'';this.isLoaded=false;this.looping=false;this.element=null;this.classes=o.classes||[];this.isPlaying=function(){if(!_self.isLoaded){return false;}
if(_self.looping){return true;}
return!_self.element.paused;};};this.getFormat=function(){return audioFormat;};this.getModuleType=function(){return moduleType;};this.isMuted=function(){return isMuted;};this.mute=function(){if(isMuted){return isMuted;}
isMuted=true;var len=audio.length;for(var i=0;i<len;i++){var el=audio[i].element;if(!el){continue;}
el.muted=isMuted;}
if(isSingleChannel){singleAudioEl.muted=isMuted;}
return isMuted;};this.unMute=function(){if(!isMuted){return isMuted;}
isMuted=false;var len=audio.length;for(var i=0;i<len;i++){var el=audio[i].element;if(!el){continue;}
el.muted=isMuted;}
if(isSingleChannel){singleAudioEl.muted=isMuted;}
return isMuted;};this.toggleMute=function(){var methodName=isMuted?'unMute':'mute';return _self[methodName]();};this.add=function(a){if(!a||!a.length||typeof a==='string'){if(debug){console.log('***ERROR*** FIAB.html5_audioManager expects an array of objects in the method "add"');}
return false;}
for(var i=0;i<a.length;i++){if(!a[i].id){if(debug){console.log('No ID provided with an audio object in '+moduleType+' audio module \'add\' method');}
continue;}
var alreadyExists=false;for(var j=0;j<audio.length;j++){if(audio[j].id===a[i].id){if(debug){console.log('Warning: '+moduleType+' audio module - audio with ID \''+a[i].id+'\' already exists!');}
alreadyExists=true;}}
if(alreadyExists){continue;}
audio.push(new Audio_element({id:a[i].id,path:a[i].path,classes:a[i].classes||[]}));}
return!!(a.length);};var getAudioById=function(id){var a=null;for(var i=0;i<audio.length;i++){if(id===audio[i].id){a=audio[i];break;}}
return a;};this.getData=function(str,suppressErrors){if(str){var data=getAudioById(str);if(!data&&debug&&!suppressErrors){console.log('***ERROR*** FIAB.html5_audioManager - Audio with ID '+str+' cannot be found in the module and so cannot return data.');return null;}
return data;}
return audio;};this.get=function(id,suppressErrors){var a=getAudioById(id);if(!a){if(debug&&!suppressErrors){console.log('***ERROR*** FIAB.html5_audioManager - Audio with ID '+str+' cannot be found in the module and so cannot return element.');}
return null;}
return a.element;};this.stopAll=function(notThese){if(notThese&&typeof notThese==='string'){notThese=[notThese];}
for(var i=0;i<audio.length;i++){if(notThese&&notThese.length){var stopThis=true;for(var j=0;j<notThese.length;j++){if(notThese[j]===audio[i].id){stopThis=false;break;}}
if(!stopThis){continue;}}
stopAudio(audio[i]);}
if(isSingleChannel){singleAudioEl.pause();try{singleAudioEl.currentTime=0;}catch(e){}}};var stopAudio=function(el){if(!el.element){return false;}
el.element.pause();try{el.element.currentTime=0;}catch(e){if(debug){console.log('***WARNING*** FIAB.html5Audio_audioManager - Cannot set currentTime property back to zero. This could be a read-only property in this browser.');console.log(e);}}
el.lastPlayTime=0;el.looping=false;};this.stop=function(id){var audioEl=getAudioById(id);if(!audioEl){return false;}
stopAudio(audioEl);if(isSingleChannel){singleAudioEl.pause();try{singleAudioEl.currentTime=0;}catch(e){}}};this.play=function(id,o){if(!id){return false;}
o=o||{};if(typeof id!=='string'){for(var i=0;i<id.length;i++){_self.play(id[i],o);}
return true;}
var audioEl=getAudioById(id);if(!audioEl){if(debug){console.log(moduleType+' audio module error - cannot play audio with ID '+id+' - audio does not exist');}
return false;}
if(!audioEl.isLoaded){if(debug){console.log(moduleType+' audio module error - cannot play audio with ID '+id+' - audio is not yet loaded');}
return false;}
if(isSingleChannel){singleAudioEl.src=audioEl.path;singleAudioEl.loop=o.loop?true:false;singleAudioEl.play();return;}
if(audioEl.isPlaying()&&!o.startAgain){if(debug){console.log(moduleType+' audio module - not playing audio with id '+id+' - as it is currently playing');}
return true;}
stopAudio(audioEl);audioEl.element.loop=o.loop?true:false;audioEl.looping=o.loop?true:false;audioEl.element.play();audioEl.lastPlayTime=new Date().getTime();};var loadAudio=function(toLoad,onLoad,onComplete){var audioLoaded=0;var audioToLoad=toLoad.length;if(!audioToLoad){if(debug){console.log(moduleType+' - There is not any audio to load, firing the onComplete method');}
if(onComplete){onComplete();}
return false;}
var handleLoad=function(audioObject){audioObject.element.removeEventListener('loadeddata',handleLoad);audioObject.isLoaded=true;audioLoaded++;var percentComplete=Math.floor((audioLoaded/audioToLoad)*100);if(onLoad){onLoad(audioObject.id,percentComplete);}
if((audioLoaded===audioToLoad)&&onComplete){onComplete();}};var getCallback=function(obj){return function(e){handleLoad(obj);};};for(var i=0;i<audioToLoad;i++){var audToLoad=toLoad[i];if(audToLoad.isLoaded){handleLoad(audToLoad);}else{audToLoad.element=new Audio();audToLoad.element.preload=false;audToLoad.element.addEventListener('loadeddata',getCallback(audToLoad));audToLoad.element.src=audToLoad.path;audToLoad.element.load();audToLoad.element.muted=isMuted;}}
return true;};this.load=function(o){o=o||{};var audioToLoad=[];if(o.audio){var l=o.audio.length;for(var i=0;i<l;i++){var audioID=o.audio[i];var il=audio.length;var audioExists=false;for(var j=0;j<il;j++){if(audio[j].id===audioID){audioExists=audio[j];break;}}
if(!audioExists){if(debug){console.log('***ERROR*** FIAB.html5_audioManager - Audio with ID '+audioID+' cannot be found in the audioManager and so cannot load it.');}
continue;}
var alreadyInArray=false;for(var k=0;k<audioToLoad.length;k++){if(audioToLoad[k].id===audioID){alreadyInArray=true;break;}}
if(alreadyInArray){continue;}
audioToLoad.push(audioExists);}}else{audioToLoad=audio;}
return loadAudio(audioToLoad,o.onAudioLoad,o.onComplete);};this.loadByClass=function(classes,o){o=o||{};if(!classes){if(debug){console.log('***ERROR*** FIAB.html5Audio_audioManager - Cannot load audio by class. Array expected as first argument. Arg sent:');console.log(classes);}
return false;}
if(typeof classes==='string'){classes=[classes];}
var idsToLoad=[];for(var i=0;i<classes.length;i++){var cls=classes[i].split(' ');for(var j=0;j<audio.length;j++){var aud=audio[j];var matchesAllClasses=true;for(var k=0;k<cls.length;k++){var matchesClass=false;for(var l=0;l<aud.classes.length;l++){if(aud.classes[l]===cls[k]){matchesClass=true;break;}}
if(!matchesClass){matchesAllClasses=false;break;}}
if(matchesAllClasses){idsToLoad.push(aud.id);}}}
return _self.load({audio:idsToLoad,onAudioLoad:o.onAudioLoad||null,onComplete:o.onComplete||null});};};var FIAB=FIAB||{};FIAB.imageManager=function(o){o=o||{};var _self=this;var debug=o.debug||false;var images=[];this.add=function(a){if(!a||!a.length||typeof a==='string'){if(debug){console.log('***ERROR*** FIAB.imageManager expects an array of objects in the method "add"');}
return false;}
for(var i=0;i<a.length;i++){var imageExists=false;for(var j=0;j<images.length;j++){if(images[j].id===a[i].id){imageExists=true;if(debug){console.log('***ERROR*** FIAB.imageManager - you have duplicate ID\'s in your image array. Check images with ID '+a[i].id);}
break;}}
if(!imageExists){var img=a[i];images.push({id:img.id,path:img.path,classes:img.classes||[],parentImage:img.parentImage||null,element:null,isLoaded:false});}}
return true;};var getImageById=function(id){var img=null;for(var i=0;i<images.length;i++){if(images[i].id===id){img=images[i];break;}}
return img;};this.getData=function(str,suppressErrors){if(str){var data=getImageById(str);if(!data&&debug&&!suppressErrors){console.log('***ERROR*** FIAB.imageManager - Image with ID '+str+' cannot be found in the imageManager and so cannot return data.');}
return data;}
return images;};var loadImages=function(toLoad,onLoad,onComplete){var imagesLoaded=0;var imagesToLoad=toLoad.length;if(!imagesToLoad){if(debug){console.log('***ERROR*** FIAB.imageManager - No images to load, firing onComplete function.');}
if(onComplete){onComplete();}
return false;}
var handleLoad=function(id,img){var im=getImageById(id);im.element=img;im.isLoaded=true;imagesLoaded++;var percentComplete=Math.floor((imagesLoaded/imagesToLoad)*100);if(onLoad){onLoad(id,percentComplete);}
if(imagesLoaded===imagesToLoad&&onComplete){onComplete();}};var getImageLoadCallback=function(id,img){return function(e){handleLoad(id,img);};};for(var i=0;i<imagesToLoad;i++){var imgToLoad=toLoad[i];if(imgToLoad.isLoaded){handleLoad(imgToLoad.id,imgToLoad.element);continue;}
var img=new Image();img.onload=getImageLoadCallback(imgToLoad.id,img);img.src=imgToLoad.path;}
return true;};this.load=function(o){o=o||{};var imagesToLoad=[];if(o.images){var l=o.images.length;for(var i=0;i<l;i++){var imgID=o.images[i];var il=images.length;var imageExists=false;for(var j=0;j<il;j++){if(images[j].id===imgID){imageExists=images[j];break;}}
if(!imageExists){if(debug){console.log('***ERROR*** FIAB.imageManager - Image with ID '+imgID+' cannot be found in the imageManager and so cannot load it.');}
continue;}
var alreadyInArray=false;for(var k=0;k<imagesToLoad.length;k++){if(imagesToLoad[k].id===imgID){alreadyInArray=true;break;}}
if(alreadyInArray){continue;}
imagesToLoad.push(imageExists);}}else{imagesToLoad=images;}
return loadImages(imagesToLoad,o.onImageLoad,o.onComplete);};this.loadByClass=function(classes,o){o=o||{};if(typeof classes==='string'){classes=[classes];}
if(!classes){if(debug){console.log('***ERROR*** FIAB.imageManager - Cannot load images by class. Array expected as first argument. Arg sent:');console.log(classes);}
return false;}
var idsToLoad=[];for(var i=0;i<classes.length;i++){var cls=classes[i].split(' ');for(var j=0;j<images.length;j++){var img=images[j];var matchesAllClasses=true;for(var k=0;k<cls.length;k++){var matchesClass=false;for(var l=0;l<img.classes.length;l++){if(img.classes[l]===cls[k]){matchesClass=true;break;}}
if(!matchesClass){matchesAllClasses=false;break;}}
if(matchesAllClasses){idsToLoad.push(img.id);}}}
return _self.load({images:idsToLoad,onImageLoad:o.onImageLoad||null,onComplete:o.onComplete||null});};this.get=function(id,suppressErrors){var img=getImageById(id);if(!img){if(debug&&!suppressErrors){console.log('***ERROR*** FIAB.imageManager - could not get image with ID '+id+' using the "get" method');}
return null;}
if(!img.isLoaded){if(debug&&!suppressErrors){console.log('***WARN*** FIAB.imageManager - image with id '+id+' is not loaded');}
return null;}
return img.element;};if(o.images){_self.add(o.images);}};var FIAB=FIAB||{};FIAB.webAudio_audioManager=function(o){if(!(window.AudioContext||window.webkitAudioContext)){return{isSupported:false};}
this.isSupported=true;o=o||{};var audioContext=window.AudioContext?new AudioContext():new webkitAudioContext();var gain=audioContext.createGainNode?audioContext.createGainNode():audioContext.createGain();gain.connect(audioContext.destination);var audio=[];var moduleType='webAudio';var a=document.createElement("audio");var audioFormat=a.canPlayType('audio/ogg')?'ogg':a.canPlayType('audio/mp3')?'mp3':'wav';a=null;var _self=this;var debug=o.debug||false;var isMuted=o.muted||false;gain.gain.value=isMuted?0:1;var Audio_element=function(o){o=o||{};var _self=this;this.id=o.id||'';this.path=o.path||'';this.isLoaded=false;this.looping=false;this.classes=o.classes||[];this.buffer=null;this.lastPlayTime=null;this.isPlaying=function(){if(!_self.buffer||!_self.lastPlayTime){return false;}
if(_self.looping){return true;}
if((new Date().getTime()-_self.lastPlayTime)<(_self.buffer.duration*1000)){return true;}
return false;};};this.getFormat=function(){return audioFormat;};this.getModuleType=function(){return moduleType;};this.isMuted=function(){return isMuted;};this.mute=function(){if(isMuted){return isMuted;}
gain.gain.value=0;isMuted=true;return isMuted;};this.unMute=function(){if(!isMuted){return isMuted;}
gain.gain.value=1;isMuted=false;return isMuted;};this.toggleMute=function(){var methodName=isMuted?'unMute':'mute';return _self[methodName]();};this.add=function(a){if(!a||!a.length||typeof a==='string'){if(debug){console.log('***ERROR*** FIAB.webAudio_audioManager expects an array of objects in the method "add"');}
return false;}
for(var i=0;i<a.length;i++){if(!a[i].id){if(debug){console.log('No ID provided with an audio object in '+moduleType+' audio module \'add\' method');}
continue;}
var alreadyExists=false;for(var j=0;j<audio.length;j++){if(audio[j].id===a[i].id){if(debug){console.log('Warning: '+moduleType+' audio module - audio with ID \''+a[i].id+'\' already exists!');}
alreadyExists=true;}}
if(alreadyExists){continue;}
audio.push(new Audio_element({id:a[i].id,path:a[i].path,classes:a[i].classes||[]}));}
return!!(a.length);};var getAudioById=function(id){var a=null;for(var i=0;i<audio.length;i++){if(id===audio[i].id){a=audio[i];break;}}
return a;};this.getData=function(str,suppressErrors){if(str){var data=getAudioById(str);if(!data&&debug&&!suppressErrors){console.log('***ERROR*** FIAB.webAudio_audioManager - Audio with ID '+str+' cannot be found in the module and so cannot return data.');return null;}
return data;}
return audio;};this.get=function(id,suppressErrors){var a=getAudioById(id);if(!a){if(debug&&!suppressErrors){console.log('***ERROR*** FIAB.webAudio_audioManager - Audio with ID '+str+' cannot be found in the module and so cannot return element.');}
return null;}
return a.buffer;};this.stopAll=function(notThese){if(notThese&&typeof notThese==='string'){notThese=[notThese];}
for(var i=0;i<audio.length;i++){if(notThese&&notThese.length){var stopThis=true;for(var j=0;j<notThese.length;j++){if(notThese[j]===audio[i].id){stopThis=false;break;}}
if(!stopThis){continue;}}
stopAudio(audio[i]);}};var stopAudio=function(el){try{el.source.noteOff(0);}catch(err1){try{el.source.stop(0);}catch(err2){}}
el.lastPlayTime=0;el.looping=false;};this.stop=function(id){var audioEl=getAudioById(id);if(!audioEl){return false;}
stopAudio(audioEl);};this.play=function(id,o){if(!id){return false;}
o=o||{};if(typeof id!=='string'){for(var i=0;i<id.length;i++){_self.play(id[i],o);}
return true;}
var audioEl=getAudioById(id);if(!audioEl){if(debug){console.log(moduleType+' audio module error - cannot play audio with ID '+id+' - audio does not exist');}
return false;}
if(!audioEl.isLoaded){if(debug){console.log(moduleType+' audio module error - cannot play audio with ID '+id+' - audio is not yet loaded');}
return false;}
if(audioEl.isPlaying()&&!o.startAgain){if(debug){console.log(moduleType+' audio module - not playing audio with id '+id+' - as it is currently playing');}
return true;}
stopAudio(audioEl);audioEl.source=null;audioEl.source=audioContext.createBufferSource();audioEl.source.loop=o.loop?true:false;audioEl.looping=o.loop?true:false;audioEl.source.buffer=audioEl.buffer;audioEl.source.connect(gain);try{audioEl.source.noteOn(0);}catch(err1){try{audioEl.source.start(0);}catch(err2){}}
audioEl.lastPlayTime=new Date().getTime();};this.load=function(o){o=o||{};var audioToLoad=[];if(o.audio){var l=o.audio.length;for(var i=0;i<l;i++){var audioID=o.audio[i];var il=audio.length;var audioExists=false;for(var j=0;j<il;j++){if(audio[j].id===audioID){audioExists=audio[j];break;}}
if(!audioExists){if(debug){console.log('***ERROR*** FIAB.webAudio_audioManager - Audio with ID '+audioID+' cannot be found in the audioManager and so cannot load it.');}
continue;}
var alreadyInArray=false;for(var k=0;k<audioToLoad.length;k++){if(audioToLoad[k].id===audioID){alreadyInArray=true;break;}}
if(alreadyInArray){continue;}
audioToLoad.push(audioExists);}}else{audioToLoad=audio;}
return loadAudio(audioToLoad,o.onAudioLoad,o.onComplete);};var loadAudio=function(toLoad,onLoad,onComplete){var audioLoaded=0;var audioToLoad=toLoad.length;if(!audioToLoad){if(debug){console.log('FIAB.webAudio_audioManager - There is not any audio to load, firing the onComplete method');}
if(onComplete){onComplete();}
return false;}
var handleLoad=function(id){audioLoaded++;var percentComplete=Math.floor((audioLoaded/audioToLoad)*100);if(onLoad){onLoad(id,percentComplete);}
if((audioLoaded===audioToLoad)&&onComplete){onComplete();}};var getLoadFunction=function(audioObject){return function(audioObject){var request=new XMLHttpRequest();request.id=audioObject.id;request.responseType='arraybuffer';request.sent=false;request.addEventListener('load',function(e){audioContext.decodeAudioData(e.target.response,function onSuccess(decodedBuffer){audioObject.buffer=decodedBuffer;audioObject.isLoaded=true;handleLoad(audioObject.id);},function(e){console.log('***ERROR*** - FIAB.webAudio_audioManager - Could not decode audio data for audio with ID "'+audioObject.id+'". Error details');console.log(e);});},false);request.open('GET',audioObject.path,true);request.send();};};for(var i=0;i<audioToLoad;i++){var audToLoad=toLoad[i];if(audToLoad.isLoaded){handleLoad(audToLoad.id);continue;}
getLoadFunction()(audToLoad);}
return true;};this.loadByClass=function(classes,o){o=o||{};if(!classes){if(debug){console.log('***ERROR*** FIAB.webAudio_audioManager - Cannot load audio by class. Array expected as first argument. Arg sent:');console.log(classes);}
return false;}
if(typeof classes==='string'){classes=[classes];}
var idsToLoad=[];for(var i=0;i<classes.length;i++){var cls=classes[i].split(' ');for(var j=0;j<audio.length;j++){var aud=audio[j];var matchesAllClasses=true;for(var k=0;k<cls.length;k++){var matchesClass=false;for(var l=0;l<aud.classes.length;l++){if(aud.classes[l]===cls[k]){matchesClass=true;break;}}
if(!matchesClass){matchesAllClasses=false;break;}}
if(matchesAllClasses){idsToLoad.push(aud.id);}}}
return _self.load({audio:idsToLoad,onAudioLoad:o.onAudioLoad||null,onComplete:o.onComplete||null});};};