import { Connection } from "jsforce";
import {
  Org,
  OrgCreationEventListener,
  SalesforceService,
} from "@/utils/types";

const createSalesforceOrgCreationEventListener =
  (): // service: (client: Connection, svc: SalesforceService) => void
  OrgCreationEventListener => {
    return {
      display: (callback: (orgs: Org[]) => void) => {},
      paidSearch: (callback: (orgs: Org[]) => void) => {},
      seo: (callback: (orgs: Org[]) => void) => {},
    };
  };

export default createSalesforceOrgCreationEventListener;
