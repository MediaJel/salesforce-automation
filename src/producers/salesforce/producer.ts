import createOrgCreationEventListener from '@/producers/salesforce/orgs';
import createLogger from '@/utils/logger';
import { Config, DataProducer } from '@/utils/types';

const logger = createLogger("Salesforce Producer");

const createSalesforceProducer = (config: Config): DataProducer => {
  return {
    closedWon: createOrgCreationEventListener({ config, logger }),
  };
};

export default createSalesforceProducer;
