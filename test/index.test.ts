import { expect, test, vi } from "vitest";
import { FileParser } from "../src";
// import mock from "mock-fs";

test("simple include", () => {
  const input = `<div>
  <include src="card.html" with="text: 'hello world'"></include>
</div>`;

  const parser = new FileParser();
  vi.mock("node:fs", async () => {
    const card = `<div class="card">
  {text}
</div>`;
    return {
      ...(await vi.importActual<typeof import("node:fs")>("node:fs")),
      readFileSync: vi.fn().mockReturnValue(card),
    };
  });
  expect(parser.serialize(input)).toBe(`<div>
  <div class="card">
    hello world
  </div>
</div>`);
});
