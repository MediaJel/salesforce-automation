import { createClient } from "@urql/core";
import { PartnerLevel } from "@/services/graphql/generated/graphql";
import { CreateOrgParams, CreateUserParams } from "@/utils/types";

import * as util from "util";
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
    async getOrgs() {
      const operation = await client
        .query(queries.GET_ORG, { id: "cjlwwzv86hn3q0726mqm60q3f" })
        .toPromise();

      return operation.data.orgs;
    },
    async getOrgByName(name: string) {
      const operation = await client
        .query(queries.GET_ORG_BY_NAME, { name })
        .toPromise();

      return operation.data.org;
    },

    async createUser(params: CreateUserParams) {
      const operation = await client
        .mutation(mutations.CREATE_USER, {
          email: params.email,
          config: {
            articles: false,
            campaignSummary: false,
            canResetPasswords: false,
            exportData: false,
            hasInsights: false,
            isAdmin: false,
            isDemo: false,
            isPacing: false,
            isPartner: false,
            isProcessor: false,
            isSelfService: false,
            isTrafficker: false,
            pastData: false,
            priceVisible: false,
            providersVisible: false,
            segment: false,
            technicalSupport: false,
          },
          orgId: params.orgId,
          name: params.name,
          phone: params.phone,
          username: params.username,
          avatar: null,
          roleItems: [],
        })
        .toPromise()
        .catch((err) => {
          throw new Error(err);
        });

      return operation.data.createDashboardUser;
    },
    async createOrg({ name, description }: CreateOrgParams) {
      const isExistingOrg = await this.getOrgByName(name);

      if (isExistingOrg) {
        throw "Org already exists";
      }

      const operation = await client
        .mutation(mutations.CREATE_ORG, {
          name,
          description,
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
