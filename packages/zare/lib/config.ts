/* v8 ignore start */
import { dirname, resolve } from 'path';
import type { OrPromise } from './types/token.js';
import { findUp, isZareConfig, mapOrApply } from './utils/shared.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const protocolRegex = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//;

function getProtocol(str: string): string | undefined {
  const match = str.match(protocolRegex);
  return match?.[1] ?? undefined;
}

export class ZareConfig {
  static pathFields: string[] = ['staticDir'];
  static defaultValues = {
    staticDir: ['static'],
    generateStaticParams() {},
  };

  options: {
    generateStaticParams: (
      path?: string,
    ) => void | OrPromise<Record<string, any>>;
    staticDir: string[];
  };
  configDir: string = '';

  constructor(dir?: string, options: Record<PropertyKey, any> = {}) {
    this.options = {
      ...(this.constructor as typeof ZareConfig).defaultValues,
      ...options,
    };
    this.options.staticDir = Array.isArray(this.options.staticDir)
      ? this.options.staticDir
      : [this.options.staticDir];
    if (dir) {
      this.configDir = dir;
    }
    this.normalizePathFields();
  }

  normalizePathFields() {
    (this.constructor as typeof ZareConfig).pathFields.forEach(pathField => {
      // @ts-ignore
      if (this.options[pathField]) {
        // @ts-ignore
        this.options[pathField] = mapOrApply(this.options[pathField], item =>
          resolve(this.configDir, item),
        );
      }
    });
  }

  resolve(path: string, request: string) {
    const proto = getProtocol(request);
    if (proto) {
      if (proto === 'file') {
        request = fileURLToPath(request);
      } else {
        return request;
      }
    }
    const require = createRequire(path);
    return require.resolve(request);
  }

  resolveStatic(path: string, request: string) {
    if (request.startsWith('/')) {
      return request;
    }
    const initialRequest = request;
    const proto = getProtocol(request);
    if (proto) {
      if (proto === 'file') {
        request = fileURLToPath(request);
      } else {
        return request;
      }
    }
    const require = createRequire(path);
    request = require.resolve(request);
    const { staticDir } = this.options;
    if (!staticDir.length) {
      throw new Error('can not resolve static files without staticDir options');
    }

    for (const s of staticDir) {
      if (request.startsWith(s)) {
        return request.slice(s.length).replace(/\\/g, '/');
      }
    }
    throw new Error(`can not resolve static file: ${initialRequest}`);
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
/* v8 ignore end */
