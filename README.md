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
GRAPHQL_ENDPOINT=
GRAPHQL_KEY=
SERVER_KEY=
LOG_LEVEL="DEBUG"
NODE_ENV="development"
PORT=4000
```

## Running the service

To run the service, run the following command

```
yarn dev
```
