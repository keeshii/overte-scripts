"use strict";

/* global SudokuServer */

((typeof module !== 'undefined' ? module : {}).exports = function () {

  Script.include('./sudoku-server-class.js');
  return new SudokuServer();

});
