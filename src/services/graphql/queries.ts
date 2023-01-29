import { Client } from "@urql/core";
import { Logger } from "@/utils/types";
import {
  GetOrgBySalesforceIdQueryVariables,
  GetUserBySalesforceIdOrEmailQueryVariables,
} from "@/services/graphql/generated/graphql";

import queries from "@/services/graphql/resolvers/queries";

const createGraphQLQueries = (client: Client, logger: Logger) => {
  return {
    async getOrgBySalesforceId(params: GetOrgBySalesforceIdQueryVariables) {
      if (!params.salesforceId) return;

      const operation = await client
        .query(queries.GET_ORG_BY_SALESFORCE_ID, {
          salesforceId: params.salesforceId,
        })
        .toPromise()
        .catch((err) => {
          throw err;
        });

      if (operation?.error) {
        logger.error({ message: "getOrgBySalesforceId failed", ...params });
        logger.error(operation.error);
        return null;
      }

      if (operation?.data?.orgs.length === 0) {
        logger.warn(`Org ${params.salesforceId} does not exist`);
        return null;
      }

      logger.info(`Org ${operation.data.orgs[0].name} already exists`);

      return operation.data.orgs[0];
    },

    async getUserBySalesforceIdOrEmail(
      params: GetUserBySalesforceIdOrEmailQueryVariables
    ) {
      const operation = await client
        .query(queries.GET_USER_BY_SALESFORCE_ID_OR_EMAIL, {
          salesforceId: params.salesforceId,
          email: params.email,
        })
        .toPromise()
        .catch((err) => {
          throw err;
        });

      if (operation?.error) {
        logger.error({
          message: "getUserBySalesforceIdOrEmail failed",
          ...params,
        });
        logger.error(operation.error);
        return null;
      }

      if (operation?.data?.users.length === 0) {
        logger.debug(`User ${params.salesforceId} does not exist`);
        return null;
      }

      return operation.data.users[0];
    },
  };
};

export default createGraphQLQueries;
