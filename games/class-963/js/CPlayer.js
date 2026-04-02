function CPlayer(refGame,oCartCoords){
    var _bBallGrabbed = false,
        _bWaitToThrow = false,
        _bEndIdling = false,

        _bFrameIncreasing = true, // frames increasing
        _iCurrFrame = undefined, // current played frame
        _iCurrScene = 1,

        _refGame = refGame;

    var _aSprites = [];

    this.init = function(oCartCoords){
        for (var i = 0; i <= 131; i++) {
            _aSprites.push(createBitmap(s_oSpriteLibrary.getSprite("pl" + i)));
            _aSprites[i].visible = false;
            _aSprites[i].regX = PLAYER_WIDTH/2;
            _aSprites[i].regY = PLAYER_HEIGHT/2;
            _aSprites[i].x = oCartCoords.x - PLAYER_WIDTH;
            _aSprites[i].y = oCartCoords.y - 0.55*PLAYER_HEIGHT;
            s_oStage.addChild(_aSprites[i]);
        };
    };

    this.nextScene = function(oCartCoords){
        _iCurrScene++;
        this.newBall();

        if (_iCurrScene < 5) {
                for (var i = 0; i <= 131; i++) {
                        _aSprites[i].x = oCartCoords.x - PLAYER_WIDTH;
                        _aSprites[i].y = oCartCoords.y - 0.55*PLAYER_HEIGHT;
                };
        } else {
                for (var i = 0; i <= 131; i++) {
                        _aSprites[i].x = oCartCoords.x + 0.05*PLAYER_WIDTH;
                        _aSprites[i].y = oCartCoords.y - 0.55*PLAYER_HEIGHT;
                        _aSprites[i].scaleX = - 1;
                };
        };
    };

    this.idle1 = function(){
            this.playFrames(0,15,false);
    };

    this.grab1 = function(){
            if (_iCurrFrame < 15) {
                    this.playFrames(0,15,true);
            } else if (_iCurrFrame <= 38){
                    if (_iCurrFrame === 35) {
                            _bBallGrabbed = true;
                    };
                    this.playFrames(16,39,true);		
            } else if (_iCurrFrame === 39 && _bWaitToThrow === false){
                    // waiting to throw
                    _bWaitToThrow = true;
                    _refGame.ballWaitToThrow(); 

                    createjs.Tween.get(_aSprites[_iCurrFrame])
                        .to({scaleY: 0.98, y: oCartCoords.y - 0.55*PLAYER_HEIGHT + 5}, 450,createjs.Ease.linear)
                        .call(function(){
                            createjs.Tween.get(_aSprites[_iCurrFrame])
                            .to({scaleY: 1, y: oCartCoords.y - 0.55*PLAYER_HEIGHT}, 450,createjs.Ease.linear)
                            .call(function(){
                                _bWaitToThrow = false;
                        }); 
                    });

            };
    };

    this.grab2 = function(){
            if (!_bBallGrabbed || (_bBallGrabbed === true && _iCurrFrame < 61)) {
                    this.playFrames(44, 61,true);
                    if (_iCurrFrame === 57) {_bBallGrabbed = true;};
            } else if (_bBallGrabbed === true && _iCurrFrame >= 61 && _bWaitToThrow === false) {
                    _bWaitToThrow = true;
                    _refGame.ballWaitToThrow();

                    createjs.Tween.removeTweens(_aSprites[_iCurrFrame]);
                    createjs.Tween.get(_aSprites[_iCurrFrame])
                        .to({scaleY: 0.98, y: oCartCoords.y - 0.55*PLAYER_HEIGHT + 5}, 450,createjs.Ease.linear)
                        .call(function(){
                            createjs.Tween.get(_aSprites[_iCurrFrame]).
                            to({scaleY: 1, y: oCartCoords.y - 0.55*PLAYER_HEIGHT}, 450,createjs.Ease.linear).
                            call(function(){
                                _bWaitToThrow = false;
                        }); 
                    });

            };
    };

    this.throwing = function(){
            if (_iCurrFrame<43) {
                    this.playFrames(40,43,true);
            } else {
                    return true;
            };
    };

    this.endTurn = function(){
            if (!_bEndIdling) {
                    this.playFrames(86,131,true);
                    if(_iCurrFrame === 131){_bEndIdling = true;}; 
            } else {
                    this.idle1();
            };
    };

    // bStartOver = true -> @ after last frame goes to first 
    this.playFrames = function(iFirst,iLast,bStartOver){
            if(_iCurrFrame < iFirst || _iCurrFrame > iLast || _iCurrFrame === undefined){
                    if(_aSprites[_iCurrFrame]){_aSprites[_iCurrFrame].visible = false};
                    _iCurrFrame = iFirst; 
                    _aSprites[_iCurrFrame].visible = true;
                    _bFrameIncreasing = true;
            } else {
                    _aSprites[_iCurrFrame].visible = false;
                    if (_iCurrFrame === iFirst && _bFrameIncreasing === false) {
                            _bFrameIncreasing = true;
                            _iCurrFrame += 1;
                            _aSprites[_iCurrFrame].visible = true;
                    } else if (_iCurrFrame === iLast) {
                            if (bStartOver === true) {
                                    _iCurrFrame = iFirst;
                                    _aSprites[_iCurrFrame].visible = true;					
                            } else {
                                    _bFrameIncreasing = false;
                                    _iCurrFrame--;
                                    _aSprites[_iCurrFrame].visible = true;				
                            };
                    } else {
                            if (_bFrameIncreasing) {
                                    _iCurrFrame++;
                                    _aSprites[_iCurrFrame].visible = true;					
                            } else {
                                    _iCurrFrame--;
                                    _aSprites[_iCurrFrame].visible = true;
                            };				
                    };
            };
    };

    // get player position
    this.getPlCoords = function(){
            return {x: _aSprites[39].x - PLAYER_WIDTH/8,y: _aSprites[39].y - PLAYER_HEIGHT/10 - BALL_SIZE/2};
    };

    this.isBallGrabbed = function(){
            return _bBallGrabbed;
    };

    this.newBall = function(){
            _bBallGrabbed = false; 
            _bWaitToThrow = false;
            _bEndIdling = false;
    };

    this.init(oCartCoords);	
};