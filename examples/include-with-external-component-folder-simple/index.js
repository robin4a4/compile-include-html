import { HtmlParser } from "../../dist/index.mjs";

const htmlParser = new HtmlParser({ basePath: "./layouts" });

const source = htmlParser.readFile("layout.html");
const output = htmlParser.transform(source);
console.log(output);
