import { User } from "@/services/graphql/generated/graphql";
import { DataProvider, Org, SalesforceService } from "@/utils/types";
import { Connection, ConnectionOptions } from "jsforce";
import createOrgCreationEventListener from "@/adapters/salesforce/orgs";

const createSalesforceDataProvider = (
  callback: (client: Connection, svc: SalesforceService) => void
): DataProvider => {
  return {
    org: createOrgCreationEventListener(callback),

    async listenForUsers(callback: (users: User[]) => void) {
      // Listen for Users...
    },
  };
};

export default createSalesforceDataProvider;
