import { Board } from '../game/board';
import { Editor } from '../game/editor';
import { ColorMap, Position } from '../game/game.interface';
import { ShotManager } from '../game/shot-manager';

const COLOR_MAP: ColorMap = {
  '@': 'B',
  'X': 'W'
};

export abstract class LevelBase {

  public board: Board;
  public editor: Editor;
  public completed: boolean;
  public energy: number;
  public player: Position;
  public exit: Position;
  public items: string[];
  public shotManager: ShotManager;
  public remotelyCallable: string[] = [];

  constructor(content: string, boardText: string, colorMap?: ColorMap) {
    colorMap = { ...COLOR_MAP, ...colorMap };
    this.board = Board.fromText(boardText, colorMap);

    this.editor = new Editor();
    this.editor.state.content = content;

    this.items = ['@', 'X', '-', '|'];
    this.completed = false;
    this.player = this.board.findValue('@');
    this.exit = this.board.findValue('X');

    this.shotManager = new ShotManager(this.board,
      (value, x, y) => this.shotCollision(value, x, y));
    this.energy = 0;
  }

  tick() {
    this.shotManager.tick();
  }

  move(position: Position, dx: number, dy: number) {
    if (dx === 0 && dy === 0) {
      return;
    }
    if ([-1, 0, 1].indexOf(dx) === -1 || [-1, 0, 1].indexOf(dy) === -1) {
      throw new Error('Invalid move (' + dx + ', ' + dy + ')');
    }
    if (!position) {
      throw new Error('Invalid position');
    }

    const { x, y } = position;

    // handle moving into shots
    this.shotManager.move(position, dx, dy);

    const sourceIndex = this.board.getIndex(x, y);
    const targetIndex = this.board.getIndex(x + dx, y + dy);
    const sourceColor = this.board.state.colors[sourceIndex];
    const sourceValue = this.board.state.values[sourceIndex];
    const targetValue = this.board.state.values[targetIndex];

    if (!sourceValue || !targetValue) {
      throw new Error('Move outside the board');
    }
    if (targetValue !== ' ' && this.items.indexOf(targetValue) === -1) {
      throw new Error('Cannot move to a non-empty square');
    }

    position.x = x + dx;
    position.y = y + dy;

    this.board.setValue(x + dx, y + dy, sourceValue, sourceColor);
    this.board.setValue(x, y, ' ');

    if (this.items.indexOf(targetValue) !== -1) {
      this.collision(sourceValue, targetValue, x + dx, y + dy);
    }
  }

  collision(source: string, target: string, x: number, y: number) {
    if (source === '@' && target === 'X') {
      this.completed = true;
      throw new Error('Level completed');
    }
    if (source === '@' && target === 'E') {
      this.energy = 3;
    }
  }

  shotCollision(target: string, x: number, y: number) {
    if (target === '@') {
      throw new Error('Player hit by laser');
    }
  }

}
