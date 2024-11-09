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
      qbo.findEstimates({}, (err, estimates) => {
        if (err) reject(err);
        resolve(estimates);
      });
    });
  };

  //   qbo.createAttachable({ Note: "My File" }, function (err, attachable) {
  //     if (err) logger.error(err);
  //     else logger.debug(attachable.Id);
  //   });

  qbo.findEstimates({}, (err, estimates) => {
    if (err) return logger.error(err);
    logger.debug(`Estimates: ${JSON.stringify(estimates, null, 2)}`);
  });

  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      if (!processorState.state()) {
        return logger.warn("Disabled app state, not processing...");
      }

      logger.info(`Resources received ${resources.length}`);
    },
  };
};

export default createIntuitProcessor;
