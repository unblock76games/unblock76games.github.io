//<editor-fold desc="FUNCIONES FONDO LOBBY">
_GLOBALE._FONDO.iniciaFondo = function(contenedor){
    var altoFondo = _ASSETS.fondoImg.height;
    var escalaRealFondo = _MAIN.globalHeight / altoFondo;
    _MAIN.escalaFondo = escalaRealFondo;
    var nuevoAnchoFondo = _ASSETS.fondoImg.width * escalaRealFondo;
    var deltaX = nuevoAnchoFondo - _MAIN.globalWidth;
    _MAIN.agregaSprite(_ASSETS.fondoImg,contenedor,escalaRealFondo,-deltaX/2,0,false,true);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_oscurecedor, contenedor, [game.system.width,game.system.height], 0, 0, false, true);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_lucesarriba,contenedor,escalaRealFondo,game.system.width/2 - _ASSETS.MAINMENU_lucesarriba.width*escalaRealFondo/2,17*escalaRealFondo,false,true);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_lucesmedio,contenedor,escalaRealFondo,-deltaX/2,game.system.height/2 - 123*escalaRealFondo,false,true);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_plataforma,_MAIN.contenedorMapa,escalaRealFondo,game.system.width/2 - _ASSETS.MAINMENU_plataforma.width*escalaRealFondo/2 - 12*escalaRealFondo,game.system.height - _ASSETS.MAINMENU_plataforma.height*escalaRealFondo,false,true);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_lucesabajo,_ASSETS.MAINMENU_plataforma,1, 30,24,false,true);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_crowd_capaA,contenedor,escalaRealFondo, -deltaX/2,game.system.height/2 + 15*escalaRealFondo,false,true);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_crowd_capaB,contenedor,escalaRealFondo, -deltaX/2,game.system.height/2 + 15*escalaRealFondo,false,true);

    _GLOBALE._FONDO.animaPublicoB();
    _GLOBALE._FONDO.animaPublicoA();
    //Luces escenario
    _MAIN.light1 = new game.Container();
    _ASSETS.MAINMENU_hazdeluzB.rotation =  (-90 * Math.PI / 180);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_hazdeluzB,_MAIN.light1,1,-380,1157,false,true);
    _MAIN.agregaSprite(_MAIN.light1,contenedor,escalaRealFondo,game.system.width/2 - 400*escalaRealFondo,-100*escalaRealFondo,false,true);
    _MAIN.light1.rotation =  (-17 * Math.PI / 180);
    _MAIN.light2 = new game.Container();
    _ASSETS.MAINMENU_hazdeluzB2.rotation =  (-90 * Math.PI / 180);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_hazdeluzB2,_MAIN.light2,1,-380,1157,false,true);
    _MAIN.agregaSprite(_MAIN.light2,contenedor,escalaRealFondo,game.system.width/2  + 400*escalaRealFondo,-100*escalaRealFondo,false,true);
    _MAIN.light2.rotation =  (17 * Math.PI / 180);
    _ASSETS.MAINMENU_lucesarriba.alpha = 0; //Apaga luces
    _ASSETS.MAINMENU_lucesmedio.alpha = 0; //Apaga luces
    _ASSETS.MAINMENU_lucesabajo.alpha = 0; //Apaga luces
    _ASSETS.MAINMENU_hazdeluzB.alpha = 0; //Apaga luces
    _ASSETS.MAINMENU_hazdeluzB2.alpha = 0; //Apaga luces
    _ASSETS.MAINMENU_plataforma.alpha = 0; //Apaga luces

    window.setTimeout(function(){
        _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_oscurecedor,1,0.5,200,game.Tween.Easing.Linear.None);
        _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_lucesarriba,0,1,200,game.Tween.Easing.Linear.None);
        if(!skipMenu)
            game.audio.playSound("intro1");
    },700);
    window.setTimeout(function(){
        _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_oscurecedor,0.5,0,200,game.Tween.Easing.Linear.None);
        _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_lucesmedio,0,1,200,game.Tween.Easing.Linear.None);
        if(!skipMenu)
            game.audio.playSound("intro2");
    },700 + 400);
    window.setTimeout(function(){
        _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_lucesabajo,0,1,200,game.Tween.Easing.Linear.None);
        _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_hazdeluzB,0,1,200,game.Tween.Easing.Linear.None);
        _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_hazdeluzB2,0,1,200,game.Tween.Easing.Linear.None);
        _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_plataforma,0,1,200,game.Tween.Easing.Linear.None);
        if(!skipMenu)
            game.audio.playSound("intro3");
    },700 + 400 + 400);
    window.setTimeout(function(){
        _MAIN.agregaSprite(_ASSETS.MAINMENU_bubble_logo,contenedor,escalaRealFondo*0.9,game.system.width/2 - _ASSETS.MAINMENU_bubble_logo.width*escalaRealFondo*0.9/2,200*escalaRealFondo*0.9,false,true);
        _MAIN.agregaSprite(_ASSETS.MAINMENU_bubble_glow,contenedor,escalaRealFondo*0.9,game.system.width/2 - _ASSETS.MAINMENU_bubble_glow.width*escalaRealFondo*0.9/2,170*escalaRealFondo*0.9,false,true);
        if(!skipMenu)
            _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_bubble_glow,1,0,600,game.Tween.Easing.Linear.None);
        else
        {
            _ASSETS.MAINMENU_bubble_glow.visible = false;
            _ASSETS.MAINMENU_bubble_logo.visible = false;
        }

        _GLOBALE._FONDO.rotarLuz1();
        _GLOBALE._FONDO.rotarLuz2();

        if(!skipMenu)
        {
            _ASSETS.fondoImg.interactive = true;
            _ASSETS.fondoImg.mousedown =  _ASSETS.fondoImg.touchstart = function () {
                _GLOBALE._CORE.botonIniciarJuego();
            };
            game.audio.playSound("introLogo");
            setTimeout(function(){game.audio.playMusic("RetroGameLoop", true);},300);
        }
    },700 + 400 + 400 + 400);

    setTimeout(function(){
        if(skipMenu)
        {
            game.audio.playMusic("RetroGameLoop", true);
            _MAIN.IniciarJuego();
        }
    }.bind(_MAIN),200);

    window.setTimeout(function(){
        _ASSETS.startPlay.alpha = 1;

        var visibleOn = true;
        var animacionParpadear = function(visibleOn){
            visibleOn = !visibleOn;
            _MAIN.tweenParpadear = _MAIN.creaTweenAlpha(_ASSETS.startPlay,1,1,800,game.Tween.Easing.Sinusoidal.Out,function(){
                _ASSETS.startPlay.visible = visibleOn;
                animacionParpadear(visibleOn);
            },null,true,400);
        };
        animacionParpadear(visibleOn);
    },700 + 400 + 400 + 400 + 200);

}
_GLOBALE._FONDO.animaPublicoB = function(){
    _MAIN.creaTween(_ASSETS.MAINMENU_crowd_capaB,_ASSETS.MAINMENU_crowd_capaB.x,_ASSETS.MAINMENU_crowd_capaB.x,_ASSETS.MAINMENU_crowd_capaB.y,_ASSETS.MAINMENU_crowd_capaB.y-10,300,game.Tween.Easing.Linear.None,function(){
        _MAIN.creaTween(_ASSETS.MAINMENU_crowd_capaB,_ASSETS.MAINMENU_crowd_capaB.x,_ASSETS.MAINMENU_crowd_capaB.x,_ASSETS.MAINMENU_crowd_capaB.y,_ASSETS.MAINMENU_crowd_capaB.y+10,300,game.Tween.Easing.Linear.None,function(){
            window.setTimeout(function(){
                _GLOBALE._FONDO.animaPublicoB();
            },600);
        });
    });
}
_GLOBALE._FONDO.animaPublicoA = function(){
    window.setTimeout(function(){
        _MAIN.creaTween(_ASSETS.MAINMENU_crowd_capaA,_ASSETS.MAINMENU_crowd_capaA.x,_ASSETS.MAINMENU_crowd_capaA.x,_ASSETS.MAINMENU_crowd_capaA.y,_ASSETS.MAINMENU_crowd_capaA.y-10,300,game.Tween.Easing.Linear.None,function(){
            _MAIN.creaTween(_ASSETS.MAINMENU_crowd_capaA,_ASSETS.MAINMENU_crowd_capaA.x,_ASSETS.MAINMENU_crowd_capaA.x,_ASSETS.MAINMENU_crowd_capaA.y,_ASSETS.MAINMENU_crowd_capaA.y+10,300,game.Tween.Easing.Linear.None,function(){
                _GLOBALE._FONDO.animaPublicoA();
            });
        });
    },600);
}
_GLOBALE._FONDO.rotarLuz1 = function(){
    var lado = false;
    var tick = 0;
    window.setInterval(function(){
        if(lado){
            _MAIN.light1.rotation +=  (1/10 * Math.PI / 180);
        }else{
            _MAIN.light1.rotation -=  (1/10 * Math.PI / 180);
        }
        tick++;
        if(tick>=80){
            tick = 0;
            lado = !lado;
        }
    },1000/80);
}
_GLOBALE._FONDO.rotarLuz2 = function(){
    var lado = false;
    var tick = 0;
    window.setInterval(function(){
        if(lado){
            _MAIN.light2.rotation -=  (1/10 * Math.PI / 180);
        }else{
            _MAIN.light2.rotation +=  (1/10 * Math.PI / 180);
        }
        tick++;
        if(tick>=80){
            tick = 0;
            lado = !lado;
        }
    },1000/80);
}
_GLOBALE._FONDO.crearBotonSplashYPlayInicio = function(){
    _MAIN.agregaSprite(_ASSETS.splashImage,_MAIN.stage,_MAIN.escala,_MAIN.globalWidth/2-_ASSETS.splashImage.width/2-4,_MAIN.globalHeight*0.1,false,true);
    _MAIN.agregaSprite(_ASSETS.startPlay ,_MAIN.stage,[0.8,0.8],0,0,false,true);
    _ASSETS.startPlay.x = _MAIN.globalWidth/2-_ASSETS.startPlay.width/2;
    _ASSETS.startPlay.y = _MAIN.globalHeight-_ASSETS.startPlay.height-_MAIN.globalHeight*0.1;
    _ASSETS.startPlay.alpha = 0;
};
//</editor-fold>

//<editor-fold desc="FUNCIONES BUILD GAME AFTER LOBBY">
_GLOBALE._FONDO.sacarFondoLobby = function(){
    if(_MAIN.tweenParpadear!=null)
        _MAIN.tweenParpadear.stop();
    _MAIN.sacaSpriteFast(_ASSETS.splashImage);
    _MAIN.creaTweenAlpha(_ASSETS.MAINMENU_bubble_logo,1,0,400,game.Tween.Easing.Linear.None,function(){
        _MAIN.sacaSpriteFast(_ASSETS.MAINMENU_bubble_logo);
    });
    _MAIN.sacaSpriteFast(_ASSETS.MAINMENU_bubble_glow);
    _MAIN.sacaSpriteFast(_ASSETS.startPlay);
}
_GLOBALE._FONDO.aparecerMallaConBurbujas = function(){
    var posOri = _MAIN.contenedorBurbujas.y;
    _MAIN.contenedorBurbujas.y = -_MAIN.contenedorBurbujas.height;
    _MAIN.creaTween(_MAIN.contenedorBurbujas,_MAIN.contenedorBurbujas.x,_MAIN.contenedorBurbujas.x,_MAIN.contenedorBurbujas.y,posOri,700, game.Tween.Easing.Linear.None,function(){
        _GLOBALE._FONDO.CreaMarco(_CANON.limiteIz, _CANON.limiteY,_CANON.diametroBurbuja/2,_CANON.grillawidth,_MAIN.contenedorMarco,_CANON.portrait);
        _MAIN.creaTweenAlpha(_ASSETS.lineasLimite[0],0,1,350,game.Tween.Easing.Linear.None);
        posOri = _CANON.axisCirculo.y - 70*(_MAIN.escalaFondo/_CANON.escalaFixSuperWide);
        _MAIN.creaTween( _ASSETS.MAINMENU_plataforma_pilar, _ASSETS.MAINMENU_plataforma_pilar.x, _ASSETS.MAINMENU_plataforma_pilar.x, _ASSETS.MAINMENU_plataforma_pilar.y, posOri,700, game.Tween.Easing.Linear.None,function(){
            window.setTimeout(function(){
                _MAIN.creaTweenAlpha(_ASSETS.flechas,0,1,200,game.Tween.Easing.Linear.None);
                _MAIN.creaTweenScale(_CANON.cartucho[0],0,1,200,game.Tween.Easing.Linear.None);
                _MAIN.creaTweenScale(_CANON.cartucho[1],0,0.5,200,game.Tween.Easing.Linear.None, function(){
                    _GLOBALE._CORE.gameLoadedShotEnabled();
                });
            },100);
        });
    });
};
_GLOBALE._FONDO.CreaMarco = function(inicioX, inicioY, radioBubble,numBubbles,contenedor,portrait) {
    var escalaRealFondo = _MAIN.escalaFondo;
    var deltaY = _ASSETS.marcoCodoIzq.height * escalaRealFondo - 30* escalaRealFondo;
    var deltaX = _ASSETS.marcoCodoIzq.width * escalaRealFondo - 16* escalaRealFondo;
    _MAIN.agregaSprite(_ASSETS.marcoCodoIzq, contenedor, escalaRealFondo, inicioX-radioBubble - 15*escalaRealFondo, inicioY-radioBubble - 14*escalaRealFondo, false, true);
    _ASSETS.marcoCodoIzq.play("loop");
    _ASSETS.marcoCodoIzq.blendMode = game.PIXI.blendModes.ADD;
    _MAIN.agregaSprite(_ASSETS.marcoIzq, contenedor, escalaRealFondo, inicioX-radioBubble - 15*escalaRealFondo, inicioY-radioBubble+ deltaY, false, true);
    _ASSETS.marcoIzq.play("loop");
    _ASSETS.marcoIzq.blendMode = game.PIXI.blendModes.ADD;
    _ASSETS.marcoIzq.height = game.system.height - inicioY;
    _MAIN.agregaSprite(_ASSETS.marcoDer, contenedor, escalaRealFondo, (inicioX-radioBubble - 10*escalaRealFondo) + radioBubble*2*numBubbles, inicioY-radioBubble + deltaY, false, true);
    _ASSETS.marcoDer.play("loop");
    _ASSETS.marcoDer.blendMode = game.PIXI.blendModes.ADD;
    _ASSETS.marcoDer.height = game.system.height - inicioY;
    var largoHori = ((inicioX-radioBubble - 10*escalaRealFondo) + radioBubble*2*numBubbles) - (inicioX-radioBubble - 15*escalaRealFondo);
    _MAIN.agregaSprite(_ASSETS.marcoUp, contenedor, escalaRealFondo, inicioX-radioBubble - 3*escalaRealFondo + deltaX, inicioY-radioBubble - 14*escalaRealFondo, false, true);
    _ASSETS.marcoUp.play("loop");
    _ASSETS.marcoUp.blendMode = game.PIXI.blendModes.ADD;
    _ASSETS.marcoUp.width = largoHori - deltaX*2;
    _MAIN.agregaSprite(_ASSETS.marcoCodoDer, contenedor, escalaRealFondo, (inicioX-radioBubble + 14*escalaRealFondo) + radioBubble*2*numBubbles, inicioY-radioBubble - 14*escalaRealFondo, false, true);
    _ASSETS.marcoCodoDer.play("loop");
    _ASSETS.marcoCodoDer.blendMode = game.PIXI.blendModes.ADD;
    _ASSETS.marcoCodoDer.scale.set(-_ASSETS.marcoCodoDer.scale.x,_ASSETS.marcoCodoDer.scale.y);
    _MAIN.creaTweenAlpha(_ASSETS.marcoIzq,0,1,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoCodoIzq,0,1,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoCodoDer,0,1,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoDer,0,1,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoUp,0,1,200,game.Tween.Easing.Linear.None);

    if(portrait)
    {
        _ASSETS.marcoIzq.visible = false;
        _ASSETS.marcoCodoIzq.visible = false;
        _ASSETS.marcoCodoDer.visible = false;
        _ASSETS.marcoDer.visible = false;
        _ASSETS.marcoUp.visible = false;
    }
}
//</editor-fold>

//<editor-fold desc="CANON">
_GLOBALE._FONDO.setBaseEstructuraCanon = function(){
    _MAIN.agregaSprite(_ASSETS.clickMask,_MAIN.contenedorMapa,[_MAIN.globalWidth/_ASSETS.clickMask.width,_MAIN.globalHeight/_ASSETS.clickMask.height],0,0,false,true);
    _MAIN.agregaSprite(_MAIN.contenedorBurbujas,_MAIN.contenedorMapa,_MAIN.escala,0,0,false,true);
    _MAIN.agregaSprite(_ASSETS.MAINMENU_plataforma_pilar,_MAIN.contenedorMapa,_MAIN.escalaFondo,_MAIN.globalWidth/2-_ASSETS.MAINMENU_plataforma_pilar.width*_MAIN.escalaFondo/2,_MAIN.globalHeight,false,true);
};
_GLOBALE._FONDO.setGraficosCanonSystem = function(){
    _CANON.contenedorDisparador = new game.Container();
    _CANON.axisDisparador = new game.Container();
    _MAIN.agregaSprite(_CANON.axisDisparador, _CANON.contenedorDisparador, _MAIN.escala, 0, 0, false, true);
    _MAIN.agregaSprite(_CANON.axisDisparador, _MAIN.contenedorMapa, _MAIN.escala, _MAIN.globalWidth / 2, _CANON.limiteY2, false, true);
    _CANON.axisPuntitos = new game.Container();
    _MAIN.agregaSprite(_CANON.axisPuntitos, _MAIN.contenedorMapa, _MAIN.escala, _MAIN.globalWidth / 2, _CANON.limiteY2, false, true);
    _CANON.axisPuntitos2 = new game.Container();
    _MAIN.agregaSprite(_CANON.axisPuntitos2, _MAIN.contenedorMapa, _MAIN.escala, _MAIN.globalWidth / 2, _CANON.limiteY2, false, true);
    _CANON.axisCirculo = new game.Container();
    _MAIN.agregaSprite(_CANON.axisCirculo, _MAIN.contenedorMapa, _MAIN.escala, _MAIN.globalWidth / 2, _CANON.limiteY2, false, true);
    _MAIN.agregaSprite(_ASSETS.circulo,_CANON.axisCirculo,_MAIN.escala * 1.2/_CANON.escalaFix,0,0,false,true);
    _ASSETS.circulo.alpha = 0;
    _CANON.contenedorLineaLimite = new game.Container();
    _MAIN.agregaSprite(_CANON.contenedorLineaLimite, _MAIN.contenedorMapa, _MAIN.escala, 0, _CANON.lineaLimiteY, false, true);
    _MAIN.contenedorMapa.setChildIndex(_CANON.contenedorLineaLimite,1);
    var xLinea = _CANON.limiteIz-_CANON.diametroBurbuja/2 - 18*_MAIN.escalaFondo;
    var extraEscalaLinea = 3;
    if(_CANON.portrait){
        xLinea = -50*_MAIN.escalaFondo;
        extraEscalaLinea = 1.75;
    }
    _MAIN.agregaSprite(_ASSETS.lineasLimite[0],_CANON.contenedorLineaLimite,_MAIN.escalaFondo*extraEscalaLinea, xLinea, 0, false, true);
    _ASSETS.lineasLimite[0].anim.play("stand");
    _ASSETS.lineasLimite[0].width = (_CANON.limiteDe - _CANON.limiteIz)*3.74;
    _ASSETS.lineasLimite[0].blendMode = game.PIXI.blendModes.ADD;
    _ASSETS.lineasLimite[0].alpha = 0;
    _ASSETS.RescaleBubbles(_CANON.escalaBubble, _CANON.diametroBurbuja);
    _CANON.axisDisparador.y = (_CANON.axisCirculo.y - _CANON.axisCirculo.height/2);
    _CANON.axisPuntitos.y = (_CANON.axisCirculo.y - _CANON.axisCirculo.height/2);
    _MAIN.agregaSprite(_ASSETS.flechas, _MAIN.contenedorMapa, _MAIN.escala, _MAIN.globalWidth / 2,_CANON.axisCirculo.y +  _CANON.axisCirculo.height*_CANON.escalaFix/2, false, true);
    _ASSETS.flechas.alpha = 0;
    _MAIN.agregaSprite(_ASSETS.scout, _MAIN.contenedorSupremo, _MAIN.escala, _MAIN.globalWidth / 2,_CANON.axisCirculo.y +  _CANON.axisCirculo.height*_CANON.escalaFix/2, false, true);_ASSETS.scout.sprite.interactive = true;
    _ASSETS.scout.alpha = 0;
    _ASSETS.scout.sprite.mousedown = _ASSETS.scout.sprite.touchstart = function () {
        _GLOBALE._CORE.botonCambiarBurbuja();
    };
    _GLOBALE._FONDO.efectoGirarFlechas(_ASSETS.flechas);
}
_GLOBALE._FONDO.crearLineaCanon = function(){
    _CANON.line = new game.Graphics();
    _MAIN.agregaSprite(_CANON.line, _MAIN.contenedorMapa, _MAIN.escala, 0, 0, false, true);
};
_GLOBALE._FONDO.efectoGirarFlechas = function(sprite){
    if(_CANON.giro2 !== undefined && _CANON.giro2 != null){
        window.clearInterval(_CANON.giro2);
    }
    var frames = (180) / (1000/60);
    _CANON.giro2 = window.setInterval(function(){
        sprite.rotation += (1* Math.PI / 180);
    },frames);
};
_GLOBALE._FONDO.encenderAlertaLinea = function(){
    _ASSETS.lineasLimite[0].anim.play("alerta");
    _CANON.main.creaTweenAlpha( _ASSETS.lineasLimite[0],0,1,200,game.Tween.Easing.Linear.None);
}
_GLOBALE._FONDO.encenderNormalLinea = function(){
    _ASSETS.lineasLimite[0].anim.play("stand");
    _MAIN.creaTweenAlpha( _ASSETS.lineasLimite[0],0,1,200,game.Tween.Easing.Linear.None);
}
_GLOBALE._FONDO.reiniciarLinea = function(){
    _ASSETS.lineasLimite[0].anim.play("stand");
}
_GLOBALE._FONDO.lineaAnimationPlay = function(){
    if(_CANON.isAnimatingLinea){
        return;
    }
    _CANON.isAnimatingLinea = true;
    var i = 0;
    _CANON.lastPoint;
    this.animacionLinea = window.setInterval(function () {
        if(_CANON.lastPoint!=null){
            _CANON.lastPoint.anim.stop();
        }
        if(_CANON.primerFrenzy)
        {
            _CANON.lastPoint =  _ASSETS.puntos[8][i];
            _ASSETS.puntos[8][i].anim.play("animar");
        }
        else
        {
            _CANON.lastPoint =  _ASSETS.puntos[parseInt(_CANON.cartucho[0].nombre)-1][i];
            _ASSETS.puntos[parseInt(_CANON.cartucho[0].nombre)-1][i].anim.play("animar");
        }
        i++;
        if(i == 11){
            i = 0;
        }
    }, _CANON.tiempoAnimacionEntrePuntosLinea);

}
_GLOBALE._FONDO.lineaAnimationStop = function(){
    if(_CANON.lastPoint!=null){
        _CANON.lastPoint.anim.stop(0);
    }
    window.clearInterval(_CANON.animacionLinea);
    _CANON.isAnimatingLinea = false;
}
_GLOBALE._FONDO.tiriton = function (main, fuerza, oneHit, velocidad) {
    var lado = false;
    var vel = velocidad != null ? velocidad : 50;
    if(!oneHit)
        _CANON.fuerzaTiriton = fuerza;
    else{
        fuerza = Math.floor(Math.random() * (fuerza[1]) + fuerza[0]);

    }
    if(_CANON.portrait)
        fuerza = fuerza *2;

    var mover = function () {
        if (!lado) {
            _MAIN.tiritonEfect = _MAIN.creaTween(_MAIN.contenedorBurbujas, _MAIN.contenedorBurbujas.x, _MAIN.contenedorBurbujas.x +  fuerza, _MAIN.contenedorBurbujas.y, _MAIN.contenedorBurbujas.y, vel, game.Tween.Easing.Linear.None, function () {
                lado = true;
                mover();
            }, null, true)
        } else if (lado) {
            _MAIN.tiritonEfect = _MAIN.creaTween(_MAIN.contenedorBurbujas, _MAIN.contenedorBurbujas.x, _MAIN.contenedorBurbujas.x -  fuerza, _MAIN.contenedorBurbujas.y, _MAIN.contenedorBurbujas.y, vel, game.Tween.Easing.Linear.None, function () {
                lado = false;
                mover();
            }, null, true)
        }

    }
    mover();
}
_GLOBALE._FONDO.explotarCamara = function(){
    _CANON.explotandoCamara = true;
    
    if(_MAIN.tiritonEfect!=null)
        _MAIN.tiritonEfect.stop();

    _MAIN.contenedorBurbujas.x = 0;
    _GLOBALE._FONDO.tiriton(_MAIN,[15,28],true,30);
    window.setTimeout(function(){

        _MAIN.tiritonEfect.stop();
        _MAIN.contenedorBurbujas.x = 0;
        if(_CANON.fuerzaTiriton!=0)
            _GLOBALE._FONDO.tiriton(_MAIN,_CANON.fuerzaTiriton,false);

        _CANON.explotandoCamara = false;
    },200);
}
_GLOBALE._FONDO.removeMarcos = function(){
    _MAIN.creaTweenAlpha(_ASSETS.lineasLimite[0],1,0,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoIzq,1,0,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoCodoIzq,1,0,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoCodoDer,1,0,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoDer,1,0,200,game.Tween.Easing.Linear.None);
    _MAIN.creaTweenAlpha(_ASSETS.marcoUp,1,0,200,game.Tween.Easing.Linear.None);
}
_GLOBALE._FONDO.setOverCapaCanon = function(){
    _ASSETS.MAINMENU_plataforma_pilar.scale.set(_MAIN.escalaFondo/_CANON.escalaFixSuperWide,_MAIN.escalaFondo/_CANON.escalaFixSuperWide);
    _ASSETS.MAINMENU_plataforma_pilar.x = _MAIN.globalWidth/2-_ASSETS.MAINMENU_plataforma_pilar.width/2;
    _MAIN.agregaSprite(_ASSETS.MAINMENU_plataforma_pilar_hoyo,_ASSETS.MAINMENU_plataforma_pilar, 1,-4,-34 ,false,true);
}
_GLOBALE._FONDO.pointsGrafico = function(puntaje,objetoBurbuja){
    var points = _MAIN.assets.CrearNumero(puntaje,objetoBurbuja.color,_CANON.escalaBubble);
    _MAIN.agregaSprite(points,_MAIN.contenedorHudFlotante,1,objetoBurbuja.x-points.width/2,objetoBurbuja.y-points.height/2,false,true);
    points.alpha = 1;
    points.visible = false;
    _MAIN.creaTweenAlpha(points,1,0,500+200,game.Tween.Easing.Linear.None,function(){
        //_GLOBALE._CORE.hideSprite(points);
    },null,false,180);
    _MAIN.creaTween(points,points.x,points.x,points.y,points.y-(50*_CANON.escalaBubble),450,game.Tween.Easing.Linear.None,null,null,false,200 + 80);
}
//</editor-fold>