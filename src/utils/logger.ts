import chalk from "chalk";

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const createLogger = (name: string) => {
  const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "INFO";

  const template = (level: LogLevel, message: string, ...args: any[]) => {
    const date = new Date().toISOString();
    return `${date} | ${level} | [${name}]: ${message} | ${args.join(" | ")}`;
  };

  return {
    debug: (message: string) => {
      if (logLevel === "DEBUG") {
        console.log(chalk.green(template("DEBUG", message)));
      }
    },
    warn: (message: string) => {
      console.log(chalk.yellow(template("WARN", message)));
    },
    info: (message: string) => {
      console.log(chalk.blue(template("INFO", message)));
    },
    error: (message: string, ...args: any[]) => {
      console.log(chalk.red(template("ERROR", message, ...args)));
    },
  };
};

export default createLogger;
