import QuickBooks from "node-quickbooks";

import config from "@/config";
import { processorState } from "@/processor";
import createIntuitService from "@/services/intuit/service";
import createLogger from "@/utils/logger";
import { QuickbooksCreateEstimateInput, QuickbooksEstimateResponse, SalesforceClosedWonResource } from "@/utils/types";
import { isProduction } from "@/utils/utils";

const logger = createLogger("Intuit Processor");

const createIntuitProcessor = () => {
  // const quickbooks = createIntuitService({
  //   accessToken: config.intuit.accessToken,
  //   realmId: config.intuit.realmId,
  //   refreshToken: config.intuit.refreshToken,
  //   useSandbox: !isProduction,
  // });
  const qbo = new QuickBooks(
    null, // Consumer Key
    null, // Consumer secret
    config.intuit.accessToken,
    false, // no token secret for oAuth 2.0
    config.intuit.realmId,
    isProduction ? true : false, // use the sandbox?
    true, // enable debugging?
    null, // set minorversion, or null for the latest version
    "2.0", //oAuth version
    config.intuit.refreshToken
  );

  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      resources.forEach((resource) => {
        const { opportunity, account, contact } = resource;

        const mapping: Partial<QuickbooksCreateEstimateInput> = {
          TotalAmt: opportunity.Amount,

          BillEmail: {
            Address: contact.Email,
          },
          ShipAddr: {
            //* TODO: Note sure if to use account.id here, was not included in the mappings,
            Id: 69420,
            City: account.ShippingCity,
            Line1: account.ShippingStreet,
            PostalCode: account.ShippingPostalCode,
            Lat: account.ShippingLatitude,
            Long: account.ShippingLongitude,
            CountrySubDivisionCode: account.BillingCountryCode,
          },
          BillAddr: {
            //* TODO: Note sure if to use account.id here, was not included in the mappings
            Id: 69420,
            City: account.BillingCity,
            Line1: account.BillingStreet,
            PostalCode: account.BillingPostalCode,
            Lat: account.BillingLatitude,
            Long: account.BillingLongitude,
            CountrySubDivisionCode: account.BillingCountryCode,
          },
        };

        const estimate = qbo.createEstimate(mapping, (err, estimate) => {
          if (err) {
            logger.error({ message: `Error creating estimate: ${JSON.stringify(err)}` });
            return;
          }

          logger.info(`Estimate created: ${JSON.stringify(estimate, null, 2)}`);
        });
      });
    },
  };
};

export default createIntuitProcessor;
