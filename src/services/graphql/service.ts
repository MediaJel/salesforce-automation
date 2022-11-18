import { createClient } from "@urql/core";

const client = createClient({
  url: process.env.GRAPHQL_ENDPOINT,
  fetchOptions: () => {
    const key = process.env.GRAPHQL_KEY;
    return {
      headers: {
        "X-API-KEY": key,
      },
    };
  },
});
