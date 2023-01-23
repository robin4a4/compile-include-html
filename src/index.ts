import { readFileSync, writeFile } from "fs";
import { parseFragment, serialize } from "parse5";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import { defaultTreeAdapter } from "parse5";

export class FileParser {
  INDENT = "    " as const;
  globalPreviousTemplateSrc: string;
  globalPeviousIndent: number;

  constructor() {
    this.globalPreviousTemplateSrc = "";
    this.globalPeviousIndent = 0;
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
      if (node.nodeName === "include") {
        const { attrs } = node;
        const templateAttribute = attrs.find((attr) => attr.name === "src");
        const contextAttribute = attrs.find((attr) => attr.name === "with");
        if (!templateAttribute || !contextAttribute) return;
        if (
          templateAttribute.value === this.globalPreviousTemplateSrc &&
          this.globalPeviousIndent !== indentNumber
        ) {
          throw new Error("Can't include template from self.");
        }
        indentNumber++;
        this.globalPeviousIndent = indentNumber;
        this.globalPreviousTemplateSrc = templateAttribute.value;
        let source = this.readFile(templateAttribute.value);

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

  parse(source: string) {
    const tags = parseFragment(source);
    const nodes = tags.childNodes;
    let indentNumber = 1;
    this.walkTree(nodes, indentNumber);
    tags.childNodes = nodes;
    return tags;
  }

  serialize(source: string) {
    const newTags = this.parse(source);
    return serialize(newTags);
  }

  run(inputPath: string, outputPath: string) {
    const source = this.readFile(inputPath);
    const content = this.serialize(source);
    this.writeFile(outputPath, content);
  }
}
