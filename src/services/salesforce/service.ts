import { Connection, ConnectionOptions } from 'jsforce';

import createSalesforceAuth from '@/services/salesforce/auth';
import createSalesforceMutations from '@/services/salesforce/mutations';
import createSalesforceQueries from '@/services/salesforce/query';
import createSalesforceStream from '@/services/salesforce/stream';
import createLogger from '@/utils/logger';
import { SalesforceServiceType } from '@/utils/types';

/**
 * Create a singleton SalesforceService instance. Handles automatic authentication
 * and re-authentication to Salesforce APIs, making it suitable for long-running processes.
 */

const logger = createLogger("Salesforce Service");

let salesforceServiceInstance: SalesforceServiceType | null = null;

const createSalesforceService = async (
  params: ConnectionOptions,
  callback?: (service: SalesforceServiceType) => void
): Promise<SalesforceServiceType> => {
  if (salesforceServiceInstance) {
    if (callback) callback(salesforceServiceInstance);
    return salesforceServiceInstance;
  }

  const time = 3600000; // Re-authenticate every hour

  const establishConnection = async () => {
    try {
      const client = await createSalesforceAuth(params, logger).authenticate();
      if (!client) {
        throw new Error("Failed to authenticate with Salesforce");
      }

      salesforceServiceInstance = {
        query: createSalesforceQueries(client, logger),
        mutation: createSalesforceMutations(client, logger),
        stream: createSalesforceStream(client, logger),
      };

      if (callback) callback(salesforceServiceInstance);
      logger.info("Salesforce connection established");
    } catch (err) {
      logger.error({ message: "Error authenticating to Salesforce", err });
    }
  };

  await establishConnection();

  // Optional: refresh authentication in the background
  setInterval(establishConnection, time);

  return salesforceServiceInstance!;
};

export default createSalesforceService;
