var CANVAS_WIDTH = 1360;
var CANVAS_HEIGHT = 640;

var CANVAS_WIDTH_HALF = CANVAS_WIDTH * 0.5;
var CANVAS_HEIGHT_HALF = CANVAS_HEIGHT * 0.5;

var EDGEBOARD_X = 275;
var EDGEBOARD_Y = 50;

var DISABLE_SOUND_MOBILE = false;
var FONT_GAME = "bd_cartoon_shoutregular";
var TEXT_COLOR = "#fcff00";

var FPS_TIME = 1000 / 30;

var FPS_TIME_SECONDS = 1 / 30;

var TOT_TEAM = 32;

var STATE_LOADING = 0;
var STATE_MENU = 1;
var STATE_HELP = 1;
var STATE_GAME = 3;

var ON_MOUSE_DOWN = 0;
var ON_MOUSE_UP = 1;
var ON_MOUSE_OVER = 2;
var ON_MOUSE_OUT = 3;
var ON_DRAG_START = 4;
var ON_DRAG_END = 5;

var LEFT_SCROLL_WORLD = 0;
var RIGHT_SCROLL_WORLD = 1;

//TEAM
//--------------------------------------//
var TEAM_ALGERIA = 0;
var TEAM_ARGENTINA = 1;
var TEAM_AUSTRALIA = 2;
var TEAM_BRASIL = 3;
var TEAM_CAMEROON = 4;
var TEAM_CHILE = 5;
var TEAM_CROATIA = 6;
var TEAM_DENMARK = 7;
var TEAM_ENGLAND = 8;
var TEAM_FRANCE = 9;
var TEAM_GERMANY = 10;
var TEAM_GHANA = 11;
var TEAM_GREECE = 12;
var TEAM_HOUNDURAS = 13;
var TEAM_ITALY = 14;
var TEAM_IVORY_COAST = 15;
var TEAM_JAPAN = 16;
var TEAM_MEXICO = 17;
var TEAM_NETHERLANDS = 18;
var TEAM_NEWZELAND = 19;
var TEAM_NIGERIA = 20;
var TEAM_PARAGUAY = 21;
var TEAM_PORTUGAL = 22;
var TEAM_RUSSIA = 23;
var TEAM_SERBIA = 24;
var TEAM_SLOVENIA = 25;
var TEAM_SOUTH_AFRICA = 26;
var TEAM_SOUTH_KOREA = 27;
var TEAM_SPAIN = 28;
var TEAM_SWITZERLAND = 29;
var TEAM_URUGUAY = 30;
var TEAM_USA = 31;
//------------------------------------//

var TOT_MATCH = 7;

var KEEPERS = [32, 33, 34];

var PLAYERS_USER = 0;

var PLAYERS_OPPONENT = 1;

var BALL = 2;

var LOGIC_COLLISION = 3;

var TWEEN_END_MACTH_Y = CANVAS_HEIGHT * 0.5;

var OFFSET_LIMIT_LEFT_SCROLL = -125;

var OFFSET_LIMIT_RIGHT_SCROLL = 125;

var SMOOTH_SCROLL_OFFSET = 0.1;

var PLAYERS_ON_FIELD = 8;

var LEFT_SIDE = 3;
var RIGHT_SIDE = 4;

var LINE_COLOR = "#0000ff";
var LINE_COLOR_GOALS = "#ff00ff";
var LINE_COLOR_EDGE_GOALS = "#ffff00";

var SHOW_EDGE_COLLISION = false;
var SHOW_COLLISION = false;

var LEVEL_DIAGRAM;

var DANGLE_DEGREE = 7;

var MIN_DIST_COLLISION_DETECT = 1000;

var HALF_PI = Math.PI / 2;

var K_IMPACT_BALL = 0.95;

var TIME_TRY_TO_SHOT_BALL_OPPONENT = 0.7;

var START_POS_FLAG = {x: 337, y: 208};

var FLAG_ADDED_POS = {x: 61, y: 69};

var FLAG_LIMIT_POS_X = 750;

var OFFSET_ANGLE_ARROW = 180;

var Y_POS_ARROW_SELECTED = 10;

var OBJECT;

var Y_POS_ARROW_SELECTED_OFFSET = -100;

var FORCE_MULTIPLIER = 0.01;

var PLAYERS_FRICTION = 0.96;

var HIT_PLAYER_MIN_FORCE = 0.07;

var HIT_PLAYER_MAX_FORCE = 30;

var PLAYER_REGY_OFFSET = -11;

var MIN_PLAYER_FORCE_VEL = 0.02;

var STEP_POS_X_TURN_BALL = 33;

var FIRST_POS_X_TURN_BALL = 80;

var BALL_ROTATION_MULTIPLIER = 1;

var PLAYERS_RADIUS = 20;
var PLAYERS_RADIUS_HALF = 10;
var PLAYERS_KEEPER_RADIUS = 14;
var PLAYERS_KEEPER_RADIUS_HALF = 7;

var BALL_FRICTION = 0.97;

var SUPPORTERS_POS = {x: 0, y: 120};

var START_TIME_FLAG_TIME = 200;

var BALL_POSITION = {x: CANVAS_WIDTH * 0.5, y: CANVAS_HEIGHT * 0.5};

var USER_PLAYERS = [{x: 514, y: 319, goal_keeper: false}, {x: 628, y: 234, goal_keeper: false}, {x: 628, y: 431, goal_keeper: false},
    {x: 400, y: 201, goal_keeper: false}, {x: 378, y: 489, goal_keeper: false}, {x: 215, y: 295, goal_keeper: false},
    {x: 190, y: 378, goal_keeper: false}, {x: 150, y: 335, goal_keeper: true}];

var OPPONENT_PLAYERS = [{x: 835, y: 319, goal_keeper: false}, {x: 729, y: 234, goal_keeper: false}, {x: 729, y: 431, goal_keeper: false},
    {x: 943, y: 201, goal_keeper: false}, {x: 966, y: 489, goal_keeper: false}, {x: 1145, y: 295, goal_keeper: false},
    {x: 1170, y: 378, goal_keeper: false}, {x: 1208, y: 335, goal_keeper: true}];

var POS_GOAL_OPPONENT_FRONT = {x: 1246, y: 191};
var POS_GOAL_PLAYER_FRONT = {x: 115, y: 191};

var POS_GOAL_OPPONENT_BOTTOM = {x: 1254, y: 191};
var POS_GOAL_PLAYER_BOTTOM = {x: 107, y: 191};

//FIELD DIAGRAM

var FIELD_DIAGRAM_BALL = [[{x: 171, y: 173}, {x: 1189, y: 173}], [{x: 1189, y: 173}, {x: 1220, y: 284}],
    [{x: 1220, y: 284}, {x: 1285, y: 283}], [{x: 1285, y: 283}, {x: 1320, y: 386}], [{x: 1320, y: 386}, {x: 1251, y: 387}],
    [{x: 1251, y: 387}, {x: 1293, y: 526}], [{x: 1293, y: 526}, {x: 63, y: 526}], [{x: 63, y: 526}, {x: 107, y: 388}],
    [{x: 107, y: 388}, {x: 41, y: 386}], [{x: 41, y: 386}, {x: 71, y: 283}], [{x: 71, y: 283}, {x: 138, y: 284}],
    [{x: 138, y: 284}, {x: 171, y: 173}]];

var FIELD_DIAGRAM_PLAYERS = [[{x: 171, y: 173}, {x: 1189, y: 173}], [{x: 1189, y: 173}, {x: 1293, y: 526}],
    [{x: 1293, y: 526}, {x: 63, y: 526}], [{x: 63, y: 526}, {x: 171, y: 173}]];

var EDGE_FOR_KEEPERS = [[{x: 193, y: 284}, {x: 165, y: 387}], [{x: 165, y: 387}, {x: 39, y: 383}],
    [{x: 39, y: 383}, {x: 72, y: 280}], [{x: 72, y: 280}, {x: 193, y: 284}],
    [{x: 1165, y: 284}, {x: 1284, y: 281}], [{x: 1284, y: 281}, {x: 1318, y: 387}],
    [{x: 1318, y: 387}, {x: 1194, y: 387}], [{x: 1194, y: 387}, {x: 1165, y: 284}]];

var GOAL_USER = [{x: 137, y: 284}, {x: 105, y: 387}];
var GOAL_OPPONENT = [{x: 1221, y: 284}, {x: 1252, y: 387}];

var OTHER_COLLISION = [{x: 107, y: 387, radius: 5}, {x: 138, y: 284, radius: 5}, {x: 1220, y: 284, radius: 5}, {x: 1251, y: 387, radius: 5}];

var TIME_RESET_BALL;
var REGULAR_MATCH_TIME;
var EXTENDED_MATCH_TIME;
var OPPONENT_SPEEDS;
var CHARACTER_SPEED;
var OPPONENT_DISTANCE_PROTECTION;
var OPPONENT_DISTANCE_PROTECTION_WHEN_SHOT;
var OPPONENT_DISTANCE_PROTECTION_AGG;
var OPPONENT_DISTANCE_PROTECTION_WHEN_SHOT_AGG;
var REACT_OPP_FOR_HEEL_SHOOT;
var BALL_VELOCITY_X_REACTION;
var BALL_VELOCITY_X_REACTION_ATTACK;
var BALL_AND_CHARACTER_DISTANCE_PROTECTION;
var TIME_REACTION_FROM_SAVE_TO_GO;
var TIME_OPP_BECOME_AGGRESSIVE;
var TIME_AFTER_REACTION;
var TIME_INTERVAL_SHOOT;
var TIME_IN_PROTECT_STATE;
var SCORE_PLAYER_GOAL;
var SCORE_OPPONENT_GOAL;
var SCORE_WIN;
var SCORE_TIE;
var NUM_LEVEL_FOR_ADS;

var ENABLE_FULLSCREEN;
var ENABLE_CHECK_ORIENTATION;