import { Connection, ConnectionOptions } from 'jsforce';

import createSalesforceAuth from '@/services/salesforce/auth';
import createSalesforceMutations from '@/services/salesforce/mutations';
import createSalesforceQueries from '@/services/salesforce/query';
import createSalesforceStream from '@/services/salesforce/stream';
import createLogger from '@/utils/logger';
import { SalesforceService } from '@/utils/types';

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
) => {
  const time = 3600000; // Re-authenticate every hour

  const establishConnection = async () => {
    const client = await createSalesforceAuth(params, logger)
      .authenticate()
      .catch((err) => {
        logger.error({ message: "Error authenticating to Salesforce", err });
      });
    if (!client) return;

    callback(client, {
      query: createSalesforceQueries(client, logger),
      mutation: createSalesforceMutations(client, logger),
      stream: createSalesforceStream(client, logger),
    });
  };

  establishConnection();
  setInterval(establishConnection, time);
};

export default SalesforceService;
