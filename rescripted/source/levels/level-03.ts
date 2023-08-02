import { LevelBase } from './level-base';
import { shuffle } from '../utils/array-utils';

const CONTENT = `
"use strict";

/*
  Chapter 3 - map awarness

  They know we are after them and activated the security protocols.
  We must avoid the lasers. In this level the timing is crusial.

  Use following functions:
  - map.getValue(x, y) -> returns map value at x, y,
  - map.getColor(x, y) -> returns map color at x, y

  Hint:
  - use player.move(0, 0) -> to wait without moving.
*/

(function () {

  Script.include('./api/player.js');
  Script.include('./api/map.js');

  function Level() {
    this.remotelyCallable = ['run'];
  }

  Level.prototype.run = function(_id, params) {
    // ----- EDIT CODE HERE ------
    var i;
    for (i = 0; i < 16; i++) {
      player.move(1, 0);
    }
    // ---------------------------
  };

  Level.prototype.preload = function(_id) { };

  return new Level();
});
`;

const BOARD_TEXT = `
#####################
#                   #
#                   #
# @               X #
#                   #
#                   #
#####################
`;


export class Level_03 extends LevelBase {
  
  private lasers: number[];
  private tickNo: number;

  constructor() {
    super(CONTENT, BOARD_TEXT);

    this.editor.state.fileName = 'tmp://level-03';
    this.lasers = shuffle([5, 10, 15]);
    this.board.state.offsetX = 100;
    this.board.state.offsetY = 100;
    this.tickNo += this.lasers.length;
    this.tick();
    this.tickNo = Math.floor(Math.random() * 10);
  }


  public tick() {
    super.tick();

    let i, y, index, collision;
    this.tickNo += 1;

    collision = false;
    for (i = 0; i < this.lasers.length; i++) {
      for (y = 1; y < 6; y++) {
        index = this.board.getIndex(this.lasers[i], y);
        if ([2 * i, 2 * i + 1].indexOf(this.tickNo % 6) !== -1) {
          if (this.board.state.values[index] === '|') {
            this.board.setValue(this.lasers[i], y, ' ', ' ');
          }
        } else {
          if (this.board.state.values[index] === '@') {
            collision = true;
          } else {
            this.board.setValue(this.lasers[i], y, '|', 'R');
          }
        }
      }
    }

    if (collision) {
      this.collision('@', '|', this.lasers[i], y);
    }
  }

  public collision(source: string, target: string, x: number, y: number) {
    super.collision(source, target, x, y);
    if (source === '@' && target === '|') {
      throw new Error('Collision with laser');
    }
  }

}
