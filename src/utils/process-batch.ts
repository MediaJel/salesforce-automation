import createLogger from "./logger";
import { sleep } from "./sleep";

const logger = createLogger("Process Batch");

// Process items in batches with concurrency control
export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5,
  delayBetweenBatches: number = 1000
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    logger.info(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)} (${batch.length} items)`
    );

    const batchPromises = batch.map(processor);
    const batchResults = await Promise.allSettled(batchPromises);

    // Process results and handle failures
    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        logger.error({ message: `Failed to process item ${i + j}: ${result.reason}` });
        // You might want to push a default/error result here
        // depending on your needs
      }
    }

    // Delay between batches to be nice to the API
    if (i + batchSize < items.length) {
      await sleep(delayBetweenBatches);
    }
  }

  return results;
};
