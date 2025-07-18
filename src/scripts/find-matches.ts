import createSalesforceService from "../services/salesforce/service";
import config from "../config";
import { Account, QueryAttribute } from "@/utils/types";
import createIntuitService, { IntuitService } from "@/services/intuit/service";
import createLogger from "@/utils/logger";
import { json2csv } from "json-2-csv";
import fs from "fs";
import { retryWithBackoff } from "@/utils/retry-with-backoff";
import { processBatch } from "@/utils/process-batch";
import { sleep } from "@/utils/utils";
import { ProgressIndicator } from "@/utils/progress-indicator";

interface GetAccountsWithNoQuickbooksIdReturnType extends QueryAttribute {
  Id: string;
  Name: string;
  AVSFQB__Quickbooks_Id__c: string;
}

const logger = createLogger("Find Salesforce Matches");

const matchSalesforceAccountWithQuickbooksCustomer = async (
  salesforceAccount: GetAccountsWithNoQuickbooksIdReturnType,
  quickbooks: IntuitService
) => {
  return await retryWithBackoff(
    async () => {
      const quickbooksCustomers = await quickbooks.customers.find([
        {
          field: "DisplayName",
          value: salesforceAccount.Name,
        },
      ]);

      if (!quickbooksCustomers?.QueryResponse?.Customer?.length) {
        logger.warn(`No Quickbooks customer found for Salesforce account: ${salesforceAccount.Name}`);
        return {
          withMatch: false,
          error: null,
          salesforceId: salesforceAccount.Id,
          salesforceName: salesforceAccount.Name,
          quickbooksId: null,
          quickbooksName: null,
        };
      }

      if (quickbooksCustomers.QueryResponse.Customer.length > 1) {
        logger.warn(`Multiple Quickbooks customers found for Salesforce account: ${salesforceAccount.Name}`);
        return {
          withMatch: false,
          error: `Multiple Quickbooks customers found for Salesforce account: ${salesforceAccount.Name}, Please review`,
          salesforceId: salesforceAccount.Id,
          salesforceName: salesforceAccount.Name,
          quickbooksId: quickbooksCustomers.QueryResponse.Customer.map((customer) => customer.Id).join(", "),
          quickbooksName: quickbooksCustomers.QueryResponse.Customer.map((customer) => customer.DisplayName).join(", "),
        };
      }

      logger.info(
        `Found Quickbooks customer: ${quickbooksCustomers.QueryResponse.Customer[0].DisplayName} for Salesforce account: ${salesforceAccount.Name}`
      );
      return {
        withMatch: true,
        error: null,
        salesforceId: salesforceAccount.Id,
        salesforceName: salesforceAccount.Name,
        quickbooksId: quickbooksCustomers.QueryResponse.Customer[0].Id,
        quickbooksName: quickbooksCustomers.QueryResponse.Customer[0].DisplayName,
      };
    },
    3,
    1000
  ); // 3 retries, starting with 1 second delay
};

const main = async () => {
  const salesforce = await createSalesforceService(config.salesforce);
  const quickbooks = await createIntuitService(config.intuit);

  //! Stage 0: Jake's request

  // const accountsWithQuickbooksId = await salesforce.query.soql<GetAccountsWithNoQuickbooksIdReturnType>(
  //   "SELECT Id, Name, AVSFQB__Quickbooks_Id__c FROM Account WHERE AVSFQB__Quickbooks_Id__c != null"
  // );

  // const accountsWithQuickbooksIdCsv = json2csv(
  //   accountsWithQuickbooksId.map((account) => ({
  //     salesforceId: account.Id,
  //     salesforceName: account.Name,
  //     quickbooksId: account.AVSFQB__Quickbooks_Id__c,
  //   }))
  // );
  // fs.writeFileSync("accounts-with-quickbooks-id.csv", accountsWithQuickbooksIdCsv);

  //! Stage 1: Find accounts with no Quickbooks ID
  const accountsWithNoQuickbooksId = await salesforce.query.soql<GetAccountsWithNoQuickbooksIdReturnType>(
    "SELECT Id, Name, AVSFQB__Quickbooks_Id__c FROM Account WHERE AVSFQB__Quickbooks_Id__c = null"
  );

  console.log(`Found ${accountsWithNoQuickbooksId.length} accounts with no Quickbooks ID`);

  const results = await processBatch(
    accountsWithNoQuickbooksId,
    (account) => matchSalesforceAccountWithQuickbooksCustomer(account, quickbooks),
    10, // Process 10 accounts at a time
    1000 // Wait 1 second between batches
  );

  // Sorts the result so matches are at the top
  const sorted = results.sort((a, b) => Number(b.withMatch) - Number(a.withMatch));
  const csv = json2csv(sorted);

  fs.writeFileSync("matches.csv", csv);

  // //! Stage 2: Update the accounts with the Quickbooks ID
  const matchedAccounts = sorted.filter((result) => result.withMatch);

  if (matchedAccounts.length === 0) {
    console.log("No matched accounts to update.");
    return;
  }

  const updateProgress = new ProgressIndicator(matchedAccounts.length, {
    title: "Stage 2: Updating accounts with Quickbooks IDs",
    showProgressBar: true,
    showTimeEstimates: true,
    showPercentage: true,
    showCount: true,
  });

  for (const account of matchedAccounts) {
    try {
      await sleep(500);

      await salesforce.mutation.updateAccount({
        Id: account.salesforceId,
        AVSFQB__Quickbooks_Id__c: account.quickbooksId,
      });

      updateProgress.success(account.salesforceName);
    } catch (error) {
      updateProgress.failure(account.salesforceName);
      logger.error({ message: `Failed to update account`, error, account });
    }
  }

  updateProgress.complete();
};

main().then(() => {
  console.log("Done");
  process.exit(0);
});
