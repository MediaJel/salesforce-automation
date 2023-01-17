import { User } from "@/services/graphql/generated/graphql";
import { Config, DataProducer, Opportunity } from "@/utils/types";
import createOrgCreationEventListener from "@/producers/salesforce/orgs";
import createSalesforceService from "@/services/salesforce";

const createSalesforceProducer = (config: Config): DataProducer => {
  return {
    org: createOrgCreationEventListener(),

    async listenForUsers(callback: (users: User[]) => void) {
      // Listen for Users...
    },
  };
};

export default createSalesforceProducer;
