import createSalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";
import createLimiter from "@/utils/limiter";

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
        logger.info("Subscribing to Salesforce Opportunity Pushtopic");

        const subOptions: SalesforceStreamSubscriptionParams = {
          channel: SalesforceChannel.OpportunitiesUpdate,
          replayId: -1,
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

      if (products.length === 0) return logger.warn("No Display products");

      const account = await svc.query.accountById(opp.AccountId);

      const org = await graphql.findOrCreateOrg({
        salesforceId: account.Id,
        name: account.Name,
        description: `salesforce: ${account.Id}`,
      });

      if (!org) return logger.warn("No Org Found/Created");
      logger.info(`Found/Created Org: ${org.id}`);

      const contact = await svc.query.contactById(opp.Deal_Signatory__c);

      const username = contact.Name.replace(/\s/g, "");

      const user = await graphql.findOrCreateUser({
        salesforceId: contact.Id,
        email: contact.Email,
        name: `salesforce: ${contact.Name}`,
        phone: "+11234567894", // Always add a +1 for some reason
        username,
        orgId: org.id,
      });

      if (!user) return logger.warn("No User Found/Created Created");
      logger.info(`Found/Created User: ${user.id}`);
    },
  };
};

export default createApp;
