var SCALE_FACTOR = 1;
var CANVAS_WIDTH = 1600*SCALE_FACTOR;
var CANVAS_HEIGHT = 960*SCALE_FACTOR;

var EDGEBOARD_X = 256*SCALE_FACTOR;
var EDGEBOARD_Y = 100*SCALE_FACTOR;

var FPS = 60;
var FPS_DT = 1/FPS;
var FPS_TIME      = 1000/FPS;
var DISABLE_SOUND_MOBILE = false;

var GAME_NAME = "watercraft_rush";

var PRIMARY_FONT = "ArialBold";
var SECONDARY_FONT = "Digital";
var PRIMARY_FONT_COLOUR = "#f14e00";

var STATE_LOADING = 0;
var STATE_MENU    = 1;
var STATE_HELP    = 1;
var STATE_GAME    = 3;

var ON_MOUSE_DOWN  = 0;
var ON_MOUSE_UP    = 1;
var ON_MOUSE_OVER  = 2;
var ON_MOUSE_OUT   = 3;
var ON_DRAG_START  = 4;
var ON_DRAG_END    = 5;

var STATE_GAME_START = 0;
var STATE_GAME_RACE = 1;
var STATE_GAME_END = 2;

var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_RIGHT = 39;
var KEY_LEFT = 37;
var KEY_SPACE = 32;

var ROTATE_LEFT = 0;
var ROTATE_RIGHT = 1;
var ROTATE_CENTER = 2;

var NUM_WORLDS = 3;
var NUM_TRACKS_PER_WORLD = 3;

var START_COUNTDOWN = 3000;

////////////////////CAMERA SETTINGS ///////////////////////////////////
var FOV = 100;                  // angle (degrees) for field of view
var CAMERA_HEIGHT = 1000;       // z height of camera
var CAMERA_DEPTH = 1 / Math.tan((FOV/2) * Math.PI/180);         // z distance camera is from screen (computed)
var PLAYER_Z_FROMCAMERA = (CAMERA_HEIGHT * CAMERA_DEPTH);
var CAR_SIDEVIEW_OFFSET = 0.2;
var CAR_FARVIEW_OFFSET = 2600;
var CAR_CURVEVIEW_OFFSET = 0.4;
var FRAMESPEED_ROTATION = 100;
var MAX_ROTATION = 5;

////////////////////PARALLAX SETTINGS ///////////////////////////////////
var PARALLAX_RATIO_X = 2;
var PARALLAX_RATIO_Y_0 = 0.004;
var PARALLAX_RATIO_Y_1 = 0.005;

////////////////// PLAYER SETTINGS  //////////////////////////////////
var PLAYER_MAX_SPEED;                        // player max speed
var PLAYER_ACCELERATION;       // player acceleration
var PLAYER_DECELERATION;       // player deceleration
var PLAYER_REAL_MAX_SPEED;


////////////////// PHYSICS SETTINGS //////////////////////////////////
var CENTRIFUGAL_FORCE   = 0.3;                     // centrifugal force multiplier when going around curves
var PLAYER_COLLIDER_WIDTH = 0.15;                    // collider width. the number is in respect to road width (1 = half road width)
var PLAYER_MIN_SPEED_DAMAGE;   // player minimum speed to being damaged

////////////////// WATER SETTINGS  //////////////////////////////////
var TERRAIN_MAX_INERTIA = 0.03;                      //terrain inertia when steer
var TERRAIN_INCREASE_INERTIA = 0.005;                //terrain increase inertia
var TERRAIN_DECREASE_INERTIA = 0.002;                //terrain decrease inertia
var TERRAIN_ADHERENCE = 1;                           //terrain adherence
var TIDE_SPEED = 100;                   //TIDE WAVE SPEED;
var MAX_TIDE_HEIGHT = 1000;              //TIDE HEIGHT;
var TIDE_RAISE_HEIGHT_SPEED = 10;        //TIDE RAISE SPEED;
var TIDE_BASE_FREQUENCY = 2500;         //TIDE BASE FREQUENCY
var TIDE_VARIABLE_FREQUENCY;        //TIDE VARIABLE FREQUENCY
var TIDE_VARIABLE_HEIGHT;           //TIDE VARIABLE HEIGHT

///////////////// ROAD SETTINGS //////////////////////////////////////
var DRAW_DISTANCE = 300;                     // number of segments to draw
var ROAD_WIDTH = 2000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
var NUM_LANES = 4;                       // number of lanes
var SEGMENT_LENGTH = 400;                // length of a single segment
var RUMBLE_LENGTH = 1;                       // number of segments per red/white rumble strip
var TRACK_LENGTH;                       // z length of entire track (computed)
var ROAD_BOUNDS = 2;                    // ROAD CROSS LIMITS


//////////////// ENVIRONMENT SETTINGS ///////////////////////////////
var FOG_DENSITY = 5;                       // exponential fog density


var ROAD = {
    TYPE:   {STANDARD:0, CURVE_S:1, BUMPS:2, FINAL:3},
    LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100, EXTRALONG: 200}, // num segments
    HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60, VERYHIGH:80 },
    CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6, VERYHARD:8 }
};

var AMBIENT = {
    DISPOSITION: {PRECISE:0, DENSITY:1},
    SIDE: {LEFT:-1, RIGHT:1, BOTH:2}
};

var COLORS = {
  LIGHT:  { road: '#5bbbff', grass: "#96a54b", rumble: '#555555', lane: '#CCCCCC'  },
  DARK:   { road: '#5bbbff', grass: "#7e8b3e", rumble: '#BBBBBB'                   },
  START:  { road: '#5bbbff',   grass: '#5bbbff',   rumble: '#5bbbff'                     },
  FINISH: { road: '#5bbbff',   grass: '#5bbbff',   rumble: '#5bbbff'                     }
};

var SPRITES = {
  
  BUOY0:                     {name: "buoy_0",               collision: {width:50}},
  BUOY1:                     {name: "buoy_1",               collision: {width:50}},
  BUOY2:                     {name: "buoy_2",               collision: {width:50}},
  BUOY3:                     {name: "buoy_3",               collision: {width:50}},
  
  BOAT0:                     {name: "boat_0",               collision: {width:50}},
  BOAT1:                     {name: "boat_1",               collision: {width:50}},
  BOAT2:                     {name: "boat_2",               },
  BOAT3:                     {name: "boat_3",               collision: {width:50}},
  BOAT4:                     {name: "boat_4",               collision: {width:50}},
  BOAT5:                     {name: "boat_5",               },
  
  TREE1:                  {name: "tree1",               collision:{width:50}            },
  TREE2:                  {name: "tree2",               collision:{center:170, width:140}            },
  BUSH1:                  {name: "bush1",               collision:{width:50}            },
  PALM_TREE:              {name: "palm_tree",           collision:{center:156, width:6} },
  
  BILLBOARD01:            {name: "billboard01"},
  BILLBOARD02:            {name: "billboard02"},
  BILLBOARD03:            {name: "billboard03"},
  BILLBOARD04:            {name: "billboard04"},
  BILLBOARD05:            {name: "billboard05"},
  
  
  ENEMY01:                  {name: "enemy01"},
  ENEMY02:                  {name: "enemy02"},
  ENEMY03:                  {name: "enemy03"}
  
};

SPRITES.SCALE = 0.00068; /// MATCH 1:1 WITH PLAYER WHEN COLLIDE

SPRITES.BILLBOARDS = [SPRITES.BILLBOARD01.name, SPRITES.BILLBOARD02.name, SPRITES.BILLBOARD03.name, SPRITES.BILLBOARD04.name, SPRITES.BILLBOARD05.name];
SPRITES.BOATS = [SPRITES.BOAT0.name, SPRITES.BOAT1.name, SPRITES.BOAT2.name, SPRITES.BOAT3.name, SPRITES.BOAT4.name, SPRITES.BOAT5.name],
SPRITES.ENEMIES       = [SPRITES.ENEMY01.name, SPRITES.ENEMY02.name, SPRITES.ENEMY03.name];

/////////////////PARAMS FOR OPTIMIZATION
var HALF_CANVAS_WIDTH = CANVAS_WIDTH/2;
var HALF_CANVAS_HEIGHT = CANVAS_HEIGHT/2;
var ROAD_PER_HALF_CANVAS_WIDTH = HALF_CANVAS_WIDTH * ROAD_WIDTH;
var ROAD_PER_SCALE_PER_HALF_CANVAS_WIDTH = SPRITES.SCALE * ROAD_PER_HALF_CANVAS_WIDTH;
var PLAYER_SPEED_CONVERSION_RATIO = PLAYER_REAL_MAX_SPEED/PLAYER_MAX_SPEED; 

var ENABLE_FULLSCREEN;
var ENABLE_CHECK_ORIENTATION;

var POINTS_PER_SECONDS;
var AD_SHOW_COUNTER;