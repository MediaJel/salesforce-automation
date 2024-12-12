import intuitOAuth2Client from 'intuit-oauth';
import Quickbooks from 'node-quickbooks';

import config from '@/config';
import redisService from '@/services/redis/service';
import { CreateIntuitServiceInput, Logger } from '@/utils/types';
import { isProduction } from '@/utils/utils';

const intuitOAuth2 = new intuitOAuth2Client({
  clientId: config.intuit.clientId,
  clientSecret: config.intuit.clientSecret,
  environment: config.intuit.environment,
  redirectUri: config.intuit.redirectUri,
});

const createIntuitAuth = (logger: Logger) => {
  return {
    async authenticate(input: CreateIntuitServiceInput) {
      const redis = await redisService();
      return new Promise<Quickbooks>(async (resolve, reject) => {
        logger.debug(`Checking for Intuit tokens in Redis...`);
        const tokens = await redis.getIntuitTokens();
        if (!tokens) {
          return reject("No Intuit tokens found in Redis, Must re-authenticate with Intuit");
        }

        logger.info("Authenticating/Reauthenticating to Intuit");
        const {
          consumerKey = undefined,
          consumerSecret = undefined,
          withTokenSecret = false,
          useSandbox = isProduction ? false : true,
          enableDebugging = false,
          minorVersion = null,
          oAuthVersion = "2.0",
        } = input;

        const auth = await intuitOAuth2.refreshUsingToken(tokens.refresh_token).catch((err) => {
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
