import { expect, test, vi } from "vitest";
import { deepStringReplacement, matchBrackets } from "../src/utils";

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
])("deepStringReplacement", (inputString, contextObject, expected) => {
  expect(deepStringReplacement(inputString, contextObject)).toBe(expected);
});

test.each([
  ["{item}", ["item"]],
  ["lorem {item1} ipsum {item2}", ["item1", "item2"]],
])("match brackets group", (inputString, expected) => {
  expect(matchBrackets(inputString)).toStrictEqual(expected);
});
