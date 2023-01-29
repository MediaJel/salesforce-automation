import { Config } from "./utils/types";
import { DataProducer } from "@/utils/types";
import createSalesforceProducer from "@/producers/salesforce";
import createServer from "@/server";
import createProcessor from "@/processor";

const appListeningState = (cb: (isListening: boolean) => void) => {
  const isListening = true;
  cb(isListening);
};

const createApp = (config: Config) => {
  const server = createServer(config.server);
  const salesforceProducer: DataProducer = createSalesforceProducer(config);
  const processor = createProcessor(salesforceProducer, config);

  return {
    start() {
      processor.listen();
      server.start();
    },
    stop() {},
  };
};

export default createApp;
