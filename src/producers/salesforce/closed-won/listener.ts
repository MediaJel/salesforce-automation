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

// Helper to set up the stream listener with reconnection logic
const setupStreamListener = async (
  salesforce: SalesforceServiceType,
  topic: SalesforceStreamSubscriptionParams,
  logger: Logger,
  handler: (opp: Opportunity) => Promise<void>,
  config: any,
  maxRetries = 5
) => {
  let retryCount = 0;
  let streamSubscription: any = null;

  const setupStream = async () => {
    try {
      streamSubscription = await salesforce.stream.listen<Opportunity>(topic, async (opp) => {
        try {
          await handler(opp);
        } catch (error) {
          logger.error({ message: "Error processing opportunity from stream", error });
        }
      });

      // Reset retry count on successful connection
      retryCount = 0;
      logger.info(`Successfully connected to Salesforce streaming topic: ${topic}`);

      // Add error and disconnect handlers
      if (streamSubscription?.client?.stream) {
        streamSubscription.client.stream.on("error", async (error: any) => {
          logger.error({ message: "Stream error detected", error });
          await reconnect();
        });

        streamSubscription.client.stream.on("disconnect", async () => {
          logger.warn("Stream disconnected");
          await reconnect();
        });
      }
    } catch (error) {
      logger.error({ message: "Error setting up stream listener", error });
      await reconnect();
    }
  };

  const reconnect = async () => {
    if (retryCount >= maxRetries) {
      logger.error({ message: `Max retry attempts (${maxRetries}) reached. Giving up on reconnection.` });
      return;
    }

    retryCount++;
    const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff with max of 30s

    logger.info(`Attempting to reconnect in ${backoffTime}ms (attempt ${retryCount}/${maxRetries})`);

    setTimeout(async () => {
      try {
        // Try to refresh the Salesforce connection
        if (salesforce.reconnect) {
          const refreshedService = await salesforce.reconnect();
          if (refreshedService) {
            salesforce = refreshedService;
            logger.info("Connection refreshed, setting up stream again");
          }
        }

        await setupStream();
      } catch (error) {
        logger.error({ message: "Error during reconnection attempt", error });
        await reconnect(); // Try again
      }
    }, backoffTime);
  };

  await setupStream();
  return streamSubscription;
};

const createSalesforceListener =
  (opts: StreamListener) => async (cb: (resources: SalesforceClosedWonResource[]) => void) => {
    const { condition, config, logger, topic } = opts;

    const salesforce = await SalesforceService(config.salesforce);

    const handleOpportunity = async (opp: Opportunity) => {
      if (!opp?.Deal_Signatory__c) return logger.warn("No Deal Signatory");

      const products = await salesforce.query.productsByOpportunityId({
        id: opp.Id,
        where: condition ? condition : null,
      });

      if (!products) return logger.warn(`No ${condition?.Family} Products`);

      const account = await salesforce.query.accountById(opp.AccountId);
      if (!account) return logger.warn("No Account");

      const contact = await salesforce.query.contactById(opp.Deal_Signatory__c);
      if (!contact) return logger.warn("No Contact");

      const opportunityLineItems = await salesforce.query.opportunityLineItemByOpportunityId(opp.Id);
      if (!opportunityLineItems) return logger.warn("No Opportunity Line Item");

      const resources = await handleResourcesHierarchy({
        salesforce,
        logger,
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
    };

    // Set up the stream with reconnection logic
    await setupStreamListener(salesforce, topic, logger, handleOpportunity, config);
  };

export default createSalesforceListener;
