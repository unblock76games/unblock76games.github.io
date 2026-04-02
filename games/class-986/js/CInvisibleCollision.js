function CInvisibleCollision(iXPos, iYPos, iID, iType, iRadius, oParentContainer) {

    var _oShape;
    var _oStartPos;
    var _oParentContainer;
    var _iRadius;
    var _iRadiusQuadro;
    var _iID;
    var _iType;
    var _vPos;
    var _vPrevPos;

    this._init = function (iXPos, iYPos, iID, iType, iRadius) {
        _iID = iID;

        if (SHOW_COLLISION) {
            var oGraphics = new createjs.Graphics();
            oGraphics.beginFill(createjs.Graphics.getRGB(255, 0, 0));
            oGraphics.drawCircle(0, 0, iRadius);

            _oShape = new createjs.Shape(oGraphics);
            _oShape.x = iXPos;
            _oShape.y = iYPos;

            _oParentContainer.addChild(_oShape);
        }

        _vPos = new CVector2();
        _vPos.set(iXPos, iYPos);
        _vPrevPos = new CVector2();
        _vPrevPos.set(0, 0);

        _iRadius = iRadius;
        _iRadiusQuadro = iRadius * iRadius;

        _iType = iType;

        _oStartPos = {x: iXPos, y: iYPos};
    };

    this.getX = function () {
        return _vPos.getX();
    };

    this.getY = function () {
        return _vPos.getY();
    };

    this.resetPos = function () {
        if (SHOW_COLLISION) {
            _oShape.x = _oStartPos.x;
            _oShape.y = _oStartPos.y;
        }
        _vPos.set(_oStartPos.x, _oStartPos.y);
    };

    this.isGoalKeeper = function () {
        return false;
    };

    this.setPosition = function (iXPos, iYPos) {
        if (!SHOW_COLLISION) {
            return;
        }
        if (iXPos === null) {

        } else {
            _oShape.x = iXPos;
        }
        if (iYPos === null) {

        } else {
            _oShape.y = iYPos;
        }
    };

    this.rotate = function (iValue) {
        _oShape.scaleX = iValue;
    };

    this.setVisible = function (bVal) {
        _oShape.visible = bVal;
    };

    this.unload = function () {
        if (SHOW_COLLISION)
            _oParentContainer.removeChild(_oShape);
    };

    this.vPos = function () {
        return _vPos;
    };

    this.getRadius = function () {
        return _iRadius;
    };

    this.getID = function () {
        return _iID;
    };

    this.type = function () {
        return _iType;
    };

    this.getRadiusQuadro = function () {
        return _iRadiusQuadro;
    };

    this.getChildIndex = function () {
        if (SHOW_COLLISION)
            _oParentContainer.getChildIndex(_oShape);
    };

    this.setChildIndex = function (iValue) {
        if (SHOW_COLLISION)
            _oParentContainer.setChildIndex(_oShape, iValue);
    };

    this.getObject = function () {
        if (SHOW_COLLISION)
            return _oShape;
        return null;
    };

    this.unload = function () {
        if (SHOW_COLLISION)
            _oParentContainer.removeChild(_oShape);
        _oShape = null;
    };

    _oParentContainer = oParentContainer;

    this._init(iXPos, iYPos, iID, iType, iRadius);

    return this;
}


