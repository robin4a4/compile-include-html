import { TContext } from "./types";

/**
 * Replace a string containing a bracket expression by the value
 * in the provided context.
 *
 * Example:
 *  - input string: `Hello {foo} {bar.baz}`
 *  - context: {
 *      foo: "strange",
 *      bar: {
 *        baz: "world"
 *      }
 *    }
 *  - returns: `Hello strange world`
 *
 * @param {string} inputString
 * @param {TContext} contextObject
 * @returns {string}
 */
export function deepStringReplacement(
  inputString: string,
  contextObject: TContext
): string {
  matchBrackets(inputString).forEach((valueInBracket) => {
    let replacementValue = contextObject;
    valueInBracket.split(".").forEach((contextKey) => {
      if (typeof replacementValue[contextKey] === "string") {
        inputString = inputString.replaceAll(
          `{${valueInBracket}}`,
          replacementValue[contextKey]
        );
      }
      replacementValue = replacementValue[contextKey];
    });
  });
  return inputString;
}

/**
 * Retreive all occurences of brackets wrapped values in a string.
 *
 * Example:
 *  - input string: `Hello {foo} {bar.baz}`
 *  - returns: ["foo", "bar.baz"]
 *
 * @param {string} inputString
 * @returns {string[]}
 */
export function matchBrackets(inputString: string): string[] {
  const match = inputString.matchAll(/{(.*?)}/g);
  const matches = [...match].map((match) => match[1]);
  // @ts-ignore figure out why the filter is not working properly
  return matches.filter(Boolean);
}

/**
 * Transform the include's "with" attribute value into a context.
 *
 * Example without current context:
 *  - attrValue: `foo: "foobar"; baz: "bazbar"`
 *  - currentContext: null
 *  - returns: {
 *      foo: "foobar",
 *      baz: "bazbar"
 *    }
 *
 * Example with current context:
 *  - attrValue: `foo: bar"`
 *  - currentContext: {
 *      bar: {
 *        baz: "foobar",
 *       }
 *    }
 *  - returns: {
 *      foo: {
 *        baz: "foobar",
 *       }
 *    }
 *
 * @param {string} attrValue
 * @param {TContext | null} currentContext
 * @returns {TContext}
 */
export function parseIncludeContext(
  attrValue: string,
  currentContext: TContext | null
): TContext {
  let context: TContext = {};
  const valuesArray = attrValue.split(";");
  valuesArray.forEach((value) => {
    const [keyFromArray, valueFromArray] = value.split(":");
    if (keyFromArray && valueFromArray) {
      const key = keyFromArray.trim().replaceAll(" ", "-");
      const value = valueFromArray.trim();
      if (currentContext && currentContext[value]) {
        context[key] = currentContext[value];
      } else {
        context[key] = valueFromArray.trim().replaceAll("'", "");
      }
    }
  });
  return context;
}
