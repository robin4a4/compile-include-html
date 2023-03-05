import { ChildNode } from "parse5/dist/tree-adapters/default";

export type TOptions = {
  globalContext: Record<string, any>;
  indent: number;
  inputIsDocument: boolean;
  basePath: string;
};

export type TContext = Record<string, any>;

export type TManager = {
  i: number;
  nodes: ChildNode[];
  currentNode: ChildNode;
  depth: number;
  context: TContext | null;
};
