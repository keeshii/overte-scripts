import { LevelBase } from './level-base';
import { shuffle } from '../utils/array-utils';
import { Position } from '../game/game.interface';

const CONTENT = `
"use strict";

/*
  Chapter 4 - first contact

  Oh no, there is a security drone. It will chase you as soon
  as you enter its teritory. Be careful.
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
    for (i = 0; i < 20; i++) {
        player.move(0, 0);
    }
    // ---------------------------
  };

  Level.prototype.preload = function(_id) { };

  return new Level();
});
`;

const BOARD_TEXT
  = '  ############  \n'
  + '  #          #  \n'
  + '  #  ### ### #  \n'
  + '  #  #     # #  \n'
  + '###  #     # ###\n'
  + '#@            X#\n'
  + '###  #     # ###\n'
  + '  #  #     # #  \n'
  + '  #  ### ### #  \n'
  + '  #          #  \n'
  + '  ############  \n';


export class Level_04 extends LevelBase {

  private drone: Position;
  private droneTargets: Position[];

  constructor() {
    super(CONTENT, BOARD_TEXT);

    this.editor.state.fileName = 'tmp://level-04.js';
    this.drone = { x: 8, y: 1 + Math.floor(Math.random() * 9) };
    this.droneTargets = shuffle([{x: 8, y: 1}, {x: 8, y: 9 }]);
    this.board.state.offsetX = 10;
    this.board.state.offsetY = 1;
    this.items.push('d');
    this.board.setValue(this.drone.x, this.drone.y, 'd', 'R');
  }

  public tick() {
    super.tick();

    const player = this.player;
    const drone = this.drone;
    let target = this.droneTargets[0];

    if (player.x <= 2 || player.x >= 12) {
      if (drone.x === target.x && drone.y === target.y) {
        this.droneTargets.reverse();
        target = this.droneTargets[0];
      }
    } else {
      target = player;
    }

    const path = this.board.findPath(drone.x, drone.y, target.x, target.y, this.items);
    if (path !== undefined) {
      this.move(drone, path.x, path.y);
    }
  }

  public collision(source: string, target: string, x: number, y: number) {
    super.collision(source, target, x, y);
    if (source === '@' && target === 'd' || source === 'd' && target === '@') {
      throw new Error('Intercepted by drone');
    }
  }

}
