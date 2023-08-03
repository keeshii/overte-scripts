import { LocalStoreData } from "./game.interface";
import { ServerStore } from "./server-store";

export class LocalStore {

  private readonly STORE_KEY = 'eu.ryuu.rescripted-data'

  public loadStore(callback: (store: LocalStoreData) => void) {
    const store: LocalStoreData = Settings.getValue(this.STORE_KEY, null);
    if (!store) {
      return;
    }
    callback(store);
  }

  public saveStore(store: LocalStoreData, callback: () => void) {
    Settings.setValue(this.STORE_KEY, store);
    callback();
  }

}
