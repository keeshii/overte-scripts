import { COLOR, RED_TEAM } from './constants';

export class WordScreen {
  
  private readonly IMAGE_WIDTH = 1000;
  private readonly IMAGE_HEIGHT = 75;
  private readonly GUESSES_HEIGHT = 0.2;

  private entityId: Uuid;
  private wordId: Uuid;
  private guessesId: Uuid;
  private endTurnId: Uuid;

  constructor(entityId: string, ids: string[], props: Partial<Entities.EntityProperties>[]) {
    this.entityId = entityId;

    for (let i = 0; i < ids.length; i++) {
      const prop = props[i];
      if (prop.parentID !== entityId) {
        continue;
      }
      switch (prop.name) {
        case 'Text.Wall.Word':
          this.wordId = ids[i];
          break;
        case 'Image.Wall.Guesses':
          this.guessesId = ids[i];
          break;
        case 'Text.Wall.EndTurn':
          this.endTurnId = ids[i];
          break;
      }
    }
  }

  public showMessage(text: string) {
    if (this.wordId) {
      const textColor = COLOR.WHITE;
      Entities.editEntity(this.wordId, { text, textColor, lineHeight: 0.2 } as any);
    }

    if (this.endTurnId) {
      Entities.editEntity(this.endTurnId, { visible: false } as any);
    }

    this.setGuessesLeft(0);
  }


  public setWord(team: number, word: string, guesses: number) {
    if (this.wordId) {
      const text = word + ': ' + String(guesses);
      const textColor = team === RED_TEAM ? COLOR.RED : COLOR.BLUE;
      Entities.editEntity(this.wordId, { text, textColor, lineHeight: 0.4 } as any);
    }

    if (this.endTurnId) {
      Entities.editEntity(this.endTurnId, { visible: true } as any);
    }

    this.setGuessesLeft(guesses);
  }

  public setGuessesLeft(guesses: number) {
    if (!this.guessesId) {
      return;
    }

    if (guesses === 0) {
      Entities.editEntity(this.guessesId, { visible: false } as any);
      return;
    }

    const subImage = {
      x: 0,
      y: 0,
      width: (this.IMAGE_WIDTH / 10) * guesses,
      height: this.IMAGE_HEIGHT
    };

    const x = subImage.width * this.GUESSES_HEIGHT / subImage.height;
    const y = this.GUESSES_HEIGHT;

    Entities.editEntity(this.guessesId, {
      dimensions: { x, y, z: 0.01 },
      subImage,
      visible: true
    } as any);
  }

}
