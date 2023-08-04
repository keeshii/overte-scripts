import { BoardState } from './game/game.interface';

const LAYERS_COUNT = 6;

const COLOR_TO_LAYER: {[color: string]: number} = {
  BASE: 0,
  R: 1,
  G: 2,
  B: 3,
  Y: 4,
  W: 5
};

export class BoardRenderer {

  private entityId: Uuid;
  private boards: { [color: string]: Uuid } = {};
  private layers: string[] = [];

  constructor(entityId: string, ids: string[], props: Partial<Entities.EntityProperties>[]) {
    this.entityId = entityId;

    for (let i = 0; i < ids.length; i++) {
      const prop = props[i];
      if (prop.parentID !== this.entityId) {
        continue;
      }
      switch (prop.name) {
        case 'Text.Rescripted.Board.Base':
          this.boards[COLOR_TO_LAYER.BASE] = ids[i];
          break;
        case 'Text.Rescripted.Board.R':
          this.boards[COLOR_TO_LAYER.R] = ids[i];
          break;
        case 'Text.Rescripted.Board.G':
          this.boards[COLOR_TO_LAYER.G] = ids[i];
          break;
        case 'Text.Rescripted.Board.B':
          this.boards[COLOR_TO_LAYER.B] = ids[i];
          break;
        case 'Text.Rescripted.Board.Y':
          this.boards[COLOR_TO_LAYER.Y] = ids[i];
          break;
        case 'Text.Rescripted.Board.W':
          this.boards[COLOR_TO_LAYER.W] = ids[i];
          break;
      }
    }
  }

  public render(state: BoardState) {
    let lines: string[];
    const layers = this.splitColors(state);
    for (let i = 0; i < layers.length; i++) {
      lines = this.splitLines(layers[i], state.width);
      layers[i] = this.combineLines(lines, state.offsetX, state.offsetY);
      console.log(layers[i]);
    }
    for (let i = 0; i < layers.length; i++) {
      if (layers[i] !== this.layers[i]) {
        this.layers[i] = layers[i];
        Entities.editEntity(this.boards[i], { text: layers[i] } as any);
      }
    }
  }

  private splitColors(state: BoardState): string[] {
    const layers: string[] = [];
    for (let i = 0; i < LAYERS_COUNT; i++) {
      const layer = state.values.replace(/./g, function(match, offset) {
        const color = state.colors[offset];
        const layerId = COLOR_TO_LAYER[color] || 0;
        return layerId === i ? match : ' '; // '\u2800';
      });
      layers.push(layer);
    }
    return layers;
  }

  private splitLines(layer: string, width: number): string[] {
    const lines: string[] = [];
    let pos = 0;
    while (pos < layer.length) {
      lines.push(layer.substring(pos, pos + width));
      pos += width;
    }
    return lines;
  }

  private combineLines(lines: string[], offsetX: number, offsetY: number): string {
    const offset = Array(offsetX + 1).join(' ');
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(/\s+$/, '');
      lines[i] = lines[i] ? offset + lines[i] : '';
    }
    for (let i = 0; i < offsetY; i++) {
      lines.unshift('');
    }
    lines.unshift('\u200C');
    return lines.join('\n').replace(/\n+$/, '');
  }

}

