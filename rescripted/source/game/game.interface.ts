
export interface ColorMap {
  [color: string]: string
}

export interface EditorState {
  fileName: string;
  content: string;
}

export interface UpdateAction {
  position: number;
  remove: number;
  insert: string;
}

export interface BoardState {
  offsetX: number;
  offsetY: number;
  values: string;
  colors: string;
  width: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Shot extends Position {
  dx: number;
  dy: number;
  value: string;
  deleted?: boolean;
}

export type StatusType = 'UNLOADED' | 'PENDING' | 'RUNNING';

export interface ErrorInfo {
  message: string;
  line?: number;
  col? : number;
}

export interface Tick {
  logs?: any[];
  error?: ErrorInfo;
  status?: StatusType;
  state?: BoardState
  completed?: boolean;
}

export interface LocalStoreData {
  levelNo: number;
  levels: {
    completed: boolean;
    editor: { state: EditorState }
  }[];
}
