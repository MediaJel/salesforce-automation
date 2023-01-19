import { App } from "@/utils/types";

import createLogger from "@/utils/logger";
import createApp from "@/app";
import createServer from "@/server";
import config from "@/config";

const logger = createLogger("Index");
logger.info(`Logging set to ${config.logLevel} mode`);

const startApp = async () => {
  logger.info("Starting Application in " + process.env.NODE_ENV);

  const app: App = createApp(config);
  const server = createServer(config.server);
  app.setupSubscription();
  server.start();
};

startApp().catch((err) => {
  logger.error({ message: "Application Error", err });
  process.exit(1);
});
