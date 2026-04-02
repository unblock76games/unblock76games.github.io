function CGame(oData, iLevel){
    var _bStartGame;
    var _bDamaged;
    var _bCollision;
    
    var _iStartCountDown;
    var _iTimeElaps;
    var _iLevel;
    var _iScore;    
    var _iGameState;
    var _oPrevSegment;
    var _iCurRotationScreenDir;
    var _iCurFrameRotation;
    var _iCurRotation;

    var _aSegments;

    var _oGameContainer;
    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    var _oPlayer;
    var _oRoad;
    var _oWaterContainer;
    var _oSubwaterLevel;
    var _oRoadDrawingLevel;
    var _oElementContainer;
    var _oHorizon;
                        
    var _aCars;
    
    var _bPokiStart;
    
    this._init = function(iLevel){
        _bPokiStart = false;

        _iLevel = iLevel;

        _aSegments = new Array();

        _oGameContainer = new createjs.Container();
        _oGameContainer.x = CANVAS_WIDTH/2;
        _oGameContainer.y = CANVAS_HEIGHT/2;
        _oGameContainer.regX = CANVAS_WIDTH/2;
        _oGameContainer.regY = CANVAS_HEIGHT/2;

        s_oStage.addChild(_oGameContainer);

        _oHorizon = new CHorizon(_iLevel, _oGameContainer);

        _oSubwaterLevel = new createjs.Shape();
        _oGameContainer.addChild(_oSubwaterLevel);
        
        _oRoadDrawingLevel = new createjs.Shape();
        _oRoadDrawingLevel.alpha = 0.75;
        _oGameContainer.addChild(_oRoadDrawingLevel);
       
        var iWorld = Math.floor(_iLevel/NUM_WORLDS);
        var oSprite = s_oSpriteLibrary.getSprite("fog_"+iWorld);
        var oFog = createBitmap(oSprite);
        oFog.x = 0;
        oFog.y = CANVAS_HEIGHT/2;
        _oGameContainer.addChild(oFog);
        
        _oWaterContainer = new createjs.Container();
        _oGameContainer.addChild(_oWaterContainer);
        
        _oElementContainer = new createjs.Container();
        _oGameContainer.addChild(_oElementContainer);

        

        _oRoad = new CRoad(_oRoadDrawingLevel, _oElementContainer, _iLevel, _oSubwaterLevel);

        _oPlayer = new CPlayer(CANVAS_WIDTH/2, 900, _oGameContainer, _oWaterContainer);

        _aSegments = _oRoad.getSegments();
        TRACK_LENGTH = _oRoad.getTrackLength();

        

        _oInterface = new CInterface();        

        _aCars = new Array();
        new CLevelBuilder(_oPlayer, _aCars, _oElementContainer, iLevel);


        this.resetParams();
        
        //_oPlayer.setPosition(3000*SEGMENT_LENGTH);
    };

    this.getWorldCameraPos = function(){
        var oZPosition = _oPlayer.getPosition().z;
        var baseSegment = this.findSegment(oZPosition);

        return _aSegments[(baseSegment.index)].p1.world;
    };

    function _onKeyboardUp(evt){
        evt.preventDefault();
        s_oGame.onKeyUp(evt.keyCode);
    }
    
    function _onKeyboardDown(evt){
        if(!evt){ 
            evt = window.event; 
        } 
        evt.preventDefault();
        
        s_oGame.onKeyDown(evt.keyCode);
    }

    this.onKeyUp = function(iKey) {
        if(!_bStartGame){
            return;
        }
        
        switch(iKey) {
           // left  
           case KEY_LEFT: {
                   _oPlayer.stopLeft();
                   break; 
               }               
           case KEY_UP: {
                   _oPlayer.stopAccelerate();
                   break; 
               }                         
           // right  
           case KEY_RIGHT: {
                   _oPlayer.stopRight();
                   break; 
               }
           case KEY_DOWN: {
                   _oPlayer.stopBrake();
                   break; 
               }     
        }
    };
    
    this.onKeyDown = function(iKey) { 
        if(!_bStartGame){
            return;
        }
        
        switch(iKey) {
            // left  
            case KEY_LEFT: {
                    _oPlayer.moveLeft();
                    break; 
                }               
            case KEY_UP: {
                    _oPlayer.moveAccelerate();
                    break; 
                }                         
            // right  
            case KEY_RIGHT: {
                    _oPlayer.moveRight();

                    break; 
                }
            case KEY_DOWN: {
                    _oPlayer.moveBrake();
                    break; 
                }     
        }
    };
    
    this.resetParams = function(){
        _bStartGame = false;
        stopSound(s_aSounds["game_soundtrack"]);

        if(_iLevel === 0){
            new CHelpPanel();
        } else {
            _bStartGame = true;
            stopSound(s_aSounds["menu_soundtrack"]);
            playSound("game_soundtrack", 0.8, true);
            
            $(s_oMain).trigger("start_level",_iLevel);
            
            var oFade = new createjs.Shape();
            oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
            oFade.alpha = 1;
            s_oStage.addChild(oFade);

            new createjs.Tween.get(oFade).to({alpha:0},750).call(function(){
                s_oStage.removeChild(oFade);
            });
            
            s_oGame.setPokiStart(true);
        }
        
        _iGameState = STATE_GAME_START;
        _iScore = 0;
        _iTimeElaps = LEVEL_INFO[_iLevel].time;
        _iStartCountDown = START_COUNTDOWN;
        _iCurRotationScreenDir = 0;
        _iCurFrameRotation = 0;
        _iCurRotation = 0;
        
        _oHorizon.restart();
        _oInterface.refreshTimer(_iTimeElaps);
        _oInterface.refreshCurTime(0);
        
        var iWorld = Math.floor(_iLevel/NUM_WORLDS);
        var iTrack = _iLevel%NUM_TRACKS_PER_WORLD;
        _oInterface.setLevelInfo(s_oSpriteLibrary.getSprite('but_world'+iWorld), iTrack+1);
        
        if(s_aTimeScore[_iLevel] < LEVEL_INFO[_iLevel].time && s_aTimeScore[_iLevel] !== 0 ){
            _oInterface.setBestTime(s_aTimeScore[_iLevel])
        } else {
            _oInterface.setBestTime(LEVEL_INFO[_iLevel].time)
        }

        
        if(!s_bMobile){
            document.onkeydown   = _onKeyboardDown; 
            document.onkeyup   = _onKeyboardUp; 
        }
        
        _oRoad.clearVisual(_oPlayer.getPosition());
        
        _oPrevSegment = _oPlayer.getPlayerSegment();
        _oPlayer.reset();

    };
                                    
    this.restartGame = function () {
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("restart_level", _iLevel);

        this.resetParams();
    };        
    
    this.unload = function(){
        
        _oInterface.unload();
        if(_oEndPanel !== null){
            _oEndPanel.unload();
        }
        
        //Howler.unload();
        stopSound(s_aSounds["menu_soundtrack"]);
        stopSound(s_aSounds["game_soundtrack"]);
        stopSound(s_aSounds["engine"]);
        stopSound(s_aSounds["brake"]);
        
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();    
    };
   
    this.rotateScreen = function(iDir){        
        var iDirection = iDir;
        
        if(_iGameState === STATE_GAME_END){
            iDirection = ROTATE_CENTER;
        };
        
        switch(iDirection){
            case ROTATE_LEFT:{
                    
                    if(_iCurRotationScreenDir !== ROTATE_LEFT){
                        _iCurFrameRotation = 0;
                        _iCurRotation = _oGameContainer.rotation;
                    }
                    _iCurRotationScreenDir = ROTATE_LEFT;
                    _oGameContainer.rotation = Util.easeOut(_iCurRotation, MAX_ROTATION, _iCurFrameRotation/FRAMESPEED_ROTATION);

                    if(_oGameContainer.rotation > MAX_ROTATION){
                        _oGameContainer.rotation = MAX_ROTATION;
                        _iCurRotation = _oGameContainer.rotation;
                    }
                    break;
            }
            case ROTATE_RIGHT:{

                    if(_iCurRotationScreenDir !== ROTATE_RIGHT){
                        _iCurFrameRotation = 0;
                        _iCurRotation = _oGameContainer.rotation;
                    }
                    _iCurRotationScreenDir = ROTATE_RIGHT;
                    _oGameContainer.rotation = Util.easeOut(_iCurRotation, -MAX_ROTATION, _iCurFrameRotation/FRAMESPEED_ROTATION);
                    if(_oGameContainer.rotation < -MAX_ROTATION){
                        _oGameContainer.rotation = -MAX_ROTATION;
                        _iCurRotation = _oGameContainer.rotation;
                    }
                    break;
            }
            case ROTATE_CENTER:{
                    if(_iCurRotationScreenDir !== ROTATE_CENTER){
                        _iCurFrameRotation = 0;
                        _iCurRotation = _oGameContainer.rotation;
                    }
                    _iCurRotationScreenDir = ROTATE_CENTER;
                    _oGameContainer.rotation = Util.easeOut(_iCurRotation, 0, _iCurFrameRotation/FRAMESPEED_ROTATION);
                    if(_iCurRotation>0 && _oGameContainer.rotation < 0){
                        _oGameContainer.rotation = 0;
                        _iCurRotation = _oGameContainer.rotation;
                    }
                    if(_iCurRotation<0 && _oGameContainer.rotation > 0){
                        _oGameContainer.rotation = 0;
                        _iCurRotation = _oGameContainer.rotation;
                    }
                    break;
            }
            
        }
        
        if(_iCurFrameRotation<FRAMESPEED_ROTATION){
            _iCurFrameRotation++;
        }
        
        
    };
   
   this.checkDamage = function(){
        if(_oPlayer.getCurSpeed() > PLAYER_MIN_SPEED_DAMAGE){
            ///// WE SHOULD USE A LIMITED TIME OF INVULNERABILITY TO PREVENT MULTIPLE DAMAGE
            if(_bDamaged){
                return;
            }
            _bDamaged = true;
            
            _oPlayer.damageAnim();
            
            new CTremble(s_oStage, 250, 20, 5);
            
        }
    };
   
    this.endDamageTime = function(){
        _bDamaged = false;
    };
   
    this.trackCompleted = function(){
        PokiSDK.happyTime(1);
        
        s_oGame.setPokiStart(false);
        
        _oHorizon.resetPos();
        
        if(_iGameState === STATE_GAME_END){
            ///TIME ALREADY ENDS
            return;
        }
        $(s_oMain).trigger("end_level",_iLevel);
        $(s_oMain).trigger("show_interlevel_ad");
        _iGameState = STATE_GAME_END;
        
        s_oGame.stopPlayer();
        
        _iScore = Math.floor(_iTimeElaps/1000*POINTS_PER_SECONDS);
        
        //////NEXTLEVELPANEL
        new CNextLevelPanel(_iTimeElaps, _iScore, _iLevel);
    };
 
    this._countDown = function(){
        _iStartCountDown -= s_iTimeElaps;
        _oInterface.refreshCountdown(_iStartCountDown);
        if(_iStartCountDown <= 0){
            _iStartCountDown = 0;
            _iGameState = STATE_GAME_RACE;
            _oInterface.countDownGo();
        }
    };
 
    this.nextLevel = function(){
        _iLevel++;
        if(_iLevel < NUM_TRACKS_PER_WORLD*NUM_WORLDS){
            this.unload();
            this._init(_iLevel);
        } else {
            this.gameOver();
        }
    };
 
    this.trackLose = function(){
        PokiSDK.gameplayStop();
        
        _iGameState = STATE_GAME_END;
        s_oGame.stopPlayer();
        
        $(s_oMain).trigger("end_level",_iLevel);
        $(s_oMain).trigger("show_interlevel_ad");
        
        var oLosePanel = new CLosePanel(s_oSpriteLibrary.getSprite('msg_box'));
        oLosePanel.show(_iScore);
    };
 
    this.stopPlayer = function(){
        _oPlayer.stopAll();
        
        if(!s_bMobile){
            document.onkeydown   = null; 
            document.onkeyup   = null; 
        }
    };
 
    this.onExit = function(){
        s_oMain.pokiShowCommercial(function(){
            s_oGame.unload();
            $(s_oMain).trigger("end_session");

            playSound("menu_soundtrack", 1, true);

            s_oMain.gotoMenu();
        });
    };
    
    this._onExitHelp = function () {
        s_oGame.setPokiStart(true);
        
        _bStartGame = true;
        stopSound(s_aSounds["menu_soundtrack"]);
        playSound("game_soundtrack", 0.8, true);
         
        $(s_oMain).trigger("start_level",1);
    };
    
    this.gameOver = function(){
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
        _oEndPanel.show(_iScore);
    };

    this.setPause = function(){
        s_oGame.setPokiStart(false);
        
        _bStartGame = false;
        _oPlayer.stopAll();
    };
    
    this.setResume = function(){
        s_oGame.setPokiStart(true);
        
        _bStartGame = true;
    };
    
    this.update = function(){
        var iDt = 1/s_iCurFps;
        
        switch(_iGameState){
            case STATE_GAME_START:{
                    if(_bStartGame){
                        this._countDown();
                    }
                    
                    break;
            }
            case STATE_GAME_RACE:{
                    
                    if(!_bStartGame){
                        return;
                    }
                    
                    _iTimeElaps-=s_iTimeElaps;
                    if(_iTimeElaps < 0){
                        _iTimeElaps = 0;
                        /////GAME OVER
                        this.trackLose();
                    }
                    _oInterface.refreshTimer(_iTimeElaps);
                    _oInterface.refreshCurTime(LEVEL_INFO[_iLevel].time - _iTimeElaps);

                    _oPlayer.update(iDt);
                    //trace(_oPlayer.getPosition().z)
                    
                    //_oPlayer.get
                    
                    break;
            }
            case STATE_GAME_END:{
                    
                    _oPlayer.update(iDt);
                    _oPlayer.autoPilot();
                    
                    break;
            }
        }

        _oInterface.refreshSpeed(_oPlayer.getCurSpeed()*PLAYER_SPEED_CONVERSION_RATIO);
        
        _oRoad.update(_oPlayer.getPosition());

        _oHorizon.move(this.getWorldCameraPos());

        for(var i=0; i<_aCars.length; i++){
            _aCars[i].update(iDt, _oPlayer);
        }
        
        ///CHECK COLLISION
        _bCollision = false;
        if(!_oPlayer.isJumping()){
            this._ambientCollision();

            this._carsCollision();
        }
        
        _oPrevSegment = _oPlayer.getPlayerSegment();

    };

    this._ambientCollision = function(){
        if(_oPlayer.isOutOfRoad()){
            
            var iPlayerSegment = _oPlayer.getPlayerSegment().index;
            ////THIS ITERATION PREVENT CAR PIERCING ON ELEMENT
            for(var i=_oPrevSegment.index; i<=iPlayerSegment; i++){
                var segment = _aSegments[i];
                for(var n = 0 ; n < segment.sprites.length ; n++) {
                    var sprite  = segment.sprites[n];

                    var bOverlap = Util.overlap(_oPlayer.getPosition().x, _oPlayer.getPlayerWidth(), sprite.collision.center, sprite.collision.width);
                    if (bOverlap) {
                        this.checkDamage();
                        _oPlayer.setCurSpeed( PLAYER_ACCELERATION );
                        _oPlayer.setPosition( Util.increase(segment.p1.world.z, -PLAYER_Z_FROMCAMERA, TRACK_LENGTH) ); // stop in front of sprite (at front of segment)
                        
                        _bCollision = true;
                        _oPlayer.stopEngineSound();
                        
                        break;
                    }
                }
            }; 
        };
    };
    
    this._carsCollision = function(){
        var car;
        var carW;
        
        var iPlayerSegment = _oPlayer.getPlayerSegment().index;
        ////THIS ITERATION PREVENT CAR PIERCING ON ELEMENT
        for(var i=_oPrevSegment.index; i<=iPlayerSegment; i++){
            var segment = _aSegments[i];
            for(var n = 0 ; n < segment.cars.length ; n++) {
                car  = segment.cars[n];
                carW = car.getSprite().width * SPRITES.SCALE;

                if (_oPlayer.getCurSpeed() > car.getSpeed() ) {
                    if (Util.overlap(_oPlayer.getPosition().x, _oPlayer.getPlayerWidth(), car.getOffset(), carW, 0.8)) {
                          this.checkDamage();
                          _oPlayer.setCurSpeed( car.getSpeed() * (car.getSpeed()/_oPlayer.getCurSpeed()) );
                          _oPlayer.setPosition( Util.increase(car.getZ(), -PLAYER_Z_FROMCAMERA, TRACK_LENGTH) );

                          _bCollision = true;
                          _oPlayer.stopEngineSound();

                          break;
                    }
                }
            }
        }
            
    };
    
    this.playerCollide = function(){
        return _bCollision;
    };

    this.findSegment = function(z) {
        return _oRoad.findSegment(z);
    };

    this.getSegments = function(){
        return _aSegments;
    };
    
    this.getPlayer = function(){
        return _oPlayer;
    };
    
    this.getState = function(){
        return _iGameState;
    };
    
    this.setPokiStart = function(bVal){       
        if(bVal && !_bPokiStart){
            PokiSDK.gameplayStart();
            _bPokiStart = true;
        }else if(!bVal && _bPokiStart) {
            PokiSDK.gameplayStop();
            _bPokiStart = false;
        }
    };
    
    s_oGame=this;
    
    PLAYER_MAX_SPEED = oData.player_max_speed;
    PLAYER_ACCELERATION = PLAYER_MAX_SPEED/5; 
    PLAYER_DECELERATION = PLAYER_MAX_SPEED/8;
    PLAYER_MIN_SPEED_DAMAGE = PLAYER_MAX_SPEED/3;   // player minimum speed to being damaged

    PLAYER_REAL_MAX_SPEED = oData.player_maxspeed_indicator;
    PLAYER_SPEED_CONVERSION_RATIO = PLAYER_REAL_MAX_SPEED/PLAYER_MAX_SPEED;
    
    CENTRIFUGAL_FORCE = oData.player_centrifugal_force;
    
    POINTS_PER_SECONDS = oData.points_per_seconds_remaining;
    
    _oParent=this;
    this._init(iLevel);
}

var s_oGame;
