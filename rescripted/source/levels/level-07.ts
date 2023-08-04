import { LevelBase } from './level-base';
import { shuffle, randomValue } from '../utils/array-utils';
import { Position } from '../game/game.interface';

const CONTENT = `
"use strict";

/*
  Chapter 7 - shooter

  You did it! We have broken through the security and now we are in the
  protected area.

  For now on, you are allowed to use the 'gun' API:
  - gun.fire('right')  -> fires a laser beam in given direction.
                          Direction can be 'right', 'left', 'top' or 'bottom'.

  The gun is powered by the energy. After you pick the yellow 'E', you
  will have 3 shots. Then your gun needs to be recharged again.

  - gun.energy         -> returns current amount of energy

  Show them who they are up against.
*/

(function () {

  Script.include('./api/player.js');
  Script.include('./api/map.js');
  Script.include('./api/gun.js');

  function Level() {
    this.remotelyCallable = ['run'];
  }

  Level.prototype.run = function(_id, params) {
    // ----- EDIT CODE HERE ------
    var target, path, i;

    target = map.findObject('E');
    while ((path = map.pathTo(target.x, target.y))) {
      player.move(path.x, path.y);
    }

    gun.fire('top');
    for (i = 0; i < 10; i++) {
        player.move(0, 0);
    }
    // ---------------------------
  };

  Level.prototype.preload = function(_id) {
    this.id = _id;
  };

  return new Level();
});
`;

const BOARD_TEXT
  = '    ##########################\n'
  + '#####                    #   #\n'
  + '#                        |   #\n'
  + '#   #                    | X #\n'
  + '#   #                    #   #\n'
  + '#   ##########################\n'
  + '#   #                         \n'
  + '#   #####                     \n'
  + '#   @   #                     \n'
  + '#       #                     \n'
  + '# E E E #                     \n'
  + '#########                     \n';


export class Level_07 extends LevelBase {
  
  private drones: Position[];
  private droneTargets: Position[];

  constructor() {
    super(CONTENT, BOARD_TEXT, { 'E': 'Y', '|': 'R' });

    this.editor.state.fileName = 'tmp://level-07.js';
    this.board.state.offsetX = 4;
    this.board.state.offsetY = 0;
    this.items.push('E', 'd');
    this.drones = [];
    this.droneTargets = [];

    this.createWalls();
    this.createDrones();
  }

  private createWalls() {
    let i, x, y;

    y = [1, 2, 3, 4];

    for (i = 0; i < 4; i++) {
      x = 8 + i * 4;
      shuffle(y);
      this.board.setValue(x, y[0], '#', ' ');
      this.board.setValue(x, y[1], '#', ' ');
      this.board.setValue(x, y[2], '#', ' ');
    }
  }

  private createDrones() {
    let i, x, y;

    for (i = 0; i < 5; i++) {
      x = 6 + i * 4;
      y = 1 + Math.floor(Math.random() * 3);
      this.board.setValue(x, y, 'd', 'R');
      this.drones.push({ x, y });
      this.droneTargets.push({ x, y: i % 2 ? 1 : 3 });
    }
  }

  private disableLaser() {
    let pos = this.board.findValue('|');
    while (pos) {
      this.board.setValue(pos.x, pos.y, ' ');
      pos = this.board.findValue('|');
    }
  }

  public tick() {
    super.tick();

    let i, drone, target, index;
    const player = this.player;

    // simulate drones
    for (i = 0; i < this.drones.length; i++) {
      drone = this.drones[i];
      target = this.droneTargets[i];
      
      if (drone.x === target.x && drone.y === target.y) {
        target.y = drone.y === 1 ? 4 : 1;
      }

      if (player.x > target.x - 6 && player.y < 6) {
        target = player;
      }

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
    if (source === '@' && target === '|') {
      throw new Error('Collision with laser');
    }
    if (source === '@' && target === 'd' || source === 'd' && target === '@') {
      throw new Error('Intercepted by drone');
    }
  }

  public shotCollision(target: string, x: number, y: number) {
    super.shotCollision(target, x, y);

    let i, drone;
    if (target === 'd') {
      for (i = 0; i < this.drones.length; i++) {
        drone = this.drones[i];
        if (drone.x === x && drone.y === y) {
          this.drones.splice(i, 1);
          this.droneTargets.splice(i, 1);
          this.board.setValue(drone.x, drone.y, ' ', ' ');
          break;
        }
      }
      if (this.drones.length === 0) {
        this.disableLaser();
      }
    }
  }

}
