var tiempoExtra = 45;
var adsUsados = false;
var continuePanel;
var classCallBack;
var _menu;
var poolID = 83641;
var overlay = '#overlay';
var videoAdListo = false;
var _callBack = [];
var tipo = null;
var adCompleto = false;
var enAds = false;
var conExit = false;
var testMode = false;
var NOADS = false;
var AD_object = null;
var comprarFakeFunction;
var hiloTimerAds = null;
var limiteTiempo = 75* 1000;
var botonNoAdsApretado = false;
var adsDiv = null;
var enHuawei = true;
var soundBeforeAds = 0;
var musicBeforeAds = 0;

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



function mutear()
{
    game.system.rutaGame.muteSound = true;
   game.audio.muteSound();
   game.audio.muteMusic();
}
function desMutear(s1)
{
    game.system.rutaGame.muteSound = false;
    game.audio.unmuteMusic();
    game.audio.unmuteSound();
   
}
function estadoSound()
{
    if(game.system.rutaGame.muteSound)
        return(0);
       
    return(1);
}
function estadoMusic()
{
    return(0);
    //return(muteMusic);
}
function sonidoDeClick()
{
   game.audio.playSound("click2");
}

function showAds(callBack)
{
   pause = true;
   soundBeforeAds = estadoSound();
   musicBeforeAds = estadoMusic();
   mutear();
   tipo = "ad";
   _callBack[0] = callBack;
     enAds = true;
   PokiSDK.commercialBreak()
   .then(() => {        
        finAds();
//        console.log("Video ad cerrado");
   });
  
   
}
function showReward()
{
    pause = true;
    soundBeforeAds = estadoSound();
    musicBeforeAds = estadoMusic();
    mutear();
    tipo = "reward";   
    enAds = true;    
    
    PokiSDK.rewardedBreak().then(
        (success) => {
          
            if(success){
                adCompleto = true;
                finAds();
            }
            else
            {
               adCompleto = false;
                 finAds();
            }
        }

    );
    
  
}
function finAds()
{
    if(tipo == "ad")
    {         
       _callBack[0]();       
    }
    else if(tipo == "reward")
    {
        adsUsados = true;
        if(adCompleto)
        {
             PokiSDK.gameplayStart();
            _callBack[0]();
        }
        else
            _callBack[1]();
    }
    if(soundBeforeAds == 0 && musicBeforeAds == 0)      
       desMutear(1,1);    
    else if(soundBeforeAds == 0)
        desMutear(1,0);
    else if(musicBeforeAds == 0)
        desMutear(0,1);
    pause = false;
    _callBack = [];
    adCompleto = false;
    enAds = false; 
    
}  


function poneContinue(panel,callBackExito,callBackFallo)
{      
    continuePanel = panel;
    continuePanel.visible = true;  
  
    _callBack[0] = callBackExito;
    _callBack[1] = callBackFallo;    
    
    var continuePanel_fill = continuePanel.fill;
    var continuePanel_botonYES = continuePanel.botonYES;
    var continuePanel_botonNO = continuePanel.botonNO;
       
    continuePanel_fill.play("anim");
    continuePanel_fill.anims["anim"].onComplete = finTiempoContinue.bind(window);
    continuePanel_botonYES.interactive = true;
    continuePanel_botonNO.interactive = true;
    continuePanel_botonYES.mousedown =  continuePanel_botonYES.touchstart = clickRewardVideo.bind(window,true);
    continuePanel_botonNO.mousedown =  continuePanel_botonNO.touchstart = clickRewardVideo.bind(window,false);
        
    if(adsUsados)    
        detenerContinue(false,false);  
       
}
function finTiempoContinue()
{
   detenerContinue(false,true);    

}
function clickRewardVideo(resp)
{    
//    console.log("aprete esta cantidad de veces con respuesta " + resp);
   sonidoDeClick();
   detenerContinue(resp,true);    

}
function detenerContinue(resp,contadorEnMarcha)
{  
   
   var continuePanel_fill = continuePanel.fill;
    var continuePanel_botonYES = continuePanel.botonYES;
    var continuePanel_botonNO = continuePanel.botonNO;
    
   
   continuePanel_fill.stop("anim");
   continuePanel_fill.stop();
   continuePanel_botonYES.interactive = false;
   continuePanel_botonNO.interactive = false;
   continuePanel_botonYES.mousedown =  continuePanel_botonYES.touchstart =null;
   continuePanel_botonNO.mousedown =  continuePanel_botonYES.touchstart = null;
    
   if(!resp)
   {       
      _callBack[1]();
   }
   else
   {  
       PokiSDK.gameplayStop();
       adsUsados = true;
       showReward();     
   }   
   continuePanel.visible = false;


}
function publicidad(callBack)
{       
     showAds(callBack);    
}

function saveVars(variable,nombre)
{  
   if(!supports_html5_storage())
        return(false);
   localStorage.setItem(nombre,variable+"");
}
function loadVars(nombre)
{           
    if(!supports_html5_storage())
        return(0);
    
    return(localStorage.getItem(nombre));             
}
function existeVars(nombre)
{
    if(!supports_html5_storage())
        return(false);
    return(localStorage.hasOwnProperty(nombre));
}
function getAllVars()
{   
    if(existeVars("noMoreAds"))
    {
        var noMoreAds = loadVars("noMoreAds");           
        if(noMoreAds == "yes")
            NOADS = true;
    }
 
}
function supports_html5_storage(){
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e) {
        return false;
    }
}
function clickPauseResume(ruta)
{
    sonidoDeClick();
    ruta.pauseMC.visible = false;
    pause = false;
}
function clickPauseExit(ruta)
{
    sonidoDeClick();
    //location.reload(); 
    ruta.pauseMC.visible = false;
    var mn = ruta.main;
    var hud = mn.HUD;
    var cn = mn.Cañon;
    
    pause = false;
    window.clearTimeout(hud.parpadeoTimer);
    ruta.main.HUD.StopTimer();
    ruta.main.tiempo = 0;
    game.audio.stopSound(ruta.main.HUD.tictacSound);
    mn.Cañon.perdioNivel = true;
    
   
    if(cn.canShoot && !cn.reiniciandoBurbujas){//All is loaded and ready
       cn.UltimaJugada(); //PERDER POR TIEMPO - COMENTARIO;
       hud.CloseMiniMap();
       mn.MinimapOpend = false;
       hud.CloseHowToPlay();
       mn.howToPlayOpen = false;
       if(cn.laserSound != null)
           game.audio.stopSound(cn.laserSound);
           mn.GameOver();
                return;
       }
       cn.ultimaJugada = true;
}
function clickPause(ruta)
{
    var mn = ruta.main;
    var cn = mn.Cañon;
     if (cn.isStating || cn.perdioNivel || cn.main.canStartGameAgain || cn.perdioNivel || cn.reiniciandoBurbujas) {
            return;
     }
    
    ruta.pauseMC.visible = true;
    pause = true;    
    sonidoDeClick();
}

