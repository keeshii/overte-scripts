"use strict";

/* global
    Sudoku, ScreenRenderer, Settings, SoundPlayer, EMPTY_STATE, EMPTY,
    DEFAULT_DIFFICULTY, DIGITS, STATE_LENGTH
 */

(function (global) {

  Script.include([
    './config.js',
    './sudoku.js',
    './screen-renderer.js',
    './sound-player.js'
  ]);

  function SudokuServer() {
    this.sudoku = new Sudoku();
    this.started = false;
    this.state = EMPTY_STATE;
    this.baseState = EMPTY_STATE;
    this.client = null;

    this.remotelyCallable = [
      'clickDigit',
      'setDigit',
      'startNewGame',
      'clickHint',
      'clickStart'
    ];
  }

  SudokuServer.prototype.preload = function(entityId) {
    var state, server, position;
    
    server = this;
    server.renderer = new ScreenRenderer(entityId);
    server.soundPlayer = new SoundPlayer();

    // Wait for the world json to load before initialization
    Script.setTimeout(function () {
      server.renderer.findEntities();
      server.renderer.init();

      position = server.renderer.position;
      server.soundPlayer.setPosition(position);

      Script.setTimeout(function () {
        if (!server.loadGame()) {
          state = server.sudoku.generate(DEFAULT_DIFFICULTY);
          server.startNewGame('', [null, state]);
        }
      }, 500);
    }, 500);
  };

  SudokuServer.prototype.unload = function() {
    this.renderer.clear();
  };

  SudokuServer.prototype.saveGame = function () {
    var gameState;
    if (Script.context !== 'entity_client') {
      return;
    }
    gameState = {
      state: this.state,
      baseState: this.baseState,
      started: this.started,
      buttonLabel: this.renderer.buttonLabel
    };
    Settings.setValue('overte-sudoku', gameState);
  };

  SudokuServer.prototype.loadGame = function () {
    var gameState;
    if (Script.context !== 'entity_client') {
      return false;
    }
    gameState = Settings.getValue('overte-sudoku', null);
    if (!gameState) {
      return false;
    }
    this.state = gameState.state;
    this.baseState = gameState.baseState;
    this.started = gameState.started;
    this.renderer.setState(this.baseState, this.state);
    this.started = gameState.started;
    this.renderer.setButtonLabel(gameState.buttonLabel);
    return true;
  };

  SudokuServer.prototype.callClient = function(sessionId, methodName, params) {
    if (this.client) {
      this.client[methodName](this.renderer.entityId, params);
      return;
    }
    Entities.callEntityClientMethod(sessionId, this.renderer.entityId, methodName, params);
  };

  SudokuServer.prototype.clickDigit = function (_id, params) {
    var state, candidates, sessionId, index;

    sessionId = params[0];
    index = parseInt(params[1], 10);

    // validate index
    if (index < 0 || index >= STATE_LENGTH) {
      return;
    }

    if (this.started && this.baseState[index] !== EMPTY) {
      return;
    }

    state = this.sudoku.setValue(this.state, index, EMPTY);
    candidates = this.sudoku.getCandidates(state);

    if (candidates === false) {
      return;
    }

    this.callClient(sessionId, 'showDigitOverlay', [candidates[index]]);
  };

  SudokuServer.prototype.setDigit = function (_id, params) {
    var sessionId, index, value, candidates, state;

    sessionId = params[0];
    index = parseInt(params[1], 10);
    value = params[2];

    // validate index
    if (index < 0 || index >= STATE_LENGTH || value.length !== 1) {
      return;
    }

    // validate digit value
    if (DIGITS.indexOf(value) === -1 && value !== EMPTY) {
      return;
    }

    // Not allowed to change the baseState after the game is started
    if (this.started && this.baseState[index] !== EMPTY) {
      return;
    }

    state = this.sudoku.setValue(this.state, index, EMPTY);
    candidates = this.sudoku.getCandidates(state);

    // Not allowed to enter this value
    if (value !== EMPTY && candidates[index].indexOf(value) === -1) {
      return;
    }


    if (!this.started) {
      this.baseState = this.sudoku.setValue(this.baseState, index, value);
      this.state = this.baseState;
      this.renderer.setBaseDigit(index, value);
      this.soundPlayer.play(SoundPlayer.CLICK_SOUND);
      this.saveGame();
      return;
    }

    this.state = this.sudoku.setValue(this.state, index, value);
    this.renderer.setDigit(index, value);
    this.saveGame();

    if (this.state.indexOf(EMPTY) === -1) {
      this.callClient(sessionId, 'showSolved');
      this.soundPlayer.play(SoundPlayer.SUCCESS_SOUND);
    } else {
      this.soundPlayer.play(SoundPlayer.CLICK_SOUND);
    }
  };

  SudokuServer.prototype.startNewGame = function (_id, params) {
    var state, isValid, i;

    state = params[1];

    if (state.length === 0) {
      this.baseState = EMPTY_STATE;
      this.state = EMPTY_STATE;
      this.renderer.setState(EMPTY_STATE, EMPTY_STATE);
      this.renderer.setButtonLabel('Start');
      this.started = false;
      this.saveGame();
      return;
    }

    // Validate state
    if (state.length !== STATE_LENGTH) {
      return;
    }

    // Invalid character
    for (i = 0; i < STATE_LENGTH; i++) {
      if (state[i] !== EMPTY && DIGITS.indexOf(state[i]) === -1) {
        return;
      }
    }

    // Check if the state is valid
    isValid = this.sudoku.validate(state);
    if (!isValid) {
      return;
    }

    this.baseState = state;
    this.state = state;
    this.renderer.setState(state, state);
    this.renderer.setButtonLabel('Hint');
    this.started = true;
    this.saveGame();
  };

  SudokuServer.prototype.clickStart = function () {
    this.renderer.setButtonLabel('Hint');
    this.started = true;
    this.saveGame();
  };

  SudokuServer.prototype.clickHint = function (_id, params) {
    var sessionId = params[0];
    this.callClient(sessionId, 'giveHint', [this.state]);
  };

  global.SudokuServer = SudokuServer;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
