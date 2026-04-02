function CInterface(iFrictionPrice,iMaxSpeedPrice){
    var _oTextNumSpin;
    var _oTextNumSwipe;
    var _oTextMoney;
    var _oAudioToggle;
    var _oButExit;
    var _oButFullscreen;
    var _oCoinIcon;
    var _oButFriction;
    var _oButMaxSpeed;
    var _oButChangeSpinner;
    var _oAreYouSurePanel;
    var _oMultiplierBar;
    var _oSpinnerPanel;
    
    var _pStartPosFriction;
    var _pStartPosMaxSpeed;
    var _pStartPosChange;
    var _pStartPosCoinIcon;
    var _pStartPosNumSpin;
    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    this._init = function(iFrictionPrice,iMaxSpeedPrice){      
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.width/2)- 10, y: (oSprite.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _pStartPosAudio = {x:_pStartPosExit.x - oSprite.width -10,y:_pStartPosExit.y }
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,s_oSpriteLibrary.getSprite('audio_icon'),s_bAudioActive,s_oStage);
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
            _pStartPosFullscreen = {x: oSprite.width/4 + 10,y:(oSprite.height/2)+10};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        } 
        
        _pStartPosNumSpin = {x:CANVAS_WIDTH/2,y:90};
        _oTextNumSpin = new createjs.Text("0"," 60px "+PRIMARY_FONT, "#ffffff");
        _oTextNumSpin.x = _pStartPosNumSpin.x;
        _oTextNumSpin.y = _pStartPosNumSpin.y;
        _oTextNumSpin.textAlign = "center";
        _oTextNumSpin.textBaseline = "alphabetic";
        s_oStage.addChild(_oTextNumSpin);
        
        var oSpriteSwipe = s_oSpriteLibrary.getSprite("swipe_icon");
        var oSwipeIcon = createBitmap(oSpriteSwipe);
        oSwipeIcon.x = CANVAS_WIDTH/2;
        oSwipeIcon.y = 910;
        oSwipeIcon.regX = oSpriteSwipe.width/2;
        s_oStage.addChild(oSwipeIcon);
        
        _oTextNumSwipe = new createjs.Text(NUM_SWIPE," 60px "+PRIMARY_FONT, "#ffffff");
        _oTextNumSwipe.x = CANVAS_WIDTH/2;
        _oTextNumSwipe.y = 880;
        _oTextNumSwipe.textAlign = "center";
        _oTextNumSwipe.textBaseline = "alphabetic";
        s_oStage.addChild(_oTextNumSwipe);
        
        var oSpriteCoin = s_oSpriteLibrary.getSprite("coin");
        _pStartPosCoinIcon = {x:65,y:CANVAS_HEIGHT - oSpriteCoin.height/2 -10};
        _oCoinIcon = createBitmap(oSpriteCoin);
        _oCoinIcon.x = _pStartPosCoinIcon.x;
        _oCoinIcon.y = _pStartPosCoinIcon.y;
        _oCoinIcon.regX = oSpriteCoin.width/2;
        _oCoinIcon.regY = oSpriteCoin.height/2;
        s_oStage.addChild(_oCoinIcon);
        
        _oTextMoney = new createjs.Text(s_iMoney," 40px "+PRIMARY_FONT, "#ffffff");
        _oTextMoney.textAlign = "left";
        _oTextMoney.textBaseline = "alphabetic";
        s_oStage.addChild(_oTextMoney);
        
        var oSpriteBut = s_oSpriteLibrary.getSprite("but_friction");
        _pStartPosFriction = {x:CANVAS_WIDTH - oSpriteBut.width/2 - 10,y:CANVAS_HEIGHT - oSpriteBut.height/2};
        _oButFriction = new CButUpgrade(_pStartPosFriction.x,_pStartPosFriction.y,iFrictionPrice,s_iUpgradeFriction,oSpriteBut,s_oStage);
        _oButFriction.addEventListener(ON_MOUSE_UP,this._onUpgradeFriction,this);

        oSpriteBut = s_oSpriteLibrary.getSprite("but_max_speed");
        _pStartPosMaxSpeed = {x:_pStartPosFriction.x - oSpriteBut.width - 10,y:CANVAS_HEIGHT - oSpriteBut.height/2};
        _oButMaxSpeed = new CButUpgrade(_pStartPosFriction.x,_pStartPosFriction.y,iMaxSpeedPrice,s_iUpgradeMaxSpeed,oSpriteBut,s_oStage);
        _oButMaxSpeed.addEventListener(ON_MOUSE_UP,this._onUpgradeMaxSpeed,this);
        
        oSpriteBut = s_oSpriteLibrary.getSprite("but_change");
        _pStartPosChange = {x:_pStartPosMaxSpeed.x - oSpriteBut.width - 10,y:CANVAS_HEIGHT - oSpriteBut.height/2};
        _oButChangeSpinner = new CGfxButton(_pStartPosChange.x,_pStartPosChange.y,oSpriteBut,s_oStage);
        _oButChangeSpinner.addEventListener(ON_MOUSE_DOWN,this._onChangeSpinner,this);
        
        
        _oMultiplierBar = new CMultiplierBar(50,400);
        
        _oAreYouSurePanel = new CAreYouSurePanel(s_oStage);
        
        this.refreshButtonPos();
    };
    
    this.unload = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.unload();
        }
        
        _oButChangeSpinner.unload();
        _oButFriction.unload();
        _oButMaxSpeed.unload();
        _oButExit.unload();
    };
    
    this.refreshButtonPos = function(){
        _oButExit.setPosition(_pStartPosExit.x - s_iOffsetX,s_iOffsetY + _pStartPosExit.y);
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }   
        if (_fRequestFullScreen && inIframe() === false){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX,_pStartPosFullscreen.y + s_iOffsetY);
        }
        
        _oButFriction.setPosition(_pStartPosFriction.x - s_iOffsetX,_pStartPosFriction.y - s_iOffsetY);
        _oButMaxSpeed.setPosition(_pStartPosMaxSpeed.x - s_iOffsetX,_pStartPosMaxSpeed.y - s_iOffsetY);
        _oButChangeSpinner.setPosition(_pStartPosChange.x - s_iOffsetX,_pStartPosChange.y - s_iOffsetY);
        
        _oMultiplierBar.refreshButtonPos();
        _oTextNumSpin.y = _pStartPosNumSpin.y + s_iOffsetY;
        
        _oCoinIcon.x = _pStartPosCoinIcon.x + s_iOffsetX;
        _oCoinIcon.y = _pStartPosCoinIcon.y - s_iOffsetY;
        _oTextMoney.x = _oCoinIcon.x + 50;
        _oTextMoney.y = _oCoinIcon.y + 20;
    };
    
    this.reset = function(){
        _oTextNumSwipe.text = 0;
        _oMultiplierBar.reset();
    };
    
    this.refreshBar = function(iScaleFactor){
        _oMultiplierBar.refreshBar(iScaleFactor);
    };
    
    this.refreshNumSpin = function(iNumSpin){
        _oTextNumSpin.text = ""+iNumSpin;
    };
    
    this.refreshNumSwipe = function(iValue){
        _oTextNumSwipe.text = iValue;
    };
    
    this.refreshMoney = function(iMoney){
        _oTextMoney.text = iMoney;
    };
    
    this.decreaseSpintCount = function(iSpinCounter,iMoneyFactor){
        this.refreshNumSpin(iSpinCounter);
        this.refreshBar(iMoneyFactor);
        
        var oCoin = new CMovingCoin({x:_oMultiplierBar.getX(),y:_oMultiplierBar.getBottomY()},{x:_oCoinIcon.x,y:_oCoinIcon.y},iSpinCounter===0?true:false,TWEEN_TYPE_0,s_oStage);
        oCoin.addEventListener(ON_COIN_ARRIVED,s_oGame.increaseMoney,s_oGame);
    };
    
    this.disableUpgrade = function(bDisableFriction,bDisableMaxSpeed){
        if(bDisableFriction){
            _oButFriction.disable();
        }else{
            _oButFriction.enable();
        }
        
        if(bDisableMaxSpeed){
            _oButMaxSpeed.disable();
        }else{
            _oButMaxSpeed.enable();
        }
    };
    
    this.disableGUI = function(){
        _oButFriction.disable();
        _oButMaxSpeed.disable();
        _oButChangeSpinner.disable();
    };
    
    this.enableChangeSpinnerBut = function(){
        _oButChangeSpinner.enable();
    };
    
    this._onUpgradeFriction = function(){
        
        s_oMain.pokiShowCommercial();
        
        var iValue = s_oGame.upgradeFriction();
        
        
        
        _oButFriction.setTextLevel(iValue+1);
        _oButFriction.setTextMoney(PRICE_FRICTION[iValue+1]);
        
        s_oLocalStorage.saveItem(LOCAL_STORAGE_FRICTION,iValue);
        
        s_oGame.checkMoneyForUpgrade();
        
        if(iValue === PRICE_FRICTION.length-1){
            _oButFriction.disable();
        }
    };
    
    this._onUpgradeMaxSpeed = function(){
        s_oMain.pokiShowCommercial();
        
        var iValue = s_oGame.upgradeMaxSpeed();
        
        _oButMaxSpeed.setTextLevel(iValue+1);
        _oButMaxSpeed.setTextMoney(PRICE_MAX_SPEED[iValue+1]);
        
        s_oLocalStorage.saveItem(LOCAL_STORAGE_MAX_SPEED,iValue);
        
        s_oGame.checkMoneyForUpgrade();

        if(iValue === PRICE_MAX_SPEED.length-1){
            _oButMaxSpeed.disable();
        }
    };
    
    this._onChangeSpinner = function(){
        s_oMain.pokiShowCommercial();
        PokiSDK.gameplayStop();
        
        _oSpinnerPanel = new CSpinnerPanel(parseInt(_oTextMoney.text));
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        s_oGame.setUpdate(false);
        
        _oAreYouSurePanel.show(TEXT_ARE_YOU_SURE);
        _oAreYouSurePanel.addEventListener(ON_RELEASE_YES,this._onReleaseYes);
        _oAreYouSurePanel.addEventListener(ON_RELEASE_NO,this._onReleaseNo);
    };
    
    this._onReleaseYes = function(){
        $(s_oMain).trigger("end_session");
        
        s_oGame.onExit();
    };
    
    this._onReleaseNo = function(){
        s_oGame.setUpdate(true);
    };

    this._onRestartRelease = function(){
        s_oGame.restart();
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

    
    s_oInterface = this;
    
    this._init(iFrictionPrice,iMaxSpeedPrice);
}

var s_oInterface = null;