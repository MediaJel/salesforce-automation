import { User } from "@/services/graphql/generated/graphql";
import { DataProvider, Org, SalesforceService } from "@/utils/types";
import { Connection, ConnectionOptions } from "jsforce";
import createOrgCreationEventListener from "@/adapters/salesforce/orgs";

const createSalesforceDataProvider = (
  params: ConnectionOptions,
  callback: (client: Connection, svc: SalesforceService) => void
): DataProvider => {
  return {
    org: createOrgCreationEventListener(params, callback),

    async listenForUsers(callback: (users: User[]) => void) {
      // Listen for Users...
    },
  };
};

export default createSalesforceDataProvider;
