// import { LogLevel } from "@/utils/types";

import chalk from "chalk";
import winston from "winston";

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

// Create Winston logger instance for production
const createWinstonLogger = (name: string) => {
  return winston.createLogger({
    level: config.logLevel.toLowerCase(),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} | ${level.toUpperCase()} | [${name}]: ${
          typeof message === "object" ? JSON.stringify(message) : message
        }`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });
};

// Create development console logger
const createConsoleLogger = (name: string) => {
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

const createLogger = (name: string) => {
  if (process.env.NODE_ENV === "production") {
    const winstonLogger = createWinstonLogger(name);
    return {
      debug: <T>(message: T) => winstonLogger.debug(message),
      info: <T>(message: T) => winstonLogger.info(message),
      warn: <T>(message: T) => winstonLogger.warn(message),
      error: <T extends { message: string }>(message: T) => winstonLogger.error(message),
    };
  }

  return createConsoleLogger(name);
};

export default createLogger;
