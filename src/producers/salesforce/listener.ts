import SalesforceService from "@/services/salesforce";
import {
  OrgCreationEventListenerParams,
  SalesforceStreamSubscriptionParams,
  Product,
  OrgCandidate,
  Opportunity,
} from "@/utils/types";

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

export default createListener;
