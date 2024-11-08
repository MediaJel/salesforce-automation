import express from 'express';
import jsforce from 'jsforce';

import config from '@/config';
import { processorState } from '@/processor';
import createLogger from '@/utils/logger';
import { ExpressServerConfig } from '@/utils/types';

const app = express();
const logger = createLogger("Server");

logger.info({
  loginUrl: config.salesforce.loginUrl,
  clientId: config.salesforce.clientId,
  clientSecret: config.salesforce.clientSecret,
  redirectUri: config.salesforce.redirectUri,
});
const oauth2 = new jsforce.OAuth2({
  loginUrl: config.salesforce.loginUrl,
  clientId: config.salesforce.oauth2.clientId,
  clientSecret: config.salesforce.oauth2.clientSecret,
  redirectUri: "http://localhost:1234/services/oauth2/callback",
});

const createServer = (config: ExpressServerConfig) => {
  const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.query.key === config.serverKey) {
      return next();
    }
    return res.json({ message: "Invalid Key" }).status(401);
  };

  app.get("/salesforce/login", (req, res) => {
    res.redirect(oauth2.getAuthorizationUrl({ scope: "api id web" }));
  });

  app.get("/services/oauth2/callback", async (req, res) => {
    const conn = new jsforce.Connection({ oauth2 });
    const code = req.param("code");

    conn.authorize(code, async (err, userInfo) => {
      if (err) {
        return res.json(err).status(500);
      }

      logger.info(conn.accessToken);
      logger.info(conn.instanceUrl);
      logger.info(conn.refreshToken);
      res.send("success");
    });
  });
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
