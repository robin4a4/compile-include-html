import { expect, test, vi, describe } from "vitest";
import { HtmlParser } from "../src";

describe("Combine logics tests", () => {
  test("for looping in array with <include /> as child and attributes context replacement", async () => {
    const input = `<for condition="const userContext of array"><include src='card.html' with='user: userContext;'></include></for>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<a href="{user.link.href}" class="card">{user.link.name} {user.firstName} {user.lastName}'s page</a>`;
      return card;
    });

    const parserTest = new HtmlParser({
      indent: 2,
      globalContext: {
        array: [
          {
            firstName: "john",
            lastName: "doe",
            link: {
              href: "https://example.com/john",
              name: "link to",
            },
          },
          {
            firstName: "jannet",
            lastName: "foe",
            link: {
              href: "https://example.com/jannet",
              name: "link to",
            },
          },
        ],
      },
    });
    expect(parserTest.transform(input)).toBe(
      `<a href="https://example.com/john" class="card">link to john doe's page</a><a href="https://example.com/jannet" class="card">link to jannet foe's page</a>`
    );
  });
  test("for looping in array with <include /> as child and include attr replacement", async () => {
    const input = `<for condition="const userContext of array"><include src='{fileName}' with='user: userContext;'></include></for>`;
    vi.spyOn(HtmlParser.prototype, "readFile").mockImplementation(() => {
      const card = `<a href="{user.link.href}" class="card">{user.link.name} {user.firstName} {user.lastName}'s page</a>`;
      return card;
    });

    const parserTest = new HtmlParser({
      indent: 2,
      globalContext: {
        filename: "card.html",
        array: [
          {
            firstName: "john",
            lastName: "doe",
            link: {
              href: "https://example.com/john",
              name: "link to",
            },
          },
          {
            firstName: "jannet",
            lastName: "foe",
            link: {
              href: "https://example.com/jannet",
              name: "link to",
            },
          },
        ],
      },
    });
    expect(parserTest.transform(input)).toBe(
      `<a href="https://example.com/john" class="card">link to john doe's page</a><a href="https://example.com/jannet" class="card">link to jannet foe's page</a>`
    );
  });
});
