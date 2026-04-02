function CHUD(oParentContainer){
    var _bStartAcceleration;
    
    var _iHUDState;
    var _iIndicatorAcc;
    var _iMinSpeedInterval;
    var _iCurGear;
    
    var _oHUD;
    var _oIndicator;
    var _oSpeedText;
    var _oRotationInterval;
    var _oGearChangeArea;
    var _oButNitro;
    var _oSpeedTextStroke;
    var _oButGear;
    var _oButAccelerator;
    
    this._init = function(oParentContainer){
        
        _iHUDState = STATE_HUD_UPDATE;
        _iMinSpeedInterval = 0;
        
        _oRotationInterval = {min: HUD_RPM_INTERVAL[0].min, max: HUD_RPM_INTERVAL[0].max};
        
        _oHUD = new createjs.Container();
        oParentContainer.addChild(_oHUD);
        
        var oSprite = s_oSpriteLibrary.getSprite('tachometer');        
        var oTachometer = createBitmap(oSprite);
        oTachometer.regX = oSprite.width/2;
        oTachometer.regY = oSprite.height/2;
        _oHUD.addChild(oTachometer);
        
        _oSpeedTextStroke = new createjs.Text("0 " + TEXT_KMH," 24px "+PRIMARY_FONT, "#749fc3");
        _oSpeedTextStroke.textAlign = "center";
        _oSpeedTextStroke.textBaseline = "alphabetic";
        _oSpeedTextStroke.lineWidth = 300;
        _oSpeedTextStroke.outline = 3;
        _oSpeedTextStroke.y = 10;
        _oHUD.addChild(_oSpeedTextStroke);
        
        _oSpeedText = new createjs.Text("0 " + TEXT_KMH," 24px "+PRIMARY_FONT, "#ffffff");
        _oSpeedText.textAlign = "center";
        _oSpeedText.textBaseline = "alphabetic";
        _oSpeedText.lineWidth = 300;
        _oSpeedText.y = 10;
        _oHUD.addChild(_oSpeedText);
        
        var iIndicatorY = 41;  
        
        _oGearChangeArea = new CGearAreaView(iIndicatorY, _oHUD);

        var oSprite = s_oSpriteLibrary.getSprite('indicator');        
        _oIndicator = createBitmap(oSprite);
        _oIndicator.regX = oSprite.width/2;
        _oIndicator.regY = 122;
        _oIndicator.y = iIndicatorY;
        _oIndicator.rotation = _oRotationInterval.min;
        _oHUD.addChild(_oIndicator);

        
        var oSprite = s_oSpriteLibrary.getSprite('but_nitro');
        var pStartPosNitro = {x: -250, y: 200};
        _oButNitro = new CGfxButton(pStartPosNitro.x, pStartPosNitro.y, oSprite, _oHUD);
        _oButNitro.addEventListener(ON_MOUSE_DOWN, this._onNitro, this);
        _oButNitro.setVisible(false);

        var oSprite = s_oSpriteLibrary.getSprite('accelerator');
        var pStartPosAccelerator = {x: 250, y: 0};
        _oButAccelerator = new CGfxButton(pStartPosAccelerator.x, pStartPosAccelerator.y, oSprite, _oHUD);
        _oButAccelerator.addEventListener(ON_MOUSE_DOWN, this.accelerate, this);
        _oButAccelerator.addEventListener(ON_MOUSE_UP, this.decelerate, this);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_gear');
        var pStartPosGear = {x: 250, y: 200};
        _oButGear = new CGearButton(pStartPosGear.x, pStartPosGear.y, oSprite, _oHUD);
        _oButGear.addEventListener(ON_MOUSE_DOWN, this._onGear, this);
        _oButGear.setVisible(false);
        
        
        
    };
    
    this.unload = function(){
        s_oHUD = null;
        oParentContainer.removeChild(_oHUD);
        
        if(_oButNitro){
            _oButNitro.unload();
        }
        if(_oButGear){
            _oButGear.unload();
        }
        if(_oButAccelerator){
            _oButAccelerator.unload();
        }
    };
    
    this.setGearArea = function(iCenter, oDataDegree){
        _oGearChangeArea.setAreas(oDataDegree);
        _oGearChangeArea.moveAreas(iCenter);
    };
    
    this.setPos = function(iX, iY){
        _oHUD.x = iX;
        _oHUD.y = iY;
    };
    
    this._refreshSpeed = function(iCurSpeed){
        var iSpeedValue = Math.round(iCurSpeed);
        _oSpeedText.text = iSpeedValue + " " + TEXT_KMH;
        _oSpeedTextStroke.text = iSpeedValue + " " + TEXT_KMH;
    };
    
    this._refreshIndicator = function(iCurSpeed, iCurGear){

        if(Math.round(iCurSpeed) === PLAYER_ENGINE_GEAR[iCurGear].speed){
            _iHUDState = STATE_HUD_STALL;
        } else {
            new createjs.Tween.removeTweens(_oIndicator);
            _oIndicator.rotation = (iCurSpeed - _iMinSpeedInterval)/(PLAYER_ENGINE_GEAR[iCurGear].speed - _iMinSpeedInterval)*(_oRotationInterval.max - _oRotationInterval.min) + _oRotationInterval.min ;
        }
    };
    
    this.updateTachometer = function(iSpeed, iCurGear){
        this._refreshSpeed(iSpeed);
        
        switch(_iHUDState){
            
            case STATE_HUD_UPDATE:{
                    this._refreshIndicator(iSpeed, iCurGear);
                    break;
            }
            case STATE_HUD_STALL:{
                    this.stallAnim();
                    break;
            }
            case STATE_HUD_REPOSITIONING:{
                    this.downShiftGear();
                    break
            }
        }
    };

    this.stallAnim = function(){
        _iHUDState = STATE_HUD_NULL;
        var iWavingAmpl = 0.5;
        new createjs.Tween.get(_oIndicator, {loop:true, override: true}).to({rotation:_oIndicator.rotation +iWavingAmpl}, 50).to({rotation:_oIndicator.rotation}, 50).to({rotation:_oIndicator.rotation -iWavingAmpl}, 50).to({rotation:_oIndicator.rotation}, 50);
    };

    this.downShiftGear = function(iGear, iNextState, iTime){
        _iHUDState = STATE_HUD_NULL;
        _oRotationInterval = {min: HUD_RPM_INTERVAL[iGear].min, max: HUD_RPM_INTERVAL[iGear].max};
        
        _iCurGear = iGear;
        
        new createjs.Tween.get(_oIndicator, {override: true}).to({rotation:_oRotationInterval.min}, HUD_DOWNSHIFT_GEAR_DURATION, createjs.Ease.cubicOut).call(function(){
            _iMinSpeedInterval = s_oGame.getPlayerMeterSpeed();
            
            _iHUDState = iNextState;
            if(iNextState === STATE_HUD_STALL){
                setTimeout(function(){
                    _iMinSpeedInterval = s_oGame.getPlayerMeterSpeed();
                    _iHUDState = STATE_HUD_UPDATE;
                }, iTime);
            }
        });
    };
    
    this.startAccelerate = function(bVal){
        _bStartAcceleration = bVal;
        _iIndicatorAcc = 0;
    };
    
    this.updateIndicatorForStartBattle = function(){
        if(_bStartAcceleration){
            _iIndicatorAcc += 0.1;
            _oIndicator.rotation += START_ACCELERATION_INDICATOR_SPEED + _iIndicatorAcc;
            
            if(_oIndicator.rotation > HUD_RPM_INTERVAL[0].max){
                _iIndicatorAcc = 0;
                new createjs.Tween.get(_oIndicator, {loop:true}).to({rotation:_oRotationInterval.max +3}, 50).to({rotation:_oRotationInterval.max}, 50).to({rotation:_oRotationInterval.max -3}, 50).to({rotation:_oRotationInterval.max}, 50);
            }
            
        } else {
            new createjs.Tween.removeTweens(_oIndicator);
            
            _iIndicatorAcc = (_oIndicator.rotation - HUD_RPM_INTERVAL[0].min)/(HUD_RPM_INTERVAL[0].max - HUD_RPM_INTERVAL[0].min)*(-START_ACCELERATION_INDICATOR_SPEED + 0.1) +START_ACCELERATION_INDICATOR_SPEED - 0.1;
            _oIndicator.rotation -= START_ACCELERATION_INDICATOR_SPEED - _iIndicatorAcc;
            if(_oIndicator.rotation < HUD_RPM_INTERVAL[0].min){
                _oIndicator.rotation = HUD_RPM_INTERVAL[0].min;
            }
        }
    };
    
    this.getIndicatorResult = function(){
        return _oGearChangeArea.getIndicatorResult(_oIndicator.rotation);
    };

    this._onNitro = function(){
        this.nitroButtonVisible(false);
        s_oGame.shotNitro();
    };
    
    this._onGear = function(){
        s_oGame.changeGear();
    };

    this.scaleGear = function(){
        _oButGear.scaleGear();
    };

    this.gearButtonVisible = function(bVal){
        if(bVal){
            _oButGear.setVisible(bVal)
            new createjs.Tween(_oButGear.getButtonImage()).to({y:-30}, 500, createjs.Ease.cubicOut);
        } else {
            _oButGear.setClickable(false);
            new createjs.Tween(_oButGear.getButtonImage()).to({y:200}, 500, createjs.Ease.cubicOut);
        }
    };

    this.accelerate = function(){
        s_oGame.startAcceleration(true);
    };
    
    this.decelerate = function(){
        s_oGame.startAcceleration(false);
    };

    this.acceleratorButtonVisible = function(bVal){
        if(!bVal){
            _oButAccelerator.setClickable(false);
            new createjs.Tween(_oButAccelerator.getButtonImage()).to({y:300}, 500, createjs.Ease.cubicOut);
        }
    };

    this.nitroButtonVisible = function(bVal){
        if(bVal){
            _oButNitro.setVisible(bVal)
            new createjs.Tween(_oButNitro.getButtonImage()).to({y:-30}, 500, createjs.Ease.cubicOut);
        } else {
            _oButNitro.setClickable(false);
            new createjs.Tween(_oButNitro.getButtonImage()).to({y:200}, 500, createjs.Ease.cubicOut);
        }
    };

    this.getContainer = function(){
        return _oHUD;
    };

    this._init(oParentContainer);
    s_oHUD = this;
}

var s_oHUD;
