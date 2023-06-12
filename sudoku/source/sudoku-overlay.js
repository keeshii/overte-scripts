"use strict";

/* global DIFFICULTY_LABELS, DIFFICULTY_VALUES, HMD, Camera */

(function (global) {

  var BUTTON_WIDTH = 0.5;
  var BUTTON_HEIGHT = 0.15;
  var BUTTON_MARGIN = 0.01;
  var DIGIT_SIZE = 0.15;
  var DIGIR_MARGIN = 0.01;
  var MESSAGE_DURATION = 3; // 3 seconds

  var COLOR_LIGHT = { red: 234, green: 237, blue: 237 };
  var COLOR_DARK = { red: 49, green: 49, blue: 49 };

  function SudokuOverlay() {
    this.entityId = '';
    this.messageId = '';
    this.candidates = '';
  }

  SudokuOverlay.prototype.showDigitOverlay = function(candidates) {
    var position, rotation, value, i, x, y;

    this.close();

    rotation = MyAvatar.orientation;
    position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(rotation, { x: 0, y: 0, z: -1 }));

    this.entityId = Entities.addEntity({
      type: "Box",
      alpha: 0,
      position: position,
      rotation: rotation,
      dimensions: { x: 0.1, y: 0.1, z: 0.1 },
      lifetime: 300
    }, 'local');

    this.candidates = candidates;

    y = (DIGIT_SIZE + BUTTON_MARGIN) * 4;

    for (i = 0; i < 9; i++) {
      x = ((i % 3) - 1) * (DIGIT_SIZE + DIGIR_MARGIN);
      if (i > 0 && i % 3 === 0) {
        y -= DIGIT_SIZE + DIGIR_MARGIN;
      }
      position = { x: x, y: y, z: 0.01 };
      
      value = String(i + 1);

      Entities.addEntity({
        type: "Text",
        name: "Text.SetDigit[" + (i + 1) + "]",
        parentID: this.entityId,
        dimensions: { x: DIGIT_SIZE, y: DIGIT_SIZE, z: 0.01 },
        localPosition: position,
        text: value,
        lineHeight: 0.1,
        backgroundColor: COLOR_LIGHT,
        textColor: COLOR_DARK,
        topMargin: 0.025,
        unlit: true,
        alignment: "center",
        userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
      }, 'local');
    }

    x = -DIGIT_SIZE - DIGIR_MARGIN;
    y -= DIGIT_SIZE + DIGIR_MARGIN;
    position = { x: x, y: y, z: 0.01 };

    Entities.addEntity({
      type: "Text",
      name: "Text.SetDigit[0]",
      parentID: this.entityId,
      dimensions: { x: DIGIT_SIZE, y: DIGIT_SIZE, z: 0.01 },
      localPosition: position,
      text: "_",
      lineHeight: 0.1,
      backgroundColor: COLOR_LIGHT,
      textColor: COLOR_DARK,
      topMargin: 0.025,
      unlit: true,
      alignment: "center",
      userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
    }, 'local');

    x = DIGIT_SIZE + DIGIR_MARGIN;
    position = { x: x, y: y, z: 0.01 };

    Entities.addEntity({
      type: "Text",
      name: "Text.Cancel",
      parentID: this.entityId,
      dimensions: { x: DIGIT_SIZE, y: DIGIT_SIZE, z: 0.01 },
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


  SudokuOverlay.prototype.showNewGameOverlay = function() {
    var position, rotation, i, x, y;

    this.close();

    rotation = MyAvatar.orientation;
    position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(rotation, { x: 0, y: 0, z: -1 }));

    this.entityId = Entities.addEntity({
      type: "Box",
      alpha: 0,
      position: position,
      rotation: rotation,
      dimensions: { x: 0.1, y: 0.1, z: 0.1 },
      lifetime: 300
    }, 'local');

    y = (BUTTON_HEIGHT + BUTTON_MARGIN) * DIFFICULTY_LABELS.length;

    for (i = 0; i < DIFFICULTY_LABELS.length; i++) {
      x = ((i % 2) ? 1 : -1) * (BUTTON_WIDTH / 2 + BUTTON_MARGIN);
      if (i > 0 && i % 2 === 0) {
        y -= BUTTON_HEIGHT + BUTTON_MARGIN;
      }
      position = { x: x, y: y, z: 0.01 };

      Entities.addEntity({
        type: "Text",
        name: "Text.NewGame[" + DIFFICULTY_VALUES[i] + "]",
        parentID: this.entityId,
        dimensions: { x: BUTTON_WIDTH, y: BUTTON_HEIGHT, z: 0.01 },
        localPosition: position,
        text: DIFFICULTY_LABELS[i],
        lineHeight: 0.1,
        backgroundColor: COLOR_LIGHT,
        textColor: COLOR_DARK,
        topMargin: 0.025,
        unlit: true,
        alignment: "center",
        userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
      }, 'local');
    }

    y -= BUTTON_HEIGHT + BUTTON_MARGIN;
    position = { x: 0, y: y, z: 0.01 };

    Entities.addEntity({
      type: "Text",
      name: "Text.Cancel",
      parentID: this.entityId,
      dimensions: { x: BUTTON_WIDTH, y: BUTTON_HEIGHT, z: 0.01 },
      localPosition: position,
      text: "Cancel",
      lineHeight: 0.1,
      backgroundColor: COLOR_DARK,
      textColor: COLOR_LIGHT,
      topMargin: 0.025,
      unlit: true,
      alignment: "center",
      userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
    }, 'local');
  };

  SudokuOverlay.prototype.showTextMessage = function(message, color) {
    var properties, cameraPosition, textPosition, localPosition; 

    if (this.messageId) {
      Entities.deleteEntity(this.messageId);
      this.messageId = '';
    }

    if (color === undefined) {
      color = COLOR_DARK;
    }

    properties = {
      type: 'Text',
      name: 'Text.SudokuMessage',                       
      text: message,     
      localPosition: { x: 0, y: 0, z: 1 },
      renderLayer: 'front',
      unlit: true,  
      lineHeight: 0.18,
      leftMargin: 0,
      topMargin: 0.05, 
      billboardMode: 'full',  
      alignment: 'center',
      localDimensions: { x: 1, y: 0.3, z: 0.01 },    
      textColor: color,
      backgroundColor: { r: 0, g: 0, b: 0 },
      backgroundAlpha: 0,                    
      lifetime: MESSAGE_DURATION,               
      userData: '{"grabbableKey": {"grabbable": false, "triggerable": false}}'
    };

    if (HMD.active) {
      properties.parentID = MyAvatar.sessionUUID;
      properties.parentJointIndex = MyAvatar.getJointIndex('Head');
    } else {
      cameraPosition = Camera.position;
      textPosition = Vec3.sum(cameraPosition,Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: 0, z: -2 }));
      localPosition = Entities.worldToLocalPosition(textPosition, Camera.cameraEntity);
      properties.parentID = Camera.cameraEntity;
      properties.localPosition = localPosition;
    }

    Entities.addEntity(properties, 'local');
  };

  SudokuOverlay.prototype.close = function() {
    if (this.entityId) {
      Entities.deleteEntity(this.entityId);
      this.entityId = '';
    }
  };

  global.SudokuOverlay = SudokuOverlay;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
