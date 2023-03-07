import { HtmlParser } from "../../dist/index.mjs";

const htmlParser = new HtmlParser();

const source = htmlParser.readFile("./index.html");
const output = htmlParser.transform(source);
console.log(output);
