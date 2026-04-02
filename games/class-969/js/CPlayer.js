function CPlayer(iX, iY, oParentContainer, oWaterContainer){
    var _bKeyLeft;
    var _bKeyRight;
    var _bKeyAccelerate;
    var _bKeyBrake;
    var _bOutOfRoad;
    var _bDamageAnim;

    var _iCurPositionZ;
    var _iCurPositionX;
    var _iCurPositionY;
    var _iCurSpeed;
    var _iMaxSpeed;
    var _iAccelerationRate;     // acceleration rate - tuned until it 'felt' right
    var _iBrakingRate;         // deceleration rate when braking
    var _iDecelerationRate;     // 'natural' deceleration rate when neither accelerating, nor braking
    var _iOffRoadDecel;             // off road deceleration is somewhere in between
    var _iOffRoadLimit;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
    var _iPlayerWidth;
    var _iXInertia;
    var _iSpeedRatio;
    
    var _oFoam;
    var _oPlayerContainer;
    var _oWatercraftContainer;
    var _oPlayer;
    var _oPlayerSegment;
    var _oDamageSprite;
    var _oOscillatory;
    
    
    var _bJump;
    var _iStartJumpHeight;
    var _iCurJumpFrame;
    var _oLastKeyPressedInAir;
    
    this._init = function(iX, iY, oParentContainer, oWaterContainer){
        
        this.reset();
        
        _iMaxSpeed = PLAYER_MAX_SPEED;
        _iAccelerationRate = PLAYER_ACCELERATION;
        
        _iBrakingRate = -_iMaxSpeed;
        _iDecelerationRate = -PLAYER_DECELERATION;

        _iOffRoadDecel  = -_iMaxSpeed/2;
        _iOffRoadLimit  =  _iMaxSpeed/4;
        
        _oFoam = new CFoamParticle();
        _oFoam.addBottom(iX, iY-60, oWaterContainer);
        _oFoam.setBottomAlpha(linearFunction(0, 0,1, 0, 1));
        

        _oPlayerContainer = new createjs.Container();
        _oPlayerContainer.x = iX;
        _oPlayerContainer.y = iY;
        //_oPlayerContainer.scaleX = _oPlayerContainer.scaleY = 0.75;
        oParentContainer.addChild(_oPlayerContainer);
        
        
        var oSprite = s_oSpriteLibrary.getSprite('baloon_mc');
        _oDamageSprite = createBitmap(oSprite);
        _oDamageSprite.regX = oSprite.width/2;
        _oDamageSprite.regY = oSprite.height/2;
        _oDamageSprite.y = -260;
        _oDamageSprite.alpha = 0;
        _oPlayerContainer.addChild(_oDamageSprite);
        
        _oWatercraftContainer = new createjs.Container();
        _oPlayerContainer.addChild(_oWatercraftContainer);
        
        var oSprite = s_oSpriteLibrary.getSprite('player');
        var iWidth = oSprite.width/3;
        var iHeight = oSprite.height;
        var oData = {   
                        images: [oSprite],
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight}, 
                        animations: {left:[0],right:[1], straight:[2]}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oPlayer = createSprite(oSpriteSheet, "straight",iWidth/2,iHeight,iWidth,iHeight);
        _oWatercraftContainer.addChild(_oPlayer);

        _oFoam.addBack(0, -6, _oWatercraftContainer);
        _oFoam.setSpeed(linearFunction(0, 0,1, 2, FPS));
        _oFoam.setBackAlpha(linearFunction(0, 0, 0.2, 0, 1));
        
        
        _iPlayerWidth = PLAYER_COLLIDER_WIDTH;

        
        this.oscillatoryAnim();

    };

    this.oscillatoryAnim = function(){

        var iShift = linearFunction(_iCurSpeed/_iMaxSpeed, 0,1, 8, 4);
        var iTime = 2000;
        var iDeg = linearFunction(_iCurSpeed/_iMaxSpeed, 0,1, 2,0.2);
        var iRandomRot = -iDeg + Math.random()*iDeg;
        var oParent = this;
        _oOscillatory = createjs.Tween.get(_oWatercraftContainer).to({y:iShift, rotation: iRandomRot}, iTime).to({y:0, rotation:0}, iTime).call(function(){
            oParent.oscillatoryAnim();
        });
    };

    this.reset = function(){
        _bKeyLeft = false;
        _bKeyRight = false;
        _bKeyAccelerate = false;
        _bKeyBrake = false;
        _bDamageAnim = false;
        _bJump = false;
        
        _bOutOfRoad = false;  
        
        _iCurPositionZ = 0;
        _iCurPositionX = 0;
        _iCurPositionY = 0;
        _iCurSpeed = 0;
        _iXInertia = 0;
        _iStartJumpHeight = 0;
        _iCurJumpFrame = 0;
        _iSpeedRatio = 0;
        
        _oPlayerSegment = s_oGame.findSegment(_iCurPositionZ + PLAYER_Z_FROMCAMERA);
    };

    this.setAcceleration = function(iVal){
        _iAccelerationRate = iVal;
    };
    
    this.setMaxSpeed = function(iVal){
        _iMaxSpeed = iVal;

        _iBrakingRate = -_iMaxSpeed;
        _iDecelerationRate = -PLAYER_DECELERATION;

        _iOffRoadDecel  = -_iMaxSpeed/2;
        _iOffRoadLimit  =  _iMaxSpeed/4;
    };
    
    this.stopAll = function(){
        this.stopLeft();
        this.stopRight();
        this.stopAccelerate();
    };
    
    this.stopLeft = function(){
        if(!_bKeyLeft){
            return;
        }
        _bKeyLeft = false;
        _oPlayer.gotoAndStop("straight");
        stopSound(s_aSounds["brake"]);
    };
    
    this.stopRight = function(){
        if(!_bKeyRight){
            return;
        }
        _bKeyRight = false;
        _oPlayer.gotoAndStop("straight");
        stopSound(s_aSounds["brake"]);
    };
    
    this.stopAccelerate = function(){
        _bKeyAccelerate = false;
        stopSound(s_aSounds["engine"]);
        stopSound(s_aSounds["engine_stall"]);
    };
    
    this.stopBrake = function(){
        _bKeyBrake = false;
    };
    
    this.moveLeft = function(){
        if(_iCurSpeed === 0){
            return;
        }
        if(!soundPlaying(s_aSounds["brake"])){
            playSound("brake", 0.5, false);
        }
        _bKeyRight = false;
        _bKeyLeft = true;
        _oPlayer.gotoAndStop("left");
    };
    
    this.moveRight = function(){
        if(_iCurSpeed === 0){
            return;
        }
        if(!soundPlaying(s_aSounds["brake"])){
            playSound("brake", 0.5, false);
        }
        _bKeyLeft = false;
        _bKeyRight = true;
        _oPlayer.gotoAndStop("right");
    };
    
    this.moveAccelerate = function(){
        _bKeyBrake = false;
        _bKeyAccelerate = true;
    };
    
    this.moveBrake = function(){
        _bKeyAccelerate = false;
        _bKeyBrake = true;
    };
    
    this._increase = function(start, increment, max) { // with looping
        var result = start + increment;
        while (result >= max){
            result -= max;
            s_oGame.trackCompleted();
        }
          
        while (result < 0){
            result += max;
        }
          
        return result;
    };
    
    this._accelerate = function(v, accel, dt){ 
        return v + (accel * dt);                                       
    };
    
    this._limit = function(value, min, max){
        return Math.max(min, Math.min(value, max));
    };
    
    this.getPlayerWidth = function(){
        return _iPlayerWidth;
    };
    
    this.getPosition = function(){
        return {x: _iCurPositionX, z:_iCurPositionZ, y: _iCurPositionY};
    };
    
    this.getSpeedRatio = function(){
        return _iSpeedRatio;
    };
    
    this.setPosition = function(iValue){
        _iCurPositionZ = iValue;
    };
    
    this.setHeight = function(iValue){
        _iCurPositionY = iValue;
    };
    
    this.autoPilot = function(){
        if(_iCurPositionX > 0.5){
            _bKeyRight = false;
            _bKeyLeft = true;
        } else if(_iCurPositionX < -0.5){
            _bKeyRight = true;
            _bKeyLeft = false;
        } else if(_iCurPositionX <= 0.1 && _iCurPositionX >= -0.1){
            _bKeyLeft = false;
            _bKeyRight = false;
        }
    };
    
    this.getMaxSpeed = function(){
        return _iMaxSpeed;
    };
    
    this.getCurSpeed = function(){
        return _iCurSpeed;
    };
    
    this.setCurSpeed = function(iValue){
        _iCurSpeed = iValue;
    };
    
    this.getPlayerSegment = function(){
        return _oPlayerSegment;
    };
    
    this.getFrontPlayerSegment = function(){
        return s_oGame.findSegment(_iCurPositionZ+SEGMENT_LENGTH + PLAYER_Z_FROMCAMERA);
    };
    
    this.stopEngineSound = function(){
        stopSound(s_aSounds["engine"]);
        stopSound(s_aSounds["engine_stall"]);
    };
    
    this.damageAnim = function(){
        if(_bDamageAnim){
            return;
        };
        _bDamageAnim = true;
        playSound("crash", 1, false);
        createjs.Tween.get(_oDamageSprite, {override:true}).to({alpha:1}, 250, createjs.Ease.cubicOut).to({alpha:0}, 250, createjs.Ease.cubicIn).call(function(){
            _bDamageAnim = false;
        });
    };
    
    this.isOutOfRoad = function(){
        return _bOutOfRoad;
    };
    
    this.isJumping = function(){
        return _bJump;
    };
    
    this._landAnimation = function(iJumpStrength){
        playSound("landing", 1, false);
        
        var iStart = _oPlayerContainer.y;
        var iDepth = linearFunction(iJumpStrength, 0, 1, 20, 50);//20 min, 50 max;
        var iRandAnim = Math.random();
        if(iRandAnim < 0.5){
            createjs.Tween.get(_oPlayerContainer).to({y:iStart + iDepth}, 200, createjs.Ease.cubicOut)
                .to({y:iStart - iDepth*2/3 }, 150, createjs.Ease.sineIn)
                .to({y:iStart + iDepth/3}, 150, createjs.Ease.sineOut)
                .to({y:iStart}, 300, createjs.Ease.sineIn);
        }else {
            createjs.Tween.get(_oPlayerContainer).to({y:iStart + iDepth}, 200, createjs.Ease.cubicOut)
                .to({y:iStart - iDepth*3/4 }, 150, createjs.Ease.sineIn)
                .to({y:iStart + iDepth*2/4}, 150, createjs.Ease.sineOut)
                .to({y:iStart - iDepth*1/4}, 150, createjs.Ease.sineIn)
                .to({y:iStart}, 300, createjs.Ease.sineOut);
        }
    };

    this._updateXMovement = function(dx){
        var iCurveCentrifugalForce;
        iCurveCentrifugalForce = (dx * _iSpeedRatio * _iSpeedRatio * _oPlayerSegment.curve * CENTRIFUGAL_FORCE)/TERRAIN_ADHERENCE;


        if (_bKeyLeft){
            _iXInertia -= TERRAIN_INCREASE_INERTIA*_iSpeedRatio;
            if(_iXInertia<-TERRAIN_MAX_INERTIA){
                _iXInertia = -TERRAIN_MAX_INERTIA;
            }
            _oFoam.setBackRotation(-2);
            _iCurPositionX = _iCurPositionX - iCurveCentrifugalForce - dx;
            
            s_oGame.rotateScreen(ROTATE_LEFT);
        }else if (_bKeyRight){
            _iXInertia += TERRAIN_INCREASE_INERTIA*_iSpeedRatio;
            if(_iXInertia>TERRAIN_MAX_INERTIA){
                _iXInertia = TERRAIN_MAX_INERTIA;
            }
            _oFoam.setBackRotation(2);
            _iCurPositionX = _iCurPositionX - iCurveCentrifugalForce + dx;
            
            s_oGame.rotateScreen(ROTATE_RIGHT);
        } else {           
            _oFoam.setBackRotation(0);
            _iCurPositionX = _iCurPositionX - iCurveCentrifugalForce + _iXInertia;
            
            s_oGame.rotateScreen(ROTATE_CENTER);
        }

        if(_iXInertia>0){
            _iXInertia-= TERRAIN_DECREASE_INERTIA;
            if(_iXInertia < 0){
                _iXInertia = 0;
            }
        }else if(_iXInertia<0){
            _iXInertia+= TERRAIN_DECREASE_INERTIA;
            if(_iXInertia > 0){
                _iXInertia = 0;
            }
        }
    };
    
    this._updateXInAir = function(dx){
        var iCurveCentrifugalForce;
        iCurveCentrifugalForce = (dx * _iSpeedRatio * _iSpeedRatio * _oPlayerSegment.curve * CENTRIFUGAL_FORCE)/TERRAIN_ADHERENCE;


        if (_oLastKeyPressedInAir.left){
            _iXInertia -= TERRAIN_INCREASE_INERTIA*_iSpeedRatio;
            if(_iXInertia<-TERRAIN_MAX_INERTIA){
                _iXInertia = -TERRAIN_MAX_INERTIA;
            }

            _iCurPositionX = _iCurPositionX - iCurveCentrifugalForce - dx;
        }else if (_oLastKeyPressedInAir.right){
            _iXInertia += TERRAIN_INCREASE_INERTIA*_iSpeedRatio;
            if(_iXInertia>TERRAIN_MAX_INERTIA){
                _iXInertia = TERRAIN_MAX_INERTIA;
            }

            _iCurPositionX = _iCurPositionX - iCurveCentrifugalForce + dx;
        } else {           

            _iCurPositionX = _iCurPositionX - iCurveCentrifugalForce + _iXInertia;
        }

        if(_iXInertia>0){
            _iXInertia-= TERRAIN_DECREASE_INERTIA;
            if(_iXInertia < 0){
                _iXInertia = 0;
            }
        }else if(_iXInertia<0){
            _iXInertia+= TERRAIN_DECREASE_INERTIA;
            if(_iXInertia > 0){
                _iXInertia = 0;
            }
        }
    };
    
    this._updateJump = function(){
        _oPlayerSegment = s_oGame.findSegment(_iCurPositionZ + PLAYER_Z_FROMCAMERA);
        
        if(_oPlayerSegment.p1.world.y > _oPlayerSegment.p2.world.y  && _iSpeedRatio > 0.6){
            //trace("FALLING PHASE");
            if(!_bJump){
                _iCurJumpFrame = 0;
                var iPlayerPercent = Util.percentRemaining(_iCurPositionZ+PLAYER_Z_FROMCAMERA, SEGMENT_LENGTH);
                _iStartJumpHeight = Util.interpolate(_oPlayerSegment.p1.world.y, _oPlayerSegment.p2.world.y, iPlayerPercent);
                _oLastKeyPressedInAir = {right: _bKeyRight, left:_bKeyLeft};
            }
            _bJump = true;
        }

        if(_bJump){
            _oFoam.setBottomVisible(false);
            var iJumpStrength = linearFunction(_iStartJumpHeight, 0, MAX_TIDE_HEIGHT, 0, 1);
            iJumpStrength *= _iSpeedRatio;
            
            var iFrameDuration = Math.floor( linearFunction(iJumpStrength, 0, 1, 10, 25) );//10 min, 25 max;
            _iCurPositionY = _iStartJumpHeight - easeInBack(_iCurJumpFrame, 0, _iStartJumpHeight, iFrameDuration);
            _iCurJumpFrame++;

            if(_iCurJumpFrame >= iFrameDuration){
                _iCurJumpFrame = 0;
                _iCurPositionY = 0;
                _bJump = false;
                _oLastKeyPressedInAir = {right: false, left: false};
                _oFoam.setBottomVisible(true);
                this._landAnimation(iJumpStrength);
            }
        }else {
            var iPlayerPercent = Util.percentRemaining(_iCurPositionZ+PLAYER_Z_FROMCAMERA, SEGMENT_LENGTH);
            _iCurPositionY       = Util.interpolate(_oPlayerSegment.p1.world.y, _oPlayerSegment.p2.world.y, iPlayerPercent);
        }
        
        
        
    };
    
    this.update = function(dt){
        _iSpeedRatio = _iCurSpeed/_iMaxSpeed;
        _iCurPositionZ = this._increase(_iCurPositionZ, dt * _iCurSpeed, TRACK_LENGTH);
        var dx = dt * 2*TERRAIN_ADHERENCE * _iSpeedRatio; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second

        _oFoam.setSpeed(linearFunction(_iSpeedRatio, 0,1, 2, FPS));
        
        _oFoam.setBottomAlpha(linearFunction(_iSpeedRatio, 0,0.2, 0, 1));
        _oFoam.setBackAlpha(linearFunction(_iSpeedRatio, 0,0.2, 1, 1));
       
        var iScale = linearFunction(_iSpeedRatio, 0,0.1, 0, 1);
        if(iScale > 1.3){
            iScale = 1.3;
        }
       
        _oFoam.setBackScale(iScale);

        ///////////////// JUMPING SYSTEM
        this._updateJump();
        ////////////////////////////////////       

        if(_bJump){
            this._updateXInAir(dx);
            _oOscillatory.timeScale = 0;
        }else {
            this._updateXMovement(dx);
            _oOscillatory.timeScale = linearFunction(_iSpeedRatio, 0,1, 1, 10);
        }
        


        if (_bKeyAccelerate){
          _iCurSpeed = this._accelerate(_iCurSpeed, _iAccelerationRate, dt);
     
            if(_iSpeedRatio === 1){
                if(!soundPlaying(s_aSounds["engine_stall"])){
                    stopSound(s_aSounds["engine"]);
                    stopSound(s_aSounds["engine_reverse"]);
                    playSound("engine_stall", 0.7, true);
                }
            } else {
                if(_iCurSpeed>0 && !soundPlaying(s_aSounds["engine"]) && !s_oGame.playerCollide()){
                    stopSound(s_aSounds["brake"]);
                    stopSound(s_aSounds["engine_stall"]);
                    stopSound(s_aSounds["engine_reverse"]);
                    playSound("engine", 0.7, false);
                    var iStartAudio = linearFunction(_iSpeedRatio, 0,1,0,soundDuration(s_aSounds["engine"]));
                    
                    soundSeek(s_aSounds["engine"], iStartAudio);
                }
            }
     
            
        
        }else if (_bKeyBrake) {
          _iCurSpeed = this._accelerate(_iCurSpeed, _iBrakingRate, dt);
          
            if(_iCurSpeed > 0){
                stopSound(s_aSounds["engine"]);
                stopSound(s_aSounds["engine_stall"]);
                stopSound(s_aSounds["engine_reverse"]);
                if(!soundPlaying(s_aSounds["brake"])){
                    playSound("brake", 0.5, false);
                }
            }
      
        }else{
          _iCurSpeed = this._accelerate(_iCurSpeed, _iDecelerationRate, dt);
          
          if(_iCurSpeed > 0 && !soundPlaying(s_aSounds["engine_reverse"])){
                stopSound(s_aSounds["brake"]);
                stopSound(s_aSounds["engine_stall"]);
                stopSound(s_aSounds["engine"]);
                playSound("engine_reverse", 0.7, false);
                var iStartAudio = linearFunction(_iSpeedRatio, 0,1,soundDuration(s_aSounds["engine_reverse"]),0);

                soundSeek(s_aSounds["engine_reverse"], iStartAudio);
            }
          
        }
        _bOutOfRoad = false;  
        if ( (_iCurPositionX < -1) || (_iCurPositionX > 1) ){
            if(_iCurSpeed > _iOffRoadLimit){
                _iCurSpeed = this._accelerate(_iCurSpeed, _iOffRoadDecel, dt);
            }
            
            _bOutOfRoad = true;
            
        }
          

        _iCurPositionX = this._limit(_iCurPositionX, -ROAD_BOUNDS, ROAD_BOUNDS);     // dont ever let player go too far out of bounds
        _iCurSpeed   = this._limit(_iCurSpeed, 0, _iMaxSpeed); // or exceed _iMaxSpeed
    };
    
    this._init(iX, iY, oParentContainer, oWaterContainer);
}


