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

  var ASSETS_PATH = Script.resolvePath('../assets');
  global.CLICK_SOUND = ASSETS_PATH + '/108336__qat__click-01-fast.wav';
  global.SUCCESS_SOUND = ASSETS_PATH + '/109662__grunz__success.wav';
  global.ERROR_SOUND = ASSETS_PATH + '/674824__newangelgamer22gamesdeveloper__error-sound.wav';

  global.MESSAGE_CLICK = 'click';
  global.MESSAGE_SOLVED = 'Solved';
  global.MESSAGE_NO_SOLUTION = 'No solution';

  global.CLIENT_SIDE_ONLY = false;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
