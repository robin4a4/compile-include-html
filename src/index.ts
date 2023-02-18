import { readFileSync, writeFile } from "fs";
import { parseFragment, parse, serialize } from "parse5";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import { defaultTreeAdapter } from "parse5";

type TOptions = {
  globalContext?: Record<string, any>;
  indent?: number;
  inputIsDocument?: boolean;
};

type TContext = Record<string, any>;

export class Includer {
  options: TOptions = {};
  INDENT: string;
  globalStack: {
    fileName: string;
    depth: number;
  }[];

  get computedOptions() {
    return {
      globalContext: this.options.globalContext || {},
      indent: this.options.indent || 4,
      inputIsDocument: this.options.inputIsDocument || false,
    };
  }

  constructor(options?: TOptions) {
    if (options) this.options = options;
    this.INDENT = " ".repeat(this.computedOptions.indent);
    this.globalStack = [];
  }

  public readFile(path: string) {
    return readFileSync(path, { encoding: "utf8" });
  }

  public transform(source: string) {
    const newTags = this._parse(source);
    return serialize(newTags);
  }

  public run(inputPath: string, outputPath: string) {
    const source = this.readFile(inputPath);
    const content = this.transform(source);
    this._writeFile(outputPath, content);
  }

  _writeFile(path: string, content: string) {
    writeFile(path, content, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  _walkTree(
    nodes: ChildNode[],
    depth: number,
    context: TContext | null = null
  ) {
    let i = 0;
    nodes?.forEach((node) => {
      const childNodes = (node as ChildNode & { childNodes: ChildNode[] })
        .childNodes; // for some reason typescript cannot see that there is, in fact, a childNode property to ChildNode
      if (node.nodeName === "include") {
        const { attrs } = node;
        const srcAttr = attrs.find((attr) => attr.name === "src");
        const contextAttr = attrs.find((attr) => attr.name === "with");
        if (!srcAttr) return;
        if (
          this.globalStack.find(
            (item) => item.fileName === srcAttr.value && item.depth !== depth
          )
        ) {
          throw new Error("Can't include template from self.");
        }
        this.globalStack.push({
          fileName: srcAttr.value,
          depth: depth,
        });
        let source = this.readFile(srcAttr.value);
        let context = null;
        if (contextAttr) {
          context = this._parseContext(contextAttr.value);
        }
        const fragments = parseFragment(source);
        const newNodes = fragments.childNodes;
        nodes.splice(i, 1, ...newNodes);
        this._walkTree(newNodes, depth, context);
      } else if (node.nodeName === "for") {
        const { attrs } = node;
        const conditionAttr = attrs.find((attr) => attr.name === "condition");
        if (!conditionAttr) return;

        /*
         Split the condition attribute to retrieve the identifier of the elements to be replaced
         and the arrayName of the context containing the replacement values.
         
         e.g in `const item of array`, item is the identifier and array is the arrayName
        */
        const [identifier, arrayName] = conditionAttr.value
          .replace("const ", "")
          .split(" of ");
        if (identifier && arrayName && context && context[arrayName]) {
          // retrieve the replacement values in the context
          const conditionContext = context[arrayName];

          const newMultipliedNodes: ChildNode[] = [];
          // loop throught the replacement values
          conditionContext.forEach((conditionContextItem: any) => {
            // retrieve the nodes to be multiplied
            const newNodes = node.childNodes;
            /*
            For each replacement value, create a localContext.
            
            e.g if we have `const item of array`, with `const array = ['a', 'b']`, we will have:
            - for first loop count `const localContext = {item: 'a'}`
            - for second loop count `const localContext = {item: 'b'}`
            */
            const localContext = { [identifier]: conditionContextItem };
            this._walkTree(newNodes, depth, localContext);
            newMultipliedNodes.push(...newNodes);
          });
          // add the multiplied nodes in the tree
          nodes.splice(i, 1, ...newMultipliedNodes);
        }
      } else if (defaultTreeAdapter.isTextNode(node)) {
        if (depth > 0) {
          if (context) {
            for (const [key, value] of Object.entries(context)) {
              if (typeof value === "string") {
                console.log(`{${key}}`, value);
                node.value = node.value.replaceAll(`{${key}}`, value);
              }
            }
          }
          node.value = node.value.replaceAll(
            "\n",
            "\n" + this.INDENT.repeat(depth - 1)
          );
        }
      } else if (childNodes) {
        this._walkTree(childNodes, depth + 1, context);
      }
      i++;
    });
  }

  _parseContext(attrValue: string): TContext {
    const context: TContext = {};
    const valuesArray = attrValue.split(";");
    valuesArray.forEach((value) => {
      const [keyFromArray, valueFromArray] = value.split(":");
      if (keyFromArray && valueFromArray) {
        context[keyFromArray.trim().replaceAll(" ", "-")] = valueFromArray
          .trim()
          .replaceAll("'", "");
      }
    });
    return context;
  }

  _parse(source: string) {
    const parser = this.computedOptions.inputIsDocument ? parse : parseFragment;
    const tags = parser(source);
    const nodes = tags.childNodes;
    const depth = 0;
    this._walkTree(nodes, depth, this.computedOptions.globalContext);
    tags.childNodes = nodes;
    return tags;
  }
}
