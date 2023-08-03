import { BoardState } from "./game/game.interface";

export class BoardRenderer {

  private entityId: Uuid;
  private boards: { [color: string]: Uuid } = {};

  constructor(entityId: string, ids: string[], props: Partial<Entities.EntityProperties>[]) {
    this.entityId = entityId;

    for (let i = 0; i < ids.length; i++) {
      const prop = props[i];
      if (prop.parentID !== this.entityId) {
        continue;
      }
      switch (prop.name) {
        case 'Text.Rescripted.Board.Base':
          this.boards['_'] = ids[i];
          break;
        case 'Text.Rescripted.Board.R':
          this.boards['R'] = ids[i];
          break;
        case 'Text.Rescripted.Board.G':
          this.boards['R'] = ids[i];
          break;
        case 'Text.Rescripted.Board.B':
          this.boards['R'] = ids[i];
          break;
        case 'Text.Rescripted.Board.Y':
          this.boards['R'] = ids[i];
          break;
        case 'Text.Rescripted.Board.W':
          this.boards['R'] = ids[i];
          break;
      }
    }
  }

  public render(state: BoardState) {
    const lines: string[] = [];
    let pos = 0;
    while (pos < state.values.length) {
      lines.push(state.values.substring(pos, pos + state.width));
      pos += state.width;
    }
    const text = lines.join('\n');
    Entities.editEntity(this.boards['_'], { text } as any);
  }
/*
  public setWordsLeft(team: number, value: number) {
    if (!this.wordsLeftIds[team]) {
      return;
    }

    if (value === 0) {
      Entities.editEntity(this.wordsLeftIds[team], { visible: false } as any);
      return;
    }

    const subImage: any = {};
    subImage.width = this.IMAGE_WIDTH;
    subImage.height = Math.ceil(value / 2) * this.IMAGE_HEIGHT / 5;
    subImage.x = 0;
    subImage.y = value % 2 ? this.IMAGE_HEIGHT - subImage.height : 0;

    const x = this.CARDS_WIDTH;
    const y = subImage.height * this.CARDS_WIDTH / subImage.width;

    Entities.editEntity(this.wordsLeftIds[team], {
      dimensions: { x, y, z: 0.01 },
      subImage,
      visible: true
    } as any);
  }
*/
}


