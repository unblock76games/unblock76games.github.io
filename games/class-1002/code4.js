gdjs.InfiLeaderboardCode = {};
gdjs.InfiLeaderboardCode.GDTransitionObjects1= [];
gdjs.InfiLeaderboardCode.GDTransitionObjects2= [];
gdjs.InfiLeaderboardCode.GDTransitionStartScreenObjects1= [];
gdjs.InfiLeaderboardCode.GDTransitionStartScreenObjects2= [];


gdjs.InfiLeaderboardCode.eventsList0 = function(runtimeScene) {

{



}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = !(gdjs.evtTools.leaderboards.isLeaderboardViewLoaded());
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.popScene(runtimeScene);
}}

}


};

gdjs.InfiLeaderboardCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.InfiLeaderboardCode.GDTransitionObjects1.length = 0;
gdjs.InfiLeaderboardCode.GDTransitionObjects2.length = 0;
gdjs.InfiLeaderboardCode.GDTransitionStartScreenObjects1.length = 0;
gdjs.InfiLeaderboardCode.GDTransitionStartScreenObjects2.length = 0;

gdjs.InfiLeaderboardCode.eventsList0(runtimeScene);

return;

}

gdjs['InfiLeaderboardCode'] = gdjs.InfiLeaderboardCode;
