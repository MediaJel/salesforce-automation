import { ConnectionOptions, Connection } from "jsforce";
import { Logger } from "@/utils/types";

const createSalesforceAuth = (opts: ConnectionOptions, logger: Logger) => {
  return {
    async authenticate(): Promise<Connection> {
      return new Promise<Connection>((resolve, reject) => {
        const client = new Connection(opts);

        client.oauth2.refreshToken(opts.refreshToken, (err, res) => {
          if (err) {
            logger.error("Error Refreshing Salesforce token");
            reject(err);
          }

          const newClient = new Connection({
            accessToken: res.access_token,
            instanceUrl: res["instance_url"],
          });

          logger.success("Authenticated to Salesforce");

          resolve(newClient);
        });
      });
    },
  };
};

export default createSalesforceAuth;
