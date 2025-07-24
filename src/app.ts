import createProcessor from "@/processor/processor";
import createSalesforceProducer from "@/producers/salesforce";
import createServer from "@/server";
import { createSalesforceQueue } from "@/services/queue";
import { DataProducer } from "@/utils/types";
import tracer from "./tracer";

import { Config } from "./utils/types";

const createApp = async (config: Config) => {
  const salesforceProducer: DataProducer = createSalesforceProducer(config);
  const salesforceQueue = await createSalesforceQueue();
  const processor = await createProcessor(salesforceProducer, config, salesforceQueue);
  const server = await createServer(config.server, salesforceQueue);

  return {
    async start() {
      tracer.start();
      server.start();
      await processor.listen();
    },
  };
};

export default createApp;
