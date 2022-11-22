import { ConnectionOptions } from "jsforce";
import { App } from "@/utils/types";
import { tryCatch } from "@/utils/utils";

import createApp from "@/app";
import config from "@/config";

const startApp = async () => {
  const app: App = createApp(config);
  await app.setupSubscription();
};

(async () => tryCatch(startApp))();
