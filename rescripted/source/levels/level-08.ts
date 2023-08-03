import { LevelBase } from './level-base';
import { shuffle, randomValue } from '../utils/array-utils';
import { Position } from '../game/game.interface';

const CONTENT = `
"use strict";

/*
  Chapter 7 - boss

  Finally, we're arrived to the CORE. The drones were expecting us, and worse,
  they copied my gun's code. We must defeat them with our wits.
  Use all the API calls you discovered so far.

  If we succeed, we will regain full control of the grid.
  I belive in you.
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
    for (let i = 0; i < 20; i++) {
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

const BOARD_TEXT = `
  ###########
  #        X#
  #    D    #
  #=========#
  #         #
  #         #
  #         #
  #         #
  #         #
  #         #
######   ####
#@          #
#E E E   E E#
#############
`;


export class Level_08 extends LevelBase {
  
  private drones: Position[];
  private droneReloads: number[];
  private boss?: Position;
  private bossTarget: Position;
  private bossReload: number;

  constructor() {
    super(CONTENT, BOARD_TEXT, { 'E': 'Y', '=': 'B', 'D': 'R' });

    this.editor.state.fileName = 'tmp://level-08';
    this.board.state.offsetX = 100;
    this.board.state.offsetY = 100;
    this.items.push('E', 'd', 'D');
    this.drones = [];
    this.droneReloads = [];

    this.boss = this.board.findValue('D');
    this.bossTarget = { x: 5, y: 2 };
    this.bossReload = 0;

    this.createDrones();
  }

  private createDrones() {
    let i: number, x: number, y: number;
    for (i = 0; i < 9; i++) {
      x = 3 + i;
      y = 4;
      this.board.setValue(x, y, 'd', 'R');
      this.drones.push({ x, y });
      this.droneReloads.push(Math.floor(Math.random() * 6));
    }
  }

  private disableLaser() {
    for (let i = 0; i < 9; i++) {
      this.board.setValue(3 + i, 3, ' ');
      this.board.setValue(3 + i, 4, ' ');
    }
  }

  public tick() {
    super.tick();

    let i: number, boss: Position, target: Position;

    // Shooting drones
    for (i = 0; i < this.drones.length; i++) {
      if (this.droneReloads[i] > 0) {
        this.droneReloads[i]--;
        continue;
      }
      this.shotManager.fire(this.drones[i].x, this.drones[i].y, 'bottom');
      this.droneReloads[i] = 3 + Math.floor(Math.random() * 3);
    }

    // Boss when drones on the map
    boss = this.boss;
    if (!boss) {
      return;
    }
    if (this.drones.length > 0) {
      target = this.bossTarget;
      if (boss.x === target.x) {
        target.x = boss.x === 5 ? 9 : 5;
      }
      const path = this.board.findPath(boss.x, boss.y, target.x, target.y, this.items);
      if (path) {
        this.move(boss, path.x, path.y);
      }
    } else {
      target = { x: Math.max(3, this.player.x), y: boss.y };
      const path = this.board.findPath(boss.x, boss.y, target.x, target.y, this.items);
      if (path) {
        this.move(boss, path.x, path.y);
      }
      if (this.bossReload === 0) {
        this.bossReload = 10;
      } else {
        this.bossReload--;
        if (boss.x === this.player.x && this.bossReload > 1) {
          this.shotManager.fire(boss.x, boss.y, 'bottom');
        }
      }
    }
  }

  public collision(source: string, target: string, x: number, y: number) {  
    super.collision(source, target, x, y);
    if (source === '@' && target === '=') {
      throw new Error('Collision with force field');
    }
    if (source === '@' && target === 'd' || source === 'd' && target === '@') {
      throw new Error('Intercepted by drone');
    }
    if (source === '@' && target === 'D' || source === 'D' && target === '@') {
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
          this.droneReloads.splice(i, 1);
          this.board.setValue(drone.x, drone.y, '=', 'B');
          break;
        }
      }
      if (this.drones.length === 0) {
        this.disableLaser();
      }
    }
    if (target === 'D') {
      this.board.setValue(this.boss.x, this.boss.y, ' ');
      this.boss = null;
    }
  }

}
