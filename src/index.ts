import createLogger from "@/utils/logger";
import config from "@/config";
import createApp from "@/app";
import appState from "@/state";
import createServer from "@/server";

const logger = createLogger("Index");
logger.info(`Logging set to ${config.logLevel} mode`);

const startApp = async () => {
  const server = createServer(config.server);
  const app = createApp(config);

  server.start();
  appState.subscribe((state) => app.start(state));
  appState.enable();
};

startApp().catch((err) => {
  logger.error({ message: "Application Error", err });
  process.exit(1);
});
