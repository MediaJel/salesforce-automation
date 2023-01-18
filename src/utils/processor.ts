import { DataProducer } from "@/utils/types";

const createProcessor = (producer: DataProducer) => {
  return {
    async listen() {
      producer.listen();
    },
  };
};

export default createProcessor;
