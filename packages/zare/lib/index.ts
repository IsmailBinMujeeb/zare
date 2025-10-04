/* v8 ignore start */
import renderer from './core/renderer.js';
import { relative } from 'path';
import { ZareConfig } from './config.js';
import { normalizeRoute } from './utils/shared.js';
import { readFile } from 'fs/promises';

const staticParams = new Map();

export async function __express(
  filePath: string,
  options: Record<string, any>,
  cb: (err: Error | null, html?: string) => void,
) {
  const settingsConfig = options.settings['zare config'];
  const config =
    settingsConfig && typeof settingsConfig === 'object'
      ? settingsConfig
      : await ZareConfig.find(settingsConfig || process.cwd());

  const pageRoute = normalizeRoute(relative(options.settings.views, filePath));
  let params = staticParams.get(pageRoute);
  if (!params) {
    params = (await config.options.generateStaticParams(pageRoute)) ?? {};
  }
  try {
    const content = await readFile(filePath, 'utf-8');
    const rendered = renderer(
      content,
      {
        ...options,
        params: {
          ...params,
          ...options.params,
        },
      },
      filePath,
      config,
    );
    cb(null, rendered);
  } catch (error) {
    cb(error as Error);
  }
}
/* v8 ignore end */
