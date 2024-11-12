import createIntuitProcessor from '@/processor/intuit/intuit.processor';
import createMediajelProcessor from '@/processor/mediajel/mediajel.processor';
import createLogger from '@/utils/logger';
import { Config, DataProducer, SalesforceClosedWonResource } from '@/utils/types';

const logger = createLogger("Processor");

// Use a logging library

const createProcessor = async (producer: DataProducer, config: Config) => {
  // const mediajel = createMediajelProcessor(config);
  const intuit = await createIntuitProcessor();

  const process = async (type: string, resources: SalesforceClosedWonResource[]) => {
    logger.info(`Recieved Closed Won resources: ${JSON.stringify(resources, null, 2)}`);
    await intuit.process(type, resources);
    // mediajel.process(type, candidates);
  };

  return {
    async listen() {
      producer.closedWon.all((candidates) => process("All", candidates));
      // producer.closedWon.display((candidates) => process("Display", candidates));
      // producer.closedWon.search((candidates) => process("Paid Search", candidates));
      // producer.closedWon.seo((candidates) => process("SEO", candidates));
    },
  };
};

export default createProcessor;
