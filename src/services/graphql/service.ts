import { createClient } from "@urql/core";
import { PartnerLevel } from "@/services/graphql/generated/graphql";
import queries from "@/services/graphql/resolvers/queries";
import mutations from "@/services/graphql/resolvers/mutations";

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
    async createOrg() {
      const operation = await client
        .mutation(mutations.CREATE_ORG, {
          name: "SALESFORCE ACCOUNT NAME",
          description: "SALESFORCE ACCOUNT ID",
          website: "",
          level: PartnerLevel.Standard,
          appIds: [],
          chatWootId: "",
          config: {},
          cpm: "7",
          domain: null,
          googleCustomerId: null,
          logoId: null,
          reTargeting: false,
          roleitems: [],
          seo: false,
          signInLogoId: null,
          storageBucket: null,
          tradeDeskIdentifier: null,
          viewId: null,
          isGA4: false,
          parentOrgs: [{ id: "cjlwwzv86hn3q0726mqm60q3f" }],
        })
        .toPromise();

      return operation.data.createOrg;
    },
  };
};

export default createGraphqlService;