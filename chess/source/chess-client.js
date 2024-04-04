"use strict";

/* global Entities, MyAvatar, Script, Vec3, Messages, COLOR_LIGHT, COLOR_DARK,
 * PLAYERS, CLIENT_ONLY, PLAYERS */

((typeof module !== 'undefined' ? module : {}).exports = function () {

  Script.include([
    './chess-overlay.js',
    './chess-board.js',
    './chess.js',
    './config.js'
  ]);

  function ChessClient() {
    this.entityId = '';
    this.server = CLIENT_ONLY ? Script.require('./chess-server.js')() : null;
    this.overlay = new ChessOverlay();
    this.mousePressOnEntityFn = null;
    this.lastClickTime = 0;

    this.remotelyCallable = [
      'showPromotionOverlay',
      'showTextMessage',
      'callMethod'
    ];
  }

  ChessClient.prototype.callServer = function (methodName, params) {
    params.unshift(MyAvatar.sessionUUID);
    if (this.server) {
      this.server[methodName](this.server, params);
      return;
    }
    Entities.callEntityServerMethod(this.entityId, methodName, params);
  };

  ChessClient.prototype.callMethod = function (_id, params) {
    var methodName = params.shift();
    this.callServer(methodName, params);
  };

  ChessClient.prototype.onMousePress = function (entityId, event) {
    var properties, parentId, name;
    var match, index, clickTime;

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

    match = name.match(/^Quad.ChessSquare\[(\d+)\]$/);
    if (match !== null) {
      index = parseInt(match[1], 10);
      this.lastClickTime = clickTime;
      this.callServer('onSquareClick', [index]);
      return;
    }

    match = name.match(/^Model.ChessPiece\[(\d+)\]$/);
    if (match !== null) {
      index = parseInt(match[1], 10);
      this.lastClickTime = clickTime;
      this.callServer('onSquareClick', [index]);
      return;
    }

    match = name.match(/^Image.ChessPromotion\[(\d+)\]$/);
    if (match !== null) {
      index = parseInt(match[1], 10);
      this.overlay.close();
      this.lastClickTime = clickTime;
      this.callServer('promote', [index]);
      return;
    }

    if (name.match(/^Text.ChessButton/)) {
      this.lastClickTime = clickTime;
      this.callServer('onButtonClick', []);
      return;
    }

    if (name === 'Text.Cancel') {
      this.lastClickTime = clickTime;
      this.overlay.close();
    }
  };

  ChessClient.prototype.preload = function (entityId) {
    var self = this;

    if (this.server) {
      this.server.client = this;
      this.server.preload(entityId);
    }

    this.mousePressOnEntityFn = function (id, event) {
      self.onMousePress(id, event);
    };

    this.entityId = entityId;
    Entities.mousePressOnEntity.connect(this.mousePressOnEntityFn);
  };

  ChessClient.prototype.unload = function () {
    if (this.server) {
      this.server.unload();
    }

    if (this.mousePressOnEntityFn) {
      Entities.mousePressOnEntity.disconnect(this.mousePressOnEntityFn);
      this.mousePressOnEntityFn = null;
    }
  };

  ChessClient.prototype.showPromotionOverlay = function (_id, params) {
    var activePlayer = params[0];
    this.overlay.showPromotion(activePlayer);
  };

  ChessClient.prototype.showTextMessage = function (_id, params) {
    var color = params[0] === PLAYERS.WHITE ? COLOR_LIGHT : COLOR_DARK;
    var text = params[1];
    this.overlay.showTextMessage(text, color);
  };

  return new ChessClient();
});
