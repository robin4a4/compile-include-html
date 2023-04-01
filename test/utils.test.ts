import { expect, test } from "vitest";
import { deepStringReplacement, matchBrackets } from "../src/utils";

const boolean = true;
function getColor(status: "success" | "failure") {
  return status === "success" ? "green" : "red";
}
test.each([
  ["hello {input}", { input: "world" }, "hello world"],
  [
    "hello {input1} {input2}",
    { input1: "huge", input2: "world" },
    "hello huge world",
  ],
  [
    "hello {input.firstKey}",
    {
      input: {
        firstKey: "world",
      },
    },
    "hello world",
  ],
  [
    "hello {input.firstKey.secondKey.thirdKey.fourthKey}",
    {
      input: {
        firstKey: {
          secondKey: {
            thirdKey: {
              fourthKey: "world",
            },
          },
        },
      },
    },
    "hello world",
  ],
  [
    "hello {boolean ? 'world' : 'not world'}",
    {
      boolean: true,
    },
    "hello world",
  ],
  [
    "hello {boolean ? 'world' : 'not world'}",
    {
      boolean: false,
    },
    "hello not world",
  ],
  [
    "hello {item.boolean ? item.truth : item.lie}",
    {
      item: {
        boolean: true,
        truth: "world",
        lie: "not world",
      },
    },
    "hello world",
  ],
  [
    "hello {item.boolean ? item.truth : item.lie}",
    {
      item: {
        boolean: !boolean,
        truth: "world",
        lie: "not world",
      },
    },
    "hello not world",
  ],
  [
    "hello {item.var === 'hello' ? item.truth : item.lie}",
    {
      item: {
        var: "hello",
        truth: "world",
        lie: "not world",
      },
    },
    "hello world",
  ],
  [
    "hello {var.toUpperCase()}",
    {
      var: "world",
    },
    "hello WORLD",
  ],
  [
    "hello {getColor(var)} world",
    {
      var: "success",
      getColor,
    },
    "hello green world",
  ],
  [
    "hello {getColor(var.nestedVar)} world",
    {
      var: { nestedVar: "success" },
      getColor,
    },
    "hello green world",
  ],
])("deepStringReplacement", (inputString, contextObject, expected) => {
  expect(deepStringReplacement(inputString, contextObject)).toBe(expected);
});

test.each([
  [
    "hello {input} {link.test}",
    null,
    {
      input: "newInput",
      link: "ev.detail",
    },
    "hello {input} {ev.detail.test}",
  ],
  [
    "hello {input.firstKey.secondKey.thirdKey.fourthKey}",
    {
      newInput: {
        firstKey: {
          secondKey: {
            thirdKey: {
              fourthKey: "world",
            },
          },
        },
      },
    },
    {
      input: "newInput",
    },
    "hello world",
  ],
])(
  "deepStringReplacement with text replacement",
  (inputString, contextObject, variableReplacements, expected) => {
    expect(
      // @ts-ignore
      deepStringReplacement(inputString, contextObject, variableReplacements)
    ).toBe(expected);
  }
);

test.each([
  ["{item}", ["item"]],
  ["lorem {item1} ipsum {item2}", ["item1", "item2"]],
])("match brackets group", (inputString, expected) => {
  expect(matchBrackets(inputString)).toStrictEqual(expected);
});
