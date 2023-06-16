"use strict";

/* global
    Sudoku, SudokuServer, SudokuOverlay, SoundPlayer, CLIENT_SIDE_ONLY, HMD,
    BUTTON_NEW_GAME, BUTTON_HINT, BUTTON_START, EMPTY
 */

((typeof module !== 'undefined' ? module : {}).exports = function () {

  Script.include([
    './config.js',
    './sudoku.js',
    './sudoku-overlay.js',
    './sudoku-server-class.js',
    './sound-player.js'
  ]);

  var CLICK_THROTTLE = 300;
  var MESSAGE_SOLVED = 'Sudoku Solved';
  var MESSAGE_NO_SOLUTION = 'No solution';

  function SudokuClient() {
    this.index = '-1';
    this.entityId = '';
    this.server = null;
    this.mousePressOnEntityFn = null;
    this.lastClickTime = 0;

    this.remotelyCallable = [
      'showDigitOverlay',
      'showSolved',
      'giveHint'
    ];
  }

  SudokuClient.prototype.preload = function (entityId) {
    var self = this;

    this.mousePressOnEntityFn = function (id, event) {
      self.onMousePress(id, event);
    };

    if (CLIENT_SIDE_ONLY) {
      this.server = new SudokuServer();
      this.server.client = self;
      this.server.preload(entityId);
    }

    this.entityId = entityId;

    this.sudoku = new Sudoku();
    this.overlay = new SudokuOverlay(this);
    this.soundPlayer = new SoundPlayer();

    Entities.mousePressOnEntity.connect(this.mousePressOnEntityFn);
  };

  SudokuClient.prototype.unload = function () {
    if (this.mousePressOnEntityFn) {
      Entities.mousePressOnEntity.disconnect(this.mousePressOnEntityFn);
      this.mousePressOnEntityFn = null;
    }
    this.overlay.close();

    if (CLIENT_SIDE_ONLY) {
      this.server.unload();
    }
  };

  SudokuClient.prototype.showNoSolutions = function() {
    var COLOR_RED = { red: 196, green: 26, blue: 0 };
    this.overlay.showTextMessage(MESSAGE_NO_SOLUTION, COLOR_RED);
    this.soundPlayer.playLocal(SoundPlayer.ERROR_SOUND);
  };

  SudokuClient.prototype.showSolved = function() {
    var COLOR_GREEN = { red: 4, green: 202, blue: 4 };
    this.overlay.showTextMessage(MESSAGE_SOLVED, COLOR_GREEN);
    // success sound played by the domain-server
  };

  SudokuClient.prototype.giveHint = function (_id, params) {
    var result, state, i, index, value, empty = [];

    state = params[0];
    for (i = 0; i < state.length; i++) {
      if (state[i] === EMPTY) {
        empty.push(i);
      }
    }

    if (empty.length === 0) {
      return;
    }

    i = Math.floor(Math.random() * empty.length);
    result = this.sudoku.solve(state);

    if (!result.solution) {
      this.showNoSolutions();
      return;
    }

    index = empty[i];
    value = result.solution[empty[i]];
    this.callServer('setDigit', [index, value]);
  };

  SudokuClient.prototype.showDigitOverlay = function(_id, params) {
    var candidates = params[0];
    this.overlay.showDigitOverlay(candidates);
  };

  SudokuClient.prototype.callServer = function (methodName, params) {
    params.unshift(MyAvatar.sessionUUID);

    if (this.server) {
      this.server[methodName](this.entityId, params);
      return;
    }

    Entities.callEntityServerMethod(this.entityId, methodName, params);
  };

  SudokuClient.prototype.onMousePress = function (entityId, event) {
    var properties, parentId, name;
    var match, value, state, clickTime;

    if (event.button !== 'Primary') {
      return;
    }

    properties = Entities.getEntityProperties(entityId, ["name", "text", "parentID"]);
    parentId = properties.parentID;
    name = properties.name;
    clickTime = Date.now();

    if (parentId !== this.entityId && parentId !== this.overlay.entityId) {
      return;
    }

    // Prevents clicks on the board right after closing the overlay
    if (HMD.active && this.lastClickTime + CLICK_THROTTLE > clickTime) {
      return;
    }

    if (name === 'Text.Cancel') {
      this.lastClickTime = clickTime;
      this.overlay.close();
      this.index = '-1';
      return;
    }

    match = name.match(/^Text.Digit\[(\d+)\]$/);
    if (match !== null) {
      this.lastClickTime = clickTime;
      this.overlay.close();
      this.index = match[1];
      this.callServer('clickDigit', [this.index]);
      return;
    }

    match = name.match(/^Text.SetDigit\[(\d+)\]$/);
    if (match !== null) {
      value = match[1] === '0' ? EMPTY : match[1];
      if (value !== EMPTY && this.overlay.candidates.indexOf(value) === -1) {
        return; // disabled button, ignore
      }
      this.callServer('setDigit', [this.index, value]);
      this.lastClickTime = clickTime;
      this.overlay.close();
      this.index = '-1';
      return;
    }

    match = name.match(/^Text.NewGame\[(\d+)\]$/);
    if (match !== null) {
      this.lastClickTime = clickTime;
      this.overlay.close();
      value = parseInt(match[1], 10);
      state = value ? this.sudoku.generate(value) : '';
      this.index = '-1';
      this.callServer('startNewGame', [state]);
      return;
    }

    if (name === 'Text.Hint' || name === 'Text.NewGame') {
      switch (properties.text) {
        case BUTTON_NEW_GAME:
          this.overlay.showNewGameOverlay();
          break;
        case BUTTON_HINT:
          this.callServer('clickHint', []);
          break;
        case BUTTON_START:
          this.callServer('clickStart', []);
          break;
      }
    }
  };

  return new SudokuClient();

});
