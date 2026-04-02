function CLevelBoard(oParentContainer) {

    var _pContainerPos;
    var _oLevelText;
    var _oParentContainer = oParentContainer;
    var _oContainer;
    var _oBounds;

    this._init = function () {
        _oLevelText = new createjs.Text(TEXT_MATCH + ": 99", "50px " + PRIMARY_FONT, TEXT_COLOR_0);
        _oLevelText.textAlign = "center";
        _oLevelText.textBaseline = "middle";

        _pContainerPos = {x: CANVAS_WIDTH * 0.5, y: _oLevelText.getBounds().height + 10};
        _oContainer = new createjs.Container();
        _oContainer.x = _pContainerPos.x;
        _oContainer.y = _pContainerPos.y;
        _oParentContainer.addChild(_oContainer);

        _oContainer.addChild(_oLevelText);
        _oBounds = _oContainer.getBounds();
        this.updateCache();
    };

    this.updateCache = function () {
        _oContainer.cache(-_oBounds.width, -_oBounds.height, _oBounds.width * 2, _oBounds.height * 2);
    };

    this.getStartPosLevel = function () {
        return _pContainerPos;
    };

    this.setPos = function (iX, iY) {
        _oContainer.x = iX;
        _oContainer.y = iY;
    };

    this.refreshPos = function (iNewX, iNewY) {
        this.setPos(_pContainerPos.x , _pContainerPos.y + iNewY);
    };

    this.refreshTextLevel = function (iLevel) {
        _oLevelText.text = TEXT_MATCH + ": " + iLevel;
        this.updateCache();
    };

    this._init();

    return this;
}