import { AGENT_COLOR, BOARD_SIZE_X, BOARD_SIZE_Y, COLOR } from './constants';
import { AgentType, BoardItem } from './types';

export class Board {

  private readonly BOARD_WIDTH = 10;
  private readonly BOARD_HEIGHT = 7.5;
  private readonly WORD_MARGIN = 0.05;
  private readonly WORD_ENTITY_WIDTH = this.BOARD_WIDTH / BOARD_SIZE_X - 2 * this.WORD_MARGIN;
  private readonly WORD_ENTITY_HEIGHT = this.BOARD_HEIGHT / BOARD_SIZE_Y - 2 * this.WORD_MARGIN;

  private entityId: Uuid;
  private wordIds: Uuid[];

  constructor(entityId: string, ids: string[], props: Partial<Entities.EntityProperties>[]) {
    this.entityId = entityId;
    this.wordIds = [];

    for (let i = 0; i < ids.length; i++) {
      const prop = props[i];
      if (prop.parentID !== entityId) {
        continue;
      }
      if (prop.name.match(/^Text.BoardWord\[(\d+)\]$/)) {
        this.wordIds.push(ids[i]);
      }
    }

    this.clearAll();
  }

  public clearAll() {
    for (let i = 0; i < this.wordIds.length; i++) {
      Entities.deleteEntity(this.wordIds[i]);
    }
    this.wordIds = [];
  }

  public setFacedown(index: number, agentType: AgentType) {
    const wordId = this.wordIds[index];
    if (wordId) {
      Entities.editEntity(wordId, {
        textColor: AGENT_COLOR(agentType),
        backgroundColor: AGENT_COLOR(agentType)
      } as any);
    }
  }

  public renderBoard(boardItems: BoardItem[]) {
    this.clearAll();

    const startX = -this.BOARD_WIDTH / 2 + this.WORD_MARGIN * 3 + this.WORD_ENTITY_WIDTH / 2;
    const startZ = -this.BOARD_HEIGHT / 2 + this.WORD_MARGIN * 3 + this.WORD_ENTITY_HEIGHT / 2;

    for (let i = 0; i < boardItems.length; i++) {
      const item = boardItems[i];
      const col = i % BOARD_SIZE_X;
      const row = Math.floor(i / BOARD_SIZE_Y);
      const x = startX + col * (this.WORD_ENTITY_WIDTH + this.WORD_MARGIN);
      const z = startZ + row * (this.WORD_ENTITY_HEIGHT + this.WORD_MARGIN);

      const wordId = Entities.addEntity({
        type: 'Text',
        name: 'Text.BoardWord[' + i + ']',
        parentID: this.entityId,
        dimensions: { x: this.WORD_ENTITY_WIDTH, y: this.WORD_ENTITY_HEIGHT, z: 0.01 },
        textColor: item.facedown ? AGENT_COLOR(item.agentType) : COLOR.BLACK,
        backgroundColor: item.facedown ? AGENT_COLOR(item.agentType) : COLOR.WHITE,
        backgroundAlpha: 1,
        localPosition: { x, y: 0.1, z },
        localRotation: Quat.fromPitchYawRollDegrees(-90, 0, 0),
        alignment: 'center',
        lineHeight: 0.3,
        topMargin: 0.55,
        textEffectColor: { red: 0, green: 0, blue: 0 },
        text: item.word,
        userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
      } as any);

      this.wordIds.push(wordId);
    }
  }

}
