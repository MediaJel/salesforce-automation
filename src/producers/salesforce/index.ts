import { User } from "@/services/graphql/generated/graphql";
import { Config, DataProducer } from "@/utils/types";
import createOrgCreationEventListener from "@/producers/salesforce/orgs";
import createLogger from "@/utils/logger";

const logger = createLogger("Salesforce Producer");

const createSalesforceProducer = (cfg: Config): DataProducer => {
  return {
    orgs: createOrgCreationEventListener(cfg, logger),
    async listenForUsers(callback: (users: User[]) => void) {},
  };
};

export default createSalesforceProducer;
