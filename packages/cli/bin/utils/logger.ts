import chalk from "chalk";

export class logger {

    static info(msg: string) {
        console.log(`${chalk.whiteBright("Zare ::")} ${chalk.cyan.bold("Info")} ${chalk.gray(msg)}`);
    }

    static warn(msg: string) {
        console.log(`${chalk.whiteBright("Zare ::")} ${chalk.yellow.bold("Warn")} ${chalk.gray(msg)}`);
    }

    static debug(msg: string) {
        console.log(`${chalk.whiteBright("Zare ::")} ${chalk.gray.bold("Debug")} ${chalk.gray(msg)}`);
    }

    static done(msg: string) {
        console.log(`${chalk.whiteBright("Zare ::")} ${chalk.green.bold("Done")} ${chalk.gray(msg)}`);
    }

    static error(msg: string) {
        console.log(`${chalk.whiteBright("Zare ::")} ${chalk.red.bold("Error")} ${chalk.gray(msg)}`);
    }

    static prompt(msg: string) {
        console.log(`${chalk.whiteBright("Zare ::")} ${chalk.magenta.bold("Prompt")} ${chalk.gray(msg)}`);
    }

    static action(msg: string) {
        console.log(`${chalk.whiteBright("Zare ::")} ${chalk.blue.bold("Action")} ${chalk.gray(msg)}`);
    }
}