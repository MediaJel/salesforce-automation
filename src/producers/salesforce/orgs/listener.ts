import SalesforceService from "@/services/salesforce";
import {
  OrgCreationEventListenerParams,
  SalesforceStreamSubscriptionParams,
  Product,
  OrgCreationCandidate,
  Opportunity,
  Logger,
  Account,
  Contact,
} from "@/utils/types";
import { format, formatPhone, isProduction } from "@/utils/utils";
import { DEFAULT_EMAIL, DEFAULT_PHONE } from "@/constants";

type OrgListener = OrgCreationEventListenerParams & {
  topic: SalesforceStreamSubscriptionParams;
  condition: { [key in keyof Partial<Product>]: string };
};

interface ListenToOpportunitiesParams {
  svc: SalesforceService;
  logger: Logger;
  topic: SalesforceStreamSubscriptionParams;
}

interface HandleHierarchyParams {
  svc: SalesforceService;
  logger: Logger;
  account: Account;
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

const handleOrgCandidateHierarchy = async (
  opts: HandleHierarchyParams
): Promise<OrgCreationCandidate[]> => {
  const { svc, logger, account } = opts;
  const orgs: OrgCreationCandidate[] = [];

  const parent = await svc.query.accountById(account.ParentId);

  if (parent) {
    const parentOrg = await handleOrgCandidateHierarchy({
      ...opts,
      account: parent,
    });
    orgs.push(...parentOrg);
  }

  orgs.push({
    id: account.Id,
    name: account.Name,
    parentId: account?.ParentId || null,
    description: "",
  });

  return orgs.reverse();
};

const createSalesforceListener =
  (opts: OrgListener) => (cb: (orgs: OrgCreationCandidate[]) => void) => {
    const { condition, config, logger, topic } = opts;

    SalesforceService(config.salesforce, (_, svc) => {
      listenToOpportunities({ svc, logger, topic }, async (opp) => {
        const params = { svc, logger, opp, cb };

        const products = await svc.query.productsByOpportunityId({
          id: opp.Id,
          where: condition,
        });
        if (!products) return logger.warn(`No ${condition.Family} Products`);

        const account = await svc.query.accountById(opp.AccountId);
        if (!account) return logger.warn("No Account");

        const orgCandidates = await handleOrgCandidateHierarchy({
          ...params,
          account,
        });
        if (!orgCandidates.length) return;

        const contact = await svc.query.contactById(opp.Deal_Signatory__c);
        if (!contact) return logger.warn("No Contact");

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
