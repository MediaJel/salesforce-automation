import { createClient } from "@urql/core";
import {
  CreateOrgParams,
  CreateUserParams,
  FindOrCreateOrgParams,
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
    queries,
    mutations,
    async findOrCreateUser(params: CreateUserParams) {
      const foundUser = await queries.getUserBySalesforceIdOrEmail({
        salesforceId: params.salesforceId,
        email: params.email,
      });

      if (foundUser) {
        logger.info(`User ${params.salesforceId} already exists`);
        return foundUser;
      }

      const createdUser = await mutations.createUser(params);

      return createdUser;
    },
    async findOrCreateOrg(params: FindOrCreateOrgParams) {
      const foundOrg = await queries.getOrgBySalesforceId({
        salesforceId: params.salesforceId,
      });

      if (foundOrg) {
        logger.warn(`Org ${foundOrg.salesforceId} already exists`);
        return foundOrg;
      }

      const createOrg: CreateOrgParams = {
        name: params.name,
        salesforceId: params.salesforceId,
        description: params.description,
        parentOrgId: params.salesforceParentId,
      };

      const createdOrg = await mutations.createOrg(createOrg);

      return createdOrg;
    },
  };
};

export default createGraphqlService;
