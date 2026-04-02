var LOCALSTORAGE_TIMES = "times";
var LOCALSTORAGE_COINS = "coins";
var LOCALSTORAGE_GEARPOWER_LEVEL = "startpower";
var LOCALSTORAGE_SPEEDPOWER_LEVEL = "speedpower";
var LOCALSTORAGE_NITROPOWER_LEVEL = "nitropower";

function CLocalStorage(szName){
    
    var _bLocalStorage = true;
    var _aTemporaryValue = new Array();

    this._init = function(szName){    
        var bFlag = window.localStorage.getItem(szName);

        if(bFlag === null || bFlag === undefined){   
            this.resetAllData();  
            this.loadData();
        } else {
            this.loadData();
        }
        
    };
    
    this.setItem = function(szKey, szValue){
        if(_bLocalStorage){
            window.localStorage.setItem(szName+"_"+szKey, szValue);
        } else {
            _aTemporaryValue[szKey] = szValue;
        }
        
    };
    
    this.getItem = function(szKey){
        if(_bLocalStorage){
            return window.localStorage.getItem(szName+"_"+szKey);
        } else {
            return _aTemporaryValue[szKey];
        }
        
    };
    
    this.setItemJson = function(szKey, jsonObj){
        if(_bLocalStorage){
            localStorage.setItem(szName+"_"+szKey, JSON.stringify(jsonObj));
        } else {
            _aTemporaryValue[szKey] = JSON.stringify(jsonObj);
        }
    };
    
    this.getItemJson = function(szKey){
        
        if(_bLocalStorage){
            return JSON.parse(localStorage.getItem(szName+"_"+szKey));
        } else {
            return JSON.parse(_aTemporaryValue[szKey]);
        }
    };
    
    this.isDirty = function(){
        var aLevelScore = s_oLocalStorage.getItemJson(LOCALSTORAGE_TIMES);
        for (var i = 0; i <aLevelScore.length; i++) {
            if(aLevelScore[i] > 0){
                return true;
            }
        }
        return false;
    };

    this.isUsed = function(){
        return _bLocalStorage;
    };

    this.resetAllData = function(){    
        try {
            window.localStorage.setItem(szName, true);
            
        } catch (e) {
            _bLocalStorage = false;
        }
        
        var aScore = new Array();
        for(var i=0; i<NUM_TRACK; i++){
            aScore[i] = 0;
        }
        this.setItemJson(LOCALSTORAGE_TIMES,aScore);
        
        this.setItem(LOCALSTORAGE_COINS, 0);
        
        this.setItem(LOCALSTORAGE_GEARPOWER_LEVEL, 0);
        this.setItem(LOCALSTORAGE_SPEEDPOWER_LEVEL, 0);
        this.setItem(LOCALSTORAGE_NITROPOWER_LEVEL, 0);
    };

    this.loadData = function(){
        var iGearLevel = parseInt(this.getItem(LOCALSTORAGE_GEARPOWER_LEVEL));
        GEAR_START_AREA.greenangle = GEAR_START_GREEN_WIDTH[iGearLevel];
        GEAR_IN_RACE_AREA.greenangle = GEAR_INRACE_GREEN_WIDTH[iGearLevel];
        WRONG_GEAR_CHANGE_STALL_DURATION = WRONG_GEAR_DURATION_INFO[iGearLevel];
        
        var iNitroLevel = parseInt(this.getItem(LOCALSTORAGE_NITROPOWER_LEVEL));
        NITRO_DURATION = NITRO_INFO[iNitroLevel];
        
        var iSpeedLevel = parseInt(this.getItem(LOCALSTORAGE_SPEEDPOWER_LEVEL));
        PLAYER_ENGINE_GEAR = PLAYER_ENGINE_INFO[iSpeedLevel];
        
    };

    this._init(szName);
    
}