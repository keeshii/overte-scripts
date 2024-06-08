"use strict";

/* global SQUARE_SIZE, COLOR_SQUARE_DARK, COLOR_SQUARE_LIGHT, BASE_URL, CHESS_SIZE,
 COLOR_HIGHTLIGHT, SQUARE_HEIGHT, PIECE_SCRIPT_URL, PIECE_SIZES, GRABBABLE_ENABLED,
 getPieceAssetName */

(function (global) {

  Script.include('./config.js');

  function ChessBoard() {
    this.entityId = '';
    this.state = [];
    this.highlightedIndex = -1;
    this.squareIds = [];
    this.buttonId = '';
    this.messageId = '';
    this.pieces = [];
  }

  ChessBoard.prototype.getX = function (index) {
    var x = index % 8;
    return (x - 3.5) * SQUARE_SIZE;
  };

  ChessBoard.prototype.getY = function (index) {
    var y = Math.floor(index / 8);
    return (y - 3.5) * SQUARE_SIZE;
  };

  ChessBoard.prototype.getColor = function (index) {
    var x = index % 8;
    var y = Math.floor(index / 8);
    return ((x + y) % 2) ? COLOR_SQUARE_DARK : COLOR_SQUARE_LIGHT;
  };

  ChessBoard.prototype.getSize = function (value) {
    return PIECE_SIZES[(value - 1) % 8];
  };

  ChessBoard.prototype.getPieceModelUrl = function (value) {
    return BASE_URL + '/models/' + getPieceAssetName(value) + '.glb';
  };

  ChessBoard.prototype.findEntities = function () {
    var i, match, entity;
    var position = Entities.getEntityProperties(this.entityId, ['position']).position;
    var ids = Entities.findEntities(position, 50);
    var entities = [];

    for (i = 0; i < ids.length; i++) {
      entities.push(Entities.getEntityProperties(ids[i], ['parentID', 'name']));
    }

    this.squareIds.length = 0;
    this.pieces.length = 0;
    for (i = 0; i < ids.length; i++) {
      entity = entities[i];
      if (entity.parentID !== this.entityId) {
        continue;
      }
      match = entity.name.match(/^Quad.ChessSquare\[(\d+)\]$/);
      if (match !== null) {
        this.squareIds.push(ids[i]);
      }
      match = entity.name.match(/^Model.ChessPiece\[(\d+)\]$/);
      if (match !== null) {
        this.pieces.push({entityId: ids[i], value: 0, index: parseInt(match[1], 10)});
      }
      match = entity.name.match(/^Text.ChessButton/);
      if (match !== null) {
        this.buttonId = ids[i];
      }
      match = entity.name.match(/^Text.ChessMessage/);
      if (match !== null) {
        this.messageId = ids[i];
      }
    }
  };

  ChessBoard.prototype.createBoard = function () {
    var i, entityId;

    this.findEntities();
    this.destroyBoard();

    this.squareIds = [];
    for (i = 0; i < CHESS_SIZE; i++) {
      entityId = Entities.addEntity({
        type: 'Box',
        shape: 'Cube',
        name: 'Quad.ChessSquare[' + i + ']',
        parentID: this.entityId,
        dimensions: {x: SQUARE_SIZE, y: 0.001, z: SQUARE_SIZE},
        color: this.getColor(i),
        localPosition: {
          x: this.getX(i),
          y: SQUARE_HEIGHT,
          z: this.getY(i)
        },
        userData: GRABBABLE_ENABLED
          ? '{"grabbableKey": {"grabbable": true, "triggerable": true}}'
          : '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
      });
      this.squareIds.push(entityId);
    }

    this.state = [];
    for (i = 0; i < CHESS_SIZE; i++) {
      this.state.push(0);
    }
  };

  ChessBoard.prototype.destroyBoard = function () {
    var i;
    for (i = 0; i < this.squareIds.length; i++) {
      if (this.squareIds[i]) {
        Entities.deleteEntity(this.squareIds[i]);
      }
    }
    for (i = 0; i < this.pieces.length; i++) {
      Entities.deleteEntity(this.pieces[i].entityId);
    }
    this.squareIds = [];
    this.pieces = [];
  };

  ChessBoard.prototype.updateState = function (state) {
    var i;
    for (i = 0; i < CHESS_SIZE; i++) {
      this.setPiece(i, state[i]);
    }
  };

  ChessBoard.prototype.setButtonText = function (text) {
    if (!this.buttonId) {
      return;
    }
    Entities.editEntity(this.buttonId, {text: text});
  };

  ChessBoard.prototype.setMessageText = function (text) {
    if (!this.messageId) {
      return;
    }
    Entities.editEntity(this.messageId, {text: text});
  };

  ChessBoard.prototype.setHighlight = function (index) {
    var id = this.squareIds[index];

    if (!id || this.highlightedIndex === index) {
      return;
    }

    if (this.highlightedIndex !== -1) {
      this.clearHighlight();
    }

    Entities.editEntity(id, {color: COLOR_HIGHTLIGHT});
    this.highlightedIndex = index;
  };

  ChessBoard.prototype.clearHighlight = function () {
    var id, color;
    if (this.highlightedIndex === -1) {
      return;
    }

    id = this.squareIds[this.highlightedIndex];
    if (!id) {
      return;
    }

    color = this.getColor(this.highlightedIndex);
    Entities.editEntity(id, {color: color});
    this.highlightedIndex = -1;
  };

  ChessBoard.prototype.findPiece = function (arr, value, index) {
    var i;
    for (i = 0; i < arr.length; i++) {
      if (index >= 0 && arr[i].index !== index) {
        continue;
      }
      if (value === arr[i].value) {
        return i;
      }
    }
    return -1;
  };

  ChessBoard.prototype.updateState = function (state) {
    var i, index, pieces, entityId;
    state = state.slice();
    pieces = this.pieces.slice();
    this.pieces.length = 0;

    // Matching pieces, no change needed
    for (i = 0; i < CHESS_SIZE; i++) {
      if (state[i] !== 0) {
        index = this.findPiece(pieces, state[i], i);
        if (index !== -1) {
          this.pieces.push(pieces[index]);
          pieces.splice(index, 1);
          state[i] = 0;
        }
      }
    }

    // Move pieces to new position
    for (i = 0; i < CHESS_SIZE; i++) {
      if (state[i] !== 0) {
        index = this.findPiece(pieces, state[i], -1);
        if (index !== -1) {
          Entities.editEntity(pieces[index].entityId, {
            name: 'Model.ChessPiece[' + i + ']',
            dimensions: this.getSize(state[i]),
            localRotation: {x: 0, y: 0, z: 0, w: 1},
            localPosition: {
              x: this.getX(i),
              y: SQUARE_HEIGHT,
              z: this.getY(i)
            }
          });
          pieces[index].index = i;
          this.pieces.push(pieces[index]);
          pieces.splice(index, 1);
          state[i] = 0;
        }
      }
    }

    // Delete pieces, which are not used anymore
    for (i = 0; i < pieces.length; i++) {
      Entities.deleteEntity(pieces[i].entityId);
    }

    // Add missing pieces
    for (i = 0; i < CHESS_SIZE; i++) {
      if (state[i] !== 0) {
        entityId = Entities.addEntity({
          type: 'Model',
          modelURL: this.getPieceModelUrl(state[i]),
          name: 'Model.ChessPiece[' + i + ']',
          parentID: this.entityId,
          useOriginalPivot: true,
          dimensions: this.getSize(state[i]),
          localPosition: {
            x: this.getX(i),
            y: SQUARE_HEIGHT,
            z: this.getY(i)
          },
          script: PIECE_SCRIPT_URL,
          userData: '{"grabbableKey": {"grabbable": true, "triggerable": true}}'
        });
        this.pieces.push({
          entityId: entityId,
          index: i,
          value: state[i]
        });
      }
    }
  };

  ChessBoard.prototype.resetPiecePosition = function (index) {
    var i;
    for (i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i].index === index) {
        Entities.editEntity(this.pieces[i].entityId, {
          dimensions: this.getSize(this.pieces[i].value),
          localRotation: {x: 0, y: 0, z: 0, w: 1},
          localPosition: {
            x: this.getX(index),
            y: SQUARE_HEIGHT,
            z: this.getY(index)
          }
        });
        return;
      }
    }
  };

  global.ChessBoard = ChessBoard;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
