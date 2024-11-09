import QuickBooks from "node-quickbooks";

import config from "@/config";
import { processorState } from "@/processor";
import createLogger from "@/utils/logger";
import { QuickbooksCreateEstimateInput, QuickbooksEstimateResponse, SalesforceClosedWonResource } from "@/utils/types";
import { isProduction } from "@/utils/utils";

const logger = createLogger("Intuit Processor");

const createIntuitProcessor = () => {
  const qbo = new QuickBooks(
    null, // Consumer Key
    null, // Consumer secret
    config.intuit.accessToken,
    false, // no token secret for oAuth 2.0
    config.intuit.realmId,
    isProduction ? true : false, // use the sandbox?
    true, // enable debugging?
    null, // set minorversion, or null for the latest version
    "2.0", //oAuth version
    config.intuit.refreshToken
  );

  const createEstimate = (input: QuickbooksCreateEstimateInput): Promise<QuickbooksEstimateResponse> => {
    return new Promise((resolve, reject) => {
      qbo.findEstimates(input, (err, estimates) => {
        if (err) reject(err);
        resolve(estimates);
      });
    });
  };

  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      resources.forEach((resource) => {
        logger.debug(`Processing resource: ${resource.opportunity.Id}`);
      });
    },
  };
};

export default createIntuitProcessor;
