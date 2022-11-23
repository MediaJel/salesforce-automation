import { graphql } from "@/services/graphql/generated";

//! TODO: Use Salesforce ID field to query for orgs once implemented
const GET_ORG_BY_SALESFORCE_ID = graphql(`
  query GET_ORG_BY_SALESFORCE_ID($salesforceId: String!) {
    orgs(where: { salesforceId: $salesforceId }) {
      id
      salesforceId
      name
    }
  }
`);

export default GET_ORG_BY_SALESFORCE_ID;
