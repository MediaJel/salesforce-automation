import {
  Config,
  Logger,
  Opportunity,
  Org,
  OrgCandidate,
  SalesforceChannel,
  SalesforceStreamSubscriptionParams,
} from "@/utils/types";
import SalesforceService from "@/services/salesforce";
import { isProduction, isStaging } from "@/utils/utils";

const live: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdate,
  replayId: -2,
};

const test: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdateTest,
  replayId: -1,
};

const createSalesforceOrgCreationEventListener = (
  cfg: Config,
  logger: Logger
) => {
  const isDeployed = isProduction || isStaging;
  const topic = isDeployed ? live : test;
  return {
    display: (cb: (orgs: OrgCandidate) => void) => {
      SalesforceService(cfg.salesforce, (_, svc) => {
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
    paidSearch: (cb: (orgs: OrgCandidate) => void) => {
      SalesforceService(cfg.salesforce, (_, svc) => {
        svc.stream.listen<Opportunity>(topic, async (opp) => {
          logger.debug(`Received Opportunity: ${opp.Id}`);

          if (!opp?.Deal_Signatory__c) {
            return logger.warn("No Deal Signatory");
          }
          const products = await svc.query.productsByOpportunityId({
            id: opp.Id,
            where: {
              Name: "*Self-Paid Media Buy",
            },
          });
          console.log(products);

          if (!products.length) return logger.warn("No Paid Search Products");

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
    seo: (cb: (orgs: OrgCandidate) => void) => {
      SalesforceService(cfg.salesforce, (_, svc) => {
        svc.stream.listen<Opportunity>(topic, async (opp) => {
          logger.debug(`Received Opportunity: ${opp.Id}`);

          if (!opp?.Deal_Signatory__c) {
            return logger.warn("No Deal Signatory");
          }
          const products = await svc.query.productsByOpportunityId({
            id: opp.Id,
            where: {
              Name: "*Custom Package",
            },
          });
          console.log(products);
          if (!products.length) return logger.warn("No SEO Products");

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
  };
};

export default createSalesforceOrgCreationEventListener;
