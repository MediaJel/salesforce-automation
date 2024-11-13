import express from "express";
import intuitOAuth2Client from "intuit-oauth";
import jsforce from "jsforce";

import config from "@/config";
import { processorState } from "@/processor";
import redisService from "@/services/redis/service";
import createLogger from "@/utils/logger";
import { ExpressServerConfig, IntuitAuthResponse } from "@/utils/types";

const app = express();
const logger = createLogger("Server");

const jsForceOAuth2 = new jsforce.OAuth2({
  loginUrl: config.salesforce.loginUrl,
  clientId: config.salesforce.oauth2.clientId,
  clientSecret: config.salesforce.oauth2.clientSecret,
  redirectUri: config.salesforce.oauth2.redirectUri,
});

const intuitOAuth2 = new intuitOAuth2Client({
  clientId: config.intuit.clientId,
  clientSecret: config.intuit.clientSecret,
  environment: config.intuit.environment,
  redirectUri: config.intuit.redirectUri,
});

const createServer = async (config: ExpressServerConfig) => {
  const redis = await redisService();

  const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.query.key === config.serverKey) {
      return next();
    }
    return res.json({ message: "Invalid Key" }).status(401);
  };

  app.get("/salesforce/login", (req, res) => {
    res.redirect(jsForceOAuth2.getAuthorizationUrl({ scope: "api id web refresh_token" }));
  });

  app.get("/salesforce/oauth2/callback", async (req, res) => {
    const conn = new jsforce.Connection({ oauth2: jsForceOAuth2 });
    const code = req.param("code") as string;

    conn.authorize(code, async (err, userInfo) => {
      if (err) {
        return res.json(err).status(500);
      }

      res.send({
        accessToken: conn.accessToken,
        instanceUrl: conn.instanceUrl,
        refreshToken: conn.refreshToken,
      });
    });
  });

  app.get("/intuit/login", (req, res) => {
    res.redirect(
      intuitOAuth2.authorizeUri({
        scope: [
          intuitOAuth2Client.scopes.Accounting,
          intuitOAuth2Client.scopes.OpenId,
          intuitOAuth2Client.scopes.Profile,
          intuitOAuth2Client.scopes.Email,
        ],
        state: "intuit-test",
      })
    );
  });

  app.get("/intuit/oauth2/callback", (req, res) => {
    const parseRedirect = req.url;
    logger.info(`Intuit OAuth2 Redirect: ${parseRedirect}`);

    intuitOAuth2
      .createToken(parseRedirect)
      .then(async (authResponse) => {
        logger.info(`Intuit OAuth2 Response: ${JSON.stringify(authResponse.token, null, 2)}`);
        await redis.setIntuitAuthTokens(authResponse.token as IntuitAuthResponse);
        res.send(authResponse.token);
      })
      .catch((err) => {
        res.send(err);
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
