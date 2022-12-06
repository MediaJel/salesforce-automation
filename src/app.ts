import createSalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

import { format, isProduction } from "@/utils/utils";
import {
  Opportunity,
  SalesforceService,
  Config,
  FindOrCreateOrgParams,
} from "@/utils/types";

const logger = createLogger("App");

const createApp = (config: Config) => {
  const { app } = config;
  const graphql = createGraphqlService(config.graphql);

  return {
    async setupSubscription(): Promise<void> {
      createSalesforceService(config.salesforce, (client, svc) => {
        logger.info("Subscribing to Salesforce Opportunity Pushtopic");

        svc.stream.subscribe<Opportunity>(app.subscription(), async (opp) => {
          if (!opp?.Deal_Signatory__c) return logger.warn("No Deal Signatory");

          const products = await this.productsFromOpportunity(opp, svc);
          if (!products) return logger.warn("No Display Products");

          const account = await this.accountFromOpportunity(opp, svc);
          if (!account) return logger.warn("No Account");

          if (account?.ParentId) {
            await this.ensureParentExists(opp, svc, account.ParentId);
          }
          const org = await graphql.findOrCreateOrg({
            salesforceId: account.Id,
            name: account.Name,
            description: `salesforce: ${account.Id}`,
            salesforceParentId: account.ParentId, // !Should be Org ID instead of Salesforce
          });
          if (!org) return logger.warn("No Org Found/Created");
          logger.info(`Found/Created Org: ${org.id}`);

          const contact = await svc.query.contactById(opp.Deal_Signatory__c);
          if (!contact?.Name) return logger.warn(`No Contact "Name" Found`);

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
        });
      });
    },

    async productsFromOpportunity(opp: Opportunity, svc: SalesforceService) {
      return await svc.query
        .productsByOpportunityId({
          id: opp.Id,
          where: {
            Family: "Display Advertising",
            Name: "*Standard Display Awareness",
          },
        })
        .catch((err) => {
          logger.error("Error running productsFromOpportunity", err);
        });
    },

    async accountFromOpportunity(opp: Opportunity, svc: SalesforceService) {
      return await svc.query.accountById(opp.AccountId).catch((err) => {
        logger.error("Error running accountFromOpportunity", err);
      });
    },

    async ensureParentExists(
      opp: Opportunity,
      svc: SalesforceService,
      parentId: string
    ) {
      // Verify if parent Org exists in the database
      logger.info(`Verifying Parent Org: ${parentId} exists`);
      const isParentExists = graphql.queries.getOrgBySalesforceId({
        salesforceId: parentId,
      });

      if (isParentExists) return logger.info(`Parent Org: ${parentId} exists`);

      logger.info(`Creating Parent Org: ${parentId}`);
      const parentAccount = await svc.query.accountById(parentId);

      if (!parentAccount) return logger.warn("No Parent Account Found");
      await graphql.findOrCreateOrg({
        name: parentAccount.Name,
        salesforceId: parentAccount.Id,
        description: `salesforce: ${parentAccount.Id}`,
        salesforceParentId: parentAccount.ParentId,
      });

      return await this.ensureParentExists(opp, svc, parentAccount.ParentId);
    },
  };
};

export default createApp;
