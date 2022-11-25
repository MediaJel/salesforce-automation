import { createClient } from "@urql/core";
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
    url: process.env.GRAPHQL_KEY,
    fetchOptions: () => {
      return {
        headers: {
          "X-API-KEY": process.env.X_API_KEY,
        },
      };
    },
  });

  const queries = createGraphQLQueries(client, logger);
  const mutations = createGraphqlMutations(client, logger);
  return {
    async findOrCreateUser(params: CreateUserParams) {
      const foundUser = await queries.getUserBySalesforceIdOrEmail({
        salesforceId: params.salesforceId,
        email: params.email,
      });

      if (foundUser) {
        logger.debug(`User ${params.salesforceId} already exists`);
        return foundUser;
      }

      const createdUser = await mutations.createUser(params);

      return createdUser;
    },
    async findOrCreateOrg(params: CreateOrgParams) {
      const foundOrg = await queries.getOrgBySalesforceId({
        salesforceId: params.salesforceId,
      });

      if (foundOrg) {
        logger.warn(`Org ${foundOrg.salesforceId} already exists`);
        return foundOrg;
      }

      const createdOrg = await mutations.createOrg(params);

      return createdOrg;
    },
  };
};

export default createGraphqlService;
