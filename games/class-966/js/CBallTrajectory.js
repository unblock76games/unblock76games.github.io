var BALL_TRAJ_INSTANCE = 30;
var MS_TIME_FADE_BALL_TRAJ = 800;
var MS_SPAWN_TIME_BALL_TRAJECTORY = 1;
function CBallTrajectory(oParentContainer) {

    var _iBuffer = MS_SPAWN_TIME_BALL_TRAJECTORY;
    var _oParentContainer = oParentContainer;
    var _oContainer;

    var _aTraj;

    this._init = function () {
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);
        _aTraj = new Array();
        for (var i = 0; i < BALL_TRAJ_INSTANCE; i++) {
            _aTraj.push(this.createBallTrajectory({x: 0, y: 0}));
        }
    };

    this.createBallTrajectory = function (oPos) {
        var oSpriteTraj = s_oSpriteLibrary.getSprite("ball_trajectory");
        var oSprite = createBitmap(oSpriteTraj);
        oSprite.x = oPos.x;
        oSprite.y = oPos.y;
        oSprite.regX = oSpriteTraj.width * 0.5;
        oSprite.regY = oSpriteTraj.height * 0.5;
        oSprite.visible = false;

        _oContainer.addChild(oSprite);

        return oSprite;
    };

    this.chooseATraj = function (oPos) {
        for (var i = 0; i < _aTraj.length; i++) {
            if (!_aTraj[i].visible) {
                this.setTrajectory(i, oPos);
                return;
            }
        }
        var iAlphaMin = 1;
        var iID = 0;
        for (var i = 0; i < _aTraj.length; i++) {
            if (_aTraj[i].alpha < iAlphaMin) {
                iAlphaMin = _aTraj[i].alpha;
                iID = i;
            }
        }
        this.setTrajectory(iID, oPos);
    };

    this.setTrajectory = function (iID, oPos) {
        _aTraj[iID].x = oPos.x;
        _aTraj[iID].y = oPos.y;
        _aTraj[iID].visible = true;
        _aTraj[iID].alpha = 1;
        createjs.Tween.get(_aTraj[iID], {override: true}).to({alpha: 0, scaleX: 0, scaleY: 0}, MS_TIME_FADE_BALL_TRAJ).set({visible: false, scaleX: 1, scaleY: 1});
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oContainer);
        return null;
    };

    this.update = function (oPos) {
        if (_iBuffer < 0) {
            this.chooseATraj(oPos);
            _iBuffer = MS_SPAWN_TIME_BALL_TRAJECTORY;
        } else {
            _iBuffer -= s_iTimeElaps;
        }
    };


    this._init();
    return this;
}

