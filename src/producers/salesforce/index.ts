import { User } from "@/services/graphql/generated/graphql";
import { isProduction, isStaging } from "@/utils/utils";
import {
  Config,
  DataProducer,
  Opportunity,
  Org,
  OrgCandidate,
  SalesforceChannel,
  SalesforceStreamSubscriptionParams,
} from "@/utils/types";
import createOrgCreationEventListener from "@/producers/salesforce/orgs";
import createSalesforceService from "@/services/salesforce";
import createLogger from "@/utils/logger";

const live: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdate,
  replayId: -2,
};

const test: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdateTest,
  replayId: -1,
};

const logger = createLogger("salesforce-producer");
const createSalesforceProducer = (cfg: Config): DataProducer => {
  const isDeployed = isProduction || isStaging;
  const topic = isDeployed ? live : test;

  return {
    listenForDisplayOrgs(cb: (orgs: OrgCandidate) => void) {
      createSalesforceService(cfg.salesforce, (_, svc) => {
        svc.stream.listen<Opportunity>(topic, async (opp) => {
          logger.debug(`Received Opportunity: ${opp.Id}`);

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

          // Compose Org structure recursively
          cb({
            id: account.Id,
            parentId: account.ParentId,
          });
        });
      });
    },

    async listenForUsers(callback: (users: User[]) => void) {
      // Listen for Users...
    },
  };
};

export default createSalesforceProducer;
