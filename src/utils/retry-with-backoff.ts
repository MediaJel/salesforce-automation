import createLogger from "./logger";
import { sleep } from "./sleep";

const logger = createLogger("Retry With Backoff");

// Retry function with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 10,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if it's a rate limit error (429)
      if (error.status === 429 || error.code === 429 || error.message?.includes("429")) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          const jitter = Math.random() * 1000; // Add some randomness
          const totalDelay = delay + jitter;

          logger.warn(
            `Rate limited (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${Math.round(totalDelay)}ms`
          );
          await sleep(totalDelay);
          continue;
        }
      }

      // If not a rate limit error, or we've exhausted retries, throw immediately
      throw error;
    }
  }

  throw lastError!;
};
