import { TContext } from "./types";
// @ts-ignore
import { tmpl } from "riot-tmpl";

/**
 * Replace a string containing a bracket expression by the value
 * in the provided context.
 *
 * It supports ternary expression with a boolean value as a contition.
 *
 * Example:
 *  - input string: `Hello {nested.condition ? 'really' : nested.falsy} {foo} {bar.baz}`
 *  - context: {
 *      foo: "strange",
 *      bar: {
 *        baz: "world"
 *      }
 *      nested: {
 *       condition: true,
 *       falsy: "not so"
 *      }
 *    }
 *  - returns: `Hello really strange world`
 *
 * @param {string} inputString
 * @param {TContext} contextObject
 * @returns {string}
 */
export function deepStringReplacement(
  inputString: string,
  contextObject: TContext
): string {
  tmpl.errorHandler = (err: any) => {
    throw new Error(err);
  };
  try {
    const computedString = tmpl(inputString, contextObject);
    if (computedString === undefined) return inputString;
    return computedString;
  } catch {
    return inputString;
  }
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
  let context: TContext = { ...currentContext };
  const valuesArray = attrValue.split(";");
  valuesArray.forEach((value) => {
    const [keyFromArray, valueFromArray] = value.split(":");
    if (keyFromArray && valueFromArray) {
      const key = keyFromArray.trim().replaceAll(" ", "-");
      const value = valueFromArray.trim();
      if (!value.startsWith("'") && !value.endsWith("'")) {
        context[key] = deepStringReplacement(`{${value}}`, context);
      } else {
        context[key] = valueFromArray.trim().replaceAll("'", "");
      }
    }
  });
  return context;
}
