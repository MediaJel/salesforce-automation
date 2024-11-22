import axios from "axios";

import {
  QuickbooksCreateCustomerInput,
  QuickbooksCustomer,
  QuickbooksFindCustomersInput,
  QuickbooksFindCustomersResponse,
} from "@/utils/types";

//* Client is any since node-quickbooks don't got types
const createIntuitCustomersService = (client: any) => {
  return {
    create: async (input: Partial<QuickbooksCreateCustomerInput>): Promise<QuickbooksCustomer> => {
      return new Promise((resolve, reject) => {
        client.createCustomer(input, (err: any, customer: any) => {
          if (err) reject(err);
          console.log(`Create Customer input: ${JSON.stringify(input, null, 2)}`);
          resolve(customer);
        });
      });
    },
    /**
     * {@link https://www.npmjs.com/package/node-quickbooks#findcustomerscriteria-callback}
     * {@link https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/customer#query-a-customer}
     * @param input
     * @returns
     */

    find: async (input: QuickbooksFindCustomersInput[]): Promise<QuickbooksFindCustomersResponse> => {
      return new Promise((resolve, reject) => {
        client.findCustomers(input, (err: any, customers: any) => {
          if (err) reject(err);
          resolve(customers);
        });
      });
    },

    // find2: async (input: QuickbooksFindCustomersInput): Promise<QuickbooksFindCustomersResponse> => {
    //   const token = client.getToken();
    //   const resultaxios
    // },
    get: async (id: string): Promise<QuickbooksCustomer> => {
      return new Promise((resolve, reject) => {
        client.getCustomer(id, (err: any, customer: any) => {
          if (err) {
            console.log(`Customer not found`, err);
            resolve(null);
          }
          resolve(customer);
        });
      });
    },
  };
};

export default createIntuitCustomersService;
