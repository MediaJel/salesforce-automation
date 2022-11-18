import { ConnectionOptions } from "jsforce";
import createApp from "@/app";

const startApp = async () => {
  const options: ConnectionOptions = {
    oauth2: {
      clientId: process.env.SALESFORCE_CLIENT_ID,
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
      redirectUri: process.env.SALESFORCE_REDIRECT_URI,
    },
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
    refreshToken: process.env.SALESFORCE_REFRESH_TOKEN,
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    version: "56.0",
  };

  const app = createApp(options);

  await app.run();
};

(async () => {
  try {
    await startApp();
  } catch (error) {
    console.error("Application error:", error);
  }
})();
