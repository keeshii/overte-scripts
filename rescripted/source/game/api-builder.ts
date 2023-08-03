import { LevelBase } from "../levels/level-base";
import { Tick } from "./game.interface";
import { ShotDirection } from "./shot-manager";

export const MAX_ACTIONS_COUNT = 1024;
export type RefreshGlobalFn = (globals: {[key: string]: any}) => void;

export class ApiBuilder {

  private level: LevelBase;
  private ticks: Tick[];

  constructor(level: LevelBase, ticks: Tick[]) {
    this.level = level;
    this.ticks = ticks;
  }

  createConsole() {
    const self = this;
    return {
      log: function(...args: any[]) {
        self.ticks.push({ logs: [...args] });
      }
    };
  }

  createScript(refreshGlobalsFn: RefreshGlobalFn) {
    const self = this, globals: {[key: string]: any} = {};

    const playerApi = {
      move: function(x: number, y: number) {
        const level = self.level;
        level.move(level.player, x, y);
        self.tick();
      }
    };

    Object.defineProperty(playerApi, 'x', {
      get() {
        return self.level.player.x;
      },
      set(newValue) {},
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(playerApi, 'y', {
      get() {
        return self.level.player.y;
      },
      set(newValue) {},
      enumerable: true,
      configurable: true
    });

    const mapApi = {
      findObject: function(value: string) {
        const level = self.level;
        return level.board.findValue(value);
      },
      getValue: function(x: number, y: number) {
        const level = self.level;
        const index = level.board.getIndex(x, y);
        return level.board.state.values[index];
      },
      getColor: function(x: number, y: number) {
        const level = self.level;
        const index = level.board.getIndex(x, y);
        return level.board.state.colors[index];
      },
      pathTo: function(x: number, y: number) {
        const level = self.level;
        const from = level.player;
        return level.board.findPath(from.x, from.y, x, y, level.items);
      }
    };

    const gunApi = {
      fire: function(direction: ShotDirection) {
        const level = self.level;
        const player = level.player;
        if (!level.energy) {
          throw new Error('No energy to fire');
        }
        level.energy -= 1;
        level.shotManager.fire(player.x, player.y, direction);
        self.tick();
      }
    };

    Object.defineProperty(gunApi, 'energy', {
      get() {
        return self.level.energy;
      },
      set(newValue) {},
      enumerable: true,
      configurable: true
    });

    return {
      include: function(path: string) {
        switch (path) {
          case './api/player.js':
            globals['player'] = playerApi;
            refreshGlobalsFn(globals);
            break;
          case './api/map.js':
            globals['map'] = mapApi;
            refreshGlobalsFn(globals);
            break;
          case './api/gun.js':
            globals['gun'] = gunApi;
            refreshGlobalsFn(globals);
            break;
          case './api/level.js':
            globals['level'] = self.level;
            refreshGlobalsFn(globals);
            break;
        }
      }
    };
  }

  createEntities() {
    const self = this;
    return {
      callEntityServerMethod: function(id: string, method: string, params: string[]) {
        const level = self.level;
        if (level.remotelyCallable.indexOf(method) === -1) {
          throw new Error('Server method is not callable');
        }
        if ((level as any)[method](id, params)) {
          self.tick();
        }
      }
    };
  }

  tick() {
    const board = this.level.board;
    this.level.tick();
    this.ticks.push({ state: board.state });
    board.state = { ...board.state };
    if (this.ticks.length >= MAX_ACTIONS_COUNT) {
      throw new Error('Maximum simulation time reached');
    }
  }

}
