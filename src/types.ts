import { ChildNode } from "parse5/dist/tree-adapters/default";

export type TOptions = {
  globalContext: Record<string, any>;
  indent: number;
  inputIsDocument: boolean;
  basePath: string;
  variableReplacements: Record<string, string> | null;
  isAbsolutePath: boolean;
  replaceByTemplateLitterals: boolean;
};

export type TContext = Record<string, any>;

export type TManager = {
  i: number;
  nodes: ChildNode[];
  currentNode: ChildNode;
  depth: number;
  includeDepth: number;
  context: TContext;
};
