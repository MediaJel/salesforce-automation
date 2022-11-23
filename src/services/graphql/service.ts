import { createClient } from "@urql/core";
import {
  Feature,
  FeatureActions,
  GetOrgBySalesforceIdQueryVariables,
  GetUserBySalesforceIdOrEmailQueryVariables,
  PartnerLevel,
} from "@/services/graphql/generated/graphql";
import {
  CreateOrgParams,
  CreateUserParams,
  GraphQLConfig,
} from "@/utils/types";

import createLogger from "@/utils/logger";
import createGraphQLQueries from "@/services/graphql/queries";
import createGraphqlMutations from "@/services/graphql/mutations";

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

  const queries = createGraphQLQueries(client, logger);
  const mutations = createGraphqlMutations(client, logger);
  return {
    async createUser(params: CreateUserParams) {
      const isExistingUser = await queries.getUserBySalesforceIdOrEmail({
        salesforceId: params.salesforceId,
        email: params.email,
      });

      if (isExistingUser) {
        logger.debug(`User ${params.salesforceId} already exists`);
        return null;
      }

      const createdUser = await mutations.createUser(params);

      logger.info(`Created User: ${createdUser.id}`);

      return createdUser;
    },
    async createOrg(params: CreateOrgParams) {
      const isExistingOrg = await queries.getOrgBySalesforceId({
        salesforceId: params.salesforceId,
      });

      if (isExistingOrg) {
        logger.warn(`Org ${isExistingOrg.salesforceId} already exists`);
        return null;
      }

      const createdOrg = await mutations.createOrg(params);

      logger.info(`Created org ${createdOrg.id}`);

      return createdOrg;
    },
  };
};

export default createGraphqlService;
