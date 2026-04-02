function CMenu(){
    var _oBg;
    var _oButPlay;
    var _oFade;
    var _oAudioToggle;
    var _oButInfo;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _pStartPosPlay;
    var _pStartPosAudio;
    var _pStartPosInfo;
    var _pStartPosFullscreen;
    
    this._init = function(){
        _pStartPosPlay = {x: (CANVAS_WIDTH/2), y: CANVAS_HEIGHT -120};
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);
        

        var oSprite = s_oSpriteLibrary.getSprite('but_play');
        _oButPlay = new CGfxButton((_pStartPosPlay.x),_pStartPosPlay.y,oSprite,s_oStage);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
           var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
           _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2)- 10, y: (oSprite.height/2) + 10};            
           _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
           _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);          
        }
	   
	var oSprite = s_oSpriteLibrary.getSprite('but_credits');
        _pStartPosInfo = {x: (oSprite.height/2) + 10, y: (oSprite.height/2) + 10}; 
        _oButInfo = new CGfxButton(_pStartPosInfo.x,_pStartPosInfo.y,oSprite,s_oStage);
        _oButInfo.addEventListener(ON_MOUSE_UP, this._onCredits, this);
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosInfo.x + oSprite.width/2 + 10,y:_pStartPosInfo.y};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oFade = createBitmap(s_oSpriteLibrary.getSprite('fade'));
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 500).call(function(){_oFade.visible = false;});  
       
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);       

                
        if (!isIOS()) {
            s_oSoundTrack = playSound("soundtrack", 1, true);
        }
        setVolume("soundtrack",1);

    };
    
    this.unload = function(){
        s_oStage.removeAllChildren();
      
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.unload();
        }
        
        s_oMenu = null;
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButPlay.setPosition(_pStartPosPlay.x,_pStartPosPlay.y- iNewY);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x-iNewX,_pStartPosAudio.y+ iNewY);
        }
	
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
        
        _oButInfo.setPosition(_pStartPosInfo.x + iNewX,iNewY + _pStartPosInfo.y);
    };
	
	this._onCredits = function(){
        new CCreditsPanel();
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onButPlayRelease = function(){
        if(s_bFirstTimePlay){
            s_oMain.pokiShowCommercial(s_oMenu._startGame);
        } else {
            s_oMenu._startGame();
        }
    };
    
    this._startGame = function(){
        s_oMenu.unload();
        
        if (isIOS() && s_oSoundTrack === null) {
            s_oSoundTrack = playSound("soundtrack",1,true);
        }
        
        s_oMain.gotoPSelection();   
        
        $(s_oMain).trigger("start_session");
        
        s_bFirstTimePlay = false;
        
    };
	
    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
            _fCancelFullScreen.call(window.document);
            s_bFullscreen = false;
        }else{
            _fRequestFullScreen.call(window.document.documentElement);
            s_bFullscreen = true;
        }
        
        sizeHandler();
    };
  
    s_oMenu = this;
    
    this._init();
}

var s_oMenu = null;