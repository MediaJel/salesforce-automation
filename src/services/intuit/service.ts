import QuickBooks from "node-quickbooks";

import { CreateIntuitServiceInput, QuickbooksCreateEstimateInput, QuickbooksEstimateResponse } from "@/utils/types";

const createIntuitService = (input: CreateIntuitServiceInput) => {
  const client = new QuickBooks(
    input.consumerKey ?? null,
    input.consumerSecret ?? null,
    input.accessToken,
    input.withTokenSecret ?? false,
    input.realmId,
    input.useSandbox ?? true,
    input.enableDebugging ?? true,
    input.minorVersion ?? null,
    input.oAuthVersion ?? "2.0",
    input.refreshToken
  );

  return {
    //TODO: Using a Partial type since I have no idea what is required
    createEstimate: (input: Partial<QuickbooksCreateEstimateInput>): Promise<QuickbooksEstimateResponse> => {
      return new Promise((resolve, reject) => {
        client.createEstimate(input, (err, estimate) => {
          if (err) reject(err);
          resolve(estimate as QuickbooksEstimateResponse);
        });
      });
    },
  };
};

export default createIntuitService;
