import Lexer from '../lib/core/lexer';
import Parser from '../lib/core/parser';
import { describe, it, expect, beforeEach } from 'vitest';
import { ZareConfig } from '../lib/config';

const root = import.meta.dirname;
const testFilePath = import.meta.filename;

const config = new ZareConfig(root, {
  alias: {
    '@/*': ['./dummy_static/*'],
  },
  staticDir: ['./dummy_static'],
});

const render = (testCode: string, dummyParams = {}): string => {
  const tokens = new Lexer(testCode, '').start();
  const parser = new Parser(tokens, dummyParams, root);
  parser.config = config;
  parser.filePath = testFilePath;
  const parsed = parser.parse();
  return parser.parameterExecuter(parsed);
};

const setParser = (testCode: string, dummyParams: Record<string, any> = {}) => {
  const tokens = new Lexer(testCode, '').start();
  const parser = new Parser(tokens, dummyParams, root);
  parser.config = config;
  parser.filePath = testFilePath;
  parser.parse();
  return parser;
};

describe('Parser', () => {
  let parser: Parser;

  beforeEach(() => {
    // Minimal token and param setup for isolated tests
    parser = new Parser([], { user: { name: 'John' }, arr: [1, 2, 3] }, '');
  });

  describe('getValue', () => {
    it('should get nested values using dot path', () => {
      const obj = { a: { b: { c: 42 } } };
      expect(parser.getValue(obj, 'a.b.c')).toBe(42);
    });

    it('should return undefined for invalid path', () => {
      const obj = { a: 1 };
      expect(parser.getValue(obj, 'a.b.c')).toBeUndefined();
    });

    it('should return undefined for invalid path', () => {
      const obj = { num: 1 };
      expect(parser.getValue('', '')).toBeUndefined();
    });

    it('should handle array index in path', () => {
      const obj = { arr: [10, 20, 30] };
      expect(parser.getValue(obj, 'arr[1]')).toBe(20);
    });
  });

  describe('parameterExecuter', () => {
    it('should replace @() with parameter value', () => {
      const html = 'Hello @(user.name)!';
      expect(parser.parameterExecuter(html)).toBe('Hello John!');
    });

    it('should return empty string if parameters not set', () => {
      const p = new Parser([], undefined, '');
      expect(p.parameterExecuter('Hello @(user.name)!')).toBe('Hello !');
    });
  });

  describe('function evaluator', () => {
    it('should evaluate function call with string', () => {
      const testCode = `use string
            serve (
                @upper("Hello")
            )
            `;

      expect(render(testCode).trim()).toBe('HELLO');
    });

    it('should evaluate function call with function call as argument', () => {
      const testCode = `use math

            fn sum(a, b) {
                return Number(a) + Number(b)
            }
            serve (
                @pow(sum(2, 3), 2)
            )
            `;

      expect(render(testCode, {}).trim()).toBe('25');
    });

    it('should evaluate function call with parameter', () => {
      const testCode = `use string
            serve (
                @upper(user)
            )
            `;

      expect(render(testCode, { user: 'fake_user' }).trim()).toBe('FAKE_USER');
    });

    it('should extract function call', () => {
      expect(
        parser.extractFunctionCallValues("@functionCall('arg1', 'arg2')"),
      ).toEqual({ fnName: 'functionCall', fnArgs: ['arg1', 'arg2'] });
    });
  });

  describe('updateParameter', () => {
    it('should update parameters correctly', () => {
      const testCode = `serve (
                @(user)
            )`;
      const tokens = new Lexer(testCode, '').start();
      const parser = new Parser(tokens, { user: 'fake_user_1' }, '');
      const html = parser.updateParameters({ user: 'fake_user_2' }).trim();
      expect(html).includes('fake_user_2');
    });
  });

  describe('linkStatic', () => {
    it('should link the css', () => {
      const testHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Dummy</title>
            </head>
            <body>

            </body>
            </html>`;

      const testCode = `link "@/dummy"
            serve (
            ${testHtml}
            )`;

      const parser = setParser(testCode);
      const html = parser.linkStatic(testHtml);

      expect(html).includes(`<link rel="stylesheet" href="/dummy" />`);
    });

    it('should throw head tag not found error for linking css', () => {
      const testCode = `link "@/dummy"`;

      try {
        const parser = setParser(testCode);
        parser.linkStatic('');
      } catch (error) {
        if (error instanceof Error)
          expect(error.message).includes(
            `Head tag is required to link scripts`,
          );
      }
    });

    it('should handle linking the css without title tag', () => {
      const testHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body>

            </body>
            </html>`;

      const testCode = `link "@/dummy"
            serve (
            ${testHtml}
            )`;

      const parser = setParser(testCode);
      const html = parser.linkStatic(testHtml);

      expect(html).includes(`<link rel="stylesheet" href="/dummy" />`);
    });

    it('should import the js', () => {
      const testHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Dummy</title>
            </head>
            <body>

            </body>
            </html>`;

      const testCode = `import "@/dummy"
            serve (
            ${testHtml}
            )`;

      const parser = setParser(testCode);
      const html = parser.linkStatic(testHtml);
      expect(html).includes(`<script src="/dummy" defer></script>`);
    });

    it('should throw head tag not found error for importing js', () => {
      const testCode = `import "@/dummy"`;

      try {
        const parser = setParser(testCode);
        parser.linkStatic('');
      } catch (error) {
        if (error instanceof Error)
          expect(error.message).includes(
            `Head tag is required to link scripts`,
          );
      }
    });

    it('should handle importing the js without title tag', () => {
      const testHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </head>
            <body>

            </body>
            </html>`;

      const testCode = `import "@/dummy"
            serve (
            ${testHtml}
            )`;

      const parser = setParser(testCode);
      const html = parser.linkStatic(testHtml);

      expect(html).includes(`<script src="/dummy" defer></script>`);
    });
  });

  describe('use module', () => {
    it('should add all methods in string module', () => {
      const testCode = `use string
            serve (@lower("HELLO WORLD"))`;
      const html = render(testCode);
      expect(html).toBe(`hello world`);
    });

    it('should add all methods in number module', () => {
      const testCode = `use number
            serve (@toFixed("2.54", 0))`;
      const html = render(testCode);
      expect(html).toBe(`3`);
    });

    it('should add all methods in math module', () => {
      const testCode = `use math
            serve (@PI())`;
      const html = render(testCode);
      expect(html).toBe(`3.141592653589793`);
    });

    it('should add all methods in date module', () => {
      const date = '2005-11-15';
      const fullYear = new Date(date).getFullYear();

      const testCode = `use date
            serve (@getFullYear("${date}"))`;

      const html = render(testCode);
      expect(html).toBe(`${fullYear}`);
    });

    it('should throw error of unknown module usage ', () => {
      const testCode = `use regex`;
      try {
        render(testCode);
      } catch (error) {
        if (error instanceof Error)
          expect(error.message).includes(`Unknown module regex`);
      }
    });
  });

  describe('function declaration', () => {
    it('should declare a function with name concat', () => {
      const testCode = `
            fn concat (a, b) {
                return a + b;
            }`;

      const html = render(testCode);
      expect(html).toBeFalsy();
    });

    it('should call a function with name concat', () => {
      const testCode = `
            fn concat (a, b) {
                return a + b;
            }

            serve (@concat("a", "b"))`;

      const html = render(testCode);
      expect(html).toBe('ab');
    });
  });

  describe('components', () => {
    it('should import component', () => {
      const testCode = `as Dummy import "./dummy_views/dummy"`;
      const html = render(testCode);

      expect(html).toBeFalsy();
    });

    it('should throw unended component error', () => {
      const testCode = `
            as Dummy import "./dummy_views/dummy"
            serve (<Dummy>)`;

      try {
        render(testCode);
      } catch (error) {
        if (error instanceof Error)
          expect(error.message).includes('Unended component');
      }
    });

    describe('self closing components', () => {
      it('should display self closing component', () => {
        const testCode = `
                as Dummy import "./dummy_views/dummy"
                serve (<Dummy/>)`;

        const html = render(testCode);
        expect(html.trim()).toBe('<div></div>');
      });

      it('should display attributes in self closing component', () => {
        const testCode = `
                as Dummy import "./dummy_views/dummy_attr"
                serve (<Dummy name="fake_name"/>)`;

        const html = render(testCode);
        expect(html.trim()).toBe('<div>fake_name</div>');
      });

      it('should display parameters as attributes in self closing component', () => {
        const testCode = `
                as Dummy import "./dummy_views/dummy_param_attr"
                serve (<Dummy user=@(data)/>)`;

        const html = render(testCode, { data: { name: 'fake_name' } });
        expect(html.trim()).toBe('<div>fake_name</div>');
      });

      it('should not display slot when using self closing component', () => {
        const testCode = `
                as Dummy import "./dummy_views/dummy_slot_self_closing_component"
                serve (<Dummy/>)`;

        const html = render(testCode);
        expect(html.trim()).includes('Use opening and closing components');
      });
    });

    describe('opening & closing components', () => {
      it('should display opening and closing component', () => {
        const testCode = `
                as Dummy import "./dummy_views/dummy.zare"
                serve (<Dummy></Dummy>)`;

        const html = render(testCode);
        expect(html.trim()).toBe('<div></div>');
      });

      it('should display attributes in opening & closing component', () => {
        const testCode = `
                as Dummy import "./dummy_views/dummy_attr.zare"
                serve (<Dummy name="fake_name"></Dummy>)`;

        const html = render(testCode);
        expect(html.trim()).toBe('<div>fake_name</div>');
      });

      it('should display parameter attributes in opening & closing component', () => {
        const testCode = `
                as Dummy import "./dummy_views/dummy_param_attr.zare"
                serve (<Dummy user=@(data)></Dummy>)`;

        const html = render(testCode, { data: { name: 'fake_name' } });
        expect(html.trim()).toBe('<div>fake_name</div>');
      });

      it('should display slot in component', () => {
        const testCode = `
                as Dummy import "./dummy_views/dummy_slot"
                serve (<Dummy>fake_slot</Dummy>)`;

        const html = render(testCode);
        expect(html.trim()).toBe('<div>fake_slot</div>');
      });
    });
  });

  describe('tags', () => {
    describe('custom element tag', () => {
      it('should handle style tag', () => {
        const testCode = `serve (<my-element></my-element>)`;
        const html = render(testCode);
        expect(html).toBe(`<my-element></my-element>`);
      });
    });

    describe('style tag', () => {
      it('should handle style tag', () => {
        const testCode = `serve (<style>body{color: red;}</style>)`;
        const html = render(testCode);
        expect(html).toBe(`<style>body{color: red;}</style>`);
      });
    });

    describe('script tag', () => {
      it('should handle script tag', () => {
        const testCode = `serve (<script>console.log("Hello World")</script>)`;
        const html = render(testCode);
        expect(html).toBe(`<script>console.log("Hello World")</script>`);
      });
    });
  });

  describe('@if', () => {
    it('should display value in if block', () => {
      const testCode = `serve (
            @if (1+1 == 2) {
                fake_value
            }
            )`;

      const html = render(testCode);
      expect(html.trim()).toBe('fake_value');
    });

    it('should not display value in if block', () => {
      const testCode = `serve (
            @if (1+1 != 2) {
                fake_value
            }
            )`;

      const html = render(testCode);
      expect(html.trim()).toBeFalsy();
    });

    it('should display username in if block', () => {
      const testCode = `serve (
            @if (user) {
                @(user)
            }
            )`;

      const html = render(testCode, { user: 'fake_user' });
      expect(html.trim()).toBe('fake_user');
    });

    it('should display Hello World in if block', () => {
      const testCode = `
            fn toggle (value) {
                return !value
            }

            serve (
            @if (toggle(0)) {
                <h1>Hello World</h1>
            }
            )`;

      const html = render(testCode);
      expect(html.trim()).toBe('<h1>Hello World</h1>');
    });
  });

  describe('@else', () => {
    it('should not display value in else block', () => {
      const testCode = `serve (
            @if (1+1 == 2) {
                fake_value_if
            } @else {
                fake_value_else
            }
            )`;

      const html = render(testCode);
      expect(html.trim()).toBe('fake_value_if');
    });

    it('should display Hello World from else', () => {
      const testCode = `
            fn toggle (value) {
                return !value
            }

            serve (
                @if (toggle(1)) {
                    <h1>Hello World from if</h1>
                } @else {
                    <h1>Hello World from else</h1>
                }
            )`;

      const html = render(testCode);
      expect(html.trim()).toBe('<h1>Hello World from else</h1>');
    });
  });

  describe('@each', () => {
    it('should parse the forEach for one dimension array', () => {
      const testCode = `serve (@each (arr:a) {@(a)})`;
      const html = render(testCode, { arr: ['v1', 'v2', 'v3'] });

      expect(html).toBe('v1v2v3');
    });

    it("should parse the forEach for array's index", () => {
      const testCode = `serve (@each (arr:a) {@(_i)})`;
      const html = render(testCode, { arr: ['v1', 'v2', 'v3'] });

      expect(html).toBe('012');
    });

    it('should parse the forEach statement with spaces', () => {
      const testCode = `serve (@each(arr:a){@(_i)})`;
      const html = render(testCode, { arr: ['v1', 'v2', 'v3'] });
      expect(html).toBe('012');
    });
  });

  it('should handle unknown character', () => {
    const testCode = `serve ( ? )`;
    const html = render(testCode);

    expect(html.trim()).toBe('?');
  });
});
