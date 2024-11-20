import config from "@/config";
import createIntuitService, { IntuitService } from "@/services/intuit/service";
import SalesforceService from "@/services/salesforce";
import createLogger from "@/utils/logger";
import {
  QuickbooksCreateCustomerInput,
  QuickbooksCreateEstimateInput,
  QuickbooksCustomer,
  QuickbooksEstimate,
  SalesforceClosedWonResource,
} from "@/utils/types";

const logger = createLogger("Intuit Processor");

const processCustomer = async (
  service: IntuitService,
  salesforceAccountId: string,
  input: Partial<QuickbooksCreateCustomerInput>
): Promise<QuickbooksCustomer> => {
  // TODO: Update Salesforce account with Quickbooks Id
  const results = await service.customers.find([{ field: "Id", operator: "=", value: input.Id }]);
  // const isCustomerNotFound = !results?.QueryResponse?.Customer?.length || results?.QueryResponse?.Customer?.length === 0;
  const isCustomerFound = results?.QueryResponse?.Customer?.length === 1;

  if (isCustomerFound) {
    logger.info(`Customer found in Quickbooks with id ${input.Id} : ${input.DisplayName}`);
    return results.QueryResponse.Customer[0];
  }

  logger.warn(`No customer found with id ${input.Id}: ${input.DisplayName}, creating new customer`);
  const customer = await service.customers.create(input).catch((err) => {
    logger.error({ message: "Error creating customer", err });
    return null;
  });

  SalesforceService(config.salesforce, async (_, svc) => {
    const result = await svc.mutation.updateAccount({
      Id: input.Id,
      AVSFQB__Quickbooks_Id__c: customer.Id,
    });

    logger.info(`Account updated: ${JSON.stringify(result, null, 2)}`);
  });

  if (!customer) {
    logger.error({ message: "Customer not created" });
    return null;
  }
  logger.info(`Customer created: ${JSON.stringify(customer.DisplayName, null, 2)}`);

  return customer;
};
const processCustomerHierarchy = async (
  service: IntuitService,
  resources: SalesforceClosedWonResource[]
): Promise<QuickbooksCustomer[]> => {
  const customers = [];

  for (const resource of resources) {
    const { account, parent } = resource;
    if (parent) {
      const parentCustomer = await processCustomer(service, parent.Id, {
        Id: parent.AVSFQB__Quickbooks_Id__c,
        DisplayName: parent.Name,
        CompanyName: parent.Name,
        BillAddr: {
          City: parent.BillingCity,
          Line1: parent.BillingStreet,
          PostalCode: parent?.BillingPostalCode?.toString(),
          Lat: parent.BillingLatitude?.toString(),
          Long: parent.BillingLongitude?.toString(),
          CountrySubDivisionCode: parent.BillingCountryCode,
        },
      });
      if (!parent) throw new Error(`Parent customer not created for account: ${account.Name}`);

      await processCustomer(service, account.Id, {
        Id: account.AVSFQB__Quickbooks_Id__c,
        DisplayName: account.Name,
        CompanyName: account.Name,
        BillAddr: {
          City: account.BillingCity,
          Line1: account.BillingStreet,
          PostalCode: account.BillingPostalCode?.toString(),
          Lat: account.BillingLatitude?.toString(),
          Long: account.BillingLongitude?.toString(),
          CountrySubDivisionCode: account.BillingCountryCode,
        },
        Job: true,
        ParentRef: {
          value: parentCustomer.Id,
        },
      });
    }

    const customer = await processCustomer(service, account.Id, {
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
      Description: opportunityLineItem.Description,
      SalesItemLineDetail: {
        Qty: opportunityLineItem.Quantity,
        UnitPrice: opportunityLineItem.UnitPrice,
        // TODO: Requires mirrored environment
        ItemRef: {
          name: products[i].Name,
          value: 1,
        },
      },
    })),
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
