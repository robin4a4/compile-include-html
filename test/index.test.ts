import { expect, test, vi } from "vitest";
import { FileParser } from "../src";

test("simple include", async () => {
  const input = `<div><include src="card.html" with="text: 'hello world'"></include></div>`;
  vi.spyOn(FileParser.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">{text}</div>`;
    return card;
  });

  const parser = new FileParser();
  expect(parser.serialize(input)).toBe(
    `<div><div class="card">hello world</div></div>`
  );
});

test("simple include with indentation", async () => {
  const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
  vi.spyOn(FileParser.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    {text}\n</div>`;
    return card;
  });
  const parserTest = new FileParser();
  expect(parserTest.serialize(input)).toBe(
    `<div>\n    <div class="card">\n        hello world\n    </div>\n</div>`
  );
});

test("double include with indentation", async () => {
  const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
  vi.spyOn(FileParser.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    {text}\n</div>`;
    return card;
  });
  const parserTest = new FileParser();
  expect(parserTest.serialize(input)).toBe(
    `<div>\n    <div class="card">\n        hello world\n    </div>\n    <div class="card">\n        hello world\n    </div>\n</div>`
  );
});

test("double include with indentation and random code between", async () => {
  const input = `<div>\n    <include src="card.html" with="text: 'hello world'"></include>\n    <p><span style='background: red;'>hi !</span></p>\n    <include src="card.html" with="text: 'hello world'"></include>\n</div>`;
  vi.spyOn(FileParser.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">\n    {text}\n</div>`;
    return card;
  });
  const parserTest = new FileParser();
  expect(parserTest.serialize(input)).toBe(
    `<div>\n    <div class="card">\n        hello world\n    </div>\n    <p><span style="background: red;">hi !</span></p>\n    <div class="card">\n        hello world\n    </div>\n</div>`
  );
});

test.fails("recursive include should break", async () => {
  const input = `<div><include src="card.html" with="text: 'hello world'"></include></div>`;
  vi.spyOn(FileParser.prototype, "readFile").mockImplementation(() => {
    const card = `<div><include src="card.html" with="text: 'hello world'"></include></div>`;
    return card;
  });
  const parserTest = new FileParser();
  expect(parserTest.serialize(input)).toBe(null);
});
