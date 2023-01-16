import { readFileSync, writeFile } from "fs";
import { parseFragment, serialize, serializeOuter } from "parse5";

const FileParser = {
  readFile(path) {
    const source = readFileSync(path, { encoding: "utf8" });
    const fragment = parseFragment(source);

    return fragment;
  },
};

const tags = FileParser.readFile("in.html");
const nodes = tags.childNodes;
console.log("nodes:", nodes);
function walkTree(nodes: any) {
  let i = 0;
  nodes?.forEach((node) => {
    console.log("===");
    console.log("node:", node);
    if (node.nodeName === "include") {
      const { attrs } = node;
      console.log(attrs);
      attrs.forEach((attr) => {
        if (attr.name === "template") {
          nodes[i] = FileParser.readFile(attr.value).childNodes[0];
        }
      });
    } else {
      walkTree(node.childNodes);
    }
    i++;
  });
}
walkTree(nodes);
tags.childNodes = nodes;
console.log(serialize(tags));
writeFile("./out.html", serialize(tags), (err) => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});
