import express from "express";
import createLogger from "@/utils/logger";
import { ExpressServerConfig } from "@/utils/types";

const app = express();
const logger = createLogger("Server");

const createServer = (config: ExpressServerConfig) => {
  app.get("/", (req, res) => {
    if (req.query.key === config.serverKey) {
      logger.info("Closing Application...");
      res.json({ message: "Closing Application..." }).status(200);
      process.exit(0);
    }
    res.json({ message: "Invalid Key" }).status(401);
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
