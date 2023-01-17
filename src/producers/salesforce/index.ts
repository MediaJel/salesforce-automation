import { User } from "@/services/graphql/generated/graphql";
import { Config, DataProducer, Opportunity } from "@/utils/types";
import createOrgCreationEventListener from "@/producers/salesforce/orgs";
import createSalesforceService from "@/services/salesforce";

const createSalesforceProducer = (cfg: Config): DataProducer => {
  const { app } = cfg;

  let opportunity: Opportunity = null;
  createSalesforceService(cfg, (client, svc) => {
    svc.stream.subscribe<Opportunity>(app.subscription(), async (opp) => {
      opportunity = opp
    });
  });
  return {
    org: createOrgCreationEventListener(opportunity),

    async listenForUsers(callback: (users: User[]) => void) {
      // Listen for Users...
    },
  };
};

export default createSalesforceProducer;
