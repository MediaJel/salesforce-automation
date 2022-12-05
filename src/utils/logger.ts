import { LogLevel } from "@/utils/types";

import chalk from "chalk";
import config from "@/config";

const createLogger = (name: string) => {
  const template = <T>(level: LogLevel, message: T, ...args: any[]) => {
    const date = new Date().toISOString();
    return `${date} | ${level} | [${name}]: ${message} | ${args.join(" | ")}`;
  };

  return {
    debug: <T>(message: T) => {
      if (config.logLevel === "DEBUG") {
        console.log(chalk.green(template("DEBUG", message)));
      }
    },
    warn: <T>(message: T) => {
      console.log(chalk.yellow(template("WARN", message)));
    },
    info: <T>(message: T) => {
      console.log(chalk.blue(template("INFO", message)));
    },
    error: <T>(message: T, ...args: any[]) => {
      console.log(chalk.red(template("ERROR", message, ...args)));
    },
  };
};

export default createLogger;
