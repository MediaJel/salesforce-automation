import createLogger from "@/utils/logger";
import { processorState } from "@/processor";

const logger = createLogger("Limiter");

const createLimiter = <T = any>(limit: number) => {
  const list = [];

  return {
    add: (item: T) => {
      if (list.length >= limit) {
        logger.warn("Limiter is full, Disabling App State");
        processorState.disable();
      }
      const remaining = limit - list.length;
      const remainingObjects = remaining > 0 ? remaining : 0;
      logger.warn(`You can create ${remainingObjects} more objects`);
      list.push(item);
    },
  };
};

export default createLimiter;
