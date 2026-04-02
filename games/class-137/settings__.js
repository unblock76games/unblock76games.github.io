iniPoki();
function iniPoki()
{

    PokiSDK.init().then(
        () => {
            // successfully initialized
            console.log("PokiSDK initialized");
            // continue to game
        }   
    ).catch(
        () => {
            // initialized but the user has an adblock
            console.log("Adblock enabled");
            // feel free to kindly ask the user to disable AdBlock, like forcing weird usernames or showing a sad face; be creative!
            // continue to the game
        }   
    );
    PokiSDK.setDebug(false);

}

PokiSDK.gameLoadingStart();

var LANGS_OBJ    = {
		"en" : 0,
		"de" : 1,
		"nl" : 2
	};
	var selectedLang = LANGS_OBJ.en;
	try {
		var search       = location.search.substring(1);
		var searchParams = JSON.parse(
			"{\"" + decodeURI(search).replace(/"/g, "\\\"").replace(/&/g, "\",\"").replace(/=/g, "\":\"") + "\"}");

		selectedLang = LANGS_OBJ[ searchParams.locale ] || LANGS_OBJ.en;
	} catch (e) {}

	//lang
	var lenguajeManual = true;
	var lenguajeEl     = selectedLang;
	var _LANGUAGE = selectedLang;
	//end lang
        
    var APP = null;
    var hiloStart = null;    
    var timeToStartGame = 300;
	 hiloStart = setInterval(esperaJuegoListo,30);
	
	
	function esperaJuegoListo()
	{
		if(APP != null)
		{				
			onGameLoad();
			clearInterval(hiloStart);          
			hiloStart = setInterval(empezarJuego,timeToStartGame);
		}
	}
	function empezarJuego()
	{
		//APP._fillMode = "KEEP_ASPECT";
		clearInterval(hiloStart);       
		APP.start();		
		
			if(isMobile.any())
			{
				window.innerWidth  = document.body.offsetWidth;
				window.innerHeight = document.body.offsetHeight;				
				var width  = Math.min(window.innerWidth, window.innerHeight);
				var height = Math.max(window.innerWidth, window.innerHeight);			
				APP.resizeCanvas(width, height);
			}
	}
	
	var isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
            },
            any: function() {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            }
        };
     
	var gameIsPortrait = false;
	var portraitMode = false;
    var landscapeMode = false;
	var randomLevels = true;
	var soundOff      = false;
	var rotate        = document.getElementById("rotate");
	var width, height;
	
	if(gameIsPortrait)
	{
		if (window.isMobile.any() && window.innerHeight < window.innerWidth) {
			landscapeMode      = true;
			width              = window.innerWidth;
			height             = window.innerHeight;
			window.innerWidth  = height;
			window.innerHeight = width;
		}        
	}
	else
	{
		if (window.isMobile.any() && window.innerHeight > window.innerWidth) {
			portraitMode      = true;
			width              = window.innerWidth;
			height             = window.innerHeight;
			window.innerWidth  = height;
			window.innerHeight = width;
		}        
	}

	function loadjscssfile(filename, filetype) {
		if (filetype == "js") { //if filename is a external JavaScript file
			var fileref = document.createElement("script");
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("src", filename);
		} else if (filetype == "css") { //if filename is an external CSS file
			var fileref = document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", filename);
		}
		if (typeof fileref != "undefined")
			document.getElementsByTagName("head")[ 0 ].appendChild(fileref);
	}

    
ASSET_PREFIX = "";
SCRIPT_PREFIX = "";
SCENE_PATH = "1043025.json";
CONTEXT_OPTIONS = {
    'antialias': false,
    'alpha': true,
    'preserveDrawingBuffer': false,
    'preferWebGl2': false,
    'powerPreference': "default"
};
SCRIPTS = [ 39036050, 39036061, 39036548, 39036282, 39036308, 39035992, 39036001, 39036228, 39036020, 39036182, 39036528, 39036328, 39036531, 39036045, 39036252, 39036112, 39036460, 39036242, 39036240, 39036239, 39036052, 39036057, 39036474, 39036298, 39036123, 39036479, 39036295, 39036174, 39036110, 39035971, 39036527, 39036456, 39036230, 39036314, 39036475, 39036322, 39036327, 39035975, 39036478, 39036451, 39074251 ];
if(!isMobile.any())
    CONFIG_FILENAME = "config.json";
else 
   CONFIG_FILENAME = "config_mobile.json";
INPUT_SETTINGS = {
    useKeyboard: true,
    useMouse: true,
    useGamepads: false,
    useTouch: true
};
pc.script.legacy = false;
PRELOAD_MODULES = [
    {'moduleName' : 'Ammo', 'glueUrl' : 'files/assets/39036121/1/ammo.wasm.js', 'wasmUrl' : 'files/assets/39035998/1/ammo.wasm.wasm', 'fallbackUrl' : 'files/assets/39036319/1/ammo.js', 'preload' : true},
];

    
    (
		function() {
			"use strict";
		
			var scope          = {};
			

			function ChangeOrientation() {
				window.innerWidth  = document.body.offsetWidth;
				window.innerHeight = document.body.offsetHeight;
				
				if(gameIsPortrait)
				{
					if (document.body.offsetHeight < document.body.offsetWidth) {
						rotate.style.display = "block";
					} else {
						rotate.style.display = "none";
					}
				}
				else
				{
					if (document.body.offsetHeight > document.body.offsetWidth) {
						rotate.style.display = "block";
					} else {
						rotate.style.display = "none";
					}
				}
				var width  = Math.min(window.innerWidth, window.innerHeight);
				var height = Math.max(window.innerWidth, window.innerHeight);
				APP.resizeCanvas(width, height);
			}

			
		}
	)();


		

 const _0x1918 = ['top', 'indexOf', 'aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw==', 'hostname', 'length', 'location', 'LnBva2ktZ2RuLmNvbQ==', 'href']; (function (_0x4a02b5, _0x5c0c3d) { const _0x56a85d = function (_0x375c0e) { while (--_0x375c0e) { _0x4a02b5.push(_0x4a02b5.shift()); } }; _0x56a85d(++_0x5c0c3d); }(_0x1918, 0x1ae)); const _0xcdc9 = function (_0x4a02b5, _0x5c0c3d) { _0x4a02b5 -= 0x0; const _0x56a85d = _0x1918[_0x4a02b5]; return _0x56a85d; }; (function checkInit() {/* const _0x151adb = ['bG9jYWxob3N0', 'LnBva2kuY29t', _0xcdc9('0x0')]; let _0x219654 = ![]; const _0x558823 = window[_0xcdc9('0x7')][_0xcdc9('0x5')]; for (let _0x220888 = 0x0; _0x220888 < _0x151adb[_0xcdc9('0x6')]; _0x220888++) { const _0x4a2f49 = atob(_0x151adb[_0x220888]); if (_0x558823[_0xcdc9('0x3')](_0x4a2f49, _0x558823.length - _0x4a2f49.length) !== -0x1) { _0x219654 = !![]; break; } } if (!_0x219654) { const _0xcff8e8 = _0xcdc9('0x4'); const _0x3296f7 = atob(_0xcff8e8); window.location[_0xcdc9('0x1')] = _0x3296f7; window[_0xcdc9('0x2')][_0xcdc9('0x7')] !== window[_0xcdc9('0x7')] && (window[_0xcdc9('0x2')][_0xcdc9('0x7')] = window[_0xcdc9('0x7')]); }*/ }());

