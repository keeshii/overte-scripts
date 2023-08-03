import { ApiBuilder } from './api-builder';
import { LevelBase } from '../levels/level-base';
import { ErrorInfo, StatusType, Tick } from './game.interface';
import { runInContext } from './run-in-context';

export class Runner {
  private tickCallback: (tick: Tick) => void;
  private loadTimer?: number;
  private runTimer?: number;
  public status: StatusType;

  constructor() {
    this.tickCallback = function () {};
    this.loadTimer = undefined;
    this.runTimer = undefined;
    this.status = 'UNLOADED';
  }

  public setTickCallback(callback: (tick: Tick) => void) {
    this.tickCallback = callback;
  }


  public execute(level: LevelBase, apiUnlocked: boolean) {
    const ACTION_TIME = 250;
    const SCRIPT_LOAD_TIME = 250;

    this.setStatus('PENDING');

    if (this.runTimer) {
      Script.clearTimeout(this.runTimer);
      this.runTimer = undefined;
    }

    if (this.loadTimer) {
      Script.clearTimeout(this.loadTimer);
    }

    this.loadTimer = Script.setTimeout(() => {
      this.setStatus('RUNNING');

      const self = this;
      function executeAction(ticks: Tick[]) {
        self.runTimer = Script.setTimeout(() => {
          let tick;
          do {
            tick = ticks.shift();
            self.tickCallback(tick);
          } while (ticks.length > 0 && !tick.state);
          if (ticks.length === 0) {
            self.setStatus('UNLOADED');
            return;
          }
          executeAction(ticks);
        }, ACTION_TIME);
      }

      const allTicks = this.run(level, apiUnlocked);
      executeAction(allTicks);

    }, SCRIPT_LOAD_TIME);
  }

  public stop() {
    if (this.runTimer) {
      Script.clearTimeout(this.runTimer);
      this.runTimer = undefined;
    }
    if (this.loadTimer) {
      Script.clearTimeout(this.loadTimer);
      this.loadTimer = undefined;
    }
    this.setStatus('UNLOADED');
  }

  private run(level: LevelBase, apiUnlocked: boolean) {
    const ticks: Tick[] = [{ state: level.board.state }];
    level.board.state = { ...level.board.state };

    const context = { _vm: {
      code: level.editor.state.content,
      fileName: level.editor.state.fileName,
      apiUnlocked,
      api: new ApiBuilder(level, ticks)
    } };

    try {
      runInContext.call(context);
    } catch (error) {
      const maxLineNumber = level.editor.state.content.split('\n').length;
      const errorInfo = this.getErrorInfo(error, maxLineNumber);
      ticks.push({ state: level.board.state, error: errorInfo });
    }
    return ticks;
  }

  private getErrorInfo(error: Error, maxLineNumber: number): ErrorInfo {
    let message: string = error.toString();
    let line: number;
    let col: number;

    if (error.stack !== undefined) {
      const match = error.stack.match(/<anonymous>:(\d+):(\d+)/);
      if (match) {
        line = parseInt(match[1], 10);
        col = parseInt(match[2], 10);
      }
    } else {
      let lineNumber: number = (error as any).lineNumber;
      if (lineNumber !== undefined && lineNumber <= maxLineNumber) {
        line = lineNumber;
        col = 1;
      }
    }
    return { message, line, col };
  }

  private setStatus(status: StatusType) {
    if (this.status !== status) {
      this.status = status;
      this.tickCallback({ status });
    }
  }

}
