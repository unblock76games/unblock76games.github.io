function CBall( refWorld, refBallMaterial, refStdMaterial, iScene, iPosition, oCartCoords){	

	var aProj = [
		[-1.324419465111331,0.07007920010441403,0.1938814229049522,0.1928501356834461,-0.2649754991389736,-0.29199768911624474,-0.9738954395935614,-0.9687151293457442,0.00813866187260608,1.8973661726282403,-0.15703993365948804,-0.1562046123872247,172.14460555118495,-57.92280926049329,268.64013255353115,275.1899143092173],
		[-1.0311847252524577,-0.17599844916970192,-0.6427545415461143,-0.6393356242752912,0.8719967238119737,-0.26330126009450605,-0.7552979557156582,-0.7512804014885001,0.025392432048756682,1.8946950915444967,-0.16466751447142178,-0.16379162084052554,74.75179565415395,-37.2124724898568,323.023333753347,329.2838423047125],
		[-0.04192064711782405,-0.28804391554765474,-0.9934914290013894,-0.9882068844583713,1.3500256223076117,-0.017671886269370676,-0.030155903522676906,-0.02999549930503738,0.006203995474932445,1.8991816460801592,-0.15096085318711913,-0.15015786754513807,6.84660099873786,-40.15800737796026,335.8181997013088,342.0106502533296],
		[1.0287322954933102,-0.20296283656350578,-0.6427545605150148,-0.6393356431432929,0.8752566449130996,0.2404296293623392,0.7552979421456383,0.7512803879906613,-0.0008671184282911734,1.895038730402846,-0.1646675026722602,-0.16379160910412566,-75.22073485514608,-35.249324074836075,323.0233348288672,329.2838433745118],
		[1.3232711036898168,-0.00901517234163781,0.201487851298251,0.20041610423131065,-0.2666922478682122,0.28881907281462693,0.9738954354986644,0.9687151252726287,0.04684016896142928,1.8991247445227672,-0.14715365255419113,-0.14637091803943836,-176.51195787275645,-53.18780012690175,267.37304986600344,273.9295714431983]
	];

	var _bBallGrabbed = false,
		_bBallWaitToThrow = false,
		_bBallThrowing = false,
		_bTouchGround = false,
		_iCartPosition = iPosition,
		_iScene = iScene,
		_fMass = 1,		// CANNON.Js ball mass
		_fRadius = 7,	// CANNON.Js ball radius
		_fAngle = 0,
		
		_v3IniPos = [0,new CANNON.Vec3(97,150,86),new CANNON.Vec3(178,80,86),new CANNON.Vec3(195,-26,86),new CANNON.Vec3(130,-110,86),new CANNON.Vec3(112,-150,87)],
		_v3IniPosStand = [0,new CANNON.Vec3(97,150,78.5),new CANNON.Vec3(178,80,78.5),new CANNON.Vec3(195,-26,78.5),new CANNON.Vec3(130,-110,78.5),new CANNON.Vec3(112,-150,79.5)],
		_v3Winning = [0,new CANNON.Vec3(-1292.5,-5287.5, 6697.5),new CANNON.Vec3(-3995,-2702.5,6697.5),new CANNON.Vec3(-4935,+940,6580),new CANNON.Vec3(-2398.5,+4036.5,6552),new CANNON.Vec3(-1755,+5206.5, 6669)],
		_v2IniPos = {x: oCartCoords.x - BALL_SIZE, y: oCartCoords.y - 0.4*CANVAS_HEIGHT},
		_v2Position = {x:0, y:0},
		_v2PositionLag = {x:0, y:0},

		_oWorld = refWorld;
		
		this._oSphereBody;
		this._oStandBody;

		this._oSprite;
		this._oSpriteShadow;
		this._oContainer = undefined;

		this._v2SlideDestination = {x:0,y:0};

	// Ball initialized but not added to CANNON.Js world
	var _oSphereShape = new CANNON.Sphere(_fRadius);
	this._oSphereBody = new CANNON.Body({mass: _fMass,material: refBallMaterial});
	this._oSphereBody.position.copy(_v3IniPos[iScene]);
	this._oSphereBody.addShape(_oSphereShape);
	// Stand initialized but not added to CANNON.Js world
	var _oStandShape = new CANNON.Box(new CANNON.Vec3(2.5,2.5,0.5));
	this._oStandBody = new CANNON.Body({mass: 0,material: refStdMaterial});
	this._oStandBody.position.copy(_v3IniPosStand[iScene]);
	this._oStandBody.addShape(_oStandShape);

	this._oSpriteShadow = createBitmap(s_oSpriteLibrary.getSprite("shadow"));
	this._oSpriteShadow.regX = 104/2;
	this._oSpriteShadow.regY = 44/2;
	this._oSpriteShadow.visible = false;

        var szBallType;
        if(_iCartPosition === 0){
            szBallType = "ball_2";
        }else{
            szBallType = "ball_1";
        }
	
	this._oSprite = createBitmap(s_oSpriteLibrary.getSprite(szBallType));
	this._oSprite.regX = BALL_SIZE/2;
	this._oSprite.regY = BALL_SIZE/2;
	if (_iScene < 5) {
            this._oSprite.x = _v2IniPos.x - (_iCartPosition*BALL_SIZE*0.75); 
	} else {
            this._oSprite.x = _v2IniPos.x + (_iCartPosition-(NUM_SHOT_PER_SCENE-1))*BALL_SIZE*0.75;
	};
	
	this._oSprite.y = _v2IniPos.y;

	this._oContainer = new createjs.Container();
	this._oContainer.addChild(this._oSprite,this._oSpriteShadow);

	if (_iScene === 1) {
                s_oStage.addChildAt(this._oContainer,CART_DEPTH_INDEX + 1);
	} else {
                s_oStage.addChildAt(this._oContainer,CART_DEPTH_INDEX + 1);
	};

	this.unload = function(){
            _oWorld.remove(this._oSphereBody);
            _oWorld.remove(this._oStandBody);

            s_oStage.removeChild(this._oContainer);
	};

	this.update = function(){
            if (!_bBallThrowing) {
                _oWorld.step(1/30);

                _v2PositionLag.x = _v2Position.x;
                _v2PositionLag.y = _v2Position.y;
                _v2Position = this._projCoordScaling(this._oSphereBody.position);
                var speed = _v2Position.x - _v2PositionLag.x,scaling = _v2Position.diam/BALL_SIZE;

                if (scaling>1) {scaling=1;};

                this._oSprite.x = _v2Position.x;
                this._oSprite.y = _v2Position.y;
                this._oSprite.scaleY = this._oSprite.scaleX = scaling;
                _fAngle += speed*BALL_ROTATION_SPEED;
                this._oSprite.rotation = _fAngle;
                this._oSpriteShadow.visible = true;
                this._oSpriteShadow.x = _v2Position.shadowX;
                this._oSpriteShadow.y = _v2Position.shadowY;
                this._oSpriteShadow.scaleX = this._oSpriteShadow.x.scaleY = scaling*0.75;
                this._oSpriteShadow.alpha = (this._oSprite.y/CANVAS_HEIGHT)*0.66 + 0.33;	
            };	
	};

	this.grab = function(v2Dest){
            if(!_bBallGrabbed){
                _bBallGrabbed = true;

                createjs.Tween.removeTweens(this._oSprite);
                if (_iScene<5) {
                    createjs.Tween.get(this._oSprite).to({x:v2Dest.x,y:v2Dest.y}, 80,createjs.Ease.cubicIn);
                } else {
                    createjs.Tween.get(this._oSprite).to({x:v2Dest.x + 100,y:v2Dest.y}, 80,createjs.Ease.cubicIn);				
                };
            };
	};

	this.slide = function(){
            _fAngle -= 75;
            if (_iScene<5) {
                createjs.Tween.get(this._oSprite).to({x: this._oSprite.x - BALL_SIZE*0.8, rotation: _fAngle}, 500,createjs.Ease.linear);
            } else {
                createjs.Tween.get(this._oSprite).to({x: this._oSprite.x + BALL_SIZE*0.8, rotation: _fAngle}, 500,createjs.Ease.linear)			
            };
	};

	this.waitToThrow = function(){
            if (!_bBallWaitToThrow && !_bBallThrowing) {
                    _bBallWaitToThrow = true;
                    var that = this;

            createjs.Tween.get(this._oSprite).to({y: this._oSprite.y + 7}, 450,createjs.Ease.linear).call(function(){
                                                                                                    createjs.Tween.get(that._oSprite)
                                                                                                    .to({y: that._oSprite.y - 7}, 450,createjs.Ease.linear)
                                                                                                    .call(function(){
                                                                                                        _bBallWaitToThrow = false;
                                                                                                }); 
                                            },that);	
            };

	};

	this._projCoord = function(v3){
		var pos = {x: v3.x, y: v3.y, z: v3.z},
			x = pos.x, y = pos.y, z = pos.z,
	 		e = aProj[_iScene - 1];

		var d = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		pos.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ] ) * d;
		pos.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ] ) * d;
		pos.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * d;

		pos.x = (pos.x + 1) * CANVAS_WIDTH/2;
		pos.y = (-pos.y + 1) * CANVAS_HEIGHT/2;		

		return {x: pos.x, y: pos.y};
	};

	this._projCoordScaling = function(v3){
		var pos1 = this._projCoord( new CANNON.Vec3( v3.x , v3.y , v3.z+_fRadius ) ),
			pos2 = this._projCoord( new CANNON.Vec3( v3.x , v3.y , v3.z-_fRadius ) ),
			shdw = this._projCoord( new CANNON.Vec3( v3.x , v3.y , 0 ) ); 
		var diameter = Math.abs(pos1.y - pos2.y);
		return {x: (pos1.x + pos2.x)/2, y: (pos1.y + pos2.y)/2, diam: diameter, shadowX: shdw.x, shadowY: shdw.y};
	};

	this.throwingBall = function(v2Dest,v2Error,refBall){
		var that = this;
		var _v2Dest;

		if (_iScene < 5) {
			_v2Dest = {x: v2Dest.x-40, y: v2Dest.y-172};
		} else {
			_v2Dest = {x: v2Dest.x+145, y: v2Dest.y-172};
		};

		if(!_bBallThrowing){
                    _bBallThrowing = true;
                    createjs.Tween.removeTweens(this._oSprite);
                    createjs.Tween.get(this._oSprite).to({x:_v2Dest.x,y:_v2Dest.y}, 100,createjs.Ease.linear).call(function(){
                                            var v3Force;
                                            if (_iScene===1) {
                                                    v3Force = new CANNON.Vec3(_v3Winning[1].x - v2Error.x * ERROR_MULT,
                                                                                                                    _v3Winning[1].y + v2Error.y * ERROR_MULT,
                                                                                                                    _v3Winning[1].z)
                                            } else if (_iScene===2) {
                                                    v3Force = new CANNON.Vec3(_v3Winning[2].x - v2Error.x * ERROR_MULT,
                                                                                                                    _v3Winning[2].y + v2Error.y * ERROR_MULT,
                                                                                                                    _v3Winning[2].z)	        		
                                            } else if (_iScene===3) {
                                                    v3Force = new CANNON.Vec3(_v3Winning[3].x + v2Error.y * ERROR_MULT,
                                                                                                                    _v3Winning[3].y + v2Error.x * ERROR_MULT,
                                                                                                                    _v3Winning[3].z)	        		
                                            } else if (_iScene===4) {
                                                    v3Force = new CANNON.Vec3(_v3Winning[4].x + v2Error.x * ERROR_MULT,
                                                                                                                    _v3Winning[4].y - v2Error.y * ERROR_MULT,
                                                                                                                    _v3Winning[4].z);
                                            } else if (_iScene===5) {
                                                    v3Force = new CANNON.Vec3(_v3Winning[5].x + v2Error.x * ERROR_MULT,
                                                                                                                    _v3Winning[5].y - v2Error.y * ERROR_MULT,
                                                                                                                    _v3Winning[5].z);
                                            };

                                                    _oWorld.add(refBall._oSphereBody);
                                                    _oWorld.add(refBall._oStandBody);
                                                    that._oSphereBody.applyForce(
                                                            v3Force,
                                                            that._oSphereBody.position);
                                            },that);
                    that.update();
                    _bBallThrowing = false;			
                };		
	};

	this.touchGround = function(){
		var that = this;
		if(this._oSphereBody.position.z <= 7.01 && _bTouchGround === false){
                        playSound("us_bounce", 1, false);
                        
			_bTouchGround = true;
                        createjs.Tween.get(that._oContainer).to({alpha:0}, 1000, createjs.Ease.circIn).call(function(){
                                                                                                                    that.unload();
                                                                                                            },that);
		};
	};

	this.touchedGround = function(){
		return _bTouchGround;
	};

	this.getPosition = function(){
		return this._oSphereBody.position;
	};
        
        this.getCartPosition = function(){
            return _iCartPosition;
        };
};