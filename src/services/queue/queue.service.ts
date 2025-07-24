import Bull from "bull";
import createLogger from "@/utils/logger";

const logger = createLogger("QueueService");

export const createSalesforceQueue = async () => {
  const salesforceQueue = new Bull("salesforce processing", {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
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