import createSalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

import { format, isProduction } from "@/utils/utils";
import { Opportunity, SalesforceService, Config } from "@/utils/types";

const logger = createLogger("App");

const createApp = (config: Config) => {
  const { app } = config;
  const graphql = createGraphqlService(config.graphql);

  return {
    async setupSubscription(): Promise<void> {
      createSalesforceService(config.salesforce, (client, svc) => {
        logger.info("Subscribing to Salesforce Opportunity Pushtopic");

        svc.stream.subscribe<Opportunity>(app.subscription(), async (opp) => {
          this.testSubscription(opp, svc);
          // this.subscriptionHandler(opp, svc);
        });
      });
    },

    async testSubscription(opp: Opportunity, svc: SalesforceService) {},

    async subscriptionHandler(opp: Opportunity, svc: SalesforceService) {
      if (!opp?.Deal_Signatory__c) return logger.warn("No Deal Signatory");

      const products = await svc.query.productsByOpportunityId({
        id: opp.Id,
        where: {
          Family: "Display Advertising",
          Name: "*Standard Display Awareness",
        },
      });

      if (products.length === 0) return logger.warn("No Display products");

      const account = await svc.query.accountById(opp.AccountId);
      console.log(account);

      if (!account) return logger.warn("No Account");

      const org = await graphql.findOrCreateOrg({
        salesforceId: account.Id,
        name: account.Name,
        description: `salesforce: ${account.Id}`,
      });

      if (!org) return logger.warn("No Org Found/Created");
      logger.info(`Found/Created Org: ${org.id}`);

      const contact = await svc.query.contactById(opp.Deal_Signatory__c);
      if (!contact?.Name) return logger.warn(`No Contact "Name" Found`);

      console.log({
        salesforceId: contact.Id,
        email: isProduction ? contact.Email : "pacholo@mediajel.com",
        name: `salesforce: ${format(contact.Name)}`,
        phone: "+11234567894", // Always add a +1 for some reason
        username: format(contact.Name),
        orgId: org.id,
      });
      const user = await graphql.findOrCreateUser({
        salesforceId: contact.Id,
        email: isProduction ? contact.Email : "pacholo@mediajel.com",
        name: `salesforce: ${format(contact.Name)}`,
        phone: "+11234567894", // Always add a +1 for some reason
        username: format(contact.Name),
        orgId: org.id,
      });

      if (!user) return logger.warn("No User Found/Created Created");
      logger.info(`Found/Created User: ${user.id}`);
    },
  };
};

export default createApp;
