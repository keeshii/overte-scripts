
export interface Config {
  CLICK_THROTTLE: number;

  INIT_ENTITIES_DELAY: number;

  CLIENT_SIDE_ONLY: boolean;
}

export const MESSAGE_CHANNEL = 'eu.ryuu.rescripted';

export const CONFIG: Config = typeof Script !== 'undefined'
  ? Script.require('../config.js') : {};
