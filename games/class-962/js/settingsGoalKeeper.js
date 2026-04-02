var NUM_SAVE       = 8;

var GOALKEEPER_X_POSITION = CANVAS_WIDTH/2;
var GOALKEEPER_Y_POSITION = 390;

var GOALKEEPER_WIDTH  = 91;
var GOALKEEPER_HEIGHT = 122;

var CENTER_INFO      = {action: "center",      width: 91,  height: 122 ,x: CANVAS_WIDTH/2, y: 420, frames: 4 }; 
var CENTER_HIGH_INFO = {action: "center_high", width: 106, height: 163 ,x: CANVAS_WIDTH/2, y: 420, frames: 9}; 
var DOWN_LEFT_INFO   = {action: "down_left",   width: 185, height: 118 ,x: CANVAS_WIDTH/2-45, y: 420, frames: 16}; 
var DOWN_RIGHT_INFO  = {action: "down_right",  width: 185, height: 118 ,x: CANVAS_WIDTH/2+45, y: 420, frames: 17}; 
var HIGH_LEFT_INFO   = {action: "high_left",   width: 295, height: 163 ,x: CANVAS_WIDTH/2-100, y: 420, frames: 17}; 
var HIGH_RIGHT_INFO  = {action: "high_right",  width: 275, height: 163 ,x: CANVAS_WIDTH/2+90, y: 420, frames: 17}; 
var MED_LEFT_INFO    = {action: "med_left",    width: 229, height: 113 ,x: CANVAS_WIDTH/2-65, y: 420, frames: 16}; 
var MED_RIGHT_INFO   = {action: "med_right",   width: 229, height: 118 ,x: CANVAS_WIDTH/2+65 ,y: 420, frames: 16}; 

var CENTER       = 0;
var CENTER_HIGH  = 1;
var DOWN_LEFT    = 2;
var DOWN_RIGHT   = 3;
var HIGH_LEFT    = 4;
var HIGH_RIGHT   = 5;
var MED_LEFT     = 6;
var MED_RIGHT    = 7;
var OUT          = 8;
