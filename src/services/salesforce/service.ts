import { Connection, ConnectionOptions } from "jsforce";
import { SalesforceService } from "@/utils/types";

import createSalesforceQueries from "@/services/salesforce/query";
import createSalesforceAuth from "@/services/salesforce/auth";
import createSalesforceStream from "@/services/salesforce/stream";
import createLogger from "@/utils/logger";

/**
 * Create a SalesforceService instance. Authentication &
 * re-authentication to the Salesforce APIs are handled behind the scenes
 * automatically. This is important forlong running processes that need
 * to be authenticated for long periods of time such as streaming data
 * from Salesforce in real time.
 *
 *
 * @param {ConnectionOptions} params - Salesforce connection params
 * @param callback - callback function to be called when the connection is established
 */

const logger = createLogger("Salesforce Service");

const SalesforceService = (
  params: ConnectionOptions,
  callback: (client: Connection, svc: SalesforceService) => void
): void => {
  const time = 3600000; // Re-authenticate every hour

  const establishConnection = async () => {
    const client = await createSalesforceAuth(params, logger)
      .authenticate()
      .catch((err) => {
        throw new Error("Authenticating to Salesforce", { cause: err });
      });

    callback(client, {
      query: createSalesforceQueries(client, logger),
      stream: createSalesforceStream(client, logger),
    });
  };

  establishConnection();
  setInterval(establishConnection, time);
};

export default SalesforceService;
