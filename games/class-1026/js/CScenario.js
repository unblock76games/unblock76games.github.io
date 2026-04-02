function CScenario() {
    var _oWorld;
    var _oGroundMaterial;
    var _oBallMaterial;
    var _oHandKeeper;
    var _oBallShape;
    var _oBallBody;
    var _oBallMesh;
    var _oFieldShape;
    var _oFieldBody;
    var _oHandShapeKeeper;
    var _oHandBodyKeeper;
    var _oHandMeshKeeper;

    if (SHOW_3D_RENDER)
        var _oDemo = new CANNON.Demo();


    this.getDemo = function () {
        return _oDemo;
    };

    this._init = function () {

        if (SHOW_3D_RENDER) {
            _oWorld = _oDemo.getWorld();
        } else {
            _oWorld = new CANNON.World();
        }

        _oWorld.gravity.set(0, 0, -9.81);
        _oWorld.broadphase = new CANNON.NaiveBroadphase();
        _oWorld.solver.iterations = 50;
        _oWorld.solver.tolerance = 0.00001;

        _oGroundMaterial = new CANNON.Material();
        _oBallMaterial = new CANNON.Material();
        _oHandKeeper = new CANNON.Material();


        var oGroundBallCm = new CANNON.ContactMaterial(
                _oBallMaterial, _oGroundMaterial, {
                    friction: 0.2,
                    restitution: 0.3
                });

        var oHandBallCm = new CANNON.ContactMaterial(
                _oBallMaterial, _oHandKeeper, {
                    friction: 0.5,
                    restitution: 0.1
                });


        _oWorld.addContactMaterial(oGroundBallCm);
        _oWorld.addContactMaterial(oHandBallCm);

        s_oScenario._createBallBody();
        s_oScenario._createFieldBody();
        s_oScenario.createHandGoalKeeper();
    };

    this._createFieldBody = function () {
        _oFieldShape = new CANNON.Plane();
        _oFieldBody = new CANNON.Body({mass: 0, material: _oGroundMaterial});
        _oFieldBody.addShape(_oFieldShape);
        _oFieldBody.position.z = -10;

        _oFieldBody.addEventListener("collide", function (e) {
            s_oScenario.fieldCollision();
        });

        _oWorld.addBody(_oFieldBody);
        if (SHOW_3D_RENDER)
            _oDemo.addVisual(_oFieldBody);
    };


    this.createHandGoalKeeper = function () {
        _oHandShapeKeeper = new CANNON.Box(new CANNON.Vec3(HAND_KEEPER_SIZE.width, HAND_KEEPER_SIZE.depth, HAND_KEEPER_SIZE.height));

        _oHandBodyKeeper = new CANNON.Body({mass: 0, material: _oHandKeeper});
        _oHandBodyKeeper.addShape(_oHandShapeKeeper);
        _oHandBodyKeeper.position.set(HAND_KEEPER_POSITION.x, HAND_KEEPER_POSITION.y, HAND_KEEPER_POSITION.z);

        _oHandBodyKeeper.addEventListener("collide", function (e) {
            s_oScenario.handCollision(e);
        });

        _oWorld.addBody(_oHandBodyKeeper);

        if (SHOW_3D_RENDER)
            _oHandMeshKeeper = _oDemo.addVisual(_oHandBodyKeeper);
    };


    this._createBallBody = function () {
        _oBallShape = new CANNON.Sphere(BALL_RADIUS);
        _oBallBody = new CANNON.Body({mass: BALL_MASS, material: _oBallMaterial, linearDamping: BALL_LINEAR_DAMPING,
            angularDamping: BALL_LINEAR_DAMPING * 2});

        var v3IniPos = new CANNON.Vec3(POSITION_BALL.x, POSITION_BALL.y, POSITION_BALL.z);
        _oBallBody.position.copy(v3IniPos);
        _oBallBody.sleep();
        _oBallBody.addShape(_oBallShape);
        _oWorld.add(_oBallBody);
        if (SHOW_3D_RENDER)
            _oBallMesh = _oDemo.addVisual(_oBallBody);
    };

    this.addImpulse = function (oBody, oVec3) {
        _oBallBody.wakeUp();
        var v3WorldPoint = new CANNON.Vec3(0, 0, BALL_RADIUS);
        var v3Impulse = new CANNON.Vec3(oVec3.x, oVec3.y, oVec3.z);
        oBody.applyImpulse(v3Impulse, v3WorldPoint);
    };

    this.addForce = function (oBody, oVec3) {
        var v3WorldPoint = new CANNON.Vec3(0, 0, 0);
        var v3Force = new CANNON.Vec3(oVec3.x, oVec3.y, oVec3.z);
        oBody.applyForce(v3Force, v3WorldPoint);
    };

    this.getBodyVelocity = function (oBody) {
        return oBody.velocity;
    };

    this.ballBody = function () {
        return _oBallBody;
    };

    this.ballMesh = function () {
        return _oBallMesh;
    };

    this.getCamera = function () {
        return _oDemo.camera();
    };

    this.fieldCollision = function () {
        s_oGame.ballFadeForReset();
        playSound("drop_bounce_grass", 1, false);
    };


    this.setElementAngularVelocity = function (oElement, oVec3) {
        oElement.angularVelocity.set(oVec3.x, oVec3.y, oVec3.z);
    };

    this.setElementVelocity = function (oElement, oVec3) {
        var v3 = new CANNON.Vec3(oVec3.x, oVec3.y, oVec3.z);
        oElement.velocity = v3;
    };

    this.setElementLinearDamping = function (oElement, fValue) {
        oElement.linearDamping = fValue;
    };

    this.getFieldBody = function () {
        return _oFieldBody;
    };


    this.handCollision = function (e) {
        s_oGame.keeperSave(e.contact.rj);
    };

    this.update = function () {
        _oWorld.step(PHYSICS_STEP);
    };

    this.getHandKeeperBody = function () {
        return _oHandBodyKeeper;
    };

    this.getHandKeeperMesh = function () {
        return _oHandMeshKeeper;
    };

    
    this.isBallSleeping = function(){
        return _oBallBody.sleepState ;
    };



    this.destroyWorld = function () {
        var aBodies = _oWorld.bodies;

        for (var i = 0; i < aBodies.length; i++) {
            _oWorld.remove(aBodies[i]);
        }
        _oWorld = null;
    };

    s_oScenario = this;

    if (SHOW_3D_RENDER) {
        _oDemo.addScene("Test", this._init);
        _oDemo.start();
    } else {
        this._init();
    }

}

var s_oScenario;


