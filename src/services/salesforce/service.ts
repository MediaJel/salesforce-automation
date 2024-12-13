import { Connection, ConnectionOptions } from "jsforce";

import redisService from "@/services/redis/service";
import createSalesforceAuth from "@/services/salesforce/auth";
import createSalesforceMutations from "@/services/salesforce/mutations";
import createSalesforceQueries from "@/services/salesforce/query";
import createSalesforceStream from "@/services/salesforce/stream";
import createLogger from "@/utils/logger";
import { SalesforceServiceType } from "@/utils/types";

/**
 * Create a singleton SalesforceService instance. Handles automatic authentication
 * and re-authentication to Salesforce APIs, making it suitable for long-running processes.
 */

const logger = createLogger("Salesforce Service");

const createSalesforceService = async (params: ConnectionOptions): Promise<SalesforceServiceType> => {
  try {
    const client = await createSalesforceAuth(params, logger).authenticate();

    if (!client) {
      throw new Error("Failed to authenticate with Salesforce");
    }

    client.on("refresh", async (accessToken: string, res: any) => {
      logger.debug(`Salesforce OAuth2 Refreshed: ${JSON.stringify(accessToken, null, 2)}`);
    });

    logger.info("Salesforce connection established");

    return {
      query: createSalesforceQueries(client, logger),
      mutation: createSalesforceMutations(client, logger),
      stream: createSalesforceStream(client, logger),
    };
  } catch (err) {
    logger.error({ message: "Error authenticating to Salesforce", err });
  }
};

export default createSalesforceService;
