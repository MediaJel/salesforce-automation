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
        const orgs = await this.__processOrgCandidates(candidates);
      });

      producer.orgs.paidSearch(async (org) => {
        log("Received Paid Search Org Candidates", org);
      });

      producer.orgs.seo(async (org) => {
        log("Received SEO Org Candidates", org);
      });
    },

    async __processOrgCandidates(candidates: OrgCreationCandidate[]) {
    // candidates.map(async (candidate) => {
    //   graphql.findOrCreateOrg({
    //     name: candidate.name,
    //     salesforceId: candidate.id,
    //     description: candidate.description,
    //     parentOrgId: candidate.parentId,
    //   })
    // });
    },
  };
};

export default createProcessor;
