"use strict";

((typeof module !== 'undefined' ? module : {}).exports = function () {

  Script.include([
    './dixit-screen.js',
    './dixit.js'
  ]);

  function DixitServer() {
    this.dixit = new Dixit();

    this.remotelyCallable = [
      'addPlayer',
      'getHandImages',
      'getSubmitCount',
      'handleClick',
      'applyHandCard'
    ];
  };

  DixitServer.prototype.preload = function (entityId) {
    var dixit = this.dixit;
    dixit.screen = new DixitScreen(entityId);

    // Wait for the world json to load before initialization
    Script.setTimeout(function () {
      dixit.screen.findEntities();
      dixit.init();
    }, 500);
  };

  DixitServer.prototype.unload = function() {
    this.dixit.screen.renderScreenImages([], false);
  };

  DixitServer.prototype.addPlayer = function (_id, params) {
    var sessionId = params[0];
    var name = params[1];
    this.dixit.addPlayer(sessionId, name);
  };

  DixitServer.prototype.getHandImages = function (_id, params) {
    var sessionId = params[0];
    this.dixit.getHandImages(sessionId);
  };

  DixitServer.prototype.getSubmitCount = function(_id, params) {
    var sessionId = params[0];
    this.dixit.getSubmitCount(sessionId);
  };

  DixitServer.prototype.handleClick = function(_id, params) {
    var buttonText = params[1];
    this.dixit.handleClick(buttonText);
  };

  DixitServer.prototype.applyHandCard = function(_id, params) {
    var sessionId = params[0];
    var cardIndexes = [];
    try {
      cardIndexes = JSON.parse(params[1]);
    } catch(e) { }
    if (cardIndexes.length > 0) {
      this.dixit.applyHandCard(sessionId, cardIndexes);
    }
  };

  return new DixitServer();
});
