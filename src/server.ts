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
    logger.warn("Sending signal to disable App State...");
    appState.disable();
    return res
      .json({ message: "Sending signal to disable App State..." })
      .status(200);
  });

  app.get("/enable", auth, (req, res) => {
    logger.warn("Sending signal to enable App State...");
    appState.enable();
    return res
      .json({ message: "Sending signal to enable App State..." })
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
