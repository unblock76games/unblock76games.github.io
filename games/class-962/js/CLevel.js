function CLevel(iLevel, iGoalScored, oContainer){
    var _aLevel = new Array();
    var _aBallPos = new Array();
    var _aPlayerPos = new Array();
    var _aLevelBallPos = new Array(NUM_LEVEL);
    var _aLevelPlayerPos = new Array(NUM_LEVEL);
    var _aLevelWalls = new Array(NUM_LEVEL);
    
    var _oButContinue;
    var _pStartPosContinue;
    
    var _oBg;
    var _oCongratulationTextStroke;
    var _oCongratulationText;
    var _oGoalScoredTextStroke;
    var _oGoalScoredText;
    var _oBall = new Array();
    var _aWallType = new Array();
    
    this._init = function(iLevel, iGoalScored){
        iLevel++;
        if(iLevel > 1){
            PokiSDK.gameplayStop();
            
            this.viewNextLevelPanel();
            
            this.refreshButtonPos(s_iOffsetX,s_iOffsetY);
        }
        for(var i=0; i< NUM_LEVEL; i++){
            _aLevelBallPos[i] = new Array(NUM_KICK);
            _aLevelPlayerPos[i] = new Array(NUM_KICK);
            _aLevelWalls[i] = new Array(NUM_KICK);
        }
        
        _aLevel.push({goalToScore: 1, kickLeft: 5});
        _aLevel.push({goalToScore: 2, kickLeft: 5});
        _aLevel.push({goalToScore: 2, kickLeft: 5});
        _aLevel.push({goalToScore: 3, kickLeft: 5});
        _aLevel.push({goalToScore: 3, kickLeft: 5});
        _aLevel.push({goalToScore: 4, kickLeft: 5});
        
        _aBallPos.push({x: 430, y: 530});
        _aBallPos.push({x: 680, y: 530});
        _aBallPos.push({x: 940, y: 530});
        
        _aPlayerPos.push({x: 380, y: 500});
        _aPlayerPos.push({x: 660, y: 500});
        _aPlayerPos.push({x: 930, y: 500});
        
        _aLevelBallPos[0][0]=_aBallPos[0];
        _aLevelBallPos[0][1]=_aBallPos[0];
        _aLevelBallPos[0][2]=_aBallPos[0];
        _aLevelBallPos[0][3]=_aBallPos[0];
        _aLevelBallPos[0][4]=_aBallPos[0];

        _aLevelBallPos[1][0]=_aBallPos[0];
        _aLevelBallPos[1][1]=_aBallPos[0];
        _aLevelBallPos[1][2]=_aBallPos[0];
        _aLevelBallPos[1][3]=_aBallPos[1];
        _aLevelBallPos[1][4]=_aBallPos[1];

        _aLevelBallPos[2][0]=_aBallPos[1];
        _aLevelBallPos[2][1]=_aBallPos[0];
        _aLevelBallPos[2][2]=_aBallPos[0];
        _aLevelBallPos[2][3]=_aBallPos[0];
        _aLevelBallPos[2][4]=_aBallPos[2];

        _aLevelBallPos[3][0]=_aBallPos[1];
        _aLevelBallPos[3][1]=_aBallPos[2];
        _aLevelBallPos[3][2]=_aBallPos[0];
        _aLevelBallPos[3][3]=_aBallPos[1];
        _aLevelBallPos[3][4]=_aBallPos[2];

        _aLevelBallPos[4][0]=_aBallPos[0];
        _aLevelBallPos[4][1]=_aBallPos[1];
        _aLevelBallPos[4][2]=_aBallPos[2];
        _aLevelBallPos[4][3]=_aBallPos[2];
        _aLevelBallPos[4][4]=_aBallPos[2];

        _aLevelBallPos[5][0]=_aBallPos[2];
        _aLevelBallPos[5][1]=_aBallPos[1];
        _aLevelBallPos[5][2]=_aBallPos[1];
        _aLevelBallPos[5][3]=_aBallPos[1];
        _aLevelBallPos[5][4]=_aBallPos[1];
        
        _aLevelPlayerPos[0][0]=_aPlayerPos[0];
        _aLevelPlayerPos[0][1]=_aPlayerPos[0];
        _aLevelPlayerPos[0][2]=_aPlayerPos[0];
        _aLevelPlayerPos[0][3]=_aPlayerPos[0];
        _aLevelPlayerPos[0][4]=_aPlayerPos[0];

        _aLevelPlayerPos[1][0]=_aPlayerPos[0];
        _aLevelPlayerPos[1][1]=_aPlayerPos[0];
        _aLevelPlayerPos[1][2]=_aPlayerPos[0];
        _aLevelPlayerPos[1][3]=_aPlayerPos[1];
        _aLevelPlayerPos[1][4]=_aPlayerPos[1];

        _aLevelPlayerPos[2][0]=_aPlayerPos[1];
        _aLevelPlayerPos[2][1]=_aPlayerPos[0];
        _aLevelPlayerPos[2][2]=_aPlayerPos[0];
        _aLevelPlayerPos[2][3]=_aPlayerPos[0];
        _aLevelPlayerPos[2][4]=_aPlayerPos[2];

        _aLevelPlayerPos[3][0]=_aPlayerPos[1];
        _aLevelPlayerPos[3][1]=_aPlayerPos[2];
        _aLevelPlayerPos[3][2]=_aPlayerPos[0];
        _aLevelPlayerPos[3][3]=_aPlayerPos[1];
        _aLevelPlayerPos[3][4]=_aPlayerPos[2];

        _aLevelPlayerPos[4][0]=_aPlayerPos[0];
        _aLevelPlayerPos[4][1]=_aPlayerPos[1];
        _aLevelPlayerPos[4][2]=_aPlayerPos[2];
        _aLevelPlayerPos[4][3]=_aPlayerPos[2];
        _aLevelPlayerPos[4][4]=_aPlayerPos[2];

        _aLevelPlayerPos[5][0]=_aPlayerPos[2];
        _aLevelPlayerPos[5][1]=_aPlayerPos[1];
        _aLevelPlayerPos[5][2]=_aPlayerPos[1];
        _aLevelPlayerPos[5][3]=_aPlayerPos[1];
        _aLevelPlayerPos[5][4]=_aPlayerPos[1];
        
        
        //WALL POSITIONS
        _aWallType.push({x: 0, y: 0, num:0});
        _aWallType.push({x: 525, y: CANVAS_HEIGHT/2-25, num:1});
        _aWallType.push({x: 750, y: CANVAS_HEIGHT/2-25, num:1});
        _aWallType.push({x: 525, y: CANVAS_HEIGHT/2-25, num:2});
        _aWallType.push({x: 750, y: CANVAS_HEIGHT/2-25, num:2});
        _aWallType.push({x: 525, y: CANVAS_HEIGHT/2-25, num:1});
        _aWallType.push({x: 525, y: CANVAS_HEIGHT/2-25, num:1});
        _aWallType.push({x: 525, y: CANVAS_HEIGHT/2-25, num:3});
        _aWallType.push({x: 525, y: CANVAS_HEIGHT/2-25, num:2});

        _aLevelWalls[0][0]=_aWallType[0];
        _aLevelWalls[0][1]=_aWallType[0];
        _aLevelWalls[0][2]=_aWallType[0];
        _aLevelWalls[0][3]=_aWallType[0];
        _aLevelWalls[0][4]=_aWallType[0];

        _aLevelWalls[1][0]=_aWallType[1];
        _aLevelWalls[1][1]=_aWallType[1];
        _aLevelWalls[1][2]=_aWallType[1];
        _aLevelWalls[1][3]=_aWallType[2];
        _aLevelWalls[1][4]=_aWallType[2];

        _aLevelWalls[2][0]=_aWallType[4];
        _aLevelWalls[2][1]=_aWallType[3];
        _aLevelWalls[2][2]=_aWallType[2];
        _aLevelWalls[2][3]=_aWallType[2];
        _aLevelWalls[2][4]=_aWallType[2];

        _aLevelWalls[3][0]=_aWallType[2];
        _aLevelWalls[3][1]=_aWallType[1];
        _aLevelWalls[3][2]=_aWallType[1];
        _aLevelWalls[3][3]=_aWallType[5];
        _aLevelWalls[3][4]=_aWallType[1];

        _aLevelWalls[4][0]=_aWallType[1];
        _aLevelWalls[4][1]=_aWallType[2];
        _aLevelWalls[4][2]=_aWallType[2];
        _aLevelWalls[4][3]=_aWallType[6];
        _aLevelWalls[4][4]=_aWallType[6];

        _aLevelWalls[5][0]=_aWallType[5];
        _aLevelWalls[5][1]=_aWallType[2];
        _aLevelWalls[5][2]=_aWallType[7];
        _aLevelWalls[5][3]=_aWallType[5];
        _aLevelWalls[5][4]=_aWallType[1];
    };
    
    this._onButContinueRelease = function(){
        this.unload();
        
        
        s_oGame.setLevelInfo();
        
        PokiSDK.gameplayStart();
    };
    
    this.getLevel = function(iLevel){
        return(iLevel);
    };
    
    this.getPlayerPosIndex = function(iLevel, iRound){
        if(_aLevelPlayerPos[iLevel][iRound] === _aPlayerPos[0]){
            return 0;
        }else if(_aLevelPlayerPos[iLevel][iRound] === _aPlayerPos[1]){
            return 1;
        }else if(_aLevelPlayerPos[iLevel][iRound] === _aPlayerPos[2]){
            return 2;
        }
            
    };
    
    this.getBallPosition = function(iLevel, iRound){
        return _aLevelBallPos[iLevel][iRound];
    };
    
    this.getPlayerPosition = function(iLevel, iRound){
        return _aLevelPlayerPos[iLevel][iRound];
    };
    
    this.getWallPosition = function(iLevel, iRound){
        return _aLevelWalls[iLevel][iRound];
    };
    
    this.getLevelInfo = function(iLevel){
        var oValue; 
        oValue = _aLevel[iLevel];
        return oValue;
    };
    
    
    this.viewNextLevelPanel = function(){
        $(s_oMain).trigger("end_level");
        
        var ioffsetX = 0;
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_next_level'));
        oContainer.addChild(_oBg); 

        var oSprite = s_oSpriteLibrary.getSprite('but_continue');
        _pStartPosContinue = {x: (CANVAS_WIDTH/2+300), y: CANVAS_HEIGHT -150};
        _oButContinue = new CGfxButton(_pStartPosContinue.x, _pStartPosContinue.y, oSprite);
        _oButContinue.addEventListener(ON_MOUSE_UP, this._onButContinueRelease, this);

        _oCongratulationTextStroke = new createjs.Text(TEXT_CONGRATS," 60px "+FONT_GAME, "#000000");
        _oCongratulationTextStroke.x = CANVAS_WIDTH/2-350;
        _oCongratulationTextStroke.y = 175;
        _oCongratulationTextStroke.textAlign = "left";
        _oCongratulationTextStroke.textBaseline = "alphabetic";
        _oCongratulationTextStroke.lineWidth = 650;
        _oCongratulationTextStroke.outline = 3;
        oContainer.addChild(_oCongratulationTextStroke); //Draws on canvas

        _oCongratulationText = new createjs.Text(TEXT_CONGRATS," 60px "+FONT_GAME, "#ffe51f");
        _oCongratulationText.x = CANVAS_WIDTH/2-350;
        _oCongratulationText.y = 175;
        _oCongratulationText.textAlign = "left";
        _oCongratulationText.textBaseline = "alphabetic";
        _oCongratulationText.lineWidth = 650;
        oContainer.addChild(_oCongratulationText); //Draws on canvas

        _oGoalScoredTextStroke = new createjs.Text(TEXT_GOAL_SCORED+": "," 40px "+FONT_GAME, "#000000");
        _oGoalScoredTextStroke.x = CANVAS_WIDTH/2-300;
        _oGoalScoredTextStroke.y = 275;
        _oGoalScoredTextStroke.textAlign = "left";
        _oGoalScoredTextStroke.textBaseline = "alphabetic";
        _oGoalScoredTextStroke.lineWidth = 650;
        _oGoalScoredTextStroke.outline = 3;
        oContainer.addChild(_oGoalScoredTextStroke); //Draws on canvas

        _oGoalScoredText = new createjs.Text(TEXT_GOAL_SCORED+": "," 40px "+FONT_GAME, "#ffe51f");
        _oGoalScoredText.x = CANVAS_WIDTH/2-300;
        _oGoalScoredText.y = 275;
        _oGoalScoredText.textAlign = "left";
        _oGoalScoredText.textBaseline = "alphabetic";
        _oGoalScoredText.lineWidth = 650;
        oContainer.addChild(_oGoalScoredText); //Draws on canvas

        for(var i = 0; i < iGoalScored; i++, ioffsetX+=26){
            _oBall.push(createBitmap(s_oSpriteLibrary.getSprite('ball_kick_left')));
            _oBall[i].x = CANVAS_WIDTH/2+50+ioffsetX;
            _oBall[i].y = 250;
            oContainer.addChild(_oBall[i]); 
        }
        
    };
    
    this.refreshButtonPos = function(iNewX,iNewY){
        _oButContinue.setPosition(_pStartPosContinue.x,_pStartPosContinue.y - iNewY);
    };
    
    this.unload = function(){
        _oButContinue.unload(); 
        _oButContinue = null;
        
        s_oStage.removeChild(oContainer);
        _oBg = null;
    };
    this._init(iLevel, iGoalScored);
}
