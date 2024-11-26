import config from '@/config';
import createIntuitService, { IntuitService } from '@/services/intuit/service';
import SalesforceService from '@/services/salesforce';
import createLogger from '@/utils/logger';
import {
    Account, QuickbooksCreateCustomerInput, QuickbooksCreateEstimateInput, QuickbooksCustomer,
    QuickbooksEstimate, QuickbooksEstimateResponse, QuickbooksFindCustomersInput,
    SalesforceClosedWonResource
} from '@/utils/types';
import { isProduction } from '@/utils/utils';

const logger = createLogger("Intuit Processor");

// TODO: Handle situations where the parent has already been created BUT in the next iteration, the value of the salesforce containing
//* the account id has not yet been updated.
const processCustomer = async (
  service: IntuitService,
  quickbooksId: string,
  salesforceAccountId: string,
  input: Partial<QuickbooksCreateCustomerInput>
): Promise<QuickbooksCustomer> => {
  return new Promise((resolve, reject) => {
    SalesforceService(config.salesforce, async (_, svc) => {
      let isCustomerFound = false;
      let foundCustomer = null;
      let acc: Account = null;

      if (quickbooksId !== null) {
        logger.debug(`Finding customer with Quickbooks id: ${quickbooksId}`);
        const field = isProduction ? "AVSFQB__Quickbooks_Id__c" : "QBO_Account_ID_Staging__c";

        acc = await svc.query.accountByQuickbooksId(field, quickbooksId).catch((err) => {
          logger.error({ message: "Error querying account by quickbooks id", err });
          reject(err);
          return null;
        });

        logger.info(`Account found: ${JSON.stringify(acc, null, 2)}`);

        if (!acc) {
          logger.error({ message: "Account not found" });
          resolve(null);
        }

        logger.debug(`Finding customer with Quickbooks id: ${quickbooksId}`);

        logger.debug(`Salesforce Id is not null, finding customer with id: ${quickbooksId}`);
        const filters: QuickbooksFindCustomersInput[] = [{ field: "Id", operator: "=", value: quickbooksId }];
        const results = await service.customers.find(filters);

        isCustomerFound = results?.QueryResponse?.Customer?.length === 1;
        foundCustomer = isCustomerFound ? resolve(results?.QueryResponse?.Customer[0]) : resolve(null);
      }

      if (!acc) {
        logger.debug(`Finding account with id: ${salesforceAccountId}`);
        acc = await svc.query.accountById(salesforceAccountId).catch((err) => {
          logger.error({ message: "Error querying account by id", err });
          reject(err);
          return null as Account;
        });

        logger.info(`Account found: ${JSON.stringify(acc, null, 2)}`);
      }

      if (!acc.Id) {
        logger.error({ message: "Account not found" });
        resolve(null);
        return null;
      }

      logger.debug(`Customer found: ${isCustomerFound}, `);
      logger.debug(`Found customer: ${JSON.stringify(foundCustomer, null, 2)}`);
      if (isCustomerFound && foundCustomer) {
        logger.info(`Customer found with name: ${input.DisplayName}`);
        return resolve(foundCustomer);
      }

      logger.warn(`No customer found with name: ${input.DisplayName}, creating new customer`);
      const customer = await service.customers.create(input).catch((err) => {
        reject(err);
        return null;
      });

      if (!customer?.Id) {
        logger.error({ message: "Error creating customer in Quickbooks" });
        return reject("Error creating customer in Quickbooks");
      }

      const result = await svc.mutation.updateAccount({
        Id: acc.Id,
        ...(!isProduction && { QBO_Account_ID_Staging__c: customer.Id }),
        ...(isProduction && { AVSFQB__Quickbooks_Id__c: customer.Id }),
      });

      logger.info(`Account updated: ${JSON.stringify(result)}`);

      if (!customer?.Id) {
        logger.error({ message: "Error updating Salesforce account with Quickbooks ID" });
        return reject("Error updating Salesforce account with Quickbooks ID");
      }
      logger.info(`Customer created: ${JSON.stringify(customer.DisplayName, null, 2)}`);

      return resolve(customer);
    });
  });
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

      const parentCustomer = await processCustomer(service, parentProducerId, parent.Id, {
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
      if (!parentCustomer) {
        logger.error({ message: "Parent customer not created" });
        return null;
      }

      await processCustomer(service, accountProducerId, account.Id, {
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

    logger.info(`Account Info: ${JSON.stringify(account, null, 2)}`);

    const customer = await processCustomer(service, accountProducerId, account.Id, {
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
