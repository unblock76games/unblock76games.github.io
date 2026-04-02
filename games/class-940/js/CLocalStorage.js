var LOCAL_STORAGE_MONEY = "fidget_spinner_money";
var LOCAL_STORAGE_SPINNERS = "fidget_spinner_available_spinners";
var LOCAL_STORAGE_FRICTION = "fidget_spinner_friction";
var LOCAL_STORAGE_MAX_SPEED = "fidget_spinner_max_speed";
var LOCAL_STORAGE_MULTIPLIER = "fidget_spinner_multiplier";
var LOCAL_STORAGE_SELECTED = "fidget_spinner_last_selected";

function CLocalStorage(){
    
    
    this._init = function(){

        try{
            this.saveItem("ls_available","ok");
            //this.resetAllData();
        }catch(evt){
            // localStorage not defined
            s_bStorageAvailable = false;
            
        }
        
        s_iMoney = 0;
        s_aAvailableSpinners = new Array();
        s_aAvailableSpinners[0] = true;
        for(var i=1;i<NUM_SPINNER;i++){
            s_aAvailableSpinners[i] = false;
        }

        s_iUpgradeFriction = 0;
        s_iUpgradeMaxSpeed = 0;
        s_iMultiplier = 1;
        s_iLastSelected = 0;
    };
    
    this.saveItem = function(szKey,oValue){
        if(s_bStorageAvailable){
            localStorage.setItem(szKey, oValue);
        } 
    };

    this.getItem = function(szKey){
        if(s_bStorageAvailable){
            return localStorage.getItem(szKey);
        }
    };
    
    this.loadData = function(){
        if(this.getItem(LOCAL_STORAGE_MONEY) !== null){
            s_iMoney = parseInt(this.getItem(LOCAL_STORAGE_MONEY));
        }

        if(this.getItem(LOCAL_STORAGE_SPINNERS) !== null){
            s_aAvailableSpinners = JSON.parse("[" + this.getItem(LOCAL_STORAGE_SPINNERS) + "]");
        }

        if(this.getItem(LOCAL_STORAGE_FRICTION) !== null){
            s_iUpgradeFriction = parseInt(this.getItem(LOCAL_STORAGE_FRICTION));
        }
            
        if(this.getItem(LOCAL_STORAGE_MAX_SPEED) !== null){
            s_iUpgradeMaxSpeed = parseInt(this.getItem(LOCAL_STORAGE_MAX_SPEED));
        }
        
        if(this.getItem(LOCAL_STORAGE_MULTIPLIER)){
            s_iMultiplier = parseInt(this.getItem(LOCAL_STORAGE_MULTIPLIER));
        }
        
        if(this.getItem(LOCAL_STORAGE_SELECTED) !== null){
            s_iLastSelected = this.getItem(LOCAL_STORAGE_SELECTED);
        }
    };
    
    this.resetAllData = function(){
        s_iMoney = 0;
        this.saveItem(LOCAL_STORAGE_MONEY,s_iMoney);
        
        s_aAvailableSpinners = new Array();
        s_aAvailableSpinners[0] = true;
        for(var i=1;i<NUM_SPINNER;i++){
            s_aAvailableSpinners[i] = false;
        }
        this.saveItem(LOCAL_STORAGE_SPINNERS,s_aAvailableSpinners);
        
        s_iUpgradeFriction = 0;
        this.saveItem(LOCAL_STORAGE_FRICTION,s_iUpgradeFriction);
        
        s_iUpgradeMaxSpeed = 0;
        this.saveItem(LOCAL_STORAGE_MAX_SPEED,s_iUpgradeMaxSpeed);
        
        s_iMultiplier = 1;
        this.saveItem(LOCAL_STORAGE_MULTIPLIER,s_iMultiplier);
        
        s_iLastSelected = 0;
        this.saveItem(LOCAL_STORAGE_SELECTED,s_iLastSelected);
    };
    
    this._init();
}

var s_bStorageAvailable = true;
var s_iMoney;
var s_aAvailableSpinners;
var s_iUpgradeFriction;
var s_iUpgradeMaxSpeed;
var s_iMultiplier;
var s_iLastSelected;