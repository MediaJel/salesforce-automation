import { log } from "console";

import config from "@/config";
import createIntuitService, { IntuitService } from "@/services/intuit/service";
import SalesforceService from "@/services/salesforce";
import createLogger from "@/utils/logger";
import {
  Account,
  ItemRef,
  Product,
  QuickbooksCreateCustomerInput,
  QuickbooksCreateEstimateInput,
  QuickbooksCustomer,
  QuickbooksEstimate,
  QuickbooksEstimateResponse,
  QuickbooksFindCustomersInput,
  SalesforceClosedWonResource,
} from "@/utils/types";
import { isProduction } from "@/utils/utils";
import { Job } from "bull";

const logger = createLogger("Intuit Processor");

// TODO: Handle situations where the parent has already been created BUT in the next iteration, the value of the salesforce containing
//* the account id has not yet been updated.
const processCustomer = async (
  service: IntuitService,
  quickbooksId: string,
  salesforceAccountId: string,
  input: Partial<QuickbooksCreateCustomerInput>
): Promise<QuickbooksCustomer> => {
  try {
    logger.debug(
      `Processing customer: ${
        input.DisplayName
      }, quickbooksid: ${quickbooksId}, salesforceId: ${salesforceAccountId}: ${JSON.stringify(input, null, 2)}`
    );
    // Create Salesforce Service instance
    const svc = await SalesforceService(config.salesforce);
    const field = isProduction ? "AVSFQB__Quickbooks_Id__c" : "QBO_Account_ID_Staging__c";
    let isCustomerFound = false;
    let foundCustomer: QuickbooksCustomer | null = null;
    let acc: Account | null = null;

    //* Find account by Salesforce ID first to get the new account object
    if (salesforceAccountId) {
      logger.debug(`Finding account with Salesforce ID: ${salesforceAccountId}`);
      acc = await svc.query.accountById(salesforceAccountId).catch((err) => {
        logger.error({ message: "Error querying account by Salesforce ID", err });
        throw new Error("Error querying account by Salesforce ID");
      });

      if (!acc?.Id) {
        logger.error({ message: "Account not found for Salesforce ID" });
        return null;
      }

      quickbooksId = acc[field];

      logger.info(`Account found: ${JSON.stringify(acc, null, 2)}`);
    }

    if (quickbooksId) {
      logger.debug(`Finding customer with Quickbooks ID: ${quickbooksId}`);

      acc = await svc.query.accountByQuickbooksId(field, quickbooksId).catch((err) => {
        logger.error({ message: "Error querying account by Quickbooks ID", err });
        return null;
      });

      if (!acc) {
        logger.error({ message: "Account not found for Quickbooks ID" });
        return null;
      }

      logger.info(`Salesforce Account found by filtering for Quickbooks ID: ${JSON.stringify(acc, null, 2)}`);

      logger.debug(`Searching for Quickbooks customer with ID: ${quickbooksId}`);
      const filters: QuickbooksFindCustomersInput[] = [{ field: "Id", operator: "=", value: quickbooksId }];
      const results = await service.customers.find(filters);

      isCustomerFound = results?.QueryResponse?.Customer?.length === 1;

      logger.info(`Customer found in Quickbooks with Quickbooks ID ${quickbooksId}: ${isCustomerFound}`);

      if (isCustomerFound) {
        foundCustomer = results.QueryResponse.Customer[0];
        logger.info(`Customer found: ${JSON.stringify(foundCustomer, null, 2)}`);
        return foundCustomer;
      }
    }

    if (isCustomerFound || foundCustomer) {
      logger.info(`Customer already exists: ${foundCustomer.DisplayName}`);
      return foundCustomer;
    }

    // If Salesforce field that contains the quickbooks id has a value
    if (acc[field]) {
    }

    logger.warn(`No customer found, creating a new customer: ${input.DisplayName}`);
    const customer = await service.customers.create(input).catch((err) => {
      logger.error({ message: "Error creating customer in Quickbooks", err });
      throw new Error("Error creating customer in Quickbooks");
    });

    if (!customer?.Id) {
      throw new Error("Customer creation failed");
    }

    logger.debug(`Updating Salesforce account with Quickbooks ID: ${customer.Id}`);
    const updateFields = {
      Id: acc.Id,
      ...(!isProduction && { QBO_Account_ID_Staging__c: customer.Id }),
      ...(isProduction && { AVSFQB__Quickbooks_Id__c: customer.Id }),
    };

    logger.debug(`Updating Salesforce account: ${JSON.stringify(updateFields, null, 2)}`);

    const result = await svc.mutation.updateAccount(updateFields).catch((err) => {
      logger.error({ message: "Error updating Salesforce account", err });
      throw new Error("Error updating Salesforce account with Quickbooks ID");
    });

    logger.info(`Account updated: ${JSON.stringify(result)}`);
    logger.info(`Customer created successfully: ${customer.DisplayName}`);
    return customer;
  } catch (err) {
    logger.error({ message: "Error in processCustomer", err });
    throw err;
  }
};

const processCustomerHierarchy = async (
  service: IntuitService,
  resources: SalesforceClosedWonResource[],
  job: Job
): Promise<QuickbooksCustomer[]> => {
  const customers = [];

  job.log(`Starting customer hierarchy processing for ${resources.length} resources`);

  for (const [index, resource] of resources.entries()) {
    const { account, parent, contact } = resource;
    const accountProducerId = isProduction ? account?.AVSFQB__Quickbooks_Id__c : account.QBO_Account_ID_Staging__c;

    job.log(`Processing customer ${index + 1}/${resources.length}: ${account.Name}`);

    try {
      if (parent?.Id) {
        job.log(`Processing parent customer for account: ${account.Name}`);
        logger.warn(`Parent exists for account: ${account.Name}`);
        const parentProducerId = isProduction ? parent?.AVSFQB__Quickbooks_Id__c : parent.QBO_Account_ID_Staging__c;

        const parentCustomer = await processCustomer(service, parentProducerId, parent.Id, {
          DisplayName: parent.Name,
          CompanyName: parent.Name,
          BillAddr: {
            City: parent.BillingCity,
            Line1: parent.BillingStreet,
            Line2: parent.BillingState,
            PostalCode: parent?.BillingPostalCode?.toString(),
            Lat: parent.BillingLatitude?.toString(),
            Long: parent.BillingLongitude?.toString(),
            CountrySubDivisionCode: parent.BillingCountry,
          },
        });

        if (!parentCustomer) {
          const errorMsg = `Failed to create parent customer for account: ${account.Name}`;
          logger.error({ message: errorMsg });
          job.log(`ERROR: ${errorMsg}`);
          job.moveToFailed({ message: errorMsg });
          return null;
        }

        job.log(`Successfully created parent customer: ${parentCustomer.DisplayName}`);

        await processCustomer(service, accountProducerId, account.Id, {
          DisplayName: account.Name,
          CompanyName: account.Name,
          PrimaryEmailAddr: {
            Address: contact.Email,
          },
          BillAddr: {
            City: account.BillingCity,
            Line1: account.BillingStreet,
            Line2: account.BillingState,
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
        PrimaryEmailAddr: {
          Address: contact.Email,
        },
        BillAddr: {
          City: account.BillingCity,
          Line1: account.BillingStreet,
          Line2: account.BillingState,
          PostalCode: account.BillingPostalCode?.toString(),
          Lat: account.BillingLatitude?.toString(),
          Long: account.BillingLongitude?.toString(),
          CountrySubDivisionCode: account.BillingCountry,
        },
      });

      logger.info(`Finish Customer Creation`);
      if (!customer) {
        const errorMsg = `Failed to create customer: ${account.Name}`;
        logger.error({ message: errorMsg });
        job.log(`ERROR: ${errorMsg}`);
        job.moveToFailed({ message: errorMsg });
        return null;
      }

      job.log(`Successfully created customer: ${customer.DisplayName}`);
      customers.push(customer);
    } catch (err) {
      const errorMsg = `Error processing customer ${account.Name}: ${JSON.stringify(err, null, 2)}`;
      logger.error({ message: errorMsg, err });
      job.log(`ERROR: ${errorMsg}`);
      job.moveToFailed({ message: errorMsg });
      throw err;
    }
  }

  job.log(`Customer hierarchy processing completed. Created ${customers.length} customers`);
  return customers;
};

const processItemRef = async (service: IntuitService, product: Product): Promise<ItemRef> => {
  let itemRef: ItemRef | null = null;

  logger.debug(`Finding item with Quickbooks ID: ${product["AVSFQB__Quickbooks_Id__c"]}`);

  const id = [];
  product["AVSFQB__Quickbooks_Id__c"] &&
    id.push({ field: "Id", operator: "=", value: product["AVSFQB__Quickbooks_Id__c"] });

  id.length > 0 &&
    (await service.items
      .find([{ field: "Id", operator: "=", value: product["AVSFQB__Quickbooks_Id__c"] }])
      .then((items) => {
        if (items?.QueryResponse?.Item?.length >= 1) {
          logger.info(`Items found via Quickbooks ID in salesforce: ${JSON.stringify(items, null, 2)}`);
          itemRef = {
            name: items.QueryResponse.Item[0].Name,
            value: items.QueryResponse.Item[0].Id,
          };
        }
      })
      .catch((err) => {
        logger.error({ message: "Error finding item by Quickbooks ID", err });
      }));

  if (!id) logger.warn(`No Quickbooks ID found for product: ${product.Name}`);

  if (!itemRef) {
    logger.warn(`Item not found with ID, finding by Sku: ${product.Name}`);
    logger.debug(`Finding item by SKU: ${product.ProductCode}`);

    await service.items
      .find([{ field: "Sku", operator: "LIKE", value: product.ProductCode }])
      .then((items) => {
        if (items?.QueryResponse?.Item?.length >= 1) {
          logger.info(`Items found via Sku: ${JSON.stringify(items, null, 2)}`);
          itemRef = {
            name: items.QueryResponse.Item[0].Name,
            value: items.QueryResponse.Item[0].Id,
          };
        }
      })
      .catch((err) => {
        logger.error({ message: "Error finding item by SKU", err });
      });
  }

  if (!itemRef) {
    logger.warn(`Item not found with Quickbooks ID: ${product["AVSFQB__Quickbooks_Id__c"]}`);
    logger.debug(`Finding item with Name: ${product.Name}`);
    await service.items
      .find([{ field: "Name", operator: "LIKE", value: product.Name }])
      .then((items) => {
        if (items?.QueryResponse?.Item?.length >= 1) {
          logger.info(`Items found via Name: ${JSON.stringify(items, null, 2)}`);
          itemRef = {
            name: items.QueryResponse.Item[0].Name,
            value: items.QueryResponse.Item[0].Id,
          };
        }
      })
      .catch((err) => {
        logger.error({ message: "Error finding item by Name", err });
      });
  }

  if (!itemRef) {
    logger.warn(`Item not found with SKU: ${product.ProductCode}`);
  }

  return itemRef;
};

const processEstimate = async (
  service: IntuitService,
  customer: QuickbooksCustomer,
  resource: SalesforceClosedWonResource,
  job: Job
): Promise<QuickbooksEstimate & { opportunityId: string } & { productError: Boolean }> => {
  const { opportunity, account, contact, opportunityLineItems, products } = resource;
  let productError = false;

  job.log(`Starting estimate creation for customer: ${customer.DisplayName}, opportunity: ${opportunity.Name}`);

  try {
    job.log(`Processing ${opportunityLineItems.length} opportunity line items`);

    const linesPromises = opportunityLineItems.map(async (opportunityLineItem, i) => {
      const DEFAULT_ITEM_REF: ItemRef = {
        name: "Services",
        value: "1",
      };

      job.log(
        `Processing line item ${i + 1}/${opportunityLineItems.length}: ${
          opportunityLineItem.Description || "No description"
        }`
      );

      // check if the product exists in the products array, if not use the default item ref
      const isProductAvailable = !!products[i];
      const itemRef = isProductAvailable
        ? await processItemRef(service, products[i]).catch((err) => {
            logger.error({ message: "Error finding item", err });
            job.log(`Warning: Error finding item for line item ${i + 1}: ${err.message}`);
            return null;
          })
        : null;

      if (!opportunityLineItem.ServiceDate) {
        logger.warn(`ServiceDate not found for opportunity line item: ${opportunityLineItem.Id}`);
        job.log(`Warning: ServiceDate not found for line item ${i + 1}`);
      }

      if (!isProductAvailable || !itemRef) {
        productError = true;
        logger.warn(`Product not found for opportunity line item: ${opportunityLineItem.Id}`);
        logger.warn(`Using default item: ${DEFAULT_ITEM_REF.name}`);
        job.log(`Warning: Product not found for line item ${i + 1}, using default item: ${DEFAULT_ITEM_REF.name}`);
      }

      return {
        Id: (i + 1).toString(),
        DetailType: "SalesItemLineDetail",
        Amount: opportunityLineItem.TotalPrice,
        Description: opportunityLineItem.Description,
        SalesItemLineDetail: {
          Qty: opportunityLineItem.Quantity,
          UnitPrice: opportunityLineItem.UnitPrice,
          ItemRef: itemRef || DEFAULT_ITEM_REF,
          ServiceDate: opportunityLineItem.ServiceDate,
        },
      };
    });

    const lines = await Promise.all(linesPromises);
    job.log(`Successfully processed all ${lines.length} line items`);

    const mapping: Partial<QuickbooksCreateEstimateInput> = {
      TotalAmt: opportunity.Amount,

      BillEmail: {
        Address: contact.Email,
      },
      CustomField: [
        {
          DefinitionId: "3",
          Type: "StringType",
          StringValue: opportunity.Proposal_Number__c,
          Name: "SF Proposal Number",
        },
      ],
      ShipAddr: {
        //* TODO: Note sure if to use account.id here, was not included in the mappings,
        Id: 69420,
        City: account.ShippingCity || resource.parent?.ShippingCity,
        Line1: account.ShippingStreet || resource.parent?.ShippingStreet,
        PostalCode: account.ShippingPostalCode || resource.parent?.ShippingPostalCode,
        Lat: account.ShippingLatitude || resource.parent?.ShippingLatitude,
        Long: account.ShippingLongitude || resource.parent?.ShippingLongitude,
        CountrySubDivisionCode: account.BillingCountry || resource.parent?.BillingCountry,
      },
      BillAddr: {
        //* TODO: Note sure if to use account.id here, was not included in the mappings
        Id: 69420,
        City: account.BillingCity || resource.parent?.BillingCity,
        Line1: account.BillingStreet || resource.parent?.BillingStreet,
        Line2: account.BillingState || resource.parent?.BillingState,
        PostalCode: parseInt(account?.BillingPostalCode || resource.parent?.BillingPostalCode || "0"),
        Lat: account.BillingLatitude || resource.parent?.BillingLatitude,
        Long: account.BillingLongitude || resource.parent?.BillingLongitude,
        CountrySubDivisionCode: account.BillingCountry || resource.parent?.BillingCountry,
      },
      CustomerRef: {
        name: customer.DisplayName,
        value: customer.Id,
      },

      Line: lines,
    };

    job.log(`Creating estimate in QuickBooks for customer: ${customer.DisplayName}`);
    const estimate = await service.estimates.create(mapping);

    if (!estimate) {
      const errorMsg = `Failed to create estimate for customer: ${customer.DisplayName}`;
      logger.error({ message: errorMsg });
      job.log(`ERROR: ${errorMsg}`);
      job.moveToFailed({ message: errorMsg });
      return null;
    }

    job.log(`Successfully created estimate with ID: ${estimate.Id} for customer: ${customer.DisplayName}`);
    logger.info(`Estimate created: ${JSON.stringify(estimate, null, 2)}`);

    return { ...estimate, opportunityId: resource.opportunity.Id, productError };
  } catch (err) {
    const errorMsg = `Error creating estimate for customer ${customer.DisplayName}: ${JSON.stringify(err, null, 2)}`;
    logger.error({ message: errorMsg, err });
    job.log(`ERROR: ${errorMsg}`);
    job.moveToFailed({ message: errorMsg });
    throw err;
  }
};

const createIntuitProcessor = async (job: Job) => {
  const intuitService = await createIntuitService(config.intuit);

  return {
    process: async (type: string, resources: SalesforceClosedWonResource[]) => {
      // Log to job queue if available

      job.log(`Starting processing of ${resources.length} resources`);

      const customers = await processCustomerHierarchy(intuitService, resources, job).catch((err) => {
        job.log(`Error processing customer hierarchy: ${JSON.stringify(err, null, 2)}`);
        job.moveToFailed({ message: `Error processing customer hierarchy: ${JSON.stringify(err, null, 2)}` });
      });

      if (!customers) {
        return;
      }

      job.log(`Successfully processed ${customers?.length || 0} customers`);

      const estimate = await processEstimate(intuitService, customers.at(-1), resources.at(-1), job).catch((err) => {
        job.log(`Error creating estimate: ${JSON.stringify(err, null, 2)}`);
        job.moveToFailed({ message: `Error creating estimate: ${JSON.stringify(err, null, 2)}` });
      });

      if (!estimate) {
        return;
      }

      job.log(`Successfully created estimate with ID: ${estimate.Id}`);

      const salesforce = await SalesforceService(config.salesforce);
      const { opportunityId, Id } = estimate;
      const result = await salesforce.mutation
        .updateOpportunity({
          Id: opportunityId,
          AVSFQB__QB_Error__c: estimate.productError
            ? `Error! Please double check Products in Quickbooks Estimate: txnId=` + estimate.Id
            : "Estimate Created by Engineering",
          ...(!isProduction && { QBO_Oppty_ID_Staging__c: estimate.Id }),
          //* Only mutate this field in production
          ...(isProduction && { AVSFQB__Quickbooks_Id__c: estimate.Id }),
        })
        .catch((err) => {
          job.log(`Error updating Salesforce opportunity: ${JSON.stringify(err, null, 2)}`);
          job.moveToFailed({ message: `Error updating Salesforce opportunity: ${JSON.stringify(err, null, 2)}` });
        });

      if (!result) {
        return;
      }

      job.log(`Successfully updated Salesforce opportunity: ${JSON.stringify(result, null, 2)}`);
      logger.info(`Opportunity updated: ${JSON.stringify(result, null, 2)}`);

      job.log(`Successfully updated Salesforce opportunity: ${JSON.stringify(result, null, 2)}`);

      logger.info("Completed processing resources");

      job.moveToCompleted("Successfully completed processing all resources");
    },
  };
};

export default createIntuitProcessor;
