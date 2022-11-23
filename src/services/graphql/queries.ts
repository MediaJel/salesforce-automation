import { Client } from "urql";
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
          logger.error("Error running getOrgBySalesforceId");
          throw err;
        });

      logger.debug(`getOrgBySalesforceId result ${operation.data.orgs[0].id}`);

      return operation.data.orgs[0].id;
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
          logger.error("Error running getUserBySalesforceIdOrEmail");
          throw err;
        });

      logger.debug(
        `getUserBySalesforceIdOrEmail result ${operation.data.users[0].id}`
      );

      return operation.data.users[0].id;
    },
  };
};

export default createGraphQLQueries;
