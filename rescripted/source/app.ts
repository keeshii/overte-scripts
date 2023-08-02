import { AppServer } from './app-server';
import { ServerStore } from './server-store';
import { LocalStore } from './local-store';
import { Runner } from './runner';
import { LevelBase } from './levels/level-base';

export class App {

  private runner: Runner;
  private serverStore: ServerStore;
  private localStore: LocalStore;
  private level: LevelBase;

  constructor() {
    // this.server = new AppServer();
    this.runner = new Runner();
    this.serverStore = new ServerStore();
    this.localStore = new LocalStore(this.serverStore);
    this.level = this.serverStore.resetAll();
  }

  handleEditorAction(sender, action) {
    const editor = this.level.editor;
    // console.log('EDITOR< ', action);
    switch (action.type) {
      case 'INITIALIZE': {
        // console.log('EDITOR> ', { type: 'SET_STATE', state: editor.state });
        const status = this.runner.status;
        const { content, fileName } = editor.state;
        sender.send({ type: 'SET_STATE', content, fileName, status });
        break;
      }
      case 'UPDATE':
        action.version = editor.state.version;
        if (editor.applyUpdate(action)) {
          sender.sendAll(action);
        }
        break;
      case 'SET_SCROLL':
        sender.sendAll(action);
        break;
      case 'SAVE':
        this.localStore.saveStore(store => {
          sender.send({ type: 'SHOW_MESSAGE', message: 'Game saved' });
        });
        break;
      case 'RELOAD': {
        this.runner.stop();
        this.level = this.serverStore.fromLocalStore(this.localStore.store);
        const { content, fileName } = this.level.editor.state;
        const status = this.runner.status;
        sender.send({ type: 'SET_STATE', content, fileName, status });
        this.server.boardServer.sendToAll({ type: 'SET_STATE', state: this.level.board.state });
        break;
      }
      case 'RUN': {
        const apiUnlocked = this.serverStore.isApiUnlocked(this.level);
        this.level = this.serverStore.reloadLevel();
        this.server.boardServer.sendToAll({ type: 'SET_STATE', state: this.level.board.state });
        this.runner.execute(this.level, apiUnlocked);
        break;
      }
    }
  }

  handleBoardAction(sender, action) {    
    // console.log('BOARD< ', action);
    switch (action.type) {
      case 'GET_STATE': {
        const board = this.level.board;
        // console.log('BOARD> ', { type: 'SET_STATE', state: board.state });
        sender.send({ type: 'SET_STATE', state: board.state });
        break;
      }
      case 'NEXT': {
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
        this.server.editorServer.sendToAll({ type: 'SET_STATE', content, fileName });
        this.server.boardServer.sendToAll({ type: 'SET_STATE', state: board.state });
        break;
      }
      case 'BACK': {
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
        this.server.editorServer.sendToAll({ type: 'SET_STATE', content, fileName });
        this.server.boardServer.sendToAll({ type: 'SET_STATE', state: board.state });
        break;
      }
      case 'RESET': {
        this.runner.stop();
        this.level = this.serverStore.resetLevel();
        const { content, fileName } = this.level.editor.state;
        const board = this.level.board;
        this.server.editorServer.sendToAll({ type: 'SET_STATE', content, fileName });
        this.server.boardServer.sendToAll({ type: 'SET_STATE', state: board.state });
        break;
      }
      case 'ABORT': {
        this.runner.stop();
        this.level = this.serverStore.resetAll();
        const { content, fileName } = this.level.editor.state;
        const board = this.level.board;
        this.server.editorServer.sendToAll({ type: 'SET_STATE', content, fileName });
        this.server.boardServer.sendToAll({ type: 'SET_STATE', state: board.state });
        break;
      }
    }
  }

  handleRunnerTick(tick) {
    if (tick.logs) {
      this.server.editorServer.sendToAll({ type: 'LOG_INFO', items: tick.logs });
    }

    if (tick.error) {
      let line, col;
      const match = tick.error.stack.match(/<anonymous>:(\d+):(\d+)/);
      if (match) {
        line = parseInt(match[1], 10);
        col = parseInt(match[2], 10);
      }
      const error = tick.error.toString();
      this.runner.status = tick.error.message;
      this.server.editorServer.sendToAll({ type: 'LOG_ERROR', error, line, col });
    }

    if (tick.status) {
      this.server.editorServer.sendToAll({ type: 'SET_STATUS', status: tick.status });
    }

    if (tick.state) {
      this.level.board.state = tick.state;
      this.server.boardServer.sendToAll({ type: 'SET_STATE', state: tick.state });
    }
  }

  listen(port) {
    this.localStore.loadStore(store => {
      this.level = this.serverStore.fromLocalStore(store);
    });

    this.runner.setTickCallback(update => this.handleRunnerTick(update));

    this.server.setEditorActionCallback(
      (sender, action) => this.handleEditorAction(sender, action));

    this.server.setBoardActionCallback(
      (sender, action) => this.handleBoardAction(sender, action));

    this.server.init();
    this.server.listen(port);
    console.log('Listen on port ' + port);
  }

}
