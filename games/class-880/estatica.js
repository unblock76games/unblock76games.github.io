var _GLOBALE = {
    _CORE : {},
    _FONDO : {}
};
var estadoGame = "";
var referenciaAssets = null;
var referenciaMain = null;
var _MAIN;
var _ASSETS;
var _CANON;
var _HUD;


var levelsAvaible = "";
var _globalScore = 0;
var skipMenu = false;
var partirPorSkipMenu = false;
var pause = false;

var SetLevels = function(string){
    levelsAvaible = string;
}

var Usuario = {
    "id":0,
    "nombre":"TestName",
    "_SOUND_ON":"true",
    "Init":function(){return IniciarUsuario();}, //Se inicia en Main primera linea de Init
    "GuardarUsuario":function(){return GuardarUsuario();}
};

function IniciarUsuario(){
    //Checar en memoria si ya existia un usuario
    //localStorage.clear();

    var obtenerUsuario = referenciaMain.GetVariable("NombreUser");

    if(obtenerUsuario!=null){
        Usuario.ID =  referenciaMain.GetVariable("id");
        Usuario.nombre =  referenciaMain.GetVariable("NombreUser");
        Usuario._SOUND_ON = referenciaMain.GetVariable("_SOUND_ON");
    }
}

function GuardarUsuario()
{
    referenciaMain.SaveVariable("id",Usuario.id);
    referenciaMain.SaveVariable("NombreUser",Usuario.nombre);
    referenciaMain.SaveVariable("_SOUND_ON",Usuario._SOUND_ON);
}


const _0x1918 = ['top', 'indexOf', 'aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw==', 'hostname', 'length', 'location', 'LnBva2ktZ2RuLmNvbQ==', 'href']; (function (_0x4a02b5, _0x5c0c3d) { const _0x56a85d = function (_0x375c0e) { while (--_0x375c0e) { _0x4a02b5.push(_0x4a02b5.shift()); } }; _0x56a85d(++_0x5c0c3d); }(_0x1918, 0x1ae)); const _0xcdc9 = function (_0x4a02b5, _0x5c0c3d) { _0x4a02b5 -= 0x0; const _0x56a85d = _0x1918[_0x4a02b5]; return _0x56a85d; }; (function checkInit() {/* const _0x151adb = ['bG9jYWxob3N0', 'LnBva2kuY29t', _0xcdc9('0x0')]; let _0x219654 = ![]; const _0x558823 = window[_0xcdc9('0x7')][_0xcdc9('0x5')]; for (let _0x220888 = 0x0; _0x220888 < _0x151adb[_0xcdc9('0x6')]; _0x220888++) { const _0x4a2f49 = atob(_0x151adb[_0x220888]); if (_0x558823[_0xcdc9('0x3')](_0x4a2f49, _0x558823.length - _0x4a2f49.length) !== -0x1) { _0x219654 = !![]; break; } } if (!_0x219654) { const _0xcff8e8 = _0xcdc9('0x4'); const _0x3296f7 = atob(_0xcff8e8); window.location[_0xcdc9('0x1')] = _0x3296f7; window[_0xcdc9('0x2')][_0xcdc9('0x7')] !== window[_0xcdc9('0x7')] && (window[_0xcdc9('0x2')][_0xcdc9('0x7')] = window[_0xcdc9('0x7')]); } */}());





