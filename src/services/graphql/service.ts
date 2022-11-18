import { createClient } from "@urql/core";
import { Org } from "@/utils/gql/graphql";

const client = createClient({
  url: process.env.GRAPHQL_ENDPOINT,
  fetchOptions: () => {
    return {
      headers: {
        "X-API-KEY": process.env.GRAPHQL_KEY,
      },
    };
  },
});

const createGraphqlService = () => {
  return {
    async fetchOrgs() {
      const QUERY = ` 
        query test($id: ID!) {
        orgs(where: { id_not: $id }) {
            id
          }
        }`;

      const operation = await client
        .query(QUERY, { id: "cjlwwzv86hn3q0726mqm60q3f" })
        .toPromise();

      return operation.data["orgs"] as Org;
    },
  };
};

export default createGraphqlService;
