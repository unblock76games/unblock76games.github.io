function CMovingCoin(pStart,pEnd,bLast,iType,oParentContainer){
    var _aCbCompleted;
    var _aCbOwner;
    
    var _oSpriteCoin;
    var _oParentContainer;
    
    this._init = function(pStart,pEnd,bLast,iType){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        var oSprite = s_oSpriteLibrary.getSprite("coin");
        _oSpriteCoin = createBitmap(oSprite);
        _oSpriteCoin.x = pStart.x;
        _oSpriteCoin.y = pStart.y;
        _oSpriteCoin.regX = oSprite.width/2;
        _oSpriteCoin.regY = oSprite.height/2;
        _oParentContainer.addChild(_oSpriteCoin);
        
        var iTime;
        switch(iType){
            case TWEEN_TYPE_0:{
                    iTime = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
                    var iDir = Math.random()>0.5?1:-1;
                    createjs.Tween.get(_oSpriteCoin).to({x: _oSpriteCoin.x + (10*iDir),y:_oSpriteCoin.y - 50}, iTime/2,createjs.Ease.cubicOut).to({x: pEnd.x,y:pEnd.y}, iTime,createjs.Ease.cubicIn).call(function(){
                                                                                                _oParentContainer.removeChild(_oSpriteCoin);
                                                                                                _aCbCompleted[ON_COIN_ARRIVED].call(_aCbOwner[ON_COIN_ARRIVED],bLast);
                                                                                            });
                    break;
            }
            case TWEEN_TYPE_1:{
                    iTime = 500;
                    createjs.Tween.get(_oSpriteCoin).to({x: pEnd.x,y:pEnd.y}, iTime,createjs.Ease.cubicIn).call(function(){
                                                                                                _oParentContainer.removeChild(_oSpriteCoin);
                                                                                                _aCbCompleted[ON_COIN_ARRIVED].call(_aCbOwner[ON_COIN_ARRIVED],bLast);
                                                                                            });
                    break;
            }
        }

        playSound("money",1,false);
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    _oParentContainer = oParentContainer;
    this._init(pStart,pEnd,bLast,iType);
}