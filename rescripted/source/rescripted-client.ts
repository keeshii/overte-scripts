import { CONFIG, MESSAGE_CHANNEL } from './constants';
import { LocalStore } from './game/local-store';
import { RescriptedServer } from './rescripted-server';
import { LocalStoreData } from './game/game.interface';
import { WebAction } from './rescripted.interface';

export class RescriptedClient {

  private entityId: Uuid;
  private server: RescriptedServer;
  private entityClickFn: (id: Uuid, event: PointerEvent) => void;
  private webEventReceivedFn: (id: Uuid, message: string) => void;
  private messageReceivedFn: (channel: string, message: string, senderId: Uuid, localOnly: boolean) => void;
  private localStore: LocalStore;
  public remotelyCallable: string[];

  constructor() {
    this.entityClickFn = (id, event) => this.onEntityClick(id, event);
    this.webEventReceivedFn = (id, message) => this.onWebEventReceived(id, message);
    this.messageReceivedFn = (channel, message, senderId, localOnly) =>
      { this.onMessageReceivedFn(channel, message, senderId, localOnly); };

    this.localStore = new LocalStore();

    this.remotelyCallable = [
      'emitWebEvent'
    ];
  }

  public preload(entityId: Uuid) {
    if (CONFIG.CLIENT_SIDE_ONLY) {
      this.server = new RescriptedServer();
      this.server.preload(entityId);
    }

    this.entityId = entityId;
    Entities.mousePressOnEntity.connect(this.entityClickFn);
    Entities.webEventReceived.connect(this.webEventReceivedFn);
    Messages.subscribe(MESSAGE_CHANNEL);
    Messages.messageReceived.connect(this.messageReceivedFn);
  }

  public unload() {
    Entities.mousePressOnEntity.disconnect(this.entityClickFn);
    Entities.webEventReceived.disconnect(this.webEventReceivedFn);
    Messages.unsubscribe(MESSAGE_CHANNEL);
    Messages.messageReceived.disconnect(this.messageReceivedFn);

    if (CONFIG.CLIENT_SIDE_ONLY) {
      this.server.unload();
    }
  }

  public emitWebEvent(_id: string, params: string[]) {
    const message = params[0];
    Entities.emitScriptEvent(this.entityId, message);
  }

  public saveGameState(gameState: LocalStoreData) {
    this.localStore.saveStore(gameState, () => {
      this.emitToWebView({ type: 'SHOW_MESSAGE', message: 'Game saved' });
    });
  }

  private callServer(method: string, params: string[] = []) {
    params.unshift(MyAvatar.sessionUUID);
    if (CONFIG.CLIENT_SIDE_ONLY) {
      (this.server as any)[method](this.entityId, params);
      return;
    }
    Entities.callEntityServerMethod(this.entityId, method, params);
  }

  private onEntityClick(entityId: Uuid, event: PointerEvent) {
    const properties = Entities.getEntityProperties(entityId, ['name', 'text', 'parentID', 'visible']);
    const parentId = properties.parentID;
    const name = properties.name;

    if (event.button !== 'Primary') {
      return;
    }

    if (parentId !== this.entityId || properties.visible === false) {
      return;
    }

    switch (name) {
      case 'Text.Rescripted.ResetGame':
        this.callServer('resetGame');
        break;
      case 'Text.Rescripted.ResetLevel':
        this.callServer('resetLevel');
        break;
      case 'Text.Rescripted.Back':
        this.callServer('showPreviousLevel');
        break;
      case 'Text.Rescripted.Next':
        this.callServer('showNextLevel');
        break;
    }
  }

  private onWebEventReceived(id: Uuid, message: string) {
    let action: WebAction;
    if (id !== this.entityId) {
      return;
    }
    try {
      action = JSON.parse(message);
    } catch (e) {
      return;
    }

    switch (action.type) {
      case 'INITIALIZE': {
        // console.log('EDITOR> ', { type: 'SET_STATE', state: editor.state });
        this.callServer('initialize');
        break;
      }
      case 'UPDATE':
        this.callServer('update', [JSON.stringify(action)]);
        break;
      case 'SET_SCROLL':
        
        break;
      case 'SAVE':
        this.callServer('saveGameState');
        break;
      case 'RELOAD': {
        this.localStore.loadStore(store => {
          this.callServer('loadGameState', [JSON.stringify(store)]);
        });
        break;
      }
      case 'RUN':
        this.callServer('runScript');
        break;
      case 'RUN':
        this.callServer('stopScript');
        break;
    }
  }

  private onMessageReceivedFn(channel: string, message: string, senderId: Uuid, localOnly: boolean) {
    let action: WebAction;
    if (channel !== MESSAGE_CHANNEL) {
      return;
    }
    this.emitWebEvent(this.entityId, [message]);
  }

  private emitToWebView(action: WebAction) {
    const message = JSON.stringify(action);
    this.emitWebEvent(this.entityId, [message]);
  }

}

export default new RescriptedClient();
