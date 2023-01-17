import { Connection } from "jsforce";
import {
  Opportunity,
  Org,
  OrgCreationEventListener,
  SalesforceService,
} from "@/utils/types";

const createSalesforceOrgCreationEventListener = (
  opportunity: Opportunity
): OrgCreationEventListener => {
  console.log(opportunity);
  return {
    display: (callback: (orgs: Org[]) => void) => {},
    paidSearch: (callback: (orgs: Org[]) => void) => {},
    seo: (callback: (orgs: Org[]) => void) => {},
  };
};

export default createSalesforceOrgCreationEventListener;
