import { Config, LogLevel, SalesforceChannel } from "@/utils/types";
import { isProduction, isStaging } from "@/utils/utils";

const config: Config = {
  app: {
    subscription: () => {
      // Subscription configuration if production or staging
      if (isProduction || isStaging) {
        return {
          channel: SalesforceChannel.OpportunitiesUpdate,
          replayId: -2,
        };
      }
      // Subscription configuration if development
      return {
        channel: SalesforceChannel.OpportunitiesUpdateTest,
        replayId: -1,
      };
    },
  },
  salesforce: {
    oauth2: {
      clientId: process.env.SALESFORCE_CLIENT_ID,
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
      redirectUri: process.env.SALESFORCE_REDIRECT_URI,
    },
    accessToken: process.env.SALESFORCE_ACCESS_TOKEN,
    refreshToken: process.env.SALESFORCE_REFRESH_TOKEN,
    instanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    version: "56.0",
  },
  graphql: {
    url: process.env.GRAPHQL_ENDPOINT,
    X_API_KEY: process.env.GRAPHQL_KEY,
  },
  server: {
    port: parseInt(process.env?.PORT) || 4000,
    serverKey: process.env.SERVER_KEY,
  },
  logLevel: (process.env.LOG_LEVEL as LogLevel) || "INFO",
};

export default config;
