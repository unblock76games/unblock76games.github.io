function CArrow(iXPos, iYPos, oParentContainer) {

    var _oContainer;

    var _oArrowMask;
    var _oArrow;
    var _oArrowFill;
    var _oArrowFrame;
    var _iMaskWidth;
    var _iMaskHeight;
    var _oParentContainer;
    
    var _oCircle;
    var _oLine;

    this._init = function (iXPos, iYPos) {
        _oContainer = new createjs.Container();
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
        _oParentContainer.addChild(_oContainer);
         
        _oCircle = new createjs.Shape();
        _oCircle.graphics.beginFill("rgba(0,0,0,0.2)").drawCircle(0, 0, 2);
        _oContainer.addChild(_oCircle);
        
        _oLine = new createjs.Shape();
        _oLine.graphics.setStrokeDash([14,14], 2);
        _oLine.graphics.setStrokeStyle(5);
        _oLine.graphics.beginStroke("rgba(255,255,255,1)");
        _oLine.graphics.moveTo(0, 0);
        _oLine.graphics.lineTo(0, 0);
        _oContainer.addChild(_oLine); 
         
        var oSpriteArrow = s_oSpriteLibrary.getSprite("arrow");
        _oArrow = createBitmap(oSpriteArrow);
        _oArrow.regY = oSpriteArrow.height * 0.5;
        _oContainer.addChild(_oArrow);
        
        _oArrowFill = createBitmap(s_oSpriteLibrary.getSprite("arrow_fill"));
        _oArrowFill.regY = oSpriteArrow.height * 0.5;
        _oContainer.addChild(_oArrowFill);
        
        _iMaskWidth = oSpriteArrow.width;
        _iMaskHeight = oSpriteArrow.height;
        
        _oArrowMask = new createjs.Shape();
        _oArrowMask.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oArrow.x, _oArrow.y, 0, _iMaskHeight);
        _oArrowMask.regY = _iMaskHeight * 0.5;
        _oContainer.addChild(_oArrowMask);
        
        var oSpriteArrowFrame = s_oSpriteLibrary.getSprite("arrow_frame");
        _oArrowFrame = createBitmap(oSpriteArrowFrame);
        _oArrowFrame.regX = 0;
        _oArrowFrame.regY = oSpriteArrowFrame.height * 0.5;
        _oContainer.addChild(_oArrowFrame);
        
        
        _oArrowFill.mask = _oArrowMask;
        
        
        
        
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oContainer);
    };

    this.setVisible = function (bVisible) {
        _oContainer.visible = bVisible;
    };
    this.setAngle = function (iRotation) {
        _oContainer.rotation = iRotation;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oContainer.x = iXPos;
        _oContainer.y = iYPos;
    };

    this.setX = function (iXPos) {
        _oContainer.x = iXPos;
    };

    this.setY = function (iYPos) {
        _oContainer.y = iYPos;
    };

    this.getX = function () {
        return _oContainer.x;
    };

    this.getY = function () {
        return _oContainer.y;
    };

    this.mask = function (iVal) {
        _oArrowMask.graphics.clear();
        var iNewMaskWidth = Math.floor((iVal * _iMaskWidth) / 100);
        _oArrowMask.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(_oArrow.x, _oArrow.y, iNewMaskWidth, _iMaskHeight);
    };
    
    this.circle = function(iVal){
        var iRadius = Math.floor((iVal * _iMaskWidth) / 100);
        
        _oCircle.graphics.clear();
        _oCircle.graphics.beginFill("rgba(0,0,0,0.2)").drawCircle(0, 0, iRadius);
        
        
        _oLine.graphics.clear();
        _oLine.graphics.setStrokeDash([14,14], 2);
        _oLine.graphics.setStrokeStyle(5);
        _oLine.graphics.beginStroke("rgba(255,255,255,1)");
        _oLine.graphics.moveTo(0, 0);
        _oLine.graphics.lineTo(-iRadius, 0);

    };

    this.animateMask = function (iTime) {
        var oParent = this;
        createjs.Tween.get(_oArrowMask.graphics.command).to({w: _iMaskWidth}, iTime, createjs.Ease.cubicInOut).call(function () {
            createjs.Tween.get(_oArrowMask.graphics.command).to({w: 0}, iTime, createjs.Ease.cubicInOut).call(function () {
                oParent.animateMask(iTime);
            });
        });
        
        
        createjs.Tween.get(_oCircle.graphics.command).to({radius: _iMaskWidth}, iTime, createjs.Ease.cubicInOut).call(function () {
            createjs.Tween.get(_oCircle.graphics.command).to({radius: 0}, iTime, createjs.Ease.cubicInOut);
        });
        
        createjs.Tween.get(_oLine.graphics.command).to({x: -_iMaskWidth}, iTime, createjs.Ease.cubicInOut).call(function () {
            createjs.Tween.get(_oLine.graphics.command).to({x: 0}, iTime, createjs.Ease.cubicInOut);
        });
        
    };

    this.animateRotation = function (iTime) {
        var oParent = this;
        createjs.Tween.get(_oContainer).to({rotation: 35}, iTime, createjs.Ease.cubicInOut).call(function () {
            createjs.Tween.get(_oContainer).to({rotation: -35}, iTime, createjs.Ease.cubicInOut).call(function () {
                oParent.animateRotation(iTime);
            });
        });
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos);

    return this;
}