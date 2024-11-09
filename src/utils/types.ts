import { ConnectionOptions } from 'jsforce';

import createApp from '@/app';
import createGraphqlService from '@/services/graphql';
import {
    CreateDashboardUserMutationVariables, CreateOrgMutationVariables,
    GetOrgBySalesforceIdQueryVariables, GetUserBySalesforceIdOrEmailQueryVariables,
    UpdateOrgMutationVariables, User
} from '@/services/graphql/generated/graphql';
import createSalesforceQueries from '@/services/salesforce/query';
import createSalesforceStream from '@/services/salesforce/stream';
import createLogger from '@/utils/logger';
import { ClientOptions } from '@urql/core';

export interface DataProducer {
  resources: SalesfeorceClosedWonResourceListener;
}

export interface SalesfeorceClosedWonResourceListener {
  all: (cb: (orgs: SalesforceClosedWonResource[]) => void) => void;
  display: (cb: (orgs: SalesforceClosedWonResource[]) => void) => void;
  search: (cb: (orgs: SalesforceClosedWonResource[]) => void) => void;
  seo: (cb: (orgs: SalesforceClosedWonResource[]) => void) => void;
}

export interface SalesforceClosedWonResource {
  id: string;
  name: string;
  description: string;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    phone: string;
  };
  parentId?: string;
}

export type SalesforceClosedWonResourceWithUser = SalesforceClosedWonResource & {};

export interface OrgCreationEventListenerParams {
  config: Config;
  logger: Logger;
}

export interface ProductsByOpportunityIdParams {
  id: string;
  where?: { [key in keyof Partial<Product>]: string };
}

export enum SalesforceChannel {
  /**
   * SOQL for 'OpportunitiesUpdate' PushTopic
   *
   * PushTopic pushTopic = new PushTopic();
   * pushTopic.Name = 'OpportunitiesUpdate';
   * pushTopic.Query = 'SELECT Id, Name, Amount, AccountId, Deal_Signatory__c, RecordTypeId FROM Opportunity WHERE StageName = \'Closed Won\' AND Active__c = true';
   * pushTopic.ApiVersion = 56.0;
   * pushTopic.NotifyForOperationCreate = true;
   * pushTopic.NotifyForOperationUpdate = true;
   * pushTopic.NotifyForOperationUndelete = false;
   * pushTopic.NotifyForOperationDelete = false;
   * pushTopic.NotifyForFields = 'Referenced';
   * insert pushTopic;
   */
  OpportunitiesUpdate = "/topic/OpportunitiesUpdate",

  /**
   *
   * SOQL for 'OpportunitiesUpdateTest' PushTopic
   * PushTopic pushTopic = new PushTopic();
   * pushTopic.Name = 'OpportunitiesUpdateTest';
   * pushTopic.Query = 'SELECT Id, Name, Amount, AccountId, Deal_Signatory__c, RecordTypeId FROM Opportunity WHERE StageName = \'Closed Won\' AND Active__c = false';
   * pushTopic.ApiVersion = 56.0;
   * pushTopic.NotifyForOperationCreate = true;
   * pushTopic.NotifyForOperationUpdate = true;
   * pushTopic.NotifyForOperationUndelete = false;
   * pushTopic.NotifyForOperationDelete = false;
   * pushTopic.NotifyForFields = 'Referenced';
   * insert pushTopic;
   */

  OpportunitiesUpdateTest = "/topic/OpportunitiesUpdateTest",
}
export interface Opportunity {
  Id: string;
  Name: string;
  Amount: number;
  RecordTypeId: string;
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
  Phone: string;
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
  ParentId: string;
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

export type FindOrCreateOrgParams = Pick<CreateOrgMutationVariables, "name" | "description" | "salesforceId"> &
  GetOrgBySalesforceIdQueryVariables & {
    salesforceParentId?: string;
  };

export type CreateOrgParams = Pick<CreateOrgMutationVariables, "name" | "description" | "salesforceId"> &
  GetOrgBySalesforceIdQueryVariables & {
    parentOrgId?: string;
  };

export type CreateUserParams = Pick<
  CreateDashboardUserMutationVariables,
  "email" | "phone" | "name" | "username" | "orgId"
> &
  GetUserBySalesforceIdOrEmailQueryVariables;

export type UpdateOrgParams = UpdateOrgMutationVariables;

export type QueryAttribute = { attributes: PushTopicRecordAttributes };

export interface Config {
  salesforce: SalesforceConfig;
  graphql: GraphQLConfig;
  server: ExpressServerConfig;
  logLevel: LogLevel;
}

export type AppConfig = {
  subscription: () => SalesforceStreamSubscriptionParams;
};

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type Logger = ReturnType<typeof createLogger>;

export type SalesforceConfig = ConnectionOptions;

export type ExpressServerConfig = {
  port: number;
  serverKey: string;
};

export type GraphQLConfig = ClientOptions & { X_API_KEY: string };

export type GraphQLService = ReturnType<typeof createGraphqlService>;

export type Org = Awaited<
  ReturnType<GraphQLService["queries"]["getOrgBySalesforceId"]> | ReturnType<GraphQLService["mutations"]["createOrg"]>
>;

export type App = ReturnType<typeof createApp>;
