var CANVAS_WIDTH = 1280;
var CANVAS_HEIGHT = 768;

var CANVAS_WIDTH_HALF = CANVAS_WIDTH * 0.5;
var CANVAS_HEIGHT_HALF = CANVAS_HEIGHT * 0.5;

var EDGEBOARD_X = 90;
var EDGEBOARD_Y = 95;

var PRIMARY_FONT = "Arial";
var SECONDARY_FONT = "digital";

var FPS = 60;
var FPS_TIME = 1000 / FPS;
var TIME_STEP_WORLD = 1 / FPS;
var DISABLE_SOUND_MOBILE = false;
var MS_FADE_ANIM = 250;

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
var ON_BUT_NO_DOWN = 6;
var ON_BUT_YES_DOWN = 7;

var STATE_INIT = 0;
var STATE_PLAY = 1;
var STATE_FINISH = 2;
var STATE_PAUSE = 3;

var IDLE = 0;
var SERVICE = 1;
var FOREHAND = 2;
var BACKHAND = 3;
var RUN = 4;
var STANCE = 5;
var STRAFE_LEFT = 6;
var STRAFE_RIGHT = 7;
var RUN_REVERSE = 8;

var OPPONENT_SIDE = 0;
var PLAYER_SIDE = 1;

var NAME_TEXT = 0;
var SET_TEXT = 1;
var POINT_TEXT = 0;

var DETECT_FORCE_DIRECTION = 0.06;

var KMH = 1.609344;

var POINT = [0, 15, 30, 40, "-"];

var MAX_SERVICE_ATTEMPT = 1;

var MOVEMENT_SIDE_ANGLE = 0.5;

var SERVICE_FRAME_SHOT = 24;
var FOREHAND_FRAME_SHOT = 17;
var BACKHAND_FRAME_SHOT = 17;

var MIN_DISTANCE_FOR_SHOT_BALL = 75;

var MIN_DISTANCE_MOVE_TO_BALL = 35;

var MS_TIME_FADE_VOL = 500;

var ALLOWED_SET_MATCH = [1, 3, 5];

var OFFSET_RADIANTS_45 = Math.radians(45);

var OFFSET_RADIANTS_90 = Math.radians(90);

var RADIANTS_180 = Math.radians(180);

var FPS_ANIMATION_0 = 0.25;
var FPS_ANIMATION_1 = 0.45;

var SPRITE_NAME_PLAYER = ["player_idle", "player_service", "player_forehand", "player_backhand", "player_run",
    "player_stance", "player_strafe_left", "player_strafe_right"];

var OFFSET_CONTAINER_PLAYER = [{x: 4, y: 0}, {x: 4, y: -3}, {x: 11, y: 11}, {x: -20, y: 15}, {x: 7, y: 6},
    {x: 3, y: 1}, {x: 1, y: 1}, {x: 1, y: 1}];

var SPRITE_NAME_OPPONENT = ["opponent_idle", "opponent_service", "opponent_forehand", "opponent_backhand",
    "opponent_run", "opponent_stance", "opponent_strafe_left", "opponent_strafe_right"];

var OFFSET_CONTAINER_OPPONENT = [{x: 4, y: 0}, {x: 4, y: -3}, {x: 11, y: 11}, {x: 30, y: 25}, {x: 7, y: 6},
    {x: 3, y: 1}, {x: 1, y: 1}, {x: 1, y: 1}];

var ANIMATION_SPRITE_SHEET_SECTION = [{w: 5, h: 3}, {w: 7, h: 6}, {w: 9, h: 6}, {w: 6, h: 5}, {w: 4, h: 3},
    {w: 7, h: 3}, {w: 3, h: 3}, {w: 3, h: 3}];

var CHARACTERS_ANIMATIONS = [{idle: 0, start: [0, 12, "start", FPS_ANIMATION_0], end: 12}, {service: 1, start: [0, 34, "end", FPS_ANIMATION_1], end: 34},
    {forehand: 2, start: [10, 53, "end", FPS_ANIMATION_1], end: 53}, {backhand: 3, start: [10, 29, "end", FPS_ANIMATION_1], end: 29},
    {run: 4, start: [0, 11, "start", FPS_ANIMATION_1], end: 11}, {stance: 5, start: [0, 20, "start", FPS_ANIMATION_1], end: 20},
    {strafe_left: 6, start: [0, 8, "start", FPS_ANIMATION_1], end: 8}, {strafe_right: 7, start: [0, 8, "start", FPS_ANIMATION_1], end: 8},
    {run_reverse: 8, start: {frames: [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0], next: "start", speed: FPS_ANIMATION_1}, end: 0}];

var ANIMATION_PLAYER_SET = {a: STRAFE_LEFT, b: STRAFE_RIGHT, c: RUN, d: RUN_REVERSE};
var ANIMATION_OPPONENT_SET = {a: STRAFE_RIGHT, b: STRAFE_LEFT, c: RUN_REVERSE, d: RUN};

var LEFT_SERVICE = 0;
var RIGHT_SERVICE = 1;

var MS_TIME_AFTER_BALL_OUT = 750;

var MIN_DISTANCE_FOR_SHOT_BALL_PLAYER = 180;

var LEFT = 0;
var RIGHT = 1;

var BALL_DENSITY = 2515;

var DEFAULT_Z_FORCE = 20 * BALL_DENSITY;

var ROLL_BALL_RATE = 60 / FPS;

var FIELD_WIDTH = 850;
var FIELD_HALF_WIDTH = FIELD_WIDTH * 0.5;
var FIELD_OUT_BALL_WIDTH = FIELD_WIDTH * 0.5 + 20;

var FIELD_LENGTH = 2400;
var FIELD_HALF_LENGHT = FIELD_LENGTH * 0.5;

var AI_POINT_SHOT_X = FIELD_HALF_WIDTH - 60;

var BALL_MASS = 0.056 * BALL_DENSITY;

var BALL_RADIUS = 8;

var BALL_LINEAR_DAMPING = 0.2;

var BALL_ANGULAR_DAMPING = 0.5;

var MIN_BALL_VEL_ROTATION = 0.1;

var PLAYER_SCALE_MULTIPLIER = 20;

var OPPONENT_SCALE_MULTIPLIER = 20;

var PLAYER_BUFFER = FPS * 0.5;

var OPPONENT_BUFFER = FPS * 0.5;

var BALL_MAX_VOL_IMPACT = 3500;

var AI_RANGE_HIT = {x: 1 * BALL_DENSITY, y: 1 * BALL_DENSITY, z: 1 * BALL_DENSITY};

var START_BALL_POSITION = [[{x: 270, y: 1199, z: 100}, {x: -270, y: 1199, z: 100}], [{x: -250, y: -1199, z: 100}, {x: 250, y: -1199, z: 100}]]; //OPPONENT_SIDE //PLAYER_SIDE LEFT RIGHT

var START_LAUNCH_IMPULSE_BALL_OPPONENT = {x: 0, y: 0, z: 33 * BALL_DENSITY};

var START_LAUNCH_IMPULSE_BALL_PLAYER = {x: 0, y: 0, z: 37 * BALL_DENSITY};

var SERVICE_IMPULSE_PLAYER_SIDE = [{x: 2, y: 0, z: 0.5}, {x: -2, y: 0, z: 0.5}];

var OFFSET_FORCE_Y_PLAYER = 30;

var SERVICE_POWER_RATE = 62;

var SERVICE_POWER_MIN = 55;

var TO_POS_CHAR_DISTANCE_OFFSET_AXIS = 40;
var TO_POS_CHAR_DISTANCE_OFFSET = 70;

var TO_BALL_CHAR_DISTANCE_OFFSET = 30;

var PROXY_COLLISION_PLAYER = {width: 10, height: 120, depth: 10};

var VOLLEY_SHOOT_Z = PROXY_COLLISION_PLAYER.height * 2;

var PLAYER_POS_3D = [{x: -220, y: -1200, z: PROXY_COLLISION_PLAYER.height}, {x: 220, y: -1200, z: PROXY_COLLISION_PLAYER.height}];

var OPPONENT_POS_3D = [{x: 220, y: 1200, z: PROXY_COLLISION_PLAYER.height}, {x: -220, y: 1200, z: PROXY_COLLISION_PLAYER.height}];

var PLAYER_LIMIT_POS_Y = PLAYER_POS_3D[0].y - 300;

var HIT_BALL_MAX_FORCE = 130;
var HIT_BALL_MIN_FORCE = 5;

var FORCE_RATE = 0.0014;

var FIELD_HEIGHT = 5;

var OFFSET_BALL_FIELD_Z_IMP;

var OFFSET_Z_AI_HEIGHT = PROXY_COLLISION_PLAYER.height - 30;

var MIN_VELOCITY_SPAWN_TRAJECTORY = 1;

var RETURN_POS_CHARACTERS_OPPONENT = {x: 0, y: 1200};
var RETURN_POS_CHARACTERS_PLAYER = {x: 0, y: -1200};

var FORCE_MULTIPLIER_AXIS_PLAYER = {x: 0.2 * BALL_DENSITY, y: 0.1 * BALL_DENSITY, z: 0.35 * BALL_DENSITY};
var FORCE_MULTIPLIER_AXIS_OPPONENT = {x: 0.1 * BALL_DENSITY, y: 0.20 * BALL_DENSITY, z: 0.11 * BALL_DENSITY};//x: 0.1 * BALL_DENSITY, y: 0.22 * BALL_DENSITY, z: 0.1 * BALL_DENSITY

var FORCE_SERVICE_AXIS_OPPONENT = {x: 0.05 * BALL_DENSITY, y: 0.18 * BALL_DENSITY, z: 0.03 * BALL_DENSITY};

var AI_SERVICE_X_RANDOM = 0.03 * BALL_DENSITY;
var AI_SERVICE_Y_RANDOM = 0.05 * BALL_DENSITY;

var FORCE_MAX = 0.5 * BALL_DENSITY;

var MAX_FORCE_Y = 1050;

var MIN_FORCE_Y = 650;

var AI_Y_POINT = FIELD_HALF_LENGHT + 210;

var AI_SAVE_FORCE_Z_MULT = 1.5;

var TIME_POWER_BAR = 1250;

var NET_PROPERTIES = {x: 0, y: 0, z: 63, width: 825, height: 63, depth: 6};

var SHOW_3D_RENDER = false;
var CAMERA_TEST = false;
var START_CAMERA_POSITION = {x: -240, y: -290, z: 280};
var CAMERA_TEST_LOOK_AT = {x: 0, y: -500, z: -100};
var NEAR = 1, FAR = 10000, FOV = 42;

var BALL_SCALE_FACTOR = 1 / FOV;

var CHARACTERS_SCALE_FACTOR = 1 / FOV + 0.8;

var SHADOWN_FACTOR = 1 / FOV - 0.0115;

var BALL_SHADOW_POS = BALL_RADIUS * BALL_RADIUS * BALL_RADIUS;

var HEIGHT_SCALE_SHADOWN_FACTOR = 1 / FOV;

var CANVAS_3D_OPACITY = 0.5;

var POINTS_TO_LOSE;
var START_SCORE;
var OPPONENT_SPEED;
var AI_RANGE_FORCE_X;
var AI_RANGE_FORCE_Y;
var SET_FOR_WIN;
var AI_MAX_Z;
var AI_MIN_Z;


var NUM_LEVEL_FOR_ADS;