import { AgentType } from './types';

export interface Config {
  CLICK_THROTTLE: number;

  INIT_ENTITIES_DELAY: number;

  CLIENT_SIDE_ONLY: boolean;

  WORDS: string[];
}

export const CONFIG: Config = typeof Script !== 'undefined'
  ? Script.require('../config.js') : {};

export const INIT_ENTITIES_DELAY = 500;

export const CLICK_THROTTLE = 300;

export const BOARD_SIZE_X = 5;

export const BOARD_SIZE_Y = 5;

export const BOARD_SIZE = BOARD_SIZE_X * BOARD_SIZE_Y;

export const RED_TEAM = 0;

export const BLUE_TEAM = 1;

export const COLOR = {
  BLACK: { red: 0, green: 0, blue: 0 },
  RED: { red: 209, green: 53, blue: 17 },
  BLUE: { red: 7, green: 99, blue: 155 },
  YELLOW: { red: 255, green: 208, blue: 138 },
  WHITE: { red: 255, green: 255, blue: 255 },
  GRAY: { red: 192, green: 192, blue: 192 }
};

export const AGENT_COLOR = (agentType: AgentType) => {
  switch (agentType) {
    case AgentType.ASSASSIN:
      return COLOR.BLACK;
    case AgentType.INNOCENT:
      return COLOR.YELLOW;
    case AgentType.RED:
      return COLOR.RED;
    case AgentType.BLUE:
      return COLOR.BLUE;
  }
  return COLOR.WHITE;
};
