import { LocalStoreData } from "./rescripted.interface";
import { ServerStore } from "./server-store";

export class LocalStore {

  private readonly STORE_KEY = 'overte-scripts-rescripted'
  private serverStore: ServerStore;
  private store: LocalStoreData;

  constructor(serverStore: ServerStore) {
    this.serverStore = serverStore;
    this.reset();
  }

  public reset() {
    this.store = {
      levelNo: 0,
      levels: []
    };
  }

  public loadStore(callback: (store: LocalStoreData) => void) {
    if ((Script as any).context !== 'entity_client') {
      return;
    }
    const store: LocalStoreData = Settings.getValue(this.STORE_KEY, null);
    if (!store) {
      return;
    }
    this.store = store;
    callback(this.store);
  }

  public saveStore(callback: (store: LocalStoreData) => void) {
    this.store.levelNo = this.serverStore.levelNo;
    this.store.levels = this.serverStore.levels.map(level => {
      const newLevel = {
        editor: level.editor,
        completed: level.completed
      };
      return newLevel;
    });
    Settings.setValue(this.STORE_KEY, this.store);
    callback(this.store);
  }

  public getFileContent(): string {
    const levelNo = this.serverStore.levelNo;
    if (this.store.levels[levelNo]) {
      return this.store.levels[levelNo].editor.state.content;
    }
    const level = this.serverStore.load(levelNo);
    if (!level) {
      return '';
    }
    return level.editor.state.content;
  }

}
