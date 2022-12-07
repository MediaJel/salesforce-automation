import createSalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

import { format, isProduction } from "@/utils/utils";
import {
  Opportunity,
  SalesforceService,
  Config,
  FindOrCreateOrgParams,
  Account,
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

          const org = await this.ensureOrg(svc, account);

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
          throw err;
        });
    },

    async accountFromOpportunity(opp: Opportunity, svc: SalesforceService) {
      return await svc.query.accountById(opp.AccountId).catch((err) => {
        logger.error("Error running accountFromOpportunity", err);
        throw err;
      });
    },

    async ensureOrg(svc: SalesforceService, account: Account) {
      //! If no parent, create Child org
      if (!account.ParentId) {
        logger.debug(`No Parent Org for ${account.Name} exists`);
        const org = await graphql.findOrCreateOrg({
          salesforceId: account.Id,
          name: account.Name,
          description: `salesforce: ${account.Id}`,
          salesforceParentId: account.ParentId,
        });

        if (!org) return logger.warn("No Org Found/Created Created");
        return org;
      }

      logger.debug(`Verifying Parent Org: ${account.ParentId} exists`);

      const existingParent = await graphql.queries.getOrgBySalesforceId({
        salesforceId: account.ParentId,
      });

      //! If parent already exists create child only
      if (existingParent) {
        logger.info(`Parent Org: ${existingParent.name} exists`);

        logger.debug(`Creating Child Org: ${account.Name}`);

        const childOrg = await graphql.findOrCreateOrg({
          salesforceId: account.Id,
          name: account.Name,
          description: `salesforce: ${account.Id}`,
          salesforceParentId: existingParent.id,
        });

        if (!childOrg) return logger.warn("No Child Org Found/Created Created");

        logger.info(`Created Child Org: ${childOrg.name}`);
        return childOrg;
      }

      logger.debug(`Parent: ${account.ParentId} does not exist, creating...`);

      //! If parent doesn't exist, create parent and child
      const parentAccount = await svc.query.accountById(account.ParentId);

      const parentOrg = await graphql.findOrCreateOrg({
        name: parentAccount.Name,
        salesforceId: parentAccount.Id,
        description: `salesforce: ${parentAccount.Id}`,
        salesforceParentId: parentAccount.ParentId,
      });

      if (!parentOrg) return logger.warn("No Parent Org Found/Created Created");

      logger.info(`Created Parent Org: ${parentOrg.name}`);

      const childOrg = await graphql.findOrCreateOrg({
        salesforceId: account.Id,
        name: account.Name,
        description: `salesforce: ${account.Id}`,
        salesforceParentId: parentOrg.id,
      });

      if (!childOrg) return logger.warn("No Child Org Found/Created Created");

      logger.info(`Created Child Org: ${childOrg.name}`);

      return childOrg;
    },
  };
};

export default createApp;
