import { DataProducer } from "@/utils/types";

const createProcessor = (producer: DataProducer) => {
  return {
    async listen() {
      producer.listenForDisplayOrgs((org) => {
        console.log(org);
      });
    },
  };
};

export default createProcessor;
