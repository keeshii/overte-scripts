"use strict";

/* global DixitMessages */

(function (global) {

  Script.include('./messages.js');

  var SCREEN_IMAGE_WIDTH = 1;
  var SCREEN_IMAGE_HEIGHT = SCREEN_IMAGE_WIDTH * 1.5;
  var SCREEN_MARGIN = 0.05;
  var SCREEN_OFFSET_Y = -0.25;
  var CARDBACK = Script.resolvePath('./images/cardback.jpg');

  var COLOR_GREEN = { red: 19, green: 118, blue: 3 };
  var COLOR_RED = { red: 196, green: 26, blue: 0 };

  function DixitScreen(entityId) {
    this.entityId = entityId;
    this.playersId = '';
    this.buttonScreenId = '';
    this.buttonAbortId = '';
    this.imagesId = [];
  }

  DixitScreen.prototype.findEntities = function () {
    var position = Entities.getEntityProperties(this.entityId, ['position']).position;
    var entities = Entities.findEntities(position, 50);
    var prop, i;

    for (i = 0; i < entities.length; i++) {
      prop = Entities.getEntityProperties(entities[i], ['parentID', 'name']);
      if (prop.parentID === this.entityId) {
        switch (prop.name) {
          case 'Text.Players':
            this.playersId = entities[i];
            break;
          case 'Text.ButtonScreen':
            this.buttonScreenId = entities[i];
            break;
          case 'Text.ButtonAbortGame':
            this.buttonAbortId = entities[i];
            break;
        }
      }
    }
  };

  DixitScreen.prototype.setPlayersText = function(rows) {
    if (!this.playersId) {
      return;
    }
    Entities.editEntity(this.playersId, { text: rows.join('\n') });
  };

  DixitScreen.prototype.renderScreenImages = function(screenImages, hidden) {
    var width, position, imageId, x, y, z, i;

    if (this.imagesId.length > 0) {
      for (i = 0; i < this.imagesId.length; i++) {
        Entities.deleteEntity(this.imagesId[i]);
      }
      this.imagesId.length = 0;
    }

    width = screenImages.length * SCREEN_IMAGE_WIDTH + (screenImages.length - 1) * SCREEN_MARGIN;
    x = (-width + SCREEN_IMAGE_WIDTH) / 2;
    y = SCREEN_OFFSET_Y;
    z = 0.01;

    for (i = 0; i < screenImages.length; i++) {
      position = { x: x, y: y, z: z };
      x += SCREEN_IMAGE_WIDTH + SCREEN_MARGIN;

      imageId = Entities.addEntity({
        type: "Image",
        name: "Image.ScreenImage[" + i + "]",
        parentID: this.entityId,
        dimensions: { x: SCREEN_IMAGE_WIDTH, y: SCREEN_IMAGE_HEIGHT, z: 0.01 },
        localPosition: position,
        emissive: true,
        imageURL: hidden ? CARDBACK : screenImages[i].image
      });

      this.imagesId.push(imageId);
    }
  };

  DixitScreen.prototype.setScreenText = function(description, screenButton, abortButton) {
    var color;
    Entities.editEntity(this.entityId, { text: description });
    
    if (this.buttonScreenId) {
      color = screenButton === DixitMessages.BUTTON_ABORT_GAME_CONFIRM ? COLOR_RED : COLOR_GREEN;

      Entities.editEntity(this.buttonScreenId, {
        text: screenButton,
        visible: screenButton ? true : false,
        backgroundColor: color
      });
    }

    if (this.buttonAbortId) {
      Entities.editEntity(this.buttonAbortId, {
        text: abortButton,
        visible: abortButton ? true : false
      });
    }
  };

  global.DixitScreen = DixitScreen;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
