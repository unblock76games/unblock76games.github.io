function CBall(iX, iY, oParentContainer){
    
    var _iCntFrames = 0;
    var _iMaxFrames = 40;

    var _bUpdate = false;
    var _bArrived = true;
    
    var _oTeamSpriteIdle;
    var _oBall;
    
    var _aTrajectoryPoint;
    var _pStartPoint = {x:0, y:0};
    var _pEndPoint = {x:0, y:0};
    
    this._init = function(iX, iY, oParentContainer){
        _oTeamSpriteIdle = {   
            images: [s_oSpriteLibrary.getSprite("ball")], 
            framerate: 20,
            // width, height & registration point of each sprite
            frames: {width: BALL_WIDTH, height: BALL_HEIGHT, regX: BALL_WIDTH/2, regY: BALL_WIDTH/2}, 
            animations: {idle: 0, thrown:[0, 6, "thrown"]}
        };
        var oSpriteSheetBall = new createjs.SpriteSheet(_oTeamSpriteIdle);
        _oBall = createSprite(oSpriteSheetBall, "idle", 0, 0, BALL_WIDTH, BALL_HEIGHT);
        _oBall.x = iX;
        _oBall.y = iY;
        _oBall.rotation = 0;
        oParentContainer.addChild(_oBall);
        _oBall.gotoAndStop("idle");
                        
        _pStartPoint.x = _oBall.x;
        _pStartPoint.y = _oBall.y;
    };
    
    this._calculateMid = function(pStartPoint, pEndPoint){
        var t0;
        var iRandT0 = Math.floor(Math.random() * 50) + 1;
            if (pEndPoint.x < CANVAS_WIDTH/2) {
                if (pEndPoint.y > (CANVAS_HEIGHT / 2)) {
                        t0 = new createjs.Point(Math.floor(Math.random() * (CANVAS_WIDTH/2)) + 100, ((CANVAS_HEIGHT/2)-200)-iRandT0);
                }else {
                        t0 = new createjs.Point(Math.floor(Math.random() * (CANVAS_WIDTH/2)) + 100, ((CANVAS_HEIGHT/2)-200)+iRandT0);
                }
            }else if (pEndPoint.x > CANVAS_WIDTH/2) {
                if (pEndPoint.y > (CANVAS_HEIGHT / 2)) {
                        t0 = new createjs.Point(Math.floor(Math.random() * (CANVAS_WIDTH/2)) + 300, ((CANVAS_HEIGHT/2)-200)-iRandT0);
                }else {
                        t0 = new createjs.Point(Math.floor(Math.random() * (CANVAS_WIDTH/2)) + 300, ((CANVAS_HEIGHT/2)-200)+iRandT0);
                }
            }else{
                if (pEndPoint.x > (CANVAS_WIDTH / 2)) {
                    t0 = new createjs.Point((CANVAS_WIDTH/2)-50, Math.floor(Math.random() * (CANVAS_HEIGHT / 2) - 100) + 100);
                }else {
                    t0 = new createjs.Point((CANVAS_WIDTH/2)+50, Math.floor(Math.random() * (CANVAS_HEIGHT / 2) - 100) + 100);
                }
            }
        
        _aTrajectoryPoint = {start:pStartPoint, end:pEndPoint, traj:t0};
    };
    
    this.fadeOut = function(){
        createjs.Tween.get(_oBall).to({alpha:0 }, 200).call(function() {_oBall.gotoAndStop("idle");});
    };
    
    this.ballKicked = function(iX, iY){
        _pEndPoint.x = iX;
        _pEndPoint.y = iY;
        _aTrajectoryPoint = {start:_pStartPoint, end:_pEndPoint, traj:_pEndPoint};
        _bUpdate = true;
        _bArrived = false;
        _oBall.gotoAndPlay("thrown");
    };
    
    this.returnX = function(){
        return _oBall.x;
    };
    
    this.returnY = function(){
        return _oBall.y;
    };
    this._updateBall = function( iThereIsWall, bIsSaved ){
        _iCntFrames += STEP_SPEED_BALL_HITTED;
        _oBall.rotation += 5;
        if (_iCntFrames > _iMaxFrames ) {
            _iCntFrames = 0;
            _bUpdate = false;
            _bArrived = true;
            s_oGame.showMessage(false);
        }
        if(!_bArrived){
            var fLerp; 
            fLerp=easeOutCubic( _iCntFrames, 0, 1, _iMaxFrames);

            var pPos = getTrajectoryPoint(fLerp, _aTrajectoryPoint);
            _oBall.x = pPos.x;
            _oBall.y = pPos.y;
            if(bIsSaved === true){
                if(_oBall.scaleX <= 0.7){
                    s_oGame.goalKeeperBounce();
                }
            }
            if(iThereIsWall > 0){
                if(_oBall.scaleX <= 0.75){
                    s_oGame.controlWall();
                }
            }
            if(_oBall.scaleX >= 0.4){
                _oBall.scaleX -= 0.03;
                _oBall.scaleY -= 0.03;
            }
        }
    };
    
    this.bounce = function(iPlayerX, iType){
        _bUpdate = false;
        if(iType === 0){ //wall
            if(iPlayerX<CANVAS_WIDTH/2){
                createjs.Tween.get(_oBall).to({x: _oBall.x+100,y: CANVAS_HEIGHT+50 }, 500).call(function() {s_oGame.showMessage(true)});
            }else{
                createjs.Tween.get(_oBall).to({x: _oBall.x-100,y: CANVAS_HEIGHT+50 }, 500).call(function() {s_oGame.showMessage(true)});
            }
        }else{ //goalkeeper
            if(iPlayerX<CANVAS_WIDTH/2){
                createjs.Tween.get(_oBall).to({x: _oBall.x+100,y: CANVAS_HEIGHT+50 }, 700).call(function() {s_oGame.showMessage(false)});
            }else{
                createjs.Tween.get(_oBall).to({x: _oBall.x-100,y: CANVAS_HEIGHT+50 }, 700).call(function() {s_oGame.showMessage(false)});
            }
        }
    };
    
    this.unload = function(){
        _oBall = null;
        oParentContainer.removeAllChildren();
    };
    
    this.update = function(iThereIsWall, bIsSaved){
        if(_bUpdate){
            this._updateBall(iThereIsWall, bIsSaved);
        }
    };
    
    s_oBall = this;
    
    this._init(iX, iY, oParentContainer);
    
}
s_oBall = null;