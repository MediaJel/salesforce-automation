import intuitOAuth2Client from "intuit-oauth";
import QuickBooks from "node-quickbooks";

import config from "@/config";
import createLogger from "@/utils/logger";
import { CreateIntuitServiceInput, QuickbooksCreateEstimateInput, QuickbooksEstimateResponse } from "@/utils/types";

interface IntuitService {
  createEstimate: (input: Partial<QuickbooksCreateEstimateInput>) => Promise<QuickbooksEstimateResponse>;
}

const logger = createLogger("Intuit Service");

const createIntuitService = (input: CreateIntuitServiceInput) => {
  const {
    consumerKey = null,
    consumerSecret = null,
    withTokenSecret = false,
    useSandbox = true,
    enableDebugging = true,
    minorVersion = null,
    oAuthVersion = "2.0",
  } = input;

  const intuitOAuth2 = new intuitOAuth2Client({
    clientId: config.intuit.clientId,
    clientSecret: config.intuit.clientSecret,
    environment: config.intuit.environment,
    redirectUri: config.intuit.redirectUri,
  });

  if (!intuitOAuth2.isAccessTokenValid) {
    logger.debug("Intuit OAuth2 Access Token Invalid, Refreshing");

    intuitOAuth2
      .refreshUsingToken(config.intuit.refreshToken)
      .then((auth) => {
        logger.debug(`Intuit OAuth2 Refreshed: ${JSON.stringify(auth.json, null, 2)}`);
      })
      .catch((err) => {
        console.log(err);
        logger.error({ message: "Intuit OAuth2 Refresh Error", error: err.message });
      });
  }

  const client = new QuickBooks(
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
  );

  return {
    //TODO: Using a Partial type since I have no idea what is required
    createEstimate: (input: Partial<QuickbooksCreateEstimateInput>): Promise<QuickbooksEstimateResponse> => {
      return new Promise((resolve, reject) => {
        client.createEstimate(input, (err, estimate) => {
          if (err) reject(err);
          resolve(estimate as QuickbooksEstimateResponse);
        });
      });
    },
  };
};

export default createIntuitService;
