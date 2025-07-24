import Bull from "bull";
import createIntuitProcessor from "@/processor/intuit/intuit.processor";
import createLogger from "@/utils/logger";
import { Config, DataProducer, SalesforceClosedWonResource } from "@/utils/types";

const logger = createLogger("Processor");

const createProcessor = async (producer: DataProducer, config: Config, salesforceQueue: Bull.Queue) => {
  // Process jobs
  salesforceQueue.process("process-closed-won", async (job) => {
    const { type, resources } = job.data as { type: string; resources: SalesforceClosedWonResource[] };

    logger.info(`Processing job ${job.id}: ${type} with ${resources.length} resources`);

    const intuit = await createIntuitProcessor(job);
    await intuit.process(type, resources);

    logger.info(`Completed job ${job.id}`);

    return { processed: resources.length, type };
  });

  return {
    async listen() {
      producer.closedWon.all(async (candidates) => {
        logger.info(`Received Closed Won resources: ${JSON.stringify(candidates, null, 2)}`);

        // Add job to queue
        const job = await salesforceQueue.add(
          "process-closed-won",
          {
            type: "All",
            resources: candidates,
          },
          {
            attempts: 1,
          }
        );

        logger.info(`Added job ${job.id} to queue for type: All`);
      });
    },
  };
};

export default createProcessor;
