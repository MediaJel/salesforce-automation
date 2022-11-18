import { graphql } from "@/utils/gql-types";

const GET_ORG = graphql(`
  query getOrg($id: ID!) {
    orgs(where: { id_not: $id }) {
      id
    }
  }
`);

export default GET_ORG;
