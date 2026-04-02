function CGame(oData, iStage){
    var _bTouchActive;
    var _bInitGame;
    var _bNitroActive;
    
    var _iScore; 
    var _iPlayerSpeed;
    var _iGameState;
    var _iStartCountDown;
    var _iTimeElaps;
    var _iStage;
    var _iCurStreetMeter;
    var _iIgnitionSoundID;
    var _iEngineSoundID;

    var _oInterface;
    var _oHelpPanel;
    var _oEndPanel = null;
    var _oParent;
    var _oBg;
    var _oStreet;
    var _oAI;
    var _oFade;
    var _oWoman;
    var _oGameContainer;
    var _oFgContainer;
    var _oCurtain;
  
    var _oPlayerCar;
    var _oOpponentCar;
    
    this._init = function(oData, iStage){
        
        
        _bTouchActive=false;
        _bInitGame=true;
        
        _iStage = iStage;
        _iStartCountDown = START_COUNTDOWN;
        _iGameState = STATE_HELP_PANEL;
        _iScore=0;   
        _iTimeElaps = 0;
        
        _oGameContainer = new createjs.Container();
        s_oStage.addChild(_oGameContainer);
        
        _oFgContainer = new createjs.Container();
        s_oStage.addChild(_oFgContainer);
        
        _oBg = new CBackground(_oGameContainer);
        _oStreet = new CStreet(0, _oGameContainer, _oFgContainer);
        _oStreet.setArrive(STAGE_METER_LENGTH[_iStage]);

        _oOpponentCar = new CCar(START_LINE_X, 400, _oGameContainer, _iStage+1, false, OPPONENT_ENGINE_GEAR[_iStage], _iStage);
        _oOpponentCar.setScale(0.85);
        
        
        var oSprite = s_oSpriteLibrary.getSprite('woman_starting');
        var iWidth = oSprite.width/9;
        var iHeight = oSprite.height/2;
        var oData = {   
                        images: [oSprite],
                        framerate:30,
                        // width, height & registration point of each sprite
                        frames: {width: iWidth, height: iHeight, regX: iWidth/2, regY: iHeight}, 
                        animations: {play:[0,17, "stop"], rev:[16,1, "play"], stop:[17]}
                   };
                   
        var oSpriteSheet = new createjs.SpriteSheet(oData);
	_oWoman = createSprite(oSpriteSheet, "play",iWidth/2,iHeight/2,iWidth,iHeight); 
        _oWoman.x = 700;
        _oWoman.y = 450;
        _oWoman.gotoAndStop("play");
        _oGameContainer.addChild(_oWoman);
        
        _oPlayerCar = new CCar(START_LINE_X, 500, _oGameContainer, 0, true, PLAYER_ENGINE_GEAR, _iStage);
        

        _oAI = new CAI(_oOpponentCar, _iStage);


        _oInterface = new CInterface();         


        s_oHUD.setGearArea(GEAR_START_AREA.center, GEAR_START_AREA);


        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.on("mousedown",function(){});
        s_oStage.addChild(_oFade);


        new CVsPanel(_iStage);
        
        $(s_oMain).trigger("start_level",_iStage);
        
        _oCurtain = new CCurtain(s_oStage);
        _oCurtain.openAnim();
    };


    this.startAcceleration = function(bPush){
        s_oHUD.startAccelerate(bPush);
        if(bPush){
            _oPlayerCar.pitchStartAnim();
        }
    };
    
    this.changeGear = function(){
        switch (s_oHUD.getIndicatorResult()){
            
            case GREEN_AREA : {
                    PokiSDK.happyTime(0.5);
                    
                    _oPlayerCar.changeGear();
                    s_oHUD.downShiftGear(_oPlayerCar.getGear(), STATE_HUD_UPDATE, 0);
                    s_oHUD.scaleGear();
                    new CScoreText(TEXT_PERFECT, 100, -30, s_oHUD.getContainer());
                    break;
            }
            case EARLY_AREA:{
                    _oPlayerCar.changeGear();
                    this._wrongGearChange();
                    s_oHUD.scaleGear();
                    break;
            }
            case LATE_AREA:{
                    _oPlayerCar.changeGear();
                    this._wrongGearChange();
                    s_oHUD.scaleGear();
                    break;
            }
        }
        if(_oPlayerCar.getGear() < PLAYER_ENGINE_GEAR.length-1){
            s_oHUD.setGearArea(HUD_RPM_INTERVAL[_oPlayerCar.getGear()].max - GEAR_IN_RACE_AREA.greenangle-5, GEAR_IN_RACE_AREA);
        } else {
            s_oHUD.setGearArea(0, GEAR_NULL_AREA);
        }
    };

    this._wrongGearChange = function(){
        playSound('wrong_gear', 1, false);
        
        var iStallTime;
        if(_bNitroActive){
            iStallTime = WRONG_GEAR_CHANGE_STALL_DURATION/ENGINE_NITRO_RPM_ACCELERATION;
        } else {
            iStallTime = WRONG_GEAR_CHANGE_STALL_DURATION;
        }
                
        s_oHUD.downShiftGear(_oPlayerCar.getGear(), STATE_HUD_STALL, iStallTime);
        _oPlayerCar.delayEngine(iStallTime);
    };    
    
    this.shotNitro = function(){
        _bNitroActive = true;
        _oPlayerCar.activateNitro(NITRO_DURATION);
        
        new CTremble(s_oStage, NITRO_DURATION, 5, 1);
    };  
      
    this.endNitro = function(){
        _bNitroActive = false;
    };
      
    this.playerHighlight = function(){
        _oPlayerCar.highlight();
    };
    
    this.opponentHighlight = function(){
        _oOpponentCar.highlight();
    }; 
            
    this.getPlayerMeterSpeed = function(){
        return _oPlayerCar.getMeterSpeed();
    };          
         
    this.getStage = function(){
        return _iStage;
    };
    
    this.nextLevel = function(){
        _iStage++;
        if(_iStage === NUM_TRACK){
            this.gameOver();
        } else {
            _oCurtain.closeAnim(this._onCurtainClose)
            new createjs.Tween.get(_oFade).to({alpha:1}, 500);
        }
        
        fadeSound(s_oSoundTrack, 0, 1, 2000);
        
    };
            
    this.restartGame = function () {
        $(s_oMain).trigger("restart_level", _iStage);
        $(s_oMain).trigger("show_interlevel_ad");
        
        _oCurtain.closeAnim(this._onCurtainClose);
        new createjs.Tween.get(_oFade).to({alpha:1}, 500);
        
        fadeSound(s_oSoundTrack, 0, 1, 2000);
    };        
    
    this._onCurtainClose = function(){
        _oParent.unload();
        _oParent._init(oData, _iStage);
    };
    
    this.unload = function(){
        _bInitGame = false;
        
        _oInterface.unload();
        if(_oEndPanel !== null){
            _oEndPanel.unload();
        }
        
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();
        
        _oCurtain.unload();
        
        _oPlayerCar.stopSound();
        _oOpponentCar.stopSound();
        if(_iEngineSoundID){
            stopSound(_iEngineSoundID);
        }
    };
 
    this.onExit = function(){
        
        
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("end_level",_iStage);
        $(s_oMain).trigger("show_interlevel_ad");
        
        _oCurtain.closeAnim(_oParent._onExitCurtain);
        new createjs.Tween.get(_oFade).to({alpha:1}, 500);
        
        fadeSound(s_oSoundTrack, 0, 1, 2000);
    };
    
    this._onExitCurtain = function(){
        s_oGame.unload();
        s_oMain.gotoMenu();
    };
    
    this._onExitVersusPanel = function(){
        new createjs.Tween.get(_oFade).to({alpha:0}, 500).call(function(){
            if(_iStage === 0){
                _oHelpPanel =  new CHelpPanel();
            } else {
                _iIgnitionSoundID = playSound('ignition', 1, false);
                _iGameState = STATE_START_BATTLE;
                fadeSound(s_oSoundTrack, 1, 0, 2000);
                
                trace("pokistart");
                PokiSDK.gameplayStart();
            }
        });
    };
    
    this._onExitHelp = function () {
        trace("pokistart");
        PokiSDK.gameplayStart();
        
        _iIgnitionSoundID = playSound('ignition', 1, false);
        _iGameState = STATE_START_BATTLE;
        fadeSound(s_oSoundTrack, 1, 0, 2000);
    };
    
    this._checkWinner = function(_iPlayerPosX, _iOpponentPosX){
        trace("pokistop");
        PokiSDK.gameplayStop();

        s_oMain.pokiShowCommercial();

        stopSound(_iEngineSoundID);
        _oPlayerCar.stopSound();
        _oOpponentCar.stopSound();

        var iOvertakingDistance = _iPlayerPosX - _iOpponentPosX;
        $(s_oMain).trigger("end_level",_iStage);
        if(_iPlayerPosX>_iOpponentPosX){
            PokiSDK.happyTime(1);
            
            new CNextLevelPanel(_iStage, _iTimeElaps, iOvertakingDistance);
        }else {
            new CRetryPanel();
        };
    };
    
    this.gameOver = function(){  
        
        _oEndPanel = CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
        _oEndPanel.show(_iStage, _iTimeElaps);
    };

    
    this.update = function(){
        
        switch (_iGameState){
            
            case STATE_START_BATTLE:{
                    s_oHUD.updateIndicatorForStartBattle();
            
                    _iStartCountDown -= s_iTimeElaps;

                    if(_iStartCountDown <= 0){
                        _iStartCountDown = 0;
                        _oInterface.removeCountdown();
                        _iGameState = STATE_RACE_RUN;

                        _oPlayerCar.ignition();
                        _oOpponentCar.ignition();

                        if(s_oHUD.getIndicatorResult() !== GREEN_AREA){
                            this._wrongGearChange();
                            
                        } else {
                            s_oHUD.downShiftGear(_oPlayerCar.getGear(), STATE_HUD_UPDATE, 0);
                            new CScoreText(TEXT_PERFECT, 100, -30, s_oHUD.getContainer());
                        };
                        s_oHUD.scaleGear();
                        s_oHUD.acceleratorButtonVisible(false);
                        s_oHUD.setGearArea(HUD_RPM_INTERVAL[_oPlayerCar.getGear()].max - GEAR_IN_RACE_AREA.greenangle - 5, GEAR_IN_RACE_AREA);

                        var iNitroLevel = parseInt(s_oLocalStorage.getItem(LOCALSTORAGE_NITROPOWER_LEVEL));
                        if(iNitroLevel !== 0){
                            s_oHUD.nitroButtonVisible(true);
                        }

                        s_oHUD.gearButtonVisible(true);
                        
                        _oWoman.gotoAndPlay("play");
                        
                        playSound('sprint_start', 1, false);
                        fadeSound(_iIgnitionSoundID, 1, 0, 2000);
                        
                        _iEngineSoundID = playSound("engine", 1,true);
                        
                    }
                    _oInterface.refreshCountdown(_iStartCountDown);
                    
                    break;
            }
            case STATE_RACE_RUN:{
                        
                    _oPlayerCar.move();
                    _iPlayerSpeed = _oPlayerCar.getSpeed();

                    _oWoman.x -=  _iPlayerSpeed;

                    _iCurStreetMeter = _oPlayerCar.getMeterPos();
                    
                    if(_iCurStreetMeter > STAGE_METER_LENGTH[_iStage]){
                        _iGameState = STATE_RACE_FINISH;
                        this._checkWinner(_iCurStreetMeter, _oOpponentCar.getMeterPos());
                    }else {
                        _iTimeElaps += s_iTimeElaps;
                    }
                    
                    _oStreet.move(_iPlayerSpeed, _oPlayerCar.getPixelPos(), _oOpponentCar.getPixelPos());
                    _oBg.move(_iPlayerSpeed*PARALLAX_BG_RATIO);

                    _oOpponentCar.move(_iPlayerSpeed);

                    s_oHUD.updateTachometer(_oPlayerCar.getMeterSpeed(), _oPlayerCar.getGear());

                    break;
            }
            case STATE_RACE_FINISH:{
                    _oPlayerCar.move();
                    _iPlayerSpeed = _oPlayerCar.getSpeed();
                    _oStreet.move(_iPlayerSpeed, _oPlayerCar.getPixelPos(), _oOpponentCar.getPixelPos());
                    _oBg.move(_iPlayerSpeed*PARALLAX_BG_RATIO);

                    _oOpponentCar.move(_iPlayerSpeed);

                    s_oHUD.updateTachometer(_oPlayerCar.getMeterSpeed(), _oPlayerCar.getGear());
                    
                    break;
            }
        };
        _oAI.update(_iGameState, _oOpponentCar.getMeterPos());
        _oInterface.refreshMap(_oPlayerCar.getMeterPos(), _oOpponentCar.getMeterPos(), _iTimeElaps);
    };

    s_oGame=this;
    
    
    
    _oParent=this;
    this._init(oData, iStage);
}

var s_oGame;
