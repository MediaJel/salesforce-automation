import createSalesforceListener from '@/producers/salesforce/closed-won/listener';
import {
    SalesforceChannel, SalesforceClosedWonEventListenerParams, SalesforceStreamSubscriptionParams
} from '@/utils/types';
import { isDeployed, isProduction, isStaging } from '@/utils/utils';

const live: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdate,
  replayId: -1,
};

const test: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdateTest,
  replayId: -1,
};

const createSalesforceClosedWonEventListener = ({ config, logger }: SalesforceClosedWonEventListenerParams) => {
  // Live vs Test mainly relies on the "is_Active__c" field in Salesforce
  // if opportunity is active, it's live, otherwise it's test
  const topic = config.salesforce.salesforceChannel === "live" ? live : test;
  logger.info(`Listening to Salesforce channel: ${topic.channel}`);
  const listenerParams = { config, logger, topic };
  return {
    all: createSalesforceListener({ ...listenerParams }),
    display: createSalesforceListener({
      ...listenerParams,
      condition: {
        Family: "Display Advertising",
        Name: "*Standard Display Awareness",
      },
    }),
    search: createSalesforceListener({
      ...listenerParams,
      condition: {
        Family: "Paid Search",
        Name: "*Self-Paid Media Buy",
      },
    }),
    seo: createSalesforceListener({
      ...listenerParams,
      condition: {
        Family: "Search Engine Optimization (SEO)",
        Name: "*Custom Package",
      },
    }),
  };
};

export default createSalesforceClosedWonEventListener;
