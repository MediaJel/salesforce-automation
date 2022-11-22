import { Config } from "@/utils/types";

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
    X_API_KEY: process.env.GRAPHQL_API_KEY,
  },
};

export default config;
