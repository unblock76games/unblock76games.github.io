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
            this.scale = 1;
            this.frameInc = 0;
            this.fps = 15;
            this.curFrame = 0;
            this.jsonData = new Utils.JSONData();
            this.totalAssets = _aFileData.length;
            this.showBar = _showBar;
            this.textData.langText = this.jsonData.textData;
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
            ctx.translate(canvas.width / 2 - 30, canvas.height / 2 - 16);
            ctx.rotate(this.spinnerRot);
            ctx.drawImage(this.oLoadSpinnerImgData.img, -this.oLoadSpinnerImgData.img.width / 2, -this.oLoadSpinnerImgData.img.height / 2);
            ctx.restore();
            this.displayNumbers();
        };
        AssetLoader.prototype.displayNumbers = function () {
            ctx.textAlign = "left";
            ctx.font = "bold 40px arial";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(Math.round((this.assetsLoaded / this.totalAssets) * 100) + "%", canvas.width / 2 + 0, canvas.height / 2 - 1);
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
            _canvas.addEventListener('contextmenu', function (event) { return event.preventDefault(); });
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
                if (e.button == 2) {
                    return;
                }
                clearButtonOvers();
                _this.isDown = false;
                _this.hitCancel(e, Math.abs(e.pageX), Math.abs(e.pageY), 1);
                if (gameState == "game" && throwState == 1) {
                    butEventHandler("gameTouch", { isBeingDragged: false, isDown: false });
                }
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
                playSound("silence");
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
            _posX *= canvasScale;
            _posY *= canvasScale;
            this.mouseX = _posX;
            this.mouseY = _posY;
            if (_isDown) {
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
        function Background() {
            this.x = 0;
            this.y = 0;
            this.targY = 0;
            this.inc = 0;
            this.renderState = null;
            this.oImgData = assetLib.getData("bgMain");
            this.bounceBg();
        }
        Background.prototype.bounceBg = function () {
            this.bounceScale = 1;
            TweenLite.to(this, 1, { bounceScale: 0, ease: "Cubic.easeOut" });
        };
        Background.prototype.render = function () {
            this.inc += 1 * delta;
            this.scale = 1 + Math.sin(this.inc) / 20 + 1 / 20;
            this.scale += this.bounceScale;
            if (canvas.width > canvas.height) {
                ctx.drawImage(this.oImgData.img, 0, ((1 - canvas.height / canvas.width) / 2) * this.oImgData.img.height, this.oImgData.img.width, (canvas.height / canvas.width) * this.oImgData.img.height, 0 - (this.scale - 1) * canvas.width / 2, 0 - (this.scale - 1) * canvas.height / 2, canvas.width * this.scale, canvas.height * this.scale);
            }
            else {
                ctx.drawImage(this.oImgData.img, ((1 - canvas.width / canvas.height) / 2) * this.oImgData.img.width, 0, (canvas.width / canvas.height) * this.oImgData.img.width, this.oImgData.img.width, 0 - (this.scale - 1) * canvas.width / 2, 0 - (this.scale - 1) * canvas.height / 2, canvas.width * this.scale, canvas.height * this.scale);
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
            this.timer = .3;
            this.endTime = 0;
            this.posY0 = 0;
            this.posY1 = 0;
            this.posY2 = 0;
            this.posY3 = 0;
            this.posY4 = 0;
            this.numberSpace = 17;
            this.incY = 0;
            this.flareRot = 0;
            this.charPosGap = 280;
            this.flashInc = 0;
            this.scale0 = 0;
            this.scale1 = 0;
            this.scale2 = 0;
            this.swerveControlId = 0;
            this.prevBallSin = 0;
            this.scoreScroll = 0;
            this.oSplashLogoImgData = assetLib.getData("splashLogo");
            this.oTutElementsImgData = assetLib.getData("tutElements");
            this.oUiElementsImgData = assetLib.getData("uiElements");
            this.oUiButsImgData = assetLib.getData("uiButs");
            this.panelType = _panelType;
            this.aButs = _aButs;
            this.oScoreElementsImgData = assetLib.getData("scoreElements");
            this.oGameElementsImgData = assetLib.getData("gameElements");
        }
        Panel.prototype.update = function () {
            this.incY += 10 * delta;
        };
        Panel.prototype.startTween = function (_oData) {
            var _this = this;
            if (_oData === void 0) { _oData = null; }
            switch (gameState) {
                case "start":
                    this.posY0 = 500;
                    this.tween0 = TweenLite.to(this, .75, {
                        posY0: 0, ease: "Back.easeOut",
                        onComplete: function () {
                        }
                    });
                    break;
                case "1PStart":
                    break;
                case "credits":
                case "pause":
                    this.posY0 = 500;
                    this.tween0 = TweenLite.to(this, .75, {
                        posY0: 0, ease: "Back.easeOut",
                        onComplete: function () {
                        }
                    });
                    break;
                case "userCharSelect":
                    this.posY0 = 500;
                    this.charX2 = 500;
                    this.tween0 = TweenLite.to(this, .75, {
                        posY0: 0, ease: "Back.easeOut",
                        onComplete: function () {
                        }
                    });
                    break;
                case "opCharSelect":
                    this.charX0 = 0;
                    this.posY0 = 500;
                    this.tween0 = TweenLite.to(this, .75, {
                        posY0: 0, ease: "Back.easeOut",
                        onComplete: function () {
                        }
                    });
                    break;
                case "challengeProgress":
                    this.posY0 = 500;
                    this.posY1 = 500;
                    this.posY2 = 500;
                    this.posY3 = 500;
                    this.posY4 = 0;
                    this.multiState = 0;
                    TweenLite.to(this, 1.2, { posY0: 0, delay: 0, ease: "Back.easeOut" });
                    TweenLite.to(this, 1.2, { posY1: 0, delay: .15, ease: "Back.easeOut" });
                    TweenLite.to(this, 1.2, { posY2: 0, delay: .3, ease: "Back.easeOut" });
                    TweenLite.to(this, 1.2, { posY3: 0, delay: .45, ease: "Back.easeOut", onComplete: function () {
                            TweenLite.to(_this, .5, { posY4: 500, delay: 0, ease: "Quad.easeIn" });
                            _this.multiState = 1;
                            _this.charX0 = 1.2;
                            playSound("shotScore1");
                            playSound("cheer4");
                            TweenLite.to(_this, 1, {
                                charX0: 1, delay: 0, ease: "Elastic.easeOut",
                                onComplete: function () {
                                    setTimeout(function () {
                                        userInput.removeHitArea("mute");
                                        initTeamIntro();
                                    }, 200);
                                }
                            });
                        } });
                    break;
                case "teamIntro":
                    addFirework(canvas.width / 2 - 35 - ((3 - Math.floor(curLevel / 3)) % 2) * 150 + 1 * 110 + aCharIcons[1 + Math.floor(curLevel / 3) * 3].offsetX * .3, canvas.height / 2 - 200 + 150 * (3 - Math.floor(curLevel / 3)) + aCharIcons[1 + Math.floor(curLevel / 3) * 3].offsetY * .3, 4);
                    for (var j = 0; j < 3; j++) {
                        var tempId = j + Math.floor(curLevel / 3) * 3;
                        this["scale" + j] = .4;
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                        this["charX" + j] = -35 - ((3 - Math.floor(curLevel / 3)) % 2) * 150 + j * 110 + aCharIcons[tempId].offsetX * .3;
                        this["posY" + j] = -200 + 150 * (3 - Math.floor(curLevel / 3)) + aCharIcons[tempId].offsetY * .3;
                    }
                    TweenLite.to(this, 1.5, { charX0: -135, posY0: -200, scale0: .9, delay: 0, ease: "Back.easeInOut" });
                    TweenLite.to(this, 1.5, { charX1: 135, posY1: -130, scale1: .95, delay: .2, ease: "Back.easeInOut" });
                    TweenLite.to(this, 1.5, { charX2: -75, posY2: 50, scale2: 1, delay: .4, ease: "Back.easeInOut" });
                    this.posY3 = 500;
                    TweenLite.to(this, .5, { posY3: 0, delay: 1.5, ease: "Back.easeOut" });
                    break;
                case "teamOutro":
                    this.charX0 = -135;
                    this.posY0 = -200;
                    this.charX1 = 135;
                    this.posY1 = -130;
                    this.charX2 = -75;
                    this.posY2 = 50;
                    this.scale0 = .3;
                    this.scale1 = .3;
                    this.scale2 = .3;
                    TweenLite.to(this, .5, { scale0: .9, delay: 0, ease: "Back.easeOut" });
                    TweenLite.to(this, .5, { scale1: .95, delay: 0, ease: "Back.easeOut" });
                    TweenLite.to(this, .5, { scale2: 1, delay: 0, ease: "Back.easeOut" });
                    TweenLite.to(this, 1.0, { posY0: 500, delay: 2, ease: "Back.easeIn" });
                    TweenLite.to(this, 1.0, { posY1: 500, delay: 2.2, ease: "Back.easeIn" });
                    TweenLite.to(this, 1.0, {
                        posY2: 500, delay: 2.4, ease: "Back.easeIn",
                        onComplete: function () {
                            if (curLevel < 12) {
                                initChallengeProgressScreen();
                            }
                            else {
                                initCupWinner();
                            }
                        }
                    });
                    this.posY3 = 500;
                    TweenLite.to(this, .5, { posY3: 0, delay: .3, ease: "Back.easeOut" });
                    TweenLite.to(this, 1, { posY3: 500, delay: 2.7, ease: "Back.easeIn" });
                    break;
                case "gameIntro":
                    this.chatOrder = 0;
                    this.charX0 = 500;
                    this.charX1 = 0;
                    this.charX2 = 500;
                    playSound("shotScore2");
                    playSound("cheer2");
                    setTimeout(function () {
                        playSound("shotScore3");
                    }, 1500);
                    TweenLite.to(this, 1, {
                        charX0: 0, delay: 0, ease: "Back.easeOut",
                        onComplete: function () {
                            playSound("jump");
                        }
                    });
                    TweenLite.to(this, 1, { charX1: 1, delay: 1, ease: "Elastic.easeOut" });
                    TweenLite.to(this, 1, { charX2: 0, delay: 1.5, ease: "Back.easeOut" });
                    break;
                case "game":
                    this.posY0 = 500;
                    this.posY3 = 0;
                    if (shotNum == 0) {
                        this.posY1 = -300;
                        TweenLite.to(this, 1.5, { posY1: 0, ease: "Bounce.easeOut" });
                    }
                    else {
                        this.posY1 = 500;
                        TweenLite.to(this, .5, { posY1: 0, ease: "Quint.easeOut" });
                    }
                    if (firstGoState == 0) {
                        this.tutAnim0 = new Elements.TutAnim0();
                        this.charX0 = 500;
                        TweenLite.to(this, .3, { charX0: 0, ease: "Quad.easeOut" });
                    }
                    break;
                case "gameOver":
                    loseTextId = (loseTextId + 1) % 3;
                    this.posY0 = 500;
                    this.posY1 = 500;
                    this.posY2 = 500;
                    TweenLite.to(this, .75, { posY0: 0, ease: "Back.easeOut" });
                    TweenLite.to(this, .75, { delay: .2, posY1: 0, ease: "Back.easeOut" });
                    TweenLite.to(this, 1.5, { delay: .4, posY2: 0, ease: "Quint.easeOut" });
                    break;
                case "cupWinner":
                    this.posY0 = 500;
                    this.posY1 = 500;
                    this.posY2 = 500;
                    TweenLite.to(this, .75, { posY0: 0, ease: "Back.easeOut" });
                    TweenLite.to(this, .75, { delay: .2, posY1: 0, ease: "Back.easeOut" });
                    TweenLite.to(this, 1.5, { delay: .4, posY2: 0, ease: "Quint.easeOut" });
                    break;
            }
            this.butsY = 500;
            TweenLite.to(this, .5, { butsY: 0, ease: "Quint.easeOut" });
            this.flashInc = 1;
            TweenLite.to(this, 1, { flashInc: 0, ease: "Quad.easeOut" });
        };
        Panel.prototype.showSwerveTut = function () {
            userInput.removeKey("swerveRight");
            userInput.removeKey("swerveLeft");
            userInput.removeHitArea("gameTouch");
            userInput.removeHitArea("pause");
            panel.removeBut(oImageIds.pauseBut);
            if (hasTilt) {
                if (window.DeviceOrientationEvent) {
                    window.removeEventListener("deviceorientation", devOrientHandler, false);
                }
            }
            var oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [0, 0], align: [.5, .85], id: oImageIds.playBut, idOver: oImageIds.playButOver, flash: true };
            userInput.addHitArea("nextFromTutorial1", butEventHandler, null, "image", oNextBut);
            panel.aButs = new Array(oNextBut);
            addMuteBut(panel.aButs);
            this.tutAnim0 = new Elements.TutAnim1();
            this.posY2 = -50;
            this.swerveControlId = 1;
            this.charX0 = 500;
            TweenLite.to(this, .3, { charX0: 0, ease: "Quad.easeOut" });
            this.moveSwerveTutBallRight();
        };
        Panel.prototype.moveSwerveTutBallRight = function () {
            var _this = this;
            TweenLite.to(this, .5, { swerveControlId: 0, ease: "Quad.easeInOut" });
            this.tween0 = TweenLite.to(this, 2, {
                posY2: 50, ease: "Quad.easeInOut",
                onComplete: function () {
                    TweenLite.to(_this, .5, { swerveControlId: 1, ease: "Quad.easeInOut" });
                    _this.tween0 = TweenLite.to(_this, 2, {
                        posY2: -50, ease: "Quad.easeInOut",
                        onComplete: function () {
                            _this.moveSwerveTutBallRight();
                        }
                    });
                }
            });
        };
        Panel.prototype.showScores = function (_resetState) {
            var _this = this;
            this.scoreResult = this.getThrowResult();
            if (gameType == 2) {
                challengeAttempts++;
                if (challengeAttempts < 0) {
                    oChallengeScore.bonus0 = 0;
                    for (var i = 0; i < lane.aChallengeLayouts[challengeLevel].aPins.length; i++) {
                        if (lane.aChallengeLayouts[challengeLevel].aPins[i] == 1) {
                            oChallengeScore.bonus0 += 10;
                        }
                    }
                    oChallengeScore.bonus1 = (challengeLevel + 1) * 10;
                    if (this.scoreResult == 10) {
                        oChallengeScore.bonus2 += 100;
                    }
                    this.scoreScroll = oChallengeScore.total;
                    oChallengeScore.total += oChallengeScore.bonus0 + oChallengeScore.bonus1 + oChallengeScore.bonus2;
                    TweenLite.to(this, .5, { scoreScroll: oChallengeScore.total, delay: .3, ease: "Cubic.easeInOut" });
                }
            }
            if (this.scoreResult == 0) {
                if (gameType == 2) {
                    oChallengeScore.bonus2 = 0;
                }
                playSound("shotMiss");
            }
            else if (this.scoreResult > 0 && this.scoreResult < 10 || this.scoreResult == 12) {
                playSound("shotScore" + Math.floor(Math.random() * 5));
            }
            else {
                playSound("shotStrike");
            }
            this.posY0 = 500;
            TweenLite.to(this, .5, { posY0: 0, ease: "Back.easeOut" });
            this.posY3 = 0;
            TweenLite.to(this, .5, { posY3: 1, ease: "Back.easeOut" });
            TweenLite.to(this, .5, { delay: 2, posY3: 0, ease: "Back.easeIn" });
            TweenLite.to(this, .5, {
                delay: 2, posY0: 500, ease: "Back.easeIn",
                onComplete: function () {
                    if (challengeLives <= 0) {
                        stopUserControl();
                        userInput.removeHitArea("pause");
                        userInput.removeHitArea("mute");
                        window.PokiSDK.gameplayStop();
                        initChallengeSelectScreen();
                        return;
                    }
                    prepNextShot(_resetState);
                    _this.flashInc = 1;
                    TweenLite.to(_this, 1, { flashInc: 0, ease: "Quad.easeOut" });
                    if (shotNum == 0) {
                        _this.posY1 = -300;
                        TweenLite.to(_this, 1.5, { posY1: 0, ease: "Bounce.easeOut" });
                    }
                    else {
                        _this.posY1 = 500;
                        TweenLite.to(_this, .5, { posY1: 0, ease: "Quint.easeOut" });
                    }
                }
            });
        };
        Panel.prototype.getStartChatName = function () {
            var tempCurChar = curChar;
            var tempOpChar = checkCharId(opChar);
            if (tempCurChar < tempOpChar) {
                this.chatFlip = false;
                return "startChat" + tempCurChar.toString() + "-" + tempOpChar.toString();
            }
            else {
                this.chatFlip = true;
                return "startChat" + checkCharId(opChar).toString() + "-" + tempCurChar.toString();
            }
        };
        Panel.prototype.tweenInUserUnlockInfo = function () {
            if (this.tween0) {
                this.tween0.kill();
            }
            this.tween0 = TweenLite.to(this, .3, { posY0: 203, ease: "Quad.easeOut" });
            if (this.tween2) {
                this.tween2.kill();
            }
            if (this.tween1) {
                this.tween1.kill();
            }
            this.charX0 = 500;
            this.charX2 = 500;
            this.tween2 = TweenLite.to(this, .5, { charX2: 0, ease: "Back.easeOut" });
        };
        Panel.prototype.tweenInOpUnlockInfo = function () {
            if (this.tween0) {
                this.tween0.kill();
            }
            this.tween0 = TweenLite.to(this, .3, { posY0: 203, ease: "Quad.easeOut" });
            if (this.tween2) {
                this.tween2.kill();
            }
            if (this.tween1) {
                this.tween1.kill();
            }
            this.charX1 = 500;
            this.charX2 = 500;
            this.tween2 = TweenLite.to(this, .5, { charX2: 0, ease: "Back.easeOut" });
        };
        Panel.prototype.tweenInUserChar = function () {
            if (this.tween0) {
                this.tween0.kill();
            }
            this.tween0 = TweenLite.to(this, .3, { posY0: 203, ease: "Quad.easeOut" });
            if (this.tween2) {
                this.tween2.kill();
            }
            if (this.tween1) {
                this.tween1.kill();
            }
            this.charX0 = 500;
            this.charX2 = 500;
            this.tween1 = TweenLite.to(this, .5, { charX0: 0, ease: "Back.easeOut" });
        };
        Panel.prototype.tweenInOpChar = function () {
            if (this.tween0) {
                this.tween0.kill();
            }
            this.tween0 = TweenLite.to(this, .3, { posY0: 203, ease: "Quad.easeOut" });
            if (this.tween2) {
                this.tween2.kill();
            }
            if (this.tween1) {
                this.tween1.kill();
            }
            this.charX1 = 500;
            this.charX2 = 500;
            this.tween1 = TweenLite.to(this, .5, { charX1: 0, ease: "Back.easeOut" });
        };
        Panel.prototype.switchBut = function (_id0, _id1, _id1Over, _aNewAPos, _aNewAlign) {
            if (_aNewAPos === void 0) { _aNewAPos = null; }
            if (_aNewAlign === void 0) { _aNewAlign = null; }
            var oButData = null;
            for (var i = 0; i < this.aButs.length; i++) {
                if (this.aButs[i].id == _id0) {
                    this.aButs[i].id = _id1;
                    this.aButs[i].idOver = _id1Over;
                    oButData = this.aButs[i];
                    if (_aNewAPos) {
                        this.aButs[i].aPos = _aNewAPos;
                    }
                    if (_aNewAlign) {
                        this.aButs[i].align = _aNewAlign;
                    }
                }
            }
            return oButData;
        };
        Panel.prototype.render = function (_butsOnTop) {
            if (_butsOnTop === void 0) { _butsOnTop = true; }
            if (!_butsOnTop) {
                this.addButs(ctx);
            }
            switch (gameState) {
                case "rotated":
                    var oRotateIconImgData = assetLib.getData("rotateIcon");
                    ctx.fillStyle = "rgba(0, 0, 0, 1)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(oRotateIconImgData.img, canvas.width / 2 - oRotateIconImgData.img.width / 2, canvas.height / 2 - oRotateIconImgData.img.height / 2);
                    break;
                case "splash":
                    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(this.oSplashLogoImgData.img, canvas.width / 2 - this.oSplashLogoImgData.img.width / 2, canvas.height / 2 - this.oSplashLogoImgData.img.height / 2 - this.posY0);
                    break;
                case "start":
                    var tempImgData = assetLib.getData("titleLogo");
                    ctx.drawImage(tempImgData.img, 0, 0, tempImgData.img.width, tempImgData.img.height, canvas.width / 2 - (tempImgData.img.width / 2) - (this.posY0 * 3) / 2 + Math.sin(this.incY / 2) * 5, -5 - this.posY0 - (this.posY0 * 3) / 2 - Math.sin(this.incY / 2) * 5, tempImgData.img.width + (this.posY0 * 3) - Math.sin(this.incY / 2) * 10, tempImgData.img.height + (this.posY0 * 3) + Math.sin(this.incY / 2) * 10);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.titlePins].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.titlePins].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.titlePins].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.titlePins].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + this.posY0, canvas.height * .55 - bHeight / 2, bWidth, bHeight);
                    break;
                case "credits":
                    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    var tempImgData = assetLib.getData("info");
                    ctx.drawImage(tempImgData.img, 0, 0, tempImgData.img.width, tempImgData.img.height, canvas.width / 2 - tempImgData.img.width / 2, canvas.height / 2 - tempImgData.img.height / 2 + this.posY0, tempImgData.img.width, tempImgData.img.height);
                    ctx.fillStyle = "#ffffff";
                    ctx.textAlign = "center";
                    ctx.font = "15px Helvetica";
                    ctx.fillText("v2.1.0", canvas.width / 2, canvas.height - 9 + this.butsY);
                    break;
                case "userCharSelect":
                    if (curChar == 99) {
                        tempScale = (Math.sin(this.incY / 2) * 3);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - tempScale / 2, canvas.height * .3 - bHeight / 2 + tempScale / 2 - this.butsY, bWidth + tempScale, bHeight - tempScale);
                    }
                    if (curChar < 99 && this.charX0 < 500) {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                        var tempScale = (2 + Math.sin(this.incY / 2) / 4);
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale + this.charX0, canvas.height * .3 - (bHeight / 2) * tempScale, bWidth * tempScale, bHeight * tempScale);
                        tempScale = (Math.sin(this.incY / 2) * 3);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + curChar]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + curChar]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + curChar]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + curChar]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + aCharIcons[curChar].offsetX + this.charX0 - tempScale / 2, canvas.height * .3 - bHeight / 2 + aCharIcons[curChar].offsetY + tempScale / 2, bWidth + tempScale, bHeight - tempScale);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - this.charX0 + 115, canvas.height * .3 - bHeight / 2 + 81, bWidth, bHeight);
                        if (gameType == 0 && playerNum == 1) {
                            addDirectText(2, 35, "right", canvas.width / 2 + this.charX0 - 130, canvas.height * .3 - 95, saveDataHandler.aLevelStore[curChar] + "/12", "#FFFFFF");
                        }
                    }
                    if (this.charX2 < 500) {
                        tempScale = (Math.sin(this.incY / 2) * 3);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + this.charX2 - tempScale / 2, canvas.height * .3 - bHeight / 2 + tempScale / 2, bWidth + tempScale, bHeight - tempScale);
                        addText(1, 40, 500, "center", canvas.width / 2 - this.charX2, canvas.height * .3 + 15, "unlock" + aCharIcons[curChar].unlocked, "#000000");
                    }
                    if (saveDataHandler.aLevelStore[curChar] == 12) {
                    }
                    break;
                case "opCharSelect":
                    this.renderFlare(canvas.width / 2, 245, 3);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 245 - bHeight / 2 - this.posY0, bWidth, bHeight);
                    addText(1, 40, 350, "center", canvas.width / 2, 258 - this.posY0, "selectOpponent" + playerNum, "#000000");
                    if (opChar < 99 && this.charX1 < 500) {
                        if (playerNum == 1) {
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                            var tempScale = (2 + Math.sin(this.incY / 2) / 4);
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - 390 - (bWidth / 2) * tempScale + this.charX1, canvas.height * .3 - (bHeight / 2) * tempScale, bWidth * tempScale, bHeight * tempScale);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["slidePanel" + getOpPanelId()]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["slidePanel" + getOpPanelId()]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["slidePanel" + getOpPanelId()]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["slidePanel" + getOpPanelId()]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - 225 + this.charX1, canvas.height * .3 - bHeight / 2 - 10, bWidth, bHeight);
                            for (var i = 0; i < 3; i++) {
                                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["statBar" + i + "0"]].x;
                                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["statBar" + i + "0"]].y;
                                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["statBar" + i + "0"]].width;
                                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["statBar" + i + "0"]].height;
                                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - 225 + this.charX1 + 18, canvas.height * .3 - 100 + 79 * i, bWidth, bHeight);
                                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["statBar" + i + "1"]].x;
                                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["statBar" + i + "1"]].y;
                                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["statBar" + i + "1"]].width;
                                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["statBar" + i + "1"]].height;
                                ctx.drawImage(this.oUiElementsImgData.img, bX + (1 - aCharIcons[opChar]["stat" + i]) * bWidth, bY, aCharIcons[opChar]["stat" + i] * bWidth, bHeight, canvas.width - 225 + this.charX1 + 22, canvas.height * .3 - 100 + 79 * i, aCharIcons[opChar]["stat" + i] * bWidth, bHeight);
                                addText(2, 28, 200, "left", canvas.width - 200 + this.charX1, canvas.height * .3 - 32 + 79 * i, "stat" + i, "#000000");
                            }
                            tempScale = (Math.sin(this.incY / 2) * 3);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + opChar]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + opChar]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + opChar]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + opChar]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - 390 - bWidth / 2 + aCharIcons[opChar].offsetX + this.charX1 * 1.75 - tempScale / 2, canvas.height * .3 - bHeight / 2 + aCharIcons[opChar].offsetY + tempScale / 2, bWidth + tempScale, bHeight - tempScale);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + opChar]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + opChar]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + opChar]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + opChar]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - 290 - bWidth / 2 + this.charX1 * 1.2, canvas.height * .3 - bHeight / 2 + 86, bWidth, bHeight);
                            addText(1, 40, 200, "left", canvas.width - 200 + this.charX1, canvas.height * .3 - 124, "char" + opChar, "#FFFFFF");
                        }
                        else {
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                            var tempScale = (2 + Math.sin(this.incY / 2) / 4);
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale + this.charX1, canvas.height * .3 - (bHeight / 2) * tempScale, bWidth * tempScale, bHeight * tempScale);
                            tempScale = (Math.sin(this.incY / 2) * 3);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + opChar]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + opChar]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + opChar]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + opChar]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + aCharIcons[opChar].offsetX + this.charX1 - tempScale / 2, canvas.height * .3 - bHeight / 2 + aCharIcons[opChar].offsetY + tempScale / 2, bWidth + tempScale, bHeight - tempScale);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + aCharIcons[opChar].panelId]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + aCharIcons[opChar].panelId]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + aCharIcons[opChar].panelId]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + aCharIcons[opChar].panelId]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - this.charX1 - 0, canvas.height * .3 - bHeight / 2 + 115, bWidth, bHeight);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + opChar]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + opChar]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + opChar]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + opChar]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - this.charX1 + 155, canvas.height * .3 - bHeight / 2 + 81, bWidth, bHeight);
                            addText(1, 40, 220, "center", canvas.width / 2 - this.charX1, canvas.height * .3 + 128, "char" + opChar, "#FFFFFF");
                        }
                    }
                    if (this.charX2 < 500) {
                        tempScale = (Math.sin(this.incY / 2) * 3);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeIconMystery].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + this.charX2 - tempScale / 2, canvas.height * .3 - bHeight / 2 + tempScale / 2, bWidth + tempScale, bHeight - tempScale);
                        addText(1, 40, 500, "center", canvas.width / 2 + this.charX2, canvas.height * .3, "unlock" + aCharIcons[opChar].unlocked, "#000000");
                    }
                    break;
                case "challengeSelect":
                    this.renderFlare(canvas.width / 2, canvas.height / 2, 3);
                    var temp = saveDataHandler.getChallengeHighScore();
                    addDirectText(1, 30, "right", canvas.width - 37 - 1, canvas.height - 9 - this.butsY + 1, temp.toString(), "#000000");
                    addDirectText(1, 30, "right", canvas.width - 37 + 1, canvas.height - 9 - this.butsY - 1, temp.toString(), "#FFFFFF");
                    addDirectText(1, 30, "right", canvas.width - 37, canvas.height - 9 - this.butsY, temp.toString(), "#FFC401");
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.crown].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.crown].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.crown].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.crown].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - 30, canvas.height - 30 - this.butsY, bWidth, bHeight);
                    break;
                case "challengeProgress":
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 42 - bHeight / 2 - this.butsY, bWidth, bHeight);
                    addText(1, 40, 350, "center", canvas.width / 2, 55 - this.butsY, "challengeProgress", "#000000");
                    for (var i = 0; i < 4 - Math.floor(Math.floor(curLevel / 3) / 3); i++) {
                        if (this["posY" + i] != 500) {
                            var tempId;
                            var tempSinX = Math.sin(this.incY / 3 + i * 10) * 10;
                            var tempSinY = Math.sin(this.incY / 4 + i * 10) * 10;
                            var tempBounce = 1;
                            var tempDropY = 0;
                            if (this.multiState == 1 && Math.floor(curLevel / 3) == (3 - i)) {
                                tempId = i;
                                this.renderFlare(canvas.width / 2 + 75 - (i % 2) * 150, canvas.height / 2 - 225 + 150 * i, 3);
                                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                                var tempScale = (2 + Math.sin(this.incY / 2) / 4);
                                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale + 75 - (i % 2) * 150, canvas.height / 2 - (bHeight / 2) * tempScale - 225 + 150 * i, bWidth * tempScale, bHeight * tempScale);
                                tempBounce = this.charX0;
                            }
                            else if (i - (3 - Math.floor(curLevel / 3)) > 1) {
                                continue;
                            }
                            else if (3 - Math.floor(curLevel / 3) < i) {
                                tempId = i;
                                tempDropY = this.posY4;
                            }
                            else {
                                tempId = 4;
                            }
                            if (tempDropY != 500) {
                                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["teamPanel" + tempId]].x;
                                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["teamPanel" + tempId]].y;
                                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["teamPanel" + tempId]].width;
                                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["teamPanel" + tempId]].height;
                                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempBounce + 75 - (i % 2) * 150 + tempSinX, canvas.height / 2 - (bHeight / 2) * tempBounce - 225 + 150 * i - tempSinY + this["posY" + i] + tempDropY, bWidth * tempBounce, bHeight * tempBounce);
                                var tempWiggle;
                                for (var j = 0; j < 3; j++) {
                                    if (this.multiState == 1 && Math.floor(curLevel / 3) == (3 - i)) {
                                        tempId = j + Math.floor(curLevel / 3) * 3;
                                        tempWiggle = Math.abs(Math.sin(this.incY + j) * 10);
                                    }
                                    else if (3 - Math.floor(curLevel / 3) < i) {
                                        tempId = curLevel - 3 + j;
                                        tempWiggle = 0;
                                    }
                                    else {
                                        tempId = 19;
                                        tempWiggle = 0;
                                    }
                                    if (curChar < 3 && curLevel < 3 && tempId != 19) {
                                        tempId += 13;
                                    }
                                    else if (curChar < 16 && curLevel > 8 && tempId != 19 && charVersion == 1) {
                                        tempId += 7;
                                    }
                                    tempId = checkCharId(tempId);
                                    var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].x;
                                    var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].y;
                                    var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].width;
                                    var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].height;
                                    ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) - 35 - (i % 2) * 150 + j * 110 + tempSinX + aCharIcons[tempId].offsetX * .3, canvas.height / 2 - (bHeight / 2) - 200 + 150 * i - tempSinY + this["posY" + i] + aCharIcons[tempId].offsetY * .3 - tempWiggle + tempDropY, bWidth, bHeight);
                                    if (i == 0) {
                                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.happyCup].x;
                                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.happyCup].y;
                                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.happyCup].width;
                                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.happyCup].height;
                                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempBounce + 75 - (i % 2) * 150 + tempSinX + 165, canvas.height / 2 - (bHeight / 2) * tempBounce - 225 + 150 * i - tempSinY + this["posY" + i] + tempDropY - 70, bWidth, bHeight);
                                    }
                                }
                                if (this.multiState == 1 && Math.floor(curLevel / 3) == (3 - i)) {
                                    tempId = (3 - i);
                                    if (curChar < 3 && i == 3) {
                                        tempId = 4;
                                    }
                                    else if (curChar < 16 && i == 0 && charVersion == 1) {
                                        tempId = 5;
                                    }
                                    addText(1, 40, 320, "left", canvas.width / 2 - 80 - (i % 2) * 150 + tempSinX, canvas.height / 2 - 282 + 150 * i - tempSinY + this["posY" + i] + tempDropY, "team" + tempId, "#ffffff");
                                }
                                else {
                                    addText(1, 40, 320, "left", canvas.width / 2 - 80 - (i % 2) * 150 + tempSinX, canvas.height / 2 - 282 + 150 * i - tempSinY + this["posY" + i] + tempDropY, "teamNum" + (3 - i), "#ffffff");
                                }
                            }
                        }
                    }
                    break;
                case "teamIntro":
                    this.renderFlare(canvas.width / 2, canvas.height / 2 - 50, 3);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                    var tempScale = (2 + Math.sin(this.incY / 2) / 4) * (1 - this.posY3 / 500);
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale, canvas.height / 2 - (bHeight / 2) * tempScale - 50, bWidth * tempScale, bHeight * tempScale);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 42 - bHeight / 2 - this.butsY, bWidth, bHeight);
                    var tempId = Math.floor(curLevel / 3);
                    if (curChar < 3 && curLevel < 3) {
                        tempId = 4;
                    }
                    else if (curChar < 16 && curLevel > 8 && charVersion == 1) {
                        tempId = 5;
                    }
                    addText(1, 40, 350, "center", canvas.width / 2, 55 - this.butsY, "team" + tempId, "#000000");
                    for (var j = 0; j < 3; j++) {
                        if (this["posY" + j] < 500) {
                            tempId = j + Math.floor(curLevel / 3) * 3;
                            var tempSinX = Math.sin(this.incY / 3 + j * 10) * 10;
                            var tempSinY = Math.sin(this.incY / 4 + j * 10) * 10;
                            if (curChar < 3 && curLevel < 3) {
                                tempId += 13;
                            }
                            else if (curChar < 16 && curLevel > 8 && charVersion == 1) {
                                tempId += 7;
                            }
                            else {
                                tempId = checkCharId(tempId);
                            }
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + this["charX" + j] - (bWidth / 2) * this["scale" + j] + tempSinX, canvas.height / 2 + this["posY" + j] - (bHeight / 2) * this["scale" + j] - tempSinY, bWidth * this["scale" + j], bHeight * this["scale" + j]);
                        }
                    }
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["lineTextPanel" + aCharIcons[tempId = Math.floor(curLevel / 3) * 3].panelId + "0"]].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["lineTextPanel" + aCharIcons[tempId = Math.floor(curLevel / 3) * 3].panelId + "0"]].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["lineTextPanel" + aCharIcons[tempId = Math.floor(curLevel / 3) * 3].panelId + "0"]].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["lineTextPanel" + aCharIcons[tempId = Math.floor(curLevel / 3) * 3].panelId + "0"]].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, 0, canvas.height - 290 + this.posY3, canvas.width, bHeight);
                    var tempId = Math.floor(curLevel / 3);
                    if (curChar < 3 && curLevel < 3) {
                        tempId = Math.floor((curLevel + 13) / 3);
                    }
                    addText(2, 40, canvas.width - 40, "center", canvas.width / 2, canvas.height - 186 + this.posY3, "teamIntro" + tempId, "#000000");
                    break;
                case "teamOutro":
                    var tempCurLevel = curLevel - 1;
                    this.renderFlare(canvas.width / 2, canvas.height / 2 - 50, 3);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                    var tempScale = (2 + Math.sin(this.incY / 2) / 4) * (1 - this.posY3 / 500);
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale, canvas.height / 2 - (bHeight / 2) * tempScale - 50, bWidth * tempScale, bHeight * tempScale);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 42 - bHeight / 2 - this.butsY, bWidth, bHeight);
                    addText(1, 40, 350, "center", canvas.width / 2, 55 - this.butsY, "team" + Math.floor(tempCurLevel / 3), "#000000");
                    for (var j = 0; j < 3; j++) {
                        if (this["posY" + j] < 500) {
                            tempId = j + Math.floor(tempCurLevel / 3) * 3;
                            var tempSinX = Math.sin(this.incY / 3 + j * 10) * 10;
                            var tempSinY = Math.sin(this.incY / 4 + j * 10) * 10;
                            tempId = checkCharId(tempId);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + this["charX" + j] - (bWidth / 2) * this["scale" + j] + tempSinX, canvas.height / 2 + this["posY" + j] - (bHeight / 2) * this["scale" + j] - tempSinY, bWidth * this["scale" + j], bHeight * this["scale" + j]);
                        }
                    }
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["lineTextPanel" + aCharIcons[tempId = Math.floor(tempCurLevel / 3) * 3].panelId + "0"]].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["lineTextPanel" + aCharIcons[tempId = Math.floor(tempCurLevel / 3) * 3].panelId + "0"]].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["lineTextPanel" + aCharIcons[tempId = Math.floor(tempCurLevel / 3) * 3].panelId + "0"]].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["lineTextPanel" + aCharIcons[tempId = Math.floor(tempCurLevel / 3) * 3].panelId + "0"]].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, 0, canvas.height - 290 + this.posY3, canvas.width, bHeight);
                    addText(2, 40, canvas.width - 40, "center", canvas.width / 2, canvas.height - 186 + this.posY3, "teamOutro" + Math.floor(tempCurLevel / 3), "#000000");
                    break;
                case "gameIntro":
                    var tempCurChar = curChar;
                    var tempOpChar = checkCharId(opChar);
                    if (this.chatOrder == 0) {
                        if (this.chatFlip) {
                            tempCurChar = checkCharId(opChar);
                            tempOpChar = curChar;
                        }
                    }
                    else {
                        if (!this.chatFlip) {
                            tempCurChar = checkCharId(opChar);
                            tempOpChar = curChar;
                        }
                    }
                    this.renderFlare(canvas.width / 2, canvas.height / 2 - 50, 3);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                    var tempScale = (1 + Math.sin(this.incY / 2) / 4) * this.charX1;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale - 90, canvas.height * .4 - (bHeight / 2) * tempScale + 103, bWidth * tempScale, bHeight * tempScale);
                    tempScale = (Math.sin(this.incY / 2) * 3);
                    var tempIconScale = .9;
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempCurChar]].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempCurChar]].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempCurChar]].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempCurChar]].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[tempCurChar].offsetX - (tempScale / 2) * tempIconScale - 120 - this.charX0, canvas.height * .45 - (bHeight / 2) * tempIconScale + aCharIcons[tempCurChar].offsetY + (tempScale / 2) * tempIconScale - 170, (bWidth + tempScale) * tempIconScale, (bHeight - tempScale) * tempIconScale);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + tempCurChar]].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + tempCurChar]].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + tempCurChar]].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + tempCurChar]].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - 10 - this.charX0 * 2, canvas.height * .45 - bHeight / 2 - 80 - Math.abs(Math.sin(this.incY / 2 + 1) * 15), bWidth, bHeight);
                    if (this.charX2 < 500) {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempOpChar]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempOpChar]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempOpChar]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempOpChar]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[tempOpChar].offsetX + (tempScale / 2) * tempIconScale + 110 + this.charX2, canvas.height * .45 - (bHeight / 2) * tempIconScale + aCharIcons[tempOpChar].offsetY - (tempScale / 2) * tempIconScale + 140, (bWidth - tempScale) * tempIconScale, (bHeight + tempScale) * tempIconScale);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + tempOpChar]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + tempOpChar]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + tempOpChar]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + tempOpChar]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - 20 + this.charX2 * 2, canvas.height * .45 - bHeight / 2 + 235 - Math.abs(Math.sin(this.incY / 2) * 15), bWidth, bHeight);
                    }
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.vs].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.vs].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.vs].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.vs].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * this.charX1 - 90, canvas.height * .4 - (bHeight / 2) * this.charX1 + 103, bWidth * this.charX1, bHeight * this.charX1);
                    break;
                case "game":
                    if (this.posY0 != 500) {
                        ctx.fillStyle = "rgba(255, 255, 255, " + (this.posY3 / 2) + ")";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    var tempId = curChar;
                    if (whosGo == 1) {
                        tempId = checkCharId(opChar);
                    }
                    var scoreX = canvas.width / 2 - 175;
                    var tempTourn = Math.min(Math.floor(curLevel / 3), 2);
                    if (gameType == 1) {
                        tempTourn = 2;
                    }
                    var tempScale = .7;
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.headerTextPanel].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, (canvas.width + Math.min(canvas.width - 670, 0)) / 2 - bWidth / 2, 42 - bHeight / 2 - this.posY1, bWidth, bHeight);
                    if (gameType == 2) {
                        addText(1, 40, 350, "center", (canvas.width + Math.min(canvas.width - 670, 0)) / 2, 55 - this.posY1, "level" + challengeLevel, "#000000");
                    }
                    else {
                        tempScale = .65;
                        var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].x;
                        var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].y;
                        var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].width;
                        var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].height;
                        ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, (canvas.width + Math.min(canvas.width - 670, 0)) / 2 - bWidth / 2 * tempScale, 42 - this.posY1 - bHeight / 2 * tempScale, bWidth * tempScale, bHeight * tempScale);
                    }
                    if (playerNum == 2) {
                        if (whosGo == 0) {
                            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon1].x;
                            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon1].y;
                            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon1].width;
                            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon1].height;
                            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 100 - bHeight / 2 - this.posY1 * 1.3, bWidth, bHeight);
                        }
                        else {
                            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon2].x;
                            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon2].y;
                            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon2].width;
                            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon2].height;
                            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 100 - bHeight / 2 - this.posY1 * 1.3, bWidth, bHeight);
                        }
                    }
                    if (this.posY0 != 500) {
                        this.renderFlare(canvas.width / 2, canvas.height * .4, 3 * this.posY3);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                        var tempScale0 = (1.8 + Math.sin(this.incY / 2) / 4);
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale0 * this.posY3, canvas.height * .4 - (bHeight / 2) * tempScale0 * this.posY3, bWidth * tempScale0 * this.posY3, bHeight * tempScale0 * this.posY3);
                        if (this.scoreResult == 0 || (gameType == 2 && challengeLives <= 0)) {
                            var bX = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.loseHeart].x;
                            var bY = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.loseHeart].y;
                            var bWidth = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.loseHeart].width;
                            var bHeight = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.loseHeart].height;
                            ctx.drawImage(this.oScoreElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) + this.posY0, canvas.height * .48 - (bHeight / 2), bWidth, bHeight);
                            if (gameType != 2) {
                                var tempIconScale = .65;
                                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[curChar].offsetX * tempIconScale - this.posY0, canvas.height * .48 - (bHeight / 2) * tempIconScale + aCharIcons[curChar].offsetY * tempIconScale - 160, bWidth * tempIconScale, bHeight * tempIconScale);
                            }
                            if (gameType == 2) {
                                if (challengeLives <= 0) {
                                }
                                else {
                                }
                            }
                            else {
                            }
                        }
                        else if (this.scoreResult < 10) {
                            var tempOffsetX = 100;
                            if (gameType == 2) {
                                tempOffsetX = 0;
                            }
                            var bX = this.oScoreElementsImgData.oData.oAtlasData[oImageIds["scoreBg" + Math.floor((3.9 / 9) * this.scoreResult)]].x;
                            var bY = this.oScoreElementsImgData.oData.oAtlasData[oImageIds["scoreBg" + Math.floor((3.9 / 9) * this.scoreResult)]].y;
                            var bWidth = this.oScoreElementsImgData.oData.oAtlasData[oImageIds["scoreBg" + Math.floor((3.9 / 9) * this.scoreResult)]].width;
                            var bHeight = this.oScoreElementsImgData.oData.oAtlasData[oImageIds["scoreBg" + Math.floor((3.9 / 9) * this.scoreResult)]].height;
                            ctx.drawImage(this.oScoreElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) + tempOffsetX + this.posY0, canvas.height * .5 - (bHeight / 2), bWidth, bHeight);
                            addDirectText(1, 170, "center", canvas.width / 2 + tempOffsetX - 10 + this.posY0, canvas.height * .5 + 60, this.scoreResult.toString(), "#FFFFFF");
                            var bX = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.scorePins].x;
                            var bY = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.scorePins].y;
                            var bWidth = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.scorePins].width;
                            var bHeight = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.scorePins].height;
                            ctx.drawImage(this.oScoreElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2), canvas.height * .5 - (bHeight / 2) - this.posY0 - 205, bWidth, bHeight);
                            if (gameType != 2) {
                                var tempIconScale = .73;
                                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[curChar].offsetX * tempIconScale - 100 - this.posY0, canvas.height * .5 - (bHeight / 2) * tempIconScale + aCharIcons[curChar].offsetY * tempIconScale, bWidth * tempIconScale, bHeight * tempIconScale);
                            }
                        }
                        else if (this.scoreResult == 10 || this.scoreResult == 11) {
                            var bX = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.resultBg0].x;
                            var bY = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.resultBg0].y;
                            var bWidth = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.resultBg0].width;
                            var bHeight = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.resultBg0].height;
                            ctx.drawImage(this.oScoreElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) + this.posY0, canvas.height * .55 - (bHeight / 2), bWidth, bHeight);
                            var bX = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.strikePins].x;
                            var bY = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.strikePins].y;
                            var bWidth = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.strikePins].width;
                            var bHeight = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.strikePins].height;
                            ctx.drawImage(this.oScoreElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2), canvas.height * .55 - (bHeight / 2) - this.posY0 - 225, bWidth, bHeight);
                            var tempIconScale = .65;
                            if (gameType == 2) {
                                tempId = 99;
                            }
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[curChar].offsetX * tempIconScale - this.posY0, canvas.height * .55 - (bHeight / 2) * tempIconScale + aCharIcons[curChar].offsetY * tempIconScale - 160, bWidth * tempIconScale, bHeight * tempIconScale);
                            if (this.scoreResult == 10 && gameType != 2) {
                                addText(1, 120, 475, "center", canvas.width / 2 + this.posY0, canvas.height * .55 + 42, "strike", "#FFFFFF");
                            }
                            else {
                                if (gameType == 2) {
                                }
                                else {
                                    addText(1, 120, 475, "center", canvas.width / 2 + this.posY0, canvas.height * .55 + 42, "spare", "#FFFFFF");
                                }
                            }
                        }
                        else {
                            var bX = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.resultBg0].x;
                            var bY = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.resultBg0].y;
                            var bWidth = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.resultBg0].width;
                            var bHeight = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.resultBg0].height;
                            ctx.drawImage(this.oScoreElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) + this.posY0, canvas.height * .48 - (bHeight / 2), bWidth, bHeight);
                            var bX = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.splitPins].x;
                            var bY = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.splitPins].y;
                            var bWidth = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.splitPins].width;
                            var bHeight = this.oScoreElementsImgData.oData.oAtlasData[oImageIds.splitPins].height;
                            ctx.drawImage(this.oScoreElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2), canvas.height * .55 - (bHeight / 2) - this.posY0 - 200, bWidth, bHeight);
                            var tempIconScale = .65;
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[curChar].offsetX * tempIconScale - this.posY0, canvas.height * .48 - (bHeight / 2) * tempIconScale + aCharIcons[curChar].offsetY * tempIconScale - 160, bWidth * tempIconScale, bHeight * tempIconScale);
                            addText(1, 120, 475, "center", canvas.width / 2 + this.posY0, canvas.height * .48 + 42, "split", "#FFFFFF");
                        }
                        if (gameType != 2) {
                            if (tempTourn == 1) {
                                scoreX = canvas.width / 2 - 230;
                            }
                            else if (tempTourn == 2) {
                                scoreX = canvas.width / 2 - 272;
                            }
                            tempId = checkCharId(opChar);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63, canvas.height * .7 + 60 + this.posY0, bWidth, bHeight);
                            tempId = curChar;
                            var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].x;
                            var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].y;
                            var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].width;
                            var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].height;
                            ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, scoreX - 2 + (aCharIcons[tempId].offsetX * .3) * tempScale, canvas.height * .7 + 14 + (aCharIcons[tempId].offsetY * .3) * tempScale + this.posY0, bWidth * tempScale, bHeight * tempScale);
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63, canvas.height * .7 + this.posY0, bWidth, bHeight);
                            tempId = checkCharId(opChar);
                            var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].x;
                            var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].y;
                            var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].width;
                            var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].height;
                            ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, scoreX - 2 + (aCharIcons[tempId].offsetX * .3) * tempScale, canvas.height * .7 + 74 + (aCharIcons[tempId].offsetY * .3) * tempScale + this.posY0, bWidth * tempScale, bHeight * tempScale);
                            this.displayScores(scoreX + 63, canvas.height * .7 + this.posY0);
                        }
                    }
                    if (firstGoState == 0) {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        var bX = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tut0Bg].x;
                        var bY = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tut0Bg].y;
                        var bWidth = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tut0Bg].width;
                        var bHeight = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tut0Bg].height;
                        ctx.drawImage(this.oTutElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, canvas.height / 2 - bHeight / 2 - this.charX0 - 75, bWidth, bHeight);
                        this.tutAnim0.x = canvas.width / 2 - 12;
                        this.tutAnim0.y = canvas.height / 2 - this.charX0 - 75;
                        this.tutAnim0.update();
                        this.tutAnim0.render();
                    }
                    else if (firstGoState == 2) {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        this.tutAnim0.x = canvas.width / 2;
                        this.tutAnim0.y = canvas.height / 2 - this.charX0 - 75;
                        this.tutAnim0.update();
                        this.tutAnim0.render();
                        var bX = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tutBall].x;
                        var bY = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tutBall].y;
                        var bWidth = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tutBall].width;
                        var bHeight = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tutBall].height;
                        ctx.drawImage(this.oTutElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + this.posY2, canvas.height / 2 - bHeight / 2 - this.charX0 - 75, bWidth, bHeight);
                        if (hasTilt) {
                            var bX = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tiltPhone].x;
                            var bY = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tiltPhone].y;
                            var bWidth = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tiltPhone].width;
                            var bHeight = this.oTutElementsImgData.oData.oAtlasData[oImageIds.tiltPhone].height;
                            ctx.save();
                            ctx.translate(canvas.width / 2, canvas.height / 2 + 80 - this.charX0);
                            ctx.rotate(-this.swerveControlId + .5);
                            ctx.drawImage(this.oTutElementsImgData.img, bX, bY, bWidth, bHeight, -bWidth / 2, -bHeight / 2, bWidth, bHeight);
                            ctx.restore();
                        }
                        else if (!hasTilt && isMobile) {
                            var bX = this.oTutElementsImgData.oData.oAtlasData[oImageIds["tapPhone" + Math.round(this.swerveControlId)]].x;
                            var bY = this.oTutElementsImgData.oData.oAtlasData[oImageIds["tapPhone" + Math.round(this.swerveControlId)]].y;
                            var bWidth = this.oTutElementsImgData.oData.oAtlasData[oImageIds["tapPhone" + Math.round(this.swerveControlId)]].width;
                            var bHeight = this.oTutElementsImgData.oData.oAtlasData[oImageIds["tapPhone" + Math.round(this.swerveControlId)]].height;
                            var tempOffsetX = 42;
                            if (Math.round(this.swerveControlId) == 1) {
                                tempOffsetX *= -1;
                            }
                            ctx.drawImage(this.oTutElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + tempOffsetX, canvas.height / 2 - bHeight / 2 + 80 - this.charX0, bWidth, bHeight);
                        }
                        else {
                            var bX = this.oTutElementsImgData.oData.oAtlasData[oImageIds["arrowKey" + Math.round(this.swerveControlId)]].x;
                            var bY = this.oTutElementsImgData.oData.oAtlasData[oImageIds["arrowKey" + Math.round(this.swerveControlId)]].y;
                            var bWidth = this.oTutElementsImgData.oData.oAtlasData[oImageIds["arrowKey" + Math.round(this.swerveControlId)]].width;
                            var bHeight = this.oTutElementsImgData.oData.oAtlasData[oImageIds["arrowKey" + Math.round(this.swerveControlId)]].height;
                            ctx.drawImage(this.oTutElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, canvas.height / 2 - bHeight / 2 + 85 - this.charX0, bWidth, bHeight);
                        }
                    }
                    if (gameType == 2) {
                        var tempScale = .75;
                        for (var i = 0; i < 5; i++) {
                            var tempId = 0;
                            if (i >= challengeLives) {
                                tempId = 1;
                            }
                            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["heart" + tempId]].x;
                            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["heart" + tempId]].y;
                            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["heart" + tempId]].width;
                            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["heart" + tempId]].height;
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, 10 + i * 50, canvas.height - 60 - this.butsY, bWidth * tempScale, bHeight * tempScale);
                        }
                        tempScale = .6;
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + 1]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + 1]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + 1]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + 1]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, -50 - this.butsY, 85, bWidth * tempScale, bHeight * tempScale);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + 0]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + 0]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + 0]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["namePanel" + 0]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, (canvas.width - bWidth * tempScale) + 50 + this.butsY, 85, bWidth * tempScale, bHeight * tempScale);
                        addDirectText(1, 30, "left", 15 - this.butsY, 115, oChallengeScore.total.toString(), "#FFFFFF");
                        var temp = saveDataHandler.getChallengeHighScore();
                        addDirectText(1, 30, "right", canvas.width - 40 + this.butsY - 1, 115 + 1, temp.toString(), "#000000");
                        addDirectText(1, 30, "right", canvas.width - 40 + this.butsY + 1, 115 - 1, temp.toString(), "#FFFFFF");
                        addDirectText(1, 30, "right", canvas.width - 40 + this.butsY, 115, temp.toString(), "#FFC401");
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.crown].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.crown].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.crown].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.crown].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width - 30 + this.butsY, 94, bWidth, bHeight);
                        if (this.posY0 != 500 && (challengeAttempts < 0 || challengeLives <= 0)) {
                            var aTempCols = new Array("#00A853", "#2E89EE", "#C45BF2", "#FFC401");
                            if (challengeLives <= 0) {
                                addDirectText(1, 150, "center", canvas.width / 2 + this.posY0 - 3, canvas.height * .55 + 210 + 3, oChallengeScore.total.toString(), "#000000");
                                addDirectText(1, 150, "center", canvas.width / 2 + this.posY0 + 3, canvas.height * .55 + 210 - 3, oChallengeScore.total.toString(), "#FFFFFF");
                                addDirectText(1, 150, "center", canvas.width / 2 + this.posY0, canvas.height * .55 + 210, oChallengeScore.total.toString(), aTempCols[3]);
                            }
                            else if (challengeAttempts < 0) {
                                var tempScale = .52;
                                var tempScore = Math.round(this.scoreScroll);
                                addDirectText(1, 150, "center", canvas.width / 2 + this.posY0 + 3, canvas.height * .55 + 60 - 3, tempScore.toString(), "#FFFFFF");
                            }
                        }
                    }
                    break;
                case "gameOver":
                    var tempOpChar = checkCharId(opChar);
                    if (oCurGameScores.totalScore >= oOpGameScores.totalScore) {
                        this.renderFlare(canvas.width / 2, canvas.height * .25 + this.posY0, 3);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                        var tempScale = (1.8 + Math.sin(this.incY / 2) / 4);
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale - this.posY0 / 4, canvas.height * .25 - (bHeight / 2) * tempScale + this.posY0, bWidth * tempScale, bHeight * tempScale);
                        tempScale = (Math.sin(this.incY / 2) * 3);
                        var tempIconScale = 1;
                        var tempId = curChar;
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[curChar].offsetX - (tempScale / 2) * tempIconScale - this.posY0 / 4, canvas.height * .3 - (bHeight / 2) * tempIconScale + aCharIcons[curChar].offsetY + (tempScale / 2) * tempIconScale + this.posY0, (bWidth + tempScale) * tempIconScale, (bHeight - tempScale) * tempIconScale);
                        tempId = curChar;
                        var scoreX = canvas.width / 2 - 175;
                        var tempTourn = Math.min(Math.floor(curLevel / 3), 2);
                        if (gameType == 1) {
                            tempTourn = 2;
                        }
                        var tempScale = .7;
                        if (tempTourn == 1) {
                            scoreX = canvas.width / 2 - 230;
                        }
                        else if (tempTourn == 2) {
                            scoreX = canvas.width / 2 - 272;
                        }
                        var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].x;
                        var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].y;
                        var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].width;
                        var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].height;
                        ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, scoreX - 2 + (aCharIcons[tempId].offsetX * .3) * tempScale + this.posY2 / 4, canvas.height * .6 + 14 + (aCharIcons[tempId].offsetY * .3) * tempScale + this.posY2, bWidth * tempScale, bHeight * tempScale);
                        tempId = checkCharId(opChar);
                        var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].x;
                        var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].y;
                        var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].width;
                        var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].height;
                        ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, scoreX - 2 + (aCharIcons[tempId].offsetX * .3) * tempScale + this.posY2 / 4, canvas.height * .6 + 74 + (aCharIcons[tempId].offsetY * .3) * tempScale + this.posY2, bWidth * tempScale, bHeight * tempScale);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63 + this.posY2 / 4, canvas.height * .6 + 60 + this.posY2, bWidth, bHeight);
                        if (Math.floor(this.incY / 3) % 2 == 0) {
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63 + this.posY2 / 4, canvas.height * .6 + this.posY2, bWidth, bHeight);
                        }
                        tempId = curChar;
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63 + this.posY2 / 4, canvas.height * .6 + this.posY2, bWidth, bHeight);
                        tempId = opChar;
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].height;
                        if (Math.floor(this.incY / 3) % 2 == 0) {
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63 + this.posY2 / 4, canvas.height * .6 + this.posY2, bWidth, bHeight);
                        }
                        this.displayScores(scoreX + 63 + this.posY2 / 4, canvas.height * .6 + this.posY2);
                    }
                    else if (playerNum == 1) {
                        this.renderFlare(canvas.width / 2, canvas.height * .25 + this.posY0, 3);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                        var tempScale = (1.8 + Math.sin(this.incY / 2) / 4);
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale - this.posY0 / 4, canvas.height * .25 - (bHeight / 2) * tempScale + this.posY0, bWidth * tempScale, bHeight * tempScale);
                        tempScale = (Math.sin(this.incY / 2) * 3);
                        var tempIconScale = 1;
                        var tempId = checkCharId(opChar);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[curChar].offsetX - (tempScale / 2) * tempIconScale - this.posY0 / 4, canvas.height * .3 - (bHeight / 2) * tempIconScale + aCharIcons[curChar].offsetY + (tempScale / 2) * tempIconScale + this.posY0, (bWidth + tempScale) * tempIconScale, (bHeight - tempScale) * tempIconScale);
                        tempId = curChar;
                        var scoreX = canvas.width / 2 - 175;
                        var tempTourn = Math.min(Math.floor(curLevel / 3), 2);
                        if (gameType == 1) {
                            tempTourn = 2;
                        }
                        var tempScale = .7;
                        if (tempTourn == 1) {
                            scoreX = canvas.width / 2 - 230;
                        }
                        else if (tempTourn == 2) {
                            scoreX = canvas.width / 2 - 272;
                        }
                        var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].x;
                        var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].y;
                        var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].width;
                        var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].height;
                        ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, scoreX - 2 + (aCharIcons[tempId].offsetX * .3) * tempScale + this.posY2 / 4, canvas.height * .6 + 14 + (aCharIcons[tempId].offsetY * .3) * tempScale + this.posY2, bWidth * tempScale, bHeight * tempScale);
                        tempId = checkCharId(opChar);
                        var bX = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].x;
                        var bY = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].y;
                        var bWidth = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].width;
                        var bHeight = this.oUiButsImgData.oData.oAtlasData[oImageIds["smallIcon" + tempId]].height;
                        ctx.drawImage(this.oUiButsImgData.img, bX, bY, bWidth, bHeight, scoreX - 2 + (aCharIcons[tempId].offsetX * .3) * tempScale + this.posY2 / 4, canvas.height * .6 + 74 + (aCharIcons[tempId].offsetY * .3) * tempScale + this.posY2, bWidth * tempScale, bHeight * tempScale);
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + getOpPanelId(tempId).toString() + tempTourn.toString()]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63 + this.posY2 / 4, canvas.height * .6 + 60 + this.posY2, bWidth, bHeight);
                        tempId = curChar;
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["scorePanel" + aCharIcons[tempId].panelId.toString() + tempTourn.toString()]].height;
                        if (Math.floor(this.incY / 3) % 2 == 0) {
                            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63 + this.posY2 / 4, canvas.height * .6 + 60 + this.posY2, bWidth, bHeight);
                        }
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, scoreX + 63 + this.posY2 / 4, canvas.height * .6 + this.posY2, bWidth, bHeight);
                        this.displayScores(scoreX + 63 + this.posY2 / 4, canvas.height * .6 + this.posY2);
                    }
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.winnerBadge].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.winnerBadge].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.winnerBadge].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.winnerBadge].height;
                    var tempScale = (1 + Math.sin(this.incY / 2) / 12);
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale - this.posY0 / 4 + 130, canvas.height * .25 - (bHeight / 2) * tempScale + this.posY0 + 140, bWidth * tempScale, bHeight * tempScale);
                    break;
                case "cupWinner":
                    this.renderFlare(canvas.width / 2, canvas.height * .25 + this.posY0, 3);
                    var tempId = 0;
                    var tempHeight = .65;
                    if (gameType == 2) {
                        tempId = 1;
                        tempHeight = .35;
                        addDirectText(1, 150, "center", canvas.width / 2 + this.posY0 - 3, canvas.height * .55 + 180 + 3, oChallengeScore.total.toString(), "#000000");
                        addDirectText(1, 150, "center", canvas.width / 2 + this.posY0 + 3, canvas.height * .55 + 180 - 3, oChallengeScore.total.toString(), "#FFFFFF");
                        addDirectText(1, 150, "center", canvas.width / 2 + this.posY0, canvas.height * .55 + 180, oChallengeScore.total.toString(), "#FFC401");
                    }
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                    var tempScale = (1.8 + Math.sin(this.incY / 2) / 4);
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale, canvas.height * tempHeight - (bHeight / 2) * tempScale + this.posY0 * 2, bWidth * tempScale, bHeight * tempScale);
                    tempScale = (Math.sin(this.incY / 2) * 3);
                    var tempIconScale = 1;
                    var tempId = curChar;
                    if (gameType != 2) {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["largeIcon" + tempId]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempIconScale + aCharIcons[curChar].offsetX - (tempScale / 2) * tempIconScale, canvas.height * .25 - (bHeight / 2) * tempIconScale + aCharIcons[curChar].offsetY + (tempScale / 2) * tempIconScale + this.posY0, (bWidth + tempScale) * tempIconScale, (bHeight - tempScale) * tempIconScale);
                    }
                    var ballInFront = true;
                    if (this.prevBallSin - Math.sin(this.incY * .3) > 0) {
                        ballInFront = false;
                    }
                    if (!ballInFront) {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + Math.sin(this.incY * .3) * 200, canvas.height * tempHeight - bHeight / 2 + this.posY0, bWidth, bHeight);
                    }
                    ctx.save();
                    ctx.translate(canvas.width / 2, canvas.height * tempHeight + this.posY0 * 2);
                    ctx.rotate(Math.sin(this.incY * .5) * .5);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.winnersCup].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.winnersCup].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.winnersCup].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.winnersCup].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, -bWidth / 2, -bHeight / 2, bWidth, bHeight);
                    ctx.restore();
                    if (ballInFront) {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["ballIcon" + curChar]].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 + Math.sin(this.incY * .3) * 200, canvas.height * tempHeight - bHeight / 2 + this.posY0, bWidth, bHeight);
                    }
                    this.prevBallSin = Math.sin(this.incY * .3);
                    break;
                case "pause":
                    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    break;
            }
            if (_butsOnTop) {
                this.addButs(ctx);
            }
            ctx.fillStyle = "rgba(255,255, 255," + this.flashInc + ")";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        Panel.prototype.displayScores = function (_x, _y) {
            var tempTotal = 0;
            for (var i = 0; i < oCurGameScores.aFrameScores.length; i++) {
                for (var j = 0; j < oCurGameScores.aFrameScores[i].length; j++) {
                    this.displayScoreLine(oCurGameScores, _x, _y, i, j, 0);
                }
                var temp = this.getFrameTotal(oCurGameScores, i);
                if (temp > -1) {
                    tempTotal += temp;
                    oCurGameScores.totalScore = tempTotal;
                    addDirectText(2, 25, "center", _x + i * 55.4 + 34, _y + 71 + 0, tempTotal.toString(), "#000000");
                }
            }
            tempTotal = 0;
            for (var i = 0; i < oOpGameScores.aFrameScores.length; i++) {
                for (var j = 0; j < oOpGameScores.aFrameScores[i].length; j++) {
                    this.displayScoreLine(oOpGameScores, _x, _y, i, j, 60);
                }
                var temp = this.getFrameTotal(oOpGameScores, i);
                if (temp > -1) {
                    tempTotal += temp;
                    oOpGameScores.totalScore = tempTotal;
                    addDirectText(2, 25, "center", _x + i * 55.4 + 34, _y + 71 + 60, tempTotal.toString(), "#000000");
                }
            }
        };
        Panel.prototype.displayScoreLine = function (_oData, _x, _y, i, j, _addY) {
            if (_addY === void 0) { _addY = 0; }
            if (j == 0 && _oData.aFrameScores[i][j] == 10) {
                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.strikeMark].x;
                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.strikeMark].y;
                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.strikeMark].width;
                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.strikeMark].height;
                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, _x - bWidth / 2 + i * 55.4 + j * 27.7 + 21, _y - bHeight / 2 + 36 + _addY, bWidth, bHeight);
            }
            else if (i == aCharIcons[curLevel].frames - 1) {
                if (j == 1 && (_oData.aFrameScores[i][0] + _oData.aFrameScores[i][1] == 10 && _oData.aFrameScores[i][0] != 10)) {
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.spareMark].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.spareMark].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.spareMark].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.spareMark].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, _x - bWidth / 2 + i * 55.4 + j * 27.7 + 21, _y - bHeight / 2 + 36 + _addY, bWidth, bHeight);
                }
                else if ((j == 1 || j == 2) && _oData.aFrameScores[i][j] == 10) {
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.strikeMark].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.strikeMark].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.strikeMark].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.strikeMark].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, _x - bWidth / 2 + i * 55.4 + j * 27.7 + 21, _y - bHeight / 2 + 36 + _addY, bWidth, bHeight);
                }
                else if (_oData.aFrameScores[i][j] == 0) {
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.missMark].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.missMark].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.missMark].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.missMark].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, _x - bWidth / 2 + i * 55.4 + j * 27.7 + 21, _y - bHeight / 2 + 36 + _addY, bWidth, bHeight);
                }
                else {
                    addDirectText(2, 19, "center", _x + i * 55.4 + j * 27.7 + 20, _y + 43 + _addY, _oData.aFrameScores[i][j], "#000000");
                }
            }
            else if (j == 1 && (_oData.aFrameScores[i][0] + _oData.aFrameScores[i][1] == 10 && _oData.aFrameScores[i][0] != 10)) {
                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.spareMark].x;
                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.spareMark].y;
                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.spareMark].width;
                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.spareMark].height;
                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, _x - bWidth / 2 + i * 55.4 + j * 27.7 + 21, _y - bHeight / 2 + 36 + _addY, bWidth, bHeight);
            }
            else if (_oData.aFrameScores[i][j] == 0) {
                var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.missMark].x;
                var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.missMark].y;
                var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.missMark].width;
                var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.missMark].height;
                ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, _x - bWidth / 2 + i * 55.4 + j * 27.7 + 21, _y - bHeight / 2 + 36 + _addY, bWidth, bHeight);
            }
            else {
                addDirectText(2, 19, "center", _x + i * 55.4 + j * 27.7 + 20, _y + 43 + _addY, _oData.aFrameScores[i][j], "#000000");
            }
        };
        Panel.prototype.getThrowResult = function () {
            var tempThrow0 = 0;
            var tempThrow1 = 0;
            var tempThrow2 = 0;
            var tempData = oCurGameScores;
            if (whosGo == 1) {
                tempData = oOpGameScores;
            }
            var aLeftPins = new Array();
            for (var i = 0; i < aLaneElements.length; i++) {
                if (!aLaneElements[i].isBall && !aLaneElements[i].hitByBall && !aLaneElements[i].hitByPin) {
                    aLeftPins.push(aLaneElements[i].id);
                }
            }
            if (gameType == 2) {
                if (aLeftPins.length == 0) {
                    if (challengeAttempts == 0) {
                        challengeAttempts = -2;
                        return 10;
                    }
                    else {
                        challengeAttempts = -2;
                        return 11;
                    }
                }
                else {
                    challengeLives--;
                    return 0;
                }
            }
            if (aLeftPins.length == 2) {
                if ((aLeftPins[0] == 0 && aLeftPins[1] == 3) || (aLeftPins[0] == 3 && aLeftPins[1] == 0)) {
                    return 12;
                }
            }
            if (tempData.aFrameScores[curFrame][0] != undefined) {
                tempThrow0 = tempData.aFrameScores[curFrame][0];
            }
            if (tempData.aFrameScores[curFrame][1] != undefined) {
                tempThrow1 = tempData.aFrameScores[curFrame][1];
            }
            if (tempData.aFrameScores[curFrame][2] != undefined) {
                tempThrow2 = tempData.aFrameScores[curFrame][2];
            }
            if (shotNum == 0) {
                return tempThrow0;
            }
            else if (curFrame < aCharIcons[curLevel].frames - 1) {
                if (tempThrow0 + tempThrow1 == 10) {
                    return 11;
                }
                else {
                    return tempThrow1;
                }
            }
            else if (shotNum == 1) {
                if (tempThrow0 != 10 && tempThrow0 + tempThrow1 == 10) {
                    return 11;
                }
                else if (tempThrow0 == 10 && tempThrow1 == 10) {
                    return 10;
                }
                else {
                    return tempThrow1;
                }
            }
            else {
                return tempThrow2;
            }
        };
        Panel.prototype.getFrameTotal = function (_oData, i) {
            var temp = 0;
            var canAddNumber = false;
            if (i < aCharIcons[curLevel].frames - 1) {
                if (_oData.aFrameScores[i][0] != undefined) {
                    temp += _oData.aFrameScores[i][0];
                }
                if (_oData.aFrameScores[i][1] != undefined) {
                    temp += _oData.aFrameScores[i][1];
                    canAddNumber = true;
                }
                if (_oData.aFrameScores[i][0] == 10) {
                    if (_oData.aFrameScores[i + 1] == undefined || _oData.aFrameScores[i + 1][1] == undefined) {
                        canAddNumber = false;
                    }
                    else if (_oData.aFrameScores[i + 1][1] != undefined) {
                        if (_oData.aFrameScores[i + 1][0] == 10) {
                            temp += _oData.aFrameScores[i + 1][0];
                            canAddNumber = false;
                            if (i == aCharIcons[curLevel].frames - 2) {
                                temp += _oData.aFrameScores[i + 1][1];
                                canAddNumber = true;
                            }
                            else if (_oData.aFrameScores[i + 2] != undefined) {
                                temp += _oData.aFrameScores[i + 2][0];
                                canAddNumber = true;
                            }
                        }
                        else {
                            temp += _oData.aFrameScores[i + 1][0];
                            temp += _oData.aFrameScores[i + 1][1];
                            canAddNumber = true;
                        }
                    }
                }
                else if (_oData.aFrameScores[i][1] != undefined && _oData.aFrameScores[i][0] + _oData.aFrameScores[i][1] == 10) {
                    if (_oData.aFrameScores[i + 1] == undefined) {
                        canAddNumber = false;
                    }
                    else {
                        temp += _oData.aFrameScores[i + 1][0];
                        canAddNumber = true;
                    }
                }
            }
            else {
                if (_oData.aFrameScores[i][0] != undefined) {
                    temp += _oData.aFrameScores[i][0];
                }
                if (_oData.aFrameScores[i][1] != undefined) {
                    temp += _oData.aFrameScores[i][1];
                    if (_oData.aFrameScores[i][0] != 10 || _oData.aFrameScores[i][1] != 10) {
                        canAddNumber = true;
                    }
                }
                if (_oData.aFrameScores[i][2] != undefined) {
                    temp += _oData.aFrameScores[i][2];
                    canAddNumber = true;
                }
            }
            if (canAddNumber) {
                return temp;
            }
            else {
                return -1;
            }
        };
        Panel.prototype.renderFlare = function (_x, _y, _scale) {
            this.flareRot += delta / 3;
            ctx.save();
            ctx.translate(_x, _y);
            ctx.rotate(this.flareRot);
            ctx.scale(_scale, _scale);
            var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeFlare].x;
            var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeFlare].y;
            var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeFlare].width;
            var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.largeFlare].height;
            ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, -bWidth / 2, -bHeight / 2, bWidth, bHeight);
            ctx.restore();
        };
        Panel.prototype.removeBut = function (_id) {
            for (var i = 0; i < this.aButs.length; i++) {
                if (this.aButs[i].id == _id) {
                    this.aButs.splice(i, 1);
                    i -= 1;
                }
            }
        };
        Panel.prototype.addButs = function (ctx) {
            var aButOver = false;
            for (var i = 0; i < this.aButs.length; i++) {
                if (this.aButs[i].isOver) {
                    aButOver = true;
                    break;
                }
            }
            for (var i = 0; i < this.aButs.length; i++) {
                var offsetPosY;
                var floatY = 0;
                if (this.incY != 0 && this.aButs[i].flash) {
                    if (this.aButs[i].isOver) {
                        floatY = Math.sin((this.incY + i * 2.5) * 2) * 3;
                    }
                    else {
                        floatY = Math.sin(this.incY + i * 2.5) * 3;
                    }
                }
                if (i % 2 == 0) {
                }
                if (!this.aButs[i].scale) {
                    this.aButs[i].scale = 1;
                }
                var bX;
                var bY;
                var bWidth;
                var bHeight;
                bX = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].x;
                bY = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].y;
                bWidth = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].width;
                bHeight = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].height;
                var aX = (canvas.width * this.aButs[i].align[0]);
                var aY = (canvas.height * this.aButs[i].align[1]);
                if (aY + this.aButs[i].aPos[1] > canvas.height / 2) {
                    offsetPosY = this.butsY;
                }
                else {
                    offsetPosY = -this.butsY;
                }
                this.aButs[i].aOverData = new Array(aX + this.aButs[i].aPos[0] - (bWidth / 2) * (this.aButs[i].scale) - floatY / 2, aY + this.aButs[i].aPos[1] - (bHeight / 2) * (this.aButs[i].scale) + offsetPosY + floatY / 2, aX + this.aButs[i].aPos[0] + (bWidth / 2) * (this.aButs[i].scale) - floatY / 2, aY + this.aButs[i].aPos[1] + (bHeight / 2) * (this.aButs[i].scale) + offsetPosY + floatY / 2);
                if (this.aButs[i].isOver && this.aButs[i].flash) {
                    var tempFlareScale = 1;
                    if (this.aButs[i].flareScale) {
                        tempFlareScale = this.aButs[i].flareScale;
                    }
                    ctx.save();
                    ctx.translate(aX + this.aButs[i].aPos[0], aY + this.aButs[i].aPos[1]);
                    ctx.scale((1 + floatY / 30) * tempFlareScale, (1 + floatY / 30) * tempFlareScale);
                    ctx.globalAlpha = 1;
                    ctx.rotate(this.incY / 10);
                    var bX0 = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].x;
                    var bY0 = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].y;
                    var bWidth0 = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].width;
                    var bHeight0 = this.oUiElementsImgData.oData.oAtlasData[oImageIds.smallFlare].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX0, bY0, bWidth0, bHeight0, -bWidth0 / 2, -bHeight0 / 2, bWidth0, bHeight0);
                    ctx.restore();
                }
                if (this.aButs[i].id == oImageIds.pauseBut) {
                    if (panel.posY0 != 500 || ball.offLane || (whosGo == 1 && throwState < 2 && playerNum == 1)) {
                        this.aButs[i].scale = 0;
                    }
                    else {
                        this.aButs[i].scale = 1;
                    }
                }
                ctx.drawImage(this.aButs[i].oImgData.img, bX, bY, bWidth, bHeight, this.aButs[i].aOverData[0], this.aButs[i].aOverData[1], bWidth * (this.aButs[i].scale) + floatY, bHeight * (this.aButs[i].scale) - floatY);
                if (this.aButs[i].isOver || this.aButs[i].flash) {
                    ctx.save();
                    if (this.aButs[i].isOver) {
                        ctx.globalAlpha = 1;
                    }
                    else {
                        if (aButOver) {
                            ctx.globalAlpha = Math.max(Math.sin((this.incY + i * 2) / 2), 0) / 2;
                        }
                        else {
                            ctx.globalAlpha = Math.max(Math.sin((this.incY + i * 2) / 2), 0);
                        }
                    }
                    bX = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].idOver].x;
                    bY = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].idOver].y;
                    bWidth = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].idOver].width;
                    bHeight = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].idOver].height;
                    ctx.drawImage(this.aButs[i].oImgData.img, bX, bY, bWidth, bHeight, this.aButs[i].aOverData[0], this.aButs[i].aOverData[1], bWidth * (this.aButs[i].scale) + floatY, bHeight * (this.aButs[i].scale) - floatY);
                    ctx.restore();
                }
            }
            if (gameState == "userCharSelect" || gameState == "opCharSelect") {
                if (curChar < 99) {
                    if (playerNum == 1) {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tick].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tick].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tick].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tick].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + ((curChar % 4) * 120 - 205 + (Math.floor(curChar / 4) % 2) * 60) - 15, canvas.height * .8 + (Math.floor(curChar / 4) * 95 + aCharIcons[curChar].offsetY * .3 - 220) + offsetPosY - 10, bWidth * (1 - this.charX0 / 500), bHeight * (1 - this.charX0 / 500));
                    }
                    else {
                        var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon1].x;
                        var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon1].y;
                        var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon1].width;
                        var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon1].height;
                        ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + ((curChar % 5) * 100 + aCharIcons[curChar].offsetX * .3 - 180 - (Math.floor(curChar / 5) % 2) * 40) - 15, canvas.height + (Math.floor(curChar / 5) * 80 + aCharIcons[curChar].offsetY * .3 - 400) + offsetPosY - 10, bWidth * (1 - this.charX0 / 500) * .75, bHeight * (1 - this.charX0 / 500) * .75);
                    }
                }
                if (opChar < 99) {
                    if (playerNum == 1) {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tick].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tick].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tick].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.tick].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + ((opChar % 5) * 100 + aCharIcons[opChar].offsetX * .3 - 180 - (Math.floor(opChar / 5) % 2) * 40) - 15, canvas.height + (Math.floor(opChar / 5) * 80 + aCharIcons[opChar].offsetY * .3 - 400) + offsetPosY - 10, bWidth * (1 - this.charX1 / 500), bHeight * (1 - this.charX1 / 500));
                    }
                    else {
                        var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon2].x;
                        var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon2].y;
                        var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon2].width;
                        var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.pIcon2].height;
                        ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 + ((opChar % 5) * 100 + aCharIcons[opChar].offsetX * .3 - 180 - (Math.floor(opChar / 5) % 2) * 40) - 15, canvas.height + (Math.floor(opChar / 5) * 80 + aCharIcons[opChar].offsetY * .3 - 400) + offsetPosY - 10, bWidth * (1 - this.charX0 / 500) * .75, bHeight * (1 - this.charX0 / 500) * .75);
                    }
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
            this.canStore = false;
            this.saveDataId = _saveDataId;
            var testKey = 'test';
            var storage;
            var lc = false;
            try {
                storage = window.localStorage;
                lc = true;
            }
            catch (e) {
                console.log("local storage denied");
                lc = false;
                this.canStore = false;
            }
            if (lc) {
                try {
                    storage.setItem(testKey, '1');
                    storage.removeItem(testKey);
                    this.canStore = true;
                }
                catch (error) {
                    this.canStore = false;
                }
            }
            this.clearData();
            this.setInitialData();
        }
        SaveDataHandler.prototype.clearData = function () {
            this.aLevelStore = new Array();
            for (var i = 0; i < 12; i++) {
                this.aLevelStore.push(0);
            }
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(1);
        };
        SaveDataHandler.prototype.setAudioState = function (_state) {
            this.aLevelStore[this.aLevelStore.length - 1] = _state;
            saveDataHandler.saveData();
        };
        SaveDataHandler.prototype.getAudioState = function () {
            return this.aLevelStore[this.aLevelStore.length - 1];
        };
        SaveDataHandler.prototype.getChallengeProgress = function () {
            return this.aLevelStore[this.aLevelStore.length - 3];
        };
        SaveDataHandler.prototype.setChallengeProgress = function (_id) {
            this.aLevelStore[this.aLevelStore.length - 3] = Math.max(this.aLevelStore[this.aLevelStore.length - 3], _id);
        };
        SaveDataHandler.prototype.getChallengeHighScore = function () {
            return this.aLevelStore[this.aLevelStore.length - 2];
        };
        SaveDataHandler.prototype.setChallengeHighScore = function (_score) {
            this.aLevelStore[this.aLevelStore.length - 2] = Math.max(this.aLevelStore[this.aLevelStore.length - 2], _score);
        };
        SaveDataHandler.prototype.resetData = function () {
            this.clearData();
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
        SaveDataHandler.prototype.resetSingleChar = function (_char) {
            this.aLevelStore[_char] = 0;
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
    var Lane = (function () {
        function Lane() {
            this.segNum = 1000;
            this.horizon = 0;
            this.roadTileHeight = 2000;
            this.scrollY = 0;
            this.speed = 0;
            this.steerEaseX = 0;
            this.roadScaleMultiplier = 1;
            this.maxSpeed = 0;
            this.minSpeed = 0;
            this.wheelie = 0;
            this.curve = 0;
            this.curveInc = 0;
            this.lane = 0;
            this.aScenery = new Array();
            this.sceneryInc = 0;
            this.sceneryDir = 0;
            this.scrollX = 0;
            this.scrollInc = 0;
            this.skyScale = 1;
            this.nearWidth = 3.2;
            this.bgNum = 500;
            this.bgWidthScale = 1;
            this.laneSneak = 0.0013;
            this.aObstructions = new Array();
            this.obstructFlipFlopInc = 0;
            this.obstructFlipFlop = 0;
            this.bgLightsInc = 0;
            this.aChallengeLayouts = new Array({ aPosts: [], aJumps: [], aPins: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0] }, { aPosts: [], aJumps: [], aPins: [0, 0, 1, 1, 0, 0, 1, 0, 0, 0] }, { aPosts: [], aJumps: [], aPins: [1, 1, 1, 0, 1, 1, 0, 1, 0, 0] }, { aPosts: [{ x: 75, y: 850 }], aJumps: [], aPins: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] }, { aPosts: [{ x: 150, y: 750 }, { x: 150, y: 850 }], aJumps: [], aPins: [1, 0, 0, 0, 1, 0, 0, 1, 0, 1] }, { aPosts: [{ x: 150, y: 750 }, { x: -150, y: 750 }], aJumps: [], aPins: [0, 1, 1, 0, 0, 1, 0, 0, 0, 0] }, { aPosts: [{ x: 200, y: 750 }, { x: -100, y: 850 }], aJumps: [], aPins: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0] }, { aPosts: [], aJumps: [{ x: 0, y: 850 }], aPins: [0, 1, 1, 0, 0, 1, 0, 0, 0, 0] }, { aPosts: [{ x: 200, y: 750 }, { x: -200, y: 750 }], aJumps: [{ x: 0, y: 750 }], aPins: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] }, { aPosts: [], aJumps: [{ x: -160, y: 850 }, { x: 160, y: 750 }], aPins: [0, 1, 1, 0, 0, 1, 0, 0, 0, 0] }, { aPosts: [{ x: 200, y: 750 }, { x: -120, y: 750 }, { x: 120, y: 850 }, { x: -200, y: 850 }], aJumps: [], aPins: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, { aPosts: [{ x: 200, y: 850 }, { x: 130, y: 800 }, { x: 60, y: 750 }], aJumps: [], aPins: [1, 1, 0, 0, 1, 0, 0, 0, 0, 0] }, { aPosts: [], aJumps: [{ x: 0, y: 850 }, { x: 0, y: 800 }, { x: 0, y: 750 }], aPins: [0, 1, 1, 0, 0, 1, 0, 0, 0, 0] }, { aPosts: [{ x: -200, y: 850 }, { x: -70, y: 800 }, { x: 60, y: 750 }], aJumps: [], aPins: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0] }, { aPosts: [{ x: 150, y: 750 }, { x: 0, y: 750 }, { x: -150, y: 750 }], aJumps: [{ x: 0, y: 850 }], aPins: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] }, { aPosts: [], aJumps: [], aPins: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] });
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.oRoadImgData = assetLib.getData("lanes0");
            this.oBgLaneReflectImgData = assetLib.getData("bgLaneReflect0");
            this.aRowData = new Array();
            for (var i = 0; i < this.segNum; i++) {
                this.aRowData.push({ height: 0, scale: 0 });
            }
            this.resetPins(1);
            this.roadHeight = 600;
            this.steerX = -1217;
            this.setObstructions(true);
        }
        Lane.prototype.setObstructions = function (_newPos) {
            if (_newPos) {
                if (gameType == 2) {
                    this.aObstructions = new Array();
                    for (var i = 0; i < this.aChallengeLayouts[challengeLevel].aPosts.length; i++) {
                        var oObstruct = {};
                        oObstruct.obstructRetainY = this.aChallengeLayouts[challengeLevel].aPosts[i].y;
                        oObstruct.obstructRetainX = this.aChallengeLayouts[challengeLevel].aPosts[i].x;
                        oObstruct.obType = "post";
                        oObstruct.obWidth = 92;
                        oObstruct.obOffsetY = 95;
                        oObstruct.obHitYAbove = 0;
                        oObstruct.obHitYBelow = 30;
                        this.aObstructions.push(oObstruct);
                    }
                    for (var i = 0; i < this.aChallengeLayouts[challengeLevel].aJumps.length; i++) {
                        var oObstruct = {};
                        oObstruct.obstructRetainY = this.aChallengeLayouts[challengeLevel].aJumps[i].y;
                        oObstruct.obstructRetainX = this.aChallengeLayouts[challengeLevel].aJumps[i].x;
                        oObstruct.obType = "jump";
                        oObstruct.obWidth = 110;
                        oObstruct.obOffsetY = 25;
                        oObstruct.obHitYAbove = 20;
                        oObstruct.obHitYBelow = 20;
                        this.aObstructions.push(oObstruct);
                    }
                }
                else {
                    var tempTot = 0;
                    if (gameType == 0 && Math.random() * 8 < curLevel) {
                        tempTot = 1;
                        if (curLevel > 3 && Math.random() * 15 < curLevel) {
                            tempTot = 2;
                        }
                    }
                    tempTot = 0;
                    if (tempTot == 0) {
                        this.aObstructions = new Array();
                        return;
                    }
                    this.aObstructions = new Array();
                    for (var i = 0; i < tempTot; i++) {
                        var oObstruct = {};
                        if ((tempTot == 1 && Math.random() * 2 > 1) || tempTot == 2 && i == 0) {
                            oObstruct.obstructRetainY = Math.random() * 100 + 750;
                            oObstruct.obstructRetainX = Math.random() * 400 - 200;
                            oObstruct.obType = "post";
                            oObstruct.obWidth = 92;
                            oObstruct.obOffsetY = 95;
                            oObstruct.obHitYAbove = 0;
                            oObstruct.obHitYBelow = 30;
                        }
                        else {
                            oObstruct.obstructRetainY = Math.random() * 100 + 750;
                            oObstruct.obstructRetainX = Math.random() * 360 - 180;
                            oObstruct.obType = "jump";
                            oObstruct.obWidth = 110;
                            oObstruct.obOffsetY = 25;
                            oObstruct.obHitYAbove = 20;
                            oObstruct.obHitYBelow = 20;
                            if (tempTot == 2) {
                                var tempOver = 0;
                                while (this.aObstructions[0].obstructRetainY > oObstruct.obstructRetainY - 30
                                    && this.aObstructions[0].obstructRetainY < oObstruct.obstructRetainY + 30
                                    && this.aObstructions[0].obstructRetainX > oObstruct.obstructRetainX - 200
                                    && this.aObstructions[0].obstructRetainX < oObstruct.obstructRetainX + 200
                                    && tempOver < 50) {
                                    console.log("too close");
                                    oObstruct.obstructRetainY = Math.random() * 100 + 750;
                                    oObstruct.obstructRetainX = Math.random() * 360 - 180;
                                    tempOver++;
                                }
                            }
                        }
                        this.aObstructions.push(oObstruct);
                    }
                    this.aObstructions.sort(function (a, b) {
                        return a.obstructRetainY - b.obstructRetainY;
                    });
                }
            }
            for (var i = 0; i < this.aObstructions.length; i++) {
                this.aObstructions[i].hasHitObstruction = false;
                this.aObstructions[i].renderFront = true;
                this.aObstructions[i].obstructY = this.aObstructions[i].obstructRetainY;
                this.aObstructions[i].obstructX = this.aObstructions[i].obstructRetainX;
            }
        };
        Lane.prototype.reset = function (_resetType) {
            this.speed = 0;
            this.scrollY = 0;
            throwState = 0;
            this.steerX = -1217;
            this.roadHeight = 600;
            this.nearWidth = 3.2;
            this.resetPins(_resetType);
            ball.resetBall(_resetType);
            this.bgNum = 500;
            this.setObstructions(false);
            this.bgWidthScale = 1;
        };
        Lane.prototype.resetPins = function (_resetType) {
            if (_resetType == 1) {
                aLaneElements = new Array();
                for (var i = 0; i < 10; i++) {
                    var pin = new Elements.Pin(i);
                    aLaneElements.push(pin);
                }
                aLaneElements[0].setStartPos(508, 0.045);
                aLaneElements[1].setStartPos(508, 0.015);
                aLaneElements[2].setStartPos(508, -0.015);
                aLaneElements[3].setStartPos(508, -0.045);
                aLaneElements[4].setStartPos(515, 0.03);
                aLaneElements[5].setStartPos(515, 0);
                aLaneElements[6].setStartPos(515, -0.03);
                aLaneElements[7].setStartPos(521, 0.015);
                aLaneElements[8].setStartPos(521, -0.015);
                aLaneElements[9].setStartPos(528, 0);
                standingPins = 9;
                var tempId = -1;
                if (gameType == 2) {
                    for (var i = 0; i < this.aChallengeLayouts[challengeLevel].aPins.length; i++) {
                        tempId++;
                        if (this.aChallengeLayouts[challengeLevel].aPins[i] == 0) {
                            aLaneElements.splice(tempId, 1);
                            tempId--;
                            standingPins--;
                        }
                    }
                }
            }
            else {
                standingPins = 0;
                for (var i = 0; i < aLaneElements.length; i++) {
                    if (!aLaneElements[i].isBall && (aLaneElements[i].hitByBall || aLaneElements[i].hitByPin)) {
                        aLaneElements.splice(i, 1);
                        i -= 1;
                    }
                    else if (!aLaneElements[i].isBall && !aLaneElements[i].hitByBall && !aLaneElements[i].hitByPin) {
                        standingPins++;
                        aLaneElements[i].resetStartPos();
                    }
                }
            }
        };
        Lane.prototype.triggerThrow = function (_speed) {
            _speed = Math.min(_speed, 70);
            var tempSpeed = 330 + (100 / 70) * _speed;
            TweenLite.to(this, .5, {
                nearWidth: 5.5, steerX: -3540, roadHeight: 450, speed: tempSpeed, ease: "Quad.easeOut",
                onComplete: function () {
                }
            });
        };
        Lane.prototype.update = function () {
            if (firstGoState == 2) {
                return;
            }
            this.obstructFlipFlopInc += delta;
            if (this.obstructFlipFlopInc > .25) {
                this.obstructFlipFlopInc = 0;
                if (this.obstructFlipFlop == 0) {
                    this.obstructFlipFlop = 1;
                }
                else {
                    this.obstructFlipFlop = 0;
                }
            }
            if (throwState == 2) {
                this.speed -= 10 * delta;
                this.scrollY -= this.speed * delta;
                this.bgNum += (this.speed * .5) * delta;
                for (var i = 0; i < this.aObstructions.length; i++) {
                    this.aObstructions[i].obstructY += (this.speed * .5) * delta;
                }
                if (this.scrollY < -770) {
                    ball.speedY = this.speed;
                    this.speed = 0;
                    for (var i = 0; i < aLaneElements.length; i++) {
                        if (!aLaneElements[i].isBall) {
                            aLaneElements[i].setHitPos();
                        }
                    }
                    throwState = 3;
                }
            }
            this.horizon = (canvas.height - this.roadHeight);
            this.bgLightsInc += delta * 2;
            this.oBgLaneImgData = assetLib.getData("bgLane" + Math.floor(this.bgLightsInc) % 3);
        };
        Lane.prototype.renderTopBg = function () {
            this.bgScale = (this.aRowData[Math.floor(this.bgNum)].scale) / 710;
            ctx.drawImage(this.oBgLaneImgData.img, 0, 0, this.oBgLaneImgData.img.width, this.oBgLaneImgData.img.height, canvas.width / 2 - (this.oBgLaneImgData.img.width / 2) * this.bgScale * this.bgWidthScale, this.aRowData[Math.floor(this.bgNum)].y - (this.oBgLaneImgData.img.height) * this.bgScale * this.bgWidthScale - (this.aRowData[Math.floor(this.bgNum)].scale * this.laneSneak) * this.bgScale * this.bgWidthScale, this.oBgLaneImgData.img.width * this.bgScale * this.bgWidthScale, this.oBgLaneImgData.img.height * this.bgScale * this.bgWidthScale);
            this.goalScale = (this.aRowData[Math.floor(this.bgNum)].scale) / 2420;
            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.goal].x;
            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.goal].y;
            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.goal].width;
            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.goal].height;
            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * this.goalScale, this.aRowData[Math.floor(this.bgNum)].y - (bHeight - 0) * this.goalScale - (this.aRowData[Math.floor(this.bgNum)].scale * this.laneSneak) * this.bgScale * this.bgWidthScale, bWidth * this.goalScale, bHeight * this.goalScale);
        };
        Lane.prototype.renderObstruction = function (_id) {
            if (this.aObstructions.length == 0) {
                return;
            }
            if (this.aObstructions[_id].obstructY < 1000) {
                this.aObstructions[_id].obstructScale = (this.aRowData[Math.floor(this.aObstructions[_id].obstructY)].scale) / 6000;
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds[this.aObstructions[_id].obType + this.obstructFlipFlop]].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds[this.aObstructions[_id].obType + this.obstructFlipFlop]].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds[this.aObstructions[_id].obType + this.obstructFlipFlop]].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds[this.aObstructions[_id].obType + this.obstructFlipFlop]].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * this.aObstructions[_id].obstructScale - this.aObstructions[_id].obstructX * this.aObstructions[_id].obstructScale, this.aRowData[Math.floor(this.aObstructions[_id].obstructY)].y - (bHeight - this.aObstructions[_id].obOffsetY) * this.aObstructions[_id].obstructScale, bWidth * this.aObstructions[_id].obstructScale, bHeight * this.aObstructions[_id].obstructScale);
            }
        };
        Lane.prototype.render = function () {
            if (throwState >= 3) {
                this.renderTopBg();
            }
            for (var i = 0; i < aLaneElements.length; i++) {
                if (aLaneElements[i].offLane) {
                    aLaneElements[i].update();
                    aLaneElements[i].render();
                }
            }
            var segHeightBefore = this.roadTileHeight / this.segNum;
            var rowHeight = 0;
            this.aRowData[0].curve = this.curve;
            var tempSegum = this.segNum * .5;
            for (var i = tempSegum; i < this.segNum; i++) {
                this.tempInc = i;
                this.easeInc = 1 * (this.tempInc /= this.segNum) * this.tempInc * this.tempInc * this.tempInc * this.tempInc * this.tempInc * this.tempInc * this.tempInc * this.tempInc * this.tempInc * this.tempInc * this.tempInc * this.tempInc + 0;
                this.nextRow = i + 1;
                this.segHeightAfter = (1 * (this.nextRow /= this.segNum) * this.nextRow * this.nextRow * this.nextRow * this.nextRow * this.nextRow * this.nextRow * this.nextRow * this.nextRow * this.nextRow * this.nextRow * this.nextRow * this.nextRow + 0) - this.easeInc;
                this.aRowData[i].x = this.steerX * this.easeInc + canvas.width / 2 - (((this.easeInc + this.segHeightAfter) * 2) * this.oRoadImgData.oData.spriteWidth) / 2 - 250;
                this.aRowData[i].y = this.horizon + (this.easeInc * this.roadHeight);
                this.aRowData[i].scale = ((this.easeInc + this.segHeightAfter) * this.nearWidth) * this.oRoadImgData.oData.spriteWidth + 500;
                if (rowHeight == 0) {
                    this.rowId = i;
                }
                rowHeight += this.segHeightAfter * this.roadHeight;
                if (rowHeight > 1) {
                    ctx.drawImage(this.oRoadImgData.img, 0, this.rowId * segHeightBefore + this.scrollY, this.oRoadImgData.oData.spriteWidth, segHeightBefore, this.aRowData[this.rowId].x, this.aRowData[this.rowId].y, this.aRowData[this.rowId].scale, rowHeight + 1);
                    rowHeight = 0;
                }
            }
            if (throwState < 3) {
                this.renderTopBg();
            }
            ctx.drawImage(this.oBgLaneReflectImgData.img, 0, 0, this.oBgLaneReflectImgData.img.width, this.oBgLaneReflectImgData.img.height, canvas.width / 2 - (this.oBgLaneReflectImgData.img.width / 2) * this.bgScale * this.bgWidthScale, this.aRowData[Math.floor(this.bgNum)].y + 0 * this.bgScale * this.bgWidthScale - (this.aRowData[Math.floor(this.bgNum)].scale * this.laneSneak) * this.bgScale * this.bgWidthScale, this.oBgLaneReflectImgData.img.width * this.bgScale * this.bgWidthScale, this.oBgLaneReflectImgData.img.height * this.bgScale * this.bgWidthScale);
            for (var i = 0; i < aLaneElements.length; i++) {
                if (!aLaneElements[i].offLane) {
                    aLaneElements[i].update();
                    aLaneElements[i].render();
                }
            }
            var prevRightScale;
            var prevRightX;
            var prevRightY;
            var prevLeftScale;
            var prevLeftX;
            var prevLeftY;
        };
        return Lane;
    }());
    Elements.Lane = Lane;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Ball = (function () {
        function Ball() {
            this.isBall = true;
            this.id = 99;
            this.startYOffset = 140;
            this.holdSluggish = 3;
            this.speedToThrow = 2;
            this.setRadius = 600;
            this.isResting = false;
            this.offLane = false;
            this.inGutter = false;
            this.hitJump = false;
            this.obstructJumpY = 0;
            this.obstructJumpInc = 0;
            this.pinHitSound = false;
            this.firstBounce = false;
            this.canDetectSwerve = false;
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.resetBall(1);
        }
        ;
        Ball.prototype.resetBall = function (_resetType) {
            var _this = this;
            if (this.throwTween) {
                this.throwTween.kill();
            }
            if (whosGo == 0) {
                playSound("switchBowlerCur");
            }
            else {
                playSound("switchBowlerOp");
            }
            this.firstBounce = false;
            this.initialPinsLeft = 0;
            for (var i = 0; i < aLaneElements.length; i++) {
                if (!aLaneElements[i].isBall && !aLaneElements[i].hitByBall && !aLaneElements[i].hitByPin) {
                    this.initialPinsLeft++;
                }
            }
            this.canDetectSwerve = false;
            this.x = this.targX = canvas.width / 2;
            this.y = this.targY = -this.startYOffset;
            this.scale = this.fixedScale = .6;
            this.addScale = 0;
            this.offGroundY = this.fixedOffGroundY = 40;
            this.leftSwerve = 0;
            this.rightSwerve = 0;
            if (_resetType == 1) {
                aLaneElements.push(this);
            }
            this.isResting = false;
            this.offLane = false;
            this.inGutter = false;
            this.hitJump = false;
            this.resetStartPos();
            this.pinHitSound = false;
            if (whosGo == 0) {
                this.ballId = curChar;
            }
            else {
                this.ballId = checkCharId(opChar);
                if (playerNum == 1) {
                    this.opY = canvas.height / 2;
                    var isPost = false;
                    var postX = 0;
                    for (var i = 0; i < lane.aObstructions.length; i++) {
                        if (lane.aObstructions[i].obType == "post") {
                            isPost = true;
                            postX = lane.aObstructions[i].obstructX;
                        }
                    }
                    if (!isPost) {
                        this.opX = (Math.random() * canvas.width / 3) - canvas.width / 6;
                    }
                    else {
                        if (postX > 0) {
                            this.opX = canvas.width / 6 + Math.random() * 100 - 50;
                        }
                        else {
                            this.opX = -canvas.width / 6 + Math.random() * 100 - 50;
                        }
                    }
                    this.startHold(this.opX, this.opY);
                    if (this.opTween) {
                        this.opTween.kill();
                    }
                    var tempPower = (1 - aCharIcons[curLevel].stat0) * 200 + 50;
                    this.opTween = TweenLite.to(this, Math.random() * .3 + .6, {
                        opY: canvas.height * .8, ease: "Quad.easeInOut",
                        onComplete: function () {
                            _this.opTween = TweenLite.to(_this, Math.random() * .2 + (1 - aCharIcons[curLevel].stat1) / 2, {
                                opY: canvas.height * .25, opX: _this.opX + Math.random() * tempPower - tempPower / 2, ease: "Quad.easeIn",
                                onComplete: function () {
                                }
                            });
                        }
                    });
                }
                else {
                }
            }
        };
        Ball.prototype.resetStartPos = function () {
            this.targX = canvas.width / 2;
            this.targY = -this.startYOffset;
            this.addScale = 0;
            this.alpha = 1;
            this.gutterX = 0;
            this.hitJump = false;
            this.addOffSetGroundY = this.sineOffSetGroundY = 0;
        };
        Ball.prototype.startHold = function (_x, _y) {
            this.startY = _y - this.y;
            this.startOffsetGroundY = _y;
            this.startScale = _y;
            this.minHoldY = _y;
            this.maxHoldY = _y + this.startYOffset;
            this.allowSwerve = false;
            this.canThrow = false;
        };
        Ball.prototype.setHoldPos = function (_x, _y) {
            if (_y - this.minHoldY > 20) {
                this.canThrow = true;
            }
            this.canThrow = true;
            if (_y > this.maxHoldY) {
                var tempDiff = _y - this.maxHoldY;
                this.startY += tempDiff;
                this.minHoldY += tempDiff;
                this.startOffsetGroundY += tempDiff;
                this.startScale += tempDiff;
                this.maxHoldY = _y;
            }
            _y = Math.min(_y, this.maxHoldY);
            _y = Math.min(_y, this.maxHoldY);
            if (this.speedY < this.speedToThrow || !this.canThrow) {
                _y = Math.max(_y, this.minHoldY);
            }
            this.prevTargX = this.targX;
            this.prevTargY = this.targY;
            this.targX = _x;
            this.targY = _y - this.startY;
            this.speedX = Math.min(Math.max(this.prevTargX - this.targX, -13), 13);
            this.speedY = this.prevTargY - this.targY;
            this.addOffSetGroundY = (_y - this.startOffsetGroundY) / this.startYOffset;
            this.addScale = (_y - this.startScale) / 400;
        };
        Ball.prototype.ballRelease = function () {
            var _this = this;
            throwState = 2;
            playSound("ballDrop" + Math.floor(Math.random() * 2));
            playSound("ballRolling");
            this.allowSwerve = true;
            this.leftSwerve = 0;
            this.rightSwerve = 0;
            this.y = -this.startYOffset;
            this.scale = .6;
            this.targX = this.x;
            this.speedXInc = 0;
            lane.triggerThrow(this.speedY - ball.speedToThrow);
            this.ballRoll = new Elements.BallRoll(24);
            this.easeMultiplier = 0;
            this.throwTween = TweenLite.to(this, Math.random() * .5 + 1.5, { y: -270, scale: .5, easeMultiplier: 1, ease: "Quad.easeOut" });
            if (Math.random() * 1 > .5) {
                TweenLite.to(this, Math.random() * .1 + .1, { offGroundY: 0, ease: "Quad.easeOut" });
            }
            else {
                TweenLite.to(this, Math.random() * .2 + .2, { offGroundY: 0, ease: "Bounce.easeOut" });
            }
            setTimeout(function () {
                _this.canDetectSwerve = true;
            }, 500);
        };
        Ball.prototype.update = function () {
            var _this = this;
            if (firstGoState == 2) {
                return;
            }
            this.radius = this.setRadius * this.scale;
            if (throwState < 2) {
                if (whosGo == 1 && playerNum == 1) {
                    this.setHoldPos(canvas.width / 2 + this.opX, this.opY);
                }
                this.targX = Math.min(Math.max(this.targX, 150), canvas.width - 150);
                this.perspOffsetX = (this.targX - canvas.width / 2) * ((this.targY - (-this.startYOffset)) * .003);
                this.x -= (this.x - (this.targX + this.perspOffsetX)) / (this.holdSluggish * 2);
                this.y -= (this.y - this.targY) / this.holdSluggish;
                this.sineOffSetGroundY -= (this.sineOffSetGroundY - this.addOffSetGroundY) / this.holdSluggish;
                this.offGroundY = this.fixedOffGroundY + (1 - Math.sin(Math.PI * ((this.sineOffSetGroundY + 1) / 2))) * 200;
                this.scale -= (this.scale - (this.fixedScale + this.addScale)) / this.holdSluggish;
                if (this.canThrow && this.y < -this.startYOffset && this.speedY > this.speedToThrow) {
                    if (firstGoState == 1) {
                        panel.showSwerveTut();
                        firstGoState = 2;
                    }
                    else {
                        this.ballRelease();
                    }
                }
            }
            else if (throwState <= 3) {
                if (whosGo == 1 && playerNum == 1) {
                    if (lane.scrollY > -700 && lane.scrollY < -300) {
                        if (this.x > canvas.width / 2) {
                            this.leftSwerve = 1 * aCharIcons[curLevel].stat2;
                            this.rightSwerve = 0;
                        }
                        else {
                            this.leftSwerve = 0;
                            this.rightSwerve = -1 * aCharIcons[curLevel].stat2;
                        }
                    }
                    else {
                        this.leftSwerve = 0;
                        this.rightSwerve = 0;
                    }
                }
                if (this.hitJump) {
                    this.leftSwerve = 0;
                    this.rightSwerve = 0;
                }
                this.speedX += ((this.leftSwerve + this.rightSwerve) * 15) * delta;
                this.perspOffsetX = ((this.x - canvas.width / 2) * ((this.y - (-this.startYOffset)) * .004)) * this.easeMultiplier;
                if (throwState == 3) {
                    if (!this.offLane) {
                        this.y -= (this.speedY * 2) * delta;
                        if (!this.inGutter) {
                            this.speedXInc -= (this.speedX * 40) * delta;
                            if (this.x > canvas.width / 2 + 200 || this.x < canvas.width / 2 - 200) {
                                this.inGutter = true;
                                playSound("ballOff" + Math.floor(Math.random() * 2));
                            }
                        }
                        else {
                            if (this.x > canvas.width / 2) {
                                this.x -= 800 * delta;
                            }
                            else {
                                this.x += 800 * delta;
                            }
                        }
                        this.scale -= (this.speedY * .002) * delta;
                        if (this.y < -370) {
                            this.offLane = true;
                            playSound("ballDrop" + Math.floor(Math.random() * 2));
                            TweenLite.to(this, .5, {
                                y: this.y + 400, ease: "Quad.easeIn",
                                onComplete: function () {
                                    playSound("ballOff" + Math.floor(Math.random() * 2));
                                    _this.isResting = true;
                                    throwState = 4;
                                    elementAtRest();
                                    var pinsLeft = 0;
                                    for (var i = 0; i < aLaneElements.length; i++) {
                                        if (!aLaneElements[i].isBall && !aLaneElements[i].hitByBall && !aLaneElements[i].hitByPin) {
                                            pinsLeft++;
                                        }
                                    }
                                    pinsLeft = Math.round(10 - (10 / _this.initialPinsLeft) * pinsLeft);
                                    if (pinsLeft == 0) {
                                        playSound("cheerBad");
                                    }
                                    else if (pinsLeft == 1 || pinsLeft == 2) {
                                        playSound("cheer0");
                                    }
                                    else if (pinsLeft == 3 || pinsLeft == 4) {
                                        playSound("cheer" + (Math.floor(Math.random() * 2 + 1)));
                                    }
                                    else if (pinsLeft == 5 || pinsLeft == 6) {
                                        playSound("cheer" + (Math.floor(Math.random() * 2 + 2)));
                                    }
                                    else if (pinsLeft == 7 || pinsLeft == 8) {
                                        playSound("cheer" + (Math.floor(Math.random() * 2 + 3)));
                                    }
                                    else {
                                        playSound("cheer" + (Math.floor(Math.random() * 2 + 4)));
                                    }
                                }
                            });
                        }
                    }
                }
                else {
                    this.speedXInc -= (this.speedX * 15) * delta;
                }
                if (!this.offLane) {
                    if (!this.inGutter) {
                        this.x = this.targX + this.perspOffsetX + this.speedXInc;
                        if (this.x > canvas.width / 2 + 300) {
                            this.inGutter = true;
                            playSound("ballOff" + Math.floor(Math.random() * 2));
                            this.gutterX = 10;
                            TweenLite.to(this, .7, { gutterX: 0, ease: "Elastic.easeOut" });
                        }
                        else if (this.x < canvas.width / 2 - 300) {
                            this.inGutter = true;
                            playSound("ballOff" + Math.floor(Math.random() * 2));
                            this.gutterX = -10;
                            TweenLite.to(this, .7, { gutterX: 0, ease: "Elastic.easeOut" });
                        }
                    }
                }
                this.obstructJumpInc -= 3500 * delta;
                this.obstructJumpY += this.obstructJumpInc * delta;
                if (this.obstructJumpY < 0) {
                    if (this.hitJump && !this.firstBounce) {
                        playSound("ballDrop" + Math.floor(Math.random() * 2));
                        this.firstBounce = true;
                    }
                    this.obstructJumpY = 0;
                    this.obstructJumpInc *= -.5;
                }
                if (lane.aObstructions.length != 0) {
                    for (var i = 0; i < lane.aObstructions.length; i++) {
                        if (!lane.aObstructions[i].hasHitObstruction
                            && lane.aObstructions[i].obstructY < 1000
                            && this.x + this.gutterX > canvas.width / 2 - lane.aObstructions[i].obstructX * lane.aObstructions[i].obstructScale - lane.aObstructions[i].obWidth
                            && this.x + this.gutterX < canvas.width / 2 - lane.aObstructions[i].obstructX * lane.aObstructions[i].obstructScale + lane.aObstructions[i].obWidth
                            && canvas.height + this.y - this.offGroundY * this.scale > lane.aRowData[Math.floor(lane.aObstructions[i].obstructY)].y - lane.aObstructions[i].obHitYAbove
                            && canvas.height + this.y - this.offGroundY * this.scale < lane.aRowData[Math.floor(lane.aObstructions[i].obstructY)].y + lane.aObstructions[i].obHitYBelow
                            && this.obstructJumpY < 250) {
                            lane.aObstructions[i].hasHitObstruction = true;
                            if (lane.aObstructions[i].obType == "post") {
                                playSound("hitPost");
                                if (this.x + this.gutterX > canvas.width / 2 - lane.aObstructions[i].obstructX * lane.aObstructions[i].obstructScale) {
                                    this.speedX -= (lane.aObstructions[i].obWidth - ((this.x + this.gutterX) - (canvas.width / 2 - lane.aObstructions[i].obstructX * lane.aObstructions[i].obstructScale))) * 2;
                                    if (this.obstructJumpY == 0) {
                                        this.obstructJumpInc = -this.speedX * 8;
                                    }
                                }
                                else {
                                    this.speedX -= (-lane.aObstructions[i].obWidth - ((this.x + this.gutterX) - (canvas.width / 2 - lane.aObstructions[i].obstructX * lane.aObstructions[i].obstructScale))) * 2;
                                    if (this.obstructJumpY == 0) {
                                        this.obstructJumpInc = this.speedX * 8;
                                    }
                                }
                                lane.speed *= 1 - Math.abs(.4 * (this.speedX / (lane.aObstructions[i].obWidth * 2)));
                                this.speedY *= 1 - Math.abs(.4 * (this.speedX / (lane.aObstructions[i].obWidth * 2)));
                            }
                            else {
                                this.hitJump = true;
                                playSound("jump");
                                this.obstructJumpInc = 1500;
                                this.speedX -= ((this.x + this.gutterX) - (canvas.width / 2 - lane.aObstructions[i].obstructX * lane.aObstructions[i].obstructScale)) / 5;
                            }
                        }
                    }
                }
            }
        };
        Ball.prototype.render = function () {
            var tempBallY = canvas.height + this.y;
            for (var i = 0; i < lane.aObstructions.length; i++) {
                if (lane.aObstructions[i].obstructY < 1000 && (tempBallY >= lane.aRowData[Math.floor(lane.aObstructions[i].obstructY)].y || lane.aObstructions[i].obType == "jump")) {
                    lane.renderObstruction(i);
                    lane.aObstructions[i].renderFront = true;
                }
                else {
                    lane.aObstructions[i].renderFront = false;
                }
            }
            tempBallY = tempBallY - this.offGroundY * this.scale - this.obstructJumpY * this.scale;
            if (!this.offLane) {
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ballReflect].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ballReflect].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ballReflect].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ballReflect].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, this.x - (bWidth / 2) * this.scale, canvas.height + this.y + this.offGroundY * this.scale, bWidth * this.scale, bHeight * this.scale);
                var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ballShadow].x;
                var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ballShadow].y;
                var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ballShadow].width;
                var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds.ballShadow].height;
                ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, this.x - (bWidth / 2) * this.scale, canvas.height + this.y - (bHeight / 2) * this.scale, bWidth * this.scale, bHeight * this.scale);
            }
            ctx.save();
            ctx.rotate(0);
            ctx.translate(this.x + this.gutterX, tempBallY);
            ctx.scale(this.scale, this.scale);
            var bX = this.oGameElementsImgData.oData.oAtlasData[oImageIds["ball" + this.ballId]].x;
            var bY = this.oGameElementsImgData.oData.oAtlasData[oImageIds["ball" + this.ballId]].y;
            var bWidth = this.oGameElementsImgData.oData.oAtlasData[oImageIds["ball" + this.ballId]].width;
            var bHeight = this.oGameElementsImgData.oData.oAtlasData[oImageIds["ball" + this.ballId]].height;
            ctx.drawImage(this.oGameElementsImgData.img, bX, bY, bWidth, bHeight, -(bWidth / 2), -(bHeight), bWidth, bHeight);
            ctx.restore();
            if (throwState == 2) {
                this.ballRoll.x = this.x + this.gutterX;
                this.ballRoll.y = tempBallY - (bHeight / 2 * this.scale);
                this.ballRoll.scaleX = this.scale;
                this.ballRoll.scaleY = this.scale;
                this.ballRoll.update();
                this.ballRoll.render();
            }
            for (var i = 0; i < lane.aObstructions.length; i++) {
                if (!lane.aObstructions[i].renderFront) {
                    lane.renderObstruction(i);
                }
            }
        };
        return Ball;
    }());
    Elements.Ball = Ball;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Pin = (function () {
        function Pin(_id) {
            this.isBall = false;
            this.hitByBall = false;
            this.hitByPin = false;
            this.setRadius = 15;
            this.alpha = 1;
            this.rotXOffset = 0;
            this.isResting = false;
            this.offLane = false;
            this.id = _id;
            this.oPinImgData = assetLib.getData("pin");
            this.oPinReflectImgData = assetLib.getData("pinReflect");
            this.oGameElementsImgData = assetLib.getData("gameElements");
            this.rot = 0;
            this.curFrame = 24;
            this.aHitPins = new Array();
        }
        Pin.prototype.setStartPos = function (_rowNum, _posX) {
            this.rowNum = this.rowNumStore = _rowNum;
            this.posX = _posX;
            this.isResting = true;
            this.aHitPins = new Array();
            this.offGroundY = 0;
            this.offGroundYInc = 0;
        };
        Pin.prototype.resetStartPos = function () {
            if (this.posTween) {
                this.posTween.kill();
            }
            if (this.bounceTween) {
                this.bounceTween.kill();
            }
            if (this.frameTween) {
                this.frameTween.kill();
            }
            this.rowNum = this.rowNumStore;
            this.isResting = true;
            this.aHitPins = new Array();
            this.offGroundY = 0;
            this.offGroundYInc = 0;
            this.rot = 0;
            this.curFrame = 24;
        };
        Pin.prototype.setHitPos = function () {
            this.x = canvas.width / 2 - this.posX * lane.aRowData[Math.floor(this.rowNum)].scale;
            this.y = lane.aRowData[Math.floor(this.rowNum)].y - canvas.height;
            this.startHitScale = (lane.aRowData[Math.floor(this.rowNum)].scale) / 4500;
            this.rowNum += (lane.speed * .5) * delta;
            this.offLane = false;
            this.dropY = 0;
            this.hitX = 0;
            this.hitY = 0;
            this.hitEase = 1;
            this.rot = 0;
            this.startHitY = this.y;
            this.hasWobbled = false;
        };
        Pin.prototype.checkAllPinsHit = function () {
            for (var i = 0; i < aLaneElements.length; i++) {
                if (!aLaneElements[i].isBall && aLaneElements[i].id != this.id && !aLaneElements[i].offLane) {
                    var tempCanHit = true;
                    for (var j = 0; j < this.aHitPins.length; j++) {
                        if (this.aHitPins[j] == aLaneElements[i].id) {
                            tempCanHit = false;
                            break;
                        }
                    }
                    if (tempCanHit) {
                        this.checkPinHit(aLaneElements[i]);
                    }
                }
            }
        };
        Pin.prototype.haveWobble = function () {
            var _this = this;
            this.hasWobbled = true;
            this.isResting = false;
            if (this.bounceTween) {
                this.bounceTween.kill();
            }
            var tempRot = Math.random() * 2 + 1;
            if (Math.random() * 2 > 1) {
                tempRot *= -1;
            }
            this.bounceTween = TweenLite.to(this, .15, {
                rot: tempRot * radian, ease: "Quad.easeOut",
                onComplete: function () {
                    _this.bounceTween = TweenLite.to(_this, .3, {
                        rot: -(tempRot * .5) * radian, ease: "Quad.easeInOut",
                        onComplete: function () {
                            _this.bounceTween = TweenLite.to(_this, .3, {
                                rot: (tempRot * .25) * radian, ease: "Quad.easeInOut",
                                onComplete: function () {
                                    _this.bounceTween = TweenLite.to(_this, .2, {
                                        rot: 0 * radian, ease: "Quad.easeInOut",
                                        onComplete: function () {
                                            _this.isResting = true;
                                            elementAtRest();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        };
        Pin.prototype.checkPinHit = function (_pin) {
            var _this = this;
            var s1XOffset = _pin.x;
            var s1YOffset = _pin.y;
            var s2XOffset = this.x;
            var s2YOffset = this.y;
            var distance_squared = (((s1XOffset - s2XOffset) * (s1XOffset - s2XOffset)) + ((s1YOffset - s2YOffset) * (s1YOffset - s2YOffset)));
            var radii_squared = (_pin.radius) * (this.radius);
            if (!this.hasWobbled && !this.hitByBall && distance_squared >= radii_squared && distance_squared < radii_squared * 1.2) {
                this.haveWobble();
            }
            if (distance_squared < radii_squared) {
                if (ball.offLane) {
                    playSound("pinTap" + Math.floor(Math.random() * 3));
                }
                var totRadius = (_pin.radius + this.radius) / 2;
                this.hitY = (totRadius - Math.abs(_pin.x - this.x)) / totRadius;
                var tempHitX = 1 - this.hitY;
                if (tempHitX > .5) {
                    tempHitX = this.hitY;
                }
                if (_pin.x > this.x) {
                    this.hitX = -tempHitX;
                }
                else {
                    this.hitX = tempHitX;
                }
                this.hitByPin = true;
                this.aHitPins.push(_pin.id);
                this.hitX *= .3;
                this.hitY *= .4;
                if (!this.hitByBall) {
                    if (this.posTween) {
                        this.posTween.kill();
                    }
                    if (this.bounceTween) {
                        this.bounceTween.kill();
                    }
                    if (this.frameTween) {
                        this.frameTween.kill();
                    }
                    this.hitEase = 1;
                    this.posTween = TweenLite.to(this, Math.random() * 1.5 + 1.2, {
                        hitEase: 0, ease: "Quad.easeOut",
                        onComplete: function () {
                            _this.isResting = true;
                            elementAtRest();
                        }
                    });
                    var tempRot = 95;
                    if (Math.random() * 2 > 1) {
                        tempRot = -95;
                    }
                    this.bounceTween = TweenLite.to(this, Math.random() * .4 + 1, { rot: tempRot * radian, ease: "Bounce.easeOut" });
                    this.frameTween = TweenLite.to(this, Math.random() * .2 + .9, { curFrame: Math.random() * 49, ease: "Cubic.easeOut" });
                }
                else {
                    if (this.posTween) {
                        this.posTween.kill();
                    }
                    if (this.frameTween) {
                        this.frameTween.kill();
                    }
                    this.hitEase = 1;
                    this.posTween = TweenLite.to(this, Math.random() * 1.5 + 1.2, {
                        hitEase: 0, ease: "Quad.easeOut",
                        onComplete: function () {
                            _this.isResting = true;
                            elementAtRest();
                        }
                    });
                    this.frameTween = TweenLite.to(this, Math.random() * .2 + .9, { curFrame: Math.random() * 49, ease: "Cubic.easeOut" });
                    this.hitX *= -.7;
                    this.hitY *= -.8;
                }
                this.isResting = false;
            }
        };
        Pin.prototype.checkBallHit = function () {
            var _this = this;
            if (ball.offLane) {
                return;
            }
            var s1XOffset = ball.x;
            var s1YOffset = ball.y;
            var s2XOffset = this.x;
            var s2YOffset = this.y;
            var distance_squared = (((s1XOffset - s2XOffset) * (s1XOffset - s2XOffset)) + ((s1YOffset - s2YOffset) * (s1YOffset - s2YOffset)));
            var radii_squared = (ball.radius) * (this.radius);
            if (!this.hasWobbled && !this.hitByPin && distance_squared >= radii_squared && distance_squared < radii_squared * 1.2) {
                this.haveWobble();
            }
            if (distance_squared < radii_squared) {
                if (!ball.pinHitSound) {
                    ball.pinHitSound = true;
                    var pinsLeft = 0;
                    for (var i = 0; i < aLaneElements.length; i++) {
                        if (!aLaneElements[i].isBall && !aLaneElements[i].hitByBall && !aLaneElements[i].hitByPin) {
                            pinsLeft++;
                        }
                    }
                    if (pinsLeft < 3 || ball.x + ball.gutterX < canvas.width / 2 - 140 || ball.x + ball.gutterX > canvas.width / 2 + 140) {
                        playSound("pinsHit0");
                    }
                    else if (pinsLeft < 6) {
                        playSound("pinsHit" + (Math.floor(Math.random() * 2) + 1));
                    }
                    else {
                        playSound("pinsHit" + (Math.floor(Math.random() * 3) + 1));
                    }
                }
                var totRadius = (ball.radius + this.radius) / 2;
                this.hitY = (totRadius - Math.abs(ball.x - this.x)) / totRadius;
                var tempHitX = 1 - this.hitY;
                if (tempHitX > .5) {
                    tempHitX = this.hitY;
                }
                if (ball.x > this.x) {
                    this.hitX = -tempHitX;
                }
                else {
                    this.hitX = tempHitX;
                }
                if (this.posTween) {
                    this.posTween.kill();
                }
                if (this.bounceTween) {
                    this.bounceTween.kill();
                }
                if (this.frameTween) {
                    this.frameTween.kill();
                }
                this.hitEase = 1;
                this.posTween = TweenLite.to(this, Math.random() * 2 + 1.5, {
                    hitEase: 0, ease: "Quad.easeOut",
                    onComplete: function () {
                        _this.isResting = true;
                        elementAtRest();
                    }
                });
                var tempRot = 95;
                if (Math.random() * 2 > 1) {
                    tempRot = -95;
                }
                this.bounceTween = TweenLite.to(this, Math.random() * .2 + .9, { rot: tempRot * radian, ease: "Quad.easeOut" });
                var tempFrame = Math.min(25 + Math.floor(this.hitY * 25), 48);
                if (Math.random() * 2 > 1) {
                    tempFrame = Math.max(24 - Math.floor(this.hitY * 25), 0);
                }
                this.frameTween = TweenLite.to(this, Math.random() * .2 + .9, { curFrame: tempFrame, ease: "Cubic.easeOut" });
                this.hitByBall = true;
                this.isResting = false;
                this.offGroundYInc = -1200 * this.hitY;
            }
        };
        Pin.prototype.update = function () {
            this.radius = this.setRadius * this.scale;
            if (throwState <= 2) {
                this.x = canvas.width / 2 - this.posX * lane.aRowData[Math.floor(this.rowNum)].scale;
                this.y = lane.aRowData[Math.floor(this.rowNum)].y - canvas.height;
                this.scale = (lane.aRowData[Math.floor(this.rowNum)].scale) / 4500;
                this.rowNum += (lane.speed * .5) * delta;
            }
            else if (throwState > 2) {
                this.x += ((this.hitX * this.hitEase) * 3500) * delta;
                this.y -= ((this.hitY * this.hitEase) * 250 - (this.dropY * 1000)) * delta;
                this.offGroundYInc += 3000 * delta;
                this.offGroundY += this.offGroundYInc * delta;
                if (this.offGroundY > 0) {
                    this.offGroundY = 0;
                    this.offGroundYInc *= -.4;
                }
                if (this.dropY == 0) {
                    this.scale = this.startHitScale + (this.y - this.startHitY) * .006;
                }
                if (this.x < canvas.width / 2 - 180) {
                    this.x = canvas.width / 2 - 180;
                    this.hitX *= -1;
                }
                else if (this.x > canvas.width / 2 + 180) {
                    this.x = canvas.width / 2 + 180;
                    this.hitX *= -1;
                }
                if (this.y < -355 && !this.offLane) {
                    if (this.hitY < .85 || standingPins < 4) {
                        this.hitY = 0;
                        if (this.dropTween) {
                            this.posTween.kill();
                        }
                        this.dropY = 0;
                        this.dropTween = TweenLite.to(this, .5, { dropY: 1, ease: "Quad.easeIn" });
                        this.hitByBall = true;
                        this.hitByPin = true;
                        this.offLane = true;
                    }
                    else {
                        this.y = -355;
                        this.hitY *= -.2;
                    }
                }
                if (!this.hitByBall && !ball.inGutter) {
                    this.checkBallHit();
                }
                if (!this.hitByPin) {
                    this.checkAllPinsHit();
                }
            }
        };
        Pin.prototype.render = function () {
            var tempCurFrame = Math.floor(this.curFrame);
            var imgX = (tempCurFrame * this.oPinImgData.oData.spriteWidth) % this.oPinImgData.img.width;
            var imgY = Math.floor(tempCurFrame / (this.oPinImgData.img.width / this.oPinImgData.oData.spriteWidth)) * this.oPinImgData.oData.spriteHeight;
            ctx.save();
            ctx.translate(this.x, canvas.height + this.y - this.offGroundY * this.scale);
            ctx.scale(this.scale, this.scale);
            ctx.rotate(-this.rot);
            this.rotXOffset = (this.rot / radian) / 95 * 28;
            ctx.drawImage(this.oPinReflectImgData.img, imgX, imgY, this.oPinReflectImgData.oData.spriteWidth, this.oPinReflectImgData.oData.spriteHeight, -this.oPinReflectImgData.oData.spriteWidth / 2 - this.rotXOffset, -25, this.oPinReflectImgData.oData.spriteWidth, this.oPinReflectImgData.oData.spriteHeight);
            ctx.rotate(this.rot);
            ctx.scale(1 / this.scale, 1 / this.scale);
            ctx.translate(0, this.offGroundY * this.scale);
            ctx.translate(0, this.offGroundY * this.scale);
            ctx.scale(this.scale, this.scale);
            ctx.rotate(this.rot);
            ctx.drawImage(this.oPinImgData.img, imgX, imgY, this.oPinImgData.oData.spriteWidth, this.oPinImgData.oData.spriteHeight, -this.oPinImgData.oData.spriteWidth / 2 - this.rotXOffset, -this.oPinImgData.oData.spriteHeight + 25, this.oPinImgData.oData.spriteWidth, this.oPinImgData.oData.spriteHeight);
            ctx.restore();
        };
        return Pin;
    }());
    Elements.Pin = Pin;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Firework = (function (_super) {
        __extends(Firework, _super);
        function Firework() {
            var _this = _super.call(this, assetLib.getData("firework"), 30, 30, "explode") || this;
            _this.vy = 0;
            _this.setAnimType("once", "explode");
            _this.animEndedFunc = function () { this.removeMe = true; };
            return _this;
        }
        Firework.prototype.update = function (_trackX, _trackY) {
            this.vy += 150 * delta;
            this.y += this.vy * delta;
            _super.prototype.updateAnimation.call(this, delta);
        };
        Firework.prototype.render = function () {
            _super.prototype.renderSimple.call(this, ctx);
        };
        return Firework;
    }(Utils.AnimSprite));
    Elements.Firework = Firework;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var FallingItem = (function () {
        function FallingItem() {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.oPinImgData = assetLib.getData("pin");
            this.reset();
            this.y = Math.random() * canvas.height - canvas.height / 2;
        }
        FallingItem.prototype.reset = function () {
            this.x = Math.random() * canvas.width;
            this.y = -(canvas.height / 2 + 200);
            this.incY = Math.random() * 150 + 200;
            this.id = Math.floor(Math.random() * 49);
            this.rotation = Math.random() * 3.14;
            this.rotInc = Math.random() * 4 - 2;
            this.scale = 1;
        };
        FallingItem.prototype.update = function () {
            this.y += delta * this.incY;
            this.rotation += delta * this.rotInc;
            if (this.y > canvas.height / 2 + 200) {
                this.reset();
            }
        };
        FallingItem.prototype.render = function () {
            ctx.save();
            ctx.translate(this.x, canvas.height / 2 + this.y);
            ctx.rotate(this.rotation);
            var id = this.id;
            var imgX = (id * this.oPinImgData.oData.spriteWidth) % this.oPinImgData.img.width;
            var imgY = Math.floor(id / (this.oPinImgData.img.width / this.oPinImgData.oData.spriteWidth)) * this.oPinImgData.oData.spriteHeight;
            ctx.drawImage(this.oPinImgData.img, imgX + 1, imgY + 1, this.oPinImgData.oData.spriteWidth - 2, this.oPinImgData.oData.spriteHeight - 2, -(this.oPinImgData.oData.spriteWidth / 2) * this.scale, -(this.oPinImgData.oData.spriteHeight / 2) * this.scale, this.oPinImgData.oData.spriteWidth * this.scale, this.oPinImgData.oData.spriteHeight * this.scale);
            ctx.restore();
        };
        return FallingItem;
    }());
    Elements.FallingItem = FallingItem;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var TutAnim0 = (function (_super) {
        __extends(TutAnim0, _super);
        function TutAnim0() {
            return _super.call(this, assetLib.getData("tut0"), 18, 10, "anim") || this;
        }
        TutAnim0.prototype.update = function () {
            _super.prototype.updateAnimation.call(this, delta);
        };
        TutAnim0.prototype.render = function () {
            _super.prototype.renderSimple.call(this, ctx);
        };
        return TutAnim0;
    }(Utils.AnimSprite));
    Elements.TutAnim0 = TutAnim0;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var TutAnim1 = (function (_super) {
        __extends(TutAnim1, _super);
        function TutAnim1() {
            return _super.call(this, assetLib.getData("tut1"), 18, 10, "anim") || this;
        }
        TutAnim1.prototype.update = function () {
            _super.prototype.updateAnimation.call(this, delta);
        };
        TutAnim1.prototype.render = function () {
            _super.prototype.renderSimple.call(this, ctx);
        };
        return TutAnim1;
    }(Utils.AnimSprite));
    Elements.TutAnim1 = TutAnim1;
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var BallRoll = (function (_super) {
        __extends(BallRoll, _super);
        function BallRoll(_speed) {
            return _super.call(this, assetLib.getData("ballRoll"), _speed, 10, "anim") || this;
        }
        BallRoll.prototype.update = function () {
            _super.prototype.updateAnimation.call(this, delta);
        };
        BallRoll.prototype.render = function () {
            _super.prototype.renderSimple.call(this, ctx);
        };
        return BallRoll;
    }(Utils.AnimSprite));
    Elements.BallRoll = BallRoll;
})(Elements || (Elements = {}));
var Utils;
(function (Utils) {
    var JSONData = (function () {
        function JSONData() {
            this.textData = {
                "font0": {
                    "en": "BenchNine",
                    "fr": "BenchNine",
                    "it": "BenchNine",
                    "es": "BenchNine",
                    "de": "BenchNine",
                    "pt": "BenchNine",
                    "hu": "BenchNine",
                    "ro": "BenchNine",
                    "pl": "BenchNine",
                    "ru": "BenchNine",
                    "nl": "BenchNine",
                    "no": "BenchNine",
                    "da": "BenchNine",
                    "ar": "BenchNine",
                    "tr": "BenchNine",
                    "bg": "BenchNine",
                    "cs": "BenchNine",
                    "sv": "BenchNine"
                },
                "font1": {
                    "en": "Bangers",
                    "fr": "Bangers",
                    "it": "Bangers",
                    "es": "Bangers",
                    "de": "Bangers",
                    "pt": "Bangers",
                    "hu": "Bangers",
                    "ro": "Bangers",
                    "pl": "Bangers",
                    "ru": "Bangers",
                    "nl": "Bangers",
                    "no": "Bangers",
                    "da": "Bangers",
                    "ar": "Mada",
                    "tr": "Bangers",
                    "bg": "Bangers",
                    "cs": "Bangers",
                    "sv": "Bangers"
                },
                "font2": {
                    "en": "Mouse Memoirs",
                    "fr": "Mouse Memoirs",
                    "it": "Mouse Memoirs",
                    "es": "Mouse Memoirs",
                    "de": "Mouse Memoirs",
                    "pt": "Mouse Memoirs",
                    "hu": "Mouse Memoirs",
                    "ro": "BenchNine",
                    "pl": "Mouse Memoirs",
                    "ru": "PT Sans Narrow",
                    "nl": "Mouse Memoirs",
                    "no": "Mouse Memoirs",
                    "da": "Mouse Memoirs",
                    "ar": "Mada",
                    "tr": "Mouse Memoirs",
                    "bg": "PT Sans Narrow",
                    "es-419": "Mouse Memoirs",
                    "pt-br": "Mouse Memoirs",
                    "cs": "Mouse Memoirs",
                    "sv": "Mouse Memoirs"
                },
                "new": {
                    "en": "NEW!",
                    "es": "¡NUEVO!",
                    "de": "NEU!",
                    "pt": "NOVO!",
                    "hu": "ÚJ!",
                    "ro": "NOU!",
                    "pl": "NOWOŚĆ!",
                    "bg": "НОВО!",
                    "ru": "НОВИНКА!",
                    "nl": "NIEUW!",
                    "cz": "",
                    "no": "NYTT!",
                    "se": "",
                    "da": "NY!",
                    "ar": "جديد!",
                    "tr": "YENİ!",
                    "fr": "NOUVEAU !",
                    "it": "NUOVO!",
                    "cs": "NOVINKA!",
                    "sv": "NYHET!"
                },
                "highScore": {
                    "en": "HIGH SCORE",
                    "es": "MEJOR PUNTUACIÓN",
                    "de": "BESTE PUNKTZAHL",
                    "pt": "PONTUAÇÃO MÁXIMA",
                    "hu": "REKORD",
                    "ro": "CEL MAI BUN SCOR",
                    "pl": "REKORD",
                    "bg": "РЕКОРД",
                    "ru": "РЕКОРД",
                    "nl": "HOOGSTE SCORE",
                    "cz": "",
                    "no": "REKORD",
                    "se": "",
                    "da": "REKORD",
                    "ar": "أعلى النتائج",
                    "tr": "REKOR",
                    "fr": "MEILLEUR SCORE",
                    "it": "RECORD",
                    "cs": "TOP SKÓRE",
                    "sv": "POÄNGREKORD"
                },
                "finalScore": {
                    "en": "FINAL SCORE",
                    "es": "PUNTUACIÓN FINAL",
                    "de": "ENDSTAND",
                    "pt": "PONTUAÇÃO FINAL",
                    "hu": "VÉGEREDMÉNY",
                    "ro": "SCOR FINAL",
                    "pl": "WYNIK KOŃCOWY",
                    "bg": "КРАЕН РЕЗУЛТАТ",
                    "ru": "ИТОГОВЫЙ СЧЕТ",
                    "nl": "EINDSCORE",
                    "cz": "",
                    "no": "TOTALT ANTALL POENG",
                    "se": "",
                    "da": "SLUTRESULTAT",
                    "ar": "النتيجة النهائية",
                    "tr": "SON PUAN",
                    "fr": "SCORE FINAL",
                    "it": "PUNTEGGIO FINALE",
                    "cs": "KONEČNÝ VÝSLEDEK",
                    "sv": "SLUTPOÄNG"
                },
                "scoreSub0": {
                    "en": "PIN BONUS",
                    "es": "BONIFICACIÓN DE BOLO",
                    "de": "KEGEL-BONUS",
                    "pt": "BÓNUS DE PINO",
                    "hu": "BÁBUBÓNUSZ",
                    "ro": "POPIC BONUS",
                    "pl": "BONUS ZA KRĘGLE",
                    "bg": "БОНУС ЗА ПОВАЛЕНИ КЕГЛИ",
                    "ru": "БОНУС КЕГЛЕЙ",
                    "nl": "KEGELBONUS",
                    "cz": "",
                    "no": "KJEGLEBONUS",
                    "se": "",
                    "da": "KEGLEBONUS",
                    "ar": "مكافأة القارورات",
                    "tr": "LOBUT BONUSU",
                    "fr": "BONUS DE QUILLE",
                    "it": "BONUS BIRILLO",
                    "cs": "BONUS ZA KUŽELKU",
                    "sv": "KÄGELBONUS"
                },
                "scoreSub1": {
                    "en": "LEVEL BONUS",
                    "es": "BONIFICACIÓN DE NIVEL",
                    "de": "LEVEL-BONUS",
                    "pt": "BÓNUS DE NÍVEL",
                    "hu": "SZINTBÓNUSZ",
                    "ro": "NIVEL BONUS",
                    "pl": "BONUS ZA POZIOM",
                    "bg": "БОНУС ЗА НИВО",
                    "ru": "БОНУС УРОВНЯ",
                    "nl": "LEVELBONUS",
                    "cz": "",
                    "no": "NIVÅBONUS",
                    "se": "",
                    "da": "NIVEAUBONUS",
                    "ar": "مكافأة المستوى",
                    "tr": "BÖLÜM BONUSU",
                    "fr": "BONUS DE NIVEAU",
                    "it": "BONUS LIVELLO",
                    "cs": "BONUS ÚROVNĚ",
                    "sv": "NIVÅ"
                },
                "scoreSub2": {
                    "en": "STRIKE RUN",
                    "es": "TODO PLENOS",
                    "de": "STRIKE-LAUF",
                    "pt": "BOLA ÚNICA",
                    "hu": "TAROLÁSOS MENET",
                    "ro": "CURSĂ STRIKE",
                    "pl": "STRIKE",
                    "bg": "ТОЧКИ ЗА СТРАЙКОВЕ",
                    "ru": "СЕРИЯ СТРАЙКОВ",
                    "nl": "STRIKEREEKS",
                    "cz": "",
                    "no": "STRIKEBONUS",
                    "se": "",
                    "da": "STRIKESERIE",
                    "ar": "سلسة سترايك",
                    "tr": "STRIKE SERİSİ",
                    "fr": "RUN \nDE STRIKE",
                    "it": "STRIKE CONSECUTIVI",
                    "cs": "STRIKE RUN",
                    "sv": "STRIKE-SERIE"
                },
                "challengeIntro": {
                    "en": "Clear the pins on each level with a single throw!",
                    "es": "¡Tira los bolos en cada nivel con un solo lanzamiento!",
                    "de": "Wirf in jedem Level die Kegel mit nur einer Kugel um!",
                    "pt": "Elimina os pinos em cada nível com um só lançamento!",
                    "hu": "Döntsd le a bábukat az összes szinten egyetlen dobással!",
                    "ro": "Doboară popicele de pe fiecare nivel cu o singură aruncare!",
                    "pl": "Przewróć jednym rzutem wszystkie kręgle na każdym poziomie!",
                    "bg": "Повали всички кегли на всяко ниво само с едно единствено хвърляне.",
                    "ru": "Сбей все кегли на каждом уровне одним броском!",
                    "nl": "Gooi alle kegels steeds in één keer om!",
                    "cz": "",
                    "no": "Fjern alle kjeglene på hvert nivå med ett kast!",
                    "se": "",
                    "da": "Vælt keglerne på hvert niveau med ét enkelt kast!",
                    "ar": "أزل القارورات في كل مستوى بضربة واحدة!",
                    "tr": "Her bölümdeki lobutları tek atışta devir!",
                    "fr": "Renverse les quilles à chaque niveau avec un seul lancer !",
                    "it": "Butta giù i birilli a ogni livello con un solo lancio!",
                    "cs": "Sraz kuželky v každé úrovni jedním vrhem!",
                    "sv": "Rensa alla käglor på varje nivå med ett kast!"
                },
                "cleared": {
                    "en": "CLEARED!",
                    "es": "¡CONSEGUIDO!",
                    "de": "GESCHAFFT!",
                    "pt": "CONCLUÍDO!",
                    "hu": "TELJESÍTVE!",
                    "ro": "GATA!",
                    "pl": "UDAŁO SIĘ!",
                    "bg": "ЗАВЪРШЕНО!",
                    "ru": "ВСЁ ВЫБИТО!",
                    "nl": "GELUKT!",
                    "cz": "",
                    "no": "RYDDET UNNA!",
                    "se": "",
                    "da": "RYDDET!",
                    "ar": "تمت الإزالة!",
                    "tr": "TAMAMLANDI!",
                    "fr": "BRAVO !",
                    "it": "COMPLETATO!",
                    "cs": "ČISTO!",
                    "sv": "KLARAD!"
                },
                "life3": {
                    "en": "3 LIVES LEFT",
                    "es": "3 VIDAS RESTANTES",
                    "de": "3 LEBEN ÜBRIG",
                    "pt": "3 VIDAS RESTANTES",
                    "hu": "3 GURÍTÁSOD MARADT",
                    "ro": "3 VIEȚI RĂMASE",
                    "pl": "ZOSTAŁY 3 ŻYCIA",
                    "bg": "ОСТАВАТ ТИ 3 ЖИВОТА!",
                    "ru": "ОСТАЛОСЬ 3 ЖИЗНИ",
                    "nl": "NOG 3 LEVENS",
                    "cz": "",
                    "no": "3 LIV GJENSTÅR",
                    "se": "",
                    "da": "3 LIV TILBAGE",
                    "ar": "3 محاولات متبقية",
                    "tr": "3 CAN KALDI",
                    "fr": "3 VIES RESTANTES",
                    "it": "3 VITE RIMASTE",
                    "cs": "ZBÝVAJÍ 3 ŽIVOTY",
                    "sv": "3 LIV KVAR"
                },
                "level0": {
                    "en": "1/16",
                    "es": "NIVEL 1/16",
                    "de": "LEVEL 1/16",
                    "pt": "NÍVEL 1/16",
                    "hu": "1/16. SZINT",
                    "ro": "NIVELUL 1/16",
                    "pl": "POZIOM 1/16",
                    "bg": "НИВО 1/16",
                    "ru": "УРОВЕНЬ 1/16",
                    "nl": "LEVEL 1/16",
                    "cz": "",
                    "no": "NIVÅ 1/16",
                    "se": "",
                    "da": "NIVEAU 1/16",
                    "ar": "المستوى 1/16",
                    "tr": "BÖLÜM 1/16",
                    "fr": "NIVEAU 1/16",
                    "it": "LIVELLO 1/16",
                    "cs": "ÚROVEŇ 1/16",
                    "sv": "NIVÅ 1/16"
                },
                "level1": {
                    "en": "2/16",
                    "es": "NIVEL 2/16",
                    "de": "LEVEL 2/16",
                    "pt": "NÍVEL 2/16",
                    "hu": "2/16. SZINT",
                    "ro": "NIVELUL 2/16",
                    "pl": "POZIOM 2/16",
                    "bg": "НИВО 2/16",
                    "ru": "УРОВЕНЬ 2/16",
                    "nl": "LEVEL 2/16",
                    "cz": "",
                    "no": "NIVÅ 2/16",
                    "se": "",
                    "da": "NIVEAU 2/16",
                    "ar": "المستوى 2/16",
                    "tr": "BÖLÜM 2/16",
                    "fr": "NIVEAU 2/16",
                    "it": "LIVELLO 2/16",
                    "cs": "ÚROVEŇ 2/16",
                    "sv": "NIVÅ 2/16"
                },
                "level2": {
                    "en": "3/16",
                    "es": "NIVEL 3/16",
                    "de": "LEVEL 3/16",
                    "pt": "NÍVEL 3/16",
                    "hu": "3/16. SZINT",
                    "ro": "NIVELUL 3/16",
                    "pl": "POZIOM 3/16",
                    "bg": "НИВО 3/16",
                    "ru": "УРОВЕНЬ 3/16",
                    "nl": "LEVEL 3/16",
                    "cz": "",
                    "no": "NIVÅ 3/16",
                    "se": "",
                    "da": "NIVEAU 3/16",
                    "ar": "المستوى 3/16",
                    "tr": "BÖLÜM 3/16",
                    "fr": "NIVEAU 3/16",
                    "it": "LIVELLO 3/16",
                    "cs": "ÚROVEŇ 3/16",
                    "sv": "NIVÅ 3/16"
                },
                "level3": {
                    "en": "4/16",
                    "es": "NIVEL 4/16",
                    "de": "LEVEL 4/16",
                    "pt": "NÍVEL 4/16",
                    "hu": "4/16. SZINT",
                    "ro": "NIVELUL 4/16",
                    "pl": "POZIOM 4/16",
                    "bg": "НИВО 4/16",
                    "ru": "УРОВЕНЬ 4/16",
                    "nl": "LEVEL 4/16",
                    "cz": "",
                    "no": "NIVÅ 4/16",
                    "se": "",
                    "da": "NIVEAU 4/16",
                    "ar": "المستوى 4/16",
                    "tr": "BÖLÜM 4/16",
                    "fr": "NIVEAU 4/16",
                    "it": "LIVELLO 4/16",
                    "cs": "ÚROVEŇ 4/16",
                    "sv": "NIVÅ 4/16"
                },
                "level4": {
                    "en": "5/16",
                    "es": "NIVEL 5/16",
                    "de": "LEVEL 5/16",
                    "pt": "NÍVEL 5/16",
                    "hu": "5/16. SZINT",
                    "ro": "NIVELUL 5/16",
                    "pl": "POZIOM 5/16",
                    "bg": "НИВО 5/16",
                    "ru": "УРОВЕНЬ 5/16",
                    "nl": "LEVEL 5/16",
                    "cz": "",
                    "no": "NIVÅ 5/16",
                    "se": "",
                    "da": "NIVEAU 5/16",
                    "ar": "المستوى 5/16",
                    "tr": "BÖLÜM 5/16",
                    "fr": "NIVEAU 5/16",
                    "it": "LIVELLO 5/16",
                    "cs": "ÚROVEŇ 5/16",
                    "sv": "NIVÅ 5/16"
                },
                "level5": {
                    "en": "6/16",
                    "es": "NIVEL 6/16",
                    "de": "LEVEL 6/16",
                    "pt": "NÍVEL 6/16",
                    "hu": "6/16. SZINT",
                    "ro": "NIVELUL 6/16",
                    "pl": "POZIOM 6/16",
                    "bg": "НИВО 6/16",
                    "ru": "УРОВЕНЬ 6/16",
                    "nl": "LEVEL 6/16",
                    "cz": "",
                    "no": "NIVÅ 6/16",
                    "se": "",
                    "da": "NIVEAU 6/16",
                    "ar": "المستوى 6/16",
                    "tr": "BÖLÜM 6/16",
                    "fr": "NIVEAU 6/16",
                    "it": "LIVELLO 6/16",
                    "cs": "ÚROVEŇ 6/16",
                    "sv": "NIVÅ 6/16"
                },
                "level6": {
                    "en": "7/16",
                    "es": "NIVEL 7/16",
                    "de": "LEVEL 7/16",
                    "pt": "NÍVEL 7/16",
                    "hu": "7/16. SZINT",
                    "ro": "NIVELUL 7/16",
                    "pl": "POZIOM 7/16",
                    "bg": "НИВО 7/16",
                    "ru": "УРОВЕНЬ 7/16",
                    "nl": "LEVEL 7/16",
                    "cz": "",
                    "no": "NIVÅ 7/16",
                    "se": "",
                    "da": "NIVEAU 7/16",
                    "ar": "المستوى 7/16",
                    "tr": "BÖLÜM 7/16",
                    "fr": "NIVEAU 7/16",
                    "it": "LIVELLO 7/16",
                    "cs": "ÚROVEŇ 7/16",
                    "sv": "NIVÅ 7/16"
                },
                "level7": {
                    "en": "8/16",
                    "es": "NIVEL 8/16",
                    "de": "LEVEL 8/16",
                    "pt": "NÍVEL 8/16",
                    "hu": "8/16. SZINT",
                    "ro": "NIVELUL 8/16",
                    "pl": "POZIOM 8/16",
                    "bg": "НИВО 8/16",
                    "ru": "УРОВЕНЬ 8/16",
                    "nl": "LEVEL 8/16",
                    "cz": "",
                    "no": "NIVÅ 8/16",
                    "se": "",
                    "da": "NIVEAU 8/16",
                    "ar": "المستوى 8/16",
                    "tr": "BÖLÜM 8/16",
                    "fr": "NIVEAU 8/16",
                    "it": "LIVELLO 8/16",
                    "cs": "ÚROVEŇ 8/16",
                    "sv": "NIVÅ 8/16"
                },
                "level8": {
                    "en": "9/16",
                    "es": "NIVEL 9/16",
                    "de": "LEVEL 9/16",
                    "pt": "NÍVEL 9/16",
                    "hu": "9/16. SZINT",
                    "ro": "NIVELUL 9/16",
                    "pl": "POZIOM 9/16",
                    "bg": "НИВО 9/16",
                    "ru": "УРОВЕНЬ 9/16",
                    "nl": "LEVEL 9/16",
                    "cz": "",
                    "no": "NIVÅ 9/16",
                    "se": "",
                    "da": "NIVEAU 9/16",
                    "ar": "المستوى 9/16",
                    "tr": "BÖLÜM 9/16",
                    "fr": "NIVEAU 9/16",
                    "it": "LIVELLO 9/16",
                    "cs": "ÚROVEŇ 9/16",
                    "sv": "NIVÅ 9/16"
                },
                "level9": {
                    "en": "10/16",
                    "es": "NIVEL 10/16",
                    "de": "LEVEL 10/16",
                    "pt": "NÍVEL 10/16",
                    "hu": "10/16. SZINT",
                    "ro": "NIVELUL 10/16",
                    "pl": "POZIOM 10/16",
                    "bg": "НИВО 10/16",
                    "ru": "УРОВЕНЬ 10/16",
                    "nl": "LEVEL 10/16",
                    "cz": "",
                    "no": "NIVÅ 10/16",
                    "se": "",
                    "da": "NIVEAU 10/16",
                    "ar": "المستوى 10/16",
                    "tr": "BÖLÜM 10/16",
                    "fr": "NIVEAU 10/16",
                    "it": "LIVELLO 10/16",
                    "cs": "ÚROVEŇ 10/16",
                    "sv": "NIVÅ 10/16"
                },
                "level10": {
                    "en": "11/16",
                    "es": "NIVEL 11/16",
                    "de": "LEVEL 11/16",
                    "pt": "NÍVEL 11/16",
                    "hu": "11/16. SZINT",
                    "ro": "NIVELUL 11/16",
                    "pl": "POZIOM 11/16",
                    "bg": "НИВО 11/16",
                    "ru": "УРОВЕНЬ 11/16",
                    "nl": "LEVEL 11/16",
                    "cz": "",
                    "no": "NIVÅ 11/16",
                    "se": "",
                    "da": "NIVEAU 11/16",
                    "ar": "المستوى 11/16",
                    "tr": "BÖLÜM 11/16",
                    "fr": "NIVEAU 11/16",
                    "it": "LIVELLO 11/16",
                    "cs": "ÚROVEŇ 11/16",
                    "sv": "NIVÅ 11/16"
                },
                "level11": {
                    "en": "12/16",
                    "es": "NIVEL 12/16",
                    "de": "LEVEL 12/16",
                    "pt": "NÍVEL 12/16",
                    "hu": "12/16. SZINT",
                    "ro": "NIVELUL 12/16",
                    "pl": "POZIOM 12/16",
                    "bg": "НИВО 12/16",
                    "ru": "УРОВЕНЬ 12/16",
                    "nl": "LEVEL 12/16",
                    "cz": "",
                    "no": "NIVÅ 12/16",
                    "se": "",
                    "da": "NIVEAU 12/16",
                    "ar": "المستوى 12/16",
                    "tr": "BÖLÜM 12/16",
                    "fr": "NIVEAU 12/16",
                    "it": "LIVELLO 12/16",
                    "cs": "ÚROVEŇ 12/16",
                    "sv": "NIVÅ 12/16"
                },
                "level12": {
                    "en": "13/16",
                    "es": "NIVEL 13/16",
                    "de": "LEVEL 13/16",
                    "pt": "NÍVEL 13/16",
                    "hu": "13/16. SZINT",
                    "ro": "NIVELUL 13/16",
                    "pl": "POZIOM 13/16",
                    "bg": "НИВО 13/16",
                    "ru": "УРОВЕНЬ 13/16",
                    "nl": "LEVEL 13/16",
                    "cz": "",
                    "no": "NIVÅ 13/16",
                    "se": "",
                    "da": "NIVEAU 13/16",
                    "ar": "المستوى 13/16",
                    "tr": "BÖLÜM 13/16",
                    "fr": "NIVEAU 13/16",
                    "it": "LIVELLO 13/16",
                    "cs": "ÚROVEŇ 13/16",
                    "sv": "NIVÅ 13/16"
                },
                "level13": {
                    "en": "14/16",
                    "es": "NIVEL 14/16",
                    "de": "LEVEL 14/16",
                    "pt": "NÍVEL 14/16",
                    "hu": "14/16. SZINT",
                    "ro": "NIVELUL 14/16",
                    "pl": "POZIOM 14/16",
                    "bg": "НИВО 14/16",
                    "ru": "УРОВЕНЬ 14/16",
                    "nl": "LEVEL 14/16",
                    "cz": "",
                    "no": "NIVÅ 14/16",
                    "se": "",
                    "da": "NIVEAU 14/16",
                    "ar": "المستوى 14/16",
                    "tr": "BÖLÜM 14/16",
                    "fr": "NIVEAU 14/16",
                    "it": "LIVELLO 14/16",
                    "cs": "ÚROVEŇ 14/16",
                    "sv": "NIVÅ 14/16"
                },
                "level14": {
                    "en": "15/16",
                    "es": "NIVEL 15/16",
                    "de": "LEVEL 15/16",
                    "pt": "NÍVEL 15/16",
                    "hu": "15/16. SZINT",
                    "ro": "NIVELUL 15/16",
                    "pl": "POZIOM 15/16",
                    "bg": "НИВО 15/16",
                    "ru": "УРОВЕНЬ 15/16",
                    "nl": "LEVEL 15/16",
                    "cz": "",
                    "no": "NIVÅ 15/16",
                    "se": "",
                    "da": "NIVEAU 15/16",
                    "ar": "المستوى 15/16",
                    "tr": "BÖLÜM 15/16",
                    "fr": "NIVEAU 15/16",
                    "it": "LIVELLO 15/16",
                    "cs": "ÚROVEŇ 15/16",
                    "sv": "NIVÅ 15/16"
                },
                "level15": {
                    "en": "16/16",
                    "es": "ÚLTIMO NIVEL",
                    "de": "LETZTES LEVEL",
                    "pt": "ÚLTIMO NÍVEL",
                    "hu": "UTOLSÓ SZINT",
                    "ro": "NIVELUL FINAL",
                    "pl": "OSTATNI POZIOM",
                    "bg": "ФИНАЛНО НИВО",
                    "ru": "ПОСЛЕДНИЙ УРОВЕНЬ",
                    "nl": "LAATSTE LEVEL",
                    "cz": "",
                    "no": "SISTE NIVÅ",
                    "se": "",
                    "da": "SIDSTE NIVEAU",
                    "ar": "المستوى النهائي",
                    "tr": "SON BÖLÜM",
                    "fr": "DERNIER NIVEAU",
                    "it": "Ultimo livello",
                    "cs": "POSLEDNÍ ÚROVEŇ",
                    "sv": "SISTA NIVÅN"
                },
                "life4": {
                    "en": "4 LIVES LEFT",
                    "es": "4 VIDAS RESTANTES",
                    "de": "4 LEBEN ÜBRIG",
                    "pt": "4 VIDAS RESTANTES",
                    "hu": "4 GURÍTÁSOD MARADT",
                    "ro": "4 VIEȚI RĂMASE",
                    "pl": "ZOSTAŁY 4 ŻYCIA",
                    "bg": "ОСТАВАТ ТИ 4 ЖИВОТА!",
                    "ru": "ОСТАЛОСЬ 4 ЖИЗНИ",
                    "nl": "NOG 4 LEVENS",
                    "cz": "",
                    "no": "4 LIV GJENSTÅR",
                    "se": "",
                    "da": "4 LIV TILBAGE",
                    "ar": "4 محاولات متبقية",
                    "tr": "4 CAN KALDI",
                    "fr": "4 VIES RESTANTES",
                    "it": "4 VITE RIMASTE",
                    "cs": "ZBÝVAJÍ 4 ŽIVOTY",
                    "sv": "4 LIV KVAR"
                },
                "life2": {
                    "en": "2 LIVES LEFT",
                    "es": "2 VIDAS RESTANTES",
                    "de": "2 LEBEN ÜBRIG",
                    "pt": "2 VIDAS RESTANTES",
                    "hu": "2 GURÍTÁSOD MARADT",
                    "ro": "2 VIEȚI RĂMASE",
                    "pl": "ZOSTAŁY 2 ŻYCIA",
                    "bg": "ОСТАВАТ ТИ 2 ЖИВОТА!",
                    "ru": "ОСТАЛОСЬ 2 ЖИЗНИ",
                    "nl": "NOG 2 LEVENS",
                    "cz": "",
                    "no": "2 LIV GJENSTÅR",
                    "se": "",
                    "da": "2 LIV TILBAGE",
                    "ar": "محاولتان متبقيتان",
                    "tr": "2 CAN KALDI",
                    "fr": "2 VIES RESTANTES",
                    "it": "2 VITE RIMASTE",
                    "cs": "ZBÝVAJÍ 2 ŽIVOTY",
                    "sv": "2 LIV KVAR"
                },
                "life1": {
                    "en": "1 LIFE LEFT",
                    "es": "1 VIDA RESTANTE",
                    "de": "1 LEBEN ÜBRIG",
                    "pt": "1 VIDA RESTANTE",
                    "hu": "1 GURÍTÁSOD MARADT",
                    "ro": "1 VIAȚĂ RĂMASĂ",
                    "pl": "ZOSTAŁO 1 ŻYCIE",
                    "bg": "ОСТАВА ТИ 1 ЖИВОТ!",
                    "ru": "ОСТАЛАСЬ 1 ЖИЗНЬ",
                    "nl": "NOG 1 LEVEN",
                    "cz": "",
                    "no": "1 LIV GJENSTÅR",
                    "se": "",
                    "da": "1 LIV TILBAGE",
                    "ar": "محاولة متبقية",
                    "tr": "1 CAN KALDI",
                    "fr": "1 VIE RESTANTE",
                    "it": "1 VITA RIMASTA",
                    "cs": "ZBÝVÁ 1 ŽIVOT",
                    "sv": "1 LIV KVAR"
                },
                "life0": {
                    "en": "0 LIVES LEFT",
                    "es": "0 VIDAS RESTANTES",
                    "de": "0 LEBEN ÜBRIG",
                    "pt": "0 VIDAS RESTANTES",
                    "hu": "0 GURÍTÁSOD MARADT",
                    "ro": "0 VIEȚI RĂMASE",
                    "pl": "ZOSTAŁO 0 ŻYĆ",
                    "bg": "ОСТАВАТ ТИ 0 ЖИВОТА!",
                    "ru": "ОСТАЛОСЬ 0 ЖИЗНЕЙ",
                    "nl": "0 LEVENS OVER",
                    "cz": "",
                    "no": "0 LIV GJENSTÅR",
                    "se": "",
                    "da": "0 LIV TILBAGE",
                    "ar": "لا توجد محاولات متبقية",
                    "tr": "0 CAN KALDI",
                    "fr": "0 VIE RESTANTE",
                    "it": "0 VITE RIMASTE",
                    "cs": "ZBÝVÁ 0 ŽIVOTŮ",
                    "sv": "0 LIV KVAR"
                },
                "gameOver": {
                    "en": "GAME OVER!",
                    "es": "FIN DE LA PARTIDA",
                    "de": "SPIEL VORBEI!",
                    "pt": "FIM DO JOGO!",
                    "hu": "JÁTÉK VÉGE!",
                    "ro": "JOC TERMINAT!",
                    "pl": "KONIEC GRY!",
                    "bg": "КРАЙ НА ИГРАТА",
                    "ru": "ИГРА ОКОНЧЕНА!",
                    "nl": "GAME OVER!",
                    "cz": "",
                    "no": "SPILLET ER SLUTT!",
                    "se": "",
                    "da": "SPILLET ER SLUT!",
                    "ar": "انتهت اللعبة!",
                    "tr": "OYUN BİTTİ!",
                    "fr": "PARTIE TERMINÉE !",
                    "it": "GAME OVER!",
                    "cs": "KONEC HRY!",
                    "sv": "SPELET ÄR SLUT!"
                },
                "singlePlayer": {
                    "en": "Single Player",
                    "es": "Un jugador",
                    "de": "Einzelspieler",
                    "pt": "Um jogador",
                    "hu": "Egy játékos",
                    "ro": "Jucător unic",
                    "pl": "Jeden gracz",
                    "bg": "Самостоятелна игра",
                    "ru": "Один игрок",
                    "nl": "Eén speler",
                    "cz": "",
                    "no": "Én spiller",
                    "se": "",
                    "da": "Én spiller",
                    "ar": "لاعب واحد",
                    "tr": "Tek Oyunculu",
                    "fr": "Solo",
                    "it": "Giocatore singolo",
                    "cs": "Jeden hráč",
                    "sv": "En spelare"
                },
                "twoPlayers": {
                    "en": "Two Players",
                    "es": "Dos jugadores",
                    "de": "Zwei Spieler",
                    "pt": "Dois jogadores",
                    "hu": "Két játékos",
                    "ro": "Doi jucători",
                    "pl": "Dwóch graczy",
                    "bg": "Двама играчи",
                    "ru": "Два игрока",
                    "nl": "Twee spelers",
                    "cz": "",
                    "no": "To spillere",
                    "se": "",
                    "da": "To spillere",
                    "ar": "لاعبان",
                    "tr": "İki Oyunculu",
                    "fr": "Deux joueurs",
                    "it": "Due giocatori",
                    "cs": "Dva hráči",
                    "sv": "Två spelare"
                },
                "cupWinner0": {
                    "en": "CUP WINNER!",
                    "es": "¡GANADOR DEL TORNEO!",
                    "de": "TURNIERSIEGER!",
                    "pt": "VENCEDOR DO TORNEIO!",
                    "hu": "KUPAGYŐZTES!",
                    "ro": "CÂȘTIGĂTORUL CUPEI!",
                    "pl": "ZDOBYWCA PUCHARU!",
                    "bg": "НОСИТЕЛ НА КУПАТА!",
                    "ru": "ОБЛАДАТЕЛЬ КУБКА!",
                    "nl": "BEKERWINNAR!",
                    "cz": "",
                    "no": "TURNERINGSVINNER!",
                    "se": "",
                    "da": "TURNERINGENS VINDER!",
                    "ar": "الفائز بالكأس!",
                    "tr": "KUPANIN SAHİBİ!",
                    "fr": "GAGNANT DE LA COUPE !",
                    "it": "VINCITORE DEL TORNEO!",
                    "cs": "VÍTĚZ POHÁRU!",
                    "sv": "CUP-SEGRARE!"
                },
                "cupWinner1": {
                    "en": "CHALLENGE COMPLETE!",
                    "es": "¡DESAFÍO COMPLETADO!",
                    "de": "HERAUSFORDERUNG ABGESCHLOSSEN!",
                    "pt": "DESAFIO CONCLUÍDO!",
                    "hu": "KIHÍVÁS TELJESÍTVE!",
                    "ro": "PROVOCARE ÎNCHEIATĂ!",
                    "pl": "WYZWANIE UKOŃCZONE!",
                    "bg": "ПРЕДИЗВИКАТЕЛСТВОТО Е ЗАВЪРШЕНО!",
                    "ru": "ИСПЫТАНИЕ ВЫПОЛНЕНО!",
                    "nl": "UITDAGING VOLTOOID!",
                    "cz": "",
                    "no": "UTFORDRING FULLFØRT!",
                    "se": "",
                    "da": "UDFORDRING GENNEMFØRT!",
                    "ar": "اكتمل التحدي!",
                    "tr": "MÜCADELE TAMAMLANDI!",
                    "fr": "DÉFI ACCOMPLI !",
                    "it": "SFIDA COMPLETATA!",
                    "cs": "VÝZVA SPLNĚNA!",
                    "sv": "UTMANING AVKLARAD!"
                },
                "restart": {
                    "en": "Restart",
                    "es": "Reiniciar",
                    "de": "Neu starten",
                    "pt": "Recomeçar",
                    "hu": "Újraindítás",
                    "ro": "Reîncepe",
                    "pl": "Nowa gra",
                    "bg": "Рестарт",
                    "ru": "Заново",
                    "nl": "Opnieuw beginnen",
                    "cz": "",
                    "no": "Start på nytt",
                    "se": "",
                    "da": "Start forfra",
                    "ar": "إعادة التشغيل",
                    "tr": "Baştan Başla",
                    "fr": "Recommencer",
                    "it": "Ricomincia",
                    "cs": "Restartovat",
                    "sv": "Börja om"
                },
                "progress": {
                    "en": "Progress",
                    "es": "Progreso",
                    "de": "Fortschritt",
                    "pt": "Progresso",
                    "hu": "Folyamatban",
                    "ro": "Progres",
                    "pl": "Postęp",
                    "bg": "Напредък",
                    "ru": "Прогресс",
                    "nl": "Voortgang",
                    "cz": "",
                    "no": "Fremdrift",
                    "se": "",
                    "da": "Status",
                    "ar": "التقدم",
                    "tr": "İlerleme",
                    "fr": "Progression",
                    "it": "Avanzamento",
                    "cs": "Pokrok",
                    "sv": "Framsteg"
                },
                "resetData": {
                    "en": "Reset Data",
                    "es": "Borrar datos",
                    "de": "Daten zurücksetzen",
                    "pt": "Apagar dados",
                    "hu": "Vissza",
                    "ro": "Resetează datele",
                    "pl": "Resetuj dane",
                    "bg": "Нулиране на данните",
                    "ru": "Сброс данных",
                    "nl": "Gegevens resetten",
                    "cz": "",
                    "no": "Tilbakestill data",
                    "se": "",
                    "da": "Nulstil data",
                    "ar": "إعادة تعيين البيانات",
                    "tr": "Veriyi Sıfırla",
                    "fr": "Réinitialiser les données",
                    "it": "Azzera dati",
                    "cs": "Resetovat data",
                    "sv": "Återställ data"
                },
                "unlock1": {
                    "en": "BEAT LEVEL 2 TO UNLOCK!",
                    "es": "¡SUPERA EL NIVEL 2 PARA DESBLOQUEAR!",
                    "de": "GEWINNE LEVEL 2 ZUM FREISCHALTEN!",
                    "pt": "VENCE O NÍVEL 2 PARA DESBLOQUEAR!",
                    "hu": "NYERD MEG A 2. SZINTET, ÉS MEGSZERZED!",
                    "ro": "DEPĂȘEȘTE NIVELUL 2 PENTRU A DEBLOCA!",
                    "pl": "ABY ODBLOKOWAĆ, UKOŃCZ 2 POZIOM!",
                    "bg": "СПЕЧЕЛИ НИВО 2, ЗА ДА ОТКЛЮЧИШ ТОВА!",
                    "ru": "ПРОЙДИ 2-Й УРОВЕНЬ, ЧТОБЫ ОТКРЫТЬ!",
                    "nl": "HAAL LEVEL 2 OM DIT VRIJ TE SPELEN!",
                    "cz": "",
                    "no": "GJENNOMFØR NIVÅ 2 FOR Å LÅSE OPP!",
                    "se": "",
                    "da": "GENNEMFØR NIVEAU 2 FOR AT LÅSE OP!",
                    "ar": "انتصر في المستوى 2 لفتح القفل!",
                    "tr": "AÇMAK İÇİN 2. BÖLÜMÜ GEÇ!\n",
                    "fr": "PASSE LE NIVEAU 2 POUR DÉBLOQUER !",
                    "it": "SUPERA IL LIVELLO 2 PER SBLOCCARLO!",
                    "cs": "K ODEMKNUTÍ VYHRAJ ÚROVEŇ 2!",
                    "sv": "KLARA NIVÅ 2 FÖR ATT LÅSA UPP!"
                },
                "unlock3": {
                    "en": "BEAT LEVEL 4 TO UNLOCK!",
                    "es": "¡SUPERA EL NIVEL 4 PARA DESBLOQUEAR!",
                    "de": "GEWINNE LEVEL 4 ZUM FREISCHALTEN!",
                    "pt": "VENCE O NÍVEL 4 PARA DESBLOQUEAR!",
                    "hu": "NYERD MEG A 4. SZINTET, ÉS MEGSZERZED!",
                    "ro": "DEPĂȘEȘTE NIVELUL 4 PENTRU A DEBLOCA!",
                    "pl": "ABY ODBLOKOWAĆ, UKOŃCZ 4 POZIOM!",
                    "bg": "СПЕЧЕЛИ НИВО 4, ЗА ДА ОТКЛЮЧИШ ТОВА!",
                    "ru": "ПРОЙДИ 4-Й УРОВЕНЬ, ЧТОБЫ ОТКРЫТЬ!",
                    "nl": "HAAL LEVEL 4 OM DIT VRIJ TE SPELEN!",
                    "cz": "",
                    "no": "GJENNOMFØR NIVÅ 4 FOR Å LÅSE OPP!",
                    "se": "",
                    "da": "GENNEMFØR NIVEAU 4 FOR AT LÅSE OP!",
                    "ar": "انتصر في المستوى 4 لفتح القفل!",
                    "tr": "AÇMAK İÇİN 4. BÖLÜMÜ GEÇ!\n",
                    "fr": "PASSE LE NIVEAU 4 POUR DÉBLOQUER !",
                    "it": "SUPERA IL LIVELLO 4 PER SBLOCCARLO!",
                    "cs": "K ODEMKNUTÍ VYHRAJ ÚROVEŇ 4!",
                    "sv": "KLARA NIVÅ 4 FÖR ATT LÅSA UPP!"
                },
                "unlock5": {
                    "en": "BEAT LEVEL 6 TO UNLOCK!",
                    "es": "¡SUPERA EL NIVEL 6 PARA DESBLOQUEAR!",
                    "de": "GEWINNE LEVEL 6 ZUM FREISCHALTEN!",
                    "pt": "VENCE O NÍVEL 6 PARA DESBLOQUEAR!",
                    "hu": "NYERD MEG A 6. SZINTET, ÉS MEGSZERZED",
                    "ro": "DEPĂȘEȘTE NIVELUL 6 PENTRU A DEBLOCA!",
                    "pl": "ABY ODBLOKOWAĆ, UKOŃCZ 6 POZIOM!",
                    "bg": "СПЕЧЕЛИ НИВО 6, ЗА ДА ОТКЛЮЧИШ ТОВА!",
                    "ru": "ПРОЙДИ 6-Й УРОВЕНЬ, ЧТОБЫ ОТКРЫТЬ!",
                    "nl": "HAAL LEVEL 6 OM DIT VRIJ TE SPELEN!",
                    "cz": "",
                    "no": "GJENNOMFØR NIVÅ 6 FOR Å LÅSE OPP!",
                    "se": "",
                    "da": "GENNEMFØR NIVEAU 6 FOR AT LÅSE OP!",
                    "ar": "انتصر في المستوى 6 لفتح القفل!",
                    "tr": "AÇMAK İÇİN 6. BÖLÜMÜ GEÇ!\n",
                    "fr": "PASSE LE NIVEAU 6 POUR DÉBLOQUER !",
                    "it": "SUPERA IL LIVELLO 6 PER SBLOCCARLO!",
                    "cs": "K ODEMKNUTÍ VYHRAJ ÚROVEŇ 6!",
                    "sv": "KLARA NIVÅ 6 FÖR ATT LÅSA UPP!"
                },
                "unlock7": {
                    "en": "BEAT LEVEL 8 TO UNLOCK!",
                    "es": "¡SUPERA EL NIVEL 8 PARA DESBLOQUEAR!",
                    "de": "GEWINNE LEVEL 8 ZUM FREISCHALTEN!",
                    "pt": "VENCE O NÍVEL 8 PARA DESBLOQUEAR!",
                    "hu": "NYERD MEG A 8. SZINTET, ÉS MEGSZERZED!",
                    "ro": "DEPĂȘEȘTE NIVELUL 8 PENTRU A DEBLOCA!",
                    "pl": "ABY ODBLOKOWAĆ, UKOŃCZ 8 POZIOM!",
                    "bg": "СПЕЧЕЛИ НИВО 8, ЗА ДА ОТКЛЮЧИШ ТОВА!",
                    "ru": "ПРОЙДИ 8-Й УРОВЕНЬ, ЧТОБЫ ОТКРЫТЬ!",
                    "nl": "HAAL LEVEL 8 OM DIT VRIJ TE SPELEN!",
                    "cz": "",
                    "no": "GJENNOMFØR NIVÅ 8 FOR Å LÅSE OPP!",
                    "se": "",
                    "da": "GENNEMFØR NIVEAU 8 FOR AT LÅSE OP!",
                    "ar": "انتصر في المستوى 8 لفتح القفل!",
                    "tr": "AÇMAK İÇİN 8. BÖLÜMÜ GEÇ!\n",
                    "fr": "PASSE LE NIVEAU 8 POUR DÉBLOQUER !",
                    "it": "SUPERA IL LIVELLO 8 PER SBLOCCARLO!",
                    "cs": "K ODEMKNUTÍ VYHRAJ ÚROVEŇ 8!",
                    "sv": "KLARA NIVÅ 8 FÖR ATT LÅSA UPP!"
                },
                "unlock9": {
                    "en": "BEAT LEVEL 10 TO UNLOCK!",
                    "es": "¡SUPERA EL NIVEL 10 PARA DESBLOQUEAR!",
                    "de": "GEWINNE LEVEL 10 ZUM FREISCHALTEN!",
                    "pt": "VENCE O NÍVEL 10 PARA DESBLOQUEAR!",
                    "hu": "NYERD MEG A 10. SZINTET, ÉS MEGSZERZED!",
                    "ro": "DEPĂȘEȘTE NIVELUL 10 PENTRU A DEBLOCA!",
                    "pl": "ABY ODBLOKOWAĆ, UKOŃCZ 10 POZIOM!",
                    "bg": "СПЕЧЕЛИ НИВО 10, ЗА ДА ОТКЛЮЧИШ ТОВА!",
                    "ru": "ПРОЙДИ 10-Й УРОВЕНЬ, ЧТОБЫ ОТКРЫТЬ!",
                    "nl": "HAAL LEVEL 9 OM DIT VRIJ TE SPELEN!",
                    "cz": "",
                    "no": "GJENNOMFØR NIVÅ 10 FOR Å LÅSE OPP!",
                    "se": "",
                    "da": "GENNEMFØR NIVEAU 10 FOR AT LÅSE OP!",
                    "ar": "انتصر في المستوى 10 لفتح القفل!",
                    "tr": "AÇMAK İÇİN 10. BÖLÜMÜ GEÇ!\n",
                    "fr": "PASSE LE NIVEAU 10 POUR DÉBLOQUER !",
                    "it": "SUPERA IL LIVELLO 10 PER SBLOCCARLO!",
                    "cs": "K ODEMKNUTÍ VYHRAJ ÚROVEŇ 10!",
                    "sv": "KLARA NIVÅ 10 FÖR ATT LÅSA UPP!"
                },
                "miss": {
                    "en": "MISS!",
                    "es": "¡FALLO!",
                    "de": "DANEBEN!",
                    "pt": "FALHASTE!",
                    "hu": "MELLÉ!",
                    "ro": "RATARE!",
                    "pl": "PUDŁO!",
                    "bg": "ПРОПУСК",
                    "ru": "ПРОМАХ!",
                    "nl": "MIS!",
                    "cz": "",
                    "no": "MISS!",
                    "se": "",
                    "da": "FORBIER!",
                    "ar": "خطأ!",
                    "tr": "ISKA!",
                    "fr": "MANQUÉ !",
                    "it": "MANCATO!",
                    "cs": "VEDLE!",
                    "sv": "MISS!"
                },
                "strike": {
                    "en": "STRIKE!",
                    "es": "¡PLENO!",
                    "de": "STRIKE!",
                    "pt": "STRIKE!",
                    "hu": "TAROLÁS!",
                    "ro": "STRIKE!",
                    "pl": "UDERZENIE!",
                    "bg": "СТРАЙК",
                    "ru": "СТРАЙК!",
                    "nl": "STRIKE!",
                    "cz": "",
                    "no": "STRIKE!",
                    "se": "",
                    "da": "STRIKE!",
                    "ar": "سترايك!",
                    "tr": "STRIKE!",
                    "fr": "STRIKE !",
                    "it": "STRIKE!",
                    "cs": "STRIKE!",
                    "sv": "STRIKE!"
                },
                "spare": {
                    "en": "SPARE!",
                    "es": "¡SEMIPLENO!",
                    "de": "SPARE!",
                    "pt": "SPARE!",
                    "hu": "SPARE!",
                    "ro": "SPARE!",
                    "pl": "OSZCZĘDŹ!",
                    "bg": "СПЕЪР",
                    "ru": "СПЭР!",
                    "nl": "SPARE!",
                    "cz": "",
                    "no": "SPARE!",
                    "se": "",
                    "da": "SPARE!",
                    "ar": "ضربة إضافية!",
                    "tr": "SPARE!",
                    "fr": "SPARE !",
                    "it": "SPARE!",
                    "cs": "SPARE!",
                    "sv": "SPÄRR!"
                },
                "split": {
                    "en": "SPLIT!",
                    "es": "¡SPLIT!",
                    "de": "SPLIT!",
                    "pt": "SPLIT!",
                    "hu": "SPLIT!",
                    "ro": "SPLIT!",
                    "pl": "PODZIEL!",
                    "bg": "СПЛИТ",
                    "ru": "СПЛИТ!",
                    "nl": "SPLIT!",
                    "cz": "",
                    "no": "SPLITT!",
                    "se": "",
                    "da": "SPLIT!",
                    "ar": "ضربة منفصلة!",
                    "tr": "SPLIT!",
                    "fr": "SPLIT !",
                    "it": "SPLIT!",
                    "cs": "PAROHY!",
                    "sv": "HÅL!"
                },
                "tut0": {
                    "en": "Drag the ball back then roll it down the lane!",
                    "es": "¡Arrastra la bola hacia atrás y luego deslízala por la pista!",
                    "de": "Ziehe die Kugel nach hinten und rolle sie dann die Bahn entlang!",
                    "pt": "Puxa a bola para trás e depois lança-a para a pista!",
                    "hu": "Húzással mozgasd a golyót, majd guríts!",
                    "ro": "Trage bila înapoi, apoi arunc-o pe pistă!",
                    "pl": "Pociągnij kulę do tyłu, a następnie rzuć nią wzdłuż toru!",
                    "bg": "Дръпни топката назад, след това я плъзни по пистата.",
                    "ru": "Потяни шар назад, а затем брось его на дорожку!",
                    "nl": "Sleep de bal naar achteren en rol 'm daarna over de baan!",
                    "cz": "",
                    "no": "Dra kulen bakover og rull den så ned banen!",
                    "se": "",
                    "da": "Træk kuglen tilbage, og send den så ned ad banen!",
                    "ar": "اسحب الكرة إلى الخلف ثم دحرجها على المسار!",
                    "tr": "Topu geriye çekip bandın üstüne yuvarla!",
                    "fr": "Glisse la balle jusqu'à sa place puis fais-la rouler dans l'allée !",
                    "it": "Trascina la palla verso di te, quindi falla rotolare lungo la pista!",
                    "cs": "Potáhni koulí do stran a pak po dráze!",
                    "sv": "Dra tillbaka klotet och rulla det sedan ner för banan!"
                },
                "tut10": {
                    "en": "Add swerve to steer the ball to the target!",
                    "es": "¡Añádele efecto para desviar la bola hacia su objetivo!",
                    "de": "Mach einen Schwenker, um die Kugel auf das Ziel zu lenken!",
                    "pt": "Gira para guiares a bola até ao alvo!",
                    "hu": "Csavarással irányíthatod a golyót a célpont felé.",
                    "ro": "Adaugă efect pentru a îndrepta bila spre țintă!",
                    "pl": "Steruj kulą, gdy się toczy, by dokładnie wycelować!",
                    "bg": "Отклони топката, за да я насочиш към целта.",
                    "ru": "Смещай шар, чтобы направить его в цель!",
                    "nl": "Gooi een effectbal om het doel te raken!",
                    "cz": "",
                    "no": "Legg til skru for å styre kulen mot målet!",
                    "se": "",
                    "da": "Skru bowlingkuglen for at styre den mod målet!",
                    "ar": "أضف انحرافًا بسيطًا لتوجيه الكرة إلى الهدف!",
                    "tr": "Topu hedefe doğru yönlendirmek için topa falso ver.",
                    "fr": "Ajoute un effet pour diriger la balle sur la cible !",
                    "it": "Dai una sterzata alla palla per deviarla affinché colpisca l'obiettivo!",
                    "cs": "Přidej faleš, ať trefíš všechny!",
                    "sv": "Lägg till skruv för att styra klotet mot målet!"
                },
                "tut11": {
                    "en": "Touch left or right of screen to add swerve",
                    "es": "Toca a la izquierda o a la derecha de la pantalla para darle efecto",
                    "de": "Berühre links oder rechts den Bildschirm, um einen Schlenker zu machen",
                    "pt": "Toca à esquerda ou à direita do ecrã para girares mais",
                    "hu": "A csavaráshoz érintsd meg a képernyő bal vagy jobb oldalát!",
                    "ro": "Atinge la stânga sau la dreapta ecranului pentru a adăuga efect.",
                    "pl": "Aby podkręcić kulę, dotknij lewej lub prawej części ekranu",
                    "bg": "Докосни екрана отляво или отдясно, за да отклониш топката.",
                    "ru": "Касайся экрана слева или справа, чтобы сместить шар",
                    "nl": "Tik links of rechts voor een effectbal",
                    "cz": "",
                    "no": "Trykk på venstre eller høyre side av skjermen for å skru kulen",
                    "se": "",
                    "da": "Tryk på venstre eller højre side af skærmen for at skrue kuglen",
                    "ar": "المس يسار أو يمين الشاشة لإضافة الانحراف",
                    "tr": "Falso vermek için ekranın sağına/soluna dokun.",
                    "fr": "Touche la partie gauche ou droite de l'écran pour ajouter un effet",
                    "it": "Tocca a destra o a sinistra dello schermo per direzionarla",
                    "cs": "Klepni vlevo nebo vpravo na obrazovku a přidáš faleš",
                    "sv": "Tryck vänster eller höger på skärmen för att skruva."
                },
                "tut12": {
                    "en": "Tilt left or right to add swerve",
                    "es": "Inclina hacia la izquierda o la derecha para darle efecto",
                    "de": "Kippe nach links oder rechts, um einen Schlenker zu machen",
                    "pt": "Inclina para a esquerda ou para a direita para girares mais",
                    "hu": "Dönts balra vagy jobbra a csavaráshoz!",
                    "ro": "Înclină la stânga sau dreapta pentru a adăuga efect.",
                    "pl": "Aby podkręcić kulę, przechyl urządzenie w lewo lub w prawo",
                    "bg": "Наклони наляво или надясно, за да отклониш топката.",
                    "ru": "Наклоняй устройство влево или вправо, чтобы сместить шар",
                    "nl": "Kantel naar links of rechts voor een effectbal",
                    "cz": "",
                    "no": "Vipp mot venstre eller høyre for å skru kulen",
                    "se": "",
                    "da": "Tilt til venstre eller til højre for at skrue kuglen",
                    "ar": "أدر الهاتف يسارًا أو يمينًا لإضافة الانحراف",
                    "tr": "Falso vermek için cihazı sağa/sola yatır.",
                    "fr": "Incline vers la gauche ou la droite pour ajouter un effet",
                    "it": "Inclina il dispositivo verso destra o sinistra per direzionarla",
                    "cs": "Nahni přístroj doleva nebo doprava a přidáš faleš",
                    "sv": "Luta åt vänster eller höger för att skruva."
                },
                "teamChallenge": {
                    "en": "Team Challenge",
                    "es": "Desafío por equipos",
                    "de": "Team Challenge",
                    "pt": "Desafio de equipa",
                    "hu": "Bajnokság",
                    "ro": "Provocare pentru echipă",
                    "pl": "Wyzwanie drużynowe",
                    "bg": "Отборна игра",
                    "ru": "Командное состязание",
                    "nl": "Teamuitdaging",
                    "cz": "",
                    "no": "Lagutfordring",
                    "se": "",
                    "da": "Hold-udfordring",
                    "ar": "تحدي الفريق",
                    "tr": "Takım Mücadelesi",
                    "fr": "Défi d'équipe",
                    "it": "Sfida a squadre",
                    "cs": "Týmová výzva",
                    "sv": "Lagutmaning"
                },
                "levelChallenge": {
                    "en": "Level Challenge",
                    "es": "Desafío de niveles",
                    "de": "Level-Challenge",
                    "pt": "Desafio de nível",
                    "hu": "Szintkihívás",
                    "ro": "Provocarea nivelului",
                    "pl": "Wyzwanie dla poziomu",
                    "bg": "Предизвикателство",
                    "ru": "Испытание уровня",
                    "nl": "Leveluitdaging",
                    "cz": "",
                    "no": "Nivåutfordring",
                    "se": "",
                    "da": "Niveau-udfordring",
                    "ar": "تحدي المستوى",
                    "tr": "Bölüm Mücadelesi",
                    "fr": "Défi de niveau",
                    "it": "Sfida a livelli",
                    "cs": "Výzva úrovní",
                    "sv": "Nivåutmaning"
                },
                "quickGame": {
                    "en": "Quick Game",
                    "es": "Partida rápida",
                    "de": "Schnelles Spiel",
                    "pt": "Jogo rápido",
                    "hu": "Gyors játék",
                    "ro": "Partidă rapidă",
                    "pl": "Szybka gra",
                    "bg": "Бърза игра",
                    "ru": "Быстрый матч",
                    "nl": "Snel spelen",
                    "cz": "",
                    "no": "Hurtigspill",
                    "se": "",
                    "da": "Hurtigt spil",
                    "ar": "لعبة سريعة",
                    "tr": "Hızlı Oyun",
                    "fr": "Partie rapide",
                    "it": "Partita veloce",
                    "cs": "Rychlá hra",
                    "sv": "Snabbmatch"
                },
                "selectYourPlayer1": {
                    "en": "SELECT YOUR PLAYER",
                    "es": "ELIGE A TU JUGADOR",
                    "de": "SPIELER AUSWÄHLEN",
                    "pt": "SELECIONA O TEU JOGADOR",
                    "hu": "JÁTÉKOS KIVÁLASZTÁSA",
                    "ro": "ALEGE JUCĂTORUL TĂU",
                    "pl": "WYBIERZ GRACZA",
                    "bg": "ИЗБЕРИ СИ ИГРАЧ",
                    "ru": "ВЫБЕРИ СВОЕГО ИГРОКА",
                    "nl": "KIES JE SPELER",
                    "cz": "",
                    "no": "VELG SPILLER",
                    "se": "",
                    "da": "VÆLG DIN SPILLER",
                    "ar": "حدد لاعبك",
                    "tr": "OYUNCU SEÇ",
                    "fr": "CHOISIS TON JOUEUR",
                    "it": "SCEGLI IL GIOCATORE",
                    "cs": "VYBRAT HRÁČE",
                    "sv": "VÄLJ SPELARE"
                },
                "selectOpponent1": {
                    "en": "SELECT OPPONENT",
                    "es": "ELIGE AL CONTRINCANTE",
                    "de": "GEGNER AUSWÄHLEN",
                    "pt": "SELECIONA O TEU ADVERSÁRIO",
                    "hu": "ELLENFÉL KIVÁLASZTÁSA",
                    "ro": "ALEGE ADVERSARUL TĂU",
                    "pl": "WYBIERZ PRZECIWNIKA",
                    "bg": "ИЗБЕРИ СИ ОПОНЕНТ",
                    "ru": "ВЫБЕРИ ПРОТИВНИКА",
                    "nl": "KIES DE TEGENSTANDER",
                    "cz": "",
                    "no": "VELG MOTSTANDER",
                    "se": "",
                    "da": "VÆLG DIN MODSTANDER",
                    "ar": "حدد الخصم",
                    "tr": "RAKİP SEÇ",
                    "fr": "CHOISIS TON ADVERSAIRE",
                    "it": "SCEGLI L'AVVERSARIO",
                    "cs": "VYBRAT PROTIHRÁČE",
                    "sv": "VÄLJ MOTSTÅNDARE"
                },
                "selectYourPlayer2": {
                    "en": "SELECT PLAYER 1",
                    "es": "ELIGE AL JUGADOR 1",
                    "de": "SPIELER 1 AUSWÄHLEN",
                    "pt": "SELECIONA O JOGADOR 1",
                    "hu": "1. JÁTÉKOS KIVÁLASZTÁSA",
                    "ro": "ALEGE JUCĂTORUL 1",
                    "pl": "WYBIERZ GRACZA NR 1",
                    "bg": "ИЗБЕРИ ИГРАЧ 1",
                    "ru": "ВЫБОР ИГРОКА 1",
                    "nl": "KIES SPELER 1",
                    "cz": "",
                    "no": "VELG SPILLER 1",
                    "se": "",
                    "da": "VÆLG SPILLER 1",
                    "ar": "حدد اللاعب 1",
                    "tr": "1. OYUNCUYU SEÇ",
                    "fr": "CHOISIS LE JOUEUR 1",
                    "it": "SCEGLI IL GIOCATORE 1",
                    "cs": "VYBRAT HRÁČE 1",
                    "sv": "VÄLJ SPELARE 1"
                },
                "selectOpponent2": {
                    "en": "SELECT PLAYER 2",
                    "es": "ELIGE AL JUGADOR 2",
                    "de": "SPIELER 2 AUSWÄHLEN",
                    "pt": "SELECIONA O JOGADOR 2",
                    "hu": "2. JÁTÉKOS KIVÁLASZTÁSA",
                    "ro": "ALEGE JUCĂTORUL 2",
                    "pl": "WYBIERZ GRACZA NR 2",
                    "bg": "ИЗБЕРИ ИГРАЧ 2",
                    "ru": "ВЫБОР ИГРОКА 2",
                    "nl": "KIES SPELER 2",
                    "cz": "",
                    "no": "VELG SPILLER 2",
                    "se": "",
                    "da": "VÆLG SPILLER 2",
                    "ar": "حدد اللاعب 2",
                    "tr": "2. OYUNCUYU SEÇ",
                    "fr": "CHOISIS LE JOUEUR 2",
                    "it": "SCEGLI IL GIOCATORE 2",
                    "cs": "VYBRAT HRÁČE 2",
                    "sv": "VÄLJ SPELARE 2"
                },
                "stat0": {
                    "en": "Skill",
                    "es": "Habilidad",
                    "de": "Fähigkeit",
                    "pt": "Habilidade",
                    "hu": "Képesség",
                    "ro": "Tehnică",
                    "pl": "Umiejętność",
                    "bg": "Умение",
                    "ru": "Мастерство",
                    "nl": "Techniek",
                    "cz": "",
                    "no": "Ferdighet",
                    "se": "",
                    "da": "Evne",
                    "ar": "المهارة",
                    "tr": "Beceri",
                    "fr": "Aptitude",
                    "it": "Abilità",
                    "cs": "Dovednost",
                    "sv": "Skicklighet"
                },
                "stat1": {
                    "en": "Power",
                    "es": "Potencia",
                    "de": "Power",
                    "pt": "Potência",
                    "hu": "Erő",
                    "ro": "Putere",
                    "pl": "Siła",
                    "bg": "Сила",
                    "ru": "Сила",
                    "nl": "Kracht",
                    "cz": "",
                    "no": "Kraft",
                    "se": "",
                    "da": "Kraft",
                    "ar": "الطاقة",
                    "tr": "Güç",
                    "fr": "Pouvoir",
                    "it": "Potenza",
                    "cs": "Síla",
                    "sv": "Kraft"
                },
                "stat2": {
                    "en": "Spin",
                    "es": "Efecto",
                    "de": "Drehen",
                    "pt": "Rotação",
                    "hu": "Pörgetés",
                    "ro": "Rotire",
                    "pl": "Podkręcanie",
                    "bg": "Завъртане",
                    "ru": "Вращение",
                    "nl": "Effect",
                    "cz": "",
                    "no": "Spinn",
                    "se": "",
                    "da": "Skru",
                    "ar": "تدوير الكرة",
                    "tr": "Dönüş",
                    "fr": "Lancer",
                    "it": "Effetto",
                    "cs": "Faleš",
                    "sv": "Skruv"
                },
                "challengeProgress": {
                    "en": "CHALLENGE PROGRESS",
                    "es": "PROGRESO DEL DESAFÍO",
                    "de": "CHALLENGE FORTSCHRITT",
                    "pt": "PROGRESSO DO DESAFIO",
                    "hu": "BAJNOKSÁG ÁLLÁSA",
                    "ro": "PROGRES ÎN PROVOCARE",
                    "pl": "POSTĘP WYZWANIA",
                    "bg": "НАПРЕДЪК В ПРЕДИЗВИКАТЕЛСТВОТО",
                    "ru": "ПРОГРЕСС СОСТЯЗАНИЯ",
                    "nl": "VOORTGANG UITDAGING",
                    "cz": "",
                    "no": "FREMDRIFT I UTFORDRING",
                    "se": "",
                    "da": "STATUS I UDFORDRINGEN",
                    "ar": "تقدم التحدي",
                    "tr": "MÜCADELE İLERLEMESİ",
                    "fr": "PROGRESSION DU DÉFI",
                    "it": "AVANZAMENTO SFIDA",
                    "cs": "POSTUP VÝZVY",
                    "sv": "UTMANINGSFÖRLOPP"
                },
                "teamNum0": {
                    "en": "1/4",
                    "es": "1/4",
                    "de": "1/4",
                    "pt": "1/4",
                    "hu": "1/4",
                    "ro": "1/4",
                    "pl": "1/4",
                    "bg": "1/4",
                    "ru": "1/4",
                    "nl": "1/4",
                    "cz": "",
                    "no": "1/4",
                    "se": "",
                    "da": "1/4",
                    "ar": "1/4",
                    "tr": "1/4",
                    "fr": "1/4",
                    "it": "1/4",
                    "cs": "1/4",
                    "sv": "1/4"
                },
                "teamNum1": {
                    "en": "2/4",
                    "es": "2/4",
                    "de": "2/4",
                    "pt": "2/4",
                    "hu": "2/4",
                    "ro": "2/4",
                    "pl": "2/4",
                    "bg": "2/4",
                    "ru": "2/4",
                    "nl": "2/4",
                    "cz": "",
                    "no": "2/4",
                    "se": "",
                    "da": "2/4",
                    "ar": "2/4",
                    "tr": "2/4\n",
                    "fr": "2/4",
                    "it": "2/4",
                    "cs": "2/4",
                    "sv": "2/4"
                },
                "teamNum2": {
                    "en": "3/4",
                    "es": "3/4",
                    "de": "3/4",
                    "pt": "3/4",
                    "hu": "3/4",
                    "ro": "3/4",
                    "pl": "3/4",
                    "bg": "3/4",
                    "ru": "3/4",
                    "nl": "3/4",
                    "cz": "",
                    "no": "3/4",
                    "se": "",
                    "da": "3/4",
                    "ar": "3/4",
                    "tr": "3/4\n",
                    "fr": "3/4",
                    "it": "3/4",
                    "cs": "3/4",
                    "sv": "3/4"
                },
                "teamNum3": {
                    "en": "4/4",
                    "es": "4/4",
                    "de": "4/4",
                    "pt": "4/4",
                    "hu": "4/4",
                    "ro": "4/4",
                    "pl": "4/4",
                    "bg": "4/4",
                    "ru": "4/4",
                    "nl": "4/4",
                    "cz": "",
                    "no": "4/4",
                    "se": "",
                    "da": "4/4",
                    "ar": "4/4",
                    "tr": "4/4\n",
                    "fr": "4/4",
                    "it": "4/4",
                    "cs": "4/4",
                    "sv": "4/4"
                },
                "producedFor": {
                    "en": "Produced for",
                    "es": "Producido por",
                    "de": "Produziert für",
                    "pt": "Produzido para",
                    "hu": "Megrendelő:",
                    "ro": "Produs pentru",
                    "pl": "Wyprodukowano dla",
                    "bg": "Създадена за:",
                    "ru": "Специально для",
                    "nl": "Gemaakt voor",
                    "cz": "Vytvořeno pro",
                    "no": "Produsert for",
                    "se": "Producerat för",
                    "da": "Produceret for",
                    "ar": "تم الإنتاج لصالح",
                    "tr": "Yaptıran:",
                    "fr": "Produit pour",
                    "it": "Prodotto per",
                    "cs": "Vytvořeno pro",
                    "sv": "Producerat för"
                },
                "createdBy": {
                    "en": "Created by",
                    "es": "Creado por",
                    "de": "Erstellt von",
                    "pt": "Criado por",
                    "hu": "Fejlesztő:",
                    "ro": "Creat de",
                    "pl": "Twórcy",
                    "bg": "Създадена от:",
                    "ru": "Разработчик",
                    "nl": "Gemaakt door",
                    "cz": "Vytvořil",
                    "no": "Laget av",
                    "se": "Skapat av",
                    "da": "Skabt af",
                    "ar": "تم تصميم اللعبة بواسطة",
                    "tr": "Hazırlayan:",
                    "fr": "Créé par",
                    "it": "Ideato da",
                    "cs": "Vytvořil",
                    "sv": "Skapat av"
                }
            };
        }
        return JSONData;
    }());
    Utils.JSONData = JSONData;
})(Utils || (Utils = {}));
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
var maxWidth = 550;
var minWidth = 550;
var maxHeight = 850;
var minHeight = 850;
var canvasX;
var canvasY;
var canvasScale;
var div = document.getElementById('canvas-wrapper');
var sound;
var music;
var aEffects;
var audioType = 0;
var muted = false;
var splashTimer = 0;
var assetLib;
var preAssetLib;
var isMobile = false;
var gameState = "loading";
var aLangs = new Array("EN");
var curLang = "";
var isBugBrowser = false;
var isIE10 = false;
var delta;
var radian = Math.PI / 180;
var ios9FirstTouch = false;
var isRotated = false;
var prevGameState;
var hasFocus = true;
var charVersion = 1;
var saveDataHandler = new Utils.SaveDataHandler("bowlingChampionv5");
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
    if (!hasFocus) {
        if (userInput) {
            userInput.checkKeyFocus();
        }
        if (!muted && gameState != "pause" && gameState != "splash" && gameState != "loading") {
            Howler.mute(false);
            playMusic();
        }
    }
    hasFocus = true;
}
function visiblePause() {
    hasFocus = false;
    Howler.mute(true);
    music.pause();
}
window.onpageshow = function () {
    if (!hasFocus) {
        if (userInput) {
            userInput.checkKeyFocus();
        }
        if (!muted && gameState != "pause" && gameState != "splash" && gameState != "loading") {
            Howler.mute(false);
            playMusic();
        }
    }
    hasFocus = true;
};
window.onpagehide = function () {
    hasFocus = false;
    Howler.mute(true);
    music.pause();
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
    setTimeout(function () {
        resizeCanvas();
    }, 2000);
    window.addEventListener("orientationchange", function () {
        setTimeout(function () {
            resizeCanvas();
        }, 500);
        setTimeout(function () {
            resizeCanvas();
        }, 200);
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
        src: ['audio/sound.mp3'],
        sprite: {
            challengeProgressExplode: [0, 2500],
            gameOverFail: [3000, 1000],
            jump: [4500, 1400],
            ballDrop0: [6000, 750],
            ballDrop1: [7000, 1000],
            ballOff0: [8000, 1000],
            ballOff1: [9500, 700],
            pinsHit0: [10500, 1500],
            pinsHit1: [12500, 1500],
            pinsHit2: [14500, 1500],
            pinsHit3: [16500, 2000],
            lockedBut: [19500, 1000],
            shotMiss: [21000, 1000],
            click: [22500, 500],
            selectChar: [23500, 500],
            switchBowlerOp: [24500, 1500],
            challengeProgressIntro: [26500, 2000],
            switchBowlerCur: [29000, 2000],
            teamOutro: [31500, 2000],
            gameOverSuccess: [34000, 2000],
            shotStrike: [36500, 1600],
            ballRolling: [38500, 2500],
            hitPost: [41500, 1500],
            cheer2: [43500, 3500],
            cheer5: [47500, 6500],
            cheer4: [54500, 5000],
            cheer3: [60000, 4500],
            cheer0: [65000, 3500],
            cheer1: [69000, 4500],
            firework: [74000, 1500],
            shotScore0: [76000, 1100],
            shotScore1: [78000, 1500],
            shotScore2: [80500, 1500],
            shotScore3: [83000, 2000],
            shotScore4: [86000, 1200],
            pinTap0: [87500, 300],
            pinTap1: [88000, 300],
            pinTap2: [88500, 300],
            cheerBad: [89000, 3500],
            silence: [2600, 100]
        }
    });
    music = new Howl({
        src: ['audio/music.mp3'],
        volume: 0,
        loop: true
    });
}
else {
    audioType = 0;
}
var panel;
var firstGoState = 0;
var background;
var totalScore = 0;
var levelScore = 0;
var levelNum = 0;
var aTutorials = new Array();
var panelFrame;
var oLogoData = {};
var oLogoBut;
var musicTween;
var oImageIds = {};
var lane;
var ball;
var throwState = 0;
var startTouchY = 0;
var oTiltData = { gamma: 0, beta: 0, alpha: 0 };
var hasTilt = false;
var orientTestInc = 0;
var aLaneElements;
var sortFlipFlop = true;
var aBalls;
var whosGo;
var shotNum;
var standingPins;
var aFallingItems;
var gameType;
var aCharIcons = new Array({ offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 1, stat0: .3, stat1: .5, stat2: .2, frames: 4, team: 0, unlocked: 0, saveId: 0 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 3, stat0: .4, stat1: .3, stat2: .3, frames: 4, team: 0, unlocked: 0, saveId: 0 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 0, stat0: .3, stat1: .6, stat2: .6, frames: 4, team: 0, unlocked: 1, saveId: 19 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 3, stat0: .6, stat1: .4, stat2: .3, frames: 6, team: 1, unlocked: 0, saveId: 0 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 0, stat0: .5, stat1: .2, stat2: .3, frames: 6, team: 1, unlocked: 0, saveId: 0 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 2, stat0: .3, stat1: .6, stat2: .5, frames: 6, team: 1, unlocked: 3, saveId: 20 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 1, stat0: .4, stat1: .7, stat2: .6, frames: 8, team: 2, unlocked: 0, saveId: 0 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 1, stat0: .8, stat1: .5, stat2: .4, frames: 8, team: 2, unlocked: 0, saveId: 0 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 2, stat0: .7, stat1: .6, stat2: .7, frames: 8, team: 2, unlocked: 5, saveId: 21 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 0, stat0: .9, stat1: .6, stat2: .7, frames: 8, team: 3, unlocked: 0, saveId: 0 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 1, stat0: .5, stat1: .9, stat2: .3, frames: 8, team: 3, unlocked: 0, saveId: 0 }, { offsetX: 0, offsetY: 0, scrollGap: 0, panelId: 0, stat0: .6, stat1: .8, stat2: .7, frames: 8, team: 3, unlocked: 7, saveId: 22 }, { offsetX: 0, offsetY: 0 });
var curChar = 99;
var opChar = 99;
var curLevel = 0;
var oCurGameScores = { totalScore: 0 };
var oOpGameScores = { totalScore: 0 };
var curFrame;
var playerNum = 1;
var loseTextId = Math.floor(Math.random() * 3);
var hasSwerved = false;
var nonSwerveCount = 0;
var challengeLevel = 0;
var challengeLives;
var challengeAttempts = 0;
var oChallengeScore;
var firstPokiRun = false;
var firstAdRun = false;
function resetChallengeScores() {
    oChallengeScore = { bonus0: 0, bonus1: 0, bonus2: 0, total: 0 };
}
function loadLang(_curLang) {
    curLang = _curLang;
    if (!curLang || curLang == null || curLang == undefined) {
        curLang = "en";
    }
    loadPreAssets();
}
function initTiltCheck() {
    if (isMobile && window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", startOrientTest, false);
        window.setTimeout(endOrientTest, 1000);
    }
    else {
        initSplash();
    }
}
function startOrientTest(eventData) {
    orientTestInc += eventData.gamma + eventData.beta + eventData.alpha;
}
function endOrientTest() {
    if (orientTestInc > 0) {
        hasTilt = true;
    }
    else {
        hasTilt = false;
    }
    window.removeEventListener("deviceorientation", startOrientTest, false);
    initSplash();
}
function initSplash() {
    gameState = "splash";
    window.PokiSDK.gameLoadingFinished();
    if (curLang == "ar") {
        document.body.style.direction = "rtl";
    }
    if (audioType == 1 && !muted) {
        playMusic();
        if (!hasFocus) {
            music.pause();
        }
    }
    for (var i = 0; i < 12; i++) {
        if (saveDataHandler.aLevelStore[i] > 0) {
            firstGoState = 3;
            break;
        }
    }
    initStartScreen();
    setTimeout(function () {
        resizeCanvas();
    }, 500);
}
function initStartScreen() {
    gameState = "start";
    if (audioType == 1) {
        music.fade(music.volume(), .4, 10);
    }
    background = new Elements.Background();
    var oTournamentBut = { oImgData: assetLib.getData("uiButs"), aPos: [-120, -135], align: [.5, 1], scale: .9, id: oImageIds.tournamentBut, idOver: oImageIds.tournamentButOver, flash: true };
    var oChallengeBut = { oImgData: assetLib.getData("uiButs"), aPos: [120, -135], align: [.5, 1], scale: .9, id: oImageIds.challengeBut, idOver: oImageIds.challengeButOver, flash: true };
    var oInfoBut = { oImgData: assetLib.getData("uiButs"), aPos: [-110, 41], align: [1, 0], id: oImageIds.infoBut, idOver: oImageIds.infoButOver };
    userInput.addHitArea("tournamentFromTitle", butEventHandler, null, "image", oTournamentBut);
    userInput.addHitArea("challengeFromTitle", butEventHandler, null, "image", oChallengeBut);
    userInput.addHitArea("infoFromTitle", butEventHandler, null, "image", oInfoBut);
    var aButs = new Array(oTournamentBut, oChallengeBut, oInfoBut);
    addMuteBut(aButs);
    aFallingItems = new Array();
    for (var i = 0; i < 10; i++) {
        var bub = new Elements.FallingItem();
        aFallingItems.push(bub);
    }
    aEffects = new Array();
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    if (saveDataHandler.getAudioState() == 0) {
        if (!muted) {
            butEventHandler("mute", null);
        }
    }
    previousTime = new Date().getTime();
    updateStartScreenEvent();
}
function addMuteBut(_aButs) {
    if (audioType == 1) {
        var mb = oImageIds.muteBut0;
        var mbOver = oImageIds.muteBut0Over;
        if (muted) {
            mb = oImageIds.muteBut1;
            mbOver = oImageIds.muteBut1Over;
        }
        var oMuteBut = { oImgData: assetLib.getData("uiButs"), aPos: [-40, 40], align: [1, 0], id: mb, idOver: mbOver };
        userInput.addHitArea("mute", butEventHandler, null, "image", oMuteBut);
        for (var i = 0; i < _aButs.length; i++) {
            if (_aButs[i].id == oImageIds.muteBut0 || _aButs[i].id == oImageIds.muteBut1) {
                return;
            }
        }
        _aButs.push(oMuteBut);
    }
}
function initCreditsScreen() {
    gameState = "credits";
    var oBackBut = { oImgData: assetLib.getData("uiButs"), aPos: [-110, 41], align: [1, 0], id: oImageIds.backBut, idOver: oImageIds.backButOver };
    var oResetBut = { oImgData: assetLib.getData("uiButs"), aPos: [-60, -43], align: [1, 1], id: oImageIds.resetBut, idOver: oImageIds.resetButOver };
    userInput.addHitArea("backFromInfo", butEventHandler, null, "image", oBackBut);
    userInput.addHitArea("resetData", butEventHandler, null, "image", oResetBut);
    var aButs = new Array(oBackBut, oResetBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    aFallingItems = new Array();
    for (var i = 0; i < 10; i++) {
        var bub = new Elements.FallingItem();
        aFallingItems.push(bub);
    }
    background.bounceBg();
    previousTime = new Date().getTime();
    updateCreditsScreenEvent();
}
function initChallengeSelectScreen() {
    gameState = "challengeSelect";
    var oBackBut = { oImgData: assetLib.getData("uiButs"), aPos: [-110, 41], align: [1, 0], id: oImageIds.backBut, idOver: oImageIds.backButOver };
    userInput.addHitArea("backFromChallengeSelect", butEventHandler, null, "image", oBackBut);
    background = new Elements.Background();
    resetChallengeScores();
    var aButs = new Array(oBackBut);
    var temp = saveDataHandler.getChallengeProgress();
    for (var i = 0; i < 16; i++) {
        if (i == temp) {
            var oChallengeBut = { oImgData: assetLib.getData("uiButs"), aPos: [(i % 4) * 110 - 165, Math.floor(i / 4) * 120 - 165], align: [.5, .5], id: oImageIds.challengePlayBut, idOver: oImageIds.challengePlayButOver, flash: true, flareScale: 1 };
            userInput.addHitArea("challengeSelect", butEventHandler, { id: i }, "image", oChallengeBut);
        }
        else if (i < temp) {
            var oChallengeBut = { oImgData: assetLib.getData("uiButs"), aPos: [(i % 4) * 110 - 165, Math.floor(i / 4) * 120 - 165], align: [.5, .5], id: oImageIds.challengeTickBut, idOver: oImageIds.challengeTickButOver };
            userInput.addHitArea("challengeSelect", butEventHandler, { id: i }, "image", oChallengeBut);
        }
        else {
            var oChallengeBut = { oImgData: assetLib.getData("uiButs"), aPos: [(i % 4) * 110 - 165, Math.floor(i / 4) * 120 - 165], align: [.5, .5], id: oImageIds.smallIcon19, idOver: oImageIds.smallIcon19 };
            userInput.addHitArea("challengeSelect", butEventHandler, { id: null }, "image", oChallengeBut);
        }
        aButs.push(oChallengeBut);
    }
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    aFallingItems = new Array();
    for (var i = 0; i < 10; i++) {
        var bub = new Elements.FallingItem();
        aFallingItems.push(bub);
    }
    aEffects = new Array();
    background.bounceBg();
    previousTime = new Date().getTime();
    updateChallengeSelectScreenEvent();
}
function isCharUnlocked(_id) {
    var temp = false;
    if (aCharIcons[_id].unlocked == 0) {
        return true;
    }
    else {
        var tempNum = 16;
        if (charVersion == 1) {
            tempNum = 19;
        }
        for (var i = 0; i < tempNum; i++) {
            if (saveDataHandler.aLevelStore[i] > aCharIcons[_id].unlocked) {
                saveDataHandler.aLevelStore[aCharIcons[_id].saveId] = 1;
                saveDataHandler.saveData();
                break;
            }
        }
    }
    if (saveDataHandler.aLevelStore[aCharIcons[_id].saveId] == 1) {
        temp = true;
    }
    return temp;
}
function initUserCharSelectScreen() {
    gameState = "userCharSelect";
    curChar = 99;
    var oBackBut = { oImgData: assetLib.getData("uiButs"), aPos: [-110, 41], align: [1, 0], id: oImageIds.backBut, idOver: oImageIds.backButOver };
    userInput.addHitArea("backFromUserCharSelect", butEventHandler, null, "image", oBackBut);
    var aButs = new Array(oBackBut);
    var temp = 12;
    for (var i = 0; i < temp; i++) {
        var oCharBut = { oImgData: assetLib.getData("uiButs"), aPos: [(i % 4) * 120 - 205 + (Math.floor(i / 4) % 2) * 60, Math.floor(i / 4) * 95 + aCharIcons[i].offsetY * .3 - 220], scale: .85, align: [.5, .8], id: oImageIds["smallIcon" + i], idOver: oImageIds["smallIcon" + i + "Over"], flash: true, flareScale: .5 };
        userInput.addHitArea("userCharSelect", butEventHandler, { id: i }, "image", oCharBut);
        aButs.push(oCharBut);
    }
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    aFallingItems = new Array();
    for (var i = 0; i < 10; i++) {
        var bub = new Elements.FallingItem();
        aFallingItems.push(bub);
    }
    background.bounceBg();
    previousTime = new Date().getTime();
    updateUserCharSelectScreenEvent();
}
function initChallengeProgressScreen() {
    gameState = "challengeProgress";
    playSound("challengeProgressIntro");
    if (audioType == 1) {
        music.fade(music.volume(), 0, 10);
    }
    var aButs = new Array();
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    aFallingItems = new Array();
    for (var i = 0; i < 10; i++) {
        var bub = new Elements.FallingItem();
        aFallingItems.push(bub);
    }
    background.bounceBg();
    previousTime = new Date().getTime();
    updateChallengeProgressScreenEvent();
}
function initTeamIntro() {
    gameState = "teamIntro";
    if (audioType == 1) {
        music.fade(music.volume(), .4, 2000);
    }
    playSound("challengeProgressExplode");
    var oBackBut = { oImgData: assetLib.getData("uiButs"), aPos: [-110, 41], align: [1, 0], id: oImageIds.backBut, idOver: oImageIds.backButOver };
    userInput.addHitArea("backFromTeamIntro", butEventHandler, null, "image", oBackBut);
    var oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [-108, -82], align: [1, 1], id: oImageIds.playBut, idOver: oImageIds.playButOver, flash: true };
    userInput.addHitArea("nextFromTeamIntro", butEventHandler, null, "image", oNextBut);
    var aButs = new Array(oBackBut, oNextBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    aFallingItems = new Array();
    for (var i = 0; i < 10; i++) {
        var bub = new Elements.FallingItem();
        aFallingItems.push(bub);
    }
    background.bounceBg();
    previousTime = new Date().getTime();
    updateTeamIntroScreenEvent();
}
function initTeamOutro() {
    gameState = "teamOutro";
    playSound("teamOutro");
    var aButs = new Array();
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    aFallingItems = new Array();
    for (var i = 0; i < 10; i++) {
        var bub = new Elements.FallingItem();
        aFallingItems.push(bub);
    }
    background.bounceBg();
    previousTime = new Date().getTime();
    updateTeamOutroScreenEvent();
}
function initGameIntro() {
    gameState = "gameIntro";
    if (curChar == curLevel) {
        opChar = 11;
    }
    else {
        opChar = curLevel;
    }
    var oBackBut = { oImgData: assetLib.getData("uiButs"), aPos: [-110, 41], align: [1, 0], id: oImageIds.backBut, idOver: oImageIds.backButOver };
    userInput.addHitArea("backFromGameIntro", butEventHandler, null, "image", oBackBut);
    var oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [-108, -82], align: [1, 1], id: oImageIds.playBut, idOver: oImageIds.playButOver, flash: true };
    userInput.addHitArea("nextFromGameIntro", butEventHandler, null, "image", oNextBut);
    var aButs = new Array(oBackBut, oNextBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    aFallingItems = new Array();
    for (var i = 0; i < 10; i++) {
        var bub = new Elements.FallingItem();
        aFallingItems.push(bub);
    }
    background.bounceBg();
    previousTime = new Date().getTime();
    updateGameIntroScreenEvent();
}
function initGame() {
    gameState = "game";
    firstPokiRun = false;
    firstAdRun = true;
    throwState = 0;
    whosGo = 0;
    shotNum = 0;
    curFrame = 0;
    nonSwerveCount = 0;
    challengeLives = 5;
    if (audioType == 1) {
        music.fade(music.volume(), .7, 500);
    }
    var aButs = new Array();
    if (firstGoState == 3) {
        aButs = setGameControls();
    }
    else {
        firstGoState = 0;
        var oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [0, 0], align: [.5, .85], id: oImageIds.playBut, idOver: oImageIds.playButOver, flash: true };
        userInput.addHitArea("nextFromTutorial0", butEventHandler, null, "image", oNextBut);
        aButs = new Array(oNextBut);
    }
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    oCurGameScores.aFrameScores = new Array();
    oOpGameScores.aFrameScores = new Array();
    lane = new Elements.Lane();
    ball = new Elements.Ball();
    previousTime = new Date().getTime();
    updateGameEvent();
}
function setGameControls() {
    userInput.addKey("swerveRight0", butEventHandler, null, 39);
    userInput.addKey("swerveLeft0", butEventHandler, null, 37);
    userInput.addKey("swerveRight1", butEventHandler, null, 68);
    userInput.addKey("swerveLeft1", butEventHandler, null, 65);
    if (hasTilt) {
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", devOrientHandler, false);
        }
    }
    var oPauseBut = { oImgData: assetLib.getData("uiButs"), aPos: [-110, 41], align: [1, 0], id: oImageIds.pauseBut, idOver: oImageIds.pauseButOver };
    userInput.addHitArea("pause", butEventHandler, null, "image", oPauseBut);
    var aButs = new Array(oPauseBut);
    if ((firstGoState == 1 || firstGoState == 3) && (whosGo == 0 || (whosGo == 1 && playerNum == 2))) {
        userInput.addHitArea("gameTouch", butEventHandler, { isDraggable: true, multiTouch: true }, "rect", { aRect: [0, 50, canvas.width, canvas.height] }, true);
    }
    return aButs;
}
function stopUserControl() {
    userInput.removeKey("swerveRight0");
    userInput.removeKey("swerveLeft0");
    userInput.removeKey("swerveRight1");
    userInput.removeKey("swerveLeft1");
    userInput.removeHitArea("gameTouch");
    if (hasTilt) {
        if (window.DeviceOrientationEvent) {
            window.removeEventListener("deviceorientation", devOrientHandler, false);
        }
    }
}
function devOrientHandler(eventData) {
    oTiltData.gamma = eventData.gamma;
    oTiltData.beta = eventData.beta;
    oTiltData.alpha = eventData.alpha;
    if (canvas.width > canvas.height) {
        if (oTiltData.gamma > 0) {
            ball.leftSwerve = Math.max(Math.min(oTiltData.beta / 12, 1), -1);
            ball.rightSwerve = 0;
        }
        else {
            ball.leftSwerve = Math.max(Math.min(oTiltData.beta / -12, 1), -1);
            ball.rightSwerve = 0;
        }
    }
    else {
        if (oTiltData.beta > 0) {
            ball.leftSwerve = Math.max(Math.min(oTiltData.gamma / -12, 1), -1);
            ball.rightSwerve = 0;
        }
        else {
            ball.leftSwerve = Math.max(Math.min(oTiltData.gamma / 12, 1), -1);
            ball.rightSwerve = 0;
        }
    }
}
function initPause() {
    gameState = "pause";
    window.PokiSDK.gameplayStop();
    var oPlayBut = { oImgData: assetLib.getData("uiButs"), aPos: [0, -75], align: [.5, .5], id: oImageIds.playBut, idOver: oImageIds.playButOver, flash: true };
    var oRestartBut = { oImgData: assetLib.getData("uiButs"), aPos: [0, 75], align: [.5, .5], id: oImageIds.replayBut, idOver: oImageIds.replayButOver, flash: true };
    var oQuitBut = { oImgData: assetLib.getData("uiButs"), aPos: [45, -43], align: [0, 1], id: oImageIds.quitBut, idOver: oImageIds.quitButOver };
    userInput.addHitArea("playFromPause", butEventHandler, null, "image", oPlayBut);
    userInput.addHitArea("restartFromPause", butEventHandler, null, "image", oRestartBut);
    userInput.addHitArea("quitFromPause", butEventHandler, null, "image", oQuitBut);
    var aButs = new Array(oPlayBut, oRestartBut, oQuitBut);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    previousTime = new Date().getTime();
    background = new Elements.Background();
    updatePauseEvent();
}
function resumeGame() {
    gameState = "game";
    window.PokiSDK.gameplayStart();
    var aButs = new Array();
    panel = new Elements.Panel(gameState, aButs);
    panel.aButs = setGameControls();
    addMuteBut(panel.aButs);
    panel.startTween();
    previousTime = new Date().getTime();
    updateGameEvent();
}
function butEventHandler(_id, _oData) {
    if (gameState == "rotated") {
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
        case "infoFromTitle":
            playSound("click");
            userInput.removeHitArea("tournamentFromTitle");
            userInput.removeHitArea("challengeFromTitle");
            userInput.removeHitArea("infoFromTitle");
            userInput.removeHitArea("mute");
            initCreditsScreen();
            break;
        case "backFromInfo":
            playSound("click");
            userInput.removeHitArea("backFromInfo");
            userInput.removeHitArea("resetData");
            userInput.removeHitArea("mute");
            initStartScreen();
            break;
        case "resetData":
            playSound("click");
            userInput.removeHitArea("backFromInfo");
            userInput.removeHitArea("resetData");
            userInput.removeHitArea("mute");
            firstGoState = 0;
            saveDataHandler.resetData();
            initStartScreen();
            break;
        case "tournamentFromTitle":
            playSound("click");
            gameType = 0;
            userInput.removeHitArea("tournamentFromTitle");
            userInput.removeHitArea("challengeFromTitle");
            userInput.removeHitArea("infoFromTitle");
            userInput.removeHitArea("mute");
            initUserCharSelectScreen();
            break;
        case "challengeFromTitle":
            playSound("click");
            gameType = 2;
            userInput.removeHitArea("tournamentFromTitle");
            userInput.removeHitArea("challengeFromTitle");
            userInput.removeHitArea("infoFromTitle");
            userInput.removeHitArea("mute");
            initChallengeSelectScreen();
            break;
        case "backFromChallengeSelect":
            playSound("click");
            userInput.removeHitArea("backFromChallengeSelect");
            userInput.removeHitArea("challengeSelect");
            userInput.removeHitArea("mute");
            initStartScreen();
            break;
        case "challengeSelect":
            if (_oData.id == null) {
                playSound("lockedBut");
            }
            else {
                playSound("click");
                userInput.removeHitArea("backFromChallengeSelect");
                userInput.removeHitArea("challengeSelect");
                userInput.removeHitArea("mute");
                challengeLevel = _oData.id;
                curChar = 1;
                opChar = 0;
                if (firstAdRun) {
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
                        }
                        initGame();
                    });
                }
                else {
                    initGame();
                }
            }
            break;
        case "backFromUserCharSelect":
            playSound("click");
            userInput.removeHitArea("backFromUserCharSelect");
            userInput.removeHitArea("userCharSelect");
            userInput.removeHitArea("nextFromUserCharSelect");
            userInput.removeHitArea("mute");
            initStartScreen();
            break;
        case "userCharSelect":
            if (curChar == _oData.id) {
                return;
            }
            if (_oData.id > 100) {
                curChar = _oData.id - 100;
                panel.tweenInUserUnlockInfo();
                userInput.removeHitArea("nextFromUserCharSelect");
                panel.removeBut(oImageIds.playBut);
                playSound("lockedBut");
            }
            else {
                playSound("click");
                playSound("selectChar");
                curChar = _oData.id;
                panel.tweenInUserChar();
                userInput.removeHitArea("nextFromUserCharSelect");
                panel.removeBut(oImageIds.playBut);
                var oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [-90, -82], align: [1, 1], id: oImageIds.roundPlayBut, idOver: oImageIds.roundPlayButOver, flash: true };
                userInput.addHitArea("nextFromUserCharSelect", butEventHandler, null, "image", oNextBut);
                panel.aButs.push(oNextBut);
            }
            break;
        case "nextFromUserCharSelect":
            playSound("click");
            userInput.removeHitArea("backFromUserCharSelect");
            userInput.removeHitArea("userCharSelect");
            userInput.removeHitArea("nextFromUserCharSelect");
            userInput.removeHitArea("mute");
            if (saveDataHandler.aLevelStore[curChar] == 12) {
                saveDataHandler.aLevelStore[curChar] = 0;
                saveDataHandler.saveData();
            }
            curLevel = saveDataHandler.aLevelStore[curChar];
            initGameIntro();
            break;
        case "opCharSelect":
            if (curChar == _oData.id || opChar == _oData.id) {
                return;
            }
            if (_oData.id > 100) {
                opChar = _oData.id - 100;
                panel.tweenInOpUnlockInfo();
                userInput.removeHitArea("nextFromOpCharSelect");
                panel.removeBut(oImageIds.playBut);
            }
            else {
                playSound("click");
                opChar = _oData.id;
                panel.tweenInOpChar();
                userInput.removeHitArea("nextFromOpCharSelect");
                panel.removeBut(oImageIds.playBut);
                var oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [-108, -82], align: [1, 1], id: oImageIds.playBut, idOver: oImageIds.playButOver, flash: true };
                userInput.addHitArea("nextFromOpCharSelect", butEventHandler, null, "image", oNextBut);
                panel.aButs.push(oNextBut);
            }
            break;
        case "backFromOpCharSelect":
            playSound("click");
            userInput.removeHitArea("backFromOpCharSelect");
            userInput.removeHitArea("opCharSelect");
            userInput.removeHitArea("nextFromOpCharSelect");
            userInput.removeHitArea("mute");
            initUserCharSelectScreen();
            break;
        case "nextFromOpCharSelect":
            playSound("click");
            userInput.removeHitArea("backFromOpCharSelect");
            userInput.removeHitArea("opCharSelect");
            userInput.removeHitArea("nextFromOpCharSelect");
            userInput.removeHitArea("mute");
            if (firstAdRun) {
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
                    }
                    initGame();
                });
            }
            else {
                initGame();
            }
            break;
        case "backFromTeamIntro":
            playSound("click");
            userInput.removeHitArea("backFromTeamIntro");
            userInput.removeHitArea("nextFromTeamIntro");
            userInput.removeHitArea("mute");
            initUserCharSelectScreen();
            break;
        case "nextFromTeamIntro":
            playSound("click");
            userInput.removeHitArea("backFromTeamIntro");
            userInput.removeHitArea("nextFromTeamIntro");
            userInput.removeHitArea("mute");
            initGameIntro();
            break;
        case "backFromGameIntro":
            playSound("click");
            userInput.removeHitArea("backFromGameIntro");
            userInput.removeHitArea("nextFromGameIntro");
            userInput.removeHitArea("mute");
            initUserCharSelectScreen();
            break;
        case "nextFromGameIntro":
            playSound("click");
            userInput.removeHitArea("backFromGameIntro");
            userInput.removeHitArea("nextFromGameIntro");
            userInput.removeHitArea("mute");
            if (firstAdRun) {
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
                    }
                    initGame();
                });
            }
            else {
                initGame();
            }
            break;
        case "nextFromTutorial0":
            playSound("click");
            userInput.removeHitArea("nextFromTutorial0");
            panel.removeBut(oImageIds.playBut);
            firstGoState = 1;
            panel.aButs = setGameControls();
            addMuteBut(panel.aButs);
            break;
        case "nextFromTutorial1":
            playSound("click");
            userInput.removeHitArea("nextFromTutorial1");
            panel.removeBut(oImageIds.playBut);
            firstGoState = 3;
            panel.aButs = setGameControls();
            addMuteBut(panel.aButs);
            ball.ballRelease();
            break;
        case "gameTouch":
            if (!firstPokiRun) {
                window.PokiSDK.gameplayStart();
                firstPokiRun = true;
            }
            if (firstGoState == 2) {
                return;
            }
            if (throwState == 0 && _oData.isDown && !_oData.isBeingDragged) {
                throwState = 1;
                ball.startHold(_oData.x, _oData.y - canvas.height);
            }
            else if (throwState == 1) {
                if (_oData.isBeingDragged) {
                    ball.setHoldPos(_oData.x, _oData.y - canvas.height);
                }
                else {
                    if (throwState == 1) {
                        if (ball.speedY > ball.speedToThrow) {
                            if (firstGoState == 1) {
                                panel.showSwerveTut();
                                firstGoState = 2;
                            }
                            else {
                                if (firstGoState == 1 || firstGoState == 2) {
                                    panel.showSwerveTut();
                                    firstGoState = 2;
                                }
                                else {
                                    ball.ballRelease();
                                }
                            }
                        }
                        else {
                            throwState = 0;
                            ball.resetStartPos();
                        }
                    }
                }
            }
            else if (throwState == 2 && ((!hasTilt && isMobile) || !isMobile)) {
                if (_oData.isDown) {
                    if (ball.allowSwerve) {
                        if (ball.canDetectSwerve) {
                            hasSwerved = true;
                        }
                        ball.leftSwerve = 0;
                        ball.rightSwerve = -1;
                        if (_oData.x < canvas.width / 2) {
                            ball.leftSwerve = 1;
                            ball.rightSwerve = 0;
                        }
                    }
                }
                else {
                    ball.allowSwerve = true;
                    ball.leftSwerve = 0;
                    ball.rightSwerve = 0;
                }
            }
            break;
        case "swerveLeft0":
        case "swerveLeft1":
            if (_oData.isDown) {
                hasSwerved = true;
                ball.leftSwerve = 1;
                ball.rightSwerve = 0;
            }
            else {
                ball.leftSwerve = 0;
            }
            break;
        case "swerveRight0":
        case "swerveRight1":
            if (_oData.isDown) {
                hasSwerved = true;
                ball.rightSwerve = -1;
                ball.leftSwerve = 0;
            }
            else {
                ball.rightSwerve = 0;
            }
            break;
        case "backFromGameOver":
            playSound("click");
            userInput.removeHitArea("backFromGameOver");
            userInput.removeHitArea("nextFromGameOver");
            userInput.removeHitArea("replayFromGameOver");
            userInput.removeHitArea("mute");
            initStartScreen();
            break;
        case "nextFromGameOver":
            playSound("click");
            userInput.removeHitArea("backFromGameOver");
            userInput.removeHitArea("nextFromGameOver");
            userInput.removeHitArea("replayFromGameOver");
            userInput.removeHitArea("mute");
            curLevel++;
            if (curLevel >= 12) {
                initCupWinner();
            }
            else {
                initGameIntro();
            }
            break;
        case "replayFromGameOver":
            playSound("click");
            userInput.removeHitArea("backFromGameOver");
            userInput.removeHitArea("nextFromGameOver");
            userInput.removeHitArea("replayFromGameOver");
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
                }
                initGame();
            });
            break;
        case "mute":
            playSound("click");
            toggleMute();
            if (muted) {
                panel.switchBut(oImageIds.muteBut0, oImageIds.muteBut1, oImageIds.muteBut1Over);
                saveDataHandler.setAudioState(0);
            }
            else {
                panel.switchBut(oImageIds.muteBut1, oImageIds.muteBut0, oImageIds.muteBut0Over);
                saveDataHandler.setAudioState(1);
            }
            break;
        case "pause":
            if (panel.posY0 != 500 || ball.offLane || (whosGo == 1 && playerNum == 1 && throwState < 2)) {
                console.log("no pause");
                return;
            }
            playSound("click");
            if (audioType == 1) {
                Howler.mute(true);
                music.pause();
            }
            else if (audioType == 2) {
                music.pause();
            }
            stopUserControl();
            userInput.removeHitArea("pause");
            initPause();
            break;
        case "playFromPause":
            playSound("click");
            if (audioType == 1) {
                if (!muted) {
                    Howler.mute(false);
                    playMusic();
                }
            }
            else if (audioType == 2) {
                if (!muted) {
                    playMusic();
                }
            }
            userInput.removeHitArea("playFromPause");
            userInput.removeHitArea("restartFromPause");
            userInput.removeHitArea("quitFromPause");
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
                }
                resumeGame();
            });
            break;
        case "quitFromPause":
            playSound("click");
            if (audioType == 1) {
                if (!muted) {
                    Howler.mute(false);
                    playMusic();
                }
            }
            else if (audioType == 2) {
                if (!muted) {
                    playMusic();
                }
            }
            userInput.removeHitArea("playFromPause");
            userInput.removeHitArea("restartFromPause");
            userInput.removeHitArea("quitFromPause");
            userInput.removeHitArea("mute");
            initStartScreen();
            break;
        case "restartFromPause":
            playSound("click");
            if (audioType == 1) {
                if (!muted) {
                    Howler.mute(false);
                    playMusic();
                }
            }
            else if (audioType == 2) {
                if (!muted) {
                    playMusic();
                }
            }
            firstGoState = 0;
            for (var i = 0; i < 12; i++) {
                if (saveDataHandler.aLevelStore[i] > 0) {
                    firstGoState = 3;
                    break;
                }
            }
            userInput.removeHitArea("playFromPause");
            userInput.removeHitArea("restartFromPause");
            userInput.removeHitArea("quitFromPause");
            userInput.removeHitArea("mute");
            if (firstAdRun) {
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
                    }
                    initGame();
                });
            }
            else {
                initGame();
            }
            break;
        case "nextFromCupWinner":
            playSound("click");
            userInput.removeHitArea("nextFromCupWinner");
            userInput.removeHitArea("mute");
            initStartScreen();
            break;
    }
}
function checkCharId(_id) {
    return _id;
}
function getOpPanelId(_id) {
    if (_id === void 0) { _id = opChar; }
    var tempId = aCharIcons[_id].panelId;
    if (tempId == aCharIcons[curChar].panelId) {
        tempId = (tempId + 1) % 4;
    }
    return tempId;
}
function elementAtRest() {
    var allPinsResting = true;
    stopUserControl();
    var oTempData = oCurGameScores;
    if (whosGo == 1) {
        oTempData = oOpGameScores;
    }
    for (var i = 0; i < aLaneElements.length; i++) {
        if (!aLaneElements[i].isResting) {
            allPinsResting = false;
            break;
        }
    }
    if (allPinsResting) {
        var pinsLeft = 0;
        for (var i = 0; i < aLaneElements.length; i++) {
            if (!aLaneElements[i].isBall && !aLaneElements[i].hitByBall && !aLaneElements[i].hitByPin) {
                pinsLeft++;
            }
        }
        if (shotNum == 0) {
            oTempData.aFrameScores[curFrame] = new Array();
            oTempData.aFrameScores[curFrame][0] = 10 - pinsLeft;
            if (pinsLeft == 0) {
                if ((gameType == 0 && curFrame < aCharIcons[curLevel].frames - 1) || (gameType == 1 && curFrame < 7)) {
                    oTempData.aFrameScores[curFrame][1] = 0;
                    panel.showScores(1);
                }
                else {
                    panel.showScores(2);
                }
            }
            else if (pinsLeft > 0) {
                panel.showScores(0);
            }
        }
        else if (shotNum == 1) {
            if ((gameType == 0 && curFrame == aCharIcons[curLevel].frames - 1) || (gameType == 1 && curFrame == 7)) {
                if (oTempData.aFrameScores[curFrame][0] == 10) {
                    oTempData.aFrameScores[curFrame][1] = (10 - pinsLeft);
                    panel.showScores(3);
                }
                else {
                    oTempData.aFrameScores[curFrame][1] = (10 - pinsLeft) - oTempData.aFrameScores[curFrame][0];
                    panel.showScores(3);
                }
            }
            else {
                oTempData.aFrameScores[curFrame][1] = (10 - pinsLeft) - oTempData.aFrameScores[curFrame][0];
                panel.showScores(1);
            }
        }
        else if (shotNum == 2) {
            if (oTempData.aFrameScores[curFrame][1] == 10 || (oTempData.aFrameScores[curFrame][0] + oTempData.aFrameScores[curFrame][1] == 10)) {
                oTempData.aFrameScores[curFrame][2] = (10 - pinsLeft);
            }
            else {
                oTempData.aFrameScores[curFrame][2] = (10 - pinsLeft) - oTempData.aFrameScores[curFrame][1];
            }
            panel.showScores(1);
        }
    }
}
function prepNextShot(_resetState) {
    if (gameType == 2) {
        saveDataHandler.setChallengeHighScore(oChallengeScore.total);
        saveDataHandler.saveData();
        if (challengeAttempts < 0) {
            saveDataHandler.setChallengeProgress(Math.min(challengeLevel + 1, 15));
            saveDataHandler.saveData();
            if (challengeLevel < 15) {
                challengeAttempts = 0;
                challengeLevel++;
                lane.setObstructions(true);
                lane.reset(1);
                shotNum = 0;
                userInput.addKey("swerveRight0", butEventHandler, null, 39);
                userInput.addKey("swerveLeft0", butEventHandler, null, 37);
                userInput.addKey("swerveRight1", butEventHandler, null, 68);
                userInput.addKey("swerveLeft1", butEventHandler, null, 65);
                if (hasTilt) {
                    if (window.DeviceOrientationEvent) {
                        window.addEventListener("deviceorientation", devOrientHandler, false);
                    }
                }
                userInput.addHitArea("gameTouch", butEventHandler, { isDraggable: true, multiTouch: true }, "rect", { aRect: [0, 50, canvas.width, canvas.height] }, true);
            }
            else {
                window.PokiSDK.gameplayStop();
                initCupWinner();
            }
            return;
        }
        else {
            _resetState = 0;
        }
    }
    var oTempData = oCurGameScores;
    if (whosGo == 1) {
        oTempData = oOpGameScores;
    }
    if (_resetState == 2) {
        if (oTempData.aFrameScores[curFrame][1] == 10 || (oTempData.aFrameScores[curFrame][0] + oTempData.aFrameScores[curFrame][1] == 10)) {
            lane.reset(1);
        }
        else {
            lane.reset(0);
        }
        shotNum = 2;
    }
    if (_resetState == 3) {
        if (oTempData.aFrameScores[curFrame][1] == 10 || (oTempData.aFrameScores[curFrame][0] + oTempData.aFrameScores[curFrame][1] == 10)) {
            lane.reset(1);
        }
        else if (oTempData.aFrameScores[curFrame][0] == 10) {
            lane.reset(0);
        }
        else {
            if (whosGo == 0) {
                whosGo = 1;
                lane.reset(1);
                shotNum = 0;
            }
            else {
                if (oCurGameScores.totalScore >= oOpGameScores.totalScore && gameType == 0) {
                    saveDataHandler.aLevelStore[curChar] = saveDataHandler.aLevelStore[curChar] + 1;
                    saveDataHandler.saveData();
                }
                initGameOver();
            }
            return;
        }
        shotNum = 2;
    }
    else if (_resetState == 1) {
        if (whosGo == 0) {
            whosGo = 1;
        }
        else {
            lane.setObstructions(true);
            whosGo = 0;
            if (!hasSwerved) {
                nonSwerveCount++;
                if (nonSwerveCount >= 2) {
                    nonSwerveCount = 0;
                    firstGoState = 1;
                }
            }
            curFrame++;
        }
        if ((gameType == 0 && curFrame == aCharIcons[curLevel].frames) || (gameType == 1 && curFrame == 8)) {
            if (oCurGameScores.totalScore >= oOpGameScores.totalScore && gameType == 0) {
                saveDataHandler.aLevelStore[curChar] = saveDataHandler.aLevelStore[curChar] + 1;
                saveDataHandler.saveData();
            }
            initGameOver();
            return;
        }
        lane.reset(_resetState);
        shotNum = 0;
    }
    else {
        if (((gameType == 0 && curFrame == aCharIcons[curLevel].frames - 1) || (gameType == 1 && curFrame == 7)) && oTempData.aFrameScores[curFrame][0] == 10) {
            lane.reset(1);
        }
        else {
            lane.reset(_resetState);
        }
        shotNum = 1;
    }
    if (whosGo == 0 || (whosGo == 1 && playerNum == 2)) {
        userInput.addKey("swerveRight0", butEventHandler, null, 39);
        userInput.addKey("swerveLeft0", butEventHandler, null, 37);
        userInput.addKey("swerveRight1", butEventHandler, null, 68);
        userInput.addKey("swerveLeft1", butEventHandler, null, 65);
        if (hasTilt) {
            if (window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", devOrientHandler, false);
            }
        }
        userInput.addHitArea("gameTouch", butEventHandler, { isDraggable: true, multiTouch: true }, "rect", { aRect: [0, 50, canvas.width, canvas.height] }, true);
    }
}
function initGameOver() {
    gameState = "gameOver";
    window.PokiSDK.gameplayStop();
    if (audioType == 1) {
        music.fade(music.volume(), .4, 500);
    }
    if (oCurGameScores.totalScore >= oOpGameScores.totalScore) {
        playSound("gameOverSuccess");
        playSound("cheer5");
    }
    else {
        playSound("gameOverFail");
        playSound("cheerBad");
    }
    userInput.removeHitArea("pause");
    var oBackBut = { oImgData: assetLib.getData("uiButs"), aPos: [42, 41], align: [0, 0], id: oImageIds.backBut, idOver: oImageIds.backButOver };
    userInput.addHitArea("backFromGameOver", butEventHandler, null, "image", oBackBut);
    var oNextBut;
    if (oCurGameScores.totalScore >= oOpGameScores.totalScore && gameType == 0) {
        oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [-108, -82], align: [1, 1], id: oImageIds.playBut, idOver: oImageIds.playButOver, flash: true };
        userInput.addHitArea("nextFromGameOver", butEventHandler, null, "image", oNextBut);
    }
    else {
        oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [-108, -82], align: [1, 1], id: oImageIds.replayBut, idOver: oImageIds.replayButOver, flash: true };
        userInput.addHitArea("replayFromGameOver", butEventHandler, null, "image", oNextBut);
    }
    var aButs = new Array(oBackBut, oNextBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    previousTime = new Date().getTime();
    updateGameOverScreenEvent();
}
function initCupWinner() {
    gameState = "cupWinner";
    playSound("shotStrike");
    playSound("cheer5");
    background = new Elements.Background();
    userInput.removeHitArea("pause");
    var oNextBut = { oImgData: assetLib.getData("uiButs"), aPos: [-108, -82], align: [1, 1], id: oImageIds.playBut, idOver: oImageIds.playButOver, flash: true };
    userInput.addHitArea("nextFromCupWinner", butEventHandler, null, "image", oNextBut);
    var aButs = new Array(oNextBut);
    addMuteBut(aButs);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween();
    aFallingItems = new Array();
    aEffects = new Array();
    previousTime = new Date().getTime();
    updateCupWinnerScreenEvent();
}
function sortNumber(a, b) {
    return a - b;
}
function addFirework(_x, _y, _scale) {
    if (_scale === void 0) { _scale = 1; }
    if (aEffects.length > 10) {
        return;
    }
    playSound("firework");
    var firework = new Elements.Firework();
    firework.x = _x;
    firework.y = _y;
    firework.scaleX = firework.scaleY = _scale;
    aEffects.push(firework);
}
function updateGameEvent() {
    if (gameState != "game") {
        return;
    }
    delta = getDelta();
    if (sortFlipFlop) {
        aLaneElements.sort(function (a, b) {
            return a.y - b.y;
        });
        sortFlipFlop = !sortFlipFlop;
    }
    else {
        sortFlipFlop = !sortFlipFlop;
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    lane.update();
    lane.render();
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updateGameEvent);
}
function updateCreditsScreenEvent() {
    if (gameState != "credits") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updateCreditsScreenEvent);
}
function updateUserCharSelectScreenEvent() {
    if (gameState != "userCharSelect") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updateUserCharSelectScreenEvent);
}
function updateOpCharSelectScreenEvent() {
    if (gameState != "opCharSelect") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updateOpCharSelectScreenEvent);
}
function updateTeamIntroScreenEvent() {
    if (gameState != "teamIntro") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    for (var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render(ctx);
        if (aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    requestAnimFrame(updateTeamIntroScreenEvent);
}
function updateTeamOutroScreenEvent() {
    if (gameState != "teamOutro") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    for (var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render(ctx);
        if (aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    requestAnimFrame(updateTeamOutroScreenEvent);
}
function updateChallengeSelectScreenEvent() {
    if (gameState != "challengeSelect") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updateChallengeSelectScreenEvent);
}
function updateChallengeProgressScreenEvent() {
    if (gameState != "challengeProgress") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updateChallengeProgressScreenEvent);
}
function updateGameIntroScreenEvent() {
    if (gameState != "gameIntro") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updateGameIntroScreenEvent);
}
function updateGameOverScreenEvent() {
    if (gameState != "gameOver") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    if (oCurGameScores.totalScore >= oOpGameScores.totalScore && Math.random() * 1 > .95) {
        addFirework(Math.random() * canvas.width, Math.random() * canvas.height, 2);
    }
    for (var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render(ctx);
        if (aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    requestAnimFrame(updateGameOverScreenEvent);
}
function updateCupWinnerScreenEvent() {
    if (gameState != "cupWinner") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    checkButtonsOver();
    if (Math.random() * 1 > .95) {
        addFirework(Math.random() * canvas.width, Math.random() * canvas.height, 2);
    }
    for (var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render(ctx);
        if (aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    requestAnimFrame(updateCupWinnerScreenEvent);
}
function updateSplashScreenEvent() {
    if (gameState != "splash") {
        return;
    }
    delta = getDelta();
    splashTimer += delta;
    if (splashTimer > 2.5) {
        if (audioType == 1 && !muted) {
            if (saveDataHandler.getAudioState() == 1) {
                playMusic();
                if (!hasFocus) {
                    music.pause();
                }
            }
        }
        initStartScreen();
        return;
    }
    background.render();
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updateSplashScreenEvent);
}
function update1PScreenEvent() {
    if (gameState != "1PStart") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    for (var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render(ctx);
        if (aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    checkButtonsOver();
    requestAnimFrame(update1PScreenEvent);
}
function updateStartScreenEvent() {
    if (gameState != "start") {
        return;
    }
    delta = getDelta();
    background.render();
    for (var i = 0; i < aFallingItems.length; i++) {
        aFallingItems[i].update();
        aFallingItems[i].render();
    }
    panel.update();
    panel.render();
    for (var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render(ctx);
        if (aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    checkButtonsOver();
    requestAnimFrame(updateStartScreenEvent);
}
function updateLoaderEvent() {
    if (gameState != "loading") {
        return;
    }
    delta = getDelta();
    assetLib.render();
    requestAnimFrame(updateLoaderEvent);
}
function updatePauseEvent() {
    if (gameState != "pause") {
        return;
    }
    delta = getDelta();
    background.render();
    panel.update();
    panel.render();
    checkButtonsOver();
    requestAnimFrame(updatePauseEvent);
}
function updateRotateWarningEvent() {
    if (gameState != "rotated") {
        return;
    }
    delta = getDelta();
    panel.update();
    panel.render(false);
    requestAnimFrame(updateRotateWarningEvent);
}
function addDirectText(_font, _size, _align, _x, _y, _str, _col) {
    if (_col === void 0) { _col = "#202020"; }
    ctx.fillStyle = _col;
    ctx.textAlign = _align;
    ctx.font = _size + "px " + assetLib.textData.langText["font" + _font][curLang];
    ctx.fillText(_str, _x, _y);
}
function addText(_font, _size, _width, _align, _x, _y, _str, _col) {
    if (_col === void 0) { _col = "#202020"; }
    ctx.fillStyle = _col;
    ctx.textAlign = _align;
    if (_width < getTextWidth(_font, _size, _str)) {
        var breakCount = 0;
        _size--;
        while (_width < getTextWidth(_font, _size, _str)) {
            _size--;
            if (breakCount > 100) {
                break;
            }
        }
    }
    if (curLang == "ar") {
        _y -= _size / 15;
    }
    ctx.font = _size + "px " + assetLib.textData.langText["font" + _font][curLang];
    ctx.fillText(getText(_str), _x, _y);
}
function getText(_str) {
    var tempText = assetLib.textData.langText[_str][curLang];
    if (curLang == "de") {
    }
    return tempText;
}
function getTextWidth(_font, _size, _str) {
    ctx.font = _size + "px " + assetLib.textData.langText["font" + _font][curLang];
    var metrics = ctx.measureText(getText(_str));
    return metrics.width;
}
function getCorrectedTextWidth(_font, _size, _width, _str) {
    if (_width < getTextWidth(_font, _size, _str)) {
        var breakCount = 0;
        _size--;
        while (_width < getTextWidth(_font, _size, _str)) {
            _size--;
            if (breakCount > 100) {
                break;
            }
        }
    }
    ctx.font = _size + "px " + assetLib.textData.langText["font" + _font][curLang];
    var metrics = ctx.measureText(getText(_str));
    return metrics.width;
}
function checkButtonsOver() {
    if (isMobile) {
        return;
    }
    for (var i = 0; i < panel.aButs.length; i++) {
        panel.aButs[i].isOver = false;
        if (userInput.mouseX > panel.aButs[i].aOverData[0] && userInput.mouseX < panel.aButs[i].aOverData[2] && userInput.mouseY > panel.aButs[i].aOverData[1] && userInput.mouseY < panel.aButs[i].aOverData[3]) {
            panel.aButs[i].isOver = true;
        }
    }
}
function clearButtonOvers() {
    userInput.mouseX = -100;
    userInput.mouseY = -100;
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
    preAssetLib = new Utils.AssetLoader(curLang, [{
            id: "loader",
            file: "images/loader.png"
        }, {
            id: "loadSpinner",
            file: "images/loadSpinner.png"
        }], ctx, canvas.width, canvas.height, false);
    preAssetLib.onReady(initLoadAssets);
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
            id: "bgMain",
            file: "images/bgMain.jpg"
        }, {
            id: "uiButs",
            file: "images/uiButs.png",
            oAtlasData: {
                id0: { x: 831, y: 891, width: 64, height: 67 },
                id1: { x: 846, y: 792, width: 64, height: 67 },
                id10: { x: 846, y: 309, width: 64, height: 67 },
                id11: { x: 846, y: 378, width: 64, height: 67 },
                id12: { x: 182, y: 826, width: 180, height: 137 },
                id13: { x: 0, y: 276, width: 180, height: 137 },
                id14: { x: 0, y: 830, width: 180, height: 137 },
                id15: { x: 182, y: 276, width: 180, height: 137 },
                id16: { x: 726, y: 252, width: 118, height: 128 },
                id17: { x: 726, y: 761, width: 118, height: 128 },
                id18: { x: 726, y: 634, width: 118, height: 125 },
                id19: { x: 726, y: 507, width: 118, height: 125 },
                id2: { x: 846, y: 723, width: 64, height: 67 },
                id20: { x: 364, y: 532, width: 119, height: 129 },
                id21: { x: 364, y: 401, width: 119, height: 129 },
                id22: { x: 726, y: 382, width: 118, height: 123 },
                id23: { x: 619, y: 127, width: 118, height: 123 },
                id24: { x: 498, y: 0, width: 119, height: 123 },
                id25: { x: 485, y: 653, width: 119, height: 123 },
                id26: { x: 606, y: 757, width: 118, height: 122 },
                id27: { x: 606, y: 633, width: 118, height: 122 },
                id28: { x: 498, y: 125, width: 119, height: 125 },
                id29: { x: 364, y: 274, width: 119, height: 125 },
                id3: { x: 846, y: 654, width: 64, height: 67 },
                id30: { x: 485, y: 526, width: 119, height: 125 },
                id31: { x: 485, y: 399, width: 119, height: 125 },
                id32: { x: 485, y: 274, width: 119, height: 123 },
                id33: { x: 485, y: 778, width: 119, height: 123 },
                id34: { x: 606, y: 379, width: 118, height: 125 },
                id35: { x: 606, y: 252, width: 118, height: 125 },
                id36: { x: 619, y: 0, width: 118, height: 125 },
                id37: { x: 606, y: 506, width: 118, height: 125 },
                id38: { x: 364, y: 792, width: 119, height: 127 },
                id39: { x: 364, y: 663, width: 119, height: 127 },
                id4: { x: 846, y: 585, width: 64, height: 67 },
                id40: { x: 739, y: 0, width: 96, height: 99 },
                id41: { x: 897, y: 861, width: 64, height: 67 },
                id42: { x: 699, y: 891, width: 64, height: 67 },
                id43: { x: 485, y: 903, width: 105, height: 67 },
                id44: { x: 592, y: 903, width: 105, height: 67 },
                id45: { x: 765, y: 891, width: 64, height: 67 },
                id46: { x: 846, y: 447, width: 64, height: 67 },
                id47: { x: 0, y: 693, width: 180, height: 135 },
                id48: { x: 182, y: 689, width: 180, height: 135 },
                id49: { x: 182, y: 552, width: 180, height: 135 },
                id5: { x: 846, y: 516, width: 64, height: 67 },
                id50: { x: 182, y: 415, width: 180, height: 135 },
                id51: { x: 183, y: 138, width: 179, height: 136 },
                id52: { x: 183, y: 0, width: 179, height: 136 },
                id53: { x: 739, y: 101, width: 96, height: 101 },
                id54: { x: 837, y: 0, width: 96, height: 101 },
                id55: { x: 837, y: 103, width: 95, height: 101 },
                id56: { x: 846, y: 206, width: 95, height: 101 },
                id57: { x: 364, y: 137, width: 132, height: 135 },
                id58: { x: 364, y: 0, width: 132, height: 135 },
                id6: { x: 0, y: 554, width: 180, height: 137 },
                id7: { x: 0, y: 415, width: 180, height: 137 },
                id8: { x: 0, y: 138, width: 181, height: 136 },
                id9: { x: 0, y: 0, width: 181, height: 136 }
            }
        }, {
            id: "uiElements",
            file: "images/uiElements.png",
            oAtlasData: {
                id0: { x: 1013, y: 1373, width: 299, height: 317 },
                id1: { x: 1614, y: 1236, width: 298, height: 310 },
                id10: { x: 1816, y: 304, width: 298, height: 311 },
                id11: { x: 1516, y: 310, width: 298, height: 312 },
                id12: { x: 1950, y: 1623, width: 131, height: 130 },
                id13: { x: 1950, y: 1491, width: 131, height: 130 },
                id14: { x: 1949, y: 1095, width: 131, height: 130 },
                id15: { x: 1951, y: 917, width: 131, height: 130 },
                id16: { x: 1914, y: 1227, width: 131, height: 130 },
                id17: { x: 1833, y: 132, width: 131, height: 130 },
                id18: { x: 1914, y: 1359, width: 131, height: 130 },
                id19: { x: 1817, y: 1680, width: 131, height: 130 },
                id2: { x: 1517, y: 1553, width: 298, height: 320 },
                id20: { x: 1817, y: 1548, width: 131, height: 130 },
                id21: { x: 1816, y: 1095, width: 131, height: 130 },
                id22: { x: 1833, y: 0, width: 131, height: 130 },
                id23: { x: 1966, y: 0, width: 130, height: 130 },
                id24: { x: 526, y: 1624, width: 378, height: 74 },
                id25: { x: 902, y: 1768, width: 313, height: 66 },
                id26: { x: 902, y: 1700, width: 313, height: 66 },
                id27: { x: 902, y: 1903, width: 313, height: 66 },
                id28: { x: 902, y: 1836, width: 313, height: 65 },
                id29: { x: 911, y: 1373, width: 71, height: 71 },
                id3: { x: 1533, y: 0, width: 298, height: 302 },
                id30: { x: 578, y: 0, width: 341, height: 282 },
                id31: { x: 0, y: 1446, width: 524, height: 524 },
                id32: { x: 911, y: 721, width: 303, height: 324 },
                id33: { x: 911, y: 395, width: 303, height: 324 },
                id34: { x: 911, y: 1047, width: 303, height: 324 },
                id35: { x: 928, y: 0, width: 303, height: 324 },
                id36: { x: 781, y: 2061, width: 184, height: 42 },
                id37: { x: 397, y: 2061, width: 196, height: 41 },
                id38: { x: 595, y: 2061, width: 184, height: 41 },
                id39: { x: 0, y: 2061, width: 197, height: 41 },
                id4: { x: 1516, y: 932, width: 298, height: 302 },
                id40: { x: 928, y: 326, width: 184, height: 41 },
                id41: { x: 199, y: 2061, width: 196, height: 41 },
                id42: { x: 1782, y: 1875, width: 252, height: 194 },
                id43: { x: 552, y: 395, width: 357, height: 208 },
                id44: { x: 552, y: 815, width: 357, height: 208 },
                id45: { x: 552, y: 1025, width: 357, height: 208 },
                id46: { x: 552, y: 1235, width: 357, height: 208 },
                id47: { x: 552, y: 605, width: 357, height: 208 },
                id48: { x: 1950, y: 1755, width: 77, height: 99 },
                id49: { x: 0, y: 838, width: 550, height: 131 },
                id5: { x: 1314, y: 1249, width: 298, height: 302 },
                id50: { x: 0, y: 572, width: 550, height: 131 },
                id51: { x: 0, y: 439, width: 550, height: 131 },
                id52: { x: 0, y: 1047, width: 550, height: 131 },
                id53: { x: 1314, y: 1553, width: 132, height: 126 },
                id54: { x: 1216, y: 1249, width: 87, height: 116 },
                id55: { x: 1504, y: 2004, width: 263, height: 87 },
                id56: { x: 526, y: 1789, width: 374, height: 87 },
                id57: { x: 526, y: 1446, width: 485, height: 87 },
                id58: { x: 1517, y: 1875, width: 263, height: 87 },
                id59: { x: 526, y: 1700, width: 374, height: 87 },
                id6: { x: 1233, y: 0, width: 298, height: 308 },
                id60: { x: 526, y: 1535, width: 485, height: 87 },
                id61: { x: 1239, y: 2004, width: 263, height: 87 },
                id62: { x: 552, y: 306, width: 374, height: 87 },
                id63: { x: 0, y: 1972, width: 485, height: 87 },
                id64: { x: 974, y: 2004, width: 263, height: 87 },
                id65: { x: 526, y: 1878, width: 374, height: 87 },
                id66: { x: 487, y: 1972, width: 485, height: 87 },
                id67: { x: 604, y: 284, width: 23, height: 18 },
                id68: { x: 629, y: 284, width: 23, height: 18 },
                id69: { x: 0, y: 2105, width: 19, height: 2 },
                id7: { x: 1217, y: 1692, width: 298, height: 310 },
                id70: { x: 906, y: 1624, width: 78, height: 51 },
                id71: { x: 0, y: 705, width: 550, height: 131 },
                id72: { x: 0, y: 306, width: 550, height: 131 },
                id73: { x: 0, y: 1313, width: 550, height: 131 },
                id74: { x: 0, y: 1180, width: 550, height: 131 },
                id75: { x: 1816, y: 617, width: 218, height: 298 },
                id76: { x: 1216, y: 326, width: 298, height: 306 },
                id77: { x: 0, y: 971, width: 550, height: 74 },
                id78: { x: 1516, y: 624, width: 298, height: 306 },
                id79: { x: 1448, y: 1553, width: 62, height: 58 },
                id8: { x: 1216, y: 944, width: 298, height: 303 },
                id80: { x: 578, y: 284, width: 24, height: 20 },
                id81: { x: 1114, y: 326, width: 62, height: 58 },
                id82: { x: 0, y: 0, width: 576, height: 304 },
                id83: { x: 1816, y: 917, width: 133, height: 176 },
                id9: { x: 1216, y: 634, width: 298, height: 308 }
            }
        }, {
            id: "gameElements",
            file: "images/gameElements.png",
            oAtlasData: {
                id0: { x: 609, y: 857, width: 198, height: 198 },
                id1: { x: 809, y: 926, width: 198, height: 198 },
                id10: { x: 460, y: 657, width: 198, height: 198 },
                id11: { x: 209, y: 870, width: 198, height: 198 },
                id12: { x: 660, y: 526, width: 198, height: 198 },
                id13: { x: 0, y: 777, width: 211, height: 91 },
                id14: { x: 0, y: 870, width: 207, height: 206 },
                id15: { x: 0, y: 0, width: 504, height: 324 },
                id16: { x: 0, y: 326, width: 503, height: 329 },
                id17: { x: 1009, y: 800, width: 134, height: 273 },
                id18: { x: 1105, y: 200, width: 134, height: 273 },
                id19: { x: 0, y: 717, width: 258, height: 58 },
                id2: { x: 1009, y: 600, width: 198, height: 198 },
                id20: { x: 0, y: 657, width: 258, height: 58 },
                id21: { x: 0, y: 1078, width: 71, height: 75 },
                id22: { x: 0, y: 1155, width: 71, height: 75 },
                id23: { x: 209, y: 1070, width: 198, height: 198 },
                id24: { x: 260, y: 657, width: 198, height: 198 },
                id25: { x: 409, y: 857, width: 198, height: 198 },
                id26: { x: 505, y: 326, width: 198, height: 198 },
                id27: { x: 506, y: 0, width: 198, height: 198 },
                id28: { x: 609, y: 1057, width: 198, height: 198 },
                id3: { x: 906, y: 0, width: 198, height: 198 },
                id4: { x: 905, y: 200, width: 198, height: 198 },
                id5: { x: 706, y: 0, width: 198, height: 198 },
                id6: { x: 809, y: 726, width: 198, height: 198 },
                id7: { x: 860, y: 400, width: 198, height: 198 },
                id8: { x: 705, y: 200, width: 198, height: 198 },
                id9: { x: 409, y: 1057, width: 198, height: 198 }
            }
        }, {
            id: "tutElements",
            file: "images/tutElements.png",
            oAtlasData: {
                id0: { x: 0, y: 0, width: 402, height: 403 },
                id1: { x: 512, y: 398, width: 136, height: 197 },
                id2: { x: 404, y: 0, width: 221, height: 197 },
                id3: { x: 404, y: 199, width: 220, height: 197 },
                id4: { x: 0, y: 543, width: 72, height: 82 },
                id5: { x: 256, y: 405, width: 254, height: 136 },
                id6: { x: 0, y: 405, width: 254, height: 136 }
            }
        }, {
            id: "scoreElements",
            file: "images/scoreElements.png",
            oAtlasData: {
                id0: { x: 0, y: 0, width: 501, height: 169 },
                id1: { x: 0, y: 511, width: 481, height: 259 },
                id2: { x: 483, y: 511, width: 390, height: 186 },
                id3: { x: 0, y: 171, width: 501, height: 168 },
                id4: { x: 483, y: 699, width: 355, height: 226 },
                id5: { x: 715, y: 213, width: 210, height: 211 },
                id6: { x: 503, y: 0, width: 210, height: 211 },
                id7: { x: 503, y: 213, width: 210, height: 211 },
                id8: { x: 715, y: 0, width: 210, height: 211 },
                id9: { x: 0, y: 341, width: 500, height: 168 }
            }
        }, {
            id: "titleLogo",
            file: "images/title/" + curLang + ".png"
        }, {
            id: "rotateIcon",
            file: "images/rotate.jpg"
        }, {
            id: "lanes0",
            file: "images/lanes0.png"
        }, {
            id: "pin",
            file: "images/pin_58x197.png"
        }, {
            id: "pinReflect",
            file: "images/pinReflect_58x198.png"
        }, {
            id: "info",
            file: "images/info.png"
        }, {
            id: "firework",
            file: "images/firework_175x175.png",
            oAnims: {
                explode: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]
            }
        }, {
            id: "tut0",
            file: "images/tut_01_202x350.png",
            oAnims: {
                anim: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 19, 19, 20, 21, 22, 23, 24, 25, 26, 26, 26, 26, 26, 26, 26, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 44, 44, 44, 44, 44, 44, 44]
            }
        }, {
            id: "tut1",
            file: "images/tut_02_402x402.png",
            oAnims: {
                anim: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
        }, {
            id: "ballRoll",
            file: "images/ballRoll_197x196.png",
            oAnims: {
                anim: [0, 1, 2, 3, 4, 5]
            }
        }, {
            id: "bgLane0",
            file: "images/bgLane0.jpg"
        }, {
            id: "bgLane1",
            file: "images/bgLane1.jpg"
        }, {
            id: "bgLane2",
            file: "images/bgLane2.jpg"
        }, {
            id: "bgLaneReflect0",
            file: "images/bgLaneReflect0.png"
        }], ctx, canvas.width, canvas.height);
    oImageIds.pin0 = "id0";
    oImageIds.tut0Bg = "id0";
    oImageIds.tiltPhone = "id1";
    oImageIds.tapPhone0 = "id2";
    oImageIds.tapPhone1 = "id3";
    oImageIds.tutBall = "id4";
    oImageIds.arrowKey1 = "id5";
    oImageIds.arrowKey0 = "id6";
    oImageIds.resultBg0 = "id0";
    oImageIds.strikePins = "id1";
    oImageIds.splitPins = "id2";
    oImageIds.resultBg1 = "id3";
    oImageIds.scorePins = "id4";
    oImageIds.scoreBg0 = "id5";
    oImageIds.scoreBg1 = "id6";
    oImageIds.scoreBg2 = "id7";
    oImageIds.scoreBg3 = "id8";
    oImageIds.loseHeart = "id9";
    oImageIds.ball0 = "id0";
    oImageIds.ball1 = "id1";
    oImageIds.ball2 = "id2";
    oImageIds.ball3 = "id3";
    oImageIds.ball4 = "id4";
    oImageIds.ball5 = "id5";
    oImageIds.ball6 = "id6";
    oImageIds.ball7 = "id7";
    oImageIds.ball8 = "id8";
    oImageIds.ball9 = "id9";
    oImageIds.ball10 = "id10";
    oImageIds.ball11 = "id11";
    oImageIds.ball12 = "id12";
    oImageIds.ballShadow = "id13";
    oImageIds.ballReflect = "id14";
    oImageIds.goal = "id15";
    oImageIds.goalReflect = "id16";
    oImageIds.post0 = "id17";
    oImageIds.post1 = "id18";
    oImageIds.jump0 = "id19";
    oImageIds.jump1 = "id20";
    oImageIds.pIcon1 = "id21";
    oImageIds.pIcon2 = "id22";
    oImageIds.ball13 = "id23";
    oImageIds.ball14 = "id24";
    oImageIds.ball15 = "id25";
    oImageIds.ball16 = "id26";
    oImageIds.ball17 = "id27";
    oImageIds.ball18 = "id28";
    oImageIds.infoBut = "id0";
    oImageIds.infoButOver = "id1";
    oImageIds.muteBut1 = "id2";
    oImageIds.muteBut1Over = "id3";
    oImageIds.muteBut0 = "id4";
    oImageIds.muteBut0Over = "id5";
    oImageIds.tournamentBut = "id6";
    oImageIds.tournamentButOver = "id7";
    oImageIds.quickGameBut = "id8";
    oImageIds.quickGameButOver = "id9";
    oImageIds.backBut = "id10";
    oImageIds.backButOver = "id11";
    oImageIds.playBut = "id12";
    oImageIds.playButOver = "id13";
    oImageIds.replayBut = "id14";
    oImageIds.replayButOver = "id15";
    oImageIds.smallIcon0 = "id16";
    oImageIds.smallIcon0Over = "id17";
    oImageIds.smallIcon1 = "id18";
    oImageIds.smallIcon1Over = "id19";
    oImageIds.smallIcon2 = "id20";
    oImageIds.smallIcon2Over = "id21";
    oImageIds.smallIcon3 = "id22";
    oImageIds.smallIcon3Over = "id23";
    oImageIds.smallIcon4 = "id24";
    oImageIds.smallIcon4Over = "id25";
    oImageIds.smallIcon5 = "id26";
    oImageIds.smallIcon5Over = "id27";
    oImageIds.smallIcon6 = "id28";
    oImageIds.smallIcon6Over = "id29";
    oImageIds.smallIcon7 = "id30";
    oImageIds.smallIcon7Over = "id31";
    oImageIds.smallIcon8 = "id32";
    oImageIds.smallIcon8Over = "id33";
    oImageIds.smallIcon9 = "id34";
    oImageIds.smallIcon9Over = "id35";
    oImageIds.smallIcon10 = "id36";
    oImageIds.smallIcon10Over = "id37";
    oImageIds.smallIcon11 = "id38";
    oImageIds.smallIcon11Over = "id39";
    oImageIds.smallIcon19 = "id40";
    oImageIds.pauseBut = "id41";
    oImageIds.pauseButOver = "id42";
    oImageIds.resetBut = "id43";
    oImageIds.resetButOver = "id44";
    oImageIds.quitBut = "id45";
    oImageIds.quitButOver = "id46";
    oImageIds.twoPBut = "id47";
    oImageIds.twoPButOver = "id48";
    oImageIds.onePBut = "id49";
    oImageIds.onePButOver = "id50";
    oImageIds.challengeBut = "id51";
    oImageIds.challengeButOver = "id52";
    oImageIds.challengeTickBut = "id53";
    oImageIds.challengeTickButOver = "id54";
    oImageIds.challengePlayBut = "id55";
    oImageIds.challengePlayButOver = "id56";
    oImageIds.roundPlayBut = "id57";
    oImageIds.roundPlayButOver = "id58";
    oImageIds.largeIcon0 = "id0";
    oImageIds.largeIcon1 = "id1";
    oImageIds.largeIcon2 = "id2";
    oImageIds.largeIcon3 = "id3";
    oImageIds.largeIcon4 = "id4";
    oImageIds.largeIcon5 = "id5";
    oImageIds.largeIcon6 = "id6";
    oImageIds.largeIcon7 = "id7";
    oImageIds.largeIcon8 = "id8";
    oImageIds.largeIcon9 = "id9";
    oImageIds.largeIcon10 = "id10";
    oImageIds.largeIcon11 = "id11";
    oImageIds.ballIcon0 = "id12";
    oImageIds.ballIcon1 = "id13";
    oImageIds.ballIcon2 = "id14";
    oImageIds.ballIcon3 = "id15";
    oImageIds.ballIcon4 = "id16";
    oImageIds.ballIcon5 = "id17";
    oImageIds.ballIcon6 = "id18";
    oImageIds.ballIcon7 = "id19";
    oImageIds.ballIcon8 = "id20";
    oImageIds.ballIcon9 = "id21";
    oImageIds.ballIcon10 = "id22";
    oImageIds.ballIcon11 = "id23";
    oImageIds.headerTextPanel = "id24";
    oImageIds.namePanel0 = "id25";
    oImageIds.namePanel1 = "id26";
    oImageIds.namePanel2 = "id27";
    oImageIds.namePanel3 = "id28";
    oImageIds.tick = "id29";
    oImageIds.smallFlare = "id30";
    oImageIds.largeFlare = "id31";
    oImageIds.slidePanel0 = "id32";
    oImageIds.slidePanel1 = "id33";
    oImageIds.slidePanel2 = "id34";
    oImageIds.slidePanel3 = "id35";
    oImageIds.statBar01 = "id36";
    oImageIds.statBar00 = "id37";
    oImageIds.statBar11 = "id38";
    oImageIds.statBar10 = "id39";
    oImageIds.statBar21 = "id40";
    oImageIds.statBar20 = "id41";
    oImageIds.cross = "id42";
    oImageIds.teamPanel0 = "id43";
    oImageIds.teamPanel1 = "id44";
    oImageIds.teamPanel2 = "id45";
    oImageIds.teamPanel3 = "id46";
    oImageIds.teamPanel4 = "id47";
    oImageIds.happyCup = "id48";
    oImageIds.lineTextPanel00 = "id49";
    oImageIds.lineTextPanel10 = "id50";
    oImageIds.lineTextPanel20 = "id51";
    oImageIds.lineTextPanel30 = "id52";
    oImageIds.vs = "id53";
    oImageIds.rosette = "id54";
    oImageIds.scorePanel00 = "id55";
    oImageIds.scorePanel01 = "id56";
    oImageIds.scorePanel02 = "id57";
    oImageIds.scorePanel10 = "id58";
    oImageIds.scorePanel11 = "id59";
    oImageIds.scorePanel12 = "id60";
    oImageIds.scorePanel20 = "id61";
    oImageIds.scorePanel21 = "id62";
    oImageIds.scorePanel22 = "id63";
    oImageIds.scorePanel30 = "id64";
    oImageIds.scorePanel31 = "id65";
    oImageIds.scorePanel32 = "id66";
    oImageIds.spareMark = "id67";
    oImageIds.strikeMark = "id68";
    oImageIds.missMark = "id69";
    oImageIds.cnLogo = "id70";
    oImageIds.lineTextPanel01 = "id71";
    oImageIds.lineTextPanel11 = "id72";
    oImageIds.lineTextPanel21 = "id73";
    oImageIds.lineTextPanel31 = "id74";
    oImageIds.winnersCup = "id75";
    oImageIds.largeIconMystery = "id76";
    oImageIds.challengeIntroPanel = "id77";
    oImageIds.largeIcon99 = "id78";
    oImageIds.heart0 = "id79";
    oImageIds.crown = "id80";
    oImageIds.heart1 = "id81";
    oImageIds.titlePins = "id82";
    oImageIds.winnerBadge = "id83";
    assetLib.onReady(initTiltCheck);
    gameState = "loading";
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
    var maxW;
    var maxH;
    var minW;
    var minH;
    canvasScale = 1;
    if (tempInnerWidth < tempInnerHeight) {
        if (isRotated) {
            if (gameState != "loading") {
                initBackFromRotate();
            }
        }
        maxW = maxWidth;
        maxH = maxHeight;
        minW = minWidth;
        minH = minHeight;
    }
    else {
        maxW = maxWidth;
        maxH = maxHeight;
        minW = minWidth;
        minH = minHeight;
    }
    if (canvas.width / canvas.height < minW / minH) {
        canvas.width = maxW;
        canvas.height = maxW * (tempInnerHeight / tempInnerWidth);
        canvasScale = maxW / tempInnerWidth;
    }
    else {
        canvas.height = minH;
        canvas.width = minH * (tempInnerWidth / tempInnerHeight);
        canvasScale = minH / tempInnerHeight;
    }
    switch (gameState) {
        case "game":
            if (throwState == 0) {
                ball.targX = canvas.width / 2;
            }
            if (firstGoState == 3 && (whosGo == 0 || (whosGo == 1 && playerNum == 2))) {
                userInput.addHitArea("gameTouch", butEventHandler, { isDraggable: true, multiTouch: true }, "rect", { aRect: [0, 50, canvas.width, canvas.height] }, true);
            }
            break;
        case "start":
        case "credits":
        case "gameComplete":
            break;
    }
    this.prevCanvasWidth = tempInnerWidth;
    this.prevCanvasHeight = tempInnerHeight;
    window.scrollTo(0, 0);
}
function initRotateWarning() {
    isRotated = true;
    prevGameState = gameState;
    gameState = "rotated";
    background = new Elements.Background();
    previousTime = new Date().getTime();
    resizeCanvas();
    updateRotateWarningEvent();
}
function initBackFromRotate() {
    isRotated = false;
    switch (prevGameState) {
        case "1PStart":
            gameState = "1PStart";
            previousTime = new Date().getTime();
            update1PScreenEvent();
            break;
        case "start":
            gameState = "start";
            previousTime = new Date().getTime();
            updateStartScreenEvent();
            break;
        case "pause":
            gameState = "pause";
            previousTime = new Date().getTime();
            updatePauseEvent();
            break;
        case "credits":
            gameState = "credits";
            previousTime = new Date().getTime();
            updateCreditsScreenEvent();
            break;
        case "challengeSelect":
            gameState = "challengeSelect";
            previousTime = new Date().getTime();
            updateChallengeSelectScreenEvent();
            break;
        case "userCharSelect":
            gameState = "userCharSelect";
            previousTime = new Date().getTime();
            updateUserCharSelectScreenEvent();
            break;
        case "opCharSelect":
            gameState = "opCharSelect";
            previousTime = new Date().getTime();
            updateOpCharSelectScreenEvent();
            break;
        case "challengeProgress":
            gameState = "challengeProgress";
            previousTime = new Date().getTime();
            updateChallengeProgressScreenEvent();
            break;
        case "teamIntro":
            gameState = "teamIntro";
            previousTime = new Date().getTime();
            updateTeamIntroScreenEvent();
            break;
        case "teamOutro":
            gameState = "teamOutro";
            previousTime = new Date().getTime();
            updateTeamOutroScreenEvent();
            break;
        case "gameIntro":
            gameState = "gameIntro";
            previousTime = new Date().getTime();
            updateGameIntroScreenEvent();
            break;
        case "game":
            gameState = "game";
            previousTime = new Date().getTime();
            updateGameEvent();
            break;
        case "gameOver":
            gameState = "gameOver";
            previousTime = new Date().getTime();
            updateGameOverScreenEvent();
            break;
        case "cupWinner":
            gameState = "cupWinner";
            previousTime = new Date().getTime();
            updateCupWinnerScreenEvent();
            break;
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
                music.volume(.7);
            }
            else {
                music.volume(.4);
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
