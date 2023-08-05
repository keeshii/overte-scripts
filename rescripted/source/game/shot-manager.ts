import { Board } from './board';
import { Position, Shot } from './game.interface';

export type ShotCollisionFn = (target: string, x: number, y: number) => void;
export type ShotDirection = 'right' | 'left' | 'top' | 'bottom';

export class ShotManager {
  private board: Board;
  private shotCollisionFn: ShotCollisionFn;
  private shots: Shot[];

  constructor(board: Board, shotCollisionFn: ShotCollisionFn) {
    this.board = board;
    this.shotCollisionFn = shotCollisionFn;
    this.shots = [];
  }

  public tick() {
    let shot: Shot;

    // Move shots
    for (let i = 0; i < this.shots.length; i++) {
      shot = this.shots[i];

      if (shot.deleted) {
        continue;
      }

      const { x, y, dx, dy } = this.shots[i];
      const targetIndex = this.board.getIndex(x + dx, y + dy);
      const targetValue = this.board.state.values[targetIndex];

      // no collision
      if (targetValue === ' ') {
        if (shot.value) {
          this.board.setValue(x, y, ' ', ' ');
        }
        shot.value = dx ? '-' : '|';
        this.board.setValue(x + dx, y + dy, shot.value, 'Y');
        this.shots[i].x = x + dx;
        this.shots[i].y = y + dy;
        continue;
      }

      // collsion, remove shot
      this.markToRemove(x, y);

      if (!this.markToRemove(x + dx, y + dy) && targetValue) {
        this.shotCollisionFn(targetValue, x + dx, y + dy);
      }
    }

    this.removeMarked();
  }

  public move(position: Position, dx: number, dy: number) {
    const x = position.x;
    const y = position.y;
    const sourceIndex = this.board.getIndex(x, y);
    const sourceValue = this.board.state.values[sourceIndex];

    if (!sourceValue) {
      throw new Error('Move outside the board');
    }

    if (this.markToRemove(x + dx, y + dy)) {
      this.shotCollisionFn(sourceValue, x, y);
    }

    this.removeMarked();
  }

  public fire(x: number, y: number, direction: ShotDirection) {
    const shot = { x, y, dx: 0, dy: 0, value: '' };
    switch (direction) {
      case 'right':
        shot.dx = 1;
        break;
      case 'left':
        shot.dx = -1;
        break;
      case 'top':
        shot.dy = -1;
        break;
      case 'bottom':
        shot.dy = 1;
        break;
      default:
        throw new Error('Invalid direction');
    }
    this.shots.push(shot);
  }

  private markToRemove(x: number, y: number) {
    let i: number, shot: Shot, result: boolean;
    result = false;
    for (i = 0; i < this.shots.length; i++) {
      shot = this.shots[i];
      if (shot.x === x && shot.y === y) {
        if (shot.value) {
          this.board.setValue(shot.x, shot.y, ' ', ' ');
        }
        shot.deleted = true;
        result = true;
      }
    }
    return result;
  }

  private removeMarked() {
    let i: number, shot: Shot;
    for (i = this.shots.length - 1; i >= 0; i--) {
      shot = this.shots[i];
      if (shot.deleted) {
        this.shots.splice(i, 1);
      }
    }
  }
}
