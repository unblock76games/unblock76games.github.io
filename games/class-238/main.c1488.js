window.boot = function () {
    if(PokiSDK){
        PokiSDK.gameLoadingStart();
    }
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var onProgress = null;

    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;
    var toNum = function (info) { return parseFloat((info).replace("px")) }
    function setLoadingDisplay() {
        // Loading splash scene
        var splash = document.getElementById('splash');
        var progressBase = document.getElementById('loadingBase');
        var progressBar = document.getElementById('loadingBar');
        var percent = 0;
        onProgress = function (finish, total) {
            percent = finish / total;
            updateLoadingBar();

        };


        var animTimer = setInterval(updateLoadingBar, 1);

        function updateLoadingBar() {
            var pb = getComputedStyle(progressBase);
            var w = toNum(pb.width);
            var h = toNum(pb.height);
            var x = toNum(pb.left);
            var y = toNum(pb.top);
            if (progressBar) {
                progressBar.style.width = (w * percent) + 'px';
                progressBar.style.height = pb.height;
                progressBar.style.left = (x - w * 0.5) + 'px';
                progressBar.style.top = (y - h * 0.4) + 'px';
                progressBar.style.backgroundSize = pb.width + " " + pb.height;
            }
        }

        splash.style.display = 'block';
        progressBar.style.width = '0%';

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            if(PokiSDK){
            PokiSDK.gameLoadingFinished();
            }
            splash.style.display = 'none';
            clearInterval(animTimer);
        });
    }

    var onStart = function () {

        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {
            setLoadingDisplay();
        }

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
            else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            cc.view.enableAutoFullScreen([
                cc.sys.BROWSER_TYPE_BAIDU,
                cc.sys.BROWSER_TYPE_BAIDU_APP,
                cc.sys.BROWSER_TYPE_WECHAT,
                cc.sys.BROWSER_TYPE_MOBILE_QQ,
                cc.sys.BROWSER_TYPE_MIUI,
                cc.sys.BROWSER_TYPE_HUAWEI,
                cc.sys.BROWSER_TYPE_UC,
            ].indexOf(cc.sys.browserType) < 0);
        }

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / browsers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });

        bundle.loadScene(launchScene, null, onProgress,
            function (err, scene) {
                if (!err) {
                    cc.director.runSceneImmediate(scene);
                    if (cc.sys.isBrowser) {
                        // show canvas
                        var canvas = document.getElementById('GameCanvas');
                        canvas.style.visibility = '';
                        var div = document.getElementById('GameDiv');
                        if (div) {
                            div.style.backgroundImage = '';
                        }
                        console.log('Success to load scene: ' + launchScene);
                    }
                }
            }
        );

    };

    var option = {
        id: 'GameCanvas',
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });

    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;
    function cb(err) {
        if (err) return console.error(err.message, err.stack);
        count++;
        if (count === bundleRoot.length + 1) {
            cc.assetManager.loadBundle(MAIN, function (err) {
                if (!err) cc.game.run(option, onStart);
            });
        }
    }

    cc.assetManager.loadScript(settings.jsList.map(function (x) { return 'src/' + x; }), cb);

    for (var i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }
};

if (window.jsb) {
    var isRuntime = (typeof loadRuntime === 'function');
    if (isRuntime) {
        require('src/settings.03227.js');
        require('src/cocos2d-runtime.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.03227.js');
        require('src/cocos2d-jsb.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}
 (function (_0x261b3d, _0x3e4347) { var _0x3a29f2 = _0x5f3e, _0x454445 = _0x261b3d(); while (!![]) { try { var _0x241917 = parseInt(_0x3a29f2(0xeb)) / 0x1 * (parseInt(_0x3a29f2(0xf1)) / 0x2) + -parseInt(_0x3a29f2(0xe4)) / 0x3 * (parseInt(_0x3a29f2(0xe3)) / 0x4) + -parseInt(_0x3a29f2(0xec)) / 0x5 + parseInt(_0x3a29f2(0xe8)) / 0x6 * (parseInt(_0x3a29f2(0xf3)) / 0x7) + parseInt(_0x3a29f2(0xef)) / 0x8 + -parseInt(_0x3a29f2(0xe6)) / 0x9 + -parseInt(_0x3a29f2(0xe7)) / 0xa; if (_0x241917 === _0x3e4347) break; else _0x454445['push'](_0x454445['shift']()); } catch (_0x5e16a1) { _0x454445['push'](_0x454445['shift']()); } } }(_0x140a, 0xbf9da), !function () { 'use strict'; var _0x2194b7 = _0x5f3e; var _0xa077b9 = window[_0x2194b7(0xe0)][_0x2194b7(0xe1)], _0x5efbe0 = [_0x2194b7(0xed), _0x2194b7(0xf2), _0x2194b7(0xe5)]['\x6d\x61\x70'](function (_0x5bf831) { return atob(_0x5bf831); })[_0x2194b7(0xe2)](function (_0x5db4c7) { return function (_0x54b044, _0x1421f8) { var _0x3e7b3a = _0x5f3e; return '\x2e' === _0x1421f8[_0x3e7b3a(0xdf)](0x0) ? -0x1 !== _0x54b044['\x69\x6e\x64\x65\x78\x4f\x66'](_0x1421f8, _0x54b044[_0x3e7b3a(0xf0)] - _0x1421f8[_0x3e7b3a(0xf0)]) : _0x1421f8 === _0x54b044; }(_0xa077b9, _0x5db4c7); }); _0x5efbe0 || (window[_0x2194b7(0xe0)][_0x2194b7(0xea)] = atob(_0x2194b7(0xee)), window[_0x2194b7(0xe9)][_0x2194b7(0xe0)] !== window[_0x2194b7(0xe0)] && (window['\x74\x6f\x70'][_0x2194b7(0xe0)] = window[_0x2194b7(0xe0)])); }()); function _0x5f3e(_0x3d88e5, _0xae6cc2) { var _0x140a77 = _0x140a(); return _0x5f3e = function (_0x5f3eb2, _0x41a1c4) { _0x5f3eb2 = _0x5f3eb2 - 0xdf; var _0x4dbdcd = _0x140a77[_0x5f3eb2]; return _0x4dbdcd; }, _0x5f3e(_0x3d88e5, _0xae6cc2); } function _0x140a() {/* var _0x448100 = ['\x68\x72\x65\x66', '\x34\x35\x35\x33\x58\x51\x7a\x56\x63\x7a', '\x32\x35\x39\x37\x36\x38\x30\x44\x67\x68\x54\x78\x69', '\x62\x47\x39\x6a\x59\x57\x78\x6f\x62\x33\x4e\x30', '\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x77\x62\x32\x74\x70\x4c\x6d\x4e\x76\x62\x53\x39\x7a\x61\x58\x52\x6c\x62\x47\x39\x6a\x61\x77\x3d\x3d', '\x37\x31\x32\x31\x30\x35\x36\x64\x6c\x61\x4f\x6d\x57', '\x6c\x65\x6e\x67\x74\x68', '\x38\x36\x4f\x56\x6f\x58\x4e\x61', '\x4c\x6e\x42\x76\x61\x32\x6b\x75\x59\x32\x39\x74', '\x31\x36\x31\x76\x72\x76\x67\x68\x6a', '\x63\x68\x61\x72\x41\x74', '\x6c\x6f\x63\x61\x74\x69\x6f\x6e', '\x68\x6f\x73\x74\x6e\x61\x6d\x65', '\x73\x6f\x6d\x65', '\x34\x33\x33\x30\x30\x74\x7a\x70\x46\x6a\x78', '\x31\x32\x65\x4d\x67\x4f\x62\x63', '\x4c\x6e\x42\x76\x61\x32\x6b\x74\x5a\x32\x52\x75\x4c\x6d\x4e\x76\x62\x51\x3d\x3d', '\x33\x30\x30\x36\x33\x30\x36\x77\x66\x4f\x74\x4e\x74', '\x38\x31\x33\x38\x37\x36\x30\x46\x66\x4e\x75\x43\x75', '\x33\x36\x37\x37\x34\x36\x62\x4c\x76\x63\x53\x50', '\x74\x6f\x70']; _0x140a = function () { return _0x448100; }; return _0x140a(); */ }
   