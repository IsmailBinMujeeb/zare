import chalk from 'chalk';

interface LogLevelConfig {
  title: string;
  color: (...args: any[]) => string;
  level: number;
}

const logLevels: Record<string, LogLevelConfig> = {
  debug: { title: 'Debug', color: chalk.gray.bold, level: 0 },
  info: { title: 'Info', color: chalk.cyan.bold, level: 1 },
  warn: { title: 'Warn', color: chalk.yellow.bold, level: 2 },
  done: { title: 'Done', color: chalk.green.bold, level: 3 },
  error: { title: 'Error', color: chalk.red.bold, level: 4 },
  prompt: { title: 'Prompt', color: chalk.magenta.bold, level: 5 },
  action: { title: 'Action', color: chalk.blue.bold, level: 6 },
};

export class Logger {
  private level: number;

  constructor(level: number) {
    this.level = level;
  }

  private _log(
    level: keyof typeof logLevels,
    strings: TemplateStringsArray,
    values: any[],
  ) {
    const config = logLevels[level];

    if (config.level < this.level) return;

    const message = strings.reduce((acc, cur, i) => {
      return acc + cur + (values[i] ?? '');
    }, '');

    const prefix = `${chalk.whiteBright('Zare::')}${config.color(config.title)} `;
    console.log(prefix + message);
  }

  debug(strings: TemplateStringsArray, ...values: any[]) {
    this._log('debug', strings, values);
  }

  info(strings: TemplateStringsArray, ...values: any[]) {
    this._log('info', strings, values);
  }

  warn(strings: TemplateStringsArray, ...values: any[]) {
    this._log('warn', strings, values);
  }

  done(strings: TemplateStringsArray, ...values: any[]) {
    this._log('done', strings, values);
  }

  error(strings: TemplateStringsArray, ...values: any[]) {
    this._log('error', strings, values);
  }

  prompt(strings: TemplateStringsArray, ...values: any[]) {
    this._log('prompt', strings, values);
  }

  action(strings: TemplateStringsArray, ...values: any[]) {
    this._log('action', strings, values);
  }
}

export const logger = new Logger(1);
