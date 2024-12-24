export type TipTapNode = {
  type?: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  marks?: {
    type: string;
    attrs?: Record<string, any>;
    [key: string]: any;
  }[];
  text?: string;
  [key: string]: any;
};
