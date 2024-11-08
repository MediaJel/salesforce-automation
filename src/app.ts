import createProcessor from '@/processor/processor';
import createSalesforceProducer from '@/producers/salesforce';
import createServer from '@/server';
import { DataProducer } from '@/utils/types';

import { Config } from './utils/types';

const createApp = (config: Config) => {
  const server = createServer(config.server);
  // const salesforceProducer: DataProducer = createSalesforceProducer(config);
  // const processor = createProcessor(salesforceProducer, config);

  return {
    start() {
      server.start();
      // processor.listen();
    },
  };
};

export default createApp;
