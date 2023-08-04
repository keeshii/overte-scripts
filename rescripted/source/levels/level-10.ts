import { LevelBase } from './level-base';

const CONTENT = `
"use strict";

/*
  Chapter 9 - the end

  Congratulations. Dr Eval escaped, the world is saved, etc.

  Hope you liked the game. As the reward, the level API is
  now unlocked in all levels.
*/
(function () { return this; });
`;

const BOARD_TEXT = 'The end.\n';

export class Level_10 extends LevelBase {
  
  constructor() {
    super(CONTENT, BOARD_TEXT);

    this.editor.state.fileName = 'tmp://level-10.js';

    this.board.state.offsetX = 4;
    this.board.state.offsetY = 2;
    this.completed = false;
  }

}
