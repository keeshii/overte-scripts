import { BoardRenderer } from './board-renderer';
import { CONFIG, MESSAGE_CHANNEL } from './constants';
import { StatusType, Tick } from './game/game.interface';
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
      'runSimulation',
      'stopScript'
    ];
  }

  public unload() { }


  public resetGame(_id: Uuid, params: string[]) {
    this.runner.stop();
    this.level = this.serverStore.resetAll();
    const { content, fileName } = this.level.editor.state;
    const board = this.level.board;
    this.sendToAll({ type: 'SET_STATE', content, fileName });
    this.boardRenderer.render(board.state);
  }

  public resetLevel(_id: Uuid, params: string[]) {
    this.runner.stop();
    this.level = this.serverStore.resetLevel();
    const { content, fileName } = this.level.editor.state;
    const board = this.level.board;
    this.sendToAll({ type: 'SET_STATE', content, fileName });
    this.boardRenderer.render(board.state);
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
    const clientId = params[0];
    const gameState = this.serverStore.toLocalStore();
    this.callClient(clientId, 'persistGameState', [JSON.stringify(gameState)]);
  }

  public loadGameState(_id: Uuid, params: string[]) {
    const clientId = params[0];
    let gameState: any;
    try {
      gameState = JSON.parse(params[1]);
    } catch (e) {
      return;
    }
    this.runner.stop();
    this.level = this.serverStore.fromLocalStore(gameState);
    const { content, fileName } = this.level.editor.state;
    const status = this.runner.status;
    this.sendToAll({ type: 'SET_STATE', content, fileName, status });
    this.boardRenderer.render(this.level.board.state);
    this.sendToClient(clientId, { type: 'SHOW_MESSAGE', message: 'Game loaded' });
  }

  public runScript(_id: Uuid, params: string[]) {
    const clientId = params[0];
    const apiUnlocked = this.serverStore.isApiUnlocked(this.level);
    const levelNo = this.serverStore.levelNo;
    const content = this.level.editor.state.content;
    this.runner.prepareForExecute();
    this.callClient(clientId, 'createSimulation', [
      String(levelNo),
      content,
      apiUnlocked ? 'true' : 'false'
    ]);
  }

  public runSimulation(_id: Uuid, params: string[]) {
    let simulation: any;
    try {
      simulation = JSON.parse(params[1]);
    } catch (e) {
      return;
    }
    this.runner.execute(simulation);
  }

  public stopScript(_id: Uuid, params: string[]) {
    this.runner.stop();
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

    if (tick.completed) {
      this.level.completed = tick.completed;
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
  }

  private sendToClient(clientId: Uuid, action: WebAction) {
    this.callClient(clientId, 'emitWebEvent', [JSON.stringify(action)]);
  }

  private sendToAll(action: WebAction) {
    Messages.sendMessage(MESSAGE_CHANNEL, JSON.stringify(action));
  }

}

export default new RescriptedServer();
