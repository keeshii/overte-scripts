import { EditorState, UpdateAction } from "./rescripted.interface";

export class Editor {

  public state: EditorState;

  constructor() {
    this.state = {
      fileName: '',
      content: ''
    };
  }

  public applyUpdate(action: UpdateAction): boolean {
    let text = this.state.content;
    if (action.remove) {
      text = text.substring(0, action.position)
        + text.substring(action.position + action.remove);
    }

    if (action.insert) {
      text = text.substring(0, action.position)
        + String(action.insert)
        + text.substring(action.position);
    }

    if (text === this.state.content) {
      return false;
    }

    this.state.content = text;
    return true;
  }

}
