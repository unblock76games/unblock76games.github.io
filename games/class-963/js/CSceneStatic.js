function CSceneStatic(refWorld,iSceneNum,groundMaterial,basketMaterial){
    //renders/manages the static parts of the scene (basket, basket back panel, etc)

    // INIT
    var _bTrackScore = true,
            _bFrameIncreasing = true,
            _bBasketRimCollision = false,
            _iCurrFrame = 0,
            _iCurrScene = iSceneNum;

    var _aBasket = [];
    var _o2dBasket = [{},{x:(3.24/5)*CANVAS_WIDTH,y:(0.88)*CANVAS_HEIGHT/5},
                         {x:(2.52/5)*CANVAS_WIDTH,y:(0.79)*CANVAS_HEIGHT/5},
                         {x:(2.39/5)*CANVAS_WIDTH,y:(0.81)*CANVAS_HEIGHT/5},
                         {x:(2.21/5)*CANVAS_WIDTH,y:(0.79)*CANVAS_HEIGHT/5},
                         {x:(1.46/5)*CANVAS_WIDTH,y:(0.88)*CANVAS_HEIGHT/5}];

    var _oCartCoord = [{},{x:850,y:720},
                          {x:700,y:720},
                          {x:700,y:720},
                          {x:700,y:720},
                          {x:280,y:720}];

    var _oSpriteBg;
    var _oSpriteCartBack;
    var _oSpriteCart;
    var _oTimeCountDown;
    var _oWorld = refWorld;

    var szSpriteTag = "field_camera_1";
    _oSpriteBg = createBitmap(s_oSpriteLibrary.getSprite(szSpriteTag));
    _oSpriteBg.scaleX = -1; _oSpriteBg.x = CANVAS_WIDTH;
    s_oStage.addChild(_oSpriteBg);

    _oTimeCountDown = new createjs.Text("", "27px "+FONT_GAME2, "Red");
    _oTimeCountDown.visible = false;
    _oTimeCountDown.x = 541;
    _oTimeCountDown.y = 22;
    _oTimeCountDown.textBaseline = "alphabetic";
    _oTimeCountDown.textAlign = "center";
    s_oStage.addChild(_oTimeCountDown);

    _oSpriteCartBack = createBitmap(s_oSpriteLibrary.getSprite("cart_back"));
    s_oStage.addChild(_oSpriteCartBack);	
    _oSpriteCart = createBitmap(s_oSpriteLibrary.getSprite("cart_front"));
    s_oStage.addChild(_oSpriteCart);
    CART_DEPTH_INDEX = s_oStage.getChildIndex(_oSpriteCartBack);

    _oSpriteCartBack.regX = _oSpriteCart.regX = CART_WIDTH/2;
    _oSpriteCartBack.regY = _oSpriteCart.regY = CART_HEIGHT/2;
    _oSpriteCartBack.x = _oSpriteCart.x = _oCartCoord[1].x;
    _oSpriteCartBack.y = _oSpriteCart.y = _oCartCoord[1].y;


    // COMMON SCENE ELEMENTS
    // backPanel
    var backPanelShape = new CANNON.Box(new CANNON.Vec3(1/2, 72/2, 42/2));
    var backPanel = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(48,0,120),
            material: groundMaterial
    });
    backPanel.addShape(backPanelShape);
    _oWorld.add(backPanel);

    // basket
    // upper rim
    var upperRimSize = 22;

    var basket1Shape = new CANNON.Box(new CANNON.Vec3(upperRimSize/2,1/2,1/2));
    var basket1 = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(48+upperRimSize/2,upperRimSize/2,120),
            material: basketMaterial
    });
    basket1.addShape(basket1Shape);
    _oWorld.add(basket1);         

    var basket2Shape = new CANNON.Box(new CANNON.Vec3(upperRimSize/2,1/2,1/2));
    var basket2 = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(48+upperRimSize/2,-upperRimSize/2,120),
            material: basketMaterial
    });
    basket2.addShape(basket2Shape);
    _oWorld.add(basket2);

    var basket3Shape = new CANNON.Box(new CANNON.Vec3(1/2,upperRimSize/2,1/2));
    var basket3 = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(48+upperRimSize,0,120),
            material: basketMaterial
    });
    basket3.addShape(basket3Shape);
    _oWorld.add(basket3);

    basket1.addEventListener("collide",function(e){
            _bBasketRimCollision = true;
    });
    basket2.addEventListener("collide",function(e){
            _bBasketRimCollision = true;
    });
    basket3.addEventListener("collide",function(e){
            _bBasketRimCollision = true;
    });

    // lower rim
    var lowerRimSize = 16;
    var lowerOffset = (upperRimSize - lowerRimSize)/2;

    var basket4Shape = new CANNON.Box(new CANNON.Vec3(lowerRimSize/2,1/2,1/2));
    var basket4 = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(48+lowerRimSize/2 + lowerOffset,lowerRimSize/2,113),
            material: basketMaterial
    });
    basket4.addShape(basket4Shape);
    _oWorld.add(basket4);         

    var basket5Shape = new CANNON.Box(new CANNON.Vec3(lowerRimSize/2,1/2,1/2));
    var basket5 = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(48+lowerRimSize/2 + lowerOffset,-lowerRimSize/2,113),
            material: basketMaterial
    });
    basket5.addShape(basket5Shape);
    _oWorld.add(basket5);

    var basket6Shape = new CANNON.Box(new CANNON.Vec3(1/2,lowerRimSize/2,1/2));
    var basket6 = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(48+lowerRimSize + lowerOffset,0,113),
            material: basketMaterial
    });
    basket6.addShape(basket6Shape);
    _oWorld.add(basket6);

    //Init 2d basket frames
    for (var i = 0; i < 36; i++) {
            _aBasket.push(createBitmap(s_oSpriteLibrary.getSprite("bsk" + (i+1))));
            _aBasket[i].visible = false;
            _aBasket[i].x = _o2dBasket[1].x;
            _aBasket[i].y = _o2dBasket[1].y;
            _aBasket[i].scaleX = 1.2;
            _aBasket[i].scaleY = 1.2;		
            s_oStage.addChild(_aBasket[i]);
    };
    _aBasket[0].visible = true;
                
                
	// END INIT

    this.nextScene = function(){
        _iCurrScene++;

        this.loadBg(_iCurrScene);

        for (var i = 0; i < 36; i++) {
                _aBasket[i].x = _o2dBasket[_iCurrScene].x;
                _aBasket[i].y = _o2dBasket[_iCurrScene].y;
        };

        _oSpriteCartBack.x = _oSpriteCart.x = _oCartCoord[_iCurrScene].x;
        _oSpriteCartBack.y = _oSpriteCart.y = _oCartCoord[_iCurrScene].y;

        if (_iCurrScene === 5) {
                _oSpriteCartBack.scaleX = _oSpriteCart.scaleX = -1;		
        };

        switch(_iCurrScene){
            case 2:{
                    _oTimeCountDown.visible = true;
                    _oTimeCountDown.x = 590;
                    _oTimeCountDown.y = 46;
                    _oTimeCountDown.setTransform(_oTimeCountDown.x, _oTimeCountDown.y, 1, 1,0,0,-15);
                    break;
            }
            case 3:{
                    _oTimeCountDown.visible = true;
                    _oTimeCountDown.x = 525;
                    _oTimeCountDown.y = 50;
                    _oTimeCountDown.setTransform(_oTimeCountDown.x, _oTimeCountDown.y, 1.2, 1.2,0,0,0);
                    break;
            }
            case 4:{
                    _oTimeCountDown.visible = true;
                    _oTimeCountDown.x = 437;
                    _oTimeCountDown.y = 46;
                    _oTimeCountDown.setTransform(_oTimeCountDown.x, _oTimeCountDown.y, 1, 1,0,0,15);
                    break;
            }
            case 5:{
                    _oTimeCountDown.visible = false;
                    break;
            }
        }
    };
        
    this.updateTime = function(iTime){
        _oTimeCountDown.text = formatTime(iTime);
    };

    this.updateBasket = function(v3BallPosition){
            if (_bTrackScore){
                    // CHECK PLAYER SCORED
                    if (v3BallPosition.z > 113 && v3BallPosition.z < 120 &&
                            v3BallPosition.x >  48 && v3BallPosition.x < 48 + lowerRimSize + lowerOffset &&
                            v3BallPosition.y > -lowerRimSize/2 && v3BallPosition.y < lowerRimSize/2) {
                                    _bTrackScore = false;

                                    //console.log("SCORE!");

                                    return true;
                    } else {
                            // CHECK RIM COLLISION
                            if (_bBasketRimCollision === true && _bTrackScore === true){
                                    _bBasketRimCollision = false;

                                    return false;
                            };
                    };
            };
    };

    this.scored = function(){
            if (_iCurrFrame < 14 || (_iCurrFrame >= 28 && _iCurrFrame <= 35)) {
                    this.playFrames(0,14,false);
                    return true;
            } else {
                    _aBasket[_iCurrFrame].visible = false;
                    _aBasket[0].visible = true;
                    _iCurrFrame = 0;
                    return false;
            };
    };

    this.rimCollision = function(){
            if (_iCurrFrame < 35) {
                    this.playFrames(28,35,false);
                    return true;
            } else {
                    _aBasket[_iCurrFrame].visible = false;
                    _aBasket[0].visible = true;
                    _iCurrFrame = 0;
                    return false;
            };		
    };

    this.newBall = function(){
            _bBasketRimCollision = false;
            _bTrackScore = true;
            _iCurrFrame = 0;
    };

    this.getCartCoords = function(){
            return {x: _oSpriteCart.x + CART_WIDTH/2,y: _oSpriteCart.y + CART_HEIGHT/2};
    };

    this.loadBg = function(iScene){
            var szSpriteTag;
            if (iScene <= 3) {
                    szSpriteTag = "field_camera_" + iScene;
            } else if (iScene === 4) {
                    szSpriteTag = "field_camera_" + 2;
            } else {
                    szSpriteTag = "field_camera_" + 1;
            };

            var iLayer = s_oStage.getChildIndex(_oSpriteBg);

            _oSpriteBg = createBitmap(s_oSpriteLibrary.getSprite(szSpriteTag));
            if (iScene < 3) {_oSpriteBg.scaleX = -1; _oSpriteBg.x = CANVAS_WIDTH;};
            s_oStage.removeChildAt(iLayer);
            s_oStage.addChildAt(_oSpriteBg,iLayer);
    };

    // bStartOver = true -> @ after last frame goes to first 
    this.playFrames = function(iFirst,iLast,bStartOver){
        if(_iCurrFrame < iFirst || _iCurrFrame > iLast || _iCurrFrame === undefined){
                if(_aBasket[_iCurrFrame]){_aBasket[_iCurrFrame].visible = false};
                _iCurrFrame = iFirst; 
                _aBasket[_iCurrFrame].visible = true;
                _bFrameIncreasing = true;
        } else {
                _aBasket[_iCurrFrame].visible = false;
                if (_iCurrFrame === iFirst && _bFrameIncreasing === false) {
                        _bFrameIncreasing = true;
                        _iCurrFrame += 1;
                        _aBasket[_iCurrFrame].visible = true;
                } else if (_iCurrFrame === iLast) {
                        if (bStartOver === true) {
                                _iCurrFrame = iFirst;
                                _aBasket[_iCurrFrame].visible = true;					
                        } else {
                                _bFrameIncreasing = false;
                                _iCurrFrame--;
                                _aBasket[_iCurrFrame].visible = true;				
                        };
                } else {
                        if (_bFrameIncreasing) {
                                _iCurrFrame++;
                                _aBasket[_iCurrFrame].visible = true;					
                        } else {
                                _iCurrFrame--;
                                _aBasket[_iCurrFrame].visible = true;
                        };				
                };
        };
    };
};