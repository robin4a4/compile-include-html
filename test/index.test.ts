import { expect, test, vi } from "vitest";
import { Includer } from "../src";

test("simple include", async () => {
  const input = `<div><include src="card.html" with="text: 'hello world'"></include></div>`;
  vi.spyOn(Includer.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">{text}</div>`;
    return card;
  });

  const parser = new Includer();
  expect(parser.transform(input)).toBe(
    `<div><div class="card">hello world</div></div>`
  );
});

test("simple include with indentation", async () => {
  const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
  vi.spyOn(Includer.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    {text}\n</div>`;
    return card;
  });
  const parserTest = new Includer();
  expect(parserTest.transform(input)).toBe(
    `<div>\n    <div class="card">\n        hello world\n    </div>\n</div>`
  );
});

test("double include with indentation", async () => {
  const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
  vi.spyOn(Includer.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    {text}\n</div>`;
    return card;
  });
  const parserTest = new Includer();
  expect(parserTest.transform(input)).toBe(
    `<div>\n    <div class="card">\n        hello world\n    </div>\n    <div class="card">\n        hello world\n    </div>\n</div>`
  );
});

test("double include with indentation and random code between", async () => {
  const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n    <p><span style='background: red;'>hi !</span></p>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
  vi.spyOn(Includer.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    {text}\n</div>`;
    return card;
  });
  const parserTest = new Includer();
  expect(parserTest.transform(input)).toBe(
    `<div>\n    <div class="card">\n        hello world\n    </div>\n    <p><span style="background: red;">hi !</span></p>\n    <div class="card">\n        hello world\n    </div>\n</div>`
  );
});

test("simple include with optional indentation", async () => {
  const input = `<div>\n  <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
  vi.spyOn(Includer.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    {text}\n</div>`;
    return card;
  });
  const parserTest = new Includer({ indent: 2 });
  expect(parserTest.transform(input)).toBe(
    `<div>\n  <div class="card">\n      hello world\n  </div>\n</div>`
  );
});

test("simple include without context", async () => {
  const input = `<div>\n  <include src="card.html"></include>\n</div>`;
  vi.spyOn(Includer.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    hello world\n</div>`;
    return card;
  });
  const parserTest = new Includer({ indent: 2 });
  expect(parserTest.transform(input)).toBe(
    `<div>\n  <div class="card">\n      hello world\n  </div>\n</div>`
  );
});

test("for loop without context", async () => {
  const input = `<div>\n  <for condition="let i = 0; i < 3; i++"><span>hello world</span></for>\n</div>`;
  const parserTest = new Includer({ indent: 2 });
  expect(parserTest.transform(input)).toBe(
    `<div>\n  <span>hello world</span><span>hello world</span><span>hello world</span>\n</div>`
  );
});

test("for loop with context", async () => {
  const input = `<div>\n  <for condition="let i = 0; i < 3; i++"><span>{i}</span></for>\n</div>`;
  const parserTest = new Includer({ indent: 2 });
  expect(parserTest.transform(input)).toBe(
    `<div>\n  <span>1</span><span>2</span><span>3</span>\n</div>`
  );
});

test("for looping in array without context", async () => {
  const input = `<div>\n  <for condition="const item of array"><span>hello</span></for>\n</div>`;
  const parserTest = new Includer({
    indent: 2,
    globalContext: { array: ["a", "b", "c"] },
  });
  expect(parserTest.transform(input)).toBe(
    `<div>\n  <span>hello</span><span>hello</span><span>hello</span>\n</div>`
  );
});

test("for looping in array with context", async () => {
  const input = `<div>\n  <for condition="const item of array"><span>{item}</span></for>\n</div>`;
  const parserTest = new Includer({
    indent: 2,
    globalContext: { array: ["a", "b", "c"] },
  });
  expect(parserTest.transform(input)).toBe(
    `<div>\n  <span>a</span><span>b</span><span>c</span>\n</div>`
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
  vi.spyOn(Includer.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    {text}\n</div>`;
    return card;
  });
  const parserTest = new Includer({ inputIsDocument: true });
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
  vi.spyOn(Includer.prototype, "readFile").mockImplementation(() => {
    const card = `<div><include src="card.html" with="text: 'hello world'"></include></div>`;
    return card;
  });
  const parserTest = new Includer();
  expect(parserTest.transform(input)).toBe(null);
});
