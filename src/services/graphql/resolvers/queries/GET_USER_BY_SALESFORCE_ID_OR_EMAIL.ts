import { graphql } from "@/services/graphql/generated";

const GET_USER_BY_SALESFORCE_ID_OR_EMAIL = graphql(`
  query getUsersBySalesforceIdOrEmail($salesforceId: String!, $email: String!) {
    users(where: { OR: [{ salesforceId: $salesforceId }, { email: $email }] }) {
      id
      username
      email
    }
  }
`);

export default GET_USER_BY_SALESFORCE_ID_OR_EMAIL;
