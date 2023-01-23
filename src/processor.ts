import { Config, DataProducer } from "@/utils/types";
import createGraphqlService from "@/services/graphql";

const createProcessor = (producer: DataProducer, config: Config) => {
  const graphql = createGraphqlService(config.graphql);
  return {
    async listen() {
      producer.orgs.display(async (org) => {
        console.log("Display");
        console.log(org);
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
  };
};

export default createProcessor;
