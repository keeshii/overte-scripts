"use strict";

(function (global) {

  var PANEL_WIDTH = 3.0;
  var PANEL_HEIGHT = 0.6;
  var PANEL_BUTTON_HEIGHT = 0.1;
  var PANEL_BUTTON_WIDTH = 1.0;
  var PANEL_MARGIN = 0.025;
  var PANEL_IMAGE_HEIGHT = PANEL_HEIGHT - 3 * PANEL_MARGIN - PANEL_BUTTON_HEIGHT;
  var PANEL_IMAGE_WIDTH = 0.66 * PANEL_IMAGE_HEIGHT;

  var COLOR_WHITE = { red: 255, green: 255, blue: 255 };
  var COLOR_DARK = { red: 49, green: 49, blue: 49 };
  var COLOR_GREEN = { red: 19, green: 118, blue: 3 };
  var COLOR_DISABLED = { red: 225, green: 225, blue: 225 };
  
  var SELECTION_LIST_NAME = 'DixitPanelSelection';
  var SELECTION_ITEM_TYPE = 'entity';
  var SELECTION_STYLE = {
    outlineUnoccludedColor: { red: 0, green: 180, blue: 239 }, // #00b4ef
    outlineUnoccludedAlpha: 1,
    outlineOccludedColor: { red: 0, green: 0, blue: 0 },
    outlineOccludedAlpha: 0,
    fillUnoccludedColor: { red: 0, green: 0, blue: 0 },
    fillUnoccludedAlpha: 0,
    fillOccludedColor: { red: 0, green: 0, blue: 0 },
    fillOccludedAlpha: 0,
    outlineWidth: 4,
    isOutlineSmooth: false
  };

  function DixitPanel() {
    this.entityId = '';
    this.submitButtonId = '';
    this.closeButtonId = '';
    this.joinButtonId = '';
    this.messageId = '';
    this.imagesId = [];

    this.handImages = null;
    this.submitCount = 0;
  }

  DixitPanel.prototype.open = function () {
    var position, rotation;
    var x, y, z;

    this.close();

    Selection.enableListHighlight(SELECTION_LIST_NAME, SELECTION_STYLE);

    rotation = MyAvatar.orientation;
    position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(rotation, { x: 0, y: 0, z: -1 }));
    z = 0.01;

    this.entityId = Entities.addEntity({
      name: 'Text.Panel',
      type: "Text",
      backgroundColor: COLOR_WHITE,
      position: position,
      rotation: rotation,
      dimensions: { x: PANEL_WIDTH, y: PANEL_HEIGHT, z: 0.01 },
      unlit: true,
      text: '',
      userData: '{"grabbableKey": {"grabbable": true, "triggerable": false}}'
    }, 'local');

    x = (-PANEL_WIDTH + (PANEL_WIDTH - 2 * PANEL_BUTTON_WIDTH) / 3 + PANEL_BUTTON_WIDTH) / 2;
    y = (-PANEL_HEIGHT + PANEL_BUTTON_HEIGHT) / 2 + PANEL_MARGIN;
    position = { x: x, y: y, z: z };
    
    this.closeButtonId = Entities.addEntity({
      type: "Text",
      name: "Text.ButtonClosePanel",
      parentID: this.entityId,
      dimensions: { x: PANEL_BUTTON_WIDTH, y: PANEL_BUTTON_HEIGHT, z: 0.01 },
      localPosition: position,
      text: "Close",
      lineHeight: 0.1,
      backgroundColor: COLOR_DARK,
      unlit: true,
      alignment: "center",
      userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
    }, 'local');

    x = (PANEL_WIDTH - (PANEL_WIDTH - 2 * PANEL_BUTTON_WIDTH) / 3 - PANEL_BUTTON_WIDTH) / 2;
    y = (-PANEL_HEIGHT + PANEL_BUTTON_HEIGHT) / 2 + PANEL_MARGIN;
    position = { x: x, y: y, z: z };

    this.submitButtonId = Entities.addEntity({
      type: "Text",
      name: "Text.ButtonSubmit",
      parentID: this.entityId,
      dimensions: { x: PANEL_BUTTON_WIDTH, y: PANEL_BUTTON_HEIGHT, z: 0.01 },
      localPosition: position,
      text: "Submit",
      lineHeight: 0.1,
      backgroundColor: COLOR_DISABLED,
      unlit: true,
      alignment: "center",
      userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
    }, 'local');
  };

  DixitPanel.prototype.close = function () {
    if (this.entityId) {
      Selection.disableListHighlight(SELECTION_LIST_NAME);
      Entities.deleteEntity(this.entityId);
      this.entityId = '';
    }
  };

  DixitPanel.prototype.clearPanelContent = function () {
    var i;
    if (this.imagesId.length > 0) {
      for (i = 0; i < this.imagesId.length; i++) {
        Entities.deleteEntity(this.imagesId[i]);
      }
      this.imagesId.length = 0;
    }

    if (this.joinButtonId) {
      Entities.deleteEntity(this.joinButtonId);
      this.joinButtonId = '';
    }

    if (this.messageId) {
      Entities.deleteEntity(this.messageId);
      this.messageId = '';
    }
  };

  DixitPanel.prototype.renderPanelContent = function () {
    var imageId, position, width;
    var x, y, z, i;

    this.clearPanelContent();

    x = 0;
    y = (PANEL_HEIGHT - PANEL_IMAGE_HEIGHT) / 2 - PANEL_MARGIN;
    z = 0.01;
    position = { x: x, y: y, z: z };

    if (this.handImages === null) {
      this.joinButtonId = Entities.addEntity({
        type: "Text",
        name: "Text.ButtonJoin",
        parentID: this.entityId,
        dimensions: { x: PANEL_BUTTON_WIDTH, y: PANEL_BUTTON_HEIGHT, z: 0.01 },
        localPosition: position,
        text: "Join the game",
        lineHeight: 0.1,
        backgroundColor: COLOR_GREEN,
        unlit: true,
        alignment: "center",
        userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
      }, 'local');

    } else if (this.handImages.length === 0) {
      this.messageId = Entities.addEntity({
        type: "Text",
        name: "Text.PanelMessage",
        parentID: this.entityId,
        dimensions: { x: PANEL_WIDTH, y: PANEL_BUTTON_HEIGHT, z: 0.01 },
        localPosition: position,
        text: "Waiting for the game to start",
        lineHeight: 0.1,
        textColor: COLOR_DARK,
        backgroundColor: COLOR_GREEN,
        backgroundAlpha: 0,
        unlit: true,
        alignment: "center",
        userData: '{"grabbableKey": {"grabbable": false, "triggerable": false}}'
      }, 'local');

    } else {
      width = this.handImages.length * PANEL_IMAGE_WIDTH + (this.handImages.length - 1) * PANEL_MARGIN;
      x = (-width + PANEL_IMAGE_WIDTH) / 2;
      y = (PANEL_HEIGHT - PANEL_IMAGE_HEIGHT) / 2 - PANEL_MARGIN;
      
      for (i = 0; i < this.handImages.length; i++) {
        position = { x: x, y: y, z: z };
        x += PANEL_IMAGE_WIDTH + PANEL_MARGIN;

        imageId = Entities.addEntity({
          type: "Image",
          name: "Image.HandImage[" + i + "]",
          parentID: this.entityId,
          dimensions: { x: PANEL_IMAGE_WIDTH, y: PANEL_IMAGE_HEIGHT, z: 0.01 },
          localPosition: position,
          emissive: true,
          imageURL: this.handImages[i],
          userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
        }, 'local');

        this.imagesId.push(imageId);
      }
    }
  };

  DixitPanel.prototype.clearSelection = function () {
    Selection.clearSelectedItemsList(SELECTION_LIST_NAME);
  }

  DixitPanel.prototype.getSelectedIndexes = function () {
    var selection = Selection.getSelectedItemsList(SELECTION_LIST_NAME);
    var entities = selection.entities || [];
    var results, index, i;

    results = [];
    for (i = 0; i < entities.length; i++) {
      index = this.imagesId.indexOf(entities[i]);
      if (index !== -1) {
        results.push(index);
      }
    }

    return results;
  }

  DixitPanel.prototype.toggleImage = function (index) {
    var indexes = this.getSelectedIndexes();
    var id = this.imagesId[index];

    if (indexes.indexOf(index) !== -1) {
      Selection.removeFromSelectedItemsList(SELECTION_LIST_NAME, SELECTION_ITEM_TYPE, id);
      return;
    }

    if (this.submitCount === 1) {
      Selection.clearSelectedItemsList(SELECTION_LIST_NAME);
      indexes.length = 0;
    }

    if (indexes.length < this.submitCount) {
      Selection.addToSelectedItemsList(SELECTION_LIST_NAME, SELECTION_ITEM_TYPE, id);
    }
  };

  DixitPanel.prototype.setHandImages = function (handImages) {
    this.handImages = handImages;
    if (this.entityId) {
      this.renderPanelContent();
    }
  }

  DixitPanel.prototype.setSubmitCount = function (submitCount) {
    this.submitCount = submitCount;
    if (this.entityId) {
      Entities.editEntity(this.submitButtonId, {
        backgroundColor: this.submitCount ? COLOR_GREEN : COLOR_DISABLED
      });
    }
  }

  global.DixitPanel = DixitPanel;

}(typeof module !== 'undefined' ? module.exports : new Function('return this;')()));
