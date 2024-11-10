import SalesforceService from "@/services/salesforce";
import {
  Account,
  Contact,
  Logger,
  Opportunity,
  OpportunityLineItem,
  Product,
  SalesforceClosedWonEventListenerParams,
  SalesforceClosedWonResource,
  SalesforceStreamSubscriptionParams,
} from "@/utils/types";

type StreamListener = SalesforceClosedWonEventListenerParams & {
  topic: SalesforceStreamSubscriptionParams;
  condition?: { [key in keyof Partial<Product>]: string };
};

interface ListenToOpportunitiesParams {
  svc: SalesforceService;
  logger: Logger;
  topic: SalesforceStreamSubscriptionParams;
}

interface HandleHierarchyParams {
  svc: SalesforceService;
  logger: Logger;
  opportunity: Opportunity;
  opportunityLineItem: OpportunityLineItem;
  account: Account;
  contact: Contact;
  products: Product[];
}

const listenToOpportunities = async (
  { svc, logger, topic }: ListenToOpportunitiesParams,
  cb: (opp: Opportunity) => void
) => {
  svc.stream.listen<Opportunity>(topic, async (opp) => {
    if (!opp?.Deal_Signatory__c) return logger.warn("No Deal Signatory");

    cb(opp);
  });
};

const handleOrgCandidateHierarchy = async (opts: HandleHierarchyParams): Promise<SalesforceClosedWonResource[]> => {
  const { svc, logger, account, opportunity, contact, products, opportunityLineItem } = opts;
  const resources: SalesforceClosedWonResource[] = [];

  const parent = await svc.query.accountById(account.ParentId);

  if (parent) {
    const parentOrg = await handleOrgCandidateHierarchy({
      ...opts,
      account: parent,
    });
    resources.push(...parentOrg);
  }

  resources.push({
    opportunity,
    contact,
    products,
    account,
    opportunityLineItem,
    parentId: account?.ParentId || null,

    // Legacy types, mainly here for the GraphQL processor
    id: account.Id,
    name: account.Name,

    amount: opportunity.Amount,
  });

  return resources.reverse();
};

const createSalesforceListener = (opts: StreamListener) => (cb: (resources: SalesforceClosedWonResource[]) => void) => {
  const { condition, config, logger, topic } = opts;

  SalesforceService(config.salesforce, (_, svc) => {
    listenToOpportunities({ svc, logger, topic }, async (opp) => {
      const params = { svc, logger, opp, cb };

      const products = await svc.query.productsByOpportunityId({
        id: opp.Id,
        where: condition ? condition : null,
      });
      if (!products) return logger.warn(`No ${condition.Family} Products`);

      const account = await svc.query.accountById(opp.AccountId);
      if (!account) return logger.warn("No Account");

      const contact = await svc.query.contactById(opp.Deal_Signatory__c);
      if (!contact) return logger.warn("No Contact");

      const opportunityLineItem = await svc.query.opportunityLineItemByOpportunityId(opp.Id);
      if (!opportunityLineItem) return logger.warn("No Opportunity Line Item");

      const orgCandidates = await handleOrgCandidateHierarchy({
        ...params,
        account,
        opportunity: opp,
        opportunityLineItem,
        contact: contact,
        products: products,
      });
      if (!orgCandidates.length) return;

      // TODO: Remove this
      if (contact) {
        orgCandidates[0].user = {
          id: contact.Id,
          name: contact.Name,
          email: contact.Email,
          phone: contact.Phone,
          username: contact.Name,
        };
      }

      // Organize the array starting from the highest parent account to the lowest child account
      const sorted = orgCandidates.reverse().sort((a, b) => {
        if (a.parentId === b.id) return 1;
        if (a.id === b.parentId) return -1;
        return 0;
      });

      cb(sorted);
    });
  });
};
export default createSalesforceListener;
