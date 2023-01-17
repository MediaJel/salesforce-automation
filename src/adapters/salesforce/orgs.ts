import { ConnectionOptions, Connection } from "jsforce";
import { Org, OrgCreationEvent, SalesforceService } from "@/utils/types";

const createOrgCreationEventListener = (
  params: ConnectionOptions,
  callback: (client: Connection, svc: SalesforceService) => void
): OrgCreationEvent => {
  return {
    display: (callback: (orgs: Org[]) => void) => {},
    paidSearch: (callback: (orgs: Org[]) => void) => {},
    seo: (callback: (orgs: Org[]) => void) => {},
  };
};

export default createOrgCreationEventListener;
