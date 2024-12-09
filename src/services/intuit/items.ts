import { QuickbooksFindItemsInput, QuickbooksFindItemsResponse } from '@/utils/types';

//* Client is any since node-quickbooks don't got types
const createIntuitItemsService = (client: any) => {
  return {
    /**
     * {@link https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/item}
     * @param input
     * @returns
     */
    find: async (input: QuickbooksFindItemsInput[]): Promise<QuickbooksFindItemsResponse | null> => {
      return new Promise((resolve, reject) => {
        console.log('Find Items Input: ', input);
        client.findItems(input, (err: any, items: any) => {
          if (err) {
            console.error('Error finding items: ', JSON.stringify(err, null, 2), "Input: ", input);
            reject(null);
          }
          resolve(items);
        });
      });
    },
  };
};

export default createIntuitItemsService;
