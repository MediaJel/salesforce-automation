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
      producer.orgs.display(async (candidate) => {
        const { user, ...data } = candidate;
        log("Received Display Org Candidates", candidate);
        const orgs = await this.__processOrgCandidates(data);
      });

      producer.orgs.paidSearch(async (org) => {
        log("Received Paid Search Org Candidates", org);
      });

      producer.orgs.seo(async (org) => {
        log("Received SEO Org Candidates", org);
      });
    },

    async __processOrgCandidates(data: Omit<OrgCreationCandidate, "user">) {
      const { name, id, description, parent } = data;

      // log("Processing Org", data);

      // if (!parent?.id) {
      //   return await graphql.findOrCreateOrg({
      //     name,
      //     salesforceId: id,
      //     description,
      //     parentOrgId: DEFAULT_ORG,
      //   });
      // }

      // const createdOrg = await graphql.findOrCreateOrg({
      //   name,
      //   salesforceId: id,
      //   description,
      //   parentOrgId: parent.id,
      // });

      // return await this.__processOrgCandidates();
    },
  };
};

export default createProcessor;
