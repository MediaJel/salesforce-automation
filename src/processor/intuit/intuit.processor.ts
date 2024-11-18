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
  resources: SalesforceClosedWonResource[]
): Promise<QuickbooksCustomer[]> => {
  const customers = [];

  for (const resource of resources) {
    const { account, parentId, parentName } = resource;
    if (parentId && parentName) {
      const parent = await processCustomer(service, {
        DisplayName: parentName,
        CompanyName: parentName,
      });
      if (!parent) throw new Error(`Parent customer not created for account: ${account.Name}`);

      await processCustomer(service, {
        DisplayName: account.Name,
        Job: true,
        ParentRef: {
          value: parent.Id,
        },
      });
    }

    const customer = await processCustomer(service, {
      DisplayName: account.Name,
    });

    if (!customer) throw new Error(`Customer not created for account: ${account.Name}`);
    customers.push(customer);
  }

  return customers;
};

const processEstimate = async (
  service: IntuitService,
  customer: QuickbooksCustomer,
  resource: SalesforceClosedWonResource
): Promise<QuickbooksEstimate & { opportunityId: string }> => {
  const { opportunity, account, contact, opportunityLineItems, products } = resource;

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
    CustomerRef: {
      name: customer.DisplayName,
      value: customer.Id,
    },

    Line: opportunityLineItems.map((opportunityLineItem, i) => ({
      Id: (i + 1).toString(),
      DetailType: "SalesItemLineDetail",
      Amount: opportunityLineItem.TotalPrice,
      Description: products[i].Description,
      SalesItemLineDetail: {
        Qty: opportunityLineItem.Quantity,
        UnitPrice: opportunityLineItem.UnitPrice,
        ItemRef: {
          name: products[i].Name,
          value: 1,
        },
      },
    })),

    //* TODO: Needs more clarification due to "OpportunityOpportunityLineItems.records"
    //* Right now, only creating 1 line item
    // Line: [
    //   {
    //     //* According to Warren's Mapping, is important for this to be "1"?
    //     Id: "1",
    //     //* Ask what Salesforce data maps to DetailType to Provide here??
    //     DetailType: "SalesItemLineDetail",
    //     //* Amount shouuld contain the sum of totalprice of opportunityLineItem Question where the records is on OpportunityLineItem
    //     Amount: opportunityLineItem.TotalPrice,
    //     Description: products[0].Description,
    //     SalesItemLineDetail: {
    //       Qty: opportunityLineItem.Quantity,
    //       UnitPrice: opportunityLineItem.UnitPrice,
    //       //* TODO: Only uses 1 product for now
    //       ItemRef: {
    //         name: products[0].Name,
    //         //* IremRef.Value expects a number but ProductCode is a string
    //         value: 1,
    //       },
    //     },
    //   },
    // ],
  };
  const estimate = await service.estimates.create(mapping);

  if (!estimate) {
    logger.error({ message: "Error creating estimate" });
    return null;
  }

  logger.info(`Estimate created: ${JSON.stringify(estimate, null, 2)}`);

  return { ...estimate, opportunityId: resource.opportunity.Id };
};

const createIntuitProcessor = async () => {
  const intuitService = await createIntuitService(config.intuit);

  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      // const processed = [];
      // for (const resource of resources) {
      //   const customer = await processCustomerHierarchy(intuitService, resource);
      //   if (!customer) throw new Error(`Customer not created for account: ${resource.account.Name}`);

      //   const estimate = await processEstimate(intuitService, customer, resource);
      //   if (!estimate) throw new Error(`Estimate not created for account: ${resource.account.Name}`);

      //   processed.push({ ...estimate, opportunityId: resource.opportunity.Id });
      // }

      const customers = await processCustomerHierarchy(intuitService, resources).catch((err) => {
        logger.error({ message: "Error processing resources", err });
        throw err;
      });

      if (!customers) {
        logger.error({ message: "No customers returned from processing resources" });
        return;
      }

      const estimate = await processEstimate(intuitService, customers.at(-1), resources.at(-1)).catch((err) => {
        logger.error({ message: "Error processing resources", err });
        throw err;
      });

      if (!estimate) {
        logger.error({ message: "No estimate returned from processing resources" });
        return;
      }

      SalesforceService(config.salesforce, async (_, svc) => {
        const { opportunityId } = estimate;
        const result = await svc.mutation.updateOpportunity({
          Id: opportunityId,
          AVSFQB__QB_ERROR__C: "Estimate Created by Engineering",
          // AVFSQB__Quickbooks_Id__C: Id, //TODO: Enable only for production
        });

        logger.info(`Opportunity updated: ${JSON.stringify(result, null, 2)}`);
      });

      logger.info("Completed processing resources");
    },
  };
};

export default createIntuitProcessor;
