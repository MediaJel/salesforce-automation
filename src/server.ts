import express from "express";
import createLogger from "@/utils/logger";
import { ExpressServerConfig } from "@/utils/types";
import appState from "@/state";

const app = express();
const logger = createLogger("Server");

const createServer = (config: ExpressServerConfig) => {
  const auth = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.query.key === config.serverKey) {
      return next();
    }
    return res.json({ message: "Invalid Key" }).status(401);
  };

  app.get("/disable", auth, (req, res) => {
    logger.warn("Unsubscribing from Data Producers...");
    appState.disable();
    return res
      .json({ message: "Unsubscribing from Data Producers..." })
      .status(200);
  });

  app.get("/enable", auth, (req, res) => {
    logger.warn("Subscribing to Data Producers...");
    appState.enable();
    return res
      .json({ message: "Subscribing to Data Producers..." })
      .status(200);
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
