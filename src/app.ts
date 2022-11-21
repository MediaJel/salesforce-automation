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
    async setupSubscription(): Promise<void> {
      createSalesforceService(options, (client, svc) => {
        console.log("Listening for Salesforce Opportunities...");

        const subOptions: SalesforceStreamSubscriptionParams = {
          channel: SalesforceChannel.OpportunitiesUpdate,
        };

        svc.stream.subscribe<Opportunity>(subOptions, async (opp) => {
          this.subscriptionHandler(opp, svc);
        });
      });
    },

    async subscriptionHandler(opp: Opportunity, svc: SalesforceService) {
      const products = await svc.query.productsByOpportunityId({
        id: opp.Id,
        where: {
          Family: "Display Advertising",
          Name: "*Standard Display Awareness",
        },
      });

      if (products.length === 0) return console.log("No Display product");
      const contact = await svc.query.contactById(opp.Deal_Signatory__c);

      const account = await svc.query.accountById(opp.AccountId);

      const createdOrg = await graphql.createOrg({
        name: account.Name,
        description: `salesforce: ${account.Id}`,
      });

      console.log("🚀 Created Org", createdOrg.id);

      const createdUser = await graphql.createUser({
        email: contact.Email,
        name: `salesforce: ${contact.Name}`,
        phone: "+11234567894", // Always add a +1 for some reason
        username: contact.Email,
        orgId: createdOrg.id,
      });

      console.log("🚀 Created User", createdUser.id);

      //! TODOS
      //! [x] - Validate if Org Exists via querying by Salesforce ID
      //! [x] - Create User and match to Org, and match to Org
      //! [] - How to delete user?
      //! [] - NEED TO UPDATE SALESFORCE ID OF ORG AND USER
    },
  };
};

export default createApp;
