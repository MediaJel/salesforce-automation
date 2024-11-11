import {
    QuickbooksCreateCustomerInput, QuickbooksCustomer, QuickbooksFindCustomersInput,
    QuickbooksFindCustomersResponse
} from '@/utils/types';

//* Client is any since node-quickbooks don't got types
const createIntuitCustomersService = (client: any) => {
  return {
    create: async (input: Partial<QuickbooksCreateCustomerInput>): Promise<{ Customer: QuickbooksCustomer }> => {
      return new Promise((resolve, reject) => {
        client.createCustomer(input, (err: any, customer: any) => {
          if (err) reject(err);
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
  };
};

export default createIntuitCustomersService;
