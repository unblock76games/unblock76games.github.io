function CGame(){
    var _bUpdate = false;
    var _bTrackWithCrossing;
    var _bAccelerateCar0;
    var _bAccelerateCar1;

    var _iTotScore;
    var _iCurLevelScore;
    var _iGameState = -1;
    var _iIntervalID;
    var _iTimeElaps;
    var _iCurLevel;
    var _iAiCont;
    var _iDirtyAIValue;
    var _aCurveMapData;
    var _aTrackRails;
    var _aCars;
    var _aMapKeys;
    var _aNumLaps;
    var _aCarTypes;
    
    
    var _oCurve = null;
    var _oBg;
    var _oTrackImage;
    var _oInterface;
    var _oCarAttach;
    var _oCurveAttach;
    var _oTrackContainer;
    var _oCountDown = null;
    var _oEndRaceAnim;
    var _oRaceOverPanel;
    var _oHighlight;
    var _oBgAttach;
    var _oHelpPanel;
    
    this._init = function(){
        _iCurLevel = s_iLevelSelected;
        
        _iTotScore = 0;
        if(s_bSingleMode && s_bQuickRace === false){
            _iTotScore = s_oMain.getScoreTillLevel(_iCurLevel);
        }
       
        _iDirtyAIValue = DIFFICULTY_VALUES[s_iDifficulty];
        _aMapKeys = new Array();
        
        s_oBezier = new CBezier();

	_oBgAttach = new createjs.Container();
        s_oStage.addChild(_oBgAttach);

        
        _oTrackContainer = new createjs.Container();
        s_oStage.addChild(_oTrackContainer);

        //_oCurveAttach = new createjs.Container();
        //_oTrackContainer.addChild(_oCurveAttach);
        
        
        
        _oCarAttach = new createjs.Container();
        _oTrackContainer.addChild(_oCarAttach);
        
        
        
        _oInterface = new CInterface(_iTotScore);
        
        
        this.reset();
   
        _oEndRaceAnim = new CEndRaceAnim();
        _oRaceOverPanel = new CRaceOverPanel();   
        _oHelpPanel = new CHelpPanel(_aCarTypes);
        _oHelpPanel.show();
        
        setVolume("soundtrack",0.3);
    };
    
    this.unload = function(){
        _bUpdate = false;
        clearInterval(_iIntervalID);

        
        _oInterface.unload();
        _oRaceOverPanel.unload();
        s_oStage.removeAllChildren();
    };
    
    this.reset = function(){        
        _iTimeElaps = 0;
        _iCurLevelScore = 0;
        _iAiCont = 0;

/*
        if(_oCurve !== null){
            _oCurveAttach.removeChild(_oCurve);
        }
*/
        
        _oBgAttach.removeAllChildren();
        
        _oBg = createBitmap(s_oSpriteLibrary.getSprite(s_oLevelSettings.getBgForLevel(_iCurLevel)) );
        _oBg.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oBgAttach.addChild(_oBg);
        
        var pPos = s_oLevelSettings.getTrackPos(_iCurLevel);
        _oTrackImage = createBitmap(s_oSpriteLibrary.getSprite("track_"+_iCurLevel));
        _oTrackImage.x = pPos.x;
        _oTrackImage.y = pPos.y;
        _oBgAttach.addChild(_oTrackImage);
        
        if(_oCountDown !== null){
            _oCountDown.unload();
        }
        _oCountDown = new CCountdown(s_oLevelSettings.getSemaphoreInfo(_iCurLevel),_oTrackContainer);
        
        this._initCurve();
        
        _oCarAttach.removeAllChildren();
        this._initCars();
        
        var szTime = "00:00";
        if(getItem("slotcar_time_level_" + _iCurLevel) !== null){
            szTime = formatTime(getItem("slotcar_time_level_" + _iCurLevel) );
        }
        
        _oInterface.reset(szTime,_aCarTypes,_iTotScore);
        
        
        $(s_oMain).trigger("start_level",_iCurLevel);
    };
    
    this.restart = function(){
        this.reset();
        _bUpdate = true;
        
        this.startCountdown();
    };
    
    this.onExitFromHelp = function(){
        _bUpdate = true;
        this.startCountdown();
    };
    
    this.pause = function(){
        PokiSDK.gameplayStop();
        
        _bUpdate = false;
        for(var i=0;i<_aCars.length;i++){
            _aCars[i].pause(true);
        }
        
        if(!s_bMobile){
            this.onKeyUp();
        }
    };
    
    this.unpause = function(){
        PokiSDK.gameplayStart();
        
        _bUpdate = true;
        for(var i=0;i<_aCars.length;i++){
            _aCars[i].pause(false);
        }
    };
    
    this.onKeyDown = function(evt) {
        if(!evt){ 
            evt = window.event; 
        } 
        
        
        _aMapKeys[evt.keyCode] = evt.type == 'keydown';
        evt.preventDefault();
        return false;
    };
    
    this.onKeyUp = function(evt) { 

        if(!evt){ 
            evt = window.event; 
        } 

        _aMapKeys[evt.keyCode] = evt.type == 'keydown';
        
        
        if(!s_bSingleMode && _aMapKeys[KEYCODE_CAR2] === false){
            _aCars[1].decreaseAccelleration();
        }
        
        if(_aMapKeys[KEYCODE_CAR1] === false){
            _aCars[0].decreaseAccelleration();
        }
        
        
        evt.preventDefault();
        return false;
    };
    
    this._onPressButCar0 = function(){
        _bAccelerateCar0 = true;
        _aMapKeys[KEYCODE_CAR1] = true;
    };
    
    this._onPressButCar1 = function(){
        _bAccelerateCar1 = true;
    };
    
    this._onUpButCar0 = function(){
        _aCars[0].decreaseAccelleration();
        _bAccelerateCar0 = false;
        _aMapKeys[KEYCODE_CAR1] = false;
    };
    
    this._onUpButCar1 = function(){
        _aCars[1].decreaseAccelleration();
        _bAccelerateCar1 = false;
    };
    
    this.resetKeys = function(){
        for(var i=0;i<_aMapKeys.length;i++){
            _aMapKeys[i] = false;
        }
    };
    
    this.startCountdown = function(){
        PokiSDK.gameplayStart();
        
        _iGameState = STATE_GAME_START; 
    };
    
    this.startRace = function(){
        if(s_bSingleMode){
            _oHighlight.stop();
            _oHighlight.visible = false;
        }
        _iGameState = STATE_GAME_MOVE;
    };
    
    this._initCurve = function(){
        var _aCurve = s_oLevelSettings.getCurveForLevel(_iCurLevel);

	_aCurveMapData = new Array();
        

	for(var j = 0;j<_aCurve.length - 2;++j){
                var oPoint0 = (j === 0)?new createjs.Point(_aCurve[0].x,_aCurve[0].y):new createjs.Point((_aCurve[j].x+_aCurve[j+1].x)/2,
                                                                                            (_aCurve[j].y+_aCurve[j+1].y)/2);
                var oPoint1 = new createjs.Point(_aCurve[j+1].x,_aCurve[j+1].y);
                var oPoint2 = (j <= _aCurve.length - 4)?new createjs.Point((_aCurve[j+1].x + _aCurve[j+2].x)/2,(_aCurve[j+1].y + _aCurve[j+2].y)/2):new createjs.Point(_aCurve[j+2].x,_aCurve[j+2].y);
                var steps = s_oBezier.init(oPoint0, oPoint1, oPoint2, STEP_LENGTH);  
                for(var m = 1;m<=steps;++m){
                    var oData = s_oBezier.getAnchorPoint(m);
                    oData.max_speed = MAX_SPEED_PER_TYPE[_aCurve[j].type];
                    _aCurveMapData.push(oData);
                }
        }
        
        
        
        var oPoint;
        var h;
        _bTrackWithCrossing = s_oLevelSettings.isTrackWithCrossing(_iCurLevel);
        var iCrossingAngle = 35;
        var oFirstPoint;
        var iNumPointForCrossing = parseInt(_aCurveMapData.length * 0.05);

        _aTrackRails = new Array();
        //var aCurveGfx = new Array();
        for(var k=0;k<NUM_CARS;k++){
            var iStrength = DIST_TRACKS;
            /*
            var oCurveGfx = new createjs.Graphics();
            oCurveGfx.setStrokeStyle(4);
            oCurveGfx.beginStroke("#000");
            aCurveGfx.push(oCurveGfx);
          */  
            _aTrackRails[k] = new Array();

            var iCont = 0;
            for ( h = 0; h <_aCurveMapData.length-1; h++){
                    var iEaseQty = 0;
                    if(_bTrackWithCrossing && h > (_aCurveMapData.length - iNumPointForCrossing - 100) && h < _aCurveMapData.length-100){
                        iEaseQty = easeInOutQuad(iCont,0,2,iNumPointForCrossing) ;
                        iStrength = DIST_TRACKS - ((DIST_TRACKS*2)*easeInOutQuad(iCont,0,1,iNumPointForCrossing));
                        iCont++;
                    }

                    oPoint = { x : (_aCurveMapData[h+1].x - _aCurveMapData[h].x), y : (_aCurveMapData[h+1].y - _aCurveMapData[h].y)  };
                    oPoint = normalize(oPoint);
                    if(k===0){
                        oPoint = rot90CCW(oPoint);
                    }else{
                        oPoint = rot90CW(oPoint);
                    }
                    

                    oPoint.x *= iStrength;
                    oPoint.y *= iStrength;
                    oPoint.x += _aCurveMapData[h].x;
                    oPoint.y += _aCurveMapData[h].y;


                    //var iAngle = _aCurveMapData[h].degrees;
                    var iDegree = _aCurveMapData[h].degrees;
                    if(h === 0){
                        oFirstPoint = {x:oPoint.x,y:oPoint.y};
                        //oCurveGfx.moveTo(oPoint.x,oPoint.y);
                    }else{
                        //oCurveGfx.lineTo(oPoint.x,oPoint.y);
                        if(iStrength !== DIST_TRACKS){
                            var iAngle;
                            if(iEaseQty < 1){
                                iAngle =  iEaseQty * iCrossingAngle;
                            }else{
                                iEaseQty -= 1;
                                iAngle =  iCrossingAngle - (iEaseQty * iCrossingAngle);
                            }
                            

                            if(k === 0){
                                iAngle *= -1; 
                            }
                            iDegree += iAngle;
                        }
                    }

                    _aTrackRails[k].push({x:oPoint.x,y:oPoint.y,degrees:iDegree, max_speed:_aCurveMapData[h].max_speed});
            }

            oPoint = { x : (_aCurveMapData[0].x - _aCurveMapData[_aCurveMapData.length-1].x), y : (_aCurveMapData[0].y - _aCurveMapData[_aCurveMapData.length-1].y)  };
            oPoint = normalize(oPoint);
            if(k===0){
                oPoint = rot90CCW(oPoint);
            }else{
                oPoint = rot90CW(oPoint);
            }
            

            oPoint.x *= iStrength;
            oPoint.y *= iStrength;
            oPoint.x += _aCurveMapData[_aCurveMapData.length-1].x;
            oPoint.y += _aCurveMapData[_aCurveMapData.length-1].y;


            //oCurveGfx.lineTo(oPoint.x,oPoint.y);
            _aTrackRails[k].push({x:oPoint.x,y:oPoint.y,degrees:_aCurveMapData[_aCurveMapData.length-1].degrees,max_speed:_aCurveMapData[_aCurveMapData.length-1].max_speed});
        }
/*
        for(var i=0;i<aCurveGfx.length;i++){
            aCurveGfx[i].endFill();
            
            var oCurve = new createjs.Shape(aCurveGfx[i]);
            _oCurveAttach.addChild(oCurve);
        }
*/
        
        

	//_oCurveAttach.cache(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };
    
    this._initCars = function(){
        _aCars = new Array();
        _aNumLaps = new Array();

        if(s_bSingleMode){
            var oSprite = s_oSpriteLibrary.getSprite('car_highlight');
            var oData = {   
                            images: [oSprite], 
                            // width, height & registration point of each sprite
                            frames: {width: 90, height: 54, regX: 45, regY: 27}, 
                            animations: {start:0,anim:[0,35]}
                        };

            var oSpriteSheet = new createjs.SpriteSheet(oData);
            _oHighlight = createSprite(oSpriteSheet,"anim",45,27,90,54);
            _oHighlight.x = _aTrackRails[0][0].x;
            _oHighlight.y = _aTrackRails[0][0].y;
            _oHighlight.rotation = _aTrackRails[0][0].degrees;
            _oCarAttach.addChild(_oHighlight);
        
            var iCpuCarIndex = _iCurLevel-1;
            if(iCpuCarIndex === s_iSelectCar1){
                iCpuCarIndex++;
            }
            
            _aCarTypes = [s_iSelectCar1,iCpuCarIndex];
        }else{
            _aCarTypes = [s_iSelectCar1,s_iSelectCar2];
        }
        
        for(var i=0;i<NUM_CARS;i++){
            _aCars[i] = new CCar(i,_aCarTypes[i],_aTrackRails[i],_oCarAttach);
            _aNumLaps[i] = 0;
        }
    };

    this.nextLevel = function(){
        _oBgAttach.removeChild(_oBg);
        _oBg = createBitmap(s_oSpriteLibrary.getSprite(s_oLevelSettings.getBgForLevel(_iCurLevel)));
        _oBgAttach.addChild(_oBg);
	
        _iCurLevel++;
        
        this.reset();
        
        _bUpdate = true;
        this.startCountdown();
    };
    
    this.swapTrackRail = function(iIndexCar,iCurTrackRail){
        if(_bTrackWithCrossing){
            iCurTrackRail++;
            if(iCurTrackRail === RAIL_SEQUENCE_PER_CAR[iIndexCar].length){
                iCurTrackRail = 0;
            }
        }
        
        _oInterface.refreshBest(iIndexCar,formatTime(_aCars[iIndexCar].checkBestTime()));
        
        _aNumLaps[iIndexCar]++;
        if(_iGameState !== STATE_GAME_OVER  && _aNumLaps[iIndexCar] === NUM_LAPS){
            this._raceOver(iIndexCar);
        }
        
        _oInterface.refreshLap(iIndexCar,_aNumLaps[iIndexCar]);
        
        
        
        return {track:_aTrackRails[iCurTrackRail],rail_index:iCurTrackRail};
    };
    
    this.decreaseLap = function(iIndexCar){
        if(_aNumLaps[iIndexCar]>0){
            _aNumLaps[iIndexCar]--;
        }
    };
    
    this._raceOver = function(iWinner){
        s_oMain.pokiShowCommercial();
        PokiSDK.gameplayStop();
        
        _iGameState = STATE_GAME_OVER;
        
        _oInterface.disablePlayerButs();
        if(s_bMobile){
            this._onUpButCar0();
            this._onUpButCar1();
        }else{
            this.resetKeys();
            for(var i=0;i<_aCars.length;i++){
                _aCars[i].decreaseAccelleration();
            }
        }
        
        _oEndRaceAnim.show();
        
        
        
        //CHECK IF WINNER IS A HUMAN PLAYER
        var iBestTime = 0;
        if( (s_bSingleMode && iWinner === 0) || (!s_bSingleMode) ){
            iBestTime = s_oMain.getBestTime(_iCurLevel);
            
            PokiSDK.happyTime(1);

            if(iBestTime !== 0 && iBestTime > _aCars[iWinner].getTotTime() || iBestTime === null){
                iBestTime = _aCars[iWinner].getTotTime();
                s_oMain.setLocalStorageTime(_aCars[iWinner].getTotTime(),_iCurLevel);
            }
        }
        
        if(s_bSingleMode && s_bQuickRace === false && iWinner === 0){
            PokiSDK.happyTime(1);
            
            var iScore = Math.round( ((MAX_SCORE_PER_TRACK - _aCars[iWinner].getTotTime() )/1000) * DIFFICULTY_MULTIPLIER[s_iDifficulty]);
            if(iScore<0){
                iScore = 0;
            }
            _iTotScore += iScore;
            
            s_oMain.setLocalStorageLevel(_iCurLevel+1);
            s_oMain.setLocalStorageScore(iScore,_iCurLevel);
        }

        
        this._prepareRaceOverPanel(iWinner,iBestTime);
        
        $(s_oMain).trigger("end_level",_iCurLevel);
    };
    
    this._prepareRaceOverPanel = function(iWinner,iBestTime){
        var szTitle;
        var aButs = [true,true,true];
        var oParams;
        if(s_bSingleMode){
            if(!s_bQuickRace && _iCurLevel === NUM_LEVELS && iWinner===0){
                szTitle = TEXT_CONGRATS;
                aButs = [true,false,true];
                oParams = {best:iBestTime,time:_aCars[0].getTotTime(),score:_iTotScore};
                
                $(s_oMain).trigger("share_event",_iTotScore);
            }else{
                szTitle = iWinner===0?TEXT_YOU_WON:TEXT_YOU_LOSE;
                if(s_bQuickRace){
                    oParams = {best:iBestTime,time:_aCars[0].getTotTime()};
                }else{
                    oParams = {best:iBestTime,time:_aCars[0].getTotTime(),score:_iTotScore};
                }
            }
        }else{
            szTitle = (iWinner===0?(TEXT_PLAYER+" 1 "):(TEXT_PLAYER + " 2 " )) + TEXT_WON;

            oParams = {best:iBestTime,time:_aCars[iWinner].getTotTime()};
        }
        
        if(szTitle === TEXT_YOU_LOSE){
            playSound("arrival_lose",1,false);
        }else{
            playSound("arrival_win",1,false);
        }
        
        var iLevel = _iCurLevel;
        setTimeout(function(){
                            _oEndRaceAnim.hide();
                            _oRaceOverPanel.show(szTitle,iLevel,aButs,oParams);
                        },2500);
    };
    
    
    this.getTrackPoint = function(iTrackIndex,iFrame){
        return _aTrackRails[iTrackIndex][iFrame];
    };
    
    this.getTrack = function(iIndex){
        return _aTrackRails[iIndex];
    };
    
    this._opponentAI = function(){
        if(_aCars[1].forecastOutOfTrack(_iDirtyAIValue) ){
             _aCars[1].decreaseAccelleration();    
        }else{
             _aCars[1].increaseAccelleration();
        }
    };

    this.findNewPosAfterCarCollision = function(iCarIndex1,iCarIndex2){
        
        //FIND MORE BACKWARD CAR 
        if(_aCars[iCarIndex1].getFotogram() > _aCars[iCarIndex2].getFotogram()){
            while(this.checkCollision(_aCars[iCarIndex1],_aCars[iCarIndex2])){
                if(_aCars[iCarIndex2].decreasePosAfterCollision() === false){
                    _aCars[iCarIndex1].decreasePosAfterCollision();
                }
            }
        }else{
            while(this.checkCollision(_aCars[iCarIndex1],_aCars[iCarIndex2])){
                if(_aCars[iCarIndex1].decreasePosAfterCollision() === false){
                    _aCars[iCarIndex2].decreasePosAfterCollision();
                }
            }
        }
    };
  
    this.checkCollision = function(oCar1,oCar2){
        var oRectCar1 = oCar1.getRectCollision();
        var oOtherBox = oCar2.getBox();

        if(!oRectCar1.refresh(oOtherBox)){
                return true;
        }else{
                return false;
        }
    };
    
    this.onExit = function(){
        this.unload();
        s_oMain.gotoMenu();
        $(s_oMain).trigger("end_session");
        $(s_oMain).trigger("share_event",_iTotScore);
    };
    
    this._updateMove = function(){
        if(_iGameState === STATE_GAME_OVER){
            return;
        }
        
        for(var i=0;i<_aCars.length;i++){
            for(var j=i+1;j<_aCars.length;j++){
                
                //CHECK COLLISION
                if( !_aCars[i].isDisabled() && !_aCars[j].isDisabled()  && this.checkCollision(_aCars[i],_aCars[j])){   
                    playSound("hit",1,false);
                    
                    //CHECK IF CARS ARE ON THE SAME RAIL OR NOT
                    if(_aCars[i].getTrackRail() === _aCars[j].getTrackRail()){
                        if(_aCars[i].getFotogram() > _aCars[j].getFotogram()){
                            _aCars[i].outOfTrack();
                        }else{
                            _aCars[j].outOfTrack();
                        }
                    }else{
                        if(_aCars[i].getFotogram() > _aCars[j].getFotogram() && _aCars[j].getFotogram() > 1000){
                            _aCars[i].outOfTrack();
                        }else{
                            _aCars[j].outOfTrack();
                        }
                    }
                }
            }
            
            _aCars[i].increasePos();
            _aCars[i].updateTime();
            _oInterface.refreshTotTime(i,formatTime(_aCars[i].getTotTime()));
        }
        
        
        if(s_bMobile){
            if(_bAccelerateCar0){
                _aCars[0].increaseAccelleration();
            }
            if(_bAccelerateCar1){
                _aCars[1].increaseAccelleration();
            }
        }else{
            if(!s_bSingleMode && _aMapKeys[KEYCODE_CAR2]){
                _aCars[1].increaseAccelleration();
            }

            if(_aMapKeys[KEYCODE_CAR1]){
                _aCars[0].increaseAccelleration();
            }
        }
        
        _iAiCont++;
        if(s_bSingleMode && _iAiCont > AI_COUNTER_UPDATE && _iGameState === STATE_GAME_MOVE){
            _iAiCont = 0;
            AI_COUNTER_UPDATE = 0;
            this._opponentAI();
        }
    };


    this.update = function(){
        if(_bUpdate === false){
            return;
        }

        switch(_iGameState){
            case STATE_GAME_START:{
                    _oCountDown.update();
                    break;
            }
            case STATE_GAME_MOVE:{
                   this._updateMove(); 
                   break;
            }
            case STATE_GAME_OVER:{
                    for(var i=0;i<_aCars.length;i++){
                        _aCars[i].increasePos();
                    }
                    break;
            }
        }
    };
    
    s_oGame = this;

        
    this._init();
}

var s_oGame;
var s_oBezier;