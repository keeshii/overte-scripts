export function runInContext() {
  'use strict';
  
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const require: any = undefined;
  const process: any = undefined;
  const Runner: any = undefined;
  const ApiBuilder: any = undefined;
  const runInContext: any = undefined;
  const __dirname: any = undefined;
  const __filename: any = undefined;

  let player: any;
  let map: any;
  let gun: any;
  let level: any;

  const console = this._vm.api.createConsole();
  const Entities = this._vm.api.createEntities();
  const Script = (function (context, apiUnlocked) {  
    return context._vm.api.createScript((globals: any) => {
      player = globals['player'];
      map = globals['map'];
      gun = globals['gun'];
      level = apiUnlocked ? globals['level'] : undefined;
    });
  }(this, this._vm.apiUnlocked));
  /* eslint-enable @typescript-eslint/no-unused-vars */

  delete this._vm.apiUnlocked;
  delete this._vm.api;

  this._vm.instance = eval('\'use strict\';' + String(this._vm.code))();

  if (this._vm.instance.preload) {
    this._vm.instance.preload(this._vm.fileName);
  }

  if (this._vm.instance.remotelyCallable instanceof Array
    && this._vm.instance.remotelyCallable.indexOf('run') !== -1) {
    this._vm.instance.run();
  }
}
