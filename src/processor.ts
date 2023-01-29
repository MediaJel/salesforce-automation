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
        console.log(candidates);
      });

      producer.orgs.paidSearch(async (candidates) => {
        log("Received Paid Search Org Candidates", candidates);
        candidates = await this.__sort(candidates);
        console.log(candidates);
      });

      producer.orgs.seo(async (candidates) => {
        log("Received SEO Org Candidates", candidates);
        candidates = await this.__sort(candidates);
        console.log(candidates);
      });
    },

    async __sort(arr: OrgCreationCandidate[]) {
      const sorted = arr.sort((a, b) => {
        if (a.parentId === b.id) return 1;
        if (a.id === b.parentId) return -1;
        return 0;
      });
      return sorted;
    },
  };
};

export default createProcessor;
