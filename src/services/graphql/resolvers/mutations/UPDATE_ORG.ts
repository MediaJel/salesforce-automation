import { graphql } from "@/services/graphql/generated";

const UPDATE_ORG = graphql(`
  mutation updateOrg($name: String!, $salesforceId: String!) {
    updateOrg(where: { name: $name }, data: { salesforceId: $salesforceId }) {
      id
      name
      salesforceId
    }
  }
`);


export default