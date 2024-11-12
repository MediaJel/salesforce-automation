import { Connection } from 'jsforce';

import { Logger } from '@/utils/types';

interface SalesforceUpdateOpportunityInput {
  Id: string;
  [key: string]: any;
}

const createSalesforceMutations = (client: Connection, logger: Logger) => {
  return {
    updateOpportunity: async (input: SalesforceUpdateOpportunityInput) => {
      return new Promise((resolve, reject) => {
        client.sobject("Opportunity").update(input, (err, result) => {
          if (err) {
            logger.error({ message: "Error updating Opportunity", err });
            reject(err);
          }

          resolve(result);
        });
      });
    },
  };
};

export default createSalesforceMutations;
