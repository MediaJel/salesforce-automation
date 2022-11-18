import { ConnectionOptions } from "jsforce";
import SalesforceService from "@/services/salesforce";
import {
  SalesforceStreamSubscriptionParams,
  SalesforceChannel,
  Opportunity,
} from "@/services/salesforce/types";

const createApp = (options: ConnectionOptions) => {
  return {
    async run() {
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

          //! TODO: Create User and match to Org, and match to Org
          //! TODO: Create Campaign and match to Org
        });
      });
    },
  };
};

export default createApp;
