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
import { Org } from "./services/graphql/generated/graphql";

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
      logger.debug(`Evaluating Parent Org for ${account.Name}`);
      const parentOrg: ParentOrg | null = await this.findOrCreateParentOrg(
        svc,
        account
      );

      // Create the org, either with a parent org or without
      logger.debug(`Finding or Creating Org for ${account.Name}`);
      const org = await graphql.findOrCreateOrg({
        salesforceId: account.Id,
        name: account.Name,
        description: `salesforce: ${account.Id}`,
        salesforceParentId: parentOrg?.id ?? "cjoq2t7g4yzca07347pug25ck", // Defaults to MJ org, set this to env variable
      });

      if (!org) {
        return logger.warn(`No Org Found/Created for ${account.Name}`);
      }

      return org;
    },

    async findOrCreateParentOrg(svc: SalesforceService, account: Account) {
      let parentOrg: ParentOrg | null = null;

      // If no parent id then return
      if (!account.ParentId) {
        logger.info("No Parent Org provided");
        return parentOrg;
      }

      // Check if the parent org already exists
      logger.debug(`Checking for Parent: ${account.ParentId}`);
      parentOrg = await graphql.queries.getOrgBySalesforceId({
        salesforceId: account.ParentId,
      });

      if (parentOrg) {
        logger.info(`Found Parent ${parentOrg?.name} for ${account.Name}`);
        return parentOrg;
      }

      // If the parent org doesn't exist, create it
      logger.info(`Parent with Salesforce ID ${account.ParentId} not found`);
      const parentAccount = await svc.query.accountById(account.ParentId);
      const { ParentId = "cjoq2t7g4yzca07347pug25ck" } = parentAccount; // Defaults to MJ org, set this to env variable

      parentOrg = await graphql.findOrCreateOrg({
        name: parentAccount.Name,
        salesforceId: parentAccount.Id,
        description: `salesforce: ${parentAccount.Id}`,
        salesforceParentId: ParentId,
      });

      if (parentOrg) {
        logger.info(`Created Parent ${parentOrg.name} for ${account.Name}`);
        return parentOrg;
      }

      // If the parent org still doesn't exist, log an error
      logger.error({
        message: `No Parent Org Found/Created for ${account.Name}`,
      });
      return;
    },
  };
};

export default createApp;
