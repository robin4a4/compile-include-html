import { readFileSync, writeFile } from "fs";
import { parseFragment, parse, serialize } from "parse5";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import { defaultTreeAdapter } from "parse5";

type TOptions = {
  context?: Record<string, any>;
  indent?: number;
  inputIsDocument?: boolean;
};

export class Includer {
  options: TOptions = {};
  INDENT: string;
  globalStack: {
    fileName: string;
    depth: number;
  }[];

  get computedOptions() {
    return {
      context: this.options.context || {},
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

  _walkTree(nodes: ChildNode[], depth: number) {
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
        if (contextAttr) {
          const context = this._parseContext(contextAttr.value);
          context.forEach((value) => {
            source = source.replaceAll(`{${value.key}}`, value.value);
          });
        }
        const fragments = parseFragment(source);
        const newNodes = fragments.childNodes;
        nodes.splice(i, 1, ...newNodes);
        this._walkTree(newNodes, depth);
      } else if (node.nodeName === "for") {
        const { attrs } = node;
        const conditionAttr = attrs.find((attr) => attr.name === "condition");
        if (!conditionAttr) return;
        const keyValueArray = conditionAttr.value
          .replace("const ", "")
          .split(" of ");
        const value = keyValueArray[1];
        if (value && this.computedOptions.context[value]) {
          const conditionContext = this.computedOptions.context[value];
          // nodesToMultiply.forEach(node => {
          //   console.log(node)
          // })
          const newNodes = conditionContext.map((conditionContextItem) => {
            const nodesToMultiply = node.childNodes[0];
            return nodesToMultiply;
          });
          console.log(newNodes);
          nodes.splice(i, 1, ...newNodes);
        }
      } else if (defaultTreeAdapter.isTextNode(node)) {
        if (depth > 0) {
          node.value = node.value.replaceAll(
            "\n",
            "\n" + this.INDENT.repeat(depth - 1)
          );
        }
      } else if (childNodes) {
        this._walkTree(childNodes, depth + 1);
      }
      i++;
    });
  }

  _parseContext(attrValue: string) {
    let values: Record<"key" | "value", string>[] = [];
    const valuesArray = attrValue.split(";");
    valuesArray.forEach((value) => {
      const valueArray = value.split(":");
      const keyFromArray = valueArray[0];
      const valueFromArray = valueArray[1];
      if (valueArray.length > 1 && keyFromArray && valueFromArray) {
        values.push({
          key: keyFromArray,
          value: valueFromArray.trim().replaceAll("'", ""),
        });
      }
    });
    return values;
  }

  _parse(source: string) {
    const parser = this.computedOptions.inputIsDocument ? parse : parseFragment;
    const tags = parser(source);
    const nodes = tags.childNodes;
    const depth = 0;
    this._walkTree(nodes, depth);
    tags.childNodes = nodes;
    return tags;
  }
}
