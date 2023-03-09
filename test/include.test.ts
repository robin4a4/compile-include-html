import { expect, test, vi, describe } from "vitest";
import { HtmlParser } from "../src";

describe("<include /> tests", () => {
  test("simple include", async () => {
    const input = `<div><include src="card.html" with="text: 'hello world'"></include></div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">{text}</div>`;
      return card;
    });

    const parser = new HtmlParser();
    expect(parser.transform(input)).toBe(
      `<div><div class="card">hello world</div></div>`
    );
  });
  test("simple include with global context", async () => {
    const input = `<div><include src="card.html"></include></div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">{text}</div>`;
      return card;
    });

    const parser = new HtmlParser({
      globalContext: { text: "hello world" },
    });
    expect(parser.transform(input)).toBe(
      `<div><div class="card">hello world</div></div>`
    );
  });
  test("simple include with global context and local context", async () => {
    const input = `<div><include src="card.html" with="local: 'local'"></include></div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">{local} {test}</div>`;
      return card;
    });

    const parser = new HtmlParser({
      globalContext: { test: "global" },
    });
    expect(parser.transform(input)).toBe(
      `<div><div class="card">local global</div></div>`
    );
  });
  test("include with global context, reexporting a value", async () => {
    const input = `<div><include src="card.html" with="linkName: link"></include></div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">{linkName.name}</div>`;
      return card;
    });

    const parser = new HtmlParser({
      globalContext: {
        link: {
          href: "https://google.com",
          name: "Google",
        },
      },
    });
    expect(parser.transform(input)).toBe(
      `<div><div class="card">Google</div></div>`
    );
  });

  test("include with global context, reexporting a nested value", async () => {
    const input = `<div><include src="card.html" with="linkName: link.name"></include></div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">{linkName}</div>`;
      return card;
    });

    const parser = new HtmlParser({
      globalContext: {
        link: {
          href: "https://google.com",
          name: "Google",
        },
      },
    });
    expect(parser.transform(input)).toBe(
      `<div><div class="card">Google</div></div>`
    );
  });

  test("simple include with indentation", async () => {
    const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">\n    {text}\n</div>`;
      return card;
    });
    const parserTest = new HtmlParser();
    expect(parserTest.transform(input)).toBe(
      `<div>\n    <div class="card">\n        hello world\n    </div>\n</div>`
    );
  });

  test("nested includes", async () => {
    const input = `<include src="card.html" with="text: 'card 1'"></include>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation((src) => {
      if (src === "other_card.html") {
        return `<div class="card 2">{text}</div>`;
      }
      return `<div class="card">{text} <include src="other_card.html" with="text: 'card 2'"></include></div>`;
    });
    const parserTest = new HtmlParser();
    expect(parserTest.transform(input)).toBe(
      `<div class="card">card 1 <div class="card 2">card 2</div></div>`
    );
  });

  test("double include with indentation", async () => {
    const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">\n    {text}\n</div>`;
      return card;
    });
    const parserTest = new HtmlParser();
    expect(parserTest.transform(input)).toBe(
      `<div>\n    <div class="card">\n        hello world\n    </div>\n    <div class="card">\n        hello world\n    </div>\n</div>`
    );
  });

  test("double include with indentation and random code between", async () => {
    const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n    <p><span style='background: red;'>hi !</span></p>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">\n    {text}\n</div>`;
      return card;
    });
    const parserTest = new HtmlParser();
    expect(parserTest.transform(input)).toBe(
      `<div>\n    <div class="card">\n        hello world\n    </div>\n    <p><span style="background: red;">hi !</span></p>\n    <div class="card">\n        hello world\n    </div>\n</div>`
    );
  });

  test("simple include with optional indentation", async () => {
    const input = `<div>\n  <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">\n    {text}\n</div>`;
      return card;
    });
    const parserTest = new HtmlParser({ indent: 2 });
    expect(parserTest.transform(input)).toBe(
      `<div>\n  <div class="card">\n      hello world\n  </div>\n</div>`
    );
  });

  test("simple include without context", async () => {
    const input = `<div>\n  <include src="card.html"></include>\n</div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">\n    hello world\n</div>`;
      return card;
    });
    const parserTest = new HtmlParser({ indent: 2 });
    expect(parserTest.transform(input)).toBe(
      `<div>\n  <div class="card">\n      hello world\n  </div>\n</div>`
    );
  });

  test.skip("vite default template", async () => {
    const input = `<!DOCTYPE html><html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite + TS</title>
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="/src/main.ts"></script>
    </body>
  </html>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div class="card">\n    {text}\n</div>`;
      return card;
    });
    const parserTest = new HtmlParser({ inputIsDocument: true });
    expect(parserTest.transform(input)).toBe(`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite + TS</title>
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="/src/main.ts"></script>
    </body>
  </html>`);
  });

  test.fails("recursive include should break", async () => {
    const input = `<div><include src="card.html" with="text: 'hello world'"></include></div>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<div><include src="card.html" with="text: 'hello world'"></include></div>`;
      return card;
    });
    const parserTest = new HtmlParser();
    expect(parserTest.transform(input)).toBe(null);
  });
});
