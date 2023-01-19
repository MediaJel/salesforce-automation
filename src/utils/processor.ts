import { Config, DataProducer } from "@/utils/types";
import createGraphqlService from "@/services/graphql";

const createProcessor = (producer: DataProducer, config: Config) => {
  const graphql = createGraphqlService(config.graphql);
  return {
    async listen() {
      producer.listenForDisplayOrgs((org) => {
        console.log(org);
      });
    },
  };
};

export default createProcessor;
