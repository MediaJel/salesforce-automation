import {
  OrgCreationEventListenerParams,
  SalesforceChannel,
  SalesforceStreamSubscriptionParams,
} from "@/utils/types";
import { isDeployed } from "@/utils/utils";

import createSalesforceListener from "@/producers/salesforce/listener";

const live: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdate,
  replayId: -2,
};

const test: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdateTest,
  replayId: -1,
};

const createSalesforceOrgCreationEventListener = ({
  config,
  logger,
}: OrgCreationEventListenerParams) => {
  const topic = isDeployed ? live : test;
  const listenerParams = { config, logger, topic };
  return {
    display: createSalesforceListener({
      ...listenerParams,
      condition: {
        Family: "Display Advertising",
        Name: "*Standard Display Awareness",
      },
    }),
    paidSearch: createSalesforceListener({
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
