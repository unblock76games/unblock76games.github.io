gdjs.CreditsCode = {};
gdjs.CreditsCode.GDUI_95NAMEObjects1= [];
gdjs.CreditsCode.GDUI_95NAMEObjects2= [];
gdjs.CreditsCode.GDUI_95NAMEObjects3= [];
gdjs.CreditsCode.GDUI_95MusicObjects1= [];
gdjs.CreditsCode.GDUI_95MusicObjects2= [];
gdjs.CreditsCode.GDUI_95MusicObjects3= [];
gdjs.CreditsCode.GDUI_95SFXObjects1= [];
gdjs.CreditsCode.GDUI_95SFXObjects2= [];
gdjs.CreditsCode.GDUI_95SFXObjects3= [];
gdjs.CreditsCode.GDUI_95TimeTObjects1= [];
gdjs.CreditsCode.GDUI_95TimeTObjects2= [];
gdjs.CreditsCode.GDUI_95TimeTObjects3= [];
gdjs.CreditsCode.GDUI_95ThemeObjects1= [];
gdjs.CreditsCode.GDUI_95ThemeObjects2= [];
gdjs.CreditsCode.GDUI_95ThemeObjects3= [];
gdjs.CreditsCode.GDUI_95MsgObjects1= [];
gdjs.CreditsCode.GDUI_95MsgObjects2= [];
gdjs.CreditsCode.GDUI_95MsgObjects3= [];
gdjs.CreditsCode.GDUI_95MenuObjects1= [];
gdjs.CreditsCode.GDUI_95MenuObjects2= [];
gdjs.CreditsCode.GDUI_95MenuObjects3= [];
gdjs.CreditsCode.GDPlayer_95RObjects1= [];
gdjs.CreditsCode.GDPlayer_95RObjects2= [];
gdjs.CreditsCode.GDPlayer_95RObjects3= [];
gdjs.CreditsCode.GDPlayer_95GObjects1= [];
gdjs.CreditsCode.GDPlayer_95GObjects2= [];
gdjs.CreditsCode.GDPlayer_95GObjects3= [];
gdjs.CreditsCode.GDPlayer_95BObjects1= [];
gdjs.CreditsCode.GDPlayer_95BObjects2= [];
gdjs.CreditsCode.GDPlayer_95BObjects3= [];
gdjs.CreditsCode.GDFIX_95PostProcessingAreaObjects1= [];
gdjs.CreditsCode.GDFIX_95PostProcessingAreaObjects2= [];
gdjs.CreditsCode.GDFIX_95PostProcessingAreaObjects3= [];
gdjs.CreditsCode.GDAvatarObjects1= [];
gdjs.CreditsCode.GDAvatarObjects2= [];
gdjs.CreditsCode.GDAvatarObjects3= [];


gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MenuObjects1Objects = Hashtable.newFrom({"UI_Menu": gdjs.CreditsCode.GDUI_95MenuObjects1});
gdjs.CreditsCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
{
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Menu", false);
}}

}


};gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MusicObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595TimeTObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595SFXObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595MsgObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595ThemeObjects1Objects = Hashtable.newFrom({"UI_Music": gdjs.CreditsCode.GDUI_95MusicObjects1, "UI_TimeT": gdjs.CreditsCode.GDUI_95TimeTObjects1, "UI_SFX": gdjs.CreditsCode.GDUI_95SFXObjects1, "UI_Msg": gdjs.CreditsCode.GDUI_95MsgObjects1, "UI_Theme": gdjs.CreditsCode.GDUI_95ThemeObjects1});
gdjs.CreditsCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("rand")) == 1;
if (isConditionTrue_0) {
gdjs.copyArray(gdjs.CreditsCode.GDUI_95MsgObjects1, gdjs.CreditsCode.GDUI_95MsgObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95MusicObjects1, gdjs.CreditsCode.GDUI_95MusicObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95SFXObjects1, gdjs.CreditsCode.GDUI_95SFXObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95ThemeObjects1, gdjs.CreditsCode.GDUI_95ThemeObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95TimeTObjects1, gdjs.CreditsCode.GDUI_95TimeTObjects2);

{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects2[i].setColor("255;0;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects2[i].setColor("255;0;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects2[i].setColor("255;0;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects2[i].setColor("255;0;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects2[i].setColor("255;0;0");
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("rand")) == 2;
if (isConditionTrue_0) {
gdjs.copyArray(gdjs.CreditsCode.GDUI_95MsgObjects1, gdjs.CreditsCode.GDUI_95MsgObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95MusicObjects1, gdjs.CreditsCode.GDUI_95MusicObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95SFXObjects1, gdjs.CreditsCode.GDUI_95SFXObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95ThemeObjects1, gdjs.CreditsCode.GDUI_95ThemeObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95TimeTObjects1, gdjs.CreditsCode.GDUI_95TimeTObjects2);

{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects2[i].setColor("0;255;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects2[i].setColor("0;255;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects2[i].setColor("0;255;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects2[i].setColor("0;255;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects2[i].setColor("0;255;0");
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("rand")) == 3;
if (isConditionTrue_0) {
gdjs.copyArray(gdjs.CreditsCode.GDUI_95MsgObjects1, gdjs.CreditsCode.GDUI_95MsgObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95MusicObjects1, gdjs.CreditsCode.GDUI_95MusicObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95SFXObjects1, gdjs.CreditsCode.GDUI_95SFXObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95ThemeObjects1, gdjs.CreditsCode.GDUI_95ThemeObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95TimeTObjects1, gdjs.CreditsCode.GDUI_95TimeTObjects2);

{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects2[i].setColor("0;0;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects2[i].setColor("0;0;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects2[i].setColor("0;0;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects2[i].setColor("0;0;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects2[i].setColor("0;0;255");
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("rand")) == 4;
if (isConditionTrue_0) {
gdjs.copyArray(gdjs.CreditsCode.GDUI_95MsgObjects1, gdjs.CreditsCode.GDUI_95MsgObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95MusicObjects1, gdjs.CreditsCode.GDUI_95MusicObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95SFXObjects1, gdjs.CreditsCode.GDUI_95SFXObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95ThemeObjects1, gdjs.CreditsCode.GDUI_95ThemeObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95TimeTObjects1, gdjs.CreditsCode.GDUI_95TimeTObjects2);

{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects2[i].setColor("255;255;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects2[i].setColor("255;255;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects2[i].setColor("255;255;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects2[i].setColor("255;255;0");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects2[i].setColor("255;255;0");
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("rand")) == 5;
if (isConditionTrue_0) {
gdjs.copyArray(gdjs.CreditsCode.GDUI_95MsgObjects1, gdjs.CreditsCode.GDUI_95MsgObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95MusicObjects1, gdjs.CreditsCode.GDUI_95MusicObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95SFXObjects1, gdjs.CreditsCode.GDUI_95SFXObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95ThemeObjects1, gdjs.CreditsCode.GDUI_95ThemeObjects2);

gdjs.copyArray(gdjs.CreditsCode.GDUI_95TimeTObjects1, gdjs.CreditsCode.GDUI_95TimeTObjects2);

{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects2[i].setColor("255;0;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects2[i].setColor("255;0;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects2[i].setColor("255;0;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects2[i].setColor("255;0;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects2.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects2[i].setColor("255;0;255");
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().get("rand")) == 6;
if (isConditionTrue_0) {
/* Reuse gdjs.CreditsCode.GDUI_95MsgObjects1 */
/* Reuse gdjs.CreditsCode.GDUI_95MusicObjects1 */
/* Reuse gdjs.CreditsCode.GDUI_95SFXObjects1 */
/* Reuse gdjs.CreditsCode.GDUI_95ThemeObjects1 */
/* Reuse gdjs.CreditsCode.GDUI_95TimeTObjects1 */
{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects1[i].setColor("0;255;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects1[i].setColor("0;255;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects1[i].setColor("0;255;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects1[i].setColor("0;255;255");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects1[i].setColor("0;255;255");
}
}}

}


};gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MusicObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595TimeTObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595SFXObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595MsgObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595ThemeObjects1Objects = Hashtable.newFrom({"UI_Music": gdjs.CreditsCode.GDUI_95MusicObjects1, "UI_TimeT": gdjs.CreditsCode.GDUI_95TimeTObjects1, "UI_SFX": gdjs.CreditsCode.GDUI_95SFXObjects1, "UI_Msg": gdjs.CreditsCode.GDUI_95MsgObjects1, "UI_Theme": gdjs.CreditsCode.GDUI_95ThemeObjects1});
gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MenuObjects1Objects = Hashtable.newFrom({"UI_Menu": gdjs.CreditsCode.GDUI_95MenuObjects1});
gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MusicObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595TimeTObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595SFXObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595MsgObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595ThemeObjects1Objects = Hashtable.newFrom({"UI_Music": gdjs.CreditsCode.GDUI_95MusicObjects1, "UI_TimeT": gdjs.CreditsCode.GDUI_95TimeTObjects1, "UI_SFX": gdjs.CreditsCode.GDUI_95SFXObjects1, "UI_Msg": gdjs.CreditsCode.GDUI_95MsgObjects1, "UI_Theme": gdjs.CreditsCode.GDUI_95ThemeObjects1});
gdjs.CreditsCode.eventsList2 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("UI_Msg"), gdjs.CreditsCode.GDUI_95MsgObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Music"), gdjs.CreditsCode.GDUI_95MusicObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_SFX"), gdjs.CreditsCode.GDUI_95SFXObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Theme"), gdjs.CreditsCode.GDUI_95ThemeObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_TimeT"), gdjs.CreditsCode.GDUI_95TimeTObjects1);
{gdjs.evtTools.sound.playSound(runtimeScene, "tv-static-01.mp3", true, 15, 1);
}{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects1[i].setOpacity(0);
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects1[i].setOpacity(0);
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects1[i].setOpacity(0);
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects1[i].setOpacity(0);
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects1[i].setOpacity(0);
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (gdjs.evtTools.input.getCursorX(runtimeScene, "", 0) > 1);
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Player_B"), gdjs.CreditsCode.GDPlayer_95BObjects1);
gdjs.copyArray(runtimeScene.getObjects("Player_G"), gdjs.CreditsCode.GDPlayer_95GObjects1);
gdjs.copyArray(runtimeScene.getObjects("Player_R"), gdjs.CreditsCode.GDPlayer_95RObjects1);
{for(var i = 0, len = gdjs.CreditsCode.GDPlayer_95RObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDPlayer_95RObjects1[i].setPosition(gdjs.evtTools.common.lerp((gdjs.CreditsCode.GDPlayer_95RObjects1[i].getPointX("")), gdjs.evtTools.input.getCursorX(runtimeScene, "", 0), gdjs.randomFloatInRange(0.97, 1)),gdjs.evtTools.common.lerp((gdjs.CreditsCode.GDPlayer_95RObjects1[i].getPointY("")), gdjs.evtTools.input.getCursorY(runtimeScene, "", 0), gdjs.randomFloatInRange(0.97, 1)));
}
}{for(var i = 0, len = gdjs.CreditsCode.GDPlayer_95GObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDPlayer_95GObjects1[i].setPosition(gdjs.evtTools.common.lerp((gdjs.CreditsCode.GDPlayer_95GObjects1[i].getPointX("")), 25 + gdjs.evtTools.input.getCursorX(runtimeScene, "", 0), gdjs.randomFloatInRange(0.04, 0.06)),gdjs.evtTools.common.lerp((gdjs.CreditsCode.GDPlayer_95GObjects1[i].getPointY("")), 25 + gdjs.evtTools.input.getCursorY(runtimeScene, "", 0), gdjs.randomFloatInRange(0.04, 0.06)));
}
}{for(var i = 0, len = gdjs.CreditsCode.GDPlayer_95BObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDPlayer_95BObjects1[i].setPosition(gdjs.evtTools.common.lerp((gdjs.CreditsCode.GDPlayer_95BObjects1[i].getPointX("")), -(25) + gdjs.evtTools.input.getCursorX(runtimeScene, "", 0), gdjs.randomFloatInRange(0.05, 0.06)),gdjs.evtTools.common.lerp((gdjs.CreditsCode.GDPlayer_95BObjects1[i].getPointY("")), -(25) + gdjs.evtTools.input.getCursorY(runtimeScene, "", 0), gdjs.randomFloatInRange(0.05, 0.06)));
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_Menu"), gdjs.CreditsCode.GDUI_95MenuObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MenuObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(11644884);
}
}
}
if (isConditionTrue_0) {

{ //Subevents
gdjs.CreditsCode.eventsList0(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_Msg"), gdjs.CreditsCode.GDUI_95MsgObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Music"), gdjs.CreditsCode.GDUI_95MusicObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_SFX"), gdjs.CreditsCode.GDUI_95SFXObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Theme"), gdjs.CreditsCode.GDUI_95ThemeObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_TimeT"), gdjs.CreditsCode.GDUI_95TimeTObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MusicObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595TimeTObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595SFXObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595MsgObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595ThemeObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.CreditsCode.GDUI_95MusicObjects1.length;i<l;++i) {
    if ( gdjs.CreditsCode.GDUI_95MusicObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.CreditsCode.GDUI_95MusicObjects1[k] = gdjs.CreditsCode.GDUI_95MusicObjects1[i];
        ++k;
    }
}
gdjs.CreditsCode.GDUI_95MusicObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.CreditsCode.GDUI_95TimeTObjects1.length;i<l;++i) {
    if ( gdjs.CreditsCode.GDUI_95TimeTObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.CreditsCode.GDUI_95TimeTObjects1[k] = gdjs.CreditsCode.GDUI_95TimeTObjects1[i];
        ++k;
    }
}
gdjs.CreditsCode.GDUI_95TimeTObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.CreditsCode.GDUI_95SFXObjects1.length;i<l;++i) {
    if ( gdjs.CreditsCode.GDUI_95SFXObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.CreditsCode.GDUI_95SFXObjects1[k] = gdjs.CreditsCode.GDUI_95SFXObjects1[i];
        ++k;
    }
}
gdjs.CreditsCode.GDUI_95SFXObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.CreditsCode.GDUI_95MsgObjects1.length;i<l;++i) {
    if ( gdjs.CreditsCode.GDUI_95MsgObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.CreditsCode.GDUI_95MsgObjects1[k] = gdjs.CreditsCode.GDUI_95MsgObjects1[i];
        ++k;
    }
}
gdjs.CreditsCode.GDUI_95MsgObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.CreditsCode.GDUI_95ThemeObjects1.length;i<l;++i) {
    if ( gdjs.CreditsCode.GDUI_95ThemeObjects1[i].isVisible() ) {
        isConditionTrue_0 = true;
        gdjs.CreditsCode.GDUI_95ThemeObjects1[k] = gdjs.CreditsCode.GDUI_95ThemeObjects1[i];
        ++k;
    }
}
gdjs.CreditsCode.GDUI_95ThemeObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(11646556);
}
}
}
if (isConditionTrue_0) {
{runtimeScene.getScene().getVariables().get("rand").setNumber(gdjs.randomInRange(1, 6));
}
{ //Subevents
gdjs.CreditsCode.eventsList1(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_Msg"), gdjs.CreditsCode.GDUI_95MsgObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Music"), gdjs.CreditsCode.GDUI_95MusicObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_SFX"), gdjs.CreditsCode.GDUI_95SFXObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Theme"), gdjs.CreditsCode.GDUI_95ThemeObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_TimeT"), gdjs.CreditsCode.GDUI_95TimeTObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MusicObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595TimeTObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595SFXObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595MsgObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595ThemeObjects1Objects, runtimeScene, true, true);
if (isConditionTrue_0) {
/* Reuse gdjs.CreditsCode.GDUI_95MsgObjects1 */
/* Reuse gdjs.CreditsCode.GDUI_95MusicObjects1 */
/* Reuse gdjs.CreditsCode.GDUI_95SFXObjects1 */
/* Reuse gdjs.CreditsCode.GDUI_95ThemeObjects1 */
/* Reuse gdjs.CreditsCode.GDUI_95TimeTObjects1 */
{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects1[i].setColor("200;200;200");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects1[i].setColor("200;200;200");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects1[i].setColor("200;200;200");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects1[i].setColor("200;200;200");
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects1[i].setColor("200;200;200");
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_Menu"), gdjs.CreditsCode.GDUI_95MenuObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MenuObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(11651700);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSound(runtimeScene, "Orbital", false, 70, 1);
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("UI_Msg"), gdjs.CreditsCode.GDUI_95MsgObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Music"), gdjs.CreditsCode.GDUI_95MusicObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_SFX"), gdjs.CreditsCode.GDUI_95SFXObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Theme"), gdjs.CreditsCode.GDUI_95ThemeObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_TimeT"), gdjs.CreditsCode.GDUI_95TimeTObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.CreditsCode.mapOfGDgdjs_46CreditsCode_46GDUI_9595MusicObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595TimeTObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595SFXObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595MsgObjects1ObjectsGDgdjs_46CreditsCode_46GDUI_9595ThemeObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(11652180);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSound(runtimeScene, "Orbital", false, 50, gdjs.randomFloatInRange(1.2, 1.6));
}}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("UI_Msg"), gdjs.CreditsCode.GDUI_95MsgObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Music"), gdjs.CreditsCode.GDUI_95MusicObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_SFX"), gdjs.CreditsCode.GDUI_95SFXObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_Theme"), gdjs.CreditsCode.GDUI_95ThemeObjects1);
gdjs.copyArray(runtimeScene.getObjects("UI_TimeT"), gdjs.CreditsCode.GDUI_95TimeTObjects1);
{for(var i = 0, len = gdjs.CreditsCode.GDUI_95MusicObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MusicObjects1[i].setOpacity(gdjs.CreditsCode.GDUI_95MusicObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95TimeTObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95TimeTObjects1[i].setOpacity(gdjs.CreditsCode.GDUI_95TimeTObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95SFXObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95SFXObjects1[i].setOpacity(gdjs.CreditsCode.GDUI_95SFXObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95MsgObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95MsgObjects1[i].setOpacity(gdjs.CreditsCode.GDUI_95MsgObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
for(var i = 0, len = gdjs.CreditsCode.GDUI_95ThemeObjects1.length ;i < len;++i) {
    gdjs.CreditsCode.GDUI_95ThemeObjects1[i].setOpacity(gdjs.CreditsCode.GDUI_95ThemeObjects1[i].getOpacity() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
}}

}


};

gdjs.CreditsCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.CreditsCode.GDUI_95NAMEObjects1.length = 0;
gdjs.CreditsCode.GDUI_95NAMEObjects2.length = 0;
gdjs.CreditsCode.GDUI_95NAMEObjects3.length = 0;
gdjs.CreditsCode.GDUI_95MusicObjects1.length = 0;
gdjs.CreditsCode.GDUI_95MusicObjects2.length = 0;
gdjs.CreditsCode.GDUI_95MusicObjects3.length = 0;
gdjs.CreditsCode.GDUI_95SFXObjects1.length = 0;
gdjs.CreditsCode.GDUI_95SFXObjects2.length = 0;
gdjs.CreditsCode.GDUI_95SFXObjects3.length = 0;
gdjs.CreditsCode.GDUI_95TimeTObjects1.length = 0;
gdjs.CreditsCode.GDUI_95TimeTObjects2.length = 0;
gdjs.CreditsCode.GDUI_95TimeTObjects3.length = 0;
gdjs.CreditsCode.GDUI_95ThemeObjects1.length = 0;
gdjs.CreditsCode.GDUI_95ThemeObjects2.length = 0;
gdjs.CreditsCode.GDUI_95ThemeObjects3.length = 0;
gdjs.CreditsCode.GDUI_95MsgObjects1.length = 0;
gdjs.CreditsCode.GDUI_95MsgObjects2.length = 0;
gdjs.CreditsCode.GDUI_95MsgObjects3.length = 0;
gdjs.CreditsCode.GDUI_95MenuObjects1.length = 0;
gdjs.CreditsCode.GDUI_95MenuObjects2.length = 0;
gdjs.CreditsCode.GDUI_95MenuObjects3.length = 0;
gdjs.CreditsCode.GDPlayer_95RObjects1.length = 0;
gdjs.CreditsCode.GDPlayer_95RObjects2.length = 0;
gdjs.CreditsCode.GDPlayer_95RObjects3.length = 0;
gdjs.CreditsCode.GDPlayer_95GObjects1.length = 0;
gdjs.CreditsCode.GDPlayer_95GObjects2.length = 0;
gdjs.CreditsCode.GDPlayer_95GObjects3.length = 0;
gdjs.CreditsCode.GDPlayer_95BObjects1.length = 0;
gdjs.CreditsCode.GDPlayer_95BObjects2.length = 0;
gdjs.CreditsCode.GDPlayer_95BObjects3.length = 0;
gdjs.CreditsCode.GDFIX_95PostProcessingAreaObjects1.length = 0;
gdjs.CreditsCode.GDFIX_95PostProcessingAreaObjects2.length = 0;
gdjs.CreditsCode.GDFIX_95PostProcessingAreaObjects3.length = 0;
gdjs.CreditsCode.GDAvatarObjects1.length = 0;
gdjs.CreditsCode.GDAvatarObjects2.length = 0;
gdjs.CreditsCode.GDAvatarObjects3.length = 0;

gdjs.CreditsCode.eventsList2(runtimeScene);

return;

}

gdjs['CreditsCode'] = gdjs.CreditsCode;
