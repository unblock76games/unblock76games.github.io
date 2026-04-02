function CBall(oParentContainer) {
    var _oParentContainer;
    var _oBallContainer;
    var _oBallShadow;
    var _oBall;
    var _oStartPos;
    var _oUserData;

    var _vPos;
    var _vPrevPos;
    var _vCurForce;
    
    var _iRadius;
    var _iSquareRadius;
    var _iRadiusWithTolerance;
    var _iRadiusForCollisionRingEdge;
    
    var _bLaunched;
    var _bStopped;
    var _bBonus;
    
    var _aBallParticles;
    
    this._init = function () {
        var oStartPosition = s_oGame.getBallStartPosition();
        var iXPos = oStartPosition.x;
        var iYPos = oStartPosition.y;
        _oStartPos = {x: iXPos, y: iYPos};
        _bLaunched = false;
        _bStopped = false;
        _bBonus = false;
        _aBallParticles = [];
        
        _oBallContainer = new createjs.Container();
        _oParentContainer.addChild(_oBallContainer);
        
        if (!s_bMobile) {
            _oBallContainer.cursor = "pointer";
        }

        var oData = {   
                images: [s_oSpriteLibrary.getSprite('ball'),
                         s_oSpriteLibrary.getSprite('ball_bonus')],
                framerate: 20,
                frames: {width: BALL_SIZE, height: BALL_SIZE, regX: BALL_SIZE/2, regY: BALL_SIZE/2},
                animations: { idle: [0, 17, "idle"],
                              bonus: [18, 35, "bonus"] }
            };
        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oBall = createSprite(oSpriteSheet, "idle", BALL_SIZE/2, BALL_SIZE/2, BALL_SIZE, BALL_SIZE);
        _oBallContainer.addChild(_oBall);
        _oBallContainer.x = iXPos;
        _oBallContainer.y = iYPos;
        
        this.resetBallAnimation();

        _oBallShadow = createBitmap(s_oSpriteLibrary.getSprite("ball_shadow"));
        _oBallShadow.regX = BALL_SIZE/2;
        _oBallShadow.regY = -40;
        _oBallShadow.x = _oBallContainer.x;
        _oBallShadow.y = _oBallContainer.y;
        _oParentContainer.addChild(_oBallShadow);

        _vPos = new CVector3();
        _vPos.set(_oBallContainer.x, _oBallContainer.y, 0);
        _vPrevPos = new CVector3();
        _vPrevPos.set(0,0,0);
        
        _iRadius = (BALL_SIZE * 0.5);
        _iSquareRadius = _iRadius*_iRadius;
        _iRadiusWithTolerance = _iRadius * BALL_RADIUS_TOLERANCE_FACTOR;
        _iRadiusForCollisionRingEdge = _iRadius + BOARD_SIDES_RADIUS;
        _vCurForce = new CVector3(0,0,0);
    };
    
    this.shadowFadeOut = function(){
        createjs.Tween.get(_oBallShadow)
            .to({alpha: 0}, 200, createjs.Ease.quadOut);
    };
    
    this.resetBallAnimation = function(){
        if (_bBonus === true) {
            _oBall.gotoAndStop("bonus");
        } else {
            _oBall.gotoAndStop("idle");
        };
    };
    
    this.startBallAnimation = function(){
        if (_bBonus === true) {
            _oBall.gotoAndPlay("bonus");
        } else {
            _oBall.gotoAndPlay("idle");
        };
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oBallContainer);
    };

    this.setVisible = function (bVisible) {
        _oBallContainer.visible = bVisible;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oBallContainer.x = iXPos;
        _oBallContainer.y = iYPos;
    };

    this.resetPos = function () {
        _oBallContainer.x = _oStartPos.x;
        _oBallContainer.y = _oStartPos.y;
        _vPos.set(_oBallContainer.x, _oBallContainer.y);
        _vCurForce.set(0,0,0);
        this.updateSpriteScale();
        this.resetBallAnimation();        
    };

    this.isLaunched = function(){
        return _bLaunched;
    };

    this.setLaunched = function(bValue){
        _bLaunched = bValue;
    };
    
    this.setBonus = function(bValue){
        _bBonus = bValue;
    };
    
    this.isStopped = function(){
        return _bStopped;
    };

    this.stopBall = function(){
        _bLaunched = false;
        _bStopped = true;        
        _vCurForce.set(0,0,0);
        this.resetBallAnimation();
    };

    this.fadeOut = function(){
        createjs.Tween.get(_oBallContainer)
            .to({alpha: 0}, 250, createjs.Ease.sineOut);
    };

    this.resetPosition = function(iX, iY, iZ) {
        var oParent = this;
        
        createjs.Tween.get(_oBallContainer)
            .to({alpha: 0}, 250, createjs.Ease.sineOut)
            .call(function(){
                oParent.resetBallPosition(iX, iY, iZ);
                oParent.fadeIn();
            });                
    };

    this.setStopped = function(bValue){
        _bStopped = bValue;
    };

    this.resetBallPosition = function(iX, iY, iZ){
        _vPos.set(iX, iY, iZ);
        _oBallContainer.x = _vPos.getX();
        _oBallContainer.y = iY;
        this.updateSpriteScale();
        createjs.Tween.removeTweens(this.getContainer());
        this.setStopped(false);
        this.resetBallAnimation();
    };
    
    this.fadeIn = function(){
        this.resetBallAnimation();
        _oBallContainer.scaleX = _oBallContainer.scaleY = 1;
        _oBallShadow.x = _oBallContainer.x;
        _oBallShadow.y = _oBallContainer.y;
        
        createjs.Tween.get(_oBallContainer)            
            .wait(200)
            .to({alpha: 1}, 250, createjs.Ease.sineOut);
    
        createjs.Tween.get(_oBallShadow)
            .wait(200)
            .to({alpha: 1}, 250, createjs.Ease.sineOut);
    };
    
    this.getRadiusForCollisionRingEdge = function(){
        return _iRadiusForCollisionRingEdge * _oBall.scaleX;
    };
    
    this.getContainer = function(){
        return _oBallContainer;
    };    

    this.getX = function () {
        return _oBallContainer.x;
    };
    
    this.getY = function () {
        return _oBallContainer.y;
    };
    
    this.getZ = function () {
        return _vPos.getZ();
    };
    
    this.getRadiusWithTolerance = function(){
        return _iRadiusWithTolerance * _oBall.scaleX;
    };
    
    this.setUserData = function(oObject){
       _oUserData = oObject; 
    };
    
    this.getUserData = function(){
       return _oUserData; 
    };

    this.vCurForce = function () {
        return _vCurForce;        
    };
    
    this.vPos = function () {
        return _vPos;
    };

    this.setPos = function (vPos) {
        _vPos.setV(vPos);
    };
    
    this.setForce = function (vForceX, vForceY) {
        _vCurForce.set( vForceX, vForceY, _vCurForce.getZ() );
    };
    
    this.vPrevPos = function () {
        return _vPrevPos;
    };

    this.getRadius = function () {
        return _iRadius * _oBall.scaleX;
    };

    this.getSquareRadius = function(){
        return _iSquareRadius * _oBall.scaleX;
    };

    this.updateSpritePosition = function () {        
        _oBallContainer.x = _vPos.getX();
        _oBallContainer.y = _vPos.getY();
        this.updateSpriteMovement();
        
        if (_bBonus === true) {
            this.addBallParticle();
        };
    };
    
    this.updateSpriteMovement = function() {
        _oBall.framerate = _vCurForce.length() * 1.2;
        
        if ( this.getZ() > 0 ) {
            this.updateSpriteScale();
        };
    };
    
    this.addBallParticle = function(){
        if (_oBallContainer.alpha < 1) {
            return;
        };
        var iRandomColorIndex = Math.floor( Math.random() * PARTICLE_COLOR.length );
        var iSize = BALL_SIZE / 4;
        
        var oBallParticle = new createjs.Shape();
        oBallParticle.graphics.beginFill(PARTICLE_COLOR[iRandomColorIndex]).drawCircle(0, 0, iSize);                
        oBallParticle.regX = oBallParticle.regY = iSize / 2;
        oBallParticle.x = _oBallContainer.x;
        oBallParticle.y = _oBallContainer.y;
        oBallParticle.alpha = 0.2;
        _oParentContainer.addChildAt(oBallParticle, _oParentContainer.getChildIndex(_oBallContainer));
        _aBallParticles.push(oBallParticle);
                
        createjs.Tween.get(oBallParticle)
            .to({alpha: 0}, 500, createjs.Ease.quadIn)
            .call(function(){
                createjs.Tween.removeTweens(_oParentContainer);
                _oParentContainer.removeChild(oBallParticle);
                oBallParticle = null;   
            });
    };
    
    this.updateSpriteScale = function(){
        var iZ = this.getZ();
        
        if (iZ > BALL_SCALE_MAX_LIMIT) {
            iZ = BALL_SCALE_MAX_LIMIT;
        }
        
        // FIND THE DISTANCE PERCENTAGE TO CALCULATE HOW "DEEP" THE BALL IS TOWARDS THE BOARD, AND SCALE IT
        var iDistancePercentage = ( (100/BALL_SCALE_MAX_LIMIT) * iZ ) / 100;
        var iScaleFactor = 1 - (iDistancePercentage * BALL_SCALE_VARIABLE_MIN);
        _oBallContainer.scaleX = _oBallContainer.scaleY = iScaleFactor;
    };
    
    _oParentContainer = oParentContainer;

    this._init();

    return this;
}
