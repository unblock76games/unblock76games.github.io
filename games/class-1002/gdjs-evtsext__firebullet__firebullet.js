
gdjs.evtsExt__FireBullet__FireBullet = gdjs.evtsExt__FireBullet__FireBullet || {};

/**
 * Behavior generated from Fire Bullet
 */
gdjs.evtsExt__FireBullet__FireBullet.FireBullet = class FireBullet extends gdjs.RuntimeBehavior {
  constructor(instanceContainer, behaviorData, owner) {
    super(instanceContainer, behaviorData, owner);
    this._runtimeScene = instanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._behaviorData = {};
    this._sharedData = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.getSharedData(
      instanceContainer,
      behaviorData.name
    );
    
    this._behaviorData.FireCooldown = behaviorData.FireCooldown !== undefined ? behaviorData.FireCooldown : Number("0.1") || 0;
    this._behaviorData.HasJustFired = false;
    this._behaviorData.FiringArc = behaviorData.FiringArc !== undefined ? behaviorData.FiringArc : Number("0") || 0;
    this._behaviorData.AngleVariance = behaviorData.AngleVariance !== undefined ? behaviorData.AngleVariance : Number("0") || 0;
    this._behaviorData.BulletQuantity = behaviorData.BulletQuantity !== undefined ? behaviorData.BulletQuantity : Number("1") || 0;
    this._behaviorData.CurrentBulletAngle = Number("0") || 0;
  }

  // Hot-reload:
  updateFromBehaviorData(oldBehaviorData, newBehaviorData) {
    
    if (oldBehaviorData.FireCooldown !== newBehaviorData.FireCooldown)
      this._behaviorData.FireCooldown = newBehaviorData.FireCooldown;
    if (oldBehaviorData.HasJustFired !== newBehaviorData.HasJustFired)
      this._behaviorData.HasJustFired = newBehaviorData.HasJustFired;
    if (oldBehaviorData.FiringArc !== newBehaviorData.FiringArc)
      this._behaviorData.FiringArc = newBehaviorData.FiringArc;
    if (oldBehaviorData.AngleVariance !== newBehaviorData.AngleVariance)
      this._behaviorData.AngleVariance = newBehaviorData.AngleVariance;
    if (oldBehaviorData.BulletQuantity !== newBehaviorData.BulletQuantity)
      this._behaviorData.BulletQuantity = newBehaviorData.BulletQuantity;
    if (oldBehaviorData.CurrentBulletAngle !== newBehaviorData.CurrentBulletAngle)
      this._behaviorData.CurrentBulletAngle = newBehaviorData.CurrentBulletAngle;

    return true;
  }

  // Properties:
  
  _getFireCooldown() {
    return this._behaviorData.FireCooldown !== undefined ? this._behaviorData.FireCooldown : Number("0.1") || 0;
  }
  _setFireCooldown(newValue) {
    this._behaviorData.FireCooldown = newValue;
  }
  _getHasJustFired() {
    return this._behaviorData.HasJustFired !== undefined ? this._behaviorData.HasJustFired : false;
  }
  _setHasJustFired(newValue) {
    this._behaviorData.HasJustFired = newValue;
  }
  _toggleHasJustFired() {
    this._setHasJustFired(!this._getHasJustFired());
  }
  _getFiringArc() {
    return this._behaviorData.FiringArc !== undefined ? this._behaviorData.FiringArc : Number("0") || 0;
  }
  _setFiringArc(newValue) {
    this._behaviorData.FiringArc = newValue;
  }
  _getAngleVariance() {
    return this._behaviorData.AngleVariance !== undefined ? this._behaviorData.AngleVariance : Number("0") || 0;
  }
  _setAngleVariance(newValue) {
    this._behaviorData.AngleVariance = newValue;
  }
  _getBulletQuantity() {
    return this._behaviorData.BulletQuantity !== undefined ? this._behaviorData.BulletQuantity : Number("1") || 0;
  }
  _setBulletQuantity(newValue) {
    this._behaviorData.BulletQuantity = newValue;
  }
  _getCurrentBulletAngle() {
    return this._behaviorData.CurrentBulletAngle !== undefined ? this._behaviorData.CurrentBulletAngle : Number("0") || 0;
  }
  _setCurrentBulletAngle(newValue) {
    this._behaviorData.CurrentBulletAngle = newValue;
  }
}

/**
 * Shared data generated from Fire Bullet
 */
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.SharedData = class FireBulletSharedData {
  constructor(sharedData) {
    
  }
  
  // Shared properties:
  
}

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.getSharedData = function(instanceContainer, behaviorName) {
  if (!instanceContainer._FireBullet_FireBulletSharedData) {
    const initialData = instanceContainer.getInitialSharedDataForBehavior(
      behaviorName
    );
    instanceContainer._FireBullet_FireBulletSharedData = new gdjs.evtsExt__FireBullet__FireBullet.FireBullet.SharedData(
      initialData
    );
  }
  return instanceContainer._FireBullet_FireBulletSharedData;
}

// Methods:
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects2= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects3= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects2= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects3= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.mapOfGDgdjs_46evtsExt_95_95FireBullet_95_95FireBullet_46FireBullet_46prototype_46FireTowardPositionContext_46GDBulletObjects2Objects = Hashtable.newFrom({"Bullet": gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects2});
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.mapOfGDgdjs_46evtsExt_95_95FireBullet_95_95FireBullet_46FireBullet_46prototype_46FireTowardPositionContext_46GDBulletObjects1Objects = Hashtable.newFrom({"Bullet": gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects1});
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (typeof eventsFunctionContext !== 'undefined' ? !!eventsFunctionContext.getArgument("RotateBullet") : false);
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("Bullet"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects2);
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects2);
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects2.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects2[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior")).Fire((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("XPosition")) || 0 : 0), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("YPosition")) || 0 : 0), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.mapOfGDgdjs_46evtsExt_95_95FireBullet_95_95FireBullet_46FireBullet_46prototype_46FireTowardPositionContext_46GDBulletObjects2Objects, (gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects2[i].getAngleToPosition((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("TargetXPosition")) || 0 : 0), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("TargetYPosition")) || 0 : 0))), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Speed")) || 0 : 0), true, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !(typeof eventsFunctionContext !== 'undefined' ? !!eventsFunctionContext.getArgument("RotateBullet") : false);
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("Bullet"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior")).Fire((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("XPosition")) || 0 : 0), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("YPosition")) || 0 : 0), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.mapOfGDgdjs_46evtsExt_95_95FireBullet_95_95FireBullet_46FireBullet_46prototype_46FireTowardPositionContext_46GDBulletObjects1Objects, (gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects1[i].getAngleToPosition((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("TargetXPosition")) || 0 : 0), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("TargetYPosition")) || 0 : 0))), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Speed")) || 0 : 0), false, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
}
}}

}


};gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.eventsList0(runtimeScene, eventsFunctionContext);
}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPosition = function(XPosition, YPosition, Bullet, TargetXPosition, TargetYPosition, Speed, RotateBullet, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Bullet": Bullet
},
  _objectArraysMap: {
"Object": thisObjectList
, "Bullet": gdjs.objectsListsToArray(Bullet)
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "XPosition") return XPosition;
if (argName === "YPosition") return YPosition;
if (argName === "TargetXPosition") return TargetXPosition;
if (argName === "TargetYPosition") return TargetYPosition;
if (argName === "Speed") return Speed;
if (argName === "RotateBullet") return RotateBullet;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDObjectObjects3.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects2.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.GDBulletObjects3.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireTowardPositionContext.eventsList1(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects4= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects3= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects4= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.mapOfGDgdjs_46evtsExt_95_95FireBullet_95_95FireBullet_46FireBullet_46prototype_46FireContext_46GDBulletObjects2Objects = Hashtable.newFrom({"Bullet": gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2});
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (typeof eventsFunctionContext !== 'undefined' ? !!eventsFunctionContext.getArgument("RotateBullet") : false);
}
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2 */
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2[i].setAngle((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Angle")) || 0 : 0));
}
}}

}


};gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList1 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1, gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2);


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = ((( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getBulletQuantity()) == 1);
}
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2 */
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2.length = 0;

{gdjs.evtTools.object.createObjectOnScene((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : runtimeScene), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.mapOfGDgdjs_46evtsExt_95_95FireBullet_95_95FireBullet_46FireBullet_46prototype_46FireContext_46GDBulletObjects2Objects, (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("XPosition")) || 0 : 0), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("YPosition")) || 0 : 0), "");
}{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2[i].addPolarForce((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Angle")) || 0 : 0) + gdjs.randomInRange(-((( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleVariance())), (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleVariance())), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Speed")) || 0 : 0), 1);
}
}
{ //Subevents
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList0(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.mapOfGDgdjs_46evtsExt_95_95FireBullet_95_95FireBullet_46FireBullet_46prototype_46FireContext_46GDBulletObjects2Objects = Hashtable.newFrom({"Bullet": gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2});
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList2 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = (typeof eventsFunctionContext !== 'undefined' ? !!eventsFunctionContext.getArgument("RotateBullet") : false);
}
if (isConditionTrue_0) {
gdjs.copyArray(gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2, gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects3);

gdjs.copyArray(gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2, gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3);

{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects3.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects3[i].setAngle((( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentBulletAngle()));
}
}}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2, gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3);

{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentBulletAngle(gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentBulletAngle() + ((gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getFiringArc()) / ((gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getBulletQuantity()) - 1)));
}
}}

}


};gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList3 = function(runtimeScene, eventsFunctionContext) {

{

/* Reuse gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1 */

const repeatCount2 = (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getBulletQuantity());
for (let repeatIndex2 = 0;repeatIndex2 < repeatCount2;++repeatIndex2) {
gdjs.copyArray(gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1, gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2);

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2.length = 0;


let isConditionTrue_0 = false;
if (true)
{
{gdjs.evtTools.object.createObjectOnScene((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : runtimeScene), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.mapOfGDgdjs_46evtsExt_95_95FireBullet_95_95FireBullet_46FireBullet_46prototype_46FireContext_46GDBulletObjects2Objects, (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("XPosition")) || 0 : 0), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("YPosition")) || 0 : 0), "");
}{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2[i].addPolarForce((( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getCurrentBulletAngle()) + gdjs.randomInRange(-((( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleVariance())), (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleVariance())), (typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Speed")) || 0 : 0), 1);
}
}
{ //Subevents: 
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList2(runtimeScene, eventsFunctionContext);} //Subevents end.
}
}

}


};gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList4 = function(runtimeScene, eventsFunctionContext) {

{

/* Reuse gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1 */

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = ((( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getBulletQuantity()) > 1);
}
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setCurrentBulletAngle((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Angle")) || 0 : 0) - (gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getFiringArc()) / 2);
}
}
{ //Subevents
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList3(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList5 = function(runtimeScene, eventsFunctionContext) {

{


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList1(runtimeScene, eventsFunctionContext);
}


{


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList4(runtimeScene, eventsFunctionContext);
}


};gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList6 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[i].timerElapsedTime("FireCooldown", (gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getFireCooldown())) ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[k] = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setHasJustFired(true);
}
}
{ //Subevents
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList5(runtimeScene, eventsFunctionContext);} //End of subevents
}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.Fire = function(XPosition, YPosition, Bullet, Angle, Speed, RotateBullet, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Bullet": Bullet
},
  _objectArraysMap: {
"Object": thisObjectList
, "Bullet": gdjs.objectsListsToArray(Bullet)
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "XPosition") return XPosition;
if (argName === "YPosition") return YPosition;
if (argName === "Angle") return Angle;
if (argName === "Speed") return Speed;
if (argName === "RotateBullet") return RotateBullet;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects3.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDObjectObjects4.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects2.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects3.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.GDBulletObjects4.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FireContext.eventsList6(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{if (typeof eventsFunctionContext !== 'undefined') { eventsFunctionContext.returnValue = false; }}}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getHasJustFired() ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects1[k] = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
{if (typeof eventsFunctionContext !== 'undefined') { eventsFunctionContext.returnValue = true; }}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFired = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.HasJustFiredContext.eventsList0(runtimeScene, eventsFunctionContext);

return !!eventsFunctionContext.returnValue;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setHasJustFired(false);
}
}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEvents = function(parentEventsFunctionContext) {
this._onceTriggers.startNewFrame();
var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPreEventsContext.eventsList0(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.GDObjectObjects1[i].resetTimer("FireCooldown");
}
}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreated = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.onCreatedContext.eventsList0(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getHasJustFired() ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1[k] = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1 */
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1[i].resetTimer("FireCooldown");
}
}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEvents = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.doStepPostEventsContext.eventsList0(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setFiringArc((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Value")) || 0 : 0));
}
}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArc = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetFiringArcContext.eventsList0(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setAngleVariance((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Value")) || 0 : 0));
}
}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVariance = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetAngleVarianceContext.eventsList0(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setBulletQuantity((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("Value")) || 0 : 0));
}
}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantity = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetBulletQuantityContext.eventsList0(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.GDObjectObjects1);
{for(var i = 0, len = gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._setFireCooldown((typeof eventsFunctionContext !== 'undefined' ? Number(eventsFunctionContext.getArgument("NewCooldown")) || 0 : 0));
}
}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldown = function(NewCooldown, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "NewCooldown") return NewCooldown;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.SetCooldownContext.eventsList0(runtimeScene, eventsFunctionContext);

return;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.GDObjectObjects1);
{if (typeof eventsFunctionContext !== 'undefined') { eventsFunctionContext.returnValue = (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getBulletQuantity()); }}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantity = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.BulletQuantityContext.eventsList0(runtimeScene, eventsFunctionContext);

return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.GDObjectObjects1);
{if (typeof eventsFunctionContext !== 'undefined') { eventsFunctionContext.returnValue = (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getAngleVariance()); }}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVariance = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.AngleVarianceContext.eventsList0(runtimeScene, eventsFunctionContext);

return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.GDObjectObjects1);
{if (typeof eventsFunctionContext !== 'undefined') { eventsFunctionContext.returnValue = (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getFiringArc()); }}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArc = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.FiringArcContext.eventsList0(runtimeScene, eventsFunctionContext);

return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.GDObjectObjects1);
{if (typeof eventsFunctionContext !== 'undefined') { eventsFunctionContext.returnValue = (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior"))._getFireCooldown()); }}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.Cooldown = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownContext.eventsList0(runtimeScene, eventsFunctionContext);

return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext = {};
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects1= [];
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects2= [];


gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects1);
{if (typeof eventsFunctionContext !== 'undefined') { eventsFunctionContext.returnValue = Math.max(0, (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects1[0].getBehavior(eventsFunctionContext.getBehaviorName("Behavior")).Cooldown((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined))) - (( gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects1.length === 0 ) ? 0 :gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects1[0].getTimerElapsedTimeInSeconds("FireCooldown"))); }}}

}


};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeft = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._runtimeScene;
var thisObjectList = [this.owner];
var Object = Hashtable.newFrom({Object: thisObjectList});
var Behavior = this.name;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": thisObjectList
},
  _behaviorNamesMap: {
"Behavior": Behavior
},
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        eventsFunctionContext._objectArraysMap[objectName].push(object);
      }
      return object;    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.GDObjectObjects2.length = 0;

gdjs.evtsExt__FireBullet__FireBullet.FireBullet.prototype.CooldownTimeLeftContext.eventsList0(runtimeScene, eventsFunctionContext);

return Number(eventsFunctionContext.returnValue) || 0;
}


gdjs.registerBehavior("FireBullet::FireBullet", gdjs.evtsExt__FireBullet__FireBullet.FireBullet);
