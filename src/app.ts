import SalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";

import { ConnectionOptions } from "jsforce";
import {
  SalesforceStreamSubscriptionParams,
  SalesforceChannel,
  Opportunity,
} from "@/utils/types";

const createApp = (options: ConnectionOptions) => {
  const graphql = createGraphqlService();

  return {
    async testGraphQL() {
      const graphql = createGraphqlService();
      const orgs = await graphql.fetchOrgs();
      console.log(orgs);
    },
    async run(): Promise<void> {
      SalesforceService(options, (client, svc) => {
        console.log("Listening for Salesforce Opportunities...");

        const subOptions: SalesforceStreamSubscriptionParams = {
          channel: SalesforceChannel.OpportunitiesUpdate,
        };

        svc.stream.subscribe<Opportunity>(subOptions, async (opp) => {
          const products = await svc.query.productsByOpportunityId({
            id: opp.Id,
            matches: {
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
        });
      });
    },
  };
};

export default createApp;
