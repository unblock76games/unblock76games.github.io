function CSelectCharacter(){
    var _oBg;
    var _oButBWhite;
    var _oButBBlack;
    //var _oLogo;
    var _oLogoText;
    var _oTextBW;
    var _oTextBB;
    var _oFade;
    var _oAudioToggle;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    //var _pStartPosLogo;
    var _pStartPosAudio;
    var _pStartPosLogoText;
    var _pStartPosFullscreen;
    
    this._init = function(){
        
        
        //_pStartPosLogo = {x: 5, y: 5};
        _pStartPosLogoText = {x: CANVAS_WIDTH/2, y: 60};      
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_pselection'));
        s_oStage.addChild(_oBg);
/*
       _oLogo = createBitmap(s_oSpriteLibrary.getSprite('logo'));
       _oLogo.x = _pStartPosLogo.x;
       _oLogo.y = _pStartPosLogo.y;
       s_oStage.addChild(_oLogo);
  */     
       _oLogoText = createBitmap(s_oSpriteLibrary.getSprite('logo_text'));
       _oLogoText.regX=165;
       _oLogoText.x = _pStartPosLogoText.x;
       _oLogoText.y = _pStartPosLogoText.y;
       s_oStage.addChild(_oLogoText);
       
       
        
        var oSprite = s_oSpriteLibrary.getSprite('bw_selection');
        _oButBWhite = new CSelectButton((CANVAS_WIDTH/2),CANVAS_HEIGHT - 600,oSprite,true);
        _oButBWhite.addEventListener(ON_MOUSE_UP, this._onButChooseWhite, this);

        
        var oSprite = s_oSpriteLibrary.getSprite('bb_selection');
        _oButBBlack = new CSelectButton((CANVAS_WIDTH/2),CANVAS_HEIGHT -300,oSprite,true);
        _oButBBlack.addEventListener(ON_MOUSE_UP, this._onButChooseBlack, this);

         _oTextBW = new createjs.BitmapText(TEXT_BOXERW, s_oSpriteSheetBoxing);
        _oTextBW.regX  = _oTextBW.getBounds().width/2;
        _oTextBW.regY  = _oTextBW.getBounds().height/2;
        _oTextBW.x = CANVAS_WIDTH/2+50 ;
        _oTextBW.y = 463;
        s_oStage.addChild(_oTextBW);
        
         _oTextBB = new createjs.BitmapText(TEXT_BOXERB, s_oSpriteSheetBoxing);
        _oTextBB.regX  = _oTextBB.getBounds().width/2;
        _oTextBB.regY  = _oTextBB.getBounds().height/2;
        _oTextBB.x = CANVAS_WIDTH/2+65 ;
        _oTextBB.y = CANVAS_HEIGHT - 200;
        s_oStage.addChild(_oTextBB);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
                _pStartPosAudio = {x: (CANVAS_WIDTH -40), y: 50};
                _oAudioToggle= new CToggle((_pStartPosAudio.x),_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
                _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:50};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        this.refreshButtonPos(s_iOffsetX,s_iOffsetY);

        _oFade = createBitmap(s_oSpriteLibrary.getSprite('fade'));
        
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 500).call(function(){_oFade.visible = false;});  
    };
    
    this.unload = function(){
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.unload();
        }
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
         s_oStage.removeAllChildren();
         s_oSelectCharacter= null;  
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
       //_oLogo.x = _pStartPosLogo.x + iNewX;
       //_oLogo.y = iNewY + _pStartPosLogo.y;
       
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x-iNewX,_pStartPosAudio.y+ iNewY);
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
        
       _oLogoText.y = iNewY + _pStartPosLogoText.y;
    };
    
    
    this._onButChooseWhite = function(){
        s_iPlayerSelected=0;
        this.unload();
        setTimeout(function(){s_oMain.gotoGame();},200);
        
    };
    
    this._onButChooseBlack = function(){
        s_iPlayerSelected=1;
        this.unload();
         setTimeout(function(){s_oMain.gotoGame();},200);
        
    };
	
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
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
  
    s_oSelectCharacter= this;
    
    this._init();
}

var s_oSelectCharacter = null;


