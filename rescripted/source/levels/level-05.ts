import { LevelBase } from './level-base';
import { Position } from '../game/game.interface';

const CONTENT = `
"use strict";

/*
  Chapter 5 - switches

  The security is getting stronger. All switches on the floor must be
  turned on, in order to deactivate the laser beam.
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
    for (i = 0; i < 12; i++) {
        player.move(1, 0);
    }
    // ---------------------------
  };

  Level.prototype.preload = function(_id) { };

  return new Level();
});
`;

const BOARD_TEXT
  = '#################\n'
  + '#           |   #\n'
  + '# @         | X #\n'
  + '#           |   #\n'
  + '#################\n';


export class Level_05 extends LevelBase {

  private switches: { x: number, y: number, value: string, color?: string }[];

  constructor() {
    super(CONTENT, BOARD_TEXT, { '|': 'R' });

    this.editor.state.fileName = 'tmp://level-05.js';
    this.board.state.offsetX = 8;
    this.board.state.offsetY = 4;
    this.items.push('+');
    this.switches = [];

    this.createDominata();
  }

  public move(position: Position, dx: number, dy: number) {
    let oldX, oldY;
    if (position) {
      oldX = position.x;
      oldY = position.y;
    }
    super.move(position, dx, dy);
    this.redrawSwitch(oldX, oldY);
  }

  public collision(source: string, target: string, x: number, y: number) {  
    super.collision(source, target, x, y);
    if (source === '@' && target === '|') {
      throw new Error('Collision with laser');
    }
    if (source === '@' && target === '-') {
      this.switchItem(x, y, '+');
    }
    if (source === '@' && target === '+') {
      this.switchItem(x, y, '-');
    }
  }

  private createDominata() {
    let x: number, y: number, r: number;
    for (y = 1; y < 4; y++) {
      for (x = 4; x < 11; x++) {
        r = Math.floor(Math.random() * 2);
        switch (r) {
          case 0:
            this.switches.push({x, y, value: '+'});
            this.board.setValue(x, y, '+', 'G');
            break;
          case 1:
            this.switches.push({x, y, value: '-'});
            this.board.setValue(x, y, '-', 'B');
            break;
        }
      }
    }
  }

  private disableLaser() {
    let pos = this.board.findValue('|');
    while (pos) {
      this.board.setValue(pos.x, pos.y, ' ');
      pos = this.board.findValue('|');
    }
  }

  private switchItem(x: number, y: number, value: string) {
    let item: any, i: number;
    for (i = 0; i < this.switches.length; i++) {
      item = this.switches[i];
      if (item.x === x && item.y === y) {
        item.value = value;
        item.color = value === '+' ? 'G' : 'B';
        break;
      }
    }
    for (i = 0; i < this.switches.length; i++) {
      if (this.switches[i].value === '-') {
        return;
      }
    }
    this.disableLaser();
  }

  private redrawSwitch(x: number, y: number) {
    let item: any, i: number;
    for (i = 0; i < this.switches.length; i++) {
      item = this.switches[i];
      if (item.x === x && item.y === y) {
        this.board.setValue(item.x, item.y, item.value, item.color);
        break;
      }
    }
  }

}
