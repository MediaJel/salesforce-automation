import Bull from "bull";
import createLogger from "@/utils/logger";

const logger = createLogger("QueueService");

function parseRedisUrl(redisUrl: string) {
  try {
    // Create a URL object to parse the URL
    const url = new URL(redisUrl);

    // Extract components
    const result = {
      host: url.hostname || "localhost",
      port: url.port || "6379", // Default Redis port
      username: url.username || null,
      password: url.password || null,
    };

    return result;
  } catch (error) {
    throw new Error(`Invalid Redis URL: ${error}`);
  }
}

export const createSalesforceQueue = async () => {
  const { host, port, username, password } = parseRedisUrl(process.env.REDIS_URL || "");
  const salesforceQueue = new Bull("salesforce processing", {
    redis: {
      host,
      port: parseInt(port),
      username,
      password,
    },
  });

  // Wait for queue to be ready
  await salesforceQueue.isReady();
  logger.info("Salesforce queue initialized and ready");

  // Log queue events for debugging
  salesforceQueue.on("error", (error) => {
    logger.error({ message: `Queue error: ${error.message}` });
  });

  salesforceQueue.on("waiting", (jobId) => {
    logger.debug(`Job ${jobId} is waiting`);
  });

  salesforceQueue.on("active", (job) => {
    logger.debug(`Job ${job.id} is active`);
  });

  salesforceQueue.on("completed", (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  salesforceQueue.on("failed", (job, err) => {
    logger.error({ message: `Job ${job.id} failed: ${err.message}` });
  });

  return salesforceQueue;
};
