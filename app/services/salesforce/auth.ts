import * as jsforce from "jsforce";

const createSalesforceAuth = (params: jsforce.ConnectionOptions) => {
  return {
    async authenticate() {
      return new Promise<jsforce.Connection>((resolve, reject) => {
        const client = new jsforce.Connection(params);

        client.oauth2.refreshToken(params.refreshToken, (err, res) => {
          if (err) {
            console.log("Error refreshing Salesforce token: ", err);
            reject(err);
          }

          const newClient = new jsforce.Connection({
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
