import { User } from "@/services/graphql/generated/graphql";
import {
  Config,
  DataProducer,
  Opportunity,
  SalesforceChannel,
  SalesforceStreamSubscriptionParams,
} from "@/utils/types";
import createOrgCreationEventListener from "@/producers/salesforce/orgs";
import createSalesforceService from "@/services/salesforce";
import { isProduction, isStaging } from "@/utils/utils";

const live: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdate,
  replayId: -2,
};

const local: SalesforceStreamSubscriptionParams = {
  channel: SalesforceChannel.OpportunitiesUpdateTest,
  replayId: -1,
};

const listeners = (opportunity: Opportunity) => {
  const orgs = createOrgCreationEventListener();

  orgs.display(opportunity, (orgs) => {
    console.log(orgs);
  });

  orgs.paidSearch(opportunity, (orgs) => {
    console.log(orgs);
  });

  orgs.seo(opportunity, (orgs) => {
    console.log(orgs);
  });
};

const createSalesforceProducer = (cfg: Config): DataProducer => {
  const isDeployed = isProduction || isStaging;
  const topic = isDeployed ? live : local;

  createSalesforceService(cfg.salesforce, (client, svc) => {
    svc.stream.listen<Opportunity>(topic);
    svc.stream.subscribe<Opportunity>(listeners);
  });

  return {
    // org: createOrgCreationEventListener(opportunity),

    async listenForUsers(callback: (users: User[]) => void) {
      // Listen for Users...
    },
  };
};

export default createSalesforceProducer;
