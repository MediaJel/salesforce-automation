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
  opp: Opportunity;
}

interface HandleHierarchyParams {
  svc: SalesforceService;
  logger: Logger;
  account: Account;
  opp: Opportunity;
  cb: (orgs: OrgCreationCandidate) => void;
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

const queryContact = async (opts: HandleAccountParams) => {
  const { svc, logger, opp } = opts;
  const contact = await svc.query.contactById(opp.Deal_Signatory__c);
  if (!contact) return logger.warn("No Contact");

  return contact;
};

const handleAccountHierarchy = async (
  opts: HandleHierarchyParams
): Promise<OrgCreationCandidate> => {
  const { svc, logger, account, opp } = opts;

  const contact = await svc.query.contactById(opp.Deal_Signatory__c);

  if (!account.ParentId) {
    return {
      id: account.Id,
      name: account.Name,
      description: "",
      user: {
        id: contact.Id,
        name: format(contact.Name),
        username: format(contact.Name),
        email: isProduction ? contact.Email : DEFAULT_EMAIL,
        phone: contact?.Phone ? formatPhone(contact.Phone) : DEFAULT_PHONE, // Always add a +1
      },
    };
  }

  const parentAccount = await svc.query.accountById(account.ParentId);

  return {
    id: account.Id,
    name: account.Name,
    description: "",
    parent: await handleAccountHierarchy({ ...opts, account: parentAccount }),
  };
};

const createSalesforceListener =
  (opts: OrgListener) => (cb: (orgs: OrgCreationCandidate) => void) => {
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

        const contact = await queryContact(params);
        if (!contact) return;

        const accountHierarchy = handleAccountHierarchy({
          ...params,

          account,
        });
      });
    });
  };
export default createSalesforceListener;
