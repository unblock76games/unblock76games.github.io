function CGoal(oParentContainer) {

    var _aAllGoal;
    var _oGoalPlayerBack;
    var _oGoalEnemyBack;
    var _oGoalPlayerFront;
    var _oGoalEnemyFront;
    var _oParentContainer;

    this._init = function () {
        _aAllGoal = new Array();

        var oSpriteGoalBack = s_oSpriteLibrary.getSprite("goal_bottom");

        _oGoalPlayerBack = createBitmap(oSpriteGoalBack);
        _oGoalPlayerBack.x = POS_GOAL_PLAYER_BOTTOM.x;
        _oGoalPlayerBack.y = POS_GOAL_PLAYER_BOTTOM.y;
        _oGoalPlayerBack.regX = oSpriteGoalBack.width * 0.5;
        _oGoalPlayerBack.regy = oSpriteGoalBack.heigth * 0.5;

        _oParentContainer.addChild(_oGoalPlayerBack);

        _aAllGoal[0] = _oGoalPlayerBack;

        _oGoalEnemyBack = createBitmap(oSpriteGoalBack);
        _oGoalEnemyBack.x = POS_GOAL_OPPONENT_BOTTOM.x;
        _oGoalEnemyBack.y = POS_GOAL_OPPONENT_BOTTOM.y;
        _oGoalEnemyBack.regX = oSpriteGoalBack.width * 0.5;
        _oGoalEnemyBack.regy = oSpriteGoalBack.heigth * 0.5;
        _oGoalEnemyBack.scaleX = -1;

        _oParentContainer.addChild(_oGoalEnemyBack);
        _aAllGoal[1] = _oGoalEnemyBack;
    };

    this.createGoalFront = function () {

        var oSpriteGoalFront = s_oSpriteLibrary.getSprite("goal_top");

        _oGoalPlayerFront = createBitmap(oSpriteGoalFront);
        _oGoalPlayerFront.x = POS_GOAL_PLAYER_FRONT.x;
        _oGoalPlayerFront.y = POS_GOAL_PLAYER_FRONT.y + oSpriteGoalFront.height;
        _oGoalPlayerFront.regX = oSpriteGoalFront.width * 0.5;
        _oGoalPlayerFront.regY = oSpriteGoalFront.height;

        _oParentContainer.addChild(_oGoalPlayerFront);

        _aAllGoal[2] = _oGoalPlayerFront;

        _oGoalEnemyFront = createBitmap(oSpriteGoalFront);
        _oGoalEnemyFront.x = POS_GOAL_OPPONENT_FRONT.x;
        _oGoalEnemyFront.y = POS_GOAL_OPPONENT_FRONT.y + oSpriteGoalFront.height;
        _oGoalEnemyFront.regX = oSpriteGoalFront.width * 0.5;
        _oGoalEnemyFront.regY = oSpriteGoalFront.height;
        _oGoalEnemyFront.scaleX = -1;

        _oParentContainer.addChild(_oGoalEnemyFront);

        _aAllGoal[3] = _oGoalEnemyFront;
    };

    this.getGoalEnemyFront = function () {
        return _oGoalEnemyFront;
    };

    this.getGoalPlayerFront = function () {
        return _oGoalPlayerFront;
    };

    this.unload = function () {
        for (var i = 0; i < _aAllGoal.length; i++) {
            _oParentContainer.removeChild(_aAllGoal[i]);
        }
    };

    _oParentContainer = oParentContainer;

    this._init();

    return this;
}
