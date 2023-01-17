import { DataProducer } from "@/utils/types";

const createProcessor = (provider: DataProducer) => {
  return {
    async listen() {
      provider.org.display((orgs) => {});

      provider.org.paidSearch((orgs) => {});

      provider.org.seo((orgs) => {});

      provider.listenForUsers((users) => {});
    },
  };
};

export default createProcessor;
