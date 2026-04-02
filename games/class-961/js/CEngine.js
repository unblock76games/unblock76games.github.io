function CEngine(oCarParent, oCarData){
    var _bStart;
    var _bSoundStop;
    var _bMaxPerGearSpeedReached;

    var _iCntFrames;
    var _iMaxFrames;
    var _iEngineState;
    var _iStartSpeed;
    var _iMeterSpeed;
    var _iCurGear;
    var _iStallSpeed;
    var _iEngineRPMAcceleration;
    var _iSoundSpeed;
    var _iFireWheelID;
    var _iNitroID;
    
    var _szSoundType;

    this._init = function(oCarParent, oCarData){
        _bStart = false;
        _bSoundStop = false;
        _bMaxPerGearSpeedReached = false;
        
        _iEngineState = STATE_ENGINE_UPDATE;
        _iEngineRPMAcceleration = 1;
        _iCntFrames = 0;
        _iStartSpeed = 1;
        _iMeterSpeed = _iStartSpeed;
        _iCurGear = GEAR_N;
        
        _szSoundType = 'gear_player';
    };
    
    this.start = function(){
        _bStart = true;
    };
    
    this.activateNitro = function(bVal){
        if(bVal){
            _iEngineRPMAcceleration = ENGINE_NITRO_RPM_ACCELERATION;
            if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                _iFireWheelID = s_aSounds['fire_wheel'].play();
                _iNitroID = s_aSounds['nitro'].play();                
            }
        } else {
            _iEngineRPMAcceleration = ENGINE_NORMAL_RPM_ACCELERATION;
            
        }
    };
    
    this.changeGear = function(){
        if(_iCurGear < oCarData.length-1){
            _iCurGear++;

            _bMaxPerGearSpeedReached = false;
        
            _iStartSpeed = _iMeterSpeed;
        
            _iCntFrames = 0;
            _iMaxFrames = milliSecondsToFrames(oCarData[_iCurGear].time);
        }
    };
    
    this.break = function(){  
        _iEngineState = STATE_ENGINE_BREAK;
        _iStartSpeed = _iMeterSpeed;
        
        _iCntFrames = 0;
        _iMaxFrames = milliSecondsToFrames(BREAK_DURATION);
    };   
    
    this.delayAcceleration = function(iTime){       
        
        _iEngineState = STATE_ENGINE_STALL;
        _iStartSpeed = _iMeterSpeed;
        
        _iCntFrames = 0;
        _iMaxFrames = milliSecondsToFrames(iTime);
       
        _iStallSpeed = _iStartSpeed;
        
    };
    
    this.stall = function(){
        if(_iCntFrames === 0 && oCarParent.getType() === 0){
            this.setStallSound();
        }
        _iCntFrames++;
        
        if ( _iCntFrames > _iMaxFrames ){
            _iStartSpeed = _iMeterSpeed;
        
            _iCntFrames = 0;
            _iMaxFrames = milliSecondsToFrames(oCarData[_iCurGear].time);
            
            _iEngineState = STATE_ENGINE_UPDATE;
            
        } else {
            var fLerpSpeed = s_oTweenController.easeInSine( _iCntFrames, 0 ,1, _iMaxFrames);
            var iValue = s_oTweenController.tweenValue(_iStartSpeed, _iStallSpeed, fLerpSpeed);
            
            _iMeterSpeed = iValue;
            
            this._setSpeed();
        }
    };
    
    this.decelerate = function(){
        _iCntFrames += _iEngineRPMAcceleration;
        
        if ( _iCntFrames > _iMaxFrames ){

        } else {
            var fLerpSpeed = s_oTweenController.easeInSine( _iCntFrames, 0 ,1, _iMaxFrames);
            var iValue = s_oTweenController.tweenValue(_iStartSpeed, 0, fLerpSpeed);
            
            _iMeterSpeed = iValue;
            
            this._setSpeed();
        }
    };
    
    this.rotate = function(){
        if(_iCntFrames === 0 && oCarParent.getType() === 0){
            this._setEngineSound();
        }
        _iCntFrames += _iEngineRPMAcceleration;
        
        if (_iCntFrames > _iMaxFrames ){
            _bMaxPerGearSpeedReached = true;
            if(!_bSoundStop && oCarParent.getType() === 0){
                this.setStallSound();
            }
        } else {
            var fLerpSpeed = s_oTweenController.easeInSine( _iCntFrames, 0 ,1, _iMaxFrames);
            var iValue = s_oTweenController.tweenValue(_iStartSpeed, oCarData[_iCurGear].speed, fLerpSpeed);
            
            _iMeterSpeed = iValue;
            
            this._setSpeed();
        }
    };
    
    this._setEngineSound = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            s_aSounds[_szSoundType].stop();
            s_aSounds['stall'].stop();

            var iEngineTime = PLAYER_ENGINE_GEAR[_iCurGear].time;

            _iSoundSpeed = 6000/iEngineTime.toFixed(1);
            if(_iSoundSpeed>4){
                _iSoundSpeed = 4;
            }
            if(_iSoundSpeed<0.5){
                _iSoundSpeed = 0.5;
            }
            s_aSounds[_szSoundType].play();
            s_aSounds[_szSoundType].rate(_iSoundSpeed);
        }
    };

    this.stopSound = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _bSoundStop = true;
            s_aSounds[_szSoundType].stop();
            s_aSounds['stall'].stop();
            s_aSounds['fire_wheel'].stop();
            s_aSounds['nitro'].stop();
        }
    };
    
    this.setStallSound = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            s_aSounds['stall'].stop();
            s_aSounds['stall'].play();
        }
    };
    
    this.stopStallSound = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            s_aSounds['stall'].stop();
        }
    };
    
    this.fadeNitroSound = function(iDuration){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            s_aSounds['fire_wheel'].fade(1,0,iDuration,_iFireWheelID);
            s_aSounds['nitro'].fade(1,0,iDuration,_iNitroID);
        }
    };
    
    this.update = function(){
        if(!_bStart){
            return;
        }
        
        switch(_iEngineState){
            
            case STATE_ENGINE_UPDATE: {
                    this.rotate();
                    break;
            }
            case STATE_ENGINE_STALL: {
                    this.stall();
                    break;
            }
            case STATE_ENGINE_BREAK: {
                    this.decelerate();
                    break;
            }
        }
    };
    
    this.getMeterSpeed = function(){
        return _iMeterSpeed;
    };
    
    this._setSpeed = function(){
        var iPixelSpeed = kMetersHToPixelsF(_iMeterSpeed);
        oCarParent.setSpeed(iPixelSpeed);
    };
    
    this.getGear = function(){
        return _iCurGear;
    };
    
    this.getMaxSpeedPerGearReached = function(){
        return _bMaxPerGearSpeedReached;
    };
    
    this._init(oCarParent, oCarData);
    
}


