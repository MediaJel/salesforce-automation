import { Config, DataProducer, OrgCreationCandidate } from "@/utils/types";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";
import { DEFAULT_ORG } from "@/constants";

const logger = createLogger("Processor");

const log = (msg?: string, data?: any) => {
  const json = { message: msg, data };
  logger.info(JSON.stringify(json, null, 2));
};

const createProcessor = (producer: DataProducer, config: Config) => {
  const graphql = createGraphqlService(config.graphql);

  return {
    async listen() {
      producer.orgs.display(async (candidates) => {
        log("Received Display Org Candidates", candidates);
        candidates = await this.__sort(candidates);
        const orgs = await this.__createOrgs(candidates);
        log("Created Display Orgs", orgs);
      });

      producer.orgs.paidSearch(async (candidates) => {
        // log("Received Paid Search Org Candidates", candidates);
        // candidates = await this.__sort(candidates);
        // console.log(candidates);
        // const orgs = await this.__createOrgs(candidates);
        // log("Created Paid Search Orgs", orgs);
      });

      producer.orgs.seo(async (candidates) => {
        // log("Received SEO Org Candidates", candidates);
        // candidates = await this.__sort(candidates);
        // console.log(candidates);
        // const orgs = await this.__createOrgs(candidates);
        // log("Created SEO Orgs", orgs);
      });
    },

    async __sort(arr: OrgCreationCandidate[]) {
      // Organizes the array so that it is in the correct order for Org creation
      // (I.E. The parent org is created before the child org)
      const sorted = arr.sort((a, b) => {
        if (a.parentId === b.id) return 1;
        if (a.id === b.parentId) return -1;
        return 0;
      });
      return sorted;
    },

    async __createOrgs(arr: OrgCreationCandidate[]) {
      const promises = arr.map(async (candidate) => {
        const { id, name, description, parentId } = candidate;

        const parentOrg = await graphql.queries.getOrgBySalesforceId({
          salesforceId: parentId,
        });

        const org = await graphql.findOrCreateOrg({
          name,
          salesforceId: id,
          description,
          parentOrgId: parentOrg?.id || DEFAULT_ORG,
        });

        return org;
      });

      return await Promise.all(promises);
    },
  };
};

export default createProcessor;
