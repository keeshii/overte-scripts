"use strict";

/* global PLAYERS, BASE_URL, COLOR_LIGHT, COLOR_DARK, HMD, Camera,
 getPieceAssetName */

(function (global) {

  Script.include('./config.js');

  var BUTTON_SIZE = 0.15;
  var BUTTON_MARGIN = 0.01;
  var MESSAGE_DURATION = 3; // 3 seconds

  function ChessOverlay() {
    this.entityId = '';
    this.messageId = '';
    this.player = PLAYERS.WHITE;
  }

  ChessOverlay.prototype.getPieceImageUrl = function (value) {
    return BASE_URL + '/images/' + getPieceAssetName(value) + '.svg';
  };

  ChessOverlay.prototype.showPromotion = function (player) {
    var position, rotation, i, x, y;

    this.close();

    rotation = MyAvatar.orientation;
    position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(rotation, {x: 0, y: 0, z: -1}));

    this.player = player;

    this.entityId = Entities.addEntity({
      type: "Box",
      alpha: 0,
      position: position,
      rotation: rotation,
      dimensions: {x: 0.1, y: 0.1, z: 0.1},
      lifetime: 300
    }, 'local');

    y = (BUTTON_SIZE + BUTTON_MARGIN) * 4;

    for (i = 0; i < 5; i++) {
      x = ((i % 3) - 1) * (BUTTON_SIZE + BUTTON_MARGIN);
      if (i > 0 && i % 3 === 0) {
        y -= BUTTON_SIZE + BUTTON_MARGIN;
      }
      position = {x: x, y: y, z: 0.01};

      Entities.addEntity({
        type: "Image",
        name: "Image.ChessPromotion[" + (player + i + 2) + "]",
        parentID: this.entityId,
        dimensions: {x: BUTTON_SIZE, y: BUTTON_SIZE, z: 0.01},
        localPosition: position,
        imageURL: this.getPieceImageUrl(player + i + 2),
        keepAspectRatio: true,
        color: COLOR_LIGHT,
        userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
      }, 'local');
    }

    x = BUTTON_SIZE + BUTTON_MARGIN;
    position = {x: x, y: y, z: 0.01};

    Entities.addEntity({
      type: "Text",
      name: "Text.Cancel",
      parentID: this.entityId,
      dimensions: {x: BUTTON_SIZE, y: BUTTON_SIZE, z: 0.01},
      localPosition: position,
      text: "X",
      lineHeight: 0.1,
      backgroundColor: COLOR_DARK,
      textColor: COLOR_LIGHT,
      topMargin: 0.025,
      unlit: true,
      alignment: "center",
      userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
    }, 'local');
  };

  ChessOverlay.prototype.showTextMessage = function (message, color) {
    var properties, cameraPosition, textPosition, localPosition;

    if (this.messageId) {
      Entities.deleteEntity(this.messageId);
      this.messageId = '';
    }

    properties = {
      type: 'Text',
      name: 'Text.ChessMessage',
      text: message,
      localPosition: {x: 0, y: 0, z: 1},
      renderLayer: 'front',
      unlit: true,
      lineHeight: 0.18,
      leftMargin: 0,
      topMargin: 0.05,
      billboardMode: 'full',
      alignment: 'center',
      localDimensions: {x: 1.5, y: 0.3, z: 0.01},
      textColor: color,
      backgroundColor: {r: 0, g: 0, b: 0},
      backgroundAlpha: 0,
      lifetime: MESSAGE_DURATION,
      userData: '{"grabbableKey": {"grabbable": false, "triggerable": false}}'
    };

    if (HMD.active) {
      properties.parentID = MyAvatar.sessionUUID;
      properties.parentJointIndex = MyAvatar.getJointIndex('Head');
    } else {
      cameraPosition = Camera.position;
      textPosition = Vec3.sum(cameraPosition, Vec3.multiplyQbyV(Camera.orientation, {x: 0, y: 0, z: -2}));
      localPosition = Entities.worldToLocalPosition(textPosition, Camera.cameraEntity);
      properties.parentID = Camera.cameraEntity;
      properties.localPosition = localPosition;
    }

    this.messageId = Entities.addEntity(properties, 'local');
  };

  ChessOverlay.prototype.close = function () {
    if (this.entityId) {
      Entities.deleteEntity(this.entityId);
      this.entityId = '';
    }
  };

  global.ChessOverlay = ChessOverlay;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
