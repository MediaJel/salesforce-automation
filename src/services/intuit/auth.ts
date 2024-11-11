import intuitOAuth2Client from "intuit-oauth";
import Quickbooks from "node-quickbooks";

import config from "@/config";
import { CreateIntuitServiceInput, Logger } from "@/utils/types";

const intuitOAuth2 = new intuitOAuth2Client({
  clientId: config.intuit.clientId,
  clientSecret: config.intuit.clientSecret,
  environment: config.intuit.environment,
  redirectUri: config.intuit.redirectUri,
});

const createIntuitAuth = (logger: Logger) => {
  return {
    async authenticate(input: CreateIntuitServiceInput) {
      return new Promise<Quickbooks>(async (resolve, reject) => {
        logger.info("Authenticating/Reauthenticating to Intuit");
        const {
          consumerKey = null,
          consumerSecret = null,
          withTokenSecret = false,
          useSandbox = true,
          enableDebugging = true,
          minorVersion = null,
          oAuthVersion = "2.0",
        } = input;

        if (intuitOAuth2.isAccessTokenValid) {
          logger.debug("Intuit OAuth2 Access Token Valid, skipping reauthentication");
          resolve(
            new Quickbooks(
              consumerKey,
              consumerSecret,
              input.accessToken,
              withTokenSecret,
              input.realmId,
              useSandbox,
              enableDebugging,
              minorVersion,
              oAuthVersion,
              input.refreshToken
            )
          );
        }

        logger.debug("Intuit OAuth2 Access Token Invalid, Refreshing");

        const auth = await intuitOAuth2.refreshUsingToken(config.intuit.refreshToken);

        logger.debug(`Intuit OAuth2 Refreshed: ${JSON.stringify(auth.json, null, 2)}`);

        resolve(
          new Quickbooks(
            consumerKey,
            consumerSecret,
            auth.json.access_token,
            withTokenSecret,
            input.realmId,
            useSandbox,
            enableDebugging,
            minorVersion,
            oAuthVersion,
            auth.json.refresh_token
          )
        );
      });
    },
  };
};

export default createIntuitAuth;
