import createProcessor from "@/processor/processor";
import createSalesforceProducer from "@/producers/salesforce";
import createServer from "@/server";
import { DataProducer } from "@/utils/types";

import { Config } from "./utils/types";

const createApp = async (config: Config) => {
  const server = await createServer(config.server);
  const salesforceProducer: DataProducer = createSalesforceProducer(config);
  const processor = await createProcessor(salesforceProducer, config);

  return {
    async start() {
      server.start();
      await processor.listen();
    },
  };
};

export default createApp;
