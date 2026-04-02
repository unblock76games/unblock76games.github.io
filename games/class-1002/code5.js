gdjs.WeeklyLeaderboardCode = {};
gdjs.WeeklyLeaderboardCode.GDTransitionObjects1= [];
gdjs.WeeklyLeaderboardCode.GDTransitionObjects2= [];
gdjs.WeeklyLeaderboardCode.GDTransitionStartScreenObjects1= [];
gdjs.WeeklyLeaderboardCode.GDTransitionStartScreenObjects2= [];


gdjs.WeeklyLeaderboardCode.eventsList0 = function(runtimeScene) {

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

gdjs.WeeklyLeaderboardCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.WeeklyLeaderboardCode.GDTransitionObjects1.length = 0;
gdjs.WeeklyLeaderboardCode.GDTransitionObjects2.length = 0;
gdjs.WeeklyLeaderboardCode.GDTransitionStartScreenObjects1.length = 0;
gdjs.WeeklyLeaderboardCode.GDTransitionStartScreenObjects2.length = 0;

gdjs.WeeklyLeaderboardCode.eventsList0(runtimeScene);

return;

}

gdjs['WeeklyLeaderboardCode'] = gdjs.WeeklyLeaderboardCode;
