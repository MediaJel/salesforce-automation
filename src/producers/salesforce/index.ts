import { User } from "@/services/graphql/generated/graphql";
import { Config, DataProducer } from "@/utils/types";
import createOrgCreationEventListener from "@/producers/salesforce/orgs";
import createLogger from "@/utils/logger";

const logger = createLogger("Salesforce Producer");

const createSalesforceProducer = (config: Config): DataProducer => {
  return {
    orgs: createOrgCreationEventListener({ config, logger }),
    async listenForUsers(callback: (users: User[]) => void) {},
  };
};

export default createSalesforceProducer;
