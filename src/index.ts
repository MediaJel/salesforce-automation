import { App } from "@/utils/types";
import { tryCatch } from "@/utils/utils";

import createApp from "@/app";
import createServer from "@/server";
import config from "@/config";

const startApp = async () => {
  const app: App = createApp(config);
  const server = createServer(config.server);
  app.setupSubscription();
  server.start();
};

(async () => tryCatch(startApp))();
