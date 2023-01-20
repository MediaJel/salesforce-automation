import SalesforceService from "@/services/salesforce";
import {
  OrgCreationEventListenerParams,
  SalesforceStreamSubscriptionParams,
  Product,
  OrgCandidate,
  Opportunity,
  Logger,
} from "@/utils/types";

type OrgListener = OrgCreationEventListenerParams & {
  topic: SalesforceStreamSubscriptionParams;
  condition: { [key in keyof Partial<Product>]: string };
};

interface ListenToOpportunitiesParams {
  svc: SalesforceService;
  logger: Logger;
  condition: { [key in keyof Partial<Product>]: string };
  topic: SalesforceStreamSubscriptionParams;
  cb: (orgs: OrgCandidate) => void;
}

interface HandleProductsParams {
  svc: SalesforceService;
  logger: Logger;
  opp: Opportunity;
  condition: { [key in keyof Partial<Product>]: string };
  cb: (orgs: OrgCandidate) => void;
}

interface HandleAccountParams {
  svc: SalesforceService;
  logger: Logger;
  opp: Opportunity;
  cb: (orgs: OrgCandidate) => void;
}

const createSalesforceListener =
  (opts: OrgListener) => (cb: (orgs: OrgCandidate) => void) => {
    const { condition, config, logger, topic } = opts;

    SalesforceService(config.salesforce, (_, svc) => {
      listenToOpportunities({ svc, logger, condition, topic, cb });
    });
  };

const listenToOpportunities = async (opts: ListenToOpportunitiesParams) => {
  const { svc, logger, condition, cb, topic } = opts;

  svc.stream.listen<Opportunity>(topic, async (opp) => {
    logger.debug(`Received Opportunity: ${opp.Id}`);
    if (!opp?.Deal_Signatory__c) {
      return logger.warn("No Deal Signatory");
    }
    await handleProducts({ svc, logger, opp, condition, cb });
  });
};

const handleProducts = async (opts: HandleProductsParams) => {
  const { svc, logger, opp, condition, cb } = opts;

  const products = await svc.query.productsByOpportunityId({
    id: opp.Id,
    where: condition,
  });
  if (!products.length) {
    return logger.warn(`No ${condition.Family} Products`);
  }
  await handleAccount({ svc, logger, opp, cb });
};

const handleAccount = async (opts: HandleAccountParams) => {
  const { svc, logger, opp, cb } = opts;
  const account = await svc.query.accountById(opp.AccountId);
  if (!account) return logger.warn("No Account");

  // Compose Org structure recursively
  cb({
    id: account.Id,
    parentId: account.ParentId,
  });
};

export default createSalesforceListener;
