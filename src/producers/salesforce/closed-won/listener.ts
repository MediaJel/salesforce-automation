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
  SalesforceServiceType,
  SalesforceStreamSubscriptionParams,
} from "@/utils/types";

type StreamListener = SalesforceClosedWonEventListenerParams & {
  topic: SalesforceStreamSubscriptionParams;
  condition?: { [key in keyof Partial<Product>]: string };
};

interface ListenToOpportunitiesParams {
  salesforce: ReturnType<typeof SalesforceService>;
  logger: Logger;
  topic: SalesforceStreamSubscriptionParams;
}

interface HandleHierarchyParams {
  salesforce: SalesforceServiceType;
  logger: Logger;
  opportunity: Opportunity;
  opportunityLineItems: OpportunityLineItem[];
  account: Account;
  contact: Contact;
  products: Product[];
}

const handleResourcesHierarchy = async (opts: HandleHierarchyParams): Promise<SalesforceClosedWonResource[]> => {
  const { salesforce, logger, account, opportunity, contact, products, opportunityLineItems } = opts;
  const resources: SalesforceClosedWonResource[] = [];

  const parent = await salesforce.query.accountById(account.ParentId);

  if (parent) {
    const parentOrg = await handleResourcesHierarchy({
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
    opportunityLineItems,
    parent: parent ?? null,
    // Legacy types, mainly here for the GraphQL processor
    id: account.Id,
    name: account.Name,
    amount: opportunity.Amount,
  });

  return resources.reverse();
};

const createSalesforceListener =
  (opts: StreamListener) => async (cb: (resources: SalesforceClosedWonResource[]) => void) => {
    const { condition, config, logger, topic } = opts;

    const salesforce = await SalesforceService(config.salesforce);

    salesforce.stream.listen<Opportunity>(topic, async (opp) => {
      if (!opp?.Deal_Signatory__c) return logger.warn("No Deal Signatory");
      const params = { salesforce, logger, opp, cb };

      const products = await salesforce.query.productsByOpportunityId({
        id: opp.Id,
        where: condition ? condition : null,
      }); // DONE

      if (!products) return logger.warn(`No ${condition.Family} Products`);

      const account = await salesforce.query.accountById(opp.AccountId); // DONE
      if (!account) return logger.warn("No Account");

      const contact = await salesforce.query.contactById(opp.Deal_Signatory__c); // DONE
      if (!contact) return logger.warn("No Contact");

      const opportunityLineItems = await salesforce.query.opportunityLineItemByOpportunityId(opp.Id); // DONE
      if (!opportunityLineItems) return logger.warn("No Opportunity Line Item");

      const resources = await handleResourcesHierarchy({
        ...params,
        account,
        opportunity: opp,
        opportunityLineItems,
        contact: contact,
        products: products,
      });
      if (!resources.length) return;

      // TODO: Remove this
      if (contact) {
        resources[0].user = {
          id: contact.Id,
          name: contact.Name,
          email: contact.Email,
          phone: contact.Phone,
          username: contact.Name,
        };
      }

      // Organize the array starting from the highest parent account to the lowest child account
      const sorted = resources.reverse().sort((a, b) => {
        if (a?.parent?.Id === b.id) return 1;
        if (a.id === b?.parent?.Id) return -1;
        return 0;
      });

      cb(sorted);
    });
  };
export default createSalesforceListener;
