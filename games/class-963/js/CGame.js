function CGame(){
    var _bBallThrowing = false;
    var _bResetSelector = false;
    var _bBallGrabbed = false;
    var _bResettingTurn = true;
    var _bScored = false;
    var _bRimCollision = false;
    var _iGameState; // 0 = init, 1 = idle, 2 = grab, 3 = throwing, 4 = thrown, 5 = PrepForNextLevel
    var _iCurrentScreen;
    var _iShotsLeft;
    var _iPoints = 0;
    var _iShots = 0;
    var _iFrame = 0;
    var _fStartTime;
    var _fTimeLeft;
    var _szGameState;

    var _oBall = [];
    var _oWorld;
    var _oInterface;
    var _oHelpPanel;
    var _oEndPanel = null;
    var _oPlayer;
    var _oSceneStatic;

    var groundMaterial,
        ballMaterial,
        basketMaterial;

    var _bPokiStart;
    
    this._init = function(){
        _bPokiStart = false;
        
        // init variables
        _iGameState = 0; 
        _iCurrentScreen = 1;
        _iShotsLeft = NUM_SHOT_PER_SCENE;
        _fTimeLeft = TIME_AVAILABLE;

        // init cannon.js 
    	_oWorld = new CANNON.World();
        _oWorld.gravity.set(0,0,-400);
        _oWorld.broadphase = new CANNON.NaiveBroadphase();
        _oWorld.solver.iterations = 5;

        groundMaterial = new CANNON.Material();
        ballMaterial = new CANNON.Material();
        basketMaterial = new CANNON.Material();

        var ground_ground_cm = new CANNON.ContactMaterial(
            groundMaterial, groundMaterial, {
                friction: 0.20,
                restitution: 0.55
        });
        var ball_ground_cm = new CANNON.ContactMaterial(
            ballMaterial, groundMaterial, {
                friction: 0.05,
                restitution: 0.35
        });
        var ball_basket_cm = new CANNON.ContactMaterial(
            ballMaterial, basketMaterial, {
                friction: 0.25,
                restitution: 0.5
        });

        _oWorld.addContactMaterial(ground_ground_cm);
        _oWorld.addContactMaterial(ball_ground_cm);
        _oWorld.addContactMaterial(ball_basket_cm); 

        // init floor 
        var floorShape = new CANNON.Plane();
        var floorBody = new CANNON.Body({mass: 0, material: groundMaterial});
        floorBody.addShape(floorShape);
        _oWorld.add(floorBody);

        // init static scene (Background + Basket + Ball Cart)
        _oSceneStatic = new CSceneStatic(_oWorld,_iCurrentScreen,groundMaterial,basketMaterial);
        var _oCartCoords = _oSceneStatic.getCartCoords();

        // init player anims etc
        _oPlayer = new CPlayer(this,_oCartCoords);

        // init CBALL (1st screen) 
        for (var i = 0; i < _iShotsLeft; i++) {
            _oBall.push(new CBall(_oWorld,groundMaterial,groundMaterial,_iCurrentScreen, i, _oCartCoords));
        };

        // init CInterface
        _oInterface = new CInterface(this);
        _oHelpPanel = new CHelpPanel();

        setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
        playSound("us_crowd", 1, true);
        $(s_oMain).trigger("start_level",1);
    };

    this.unload = function(){
        $(s_oMain).trigger("end_session");
        if(_iPoints > 0){
            $(s_oMain).trigger("share_event",_iPoints);
        }
        
        stopSound("us_crowd");
        
        // Unload CANNON.Js
        var iBodies = _oWorld.bodies.length;
        for (var i = 0; i < iBodies; i++) {
            _oWorld.remove( _oWorld.bodies[0] );
        };
        _oWorld = null;

        // Unload s_oStage objects (Create.Js)
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllEventListeners();
        s_oStage.removeAllChildren();

        _oInterface.unload();
        
        if(_oEndPanel !== null){
            _oEndPanel.unload();
        }

        
    };

    this.onExit = function(){
        s_oGame.setPokiStart(false);
        s_oMain.pokiShowCommercial( ()=>{
            s_oGame.unload();
            s_oMain.gotoMenu();
        });
    };

    this.exitFromHelp = function(){
        _oHelpPanel.unload();
        // switch to IDLE
        _iGameState = 1;
        
        s_oGame.setPokiStart(true);
    };

    this.getState = function(){
        return _oGameStates[_szGameState];
    };

    this.ballWaitToThrow = function() {
        if(_iShotsLeft>0){
            _oBall[_iShotsLeft - 1].waitToThrow();
        };
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
    
    this.update = function(iCurTime){
        if (_iGameState > 1) {
            // CHECK TIME
            if (_fStartTime === undefined) {
                _fStartTime = iCurTime;
            } else {
                _fTimeLeft = Math.floor( TIME_AVAILABLE - (iCurTime - _fStartTime) );

                if (_fTimeLeft >= 0) {
                    _oInterface.updateTime(_fTimeLeft);
                    _oSceneStatic.updateTime(_fTimeLeft);
                } else {
                    playSound("us_buzzer", 1, false);
                    _oEndPanel = new CEndPanel(_fTimeLeft,_iPoints,_iShots,this);

                    _iGameState = -1;
                };
            };
        };

        // IDLE - just used for 1st shot
        if (_iGameState === 1) {
            _iFrame++;

            _oPlayer.idle1();

            if (_iFrame>30){
                _iGameState = 2;
            };        
        };

        // GRABBING BALL - just used for 1st shot
        if (_iGameState === 2) {

            _oInterface.listenForClick();
            _oPlayer.grab1();

            if (_oPlayer.isBallGrabbed() && !_bBallGrabbed) {
                _bBallGrabbed = true;
                _oBall[_iShotsLeft - 1].grab(_oPlayer.getPlCoords());
                for (var i = 0; i < _iShotsLeft - 1; i++) {
                      _oBall[i].slide();
                };  
            };

            if (_oInterface.isVectorAquired().state){
                _iGameState = 3;
            };   
        };

        // THROWING
        if (_iGameState === 3) {
            if (!_bBallThrowing) {
                _bBallThrowing = true;
                _oBall[_iShotsLeft - 1].throwingBall(_oPlayer.getPlCoords(),
                                        _oInterface.isVectorAquired().vector,
                                        _oBall[_iShotsLeft - 1]);
                _oBall[_iShotsLeft - 1].update();              
            };

            if(_oPlayer.throwing(_iCurrentScreen)) {
                _iGameState = 4;
                _bResettingTurn = true;
                _bBallThrowing = false;
                _bScored = false;
                _bRimCollision = false;
            };
        };

        // THROWN
        if (_iGameState === 4) {

            if (_bResettingTurn) {
                _bResettingTurn = false;
                _bBallGrabbed = false;
                _oPlayer.newBall();
                _oSceneStatic.newBall();
                _iShotsLeft--;   
                _iShots++;
                _oInterface.updateShots(_iShots);             
            }; 

            _oBall[_iShotsLeft].update();

            var bBasketState = _oSceneStatic.updateBasket(_oBall[_iShotsLeft].getPosition());
            if(bBasketState === true){
                _bScored = true;

                if(_oBall[_iShotsLeft].getCartPosition() === 0){
                    _iPoints += POINT_FOR_SPECIAL_BALL;
                    PokiSDK.happyTime(1);
                }else{
                    _iPoints += POINT_FOR_BALL;
                    PokiSDK.happyTime(0.5);
                }
                
                _oInterface.updateScore(_iPoints);

                playSound("us_cheer", 1, false);
            } else if (bBasketState === false && _bScored === false){
                _bRimCollision = true;
            };
            if(_bScored === true){
                _bScored = _oSceneStatic.scored();
                _bRimCollision = false;
            } else {
                if(_bRimCollision){
                    _bRimCollision = _oSceneStatic.rimCollision();
                };
            };

            _oBall[_iShotsLeft].touchGround();

            if (_iShotsLeft > 0){
                _oPlayer.grab2();

                if (_oPlayer.isBallGrabbed() && !_bBallGrabbed) {
                    _bBallGrabbed = true;
                    _oBall[_iShotsLeft - 1].grab(_oPlayer.getPlCoords());
                    for (var i = 0; i < _iShotsLeft - 1; i++) {
                          _oBall[i].slide();
                    };  
                };
            } else {
                _oPlayer.endTurn();
            };

            if (_oBall[_iShotsLeft].touchedGround()) {
                if(!_bResetSelector){_oInterface.newBall(); _bResetSelector=true;};
                if(_iShotsLeft > 0){
                    _oInterface.listenForClick();
                    if (_oInterface.isVectorAquired().state) {_iGameState = 3; _bResetSelector=false;};         
                } else if (_iShotsLeft === 0){
                    _bResetSelector=false;
                    _iGameState = 5;
                };
            };
        };    

        // INIT NEXT SCENE
        if (_iGameState === 5){
            _iCurrentScreen++;

            if (_iCurrentScreen <= 5) {
                _iShotsLeft = NUM_SHOT_PER_SCENE;

                _oPlayer.endTurn();

                _oSceneStatic.nextScene();
                _oPlayer.nextScene(_oSceneStatic.getCartCoords());

                for (var i = 0; i < _iShotsLeft; i++) {
                    _oBall[i].unload();
                    _oBall[i] = new CBall(_oWorld,groundMaterial,groundMaterial,_iCurrentScreen, i, _oSceneStatic.getCartCoords());
                };

                _iGameState = 1;              
            } else {
                _oEndPanel = new CEndPanel(_fTimeLeft,_iPoints,_iShots,this);
                
                _iGameState = -1;
            };
        };
    };
    
    s_oGame = this;
    
    this._init();
}

var s_oGame;