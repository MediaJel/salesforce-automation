import { createClient } from "@urql/core";
import queries from "@/services/graphql/resolvers/queries";

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
      const operation = await client
        .query(queries.GET_ORG, { id: "cjlwwzv86hn3q0726mqm60q3f" })
        .toPromise();

      return operation.data.orgs;
    },
  };
};

export default createGraphqlService;
