function CBonus (iX, iY, oParentContainer, iIndex) {
    var _oParentContainer;
    var _oBonus;
    
    var _iX;
    var _iY;
    
    var _bTaken;

    this._init = function () {
        _iX = iX;
        _iY = iY;
        _bTaken = false;

        var oSprite = s_oSpriteLibrary.getSprite('bonus');
        _oBonus = createBitmap(oSprite, oSprite.width, oSprite.height);
        _oBonus.regX = oSprite.width/2;
        _oBonus.regY = oSprite.height/2;
        _oBonus.width = oSprite.width;
        _oBonus.height = oSprite.height;
        _oBonus.x = _iX;
        _oBonus.y = _iY;
        _oParentContainer.addChildAt(_oBonus, iIndex);
        
        // ADD A JUMPING MOVEMENT EFFECT
        createjs.Tween.get(_oBonus, {loop: true})
            .to({y: _iY-50}, 1000, createjs.Ease.quadOut)
            .to({y: _iY}, 1000, createjs.Ease.quadIn);
    };

    this.getX = function () {
        return _oBonus.x;
    };
    
    this.getY = function () {
        return _oBonus.y;
    };
    
    this.getWidth = function(){
        return _oBonus.width;
    };

    this.getHeight = function(){
        return _oBonus.height;
    };
    
    this.isBonusTaken = function(){
        return _bTaken;
    };

    this.onBonusTaken = function() {
        _bTaken = true;
        createjs.Tween.removeTweens(_oBonus);
        createjs.Tween.get(_oBonus)
            .to({y: 0, alpha: 0}, 1000, createjs.Ease.quadOut)
            .call( this.unload );
    };

    this.unload = function() {
        createjs.Tween.removeTweens(_oBonus);
        _oParentContainer.removeChild(_oBonus);
    };

    _oParentContainer = oParentContainer;

    this._init();

    return this;
}
