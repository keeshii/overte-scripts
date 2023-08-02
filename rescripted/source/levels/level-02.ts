import { LevelBase } from './level-base';
import { Maze } from '../utils/maze';

const CONTENT = `
"use strict";

/*
  Chapter 2 - path finding

  Things are getting complicated. The floor layout seems to change
  after each execution.

  Fortunately I know the functions, which makes the problem easier:
  
  Use following API:
  - player.x, player.y  -> returns player coordinates,
  - map.findObject('X') -> returns absolute position of the given object (x, y),
  - map.pathTo(x, y)    -> returns relative position (x, y) to the nearest
                           square on the path to given coordinates.
                           Or undefined if the destination is not reachable.
*/

(function () {

  Script.include('./api/player.js');
  Script.include('./api/map.js');

  function Level() {
    this.remotelyCallable = ['run'];
  }

  Level.prototype.run = function(_id, params) {
    var exit, path;

    exit = map.findObject('X');

    while ((path = map.pathTo(exit.x, exit.y))) {
      player.move(path.x, path.y);
    }
  };

  Level.prototype.preload = function(_id) { };

  return new Level();
});
`;

const BOARD_TEXT = `
####################   
#k                 #   
#                  #   
#                  #   
#                  ####
#                  | X#
#                  ####
#@                 #   
####################   
`;


export class Level_02 extends LevelBase {

  private hasKey: boolean;

  constructor() {
    super(CONTENT, BOARD_TEXT, { '|': 'Y', 'k': 'Y' });

    this.editor.state.fileName = 'tmp://level-02';
    this.board.state.offsetX = 100;
    this.board.state.offsetY = 100;
    this.items.push('k');
    this.hasKey = false
    
    this.createMaze();
  }

  private createMaze() {
    const maze = new Maze(20, 9);
    maze.create((x, y, solid) => {
      if (solid) {
        const index = this.board.getIndex(x, y);
        const value = this.board.state.values[index];
        if (value === ' ') {
          this.board.setValue(x, y, '#');
        }
      }
    });
  }

  public collision(source: string, target: string, x: number, y: number) {
    super.collision(source, target, x, y);
    if (source === '@' && target === 'k') {
      this.hasKey = true;
    }
    if (!this.hasKey && source === '@' && target === '|') {
      throw new Error('Collision with door');
    }
  }

}
