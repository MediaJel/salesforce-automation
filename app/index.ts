import { ConnectionOptions } from "jsforce";
import SalesforceService from "@/services/salesforce";
import {
  SalesforceStreamSubscriptionParams,
  SalesforceChannel,
  Opportunity,
} from "@/services/salesforce/types";

const options: ConnectionOptions = {
  oauth2: {
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    redirectUri: process.env.SALESFORCE_REDIRECT_URI,
  },
  accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
  refreshToken: process.env.SALESFORCE_REFRESH_TOKEN,
  instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
  version: "56.0",
};

const main = async () => {
  SalesforceService(options, (client, svc) => {
    console.log("Listening for Salesforce Opportunities...");

    const subOptions: SalesforceStreamSubscriptionParams = {
      channel: SalesforceChannel.OpportunitiesUpdate,
    };

    svc.stream.subscribe<Opportunity>(subOptions, async (opp) => {
      const products = await svc.query.productsByOpportunityId({
        id: opp.Id,
        match: {
          Family: "Display Advertising",
          Name: "Standard Display Awareness",
        },
      });

      if (products.length === 0) return console.log("No Display product");
      const contact = await svc.query.contactById(opp.Deal_Signatory__c);
      const account = await svc.query.accountById(opp.AccountId);
      console.log({
        products,
        contact,
        account,
      });
      // const isExistingOrg = await validateUniqueOrg(account.Name);

      // if (isExistingOrg) {
      //   return console.log(`Org ${account.Name} already exists`);
      // }
      // const createdOrg = await createOrgFromSalesforce(account);
      // console.log("Created Org: ", createdOrg);

      //! TODO: Create User and match to Org, and match to Org
      //! TODO: Create Campaign and match to Org
    });
  });
};

main();
