import { Config, DataProducer, OrgCreationCandidate } from "@/utils/types";
import createGraphqlService from "@/services/graphql";
import createLogger from "@/utils/logger";

const logger = createLogger("Processor");

const createProcessor = (producer: DataProducer, config: Config) => {
  const graphql = createGraphqlService(config.graphql);
  return {
    async listen() {
      producer.orgs.display(async (org) => {
        console.log("Display");
        this.__recursivelyLog(org);
      });

      producer.orgs.paidSearch(async (org) => {
        console.log("Paid Search");
        console.log(org);
      });

      producer.orgs.seo(async (org) => {
        console.log("SEO");
        console.log(org);
      });
    },

    __recursivelyLog(candidate: OrgCreationCandidate) {
      while (candidate) {
        logger.info(`Org: ${candidate.id}`);
        candidate = candidate.parent;
      }
    },
  };
};

export default createProcessor;
