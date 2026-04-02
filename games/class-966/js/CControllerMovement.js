function CControllerMovement() {

    var _vCharPos = new CVector2(0, 0);
    var _vCharToPos = new CVector2(0, 0);
    var _vBallPos = new CVector2(0, 0);
    var _vPos = new CVector2(0, 0);
    var _oAnimatorPlayer = new CAnimCharacter(ANIMATION_PLAYER_SET);
    var _aAnimatorOpponent = new CAnimCharacter(ANIMATION_OPPONENT_SET);

    this.moveCharacterToBall = function (oCharacter, oBall) {
        _vCharPos.set(oCharacter.getPhysics().position.x, oCharacter.getPhysics().position.y);
        _vBallPos.set(oBall.getPhysics().position.x, oBall.getPhysics().position.y);

        var fDistance = distanceV2(oCharacter.getPos(), oBall.getPos());
        if (fDistance < MIN_DISTANCE_MOVE_TO_BALL || oCharacter.getAnimType() === FOREHAND || oCharacter.getAnimType() === BACKHAND) {
            oCharacter.setSpeed(0);

            return true;//REACH THE BALL?
        }

        var oDir = {x: 1, y: 1};
//

        if (_vCharPos.getX() > _vBallPos.getX()) {
            oDir.x = -1;
        }

        if (_vCharPos.getY() > _vBallPos.getY()) {
            oDir.y = -1;
        }

        var fRadiants = _vCharPos.angleBetweenVectors(_vBallPos);

        var vDir = new CVector2(Math.sin(fRadiants + OFFSET_RADIANTS_90) * oDir.x, Math.cos(fRadiants) * oDir.y);

        this.speed(oCharacter);

        var fDistanceX = Math.abs(_vCharPos.getX() - _vBallPos.getX());
        if (fDistanceX > TO_BALL_CHAR_DISTANCE_OFFSET) {
            oCharacter.getPhysics().position.x += oCharacter.getSpeed() * vDir.getX();
        }
        var fDistanceY = Math.abs(_vCharPos.getY() - _vBallPos.getY());
        if (fDistanceY > TO_BALL_CHAR_DISTANCE_OFFSET) {
            oCharacter.getPhysics().position.y += oCharacter.getSpeed() * vDir.getY();
        }
        var vDirAnim = new CVector2(Math.sin(fRadiants) * oDir.x, Math.cos(fRadiants) * oDir.y);

        if (oCharacter.whoIs() === PLAYER_SIDE) {
            _oAnimatorPlayer.animation(vDirAnim, oCharacter);
        } else {
            _aAnimatorOpponent.animation(vDirAnim, oCharacter);
        }

        return false;//REACH THE BALL?
    };

    this.moveCharacterToPos = function (oCharacter, oPos) {
        _vCharToPos.set(oCharacter.getPhysics().position.x, oCharacter.getPhysics().position.y);
        _vPos.set(oPos.x, oPos.y);

        var fRadiants = _vPos.angleBetweenVectors(_vCharToPos);

        var oDir = {x: 1, y: 1};

        if (_vCharToPos.getX() > _vPos.getX()) {
            oDir.x *= -1;
        }

        if (_vCharToPos.getY() > _vPos.getY()) {
            oDir.y *= -1;
        }

        this.speed(oCharacter);

        var vDir = new CVector2(Math.sin(fRadiants + OFFSET_RADIANTS_90) * oDir.x, Math.cos(fRadiants) * oDir.y);

        var fDistanceX = Math.abs(_vCharToPos.getX() - _vPos.getX());
        if (fDistanceX > TO_POS_CHAR_DISTANCE_OFFSET_AXIS) {
            oCharacter.getPhysics().position.x += oCharacter.getSpeed() * vDir.getX();
        } else {
            oDir.x = 0;
        }

        var fDistanceY = Math.abs(_vCharToPos.getY() - _vPos.getY());
        if (fDistanceY > TO_POS_CHAR_DISTANCE_OFFSET_AXIS) {
            oCharacter.getPhysics().position.y += oCharacter.getSpeed() * vDir.getY();
        } else {
            oDir.y = 0;
        }

        var vDirAnim = new CVector2(Math.cos(fRadiants + OFFSET_RADIANTS_90) * oDir.x, Math.sin(fRadiants) * oDir.y);

        if (oCharacter.whoIs() === PLAYER_SIDE) {
            _oAnimatorPlayer.animation(vDirAnim, oCharacter);
        } else {
            _aAnimatorOpponent.animation(vDirAnim, oCharacter);
        }

        return false;
    };

    this.speed = function (oCharacter) {
        var fSpeed = oCharacter.getSpeed();

        fSpeed += oCharacter.getAcceleration();

        if (fSpeed > oCharacter.getMaxSpeed()) {
            fSpeed = oCharacter.getMaxSpeed();
        }

        oCharacter.setSpeed(fSpeed);
    };

    return this;
}
