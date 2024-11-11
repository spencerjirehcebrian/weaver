export interface TextData {
  id: number;
  content: string;
  created_at: string;
}

export interface ExpandedState {
  [key: number]: boolean;
}
