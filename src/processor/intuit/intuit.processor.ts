import config from '@/config';
import createIntuitService, { IntuitService } from '@/services/intuit/service';
import SalesforceService from '@/services/salesforce';
import createLogger from '@/utils/logger';
import {
    QuickbooksCreateCustomerInput, QuickbooksCreateEstimateInput, QuickbooksCustomer,
    QuickbooksEstimate, QuickbooksEstimateResponse, QuickbooksFindCustomersInput,
    SalesforceClosedWonResource
} from '@/utils/types';
import { isProduction } from '@/utils/utils';

const logger = createLogger("Intuit Processor");

const processCustomer = async (
  service: IntuitService,
  salesforceId: string,
  input: Partial<QuickbooksCreateCustomerInput>
): Promise<QuickbooksCustomer> => {
  let isCustomerFound = false;
  let foundCustomer = null;

  logger.debug(`Finding customer with Quickbooks id: ${salesforceId}`);

  if (salesforceId !== null) {
    logger.debug(`Salesforce Id is not null, finding customer with id: ${salesforceId}`);
    const filters: QuickbooksFindCustomersInput[] = [{ field: "Id", operator: "=", value: salesforceId }];
    const results = await service.customers.find(filters);

    isCustomerFound = results?.QueryResponse?.Customer?.length === 1;
    foundCustomer = isCustomerFound ? results?.QueryResponse?.Customer[0] : null;
  }

  logger.debug(`Customer found: ${isCustomerFound}, `);
  logger.debug(`Found customer: ${JSON.stringify(foundCustomer, null, 2)}`);
  if (isCustomerFound && foundCustomer) {
    logger.info(`Customer found with name: ${input.DisplayName}`);
    return foundCustomer;
  }

  logger.warn(`No customer found with name: ${input.DisplayName}, creating new customer`);
  const customer = await service.customers.create(input).catch((err) => {
    logger.error({ message: "Error creating customer", err });
    return null;
  });

  SalesforceService(config.salesforce, async (_, svc) => {
    const result = await svc.mutation.updateAccount({
      Id: salesforceId,
      ...(!isProduction && { QBO_Account_ID_Staging__c: customer.Id }),
      ...(isProduction && { AVSFQB__Quickbooks_Id__c: customer.Id }),
    });

    logger.info(`Account updated: ${JSON.stringify(result)}`);
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
    const accountProducerId = isProduction ? account?.AVSFQB__Quickbooks_Id__c : account.QBO_Account_ID_Staging__c;

    if (parent) {
      const parentProducerId = isProduction ? parent?.AVSFQB__Quickbooks_Id__c : parent.QBO_Account_ID_Staging__c;

      const parentCustomer = await processCustomer(service, parentProducerId, {
        DisplayName: parent.Name,
        CompanyName: parent.Name,
        BillAddr: {
          City: parent.BillingCity,
          Line1: parent.BillingStreet,
          PostalCode: parent?.BillingPostalCode?.toString(),
          Lat: parent.BillingLatitude?.toString(),
          Long: parent.BillingLongitude?.toString(),
          CountrySubDivisionCode: parent.BillingCountry,
        },
      });
      if (!parent) throw new Error(`Parent customer not created for account: ${account.Name}`);

      await processCustomer(service, accountProducerId, {
        DisplayName: account.Name,
        CompanyName: account.Name,
        BillAddr: {
          City: account.BillingCity,
          Line1: account.BillingStreet,
          PostalCode: account.BillingPostalCode?.toString(),
          Lat: account.BillingLatitude?.toString(),
          Long: account.BillingLongitude?.toString(),
          CountrySubDivisionCode: account.BillingCountry,
        },
        Job: true,
        ParentRef: {
          value: parentCustomer.Id,
        },
      });
    }

    const customer = await processCustomer(service, accountProducerId, {
      DisplayName: account.Name,
      CompanyName: account.Name,
      BillAddr: {
        City: account.BillingCity,
        Line1: account.BillingStreet,
        PostalCode: account.BillingPostalCode?.toString(),
        Lat: account.BillingLatitude?.toString(),
        Long: account.BillingLongitude?.toString(),
        CountrySubDivisionCode: account.BillingCountry,
      },
    });

    if (!customer) {
      logger.error({ message: "Customer not created" });
      return null;
    }
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
      CountrySubDivisionCode: account.BillingCountry,
    },
    BillAddr: {
      //* TODO: Note sure if to use account.id here, was not included in the mappings
      Id: 69420,
      City: account.BillingCity,
      Line1: account.BillingStreet,
      PostalCode: parseInt(account?.BillingPostalCode || "0"),
      Lat: account.BillingLatitude,
      Long: account.BillingLongitude,
      CountrySubDivisionCode: account.BillingCountry,
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
          ...(!isProduction && { QBO_Oppty_ID_Staging__c: opportunityId }),
          //* Only mutate this field in production
          ...(isProduction && { AVFSQB__Quickbooks_Id__C: opportunityId }),
        });

        logger.info(`Opportunity updated: ${JSON.stringify(result, null, 2)}`);
      });

      logger.info("Completed processing resources");
    },
  };
};

export default createIntuitProcessor;
