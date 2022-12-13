import createSalesforceService from "@/services/salesforce";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

import { format, isProduction } from "@/utils/utils";
import {
  Opportunity,
  SalesforceService,
  Config,
  Account,
  ParentOrg,
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

            logger.info(`Found/Created Org: ${org.id}`);

            const contact = await svc.query.contactById(opp.Deal_Signatory__c);

            if (!contact?.Name) return logger.warn(`No Contact "Name" Found`);

            const user = await graphql.findOrCreateUser({
              salesforceId: contact.Id,
              email: isProduction ? contact.Email : "pacholo@mediajel.com",
              name: `salesforce: ${format(contact.Name)}`,
              phone: "+11234567894", // Always add a +1
              username: format(contact.Name),
              orgId: org.id,
            });

            if (!user) return logger.warn("No User Found/Created Created");

            logger.info(`Found/Created User: ${user.id}`);
          }
        );
      });
    },

    async ensureOrg(svc: SalesforceService, account: Account) {
      let parentOrg: ParentOrg | null = null;

      // Check if the parent org already exists
      if (account.ParentId) {
        logger.info(`Checking for Parent: ${account.ParentId}`);

        parentOrg = await graphql.queries.getOrgBySalesforceId({
          salesforceId: account.ParentId,
        });

        if (parentOrg) {
          logger.info(`Found Parent ${parentOrg?.name} for ${account.Name}`);
        }
      }

      // If the parent org doesn't exist, create it
      if (!parentOrg) {
        logger.debug(`Parent with Salesforce ID ${account.ParentId} not found`);

        const parentAccount = await svc.query.accountById(account.ParentId);
        const { ParentId = "cjoq2t7g4yzca07347pug25ck" } = parentAccount; // Defaults to MJ org, set this to env variable

        parentOrg = await graphql.findOrCreateOrg({
          name: parentAccount.Name,
          salesforceId: parentAccount.Id,
          description: `salesforce: ${parentAccount.Id}`,
          salesforceParentId: ParentId,
        });

        logger.info(`Created Parent ${parentOrg.name} for ${account.Name}`);
      }

      logger.debug(`Finding or Creating Org for ${account.Name}`);

      // Create the org, either with a parent org or without
      const org = await graphql.findOrCreateOrg({
        salesforceId: account.Id,
        name: account.Name,
        description: `salesforce: ${account.Id}`,
        salesforceParentId: parentOrg?.id ?? "",
      });

      if (!org) {
        return logger.warn(`No Org Found/Created for ${account.Name}`);
      }

      logger.info(`Created/Found Org: ${org.name}`);
      return org;
    },
  };
};

export default createApp;
