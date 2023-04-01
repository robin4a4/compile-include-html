import type { Plugin } from "vite";
import { HtmlParser } from ".";

const parseReplacement = (withvalue: string) => {
  const variableReplacements: Record<string, string> = {};
  const valuesArray = withvalue.split(";");
  valuesArray.forEach((value) => {
    const [keyFromArray, valueFromArray] = value.split(":");
    if (keyFromArray && valueFromArray) {
      const key = keyFromArray.trim().replaceAll(" ", "");
      const value = valueFromArray.trim().replace(/^\${(.*)}$/, "$1");
      variableReplacements[key] = value;
    }
  });
  return variableReplacements;
};

function getWithValueAndFullString(source: string): {
  withValues: string[];
  fullStrings: string[];
  srcValues: string[];
} {
  const regex = /<include\s+src="([^"]*)"(?:\s+with="([^"]*)")?><\/include>/g;
  const withValues: string[] = [];
  const fullStrings: string[] = [];
  const srcValues: string[] = [];
  let match;

  while ((match = regex.exec(source)) !== null) {
    srcValues.push(match[1] ? match[1] : "");

    withValues.push(match[2] ?? "");
    fullStrings.push(match[0] ?? "");
  }
  return { withValues, fullStrings, srcValues };
}

export const ExperimentalCompileIncludePlugin = (): Plugin => {
  const clientFileRegex = /\.client\./i;
  return {
    name: "include-html",
    transform(code, id) {
      if (!clientFileRegex.test(id)) {
        return;
      }

      const { withValues, fullStrings, srcValues } =
        getWithValueAndFullString(code);

      const folder = id.substring(0, id.lastIndexOf("/"));
      srcValues.forEach((src, index) => {
        const withValue = withValues[index];
        const htmlParser = new HtmlParser({
          variableReplacements:
            withValue !== undefined ? parseReplacement(withValue) : null,
          basePath: folder,
          replaceByTemplateLitterals: true,
        });
        const source = htmlParser.readFile(src);
        const compiledSource = htmlParser.transform(source);
        const fullString = fullStrings[index];
        if (fullString) code = code.replaceAll(fullString, compiledSource);
      });

      return {
        code,
      };
    },
  };
};
