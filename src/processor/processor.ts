import createGraphqlProcessor from '@/processor/graphql.processor';
import createLogger from '@/utils/logger';
import { Config, DataProducer, OrgCreationCandidate } from '@/utils/types';

const logger = createLogger("Processor");

// Use a logging library

const createProcessor = (producer: DataProducer, config: Config) => {
  const graphql = createGraphqlProcessor(config);

  const process = async (type: string, candidates: OrgCreationCandidate[]) => {
    logger.info(`Received Data`);
    graphql.process(type, candidates);
  };

  return {
    async listen() {
      producer.orgs.display((candidates) => process("Display", candidates));
      // producer.orgs.search((candidates) => process("Paid Search", candidates));
      // producer.orgs.seo((candidates) => process("SEO", candidates));
    },
  };
};

export default createProcessor;
