import { TContext } from "./types";
// @ts-ignore
import { tmpl } from "riot-tmpl";
/**
 * Given a string containing a dot notation, return the corresponding
 * value in the context.
 *
 * @param {string} dotString
 * @param {TContext} contextObject
 * @returns {TContext | any} TODO: figure out how to type this properly with generics
 */
export function getContextValueFromDotString(
  dotString: string,
  contextObject: TContext
) {
  let replacementValue: TContext | any = contextObject;
  dotString.split(".").forEach((contextKey) => {
    replacementValue = replacementValue[contextKey];
  });
  return replacementValue;
}

/**
 * Small variation of getContextValueFromDotString that returns a either a
 * computed string from the context or the original string.
 *
 * @param {string} dotString
 * @param {TContext} contextObject
 * @returns {string}
 */
export function getReplacementStringFromDotString(
  dotString: string,
  contextObject: TContext
) {
  const replacementValue = getContextValueFromDotString(
    dotString,
    contextObject
  );
  return typeof replacementValue === "string" ? replacementValue : dotString;
}

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
  // matchBrackets(inputString).forEach((valueInBracket) => {
  //   let replacementString = `{${valueInBracket}}`;
  //   const ternarySplit = valueInBracket.split(" ? ");
  //   if (ternarySplit.length === 2) {
  //     const condition = ternarySplit[0]?.replaceAll(" ", "");
  //     const result = ternarySplit[1]?.replaceAll("'", "").split(" : ");
  //     if (condition && result && result.length === 2) {
  //       const contextValue = getContextValueFromDotString(
  //         condition,
  //         contextObject
  //       );
  //       const truthyValue = result[0]
  //         ? getReplacementStringFromDotString(result[0].trim(), contextObject)
  //         : "";
  //       const falsyValue = result[1]
  //         ? getReplacementStringFromDotString(result[1].trim(), contextObject)
  //         : "";

  //       replacementString = Boolean(contextValue) ? truthyValue : falsyValue;
  //     }
  //   } else {
  //     replacementString = getReplacementStringFromDotString(
  //       valueInBracket,
  //       contextObject
  //     );
  //   }
  //   inputString = inputString.replaceAll(
  //     `{${valueInBracket}}`,
  //     replacementString
  //   );
  // });
  return tmpl(inputString, contextObject);
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
      if (currentContext) {
        context[key] = deepStringReplacement(`{${value}}`, currentContext);
      } else {
        context[key] = valueFromArray.trim().replaceAll("'", "");
      }
    }
  });
  return context;
}
