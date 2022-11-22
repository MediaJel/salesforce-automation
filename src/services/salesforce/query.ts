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
      logger.info(`Querying for Products for Opportunity: ${id}`);
      const soql = `SELECT Id, Name, Family FROM Product2 WHERE Id IN (SELECT Product2Id FROM OpportunityLineItem WHERE OpportunityId = '${id}')`;
      const products = await query<Product>(client, soql).catch((err) => {
        throw new Error("Querying products", { cause: err });
      });

      if (!where) return products;

      const matches = products.filter((product) => match(product, where));

      logger.success(`Found ${matches.length} products`);
      return matches;
    },

    contactById: async (id: string): Promise<Contact> => {
      logger.info(`Querying Contact: ${id}`);
      const soql = `SELECT Id, Name, Email, Phone FROM Contact WHERE Id = '${id}'`;
      const [contact] = await query<Contact>(client, soql).catch((err) => {
        throw new Error("Querying contact", { cause: err });
      });
      logger.success(`Found contact ${contact.Name}`);
      return contact;
    },

    accountById: async (id: string): Promise<Account> => {
      logger.info(`Querying Account: ${id}`);
      const soql = `SELECT Id, Name, ParentId  FROM Account WHERE Id = '${id}'`;
      const [account] = await query<Account>(client, soql).catch((err) => {
        throw new Error("Querying account", { cause: err });
      });

      logger.success(`Found account ${account.Name}`);
      return account;
    },
  };
};

export default createSalesforceQueries;
