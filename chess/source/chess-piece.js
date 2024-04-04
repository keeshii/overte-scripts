"use strict";

/* global Entities, MyAvatar, Script, Vec3, SQUARE_SIZE, Quat */

((typeof module !== 'undefined' ? module : {}).exports = function () {

  Script.include('./config.js');

  var MAX_DROP_HEIGHT = 0.04;
  var WAIT_FOR_DROP_DELAY = 150;

  function ChessPiece() {
    this.entityId = '';
    this.parentId = '';
    this.boardPosition = null;
    this.boardRotation = null;
    this.name = '';
    this.index = -1;
  }

  ChessPiece.prototype.preload = function (entityId) {
    var properties;

    properties = Entities.getEntityProperties(entityId, ['parentID']);
    this.entityId = entityId;
    this.parentId = properties.parentID;

    properties = Entities.getEntityProperties(this.parentId, ['position', 'rotation']);
    this.boardPosition = properties.position;
    this.boardRotation = properties.rotation;
  };

  ChessPiece.prototype.getIndexFromName = function () {
    var match = this.name.match(/\[(\d+)\]/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return -1;
  };

  ChessPiece.prototype.startDistanceGrab = function () {
    this.startGrab();
  };

  ChessPiece.prototype.startNearGrab = function () {
    this.startGrab();
  };

  ChessPiece.prototype.startGrab = function () {
    var properties = Entities.getEntityProperties(this.entityId,
      ['parentID', 'name', 'rotation', 'dimensions', 'position']);
    this.name = properties.name;
    this.index = this.getIndexFromName();
    Entities.callEntityMethod(this.parentId, 'callMethod', ['setEnabled', false]);
  };

  ChessPiece.prototype.releaseGrab = function () {
    var properties, diff, x, z, position;
    var self = this;

    properties = Entities.getEntityProperties(this.entityId, ['position']);
    diff = Vec3.subtract(this.boardPosition, properties.position);
    position = Vec3.multiplyQbyV(Quat.inverse(this.boardRotation), diff);
    x = -Math.round(position.x / SQUARE_SIZE + 0.5) + 4;
    z = -Math.round(position.z / SQUARE_SIZE + 0.5) + 4;

    // Reset size, position, rotation (before grab)
    Script.setTimeout(function () {
      var index = x + z * 8;

      Entities.callEntityMethod(self.parentId, 'callMethod', ['resetPiecePosition', self.index]);

      // Invalid position, reset position
      if (Math.abs(diff.y) > MAX_DROP_HEIGHT || x < 0 || x >= 8 || z < 0 || z >=8) {
        return;
      }

      Entities.callEntityMethod(self.parentId, 'callMethod', ['submitMove', self.index, index, self.entityId]);
      Entities.callEntityMethod(self.parentId, 'callMethod', ['setEnabled', true]);
    }, WAIT_FOR_DROP_DELAY);
  };

  return new ChessPiece();
});
