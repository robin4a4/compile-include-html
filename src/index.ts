import { readFileSync, writeFile } from "fs";
import { parseFragment, parse, serialize } from "parse5";
import { ChildNode } from "parse5/dist/tree-adapters/default";
import { defaultTreeAdapter } from "parse5";
import { deepStringReplacement, parseIncludeContext } from "./utils";
import { TContext, TManager, TOptions } from "./types";

export class HtmlParser {
  options: TOptions;
  INDENT: string;
  globalStack: {
    fileName: string;
    depth: number;
  }[];

  constructor(options?: Partial<TOptions>) {
    this.options = {
      globalContext: options?.globalContext || {},
      indent: options?.indent || 4,
      inputIsDocument: options?.inputIsDocument || false,
      basePath: options?.basePath || ".",
    };
    this.INDENT = " ".repeat(this.options.indent);
    this.globalStack = [];
  }

  /**
   * Read utf8 file.
   *
   * @param {string} path
   * @returns {string}
   */
  public readFile(path: string): string {
    return readFileSync(`${this.options.basePath}/${path}`, {
      encoding: "utf8",
    });
  }

  /**
   * Transform an html string containing <for> or <include> into its compiled version.
   *
   * Example:
   *  - source: `<div><include src="card.html" with="text: 'hello world'"></include></div>`
   *  - card.html: `<div class="card">{text}</div>`
   *  - returns: `<div><div class="card">hello world</div></div>`
   *
   * @param {string} source
   * @returns {string}
   */
  public transform(source: string): string {
    const parser = this.options.inputIsDocument ? parse : parseFragment;
    const tags = parser(source);
    const nodes = tags.childNodes;
    const depth = 0;
    this._walkTree(nodes, depth, this.options.globalContext);
    tags.childNodes = nodes;
    return serialize(tags);
  }

  /**
   * Create a new compiled file given an input path and an output path.
   *
   * @param {string} inputPath
   * @param {string} outputPath
   */
  public outputNewFile(inputPath: string, outputPath: string) {
    const source = this.readFile(inputPath);
    const content = this.transform(source);
    this._writeFile(outputPath, content);
  }

  /**
   * Write a file.
   *
   * @param {string} path
   * @param {string} content
   */
  _writeFile(path: string, content: string) {
    writeFile(path, content, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  /**
   * Recursively walk a node tree. It takes a list of nodes and loop through each one.
   * For each one we check if we have to replace `<include>` tag, `<for>` tag or text nodes.
   * An optional context is passed for each step.
   *
   * @param {ChildNode[]} nodes
   * @param {number} depth
   * @param {TContext | null} context
   */
  _walkTree(
    nodes: ChildNode[],
    depth: number,
    context: TContext | null = null
  ) {
    let i = 0;
    nodes?.forEach((node) => {
      const childNodes = (node as ChildNode & { childNodes: ChildNode[] })
        .childNodes; // for some reason typescript cannot see that there is, in fact, a childNode property to ChildNode

      const manager: TManager = { i, nodes, currentNode: node, depth, context };

      node = this._manageAttributeContextReplacement(manager);

      if (node.nodeName === "include") {
        nodes = this._manageIncludeNode(manager);
      } else if (node.nodeName === "for") {
        nodes = this._manageForNode(manager);
      } else if (defaultTreeAdapter.isTextNode(node)) {
        this._manageTextNode(manager);
      } else if (childNodes) {
        this._walkTree(childNodes, depth + 1, context);
      }
      i++;
    });
  }

  /**
   * Check if there are attributes value to be replaced with a context value.
   *
   * Example:
   *  - simplified node attribute: {foo: {value: "{bar}"}}
   *  - context: {bar: "hello world"}
   *  - computed node attribute: {foo: {value: "hello world"}}
   *  - returns: the currentNode, unmodified or modified if there where attributes to be modified
   *
   * @param {TManager} manager
   * @returns {Element}
   */
  _manageAttributeContextReplacement({ currentNode, context }: TManager) {
    if (!defaultTreeAdapter.isElementNode(currentNode) || !context)
      return currentNode;
    const { attrs } = currentNode;
    currentNode.attrs = attrs.map((attr) => {
      attr.value = deepStringReplacement(attr.value, context);
      return attr;
    });
    return currentNode;
  }

  /**
   * Transform an include node into its compiled version recursively.
   *
   * @param {TManager} manager
   * @returns {ChildNode[]}
   */
  _manageIncludeNode({ i, nodes, currentNode, depth, context }: TManager) {
    if (!defaultTreeAdapter.isElementNode(currentNode)) return nodes;
    const { attrs } = currentNode;
    const srcAttr = attrs.find((attr) => attr.name === "src");
    const contextAttr = attrs.find((attr) => attr.name === "with");
    if (!srcAttr) return nodes;
    // if we try to include a file which includes himself, throw an error
    if (
      this.globalStack.find(
        (item) => item.fileName === srcAttr.value && item.depth !== depth
      )
    ) {
      throw new Error("Can't include template from self.");
    }
    // add the current included file to the global stack to allow checking if we
    // include a file that includes himself later
    this.globalStack.push({
      fileName: srcAttr.value,
      depth: depth,
    });

    // read the file to be included
    // let source = this.readFile(`${this.options.basePath}/${srcAttr.value}`);
    let source = this.readFile(`${srcAttr.value}`);

    // parse the context from the attributes
    let localContext = context;
    if (contextAttr) {
      localContext = parseIncludeContext(contextAttr.value, context);
    }
    const fragments = parseFragment(source);
    const newNodes = fragments.childNodes;

    // replaces the node with the new node in place
    nodes.splice(i, 1, ...newNodes);

    // walk the new nodes to be able to include file in an included file recursively
    this._walkTree(newNodes, depth, localContext);
    return nodes;
  }

  /**
   * Transform a for node into its compiled version recursively.
   *
   * @param {TManager} manager
   * @returns {ChildNode[]}
   */
  _manageForNode({ i, nodes, currentNode, depth, context }: TManager) {
    if (!defaultTreeAdapter.isElementNode(currentNode)) return nodes;
    const { attrs } = currentNode;
    const conditionAttr = attrs.find((attr) => attr.name === "condition");
    if (!conditionAttr) return nodes;

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
        /* 
          retrieve the nodes to be multiplied
          We parse and serialiez to create a deep clone instead of a clone by reference
        */
        const newLocalNodes = parseFragment(serialize(currentNode)).childNodes;
        /*
          For each replacement value, create a localContext.

          e.g if we have `const item of array`, with `const array = ['a', 'b']`, we will have:
          - for first loop count `const localContext = {item: 'a'}`
          - for second loop count `const localContext = {item: 'b'}`
        */
        const localContext = { ...context, [identifier]: conditionContextItem };
        this._walkTree(newLocalNodes, depth, localContext);
        newMultipliedNodes.push(...newLocalNodes);
      });
      // add the multiplied nodes in the tree
      nodes.splice(i, 1, ...newMultipliedNodes);
    }
    return nodes;
  }

  /**
   * Transform a text node into its compiled version.
   * It is here that we manage indentation.
   *
   * @param {TManager} manager
   * @returns {void}
   */
  _manageTextNode({ currentNode, depth, context }: TManager) {
    if (!defaultTreeAdapter.isTextNode(currentNode)) return;
    if (context) {
      currentNode.value = deepStringReplacement(currentNode.value, context);
    }
    if (depth > 0) {
      currentNode.value = currentNode.value.replaceAll(
        "\n",
        "\n" + this.INDENT.repeat(depth - 1)
      );
    }
  }
}
