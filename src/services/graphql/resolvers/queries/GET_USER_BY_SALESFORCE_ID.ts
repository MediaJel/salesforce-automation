import { graphql } from "@/services/graphql/generated";

const GET_USER_BY_SALESFORCE_ID = graphql(`
  query SalesforceUsers($salesforceId: String!) {
    users(where: { salesforceId: $salesforceId }) {
      id
      email
      username
    }
  }
`);

export default GET_USER_BY_SALESFORCE_ID;
