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
  condition: { [key in keyof Partial<Product>]: string };
  topic: SalesforceStreamSubscriptionParams;
}

interface HandleProductsParams {
  svc: SalesforceService;
  logger: Logger;
  opp: Opportunity;
  condition: { [key in keyof Partial<Product>]: string };
}

interface HandleAccountParams {
  svc: SalesforceService;
  logger: Logger;
  opp: Opportunity;
}

interface HandleContactParams {
  svc: SalesforceService;
  logger: Logger;
  contactId: string;
}

interface HandleHierarchyParams {
  svc: SalesforceService;
  logger: Logger;
  account: Account;
}

const listenToOpportunities = async (
  opts: ListenToOpportunitiesParams,
  cb: (opp: Opportunity) => void
) => {
  const { svc, logger, condition, topic } = opts;

  svc.stream.listen<Opportunity>(topic, async (opp) => {
    if (!opp?.Deal_Signatory__c) {
      return logger.warn("No Deal Signatory");
    }
    cb(opp);
  });
};

const queryProducts = async (opts: HandleProductsParams) => {
  const { svc, logger, opp, condition } = opts;

  const products = await svc.query.productsByOpportunityId({
    id: opp.Id,
    where: condition,
  });
  if (!products.length) {
    return logger.warn(`No ${condition.Family} Products`);
  }
  return products;
};

const queryAccount = async (opts: HandleAccountParams) => {
  const { svc, logger, opp } = opts;
  const account = await svc.query.accountById(opp.AccountId);
  if (!account) return logger.warn("No Account");

  return account;
};

const queryContact = async (opts: HandleContactParams) => {
  const { svc, logger, contactId } = opts;
  const contact = await svc.query.contactById(contactId);
  if (!contact) return logger.warn("No Contact");

  return contact;
};

// Instead of recursing return an array and add an additional field to hold foreign key of parent
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
      listenToOpportunities({ svc, logger, condition, topic }, async (opp) => {
        const params = { svc, logger, opp, cb };

        const products = await queryProducts({
          ...params,
          condition,
        });
        if (!products) return;

        const account = await queryAccount(params);
        if (!account) return;

        const orgCandidates = await handleOrgCandidateHierarchy({
          ...params,
          account,
        });
        if (!orgCandidates.length) return;

        const contact = await queryContact({
          contactId: opp.Deal_Signatory__c,
          logger,
          svc,
        });

        if (contact) {
          orgCandidates[0].user = {
            id: contact.Id,
            name: contact.Name,
            email: contact.Email,
            phone: contact.Phone,
            username: contact.Name,
          };
        }

        cb(orgCandidates);
      });
    });
  };
export default createSalesforceListener;
