import config from '@/config';
import createIntuitService, { IntuitService } from '@/services/intuit/service';
import createLogger from '@/utils/logger';
import {
    QuickbooksCreateEstimateInput, QuickbooksCustomer, QuickbooksEstimateResponse,
    SalesforceClosedWonResource
} from '@/utils/types';

const logger = createLogger("Intuit Processor");

const processCustomer = async (service: IntuitService, name: string): Promise<QuickbooksCustomer> => {
  const results = await service.customers.find([{ field: "DisplayName", operator: "=", value: name }]);
  const isNoCustomers = !results?.QueryResponse?.Customer?.length || results?.QueryResponse?.Customer?.length === 0;
  const isMoreThanOneCustomer = results?.QueryResponse?.Customer?.length > 1;
  const isOneCustomer = results?.QueryResponse?.Customer?.length === 1;

  if (isMoreThanOneCustomer) {
    logger.warn(`Multiple customers found with name: ${name}, assigning first customer as default`);
    return results.QueryResponse.Customer[0];
    // TODO: Send slack message???
  }

  if (isOneCustomer) {
    logger.info(`Customer found with name: ${name}`);
    return results.QueryResponse.Customer[0];
  }

  if (isNoCustomers) {
    logger.warn(`No customer found with name: ${name}, creating new customer`);
    const customer = await service.customers
      .create({
        DisplayName: name,
      })
      .catch((err) => {
        logger.error({ message: "Error creating customer", err });
      });

    logger.info(`Customer created: ${name}`);

    if (customer) return customer.Customer;
    return null;
  }
};

const processEstimate = async (
  service: IntuitService,
  customer: QuickbooksCustomer,
  resource: SalesforceClosedWonResource
) => {
  const { opportunity, account, contact, opportunityLineItem, products } = resource;

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
      name: customer.DisplayName,
      value: customer.Id,
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
};

const createIntuitProcessor = () => {
  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      createIntuitService(config.intuit, async (service) => {
        const processes = resources.map(async (resource) => {
          const customer = await processCustomer(service, resource.account.Name);
          if (!customer) return logger.warn(`Customer not found for account: ${resource.account.Name}`);
          const estimate = await processEstimate(service, customer, resource);

          return estimate;
        });

        const data = await Promise.all(processes);

        // TODO: Attach data to DBSync in salesforce
      });
    },
  };
};

export default createIntuitProcessor;
