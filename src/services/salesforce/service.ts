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
      logger.info(`Salesforce OAuth2 token refreshed successfully`);
      logger.debug(`Salesforce OAuth2 Refreshed: ${JSON.stringify(accessToken, null, 2)}`);
    });

    // Add error handling for connection issues
    client.on("error", (error: any) => {
      logger.error({ message: "Salesforce connection error", error });
    });

    logger.info("Salesforce connection established");

    // Create stream service with reconnection capabilities
    const streamService = createSalesforceStream(client, logger);

    // Return the service object with query, mutation, and stream methods.
    return {
      query: createSalesforceQueries(client, logger),
      mutation: createSalesforceMutations(client, logger),
      stream: streamService,
      // Add reconnect method
      reconnect: async () => {
        try {
          logger.info("Attempting to reconnect to Salesforce");
          const refreshedClient = await createSalesforceAuth(params, logger).authenticate();
          if (!refreshedClient) {
            throw new Error("Failed to reconnect to Salesforce");
          }
          logger.info("Successfully reconnected to Salesforce");
          return createSalesforceService(params);
        } catch (err) {
          logger.error({ message: "Error reconnecting to Salesforce", err });
          throw err;
        }
      },
    };
  } catch (err) {
    logger.error({ message: "Error authenticating to Salesforce", err });
    throw err;
  }
};

export default createSalesforceService;
