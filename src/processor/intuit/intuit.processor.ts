import QuickBooks from "node-quickbooks";

import config from "@/config";
import { processorState } from "@/processor";
import createLogger from "@/utils/logger";
import { SalesforceClosedWonResource } from "@/utils/types";

const logger = createLogger("Intuit Processor");

const createIntuitProcessor = () => {
  const qbo = new QuickBooks(
    null,
    null,
    config.intuit.accessToken,
    false, // no token secret for oAuth 2.0
    config.intuit.realmId,
    false, // use the sandbox?
    true, // enable debugging?
    null, // set minorversion, or null for the latest version
    "2.0", //oAuth version
    config.intuit.refreshToken
  );

  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      if (!processorState.state()) {
        return logger.warn("Disabled app state, not processing...");
      }

      resources.forEach((resource) => {
        logger.debug(`Processing Resource: ${JSON.stringify(resource)}`);
      });
    },
  };
};

export default createIntuitProcessor;
