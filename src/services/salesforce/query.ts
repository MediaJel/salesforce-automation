import { Connection } from "jsforce";
import {
  Contact,
  Product,
  Account,
  QueryAttribute,
  Logger,
} from "@/utils/types";
import { match } from "@/utils/utils";
interface ProductsByOpportunityIdParams {
  id: string;
  where?: { [key in keyof Partial<Product>]: string };
}

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
    productsByOpportunityId: async ({
      id,
      where,
    }: ProductsByOpportunityIdParams): Promise<Product[]> => {
      const soql = `SELECT Id, Name, Family FROM Product2 WHERE Id IN (SELECT Product2Id FROM OpportunityLineItem WHERE OpportunityId = '${id}')`;
      const products = await query<Product>(client, soql).catch((err) => {
        logger.error({ message: "Products by Opportunity ID error", err });
      });

      if (!where || !products) return [];

      const matches = products?.filter((product) => match(product, where));

      logger.debug(`${matches.length} Products from Opportunity: ${id}`);

      return matches;
    },

    contactById: async (id: string): Promise<Contact> => {
      const soql = `SELECT Id, Name, Email, Phone FROM Contact WHERE Id = '${id}'`;

      const [contact] = await query<Contact>(client, soql).catch((err) => {
        logger.error({ message: "Products by Opportunity ID error", err });
        return [];
      });

      if (!contact.Email) {
        logger.warn(`No Contact "Email" Found`);
        contact.Email = "pacholo@mediajel.com";
      }

      !contact.Email && logger.debug(`Found contact ${contact.Name}`);
      return contact;
    },

    accountById: async (id: string): Promise<Account> => {
      const soql = `SELECT Id, Name, ParentId  FROM Account WHERE Id = '${id}'`;
      const [account] = await query<Account>(client, soql).catch((err) => {
        logger.error({ message: "Products by Opportunity ID error", err });
        return [];
      });

      logger.debug(`Found account ${account?.Name}`);
      return account;
    },
  };
};

export default createSalesforceQueries;
