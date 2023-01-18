import { User } from "@/services/graphql/generated/graphql";
import { Config, DataProducer, Opportunity } from "@/utils/types";
import createOrgCreationEventListener from "@/producers/salesforce/orgs";
import createSalesforceService from "@/services/salesforce";

const createSalesforceProducer = (cfg: Config): DataProducer => {
  const { app } = cfg;

  function logger(data) {
    console.log("WOAH");
    console.log(data);
  }
  createSalesforceService(cfg.salesforce, (client, svc) => {
    svc.stream.listen(app.subscription());
    svc.stream.subscribe(logger);
  });
  return {
    // org: createOrgCreationEventListener(opportunity),

    async listenForUsers(callback: (users: User[]) => void) {
      // Listen for Users...
    },
  };
};

export default createSalesforceProducer;
