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
var parse5_2 = require("parse5");
var IncludeEl = {
    NODE_NAME: "include",
    ATTRIBUTES: {
        SRC: "src",
        WITH: "with"
    }
};
var FileParser = /** @class */ (function () {
    function FileParser(inputPath, outputPath) {
        this.INDENT = "    ";
        this.INPUT_PATH = inputPath;
        this.OUTPUT_PATH = outputPath;
    }
    FileParser.prototype.readFile = function (path) {
        return (0, fs_1.readFileSync)(path, { encoding: "utf8" });
    };
    FileParser.prototype.writeFile = function (path, content) {
        (0, fs_1.writeFile)(path, content, function (err) {
            if (err) {
                console.error(err);
            }
        });
    };
    FileParser.prototype.walkTree = function (nodes, indentNumber) {
        var _this = this;
        var i = 0;
        nodes === null || nodes === void 0 ? void 0 : nodes.forEach(function (node) {
            var childNodes = node
                .childNodes; // for some reason typescript cannot see that there is, in fact, a childNode property to ChildNode
            if (node.nodeName === IncludeEl.NODE_NAME) {
                indentNumber++;
                var attrs = node.attrs;
                var templateAttribute = attrs.find(function (attr) { return attr.name === IncludeEl.ATTRIBUTES.SRC; });
                var source_1 = _this.readFile(templateAttribute.value);
                var contextAttribute = attrs.find(function (attr) { return attr.name === IncludeEl.ATTRIBUTES.WITH; });
                var context = _this.parseContext(contextAttribute.value);
                context.forEach(function (value) {
                    source_1 = source_1.replaceAll("{".concat(value.key, "}"), value.value);
                });
                var fragments = (0, parse5_1.parseFragment)(source_1);
                var newNodes = fragments.childNodes;
                nodes.splice.apply(nodes, __spreadArray([i, 1], newNodes, false));
                _this.walkTree(newNodes, indentNumber);
            }
            else if (childNodes) {
                childNodes.forEach(function (childNode) {
                    if (parse5_2.defaultTreeAdapter.isTextNode(childNode)) {
                        childNode.value = childNode.value.replaceAll("\n", "\n" + _this.INDENT.repeat(indentNumber - 1));
                    }
                });
                _this.walkTree(childNodes, indentNumber);
            }
            i++;
        });
    };
    FileParser.prototype.parseContext = function (attrValue) {
        var values = [];
        var valuesArray = attrValue.split(";");
        valuesArray.forEach(function (value) {
            var valueArray = value.split(":");
            var key = valueArray[0];
            if (valueArray.length > 1 && key) {
                values.push({
                    key: key,
                    value: valueArray[1].replaceAll(" ", "").replaceAll("'", "")
                });
            }
        });
        return values;
    };
    FileParser.prototype.parse = function () {
        var source = this.readFile(this.INPUT_PATH);
        var tags = (0, parse5_1.parseFragment)(source);
        var nodes = tags.childNodes;
        var indentNumber = 1;
        this.walkTree(nodes, indentNumber);
        tags.childNodes = nodes;
        return tags;
    };
    FileParser.prototype.serialize = function () {
        var newTags = this.parse();
        return (0, parse5_1.serialize)(newTags);
    };
    FileParser.prototype.run = function () {
        var content = this.serialize();
        this.writeFile(this.OUTPUT_PATH, content);
    };
    return FileParser;
}());
var parser = new FileParser("in.html", "out.html");
console.log(parser.serialize());
