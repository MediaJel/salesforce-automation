import { createClient } from "redis";

import createLogger from "@/utils/logger";
import { IntuitAuthResponse } from "@/utils/types";

const logger = createLogger("Redis Service");
const redisService = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  await client.connect();
  client.on("connect", () => {
    logger.info("Connected to Redis");
  });
  client.on("error", (error) => {
    logger.error({ message: "Error connecting to Redis", error });
  });

  return {
    setIntuitAuthTokens: async (token: IntuitAuthResponse) => {
      logger.debug(`Setting Intuit Auth Tokens: ${JSON.stringify(token, null, 2)}`);
      logger.info("Setting Intuit Auth Tokens");
      await client.set("intuit_auth_tokens", JSON.stringify(token));
    },
    getIntuitTokens: async (): Promise<IntuitAuthResponse | null> => {
      const value = await client.get("intuit_auth_tokens");
      logger.debug(`Getting Intuit Auth Tokens: ${value}`);
      logger.info("Getting Intuit Auth Tokens");
      if (!value) return null;
      return JSON.parse(value) as IntuitAuthResponse;
    },
  };
};

export default redisService;
