import { readFile, readFileSync, writeFile } from "fs";
import { parseFragment, serialize } from "parse5";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import { inspect } from "util";
// class HtmlParser {
//   static readFile(path: string) {
//     const source = readFileSync(path, { encoding: "utf8" });
//     const fragment = parseFragment(source);

//     return fragment;
//   }
// }
const FileParser = {
  readFile(path: string) {
    const source = readFileSync(path, { encoding: "utf8" });
    const fragment = parseFragment(source);

    return fragment;
  },
};

const tags = FileParser.readFile("in.html");
const nodes = tags.childNodes;
// console.log(
//   "init nodes:",
//   inspect(nodes, { showHidden: false, depth: null, colors: true })
// );
function walkTree(nodes: ChildNode[]) {
  let i = 0;
  nodes?.forEach((node) => {
    if (node.nodeName === "include") {
      const { attrs } = node;
      attrs.forEach((attr) => {
        if (attr.name === "template") {
          const newNodes = FileParser.readFile(attr.value).childNodes;
          console.log("parent node", node.parentNode);
          newNodes.forEach((newNode) => {
            // if (newNode.parentNode && node.parentNode) {
            //   newNode.parentNode = node.parentNode;
            // }
          });
          console.log("new nodes", newNodes);
          nodes.splice(i, 1, ...newNodes);
        }
      });
    } else {
      walkTree((node as ChildNode & { childNodes: ChildNode[] }).childNodes); // for some reason typescript cannot see that there is, in fact, a childNode property to ChildNode
    }
    i++;
  });
}
walkTree(nodes);
console.log("===================================");

tags.childNodes = nodes;
console.log(
  "final nodes:",
  inspect(tags, { showHidden: false, depth: null, colors: true })
);
console.log(serialize(tags));
writeFile("./out.html", serialize(tags), (err) => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});
