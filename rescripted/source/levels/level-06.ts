import { LevelBase } from './level-base';
import { shuffle, randomValue } from '../utils/array-utils';
import { Position } from '../game/game.interface';

const CONTENT = `
"use strict";

/*
  Chapter 6 - barrier

  The way is blocked by a 4 layer barrier. You can open it by entering
  the correct code. The code is 4 digit with numbers between 1 and 5.

  Each color has assigned a different number. The layer disappears,
  if the digit in your code matches the color of the layer.

  Each 3-5 ticks, the barrier is renewed.

  To submit a code, you need to invoke the server method "submitCode",
  while standing next to the panel:

  Entities.callEntityServerMethod(this.id, 'submitCode', ['1111']);

  Just try not to make too many mistakes...
*/

(function () {

  Script.include('./api/player.js');
  Script.include('./api/map.js');

  function Level() {
    this.remotelyCallable = ['run'];
  }

  Level.prototype.run = function(_id, params) {
    // ----- EDIT CODE HERE ------
    var panel, path;

    panel = map.findObject('P');

    while ((path = map.pathTo(panel.x, panel.y - 1))) {
      player.move(path.x, path.y);
    }

    Entities.callEntityServerMethod(this.id, 'submitCode', ['1111']);
    // ---------------------------
  };

  Level.prototype.preload = function(_id) {
    this.id = _id;
  };

  return new Level();
});
`;

const BOARD_TEXT = `
#################
#             @ #
#               #
#               #
###P#      ######
    #      #     
    #      #     
    #      #     
    #      #     
#####      ######
#               #
# X             #
#################
`;


export class Level_06 extends LevelBase {
  
  private assignment: string[];
  private ticksToRenew: number;
  private barrier: string[];
  private invalidSubmitted: boolean;
  private unlocked: boolean;
  private drone: Position | null;
  
  constructor() {
    super(CONTENT, BOARD_TEXT, { 'P': 'W' });

    this.editor.state.fileName = 'tmp://level-06.js';
    this.board.state.offsetX = 2;
    this.board.state.offsetY = 2;
    this.items.push('<', '>', 'd');
    this.assignment = shuffle(['R', 'G', 'B', 'Y', 'W']);
    this.ticksToRenew = 0;
    this.barrier = [];
    this.invalidSubmitted = false;
    this.unlocked = false;
    this.drone = null;

    this.remotelyCallable = ['submitCode'];
    this.renewBarrier();
  }

  private drawLayer(i: number, enabled: boolean) {
    const value = i % 2 ? '>' : '<';
    const color = this.barrier[i];
    for (let x = 5; x < 11; x++) {
      this.board.setValue(x, i + 5, enabled ? value : ' ', color);
    }
  }

  private renewBarrier() {
    let i, x, value, color;

    if (this.unlocked) {
      return;
    }

    if (this.ticksToRenew) {
      this.ticksToRenew--;
      return;
    }

    this.ticksToRenew = 3 + Math.floor(Math.random() * 3);

    for (i = 0; i < 4; i++) {
      this.barrier[i] = randomValue(this.assignment);
      this.drawLayer(i, true);
    }
  }

  public submitCode(id: string, params: string[]) {
    let i, color, invalidCode;

    if (!params || !(params instanceof Array) || params.length !== 1) {
      throw new Error('Invalid params');
    }

    const code = params[0];
    if (typeof code !== 'string' || !code.match(/^[1-5]{4}$/)) {
      throw new Error('Invalid code');
    }

    const panel = this.board.findValue('P');
    if (Math.abs(panel.x - this.player.x) > 1 || Math.abs(panel.y - this.player.y) > 1) {
      throw new Error('Must stand next to panel' + JSON.stringify([panel, this.player]));
    }

    if (this.unlocked) {
      return;
    }

    invalidCode = false;

    for (i = 0; i < 4; i++) {
      color = this.assignment[parseInt(code[i], 10) - 1];
      if (this.barrier[i] === color) {
        this.drawLayer(i, false);
      } else {
        this.drawLayer(i, true);
        this.invalidSubmitted = true;
        invalidCode = true;
      }
    }

    if (!invalidCode) {
      this.unlocked = true;
    }

    return true; // make a tick
  }

  public tick() {
    super.tick();

    const player = this.player;
    const drone = this.drone;
    const droneSpawn = { x: 15, y: 1 };
    const target = player.y < 7 ? player : droneSpawn;
    this.renewBarrier();

    if (!this.invalidSubmitted) {
      return;
    }

    if (!drone) {
      this.drone = droneSpawn;
      this.board.setValue(this.drone.x, this.drone.y, 'd', 'R');
      return;
    }

    const path = this.board.findPath(drone.x, drone.y, target.x, target.y, this.items);
    if (path !== undefined) {
      this.move(drone, path.x, path.y);
    }
  }

  collision(source: string, target: string, x: number, y: number) {  
    super.collision(source, target, x, y);
    if (source === '@' && target === '<' || source === '@' && target === '>') {
      throw new Error('Collision with barrier');
    }
    if (source === '@' && target === 'd' || source === 'd' && target === '@') {
      throw new Error('Intercepted by drone');
    }
  }

}
