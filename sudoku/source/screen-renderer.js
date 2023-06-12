"use strict";

/* global BUTTON_HINT, BOARD_SIZE, STATE_LENGTH, EMPTY */

(function (global) {

  Script.include([
    './config.js',
    './sudoku.js'
  ]);

  var DIGIT_MARGIN = 0.01;
  var DIGIT_SIZE = (3.2 / 9) - DIGIT_MARGIN;

  function ScreenRenderer(entityId) {
    this.entityId = entityId;
    this.buttonId = '';
    this.buttonLabel = BUTTON_HINT;
    this.digitIds = [];
  }

  ScreenRenderer.prototype.findEntities = function () {
    var position = Entities.getEntityProperties(this.entityId, ['position']).position;
    var entities = Entities.findEntities(position, 50);
    var toDeleteIds, prop, i;

    toDeleteIds = [];
    for (i = 0; i < entities.length; i++) {
      prop = Entities.getEntityProperties(entities[i], ['parentID', 'name']);
      if (prop.parentID === this.entityId) {
        switch (prop.name) {
          case 'Text.Hint':
            this.buttonId = entities[i];
            break;
          case 'Text.NewGame':
            break;
          default:
            toDeleteIds.push(entities[i]);
        }
      }
    }

    for (i = 0; i < toDeleteIds.length; i++) {
      Entities.deleteEntity(toDeleteIds[i]);
    }
  };

  ScreenRenderer.prototype.init = function() {
    var i, j, x, y, z, size, digitId;

    size = (DIGIT_SIZE + DIGIT_MARGIN) * BOARD_SIZE - DIGIT_MARGIN;
    x = (-size + DIGIT_SIZE) / 2;
    y = (size - DIGIT_SIZE) / 2;
    z = 0.01;

    this.digitIds = [];
    for (i = 0; i < BOARD_SIZE; i++) {
      for (j = 0; j < BOARD_SIZE; j++) {

        digitId = Entities.addEntity({
          type: "Text",
          name: "Text.Digit[" + (i * BOARD_SIZE + j) + "]",
          parentID: this.entityId,
          dimensions: { x: DIGIT_SIZE, y: DIGIT_SIZE, z: 0.01 },
          backgroundAlpha: 0,
          localPosition: {
            x: x + j * (DIGIT_SIZE + DIGIT_MARGIN),
            y: y - i * (DIGIT_SIZE + DIGIT_MARGIN),
            z: z
          },
          alignment: 'center',
          lineHeight: 0.3,
          topMargin: 0.03,
          textEffect: 'outline fill',
          textEffectColor: { red: 0, green: 0, blue: 0 },
          textEffectThickness: 0.3,
          unlit: true,
          userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
        });

        this.digitIds.push(digitId);
      }
    }
  };

  ScreenRenderer.prototype.setButtonLabel = function(text) {
    this.buttonLabel = text;
    if (this.buttonId) {
      Entities.editEntity(this.buttonId, { text: text });
    }
  };

  ScreenRenderer.prototype.setState = function(baseState, state) {
    var i;
    for (i = 0; i < STATE_LENGTH; i++) {
      if (baseState[i] !== EMPTY) {
        this.setBaseDigit(i, baseState[i]);
      } else {
        this.setDigit(i, state[i]);
      }
    }
  };

  ScreenRenderer.prototype.setBaseDigit = function(index, value) {
    if (this.digitIds[index]) {
      Entities.editEntity(this.digitIds[index], {
        text: value === EMPTY ? '' : value,
        textColor: { red: 0, green: 0, blue: 0 },
        textEffect: 'outline fill'
      });
    }
  };

  ScreenRenderer.prototype.setDigit = function(index, value) {
    if (this.digitIds[index]) {
      Entities.editEntity(this.digitIds[index], {
        text: value === EMPTY ? '' : value,
        textColor: { red: 0, green: 0, blue: 255 },
        textEffect: 'none'
      });
    }
  };

  ScreenRenderer.prototype.clear = function () {
    var i;
    for (i = 0; i < this.digitIds.length; i++) {
      Entities.deleteEntity(this.digitIds[i]);
    }
    this.digitIds = [];
  };

  global.ScreenRenderer = ScreenRenderer;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
