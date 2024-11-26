import createIntuitProcessor from "@/processor/intuit/intuit.processor";
import createLogger from "@/utils/logger";
import { Config, DataProducer, SalesforceClosedWonResource } from "@/utils/types";

const logger = createLogger("Processor");

// Use a logging library

const createProcessor = async (producer: DataProducer, config: Config) => {
  const intuit = await createIntuitProcessor();

  const process = async (type: string, resources: SalesforceClosedWonResource[]) => {
    logger.info(`Recieved Closed Won resources: ${JSON.stringify(resources, null, 2)}`);
    await intuit.process(type, resources);
  };

  return {
    async listen() {
      producer.closedWon.all((candidates) => process("All", candidates));
    },
  };
};

export default createProcessor;
