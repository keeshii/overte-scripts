import { LevelBase } from './level-base';

const CONTENT = `
"use strict";

/*
  Chapter 1 - baby steps

  Basically in every level our goal is the same - reach the exit.
  Move the player using the following function:

  player.move(x, y) -> moves by x, and y squares,
                       x and y must be an integer between -1 and 1.
*/

(function () {

  Script.include('./api/player.js');

  function Level() {
    this.remotelyCallable = ['run'];
  }

  Level.prototype.run = function(_id, params) {
    // ----- EDIT CODE HERE ------
    for (let i = 0; i < 3; i++) {
      player.move(0, 1);
      player.move(0, -1);
    }
    // ---------------------------
  };

  Level.prototype.preload = function(_id) { };

  return new Level();
});
`;
        
const BOARD_TEXT = `
################
# @  #         #
#    #    #    #
#    #    #    #
#         #  X #
################
`;


export class Level_01 extends LevelBase {
  
  constructor() {
    super(CONTENT, BOARD_TEXT);

    this.editor.state.fileName = 'tmp://level-01';

    this.board.state.offsetX = 100;
    this.board.state.offsetY = 100;
  }

}
