import chalk from "chalk";

const createLogger = (name: string) => {
  const template = (message: string) => {
    const date = new Date().toISOString();
    return `${date} | [${name}]: ${message}`;
  };

  return {
    info: (message: string) => {
      console.log(chalk.blue(template(message)));
    },
    error: (message: string, ...args: any[]) => {
      console.log(chalk.red(message));
    },
    success: (message: string) => {
      console.log(chalk.green(template(message)));
    },
  };
};

export default createLogger;
