import createSalesforceQueries from "@/services/salesforce/query";
import createSalesforceStream from "@/services/salesforce/stream";

export enum SalesforceChannel {
  /**
   * SOQL for 'OppurtunitiesUpdate' PushTopic
   *
   * PushTopic pushTopic = new PushTopic();
   * pushTopic.Name = 'OpportunitiesUpdate';
   * pushTopic.Query = 'SELECT Id, Name, Amount, AccountId, Deal_Signatory__c FROM Opportunity WHERE StageName = \'Closed Won\'';
   * pushTopic.ApiVersion = 56.0;
   * pushTopic.NotifyForOperationCreate = true;
   * pushTopic.NotifyForOperationUpdate = true;
   * pushTopic.NotifyForOperationUndelete = false;
   * pushTopic.NotifyForOperationDelete = false;
   * pushTopic.NotifyForFields = 'Referenced';
   * insert pushTopic;
   */
  OpportunitiesUpdate = "/topic/OpportunitiesUpdate",
}
export interface Opportunity {
  Id: string;
  Name: string;
  Amount: number;
  Deal_Signatory__c: string;
  AccountId: string;
}

export interface SalesforceStreamSubscriptionParams {
  channel: SalesforceChannel;
  replayId?: number;
}

export interface Contact {
  Id: string;
  Name: string;
  Email: string;
  attributes: PushTopicRecordAttributes;
}

export interface Product {
  Id: string;
  Name: string;
  Family: string;
  attributes: PushTopicRecordAttributes;
}

export interface Account {
  Id: string;
  Name: string;
  attributes: PushTopicRecordAttributes;
}

export interface PushTopicRecordAttributes {
  type: string;
  url: string;
}

export interface SalesforceService {
  query: ReturnType<typeof createSalesforceQueries>;
  stream: ReturnType<typeof createSalesforceStream>;
}

export type QueryAttribute = { attributes: PushTopicRecordAttributes };
