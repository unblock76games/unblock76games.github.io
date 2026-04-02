//initialize
var analytics = {};
analytics.initialized = false;
try {
  GameAnalytics("initialize", "28b9bdf4ac18d6479f75e22630c1ead5", "4ebc011537822bc1bb24fabc7f5e6cdeb7e71698");
  analytics.initialized = true;
} catch (e) {
  analytics.initialized = false;
}

function analyticsExternalCall(eventName, value) {
  if (!analytics.initialized) return;

  eventName = eventName.replace("-", "");
  eventName = eventName.replace(",", "");

  if (value != undefined) {
    GameAnalytics("addDesignEvent", eventName, value);
  } else {
    GameAnalytics("addDesignEvent", eventName);
  }
}
