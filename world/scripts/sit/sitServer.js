"use strict";

/* global SitServer */

((typeof module !== 'undefined' ? module : {}).exports = function () {

  Script.include('./sitServerClass.js');
  return new SitServer();

});
