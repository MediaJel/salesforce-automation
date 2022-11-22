import { createClient } from "@urql/core";
import { PartnerLevel } from "@/services/graphql/generated/graphql";
import {
  CreateOrgParams,
  CreateUserParams,
  GraphQLConfig,
} from "@/utils/types";

import queries from "@/services/graphql/resolvers/queries";
import mutations from "@/services/graphql/resolvers/mutations";
import createLogger from "../../utils/logger";

const logger = createLogger("GraphQL Service");

const createGraphqlService = (config: GraphQLConfig) => {
  const client = createClient({
    url: config.url,
    fetchOptions: () => {
      return {
        headers: {
          "X-API-KEY": config.X_API_KEY,
        },
      };
    },
  });
  return {
    async getOrgByName(name: string) {
      const operation = await client
        .query(queries.GET_ORG_BY_NAME, { name })
        .toPromise()
        .catch((err) => {
          throw new Error(`Getting Org by Name: ${name}`, { cause: err });
        });

      logger.success(`Got Org by Name: ${operation.data.org.name}`);

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
          throw new Error("Error creating user: " + err);
        });

      logger.success(`Created User: ${operation.data.createDashboardUser.id}`);

      return operation.data.createDashboardUser;
    },
    async createOrg({ name, description }: CreateOrgParams) {
      const isExistingOrg = await this.getOrgByName(name);

      if (isExistingOrg) {
        throw new Error("Org already exists");
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
        .toPromise()
        .catch((err) => {
          throw new Error("Error creating org: " + err);
        });

      logger.success(`Created Org: ${operation.data.createOrg.id}`);

      return operation.data.createOrg;
    },
  };
};

export default createGraphqlService;
