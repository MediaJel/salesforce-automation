# Salesforce Automation Microservice

This microservice automatically creates Orgs, Users, Campaign Orders, and many
other entities for the MediaJel platform. This microservice listens to events from Salesforce in
real time and creates the appropriate entities.

## Installation

Ensure you have the following dependencies installed

```
node >= 18.12.1
yarn >= 1.22.19
```

Clone the repository and install dependencies

```
git clone https://github.com/MediaJel/salesforce-automation.git
cd salesforce-automation
yarn install
```

## Environment Variables

The following environment variables are required, reach out to
Devops for the values

```
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_ACCESS_TOKEN=
SALESFORCE_REFRESH_TOKEN=
SALESFORCE_INSTANCE_URL=
GRAPHQL_ENDPOINT=graphql.dmp.mediajel.ninja
GRAPHQL_KEY=
SERVER_KEY=
LOG_LEVEL="DEBUG"
NODE_ENV="development"
PORT=4000
```

## Generating the Refresh token/Access tokens

You may need to comment out the producer/consumer code in the `app.ts` file, and only let remain the server and server.start code

To use the salesforce-automation service, you'll need the following environment variables

```.env
SALESFORCE_ACCESS_TOKEN=
SALESFORCE_REFRESH_TOKEN=
```

If the user associated with the service is inactive, you may not be able to authenticate to Salesforce correctly, you'll get the following error:

```json
{
    "invalid_grant": "user is inactive"
}
```

To remediate this, run the server and go to `http://localhost:1234/salesforce/login`

Login with the user that this service uses to authenticate requests and then after authenticating, you should receive the tokens from the response.

```
{
  "accessToken": "<access_token>",
  "instanceUrl": "<instance_url>",
  "refreshToken": "<refresh_token>"
}
```

## Running the service

To run the service, run the following command:
```
yarn dev
```

In Kubernetes:
```
kubectl port-forward svc/salesforce-automation 4040
```
