import { Connection, ConnectionOptions } from "jsforce";

import { Logger } from "@/utils/types";

const createSalesforceAuth = (opts: ConnectionOptions, logger: Logger) => {
  return {
    async authenticate(): Promise<Connection> {
      logger.info("Authenticating/Reauthenticating to Salesforce");

      // Create the initial connection using full credentials.
      // Make sure opts includes refreshToken, clientId, and clientSecret.
      const client = new Connection(opts);

      try {
        // Wrap the callback-based refreshToken method into a Promise.
        const data = await new Promise<any>((resolve, reject) => {
          client.oauth2.refreshToken(opts.refreshToken, (err, res) => {
            if (err) {
              logger.error({ message: "Error refreshing token", err });
              return reject(err);
            }
            resolve(res);
          });
        });

        // Instead of creating a new connection, update the existing connection.
        client.accessToken = data.access_token;
        client.instanceUrl = data.instance_url;

        logger.debug(`Salesforce OAuth2 Refreshed: ${JSON.stringify(data, null, 2)}`);
        logger.info("Authentication/Reauthentication Successful");

        return client;
      } catch (err) {
        logger.error({ message: "Error authenticating to Salesforce", err });
        throw err;
      }
    },
  };
};

export default createSalesforceAuth;
