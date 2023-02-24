import { TContext } from "./types";

export function deepStringReplacement(
  inputString: string,
  contextObject: Record<string, any>
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

export function matchBrackets(inputString: string): string[] {
  const match = inputString.matchAll(/{(.*?)}/g);
  const matches = [...match].map((match) => match[1]);
  // @ts-ignore figure out why the filter is not working properly
  return matches.filter(Boolean);
}

export function trimChar(string: string, chars: string) {
  const leftRegex = new RegExp("^" + chars + "+");
  const rightRegex = new RegExp(chars + "$");
  return string.replace(leftRegex, "").replace(rightRegex, "");
}

export function trimBrackets(string: string) {
  return string.replaceAll("{", "").replace("}", "");
}

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
