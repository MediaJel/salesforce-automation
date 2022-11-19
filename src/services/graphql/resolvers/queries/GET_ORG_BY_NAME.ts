import { graphql } from "@/services/graphql/generated";

//! TODO: Use Salesforce ID field to query for orgs once implemented
const GET_ORG_BY_NAME = graphql(`
  query GET_ORG_BY_NAME($name: String!) {
    org(where: { name: $name }) {
      id
      name
    }
  }
`);

export default GET_ORG_BY_NAME;
