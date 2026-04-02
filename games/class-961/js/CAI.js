function CAI(oControlledCar, iStage){
    var _bStartAcceleration;
    var _bNitroShot;
    
    var _iCarType;
    var _iCurGear;
    var _iPitchStartTimer;
    var _iMeterToShotNitro;    
    
    this._init = function(oControlledCar, iStage){        
        _bStartAcceleration = false;
        _bNitroShot = false;
        
        _iCarType = oControlledCar.getType();
        _iCurGear = oControlledCar.getGear();
        _iPitchStartTimer = 400 + Math.random()*500;

        var iInterval = 0.05;
        var iRandom = (SKILL[iStage].normalizednitroshottime - iInterval) +2*iInterval*Math.random();
        _iMeterToShotNitro = iRandom * STAGE_METER_LENGTH[iStage];
        if(_iMeterToShotNitro < 0){
            _iMeterToShotNitro = 0;
            
        }

    };
    
    this.update = function(iGameState, iCurStreetMeter){
        switch (iGameState){
            
            case STATE_START_BATTLE:{
                    _iPitchStartTimer -= s_iTimeElaps;
                    if(_iPitchStartTimer < 0 ){
                        _iPitchStartTimer = 400 + Math.random()*500;
                        oControlledCar.pitchStartAnim();
                    }
                    break;
            }
            case STATE_RACE_RUN:{
                    
                    if(iCurStreetMeter > _iMeterToShotNitro && !_bNitroShot){     
                        _bNitroShot = true;
                        oControlledCar.activateNitro(SKILL[iStage].nitroduration);
                    }
                    
                    if(oControlledCar.getMaxSpeedPerGearReached() && _iCurGear < OPPONENT_ENGINE_GEAR[iStage].length - 1){
                        oControlledCar.changeGear();
                        _iCurGear = oControlledCar.getGear();
                        
                        if(Math.random()<SKILL[iStage].wronggearchangeratio){
                            oControlledCar.delayEngine(SKILL[iStage].wrongearduration);
                        }

                    }
                    
                    break;
            }
        }    
            
    };
    
    this._init(oControlledCar, iStage);
}


