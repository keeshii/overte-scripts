import { CONFIG } from './constants';
import { CodenamesServer } from './codenames-server';
import { Message } from './messages';

export class CodenamesClient {

  private entityId: Uuid;
  private server: CodenamesServer;
  private lastClickTime: number;
  private mousePressOnEntityFn: (id: Uuid, event: PointerEvent) => void;

  public preload(entityId: Uuid) {
    this.mousePressOnEntityFn = (id: Uuid, event) => {
      this.onMousePress(id, event);
    };

    if (CONFIG.CLIENT_SIDE_ONLY) {
      this.server = new CodenamesServer();
      this.server.preload(entityId);
    }

    this.entityId = entityId;

    Entities.mousePressOnEntity.connect(this.mousePressOnEntityFn);
  }

  public unload() {
    if (this.mousePressOnEntityFn) {
      Entities.mousePressOnEntity.disconnect(this.mousePressOnEntityFn);
      this.mousePressOnEntityFn = null;
    }
    if (CONFIG.CLIENT_SIDE_ONLY) {
      this.server.unload();
    }
  }

  private callServer(method: string, params: string[] = []) {
    if (CONFIG.CLIENT_SIDE_ONLY) {
      (this.server as any)[method](this.entityId, params);
      return;
    }
    Entities.callEntityServerMethod(this.entityId, method, params);
  }

  private onMousePress(entityId: Uuid, event: PointerEvent) {
    const properties = Entities.getEntityProperties(entityId, ['name', 'text', 'parentID']);
    const parentId = properties.parentID;
    const name = properties.name;
    const clickTime = Date.now();

    if (event.button !== 'Primary') {
      return;
    }

    if (parentId !== this.entityId) {
      return;
    }

    // Prevents clicks on the board right after closing the overlay
    if (HMD.active && this.lastClickTime + CONFIG.CLICK_THROTTLE > clickTime) {
      return;
    }

    const match = name.match(/^Text.BoardWord\[(\d+)\]$/);
    if (match !== null) {
      this.callServer('submitWord', [properties.text]);
      this.lastClickTime = clickTime;
      return;
    }

    let value;

    switch (name) {
      case 'Text.Panel.Start':
        this.callServer('onSubmitClick', [properties.text]);
        break;
      case 'Text.Wall.EndTurn':
        this.callServer('onEndTurnClick');
        break;
      case 'Text.Panel.Abort':
        this.callServer('onCancelClick', [properties.text]);
        break;
      case 'Text.Panel.RedPlus':
        this.callServer('increaseGuesses', [Message.RED]);
        break;
      case 'Text.Panel.RedMinus':
        this.callServer('decreaseGuesses', [Message.RED]);
        break;
      case 'Text.Panel.BluePlus':
        this.callServer('increaseGuesses', [Message.BLUE]);
        break;
      case 'Text.Panel.BlueMinus':
        this.callServer('decreaseGuesses', [Message.BLUE]);
        break;
      case 'Text.Panel.RedWord':
        value = (Window.prompt(Message.ENTER_CLUE, '') || '').trim();
        this.callServer('setWord', [Message.RED, value]);
        break;
      case 'Text.Panel.BlueWord':
        value = (Window.prompt(Message.ENTER_CLUE, '') || '').trim();
        this.callServer('setWord', [Message.BLUE, value]);
        break;
      case 'Text.Panel.RedSubmit':
        this.callServer('submitClue', [Message.RED]);
        break;
      case 'Text.Panel.BlueSubmit':
        this.callServer('submitClue', [Message.BLUE]);
        break;
    }
  }

}

export default new CodenamesClient();
