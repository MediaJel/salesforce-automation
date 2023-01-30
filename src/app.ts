import { Config } from "./utils/types";
import { DataProducer } from "@/utils/types";
import createSalesforceProducer from "@/producers/salesforce";
import createProcessor from "@/processor";
import createLogger from "@/utils/logger";

const logger = createLogger("App");

const createApp = (config: Config) => {
  const salesforceProducer: DataProducer = createSalesforceProducer(config);
  const processor = createProcessor(salesforceProducer, config);

  return {
    start(appState: boolean) {
      if (!appState) {
        logger.warn("App State is disabled. Not Listening for Data Producers");
        return;
      }

      processor.listen();
    },
  };
};

export default createApp;
