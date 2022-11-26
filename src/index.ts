import { App } from "@/utils/types";

import createLogger from "@/utils/logger";
import createApp from "@/app";
import createServer from "@/server";
import config from "@/config";

const logger = createLogger("Index");
logger.info(`Logging set to ${config.logLevel} mode`);

const startApp = async () => {
  const app: App = createApp(config);
  const server = createServer(config.server);
  app.setupSubscription();
  server.start();
};

startApp().catch((err) => {
  logger.error("Application Error", err);
  process.exit(1);
});
