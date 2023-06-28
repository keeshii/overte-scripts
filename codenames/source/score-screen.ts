import { BLUE_TEAM, RED_TEAM } from './constants';

export class ScoreScreen {
  
  private readonly IMAGE_WIDTH = 225;
  private readonly IMAGE_HEIGHT = 500;
  private readonly CARDS_WIDTH = 1.4;

  private entityId: Uuid;
  private scoreIds: Uuid[];
  private wordsLeftIds: Uuid[];

  constructor(entityId: string, ids: string[], props: Partial<Entities.EntityProperties>[]) {
    this.entityId = entityId;
    this.scoreIds = [];
    this.wordsLeftIds = [];

    for (let i = 0; i < ids.length; i++) {
      const prop = props[i];
      if (prop.parentID !== this.entityId) {
        continue;
      }
      switch (prop.name) {
        case 'Image.Wall.RedCards':
          this.wordsLeftIds[RED_TEAM] = ids[i];
          break;
        case 'Image.Wall.BlueCards':
          this.wordsLeftIds[BLUE_TEAM] = ids[i];
          break;
        case 'Text.Wall.RedScore':
          this.scoreIds[RED_TEAM] = ids[i];
          break;
        case 'Text.Wall.BlueScore':
          this.scoreIds[BLUE_TEAM] = ids[i];
          break;
      }
    }
  }

  public setScore(team: number, value: number) {
    if (this.scoreIds[team]) {
      Entities.editEntity(this.scoreIds[team], { text: String(value) } as any);
    }
  }

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

}


