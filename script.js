"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var fs_1 = require("fs");
var parse5_1 = require("parse5");
var util_1 = require("util");
// class HtmlParser {
//   static readFile(path: string) {
//     const source = readFileSync(path, { encoding: "utf8" });
//     const fragment = parseFragment(source);
//     return fragment;
//   }
// }
var FileParser = {
    readFile: function (path) {
        var source = (0, fs_1.readFileSync)(path, { encoding: "utf8" });
        var fragment = (0, parse5_1.parseFragment)(source);
        return fragment;
    }
};
var tags = FileParser.readFile("in.html");
var nodes = tags.childNodes;
// console.log(
//   "init nodes:",
//   inspect(nodes, { showHidden: false, depth: null, colors: true })
// );
function walkTree(nodes) {
    var i = 0;
    nodes === null || nodes === void 0 ? void 0 : nodes.forEach(function (node) {
        if (node.nodeName === "include") {
            var attrs = node.attrs;
            attrs.forEach(function (attr) {
                if (attr.name === "template") {
                    var newNodes = FileParser.readFile(attr.value).childNodes;
                    console.log("parent node", node.parentNode);
                    newNodes.forEach(function (newNode) {
                        // if (newNode.parentNode && node.parentNode) {
                        //   newNode.parentNode = node.parentNode;
                        // }
                    });
                    console.log("new nodes", newNodes);
                    nodes.splice.apply(nodes, __spreadArray([i, 1], newNodes, false));
                }
            });
        }
        else {
            walkTree(node.childNodes); // for some reason typescript cannot see that there is, in fact, a childNode property to ChildNode
        }
        i++;
    });
}
walkTree(nodes);
console.log("===================================");
tags.childNodes = nodes;
console.log("final nodes:", (0, util_1.inspect)(tags, { showHidden: false, depth: null, colors: true }));
console.log((0, parse5_1.serialize)(tags));
(0, fs_1.writeFile)("./out.html", (0, parse5_1.serialize)(tags), function (err) {
    if (err) {
        console.error(err);
    }
    // file written successfully
});
