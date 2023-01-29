import { Config, DataProducer, OrgCreationCandidate } from "@/utils/types";
import { DEFAULT_ORG } from "@/constants";

import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

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

        const sorted = await this.__sort(candidates);

        log("Sorted Display Org Candidates", sorted);

        const orgs = await this.__createOrgs(sorted);
      });

      producer.orgs.paidSearch(async (candidates) => {});

      producer.orgs.seo(async (candidates) => {});
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

    async __createOrgs(candidates: OrgCreationCandidate[]) {
      for (const candidate of candidates) {
        const { id, name, description, parentId } = candidate;
        // Fix this. parentOrg.Id returning null

        const parentOrg = await graphql.queries.getOrgBySalesforceId({
          salesforceId: parentId,
        });

        const childOrg = await graphql.findOrCreateOrg({
          name,
          salesforceId: id,
          description,
          parentOrgId: parentOrg?.id || DEFAULT_ORG,
        });
      }
    },
  };
};

export default createProcessor;
