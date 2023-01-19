import {
  Opportunity,
  OrgCandidate,
  OrgCreationEventListenerParams,
  Product,
  ProductsByOpportunityIdParams,
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

type OrgListener = OrgCreationEventListenerParams & {
  topic: SalesforceStreamSubscriptionParams;
  condition: { [key in keyof Partial<Product>]: string };
};

const createListener =
  ({ config, logger, condition, topic }: OrgListener) =>
  (cb: (orgs: OrgCandidate) => void) => {
    SalesforceService(config.salesforce, (_, svc) => {
      svc.stream.listen<Opportunity>(topic, async (opp) => {
        logger.debug(`Received Opportunity: ${opp.Id}`);

        if (!opp?.Deal_Signatory__c) {
          return logger.warn("No Deal Signatory");
        }
        const products = await svc.query.productsByOpportunityId({
          id: opp.Id,
          where: condition,
        });
        if (!products.length) {
          return logger.warn(`No ${condition.Family} Products`);
        }
        const account = await svc.query.accountById(opp.AccountId);
        if (!account) return logger.warn("No Account");

        // Compose Org structure recursively
        cb({
          id: account.Id,
          parentId: account.ParentId,
        });
      });
    });
  };

const createSalesforceOrgCreationEventListener = ({
  config,
  logger,
}: OrgCreationEventListenerParams) => {
  const isDeployed = isProduction || isStaging;
  const topic = isDeployed ? live : test;
  const listenerParams = { config, logger, topic };
  return {
    display: createListener({
      ...listenerParams,
      condition: {
        Family: "Display Advertising",
        Name: "*Standard Display Awareness",
      },
    }),
    paidSearch: createListener({
      ...listenerParams,
      condition: {
        Family: "Paid Search",
        Name: "*Self-Paid Media Buy",
      },
    }),
    seo: createListener({
      ...listenerParams,
      condition: {
        Family: "Search Engine Optimization (SEO)",
        Name: "*Custom Package",
      },
    }),
  };
};

export default createSalesforceOrgCreationEventListener;
