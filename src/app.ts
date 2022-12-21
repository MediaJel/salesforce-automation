import createSalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

import { format, isProduction } from "@/utils/utils";
import { DEFAULT_EMAIL, DEFAULT_ORG } from "@/constants";
import {
  Opportunity,
  SalesforceService,
  Config,
  Account,
  Org,
} from "@/utils/types";

const logger = createLogger("App");

const createApp = (config: Config) => {
  const { app } = config;
  const graphql = createGraphqlService(config.graphql);

  return {
    async setupSubscription(): Promise<void> {
      createSalesforceService(config.salesforce, (client, svc) => {
        logger.info("Subscribing to Salesforce Opportunity Pushtopic");

        svc.stream.subscribe<Opportunity>(
          app.subscription(),
          async (opp): Promise<void> => {
            if (!opp?.Deal_Signatory__c) {
              return logger.warn("No Deal Signatory");
            }

            const products = await svc.query.productsByOpportunityId({
              id: opp.Id,
              where: {
                Family: "Display Advertising",
                Name: "*Standard Display Awareness",
              },
            });
            if (!products) return logger.warn("No Display Products");

            const account = await svc.query.accountById(opp.AccountId);
            if (!account) return logger.warn("No Account");

            const org = await this.ensureOrg(svc, account);
            if (!org) return logger.warn("No Org Found/Created");

            logger.info(`Found/Created Org: ${org.name}`);

            const contact = await svc.query.contactById(opp.Deal_Signatory__c);
            if (!contact?.Name) return logger.warn(`No Contact "Name" Found`);

            const user = await graphql.findOrCreateUser({
              salesforceId: contact.Id,
              email: isProduction ? contact.Email : DEFAULT_EMAIL,
              name: `salesforce: ${format(contact.Name)}`,
              phone: "+11234567894", // Always add a +1
              username: format(contact.Name),
              orgId: org.id,
            });
            if (!user) return logger.warn("No User Found/Created Created");

            logger.info(`Found/Created User: ${user.username}`);
          }
        );
      });
    },

    async ensureOrg(svc: SalesforceService, account: Account): Promise<Org> {
      // If no parent, return child org org
      if (!account.ParentId) {
        return await graphql.findOrCreateOrg({
          salesforceId: account.Id,
          name: account.Name,
          description: `salesforce: ${account.Id}`,
          parentOrgId: DEFAULT_ORG,
        });
      }

      let parentOrg: Org | null = null;
      parentOrg = await graphql.queries.getOrgBySalesforceId({
        salesforceId: account.ParentId,
      });
      // If parentOrg already exists in db, return it
      if (parentOrg) return parentOrg;

      // otherwise, create it
      const parentAccount = await svc.query.accountById(account.ParentId);
      parentOrg = await graphql.findOrCreateOrg({
        name: parentAccount.Name,
        salesforceId: parentAccount.Id,
        description: `salesforce: ${parentAccount.Id}`,
        parentOrgId: parentAccount?.ParentId ?? DEFAULT_ORG,
      });

      const childOrg = await graphql.findOrCreateOrg({
        salesforceId: account.Id,
        name: account.Name,
        description: `salesforce: ${account.Id}`,
        parentOrgId: parentOrg?.id ?? DEFAULT_ORG,
      });

      if (!parentAccount?.ParentId) return childOrg;

      return await this.ensureOrg(svc, parentAccount);
    },
  };
};

export default createApp;
