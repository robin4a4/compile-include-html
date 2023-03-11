import { expect, test, vi, describe } from "vitest";
import { HtmlParser } from "../src";

describe("context replacement tests", () => {
  test("context replacement in text node", async () => {
    const input = `<ul><li>{firstLi}</li><li>{secondLi.nested}</li></ul>`;
    const parser = new HtmlParser({
      globalContext: {
        firstLi: "hello",
        secondLi: {
          nested: "world",
        },
      },
    });
    expect(parser.transform(input)).toBe(
      `<ul><li>hello</li><li>world</li></ul>`
    );
  });
  test("failed context replacement in text node", async () => {
    const input = `<ul><li>{firstLi}</li><li>{secondLi.nested}</li><li>undefinedFunction should remain in brackets: {undefinedFunction()}</li></ul>`;
    const parser = new HtmlParser({
      globalContext: {
        firstLi: "hello",
      },
    });
    expect(parser.transform(input)).toBe(
      `<ul><li>hello</li><li>{secondLi.nested}</li><li>undefinedFunction should remain in brackets: {undefinedFunction()}</li></ul>`
    );
  });

  test("context replacement in node attributes", async () => {
    const input = `<a href="{link.href}">{link.name}</a>`;
    const parser = new HtmlParser({
      globalContext: {
        link: {
          href: "https://example.com",
          name: "link to example",
        },
      },
    });
    expect(parser.transform(input)).toBe(
      `<a href="https://example.com">link to example</a>`
    );
  });
});
