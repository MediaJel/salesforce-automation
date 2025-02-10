import { Connection, ConnectionOptions } from "jsforce";

import createSalesforceAuth from "@/services/salesforce/auth";
import createSalesforceMutations from "@/services/salesforce/mutations";
import createSalesforceQueries from "@/services/salesforce/query";
import createSalesforceStream from "@/services/salesforce/stream";
import createLogger from "@/utils/logger";
import { SalesforceServiceType } from "@/utils/types";

const logger = createLogger("Salesforce Service");

const createSalesforceService = async (params: ConnectionOptions): Promise<SalesforceServiceType> => {
  try {
    // Authenticate using our auth helper.
    const client = await createSalesforceAuth(params, logger).authenticate();

    if (!client) {
      throw new Error("Failed to authenticate with Salesforce");
    }

    // Attach a listener for token refresh events.
    client.on("refresh", async (accessToken: string, res: any) => {
      logger.debug(`Salesforce OAuth2 Refreshed: ${JSON.stringify(accessToken, null, 2)}`);
    });

    logger.info("Salesforce connection established");

    // Return the service object with query, mutation, and stream methods.
    return {
      query: createSalesforceQueries(client, logger),
      mutation: createSalesforceMutations(client, logger),
      stream: createSalesforceStream(client, logger),
    };
  } catch (err) {
    logger.error({ message: "Error authenticating to Salesforce", err });
    throw err;
  }
};

export default createSalesforceService;
