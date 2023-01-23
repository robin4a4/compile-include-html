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
  const input = `<div>
  <include src="card.html" with="text: 'hello world'"></include>
</div>`;
  vi.spyOn(FileParser.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">
    {text}
</div>`;
    return card;
  });
  const parserTest = new FileParser();
  expect(parserTest.serialize(input)).toBe(`<div>
  <div class="card">
        hello world
    </div>
</div>`);
});

test.skip("double include with indentation", async () => {
  const input = `<div>
  <include src="card.html" with="text: 'hello world'"></include>
  <include src="card.html" with="text: 'hello world'"></include>
</div>`;
  vi.spyOn(FileParser.prototype, "readFile").mockImplementation(() => {
    const card = `<div class="card">
    {text}
</div>`;
    return card;
  });
  const parserTest = new FileParser();
  expect(parserTest.serialize(input)).toBe(`<div>
  <div class="card">
        hello world
    </div>
  <div class="card">
        hello world
    </div>
</div>`);
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
