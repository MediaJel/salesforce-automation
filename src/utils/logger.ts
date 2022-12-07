// import { LogLevel } from "@/utils/types";

import chalk from "chalk";
import config from "@/config";

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const levels: { [key in LogLevel]: LogLevel[] } = {
  DEBUG: ["DEBUG", "INFO", "WARN", "ERROR"],
  INFO: ["INFO", "WARN", "ERROR"],
  WARN: ["WARN", "ERROR"],
  ERROR: ["ERROR"],
};

const template = <T>(level: LogLevel, name: string, message: T) => {
  const date = new Date().toISOString();

  if (typeof message !== "object") {
    return `${date} | ${level} | [${name}]: ${message}`;
  }

  const json = JSON.stringify(message, null, 2);

  return `${date} | ${level} | [${name}]: ${json}`;
};

const createLogger = (name: string) => {
  return {
    debug: <T>(message: T) => {
      if (levels[config.logLevel].includes("DEBUG")) {
        console.log(chalk.green(template("DEBUG", name, message)));
      }
    },
    warn: <T>(message: T) => {
      if (levels[config.logLevel].includes("WARN")) {
        console.log(chalk.yellow(template("WARN", name, message)));
      }
    },
    info: <T>(message: T) => {
      if (levels[config.logLevel].includes("INFO")) {
        console.log(chalk.blue(template("INFO", name, message)));
      }
    },
    error: <T extends { message: string }>(message: T) => {
      if (levels[config.logLevel].includes("ERROR")) {
        console.log(chalk.red(template("ERROR", name, message)));
      }
    },
  };
};

export default createLogger;
