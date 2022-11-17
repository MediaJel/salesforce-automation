import { Connection } from "jsforce";
import { Contact, Product, Account, QueryAttribute } from "./types";

interface ProductsByOpportunityIdParams {
  id: string;
  match?: { [key in keyof Partial<Product>]: string };
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
      match,
    }: ProductsByOpportunityIdParams): Promise<Product[]> => {
      const soql = `SELECT Id, Name, Family FROM Product2 WHERE Id IN (SELECT Product2Id FROM OpportunityLineItem WHERE OpportunityId = '${id}')`;
      const products = await query<Product>(client, soql);

      if (!match) return products;

      const matched = products.filter(product => {
        return Object.keys(match).some(key => {
          if (typeof key === "string") {
            const k = product[key] as string;
            return k.includes(match[key]);
          }
          return product[key] === match[key];
        });
      });
      return matched;
    },

    contactById: async (id: string): Promise<Contact> => {
      const soql = `SELECT Id, Name, Email FROM Contact WHERE Id = '${id}'`;
      const [contact] = await query<Contact>(client, soql);
      return contact;
    },

    accountById: async (id: string): Promise<Account> => {
      const soql = `SELECT Id, Name FROM Account WHERE Id = '${id}'`;
      const [account] = await query<Account>(client, soql);
      return account;
    },
  };
};

export default createSalesforceQueries;
