import express from "express";
import createLogger from "@/utils/logger";
import { ExpressServerConfig } from "@/utils/types";
import { processorState } from "@/processor";

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
    const msg = "Sending signal to disable Processor State...";
    logger.warn(msg);
    processorState.disable();
    return res.json({ message: msg }).status(200);
  });

  app.get("/enable", auth, (req, res) => {
    const msg = "Sending signal to enable App State...";
    logger.info(msg);
    processorState.enable();
    return res.json({ message: msg }).status(200);
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
