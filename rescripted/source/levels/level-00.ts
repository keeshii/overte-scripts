import { LevelBase } from './level-base';

const CONTENT = `
/*
 * Rescripted -or- The mission of the Dr Eval.
 *
 * Help Dr Eval to complete levels by writing the code that solves
 * variety of algorithmic problems in JavaScript.
 *
 * Your code will be executed with the eval function in your interface app.
 *
 * Controls:
 * - save - saves the game state in your interface app
 * - run - executes the code (even if not saved),
 * - reload - restores the game state,
 * - reset level - reverts all changes in the currently displayed level,
 * - back/next - navigate through levels
 *
 * Good luck hero,
 * The fate of Dr Eval lies in your hands.
 */
(function () { return this; });
`;

const BOARD_TEXT
  = '    Press Next button    \n'
  + 'to enter the first level.\n';

export class Level_00 extends LevelBase {
  
  constructor() {
    super(CONTENT, BOARD_TEXT);

    this.editor.state.fileName = 'tmp://level-00.js';

    this.board.state.offsetX = 6;
    this.board.state.offsetY = 5;
    this.completed = true;
  }

}
