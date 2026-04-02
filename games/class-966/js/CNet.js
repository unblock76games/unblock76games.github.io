function CNet(iX, iY, oSprite, oParentContainer) {

    var _oNet;
    var _oParentContainer;

    this._init = function (iX, iY, oSprite) {

        _oNet = createBitmap(oSprite);
        this.setPosition(iX, iY);
        _oNet.cache(0, 0, oSprite.width, oSprite.height);

        _oParentContainer.addChild(_oNet);
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oNet);
    };

    this.setPosition = function (iX, iY) {
        _oNet.x = iX;
        _oNet.y = iY;
    };

    this.getDepthPos = function () {
        return NET_PROPERTIES.y;
    };

    this.getObject = function () {
        return _oNet;
    };

    _oParentContainer = oParentContainer;

    this._init(iX, iY, oSprite);

    return this;
}


