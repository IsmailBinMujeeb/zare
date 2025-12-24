import { ZareConfig } from 'zare/config.js';

export class ZareCliConfig extends ZareConfig {
  static pathFields: string[] = [...ZareConfig.pathFields, 'outDir'];
  static defaultValues = {
    ...ZareConfig.defaultValues,
    outDir: 'dist',
  };
  options!: ZareConfig['options'] & {
    port: number;
    outDir: string;
  };
}
