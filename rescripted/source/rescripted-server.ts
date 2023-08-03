import { BoardRenderer } from './board-renderer';
import { CONFIG, MESSAGE_CHANNEL } from './constants';
import { StatusType, Tick, UpdateAction } from './game/game.interface';
import { Runner } from './game/runner';
import { ServerStore } from './game/server-store';
import { LevelBase } from './levels/level-base';
import { WebAction } from './rescripted.interface';

export class RescriptedServer {

  private entityId: Uuid;
  private remotelyCallable: string[];
  private boardRenderer: BoardRenderer;
  private runner: Runner;
  private serverStore: ServerStore;
  private level: LevelBase;
  private client: any;

  constructor() {
    this.runner = new Runner();
    this.serverStore = new ServerStore();
    this.level = this.serverStore.resetAll();
  }

  public preload(entityId: Uuid) {
    this.entityId = entityId;

    Script.setTimeout(() => {
      this.initLayoutEntities();
      this.resetGame(entityId, []);
      this.runner.setTickCallback(tick => this.handleRunnerTick(tick));
    }, CONFIG.INIT_ENTITIES_DELAY);

    this.remotelyCallable = [
      'resetGame',
      'resetLevel',
      'showPreviousLevel',
      'showNextLevel',
      'initialize',
      'update',
      'saveGameState',
      'loadGameState',
      'runScript',
      'stopScript'
    ];
  }

  public unload() { }


  public resetGame(_id: Uuid, params: string[]) {
    this.boardRenderer.render(this.level.board.state);
  }

  public resetLevel(_id: Uuid, params: string[]) {

  }

  public showPreviousLevel(_id: Uuid, params: string[]) {
    if (this.serverStore.levelNo === 0) {
      return;
    }
    const level = this.serverStore.prevLevel();
    if (level === undefined) {
      return;
    }
    this.runner.stop();
    this.level = level;
    const { content, fileName } = this.level.editor.state;
    const board = this.level.board;
    this.sendToAll({ type: 'SET_STATE', content, fileName });
    this.boardRenderer.render(board.state);
  }

  public showNextLevel(_id: Uuid, params: string[]) {
    if (!this.level.completed) {
      return;
    }
    const level = this.serverStore.nextLevel();
    if (level === undefined) {
      return;
    }
    this.runner.stop();
    this.level = level;
    const { content, fileName } = this.level.editor.state;
    const board = this.level.board;
    this.sendToAll({ type: 'SET_STATE', content, fileName });
    this.boardRenderer.render(board.state);
  }

  public initialize(_id: Uuid, params: string[]) {
    const clientId = params[0];
    const status = this.runner.status;
    const { content, fileName } = this.level.editor.state;
    this.sendToClient(clientId, { type: 'SET_STATE', content, fileName, status });
  }

  public update(_id: Uuid, params: string[]) {
    let action: any;
    try {
      action = JSON.parse(params[1]);
    } catch (e) {
      return;
    }
    if (this.level.editor.applyUpdate(action)) {
      this.sendToAll(action);
    }
  }

  public saveGameState(_id: Uuid, params: string[]) {

  }

  public loadGameState(_id: Uuid, params: string[]) {
    const store = params[1];
  }

  public runScript(_id: Uuid, params: string[]) {
    const apiUnlocked = this.serverStore.isApiUnlocked(this.level);
    this.level = this.serverStore.reloadLevel();
    this.boardRenderer.render(this.level.board.state);
    this.runner.execute(this.level, apiUnlocked);
  }

  public stopScript(_id: Uuid, params: string[]) {

  }

  private handleRunnerTick(tick: Tick) {
    if (tick.logs) {
      this.sendToAll({ type: 'LOG_INFO', items: tick.logs });
    }

    if (tick.error) {
      const error = tick.error.message;
      const line = tick.error.line;
      const col = tick.error.col;
      this.runner.status = tick.error.message as StatusType;
      this.sendToAll({ type: 'LOG_ERROR', error, line, col });
    }

    if (tick.status) {
      this.sendToAll({ type: 'SET_STATUS', status: tick.status });
    }

    if (tick.state) {
      this.level.board.state = tick.state;
      this.boardRenderer.render(tick.state);
    }
  }

  private initLayoutEntities() {
    const position = Entities.getEntityProperties(this.entityId, ['position']).position;
    const entityIds = Entities.findEntities(position, 50);
    const entities = entityIds.map(id => Entities.getEntityProperties(id, ['parentID', 'name']));
    this.boardRenderer = new BoardRenderer(this.entityId, entityIds, entities);
  }

  private callClient(clientId: Uuid, methodName: string, params: string[]) {
    if (this.client) {
      this.client[methodName](this.entityId, params);
      return;
    }
    Entities.callEntityClientMethod(clientId, this.entityId, methodName, params);
  };

  private sendToClient(clientId: Uuid, action: WebAction) {
    this.callClient(clientId, 'emitWebEvent', [JSON.stringify(action)]);
  }

  private sendToAll(action: WebAction) {
    Messages.sendMessage(MESSAGE_CHANNEL, JSON.stringify(action));
  }

}

export default new RescriptedServer();
