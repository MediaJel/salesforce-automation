import createApp from '@/app';
import config from '@/config';
import createLogger from '@/utils/logger';

const logger = createLogger("Index");
logger.info(`Logging set to ${config.logLevel} mode`);

const startApp = async () => {
  const app = await createApp(config);

  await app.start();
};

startApp().catch((err) => {
  logger.error({ message: "Application Error", err });
});
