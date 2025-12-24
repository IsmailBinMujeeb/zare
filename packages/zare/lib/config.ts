/* v8 ignore start */
import { dirname, resolve } from 'path';
import type { OrPromise } from './types/token.js';
import { findUp, isZareConfig, toSlash } from './utils/shared.js';
import { pathToFileURL } from 'url';
import { ResolverFactory, type NapiResolveOptions } from 'oxc-resolver';

export class ZareConfig {
  static pathFields: string[] = ['staticDir', 'pagesDir'];
  static defaultValues: ZareConfig['options'] = {
    staticDir: ['static'],
    pagesDir: 'pages',
    alias: {
      '@/*': ['./*'],
    },
    generateStaticParams() {},
    resolverConfig: {
      extensions: ['.css', '.js', '.zare'],
      builtinModules: true,
    },
  };

  options: {
    generateStaticParams: (
      path?: string,
    ) => void | OrPromise<Record<string, any>>;
    staticDir: string[];
    pagesDir: string;
    alias: NapiResolveOptions['alias'];
    resolverConfig: NapiResolveOptions;
  };
  configDir: string = '';
  private resolver: ResolverFactory;

  constructor(
    dir: string = '',
    options: Partial<Record<keyof ZareConfig['options'], any>> = {},
  ) {
    this.configDir = dir;
    this.options = {
      ...(this.constructor as typeof ZareConfig).defaultValues,
      ...options,
    };
    this.normalizePathFields();
    this.normalizeAlias();
    this.resolver = new ResolverFactory({
      alias: this.options.alias as NapiResolveOptions['alias'],
      ...this.options.resolverConfig,
    });
  }

  private normalizePathFields() {
    const options: Record<string, any> = this.options;
    const cons = this.constructor as typeof ZareConfig;
    cons.pathFields.forEach(pathField => {
      if (!options[pathField]) {
        return;
      }
      // @ts-ignore
      const isDefaultArray = Array.isArray(cons.defaultValues[pathField]);
      const value = options[pathField];
      const into = (s: string) => resolve(this.configDir, s);
      options[pathField] = isDefaultArray
        ? Array.isArray(value)
          ? value.map(into)
          : [into(value)]
        : into(value);
    });
  }

  private normalizeAlias() {
    let { alias } = this.options;
    if (!alias) {
      return;
    }
    if (typeof alias === 'string') {
      alias = {
        '@/*': [alias],
      };
    }
    this.options.alias = Object.fromEntries(
      Object.entries(alias).map(([k, v]) => [
        k,
        v.map(s => (s ? resolve(this.configDir, s) : undefined)),
      ]),
    );
  }

  resolve(path: string, request: string): string {
    const resolved = this.resolver.sync(dirname(path), request);
    if (resolved.error) {
      throw new Error(resolved.error);
    }
    return resolved.path!;
  }

  resolveStatic(path: string, request: string) {
    const resolved = this.resolve(path, request);
    const { staticDir } = this.options;
    if (!staticDir.length) {
      throw new Error('can not resolve static files without staticDir options');
    }

    for (const s of staticDir) {
      if (resolved.startsWith(s)) {
        return toSlash(resolved.slice(s.length));
      }
    }
    throw new Error(`can not resolve static file: ${request}`);
  }

  static async find<T extends ZareConfig>(
    this: new (...args: any[]) => T,
    root: string,
    filter = isZareConfig,
  ): Promise<T> {
    const path = await findUp(root, filter);
    if (path) {
      const fileUrl = pathToFileURL(path).toString();
      const values = (await import(fileUrl))?.default ?? undefined;
      return new this(dirname(path), values);
    }
    return new this();
  }
}
/* v8 ignore stop */
