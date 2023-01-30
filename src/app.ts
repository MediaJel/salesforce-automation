import { Config } from "./utils/types";
import { DataProducer } from "@/utils/types";
import createSalesforceProducer from "@/producers/salesforce";
import createProcessor from "@/processor";
import createServer from "@/server";

const createApp = (config: Config) => {
  const salesforceProducer: DataProducer = createSalesforceProducer(config);
  const processor = createProcessor(salesforceProducer, config);
  const server = createServer(config.server);
  return {
    start() {
      server.start();
      processor.listen();
    },
  };
};

export default createApp;
