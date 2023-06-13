"use strict";

/* global
    Sudoku, SudokuServer, SudokuOverlay, SoundCache, Audio, CLIENT_SIDE_ONLY,
    HMD, SUCCESS_SOUND, ERROR_SOUND, CLICK_SOUND, MESSAGE_SOLVED, MESSAGE_CLICK,
    MESSAGE_NO_SOLUTION, BUTTON_NEW_GAME, BUTTON_HINT, BUTTON_START, EMPTY
 */

((typeof module !== 'undefined' ? module : {}).exports = function () {

  Script.include([
    './config.js',
    './sudoku.js',
    './sudoku-overlay.js',
    './sudoku-server-class.js'
  ]);

  var CLICK_THROTTLE = 300;

  function SudokuClient() {
    this.sudoku = new Sudoku();
    this.index = '-1';
    this.entityId = '';
    this.server = null;
    this.mousePressOnEntityFn = null;
    this.lastClickTime = 0;
    this.successSound = null;
    this.errorSound = null;
    this.clickSound = null;

    this.remotelyCallable = [
      'showDigitOverlay',
      'showMessage'
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
    this.overlay = new SudokuOverlay(this);
    this.successSound = SoundCache.getSound(SUCCESS_SOUND);
    this.errorSound = SoundCache.getSound(ERROR_SOUND);
    this.clickSound = SoundCache.getSound(CLICK_SOUND);

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

  SudokuClient.prototype.showMessage = function(_id, params) {
    var COLOR_GREEN = { red: 4, green: 202, blue: 4 };
    var COLOR_RED = { red: 196, green: 26, blue: 0 };
    var injectorOptions, sound;
    var message = params[0];

    switch (message) {
      case MESSAGE_SOLVED:
        this.overlay.showTextMessage(message, COLOR_GREEN);
        sound = this.successSound;
        break;
      case MESSAGE_NO_SOLUTION:
        this.overlay.showTextMessage(message, COLOR_RED);
        sound = this.errorSound;
        break;
      case MESSAGE_CLICK:
        sound = this.clickSound;
        break;
    }

    if (sound) {
      injectorOptions = {
        position: MyAvatar.position,
        volume: 0.1,
        localOnly: true
      };
      Audio.playSound(sound, injectorOptions);    
    }
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
          this.callServer('hint', []);
          break;
        case BUTTON_START:
          this.callServer('start', []);
          break;
      }
    }
  };

  return new SudokuClient();

});
