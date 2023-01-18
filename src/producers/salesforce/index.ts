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

const createSalesforceProducer = (cfg: Config): DataProducer => {
  const isDeployed = isProduction || isStaging;
  const topic = isDeployed ? live : local;

  function logger(data) {
    console.log("WOAH");
    console.log(data);
  }
  createSalesforceService(cfg.salesforce, (client, svc) => {
    svc.stream.listen<Opportunity>(topic);
    svc.stream.subscribe<Opportunity>(logger);
  });

  return {
    // org: createOrgCreationEventListener(opportunity),

    async listenForUsers(callback: (users: User[]) => void) {
      // Listen for Users...
    },
  };
};

export default createSalesforceProducer;
