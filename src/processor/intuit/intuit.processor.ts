import config from '@/config';
import createIntuitService, { IntuitService } from '@/services/intuit/service';
import SalesforceService from '@/services/salesforce';
import createLogger from '@/utils/logger';
import {
    QuickbooksCreateCustomerInput, QuickbooksCreateEstimateInput, QuickbooksCustomer,
    QuickbooksEstimate, QuickbooksEstimateResponse, SalesforceClosedWonResource
} from '@/utils/types';

const logger = createLogger("Intuit Processor");

const processCustomer = async (
  service: IntuitService,
  input: Partial<QuickbooksCreateCustomerInput>
): Promise<QuickbooksCustomer> => {
  const results = await service.customers.find([{ field: "DisplayName", operator: "=", value: input.DisplayName }]);
  const isNoCustomers = !results?.QueryResponse?.Customer?.length || results?.QueryResponse?.Customer?.length === 0;
  const isMoreThanOneCustomer = results?.QueryResponse?.Customer?.length > 1;
  const isOneCustomer = results?.QueryResponse?.Customer?.length === 1;

  if (isMoreThanOneCustomer) {
    logger.warn(`Multiple customers found with name: ${input.DisplayName}, assigning first customer as default`);
    return results.QueryResponse.Customer[0];
    // TODO: Send slack message???
  }

  if (isOneCustomer) {
    logger.info(`Customer found with name: ${input.DisplayName}`);
    return results.QueryResponse.Customer[0];
  }

  if (isNoCustomers) {
    logger.warn(`No customer found with name: ${input.DisplayName}, creating new customer`);
    const customer = await service.customers.create(input).catch((err) => {
      logger.error({ message: "Error creating customer", err });
      return null;
    });

    if (!customer) {
      logger.error({ message: "Customer not created" });
      return null;
    }
    logger.info(`Customer created: ${JSON.stringify(customer.DisplayName, null, 2)}`);

    return customer;
  }
};

const processCustomerHierarchy = async (
  service: IntuitService,
  resource: SalesforceClosedWonResource
): Promise<QuickbooksCustomer> => {
  const { account, parentId, parentName } = resource;

  //* TODO: main problem here is creating if it does not already exist
  if (parentId && parentName) {
    const parent = await processCustomer(service, {
      DisplayName: parentName,
      CompanyName: parentName,
    });
    if (!parent) throw new Error(`Parent customer not created for account: ${account.Name}`);

    // * Create Child, probably only works for 1 level of hierarchy
    const customer = await processCustomer(service, {
      DisplayName: account.Name,
      Job: true,
      ParentRef: {
        value: parent.Id,
      },
    });

    if (!customer) throw new Error(`Customer not created for account: ${account.Name}`);

    return customer;
  }

  const customer = await processCustomer(service, {
    DisplayName: account.Name,
  });

  if (!customer) throw new Error(`Customer not created for account: ${account.Name}`);
  return customer;
};

const processEstimate = async (
  service: IntuitService,
  customer: QuickbooksCustomer,
  resource: SalesforceClosedWonResource
): Promise<QuickbooksEstimate> => {
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
  const estimate = await service.estimates.create(mapping);

  if (!estimate) {
    logger.error({ message: "Error creating estimate" });
    return null;
  }

  logger.info(`Estimate created: ${JSON.stringify(estimate, null, 2)}`);

  return estimate;
};

const createIntuitProcessor = () => {
  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      createIntuitService(config.intuit, async (service) => {
        const processed = [];
        for (const resource of resources) {
          const customer = await processCustomerHierarchy(service, resource);
          if (!customer) throw new Error(`Customer not created for account: ${resource.account.Name}`);

          const estimate = await processEstimate(service, customer, resource);
          if (!estimate) throw new Error(`Estimate not created for account: ${resource.account.Name}`);

          processed.push({ ...estimate, opportunityId: resource.opportunity.Id });
        }

        if (!processed || processed.length === 0) {
          logger.error({ message: "No data returned from processing resources" });
          return;
        }

        logger.info(`Completed processing resources: ${JSON.stringify(processed, null, 2)}`);

        // TODO: Attach data to DBSync in salesforce
        SalesforceService(config.salesforce, async (_, svc) => {
          for (const proc of processed) {
            const { opportunityId, Id } = proc;

            const result = await svc.mutation.updateOpportunity({
              Id: opportunityId,
              AVSFQB__QB_ERROR__C: "Estimate Created by Engineering",
              // AVFSQB__Quickbooks_Id__C: Id, //TODO: Enable only for production
            });

            logger.info(`Opportunity updated: ${JSON.stringify(result, null, 2)}`);
          }
        });

        logger.info("Completed processing resources");
      });
    },
  };
};

export default createIntuitProcessor;
