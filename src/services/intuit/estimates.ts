import { QuickbooksCreateEstimateInput, QuickbooksEstimateResponse } from '@/utils/types';

//* Client is any since node-quickbooks don't got types
const createIntuitEstimatesService = (client: any) => {
  return {
    create: async (input: Partial<QuickbooksCreateEstimateInput>): Promise<QuickbooksEstimateResponse> => {
      return new Promise((resolve, reject) => {
        client.createEstimate(input, (err: any, estimate: QuickbooksEstimateResponse) => {
          if (err) reject(err);
          resolve(estimate);
        });
      });
    },
  };
};

export default createIntuitEstimatesService;
