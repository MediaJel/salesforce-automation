import config from "@/config";
import createIntuitAuth from "@/services/intuit/auth";
import { QuickbooksCreateEstimateInput, QuickbooksEstimate, QuickbooksEstimateResponse } from "@/utils/types";

//* Client is any since node-quickbooks don't got types
const createIntuitEstimatesService = () => {
  return {
    create: async (input: Partial<QuickbooksCreateEstimateInput>): Promise<QuickbooksEstimate> => {
      const client = await createIntuitAuth().authenticate(config.intuit);
      return new Promise((resolve, reject) => {
        client.createEstimate(input, (err: any, estimate: QuickbooksEstimate) => {
          if (err) reject(err);
          resolve(estimate);
        });
      });
    },
  };
};

export default createIntuitEstimatesService;
