"use strict";

(function (global) {

  global.CHESS_SIZE = 64;
  global.CHANNEL_NAME = "com.github.keeshii.chess";
  global.BASE_URL = Script.resolvePath("..");
  global.PIECE_SCRIPT_URL = global.BASE_URL + '/source/chess-piece.js';
  global.SQUARE_SIZE = 0.04;
  global.SQUARE_HEIGHT = 0.01;

  global.COLOR_HIGHTLIGHT = {red: 75, green: 173, blue: 209};
  global.COLOR_SQUARE_LIGHT = {red: 196, green: 163, blue: 134};
  global.COLOR_SQUARE_DARK = {red: 80, green: 54, blue: 34};
  global.COLOR_LIGHT = {red: 234, green: 237, blue: 237};
  global.COLOR_DARK = {red: 49, green: 49, blue: 49};

  global.PIECES = {
    NONE: 0, //Must be zero
    PAWN: 1,
    ROOK: 2,
    KNIGHT: 3,
    BISHOP: 4,
    QUEEN: 5,
    KING: 6
  };

  global.PLAYERS = {
    WHITE: 0,
    BLACK: 8
  };

  global.PIECE_SIZES = [
    {x: 0.011, y: 0.025, z: 0.011},
    {x: 0.015, y: 0.030, z: 0.015},
    {x: 0.014, y: 0.033, z: 0.014},
    {x: 0.014, y: 0.040, z: 0.014},
    {x: 0.017, y: 0.048, z: 0.017},
    {x: 0.018, y: 0.059, z: 0.018}
  ];

  var PIECE_NAMES = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
  var PIECE_SUFFIX = ['_lt', '_dk'];

  global.getPieceAssetName = function (value) {
    var suffix = PIECE_SUFFIX[value >> 3] || '';
    var name = PIECE_NAMES[(value & 0x07) - 1] || '';
    return name + suffix;
  };

  global.CLIENT_SIDE_ONLY = typeof location !== 'undefined' ? !!location.protocol.match(/^file|https?$/) : false;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));