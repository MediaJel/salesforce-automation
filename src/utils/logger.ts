import chalk from "chalk";

const createLogger = (name: string) => {
  const isProduction = process.env.NODE_ENV === "production";
  const template = (level: string, message: string) => {
    const date = new Date().toISOString();
    return `${date} | ${level} | [${name}]: ${message}`;
  };

  return {
    debug: (message: string) => {
      if (!isProduction) {
        console.log(chalk.white(template("DEBUG", message)));
      }
    },
    warn: (message: string) => {
      console.log(chalk.yellow(template("WARN", message)));
    },
    info: (message: string) => {
      console.log(chalk.blue(template("INFO", message)));
    },
    error: (message: string, ...args: any[]) => {
      console.log(chalk.red(message));
    },
    success: (message: string) => {
      console.log(chalk.green(template("SUCCESS", message)));
    },
  };
};

export default createLogger;
