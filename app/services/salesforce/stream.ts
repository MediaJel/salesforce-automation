import { StreamingExtension, Connection, StreamingMessage } from "jsforce";
import { SalesforceStreamSubscriptionParams } from "@/services/salesforce/types";

const createSalesforceStream = (client: Connection) => {
  return {
    /**
     * Subscribe to a Salesforce PushTopic, setting the replayId to `-2` will
     * replay all events for last 72 hours. This is important for data durability
     * in case our server restarts. Setting the replayId to `-1` will only subscribe
     * to new events.
     *
     * The different variations of Salesforce subscriptions often times report duplicate
     * events, so we need to filter out duplicates. We do this by keeping track of the
     * Ids of the events we've already seen which is why the `subscribe` function requires
     * a  type that has an `Id` property.
     *
     * @param {SalesforceStreamSubscriptionParams} params - Subscription params
     * @param callback - callback function to be called when a message is received
     *
     */
    subscribe: async <T extends { Id: string }>(
      { channel, replayId = -2 }: SalesforceStreamSubscriptionParams,
      callback: (message: T) => void
    ) => {
      const ids: string[] = [];
      const replayExt = new StreamingExtension.Replay(channel, replayId);
      const streamClient = client.streaming.createClient([replayExt]);

      streamClient.subscribe(channel, (message: StreamingMessage) => {
        const result = message.sobject as T;
        if (ids.includes(result.Id)) return;

        ids.push(result.Id);
        callback(result);
      });
    },
  };
};

export default createSalesforceStream;
