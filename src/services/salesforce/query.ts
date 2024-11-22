import { Connection } from "jsforce";

import {
  Account,
  Contact,
  Logger,
  OpportunityLineItem,
  Product,
  ProductsByOpportunityIdParams,
  QueryAttribute,
} from "@/utils/types";
import { match } from "@/utils/utils";

const query = <T extends QueryAttribute>(client: Connection, query: string) => {
  return new Promise<T[]>((resolve, reject) => {
    client.query(query, {}, (err, result) => {
      if (err) reject(err);

      result.records.length === 0 && reject("No records found");
      resolve(result.records as T[]);
    });
  });
};

const createSalesforceQueries = (client: Connection, logger: Logger) => {
  return {
    // TODO: Always blank
    opportunityLineItemByOpportunityId: async (id: string): Promise<OpportunityLineItem[]> => {
      const soql = `SELECT Id,Name, Quantity, ServiceDate, UnitPrice, TotalPrice, Description, AVSFQB__Quickbooks_Id__c FROM OpportunityLineItem WHERE OpportunityId = '${id}'`;

      const opportunityLineItems = await query<OpportunityLineItem>(client, soql).catch((err) => {
        logger.error({ message: "Opportunity Line Item by ID error", err });
        return [];
      });

      return opportunityLineItems;
    },
    productsByOpportunityId: async ({ id, where: condition }: ProductsByOpportunityIdParams): Promise<Product[]> => {
      const soql = `SELECT Id, Name, Family, Description, ProductCode, AVSFQB__Quickbooks_Id__c FROM Product2 WHERE Id IN (SELECT Product2Id FROM OpportunityLineItem WHERE OpportunityId = '${id}')`;
      const products = await query<Product>(client, soql).catch((err) => {
        logger.error({ message: "Products by Opportunity ID error", err });
      });

      if (!products) return [];
      if (!condition) return products;

      const matches = products?.filter((product) => match(product, condition));

      logger.debug(`${matches.length} ${condition.Family} Products from Opportunity: ${id}`);

      return matches;
    },

    contactById: async (id: string): Promise<Contact> => {
      const soql = `SELECT Id, Name, Email, Phone, AVSFQB__Quickbooks_Id__c FROM Contact WHERE Id = '${id}'`;

      const [contact] = await query<Contact>(client, soql).catch((err) => {
        logger.error({ message: "Contact by ID error", err });
        return null;
      });

      return contact;
    },

    accountById: async (id: string): Promise<Account> => {
      if (!id) return;
      logger.info(`Searching for account with ID: ${id}`);
      const soql = `SELECT Id, Name, ParentId, ShippingCity, ShippingStreet, ShippingPostalCode, ShippingLatitude, ShippingLongitude, BillingCountry, BillingCity, BillingStreet, BillingPostalCode, BillingLatitude, BillingLongitude, AVSFQB__Quickbooks_Id__c  FROM Account WHERE Id = '${id}'`;
      const [account] = await query<Account>(client, soql).catch((err) => {
        logger.error({ message: "Account By ID error", err });
        return [];
      });

      logger.debug(`Found account ${account?.Name}`);
      return account;
    },
  };
};

export default createSalesforceQueries;
