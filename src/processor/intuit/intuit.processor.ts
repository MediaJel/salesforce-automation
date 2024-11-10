import config from "@/config";
import createIntuitService from "@/services/intuit/service";
import createLogger from "@/utils/logger";
import { SalesforceClosedWonResource } from "@/utils/types";
import { isProduction } from "@/utils/utils";

const logger = createLogger("Intuit Processor");

const createIntuitProcessor = () => {
  const qbo = createIntuitService({
    accessToken: config.intuit.accessToken,
    realmId: config.intuit.realmId,
    refreshToken: config.intuit.refreshToken,
    useSandbox: !isProduction,
  });

  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      resources.forEach((resource) => {
        const { opportunity, account, contact } = resource;
        const data = qbo.createEstimate({
          TotalAmt: opportunity.Amount,

          BillEmail: {
            Address: contact.Email,
          },
          ShipAddr: {
            //* TODO: Note sure if to use account.id here, was not included in the mappings
            Id: account.Id,
            City: account.ShippingCity,
            Line1: account.ShippingStreet,
            PostalCode: account.ShippingPostalCode,
            Lat: account.ShippingLatitude,
            Long: account.ShippingLongitude,
            CountrySubDivisionCode: account.BillingCountryCode,
          },
          BillAddr: {
            //* TODO: Note sure if to use account.id here, was not included in the mappings
            Id: account.Id,
            City: account.BillingCity,
            Line1: account.BillingStreet,
            PostalCode: account.BillingPostalCode,
            Lat: account.BillingLatitude,
            Long: account.BillingLongitude,
            CountrySubDivisionCode: account.BillingCountryCode,
          },
        });

        logger.info(`Created Estimate for ${opportunity.Name}: ${JSON.stringify(data, null, 2)}`);
      });
    },
  };
};

export default createIntuitProcessor;
