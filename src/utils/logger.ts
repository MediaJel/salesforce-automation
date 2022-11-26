import { LogLevel } from "@/utils/types";

import chalk from "chalk";
import config from "@/config";

const createLogger = (name: string) => {
  const template = (level: LogLevel, message: string, ...args: any[]) => {
    const date = new Date().toISOString();
    return `${date} | ${level} | [${name}]: ${message} | ${args.join(" | ")}`;
  };

  return {
    debug: (message: string) => {
      if (config.logLevel === "DEBUG") {
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
