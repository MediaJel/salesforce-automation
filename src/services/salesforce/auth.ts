import { Connection, ConnectionOptions } from 'jsforce';

import { Logger } from '@/utils/types';

const createSalesforceAuth = (opts: ConnectionOptions, logger: Logger) => {
  return {
    async authenticate(): Promise<Connection> {
      throw Error("Test");
      return new Promise<Connection>(async (resolve, reject) => {
        logger.info("Authenticating/Reauthenticating to Salesforce");
        const client = new Connection(opts);

        const data = await client.oauth2.refreshToken(opts.refreshToken, (err, res) => {
          if (err) {
            logger.error({ message: "Error authenticating to Salesforce" });
            reject(err);
          }
        });

        const newClient = new Connection({
          accessToken: data.access_token,
          instanceUrl: data["instance_url"],
        });

        logger.info("Authentication/Reauthentication Successful");

        resolve(newClient);
      });
    },
  };
};

export default createSalesforceAuth;
