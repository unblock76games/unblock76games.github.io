//<editor-fold desc="FUNCIONES SUPER CRITICAS">
_GLOBALE._CORE.botonIniciarJuego = function(){
    _MAIN.IniciarJuego();
};
_GLOBALE._CORE.gameLoadedShotEnabled = function(){
    _CANON.isStating = false;
    _CANON.canShoot = true;
};
_GLOBALE._CORE.quickStart = function() {
    if(game != null)
    {
        if(!_MAIN.juegoEmpezado)
        {
            if(game.system.rutaGame.assets.MAINMENU_bubble_logo.parent  != null)
                _MAIN.IniciarJuego();
        }
        else
        {
            if(!partirPorSkipMenu)
                _MAIN.finalForzado();
        }
    }
}
_GLOBALE._CORE.botonCambiarBurbuja = function(){
    game.scene.AddMouseUp(_CANON.ChangeBubble.bind(_CANON), _ASSETS.scout.sprite);
};
_GLOBALE._CORE.startNewGame = function () {
//    console.log(1);
    _CANON.burbujaVivas = {
        "arreglo": []
    }
    _GLOBALE._CORE.iniLevels();
    _GLOBALE._CORE.selectNewLevel();
    _GLOBALE._CORE.iniciarBurbujas();

    _ASSETS.cañon.visible = true;
    _CANON.isSpining = false;
    _CANON.b_perdioJuegoPorLinea = false;
}
_GLOBALE._CORE.restartGame = function () {
    _CANON.b_quedan18Burbujas = false;
    _CANON.burbujaVivas = {
        "arreglo": []
    }
    _GLOBALE._CORE.selectNewLevel();
    _GLOBALE._CORE.iniciarBurbujas();
    _ASSETS.cañon.visible = true;
    _CANON.isSpining = false;
    _CANON.perdioNivel = false;
    _CANON.b_perdioJuegoPorLinea = false;
    _CANON.IntroducirBurbujas();
}
_GLOBALE._CORE.hideSprite = function (sprite) {
    if(sprite==null){
        console.log("SPRITE NULO");
        return;
    }
    //_GLOBALE._CORE.burbujasDesapareciendo.push(sprite);
    //console.log(_GLOBALE._CORE.burbujasDesapareciendo.length);


    if(sprite.codigoReinicio == sprite.reiniciadas){
        sprite.reiniciadas ++;
        _MAIN.sacaSpriteFast(sprite);
        sprite.x = -1000;
        window.setTimeout(function(){
            _MAIN.sacaSpriteFast(sprite);
            sprite.scale.set(1,1);
            sprite.esVisible = false;
            sprite.visible = false;
            sprite.escondiendose = false;
            sprite.ocupadaPorSistema = false;
            sprite.anim.play("hide");
        },5000);

        return;
    }
    else{
        console.log("informe HIDE",sprite.llamada);
        console.log("Se reporta un doble HideSprite");
        sprite.ocupadaPorSistema = false;
        return;
    }


    return;


    if(sprite!=null && sprite.b_IsBubble !== undefined && sprite.reiniciadas == 0){
        if(!sprite.escondiendose){


            //sprite.x = -1000;
            _MAIN.sacaSpriteFast(sprite);
            sprite.scale.set(1,1);
            sprite.reiniciadas = 0;
            sprite.esVisible = false;
            sprite.visible = false;
            sprite.escondiendose = true;

            if(sprite.anim !== undefined)
                sprite.anim.play("hide");
        }
    }
    else if (sprite != null && sprite.reiniciadas > 1){
        console.log(sprite.name,"intenta reiniciarse mas de una vez");
    }
    else if(sprite!=null && sprite.b_IsBubble === undefined){
        if(sprite!=null && !sprite.escondiendose){
            sprite.escondiendose = true;
            sprite.x = -1000;
            _MAIN.sacaSpriteFast(sprite);
            sprite.scale.set(1,1);


            window.clearTimeout((sprite.timeout));
            sprite.timeout = window.setTimeout(function(){
                sprite.esVisible = false;
                sprite.visible = false;
                sprite.escondiendose = false;
                sprite.ocupadaPorSistema = false;
                sprite.b_isFree = false;
            },5000);

            if(sprite.anim !== undefined)
                sprite.anim.play("hide");
        }
    }


}
//</editor-fold>

//<editor-fold desc="VARIABLES Y LISTENERS">
_GLOBALE._CORE.setGameCoreVariables = function(){
    _MAIN.portrait = null;
    _MAIN.escala = 1;
    //Variables necesarias
    _MAIN.globalWidth = game.system.width;
    _MAIN.globalHeight = game.system.height;
    _MAIN.permitirStorage = false;
    _MAIN.english = true;
    _MAIN.german = false;
    _MAIN.dutch = false;
    _MAIN.tiempoDefinido = 120;
    _MAIN.faciles = [0,1,2,3,4,5,6,7,8,9];
    _MAIN.medios = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29];
    _MAIN.dificiles = [30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49];
    _GLOBALE._CORE._TWEEN_BURBUJA = null;
    _GLOBALE._CORE._TWEEN_BURBUJA_GO = null;
};
_GLOBALE._CORE.setGameplayVariables = function(){
    _MAIN.score = 0;
    _MAIN.soundOff = 0;
    _MAIN.musicOff = 0;
    _MAIN.sfxOn = true;
    _MAIN.muteSound = false;
    _MAIN.enPausa = false;
    _MAIN.juegoIniciado = false;
    _MAIN.juegoEmpezado = false;
    _MAIN.MinimapOpend = false;
    _MAIN.howToPlayOpen = false;
    _MAIN.tweens = [];  //Tweens del HUD panel minijuego
}
_GLOBALE._CORE.setGamePlayInputListeners = function(){
    _MAIN.enDrag = false;
    _MAIN.enDragIniP = null;
    _MAIN.enDragFinP = null;
    _MAIN.enDragTolerancia = 20;
    _MAIN.enDragTiempo = 200;
    _MAIN.enDragHilo = null;
}
_GLOBALE._CORE.setConfiguracionGrillaYCanon = function(){
    console.log(_MAIN.globalWidth , _MAIN.globalHeight);
    _CANON.portrait = _MAIN.globalWidth < _MAIN.globalHeight ? true : false;
    _CANON.limiteIz = 0;
    _CANON.limiteDe = 0;
    _CANON.limiteY = 0;
    _CANON.grillawidth = 11;
    _CANON.grillaheight = 10;
    _CANON.radioBurbuja = 0;
    _CANON.poderUsarSpace = true;
    _CANON.speedBubble = _CANON.portrait ? 3.26 : 2;
    _CANON.bubbleWidth = 175;
    _CANON.distanciaAbajoCañon = 5;
    _CANON.burbujasEmptyStart = 7;
    _CANON.gravedad = _CANON.portrait ? 1.25 * 2 : 0.88 * 2;
    _CANON.necesariasBomba = 6;
    _CANON.boosterLaser = true;
    _CANON.scoreBubble = 33;
    _CANON.scoreBubbleEspecial = 66;
    _CANON.pointsGravity = 33;
    _CANON.delaySoltar = 10;
    _CANON.tiempoMoverFilas = 150;
    _CANON.limiteFilasJuego = 15;
    _CANON.tiempoJuego = _MAIN.tiempoDefinido;
    _CANON.canRotate = true;
    _CANON.tiempoAnimacionEntrePuntosLinea = 290;
    _CANON.fuerzaTiriton = 0;
    _CANON.encenderLineaLimiteAntesDeBurbujas = 2;
    _CANON._DEBUG_BURBUJAS_INVISIBLES = false;
}
_GLOBALE._CORE.setCanonDinamicas = function(){
    _GLOBALE._CORE.burbujasDesapareciendo = [];
    _CANON.isAnimatingLinea = false;
    _CANON.explotandoCamara = false;
    _CANON.circuloHeight = null;
    _CANON.isSpining = false;
    _CANON.reiniciandoBurbujas = false;
    _CANON.nivelActualIndex = 0;
    _CANON.cartucho = new Array();
    _CANON.cartucho[0] = null;
    _CANON.cartucho[1] = null;
    _CANON.restartedGame = false;
    _CANON.aspectoLandscape = _MAIN.globalWidth / _MAIN.globalHeight;
    _CANON.aspectoPortrait = _MAIN.globalHeight / _MAIN.globalWidth;
    if(!_CANON.portrait && _CANON.aspectoPortrait == 0.75){
        _CANON.aspectoPortrait = 0.6;
    }
    _CANON.ancho = _CANON.portrait ? _CANON.main.globalHeight * _CANON.aspectoLandscape : _CANON.main.globalHeight * _CANON.aspectoPortrait;
    _CANON.escalaFix = 1;
    _CANON.escalaFixSuperWide = 1;
    _CANON.b_perdioJuegoPorLinea = false;
};
//</editor-fold>

//<editor-fold desc="PRIMERA CARGA DEL JUEGO">
_GLOBALE._CORE.cargarJuego = function(){
    if(game.device.mobile)
    {
        if(window.innerWidth > window.innerHeight)
        {
            setTimeout(function () { _GLOBALE._CORE.cargarJuego() },200);
            return;
        }
        else
        {
            setTimeout(function () {
                if(window.innerWidth > window.innerHeight)
                {
                    setTimeout(function () { _GLOBALE._CORE.cargarJuego() },100);
                    return;
                }
                else
                {
                    setTimeout(function() {
                        if(game.device.mobile)
                        {
                            if(window.innerWidth > window.innerHeight)
                            {
                                setTimeout(function () { _GLOBALE._CORE.cargarJuego() },200);
                                return;
                            }
                            else
                            {
                                setTimeout(function () {
                                    if(window.innerWidth > window.innerHeight)
                                    {
                                        setTimeout(function () { _GLOBALE._CORE.cargarJuego() },100);
                                        return;
                                    }
                                    else
                                    {
                                        _GLOBALE._CORE.buildGame();
                                    }

                                },300);
                            }
                        }
                    },1000);
                }

            },300);
        }
    }
    else
        _GLOBALE._CORE.buildGame();
};
_GLOBALE._CORE.buildGame = function(){
    switch(selectedLang)
    {
        case 0:
            _MAIN.english = true;
            _MAIN.german = false;
            _MAIN.dutch = false;
            break;
        case 1:
            _MAIN.english = false;
            _MAIN.german = true;
            _MAIN.dutch = false;
            break;
        case 2:
            _MAIN.english = false;
            _MAIN.german = false;
            _MAIN.dutch = true;
            break;
    }
    //RUTAS
    referenciaMain = _MAIN;
    game.system.rutaGame = _MAIN;

    //CREAR CLASE ASSETS
    _MAIN.assets = new game.assets(_MAIN);

    //Iniciar Playerpref
    _MAIN.variablesStorage();

    //INICIAR USUARIO
    Usuario.Init();

    //Estructura momentanea Lobby
    _MAIN.contenedorBackground = new game.Container();
    _MAIN.agregaSprite(_MAIN.contenedorBackground,_MAIN.stage,1,0,0,false,true);
    _MAIN.contenedorMarco = new game.Container();
    _MAIN.agregaSprite(_MAIN.contenedorMarco,_MAIN.stage,1,0,0,false,true);

    //Crear estructura de capas
    _GLOBALE._CORE.iniciarEstructura();

    //Crear fondo del lobby
    _GLOBALE._FONDO.iniciaFondo(_MAIN.contenedorBackground);
    _GLOBALE._FONDO.crearBotonSplashYPlayInicio();
}
_GLOBALE._CORE.iniciarEstructura = function(){
    //Crear contenedores
    _MAIN.contenedorSupremo = new game.Container();
    _MAIN.contenedorMapa = new game.Container();
    _MAIN.contenedorCañon = new game.Container();
    _MAIN.contenedorBurbujas = new game.Container();
    _MAIN.contenedorHudFlotante = new game.Container();
    _MAIN.contenedorMensajesPopUps = new game.Container();

    //Inicia clases
    _MAIN.ShapeDraw = new game.ShapeDraw(_MAIN);
    _MAIN.Cañon = new game.Canon(_MAIN,_ASSETS);
    _MAIN.HUD = new game.HUD(_MAIN,_ASSETS);

    //Variables necesarias
    _MAIN.globalWidth = game.system.width;
    _MAIN.globalHeight = game.system.height;

    //Iniciar Paint de Paneles
    _MAIN.agregaSprite(_MAIN.contenedorSupremo,_MAIN.stage,_MAIN.escala,0,0,false,true);
    _MAIN.agregaSprite(_MAIN.ShapeDraw.DibujarPlano("Fondo Panel Principal",_MAIN.globalWidth,_MAIN.globalHeight,1,0x000,0xFFFFFF,0),_MAIN.contenedorSupremo,_MAIN.escala,0,0,false,true);
    _MAIN.agregaSprite(_MAIN.contenedorMapa,_MAIN.contenedorSupremo,_MAIN.escala,0,0,false,true);
}
//</editor-fold>

//<editor-fold desc="LEVELS SYSTEM">
_GLOBALE._CORE.iniLevels = function(){
    var numFaciles = 1;
    var numMedios = 2;
    var numDificiles = 2;
    var elegidos = [];

    if(_MAIN.faciles.length == 0)
    {
        _MAIN.faciles = [0,1,2,3,4,5,6,7,8,9];
        _MAIN.medios = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29];
        _MAIN.dificiles = [30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49];
    }

    for(var i = 0; i <numFaciles; i++)
    {
        var index = Math.floor(Math.random()*_MAIN.faciles.length);
        elegidos.push(_MAIN.faciles[index]);
        _MAIN.faciles.splice(index,1);
    }

    for(var i = 0; i <numMedios; i++)
    {
        var index = Math.floor(Math.random()*_MAIN.medios.length);
        elegidos.push(_MAIN.medios[index]);
        _MAIN.medios.splice(index,1);
    }
    for(var i = 0; i <numDificiles; i++)
    {
        var index = Math.floor(Math.random()*_MAIN.dificiles.length);
        elegidos.push(_MAIN.dificiles[index]);
        _MAIN.dificiles.splice(index,1);
    }

    var LVL = "";
    for(var i = 0; i < elegidos.length;i++)
    {
        if(i == elegidos.length - 1)
            LVL = LVL + elegidos[i];
        else
            LVL = LVL + elegidos[i] + "-";
    }

    SetLevels(LVL);
    //SetLevels("28-29");
}
_GLOBALE._CORE.generadorNiveles = function(){
    //GENERADOR DE NIVELES
    var cn = _CANON;
    var cadena = "";
    var Opts = [
        [1,5,6,3,8],
        [4,5,6,3,8],
        [1,5,6,3,7],
        [4,5,6,2,7]
    ];
    var Opts1 = [
        [5,6,8],
        [4,3,8],
        [1,5,7],
        [5,6,2]
    ];
    var Opts2 = [
        [5,6,3,8],
        [4,6,3,8],
        [1,5,3,7],
        [4,5,6,2]
    ];
    var indexOpts = 0;
    var generarMapas = function (options) {
        if(indexOpts == options.length){
            indexOpts = 0;
        }
        var rndOpts = options [indexOpts];
        cn.indexes = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        cn.indexes = cn.indexes.concat([null,0,0,0,0,0,0,0,0]);
        cn.burbujas = [cn.assets.burbuja0, cn.assets.burbuja1, cn.assets.burbuja2, cn.assets.burbuja3, cn.assets.burbuja4, cn.assets.burbuja5, cn.assets.burbuja6, cn.assets.burbuja7, cn.assets.burbuja8];
        cn.burbujas = cn.burbujas.concat([null , cn.assets.burbujaA,cn.assets.burbujaB,cn.assets.burbujaC,cn.assets.burbujaD,cn.assets.burbujaE,cn.assets.burbujaF,cn.assets.burbujaG,cn.assets.burbujaH]);

        cn.grillaheight = Math.floor(Math.random() * (11 - 8) + 8);
        //console.log(cn.grillaheight);
        cn.filas = [];
        var x = cn.limiteIz;
        var y = cn.limiteY;

        //var rndOpts = [1,2,3,4,5,6,7,8];
        //rndOpts.splice(Math.floor((Math.random() * 8) + 0),1);
        //rndOpts.splice(Math.floor((Math.random() * 7) + 0),1);
        //rndOpts.splice(Math.floor((Math.random() * 6) + 0),1);

        //console.log(rndOpts);

        var addSpecial = 0;
        for (var c = 0; c < cn.grillaheight; c++) {
            var limite = (c % 2 == 0) ? cn.grillawidth : cn.grillawidth - 1;
            x = (c % 2 == 0) ? cn.limiteIz : cn.limiteIz + cn.radioBurbuja;
            var fila = [];
            if((addSpecial == 1 || addSpecial == 2 && rndOpts.length == 4)
                || (addSpecial == 2 && rndOpts.length == 5)){
                var random = Math.floor(Math.random() * (limite) + 0);
            }

            for (var i = 0; i < limite; i++) {
                var bubble = cn.GetRandomBubble(false,rndOpts);
                if((addSpecial == 1 || addSpecial == 2 && rndOpts.length == 4)
                    ||(addSpecial == 2 && rndOpts.length == 5)){
                    if(i == random){
                        var opt = rndOpts[Math.floor(Math.random() * (rndOpts.length) + 0)];
                        switch (opt) {
                            case 1: opt = "A"; break;
                            case 2: opt = "B"; break;
                            case 3: opt = "C"; break;
                            case 4: opt = "D"; break;
                            case 5: opt = "E"; break;
                            case 6: opt = "F"; break;
                            case 7: opt = "G"; break;
                            case 8: opt = "H"; break;
                        }

                        var bubble = _GLOBALE._CORE.getBubble(opt);
                    }
                }
                cadena += bubble.nombre;
                bubble.fila = c;
                bubble.col = i;
                if (c == 0) {
                    bubble.raiz = true;
                } else {
                    bubble.raiz = false;
                }
                //cn.main.agregaSprite(bubble, cn.main.contenedorBurbujas, cn.escalaBubble, x, y, false, true);
                fila.push(bubble);

                //cn.burbujaVivas.arreglo.push([bubble.fila, bubble.col]);
                x += cn.diametroBurbuja;
            }
            cn.filas.push(fila);

            y += cn.diametroBurbuja - cn.yfix;
            addSpecial++;
            if(addSpecial == 3){
                addSpecial = 0;
            }
        }
        //Nueva cadena filas
        cadena+=")";
        for (var c = cn.grillaheight; c < cn.grillaheight+50; c++) {
            var limite = (c % 2 == 0) ? cn.grillawidth : cn.grillawidth - 1;
            x = (c % 2 == 0) ? cn.limiteIz : cn.limiteIz + cn.radioBurbuja;
            var fila = [];


            for (var i = 0; i < limite; i++) {
                var bubble = cn.GetRandomBubble(false,rndOpts);
                cadena += bubble.nombre;
                bubble.fila = c;
                bubble.col = i;
                if (c == 0) {
                    bubble.raiz = true;
                } else {
                    bubble.raiz = false;
                }
                //cn.main.agregaSprite(bubble, cn.main.contenedorBurbujas, cn.escalaBubble, x, y, false, true);
                fila.push(bubble);

                //cn.burbujaVivas.arreglo.push([bubble.fila, bubble.col]);
                x += cn.diametroBurbuja;
            }
            cn.filas.push(fila);

            y += cn.diametroBurbuja - cn.yfix;
            addSpecial++;
            if(addSpecial == 3){
                addSpecial = 0;
            }
        }
        cadena+=")";
        for(var i = 0; i < 250; i++){
            var bubble = cn.GetRandomBubble(false,rndOpts);
            cadena += bubble.nombre;
        }

        indexOpts++;
    };
    indexOpts = 0;
    for (var i = 0; i < 10; i++) {
        generarMapas(Opts1);
        cadena += "/";
    }
    indexOpts = 0;
    for (var i = 0; i < 20; i++) {
        generarMapas(Opts2);
        cadena += "/";
    }
    indexOpts = 0;
    for (var i = 0; i < 20; i++) {
        generarMapas(Opts);
        cadena += "/";
    }

    console.log(cadena);
    return;
}
_GLOBALE._CORE.selectNewLevel = function () {
    _CANON.nivelActual = levelsAvaible.split('-')[_CANON.nivelActualIndex];
    _CANON.nivelActualIndex++;
    if(_CANON.nivelActualIndex==levelsAvaible.split('-').length){
        _CANON.nivelActualIndex = 0;
    }
}
//</editor-fold>

//<editor-fold desc="MENSAJES SYSTEM">
_GLOBALE._CORE.poneMensaje = function(index,delay,voz,x,y) {
    if(index == 2)
        PokiSDK.happyTime(0.5);
    else if(index == 3)
        PokiSDK.happyTime(0.6);
    else if(index == 4)
        PokiSDK.happyTime(0.7);
    else if(index == 1)
        PokiSDK.happyTime(0.5);
    else if(index == 0)
        PokiSDK.happyTime(0.7);

    var x1;
    var x2;
    var y1;
    var y2;
    if(x == null)
    {
        x1 = game.system.width/2 - _ASSETS.mensajes[index][0].width*_MAIN.escalaFondo/2;
        x2 = game.system.width/2 - _ASSETS.mensajes[index][1].width*_MAIN.escalaFondo/2;
    }
    else
    {
        x1 = x - _ASSETS.mensajes[index][0].width*_MAIN.escalaFondo/2;
        x2 = x - _ASSETS.mensajes[index][1].width*_MAIN.escalaFondo/2;
    }
    if(y == null)
    {
        y1 = game.system.height/2 - _ASSETS.mensajes[index][0].height*_MAIN.escalaFondo/2 - 90*_MAIN.escalaFondo;
        y2 = game.system.height/2 - _ASSETS.mensajes[index][1].height*_MAIN.escalaFondo/2 - 90*_MAIN.escalaFondo;
    }
    else
    {
        y1 = y -_ASSETS.mensajes[index][0].height*_MAIN.escalaFondo/2;
        y2 = y -_ASSETS.mensajes[index][1].height*_MAIN.escalaFondo/2;
    }
    _MAIN.agregaSprite(_ASSETS.mensajes[index][0],_MAIN.stage,_MAIN.escalaFondo,x1,y1);
    _MAIN.agregaSprite(_ASSETS.mensajes[index][1],_MAIN.stage,_MAIN.escalaFondo,x2,y2);
    _MAIN.creaTweenAlpha(_ASSETS.mensajes[index][1],1,0,500,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.mensajes[index][0],1,0,500,game.Tween.Easing.Linear.None,function(){
        _MAIN.sacaSpriteFast(_ASSETS.mensajes[index][0]);
        _MAIN.sacaSpriteFast(_ASSETS.mensajes[index][1]);
    },null,null,delay);

    if(voz != null)
        game.audio.playSound(voz, false);//setTimeout(function(){game.audio.playSound(voz, false);},200);
}
//</editor-fold>

//<editor-fold desc="CANON SYSTEM">
_GLOBALE._CORE.setCanonListeners = function(){
    _ASSETS.clickMask.alpha = 0;
    _ASSETS.clickMask.interactive = true;

    _ASSETS.clickMask.mousedown = _ASSETS.clickMask.touchstart = function (event) {
        if(pause)
            return;
        if(_MAIN.howToPlayOpen){
           // _MAIN.howToPlayOpen = false;
            return;
        }
        _MAIN.canMove = true;
        _CANON.ClickMapa(event.swipeX, event.swipeY);
        game.scene.AddMouseUp(_CANON.ClickMapa.bind(_MAIN, event.swipeX, event.swipeY), _CANON.assets.clickMask);
    };
    _ASSETS.clickMask.mouseup = _ASSETS.clickMask.touchend = function (event) {
        if(_MAIN.howToPlayOpen){
            return;
        }
        if (_MAIN.canMove) {
            _GLOBALE._CORE.dispararCanon(event);
        }
    };
}
_GLOBALE._CORE.dispararCanon = function(event){
    _CANON.DispararCañon(event);
    _MAIN.canMove = false;
    _CANON.line.clear();
    _GLOBALE._FONDO.lineaAnimationStop();
}
_GLOBALE._CORE.rescalarElementosCanonSegunAspecto = function(){
    if(_CANON.portrait){
        var aspecto = altoGame / anchoGame;
        var aspectoActual = game.system.canvas.clientHeight/game.system.canvas.clientWidth;

        var x1 = aspecto;
        var y1 = 1;
        var x2 = (1024/768);
        var y2 = 0.78;
        var M = (y2-y1)/(x2-x1);
        _CANON.escalaFix = M*(aspectoActual - x1) + y1;
        if(_CANON.escalaFix > 1)
        {
            var x1 = 1;
            var y1 = 0;
            var x2 = 1.14;
            var y2 = 270;
            var M = (y2-y1)/(x2-x1);
            _CANON.extraYCanon = M*(_CANON.escalaFix - x1) + y1;
            _CANON.maxYshooteable =  _CANON.maxYshooteable * _CANON.escalaFix;
            _CANON.speedBubble  =  _CANON.speedBubble * _CANON.escalaFix;
            _CANON.escalaFixSuperWide = _CANON.escalaFix;
            _CANON.escalaFix = 1;
        }
        else if(_CANON.escalaFix < 1)
        {
            var x1 = 1;
            var y1 = 0;
            var x2 = 0.78;
            var y2 = 100;
            var M = (y2-y1)/(x2-x1);
            _CANON.extraYCanon = M*(_CANON.escalaFix - x1) + y1;
            _CANON.maxYshooteable =  _CANON.maxYshooteable * _CANON.escalaFix;
            _CANON.speedBubble  =  _CANON.speedBubble * _CANON.escalaFix;
            _CANON.escalaFixSuperWide = 1;
        }
    }
    else
    {
        var aux = anchoGame;
        anchoGame = altoGame;
        altoGame = aux;
    }
    _CANON.ancho = _CANON.ancho * _CANON.escalaFix;
    _CANON.radioBurbuja = (_CANON.ancho / _CANON.grillawidth / 2);
    _CANON.diametroBurbuja = _CANON.radioBurbuja * 2;
    _CANON.escalaBubble = (_CANON.diametroBurbuja / _CANON.bubbleWidth);
    _CANON.yfix = _CANON.portrait ? 16 : 8;
    _CANON.yfix = _CANON.yfix*_CANON.escalaFix;
    _CANON.fixTopY = _CANON.radioBurbuja + 120*_CANON.escalaFix;
    _CANON.grillaOnWindow = 10;
    _CANON.margenValue = 0.30;
    _CANON.margenRadio = _CANON.diametroBurbuja * _CANON.margenValue;
    _CANON.startPointsDistance =  _CANON.portrait ? 70 * _CANON.escalaFix : 50 * _CANON.escalaFix;
    _CANON.maxPointsDistance = ((_CANON.startPointsDistance * 7) * 2.6);
    _CANON.limiteY = (((_CANON.grillaheight - _CANON.grillaOnWindow) * (_CANON.diametroBurbuja - _CANON.yfix)) * -1) + _CANON.fixTopY;
    _CANON.limiteIz = _CANON.radioBurbuja + (_MAIN.globalWidth - _CANON.ancho) / 2;
    _CANON.limiteDe = _CANON.limiteIz + _CANON.ancho - _CANON.radioBurbuja * 2;
    _CANON.lineaLimiteY = ((_CANON.limiteFilasJuego) * (_CANON.diametroBurbuja - _CANON.yfix)) + _CANON.fixTopY - _CANON.radioBurbuja +(-5 * _MAIN.escalaFondo);
    _CANON.limiteY2 = ((_CANON.limiteFilasJuego + 3) * (_CANON.diametroBurbuja - _CANON.yfix)) + _CANON.fixTopY;
    _CANON.minPointsDistance =  _CANON.limiteY2 - _CANON.lineaLimiteY - _CANON.diametroBurbuja;
};
_GLOBALE._CORE.efectoCambiarBurbujas = function(bubble1, bubble2, callback){
    if(_CANON.perdioNivel){
        return;
    }
    _MAIN.creaTweenAlpha(_ASSETS.flechas,1,0,60,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenRotate(_CANON.axisCirculo,0,180,240,game.Tween.Easing.Linear.None,function(){
        callback();
        _MAIN.creaTweenAlpha(_ASSETS.flechas,0,1,80,game.Tween.Easing.Linear.None);
    });

    if(bubble1!==undefined && bubble1!=null)
        _CANON.efectoEscalaBubble1 = _MAIN.creaTweenScale(bubble1,1,0.5,240,game.Tween.Easing.Linear.None,null,null,true);
    if(bubble2!==undefined && bubble2!=null)
        _CANON.efectoEscalaBubble2 = _MAIN.creaTweenScale(bubble2,0.5,1,240,game.Tween.Easing.Linear.None,null,null,true);
}
_GLOBALE._CORE.moverBubble = function (bubble) {
    var tween = new game.Tween(bubble);
    _GLOBALE._CORE._TWEEN_BURBUJA = tween;
    _GLOBALE._CORE._TWEEN_BURBUJA_GO = bubble;

    if (bubble.points.length == 2) {
        var point1 = {"x": bubble.points[0][0], "y": bubble.points[0][1]};
        var point2 = {"x": _CANON.emptyBubble.x, "y": _CANON.emptyBubble.y};
    } else {
        var point1 = {"x": bubble.points[0][0], "y": bubble.points[0][1]};
        var point2 = {"x": bubble.points[1][0], "y": bubble.points[1][1]};
    }
    var distancia = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    tween.to({x: point2.x, y: point2.y}, distancia / _CANON.speedBubble);
    tween.easing(game.Tween.Easing.Linear.None);
    tween.delay(0);

    tween.onComplete(function () {
        bubble.points.shift();
        bubble.points.shift();

        if (bubble.points.length >= 2) {
            game.audio.playSound("bolareboteydestino1", false);
            _GLOBALE._CORE.moverBubble(bubble);
        } else {
            if(_MAIN.tiempo==0){
                _MAIN.HideSprite(bubble);
                return;
            }

            game.audio.playSound("bolareboteydestino2", false);

            var stay = _CANON.emptyBubble;

            _CANON.filas[stay.fila][stay.col].llamada = "Mover bubble, se esconde la burbuja insibible que ocuparan su lugar";
            //_GLOBALE._CORE.hideSprite(_CANON.filas[stay.fila][stay.col]);

            _MAIN.agregaSprite(bubble, _MAIN.contenedorBurbujas, _MAIN.escala, bubble.x, bubble.y, false, true);
            bubble.empty = false;
            bubble.fila = stay.fila;
            bubble.col = stay.col;
            bubble.sprite.interactive = false;
            _CANON.filas[stay.fila][stay.col] = bubble;

            if (bubble.fila == 0) {
                bubble.raiz = true;
            }
            _GLOBALE._CORE.replaceBubble(stay, [bubble.fila, bubble.col]);
            if (_CANON.CheckExplosion(_CANON.filas[stay.fila][stay.col], bubble, _CANON.impactoDirecto, point2)) {

            } else {

            }
        }
    });
    tween.start();
};
//</editor-fold>

//<editor-fold desc="BURBUJAS SYSTEM">
_GLOBALE._CORE.iniciarBurbujas = function () {
    _CANON.indexes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    _CANON.indexes = _CANON.indexes.concat([0,0,0,0,0,0,0,0]);

    _CANON.burbujas = [_ASSETS.burbuja0, _ASSETS.burbuja1, _ASSETS.burbuja2, _ASSETS.burbuja3, _ASSETS.burbuja4, _ASSETS.burbuja5, _ASSETS.burbuja6, _ASSETS.burbuja7, _ASSETS.burbuja8, _ASSETS.burbujaGris];
    _CANON.burbujas = _CANON.burbujas.concat([_ASSETS.burbujaA,_ASSETS.burbujaB,_ASSETS.burbujaC,_ASSETS.burbujaD,_ASSETS.burbujaE,_ASSETS.burbujaF,_ASSETS.burbujaG,_ASSETS.burbujaH]);

    _CANON.filas = [];
    var x = _CANON.limiteIz;
    var y = _CANON.limiteY;
    var indexType = 0;

//    console.log("CREANDO NIVEL ACTUAL "+_CANON.nivelActual,_CANON.nivelActual);
    var bubbleDec = _ASSETS.niveles[_CANON.nivelActual].split('');

    switch (_ASSETS.niveles[_CANON.nivelActual].length) {
        case 105:
            _CANON.grillaheight = 10;
            _CANON.burbujasEmptyStart = 5;
            break;
        case 95:
            _CANON.grillaheight = 9;
            _CANON.burbujasEmptyStart = 6;
            break;
        case 84:
            _CANON.grillaheight = 8;
            _CANON.burbujasEmptyStart = 7;
            break;
    }

    for (var c = 0; c < _CANON.grillaheight; c++) {
        var limite = (c % 2 == 0) ? _CANON.grillawidth : _CANON.grillawidth - 1;
        x = (c % 2 == 0) ? _CANON.limiteIz : _CANON.limiteIz + _CANON.radioBurbuja;
        var fila = [];
        for (var i = 0; i < limite; i++) {

            var bubble = _GLOBALE._CORE.getBubble(bubbleDec[indexType]);
            indexType++;

            bubble.fila = c;
            bubble.col = i;
            if (c == 0) {
                bubble.raiz = true;
            } else {
                bubble.raiz = false;
            }
            _MAIN.agregaSprite(bubble, _MAIN.contenedorBurbujas, _MAIN.escala, x, y, false, true);
            fila.push(bubble);

            _CANON.burbujaVivas.arreglo.push([bubble.fila, bubble.col]);
            x += _CANON.diametroBurbuja;
        }
        _CANON.filas.push(fila);

        y += _CANON.diametroBurbuja - _CANON.yfix;
    }

    //FILAS VACIAS
    for (var c = _CANON.grillaheight; c < _CANON.grillaheight + _CANON.burbujasEmptyStart; c++) {
        var limite = (c % 2 == 0) ? _CANON.grillawidth : _CANON.grillawidth - 1;
        x = (c % 2 == 0) ? _CANON.limiteIz : _CANON.limiteIz + _CANON.radioBurbuja;
        var fila = [];
        for (var i = 0; i < limite; i++) {
            var bubble = _GLOBALE._CORE.getEmptyBubble();
            bubble.fila = c;
            bubble.col = i;
            _MAIN.agregaSprite(bubble, _MAIN.contenedorBurbujas, _MAIN.escala, x, y, false, true);
            fila.push(bubble);
            x += _CANON.diametroBurbuja;
        }
        _CANON.filas.push(fila);
        y += _CANON.diametroBurbuja - _CANON.yfix;
    }

    //INICIAR TIPOS EXISTENTES
    _CANON.tiposExistentes = [];
    for (var i = 0; i < _CANON.burbujaVivas.arreglo.length; i++) {
        var vector = _CANON.burbujaVivas.arreglo[i];
        if (!_CANON.tiposExistentes.contains(_CANON.filas[vector[0]][vector[1]].nombre)) {
            _CANON.tiposExistentes.push(_CANON.filas[vector[0]][vector[1]].nombre);
        }
    }

    //Limpiar cartucho
    if(_CANON.cartucho!== undefined && _CANON.cartucho != null && _CANON.cartucho.length>0){
        for(var i = 0; i < _CANON.cartucho.length; i++){
            if(_CANON.cartucho[i]!==null){
                _CANON.cartucho[i].llamada = "Limpiar Cartucho, Se limpian los cartuchos";
                _CANON.cartucho[i].ocupadaPorSistema = true;
                _GLOBALE._CORE.hideSprite(_CANON.cartucho[i]);
            }
        }
    }


    _CANON.cartucho = [];
    var bubbleA = _CANON.GetCartuchoBubble();
    var bubbleB = _CANON.GetCartuchoBubble();
    bubbleA.poder = "";
    bubbleB.poder = "";
    _CANON.cartucho.push(bubbleA);
    _CANON.cartucho.push(bubbleB);

    var height = _CANON.axisCirculo.height/2;
    if(_CANON.circuloHeight == null){

        _CANON.circuloHeight = height;
    }


    _MAIN.agregaSprite(_CANON.cartucho[0],_CANON.axisCirculo,0,0,-(_CANON.circuloHeight)*_CANON.escalaFix,false,true);
    _MAIN.agregaSprite(_CANON.cartucho[1],_CANON.axisCirculo,0,0,(_CANON.circuloHeight)*_CANON.escalaFix,false,true);
    _CANON.cartucho[1].rotation = 90 + (90 * Math.PI / 180);
    _CANON.cartucho[0].rotation = 0;
    _CANON.cartucho[1].alpha = 1;
    _CANON.cartucho[0].alpha = 1;
    _CANON.axisCirculo.rotation = 0;


    _CANON.AddPreviewRow();
    _CANON.PrepararCañon();

}
_GLOBALE._CORE.replaceBubble = function (oldBubble, newBubble) {
    if (oldBubble.empty) {
        var exist = false;
        for (var i = 0; i < _CANON.burbujaVivas.arreglo.length; i++) {
            if (_CANON.burbujaVivas.arreglo[i][0] == oldBubble[0] && _CANON.burbujaVivas.arreglo[i][1] == oldBubble[1]) {
                exist = true;
                break;
            }
        }
        if (!exist) {
            _CANON.burbujaVivas.arreglo.push(newBubble);
        }
    }
    if (newBubble == null) {
        for (var i = 0; i < _CANON.burbujaVivas.arreglo.length; i++) {
            if (_CANON.burbujaVivas.arreglo[i][0] == oldBubble[0] && _CANON.burbujaVivas.arreglo[i][1] == oldBubble[1]) {
                _CANON.burbujaVivas.arreglo.splice(i, 1);
                break;
            }
        }
    }

    return;
}
_GLOBALE._CORE.getBubble = function(type){
    var rnd = parseInt(type);
    var especial = false;
    switch (type) {
        case "A": rnd = 10; especial = true; break;
        case "B": rnd = 11; especial = true; break;
        case "C": rnd = 12; especial = true; break;
        case "D": rnd = 13; especial = true; break;
        case "E": rnd = 14; especial = true; break;
        case "F": rnd = 15; especial = true; break;
        case "G": rnd = 16; especial = true; break;
        case "H": rnd = 17; especial = true; break;
    }

    var bubbleList = _CANON.burbujas[rnd];
    var bubble = bubbleList[_CANON.indexes[rnd]];

    //buscar solo burbujas q no se vean
    var conteo = 0;
    while(bubble.esVisible || _CANON.burbujaVivas.arreglo.contains(bubble) || _CANON.cartucho[0] == bubble || _CANON.cartucho[1] == bubble || bubble.escondiendose || bubble.ocupadaPorSistema){

        if(_GLOBALE._CORE.burbujasDesapareciendo.contains(bubble)){
            console.log("existe");
        }

        _CANON.indexes[rnd]++;
        if (_CANON.indexes[rnd] >= _CANON.burbujas[rnd].length) {
            _CANON.indexes[rnd] = 0;
        }

        var bubbleList = _CANON.burbujas[rnd];
        bubble = bubbleList[_CANON.indexes[rnd]];

        conteo++;
        if(conteo>= 800){
            console.log("no existen mas burbujas normales");
            break;
        }
    }

    bubble.llamada = "";
    bubble.codigoReinicio ++;

    bubble.visible = true;
    bubble.sprite.visible = true;

    bubble.b_IsBubble = true;
    bubble.actualLevel = _CANON.nivelActualIndex;
    bubble.b_isFree = false;
    bubble.empty = false;
    bubble.sprite.visible = true;
    bubble.alpha = 1;
    bubble.esVisible = true;
    bubble.rotation = 0;
    bubble.raiz = false;
    bubble.frenzy = false;
    bubble.escondiendose = false;

    if(especial){
        bubble.especial = true;
        bubble.sprite.visible = false;
        bubble.anim.visible = true;
        bubble.animBrillo.visible = true;
        bubble.animBrillo.play("brillar");
        window.setTimeout(function(){
            bubble.animBrillo.play("brillar");
        },Math.floor(150));
    }

    if(type!=9)
        bubble.anim.play("stand");

    if(_CANON.b_quedan18Burbujas){
        bubble.frenzy = true;
        bubble.anim.play("frenzy");
    }

    _CANON.indexes[rnd]++;
    if (_CANON.indexes[rnd] >= _CANON.burbujas[rnd].length) {
        _CANON.indexes[rnd] = 0;
    }

    if(bubble===null){
        alert("Esta saliendo bubble null");
    }
    return bubble;
}
_GLOBALE._CORE.getEmptyBubble = function () {
    var rnd = 0;
    var bubbleList = _CANON.burbujas[rnd];
    var bubble = bubbleList[_CANON.indexes[rnd]];

    var conteo = 0;
    while(bubble.esVisible || _CANON.burbujaVivas.arreglo.contains(bubble) || _CANON.cartucho[0] == bubble || _CANON.cartucho[1] == bubble  || bubble.escondiendose || bubble.ocupadaPorSistema){
        if(_GLOBALE._CORE.burbujasDesapareciendo.contains(bubble)){
            console.log("existe");
        }

        _CANON.indexes[rnd]++;
        if (_CANON.indexes[rnd] >= _CANON.burbujas[rnd].length) {
            _CANON.indexes[rnd] = 0;
        }

        var bubbleList = _CANON.burbujas[rnd];
        bubble = bubbleList[_CANON.indexes[rnd]];

        conteo++;
        if(conteo>= 800){
            console.log("no existen mas burbujas normales");
            break;
        }
    }


    bubble.visible = true;
    _MAIN.creaTweenScale(bubble,1,1,4000,game.Tween.Easing.Linear.None,function(){

    });


    bubble.llamada = "";
    bubble.codigoReinicio ++;
    bubble.visible = true;
    bubble.sprite.visible = true;

    bubble.b_IsBubble = true;
    bubble.actualLevel = _CANON.nivelActualIndex;
    bubble.b_isFree = false;
    bubble.empty = true;
    bubble.sprite.visible = _CANON._DEBUG_BURBUJAS_INVISIBLES;
    bubble.alpha = 1;
    bubble.raiz = false;
    bubble.rotation = 0;
    bubble.frenzy = false;

    if(bubble.anim!==undefined)
        bubble.anim.play("stand");

    _CANON.indexes[rnd]++;
    if (_CANON.indexes[rnd] >= _CANON.burbujas[rnd].length) {
        _CANON.indexes[rnd] = 0;
    }

    if(bubble===null){
        alert("Esta saliendo bubble null");
    }
    return bubble;
}
_GLOBALE._CORE.reiniciarBolas = function (endGame, b_restartGame) {
    var bubbleGrises = [];
    var delayed = 0;

    _CANON.CleanPreviewRow();
    _GLOBALE._FONDO.removeMarcos();

    if(_CANON.burbujaVivas.arreglo.length == 0){
        window.setTimeout(function () {
            _CANON.LimpiarMapa();
            if(!b_restartGame){
                _GLOBALE._CORE.restartGame();
            }else{
                _MAIN.HUD.AbrirFinalScore();
            }
        }, 500);
    }

    //Se crean mascaras para hacer efecto de cascada
    for (var c = _CANON.burbujaVivas.arreglo.length - 1; c >= 0; c--) {
        var bubble = _CANON.filas[_CANON.burbujaVivas.arreglo[c][0]][_CANON.burbujaVivas.arreglo[c][1]];
        if(bubble===undefined){
            console.log("undefined");
            continue;
        }
        if (bubble.especial !== undefined && bubble.especial){
            bubble.animBrillo.visible = false;
        }
        var bubbleMask = _GLOBALE._CORE.getBubble(bubble.nombre);
        if (bubbleMask.especial !== undefined && bubbleMask.especial){
            bubbleMask.animBrillo.visible = false;
        }
        //Marcar ocupando burbujas
        bubble.ocupadaPorSistema = true;
        bubbleMask.ocupadaPorSistema = true;

        _MAIN.agregaSprite(bubbleMask, _MAIN.contenedorBurbujas, _MAIN.escala, bubble.x, bubble.y, false, true);

        _GLOBALE._CORE.effectGravedad(bubbleMask, bubble, delayed, c, endGame, b_restartGame);

        delayed += 2;

        bubbleGrises.push(bubbleMask);
    }
}
_GLOBALE._CORE.effectGravedad = function (com, oldBubble, delayed, c, endGame,b_restartGame) {
    com.ocupadaPorSistema = true;

    com.anim.play("muere");
    _MAIN.creaTweenAlpha(com, 1, 1, 600, game.Tween.Easing.Linear.None, function () {
        var lado = (Math.random() > 0.5);
        _MAIN.creaTween(com, com.x, lado ? com.x + 5 : com.x - 5, com.y, com.y, 100, game.Tween.Easing.Sinusoidal.In, function () {
            com.falling = true;
            _MAIN.creaTween(com, com.x, lado ? com.x + 20 : com.x - 20, com.y, _MAIN.globalHeight + 100, (_MAIN.globalHeight + 100 - com.y) / _CANON.gravedad, game.Tween.Easing.Sinusoidal.In, function () {
                com.falling = false;

                com.llamada = "Efecto Gravedad, Se llama al final del efecto gravedad";
                _GLOBALE._CORE.hideSprite(com);
                if (c == 0 && !endGame) {
                    window.setTimeout(function () {
                        _CANON.LimpiarMapa();
                        if(!b_restartGame){
                            _GLOBALE._CORE.restartGame();
                        }else{
                            _MAIN.HUD.AbrirFinalScore();
                        }
                    }, 500);
                }
            }, null, false, 0, true);
        }, null, false, delayed, true);

    });

    oldBubble.llamada = "Efecto gravedad, Se llama al final del gravedad algun metodo de limpiar tablero";
    _GLOBALE._CORE.hideSprite(oldBubble);
}
_GLOBALE._CORE.achicarYDesaparecer = function(objetoBurbuja){
    objetoBurbuja.ocupadaPorSistema = true;
    _MAIN.creaTweenScale(objetoBurbuja, _MAIN.escala, _MAIN.escala, 600, game.Tween.Easing.Sinusoidal.In, function () {
        objetoBurbuja.llamada = "achicarYDesaparecer, Se llama al final del efecto achicar y desaparecer de algun metodo";
        _GLOBALE._CORE.hideSprite(objetoBurbuja);
    }, null);
}
_GLOBALE._CORE.ordenarBurbujasVivas = function () {
    _CANON.burbujaVivas.arreglo = _CANON.burbujaVivas.arreglo.sort(function (a, b) {
        return a[0] - b[0];
    });
    _CANON.burbujaVivas.arreglo = _CANON.burbujaVivas.arreglo.sort(function (a, b) {
        return a[0] == b[0] && a[1] - b[1];
    });
    if(isMobile.iOS() ||  (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0))
        _CANON.burbujaVivas.arreglo = _CANON.burbujaVivas.arreglo.reverse();
}
//</editor-fold>