import { Connection } from "jsforce";

import { Logger } from "@/utils/types";

interface SalesforceUpdateOpportunityInput {
  Id: string;
  [key: string]: any;
}

interface SalesforceUpdateAccountInput {
  Id: string;
  [key: string]: any;
}

const createSalesforceMutations = (client: Connection, logger: Logger) => {
  return {
    updateOpportunity: async (input: SalesforceUpdateOpportunityInput) => {
      return new Promise((resolve, reject) => {
        client.sobject("Opportunity").update(input, (err, result) => {
          if (err) {
            logger.error({ message: "Error updating Opportunity", err: err.message });
            reject(err);
          }

          resolve(result);
        });
      });
    },
    updateAccount: async (input: SalesforceUpdateAccountInput) => {
      return new Promise((resolve, reject) => {
        client.sobject("Account").update(input, (err, result) => {
          if (err) {
            logger.error({ message: "Error updating Account", err });
            reject(err);
          }

          resolve(result);
        });
      });
    },
  };
};

export default createSalesforceMutations;
