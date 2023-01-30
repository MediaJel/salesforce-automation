import createLogger from "@/utils/logger";
import config from "@/config";
import createApp from "@/app";

const logger = createLogger("Index");
logger.info(`Logging set to ${config.logLevel} mode`);

const startApp = async () => {
  const app = createApp(config);
  app.start();
};

startApp().catch((err) => {
  logger.error({ message: "Application Error", err });
  process.exit(1);
});
