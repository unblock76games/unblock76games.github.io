gdjs.StartMenuCode = {};
gdjs.StartMenuCode.GDTransitionObjects1= [];
gdjs.StartMenuCode.GDTransitionObjects2= [];
gdjs.StartMenuCode.GDTransitionObjects3= [];
gdjs.StartMenuCode.GDTransitionObjects4= [];
gdjs.StartMenuCode.GDTransitionStartScreenObjects1= [];
gdjs.StartMenuCode.GDTransitionStartScreenObjects2= [];
gdjs.StartMenuCode.GDTransitionStartScreenObjects3= [];
gdjs.StartMenuCode.GDTransitionStartScreenObjects4= [];
gdjs.StartMenuCode.GDPatreonSupportObjects1= [];
gdjs.StartMenuCode.GDPatreonSupportObjects2= [];
gdjs.StartMenuCode.GDPatreonSupportObjects3= [];
gdjs.StartMenuCode.GDPatreonSupportObjects4= [];
gdjs.StartMenuCode.GDReset_95TimerObjects1= [];
gdjs.StartMenuCode.GDReset_95TimerObjects2= [];
gdjs.StartMenuCode.GDReset_95TimerObjects3= [];
gdjs.StartMenuCode.GDReset_95TimerObjects4= [];
gdjs.StartMenuCode.GDReset_95ButtonObjects1= [];
gdjs.StartMenuCode.GDReset_95ButtonObjects2= [];
gdjs.StartMenuCode.GDReset_95ButtonObjects3= [];
gdjs.StartMenuCode.GDReset_95ButtonObjects4= [];
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1= [];
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2= [];
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects3= [];
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects4= [];
gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects1= [];
gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects2= [];
gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects3= [];
gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects4= [];
gdjs.StartMenuCode.GDTutorialObjects1= [];
gdjs.StartMenuCode.GDTutorialObjects2= [];
gdjs.StartMenuCode.GDTutorialObjects3= [];
gdjs.StartMenuCode.GDTutorialObjects4= [];
gdjs.StartMenuCode.GDBackground1Objects1= [];
gdjs.StartMenuCode.GDBackground1Objects2= [];
gdjs.StartMenuCode.GDBackground1Objects3= [];
gdjs.StartMenuCode.GDBackground1Objects4= [];
gdjs.StartMenuCode.GDGround1Objects1= [];
gdjs.StartMenuCode.GDGround1Objects2= [];
gdjs.StartMenuCode.GDGround1Objects3= [];
gdjs.StartMenuCode.GDGround1Objects4= [];
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1= [];
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects2= [];
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects3= [];
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects4= [];
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1= [];
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects2= [];
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects3= [];
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects4= [];
gdjs.StartMenuCode.GDKenney_95SiteObjects1= [];
gdjs.StartMenuCode.GDKenney_95SiteObjects2= [];
gdjs.StartMenuCode.GDKenney_95SiteObjects3= [];
gdjs.StartMenuCode.GDKenney_95SiteObjects4= [];
gdjs.StartMenuCode.GDWesley_95YouTubeObjects1= [];
gdjs.StartMenuCode.GDWesley_95YouTubeObjects2= [];
gdjs.StartMenuCode.GDWesley_95YouTubeObjects3= [];
gdjs.StartMenuCode.GDWesley_95YouTubeObjects4= [];
gdjs.StartMenuCode.GDWesley_95PatreonObjects1= [];
gdjs.StartMenuCode.GDWesley_95PatreonObjects2= [];
gdjs.StartMenuCode.GDWesley_95PatreonObjects3= [];
gdjs.StartMenuCode.GDWesley_95PatreonObjects4= [];
gdjs.StartMenuCode.GDWesley_95TwitterObjects1= [];
gdjs.StartMenuCode.GDWesley_95TwitterObjects2= [];
gdjs.StartMenuCode.GDWesley_95TwitterObjects3= [];
gdjs.StartMenuCode.GDWesley_95TwitterObjects4= [];
gdjs.StartMenuCode.GDPlay_95ButtonObjects1= [];
gdjs.StartMenuCode.GDPlay_95ButtonObjects2= [];
gdjs.StartMenuCode.GDPlay_95ButtonObjects3= [];
gdjs.StartMenuCode.GDPlay_95ButtonObjects4= [];


gdjs.StartMenuCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.storage.elementExistsInJSONFile("PlayerName", "PlayerName");
if (isConditionTrue_0) {
gdjs.copyArray(gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2, gdjs.StartMenuCode.GDLeaderboardName_95InputObjects3);

{gdjs.evtTools.storage.readStringFromJSONFile("PlayerName", "PlayerName", runtimeScene, runtimeScene.getScene().getVariables().get("PlayerNameTemp"));
}{for(var i = 0, len = gdjs.StartMenuCode.GDLeaderboardName_95InputObjects3.length ;i < len;++i) {
    gdjs.StartMenuCode.GDLeaderboardName_95InputObjects3[i].setString(gdjs.evtTools.variable.getVariableString(runtimeScene.getScene().getVariables().get("PlayerNameTemp")));
}
}}

}


{



}


{


let isConditionTrue_0 = false;
{
{gdjs.evtTools.sound.preloadMusic(runtimeScene, "CoalescenceByLightspeed6.ogg");
}{gdjs.evtTools.sound.preloadMusic(runtimeScene, "assets\\Surge_During.ogg");
}{gdjs.evtTools.sound.preloadMusic(runtimeScene, "assets\\Groove_During.ogg");
}{gdjs.evtTools.sound.preloadMusic(runtimeScene, "assets\\Finale_During.ogg");
}{gdjs.evtTools.sound.preloadMusic(runtimeScene, "fireCracklingSound.ogg");
}}

}


};gdjs.StartMenuCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("LeaderboardName_Input"), gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2);
gdjs.copyArray(runtimeScene.getObjects("LeaderboardSubmit_Bitmap"), gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects2);
gdjs.copyArray(runtimeScene.getObjects("Reset_Button"), gdjs.StartMenuCode.GDReset_95ButtonObjects2);
gdjs.copyArray(runtimeScene.getObjects("Reset_Timer"), gdjs.StartMenuCode.GDReset_95TimerObjects2);
gdjs.copyArray(runtimeScene.getObjects("TransitionStartScreen"), gdjs.StartMenuCode.GDTransitionStartScreenObjects2);
{for(var i = 0, len = gdjs.StartMenuCode.GDReset_95ButtonObjects2.length ;i < len;++i) {
    gdjs.StartMenuCode.GDReset_95ButtonObjects2[i].setX((gdjs.evtTools.window.getGameResolutionWidth(runtimeScene) / 2) - ((gdjs.StartMenuCode.GDReset_95ButtonObjects2[i].getWidth()) / 2));
}
}{for(var i = 0, len = gdjs.StartMenuCode.GDReset_95TimerObjects2.length ;i < len;++i) {
    gdjs.StartMenuCode.GDReset_95TimerObjects2[i].hide();
}
}{for(var i = 0, len = gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects2.length ;i < len;++i) {
    gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects2[i].hide();
}
}{for(var i = 0, len = gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2.length ;i < len;++i) {
    gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2[i].setOpacity(0);
}
}{for(var i = 0, len = gdjs.StartMenuCode.GDTransitionStartScreenObjects2.length ;i < len;++i) {
    gdjs.StartMenuCode.GDTransitionStartScreenObjects2[i].getBehavior("Tween").addObjectOpacityTween("Fade", 0, "linear", 500, false);
}
}{for(var i = 0, len = gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2.length ;i < len;++i) {
    gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2[i].getBehavior("Tween").addObjectOpacityTween("Fade", 255, "linear", 500, false);
}
}{gdjs.evtTools.runtimeScene.setBackgroundColor(runtimeScene, "39;39;54");
}
{ //Subevents
gdjs.StartMenuCode.eventsList0(runtimeScene);} //End of subevents
}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("Background1"), gdjs.StartMenuCode.GDBackground1Objects1);
gdjs.copyArray(runtimeScene.getObjects("TransitionStartScreen"), gdjs.StartMenuCode.GDTransitionStartScreenObjects1);
{gdjs.evtTools.camera.setCameraX(runtimeScene, (( gdjs.StartMenuCode.GDBackground1Objects1.length === 0 ) ? 0 :gdjs.StartMenuCode.GDBackground1Objects1[0].getCenterXInScene()), "", 0);
}{for(var i = 0, len = gdjs.StartMenuCode.GDTransitionStartScreenObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDTransitionStartScreenObjects1[i].setWidth(gdjs.evtTools.window.getGameResolutionWidth(runtimeScene) + 300);
}
}{for(var i = 0, len = gdjs.StartMenuCode.GDTransitionStartScreenObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDTransitionStartScreenObjects1[i].setX((( gdjs.StartMenuCode.GDBackground1Objects1.length === 0 ) ? 0 :gdjs.StartMenuCode.GDBackground1Objects1[0].getCenterXInScene()));
}
}}

}


};gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDPlay_9595ButtonObjects1Objects = Hashtable.newFrom({"Play_Button": gdjs.StartMenuCode.GDPlay_95ButtonObjects1});
gdjs.StartMenuCode.asyncCallback25620164 = function (runtimeScene, asyncObjectsList) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Overworld", false);
}}
gdjs.StartMenuCode.eventsList2 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(0.8), (runtimeScene) => (gdjs.StartMenuCode.asyncCallback25620164(runtimeScene, asyncObjectsList)));
}
}

}


};gdjs.StartMenuCode.asyncCallback25620844 = function (runtimeScene, asyncObjectsList) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "MainGame", false);
}}
gdjs.StartMenuCode.eventsList3 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(0.8), (runtimeScene) => (gdjs.StartMenuCode.asyncCallback25620844(runtimeScene, asyncObjectsList)));
}
}

}


};gdjs.StartMenuCode.eventsList4 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().getFromIndex(1)) == 1;
if (isConditionTrue_0) {

{ //Subevents
gdjs.StartMenuCode.eventsList2(runtimeScene);} //End of subevents
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().getFromIndex(1)) == 0;
if (isConditionTrue_0) {

{ //Subevents
gdjs.StartMenuCode.eventsList3(runtimeScene);} //End of subevents
}

}


};gdjs.StartMenuCode.eventsList5 = function(runtimeScene) {

{



}


{

gdjs.copyArray(runtimeScene.getObjects("LeaderboardName_Input"), gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2.length;i<l;++i) {
    if ( gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2[i].getString() != "" ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2[k] = gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25614788);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Play_Button"), gdjs.StartMenuCode.GDPlay_95ButtonObjects2);
{for(var i = 0, len = gdjs.StartMenuCode.GDPlay_95ButtonObjects2.length ;i < len;++i) {
    gdjs.StartMenuCode.GDPlay_95ButtonObjects2[i].setAnimation(1);
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("Play_Button"), gdjs.StartMenuCode.GDPlay_95ButtonObjects1);
gdjs.copyArray(runtimeScene.getObjects("TransitionStartScreen"), gdjs.StartMenuCode.GDTransitionStartScreenObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDPlay_9595ButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDPlay_95ButtonObjects1.length;i<l;++i) {
    if ( gdjs.StartMenuCode.GDPlay_95ButtonObjects1[i].getAnimation() == 1 ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDPlay_95ButtonObjects1[k] = gdjs.StartMenuCode.GDPlay_95ButtonObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDPlay_95ButtonObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDTransitionStartScreenObjects1.length;i<l;++i) {
    if ( !(gdjs.StartMenuCode.GDTransitionStartScreenObjects1[i].getBehavior("Tween").isPlaying("Fade")) ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDTransitionStartScreenObjects1[k] = gdjs.StartMenuCode.GDTransitionStartScreenObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDTransitionStartScreenObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25617132);
}
}
}
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("LeaderboardName_Input"), gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1);
/* Reuse gdjs.StartMenuCode.GDTransitionStartScreenObjects1 */
{gdjs.evtTools.storage.readNumberFromJSONFile("PlayedOnce", "PlayedOnce", runtimeScene, runtimeScene.getScene().getVariables().getFromIndex(1));
}{gdjs.evtTools.storage.writeStringInJSONFile("PlayerName", "PlayerName", (( gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1.length === 0 ) ? "" :gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1[0].getString()));
}{runtimeScene.getGame().getVariables().getFromIndex(6).setString((( gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1.length === 0 ) ? "" :gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1[0].getString()));
}{for(var i = 0, len = gdjs.StartMenuCode.GDTransitionStartScreenObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDTransitionStartScreenObjects1[i].getBehavior("Tween").addObjectOpacityTween("Fade", 255, "linear", 500, false);
}
}{for(var i = 0, len = gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1[i].getBehavior("Tween").addObjectOpacityTween("Fade", 0, "linear", 500, false);
}
}{gdjs.evtTools.sound.playSound(runtimeScene, "PlayGameSound.wav", false, 80, 0.9);
}
{ //Subevents
gdjs.StartMenuCode.eventsList4(runtimeScene);} //End of subevents
}

}


};gdjs.StartMenuCode.eventsList6 = function(runtimeScene) {

{



}


};gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDLightSpeed6_9595YouTubeObjects1ObjectsGDgdjs_46StartMenuCode_46GDArtManOil_9595TwitterObjects1ObjectsGDgdjs_46StartMenuCode_46GDKenney_9595SiteObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595YouTubeObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595PatreonObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595TwitterObjects1ObjectsGDgdjs_46StartMenuCode_46GDPlay_9595ButtonObjects1Objects = Hashtable.newFrom({"LightSpeed6_YouTube": gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1, "ArtManOil_Twitter": gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1, "Kenney_Site": gdjs.StartMenuCode.GDKenney_95SiteObjects1, "Wesley_YouTube": gdjs.StartMenuCode.GDWesley_95YouTubeObjects1, "Wesley_Patreon": gdjs.StartMenuCode.GDWesley_95PatreonObjects1, "Wesley_Twitter": gdjs.StartMenuCode.GDWesley_95TwitterObjects1, "Play_Button": gdjs.StartMenuCode.GDPlay_95ButtonObjects1});
gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDLightSpeed6_9595YouTubeObjects1ObjectsGDgdjs_46StartMenuCode_46GDArtManOil_9595TwitterObjects1ObjectsGDgdjs_46StartMenuCode_46GDKenney_9595SiteObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595YouTubeObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595PatreonObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595TwitterObjects1ObjectsGDgdjs_46StartMenuCode_46GDPlay_9595ButtonObjects1Objects = Hashtable.newFrom({"LightSpeed6_YouTube": gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1, "ArtManOil_Twitter": gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1, "Kenney_Site": gdjs.StartMenuCode.GDKenney_95SiteObjects1, "Wesley_YouTube": gdjs.StartMenuCode.GDWesley_95YouTubeObjects1, "Wesley_Patreon": gdjs.StartMenuCode.GDWesley_95PatreonObjects1, "Wesley_Twitter": gdjs.StartMenuCode.GDWesley_95TwitterObjects1, "Play_Button": gdjs.StartMenuCode.GDPlay_95ButtonObjects1});
gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDArtManOil_9595TwitterObjects2Objects = Hashtable.newFrom({"ArtManOil_Twitter": gdjs.StartMenuCode.GDArtManOil_95TwitterObjects2});
gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDLightSpeed6_9595YouTubeObjects2Objects = Hashtable.newFrom({"LightSpeed6_YouTube": gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects2});
gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDKenney_9595SiteObjects2Objects = Hashtable.newFrom({"Kenney_Site": gdjs.StartMenuCode.GDKenney_95SiteObjects2});
gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDWesley_9595YouTubeObjects2Objects = Hashtable.newFrom({"Wesley_YouTube": gdjs.StartMenuCode.GDWesley_95YouTubeObjects2});
gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDWesley_9595TwitterObjects2Objects = Hashtable.newFrom({"Wesley_Twitter": gdjs.StartMenuCode.GDWesley_95TwitterObjects2});
gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDWesley_9595PatreonObjects2Objects = Hashtable.newFrom({"Wesley_Patreon": gdjs.StartMenuCode.GDWesley_95PatreonObjects2});
gdjs.StartMenuCode.eventsList7 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("ArtManOil_Twitter"), gdjs.StartMenuCode.GDArtManOil_95TwitterObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDArtManOil_9595TwitterObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25628380);
}
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.window.openURL("https://twitter.com/Art_Man_Oil/status/1547428420392521730", runtimeScene);
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("LightSpeed6_YouTube"), gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDLightSpeed6_9595YouTubeObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25630172);
}
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.window.openURL("https://www.youtube.com/@Lightspeed6/featured", runtimeScene);
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("Kenney_Site"), gdjs.StartMenuCode.GDKenney_95SiteObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDKenney_9595SiteObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25631636);
}
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.window.openURL("https://kenney.itch.io/creature-mixer", runtimeScene);
}}

}


{



}


{

gdjs.copyArray(runtimeScene.getObjects("Wesley_YouTube"), gdjs.StartMenuCode.GDWesley_95YouTubeObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDWesley_9595YouTubeObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25632828);
}
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.window.openURL("https://www.youtube.com/channel/UC8RsU74-hU1pfNKHNMfiFfw", runtimeScene);
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("Wesley_Twitter"), gdjs.StartMenuCode.GDWesley_95TwitterObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDWesley_9595TwitterObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25634268);
}
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.window.openURL("https://twitter.com/HelperWesley", runtimeScene);
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("Wesley_Patreon"), gdjs.StartMenuCode.GDWesley_95PatreonObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDWesley_9595PatreonObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25635260);
}
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.window.openURL("https://www.patreon.com/helperwesley", runtimeScene);
}}

}


{


let isConditionTrue_0 = false;
{
}

}


};gdjs.StartMenuCode.eventsList8 = function(runtimeScene) {

{


gdjs.StartMenuCode.eventsList1(runtimeScene);
}


{


gdjs.StartMenuCode.eventsList5(runtimeScene);
}


{


gdjs.StartMenuCode.eventsList6(runtimeScene);
}


{



}


{

gdjs.copyArray(runtimeScene.getObjects("ArtManOil_Twitter"), gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1);
gdjs.copyArray(runtimeScene.getObjects("Kenney_Site"), gdjs.StartMenuCode.GDKenney_95SiteObjects1);
gdjs.copyArray(runtimeScene.getObjects("LightSpeed6_YouTube"), gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1);
gdjs.copyArray(runtimeScene.getObjects("Play_Button"), gdjs.StartMenuCode.GDPlay_95ButtonObjects1);
gdjs.copyArray(runtimeScene.getObjects("Wesley_Patreon"), gdjs.StartMenuCode.GDWesley_95PatreonObjects1);
gdjs.copyArray(runtimeScene.getObjects("Wesley_Twitter"), gdjs.StartMenuCode.GDWesley_95TwitterObjects1);
gdjs.copyArray(runtimeScene.getObjects("Wesley_YouTube"), gdjs.StartMenuCode.GDWesley_95YouTubeObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDLightSpeed6_9595YouTubeObjects1ObjectsGDgdjs_46StartMenuCode_46GDArtManOil_9595TwitterObjects1ObjectsGDgdjs_46StartMenuCode_46GDKenney_9595SiteObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595YouTubeObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595PatreonObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595TwitterObjects1ObjectsGDgdjs_46StartMenuCode_46GDPlay_9595ButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1.length;i<l;++i) {
    if ( !(gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1[i].getBehavior("ShakeObject_PositionAngleScale").IsShaking((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined))) ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1[k] = gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1.length;i<l;++i) {
    if ( !(gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1[i].getBehavior("ShakeObject_PositionAngleScale").IsShaking((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined))) ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1[k] = gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDKenney_95SiteObjects1.length;i<l;++i) {
    if ( !(gdjs.StartMenuCode.GDKenney_95SiteObjects1[i].getBehavior("ShakeObject_PositionAngleScale").IsShaking((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined))) ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDKenney_95SiteObjects1[k] = gdjs.StartMenuCode.GDKenney_95SiteObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDKenney_95SiteObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDWesley_95YouTubeObjects1.length;i<l;++i) {
    if ( !(gdjs.StartMenuCode.GDWesley_95YouTubeObjects1[i].getBehavior("ShakeObject_PositionAngleScale").IsShaking((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined))) ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDWesley_95YouTubeObjects1[k] = gdjs.StartMenuCode.GDWesley_95YouTubeObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDWesley_95YouTubeObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDWesley_95PatreonObjects1.length;i<l;++i) {
    if ( !(gdjs.StartMenuCode.GDWesley_95PatreonObjects1[i].getBehavior("ShakeObject_PositionAngleScale").IsShaking((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined))) ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDWesley_95PatreonObjects1[k] = gdjs.StartMenuCode.GDWesley_95PatreonObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDWesley_95PatreonObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDWesley_95TwitterObjects1.length;i<l;++i) {
    if ( !(gdjs.StartMenuCode.GDWesley_95TwitterObjects1[i].getBehavior("ShakeObject_PositionAngleScale").IsShaking((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined))) ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDWesley_95TwitterObjects1[k] = gdjs.StartMenuCode.GDWesley_95TwitterObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDWesley_95TwitterObjects1.length = k;
for (var i = 0, k = 0, l = gdjs.StartMenuCode.GDPlay_95ButtonObjects1.length;i<l;++i) {
    if ( !(gdjs.StartMenuCode.GDPlay_95ButtonObjects1[i].getBehavior("ShakeObject_PositionAngleScale").IsShaking((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined))) ) {
        isConditionTrue_0 = true;
        gdjs.StartMenuCode.GDPlay_95ButtonObjects1[k] = gdjs.StartMenuCode.GDPlay_95ButtonObjects1[i];
        ++k;
    }
}
gdjs.StartMenuCode.GDPlay_95ButtonObjects1.length = k;
}
if (isConditionTrue_0) {
/* Reuse gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1 */
/* Reuse gdjs.StartMenuCode.GDKenney_95SiteObjects1 */
/* Reuse gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1 */
/* Reuse gdjs.StartMenuCode.GDPlay_95ButtonObjects1 */
/* Reuse gdjs.StartMenuCode.GDWesley_95PatreonObjects1 */
/* Reuse gdjs.StartMenuCode.GDWesley_95TwitterObjects1 */
/* Reuse gdjs.StartMenuCode.GDWesley_95YouTubeObjects1 */
{for(var i = 0, len = gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1[i].getBehavior("ShakeObject_PositionAngleScale").ShakeObject_PositionAngleScale(0.4, 0, 0, 0, 20, 0.2, false, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
for(var i = 0, len = gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1[i].getBehavior("ShakeObject_PositionAngleScale").ShakeObject_PositionAngleScale(0.4, 0, 0, 0, 20, 0.2, false, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
for(var i = 0, len = gdjs.StartMenuCode.GDKenney_95SiteObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDKenney_95SiteObjects1[i].getBehavior("ShakeObject_PositionAngleScale").ShakeObject_PositionAngleScale(0.4, 0, 0, 0, 20, 0.2, false, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
for(var i = 0, len = gdjs.StartMenuCode.GDWesley_95YouTubeObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDWesley_95YouTubeObjects1[i].getBehavior("ShakeObject_PositionAngleScale").ShakeObject_PositionAngleScale(0.4, 0, 0, 0, 20, 0.2, false, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
for(var i = 0, len = gdjs.StartMenuCode.GDWesley_95PatreonObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDWesley_95PatreonObjects1[i].getBehavior("ShakeObject_PositionAngleScale").ShakeObject_PositionAngleScale(0.4, 0, 0, 0, 20, 0.2, false, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
for(var i = 0, len = gdjs.StartMenuCode.GDWesley_95TwitterObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDWesley_95TwitterObjects1[i].getBehavior("ShakeObject_PositionAngleScale").ShakeObject_PositionAngleScale(0.4, 0, 0, 0, 20, 0.2, false, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
for(var i = 0, len = gdjs.StartMenuCode.GDPlay_95ButtonObjects1.length ;i < len;++i) {
    gdjs.StartMenuCode.GDPlay_95ButtonObjects1[i].getBehavior("ShakeObject_PositionAngleScale").ShakeObject_PositionAngleScale(0.4, 0, 0, 0, 20, 0.2, false, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("ArtManOil_Twitter"), gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1);
gdjs.copyArray(runtimeScene.getObjects("Kenney_Site"), gdjs.StartMenuCode.GDKenney_95SiteObjects1);
gdjs.copyArray(runtimeScene.getObjects("LightSpeed6_YouTube"), gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1);
gdjs.copyArray(runtimeScene.getObjects("Play_Button"), gdjs.StartMenuCode.GDPlay_95ButtonObjects1);
gdjs.copyArray(runtimeScene.getObjects("Wesley_Patreon"), gdjs.StartMenuCode.GDWesley_95PatreonObjects1);
gdjs.copyArray(runtimeScene.getObjects("Wesley_Twitter"), gdjs.StartMenuCode.GDWesley_95TwitterObjects1);
gdjs.copyArray(runtimeScene.getObjects("Wesley_YouTube"), gdjs.StartMenuCode.GDWesley_95YouTubeObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.StartMenuCode.mapOfGDgdjs_46StartMenuCode_46GDLightSpeed6_9595YouTubeObjects1ObjectsGDgdjs_46StartMenuCode_46GDArtManOil_9595TwitterObjects1ObjectsGDgdjs_46StartMenuCode_46GDKenney_9595SiteObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595YouTubeObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595PatreonObjects1ObjectsGDgdjs_46StartMenuCode_46GDWesley_9595TwitterObjects1ObjectsGDgdjs_46StartMenuCode_46GDPlay_9595ButtonObjects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(25626140);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSound(runtimeScene, "HoverBweep.wav", false, 50, gdjs.randomFloatInRange(0.5, 0.7));
}}

}


{


gdjs.StartMenuCode.eventsList7(runtimeScene);
}


};

gdjs.StartMenuCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.StartMenuCode.GDTransitionObjects1.length = 0;
gdjs.StartMenuCode.GDTransitionObjects2.length = 0;
gdjs.StartMenuCode.GDTransitionObjects3.length = 0;
gdjs.StartMenuCode.GDTransitionObjects4.length = 0;
gdjs.StartMenuCode.GDTransitionStartScreenObjects1.length = 0;
gdjs.StartMenuCode.GDTransitionStartScreenObjects2.length = 0;
gdjs.StartMenuCode.GDTransitionStartScreenObjects3.length = 0;
gdjs.StartMenuCode.GDTransitionStartScreenObjects4.length = 0;
gdjs.StartMenuCode.GDPatreonSupportObjects1.length = 0;
gdjs.StartMenuCode.GDPatreonSupportObjects2.length = 0;
gdjs.StartMenuCode.GDPatreonSupportObjects3.length = 0;
gdjs.StartMenuCode.GDPatreonSupportObjects4.length = 0;
gdjs.StartMenuCode.GDReset_95TimerObjects1.length = 0;
gdjs.StartMenuCode.GDReset_95TimerObjects2.length = 0;
gdjs.StartMenuCode.GDReset_95TimerObjects3.length = 0;
gdjs.StartMenuCode.GDReset_95TimerObjects4.length = 0;
gdjs.StartMenuCode.GDReset_95ButtonObjects1.length = 0;
gdjs.StartMenuCode.GDReset_95ButtonObjects2.length = 0;
gdjs.StartMenuCode.GDReset_95ButtonObjects3.length = 0;
gdjs.StartMenuCode.GDReset_95ButtonObjects4.length = 0;
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects1.length = 0;
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects2.length = 0;
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects3.length = 0;
gdjs.StartMenuCode.GDLeaderboardName_95InputObjects4.length = 0;
gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects1.length = 0;
gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects2.length = 0;
gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects3.length = 0;
gdjs.StartMenuCode.GDLeaderboardSubmit_95BitmapObjects4.length = 0;
gdjs.StartMenuCode.GDTutorialObjects1.length = 0;
gdjs.StartMenuCode.GDTutorialObjects2.length = 0;
gdjs.StartMenuCode.GDTutorialObjects3.length = 0;
gdjs.StartMenuCode.GDTutorialObjects4.length = 0;
gdjs.StartMenuCode.GDBackground1Objects1.length = 0;
gdjs.StartMenuCode.GDBackground1Objects2.length = 0;
gdjs.StartMenuCode.GDBackground1Objects3.length = 0;
gdjs.StartMenuCode.GDBackground1Objects4.length = 0;
gdjs.StartMenuCode.GDGround1Objects1.length = 0;
gdjs.StartMenuCode.GDGround1Objects2.length = 0;
gdjs.StartMenuCode.GDGround1Objects3.length = 0;
gdjs.StartMenuCode.GDGround1Objects4.length = 0;
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects1.length = 0;
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects2.length = 0;
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects3.length = 0;
gdjs.StartMenuCode.GDLightSpeed6_95YouTubeObjects4.length = 0;
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects1.length = 0;
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects2.length = 0;
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects3.length = 0;
gdjs.StartMenuCode.GDArtManOil_95TwitterObjects4.length = 0;
gdjs.StartMenuCode.GDKenney_95SiteObjects1.length = 0;
gdjs.StartMenuCode.GDKenney_95SiteObjects2.length = 0;
gdjs.StartMenuCode.GDKenney_95SiteObjects3.length = 0;
gdjs.StartMenuCode.GDKenney_95SiteObjects4.length = 0;
gdjs.StartMenuCode.GDWesley_95YouTubeObjects1.length = 0;
gdjs.StartMenuCode.GDWesley_95YouTubeObjects2.length = 0;
gdjs.StartMenuCode.GDWesley_95YouTubeObjects3.length = 0;
gdjs.StartMenuCode.GDWesley_95YouTubeObjects4.length = 0;
gdjs.StartMenuCode.GDWesley_95PatreonObjects1.length = 0;
gdjs.StartMenuCode.GDWesley_95PatreonObjects2.length = 0;
gdjs.StartMenuCode.GDWesley_95PatreonObjects3.length = 0;
gdjs.StartMenuCode.GDWesley_95PatreonObjects4.length = 0;
gdjs.StartMenuCode.GDWesley_95TwitterObjects1.length = 0;
gdjs.StartMenuCode.GDWesley_95TwitterObjects2.length = 0;
gdjs.StartMenuCode.GDWesley_95TwitterObjects3.length = 0;
gdjs.StartMenuCode.GDWesley_95TwitterObjects4.length = 0;
gdjs.StartMenuCode.GDPlay_95ButtonObjects1.length = 0;
gdjs.StartMenuCode.GDPlay_95ButtonObjects2.length = 0;
gdjs.StartMenuCode.GDPlay_95ButtonObjects3.length = 0;
gdjs.StartMenuCode.GDPlay_95ButtonObjects4.length = 0;

gdjs.StartMenuCode.eventsList8(runtimeScene);

return;

}

gdjs['StartMenuCode'] = gdjs.StartMenuCode;
