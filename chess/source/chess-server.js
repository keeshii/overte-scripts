"use strict";

/* global ChessServer */

((typeof module !== 'undefined' ? module : {}).exports = function () {

  Script.include('./chess-server-class.js');
  return new ChessServer();

});
