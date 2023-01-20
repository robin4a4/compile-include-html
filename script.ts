import { readFileSync, writeFile } from "fs";
import { parseFragment, serialize } from "parse5";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import { defaultTreeAdapter } from "parse5";

const FileParserOld = {
  readFile(path: string) {
    const source = readFileSync(path, { encoding: "utf8" });
    const fragment = parseFragment(source);

    return fragment;
  },
};

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
    const source = readFileSync(path, { encoding: "utf8" });
    const fragment = parseFragment(source);
    return fragment;
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
        attrs.forEach((attr) => {
          if (attr.name === IncludeEl.ATTRIBUTES.SRC) {
            const newNodes = this.readFile(attr.value).childNodes;
            newNodes.forEach((newNode) => {
              newNode.parentNode = node.parentNode;
            });
            nodes.splice(i, 1, ...newNodes);

            this.walkTree(newNodes, indentNumber);
          }
        });
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

  parse() {
    const tags = this.readFile(this.INPUT_PATH);
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
