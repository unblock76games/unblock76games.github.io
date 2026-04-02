function CScenario() {

    var _iCurOutFieldCollisionID;
    var _iCurBoarderCollisionID;
    var _iCurNetCollisionID;
    var _iTimeStep;

    var _oWorld;
    var _oBallMaterial;
    var _oTerrainMaterial;
    var _oBallShape;
    var _oBallBody;
    var _oBallMesh;

    var _oFieldBody;
    var _oNetBody;
    var _oOutFieldBody;
    var _oBoarderBody;

    var _oOpponentBody;
    var _oPlayerBody;

    if (SHOW_3D_RENDER)
        var _oDemo = new CANNON.Demo();


    this.getDemo = function () {
        return _oDemo;
    };

    this._init = function () {
        _iTimeStep = TIME_STEP_WORLD;

        _iCurOutFieldCollisionID = null;
        _iCurBoarderCollisionID = null;
        _iCurNetCollisionID = null;


        if (SHOW_3D_RENDER) {
            _oWorld = _oDemo.getWorld();
            //var light = new THREE.AmbientLight( 0x404040 ); // soft white light
            //_oWorld.add( light );
        } else {
            _oWorld = new CANNON.World();
        }

        //_oWorld.gravity.set(0, 0, -9.81);
        _oWorld.gravity.set(0, 0, -9.81 * FPS);
        //_oWorld.gravity.set(0, 0, -180.1);
        _oWorld.broadphase = new CANNON.NaiveBroadphase();
        _oWorld.solver.iterations = 20;

        _oBallMaterial = new CANNON.Material();
        _oTerrainMaterial = new CANNON.Material();

        var ball_basket_cm = new CANNON.ContactMaterial(
                _oBallMaterial, _oTerrainMaterial, {
                    friction: 0.3,
                    restitution: 0.7,
                    contactEquationStiffness: 1e8,
                    contactEquationRelaxation: 3,
                    frictionEquationStiffness: 1e8,
                    frictionEquationRegularizationTime: 3
                });

        _oWorld.addContactMaterial(ball_basket_cm);

        s_oScenario.createNet();
        s_oScenario._createBallBody();
        _oPlayerBody = s_oScenario.oCharacterBody(PLAYER_POS_3D[s_iServiceSide], PROXY_COLLISION_PLAYER);

        _oOpponentBody = s_oScenario.oCharacterBody(OPPONENT_POS_3D[s_iServiceSide], PROXY_COLLISION_PLAYER);
//           model FBX
        var manager = new THREE.LoadingManager();
        manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
            }
        };

        var onError = function (xhr) {
        };

        var loader = new THREE.FBXLoader(manager);
        var oParent = this;

        loader.load('models/tennis_stadium.txt', function (objects) {
            s_oScenario.parseFile(objects);
            s_oGame.scenarioLoaded();
            objects = null;
			trace("scenario loaded");

        }, onProgress, onError);

    };

    this.parseFile = function (oFile) {
//        console.log(oFile);

        for (var i = 0; i < oFile.children.length; i++) {
            var oMesh = oFile.children[i];

            console.log("oMesh.name: " + oMesh.name);

            if (oMesh.name === "court") {
                s_oScenario._createFieldBody(oMesh);
            } else if (oMesh.name === "outfield") {
                s_oScenario._createOutField(oMesh);
            } else if (oMesh.name === "out") {
                s_oScenario._createBoarder(oMesh);
            }
        }
    };

    this.__extractMeshData = function (oMesh) {

        var aRawFaces = oMesh.geometry.faces;
        var aRawVerts = oMesh.geometry.vertices;
        var aOnlyFaceCoord = new Array();

        for (var i = 0; i < aRawFaces.length; i++) {
            aOnlyFaceCoord[i] = {a: aRawFaces[i].a, b: aRawFaces[i].b, c: aRawFaces[i].c};
        }

        var verts = [], faces = [];
        var fScale = 1;//0.5;
        // Get vertices
        for (var i = 0; i < aRawVerts.length; i++) {
            verts.push(aRawVerts[i].x * fScale);
            verts.push(aRawVerts[i].y * fScale);
            verts.push(aRawVerts[i].z * fScale);
        }
        // Get faces
        for (var i = 0; i < aRawFaces.length; i++) {
            faces.push(aRawFaces[i].a);
            faces.push(aRawFaces[i].b);
            faces.push(aRawFaces[i].c);
        }
        // Construct polyhedron
        return new CANNON.Trimesh(verts, faces);
    };

    this.oCharacterBody = function (oPos, oProperty) {
        var oShape = new CANNON.Box(new CANNON.Vec3(oProperty.width, oProperty.depth, oProperty.height));

        var oBody = new CANNON.Body({mass: 0});
        oBody.addShape(oShape);
        oBody.position.set(oPos.x, oPos.y, oPos.z);

        _oWorld.addBody(_oNetBody);

        if (SHOW_3D_RENDER) {
            var oMaterial = new THREE.MeshPhongMaterial({color: 0xffc281, specular: 0x111111, shininess: 70});
            _oDemo.addVisual(oBody, oMaterial);
        }

        return oBody;
    };

    this.createNet = function () {
        var oNetShape = new CANNON.Box(new CANNON.Vec3(NET_PROPERTIES.width, NET_PROPERTIES.depth, NET_PROPERTIES.height));

        _oNetBody = new CANNON.Body({mass: 0});
        _oNetBody.addShape(oNetShape);
        _oNetBody.position.set(NET_PROPERTIES.x, NET_PROPERTIES.y, NET_PROPERTIES.z);

        _oNetBody.addEventListener("collide", function (e) {
            s_oScenario.netCollision(e);
        });

        _oWorld.addBody(_oNetBody);

        if (SHOW_3D_RENDER) {
            var oNetMaterial = new THREE.MeshPhongMaterial({color: 0xff0000, specular: 0x111111, shininess: 70});
            _oDemo.addVisual(_oNetBody, oNetMaterial);
        }
    };

    this._createFieldBody = function (oMesh) {
        //   var oFieldMesh = this.__extractMeshData(oMesh);

        var oBoundingPlane = BoundingBox(oMesh.geometry.vertices);

        var iXMed = (Math.abs(oBoundingPlane.xMin) + Math.abs(oBoundingPlane.xMax)) * 0.5;
        var iYMed = (Math.abs(oBoundingPlane.yMin) + Math.abs(oBoundingPlane.yMax)) * 0.5;

        var oFieldShape = new CANNON.Box(new CANNON.Vec3(iXMed, iYMed, FIELD_HEIGHT));
        // Add to compound
        _oFieldBody = new CANNON.Body({mass: 0, material: _oTerrainMaterial});
        _oFieldBody.addShape(oFieldShape);

        var v3IniPos = new CANNON.Vec3(oMesh.position.x, oMesh.position.y, oMesh.position.z - FIELD_HEIGHT);
        _oFieldBody.position.copy(v3IniPos);

        OFFSET_BALL_FIELD_Z_IMP = v3IniPos.z + BALL_RADIUS + 0.1;

        _oFieldBody.addEventListener("collide", function (e) {
            s_oScenario.fieldCollision(e);
        });

        // Create bodys
        _oWorld.addBody(_oFieldBody);

        if (SHOW_3D_RENDER) {
            var oFieldMaterial = new THREE.MeshPhongMaterial({color: 0x00ffff, specular: 0x111111, shininess: 70});
            _oDemo.addVisual(_oFieldBody, oFieldMaterial);
        }
    };

    this._createBallBody = function () {
        _oBallShape = new CANNON.Sphere(BALL_RADIUS);
        _oBallBody = new CANNON.Body({mass: BALL_MASS, material: _oBallMaterial, linearDamping: BALL_LINEAR_DAMPING,
            angularDamping: BALL_ANGULAR_DAMPING});

        var v3IniPos = new CANNON.Vec3(START_BALL_POSITION[SERVICE_BY][s_iServiceSide].x, START_BALL_POSITION[SERVICE_BY][s_iServiceSide].y,
                START_BALL_POSITION[SERVICE_BY][s_iServiceSide].z);
        _oBallBody.position.copy(v3IniPos);
        _oBallBody.previousPosition.copy(v3IniPos);

        _oBallBody.addShape(_oBallShape);
        _oWorld.add(_oBallBody);
        if (SHOW_3D_RENDER) {
            var oMaterial = new THREE.MeshPhongMaterial({color: 0xedf842, specular: 0x111111, shininess: 10});
            _oBallMesh = _oDemo.addVisual(_oBallBody, oMaterial);
        }
    };

    this._createOutField = function (oMesh) {
        var oOutFieldPosition = new CANNON.Vec3(oMesh.position.x, oMesh.position.y, oMesh.position.z);
        var oOutFieldMesh = this.__extractMeshData(oMesh);

        var iID = 0; //IF THERE ARE MORE THEN 1 SAME OBJECT, THEN iID = _aObjBody.length

        _oOutFieldBody = new CANNON.Body({mass: 0, material: _oTerrainMaterial});

        _oOutFieldBody.ID = iID;
        _oOutFieldBody.addEventListener("collide", function (e) {
//            _iCurOutFieldCollisionID = e.target.ID;
            s_oScenario.outFieldCollision(e);
        });

        _oOutFieldBody.addShape(oOutFieldMesh);
        _oOutFieldBody.position.copy(oOutFieldPosition);

        _oWorld.add(_oOutFieldBody);

        if (SHOW_3D_RENDER) {
            var oMaterial = new THREE.MeshPhongMaterial({color: 0x009900, specular: 0x111111, shininess: 30});
            _oDemo.addVisual(_oOutFieldBody, oMaterial);
        }
    };

    this._createBoarder = function (oMesh) {
        var oBoarderPosition = new CANNON.Vec3(oMesh.position.x, oMesh.position.y, oMesh.position.z);
        var oBoarderMesh = this.__extractMeshData(oMesh);

        var iID = 0; //IF THERE ARE MORE THEN 1 SAME OBJECT, THEN iID = _aObjBody.length

        _oBoarderBody = new CANNON.Body({mass: 0, material: _oTerrainMaterial});

        _oBoarderBody.ID = iID;
        _oBoarderBody.addEventListener("collide", function (e) {
//            _iCurBoarderCollisionID = e.target.ID;
            s_oScenario.borderCollision(e);
        });

        _oBoarderBody.addShape(oBoarderMesh);
        _oBoarderBody.position.copy(oBoarderPosition);

        _oWorld.add(_oBoarderBody);

        if (SHOW_3D_RENDER) {
            var oMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff, specular: 0x555555, shininess: 30});
            _oDemo.addVisual(_oBoarderBody, oMaterial);
        }
    };

    this.netCollision = function (e) {
        s_oGame.ballCollideNet();
    };

    this.addImpulse = function (oBody, oVec3) {
        var v3WorldPoint = new CANNON.Vec3(0, 0, 0);
        var v3Impulse = new CANNON.Vec3(oVec3.x, oVec3.y, oVec3.z);
        oBody.applyImpulse(v3Impulse, v3WorldPoint);
    };

    this.getBodyVelocity = function (oBody) {
        return oBody.velocity;
    };

    this.ballBody = function () {
        return _oBallBody;
    };

    this.playerBody = function () {
        return _oPlayerBody;
    };

    this.opponentBody = function () {
        return _oOpponentBody;
    };

    this.ballMesh = function () {
        return _oBallMesh;
    };

    this.getCamera = function () {
        return _oDemo.camera();
    };

    this.setElementLinearDamping = function (oElement, fValue) {
        oElement.linearDamping = fValue;
    };

    this.setGravity = function (iVal) {
        _oWorld.gravity.set(0, 0, iVal);
    };

    this.update = function () {
        _oWorld.step(_iTimeStep);

        /*
         if(_bFieldCollision){
         this._checkFieldCollision();
         }
         
         if(_iCurOutFieldCollisionID !== null){
         this._checkOutFieldCollision();
         }
         if(_iCurBoarderCollisionID !== null){
         this._checkBoarderCollision();
         }
         if(_iCurNetCollisionID !== null){
         this._checkNetCollision();
         }
         */
    };

    this._checkFieldCollision = function () {
        for (var i = 0; i < _oWorld.contacts.length; i++) {
            var c = _oWorld.contacts[i];
            if ((c.bi === _oFieldBody && c.bj === _oBallBody) || (c.bi === _oBallBody && c.bj === _oFieldBody)) {
                s_oGame.ballCollideWithField(true);
                return true;
            }
        }
        s_oGame.ballCollideWithField(false);
        return false;
    };

    this._checkOutFieldCollision = function () {
        for (var i = 0; i < _oWorld.contacts.length; i++) {
            var c = _oWorld.contacts[i];
            if ((c.bi === _oOutFieldBody && c.bj === _oBallBody) || (c.bi === _oBallBody && c.bj === _oOutFieldBody)) {
                s_oGame.ballCollideWithOutField(true);
                return true;
            }
        }
        s_oGame.ballCollideWithOutField(false);
        _iCurOutFieldCollisionID = null;
        return false;
    };

    this._checkBoarderCollision = function () {
        for (var i = 0; i < _oWorld.contacts.length; i++) {
            var c = _oWorld.contacts[i];
            if ((c.bi === _oBoarderBody && c.bj === _oBallBody) || (c.bi === _oBallBody && c.bj === _oBoarderBody)) {
                s_oGame.ballCollideWithBoarder(true);
                return true;
            }
        }
        s_oGame.ballCollideWithBoarder(false);
        _iCurBoarderCollisionID = null;
        return false;
    };

    this._checkNetCollision = function () {
        for (var i = 0; i < _oWorld.contacts.length; i++) {
            var c = _oWorld.contacts[i];
            if ((c.bi === _oNetBody && c.bj === _oBallBody) || (c.bi === _oBallBody && c.bj === _oNetBody)) {
                s_oGame.ballCollideWithNet(true);
                return true;
            }
        }
        s_oGame.ballCollideWithNet(false);
        _iCurNetCollisionID = null;
        return false;
    };

    this.fieldCollision = function (e) {
        var fImpactForce = Math.abs(e.body.velocity.z) / BALL_MAX_VOL_IMPACT;

        playSound("hit_court", fImpactForce, false);
        s_oGame.ballFieldTouch();
    };

    this.borderCollision = function (e) {
        s_oGame.ballOut();
    };

    this.outFieldCollision = function (e) {
        s_oGame.ballOut();
    };

    this.getWorld = function () {
        return _oWorld;
    };

    this.getNetBody = function () {
        return _oNetBody;
    };

    this.getField = function () {
        return _oFieldBody;
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


