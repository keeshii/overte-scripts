"use strict";

(function (global) {

  global.BOX_SIZE = 3;
  global.BOARD_SIZE = 9;
  global.STATE_LENGTH = 9 * 9;
  global.DIGITS = '123456789';
  global.EMPTY = '.';
  global.EMPTY_STATE = Array(global.STATE_LENGTH + 1).join(global.EMPTY);

  global.BUTTON_NEW_GAME = 'New Game';
  global.BUTTON_HINT = 'Hint';
  global.BUTTON_START = 'Start';
  global.DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard', 'Custom'];
  global.DIFFICULTY_VALUES = [50, 40, 30, 0];
  global.DEFAULT_DIFFICULTY = 30;

  global.CLIENT_SIDE_ONLY = location.protocol.match(/^file|https?$/);

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
