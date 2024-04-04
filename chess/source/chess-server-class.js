"use strict";

/* global Entities, MyAvatar, Script, Vec3, Messages, PLAYERS, MESSAGE, CHANNEL_NAME */

(function (global) {

  Script.include([
    './chess.js',
    './chess-board.js',
    './config.js'
  ]);

  var MESSAGE = {
    START_GAME: 'Start Game',
    CLEAR_BOARD: 'Clear Board',
    WHITE_MOVES: 'White moves',
    BLACK_MOVES: 'Black moves',
    WHITE_WINS: 'White wins',
    BLACK_WINS: 'Black wins'
  };

  function ChessServer() {
    var self = this;
    this.chess = new Chess();
    this.board = new ChessBoard();
    this.client = null;
    this.gameOver = true;
    this.isClickEnabled = true;
    this.isGrabEnabled = true;

    this.onMessageReceivedFn = function (channelName, message, sender) {
      self.onMessageReceived(channelName, message, sender);
    };

    this.remotelyCallable = [
      'onSquareClick',
      'onButtonClick',
      'promote',
      'submitMove',
      'setEnabled',
      'resetPiecePosition'
    ];
  }

  ChessServer.prototype.callClient = function (sessionId, methodName, params) {
    if (this.client) {
      this.client[methodName]('', params);
    }
    Entities.callEntityClientMethod(sessionId, this.board.entityId, methodName, params);
  };

  ChessServer.prototype.resetPiecePosition = function (_id, params) {
    var index = parseInt(params[1], 10);
    this.board.resetPiecePosition(index);
  };

  ChessServer.prototype.submitMove = function (_id, params) {
    var sessionId = params[0];
    var fromIndex = parseInt(params[1], 10);
    var toIndex = parseInt(params[2], 10);
    var promotion = parseInt(params[3], 10);
    var isClickEnabled = this.isClickEnabled;

    if (this.chess.gameOver || !this.isGrabEnabled) {
      return;
    }

    if (this.chess.pendingPromotion !== -1) {
      return;
    }

    // Deselect piece (if selected)
    if (this.chess.selected !== fromIndex) {
      this.chess.selected = fromIndex;
    }
    this.isClickEnabled = true;
    this.onSquareClick(_id, [sessionId, toIndex, promotion]);
    this.isClickEnabled = isClickEnabled;
  };

  ChessServer.prototype.setEnabled = function (_id, params) {
    var isClickEnabled = String(params[1]) === 'false' ? false : true;
    var isGrabEnabled = String(params[2]) === 'false' ? false : true;
    this.isClickEnabled = isClickEnabled;
    this.isGrabEnabled = isGrabEnabled;
  };

  ChessServer.prototype.onButtonClick = function (_id, params) {
    if (this.gameOver) {
      this.gameOver = false;
      this.isClickEnabled = true;
      this.board.setButtonText(MESSAGE.CLEAR_BOARD);
      this.chess.startNewGame();
      return;
    }

    this.gameOver = true;
    this.isClickEnabled = true;
    this.board.setButtonText(MESSAGE.START_GAME);
    this.chess.clearBoard();
  };

  ChessServer.prototype.onSquareClick = function (_id, params) {
    var sessionId = params[0];
    var index = parseInt(params[1], 10);
    var promotion = parseInt(params[2], 10);
    var player = this.chess.activePlayer;

    if (!this.isClickEnabled) {
      return;
    }

    var error = this.chess.clickSquare(index);

    if (error === 'GAME_OVER') {
      if (this.chess.winner === PLAYERS.WHITE) {
        this.callClient(sessionId, 'showTextMessage', [this.chess.winner, 'White wins']);
      } else if (this.chess.winner === PLAYERS.BLACK) {
        this.callClient(sessionId, 'showTextMessage', [this.chess.winner, 'Black wins']);
      }
      return;
    }

    if (error === 'SHOW_PROMOTION') {
      if (promotion > 0) {
        this.promote(_id, [params[0], promotion]);
      } else {
        this.callClient(sessionId, 'showPromotionOverlay', [player]);
      }
    }
  };

  ChessServer.prototype.promote = function (_id, params) {
    var value = parseInt(params[1], 10);
    this.chess.promote(value);
  };

  ChessServer.prototype.updateMessage = function () {
    if (this.chess.gameOver) {
      switch (this.chess.winner) {
        case PLAYERS.WHITE:
          this.board.setMessageText(MESSAGE.WHITE_WINS);
          break;
        case PLAYERS.BLACK:
          this.board.setMessageText(MESSAGE.BLACK_WINS);
          break;
        default:
          this.board.setMessageText('');
          break;
      }
      return;
    }
    switch (this.chess.activePlayer) {
      case PLAYERS.WHITE:
        this.board.setMessageText(MESSAGE.WHITE_MOVES);
        break;
      case PLAYERS.BLACK:
        this.board.setMessageText(MESSAGE.BLACK_MOVES);
        break;
      default:
        this.board.setMessageText('');
        break;
    }
  };

  ChessServer.prototype.sendBoardChangeMessage = function (state) {
    Messages.sendMessage(CHANNEL_NAME, JSON.stringify({
      type: 'boardChange',
      tableId: this.board.entityId,
      lastMove: this.chess.lastMove,
      state: state,
      enPassant: this.chess.enPassant,
      pendingPromotion: this.chess.pendingPromotion,
      activePlayer: this.chess.activePlayer
    }));
  };

  ChessServer.prototype.onMessageReceived = function (channel, message) {
    var json;
    if (channel !== CHANNEL_NAME) {
      return;
    }
    try {
      json = JSON.parse(message);
    } catch (error) {
      return;
    }
    if (json.type === 'findEmptyTable' && this.gameOver) {
      Messages.sendMessage(CHANNEL_NAME, JSON.stringify({
        type: 'findEmptyTableResponse',
        tableId: this.board.entityId
      }));
    }
  };

  ChessServer.prototype.preload = function (entityId) {
    var self = this;

    self.chess.selectionChanged = function (index) {
      if (index >= 0) {
        self.board.setHighlight(index);
      } else {
        self.board.clearHighlight();
      }
    };

    self.chess.stateChanged = function (state) {
      self.board.updateState(state);
      self.updateMessage();
      self.sendBoardChangeMessage(state);
    };

    Messages.subscribe(CHANNEL_NAME);
    Messages.messageReceived.connect(this.onMessageReceivedFn);

    // Wait for the world json to load before initialization
    self.board.entityId = entityId;
    Script.setTimeout(function () {
      self.board.createBoard();
      self.board.setButtonText(MESSAGE.START_GAME);
      self.board.setMessageText('');
      self.chess.clearBoard();
    }, 1500);
  };

  ChessServer.prototype.unload = function () {
    Messages.unsubscribe(CHANNEL_NAME);
    Messages.messageReceived.disconnect(this.onMessageReceivedFn);

    this.board.destroyBoard();
  };

  // ----------------------------

  global.ChessServer = ChessServer;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
