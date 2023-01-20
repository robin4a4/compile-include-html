import { readFileSync, writeFile } from "fs";
import { parseFragment, serialize } from "parse5";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import { defaultTreeAdapter } from "parse5";

const IncludeEl = {
  NODE_NAME: "include",
  ATTRIBUTES: {
    SRC: "src",
    WITH: "with",
  },
} as const;

class FileParser {
  INDENT = "    " as const;
  INPUT_PATH: string;
  OUTPUT_PATH: string;

  constructor(inputPath: string, outputPath: string) {
    this.INPUT_PATH = inputPath;
    this.OUTPUT_PATH = outputPath;
  }
  readFile(path: string) {
    return readFileSync(path, { encoding: "utf8" });
  }

  writeFile(path: string, content: string) {
    writeFile(path, content, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  walkTree(nodes: ChildNode[], indentNumber: number) {
    let i = 0;
    nodes?.forEach((node) => {
      const childNodes = (node as ChildNode & { childNodes: ChildNode[] })
        .childNodes; // for some reason typescript cannot see that there is, in fact, a childNode property to ChildNode
      if (node.nodeName === IncludeEl.NODE_NAME) {
        indentNumber++;
        const { attrs } = node;
        const templateAttribute = attrs.find(
          (attr) => attr.name === IncludeEl.ATTRIBUTES.SRC
        );
        let source = this.readFile(templateAttribute.value);

        const contextAttribute = attrs.find(
          (attr) => attr.name === IncludeEl.ATTRIBUTES.WITH
        );
        const context = this.parseContext(contextAttribute.value);
        context.forEach((value) => {
          source = source.replaceAll(`{${value.key}}`, value.value);
        });

        const fragments = parseFragment(source);
        const newNodes = fragments.childNodes;
        nodes.splice(i, 1, ...newNodes);

        this.walkTree(newNodes, indentNumber);
      } else if (childNodes) {
        childNodes.forEach((childNode) => {
          if (defaultTreeAdapter.isTextNode(childNode)) {
            childNode.value = childNode.value.replaceAll(
              "\n",
              "\n" + this.INDENT.repeat(indentNumber - 1)
            );
          }
        });

        this.walkTree(childNodes, indentNumber);
      }
      i++;
    });
  }

  parseContext(attrValue: string) {
    let values: Record<"key" | "value", string>[] = [];
    const valuesArray = attrValue.split(";");
    valuesArray.forEach((value) => {
      const valueArray = value.split(":");
      const key = valueArray[0];
      if (valueArray.length > 1 && key) {
        values.push({
          key,
          value: valueArray[1].replaceAll(" ", "").replaceAll("'", ""),
        });
      }
    });
    return values;
  }

  parse() {
    const source = this.readFile(this.INPUT_PATH);
    const tags = parseFragment(source);
    const nodes = tags.childNodes;
    let indentNumber = 1;
    this.walkTree(nodes, indentNumber);
    tags.childNodes = nodes;
    return tags;
  }

  serialize() {
    const newTags = this.parse();
    return serialize(newTags);
  }

  run() {
    const content = this.serialize();
    this.writeFile(this.OUTPUT_PATH, content);
  }
}

const parser = new FileParser("in.html", "out.html");
console.log(parser.serialize());
