gdjs.MenuCode = {};
gdjs.MenuCode.GDNewSpriteObjects1= [];
gdjs.MenuCode.GDNewSpriteObjects2= [];
gdjs.MenuCode.GDNewSpriteObjects3= [];
gdjs.MenuCode.GDNewSpriteObjects4= [];
gdjs.MenuCode.GDPROPSObjects1= [];
gdjs.MenuCode.GDPROPSObjects2= [];
gdjs.MenuCode.GDPROPSObjects3= [];
gdjs.MenuCode.GDPROPSObjects4= [];
gdjs.MenuCode.GDUI_95NAMEObjects1= [];
gdjs.MenuCode.GDUI_95NAMEObjects2= [];
gdjs.MenuCode.GDUI_95NAMEObjects3= [];
gdjs.MenuCode.GDUI_95NAMEObjects4= [];
gdjs.MenuCode.GDUI_95PlayObjects1= [];
gdjs.MenuCode.GDUI_95PlayObjects2= [];
gdjs.MenuCode.GDUI_95PlayObjects3= [];
gdjs.MenuCode.GDUI_95PlayObjects4= [];
gdjs.MenuCode.GDUI_95NewGameObjects1= [];
gdjs.MenuCode.GDUI_95NewGameObjects2= [];
gdjs.MenuCode.GDUI_95NewGameObjects3= [];
gdjs.MenuCode.GDUI_95NewGameObjects4= [];
gdjs.MenuCode.GDUI_95CreditsObjects1= [];
gdjs.MenuCode.GDUI_95CreditsObjects2= [];
gdjs.MenuCode.GDUI_95CreditsObjects3= [];
gdjs.MenuCode.GDUI_95CreditsObjects4= [];
gdjs.MenuCode.GDUI_95ContinueObjects1= [];
gdjs.MenuCode.GDUI_95ContinueObjects2= [];
gdjs.MenuCode.GDUI_95ContinueObjects3= [];
gdjs.MenuCode.GDUI_95ContinueObjects4= [];
gdjs.MenuCode.GDPlayer_95RObjects1= [];
gdjs.MenuCode.GDPlayer_95RObjects2= [];
gdjs.MenuCode.GDPlayer_95RObjects3= [];
gdjs.MenuCode.GDPlayer_95RObjects4= [];
gdjs.MenuCode.GDPlayer_95GObjects1= [];
gdjs.MenuCode.GDPlayer_95GObjects2= [];
gdjs.MenuCode.GDPlayer_95GObjects3= [];
gdjs.MenuCode.GDPlayer_95GObjects4= [];
gdjs.MenuCode.GDPlayer_95BObjects1= [];
gdjs.MenuCode.GDPlayer_95BObjects2= [];
gdjs.MenuCode.GDPlayer_95BObjects3= [];
gdjs.MenuCode.GDPlayer_95BObjects4= [];
gdjs.MenuCode.GDFIX_95PostProcessingAreaObjects1= [];
gdjs.MenuCode.GDFIX_95PostProcessingAreaObjects2= [];
gdjs.MenuCode.GDFIX_95PostProcessingAreaObjects3= [];
gdjs.MenuCode.GDFIX_95PostProcessingAreaObjects4= [];


gdjs.MenuCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = !(gdjs.evtTools.storage.elementExistsInJSONFile("Save data", "Level"));
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = (gdjs.evtTools.runtimeScene.getTimerElapsedTimeInSeconds(runtimeScene, "RoundTime") < 5);
}
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableBoolean(runtimeScene.getGame().getVariables().getFromIndex(6), true);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Spectrum", false);
}}

}


};gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595PlayObjects2Objects = Hashtable.newFrom({"UI_Play": gdjs.MenuCode.GDUI_95PlayObjects2});
gdjs.MenuCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.storage.elementExistsInJSONFile("Save data", "Level");
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("UI_Continue"), gdjs.MenuCode.GDUI_95ContinueObjects3);
{for(var i = 0, len = gdjs.MenuCode.GDUI_95ContinueObjects3.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95ContinueObjects3[i].hide(false);
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = !(gdjs.evtTools.storage.elementExistsInJSONFile("Save data", "Level"));
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Spectrum", false);
}}

}


};gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595NewGameObjects2Objects = Hashtable.newFrom({"UI_NewGame": gdjs.MenuCode.GDUI_95NewGameObjects2});
gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595ContinueObjects2Objects = Hashtable.newFrom({"UI_Continue": gdjs.MenuCode.GDUI_95ContinueObjects2});
gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595CreditsObjects1Objects = Hashtable.newFrom({"UI_Credits": gdjs.MenuCode.GDUI_95CreditsObjects1});
gdjs.MenuCode.eventsList2 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("UI_Play"), gdjs.MenuCode.GDUI_95PlayObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595PlayObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("UI_NewGame"), gdjs.MenuCode.GDUI_95NewGameObjects2);
/* Reuse gdjs.MenuCode.GDUI_95PlayObjects2 */
{for(var i = 0, len = gdjs.MenuCode.GDUI_95PlayObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95PlayObjects2[i].hide();
}
}{for(var i = 0, len = gdjs.MenuCode.GDUI_95NewGameObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95NewGameObjects2[i].hide(false);
}
}
{ //Subevents
gdjs.MenuCode.eventsList1(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_NewGame"), gdjs.MenuCode.GDUI_95NewGameObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595NewGameObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
{gdjs.evtTools.storage.deleteElementFromJSONFile("Save data", "Level");
}{gdjs.evtTools.storage.deleteElementFromJSONFile("Save data", "Score");
}{runtimeScene.getGame().getVariables().getFromIndex(1).setNumber(0);
}{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Spectrum", false);
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_Continue"), gdjs.MenuCode.GDUI_95ContinueObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595ContinueObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Spectrum", false);
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_Credits"), gdjs.MenuCode.GDUI_95CreditsObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595CreditsObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Credits", false);
}}

}


};gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595PlayObjects1ObjectsGDgdjs_46MenuCode_46GDUI_9595NewGameObjects1ObjectsGDgdjs_46MenuCode_46GDUI_9595ContinueObjects1ObjectsGDgdjs_46MenuCode_46GDUI_9595CreditsObjects1Objects = Hashtable.newFrom({"UI_Play": gdjs.MenuCode.GDUI_95PlayObjects1, "UI_NewGame": gdjs.MenuCode.GDUI_95NewGameObjects1, "UI_Continue": gdjs.MenuCode.GDUI_95ContinueObjects1, "UI_Credits": gdjs.MenuCode.GDUI_95CreditsObjects1});
gdjs.MenuCode.eventsList3 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("UI_Continue"), gdjs.MenuCode.GDUI_95ContinueObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Credits"), gdjs.MenuCode.GDUI_95CreditsObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_NewGame"), gdjs.MenuCode.GDUI_95NewGameObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Play"), gdjs.MenuCode.GDUI_95PlayObjects1);
{for(var i = 0, len = gdjs.MenuCode.GDUI_95NewGameObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95NewGameObjects1[i].hide();
}
}{for(var i = 0, len = gdjs.MenuCode.GDUI_95ContinueObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95ContinueObjects1[i].hide();
}
}{for(var i = 0, len = gdjs.MenuCode.GDUI_95PlayObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95PlayObjects1[i].setOpacity(0);
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95NewGameObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95NewGameObjects1[i].setOpacity(0);
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95ContinueObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95ContinueObjects1[i].setOpacity(0);
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95CreditsObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95CreditsObjects1[i].setOpacity(0);
}
}{gdjs.evtTools.sound.playMusicOnChannel(runtimeScene, "tv-static-01.mp3", 9, false, 5, 1);
}{gdjs.evtTools.input.hideCursor(runtimeScene);
}
{ //Subevents
gdjs.MenuCode.eventsList0(runtimeScene);} //End of subevents
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (gdjs.evtTools.input.getCursorX(runtimeScene, "", 0) > 1);
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Player_B"), gdjs.MenuCode.GDPlayer_95BObjects1);
gdjs.copyArray(runtimeScene.getObjects("Player_G"), gdjs.MenuCode.GDPlayer_95GObjects1);
gdjs.copyArray(runtimeScene.getObjects("Player_R"), gdjs.MenuCode.GDPlayer_95RObjects1);
{for(var i = 0, len = gdjs.MenuCode.GDPlayer_95RObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDPlayer_95RObjects1[i].setPosition(gdjs.evtTools.common.lerp((gdjs.MenuCode.GDPlayer_95RObjects1[i].getPointX("")), gdjs.evtTools.input.getCursorX(runtimeScene, "", 0), gdjs.randomFloatInRange(1, 1)),gdjs.evtTools.common.lerp((gdjs.MenuCode.GDPlayer_95RObjects1[i].getPointY("")), gdjs.evtTools.input.getCursorY(runtimeScene, "", 0), gdjs.randomFloatInRange(1, 1)));
}
}{for(var i = 0, len = gdjs.MenuCode.GDPlayer_95GObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDPlayer_95GObjects1[i].setPosition(gdjs.evtTools.common.lerp((gdjs.MenuCode.GDPlayer_95GObjects1[i].getPointX("")), 25 + gdjs.evtTools.input.getCursorX(runtimeScene, "", 0), gdjs.randomFloatInRange(0.04, 0.16)),gdjs.evtTools.common.lerp((gdjs.MenuCode.GDPlayer_95GObjects1[i].getPointY("")), 25 + gdjs.evtTools.input.getCursorY(runtimeScene, "", 0), gdjs.randomFloatInRange(0.04, 0.16)));
}
}{for(var i = 0, len = gdjs.MenuCode.GDPlayer_95BObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDPlayer_95BObjects1[i].setPosition(gdjs.evtTools.common.lerp((gdjs.MenuCode.GDPlayer_95BObjects1[i].getPointX("")), -(25) + gdjs.evtTools.input.getCursorX(runtimeScene, "", 0), gdjs.randomFloatInRange(0.05, 0.16)),gdjs.evtTools.common.lerp((gdjs.MenuCode.GDPlayer_95BObjects1[i].getPointY("")), -(25) + gdjs.evtTools.input.getCursorY(runtimeScene, "", 0), gdjs.randomFloatInRange(0.05, 0.16)));
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(11452668);
}
}
if (isConditionTrue_0) {

{ //Subevents
gdjs.MenuCode.eventsList2(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_Continue"), gdjs.MenuCode.GDUI_95ContinueObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Credits"), gdjs.MenuCode.GDUI_95CreditsObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_NewGame"), gdjs.MenuCode.GDUI_95NewGameObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Play"), gdjs.MenuCode.GDUI_95PlayObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MenuCode.mapOfGDgdjs_46MenuCode_46GDUI_9595PlayObjects1ObjectsGDgdjs_46MenuCode_46GDUI_9595NewGameObjects1ObjectsGDgdjs_46MenuCode_46GDUI_9595ContinueObjects1ObjectsGDgdjs_46MenuCode_46GDUI_9595CreditsObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDUI_95PlayObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDUI_95PlayObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDUI_95PlayObjects1[k] = gdjs.MenuCode.GDUI_95PlayObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDUI_95PlayObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDUI_95NewGameObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDUI_95NewGameObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDUI_95NewGameObjects1[k] = gdjs.MenuCode.GDUI_95NewGameObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDUI_95NewGameObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDUI_95ContinueObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDUI_95ContinueObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDUI_95ContinueObjects1[k] = gdjs.MenuCode.GDUI_95ContinueObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDUI_95ContinueObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDUI_95CreditsObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDUI_95CreditsObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDUI_95CreditsObjects1[k] = gdjs.MenuCode.GDUI_95CreditsObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDUI_95CreditsObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(11458924);
}
}
}
if (isConditionTrue_0) {
/* Reuse gdjs.MenuCode.GDUI_95ContinueObjects1 */
/* Reuse gdjs.MenuCode.GDUI_95CreditsObjects1 */
/* Reuse gdjs.MenuCode.GDUI_95NewGameObjects1 */
/* Reuse gdjs.MenuCode.GDUI_95PlayObjects1 */
{gdjs.evtTools.sound.playSound(runtimeScene, "Orbital", false, 70, 1);
}{for(var i = 0, len = gdjs.MenuCode.GDUI_95PlayObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95PlayObjects1[i].setOpacity(255);
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95NewGameObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95NewGameObjects1[i].setOpacity(255);
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95ContinueObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95ContinueObjects1[i].setOpacity(255);
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95CreditsObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95CreditsObjects1[i].setOpacity(255);
}
}}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("UI_Continue"), gdjs.MenuCode.GDUI_95ContinueObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Credits"), gdjs.MenuCode.GDUI_95CreditsObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_NewGame"), gdjs.MenuCode.GDUI_95NewGameObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Play"), gdjs.MenuCode.GDUI_95PlayObjects1);
{for(var i = 0, len = gdjs.MenuCode.GDUI_95PlayObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95PlayObjects1[i].setOpacity(gdjs.MenuCode.GDUI_95PlayObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95NewGameObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95NewGameObjects1[i].setOpacity(gdjs.MenuCode.GDUI_95NewGameObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95ContinueObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95ContinueObjects1[i].setOpacity(gdjs.MenuCode.GDUI_95ContinueObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
for(var i = 0, len = gdjs.MenuCode.GDUI_95CreditsObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDUI_95CreditsObjects1[i].setOpacity(gdjs.MenuCode.GDUI_95CreditsObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
}}

}


};

gdjs.MenuCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.MenuCode.GDNewSpriteObjects1.length = 0;
gdjs.MenuCode.GDNewSpriteObjects2.length = 0;
gdjs.MenuCode.GDNewSpriteObjects3.length = 0;
gdjs.MenuCode.GDNewSpriteObjects4.length = 0;
gdjs.MenuCode.GDPROPSObjects1.length = 0;
gdjs.MenuCode.GDPROPSObjects2.length = 0;
gdjs.MenuCode.GDPROPSObjects3.length = 0;
gdjs.MenuCode.GDPROPSObjects4.length = 0;
gdjs.MenuCode.GDUI_95NAMEObjects1.length = 0;
gdjs.MenuCode.GDUI_95NAMEObjects2.length = 0;
gdjs.MenuCode.GDUI_95NAMEObjects3.length = 0;
gdjs.MenuCode.GDUI_95NAMEObjects4.length = 0;
gdjs.MenuCode.GDUI_95PlayObjects1.length = 0;
gdjs.MenuCode.GDUI_95PlayObjects2.length = 0;
gdjs.MenuCode.GDUI_95PlayObjects3.length = 0;
gdjs.MenuCode.GDUI_95PlayObjects4.length = 0;
gdjs.MenuCode.GDUI_95NewGameObjects1.length = 0;
gdjs.MenuCode.GDUI_95NewGameObjects2.length = 0;
gdjs.MenuCode.GDUI_95NewGameObjects3.length = 0;
gdjs.MenuCode.GDUI_95NewGameObjects4.length = 0;
gdjs.MenuCode.GDUI_95CreditsObjects1.length = 0;
gdjs.MenuCode.GDUI_95CreditsObjects2.length = 0;
gdjs.MenuCode.GDUI_95CreditsObjects3.length = 0;
gdjs.MenuCode.GDUI_95CreditsObjects4.length = 0;
gdjs.MenuCode.GDUI_95ContinueObjects1.length = 0;
gdjs.MenuCode.GDUI_95ContinueObjects2.length = 0;
gdjs.MenuCode.GDUI_95ContinueObjects3.length = 0;
gdjs.MenuCode.GDUI_95ContinueObjects4.length = 0;
gdjs.MenuCode.GDPlayer_95RObjects1.length = 0;
gdjs.MenuCode.GDPlayer_95RObjects2.length = 0;
gdjs.MenuCode.GDPlayer_95RObjects3.length = 0;
gdjs.MenuCode.GDPlayer_95RObjects4.length = 0;
gdjs.MenuCode.GDPlayer_95GObjects1.length = 0;
gdjs.MenuCode.GDPlayer_95GObjects2.length = 0;
gdjs.MenuCode.GDPlayer_95GObjects3.length = 0;
gdjs.MenuCode.GDPlayer_95GObjects4.length = 0;
gdjs.MenuCode.GDPlayer_95BObjects1.length = 0;
gdjs.MenuCode.GDPlayer_95BObjects2.length = 0;
gdjs.MenuCode.GDPlayer_95BObjects3.length = 0;
gdjs.MenuCode.GDPlayer_95BObjects4.length = 0;
gdjs.MenuCode.GDFIX_95PostProcessingAreaObjects1.length = 0;
gdjs.MenuCode.GDFIX_95PostProcessingAreaObjects2.length = 0;
gdjs.MenuCode.GDFIX_95PostProcessingAreaObjects3.length = 0;
gdjs.MenuCode.GDFIX_95PostProcessingAreaObjects4.length = 0;

gdjs.MenuCode.eventsList3(runtimeScene);

return;

}

gdjs['MenuCode'] = gdjs.MenuCode;
