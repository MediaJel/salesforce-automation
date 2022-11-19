import { Connection } from "jsforce";
import { Contact, Product, Account, QueryAttribute } from "@/utils/types";
import { match } from "@/utils/utils";
interface ProductsByOpportunityIdParams {
  id: string;
  where?: { [key in keyof Partial<Product>]: string };
}

const query = <T extends QueryAttribute>(client: Connection, query: string) => {
  return new Promise<T[]>((resolve, reject) => {
    client.query(query, {}, (err, result) => {
      if (err) reject("Salesforce Query error: " + err);

      resolve(result.records as T[]);
    });
  });
};

const createSalesforceQueries = (client: Connection) => {
  return {
    productsByOpportunityId: async ({
      id,
      where,
    }: ProductsByOpportunityIdParams): Promise<Product[]> => {
      const soql = `SELECT Id, Name, Family FROM Product2 WHERE Id IN (SELECT Product2Id FROM OpportunityLineItem WHERE OpportunityId = '${id}')`;
      const products = await query<Product>(client, soql);

      if (!where) return products;

      return products.filter((product) => match(product, where));
    },

    contactById: async (id: string): Promise<Contact> => {
      const soql = `SELECT Id, Name, Email, Phone FROM Contact WHERE Id = '${id}'`;
      const [contact] = await query<Contact>(client, soql);
      return contact;
    },

    accountById: async (id: string): Promise<Account> => {
      const soql = `SELECT Id, Name, ParentId  FROM Account WHERE Id = '${id}'`;
      const [account] = await query<Account>(client, soql);
      return account;
    },
  };
};

export default createSalesforceQueries;
