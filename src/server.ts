import express from "express";
import createLogger from "@/utils/logger";
import { ExpressServerConfig } from "@/utils/types";

const app = express();
const logger = createLogger("Server");

const createServer = (config: ExpressServerConfig) => {
  app.get("/", (req, res) => {
    logger.warn("Closing Application");
    process.exit(0);
  });

  return {
    start() {
      app.listen(config.port, () => {
        logger.info(`Server started on port ${config.port}`);
      });
    },
  };
};

export default createServer;
