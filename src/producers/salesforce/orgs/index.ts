import createSalesforceListener from '@/producers/salesforce/orgs/listener';
import {
    OrgCreationEventListenerParams, SalesforceChannel, SalesforceStreamSubscriptionParams
} from '@/utils/types';
import { isDeployed } from '@/utils/utils';

const live: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdate,
  replayId: -2,
};

const test: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdateTest,
  replayId: -1,
};

const createSalesforceOrgCreationEventListener = ({ config, logger }: OrgCreationEventListenerParams) => {
  const topic = isDeployed ? live : test;
  const listenerParams = { config, logger, topic };
  return {
    all: createSalesforceListener({ ...listenerParams}),
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

export default createSalesforceOrgCreationEventListener;
