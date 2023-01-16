"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var parse5_1 = require("parse5");
var FileParser = {
    readFile: function (path) {
        var source = (0, fs_1.readFileSync)(path, { encoding: "utf8" });
        var fragment = (0, parse5_1.parseFragment)(source);
        return fragment;
    }
};
var tags = FileParser.readFile("in.html");
var nodes = tags.childNodes;
console.log("nodes:", nodes);
function walkTree(nodes) {
    var i = 0;
    nodes === null || nodes === void 0 ? void 0 : nodes.forEach(function (node) {
        console.log("===");
        console.log("node:", node);
        if (node.nodeName === "include") {
            var attrs = node.attrs;
            console.log(attrs);
            attrs.forEach(function (attr) {
                if (attr.name === "template") {
                    nodes[i] = FileParser.readFile(attr.value).childNodes[0];
                }
            });
        }
        else {
            walkTree(node.childNodes);
        }
        i++;
    });
}
walkTree(nodes);
tags.childNodes = nodes;
console.log((0, parse5_1.serialize)(tags));
(0, fs_1.writeFile)("./out.html", (0, parse5_1.serialize)(tags), function (err) {
    if (err) {
        console.error(err);
    }
    // file written successfully
});
