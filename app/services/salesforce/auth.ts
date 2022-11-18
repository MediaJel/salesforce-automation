import { ConnectionOptions, Connection } from "jsforce";

const createSalesforceAuth = (params: ConnectionOptions) => {
  return {
    async authenticate() {
      return new Promise<Connection>((resolve, reject) => {
        const client = new Connection(params);

        client.oauth2.refreshToken(params.refreshToken, (err, res) => {
          if (err) {
            console.log("Error refreshing Salesforce token: ", err);
            reject(err);
          }

          const newClient = new Connection({
            accessToken: res.access_token,
            instanceUrl: res["instance_url"],
          });

          resolve(newClient);
        });
      });
    },
  };
};

export default createSalesforceAuth;
