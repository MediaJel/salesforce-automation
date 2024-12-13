import intuitOAuth2Client from "intuit-oauth";
import Quickbooks from "node-quickbooks";

import config from "@/config";
import redisService from "@/services/redis/service";
import createLogger from "@/utils/logger";
import { CreateIntuitServiceInput, IntuitAuthResponse, Logger } from "@/utils/types";
import { isProduction } from "@/utils/utils";

const intuitOAuth2 = new intuitOAuth2Client({
  clientId: config.intuit.clientId,
  clientSecret: config.intuit.clientSecret,
  environment: config.intuit.environment,
  redirectUri: config.intuit.redirectUri,
});

const logger = createLogger("Intuit Auth");

const createIntuitAuth = () => {
  return {
    async authenticate(input: CreateIntuitServiceInput) {
      const {
        consumerKey = undefined,
        consumerSecret = undefined,
        withTokenSecret = false,
        useSandbox = isProduction ? false : true,
        enableDebugging = false,
        minorVersion = null,
        oAuthVersion = "2.0",
      } = input;
      const redis = await redisService();

      return new Promise<Quickbooks>(async (resolve, reject) => {
        logger.debug(`Checking for Intuit tokens in Redis...`);
        const cachedTokens = await redis.getIntuitTokens();

        if (!cachedTokens) {
          return reject("No Intuit tokens found in Redis, Must re-authenticate with Intuit");
        }

        // IF tokens NOT expired
        //* Add a 5 minute buffer to the token expiration
        if (cachedTokens.createdAt + cachedTokens.expires_in * 1000 - 600000 > Date.now()) {
          logger.debug("Intuit tokens not expired, using cached tokens");
          return resolve(
            new Quickbooks(
              consumerKey,
              consumerSecret,
              cachedTokens.access_token,
              withTokenSecret,
              input.realmId,
              useSandbox,
              enableDebugging,
              minorVersion,
              oAuthVersion,
              cachedTokens.refresh_token
            )
          );
        }

        logger.info("Authenticating/Reauthenticating to Intuit since tokens expired...");

        const auth = await intuitOAuth2.refreshUsingToken(cachedTokens.refresh_token).catch((err) => {
          logger.error({ message: "Error refreshing Intuit OAuth2 token", err });
          reject(err);
        });

        await redis.setIntuitAuthTokens(auth.token);

        if (!auth?.token) {
          return reject("No token returned from Intuit OAuth2 refresh");
        }

        logger.debug(`Intuit OAuth2 Refreshed: ${JSON.stringify(auth.token, null, 2)}`);

        return resolve(
          new Quickbooks(
            consumerKey,
            consumerSecret,
            auth.token.access_token,
            withTokenSecret,
            input.realmId,
            useSandbox,
            enableDebugging,
            minorVersion,
            oAuthVersion,
            auth.token.refresh_token
          )
        );
      });
    },
  };
};

export default createIntuitAuth;
