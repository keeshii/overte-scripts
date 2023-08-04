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


  public prepareForExecute() {
    const SCRIPT_LOAD_TIMEOUT = 5000;
    this.stop();
    this.setStatus('PENDING');
    this.loadTimer = Script.setTimeout(() => {
      this.setStatus('UNLOADED');
    }, SCRIPT_LOAD_TIMEOUT);
  }

  public execute(simulation: Tick[]) {
    const ACTION_TIME = 250;

    if (this.status !== 'PENDING') {
      return;
    }
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

    executeAction(simulation);
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

  public simulate(level: LevelBase, apiUnlocked: boolean) {
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
    if (level.completed && ticks.length > 0) {
      ticks[ticks.length - 1].completed = true;
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
