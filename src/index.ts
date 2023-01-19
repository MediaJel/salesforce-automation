// import { App } from "@/utils/types";

import createLogger from "@/utils/logger";
// import createApp from "@/app";
import createServer from "@/server";
import config from "@/config";
import createSalesforceProducer from "@/producers/salesforce";
import createProcessor from "@/utils/processor";

const logger = createLogger("Index");
logger.info(`Logging set to ${config.logLevel} mode`);

const startApp = async () => {
  // const app: App = createApp(config);
  // app.setupSubscription();
  const server = createServer(config.server);
  const salesforceProducer = createSalesforceProducer(config);
  const processor = createProcessor(salesforceProducer, config);

  processor.listen();
  server.start();
};

startApp().catch((err) => {
  logger.error({ message: "Application Error", err });
  process.exit(1);
});
