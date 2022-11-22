import createSalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

import {
  SalesforceStreamSubscriptionParams,
  SalesforceChannel,
  Opportunity,
  SalesforceService,
  Config,
} from "@/utils/types";

const createApp = (config: Config) => {
  const graphql = createGraphqlService(config.graphql);
  const logger = createLogger("App");

  return {
    async setupSubscription(): Promise<void> {
      createSalesforceService(config.salesforce, (client, svc) => {
        logger.info("Subscribing to Salesforce Streaming API");

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

      if (products.length === 0) return logger.info("No Display products");
      const contact = await svc.query.contactById(opp.Deal_Signatory__c);

      const account = await svc.query.accountById(opp.AccountId);

      // const createdOrg = await graphql.createOrg({
      //   name: account.Name,
      //   description: `salesforce: ${account.Id}`,
      // });

      // const createdUser = await graphql.createUser({
      //   email: contact.Email,
      //   name: `salesforce: ${contact.Name}`,
      //   phone: "+11234567894", // Always add a +1 for some reason
      //   username: contact.Email,
      //   orgId: createdOrg.id,
      // });

      //! TODOS
      //! [x] - Validate if Org Exists via querying by Salesforce ID
      //! [x] - Create User and match to Org, and match to Org
      //! [] - How to delete user?
      //! [] - NEED TO UPDATE SALESFORCE ID OF ORG AND USER
    },
  };
};

export default createApp;
