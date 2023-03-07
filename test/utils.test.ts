import { expect, test, vi } from "vitest";
import {
  deepStringReplacement,
  getContextValueFromDotString,
  matchBrackets,
} from "../src/utils";

test.each([
  ["input", { input: "hello world" }, "hello world"],
  [
    "input.firstKey",
    {
      input: {
        firstKey: 2,
      },
    },
    2,
  ],
  [
    "input.firstKey.secondKey.thirdKey.fourthKey",
    {
      input: {
        firstKey: {
          secondKey: {
            thirdKey: {
              fourthKey: "hello world",
            },
          },
        },
      },
    },
    "hello world",
  ],
])(
  "getReplacementStringFromDotString",
  (dotString, contextObject, expected) => {
    expect(getContextValueFromDotString(dotString, contextObject)).toBe(
      expected
    );
  }
);

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
        boolean: false,
        truth: "world",
        lie: "not world",
      },
    },
    "hello not world",
  ],
])("deepStringReplacement", (inputString, contextObject, expected) => {
  expect(deepStringReplacement(inputString, contextObject)).toBe(expected);
});

test.each([
  ["{item}", ["item"]],
  ["lorem {item1} ipsum {item2}", ["item1", "item2"]],
])("match brackets group", (inputString, expected) => {
  expect(matchBrackets(inputString)).toStrictEqual(expected);
});
