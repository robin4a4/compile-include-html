import { expect, test, vi, describe } from "vitest";
import { HtmlParser } from "../src";

describe("<for /> tests", () => {
  test("for looping in array without context", async () => {
    const input = `<div>\n  <for condition="const item of array"><span>hello</span></for>\n</div>`;
    const parserTest = new HtmlParser({
      indent: 2,
      globalContext: { array: ["a", "b", "c"] },
    });
    expect(parserTest.transform(input)).toBe(
      `<div>\n  <span>hello</span><span>hello</span><span>hello</span>\n</div>`
    );
  });

  test("for looping in array with context", async () => {
    const input = `<div>\n  <for condition="const item of array"><span>{item}</span></for>\n</div>`;
    const parserTest = new HtmlParser({
      indent: 2,
      globalContext: { array: ["a", "b", "c"] },
    });
    expect(parserTest.transform(input)).toBe(
      `<div>\n  <span>a</span><span>b</span><span>c</span>\n</div>`
    );
  });

  test("for looping in array with context, complex version 1", async () => {
    const input = `<div>\n  <for condition="const item of array"><span><p>{item}</p><p>hello {item}</p></span><span>hello</span></for>\n</div>`;
    const parserTest = new HtmlParser({
      indent: 2,
      globalContext: { array: ["a", "b"] },
    });
    expect(parserTest.transform(input)).toBe(
      `<div>\n  <span><p>a</p><p>hello a</p></span><span>hello</span><span><p>b</p><p>hello b</p></span><span>hello</span>\n</div>`
    );
  });

  test("for looping in array with deep context", async () => {
    const input = `<div>\n  <for condition="const user of array"><span>{user.firstName}-{user.lastName}</span></for>\n</div>`;
    const parserTest = new HtmlParser({
      indent: 2,
      globalContext: {
        array: [
          { firstName: "john", lastName: "doe" },
          { firstName: "jannet", lastName: "foe" },
        ],
      },
    });
    expect(parserTest.transform(input)).toBe(
      `<div>\n  <span>john-doe</span><span>jannet-foe</span>\n</div>`
    );
  });
});
