gdjs.ClickToBeginCode = {};
gdjs.ClickToBeginCode.GDTransitionObjects1= [];
gdjs.ClickToBeginCode.GDTransitionObjects2= [];
gdjs.ClickToBeginCode.GDTransitionObjects3= [];
gdjs.ClickToBeginCode.GDTransitionStartScreenObjects1= [];
gdjs.ClickToBeginCode.GDTransitionStartScreenObjects2= [];
gdjs.ClickToBeginCode.GDTransitionStartScreenObjects3= [];
gdjs.ClickToBeginCode.GDReset_95ButtonObjects1= [];
gdjs.ClickToBeginCode.GDReset_95ButtonObjects2= [];
gdjs.ClickToBeginCode.GDReset_95ButtonObjects3= [];
gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects1= [];
gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects2= [];
gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects3= [];


gdjs.ClickToBeginCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = !(gdjs.evtTools.systemInfo.isMobile());
if (isConditionTrue_0) {
{gdjs.evtTools.window.setGameResolutionResizeMode(runtimeScene, "");
}{gdjs.evtTools.window.setAdaptGameResolutionAtRuntime(runtimeScene, false);
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.systemInfo.isMobile();
if (isConditionTrue_0) {
/* Reuse gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects1 */
gdjs.copyArray(runtimeScene.getObjects("TransitionStartScreen"), gdjs.ClickToBeginCode.GDTransitionStartScreenObjects1);
{gdjs.evtTools.window.setGameResolutionResizeMode(runtimeScene, "adaptWidth");
}{gdjs.evtTools.window.setAdaptGameResolutionAtRuntime(runtimeScene, true);
}{for(var i = 0, len = gdjs.ClickToBeginCode.GDTransitionStartScreenObjects1.length ;i < len;++i) {
    gdjs.ClickToBeginCode.GDTransitionStartScreenObjects1[i].setWidth(gdjs.evtTools.window.getGameResolutionWidth(runtimeScene) + 100);
}
}{gdjs.evtTools.camera.setCameraX(runtimeScene, (( gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects1.length === 0 ) ? 0 :gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects1[0].getCenterXInScene()), "", 0);
}}

}


};gdjs.ClickToBeginCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("FireRateStat_Bitmap"), gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects1);
{for(var i = 0, len = gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects1.length ;i < len;++i) {
    gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects1[i].getBehavior("ShakeObject_PositionAngle").ShakeObject_PositionAngle(2, 0, 25, 0, 2, true, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
}{gdjs.evtsExt__PokiGamesSDKHtml__CallGameLoadingFinished.func(runtimeScene, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
{ //Subevents
gdjs.ClickToBeginCode.eventsList0(runtimeScene);} //End of subevents
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25597340);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "StartMenu", false);
}}

}


};

gdjs.ClickToBeginCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.ClickToBeginCode.GDTransitionObjects1.length = 0;
gdjs.ClickToBeginCode.GDTransitionObjects2.length = 0;
gdjs.ClickToBeginCode.GDTransitionObjects3.length = 0;
gdjs.ClickToBeginCode.GDTransitionStartScreenObjects1.length = 0;
gdjs.ClickToBeginCode.GDTransitionStartScreenObjects2.length = 0;
gdjs.ClickToBeginCode.GDTransitionStartScreenObjects3.length = 0;
gdjs.ClickToBeginCode.GDReset_95ButtonObjects1.length = 0;
gdjs.ClickToBeginCode.GDReset_95ButtonObjects2.length = 0;
gdjs.ClickToBeginCode.GDReset_95ButtonObjects3.length = 0;
gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects1.length = 0;
gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects2.length = 0;
gdjs.ClickToBeginCode.GDFireRateStat_95BitmapObjects3.length = 0;

gdjs.ClickToBeginCode.eventsList1(runtimeScene);

return;

}

gdjs['ClickToBeginCode'] = gdjs.ClickToBeginCode;
