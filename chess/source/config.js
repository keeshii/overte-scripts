"use strict";

(function (global) {

  global.BOARD_SIZE = 64;
  global.BUTTON_SIZE = 0.15;
  global.BUTTON_MARGIN = 0.01;
  global.MESSAGE_DURATION = 3; // 3 seconds
  global.CLICK_THROTTLE = 300;

  global.MESSAGE = {
    START_GAME: 'Start Game',
    CLEAR_BOARD: 'Clear Board',
    WHITE_MOVES: 'White moves',
    BLACK_MOVES: 'Black moves',
    WHITE_WINS: 'White wins',
    BLACK_WINS: 'Black wins'
  };

  global.COLOR_LIGHT = {red: 234, green: 237, blue: 237};
  global.COLOR_DARK = {red: 49, green: 49, blue: 49};

  global.CHANNEL_NAME = "com.github.keeshii.chess";
  global.BASE_URL = Script.resolvePath("..");
  global.PIECE_SCRIPT_URL = global.BASE_URL + '/source/chess-piece.js';
  global.SQUARE_SIZE = 0.04;
  global.SQUARE_HEIGHT = 0.01;
  global.COLOR_HIGHTLIGHT = {red: 75, green: 173, blue: 209};
  global.COLOR_WHITE = {red: 196, green: 163, blue: 134};
  global.COLOR_BLACK = {red: 80, green: 54, blue: 34};

  global.PIECE = {
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

  var PIECE_NAMES = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
  var PIECE_SUFFIX = ['_lt', '_dk'];

  global.getPieceAssetName = function (value) {
    var suffix = PIECE_SUFFIX[value >> 3] || '';
    var name = PIECE_NAMES[(value & 0x07) - 1] || '';
    return name + suffix;
  }

  global.CLIENT_ONLY = location.protocol.match(/^file|https?$/);

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
