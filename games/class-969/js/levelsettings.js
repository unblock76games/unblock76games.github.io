var ROAD_INFO = new Array();
var AMBIENT_INFO = new Array();
var LEVEL_INFO = new Array();

//////////////////////////////////////// WORLD 1 ///////////////////////////////////////////////
////////////////
ROAD_INFO[0] = [
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":ROAD.CURVE.EASY},
    
    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.MEDIUM}
]
LEVEL_INFO[0] = {   "time":85000, "num_cars":10, 
                    "terrain":{"roadbounds":2, "num_lanes":3, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [4000, 8000], height:[500,1000]}
                };
AMBIENT_INFO[0] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY3, "segments":[10, 3200], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT0, "segments":[0, 3200], "position":2, "occurrence":30, "repetitionevery": 50,"disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT1, "segments":[25, 3200], "position":2, "occurrence":20, "repetitionevery": 150,"disposition":AMBIENT.DISPOSITION.DENSITY},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD03, "segments":400, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD01, "segments":1200, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD01, "segments":[3000, 3200], "position":0.5, "repetitionevery": 30, "disposition":AMBIENT.DISPOSITION.PRECISE},

]                        
////////////////
ROAD_INFO[1] = [
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":ROAD.CURVE.EASY },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":-ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.CURVE_S,  "length":ROAD.LENGTH.LONG,     "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.CURVE_S, "length":ROAD.LENGTH.MEDIUM,    "curve":ROAD.CURVE.MEDIUM},
   
    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.MEDIUM,      "curve":-ROAD.CURVE.MEDIUM}
]
LEVEL_INFO[1] = {   "time":95000, "num_cars":15, 
                    "terrain":{"roadbounds":2, "num_lanes":3, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [6000, 9000], height:[1000,1000]}
                };
AMBIENT_INFO[1] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY0, "segments":[10, 3850], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD02, "segments":[350, 450], "position":0.5, "repetitionevery": 30, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD04, "segments":[900, 1200], "position":0.5, "repetitionevery": 50, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD04, "segments":[925, 1225], "position":0.5, "repetitionevery": 50, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD03, "segments":1700, "position":5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD01, "segments":2000, "position":4, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD04, "segments":2300, "position":5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD02, "segments":2600, "position":6, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD03, "segments":2900, "position":3, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD03, "segments":3650, "position":0, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT1, "segments":[0, 3800], "position":2, "occurrence":30, "repetitionevery": 50,"disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT2, "segments":[25, 3800], "position":2, "occurrence":20, "repetitionevery": 150,"disposition":AMBIENT.DISPOSITION.DENSITY},
    
]
////////////////
ROAD_INFO[2] = [
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,    "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,    "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,    "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,    "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,    "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,    "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,    "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,     "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,     "curve":-ROAD.CURVE.EASY},
    
    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.MEDIUM}
]
LEVEL_INFO[2] = {   "time":90000, "num_cars":15, 
                    "terrain":{"roadbounds":2, "num_lanes":3, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [5000, 7000], height:[600,800]}
                };
AMBIENT_INFO[2] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY1, "segments":[10, 3850], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD01, "segments":[1700, 2000], "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD01, "segments":[1725, 2025], "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD03, "segments":1300, "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD05, "segments":[2400, 2800], "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD01, "segments":[3100, 3400], "position":0.5, "repetitionevery": 50, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD05, "segments":2300, "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT2, "segments":[0, 3800], "position":2, "occurrence":30, "repetitionevery": 50,"disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT0, "segments":[25, 3800], "position":2, "occurrence":20, "repetitionevery": 150,"disposition":AMBIENT.DISPOSITION.DENSITY},

] 
                
                
//////////////////////////////////////// WORLD 2 ///////////////////////////////////////////////
////////////////
ROAD_INFO[3] = [
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,    "curve":-ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,    "curve":ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,    "curve":-ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,    "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,    "curve":ROAD.CURVE.MEDIUM},
    
    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.LONG}
]
LEVEL_INFO[3] = {   "time":90000, "num_cars":20, 
                    "terrain":{"roadbounds":2, "num_lanes":2, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [0, 1000], height:[200,500]}
                };
AMBIENT_INFO[3] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY2, "segments":[10, 3600], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD01, "segments":[2200, 2500], "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD02, "segments":[2800, 3200], "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},

    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.PALM_TREE, "segments":[0, 800], "position":5, "repetitionevery": 16, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.PALM_TREE, "segments":[0, 800], "position":5, "repetitionevery": 13, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.PALM_TREE, "segments":[0, 3600], "position":10, "occurrence": 50, "repetitionevery": 13, "disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUSH1, "segments":[0, 3600], "position":5, "occurrence": 40, "repetitionevery": 16, "disposition":AMBIENT.DISPOSITION.DENSITY},

]
////////////////
ROAD_INFO[4] = [
    
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,       "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.CURVE_S, "length":ROAD.LENGTH.SHORT/2, "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT/2, "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.CURVE_S, "length":ROAD.LENGTH.MEDIUM, "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.CURVE_S, "length":ROAD.LENGTH.LONG, "curve":-ROAD.CURVE.MEDIUM},
   
    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.LONG}
]
LEVEL_INFO[4] = {   "time":90000, "num_cars":20, 
                    "terrain":{"roadbounds":2, "num_lanes":2, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [0, 1000], height:[400,700]}
                };
AMBIENT_INFO[4] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY2, "segments":[10, 3600], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD04, "segments":770, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD04, "segments":1650, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD02, "segments":2000, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BOAT0, "segments":[0, 3000], "position":7, "occurrence":20, "repetitionevery": 50, "disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.PALM_TREE, "segments":[0, 1800], "position":4, "occurrence":60, "repetitionevery": 13, "disposition":AMBIENT.DISPOSITION.DENSITY},
    
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.TREE1, "segments":[1800, 3200], "position":5, "occurrence":50, "repetitionevery": 13, "disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.TREE2, "segments":[1200, 3200], "position":3, "occurrence":40, "repetitionevery": 17, "disposition":AMBIENT.DISPOSITION.DENSITY},

]
////////////////
ROAD_INFO[5] = [
    
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT/2, "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT/2, "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT/2, "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT, "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT/2, "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT/2, "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT/2, "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT, "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT/2},
    {"roadtype": ROAD.TYPE.CURVE_S, "length":ROAD.LENGTH.SHORT, "curve":-ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM, "curve":ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG, "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG, "curve":-ROAD.CURVE.HARD},

    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.LONG}
]
LEVEL_INFO[5] = {   "time":70000, "num_cars":25, 
                    "terrain":{"roadbounds":2, "num_lanes":2, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [0, 1000], height:[700,1000]}
                };
AMBIENT_INFO[5] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY2, "segments":[10, 3000], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD05, "segments":20, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD02, "segments":[1500, 1700], "position":0.5, "repetitionevery": 40, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD01, "segments":[1525, 1725], "position":0.5, "repetitionevery": 40, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.TREE2, "segments":[0, 3000], "position":3, "occurrence":70, "repetitionevery": 3, "disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.PALM_TREE, "segments":[1, 3000], "position":3, "occurrence":70, "repetitionevery": 3, "disposition":AMBIENT.DISPOSITION.DENSITY},
            
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BUSH1, "segments":[1, 3000], "position":9, "occurrence":30, "repetitionevery": 3, "disposition":AMBIENT.DISPOSITION.DENSITY},
]
//////////////////////////////////////// WORLD 2 ///////////////////////////////////////////////
////////////////
ROAD_INFO[6] = [
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,    "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG, "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM, "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM, "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,  "curve":ROAD.CURVE.HARD                             },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG, "curve":ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG, "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,     "curve":ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    
    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.LONG}
]
LEVEL_INFO[6] = {   "time":125000, "num_cars":60, 
                    "terrain":{"roadbounds":2, "num_lanes":4, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [2500, 4000], height:[800,900]}
                };
AMBIENT_INFO[6] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY0, "segments":[10, 4500], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BUOY1, "segments":[3850, 3900], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BUOY1, "segments":[2100, 2550], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BUOY1, "segments":[2700, 3150], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD05, "segments":[1500, 2000], "position":0.5, "repetitionevery": 40, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD04, "segments":[1525, 2025], "position":0.5, "repetitionevery": 40, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT2, "segments":[0, 5000], "position":15, "occurrence":60, "repetitionevery": 100,"disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT1, "segments":[0, 5000], "position":10, "occurrence":60, "repetitionevery": 30,"disposition":AMBIENT.DISPOSITION.DENSITY},
]
////////////////
ROAD_INFO[7] = [
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,     "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.HARD  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.HARD  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,   "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,   "curve":ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,   "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,   "curve":ROAD.CURVE.VERYHARD},

    //{"roadtype": ROAD.TYPE.BUMPS,    "length":ROAD.LENGTH.LONG,   "curve":ROAD.CURVE.VERYHARD },
    
    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.LONG}
]
LEVEL_INFO[7] = {   "time":145000, "num_cars":70, 
                    "terrain":{"roadbounds":2, "num_lanes":4, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [2500, 4000], height:[1000,1000]}
                };
AMBIENT_INFO[7] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY3, "segments":[10, 5200], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD01, "segments":[10, 650], "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD03, "segments":[1000, 1650], "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD03, "segments":[1030, 1680], "position":0.5, "repetitionevery": 60, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BUOY1, "segments":[3070, 3270], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BUOY1, "segments":[3400, 3570], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BUOY1, "segments":[3700, 4100], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BUOY1, "segments":[4300, 4700], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT3, "segments":[1000, 5000], "position":20, "occurrence":80, "repetitionevery": 50,"disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT3, "segments":[2000, 5000], "position":10, "occurrence":60, "repetitionevery": 30,"disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT3, "segments":[3000, 5000], "position":5, "occurrence":40, "repetitionevery": 10,"disposition":AMBIENT.DISPOSITION.DENSITY},
]
////////////////
ROAD_INFO[8] = [
    
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,   "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,   "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,    "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,    "curve":ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,    "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,    "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,    "curve":-ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,    "curve":-ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,    "curve":-ROAD.CURVE.EASY},
    
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM  },
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,   "curve":ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,   "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,   "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,    "curve":-ROAD.CURVE.MEDIUM},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.LONG,    "curve":-ROAD.CURVE.HARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,    "curve":ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.EXTRALONG,    "curve":ROAD.CURVE.VERYHARD},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.SHORT,    "curve":ROAD.CURVE.EASY},
    {"roadtype": ROAD.TYPE.STANDARD, "length":ROAD.LENGTH.MEDIUM,    "curve":ROAD.CURVE.VERYHARD},    
    
    {"roadtype": ROAD.TYPE.FINAL, "length":ROAD.LENGTH.EXTRALONG/*, "curve":ROAD.CURVE.MEDIUM*/}
]
LEVEL_INFO[8] = {   "time":180000, "num_cars":70, 
                    "terrain":{"roadbounds":4, "num_lanes":4, "adherence":1, "max_inertia":0.04},
                    "tide" : {frequency: [500, 2000], height:[1000,1000]}
                };
AMBIENT_INFO[8] = [
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BUOY0, "segments":[10, 7000], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BUOY1, "segments":[1500, 1700], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BUOY1, "segments":[2000, 2400], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BUOY1, "segments":[4800, 5000], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BUOY1, "segments":[5100, 5200], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BUOY1, "segments":[5300, 5700], "position":0, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD04, "segments":2480, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BILLBOARD04, "segments":3610, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT5, "segments":[2500, 3600], "position":0.5, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT2, "segments":[2505, 3600], "position":0.5, "repetitionevery": 10, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD01, "segments":6100, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD02, "segments":6200, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD03, "segments":6300, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD04, "segments":6400, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.LEFT, "sprite": SPRITES.BILLBOARD05, "segments":6500, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD01, "segments":6150, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD02, "segments":6250, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD03, "segments":6350, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD04, "segments":6450, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    {"side":AMBIENT.SIDE.RIGHT, "sprite": SPRITES.BILLBOARD05, "segments":6550, "position":0.5, "disposition":AMBIENT.DISPOSITION.PRECISE},
    
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT5, "segments":[0, 7000], "position":20, "occurrence":30, "repetitionevery": 60,"disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT4, "segments":[0, 7000], "position":10, "occurrence":60, "repetitionevery": 30,"disposition":AMBIENT.DISPOSITION.DENSITY},
    {"side":AMBIENT.SIDE.BOTH, "sprite": SPRITES.BOAT3, "segments":[0, 7000], "position":20, "occurrence":60, "repetitionevery": 30,"disposition":AMBIENT.DISPOSITION.DENSITY},


];