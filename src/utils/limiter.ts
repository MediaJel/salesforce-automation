import createLogger from "@/utils/logger";
import { isProduction } from "@/utils/utils";

const logger = createLogger("Limiter");

const createLimiter = <T = {}>(limit: number) => {
  const list = [];

  return {
    add: (item: T) => {
      if (isProduction) {
        return null;
      }
      if (limit && list.length >= limit) {
        logger.warn("Limiter is full, Closing application");
        process.exit(0);
      }

      logger.warn(`You can create ${limit - list.length} more objects`);
      list.push(item);
    },
  };
};

export default createLimiter;
