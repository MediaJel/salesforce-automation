import QuickBooks from "node-quickbooks";

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

  logger.debug({
    consumerKey,
    consumerSecret,
    accessToken: input.accessToken,
    withTokenSecret,
    realmId: input.realmId,
    useSandbox,
    enableDebugging,
    minorVersion,
    oAuthVersion,
    refreshToken: input.refreshToken,
  });
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
