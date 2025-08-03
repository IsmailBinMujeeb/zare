import inquirer from 'inquirer';

export interface InitPrompts {
  projectName: string;
}

export async function askInitPrompts(
  options: Record<string, any> = {},
): Promise<InitPrompts> {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '📁 Project name:',
      default: 'myapp',
    },
  ]);
}
