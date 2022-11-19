import createSalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";

import { ConnectionOptions } from "jsforce";
import {
  SalesforceStreamSubscriptionParams,
  SalesforceChannel,
  Opportunity,
  SalesforceService,
} from "@/utils/types";

const createApp = (options: ConnectionOptions) => {
  const graphql = createGraphqlService();

  return {
    async run(): Promise<void> {
      createSalesforceService(options, (client, svc) => {
        console.log("Listening for Salesforce Opportunities...");

        const subOptions: SalesforceStreamSubscriptionParams = {
          channel: SalesforceChannel.OpportunitiesUpdateV2,
        };

        svc.stream.subscribe<Opportunity>(subOptions, async (opp) => {
          console.log(opp);
          this.subscriptionHandler(opp, svc);
        });
      });
    },

    async subscriptionHandler(opp: Opportunity, svc: SalesforceService) {
      const products = await svc.query.productsByOpportunityId({
        id: opp.Id,
        where: {
          Family: "Display Advertising",
          Name: "Standard Display Awareness",
        },
      });

      if (products.length === 0) return console.log("No Display product");
      const contact = await svc.query.contactById(opp.Deal_Signatory__c);

      const account = await svc.query.accountById(opp.AccountId);

      console.log(account);

      // const createdOrg = await graphql.createOrg({
      //   name: account.Name,
      //   description: `salesforce: ${account.Id}`,
      // });

      // console.log(createdOrg);

      //! TODOS
      //! [] - Validate if Org Exists via querying by Salesforce ID
      //! [] - Add additional fields to orgs
      //! TODO: Create User and match to Org, and match to Org
      //! TODO: Create Campaign and match to Org
    },
  };
};

export default createApp;
