import { createClient } from "@urql/core";
import {
  Feature,
  FeatureActions,
  PartnerLevel,
} from "@/services/graphql/generated/graphql";
import {
  CreateOrgParams,
  CreateUserParams,
  GetOrgBySalesforceIdParams,
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
    async getOrgBySalesforceId({ salesforceId }: GetOrgBySalesforceIdParams) {
      logger.debug(`Running getOrgBySalesforceId: ${salesforceId}`);

      const operation = await client
        .query(queries.GET_ORG_BY_SALESFORCE_ID, {
          salesforceId,
        })
        .toPromise()
        .catch((err) => {
          logger.error("Error running getOrgBySalesforceId");
          throw err;
        });

      logger.debug(`getOrgBySalesforceId result ${operation.data.orgs[0].id}`);

      return operation.data.orgs[0].id;
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
    async createOrg({ name, description, salesforceId }: CreateOrgParams) {
      const isExistingOrg = await this.getOrgBySalesforceId({
        salesforceId,
      });

      if (isExistingOrg) {
        logger.warn(`Org already exists: ${name}`);
        return;
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
