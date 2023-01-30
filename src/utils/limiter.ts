import createLogger from "@/utils/logger";
import { isProduction } from "@/utils/utils";
import appState from "@/state";

const logger = createLogger("Limiter");

const createLimiter = <T = any>(limit: number) => {
  const list = [];

  return {
    add: (item: T) => {
      if (isProduction) {
        return null;
      }
      if (list.length >= limit) {
        logger.warn("Limiter is full, Disabling App State");
        appState.disable();
      }

      logger.warn(`You can create ${limit - list.length} more objects`);
      list.push(item);
    },
  };
};

export default createLimiter;
