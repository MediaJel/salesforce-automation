import { Client } from "@urql/core";
import { Logger } from "@/utils/types";
import {
  GetOrgBySalesforceIdQueryVariables,
  GetUserBySalesforceIdOrEmailQueryVariables,
} from "@/services/graphql/generated/graphql";

import queries from "@/services/graphql/resolvers/queries";

const createGraphQLQueries = (client: Client, logger: Logger) => {
  return {
    async getOrgBySalesforceId({
      salesforceId,
    }: GetOrgBySalesforceIdQueryVariables) {
      const operation = await client
        .query(queries.GET_ORG_BY_SALESFORCE_ID, {
          salesforceId,
        })
        .toPromise()
        .catch((err) => {
          throw err;
        });

      if (operation?.error) {
        throw operation.error;
      }

      if (operation?.data?.orgs.length) {
        logger.debug(`Org ${salesforceId} does not exist`);
        return null;
      }

      return operation.data.orgs[0];
    },

    async getUserBySalesforceIdOrEmail({
      salesforceId,
      email,
    }: GetUserBySalesforceIdOrEmailQueryVariables) {
      const operation = await client
        .query(queries.GET_USER_BY_SALESFORCE_ID_OR_EMAIL, {
          salesforceId,
          email,
        })
        .toPromise()
        .catch((err) => {
          throw err;
        });

      if (operation?.error) {
        throw operation.error;
      }

      if (!operation?.data?.users.length) {
        logger.debug(`User ${salesforceId} does not exist`);
        return null;
      }

      return operation.data.users[0];
    },
  };
};

export default createGraphQLQueries;
