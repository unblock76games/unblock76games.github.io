var BRIDGE_SQUARE = 6;
var HOUSE_SQUARE = 19;
var WELL_SQUARE = 31;
var MAZE_SQUARE = 42;
var PRISON_SQUARE = 52;
var SKULL_SQUARE = 58;
var END_SQUARE = 63;

// THESE SQUARES (GOOSE OR BRIDGE) WILL MAKE THE PLAYER ADVANCE AGAIN OF THE SAME POINTS
var REPEAT_SQUARES = [5,BRIDGE_SQUARE,9,14,18,23,27,32,36,41,45,50,54,59];

// PERCENTAGE OF ACCEPTING THE DICE LAUNCH (FOR FIRST LAUNCH)
var DICE_RETRY_VAR = 30;

// This array includes the coordinates of the squares
var BOARD_SQUARES;
BOARD_SQUARES = [ [ 450, 520 ], // 0: START
                  [ 525, 520 ],
                  [ 565, 520 ],
                  [ 607, 520 ],
                  [ 648, 520 ],
                  [ 692, 520 ], // 5: GOOSE
                  [ 740, 520 ], // 6: BRIDGE
                  [ 785, 520 ],
                  [ 825, 517 ],
                  [ 875, 500 ], // 9: GOOSE
                  [ 915, 470 ], // 10
                  [ 945, 440 ],
                  [ 962, 400 ],
                  [ 972, 357 ],
                  [ 975, 310 ], // 14: GOOSE
                  [ 970, 265 ], // 15
                  [ 953, 225 ],
                  [ 925, 190 ],
                  [ 890, 150 ], // 18: GOOSE
                  [ 835, 130 ], // 19: HOUSE
                  [ 770, 120 ], // 20
                  [ 730, 120 ],
                  [ 692, 120 ],
                  [ 648, 120 ], // 23: GOOSE
                  [ 602, 120 ],
                  [ 562, 120 ], // 25
                  [ 520, 125 ],
                  [ 475, 140 ], // 27: GOOSE
                  [ 440, 165 ],
                  [ 415, 195 ],
                  [ 400, 230 ], // 30
                  [ 390, 270 ], // 31: WELL
                  [ 395, 320 ], // 32: GOOSE
                  [ 405, 355 ],
                  [ 425, 390 ],
                  [ 455, 415 ], // 35
                  [ 490, 435 ], // 36: GOOSE
                  [ 525, 445 ],
                  [ 565, 445 ],
                  [ 607, 445 ],
                  [ 648, 445 ], // 40
                  [ 692, 445 ], // 41: GOOSE
                  [ 740, 445 ], // 42: MAZE
                  [ 785, 445 ],
                  [ 820, 440 ],
                  [ 860, 415 ], // 45: GOOSE
                  [ 890, 375 ],
                  [ 900, 335 ],
                  [ 900, 300 ],
                  [ 890, 260 ],
                  [ 860, 220 ], // 50: GOOSE
                  [ 815, 195 ],
                  [ 760, 190 ], // 52: PRISON
                  [ 695, 190 ],
                  [ 650, 190 ], // 54: GOOSE
                  [ 605, 190 ], // 55
                  [ 560, 190 ],
                  [ 520, 200 ],
                  [ 475, 230 ], // 58: SKULL
                  [ 460, 295 ], // 59: GOOSE
                  [ 475, 335 ], // 60
                  [ 500, 355 ],
                  [ 530, 370 ],
                  [ 570, 375 ] ]; // 63: ARRIVAL

// These angles will be used to rotate the logic rectangle in each square,
// to be used to move the players in case they're on the same square
var ANGLE_SQUARE = [   0,                      //  0
                        0,   0,   0,   0,   0,  //  1 - 5
                        0, -10, -12, -30, -45,  //  6 - 10
                      -50, -70, -80, -90,-110,  // 11 - 15
                     -120,-130,  30,  20,   0,  // 16 - 20
                        0,   0,   0,   0,   0,  // 21 - 25
                      -10, -25, -40, -50, -70,  // 26 - 30
                       90,  80,  70,  60,  45,  // 31 - 35
                       25,   0,   0,   0,   0,  // 36 - 40
                        0,   0,   0, -10, -25,  // 41 - 45
                      -70,  90,  90,  60,  45,  // 46 - 50
                       25,   0,   0,   0,   0,  // 51 - 55
                        0, -20, -40,  90,  45,  // 56 - 60
                       30,  15,   0];           // 61 - 63


// Zero Square positions: to set the players position in better viewon square 0
var aColumn = [450, 420, 390];
var aRow = [490, 520];
var ZERO_SQUARE_POSITIONS = [ [aColumn[0], aRow[0]], 
                              [aColumn[0], aRow[1]],
                              [aColumn[1], aRow[0]],
                              [aColumn[1], aRow[1]],
                              [aColumn[2], aRow[0]],
                              [aColumn[2], aRow[1]] ];
