import { Opportunity, Org } from "@/utils/types";

const createSalesforceOrgCreationEventListener = () => {
  return {
    display: (opp: Opportunity, callback: (orgs: Org[]) => void) => {
      console.log("Display");
      callback([]);
    },
    paidSearch: (opp: Opportunity, callback: (orgs: Org[]) => void) => {
      console.log("Paid Search");
      callback([]);
    },
    seo: (opp: Opportunity, callback: (orgs: Org[]) => void) => {
      console.log("SEO");
      callback([]);
    },
  };
};

export default createSalesforceOrgCreationEventListener;
