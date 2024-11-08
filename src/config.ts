import { DEFAULT_LOG_LEVEL, DEFAULT_SERVER_PORT } from '@/constants';
import { Config, LogLevel, SalesforceChannel } from '@/utils/types';
import { isProduction, isStaging } from '@/utils/utils';

const config: Config = {
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
    port: parseInt(process.env?.PORT) || DEFAULT_SERVER_PORT,
    serverKey: process.env.SERVER_KEY,
  },
  logLevel: (process.env.LOG_LEVEL as LogLevel) || DEFAULT_LOG_LEVEL,
};

export default config;
