function CGame(oData, szTeam){
    var _iScore = 0;
    var _iScoreToAttribute;
    var _iGoalScored = 0;
    var _iGoalToScore = 0;
    var _iKickLeft = 0;
    var _iActualFrame = 0;
    var _iProbability = -1;
    var _iPerfectSave = -1;
    var _iLevel = 0;
    var _iRound = ROUND;
    var _iFirstTime = FIRST_TIME;
    
    var _oLevel;
    var _oLevelInfo;
        
    var _bUpdate = false;
    var _bUpdateControlPlayer = false;
    var _bEntered = false;
    var _bSaved = false;
    var _bWallJumping = false;
    
    var _aKickPoints;
    
    var _oInterface;
    var _oEndPanel = null;
    var _oParent;
    
    var _oGoal;
    var _oGoalContainer;
    
    var _oPlayer;
    var _oPlayerPosition;
    var _oPlayerContainer;
    
    var _oGoalKeeper;
    var _oGoalKeeperPosition = {x: GOALKEEPER_X_POSITION, y: GOALKEEPER_Y_POSITION};
    var _oGoalKeeperContainer;
    var _iGoalKeeperAction;
    var _oGoalKeeperInfo;
    var _bGoalKeeperTrying = false;
    
    var _oContainerLevel;
    
    var _oBall;
    var _oBallPosition;
    var _oBallContainer;
    var _oBallEndx;
    var _oBallEndy;
    
    var _oCrowd;
    var _bCrowdOn = false;
    
    var _oWall = new Array();
    var _oWallPosition;
    var _oWallContainer;
    
    this._init = function(){
        if(_iFirstTime === 0){
            if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
                setVolume("soundtrack",0);
                playSound("crowd",1,true);
            }
        }
        _iScoreToAttribute = 1000;
        _iProbability = -1;
        _iPerfectSave = -1;
        _bUpdateControlPlayer = false;
        _bEntered = false;
        _bSaved = false;
        _bCrowdOn = false;
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg); 
        
        
        _oCrowd = new CCrowd();
        if(_iRound === 0){
            this._initLevel();
        }else{
            _oInterface = new CInterface(_iLevel);
            this.createViewThings();
        }
        this._initKickPoints();
    };
    
    this._initLevel= function(){
        _iGoalToScore = 0;
        _iKickLeft = 0;
        _iActualFrame = 0;
        _iProbability = -1;
        _iPerfectSave = -1;
        
        _bUpdate = false;
        _bUpdateControlPlayer = false;
        _bEntered = false;
        
        _oContainerLevel = new createjs.Container();
        s_oStage.addChild(_oContainerLevel);
    
        _oLevel = new CLevel(_iLevel, _iGoalScored, _oContainerLevel);
        if(_iLevel === 0){
            this.setLevelInfo();
        }else {
            s_oMain.pokiShowCommercial();
        }

    };
    
    this.setLevelInfo = function(){
        $(s_oMain).trigger("start_level",_iLevel);
        _oLevelInfo = _oLevel.getLevelInfo(_iLevel);
        
        _iGoalScored = 0;
        
        _iGoalToScore = _oLevelInfo.goalToScore;
        _iKickLeft    = _oLevelInfo.kickLeft;
        
        _oInterface = new CInterface(_iLevel);
        this.createViewThings();
    };
    
    this.createViewThings = function(){
        _oBallPosition   = _oLevel.getBallPosition(_iLevel, _iRound);
        _oPlayerPosition = _oLevel.getPlayerPosition(_iLevel, _iRound);
        _oWallPosition   = _oLevel.getWallPosition(_iLevel, _iRound);
        
        _oGoalContainer= new createjs.Container();
        s_oStage.addChild(_oGoalContainer);
        _oGoal = new CGoal(CANVAS_WIDTH/2, CANVAS_HEIGHT/2+20, _oGoalContainer);
        
        _oGoalKeeperContainer= new createjs.Container();
        s_oStage.addChild(_oGoalKeeperContainer);
        _oGoalKeeper = new CGoalKeeper(_oGoalKeeperContainer);
        _oGoalKeeper.showIdle(_oGoalKeeperPosition.x, _oGoalKeeperPosition.y);
        
        _oWallContainer= new createjs.Container();
        s_oStage.addChild(_oWallContainer);
        
        if(_oWallPosition.num > 0){
            for(var i=0; i<_oWallPosition.num; i++){
                _oWall[i] = new CWall(_oWallPosition.x, _oWallPosition.y, _oWallContainer, i);
                _oWall[i].showIdle(i);
            }
        }
        
        _oBallContainer= new createjs.Container();
        s_oStage.addChild(_oBallContainer);
        _oBall = new CBall(_oBallPosition.x, _oBallPosition.y, _oBallContainer);
        
        _oPlayerContainer= new createjs.Container();
        s_oStage.addChild(_oPlayerContainer);
        _oPlayer = new CPlayer(_oPlayerContainer);
        _oPlayer.showIdle(_oPlayerPosition.x, _oPlayerPosition.y, szTeam);
        
        if(_oLevel.getPlayerPosIndex(_iLevel, _iRound) === 1){
            _oPlayer.changeAlpha();
        }
        
        _oInterface.viewScore(_iScore);
        _oInterface.viewGoalScored(_iGoalScored, _iGoalToScore);
        _oInterface.viewKickLeft(_iKickLeft);
        _oInterface.viewScoreBonus(_iScoreToAttribute, 1);
        
        _oInterface.refreshButtonPos(s_iOffsetX,s_iOffsetY);
        
        if(_iFirstTime === 0){
            _oInterface.help();
            _iFirstTime=1;
        }else{
            _bUpdate = true;
        }
    };
    
    this.animatePlayer = function(iX, iY){
        _oBallEndx = _aKickPoints[iX][iY].x;
        _oBallEndy = _aKickPoints[iX][iY].y;
        _bUpdateControlPlayer = true;
        switch(iX){
            case 0:
            case 1:
            case 7:
            case 8:
                _iPerfectSave = OUT;
                break;
            case 2:
                _iProbability = LOW_PERCENT;
                if(iY === 0){
                    _iPerfectSave = OUT;
                }else if(iY === 1 ){
                    _iPerfectSave = HIGH_LEFT;
                }else if(iY === 2){
                    _iPerfectSave = MED_LEFT;
                }else if(iY === 3){
                    _iPerfectSave = DOWN_LEFT;
                }
                break;
            case 3:
                _iProbability = MED_PERCENT;
                if(iY === 0){
                    _iPerfectSave = OUT;
                }else if(iY === 1 ){
                    _iPerfectSave = HIGH_LEFT;
                }else if(iY === 2 ){
                    _iPerfectSave = MED_LEFT;
                }else if(iY === 3){
                    _iPerfectSave = DOWN_LEFT;
                }
                break;
            case 4:
                _iProbability = HIGH_PERCENT;
                if(iY === 0){
                    _iPerfectSave = OUT;
                }else if(iY === 1 || iY === 2){
                    _iPerfectSave = CENTER_HIGH;
                }else if(iY === 3){
                    _iPerfectSave = CENTER;
                }
                break;
            case 5:
                _iProbability = MED_PERCENT;
                if(iY === 0){
                    _iPerfectSave = OUT;
                }else if(iY === 1 ){
                    _iPerfectSave = HIGH_RIGHT;
                }else if(iY === 2 ){
                    _iPerfectSave = MED_RIGHT;
                }else if(iY === 3){
                    _iPerfectSave = DOWN_RIGHT;
                }
                break;
            case 6:
                _iProbability = LOW_PERCENT;
                if(iY === 0){
                    _iPerfectSave = OUT;
                }else if(iY === 1){
                    _iPerfectSave = HIGH_RIGHT;
                }else if(iY === 2 ){
                    _iPerfectSave = MED_RIGHT;
                }else if(iY === 3){
                    _iPerfectSave = DOWN_RIGHT;
                }
                break;
        }
        _oPlayer.showShot(_oPlayerPosition.x, _oPlayerPosition.y, szTeam);
    };
    
    this.kickBall = function(){
        playSound("kick",1,false);
        _oBall.ballKicked(_oBallEndx, _oBallEndy);
    };
    
    this.showMessage = function(bWallHitted){
        _bUpdateControlPlayer = false;
        _oPlayer.showIdle(_oPlayerPosition.x, _oPlayerPosition.y, szTeam);
        var oParent = this;
        if(bWallHitted === true){
            _oBall.fadeOut();
            var oMissedSprite = createBitmap(s_oSpriteLibrary.getSprite('missed_text'));
            oMissedSprite.scaleX = 0;
            oMissedSprite.scaleY = 0;
            oMissedSprite.alpha  = 0;
            oMissedSprite.x = CANVAS_WIDTH/2;
            oMissedSprite.y = CANVAS_HEIGHT/2;
            oMissedSprite.regX = 413/2;
            oMissedSprite.regY = 74/2;
            s_oStage.addChild(oMissedSprite);
            createjs.Tween.get(oMissedSprite).to({alpha:1, scaleX: 1 , scaleY: 1 }, 500).wait(800).call(function() {
            oParent.controlIfCanContinue();
            });
        }else if(_bSaved === true){
            var oMissedSprite = createBitmap(s_oSpriteLibrary.getSprite('missed_text'));
            oMissedSprite.scaleX = 0;
            oMissedSprite.scaleY = 0;
            oMissedSprite.alpha  = 0;
            oMissedSprite.x = CANVAS_WIDTH/2;
            oMissedSprite.y = CANVAS_HEIGHT/2;
            oMissedSprite.regX = 413/2;
            oMissedSprite.regY = 74/2;
            s_oStage.addChild(oMissedSprite);
            createjs.Tween.get(oMissedSprite).to({alpha:1, scaleX: 1 , scaleY: 1 }, 500).wait(800).call(function() {
                oParent.controlIfCanContinue();
            });
        }else if( _iPerfectSave === OUT ){
            var oOutSprite = createBitmap(s_oSpriteLibrary.getSprite('out_text'));
            oOutSprite.scaleX = 0;
            oOutSprite.scaleY = 0;
            oOutSprite.alpha  = 0;
            oOutSprite.x = CANVAS_WIDTH/2;
            oOutSprite.y = CANVAS_HEIGHT/2;
            oOutSprite.regX = 261/2;
            oOutSprite.regY = 70/2;
            s_oStage.addChild(oOutSprite);
            
            playSound("miss_goal",1,false);
            
            _oBall.fadeOut();
            createjs.Tween.get(oOutSprite).to({alpha:1, scaleX: 1 , scaleY: 1 }, 500).wait(800).call(function() {
            oParent.controlIfCanContinue();
            });
        }else if(_iGoalKeeperAction !== _iPerfectSave && _iPerfectSave !== OUT ){
            var oGoalSprite = createBitmap(s_oSpriteLibrary.getSprite('goal_text'));
            oGoalSprite.scaleX = 0;
            oGoalSprite.scaleY = 0;
            oGoalSprite.alpha  = 0;
            oGoalSprite.x = CANVAS_WIDTH/2;
            oGoalSprite.y = CANVAS_HEIGHT/2;
            oGoalSprite.regX = 798/2;
            oGoalSprite.regY = 76/2;
            s_oStage.addChild(oGoalSprite);
            
            playSound("goal",1,false);
            
            _oBall.fadeOut();
            createjs.Tween.get(oGoalSprite).to({alpha:1, scaleX: 1 , scaleY: 1 }, 500).wait(800).call(function() {
            oParent.controlIfCanContinue();
            });
            _iGoalScored++;
            _iScore += _iScoreToAttribute;
            _bCrowdOn = true;
            
            var iHappyScore = (_iScoreToAttribute/1000).toFixed(1);
            PokiSDK.happyTime(iHappyScore);
        }
    };
    
    this.controlWall = function(){
        var iX = _oBall.returnX();
        var iY = _oBall.returnY();
        if(_oWallPosition.num > 0){
            if( _oWall[0].controlIfHitted(iX, iY, _oWallPosition.num) === true ){
                _oBall.bounce(_oPlayerPosition.x, 0);                
                
                playSound("keeper_save",1,false);
                playSound("miss_goal",1,false);
                
            }
        }
    };
    
    this.goalKeeperBounce = function(){
        playSound("keeper_save",1,false);
        playSound("miss_goal",1,false);
                
        _oBall.bounce(_oPlayerPosition.x, 1);
    };
    
    this.controlIfCanContinue = function(){
        if(_iGoalScored >= _iGoalToScore && _iKickLeft <= 1){
            _iLevel++;
            _iRound = 0;
            if(_iLevel === NUM_LEVEL){
                PokiSDK.gameplayStop();
                
                _iScoreToAttribute = 0;
                _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('bg_win'), s_oSpriteLibrary.getSprite('you_win'));
                _oEndPanel.win(_iScore);
            }else{
                this.unload();
                this._init();
            }
        }else if(_iKickLeft <= 1){
            this.gameOver();
        }
        if( _iKickLeft > 1){
            _iKickLeft--;
            _iRound++;
            this.unload();
            this._init();
        }
    };
    
    this._initKickPoints = function(){
        _aKickPoints=new Array();
        for(var i=0;i<RANGE_WIDTH;i++){
            _aKickPoints[i]=new Array();
            for(var j=0;j<RANGE_HEIGHT;j++){
                var oPos = {x: 0, y:0};
                _aKickPoints[i][j] = {x:0, y:0};
                oPos.x = Math.round((((MATRIX_X_END-MATRIX_X_START)/RANGE_WIDTH)*i)+MATRIX_X_START)+5;
                oPos.y = Math.round((((MATRIX_Y_END-MATRIX_Y_START)/RANGE_HEIGHT)*j)+MATRIX_Y_START)+5;
                _aKickPoints[i][j].x=oPos.x;
                _aKickPoints[i][j].y=oPos.y;
            }
        }
    };
        
    this.unload = function(){
        _oInterface.unload();

        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren(); 
    };
            
    this.onExit = function(){
        $(s_oMain).trigger("end_level",_iLevel);
        $(s_oMain).trigger("show_interlevel_ad");
        $(s_oMain).trigger("end_session");
        
        this.unload();
        s_oMain.gotoMenu();
        

        stopSound("crowd");
        setVolume("soundtrack",1);

        $(s_oMain).trigger("restart");
    };

    this.gameOver = function(){   
        PokiSDK.gameplayStop();
        
        _iRound = 0;
        _iScoreToAttribute = 0;
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('bg_next_level'), s_oSpriteLibrary.getSprite('game_over'));
        _oEndPanel.show(_iScore);
    };

    this.setUpdate = function(){
        _bUpdate = !_bUpdate;
    };
    
    this.setCrowdOff = function(){
        _bCrowdOn = false;
    };
    
    this.update = function(){
        if(_bUpdate){
            if(_bUpdateControlPlayer){
                _iActualFrame = _oPlayer.getFrame();
                if(_iActualFrame === 4 && !_bEntered){
                    if(((Math.floor(Math.random() * 100 )) <= _iProbability) && (_iPerfectSave > 0 && _iProbability > 0)){
                        _iGoalKeeperAction = _iPerfectSave;
                        if(_iPerfectSave !== OUT){
                            _bSaved = true;
                        }
                    }else{
                        do{
                                _iGoalKeeperAction = Math.floor(Math.random() * NUM_SAVE );
                        }while(_iGoalKeeperAction === _iPerfectSave);
                    }
                    switch(_iGoalKeeperAction){
                        case CENTER:
                            _oGoalKeeperInfo = CENTER_INFO;
                            break;
                        case CENTER_HIGH:
                            _oGoalKeeperInfo = CENTER_HIGH_INFO;
                            break;
                        case DOWN_LEFT:
                            _oGoalKeeperInfo = DOWN_LEFT_INFO;
                            break;
                        case DOWN_RIGHT:
                            _oGoalKeeperInfo = DOWN_RIGHT_INFO;
                            break;
                        case HIGH_LEFT:
                            _oGoalKeeperInfo = HIGH_LEFT_INFO;
                            break;
                        case HIGH_RIGHT:
                            _oGoalKeeperInfo = HIGH_RIGHT_INFO;
                            break;
                        case MED_LEFT:
                            _oGoalKeeperInfo = MED_LEFT_INFO;
                            break;
                        case MED_RIGHT:
                            _oGoalKeeperInfo = MED_RIGHT_INFO;
                            break;
                    }
                    _oGoalKeeper.showAction(_oGoalKeeperInfo.x, _oGoalKeeperInfo.y, _oGoalKeeperInfo.action, _oGoalKeeperInfo.frames, _oGoalKeeperInfo.width, _oGoalKeeperInfo.height);
                    if(_oWallPosition.num > 0){
                        for(var i=0; i<_oWallPosition.num; i++){
                            _oWall[i].showJump(i);
                        }
                        _bWallJumping = true;
                    }
                    this.kickBall();
                    _bEntered = true;
                    _bGoalKeeperTrying = true;
                }
            }
            if(_bGoalKeeperTrying && _oGoalKeeper.getFrame() === _oGoalKeeperInfo.frames){
                _oGoalKeeper.stop();
                _bGoalKeeperTrying = false;
            }
            
            if(_iScoreToAttribute-3 >= 1){
                _iScoreToAttribute-=3;
                _oInterface.viewScoreBonus(_iScoreToAttribute, 0);
            }
            
            if(_bCrowdOn === true){
                _oCrowd.showAnim();
            }
            
            if(_oWallPosition.num > 0){
                if(_bWallJumping === true){
                    if(_oWall[0].getFrame() === _oWall[0].frames){
                        for(var i=0; i<_oWallPosition.num; i++){
                            _oWall[i].showIdle();
                        }
                        _bWallJumping = false;
                    }
                }
            }
			
            //_oInterface.update();
            _oBall.update(_oWallPosition.num, _bSaved);
        }
        
    };
    
    SHOT_INDICATOR_SPEED = oData.shot_indicator_spd;
    DECREASE_SHOT_INDICATOR_SPEED = oData.decrease_shot_indicator_spd;
    s_oGame=this;
    
    _oParent=this;
    this._init();
}

var s_oGame;
