var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Utils;
(function (Utils) {
    var AssetLoader = (function () {
        function AssetLoader(_lang, _aFileData, _ctx, _canvasWidth, _canvasHeight, _showBar) {
            if (_showBar === void 0) { _showBar = true; }
            this.oAssetData = {};
            this.assetsLoaded = 0;
            this.textData = {};
            this.spinnerRot = 0;
            this.totalAssets = _aFileData.length;
            this.showBar = _showBar;
            for (var i = 0; i < _aFileData.length; i++) {
                if (_aFileData[i].file.indexOf(".json") != -1) {
                    this.loadJSON(_aFileData[i]);
                }
                else {
                    this.loadImage(_aFileData[i]);
                }
            }
            if (_showBar) {
                this.oLoaderImgData = preAssetLib.getData("loader");
                this.oLoadSpinnerImgData = preAssetLib.getData("loadSpinner");
            }
        }
        AssetLoader.prototype.render = function () {
            ctx.fillStyle = "rgba(0, 0, 0, 1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 + 20, (300 / this.totalAssets) * this.assetsLoaded, 30);
            ctx.drawImage(this.oLoaderImgData.img, canvas.width / 2 - this.oLoaderImgData.img.width / 2, canvas.height / 2 - this.oLoaderImgData.img.height / 2);
            this.spinnerRot += delta * 3;
            ctx.save();
            ctx.translate(canvas.width / 2 - 30, canvas.height / 2 - 15);
            ctx.rotate(this.spinnerRot);
            ctx.drawImage(this.oLoadSpinnerImgData.img, -this.oLoadSpinnerImgData.img.width / 2, -this.oLoadSpinnerImgData.img.height / 2);
            ctx.restore();
            this.displayNumbers();
        };
        AssetLoader.prototype.displayNumbers = function () {
            ctx.textAlign = "left";
            ctx.font = "bold 40px arial";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(Math.round((this.assetsLoaded / this.totalAssets) * 100) + "%", canvas.width / 2, canvas.height / 2);
        };
        AssetLoader.prototype.loadExtraAssets = function (_callback, _aFileData) {
            this.showBar = false;
            this.totalAssets = _aFileData.length;
            this.assetsLoaded = 0;
            this.loadedCallback = _callback;
            for (var i = 0; i < _aFileData.length; i++) {
                if (_aFileData[i].file.indexOf(".json") != -1) {
                    this.loadJSON(_aFileData[i]);
                }
                else {
                    this.loadImage(_aFileData[i]);
                }
            }
        };
        AssetLoader.prototype.loadJSON = function (_oData) {
            var _this = this;
            var xobj = new XMLHttpRequest();
            xobj.open('GET', _oData.file, true);
            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == 200) {
                    _this.textData[_oData.id] = JSON.parse(xobj.responseText);
                    ++_this.assetsLoaded;
                    _this.checkLoadComplete();
                }
            };
            xobj.send(null);
        };
        AssetLoader.prototype.loadImage = function (_oData) {
            var _this = this;
            var img = new Image();
            img.onload = function () {
                _this.oAssetData[_oData.id] = {};
                _this.oAssetData[_oData.id].img = img;
                _this.oAssetData[_oData.id].oData = {};
                var aSpriteSize = _this.getSpriteSize(_oData.file);
                if (aSpriteSize[0] != 0) {
                    _this.oAssetData[_oData.id].oData.spriteWidth = aSpriteSize[0];
                    _this.oAssetData[_oData.id].oData.spriteHeight = aSpriteSize[1];
                }
                else {
                    _this.oAssetData[_oData.id].oData.spriteWidth = _this.oAssetData[_oData.id].img.width;
                    _this.oAssetData[_oData.id].oData.spriteHeight = _this.oAssetData[_oData.id].img.height;
                }
                if (_oData.oAnims) {
                    _this.oAssetData[_oData.id].oData.oAnims = _oData.oAnims;
                }
                if (_oData.oAtlasData) {
                    _this.oAssetData[_oData.id].oData.oAtlasData = _oData.oAtlasData;
                }
                else {
                    _this.oAssetData[_oData.id].oData.oAtlasData = { none: { x: 0, y: 0, width: _this.oAssetData[_oData.id].oData.spriteWidth, height: _this.oAssetData[_oData.id].oData.spriteHeight } };
                }
                ++_this.assetsLoaded;
                _this.checkLoadComplete();
            };
            img.src = _oData.file;
        };
        AssetLoader.prototype.getSpriteSize = function (_file) {
            var aNew = new Array();
            var sizeY = "";
            var sizeX = "";
            var stage = 0;
            var inc = _file.lastIndexOf(".");
            var canCont = true;
            while (canCont) {
                inc--;
                if (stage == 0 && this.isNumber(_file.charAt(inc))) {
                    sizeY = _file.charAt(inc) + sizeY;
                }
                else if (stage == 0 && sizeY.length > 0 && _file.charAt(inc) == "x") {
                    inc--;
                    stage = 1;
                    sizeX = _file.charAt(inc) + sizeX;
                }
                else if (stage == 1 && this.isNumber(_file.charAt(inc))) {
                    sizeX = _file.charAt(inc) + sizeX;
                }
                else if (stage == 1 && sizeX.length > 0 && _file.charAt(inc) == "_") {
                    canCont = false;
                    aNew = [parseInt(sizeX), parseInt(sizeY)];
                }
                else {
                    canCont = false;
                    aNew = [0, 0];
                }
            }
            return aNew;
        };
        AssetLoader.prototype.isNumber = function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        AssetLoader.prototype.checkLoadComplete = function () {
            if (this.assetsLoaded == this.totalAssets) {
                this.loadedCallback();
            }
        };
        AssetLoader.prototype.onReady = function (_func) {
            this.loadedCallback = _func;
        };
        AssetLoader.prototype.getImg = function (_id) {
            return this.oAssetData[_id].img;
        };
        AssetLoader.prototype.getData = function (_id) {
            return this.oAssetData[_id];
        };
        return AssetLoader;
    }());
    Utils.AssetLoader = AssetLoader;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var AnimSprite = (function () {
        function AnimSprite(_oImgData, _fps, _radius, _animId) {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.radius = 10;
            this.removeMe = false;
            this.frameInc = 0;
            this.animType = "loop";
            this.offsetX = 0;
            this.offsetY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.alpha = 1;
            this.oImgData = _oImgData;
            this.oAnims = this.oImgData.oData.oAnims;
            this.fps = _fps;
            this.radius = _radius;
            this.animId = _animId;
            this.centreX = Math.round(this.oImgData.oData.spriteWidth / 2);
            this.centreY = Math.round(this.oImgData.oData.spriteHeight / 2);
        }
        AnimSprite.prototype.updateAnimation = function (_delta) {
            this.frameInc += this.fps * _delta;
        };
        AnimSprite.prototype.changeImgData = function (_newImgData, _animId) {
            this.oImgData = _newImgData;
            this.oAnims = this.oImgData.oData.oAnims;
            this.animId = _animId;
            this.centreX = Math.round(this.oImgData.oData.spriteWidth / 2);
            this.centreY = Math.round(this.oImgData.oData.spriteHeight / 2);
            this.resetAnim();
        };
        AnimSprite.prototype.resetAnim = function () {
            this.frameInc = 0;
        };
        AnimSprite.prototype.setFrame = function (_frameNum) {
            this.fixedFrame = _frameNum;
        };
        AnimSprite.prototype.setAnimType = function (_type, _animId, _reset) {
            if (_reset === void 0) { _reset = true; }
            this.animId = _animId;
            this.animType = _type;
            if (_reset) {
                this.resetAnim();
            }
            switch (_type) {
                case "loop":
                    break;
                case "once":
                    this.maxIdx = this.oAnims[this.animId].length - 1;
                    break;
            }
        };
        AnimSprite.prototype.render = function (_ctx) {
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            _ctx.scale(this.scaleX, this.scaleY);
            _ctx.globalAlpha = this.alpha;
            if (this.animId != null) {
                var max = this.oAnims[this.animId].length;
                var idx = Math.floor(this.frameInc);
                this.curFrame = this.oAnims[this.animId][idx % max];
                var imgX = (this.curFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.curFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                if (this.animType == "once") {
                    if (idx > this.maxIdx) {
                        this.fixedFrame = this.oAnims[this.animId][max - 1];
                        this.animId = null;
                        if (this.animEndedFunc != null) {
                            this.animEndedFunc();
                        }
                        var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                        var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                    }
                }
            }
            else {
                var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            }
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, -this.centreX + this.offsetX, -this.centreY + this.offsetY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight);
            _ctx.restore();
        };
        AnimSprite.prototype.renderSimple = function (_ctx) {
            if (this.animId != null) {
                var max = this.oAnims[this.animId].length;
                var idx = Math.floor(this.frameInc);
                this.curFrame = this.oAnims[this.animId][idx % max];
                var imgX = (this.curFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.curFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                if (this.animType == "once") {
                    if (idx > this.maxIdx) {
                        this.fixedFrame = this.oAnims[this.animId][max - 1];
                        this.animId = null;
                        if (this.animEndedFunc != null) {
                            this.animEndedFunc();
                        }
                        var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                        var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                    }
                }
            }
            else {
                var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            }
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, this.x - (this.centreX - this.offsetX) * this.scaleX, this.y - (this.centreY - this.offsetY) * this.scaleY, this.oImgData.oData.spriteWidth * this.scaleX, this.oImgData.oData.spriteHeight * this.scaleY);
        };
        return AnimSprite;
    }());
    Utils.AnimSprite = AnimSprite;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var BasicSprite = (function () {
        function BasicSprite(_oImgData, _radius, _frame) {
            if (_frame === void 0) { _frame = 0; }
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.radius = 10;
            this.removeMe = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.oImgData = _oImgData;
            this.radius = _radius;
            this.setFrame(_frame);
        }
        BasicSprite.prototype.setFrame = function (_frameNum) {
            this.frameNum = _frameNum;
        };
        BasicSprite.prototype.render = function (_ctx) {
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            _ctx.scale(this.scaleX, this.scaleY);
            var imgX = (this.frameNum * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
            var imgY = Math.floor(this.frameNum / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, -this.oImgData.oData.spriteWidth / 2 + this.offsetX, -this.oImgData.oData.spriteHeight / 2 + this.offsetY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight);
            _ctx.restore();
        };
        return BasicSprite;
    }());
    Utils.BasicSprite = BasicSprite;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var UserInput = (function () {
        function UserInput(_canvas, _isBugBrowser) {
            var _this = this;
            this.prevHitTime = 0;
            this.pauseIsOn = false;
            this.isDown = false;
            this.isBugBrowser = _isBugBrowser;
            this.keyDownEvtFunc = function (e) {
                _this.keyDown(e);
            };
            this.keyUpEvtFunc = function (e) {
                _this.keyUp(e);
            };
            _canvas.addEventListener("touchstart", function (e) {
                for (var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitDown(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchend", function (e) {
                for (var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitUp(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchcancel", function (e) {
                for (var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitCancel(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchmove", function (e) {
                for (var i = 0; i < e.changedTouches.length; i++) {
                    _this.move(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier, true);
                }
            }, false);
            _canvas.addEventListener("mousedown", function (e) {
                _this.isDown = true;
                _this.hitDown(e, e.pageX, e.pageY, 1);
            }, false);
            _canvas.addEventListener("mouseup", function (e) {
                _this.isDown = false;
                _this.hitUp(e, e.pageX, e.pageY, 1);
            }, false);
            _canvas.addEventListener("mousemove", function (e) {
                _this.move(e, e.pageX, e.pageY, 1, _this.isDown);
            }, false);
            _canvas.addEventListener("mouseout", function (e) {
                _this.isDown = false;
                _this.hitUp(e, Math.abs(e.pageX), Math.abs(e.pageY), 1);
            }, false);
            this.aHitAreas = new Array();
            this.aKeys = new Array();
        }
        UserInput.prototype.hitDown = function (e, _posX, _posY, _identifer) {
            e.preventDefault();
            e.stopPropagation();
            if (!hasFocus) {
                visibleResume();
            }
            if (this.pauseIsOn) {
                return;
            }
            var curHitTime = new Date().getTime();
            _posX *= canvasScale;
            _posY *= canvasScale;
            for (var i = 0; i < this.aHitAreas.length; i++) {
                if (this.aHitAreas[i].rect) {
                    var aX = canvas.width * this.aHitAreas[i].align[0];
                    var aY = canvas.height * this.aHitAreas[i].align[1];
                    if (_posX > aX + this.aHitAreas[i].area[0] && _posY > aY + this.aHitAreas[i].area[1] && _posX < aX + this.aHitAreas[i].area[2] && _posY < aY + this.aHitAreas[i].area[3]) {
                        this.aHitAreas[i].aTouchIdentifiers.push(_identifer);
                        this.aHitAreas[i].oData.hasLeft = false;
                        if (!this.aHitAreas[i].oData.isDown) {
                            this.aHitAreas[i].oData.isDown = true;
                            this.aHitAreas[i].oData.x = _posX;
                            this.aHitAreas[i].oData.y = _posY;
                            if ((curHitTime - this.prevHitTime < 500 && (gameState != "game" || this.aHitAreas[i].id == "pause")) && isBugBrowser) {
                                return;
                            }
                            this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                        }
                        break;
                    }
                }
                else {
                }
            }
            this.prevHitTime = curHitTime;
        };
        UserInput.prototype.hitUp = function (e, _posX, _posY, _identifer) {
            if (!ios9FirstTouch) {
                ios9FirstTouch = true;
            }
            if (this.pauseIsOn) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            _posX *= canvasScale;
            _posY *= canvasScale;
            for (var i = 0; i < this.aHitAreas.length; i++) {
                if (this.aHitAreas[i].rect) {
                    var aX = canvas.width * this.aHitAreas[i].align[0];
                    var aY = canvas.height * this.aHitAreas[i].align[1];
                    if (_posX > aX + this.aHitAreas[i].area[0] && _posY > aY + this.aHitAreas[i].area[1] && _posX < aX + this.aHitAreas[i].area[2] && _posY < aY + this.aHitAreas[i].area[3]) {
                        for (var j = 0; j < this.aHitAreas[i].aTouchIdentifiers.length; j++) {
                            if (this.aHitAreas[i].aTouchIdentifiers[j] == _identifer) {
                                this.aHitAreas[i].aTouchIdentifiers.splice(j, 1);
                                j -= 1;
                            }
                        }
                        if (this.aHitAreas[i].aTouchIdentifiers.length == 0) {
                            this.aHitAreas[i].oData.isDown = false;
                            if (this.aHitAreas[i].oData.multiTouch) {
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                            }
                        }
                        break;
                    }
                }
                else {
                }
            }
        };
        UserInput.prototype.hitCancel = function (e, _posX, _posY, _identifer) {
            e.preventDefault();
            e.stopPropagation();
            _posX *= canvasScale;
            _posY *= canvasScale;
            for (var i = 0; i < this.aHitAreas.length; i++) {
                if (this.aHitAreas[i].oData.isDown) {
                    this.aHitAreas[i].oData.isDown = false;
                    this.aHitAreas[i].aTouchIdentifiers = new Array();
                    if (this.aHitAreas[i].oData.multiTouch) {
                        this.aHitAreas[i].oData.x = _posX;
                        this.aHitAreas[i].oData.y = _posY;
                        this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                    }
                }
            }
        };
        UserInput.prototype.move = function (e, _posX, _posY, _identifer, _isDown) {
            if (this.pauseIsOn) {
                return;
            }
            if (_isDown) {
                _posX *= canvasScale;
                _posY *= canvasScale;
                for (var i = 0; i < this.aHitAreas.length; i++) {
                    if (this.aHitAreas[i].rect) {
                        var aX = canvas.width * this.aHitAreas[i].align[0];
                        var aY = canvas.height * this.aHitAreas[i].align[1];
                        if (_posX > aX + this.aHitAreas[i].area[0] && _posY > aY + this.aHitAreas[i].area[1] && _posX < aX + this.aHitAreas[i].area[2] && _posY < aY + this.aHitAreas[i].area[3]) {
                            this.aHitAreas[i].oData.hasLeft = false;
                            if (this.aHitAreas[i].oData.isDraggable && !this.aHitAreas[i].oData.isDown) {
                                this.aHitAreas[i].oData.isDown = true;
                                this.aHitAreas[i].oData.isBeingDragged = true;
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].aTouchIdentifiers.push(_identifer);
                                if (this.aHitAreas[i].oData.multiTouch) {
                                    this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                }
                            }
                            if (this.aHitAreas[i].oData.isDraggable) {
                                this.aHitAreas[i].oData.isBeingDragged = true;
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                if (this.aHitAreas[i]) {
                                    this.aHitAreas[i].oData.isBeingDragged = false;
                                }
                            }
                        }
                        else if (this.aHitAreas[i].oData.isDown && !this.aHitAreas[i].oData.hasLeft) {
                            for (var j = 0; j < this.aHitAreas[i].aTouchIdentifiers.length; j++) {
                                if (this.aHitAreas[i].aTouchIdentifiers[j] == _identifer) {
                                    this.aHitAreas[i].aTouchIdentifiers.splice(j, 1);
                                    j -= 1;
                                }
                            }
                            if (this.aHitAreas[i].aTouchIdentifiers.length == 0) {
                                this.aHitAreas[i].oData.hasLeft = true;
                                if (!this.aHitAreas[i].oData.isBeingDragged) {
                                    this.aHitAreas[i].oData.isDown = false;
                                }
                                if (this.aHitAreas[i].oData.multiTouch) {
                                    this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                }
                            }
                        }
                    }
                }
            }
        };
        UserInput.prototype.keyDown = function (e) {
            for (var i = 0; i < this.aKeys.length; i++) {
                if (e.keyCode == this.aKeys[i].keyCode) {
                    e.preventDefault();
                    this.aKeys[i].oData.isDown = true;
                    this.aKeys[i].callback(this.aKeys[i].id, this.aKeys[i].oData);
                }
            }
        };
        UserInput.prototype.keyUp = function (e) {
            for (var i = 0; i < this.aKeys.length; i++) {
                if (e.keyCode == this.aKeys[i].keyCode) {
                    e.preventDefault();
                    this.aKeys[i].oData.isDown = false;
                    this.aKeys[i].callback(this.aKeys[i].id, this.aKeys[i].oData);
                }
            }
        };
        UserInput.prototype.checkKeyFocus = function () {
            window.focus();
            if (this.aKeys.length > 0) {
                window.removeEventListener('keydown', this.keyDownEvtFunc, false);
                window.removeEventListener('keyup', this.keyUpEvtFunc, false);
                window.addEventListener('keydown', this.keyDownEvtFunc, false);
                window.addEventListener('keyup', this.keyUpEvtFunc, false);
            }
        };
        UserInput.prototype.addKey = function (_id, _callback, _oCallbackData, _keyCode) {
            if (_oCallbackData == null) {
                _oCallbackData = new Object();
            }
            this.aKeys.push({ id: _id, callback: _callback, oData: _oCallbackData, keyCode: _keyCode });
            this.checkKeyFocus();
        };
        UserInput.prototype.removeKey = function (_id) {
            for (var i = 0; i < this.aKeys.length; i++) {
                if (this.aKeys[i].id == _id) {
                    this.aKeys.splice(i, 1);
                    i -= 1;
                }
            }
        };
        UserInput.prototype.addHitArea = function (_id, _callback, _oCallbackData, _type, _oAreaData, _isUnique) {
            if (_isUnique === void 0) { _isUnique = false; }
            if (_oCallbackData == null) {
                _oCallbackData = new Object();
            }
            if (_isUnique) {
                this.removeHitArea(_id);
            }
            if (!_oAreaData.scale) {
                _oAreaData.scale = 1;
            }
            if (!_oAreaData.align) {
                _oAreaData.align = [0, 0];
            }
            var aTouchIdentifiers = new Array();
            switch (_type) {
                case "image":
                    var aRect;
                    aRect = new Array(_oAreaData.aPos[0] - (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].width / 2) * _oAreaData.scale, _oAreaData.aPos[1] - (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].height / 2) * _oAreaData.scale, _oAreaData.aPos[0] + (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].width / 2) * _oAreaData.scale, _oAreaData.aPos[1] + (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].height / 2) * _oAreaData.scale);
                    this.aHitAreas.push({ id: _id, aTouchIdentifiers: aTouchIdentifiers, callback: _callback, oData: _oCallbackData, rect: true, area: aRect, align: _oAreaData.align });
                    break;
                case "rect":
                    this.aHitAreas.push({ id: _id, aTouchIdentifiers: aTouchIdentifiers, callback: _callback, oData: _oCallbackData, rect: true, area: _oAreaData.aRect, align: _oAreaData.align });
                    break;
            }
        };
        UserInput.prototype.removeHitArea = function (_id) {
            for (var i = 0; i < this.aHitAreas.length; i++) {
                if (this.aHitAreas[i].id == _id) {
                    this.aHitAreas.splice(i, 1);
                    i -= 1;
                }
            }
        };
        UserInput.prototype.resetAll = function () {
            for (var i = 0; i < this.aHitAreas.length; i++) {
                this.aHitAreas[i].oData.isDown = false;
                this.aHitAreas[i].oData.isBeingDragged = false;
                this.aHitAreas[i].aTouchIdentifiers = new Array();
            }
            this.isDown = false;
        };
        return UserInput;
    }());
    Utils.UserInput = UserInput;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var FpsMeter = (function () {
        function FpsMeter(_canvasHeight) {
            this.updateFreq = 10;
            this.updateInc = 0;
            this.frameAverage = 0;
            this.display = 1;
            this.log = "";
            this.render = function (_ctx) {
                this.frameAverage += this.delta / this.updateFreq;
                if (++this.updateInc >= this.updateFreq) {
                    this.updateInc = 0;
                    this.display = this.frameAverage;
                    this.frameAverage = 0;
                }
                _ctx.textAlign = "left";
                ctx.font = "10px Helvetica";
                _ctx.fillStyle = "#333333";
                _ctx.beginPath();
                _ctx.rect(0, this.canvasHeight - 15, 40, 15);
                _ctx.closePath();
                _ctx.fill();
                _ctx.fillStyle = "#ffffff";
                _ctx.fillText(Math.round(1000 / (this.display * 1000)) + " fps " + this.log, 5, this.canvasHeight - 5);
            };
            this.canvasHeight = _canvasHeight;
        }
        FpsMeter.prototype.update = function (_delta) {
            this.delta = _delta;
        };
        return FpsMeter;
    }());
    Utils.FpsMeter = FpsMeter;
})(Utils || (Utils = {}));
var Elements;
(function (Elements) {
    var Background = (function () {
        function Background(_img) {
            this.renderState = null;
            this.oImgData = assetLib.getData(_img);
        }
        Background.prototype.render = function () {
            if (canvas.width > canvas.height) {
                ctx.drawImage(this.oImgData.img, 0, ((1 - canvas.height / canvas.width) / 2) * this.oImgData.img.height, this.oImgData.img.width, (canvas.height / canvas.width) * this.oImgData.img.height, 0, 0, canvas.width, canvas.height);
            }
            else {
                ctx.drawImage(this.oImgData.img, ((1 - canvas.width / canvas.height) / 2) * this.oImgData.img.width, 0, (canvas.width / canvas.height) * this.oImgData.img.width, this.oImgData.img.width, 0, 0, canvas.width, canvas.height);
            }
        };
        return Background;
    }());
    Elements.Background = Background;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Panel = (function () {
        function Panel(_panelType, _aButs) {
            this.posY = 0;
            this.incY = 0;
            this.flareRot = 0;
            this.numberSpace = 65;
            this.oSplashLogoImgData = assetLib.getData("splashLogo");
            this.oUiElementsImgData = assetLib.getData("uiElements");
            this.oTopFlareImgData = assetLib.getData("flare");
            this.oNumbersImgData = assetLib.getData("numbers");
            this.panelType = _panelType;
            this.aButs = _aButs;
        }
        Panel.prototype.update = function () {
            this.incY += 10 * delta;
        };
        Panel.prototype.startTween1 = function () {
            this.posY = 500;
            TweenLite.to(this, .5, { posY: 0, ease: "Back.easeOut" });
        };
        Panel.prototype.fadeTween = function () {
            this.fadeInc = 1;
            TweenLite.to(this, 1, { fadeInc: 0, ease: "Quad.easeIn" });
        };
        Panel.prototype.render = function (_butsOnTop) {
            if (_butsOnTop === void 0) { _butsOnTop = true; }
            if (!_butsOnTop) {
                this.addButs(ctx);
            }
            switch (this.panelType) {
                case "splash":
                    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(this.oSplashLogoImgData.img, canvas.width / 2 - this.oSplashLogoImgData.img.width / 2, canvas.height / 2 - this.oSplashLogoImgData.img.height / 2 - this.posY);
                    break;
                case "start":
                    this.flareRot += delta / 3;
                    ctx.save();
                    ctx.translate(canvas.width / 2 + this.posY, canvas.height * .3);
                    ctx.rotate(this.flareRot);
                    ctx.scale(1, 1);
                    ctx.drawImage(this.oTopFlareImgData.img, -this.oTopFlareImgData.img.width / 2, -this.oTopFlareImgData.img.height / 2);
                    ctx.translate(-(canvas.width / 2 + this.posY), -(canvas.height * .3));
                    ctx.translate(canvas.width / 2 + this.posY, canvas.height * .3);
                    ctx.rotate(-this.flareRot * 2);
                    ctx.drawImage(this.oTopFlareImgData.img, -this.oTopFlareImgData.img.width / 2, -this.oTopFlareImgData.img.height / 2);
                    ctx.restore();
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.titleLogo].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.titleLogo].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.titleLogo].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.titleLogo].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - this.posY, canvas.height * .30 - bHeight / 2, bWidth, bHeight);
                    var tempScore = highscore.toString();
                    if (tempScore.length == 1) {
                        tempScore = "0" + tempScore;
                    }
                    for (var i = 0; i < tempScore.length; i++) {
                        var id = parseFloat(tempScore.charAt(i));
                        var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                        ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, canvas.width + i * (this.numberSpace / 2) - tempScore.length * (this.numberSpace / 2) - 8 - this.posY, canvas.height - 70, this.oNumbersImgData.oData.spriteWidth / 2, this.oNumbersImgData.oData.spriteHeight / 2);
                    }
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.highscoreIcon].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.highscoreIcon].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.highscoreIcon].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.highscoreIcon].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - tempScore.length * (this.numberSpace / 2) - 57 - this.posY, canvas.height - 62, bWidth, bHeight);
                    break;
                case "credits":
                    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(this.oSplashLogoImgData.img, canvas.width / 2 - this.oSplashLogoImgData.img.width / 2, canvas.height / 2 - this.oSplashLogoImgData.img.height / 2 - this.posY);
                    break;
                case "gameOver":
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.gameOverBg].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.gameOverBg].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.gameOverBg].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.gameOverBg].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - this.posY, canvas.height / 2 - 237, bWidth, bHeight);
                    var tempScore = score.toString();
                    if (tempScore.length == 1) {
                        tempScore = "0" + tempScore;
                    }
                    for (var i = 0; i < tempScore.length; i++) {
                        var id = parseFloat(tempScore.charAt(i));
                        var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                        ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, canvas.width / 2 + i * this.numberSpace - (tempScore.length / 2) * this.numberSpace - this.posY, canvas.height / 2 - 105, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
                    }
                    var tempScore = highscore.toString();
                    if (tempScore.length == 1) {
                        tempScore = "0" + tempScore;
                    }
                    for (var i = 0; i < tempScore.length; i++) {
                        var id = parseFloat(tempScore.charAt(i));
                        var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                        ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, canvas.width + i * (this.numberSpace / 2) - tempScore.length * (this.numberSpace / 2) - 8 - this.posY, canvas.height - 70, this.oNumbersImgData.oData.spriteWidth / 2, this.oNumbersImgData.oData.spriteHeight / 2);
                    }
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.highscoreIcon].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.highscoreIcon].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.highscoreIcon].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.highscoreIcon].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - tempScore.length * (this.numberSpace / 2) - 57 - this.posY, canvas.height - 62, bWidth, bHeight);
                    break;
                case "game":
                    break;
                case "pause":
                    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    break;
            }
            if (_butsOnTop) {
                this.addButs(ctx);
            }
        };
        Panel.prototype.addButs = function (ctx) {
            for (var i = 0; i < this.aButs.length; i++) {
                var offsetPosY = this.posY;
                var floatY = 0;
                if (this.incY != 0 && !this.aButs[i].noMove) {
                    floatY = Math.sin(this.incY + i * 45) * 3;
                }
                if (i % 2 == 0) {
                }
                if (!this.aButs[i].scale) {
                    this.aButs[i].scale = 1;
                }
                var bX = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].x;
                var bY = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].y;
                var bWidth = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].width;
                var bHeight = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].height;
                var aX = canvas.width * this.aButs[i].align[0];
                var aY = canvas.height * this.aButs[i].align[1];
                ctx.drawImage(this.aButs[i].oImgData.img, bX, bY, bWidth, bHeight, aX + this.aButs[i].aPos[0] - (bWidth / 2) * (this.aButs[i].scale) + offsetPosY - floatY / 2, aY + this.aButs[i].aPos[1] - (bHeight / 2) * (this.aButs[i].scale) + floatY / 2, bWidth * (this.aButs[i].scale) + floatY, bHeight * (this.aButs[i].scale) - floatY);
                if (this.aButs[i].text) {
                    var oTextDisplayData = {
                        text: this.aButs[i].text,
                        oTextData: textDisplay.oTextData,
                        x: aX + this.aButs[i].aPos[0] + offsetPosY,
                        y: aY + this.aButs[i].aPos[1],
                        alignX: "centre",
                        alignY: "centre",
                        scale: .8,
                        colourId: i % 8,
                        maxWidth: bWidth - 40
                    };
                    textDisplay.renderText(oTextDisplayData);
                }
            }
        };
        return Panel;
    }());
    Elements.Panel = Panel;
})(Elements || (Elements = {}));
var Utils;
(function (Utils) {
    var TextDisplay = (function () {
        function TextDisplay() {
            this.oTextData = {};
            this.inc = 0;
            this.createTextObjects();
        }
        TextDisplay.prototype.createTextObjects = function () {
            var cnt = 0;
            for (var i in assetLib.textData.langText.text[curLang]) {
                this.oTextData[i] = {};
                this.oTextData[i].aLineData = this.getCharData(assetLib.textData.langText.text[curLang][i]["@text"], assetLib.textData.langText.text[curLang][i]["@fontId"]);
                this.oTextData[i].aLineWidths = this.getLineWidths(this.oTextData[i].aLineData);
                this.oTextData[i].blockWidth = this.getBlockWidth(this.oTextData[i].aLineData);
                this.oTextData[i].blockHeight = this.getBlockHeight(this.oTextData[i].aLineData, assetLib.textData.langText.text[curLang][i]["@fontId"]);
                this.oTextData[i].lineHeight = parseInt(assetLib.textData["fontData" + assetLib.textData.langText.text[curLang][i]["@fontId"]].text.common["@lineHeight"]);
                this.oTextData[i].oFontImgData = assetLib.getData("font" + assetLib.textData.langText.text[curLang][i]["@fontId"]);
            }
        };
        TextDisplay.prototype.getLineWidths = function (_aCharData) {
            var lineLength;
            var aLineWidths = new Array();
            for (var i = 0; i < _aCharData.length; i++) {
                lineLength = 0;
                for (var j = 0; j < _aCharData[i].length; j++) {
                    lineLength += parseInt(_aCharData[i][j]["@xadvance"]);
                    if (j == 0) {
                        lineLength -= parseInt(_aCharData[i][j]["@xoffset"]);
                    }
                    else if (j == _aCharData[i].length - 1) {
                        lineLength += parseInt(_aCharData[i][j]["@xoffset"]);
                    }
                }
                aLineWidths.push(lineLength);
            }
            return aLineWidths;
        };
        TextDisplay.prototype.getBlockWidth = function (_aCharData) {
            var lineLength;
            var longestLineLength = 0;
            for (var i = 0; i < _aCharData.length; i++) {
                lineLength = 0;
                for (var j = 0; j < _aCharData[i].length; j++) {
                    lineLength += parseInt(_aCharData[i][j]["@xadvance"]);
                    if (j == 0) {
                        lineLength -= parseInt(_aCharData[i][j]["@xoffset"]);
                    }
                    else if (j == _aCharData[i].length - 1) {
                        lineLength += parseInt(_aCharData[i][j]["@xoffset"]);
                    }
                }
                if (lineLength > longestLineLength) {
                    longestLineLength = lineLength;
                }
            }
            return longestLineLength;
        };
        TextDisplay.prototype.getBlockHeight = function (_aCharData, _fontId) {
            return _aCharData.length * parseInt(assetLib.textData["fontData" + _fontId].text.common["@lineHeight"]);
        };
        TextDisplay.prototype.getCharData = function (_aLines, _fontId) {
            var aCharData = new Array();
            for (var k = 0; k < _aLines.length; k++) {
                aCharData[k] = new Array();
                for (var i = 0; i < _aLines[k].length; i++) {
                    for (var j = 0; j < assetLib.textData["fontData" + _fontId].text.chars.char.length; j++) {
                        if (_aLines[k][i].charCodeAt(0) == assetLib.textData["fontData" + _fontId].text.chars.char[j]["@id"]) {
                            aCharData[k].push(assetLib.textData["fontData" + _fontId].text.chars.char[j]);
                        }
                    }
                }
            }
            return aCharData;
        };
        TextDisplay.prototype.renderText = function (_oTextDisplayData) {
            var aLinesToRender = this.oTextData[_oTextDisplayData.text].aLineData;
            var oFontImgData = this.oTextData[_oTextDisplayData.text].oFontImgData;
            var shiftX;
            var offsetX = 0;
            var offsetY = 0;
            var lineOffsetY = 0;
            var manualScale = 1;
            var animY = 0;
            if (_oTextDisplayData.lineOffsetY) {
                lineOffsetY = _oTextDisplayData.lineOffsetY;
            }
            if (_oTextDisplayData.scale) {
                manualScale = _oTextDisplayData.scale;
            }
            var textScale = 1 * manualScale;
            if (_oTextDisplayData.maxWidth && this.oTextData[_oTextDisplayData.text].blockWidth * manualScale > _oTextDisplayData.maxWidth) {
                textScale = _oTextDisplayData.maxWidth / this.oTextData[_oTextDisplayData.text].blockWidth;
            }
            if (_oTextDisplayData.anim) {
                this.inc += delta * 7;
            }
            for (var i = 0; i < aLinesToRender.length; i++) {
                shiftX = 0;
                if (_oTextDisplayData.alignX == "centre") {
                    offsetX = this.oTextData[_oTextDisplayData.text].aLineWidths[i] / 2;
                }
                if (_oTextDisplayData.alignY == "centre") {
                    offsetY = this.oTextData[_oTextDisplayData.text].blockHeight / 2 + (lineOffsetY * (aLinesToRender.length - 1)) / 2;
                }
                for (var j = 0; j < aLinesToRender[i].length; j++) {
                    var bX = aLinesToRender[i][j]["@x"];
                    var bY = aLinesToRender[i][j]["@y"];
                    var bWidth = aLinesToRender[i][j]["@width"];
                    var bHeight = aLinesToRender[i][j]["@height"];
                    if (_oTextDisplayData.anim) {
                        animY = Math.sin(this.inc + j / 2) * ((bHeight / 15) * textScale);
                    }
                    ctx.drawImage(oFontImgData.img, bX, bY, bWidth, bHeight, _oTextDisplayData.x + (shiftX + parseInt(aLinesToRender[i][j]["@xoffset"]) - offsetX) * textScale, _oTextDisplayData.y + (parseInt(aLinesToRender[i][j]["@yoffset"]) + (i * this.oTextData[_oTextDisplayData.text].lineHeight) + (i * lineOffsetY) - offsetY) * textScale + animY, bWidth * textScale, bHeight * textScale);
                    shiftX += parseInt(aLinesToRender[i][j]["@xadvance"]);
                }
            }
        };
        return TextDisplay;
    }());
    Utils.TextDisplay = TextDisplay;
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var SaveDataHandler = (function () {
        function SaveDataHandler(_saveDataId) {
            this.dataGroupNum = 2;
            this.saveDataId = _saveDataId;
            var testKey = 'test', storage = window.sessionStorage;
            try {
                storage.setItem(testKey, '1');
                storage.removeItem(testKey);
                this.canStore = true;
            }
            catch (error) {
                this.canStore = false;
            }
            this.clearData();
            this.setInitialData();
        }
        SaveDataHandler.prototype.clearData = function () {
            this.aLevelStore = new Array();
            this.aLevelStore.push(0);
        };
        SaveDataHandler.prototype.resetData = function () {
            this.aLevelStore = new Array();
            this.aLevelStore.push(0);
            this.saveData();
        };
        SaveDataHandler.prototype.setInitialData = function () {
            if (this.canStore && typeof (Storage) !== "undefined") {
                if (localStorage.getItem(this.saveDataId) != null && localStorage.getItem(this.saveDataId) != "") {
                    this.aLevelStore = localStorage.getItem(this.saveDataId).split(",");
                    for (var a in this.aLevelStore) {
                        this.aLevelStore[a] = parseInt(this.aLevelStore[a]);
                    }
                }
                else {
                    this.saveData();
                }
            }
        };
        SaveDataHandler.prototype.setData = function (_score) {
            this.aLevelStore[0] = _score;
        };
        SaveDataHandler.prototype.getData = function () {
            return this.aLevelStore[0];
        };
        SaveDataHandler.prototype.saveData = function () {
            if (this.canStore && typeof (Storage) !== "undefined") {
                var str = "";
                for (var i = 0; i < this.aLevelStore.length; i++) {
                    str += this.aLevelStore[i];
                    if (i < this.aLevelStore.length - 1) {
                        str += ",";
                    }
                }
                localStorage.setItem(this.saveDataId, str);
            }
        };
        return SaveDataHandler;
    }());
    Utils.SaveDataHandler = SaveDataHandler;
})(Utils || (Utils = {}));
var Elements;
(function (Elements) {
    var Table = (function () {
        function Table() {
            this.itemTotal = 20;
            this.itemLeftId = 0;
            this.itemRightId = 0;
            this.targLeftItemY = 0;
            this.targRightItemY = 0;
            this.leftAlpha = 1;
            this.rightAlpha = 1;
            this.oGameElementsImgData = assetLib.getData("gameElements");
        }
        Table.prototype.unFade = function (_isLeft) {
            if (_isLeft) {
                if (this.leftFadeTween) {
                    this.leftFadeTween.kill();
                }
                this.leftFadeTween = TweenLite.to(this, .2, { leftAlpha: 1, ease: "Quad.easeOut" });
            }
            else {
                if (this.rightFadeTween) {
                    this.rightFadeTween.kill();
                }
                this.rightFadeTween = TweenLite.to(this, .2, { rightAlpha: 1, ease: "Quad.easeOut" });
            }
        };
        Table.prototype.addItem = function (_addToLeft) {
            if (_addToLeft) {
                if (Math.random() * 1 > .75) {
                    this.itemLeftId = 0;
                    this.targLeftItemY = 0;
                }
                else {
                    this.itemLeftId = Math.ceil(Math.random() * this.itemTotal);
                    while (this.itemLeftId == this.itemRightId) {
                        this.itemLeftId = Math.ceil(Math.random() * this.itemTotal);
                    }
                    this.targLeftItemY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemLeftId]].height - 4;
                    if (this.leftFadeTween) {
                        this.leftFadeTween.kill();
                    }
                    this.leftFadeTween = TweenLite.to(this, .2, { leftAlpha: 1, ease: "Quad.easeOut" });
                }
            }
            else {
                if (Math.random() * 1 > .75) {
                    this.itemRightId = 0;
                    this.targRightItemY = 0;
                }
                else {
                    this.itemRightId = Math.ceil(Math.random() * this.itemTotal);
                    while (this.itemLeftId == this.itemRightId) {
                        this.itemRightId = Math.ceil(Math.random() * this.itemTotal);
                    }
                    this.targRightItemY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemRightId]].height - 4;
                    if (this.rightFadeTween) {
                        this.rightFadeTween.kill();
                    }
                    this.leftFadeTween = TweenLite.to(this, .2, { rightAlpha: 1, ease: "Quad.easeOut" });
                }
            }
        };
        Table.prototype.fade = function (_isLeft) {
            if (_isLeft) {
                if (this.leftFadeTween) {
                    this.leftFadeTween.kill();
                }
                this.leftFadeTween = TweenLite.to(this, .5, { leftAlpha: 0, ease: "Quad.easeOut" });
            }
            else {
                if (this.rightFadeTween) {
                    this.rightFadeTween.kill();
                }
                this.rightFadeTween = TweenLite.to(this, .5, { rightAlpha: 0, ease: "Quad.easeOut" });
            }
        };
        Table.prototype.render = function () {
            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds["table" + gameBgId]].x;
            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["table" + gameBgId]].y;
            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds["table" + gameBgId]].width;
            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds["table" + gameBgId]].height;
            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, canvas.height * tablePosY, bWidth, bHeight);
            ctx.save();
            if (this.itemLeftId > 0) {
                ctx.globalAlpha = this.leftAlpha;
                var itemWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemLeftId]].width;
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - itemWidth / 2 - tableTargOffsetX, canvas.height * tablePosY + tableLandOffsetY - bHeight * .3, itemWidth, bHeight);
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemLeftId]].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemLeftId]].y;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemLeftId]].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, itemWidth, bHeight, canvas.width / 2 - itemWidth / 2 - tableTargOffsetX, canvas.height * tablePosY + tableLandOffsetY - bHeight, itemWidth, bHeight);
            }
            if (this.itemRightId > 0) {
                ctx.globalAlpha = this.rightAlpha;
                var itemWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemRightId]].width;
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - itemWidth / 2 + tableTargOffsetX, canvas.height * tablePosY + tableLandOffsetY - bHeight * .3, itemWidth, bHeight);
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemRightId]].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemRightId]].y;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds["item" + this.itemRightId]].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, itemWidth, bHeight, canvas.width / 2 - itemWidth / 2 + tableTargOffsetX, canvas.height * tablePosY + tableLandOffsetY - bHeight, itemWidth, bHeight);
            }
            ctx.restore();
        };
        return Table;
    }());
    Elements.Table = Table;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Bottle = (function () {
        function Bottle() {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.rotateOffsetY = 15;
            this.power = 0;
            this.flightY = 0;
            this.startPower = 0;
            this.gravityCentre = .5;
            this.actualBottom = 1;
            this.oBottleData = {};
            this.flightState = "waiting";
            this.onLeft = true;
            this.glowAlpha = 0;
            this.glowInc = 0;
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.oBottleData.id = 0;
            this.setBottleId();
            this.accuracyMargin = 30;
            this.airResistance = 5;
            this.diffIncrease = 0;
            this.reset();
        }
        Bottle.prototype.setBottleId = function () {
            this.oBottleData.bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds["bottle" + this.oBottleData.id]].x;
            this.oBottleData.bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["bottle" + this.oBottleData.id]].y;
            this.oBottleData.bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds["bottle" + this.oBottleData.id]].width;
            this.oBottleData.bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds["bottle" + this.oBottleData.id]].height;
        };
        Bottle.prototype.upgrade = function () {
            if (this.oBottleData.id < 20) {
                this.oBottleData.id++;
            }
            this.diffIncrease = Math.min(this.diffIncrease + 1, 5);
            this.accuracyMargin = Math.max(this.accuracyMargin - 1.5, 10);
            this.setBottleId();
        };
        Bottle.prototype.reset = function () {
            this.flightState = "waiting";
            if (this.steadyTween) {
                this.steadyTween.kill();
            }
            if (this.bounceTween) {
                this.bounceTween.kill();
            }
            if (this.horizTween) {
                this.horizTween.kill();
            }
            this.flightY = 0;
            this.rotation = 0;
            this.shadowAlpha = Math.max(Math.min(1 + (this.y - (canvas.height * tablePosY + tableLandOffsetY)) / 200, 1), 0);
            this.accX = 0;
            this.gravityCentre = .5;
            if (this.onLeft) {
                this.x = canvas.width / 2 - tableTargOffsetX;
                this.rotInc = -9 + this.diffIncrease / 2;
            }
            else {
                this.x = canvas.width / 2 + tableTargOffsetX;
                this.rotInc = 9 - this.diffIncrease / 2;
            }
            if (this.onLeft) {
                this.curItemY = table.targLeftItemY;
                this.targItemY = table.targRightItemY;
            }
            else {
                this.curItemY = table.targRightItemY;
                this.targItemY = table.targLeftItemY;
            }
        };
        Bottle.prototype.flip = function () {
            var a = startDragX - endDragX;
            var b = startDragY - endDragY;
            var hyp = Math.sqrt(a * a + b * b);
            if (hyp < 25) {
                return;
            }
            hud.cancelTutAnim();
            playSound("whoosh" + Math.floor(Math.random() * 3));
            this.reset();
            this.startPower = this.power = Math.min((hyp / dragTimer) / 300 + 15, 30);
            this.flightState = "thrown";
            this.horizTween = TweenLite.to(this, 1.3, { accX: tableTargOffsetX * 2, ease: "Quad.easeOut" });
            TweenLite.to(this, .5, { glowAlpha: 0, ease: "Quad.easeOut" });
            table.fade(this.onLeft);
        };
        Bottle.prototype.update = function () {
            if (this.flightState == "waiting") {
                this.glowInc += delta * 2;
                this.glowAlpha = Math.abs(Math.sin(this.glowInc)) / 3;
            }
            if (this.flightState == "thrown" || this.flightState == "landing") {
                var temp0 = Math.abs(this.rotation / radian) % 180;
                var temp1 = Math.abs(temp0 - 90) / 90;
                this.rotateOffsetY = (Math.pow((1 - temp1), 3) * (this.oBottleData.bHeight - this.oBottleData.bWidth)) / 2;
            }
            var offsetY = canvas.height * tablePosY + tableLandOffsetY;
            if (this.onLeft) {
                this.rotInc = Math.min(this.rotInc + delta * (this.airResistance - this.diffIncrease), -4);
                this.x = canvas.width / 2 - tableTargOffsetX + this.accX;
            }
            else {
                this.x = canvas.width / 2 + tableTargOffsetX - this.accX;
                this.rotInc = Math.max(this.rotInc - delta * (this.airResistance - this.diffIncrease), 4);
            }
            if (this.flightState == "thrown" || this.flightState == "bounceOff") {
                this.power -= delta * 50;
                this.flightY -= this.power * (delta * 60);
                this.rotation += delta * this.rotInc;
            }
            if (this.flightState == "thrown" || this.flightState == "waiting") {
                this.y = this.flightY + offsetY - this.curItemY;
                this.shadowAlpha = Math.max(Math.min(1 + (this.y - (canvas.height * tablePosY + tableLandOffsetY)) / 200, 1), 0);
            }
            else if (this.flightState == "bounceOff") {
                this.y = this.flightY + offsetY + this.rotateOffsetY - this.curItemY;
            }
            if (this.y > canvas.height + 200) {
                bottleMissed();
            }
            if (this.flightState == "thrown" && this.power < 0 && this.y > offsetY + this.rotateOffsetY - this.targItemY) {
                var tempRot = Math.abs(this.rotation / radian) % 360;
                if (tempRot > 360 - this.accuracyMargin || tempRot < this.accuracyMargin) {
                    playSound("land" + Math.floor(Math.random() * 3));
                    if (tempRot > 360 - (this.accuracyMargin / 3) || tempRot < (this.accuracyMargin / 3)) {
                        this.rating = 2;
                    }
                    else if (tempRot > 360 - (this.accuracyMargin / 3) * 2 || tempRot < (this.accuracyMargin / 3) * 2) {
                        this.rating = 1;
                    }
                    else {
                        this.rating = 0;
                    }
                    this.flightState = "landing";
                    this.gravityCentre = 1;
                    this.flightY = 0;
                    if (this.bounceTween) {
                        this.bounceTween.kill();
                    }
                    this.y = this.flightY + offsetY + this.rotateOffsetY - this.targItemY;
                    addEffect(bottle.x, bottle.y, .4, .4);
                    this.bounceTween = TweenLite.to(this, .1, {
                        y: this.flightY + offsetY - this.targItemY - (Math.random() * 10 + 10), ease: "Quad.easeOut", onCompleteParams: [this], onComplete: function (_this) {
                            _this.bounceTween = TweenLite.to(_this, .3, {
                                y: _this.flightY + offsetY - _this.targItemY, ease: "Bounce.easeOut", onComplete: function () {
                                    bottleLanded(_this.rating, _this.x, _this.y);
                                }
                            });
                        }
                    });
                    if (this.steadyTween) {
                        this.steadyTween.kill();
                    }
                    var tempRot = -360 * radian;
                    if (!this.onLeft) {
                        tempRot = 360 * radian;
                    }
                    this.steadyTween = TweenLite.to(this, Math.random() * .3 + .3, { rotation: tempRot, ease: "Back.easeOut" });
                    this.shadowAlpha = Math.max(Math.min(1 + (this.y - (canvas.height * tablePosY + tableLandOffsetY)) / 200, 1), 0);
                }
                else {
                    playSound("bounceOff" + Math.floor(Math.random() * 3));
                    this.rotInc = -this.rotInc * 2;
                    this.rotation += delta * (this.rotInc * 2);
                    this.flightState = "bounceOff";
                    this.power *= -(Math.random() * .3 + .3);
                    if (this.bounceTween) {
                        this.bounceTween.kill();
                    }
                    this.bounceTween = TweenLite.to(this, .2, { shadowAlpha: 0, ease: "Quad.easeOut" });
                }
            }
        };
        Bottle.prototype.render = function () {
            ctx.save();
            ctx.globalAlpha = this.glowAlpha;
            var tempPosX = canvas.width / 2 + tableTargOffsetX;
            if (!this.onLeft) {
                tempPosX = canvas.width / 2 - tableTargOffsetX;
            }
            ctx.drawImage(this.oGameElementsImgData.img, this.oBottleData.bX, this.oBottleData.bY, this.oBottleData.bWidth, this.oBottleData.bHeight, tempPosX - this.oBottleData.bWidth / 2, canvas.height * tablePosY + tableLandOffsetY - this.targItemY - this.oBottleData.bHeight, this.oBottleData.bWidth, this.oBottleData.bHeight);
            ctx.globalAlpha = this.shadowAlpha;
            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].x;
            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].y;
            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].width;
            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.shadow].height;
            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, this.x - this.oBottleData.bWidth / 2, canvas.height * tablePosY + tableLandOffsetY - bHeight * .3, this.oBottleData.bWidth, bHeight);
            ctx.globalAlpha = 1;
            ctx.translate(this.x, this.y - this.oBottleData.bHeight * (1 - this.gravityCentre));
            ctx.rotate(this.rotation);
            ctx.drawImage(this.oGameElementsImgData.img, this.oBottleData.bX, this.oBottleData.bY, this.oBottleData.bWidth, this.oBottleData.bHeight, -this.oBottleData.bWidth / 2, -this.oBottleData.bHeight * this.gravityCentre, this.oBottleData.bWidth, this.oBottleData.bHeight);
            ctx.restore();
        };
        return Bottle;
    }());
    Elements.Bottle = Bottle;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var MenuBottle = (function () {
        function MenuBottle(_id) {
            if (_id === void 0) { _id = -1; }
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.forceId = _id;
            this.reset();
            this.y = Math.random() * canvas.height;
        }
        MenuBottle.prototype.reset = function () {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 200;
            this.accX = 0;
            this.power = Math.random() * (canvas.height / 2) / 25 + 5;
            this.flightY = 0;
            if (this.forceId == -1) {
                this.id = oImageIds["bottle" + Math.ceil(Math.random() * 20)];
            }
            else {
                this.id = oImageIds["bottle" + this.forceId];
            }
            if (this.horizTween) {
                this.horizTween.kill();
            }
            if (this.x > canvas.width / 2) {
                this.x = canvas.width / 2 - tableTargOffsetX;
                this.rotInc = -Math.random() * 3 + 3;
            }
            else {
                this.x = canvas.width / 2 + tableTargOffsetX;
                this.rotInc = Math.random() * 3 + 3;
            }
            this.rotation = Math.random() * 3.14;
            this.horizTween = TweenLite.to(this, this.power / 5, { x: Math.random() * canvas.width, ease: "Quad.easeOut" });
        };
        MenuBottle.prototype.update = function () {
            this.power -= delta * 10;
            this.flightY -= this.power * (delta * 60);
            this.y = canvas.height + this.flightY;
            this.rotation += delta * this.rotInc;
            if (this.y > canvas.height + 200) {
                this.reset();
            }
        };
        MenuBottle.prototype.render = function () {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            var bX = this.oGameElementsImgData.oData.oAtlasData[this.id].x;
            var bY = this.oGameElementsImgData.oData.oAtlasData[this.id].y;
            var bWidth = this.oGameElementsImgData.oData.oAtlasData[this.id].width;
            var bHeight = this.oGameElementsImgData.oData.oAtlasData[this.id].height;
            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, -bWidth / 2, -bHeight / 2, bWidth, bHeight);
            ctx.restore();
        };
        return MenuBottle;
    }());
    Elements.MenuBottle = MenuBottle;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Hud = (function () {
        function Hud() {
            this.numberSpace = 65;
            this.showStars = false;
            this.starBonus = .1;
            this.starBarInc = 0;
            this.tutIsOn = true;
            this.oUiElementsImgData = assetLib.getData("uiElements");
            this.oNumbersImgData = assetLib.getData("numbers");
            this.tutAnimStep = 0;
            this.tutIsOn = false;
        }
        Hud.prototype.tutAnim = function () {
            this.tutIsOn = true;
            switch (this.tutAnimStep) {
                case 0:
                    this.tutHandY = 300;
                    this.tutHandAlpha = 0;
                    this.tutLineAlpha = 0;
                    this.tutHandRot = -1;
                    this.tutHandX = 50;
                    this.tutTween = TweenLite.to(this, .5, { tutHandAlpha: 1, tutHandX: 0, tutHandY: 172, tutLineAlpha: 1, tutHandRot: -.3, ease: "Quad.easeOut", delay: .5, onCompleteParams: [this], onComplete: function (_this) { _this.tutAnim(); } });
                    break;
                case 1:
                    this.tutTween = TweenLite.to(this, .5, { tutHandY: -172, tutHandRot: .3, ease: "Quad.easeIn", onCompleteParams: [this], onComplete: function (_this) { _this.tutAnim(); } });
                    break;
                case 2:
                    this.tutTween = TweenLite.to(this, .3, { tutHandAlpha: 0, tutHandX: 10, tutHandY: -300, tutHandRot: 1, ease: "Quad.easeOut", onCompleteParams: [this], onComplete: function (_this) { _this.tutAnim(); } });
                    break;
                case 3:
                    this.tutTween = TweenLite.to(this, 1, { tutLineAlpha: 0, ease: "Quad.easeIn", onCompleteParams: [this], onComplete: function (_this) { _this.tutAnim(); } });
                    break;
            }
            if (++this.tutAnimStep > 3) {
                this.tutAnimStep = 0;
            }
        };
        Hud.prototype.cancelTutAnim = function () {
            tutShowTimer = 0;
            if (this.tutIsOn) {
                this.tutIsOn = false;
            }
            else {
                return;
            }
            if (this.tutTween) {
                this.tutTween.kill();
            }
            this.tutTween = TweenLite.to(this, .5, { tutLineAlpha: 0, tutHandAlpha: 0, ease: "Quad.easeIn", onCompleteParams: [this], onComplete: function (_this) { _this.tutIsOn = false; } });
        };
        Hud.prototype.addStars = function (_rating, _startX, _startY) {
            this.starRating = _rating;
            this.oStarData = { star0: {}, star1: {}, star2: {} };
            this.oStarData.star0.x = this.oStarData.star1.x = this.oStarData.star2.x = _startX - canvas.width / 2;
            this.oStarData.star0.y = this.oStarData.star1.y = this.oStarData.star2.y = _startY;
            this.oStarData.star0.scale = this.oStarData.star1.scale = this.oStarData.star2.scale = 0;
            if (this.starRating == 0) {
                this.oStarData.star0.tween = TweenLite.to(this.oStarData.star0, .3, {
                    scale: 1, x: 0, y: 230, ease: "Quad.easeOut", onCompleteParams: [this], onComplete: function (_this) {
                        _this.oStarData.star0.tween = TweenLite.to(_this.oStarData.star0, .3, { scale: 0, x: 0, y: 0, ease: "Quad.easeIn", onComplete: function () { _this.starAnimComplete(); } });
                    }
                });
                TweenLite.to(this, .3, { starBarInc: this.starBarInc + this.starBonus, x: 0, y: -canvas.height / 2, ease: "Quad.easeOut", delay: .3 });
            }
            else if (this.starRating == 1) {
                this.oStarData.star0.tween = TweenLite.to(this.oStarData.star0, .3, {
                    scale: 1, x: -90, y: 230, ease: "Quad.easeOut", onCompleteParams: [this], onComplete: function (_this) {
                        _this.oStarData.star0.tween = TweenLite.to(_this.oStarData.star0, .3, { scale: 0, x: 0, y: 0, ease: "Quad.easeIn" });
                    }
                });
                this.oStarData.star1.tween = TweenLite.to(this.oStarData.star1, .3, {
                    scale: 1, x: +90, y: 230, ease: "Quad.easeOut", delay: .1, onCompleteParams: [this], onComplete: function (_this) {
                        _this.oStarData.star1.tween = TweenLite.to(_this.oStarData.star1, .3, { scale: 0, x: 0, y: 0, ease: "Quad.easeIn", onComplete: function () { _this.starAnimComplete(); } });
                    }
                });
                TweenLite.to(this, .3, { starBarInc: this.starBarInc + this.starBonus * 2, x: 0, y: -canvas.height / 2, ease: "Quad.easeOut", delay: .4 });
            }
            else if (this.starRating == 2) {
                this.oStarData.star0.tween = TweenLite.to(this.oStarData.star0, .3, {
                    scale: 1, x: -140, y: 230 - 20, ease: "Quad.easeOut", onCompleteParams: [this], onComplete: function (_this) {
                        _this.oStarData.star0.tween = TweenLite.to(_this.oStarData.star0, .3, { scale: 0, x: 0, y: 0, ease: "Quad.easeIn" });
                    }
                });
                this.oStarData.star1.tween = TweenLite.to(this.oStarData.star1, .3, {
                    scale: 1, x: 0, y: 230 + 20, ease: "Quad.easeOut", delay: .1, onCompleteParams: [this], onComplete: function (_this) {
                        _this.oStarData.star1.tween = TweenLite.to(_this.oStarData.star1, .3, { scale: 0, x: 0, y: 0, ease: "Quad.easeIn" });
                    }
                });
                this.oStarData.star2.tween = TweenLite.to(this.oStarData.star2, .3, {
                    scale: 1, x: 140, y: 230 - 20, ease: "Quad.easeOut", delay: .2, onCompleteParams: [this], onComplete: function (_this) {
                        _this.oStarData.star2.tween = TweenLite.to(_this.oStarData.star2, .3, { scale: 0, x: 0, y: 0, ease: "Quad.easeIn", onComplete: function () { _this.starAnimComplete(); } });
                    }
                });
                TweenLite.to(this, .3, { starBarInc: this.starBarInc + this.starBonus * 3, x: 0, y: -canvas.height / 2, ease: "Quad.easeOut", delay: .5 });
            }
            this.showStars = true;
        };
        Hud.prototype.starAnimComplete = function () {
            var starBarFull = false;
            if (this.starBarInc >= 1) {
                starBarFull = true;
                this.starBarInc = 0;
                this.starBonus = Math.max(this.starBonus -= .01, .03);
            }
            prepareNextThrow(starBarFull);
        };
        Hud.prototype.renderBelow = function () {
            var tempScore = score.toString();
            if (tempScore.length == 1) {
                tempScore = "0" + tempScore;
            }
            for (var i = 0; i < tempScore.length; i++) {
                var id = parseFloat(tempScore.charAt(i));
                var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, canvas.width / 2 + i * this.numberSpace - (tempScore.length / 2) * this.numberSpace + panel.posY, 50, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
            }
        };
        Hud.prototype.renderAbove = function () {
            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.starBarBg].x;
            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.starBarBg].y;
            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.starBarBg].width;
            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.starBarBg].height;
            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - 165 + panel.posY, canvas.height - 50 + 9, bWidth, bHeight);
            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.starBar].x;
            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.starBar].y;
            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.starBar].width;
            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.starBar].height;
            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth * Math.min(Math.max(this.starBarInc, 0.01), 1), bHeight, canvas.width / 2 - 165 + panel.posY, canvas.height - 50 + 9, bWidth * Math.min(Math.max(this.starBarInc, 0.01), 1), bHeight);
            for (var i = 0; i < 2; i++) {
                var tempId = 1;
                if (lives >= i + 1) {
                    tempId = 0;
                }
                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["life" + tempId]].x;
                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["life" + tempId]].y;
                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["life" + tempId]].width;
                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["life" + tempId]].height;
                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + 80 + i * 45 + panel.posY, canvas.height - 50 + 4, bWidth, bHeight);
            }
            if (this.tutIsOn) {
                ctx.save();
                ctx.globalAlpha = this.tutLineAlpha;
                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tutLine].x;
                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tutLine].y;
                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tutLine].width;
                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tutLine].height;
                var negBHeight = Math.max(Math.min(this.tutHandY + 172, bHeight - .1), .1);
                ctx.drawImage(this.oUiElementsImgData.img, bX, negBHeight, bWidth, bHeight - negBHeight, canvas.width / 2 - (bWidth / 2), canvas.height / 2 + negBHeight - bHeight / 2, bWidth, bHeight - negBHeight);
                ctx.globalAlpha = this.tutHandAlpha;
                ctx.translate(canvas.width / 2 + this.tutHandX + 60, canvas.height / 2 + this.tutHandY - 25);
                ctx.rotate(this.tutHandRot);
                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tutHand].x;
                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tutHand].y;
                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tutHand].width;
                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tutHand].height;
                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, -bWidth / 2, -bHeight / 2, bWidth, bHeight);
                ctx.restore();
            }
            if (this.showStars) {
                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.star].x;
                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.star].y;
                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.star].width;
                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.star].height;
                if (this.starRating >= 1) {
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + this.oStarData.star1.x - (bWidth / 2) * this.oStarData.star1.scale, this.oStarData.star1.y - (bHeight / 2) * this.oStarData.star1.scale, bWidth * this.oStarData.star1.scale, bHeight * this.oStarData.star1.scale);
                }
                if (this.starRating >= 0) {
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + this.oStarData.star0.x - (bWidth / 2) * this.oStarData.star0.scale, this.oStarData.star0.y - (bHeight / 2) * this.oStarData.star0.scale, bWidth * this.oStarData.star0.scale, bHeight * this.oStarData.star0.scale);
                }
                if (this.starRating >= 2) {
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + this.oStarData.star2.x - (bWidth / 2) * this.oStarData.star2.scale, this.oStarData.star2.y - (bHeight / 2) * this.oStarData.star2.scale, bWidth * this.oStarData.star2.scale, bHeight * this.oStarData.star2.scale);
                }
            }
        };
        return Hud;
    }());
    Elements.Hud = Hud;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Explode = (function (_super) {
        __extends(Explode, _super);
        function Explode(_x, _y, _scaleX, _scaleY) {
            var _this = _super.call(this, assetLib.getData("transformEffect"), 20, 30, "explode") || this;
            _this.startX = 0;
            _this.startY = 0;
            _this.scaleX = _scaleX;
            _this.scaleY = _scaleY;
            _this.setAnimType("once", "explode");
            _this.startX = _x - canvas.width / 2;
            _this.startY = _y - canvas.height / 2;
            _this.animEndedFunc = function () { this.removeMe = true; };
            return _this;
        }
        Explode.prototype.update = function (_trackX, _trackY) {
            this.x = this.startX + canvas.width / 2;
            this.y = this.startY + canvas.height / 2;
            _super.prototype.updateAnimation.call(this, delta);
        };
        Explode.prototype.render = function () {
            _super.prototype.renderSimple.call(this, ctx);
        };
        return Explode;
    }(Utils.AnimSprite));
    Elements.Explode = Explode;
})(Elements || (Elements = {}));
var requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.requestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60, new Date().getTime());
        };
})();
var previousTime;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var minSquareSize = 500;
var maxSquareSize = 700;
var canvasX;
var canvasY;
var canvasScale;
var div = document.getElementById('canvas-wrapper');
var sound;
var music;
var audioType = 0;
var muted = false;
var splashTimer = 0;
var assetLib;
var preAssetLib;
var rotatePause = false;
var manualPause = false;
var isMobile = false;
var gameState = "loading";
var aLangs = new Array("EN");
var curLang = "";
var isBugBrowser = false;
var isIE10 = false;
var delta;
var radian = Math.PI / 180;
var ios9FirstTouch = false;
var textDisplay;
var hasFocus = true;
if (navigator.userAgent.match(/MSIE\s([\d]+)/)) {
    isIE10 = true;
}
var deviceAgent = navigator.userAgent.toLowerCase();
if (deviceAgent.match(/(iphone|ipod|ipad)/) ||
    deviceAgent.match(/(android)/) ||
    deviceAgent.match(/(iemobile)/) ||
    deviceAgent.match(/iphone/i) ||
    deviceAgent.match(/ipad/i) ||
    deviceAgent.match(/ipod/i) ||
    deviceAgent.match(/blackberry/i) ||
    deviceAgent.match(/bada/i)) {
    isMobile = true;
    if (deviceAgent.match(/(android)/) && !/Chrome/.test(navigator.userAgent)) {
        isBugBrowser = true;
    }
}
var userInput = new Utils.UserInput(canvas, isBugBrowser);
resizeCanvas();
window.onresize = function () {
    setTimeout(function () {
        resizeCanvas();
    }, 1);
};
function visibleResume() {
    hasFocus = true;
    if (userInput) {
        userInput.checkKeyFocus();
    }
    if (!muted && !manualPause) {
        Howler.mute(false);
    }
}
function visiblePause() {
    hasFocus = false;
    Howler.mute(true);
}
window.onpageshow = function () {
    hasFocus = true;
    if (userInput) {
        userInput.checkKeyFocus();
    }
    if (!muted && !manualPause) {
        Howler.mute(false);
    }
};
window.onpagehide = function () {
    hasFocus = false;
    Howler.mute(true);
};
function playMusic() {
    if (!music.playing()) {
        music.play();
    }
}
window.addEventListener("load", function () {
    setTimeout(function () {
        resizeCanvas();
    }, 0);
    window.addEventListener("orientationchange", function () {
        setTimeout(function () {
            resizeCanvas();
        }, 500);
        setTimeout(function () {
            resizeCanvas();
        }, 2000);
    }, false);
});
function isStock() {
    var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
    return matches && parseFloat(matches[1]) < 537;
}
var ua = navigator.userAgent;
var isSharpStock = ((/SHL24|SH-01F/i).test(ua)) && isStock();
var isXperiaAStock = ((/SO-04E/i).test(ua)) && isStock();
var isFujitsuStock = ((/F-01F/i).test(ua)) && isStock();
if (!isIE10 && !isSharpStock && !isXperiaAStock && !isFujitsuStock && (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined' || navigator.userAgent.indexOf('Android') == -1)) {
    audioType = 1;
    sound = new Howl({
        src: ['audio/sound.ogg', 'audio/sound.m4a'],
        sprite: {
            land0: [0, 400],
            land1: [500, 400],
            land2: [1000, 400],
            whoosh0: [1500, 400],
            whoosh1: [2000, 400],
            whoosh2: [2500, 400],
            transform: [3000, 1200],
            stars2: [4500, 1300],
            stars1: [6000, 1200],
            stars0: [7500, 1000],
            loseLife: [9000, 700],
            bounceOff0: [10000, 450],
            bounceOff1: [10500, 450],
            bounceOff2: [11000, 450],
            gameOver: [12000, 1300],
            gameStart: [13500, 1300],
            click: [15500, 400],
            silence: [5500, 200]
        }
    });
    music = new Howl({
        src: ['audio/music.ogg', 'audio/music.m4a'],
        volume: 0,
        loop: true
    });
}
else {
    audioType = 0;
}
var panel;
var background;
var musicTween;
var oImageIds = {};
var table;
var bottle;
var tablePosY = .82;
var tableLandOffsetY = 15;
var swipeState;
var startDragX;
var startDragY;
var endDragX;
var endDragY;
var dragTimer;
var dragTimerRunning;
var lives;
var score;
var tableTargOffsetX = 100;
var saveDataHandler = new Utils.SaveDataHandler("bottleflipchallenge");
var highscore;
var gameBgId = Math.floor(Math.random() * 3);
var aMenuBottles;
var hud;
var aEffects;
var firstRun = true;
var tutShowTimer;
var tempVar = "--";
var firstPokiRun = false;
window.PokiSDK.init().then(function () {
    console.log("Poki SDK successfully initialized");
    loadPreAssets();
})["catch"](function () {
    console.log("Initialized, something went wrong, load you game anyway");
    loadPreAssets();
});
function initSplash() {
    gameState = "splash";
    window.PokiSDK.gameLoadingFinished();
    resizeCanvas();
    if (audioType == 1 && !muted) {
        playMusic();
    }
    highscore = saveDataHandler.getData();
    initGame();
}
function initStartScreen() {
    gameState = "start";
    highscore = saveDataHandler.getData();
    userInput.removeHitArea("moreGames");
    if (audioType == 1) {
        music.fade(music.volume(), .5, 500);
    }
    aMenuBottles = new Array();
    for (var i = 0; i < 5; i++) {
        var bub = new Elements.MenuBottle();
        aMenuBottles.push(bub);
    }
    background = new Elements.Background("gameBg" + gameBgId);
    var oPlayBut = { oImgData: assetLib.getData("uiButs"), aPos: [0, 0], align: [.5, .8], id: oImageIds.playBut };
    var oInfoBut = { oImgData: assetLib.getData("uiButs"), aPos: [-95, 38], align: [1, 0], id: oImageIds.infoBut, noMove: true };
    userInput.addHitArea("startGame", butEventHandler, null, "image", oPlayBut);
    userInput.addHitArea("credits", butEventHandler, null, "image", oInfoBut);
    var aButs = new Array(oPlayBut, oInfoBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween1();
    previousTime = new Date().getTime();
    updateStartScreenEvent();
}
function addMuteBut(_aButs) {
    if (audioType == 1) {
        var mb = oImageIds.muteBut0;
        if (muted) {
            mb = oImageIds.muteBut1;
        }
        var oMuteBut = { oImgData: assetLib.getData("uiButs"), aPos: [-38, 38], align: [1, 0], id: mb, noMove: true };
        userInput.addHitArea("mute", butEventHandler, null, "image", oMuteBut);
        _aButs.push(oMuteBut);
    }
}
function initCreditsScreen() {
    gameState = "credits";
    var oBackBut = { oImgData: assetLib.getData("uiButs"), aPos: [-95, 38], align: [1, 0], id: oImageIds.backBut, noMove: true };
    var oResetBut = { oImgData: assetLib.getData("uiButs"), aPos: [38, -38], align: [0, 1], id: oImageIds.resetBut, noMove: true };
    userInput.addHitArea("backFromCredits", butEventHandler, null, "image", oBackBut);
    userInput.addHitArea("resetData", butEventHandler, null, "image", oResetBut);
    var aButs = new Array(oBackBut, oResetBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween1();
    previousTime = new Date().getTime();
    updateCreditsScreenEvent();
}
function initGame() {
    gameState = "game";
    if (audioType == 1) {
        music.fade(music.volume(), .75, 500);
    }
    firstPokiRun = false;
    playSound("gameStart");
    swipeState = 0;
    startDragX = 0;
    startDragY = 0;
    endDragX = 0;
    endDragY = 0;
    dragTimer = 0;
    dragTimerRunning = false;
    score = 0;
    lives = 2;
    gameBgId = ++gameBgId % 3;
    aEffects = new Array();
    tutShowTimer = 0;
    hud = new Elements.Hud();
    if (firstRun || highscore == 0) {
        hud.tutAnim();
    }
    background = new Elements.Background("gameBg" + gameBgId);
    table = new Elements.Table();
    bottle = new Elements.Bottle();
    var oPauseBut = { oImgData: assetLib.getData("uiButs"), aPos: [-95, 38], align: [1, 0], id: oImageIds.pauseBut, noMove: true };
    userInput.addHitArea("pause", butEventHandler, null, "image", oPauseBut);
    var aButs = new Array(oPauseBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween1();
    userInput.addHitArea("gameTouch", butEventHandler, { isDraggable: true, multiTouch: true }, "rect", { aRect: [60, 0, canvas.width - 60, canvas.height] }, true);
    previousTime = new Date().getTime();
    updateGameEvent();
}
function initPause() {
    gameState = "pause";
    window.PokiSDK.gameplayStop();
    var oBackBut = { oImgData: assetLib.getData("uiButs"), aPos: [-38, 38], align: [1, 0], id: oImageIds.backBut, noMove: true };
    var oReplayBut = { oImgData: assetLib.getData("uiButs"), aPos: [-80, 0], align: [.5, .5], id: oImageIds.replayBut, noMove: true };
    var oQuitBut = { oImgData: assetLib.getData("uiButs"), aPos: [80, 0], align: [.5, .5], id: oImageIds.quitBut, noMove: true };
    userInput.addHitArea("resumeGame", butEventHandler, null, "image", oBackBut);
    userInput.addHitArea("replayGame", butEventHandler, null, "image", oReplayBut);
    userInput.addHitArea("quitGame", butEventHandler, null, "image", oQuitBut);
    var aButs = new Array(oBackBut, oReplayBut, oQuitBut);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween1();
    previousTime = new Date().getTime();
    updatePauseEvent();
}
function resumeGame() {
    gameState = "game";
    window.PokiSDK.gameplayStart();
    var oPauseBut = { oImgData: assetLib.getData("uiButs"), aPos: [-95, 38], align: [1, 0], id: oImageIds.pauseBut, noMove: true };
    userInput.addHitArea("pause", butEventHandler, null, "image", oPauseBut);
    var aButs = new Array(oPauseBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween1();
    userInput.addHitArea("gameTouch", butEventHandler, { isDraggable: true, multiTouch: true }, "rect", { aRect: [60, 0, canvas.width - 60, canvas.height] }, true);
    previousTime = new Date().getTime();
    updateGameEvent();
}
function butEventHandler(_id, _oData) {
    if (gameState == "PAPause") {
        return;
    }
    switch (_id) {
        case "langSelect":
            curLang = _oData.lang;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            userInput.removeHitArea("langSelect");
            preAssetLib = new Utils.AssetLoader(curLang, [{
                    id: "preloadImage",
                    file: "images/preloadImage.jpg"
                }], ctx, canvas.width, canvas.height, false);
            preAssetLib.onReady(initLoadAssets);
            break;
        case "credits":
            playSound("click");
            userInput.removeHitArea("startGame");
            userInput.removeHitArea("moreGames");
            userInput.removeHitArea("credits");
            userInput.removeHitArea("mute");
            initCreditsScreen();
            break;
        case "backFromCredits":
            playSound("click");
            userInput.removeHitArea("backFromCredits");
            userInput.removeHitArea("resetData");
            userInput.removeHitArea("mute");
            initStartScreen();
            break;
        case "moreGames":
        case "moreGamesPause":
            break;
        case "resetData":
            playSound("click");
            userInput.removeHitArea("backFromCredits");
            userInput.removeHitArea("resetData");
            userInput.removeHitArea("mute");
            saveDataHandler.resetData();
            highscore = saveDataHandler.getData();
            initStartScreen();
            break;
        case "startGame":
            playSound("click");
            userInput.removeHitArea("startGame");
            userInput.removeHitArea("moreGames");
            userInput.removeHitArea("credits");
            initGame();
            break;
        case "gameTouch":
            if (!firstPokiRun) {
                window.PokiSDK.gameplayStart();
                firstPokiRun = true;
            }
            if (bottle.flightState == "waiting") {
                if (_oData.isDown && !_oData.isBeingDragged) {
                    if (swipeState == 0) {
                        dragTimer = 0;
                        startDragX = _oData.x;
                        startDragY = _oData.y;
                    }
                    swipeState = 1;
                }
                else if (swipeState == 1 && _oData.isBeingDragged) {
                    dragTimerRunning = true;
                }
                else {
                    if (swipeState == 1) {
                        swipeState = 0;
                        dragTimerRunning = false;
                        endDragX = _oData.x;
                        endDragY = _oData.y;
                        bottle.flip();
                    }
                }
            }
            break;
        case "quitFromEnd":
            playSound("click");
            userInput.removeHitArea("pause");
            userInput.removeHitArea("retryLevel");
            userInput.removeHitArea("quitFromEnd");
            initStartScreen();
            break;
        case "mute":
            if (!manualPause) {
                playSound("click");
                toggleMute();
            }
            panel.aButs.pop();
            var mb = oImageIds.muteBut0;
            if (muted) {
                mb = oImageIds.muteBut1;
            }
            var oMuteBut = { oImgData: assetLib.getData("uiButs"), aPos: [-30, 30], align: [1, 0], id: mb, noMove: true };
            userInput.addHitArea("mute", butEventHandler, null, "image", oMuteBut);
            panel.aButs.push(oMuteBut);
            break;
        case "pause":
            playSound("click");
            if (audioType == 1) {
                Howler.mute(true);
            }
            else if (audioType == 2) {
                music.pause();
            }
            userInput.removeHitArea("pause");
            userInput.removeHitArea("gameTouch");
            userInput.removeHitArea("mute");
            initPause();
            break;
        case "replayGame":
            playSound("click");
            if (audioType == 1) {
                if (!muted) {
                    Howler.mute(false);
                }
            }
            else if (audioType == 2) {
                if (!muted) {
                    playMusic();
                }
            }
            userInput.removeHitArea("quitGame");
            userInput.removeHitArea("resumeGame");
            userInput.removeHitArea("replayGame");
            userInput.removeHitArea("mute");
            initGame();
            break;
        case "replayGameFromEnd":
            playSound("click");
            userInput.removeHitArea("quitGame");
            userInput.removeHitArea("replayGameFromEnd");
            userInput.removeHitArea("mute");
            if (audioType == 1) {
                if (!muted) {
                    Howler.mute(false);
                }
            }
            else if (audioType == 2) {
                if (!muted) {
                    playMusic();
                }
            }
            window.PokiSDK.commercialBreak(function () {
                if (!muted) {
                    Howler.mute(true);
                    music.pause();
                }
            }).then(function () {
                console.log("Commercial break finished, proceeding to game");
                if (!muted) {
                    Howler.mute(false);
                    playMusic();
                    if (gameState == "game") {
                        music.volume(.75);
                    }
                    else {
                        music.volume(.5);
                    }
                }
                initGame();
            });
            break;
        case "resumeGame":
            playSound("click");
            if (audioType == 1) {
                if (!muted) {
                    Howler.mute(false);
                }
            }
            else if (audioType == 2) {
                if (!muted) {
                    playMusic();
                }
            }
            userInput.removeHitArea("quitGame");
            userInput.removeHitArea("replayGameFromEnd");
            userInput.removeHitArea("resumeGame");
            userInput.removeHitArea("replayGame");
            userInput.removeHitArea("mute");
            window.PokiSDK.commercialBreak(function () {
                if (!muted) {
                    Howler.mute(true);
                    music.pause();
                }
            }).then(function () {
                console.log("Commercial break finished, proceeding to game");
                if (!muted) {
                    Howler.mute(false);
                    playMusic();
                    if (gameState == "game") {
                        music.volume(.75);
                    }
                    else {
                        music.volume(.5);
                    }
                }
                resumeGame();
            });
            break;
        case "quitGame":
            playSound("click");
            if (audioType == 1) {
                if (!muted) {
                    Howler.mute(false);
                }
            }
            else if (audioType == 2) {
                if (!muted) {
                    playMusic();
                }
            }
            userInput.removeHitArea("quitGame");
            userInput.removeHitArea("resumeGame");
            userInput.removeHitArea("replayGame");
            userInput.removeHitArea("mute");
            initStartScreen();
            break;
    }
}
function bottleLanded(_rating, _startX, _startY) {
    bottle.flightState = "scoring";
    score++;
    tutShowTimer = 0;
    addEffect(bottle.x, bottle.y, .6, .6);
    hud.addStars(_rating, _startX, _startY);
    playSound("stars" + _rating);
    if (score > highscore) {
        saveDataHandler.setData(score);
        saveDataHandler.saveData();
        highscore = saveDataHandler.getData();
    }
}
function prepareNextThrow(_starBarFull) {
    bottle.onLeft = !bottle.onLeft;
    table.addItem(!bottle.onLeft);
    bottle.glowAlpha = 0;
    bottle.glowInc = 0;
    if (_starBarFull) {
        if (lives < 2) {
            lives++;
        }
        playSound("transform");
        bottle.upgrade();
        addEffect(bottle.x, bottle.y - bottle.oBottleData.bHeight / 2, 1.75, 1.75);
    }
    bottle.reset();
}
function addEffect(_x, _y, scaleX, scaleY) {
    var tempEffect = new Elements.Explode(_x, _y, scaleX, scaleY);
    aEffects.push(tempEffect);
}
function bottleMissed() {
    tutShowTimer = 0;
    if (--lives < 0) {
        initGameOver();
    }
    else {
        bottle.reset();
        playSound("loseLife");
        table.unFade(bottle.onLeft);
    }
}
function initGameOver() {
    gameState = "gameOver";
    if (audioType == 1) {
        music.fade(music.volume(), .5, 500);
    }
    window.PokiSDK.gameplayStop();
    playSound("gameOver");
    firstRun = false;
    userInput.removeHitArea("pause");
    userInput.removeHitArea("gameTouch");
    userInput.removeHitArea("mute");
    var oQuitBut = { oImgData: assetLib.getData("uiButs"), aPos: [-95, 38], align: [1, 0], id: oImageIds.backBut, noMove: true };
    var oReplayBut = { oImgData: assetLib.getData("uiButs"), aPos: [0, 150], align: [.5, .5], id: oImageIds.replayBut, noMove: true };
    userInput.addHitArea("replayGameFromEnd", butEventHandler, null, "image", oReplayBut);
    userInput.addHitArea("quitGame", butEventHandler, null, "image", oQuitBut);
    var aButs = new Array(oReplayBut, oQuitBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    aMenuBottles = new Array();
    for (var i = 0; i < 5; i++) {
        var bub = new Elements.MenuBottle(bottle.oBottleData.id);
        aMenuBottles.push(bub);
    }
    panel.startTween1();
    panel.fadeTween();
    previousTime = new Date().getTime();
    updateGameOver();
}
function updateGameEvent() {
    if (manualPause || rotatePause || gameState != "game") {
        return;
    }
    delta = getDelta();
    if (dragTimerRunning) {
        dragTimer += delta;
    }
    if (!hud.tutIsOn) {
        tutShowTimer += delta;
        if (tutShowTimer > 5) {
            hud.tutAnim();
        }
    }
    background.render();
    panel.render();
    hud.renderBelow();
    table.render();
    bottle.update();
    bottle.render();
    hud.renderAbove();
    for (var i = 0; i < aEffects.length; i++) {
        aEffects[i].update(delta);
        aEffects[i].render(ctx);
        if (aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    requestAnimFrame(updateGameEvent);
}
function updateCreditsScreenEvent() {
    if (rotatePause || gameState != "credits") {
        return;
    }
    delta = getDelta();
    background.render();
    panel.update();
    panel.render();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.font = "15px Helvetica";
    ctx.fillText("v1.0.3", canvas.width - 20, canvas.height - 20);
    requestAnimFrame(updateCreditsScreenEvent);
}
function updateGameOver() {
    if (rotatePause || gameState != "gameOver") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aMenuBottles.length; i++) {
        aMenuBottles[i].update();
        aMenuBottles[i].render();
    }
    panel.update();
    panel.render();
    requestAnimFrame(updateGameOver);
}
function updateSplashScreenEvent() {
    if (rotatePause || gameState != "splash") {
        return;
    }
    delta = getDelta();
    splashTimer += delta;
    if (splashTimer > 2.5) {
        if (audioType == 1 && !muted) {
            playMusic();
        }
        initStartScreen();
        return;
    }
    background.render();
    panel.update();
    panel.render();
    requestAnimFrame(updateSplashScreenEvent);
}
function updateStartScreenEvent() {
    if (rotatePause || gameState != "start") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aMenuBottles.length; i++) {
        aMenuBottles[i].update();
        aMenuBottles[i].render();
    }
    panel.update();
    panel.render();
    requestAnimFrame(updateStartScreenEvent);
}
function updateLoaderEvent() {
    if (rotatePause || gameState != "load") {
        return;
    }
    delta = getDelta();
    assetLib.render();
    requestAnimFrame(updateLoaderEvent);
}
function updatePauseEvent() {
    if (rotatePause || gameState != "pause") {
        return;
    }
    delta = getDelta();
    background.render();
    panel.render();
    requestAnimFrame(updatePauseEvent);
}
function getDelta() {
    var currentTime = new Date().getTime();
    var deltaTemp = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    if (deltaTemp > .5) {
        deltaTemp = 0;
    }
    return deltaTemp;
}
function checkSpriteCollision(_s1, _s2) {
    var s1XOffset = _s1.x;
    var s1YOffset = _s1.y;
    var s2XOffset = _s2.x;
    var s2YOffset = _s2.y;
    var distance_squared = (((s1XOffset - s2XOffset) * (s1XOffset - s2XOffset)) + ((s1YOffset - s2YOffset) * (s1YOffset - s2YOffset)));
    var radii_squared = (_s1.radius) * (_s2.radius);
    if (distance_squared < radii_squared) {
        return true;
    }
    else {
        return false;
    }
}
function getScaleImageToMax(_oImgData, _aLimit) {
    var newScale;
    if (_oImgData.isSpriteSheet) {
        if (_aLimit[0] / _oImgData.oData.spriteWidth < _aLimit[1] / _oImgData.oData.spriteHeight) {
            newScale = Math.min(_aLimit[0] / _oImgData.oData.spriteWidth, 1);
        }
        else {
            newScale = Math.min(_aLimit[1] / _oImgData.oData.spriteHeight, 1);
        }
    }
    else {
        if (_aLimit[0] / _oImgData.img.width < _aLimit[1] / _oImgData.img.height) {
            newScale = Math.min(_aLimit[0] / _oImgData.img.width, 1);
        }
        else {
            newScale = Math.min(_aLimit[1] / _oImgData.img.height, 1);
        }
    }
    return newScale;
}
function getCentreFromTopLeft(_aTopLeft, _oImgData, _imgScale) {
    var aCentre = new Array();
    aCentre.push(_aTopLeft[0] + (_oImgData.oData.spriteWidth / 2) * _imgScale);
    aCentre.push(_aTopLeft[1] + (_oImgData.oData.spriteHeight / 2) * _imgScale);
    return aCentre;
}
function loadPreAssets() {
    if (aLangs.length > 1) {
        var aLangLoadData = new Array();
        for (var i = 0; i < aLangs.length; i++) {
            aLangLoadData.push({
                id: "lang" + aLangs[i],
                file: "images/lang" + aLangs[i] + ".png"
            });
        }
        preAssetLib = new Utils.AssetLoader(curLang, aLangLoadData, ctx, canvas.width, canvas.height, false);
        preAssetLib.onReady(initLangSelect);
    }
    else {
        curLang = aLangs[0];
        preAssetLib = new Utils.AssetLoader(curLang, [{
                id: "loader",
                file: "images/loader.png"
            }, {
                id: "loadSpinner",
                file: "images/loadSpinner.png"
            }], ctx, canvas.width, canvas.height, false);
        preAssetLib.onReady(initLoadAssets);
    }
}
function initLangSelect() {
    var oImgData;
    var j;
    var k;
    var gap = 10;
    var tileWidthNum = 0;
    var tileHeightNum = 0;
    var butScale = 1;
    for (var i = 0; i < aLangs.length; i++) {
        oImgData = preAssetLib.getData("lang" + aLangs[i]);
        if ((i + 1) * (oImgData.img.width * butScale) + (i + 2) * gap < canvas.width) {
            tileWidthNum++;
        }
        else {
            break;
        }
    }
    tileHeightNum = Math.ceil(aLangs.length / tileWidthNum);
    for (var i = 0; i < aLangs.length; i++) {
        oImgData = preAssetLib.getData("lang" + aLangs[i]);
        j = canvas.width / 2 - (tileWidthNum / 2) * (oImgData.img.width * butScale) - ((tileWidthNum - 1) / 2) * gap;
        j += (i % tileWidthNum) * ((oImgData.img.width * butScale) + gap);
        k = canvas.height / 2 - (tileHeightNum / 2) * (oImgData.img.height * butScale) - ((tileHeightNum - 1) / 2) * gap;
        k += (Math.floor(i / tileWidthNum) % tileHeightNum) * ((oImgData.img.height * butScale) + gap);
        ctx.drawImage(oImgData.img, 0, 0, oImgData.img.width, oImgData.img.height, j, k, (oImgData.img.width * butScale), (oImgData.img.height * butScale));
        var oBut = { oImgData: oImgData, aPos: [j + (oImgData.img.width * butScale) / 2, k + (oImgData.img.height * butScale) / 2], scale: butScale, id: "none", noMove: true };
        userInput.addHitArea("langSelect", butEventHandler, { lang: aLangs[i] }, "image", oBut);
    }
}
function initLoadAssets() {
    loadAssets();
}
function loadAssets() {
    assetLib = new Utils.AssetLoader(curLang, [{
            id: "splashLogo",
            file: "images/splashLogo.png"
        }, {
            id: "uiButs",
            file: "images/uiButs.png",
            oAtlasData: {
                id0: { x: 143, y: 0, width: 141, height: 141 },
                id1: { x: 245, y: 208, width: 49, height: 49 },
                id2: { x: 194, y: 259, width: 49, height: 49 },
                id3: { x: 194, y: 208, width: 49, height: 49 },
                id4: { x: 143, y: 259, width: 49, height: 49 },
                id5: { x: 245, y: 259, width: 49, height: 49 },
                id6: { x: 143, y: 208, width: 49, height: 49 },
                id7: { x: 0, y: 0, width: 141, height: 141 },
                id8: { x: 0, y: 143, width: 141, height: 141 },
                id9: { x: 143, y: 143, width: 127, height: 63 }
            }
        }, {
            id: "uiElements",
            file: "images/uiElements.png",
            oAtlasData: {
                id0: { x: 0, y: 0, width: 483, height: 343 },
                id1: { x: 251, y: 413, width: 194, height: 187 },
                id2: { x: 494, y: 532, width: 45, height: 45 },
                id3: { x: 541, y: 532, width: 45, height: 45 },
                id4: { x: 251, y: 381, width: 242, height: 30 },
                id5: { x: 251, y: 345, width: 245, height: 34 },
                id6: { x: 447, y: 532, width: 45, height: 46 },
                id7: { x: 0, y: 345, width: 249, height: 272 },
                id8: { x: 447, y: 413, width: 175, height: 117 },
                id9: { x: 498, y: 0, width: 62, height: 379 }
            }
        },
        {
            id: "flare",
            file: "images/flare.png"
        }, {
            id: "gameBg0",
            file: "images/gameBg0.jpg"
        }, {
            id: "gameBg1",
            file: "images/gameBg1.jpg"
        }, {
            id: "gameBg2",
            file: "images/gameBg2.jpg"
        }, {
            id: "gameElements",
            file: "images/gameElements.png",
            oAtlasData: {
                id0: { x: 990, y: 618, width: 45, height: 129 },
                id1: { x: 503, y: 1006, width: 75, height: 24 },
                id10: { x: 476, y: 508, width: 144, height: 174 },
                id11: { x: 0, y: 899, width: 191, height: 127 },
                id12: { x: 630, y: 205, width: 134, height: 188 },
                id13: { x: 632, y: 0, width: 113, height: 110 },
                id14: { x: 740, y: 454, width: 98, height: 217 },
                id15: { x: 205, y: 702, width: 153, height: 140 },
                id16: { x: 915, y: 0, width: 57, height: 122 },
                id17: { x: 622, y: 508, width: 116, height: 168 },
                id18: { x: 193, y: 859, width: 171, height: 80 },
                id19: { x: 193, y: 941, width: 129, height: 74 },
                id2: { x: 0, y: 0, width: 474, height: 232 },
                id20: { x: 476, y: 0, width: 154, height: 203 },
                id21: { x: 476, y: 205, width: 152, height: 301 },
                id22: { x: 0, y: 859, width: 191, height: 38 },
                id23: { x: 0, y: 468, width: 474, height: 232 },
                id24: { x: 0, y: 234, width: 474, height: 232 },
                id25: { x: 971, y: 318, width: 50, height: 124 },
                id26: { x: 844, y: 228, width: 59, height: 139 },
                id27: { x: 812, y: 870, width: 59, height: 139 },
                id28: { x: 989, y: 797, width: 48, height: 149 },
                id29: { x: 934, y: 647, width: 54, height: 148 },
                id3: { x: 630, y: 395, width: 115, height: 57 },
                id30: { x: 987, y: 444, width: 50, height: 172 },
                id31: { x: 873, y: 796, width: 59, height: 170 },
                id32: { x: 971, y: 124, width: 53, height: 192 },
                id33: { x: 929, y: 445, width: 56, height: 200 },
                id34: { x: 731, y: 876, width: 79, height: 155 },
                id35: { x: 934, y: 797, width: 53, height: 206 },
                id36: { x: 911, y: 228, width: 58, height: 215 },
                id37: { x: 747, y: 0, width: 93, height: 180 },
                id38: { x: 766, y: 182, width: 76, height: 208 },
                id39: { x: 844, y: 0, width: 69, height: 226 },
                id4: { x: 0, y: 702, width: 203, height: 155 },
                id40: { x: 858, y: 568, width: 69, height: 226 },
                id41: { x: 840, y: 392, width: 69, height: 174 },
                id42: { x: 780, y: 673, width: 76, height: 195 },
                id43: { x: 668, y: 678, width: 110, height: 196 },
                id44: { x: 366, y: 702, width: 158, height: 204 },
                id5: { x: 647, y: 876, width: 82, height: 128 },
                id6: { x: 526, y: 853, width: 119, height: 150 },
                id7: { x: 526, y: 684, width: 140, height: 167 },
                id8: { x: 366, y: 908, width: 135, height: 114 },
                id9: { x: 632, y: 112, width: 103, height: 71 }
            }
        }, {
            id: "numbers",
            file: "images/numbers_62x119.png"
        }, {
            id: "transformEffect",
            file: "images/transformEffect_150x150.png",
            oAnims: {
                explode: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
            }
        }], ctx, canvas.width, canvas.height);
    oImageIds.playBut = "id0";
    oImageIds.resetBut = "id1";
    oImageIds.backBut = "id2";
    oImageIds.muteBut0 = "id3";
    oImageIds.muteBut1 = "id4";
    oImageIds.pauseBut = "id5";
    oImageIds.infoBut = "id6";
    oImageIds.replayBut = "id7";
    oImageIds.quitBut = "id8";
    oImageIds.moreGamesBut = "id9";
    oImageIds.titleLogo = "id0";
    oImageIds.star = "id1";
    oImageIds.life0 = "id2";
    oImageIds.life1 = "id3";
    oImageIds.starBar = "id4";
    oImageIds.starBarBg = "id5";
    oImageIds.highscoreIcon = "id6";
    oImageIds.gameOverBg = "id7";
    oImageIds.tutHand = "id8";
    oImageIds.tutLine = "id9";
    oImageIds.bottle0 = "id0";
    oImageIds.shadow = "id1";
    oImageIds.table0 = "id2";
    oImageIds.item1 = "id3";
    oImageIds.item2 = "id4";
    oImageIds.item3 = "id5";
    oImageIds.item4 = "id6";
    oImageIds.item5 = "id7";
    oImageIds.item6 = "id8";
    oImageIds.item7 = "id9";
    oImageIds.item8 = "id10";
    oImageIds.item9 = "id11";
    oImageIds.item10 = "id12";
    oImageIds.item11 = "id13";
    oImageIds.item12 = "id14";
    oImageIds.item13 = "id15";
    oImageIds.item14 = "id16";
    oImageIds.item15 = "id17";
    oImageIds.item16 = "id18";
    oImageIds.item17 = "id19";
    oImageIds.item18 = "id20";
    oImageIds.item19 = "id21";
    oImageIds.item20 = "id22";
    oImageIds.table2 = "id23";
    oImageIds.table1 = "id24";
    oImageIds.bottle1 = "id25";
    oImageIds.bottle2 = "id26";
    oImageIds.bottle3 = "id27";
    oImageIds.bottle4 = "id28";
    oImageIds.bottle5 = "id29";
    oImageIds.bottle6 = "id30";
    oImageIds.bottle7 = "id31";
    oImageIds.bottle8 = "id32";
    oImageIds.bottle9 = "id33";
    oImageIds.bottle10 = "id34";
    oImageIds.bottle11 = "id35";
    oImageIds.bottle12 = "id36";
    oImageIds.bottle13 = "id37";
    oImageIds.bottle14 = "id38";
    oImageIds.bottle15 = "id39";
    oImageIds.bottle16 = "id40";
    oImageIds.bottle17 = "id41";
    oImageIds.bottle18 = "id42";
    oImageIds.bottle19 = "id43";
    oImageIds.bottle20 = "id44";
    oImageIds.glowTarget = "id45";
    assetLib.onReady(initSplash);
    gameState = "load";
    previousTime = new Date().getTime();
    updateLoaderEvent();
}
function resizeCanvas() {
    var tempInnerWidth = window.innerWidth;
    var tempInnerHeight = window.innerHeight;
    canvas.height = tempInnerHeight;
    canvas.width = tempInnerWidth;
    canvas.style.width = tempInnerWidth + "px";
    canvas.style.height = tempInnerHeight + "px";
    if (tempInnerWidth > tempInnerHeight) {
        if (canvas.height < minSquareSize) {
            canvas.height = minSquareSize;
            canvas.width = minSquareSize * (tempInnerWidth / tempInnerHeight);
            canvasScale = minSquareSize / tempInnerHeight;
        }
        else if (canvas.height > maxSquareSize) {
            canvas.height = maxSquareSize;
            canvas.width = maxSquareSize * (tempInnerWidth / tempInnerHeight);
            canvasScale = maxSquareSize / tempInnerHeight;
        }
        else {
            canvasScale = 1;
        }
    }
    else {
        if (canvas.width < minSquareSize) {
            canvas.width = minSquareSize;
            canvas.height = minSquareSize * (tempInnerHeight / tempInnerWidth);
            canvasScale = minSquareSize / tempInnerWidth;
        }
        else if (canvas.width > maxSquareSize) {
            canvas.width = maxSquareSize;
            canvas.height = maxSquareSize * (tempInnerHeight / tempInnerWidth);
            canvasScale = maxSquareSize / tempInnerWidth;
        }
        else {
            canvasScale = 1;
        }
    }
    if (gameState == "game") {
        userInput.addHitArea("gameTouch", butEventHandler, { isDraggable: true, multiTouch: true }, "rect", { aRect: [60, 0, canvas.width - 60, canvas.height] }, true);
    }
}
function playSound(_id) {
    if (audioType == 1) {
        sound.play(_id);
    }
}
function toggleMute() {
    muted = !muted;
    if (audioType == 1) {
        if (muted) {
            Howler.mute(true);
            music.pause();
        }
        else {
            Howler.mute(false);
            playMusic();
            if (gameState == "game") {
                music.volume(.75);
            }
            else {
                music.volume(.5);
            }
        }
    }
    else if (audioType == 2) {
        if (muted) {
            music.pause();
        }
        else {
            playMusic();
        }
    }
}
function toggleManualPause() {
    if (!manualPause) {
        manualPause = true;
        pauseCoreOn();
        var oQuitBut = { oImgData: assetLib.getData("uiButs"), aPos: [canvas.width / 2, 500], id: oImageIds.genBut, noMove: true, text: "quit" };
        var oResumeBut = { oImgData: assetLib.getData("uiButs"), aPos: [canvas.width / 2, 350], id: oImageIds.genBut, noMove: true, text: "resume" };
        var aButs = new Array(oQuitBut, oResumeBut);
        userInput.addHitArea("quitFromPause", butEventHandler, null, "image", oQuitBut);
        userInput.addHitArea("resumeFromPause", butEventHandler, null, "image", oResumeBut);
        panel = new Elements.Panel("pause", aButs);
        panel.render();
        userInput.addHitArea("pause", butEventHandler, null, "rect", { aRect: [0, 0, 53, 53] }, true);
    }
    else {
        manualPause = false;
        userInput.removeHitArea("quitFromPause");
        userInput.removeHitArea("resumeFromPause");
        userInput.removeHitArea("moreGamesPause");
        pauseCoreOff();
    }
}
function rotatePauseOn() {
    rotatePause = true;
    ctx.drawImage(assetLib.getImg("rotateDeviceMessage"), 0, 0);
    userInput.pauseIsOn = true;
    pauseCoreOn();
}
function rotatePauseOff() {
    rotatePause = false;
    userInput.removeHitArea("quitFromPause");
    userInput.removeHitArea("resumeFromPause");
    userInput.removeHitArea("moreGamesPause");
    pauseCoreOff();
}
function pauseCoreOn() {
    if (audioType == 1) {
        Howler.mute(true);
    }
    else if (audioType == 2) {
        music.pause();
    }
    switch (gameState) {
        case "start":
            break;
        case "help":
            break;
        case "game":
            break;
        case "end":
            break;
    }
}
function pauseCoreOff() {
    if (audioType == 1) {
        if (!muted) {
            Howler.mute(false);
        }
    }
    else if (audioType == 2) {
        if (!muted) {
            playMusic();
        }
    }
    previousTime = new Date().getTime();
    userInput.pauseIsOn = false;
    switch (gameState) {
        case "splash":
            updateSplashScreenEvent();
            break;
        case "start":
            initStartScreen();
            break;
        case "tutorial":
            break;
        case "credits":
            initCreditsScreen();
            break;
        case "game":
            if (!manualPause) {
                userInput.addHitArea("pause", butEventHandler, null, "rect", { aRect: [0, 0, 68, 68] }, true);
                updateGameEvent();
            }
            else {
                manualPause = false;
                updateGameEvent();
                toggleManualPause();
            }
            break;
        case "gameOver":
            break;
    }
}
