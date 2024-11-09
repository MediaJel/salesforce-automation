import createGraphqlProcessor from '@/processor/graphql.processor';
import createLogger from '@/utils/logger';
import { Config, DataProducer, SalesforceClosedWonResource } from '@/utils/types';

const logger = createLogger("Processor");

// Use a logging library

const createProcessor = (producer: DataProducer, config: Config) => {
  const graphql = createGraphqlProcessor(config);

  const process = async (type: string, resources: SalesforceClosedWonResource[]) => {
    resources.forEach((resource) => {
      logger.info(`Processing Data: ${JSON.stringify(resource, null, 2)}`);
    });

    // graphql.process(type, candidates);
  };

  return {
    async listen() {
      producer.resources.all((candidates) => process("All", candidates));
      // producer.orgs.display((candidates) => process("Display", candidates));
      // producer.orgs.search((candidates) => process("Paid Search", candidates));
      // producer.orgs.seo((candidates) => process("SEO", candidates));
    },
  };
};

export default createProcessor;
