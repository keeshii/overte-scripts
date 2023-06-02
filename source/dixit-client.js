"use strict";

/* global DixitPanel */

((typeof module !== 'undefined' ? module : {}).exports = function () {

    Script.include('./dixit-panel.js');

    function DixitClient() {
      this.panel = new DixitPanel();
      this.entityId = '';
      this.mousePressOnEntityFn = null;

      this.remotelyCallable = [
        'setHandImages',
        'setSubmitCount',
        'closePanel'
      ];
    }

    DixitClient.prototype.callServer = function (methodName, param) {
      var params = [MyAvatar.sessionUUID, param];
      Entities.callEntityServerMethod(this.entityId, methodName, params);
    };

    DixitClient.prototype.onMousePress = function (entityId, event) {
      var properties, parentId, name;
      var match, cardIndexes, index;

      if (event.button !== 'Primary') {
        return;
      }

      properties = Entities.getEntityProperties(entityId, ["name", "text", "parentID"]);
      parentId = properties.parentID;
      name = properties.name;

      if (parentId !== this.entityId && parentId !== this.panel.entityId) {
        return;
      }

      match = name.match(/^Image.HandImage\[(\d+)\]$/);
      if (match !== null) {
        index = parseInt(match[1], 10);
        this.panel.toggleImage(index);
        return;
      }

      switch (name) {
        case 'Text.ButtonOpenPanel':
          this.panel.open();
          this.callServer('getHandImages');
          this.callServer('getSubmitCount');
          break;
        case 'Text.ButtonClosePanel':
          this.panel.close();
          break;
        case 'Text.ButtonJoin':
          this.callServer('addPlayer', MyAvatar.displayName);
          this.callServer('getHandImages');
          this.callServer('getSubmitCount');
          break;
        case 'Text.ButtonSubmit':
          cardIndexes = this.panel.getSelectedIndexes();
          if (this.panel.submitCount > 0 && cardIndexes.length > 0) {
            this.callServer('applyHandCard', JSON.stringify(cardIndexes));
            this.panel.clearSelection();
          }
          break;
        case 'Text.ButtonScreen':
        case 'Text.ButtonAbortGame':
          this.callServer('handleClick', properties.text);
          break;
      }
    };

    DixitClient.prototype.preload = function (entityId) {
      var self = this;

      this.mousePressOnEntityFn = function (id, event) {
        self.onMousePress(id, event);
      };

      this.entityId = entityId;
      Entities.mousePressOnEntity.connect(this.mousePressOnEntityFn);
    };

    DixitClient.prototype.unload = function () {
      if (this.mousePressOnEntityFn) {
        Entities.mousePressOnEntity.disconnect(this.mousePressOnEntityFn);
        this.mousePressOnEntityFn = null;
      }
      this.panel.close();
    };

    DixitClient.prototype.setHandImages = function (_id, params) {
      var images = null;
      try {
        images = JSON.parse(params[0]);
      } catch (e) {
        // ignored
      }
      this.panel.setHandImages(images);
    };

    DixitClient.prototype.setSubmitCount = function (_id, params) {
      var n = params[0];
      if (typeof n === 'string') {
        n = parseInt(n, 10);
      }
      this.panel.setSubmitCount(n);
    };

    DixitClient.prototype.closePanel = function () {
      this.panel.close();
    };

    return new DixitClient();
});
