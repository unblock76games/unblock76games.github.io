function CAI(oOpponent) {
    var _oOpponent = oOpponent;
    var _oPlayerPos;
    var _oOpponentPos;

    var _vImpulse;

    this._init = function () {
        _oPlayerPos = new CVector2(0, 0);
        _oOpponentPos = new CVector2(0, 0);
        _vImpulse = new CVector2(0, 0);
    };

    this.serve = function () {
        _oPlayerPos.set(CHARACTERS[PLAYER_SIDE].getPos().x, CHARACTERS[PLAYER_SIDE].getPos().y);
        _oOpponentPos.set(_oOpponent.getPos().x, _oOpponent.getPos().y);

        var fRadiants = _oOpponentPos.angleBetweenVectors(_oPlayerPos);

        _vImpulse.set(Math.sin(fRadiants), Math.cos(fRadiants));

        _vImpulse.scalarProduct(distanceV2(_oOpponent.getPos(), CHARACTERS[PLAYER_SIDE].getPos()));

        var fXRandom = randomFloatBetween(0, AI_SERVICE_X_RANDOM, 2);
        var fYRandom = randomFloatBetween(0, AI_SERVICE_Y_RANDOM, 2);

        var oDir = {x: -_vImpulse.getX() * (FORCE_SERVICE_AXIS_OPPONENT.x + fXRandom), y: -_vImpulse.getY() * (FORCE_SERVICE_AXIS_OPPONENT.y + fYRandom),
            z: _vImpulse.getY() * FORCE_SERVICE_AXIS_OPPONENT.z};

        s_oGame.addImpulseToBall(oDir);

        s_oGame.ballShotBy(OPPONENT_SIDE);
        s_oGame.calculateVelocityService(oDir);
        playSound("hit_ball", 0.5, false);
    };

    this.shot = function () {
        var fDistance = distanceV2(_oOpponent.getPos(), BALL.getPos());

        if (fDistance > MIN_DISTANCE_FOR_SHOT_BALL) {
            return;
        }

        _oPlayerPos.set(CHARACTERS[PLAYER_SIDE].getPos().x, CHARACTERS[PLAYER_SIDE].getPos().y);
        _oOpponentPos.set(_oOpponent.getPos().x, _oOpponent.getPos().y);

        var fZ;
        
        var fDistNet = AI_Y_POINT - (AI_Y_POINT - _oOpponent.getPhysics().position.y);

        var iCase = 1;

        fZ = fDistNet * 0.25;
        iCase = randomFloatBetween(0, 1, 0);
        
        if (fZ > AI_RANGE_Z[s_iLevel].max) {
            fZ = AI_RANGE_Z[s_iLevel].max;
        } else if (fZ < AI_RANGE_Z[s_iLevel].min) {
            fZ = AI_RANGE_Z[s_iLevel].min;
        }

        var fDistBallFieldZ = (OFFSET_Z_AI_HEIGHT - BALL.getPhysics().position.z);

        fZ += fDistBallFieldZ;

        var fDistRand = randomFloatBetween(AI_DISTANCE_Y_MULTIPLIER[s_iLevel].min, AI_DISTANCE_Y_MULTIPLIER[s_iLevel].max, 2);

        switch (iCase) {
            case 0:
                var iDir = 1;
                if (_oPlayerPos.getX() < _oOpponentPos.getX()) {
                    iDir *= -1;
                }
                var fRadiants = _oPlayerPos.angleBetweenVectors(_oOpponentPos);
                _vImpulse.set(Math.sin(fRadiants) * iDir, Math.cos(fRadiants));

                var fRandX = ((Math.random() * AI_RANGE_FORCE_X[s_iLevel]) - AI_RANGE_FORCE_X[s_iLevel]) + AI_RANGE_FORCE_X[s_iLevel];
                var fRandY = ((Math.random() * AI_RANGE_FORCE_Y[s_iLevel]) - AI_RANGE_FORCE_Y[s_iLevel]) + AI_RANGE_FORCE_Y[s_iLevel];

                _vImpulse.scalarProduct(distanceV2({x: CHARACTERS[PLAYER_SIDE].getPos().x, y: (CHARACTERS[PLAYER_SIDE].getPos().y + (AI_RANGE_Z[s_iLevel].max - fZ)) * fDistRand}, _oOpponent.getPos()));

                _vImpulse.set((_vImpulse.getX() + fRandX) * 0.25, -_vImpulse.getY() - fRandY);
                break;

            case 1:
                //     var iDir = -0.5;
                var iDir = -1;
                if (CHARACTERS[PLAYER_SIDE].getPhysics().position.x < 0) {
                    iDir *= -1;
                }

                var oPointShot = new CVector2(Math.random() * (AI_POINT_SHOT_X), -(FIELD_HALF_LENGHT * fDistRand));
                var oOpponent3DPos = new CVector2(_oOpponent.getPhysics().position.x, _oOpponent.getPhysics().position.y);
                var vLimitField = new CVector2(AI_POINT_SHOT_X, oPointShot.getY());
                var vSimulation = new CVector2(Math.abs(oOpponent3DPos.getX()) + oPointShot.getX(), oPointShot.getY());

                if (vSimulation.getX() > vLimitField.getX()) {
                    iDir *= -1;
                    oPointShot.set((oPointShot.getX() + (vSimulation.getX() - vLimitField.getX())), oPointShot.getY());
                }

                var fRadiants = oPointShot.angleBetweenVectors(oOpponent3DPos);

                _vImpulse.set(Math.sin(fRadiants) * iDir, Math.cos(fRadiants));

                var fFactorRand = randomFloatBetween(0.27, 0.30, 2);

                _vImpulse.scalarProduct(distanceV2({x: oPointShot.getX(), y: oPointShot.getY() - fZ}, _oOpponent.getPos()));
                _vImpulse.set(_vImpulse.getX() * 0.24, _vImpulse.getY() * fFactorRand);
                _vImpulse.set(_vImpulse.getX(), _vImpulse.getY());

                break;
        }

        s_oGame.addImpulseToBall({x: _vImpulse.getX() * FORCE_MULTIPLIER_AXIS_OPPONENT.x, y: _vImpulse.getY() * FORCE_MULTIPLIER_AXIS_OPPONENT.y,
            z: fZ * FORCE_MULTIPLIER_AXIS_OPPONENT.z});
        s_oGame.ballShotBy(OPPONENT_SIDE);
        playSound("hit_ball", 0.5, false);
    };


    this._init();

    return this;
}