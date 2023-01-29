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
    requestPolicy: "network-only",
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
        return foundUser;
      }

      const createdUser = await mutations.createUser(params);

      return createdUser;
    },
    async findOrCreateOrg(params: CreateOrgParams) {
      const foundOrg = await queries.getOrgBySalesforceId({
        salesforceId: params.salesforceId,
      });

      if (foundOrg) return foundOrg;

      const createdOrg = await mutations.createOrg(params);

      if (createdOrg) return createdOrg;

      // If we get here, something went wrong, attempt to update Org's salesforce Id
      const updatedOrg = await mutations.updateOrg(params);

      if (updatedOrg) return updatedOrg;

      logger.error({
        message: `Failed to update org ${params.name} with Salesforce ID ${params.salesforceId}`,
      });
      return null;
    },
  };
};

export default createGraphqlService;
