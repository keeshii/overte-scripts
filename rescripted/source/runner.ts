import { ApiBuilder } from './api-builder';
import { LevelBase } from './levels/level-base';
import { StatusType, Tick } from './rescripted.interface';
import { runInContext } from './run-in-context';

export class Runner {
  private tickCallback: (tick: Tick) => void;
  private loadTimer?: number;
  private runTimer?: number;
  private status: StatusType;

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
      const module = {};
      runInContext.call(context, module);
    } catch (error) {
      ticks.push({ state: level.board.state, error: error });
    }
    return ticks;
  }

  private setStatus(status: StatusType) {
    if (this.status !== status) {
      this.status = status;
      this.tickCallback({ status });
    }
  }

}
