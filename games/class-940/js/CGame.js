function CGame(){
    var _bCalculatingMoney;
    var _bMoving;
    var _bAvoidCheck;
    var _bApplyMultiplier;
    var _bUpdate;
    var _iSpinnerIndex;
    var _iSpeed;
    var _iSpinCounter;
    var _iDragDeg;
    var _iDragAngle;
    var _iPrevAngle;
    var _iRotateDeg;
    var _iPrevTime;
    var _iDegDiff;
    var _iRotAngle;
    var _iMoneyAmount;
    var _iTmpMoney;
    var _iMoneyFactor;
    var _iCurMultiplier;
    var _iNumSwipe;
    var _iTimeElaps;
    var _iCurFrictionIndex;
    var _iCurMaxSpeedIndex;
    var _iAdCounter;
    var _aMoveSpeeds;
    var _aListeners;
    var _pMouseCoord;
    
    var _oHitArea;
    var _oSpinner;
    var _oInterface;
    var _oParent;
    var _oHammer;

    this._init = function(){   
        _iSpinnerIndex = s_iLastSelected;

        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg);
        
        _oSpinner = new CSpinner(CANVAS_WIDTH/2 ,CANVAS_HEIGHT/2 - 100,_iSpinnerIndex,s_oStage);
        
        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        s_oStage.addChild(_oHitArea);

        PokiSDK.gameplayStart();
        this.reset();
        
        _oInterface = new CInterface(PRICE_FRICTION[_iCurFrictionIndex+1],PRICE_MAX_SPEED[_iCurMaxSpeedIndex+1]);   

        this._enableListeners();
        this.checkMoneyForUpgrade();
    };
    
    this.unload = function(){
        _oInterface.unload();
        
        stopSound("spinner_noise");
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();

        s_oGame = null;
    };

    this.reset = function(){
        _iAdCounter = 0;
        _bMoving = false;
        _bCalculatingMoney = false;
        _bApplyMultiplier = false;
        _iSpeed = 0;
        _iDragDeg = 0;
        _iRotateDeg = 0;
        _iDragAngle = 0;
        _iPrevAngle = 0;
        _iPrevTime = 0;
        _iRotAngle = 0;
        _iSpinCounter = 0;
        _iMoneyAmount = s_iMoney;
        _iTimeElaps = 0;
        _iCurFrictionIndex = s_iUpgradeFriction;
        _iCurMaxSpeedIndex = s_iUpgradeMaxSpeed;
        _iCurMultiplier = s_iMultiplier;

        _iNumSwipe = NUM_SWIPE;
        _iMoneyFactor = STARTING_MONEY_FACTOR_INCREASE - (STEP_MONEY_FACTOR*(_iCurMultiplier-1));
        _iMoneyFactor = parseFloat(_iMoneyFactor.toFixed(4));

        _aMoveSpeeds = [];

        setVolume("soundtrack",0.3);
        
        _bUpdate = true;
    };

    this._enableListeners = function(){
        _aListeners = new Array();
        _aListeners[0] = _oHitArea.on("mousedown",function(evt){s_oGame.takeSpinner(evt);});
        //_aListeners[1] = _oHitArea.on("touchstart",function(evt){s_oGame.takeSpinner(evt);});
        _aListeners[2] = _oHitArea.on("pressmove",function(evt){s_oGame.flipSpinner(evt);}); 
        _aListeners[3] = _oHitArea.on("click",function(evt){s_oGame.leaveFingers(evt);});
    };
    
    this._disableListeners = function(){
        _oHitArea.off("mousedown",_aListeners[0]);
        _oHitArea.off("touchstart",_aListeners[1]);
        _oHitArea.off("pressmove",_aListeners[2]); 
        _oHitArea.off("click",_aListeners[3]);
    };

    this.takeSpinner = function(evt){
        _oInterface.disableGUI();

        evt = evt || window.event;

        var iX = evt.stageX/s_iScaleFactor;
        var iY = evt.stageY/s_iScaleFactor;
        
        _pMouseCoord = {x:iX,y:iY};
        
        _bMoving = true;

        _aMoveSpeeds = [];
        _iDragDeg = _iRotateDeg;
        _iDragAngle = Math.atan2(iY- CANVAS_HEIGHT/2,iX - CANVAS_WIDTH/2);
        _iPrevAngle = _iDragAngle;
        _iPrevTime = Date.now();
        _bAvoidCheck = true;

    };

    this.flipSpinner = function(evt){
        _bAvoidCheck = false;
        
        evt = evt || window.event;

        var iX = evt.stageX/s_iScaleFactor;
        var iY = evt.stageY/s_iScaleFactor;

        if(!_bMoving || (_pMouseCoord.x === iX && _pMouseCoord.y === iY)) { 
            _bAvoidCheck = true;
            return false; 
        }
        
        var iNewAngle = Math.atan2(iY- (CANVAS_HEIGHT)/2,iX-(CANVAS_WIDTH)/2);
        _iDegDiff = (iNewAngle-_iDragAngle)/Math.PI*180;
        var iTimeDiff = Date.now()-_iPrevTime;
        _iPrevTime = Date.now();
        
        var iValue = 0;
        if(iNewAngle !== _iPrevAngle){
            iValue = ((iNewAngle-_iPrevAngle)/Math.PI*180)/iTimeDiff*20;
        }

        _aMoveSpeeds.push(iValue);
        _iPrevAngle = iNewAngle;

        if(_aMoveSpeeds.length > 3){
            _aMoveSpeeds.shift();
        }
        
        if(_iSpeed === 0){
            _iRotateDeg = _iDragDeg+_iDegDiff;
        }

    };
    
    this.leaveFingers = function(e){
        if(!_bMoving || _bAvoidCheck) { 
            return; 
        }

        if(_aMoveSpeeds.length > 0){ 
             
            var iNewSpeed = _aMoveSpeeds.reduce(function(a,b){ 
                                return Math.abs(a)>Math.abs(b)?a:b; 
                            }, 0); 
            
           
            if(Math.abs(iNewSpeed) < _iSpeed){
                return;
            }else{
                _iSpeed = iNewSpeed;
            }
            
            if(Math.abs(_iSpeed) > MAX_SPEED_UPGRADE[_iCurMaxSpeedIndex]){
                _iSpeed = MAX_SPEED_UPGRADE[_iCurMaxSpeedIndex];
            }
            
        }  
        
        _iNumSwipe--;
        _oInterface.refreshNumSwipe(_iNumSwipe);
        if(_iNumSwipe === 0){
            //DISABLE HIT AREAS
            this._disableListeners();
        }    
        
        playSound("spinner_noise",0.1,false);
    };
    
    this._calculateMoneyAmount = function(){ 
        _bMoving = false;
        this._disableListeners();
        
        _iTmpMoney = _iMoneyAmount;

        _iMoneyAmount += _iSpinCounter*_iCurMultiplier;
        
        _bCalculatingMoney = true;
        s_oLocalStorage.saveItem(LOCAL_STORAGE_MONEY,_iMoneyAmount);
        
        _iAdCounter++;
    };
    
    this.stopCalculatingMoney = function(){
         
        _oInterface.reset();

        if(_bApplyMultiplier){
            _iCurMultiplier++;
            if(_iCurMultiplier > MAX_MULTIPLIER){
                _iCurMultiplier = MAX_MULTIPLIER;
            }else{
                _iMoneyFactor -= STEP_MONEY_FACTOR;
            }
            _bApplyMultiplier = false;
        }
        _iNumSwipe = NUM_SWIPE;
        _oInterface.refreshNumSwipe(_iNumSwipe);
        
        this.checkMoneyForUpgrade();
        this._enableListeners();
        
        $(s_oMain).trigger("save_score",_iMoneyAmount);
        if(_iAdCounter === NUM_SPINS_FOR_ADS){
            _iAdCounter = 0;
            $(s_oMain).trigger("show_interlevel_ad");
        }
    };
    
    this.decreaseSpinCount = function(){
        _iSpinCounter--;
        _oInterface.decreaseSpintCount(_iSpinCounter,-_iMoneyFactor);
        
        
        if(_iSpinCounter === 0){
           _bCalculatingMoney = false;
        }
    };

    this.applyNextMultiplier = function(){
        PokiSDK.happyTime(1);
        
        _bApplyMultiplier = true;
        s_oLocalStorage.saveItem(LOCAL_STORAGE_MULTIPLIER,_iCurMultiplier+1);
    };
    
    this._increaseSpinCount = function(){
        _iSpinCounter++;
        _oInterface.refreshNumSpin(_iSpinCounter);
        _oInterface.refreshBar(_iMoneyFactor);
    };
    
    this.increaseMoney = function(bLast){
        _iTmpMoney += 1*_iCurMultiplier;
        _oInterface.refreshMoney(_iTmpMoney);

        if(bLast){
           this.stopCalculatingMoney();
        }
    };
    
    this.checkMoneyForUpgrade = function(){
        var bDisableFriction = false;
        var bDisableMaxSpeed = false;
                
        if(_iMoneyAmount < PRICE_FRICTION[_iCurFrictionIndex+1] || _iCurFrictionIndex >= PRICE_FRICTION.length-1){
            bDisableFriction = true;
        }

        if(_iMoneyAmount < PRICE_MAX_SPEED[_iCurMaxSpeedIndex+1]  || _iCurMaxSpeedIndex >= PRICE_MAX_SPEED.length-1 ){
            bDisableMaxSpeed = true;
        }

        _oInterface.disableUpgrade(bDisableFriction,bDisableMaxSpeed);
        _oInterface.enableChangeSpinnerBut();
    };
    
    this.onExit = function(){
        this.unload();
        
        s_oMain.pokiShowCommercial();
        
        $(s_oMain).trigger("share_event",_iMoneyAmount);
        s_oMain.gotoMenu();
    };
    
    this.upgradeFriction = function(){
        _iCurFrictionIndex++;
        _iMoneyAmount -= PRICE_FRICTION[_iCurFrictionIndex];
        _oInterface.refreshMoney(_iMoneyAmount);
        
        s_oLocalStorage.saveItem(LOCAL_STORAGE_MONEY,_iMoneyAmount);
        
        return _iCurFrictionIndex;
    };
    
    this.upgradeMaxSpeed = function(){
        _iCurMaxSpeedIndex++;
        _iMoneyAmount -= PRICE_MAX_SPEED[_iCurMaxSpeedIndex];
        _oInterface.refreshMoney(_iMoneyAmount);
        
        s_oLocalStorage.saveItem(LOCAL_STORAGE_MONEY,_iMoneyAmount);

        return _iCurMaxSpeedIndex;
    };
    
    this.changeSpinner = function(iIndex,bAvailable){
        _iSpinnerIndex = iIndex;
        
        s_oLocalStorage.saveItem(LOCAL_STORAGE_SELECTED,_iSpinnerIndex);
        
        _oSpinner.changeSkin(iIndex);
        
        if(!bAvailable){
            _iMoneyAmount -= PRICE_SPINNER[iIndex];
            _oInterface.refreshMoney(_iMoneyAmount);

            s_oLocalStorage.saveItem(LOCAL_STORAGE_MONEY,_iMoneyAmount);
        }
        
    };
    
    this.setUpdate = function(bUpdate){
        _bUpdate = bUpdate;
        if(_bUpdate){
            PokiSDK.gameplayStart();
        }else {
            PokiSDK.gameplayStop();
        }
    };
    
    this._updateSpeed = function(){
        _iRotateDeg += _iSpeed;
        _iSpeed *= FRICTION_UPGRADE[_iCurFrictionIndex];
        
        if(_iSpeed > 0) { 
            _iSpeed=Math.max(0, _iSpeed - SLOW_COEFF);
            if(_iRotateDeg > 360) { 
                    _iRotateDeg -= 360; 
                    this._increaseSpinCount(); 
            } 
        }
        
        if(_iSpeed < 0) { 
            _iSpeed=Math.min(0, _iSpeed + SLOW_COEFF);
            if(_iRotateDeg < -360) { 
                    _iRotateDeg+=360; 
                    this._increaseSpinCount();
            } 
        }
        
        _iRotAngle = _iRotateDeg;
    };
    
    this.update = function(){
        if(!_bUpdate){
            return;
        }
        
        _oSpinner.rotate(_iRotAngle);
        this._updateSpeed();
        
        
        if(Math.abs(_iSpeed) < 1 && _bMoving){
            if(Math.abs(_iSpeed) > 0 && Math.abs(_iSpeed) < 0.06 ){
                //COLLECT MONEY
                this._calculateMoneyAmount();
            }
        }else if(_bMoving){
            var iVolume = (100*_iSpeed)/MAX_SPEED_UPGRADE[_iCurMaxSpeedIndex];
            iVolume /= 100;
            iVolume = parseFloat(iVolume.toFixed(2));
            setVolume("spinner_noise",iVolume)
        }
        
        if(_bCalculatingMoney){
            if(_iSpinCounter > 0){
                _iTimeElaps += s_iTimeElaps;
                if(_iTimeElaps > TIME_BAR_MONEY_TWEEN){
                    _iTimeElaps = 0;
                    s_oGame.decreaseSpinCount();
                }
            }else{
                _bCalculatingMoney = false;
                this.stopCalculatingMoney();
            }
             
        }
        
        if(s_oSpinnerPanel !== null){
            s_oSpinnerPanel.update();
        }
    };

    s_oGame=this;

    
    _oParent=this;
    this._init();
}

var s_oGame;
