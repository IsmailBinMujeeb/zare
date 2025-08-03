import Lexer from './lexer.js';
import Stack from '../utils/stack.js';
import Scope from '../utils/scope.js';
import { TOKEN_TYPES } from '../constants/tokenTypes.js';
import { KEYWORDS } from '../constants/keywords.js';
import type { Token } from '../types/token.js';
import modules from '../modules/index.js';
import fs from 'fs';
import path from 'path';
import Syntax_Error from '../errors/syntaxError.js';
import Template_Error from '../errors/templateError.js';
import { findNodeModules } from '../utils/helper.js';

const REGEX_ARRAY_INDEX = /\[(\w+)\]/g;
const REGEX_DOUBLE_QUOTE_KEY = /\["(.*?)"\]/g;
const REGEX_SINGLE_QUOTE_KEY = /\['(.*?)'\]/g;
const REGEX_FUNCTION_CALL = /[a-zA-Z0-9_]+\(([\s\S]*?)\)/g;
const REGEX_PARAMETER_EXPRESSION = /[a-zA-Z0-9]+/g;
const REGEX_FN_CALL_EXTRACT = /@([a-zA-Z0-9_]+)\(([\s\S]*)\)/;
const REGEX_COMPONENT_ATTR = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
const REGEX_OPENING_TAG = /^<([a-zA-Z0-9_-]+)([^>]*)\/?>/;
const REGEX_CLOSING_TAG = /^<\/([a-zA-Z0-9_-]+)>/;
const REGEX_SELF_CLOSING_TAG = /^<([^\s>\/]+)/;
const REGEX_STYLE_TAG = /^<style.*>$/;
const REGEX_SCRIPT_TAG = /^<script.*>$/;
const REGEX_END_STYLE_TAG = /^<\/.*style>$/;
const REGEX_END_SCRIPT_TAG = /^<\/.*script>$/;
const REGEX_HEAD_TAG = /<head[^>]*>/i;
const REGEX_PATH_STRING = /"([:.]?[\.\/]?[\w.\-\/ ]*)"/;
const REGEX_CSS_PATH = /^"(\.?\/.*)"$/;
const REGEX_JS_PATH = /^"(\.?\/.*)"$/;
const REGEX_FN_PARAMS = /^[a-zA-Z0-9.]+$/;
const REGEX_FN_CALLS_IN_FN_ARGS = /\b([a-zA-Z_]\w*)\s*\(\s*([^()]*?)\s*\)/;
const REGEX_EACH_EXPRESSION = /\((.*?)\)/;

export default class Parser {
  position: number;
  currentToken: Token;

  stack: Stack;
  scope: Scope;
  linker: Scope;
  script: Scope;
  functions: Scope;

  constructor(
    private tokens: Token[],
    private parameters: Record<string, any> | undefined = undefined,
    private __view: string,
    private parentComponent: Scope | undefined = undefined,
    private parentLinker: Scope | undefined = undefined,
    private parentScript: Scope | undefined = undefined,
    private parentFunctions: Scope | undefined = undefined,
  ) {
    this.position = 0;
    this.currentToken = this.tokens[this.position];
    this.stack = new Stack();
    this.scope = new Scope(parentComponent);
    this.linker = new Scope(parentLinker);
    this.script = new Scope(parentScript);
    this.functions = new Scope(parentFunctions);
  }

  /**
   * The `eat` function increments the position and updates the current token in a TypeScript code
   * snippet.
   */
  eat() {
    this.position++;
    this.currentToken = this.tokens[this.position];
  }

  /**
   * The `skipSpace` function in TypeScript skips over escape tokens in the current token stream.
   */
  skipSpace() {
    while (this.currentToken?.type == TOKEN_TYPES.ESCAPE) {
      this.eat();
    }
  }

  /**
   * The function `getValue` retrieves a value from an object based on a given path string.
   * @param {any} obj - The `obj` parameter in the `getValue` function is the object from which you
   * want to retrieve a value based on the provided path. This function takes an object (`obj`) and a
   * string path (`path`) as parameters. It then navigates through the object properties based on the
   * path provided and
   * @param {string} path - The `path` parameter in the `getValue` function is a string that
   * represents the path to a nested property within the `obj` object. It uses dot notation to
   * traverse through nested properties, and it can also handle array indexes and object keys
   * enclosed in square brackets or quotes.
   * @returns The `getValue` function takes an object `obj` and a string `path` as parameters. It
   * tries to access a nested property in the object based on the provided path string. If the
   * property exists, it returns the value of that property. If the property does not exist or if an
   * error occurs during the process, it returns `undefined`.
   */
  getValue(obj: any, path: string): any {
    try {
      const keys = path
        .replace(REGEX_ARRAY_INDEX, '.$1') // convert [0] to .0 or ["name"] to .name
        .replace(REGEX_DOUBLE_QUOTE_KEY, '.$1') // convert ["name"] to .name
        .replace(REGEX_SINGLE_QUOTE_KEY, '.$1') // convert ['name'] to .name
        .split('.');

      return keys.reduce((acc, key) => {
        if (acc && typeof acc === 'object') {
          return acc[key];
        }
        return undefined;
      }, obj);
    } catch {
      return undefined;
    }
  }

  /**
   * The `eval` function in TypeScript evaluates a given condition string by replacing function calls
   * and parameter expressions with their actual values and then executing the final condition.
   * @param {string} condition - The `eval` function you provided seems to be a JavaScript function
   * that evaluates a given condition string. It appears to handle function calls and parameter
   * expressions within the condition string.
   * @returns The `eval` function is returning the result of evaluating the condition provided as a
   * string. The condition undergoes several transformations before being executed:
   */
  eval(condition: string) {
    try {
      condition = condition.trim().slice(1, -1);

      // if any function calls appear call them
      condition = condition.replace(REGEX_FUNCTION_CALL, match => {
        const functionProperties = this.extractFunctionCallValues(
          '@' + match.trim(),
        );
        const fn = this.functions.lookup(functionProperties?.fnName);

        const result = fn(...(functionProperties?.fnArgs || []));
        return result;
      });

      // Final condition execution
      const fn = new Function(
        ...Object.keys(this.parameters || []),
        `return ${condition}`,
      );
      return fn(...Object.values(this.parameters || []));
    } catch (error) {
      if (error instanceof Error)
        throw Template_Error.toString(error.message, {
          cause: error.message,
          code: 'Template Error',
          lineNumber: this.currentToken.line,
          columnNumber: this.currentToken.column,
          filePath: this.currentToken.filePath,
        });
    }
  }

  /**
   * The function parameterExecuter processes HTML content by replacing placeholders with
   * corresponding parameter values.
   * @param {string} html - The `parameterExecuter` function takes in two parameters: `html` and
   * `isInRavenFormate`. The `html` parameter is a string containing HTML content, and the
   * `isInRavenFormate` parameter is a boolean flag indicating whether the HTML content is in Raven
   * format
   * @param {boolean} [isInRavenFormate=true] - The `isInRavenFormate` parameter is a boolean flag
   * that indicates whether the input HTML string is in Raven format or not. If set to `true`, the
   * function will process the HTML string using Raven format rules, which involve replacing
   * placeholders in the format `@(...)` with corresponding values
   * @returns The `parameterExecuter` function returns a modified version of the `html` string based
   * on whether it is in Raven format or not. If `isInRavenFormate` is true, it replaces occurrences
   * of `@(...)` with corresponding parameter values obtained from `this.parameters`. If
   * `isInRavenFormate` is false, it directly retrieves the parameter value for the entire `
   */
  parameterExecuter(
    html: string,
    isInRavenFormate: boolean = true,
    parameters: Record<string, any> | undefined = undefined,
  ) {
    const params = parameters || this.parameters;

    if (isInRavenFormate) {
      return html.replace(/@\(.*?\)/g, match => {
        if (!params) return '';

        const inner = match.slice(2, -1).trim();
        let firstValue: string, optionalValue: string;

        if (
          /^@\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\|\|\s*([a-zA-Z_$][a-zA-Z0-9_$]*|["'].*?["'])\s*\)$/.test(
            match,
          )
        ) {
          firstValue = inner.split('||')?.[0]?.trim();
          optionalValue = inner.split('||')?.[0]?.trim();

          return (
            this.getValue(params, firstValue) ||
            this.getValue(params, optionalValue)
          );
        }
        return this.getValue(params, inner);
      });
    } else {
      if (!this.parameters) return '';

      return this.getValue(this.parameters, html);
    }
  }

  /**
   * The function `forEach` iterates over an array, parses a code block using provided key-value
   * pairs, and returns the concatenated HTML output.
   * @param {any[]} arr - An array of elements that will be iterated over.
   * @param {string} key - The `key` parameter is a string that represents the key used to access the
   * current element in the array `arr`.
   * @param {string} codeBlock - The `codeBlock` parameter in the `forEach` function is a string that
   * represents a block of code or template that will be processed for each element in the input
   * array `arr`. This code block can contain placeholders or variables that will be replaced with
   * values from the current element being processed during each iteration
   * @returns The `forEach` function iterates over an array `arr`, processes each element using the
   * provided `codeBlock`, and returns the concatenated HTML output generated from each element.
   */
  forEach(arr: any[], key: string, codeBlock: string): string {
    if (!Array.isArray(arr))
      throw Syntax_Error.toString('accepting an array got ' + typeof arr, {
        code: 'Syntax Error',
        lineNumber: this.currentToken.line,
        columnNumber: this.currentToken.column,
        filePath: this.currentToken.filePath,
        expectedValue: 'An Array parameter',
        actualValue: typeof arr,
      });
    let html = '';

    const tokenizer: Lexer = new Lexer(codeBlock, '', true);
    const tokens: Token[] = tokenizer.start();
    const parser: Parser = new Parser(
      tokens,
      { ...this.parameters },
      this.__view,
      this.scope,
      undefined,
      undefined,
      this.functions,
    );
    const parsed: string = parser.htmlParser('');
    for (let i = 0; i < arr.length; i++) {
      html += parser.parameterExecuter(parsed, true, {
        ...this.parameters,
        [key]: arr[i],
        _i: i,
      });
    }

    return html;
  }

  /**
   * The function `updateParameters` updates the parameters, position, and current token, then
   * executes the parameter parser and returns the result.
   * @param params - Record<string, any>
   * @returns The `updateParameters` method returns the result of calling the `parameterExecuter`
   * method with the result of the `parse` method as its argument.
   */
  updateParameters(params: Record<string, any>): string {
    this.parameters = params;
    this.position = 0;
    this.currentToken = this.tokens[this.position];

    return this.parameterExecuter(this.parse());
  }

  /**
   * The function `extractFunctionCallValues` parses a string to extract the function name and its
   * arguments enclosed in parentheses.
   * @param {string} value - The `extractFunctionCallValues` function takes a string `value` as
   * input, which represents a function call in the format `@functionName(arg1, arg2, ...)`.
   * @returns The function `extractFunctionCallValues` returns an object with two properties:
   * `fnName` which is a string representing the function name extracted from the input value, and
   * `fnArgs` which is an array containing the arguments passed to the function extracted from the
   * input value.
   */
  extractFunctionCallValues(value: string) {
    const regex = REGEX_FN_CALL_EXTRACT;
    const match = value.match(regex);

    if (!match) return null;

    const fnName: string = match[1];
    const inside = match[2];

    const fnArgs: any[] = [];
    let current: string = '';
    let depth: number = 0;
    let inString: string | null = null;

    for (let i = 0; i < inside.length; i++) {
      const char = inside[i];
      const prevChar = inside[i - 1];

      // String handling with escapes
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (inString === char) {
          inString = null; // closing quote
        } else if (!inString) {
          inString = char; // opening quote
        }
        current += char;
      } else if (!inString && (char === '(' || char === '{' || char === '[')) {
        depth++;
        current += char;
      } else if (!inString && (char === ')' || char === '}' || char === ']')) {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0 && !inString) {
        const trimmed = current.trim();

        if (Number(trimmed)) fnArgs.push(trimmed);
        else if (REGEX_FN_PARAMS.test(trimmed))
          fnArgs.push(this.getValue(this.parameters, trimmed) || '');
        else if (REGEX_FN_CALLS_IN_FN_ARGS.test(trimmed)) {
          const functionProperties = this.extractFunctionCallValues(
            `@${trimmed}`,
          );
          const fn = this.functions.lookup(
            functionProperties === null || functionProperties === void 0
              ? void 0
              : functionProperties.fnName,
          );
          const fnReturnValue = fn(
            ...((functionProperties === null || functionProperties === void 0
              ? void 0
              : functionProperties.fnArgs) || []),
          );
          fnArgs.push(fnReturnValue);
        } else if (
          (trimmed.startsWith(`"`) || trimmed.startsWith(`'`)) &&
          (trimmed.endsWith(`"`) || trimmed.endsWith(`'`))
        )
          fnArgs.push(trimmed.slice(1, -1));
        else fnArgs.push(trimmed);

        current = '';
      } else {
        current += char;
      }
    }

    // Final arg
    if (current.trim() !== '') {
      const trimmed = current.trim();
      if (Number(trimmed)) fnArgs.push(trimmed);
      else if (REGEX_FN_PARAMS.test(trimmed))
        fnArgs.push(this.getValue(this.parameters, trimmed) || '');
      else if (REGEX_FN_CALLS_IN_FN_ARGS.test(trimmed)) {
        const functionProperties = this.extractFunctionCallValues(
          `@${trimmed}`,
        );
        const fn = this.functions.lookup(
          functionProperties === null || functionProperties === void 0
            ? void 0
            : functionProperties.fnName,
        );
        const fnReturnValue = fn(
          ...((functionProperties === null || functionProperties === void 0
            ? void 0
            : functionProperties.fnArgs) || []),
        );
        fnArgs.push(fnReturnValue);
      } else if (
        (trimmed.startsWith(`"`) || trimmed.startsWith(`'`)) &&
        (trimmed.endsWith(`"`) || trimmed.endsWith(`'`))
      )
        fnArgs.push(trimmed.slice(1, -1));
      else fnArgs.push(trimmed);
    }

    return { fnName, fnArgs };
  }

  /**
   * The function `skipStyle` in TypeScript skips over style tags and returns the concatenated style
   * content as a string.
   * @returns The `skipStyle()` method is returning a string value.
   */
  skipStyle(): string {
    let value: string = '';
    const line: number = this.currentToken.line,
      col: number = this.currentToken.column,
      filePath: string = this.currentToken.filePath;

    while (
      this.currentToken &&
      !REGEX_END_STYLE_TAG.test(this.currentToken.value)
    ) {
      value += this.currentToken.value;
      this.eat();
    }

    if (!this.currentToken)
      throw Template_Error.toString('Missing closing style tag', {
        cause: 'Missing closing style tag',
        code: 'Template Format',
        lineNumber: line,
        columnNumber: col,
        filePath,
      });
    value += this.currentToken.value;
    this.eat();

    return value;
  }

  /**
   * This function skips over script content in a TypeScript file until it reaches a closing script
   * tag.
   * @returns The `skipScript()` function returns a string value that represents the content between
   * an opening `<script>` tag and a closing `</script>` tag in a template. The function reads tokens
   * until it encounters the closing `</script>` tag, concatenates the token values into a string,
   * and then returns that string.
   */
  skipScript(): string {
    let value: string = '';
    const line: number = this.currentToken.line,
      col: number = this.currentToken.column,
      filePath: string = this.currentToken.filePath;

    while (
      this.currentToken &&
      !REGEX_END_SCRIPT_TAG.test(this.currentToken.value)
    ) {
      value += this.currentToken.value;
      this.eat();
    }

    if (!this.currentToken)
      throw Template_Error.toString('Missing closing style tag', {
        cause: 'Missing closing script tag',
        code: 'Template Format',
        lineNumber: line,
        columnNumber: col,
        filePath,
      });
    value += this.currentToken.value;
    this.eat();

    return value;
  }

  /**
   * The function `linkStatic` in TypeScript is used to dynamically link JavaScript and CSS files to
   * an HTML string based on specified arrays of file names.
   * @param {string} html - The `linkStatic` function you provided is used to dynamically link
   * JavaScript and CSS files to an HTML string. It searches for the `<head>` tag in the HTML content
   * and then inserts the script or link tags accordingly.
   * @returns The `linkStatic` function returns the HTML content with JavaScript and CSS files linked
   * based on the values in the `script` and `linker` arrays. The JavaScript files are linked using
   * `<script>` tags with `src` attribute pointing to the JavaScript file, and the CSS files are
   * linked using `<link>` tags with `rel="stylesheet"` and `href` attribute pointing to the CSS file
   */
  linkStatic(html: string) {
    // Link js files
    this.script.forEach((value: string) => {
      const headTagMatch = html.match(REGEX_HEAD_TAG);

      if (!headTagMatch) {
        throw Template_Error.toString('Head tag not found', {
          cause: 'Head tag is required to link scripts',
          code: 'Template Format',
          lineNumber: 1,
          columnNumber: 1,
          filePath: this.tokens[0]?.filePath,
        });
      }

      const titleTagIndex = html.indexOf('</title>');

      const resolvedValue = value.endsWith('.js') ? value : `${value}.js`;
      const jsScriptTag = `\n<script src="${resolvedValue}" defer/></script>`;

      if (titleTagIndex !== -1) {
        const insertPosition = titleTagIndex + '</title>'.length;
        html =
          html.slice(0, insertPosition) +
          jsScriptTag +
          html.slice(insertPosition);
      } else {
        const insertPosition = headTagMatch.index! + headTagMatch[0].length;
        html =
          html.slice(0, insertPosition) +
          jsScriptTag +
          html.slice(insertPosition);
      }
    });

    // Link css files
    this.linker.forEach((value: string) => {
      const headTagMatch = html.match(REGEX_HEAD_TAG);

      if (!headTagMatch) {
        throw Template_Error.toString('Head tag not found', {
          cause: 'Head tag is required to link CSS',
          code: 'Template Format',
          lineNumber: 1,
          columnNumber: 1,
          filePath: this.tokens[0]?.filePath,
        });
      }

      const titleTagIndex = html.indexOf('</title>');

      const resolvedValue = value.endsWith('.css') ? value : `${value}.css`;
      const cssLinkTag = `\n<link rel="stylesheet" href="${resolvedValue}" />`;

      if (titleTagIndex !== -1) {
        const insertPosition = titleTagIndex + '</title>'.length;
        html =
          html.slice(0, insertPosition) +
          cssLinkTag +
          html.slice(insertPosition);
      } else {
        const insertPosition = headTagMatch.index! + headTagMatch[0].length;
        html =
          html.slice(0, insertPosition) +
          cssLinkTag +
          html.slice(insertPosition);
      }
    });

    return html;
  }

  /**
   * The `parse` function in TypeScript reads and processes tokens to generate HTML content based on
   * specific keywords and syntax rules.
   * @returns The `parse()` method is returning a string `html` which is the result of parsing the
   * input tokens based on certain conditions and logic defined within the method.
   */
  parse(): string {
    let html: string = '';

    while (this.currentToken && this.position < this.tokens.length) {
      if (this.currentToken?.type == TOKEN_TYPES.KEYWORD) {
        // Check the keyword in the non return block

        if (this.currentToken?.value == KEYWORDS.USE) {
          this.eat();
          this.skipSpace();

          if (this.currentToken?.type == TOKEN_TYPES.TEXT) {
            const moduleName = this.currentToken.value;
            let methods;

            if (moduleName == 'string') methods = modules.string;
            else if (moduleName == 'number') methods = modules.number;
            else if (moduleName == 'date') methods = modules.date;
            else if (moduleName == 'math') methods = modules.math;
            else
              throw Template_Error.toString('Unknown module usage', {
                cause: `Unknown module ${moduleName}`,
                code: 'Template Error',
                lineNumber: this.currentToken.line,
                columnNumber: this.currentToken.column,
                filePath: this.currentToken.filePath,
              });

            methods.forEach(
              (method: {
                fnName: string;
                fnParams: string[];
                fnBody: string;
              }) => {
                const fn = new Function(...method.fnParams, method.fnBody);
                this.functions.define(method.fnName, fn);
              },
            );
          } else
            throw Syntax_Error.toString('Expected an identifier', {
              code: 'Syntax Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              filePath: this.currentToken.filePath,
              expectedValue: 'identifier',
              actualValue: this.currentToken.value,
            });
        } else if (this.currentToken?.value == KEYWORDS.AS) {
          this.eat();

          this.skipSpace();

          if (this.currentToken?.type == TOKEN_TYPES.TEXT) {
            const componentName: string = this.currentToken?.value;
            this.eat();
            this.skipSpace();

            if (
              this.currentToken?.type == TOKEN_TYPES.KEYWORD &&
              this.currentToken?.value == KEYWORDS.IMPORT
            ) {
              this.eat();
              this.skipSpace();

              if (
                this.currentToken?.type == TOKEN_TYPES.STRING &&
                REGEX_PATH_STRING.test(this.currentToken?.value)
              ) {
                const componentString = this.currentToken?.value
                  .replace(`"`, '')
                  .replace(`"`, '');
                const componentDir = componentString.startsWith(':')
                  ? findNodeModules() || ''
                  : this.__view;
                const componentPath = path.resolve(
                  componentDir,
                  componentString.replace(':', ''),
                );
                const content: string = fs.readFileSync(
                  componentPath.endsWith('.zare')
                    ? componentPath
                    : `${componentPath}.zare`,
                  'utf-8',
                );

                const tokenizer: Lexer = new Lexer(
                  content,
                  path.resolve(path.dirname(componentPath), componentPath),
                );
                const componentTokens: Token[] = tokenizer.start();

                const componentParser: Parser = new Parser(
                  componentTokens,
                  undefined,
                  path.dirname(componentPath),
                  undefined,
                  this.linker,
                  this.script,
                );

                this.scope.define(componentName, componentParser);
                this.eat();
              } else
                throw Syntax_Error.toString('Syntax Error', {
                  code: 'Syntax Error',
                  lineNumber: this.currentToken.line,
                  columnNumber: this.currentToken.column,
                  expectedValue: 'File Path',
                  actualValue: this.currentToken.value,
                  filePath: this.currentToken.filePath,
                });
            } else
              throw Syntax_Error.toString('Syntax Error', {
                code: 'Syntax Error',
                lineNumber: this.currentToken.line,
                columnNumber: this.currentToken.column,
                expectedValue: "'import'",
                actualValue: this.currentToken.value,
                filePath: this.currentToken.filePath,
              });
          } else
            throw Syntax_Error.toString('Syntax Error', {
              code: 'Syntax Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              expectedValue: 'Component Name',
              actualValue: this.currentToken.value,
              filePath: this.currentToken.filePath,
            });
        } else if (
          this.currentToken?.type == TOKEN_TYPES.KEYWORD &&
          this.currentToken?.value == KEYWORDS.LINK
        ) {
          this.eat();
          this.skipSpace();

          if (
            this.currentToken?.type == TOKEN_TYPES.STRING &&
            REGEX_CSS_PATH.test(this.currentToken?.value)
          ) {
            const cssPath: string = this.currentToken?.value
              .replace(`"`, '')
              .replace(`"`, '');

            this.linker.parent
              ? this.linker.parent.define(cssPath, cssPath)
              : this.linker.define(cssPath, cssPath);
            this.eat();
          } else
            throw Syntax_Error.toString('Syntax Error', {
              code: 'Syntax Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              expectedValue: 'file path',
              actualValue: this.currentToken.value,
              filePath: this.currentToken.filePath,
            });
        } else if (
          this.currentToken?.type == TOKEN_TYPES.KEYWORD &&
          this.currentToken?.value == KEYWORDS.IMPORT
        ) {
          this.eat();
          this.skipSpace();

          if (
            this.currentToken?.type == TOKEN_TYPES.STRING &&
            REGEX_JS_PATH.test(this.currentToken?.value)
          ) {
            const jsPath: string = this.currentToken?.value
              .replace(`"`, '')
              .replace(`"`, '');

            this.script.parent
              ? this.script.parent.define(jsPath, jsPath)
              : this.script.define(jsPath, jsPath);
            this.eat();
          } else
            throw Syntax_Error.toString('Syntax Error', {
              code: 'Syntax Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              expectedValue: 'file path',
              actualValue: this.currentToken.value,
              filePath: this.currentToken.filePath,
            });
        } else if (this.currentToken?.value == KEYWORDS.FN) {
          this.eat();
          this.skipSpace();

          if (this.currentToken && this.currentToken.type == TOKEN_TYPES.TEXT) {
            const fnName: string = this.currentToken.value;

            if (['if', 'else', 'each'].includes(fnName))
              throw Template_Error.toString(
                'Can not assign keywords as identifiers',
                {
                  cause: `Can not assign keywords as identifier, assigning "${fnName}" keyword to a function.`,
                  code: 'Template Error',
                  lineNumber: this.currentToken.line,
                  columnNumber: this.currentToken.column,
                  filePath: this.currentToken.filePath,
                },
              );

            let fnBody: string = '';
            const fnParams: string[] = [];
            this.eat();
            this.skipSpace();

            if (
              this.currentToken &&
              this.currentToken.type == TOKEN_TYPES.LPARENT
            ) {
              let parentCount = 1;
              const line = this.currentToken.line,
                col = this.currentToken.column,
                filePath = this.currentToken.filePath;
              this.eat();
              while (this.currentToken && parentCount > 0) {
                this.skipSpace();
                if (this.currentToken.type == TOKEN_TYPES.LPARENT)
                  parentCount++;
                else if (this.currentToken.type == TOKEN_TYPES.RPARENT)
                  parentCount--;
                if (this.currentToken.type == TOKEN_TYPES.TEXT)
                  fnParams.push(
                    this.currentToken.value.replace(',', '').trim(),
                  );
                this.eat();
              }

              if (!this.currentToken)
                throw Syntax_Error.toString('Expected a closing parenthesis', {
                  code: 'Syntax Error',
                  lineNumber: line,
                  columnNumber: col,
                  filePath,
                  expectedValue: ')',
                  actualValue: 'EOF',
                });

              this.skipSpace();

              if (this.currentToken.value == '{') {
                this.eat();
                let braceCount = 1;
                const line = this.currentToken.line,
                  col = this.currentToken.column,
                  filePath = this.currentToken.filePath;

                while (this.currentToken && braceCount > 0) {
                  if (this.currentToken.value == '{') braceCount++;
                  else if (this.currentToken.value == '}') {
                    braceCount--;
                    if (!braceCount) break;
                  }

                  fnBody += this.currentToken.value;
                  this.eat();
                }

                if (!this.currentToken)
                  throw Template_Error.toString("Unended '}'", {
                    cause: "expected an '}'",
                    code: 'Template Error',
                    lineNumber: line,
                    columnNumber: col,
                    filePath,
                  });

                const newFunction = new Function(...fnParams, fnBody);
                this.functions.define(fnName, newFunction);
                this.eat();
              } else
                throw Syntax_Error.toString("Expected '{'", {
                  code: 'Syntax Error',
                  lineNumber: this.currentToken.line,
                  columnNumber: this.currentToken.column,
                  filePath: this.currentToken.filePath,
                  expectedValue: '{',
                  actualValue: this.currentToken?.value,
                });
            } else
              throw Syntax_Error.toString("Expected '('", {
                code: 'Syntax Error',
                lineNumber: this.currentToken.line,
                columnNumber: this.currentToken.column,
                filePath: this.currentToken.filePath,
                expectedValue: '(',
                actualValue: this.currentToken?.value,
              });
          } else
            throw Syntax_Error.toString('Expected an function name', {
              code: 'Syntax Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              filePath: this.currentToken.filePath,
              expectedValue: 'Function name',
              actualValue: this.currentToken?.value,
            });
        } else if (this.currentToken?.value == KEYWORDS.SERVE) {
          this.eat();

          this.skipSpace();

          if (this.currentToken?.type == TOKEN_TYPES.LPARENT) {
            this.stack.push(this.currentToken);
            this.eat();
            this.skipSpace();

            html = this.htmlParser(html);

            const poped: Token | undefined = this.stack.pop();

            if (poped?.type != TOKEN_TYPES.LPARENT)
              throw Template_Error.toString('Unclosed tag', {
                cause: `Unclosed token '${poped?.value}'`,
                code: 'Template Format',
                lineNumber: poped?.line || -1,
                columnNumber: poped?.column || -1,
                filePath: poped?.filePath || '',
              });
          } else
            throw Syntax_Error.toString('Syntax Error', {
              code: 'Syntax Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              expectedValue: '(',
              actualValue: this.currentToken.value,
              filePath: this.currentToken.filePath,
            });
        } else
          throw Syntax_Error.toString('Syntax Error', {
            code: 'Syntax Error',
            lineNumber: this.currentToken.line,
            columnNumber: this.currentToken.column,
            expectedValue: "Keyword 'as', 'serve', 'fn' or 'link'",
            actualValue: this.currentToken.value,
            filePath: this.currentToken.filePath,
          });
      } else if (this.currentToken.type == TOKEN_TYPES.ESCAPE) {
        this.eat();
        continue;
      } else
        throw Syntax_Error.toString('Expected a keyword', {
          code: 'Syntax Error',
          lineNumber: this.currentToken.line,
          columnNumber: this.currentToken.column,
          filePath: this.currentToken.filePath,
          expectedValue: 'Keyword',
          actualValue: this.currentToken.value,
        });

      this.eat();
    }

    html = this.linkStatic(html);

    return html;
  }

  /**
   * The function `htmlParser` parses HTML content with support for escape sequences, tags,
   * components, conditional statements, and iteration.
   * @param {string} html - The `htmlParser` function is a parser for
   * processing HTML content with additional features like components, conditionals, and loops.
   * It's parsing different types of tokens and generating HTML output based on the
   * token types and values.
   * @returns The `htmlParser` function is returning the processed HTML string after parsing and
   * handling different types of tokens such as escape sequences, text, opening and closing tags,
   * components, parameter expressions, keywords like IF and EACH, and their respective code blocks.
   * The function iterates through the tokens, processes them accordingly, and updates the `html`
   * string before moving to the next token.
   */
  htmlParser(html: string): string {
    while (this.currentToken && this.currentToken.type != TOKEN_TYPES.RPARENT) {
      if (this.currentToken?.type == TOKEN_TYPES.ESCAPE) {
        html += this.currentToken?.value;
        this.eat();
        continue;
      } else if (this.currentToken?.type == TOKEN_TYPES.TEXT) {
        html += this.currentToken?.value;
        this.eat();
        continue;
      } else if (this.currentToken.type == TOKEN_TYPES.FUNCTIONCALL) {
        const functionProperties = this.extractFunctionCallValues(
          this.currentToken.value,
        );
        const fn = this.functions.lookup(
          functionProperties === null || functionProperties === void 0
            ? void 0
            : functionProperties.fnName,
        );
        html += fn(
          ...((functionProperties === null || functionProperties === void 0
            ? void 0
            : functionProperties.fnArgs) || []),
        );
        this.eat();
        continue;
      } else if (this.currentToken?.type == TOKEN_TYPES.DOCTYPE) {
        html += this.currentToken?.value;
        this.eat();
        continue;
      } else if (this.currentToken?.type == TOKEN_TYPES.OPENINGTAG) {
        if (REGEX_STYLE_TAG.test(this.currentToken.value)) {
          html += this.skipStyle();
          continue;
        }

        if (REGEX_SCRIPT_TAG.test(this.currentToken.value)) {
          html += this.skipScript();
          continue;
        }

        this.stack.push(this.currentToken);

        const componentMatch = this.currentToken?.value
          ?.trim()
          .match(REGEX_OPENING_TAG);
        const componentName = componentMatch?.[1];
        const rawAttributes = componentMatch?.[2];

        if (!componentName) throw new TypeError('Component name is undefined');

        const componentParser = this.scope.lookup(componentName.trim());

        if (!componentParser) {
          html += this.currentToken.value;
          this.eat();
          continue;
        }

        // Extract attributes
        const componentParameters: Record<string, any> = {};
        const attrRegex = REGEX_COMPONENT_ATTR;
        let matchParameter: RegExpExecArray | null;

        while (
          (matchParameter = attrRegex.exec(rawAttributes || '')) !== null
        ) {
          componentParameters[matchParameter[1]] = matchParameter[2];
        }

        const line = this.currentToken.line,
          col = this.currentToken.column,
          filePath = this.currentToken.filePath;

        this.eat(); // Move past the opening tag

        const slotTokens: Token[] = [];
        while (
          this.currentToken &&
          this.currentToken.value.match(REGEX_CLOSING_TAG)?.[1].trim() !==
            componentName
        ) {
          slotTokens.push(this.currentToken);
          this.eat();
        }

        if (!this.currentToken) {
          throw Template_Error.toString('Unended component', {
            cause: `Unended component <${componentName}>`,
            code: 'Template Format',
            lineNumber: line,
            columnNumber: col,
            filePath: filePath,
          });
        }

        this.stack.pop();
        this.eat(); // Eat the closing tag

        const slotParser = new Parser(
          slotTokens,
          this.parameters,
          this.__view,
          this.scope,
          undefined,
          undefined,
          this.functions,
        );
        const slotWithParameters = slotParser.htmlParser('');

        componentParameters.slot = slotWithParameters;

        const componentHtml = componentParser?.updateParameters({
          ...componentParameters,
          ...this.parameters,
        });

        html += componentHtml || '';

        this.eat();
        continue;
      } else if (this.currentToken?.type == TOKEN_TYPES.CLOSINGTAG) {
        const openingTag = this.stack
          .pop()
          ?.value?.match(REGEX_OPENING_TAG)?.[1];
        const closingTag =
          this.currentToken?.value.match(REGEX_CLOSING_TAG)?.[1];

        if (!openingTag)
          throw Template_Error.toString('Template Format', {
            cause: `Unwanted tag </${closingTag}>`,
            code: 'Format Error',
            lineNumber: this.currentToken.line,
            columnNumber: this.currentToken.column,
            filePath: this.currentToken.filePath,
          });
        if (openingTag !== closingTag)
          throw Template_Error.toString(
            `expecting the closing tag for ${openingTag} but got ${closingTag}`,
            {
              cause: `expecting the closing tag for ${openingTag} but got ${closingTag}`,
              code: 'Template Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              filePath: this.currentToken.filePath,
            },
          );

        html += this.currentToken.value;

        this.eat();
        continue;
      } else if (this.currentToken?.type == TOKEN_TYPES.SELFCLOSINGTAG) {
        const componentSplitValue: string | undefined =
          this.currentToken?.value?.trim();

        const componentName: string | undefined = componentSplitValue?.match(
          REGEX_SELF_CLOSING_TAG,
        )?.[1];

        const componentParser = this.scope.lookup(componentName);

        if (!componentParser) {
          html += this.currentToken.value;
          this.eat();
          continue;
        }

        const componentParameters: Record<string, any> = {};
        const attrRegex = REGEX_COMPONENT_ATTR;
        let matchParameter: RegExpExecArray | null;

        while (
          (matchParameter = attrRegex.exec(componentSplitValue || '')) !== null
        ) {
          componentParameters[matchParameter[1]] = matchParameter[2];
        }

        const componentHtml =
          componentParser.updateParameters(componentParameters);
        html += componentHtml || '';

        this.eat();
        continue;
      } else if (this.currentToken?.type == TOKEN_TYPES.PARAMETEREXPRESSION) {
        html += this.currentToken?.value;
        this.eat();
        continue;
      } else if (
        this.currentToken?.type == TOKEN_TYPES.KEYWORD &&
        this.currentToken?.value == KEYWORDS.IF
      ) {
        this.eat();
        this.skipSpace();

        if (this.currentToken?.type == TOKEN_TYPES.CONDITION) {
          const condition: boolean = this.eval(this.currentToken?.value)
            ? true
            : false;
          this.eat();
          this.skipSpace();

          if (this.currentToken?.type == TOKEN_TYPES.CODEBLOCK) {
            const ifCodeBlock = this.currentToken.value;

            this.eat();
            this.skipSpace();

            if (
              this.currentToken?.type == TOKEN_TYPES.KEYWORD &&
              this.currentToken.value == KEYWORDS.ELSE
            ) {
              this.eat();

              if (condition) html = this.blockExecuter(ifCodeBlock, html);
              else html = this.blockExecuter(this.currentToken?.value, html);
              this.eat();
              continue;
            } else {
              if (condition) html = this.blockExecuter(ifCodeBlock, html);
            }
          } else
            Syntax_Error.toString('Syntax Error', {
              code: 'Syntax Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              expectedValue: "'{ }'",
              actualValue: this.currentToken.value,
              filePath: this.currentToken.filePath,
            });
        } else
          Syntax_Error.toString('Syntax Error', {
            code: 'Syntax Error',
            lineNumber: this.currentToken.line,
            columnNumber: this.currentToken.column,
            expectedValue: 'if condition',
            actualValue: this.currentToken.value,
            filePath: this.currentToken.filePath,
          });
      } else if (
        this.currentToken.type == TOKEN_TYPES.KEYWORD &&
        this.currentToken.value == KEYWORDS.EACH
      ) {
        this.eat();

        if (this.currentToken?.type == TOKEN_TYPES.EACHEXPRESSION) {
          const [arr, val]: string[] = this.currentToken.value
            .replace(REGEX_EACH_EXPRESSION, '$1')
            .split(':');
          this.eat();

          if (this.currentToken?.type == TOKEN_TYPES.CODEBLOCK) {
            const block = this.currentToken.value;
            const arrayParameter = this.parameterExecuter(arr, false);

            html += this.forEach(arrayParameter, val.trim(), block);

            this.eat();
            continue;
          } else
            Syntax_Error.toString('Syntax Error', {
              code: 'Syntax Error',
              lineNumber: this.currentToken.line,
              columnNumber: this.currentToken.column,
              expectedValue: "'{ }'",
              actualValue: this.currentToken.value,
              filePath: this.currentToken.filePath,
            });
        } else
          Syntax_Error.toString('Syntax Error', {
            code: 'Syntax Error',
            lineNumber: this.currentToken.line,
            columnNumber: this.currentToken.column,
            expectedValue: 'each looping expression',
            actualValue: this.currentToken.value,
            filePath: this.currentToken.filePath,
          });
      } else if (this.currentToken.type == 'UNKNOWN') {
        html += this.currentToken.value;
        this.eat();
        continue;
      }
    }

    return html;
  }

  /**
   * The function `blockExecuter` takes a block of code and HTML content, tokenizes the code block,
   * parses the tokens along with parameters and scope, and returns the parsed HTML.
   * @param {string} block - The `block` parameter is a string that contains the block of code to be
   * executed.
   * @param {string} html - The `html` parameter in the `blockExecuter` function is a string that
   * represents the HTML content that you want to parse and modify based on the provided `block`
   * parameter.
   * @returns The `htmlParser` method of the `Parser` class is being called with the `html` string as
   * an argument, and the result of that method call is being returned.
   */
  blockExecuter(block: string, html: string) {
    const tokenizer: Lexer = new Lexer(block, '', true);
    const tokens: Token[] = tokenizer.start();

    const parser: Parser = new Parser(
      tokens,
      this.parameters,
      this.__view,
      this.scope,
    );
    return parser.htmlParser(html);
  }
}
