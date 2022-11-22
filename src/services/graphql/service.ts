import { createClient } from "@urql/core";
import {
  Feature,
  FeatureActions,
  PartnerLevel,
} from "@/services/graphql/generated/graphql";
import {
  CreateOrgParams,
  CreateUserParams,
  GraphQLConfig,
} from "@/utils/types";

import queries from "@/services/graphql/resolvers/queries";
import mutations from "@/services/graphql/resolvers/mutations";
import createLogger from "@/utils/logger";

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
      logger.debug(`Running getOrgByName: ${name}`);

      const operation = await client
        .query(queries.GET_ORG_BY_NAME, { name })
        .toPromise()
        .catch((err) => {
          logger.error("Error running getOrgByName", err);
          throw new Error(`Getting Org by Name: ${name}`, { cause: err });
        });

      if (!operation.data?.org) {
        logger.info(`No org found with name: ${name}`);
        return null;
      }

      logger.debug(`Got org by name: ${operation?.data?.org?.id}`);

      return operation.data.org;
    },

    async createUser(params: CreateUserParams) {
      logger.debug(`Running createUser: ${params.name}`);

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
          logger.error("Error running createUser");
          throw err;
        });

      if (!operation.data?.createDashboardUser) {
        logger.warn(`Unable to create user: ${params.name}`);
        return;
      }

      logger.debug(`Created User: ${operation.data.createDashboardUser.id}`);

      return operation.data.createDashboardUser;
    },
    async createOrg({ name, description }: CreateOrgParams) {
      const isExistingOrg = await this.getOrgByName(name);

      if (isExistingOrg) {
        logger.warn(`Org already exists: ${name}`);
        return null;
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
          roleitems: [
            {
              feature: Feature.Enabled,
              actions: {
                set: [FeatureActions.Read, FeatureActions.Write],
              },
            },
          ], //! THESE MUST BE ENABLED OTHERWISE USER CANT BE DELETED
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
          logger.error("Error running createOrg");
          throw err;
        });

      logger.debug(`Created Org: ${operation.data.createOrg.id}`);

      return operation.data.createOrg;
    },
  };
};

export default createGraphqlService;
