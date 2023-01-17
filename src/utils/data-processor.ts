import { DataProvider } from "@/utils/types";

const createDataProcessor = (provider: DataProvider) => {
  return {
    async listen() {
      provider.org.display((orgs) => {});

      provider.org.paidSearch((orgs) => {});

      provider.org.seo((orgs) => {});

      // Listen for Users...
      provider.listenForUsers((users) => {
        // Process Users...
      });
    },
  };
};
