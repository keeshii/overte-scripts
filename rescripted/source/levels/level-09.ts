import { LevelBase } from './level-base';
import { shuffle, randomValue } from '../utils/array-utils';
import { Position } from '../game/game.interface';

const CONTENT = `
"use strict";

/*
  Chapter 9 - limitless

  You were amazing. Now we have full controll over the game state.

  Check the new API:
  level.board.setValue(x, y, value, color) -> Changes the board squere
*/

(function () {

  Script.include('./api/player.js');
  Script.include('./api/map.js');
  Script.include('./api/level.js');

  function Level() {
    this.remotelyCallable = ['run'];
  }

  Level.prototype.run = function(_id, params) {
    // ----- EDIT CODE HERE ------
    var drone;

    player.move(0, 0);
    player.move(0, 0);

    level.drones = []; // drones are no more
    while (drone = map.findObject('d')) {
      level.board.setValue(drone.x, drone.y, ' ');
    }

    player.move(0, 0);
    // ---------------------------
  };

  Level.prototype.preload = function(_id) {
    this.id = _id;
  };

  return new Level();
});
`;

const BOARD_TEXT = `
 ############# 
##           ##
#             #
#             #
#             #
#      @      #
#             #
#             #
#             #
##           ##
 ############# 
`;


export class Level_09 extends LevelBase {
  
  private drones: Position[];
  
  constructor() {
    super(CONTENT, BOARD_TEXT);

    this.editor.state.fileName = 'tmp://level-09.js';
    this.board.state.offsetX = 2;
    this.board.state.offsetY = 2;
    this.items.push('d');
    this.drones = [];

    this.createDrones();
  }

  private createDrones() {
    let i, slots = [];

    for (i = 2; i < 13; i++) {
      slots.push({ x: i, y: 1 });
      slots.push({ x: i, y: 9 });
    }
    
    for (i = 2; i < 9; i++) {
      slots.push({ x: 1, y: i });
      slots.push({ x: 13, y: i });
    }
    
    shuffle(slots);
    
    for (i = 0; i < 10; i++) {
      this.drones.push(slots[i]);
      this.board.setValue(slots[i].x, slots[i].y, 'd', 'R');
    }
  }

  public tick() {
    super.tick();

    let i, index, drone, target;

    // Simulate drones
    for (i = 0; i < this.drones.length; i++) {
      drone = this.drones[i];
      target = this.player;

      const path = this.board.findPath(drone.x, drone.y, target.x, target.y, this.items);
      if (path === undefined) {
        continue;
      }
      index = this.board.getIndex(drone.x + path.x, drone.y + path.y);
      if (this.board.state.values[index] !== 'd') {
        this.move(drone, path.x, path.y);
      }
    }
  }

  public collision(source: string, target: string, x: number, y: number) {  
    super.collision(source, target, x, y);
    if (source === '@' && target === 'd' || source === 'd' && target === '@') {
      throw new Error('Intercepted by drone');
    }
  }

}
