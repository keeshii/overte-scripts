import { AGENT_COLOR, BLUE_TEAM, BOARD_SIZE_X, BOARD_SIZE_Y, COLOR, RED_TEAM } from './constants';
import { Message } from './messages';
import { AgentType, BoardItem, ViewType } from './types';

export class Panel {
  private readonly BOARD_WIDTH = 2.7;
  private readonly BOARD_HEIGHT = 1.8;
  private readonly WORD_MARGIN = 0.01;
  private readonly WORD_ENTITY_WIDTH = this.BOARD_WIDTH / BOARD_SIZE_X - 2 * this.WORD_MARGIN;
  private readonly WORD_ENTITY_HEIGHT = this.BOARD_HEIGHT / BOARD_SIZE_Y - 2 * this.WORD_MARGIN;
  private readonly WORD_TOP_OFFSET = -0.13;

  public view: string;

  private entityId: Uuid;
  private panelEntityId: Uuid;
  private messageId: Uuid;
  private submitButtonId: Uuid;
  private abortButtonId: Uuid;
  private teamMessageIds: Uuid[];
  private teamSubmitIds: Uuid[];
  private teamGuessIds: Uuid[];
  private teamWordIds: Uuid[];
  private wordIds: Uuid[];
  private boardViewIds: Uuid[];
  private messageViewIds: Uuid[];
  private teamSubmitText: string[];
  private renderZoneId: Uuid;

  constructor(entityId: string, ids: string[], props: Partial<Entities.EntityProperties>[]) {
    this.entityId = entityId;
    this.teamMessageIds = [];
    this.teamSubmitIds = [];
    this.teamGuessIds = [];
    this.wordIds = [];
    this.boardViewIds = [];
    this.messageViewIds = [];
    this.teamWordIds = [];
    this.teamSubmitText = [];

    for (let i = 0; i < ids.length; i++) {
      if (props[i].parentID === entityId && props[i].name === 'Plane.Panel') {
        this.panelEntityId = ids[i];
        break;
      }
    }

    if (!this.panelEntityId) {
      return;
    }

    for (let i = 0; i < ids.length; i++) {
      const prop = props[i];
      if (prop.parentID !== entityId && prop.parentID !== this.panelEntityId) {
        continue;
      }
      if (prop.name.match(/^Text.Panel.Word\[(\d+)\]$/)) {
        this.wordIds.push(ids[i]);
        this.boardViewIds.push(ids[i]);
        continue;
      }
      if (prop.renderWithZones.length >= 1) {
        this.renderZoneId = prop.renderWithZones[0];
      }
      switch (prop.name) {
        case 'Text.Panel.RedGuesses':
          this.teamGuessIds[RED_TEAM] = ids[i];
          this.boardViewIds.push(ids[i]);
          break;
        case 'Text.Panel.BlueGuesses':
          this.teamGuessIds[BLUE_TEAM] = ids[i];
          this.boardViewIds.push(ids[i]);
          break;
        case 'Text.Panel.RedSubmit':
          this.teamSubmitIds[RED_TEAM] = ids[i];
          break;
        case 'Text.Panel.BlueSubmit':
          this.teamSubmitIds[BLUE_TEAM] = ids[i];
          break;
        case 'Text.Panel.RedMessage':
          this.teamMessageIds[RED_TEAM] = ids[i];
          this.boardViewIds.push(ids[i]);
          break;
        case 'Text.Panel.BlueMessage':
          this.teamMessageIds[BLUE_TEAM] = ids[i];
          this.boardViewIds.push(ids[i]);
          break;
        case 'Text.Panel.RedWord':
          this.teamWordIds[RED_TEAM] = ids[i];
          this.boardViewIds.push(ids[i]);
          break;
        case 'Text.Panel.BlueWord':
          this.teamWordIds[BLUE_TEAM] = ids[i];
          this.boardViewIds.push(ids[i]);
          break;
        case 'Text.Panel.Abort':
          this.abortButtonId = ids[i];
          break;
        case 'Text.Panel.Start':
          this.submitButtonId = ids[i];
          this.messageViewIds.push(ids[i]);
          break;
        case 'Text.Panel.Message':
          this.messageId = ids[i];
          this.messageViewIds.push(ids[i]);
          break;
        case 'Text.Panel.RedTitle':
        case 'Text.Panel.BlueTitle':
        case 'Text.Panel.RedPlus':
        case 'Text.Panel.RedMinus':
        case 'Text.Panel.BluePlus':
        case 'Text.Panel.BlueMinus':
        case 'Plane.Panel.Board':
          this.boardViewIds.push(ids[i]);
      }
    }

    this.clearBoard();
  }

  public setView(view: ViewType) {
    this.view = view;

    for (const id of this.boardViewIds) {
      Entities.editEntity(id, { visible: view === ViewType.BOARD } as any);
    }
    for (const id of this.wordIds) {
      Entities.editEntity(id, { visible: view === ViewType.BOARD } as any);
    }
    for (const id of this.messageViewIds) {
      Entities.editEntity(id, { visible: view === ViewType.MESSAGE } as any);
    }
    for (const i of [RED_TEAM, BLUE_TEAM]) {
      const id = this.teamSubmitIds[i];
      const visible = this.teamSubmitText[i] && view === ViewType.BOARD;
      Entities.editEntity(id, { visible } as any);
    }
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
    this.clearBoard();

    if (!this.panelEntityId) {
      return;
    }

    const startX = -this.BOARD_WIDTH / 2 + this.WORD_MARGIN * 3 + this.WORD_ENTITY_WIDTH / 2;
    const startZ = this.WORD_TOP_OFFSET - this.BOARD_HEIGHT / 2 + this.WORD_MARGIN * 3 + this.WORD_ENTITY_HEIGHT / 2;

    for (let i = 0; i < boardItems.length; i++) {
      const item = boardItems[i];
      const col = i % BOARD_SIZE_X;
      const row = Math.floor(i / BOARD_SIZE_Y);
      const x = startX + col * (this.WORD_ENTITY_WIDTH + this.WORD_MARGIN);
      const z = startZ + row * (this.WORD_ENTITY_HEIGHT + this.WORD_MARGIN);
      const textColor = item.agentType === AgentType.INNOCENT ? COLOR.BLACK : COLOR.WHITE;

      const wordId = Entities.addEntity({
        type: 'Text',
        name: 'Text.Panel.Word[' + i + ']',
        parentID: this.panelEntityId,
        dimensions: { x: this.WORD_ENTITY_WIDTH, y: this.WORD_ENTITY_HEIGHT, z: 0.01 },
        textColor: item.facedown ? AGENT_COLOR(item.agentType) : textColor,
        backgroundColor: AGENT_COLOR(item.agentType),
        backgroundAlpha: 1,
        localPosition: { x, y: 0.02, z },
        localRotation: Quat.fromPitchYawRollDegrees(-90, 0, 0),
        alignment: 'center',
        lineHeight: 0.08,
        topMargin: 0.13,
        textEffectColor: { red: 0, green: 0, blue: 0 },
        text: item.word,
        renderWithZones: this.renderZoneId ? [this.renderZoneId] : [],
        userData: '{"grabbableKey": {"grabbable": false, "triggerable": true}}'
      } as any);

      this.wordIds.push(wordId);
    }
  }

  public setMessage(message: string, submitButton?: string, abortButton?: string) {
    if (this.messageId) {
      Entities.editEntity(this.messageId, { text: message } as any);
    }
    if (this.submitButtonId) {
      const text = submitButton || '';
      const visible = submitButton ? true : false;
      Entities.editEntity(this.submitButtonId, { text, visible } as any);
    }
    if (this.abortButtonId) {
      const text = abortButton || '';
      const visible = abortButton ? true : false;
      Entities.editEntity(this.abortButtonId, { text, visible } as any);
    }
  }

  public setAbortButton(abortButton: string) {
    if (this.abortButtonId) {
      const text = abortButton || '';
      const visible = abortButton ? true : false;
      Entities.editEntity(this.abortButtonId, { text, visible } as any);
    }
  }

  public setTeamMessage(team: number, message: string, submitButton?: string) {
    if (this.teamMessageIds[team]) {
      Entities.editEntity(this.teamMessageIds[team], { text: message } as any);
    }
    if (this.teamSubmitIds[team]) {
      const text = submitButton || '';
      const visible = submitButton ? true : false;
      this.teamSubmitText[team] = text;
      Entities.editEntity(this.teamSubmitIds[team], { text, visible } as any);
    }
  }

  public setTeamWord(team: number, message: string) {
    if (this.teamWordIds[team]) {
      const text = message || Message.INPUT_LABEL;
      const textColor = message ? COLOR.WHITE : COLOR.GRAY;
      Entities.editEntity(this.teamWordIds[team], { text, textColor } as any);
    }
  }

  public setGuessValue(team: number, value: number) {
    if (this.teamGuessIds[team]) {
      Entities.editEntity(this.teamGuessIds[team], { text: String(value) } as any);
    }
  }

  private clearBoard() {
    for (let i = 0; i < this.wordIds.length; i++) {
      Entities.deleteEntity(this.wordIds[i]);
    }
    this.wordIds = [];
  }

}
