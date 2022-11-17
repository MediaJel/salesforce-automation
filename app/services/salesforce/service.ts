import { Connection, ConnectionOptions } from "jsforce";
import { SalesforceService } from "./types";

import createSalesforceQueries from "./query";
import createSalesforceAuth from "./auth";
import createSalesforceStream from "./stream";

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
const SalesforceService = (
  params: ConnectionOptions,
  callback: (client: Connection, svc: SalesforceService) => void,
) => {
  const time = 3600000; // Re-authenticate every hour

  const establishConnection = async () => {
    const client = await createSalesforceAuth(params).authenticate();
    callback(client, {
      query: createSalesforceQueries(client),
      stream: createSalesforceStream(client),
    });
  };

  establishConnection();
  setInterval(establishConnection, time);
};

export default SalesforceService;
