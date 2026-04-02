function CDices() {
    var _oDiceContainer;
    var _iDiceResult1;
    var _iDiceResult2;
    var _oDice1;
    var _oDice2;
    var _oDiceLaunch;
    var _bAnimationOn = false;
    var _bFirstLaunch;

    this._init = function () {
        _bFirstLaunch = true;
        
        s_oGame.setTurnReady(false);

        _oDiceContainer = new createjs.Container;
        s_oStage.addChild(_oDiceContainer);

        // Dices launch animation
        var oData = {   
                images: [s_oSpriteLibrary.getSprite("launch_dices")], 
                framerate: 24,
                frames: {width: 512, height: 194, regX: 512, regY: 194},
                animations: { stop: [14,14], idle: [0, 14, "stop"] }
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oDiceLaunch = createSprite(oSpriteSheet, 0, 512, 194, 512, 194);
        _oDiceLaunch.x = CANVAS_WIDTH;
        _oDiceLaunch.y = CANVAS_HEIGHT;
        _oDiceLaunch.visible = false;
        _oDiceContainer.addChild(_oDiceLaunch);
        
        // Dice1 animations
        var oData = {
                images: [s_oSpriteLibrary.getSprite("dice_a_1"),
                         s_oSpriteLibrary.getSprite("dice_a_2"),
                         s_oSpriteLibrary.getSprite("dice_a_3"),
                         s_oSpriteLibrary.getSprite("dice_a_4"),
                         s_oSpriteLibrary.getSprite("dice_a_5"),
                         s_oSpriteLibrary.getSprite("dice_a_6")],
                framerate: 24,
                frames: {width: 318, height: 224, regX: 0, regY: 0},
                animations: { stop1:[11,11], idle1: [ 0, 11, "stop1"],
                              stop2:[23,23], idle2: [12, 23, "stop2"],
                              stop3:[35,35], idle3: [24, 35, "stop3"],
                              stop4:[47,47], idle4: [36, 47, "stop4"],
                              stop5:[59,59], idle5: [48, 59, "stop5"],
                              stop6:[71,71], idle6: [60, 71, "stop6"]} 
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oDice1 = createSprite(oSpriteSheet, 0, 318/2, 224/2, 318, 224);
        // DICE 1 START POSITION (WITH OFFSET)
        _oDice1.x = CANVAS_WIDTH_HALF - 100;
        _oDice1.y = CANVAS_HEIGHT_HALF - 50;
        _oDice1.visible = false;
        _oDiceContainer.addChild(_oDice1);

        // Dice2 animations
        var oData = {
                images: [s_oSpriteLibrary.getSprite("dice_b_1"),
                         s_oSpriteLibrary.getSprite("dice_b_2"),
                         s_oSpriteLibrary.getSprite("dice_b_3"),
                         s_oSpriteLibrary.getSprite("dice_b_4"),
                         s_oSpriteLibrary.getSprite("dice_b_5"),
                         s_oSpriteLibrary.getSprite("dice_b_6")],
                framerate: 30,
                frames: {width: 384, height: 320, regX: 0, regY: 0},
                animations: { stop1:[ 16, 16], idle1: [ 0,  16, "stop1"],
                              stop2:[ 34, 34], idle2: [18,  34, "stop2"],
                              stop3:[ 52, 52], idle3: [36,  52, "stop3"],
                              stop4:[ 70, 70], idle4: [54,  70, "stop4"],
                              stop5:[ 88, 88], idle5: [72,  88, "stop5"],
                              stop6:[106,106], idle6: [90, 106, "stop6"]} 
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);

        _oDice2 = createSprite(oSpriteSheet, 0, 384/2, 320/2, 384, 320);
        // DICE 2 START POSITION (WITH OFFSET)
        _oDice2.x = CANVAS_WIDTH_HALF + 95;
        _oDice2.y = CANVAS_HEIGHT_HALF - 75;
        _oDice2.visible = false;
        _oDiceContainer.addChild(_oDice2);
    };

    this.isAnimationOn = function() {
        return _bAnimationOn;
    };
    
    this.checkToRetry = function() {
        s_oGame.checkForFirstTurn();

        if (_iDiceResult1 + _iDiceResult2 === 9) {
            var iRelaunchVar = Math.floor((Math.random() * 100) + 1);

            if (iRelaunchVar > DICE_RETRY_VAR) {
                _iDiceResult1 = Math.floor((Math.random() * 6) + 1);
                _iDiceResult2 = Math.floor((Math.random() * 6) + 1);
            };
        }
    };
    
    this.show = function() {
        _oDice1.visible = _oDice2.visible = false;
        _oDice2.on("animationend", this.movePlayer);

        s_oGame.setTurnReady(false);
        
        // GENERATE RANDOM RESULTS FOR EACH DICE (1 TO 6)
        _iDiceResult1 = Math.floor((Math.random() * 6) + 1);
        _iDiceResult2 = Math.floor((Math.random() * 6) + 1);

        // TO AVOID TOO MUCH TIMES THAT THE FIRST LAUNCH IS 9 (THUS WINNING 
        // THE GAME, THIS PART WILL DO ANOTHER LAUNCH IN SOME CASES 
        // (DICE_RETRY_VAR IS THE PERCENTAGE THAT THE 9 WILL BE ACCEPTED)
        if (_bFirstLaunch === true) {
            s_oDices.checkToRetry();
        }
        
        _bAnimationOn = true;
        
        playSound("dices",1,0);

        // START THE ANIMATION FOR DICES LAUNCH
        _oDiceLaunch.visible = true;
        _oDiceLaunch.gotoAndPlay('idle');
        _oDiceLaunch.on("animationend", function() {
            if (_oDiceLaunch.visible) {
                s_oDices.secondAnimation();
            };
        });
    };

    this.manualShow = function(iNumber) {
        _oDice1.visible = _oDice2.visible = false;
        _oDice2.on("animationend", this.movePlayer);

        s_oGame.setTurnReady(false);
        
        // GENERATE RANDOM RESULTS FOR EACH DICE (1 TO 6)
        if(iNumber<=7){
            _iDiceResult1 = iNumber-1;
            _iDiceResult2 = 1;
        }else {
            _iDiceResult1 = 6;
            _iDiceResult2 = iNumber-6;
        }
        
        _bAnimationOn = true;
        
        playSound("dices",1,0);

        // START THE ANIMATION FOR DICES LAUNCH
        _oDiceLaunch.visible = true;
        _oDiceLaunch.gotoAndPlay('idle');
        _oDiceLaunch.on("animationend", function() {
            if (_oDiceLaunch.visible) {
                s_oDices.secondAnimation();
            };
        });
    };

    this.secondAnimation = function() {
        _oDiceLaunch.visible = false;
        _oDice1.alpha = _oDice2.alpha = 1;
        _oDice1.visible = _oDice2.visible = true;
        
        // START THE ANIMATION FOR EACH DICE, ACCORDING TO THE RESULT WE NEED
        _oDice1.gotoAndPlay('idle'+_iDiceResult1);
        _oDice2.gotoAndPlay('idle'+_iDiceResult2);
        
        s_oGame.getDiceResult1(_iDiceResult1);
        s_oGame.getDiceResult2(_iDiceResult2);
        _bAnimationOn = false;
    };

    this.movePlayer = function() {
        if (_bAnimationOn === false) {
            _bAnimationOn = true;
            // AFTER THE ANIMATION IS OVER, MOVE THE PLAYER OF THE NEEDED SQUARES
            s_oGame.movePlayer( _iDiceResult1+_iDiceResult2 );
        };
    };

    this.fadeOutTween = function() {
        createjs.Tween.get(_oDice1, {loop: false})
                .to({alpha: 0}, 200);
        createjs.Tween.get(_oDice2, {loop: false})
                .to({alpha: 0}, 200)
                .call(this.hide);
    };

    this.returnDiceResult1 = function() {
        return _iDiceResult1;
    };

    this.returnDiceResult2 = function() {
        return _iDiceResult2;
    };

    this.hide = function() {
        _oDice1.visible = _oDice2.visible = false;
    };

    this.unload = function () {
        s_oDices = null;
    };

    this.isFirstLaunch = function(){
        return _bFirstLaunch;
    };

    this.setFirstLaunch = function(value){
        _bFirstLaunch = value;
    };

    s_oDices = this;

    this._init();
}

var s_oDices = this;