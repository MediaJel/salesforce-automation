import config from '@/config';
import createIntuitService, { IntuitService } from '@/services/intuit/service';
import createLogger from '@/utils/logger';
import {
    QuickbooksCreateEstimateInput, QuickbooksEstimateResponse, SalesforceClosedWonResource
} from '@/utils/types';

const logger = createLogger("Intuit Processor");

const processCustomer = async (service: IntuitService, name: string) => {
  const results = await service.customers.find([{ field: "DisplayName", operator: "=", value: name }]);

  if (!results?.QueryResponse?.Customer?.length || results.QueryResponse.Customer.length === 0) {
    return logger.warn(`No customer found with name: ${name}`);
  }

  if (results.QueryResponse.Customer.length > 1) {
    return logger.warn(`Multiple customers found with name: ${name}`);
    // TODO: Send slack message???
  }

  if (results.QueryResponse.Customer.length === 1) return results.QueryResponse.Customer[0];

  // TODO: Create customer
};

const createIntuitProcessor = () => {
  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      createIntuitService(config.intuit, async (service) => {
        const promises = resources.map(async (resource) => {
          const { opportunity, account, contact, opportunityLineItem, products } = resource;

          const customer = await processCustomer(service, account.Name);

          //TODO: Create customer if not-existing
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
            //* Currently static, to handle the auto creation of customers if non-existing
            //* What do we use to map customers?
            CustomerRef: {
              name: "Amy's Bird Sanctuary",
              value: "1",
            },

            //* TODO: Needs more clarification due to "OpportunityOpportunityLineItems.records"
            //* Right now, only creating 1 line item
            Line: [
              {
                //* According to Warren's Mapping, is important for this to be "1"?
                Id: "1",
                //* Ask what Salesforce data maps to DetailType to Provide here??
                DetailType: "SalesItemLineDetail",
                //* Amount shouuld contain the sum of totalprice of opportunityLineItem Question where the records is on OpportunityLineItem
                Amount: opportunityLineItem.TotalPrice,
                Description: products[0].Description,
                SalesItemLineDetail: {
                  Qty: opportunityLineItem.Quantity,
                  UnitPrice: opportunityLineItem.UnitPrice,
                  //* TODO: Only uses 1 product for now
                  ItemRef: {
                    name: products[0].Name,
                    //* IremRef.Value expects a number but ProductCode is a string
                    value: 1,
                  },
                },
              },
            ],
          };
          service.estimates
            .create(mapping)
            .then((estimate: QuickbooksEstimateResponse) => {
              logger.info(`Estimate created: ${JSON.stringify(estimate, null, 2)}`);
            })
            .catch((err) => {
              logger.error({ message: "Error creating estimate", err });
            });
        });

        await Promise.all(promises);
      });
    },
  };
};

export default createIntuitProcessor;
