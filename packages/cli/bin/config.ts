import { ZareConfig } from 'zare/config.js';
import type { isZareConfig } from 'zare/utils/shared.js';

export class ZareCliConfig extends ZareConfig {
  static pathFields: string[] = [
    ...ZareConfig.pathFields,
    'pagesDir',
    'outDir',
  ];
  static defaultValues = {
    ...ZareConfig.defaultValues,
    pagesDir: 'pages',
    outDir: 'dist',
  };
  options!: ZareConfig['options'] & {
    port: number;
    pagesDir: string;
    outDir: string;
  };
}
