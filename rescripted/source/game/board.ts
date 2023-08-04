import { BoardState, ColorMap, Position } from './game.interface';


export class Board {

  public state: BoardState;

  constructor() {    
    this.state = {
      offsetX: 0,
      offsetY: 0,
      values: '',
      colors: '',
      width: 0
    };
  }

  public static fromText(boardText: string, colorMap: ColorMap): Board {
    const board = new Board();

    const lines = boardText.split('\n');
    const values = [];
    const colors = [];
    let x, y, value, color, width;

    width = 0;
    for (y = 0; y < lines.length; y++) {
      width = Math.max(width, lines[y].length);
    }

    for (y = 0; y < lines.length; y++) {
      for (x = 0; x < lines[y].length; x++) {
        value = lines[y][x] || ' ';
        color = colorMap[value] || ' ';
        values.push(value);
        colors.push(color);
      }
    }

    board.state.values = values.join('');
    board.state.colors = colors.join('');
    board.state.width = width;
    return board;
  }

  public clear() {
    this.state.values = '';
    this.state.colors = '';
    this.state.width = 0;
  }

  public findValue(value: string): Position | undefined {
    const width = this.state.width;
    const index = this.state.values.indexOf(value);

    if (index === -1 || width === 0) {
      return;
    }

    const x = index % width;
    const y = Math.floor(index / width);
    return { x, y };
  }

  public getIndex(x: number, y: number): number {
    return y * this.state.width + x;
  }

  public setValue(x: number, y: number, value?: string, color?: string) {
    if (this.state.width === 0) {
      return;
    }
    const index = this.getIndex(x, y);
    let before, after;
    
    if (value !== undefined) {
      before = this.state.values.substring(0, index);
      after = this.state.values.substring(index + 1, this.state.values.length);
      this.state.values = before + value + after;
    }
    
    if (color !== undefined) {
      before = this.state.colors.substring(0, index);
      after = this.state.colors.substring(index + 1, this.state.values.length);
      this.state.colors = before + color + after;
    }
  }

  public findPath(fromX: number, fromY: number, toX: number, toY: number, walkable: string[]): Position | undefined {
    let i, index, item, value, canEnter, x, y;

    if (fromX === toX && fromY === toY) {
      return;
    }

    const queue = [{ x: toX, y: toY }];
    const matrix = [];
    const moves = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    const movesLength = moves.length;

    index = this.getIndex(toX, toY);
    matrix[index] = true;

    while (queue.length) {
      item = queue.shift();

      for (i = 0; i < movesLength; i++) {
        x = item.x + moves[i][0];
        y = item.y + moves[i][1];
        index = this.getIndex(x, y);
        value = this.state.values[index];

        if (x === fromX && y === fromY) {
          return { x: item.x - fromX, y: item.y - fromY };
        }

        canEnter = value === ' ' || walkable.indexOf(value) !== -1;
        if (!value || matrix[index] || !canEnter) {
          continue;
        }

        matrix[index] = true;
        queue.push({ x, y });
      }
    }
  }

}
