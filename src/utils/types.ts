import { ConnectionOptions } from 'jsforce';

import createApp from '@/app';
import createGraphqlService from '@/services/graphql';
import {
    CreateDashboardUserMutationVariables, CreateOrgMutationVariables,
    GetOrgBySalesforceIdQueryVariables, GetUserBySalesforceIdOrEmailQueryVariables,
    UpdateOrgMutationVariables, User
} from '@/services/graphql/generated/graphql';
import createSalesforceMutations from '@/services/salesforce/mutations';
import createSalesforceQueries from '@/services/salesforce/query';
import createSalesforceStream from '@/services/salesforce/stream';
import createLogger from '@/utils/logger';
import { ClientOptions } from '@urql/core';

export type IntuitAuthResponse = {
  realmId: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  id_token: string;
  latency: number;
  createdAt: number;
  state: string;
};

export interface QuickbooksFindCustomersInput {
  field: string;
  value: string;
  operator?: string;
}

export interface QuickbooksCreateCustomerInput {
  FullyQualifiedName: string;
  PrimaryEmailAddr?: QuickbooksEmailAddress;
  DisplayName: string;
  Suffix?: string;
  Title?: string;
  MiddleName?: string;
  Notes?: string;
  FamilyName: string;
  PrimaryPhone?: QuickbooksPhoneNumber;
  CompanyName?: string;
  BillAddr?: QuickbooksAddress;
  GivenName: string;
  //* TODO: Tentative
  Job?: boolean;
  ParentRef?: {
    value: string;
  };
}

export interface QuickbooksFindCustomersResponse {
  QueryResponse: {
    Customer?: QuickbooksCustomer[];
    startPosition?: number;
    maxResults?: number;
  };
  time: string;
}

export interface QuickbooksCustomer {
  domain: string;
  FamilyName: string;
  DisplayName: string;
  DefaultTaxCodeRef?: QuickbooksReference;
  PrimaryEmailAddr?: QuickbooksEmailAddress;
  PreferredDeliveryMethod: string;
  GivenName: string;
  FullyQualifiedName: string;
  BillWithParent: boolean;
  Job: boolean;
  BalanceWithJobs: number;
  PrimaryPhone?: QuickbooksPhoneNumber;
  Active: boolean;
  MetaData: QuickbooksMetaData;
  BillAddr?: QuickbooksAddress;
  MiddleName?: string;
  Notes?: string;
  Taxable: boolean;
  Balance: number;
  SyncToken: string;
  CompanyName?: string;
  ShipAddr?: QuickbooksAddress;
  ParentRef?: QuickbooksReference;
  PrintOnCheckName?: string;
  sparse?: boolean;
  Id: string;
}

interface QuickbooksReference {
  value: string;
}

interface QuickbooksEmailAddress {
  Address: string;
}

interface QuickbooksPhoneNumber {
  FreeFormNumber: string;
}

interface QuickbooksMetaData {
  CreateTime: string;
  LastUpdatedTime: string;
}

export interface CreateIntuitServiceInput {
  consumerKey?: string;
  consumerSecret?: string;
  accessToken: string;
  withTokenSecret?: boolean;
  realmId: string;
  useSandbox?: boolean;
  enableDebugging?: boolean;
  /**Set minorversion or null for the latest version */
  minorVersion?: string;
  oAuthVersion?: string;
  refreshToken: string;
}

export interface QuickbooksCreateEstimateInput {
  TotalAmt: number;
  BillEmail: {
    Address: string;
  };
  CustomerMemo: {
    value: string;
  };
  ShipAddr: QuickbooksAddressInput;
  PrintStatus: string;
  EmailStatus: string;
  BillAddr: QuickbooksAddressInput;
  Line: Partial<QuickbooksEstimateLineInput>[];
  CustomerRef: {
    name: string;
    value: string;
  };
  TxnTaxDetail: {
    TotalTax: number;
  };
  ApplyTaxAfterDiscount: boolean;
}

interface QuickbooksAddressInput {
  City: string;
  Line1: string;
  PostalCode: number;
  Lat: number;
  Long: number;
  CountrySubDivisionCode: string;
  Id: number;
}

interface QuickbooksEstimateLineInput {
  Description?: string;
  DetailType: string;
  // TODO: Made this partial, since I don't know yet what is required
  SalesItemLineDetail?: Partial<QuickbooksSalesItemLineDetailInput>;
  SubTotalLineDetail?: Record<string, unknown>;
  DiscountLineDetail?: QuickbooksDiscountLineDetailInput;
  LineNum?: number;
  Amount: number;
  Id?: string;
}

interface QuickbooksSalesItemLineDetailInput {
  TaxCodeRef: {
    value: string;
  };
  Qty: number;
  UnitPrice: number;
  ItemRef: {
    name: string;
    value: number;
  };
}

interface QuickbooksDiscountLineDetailInput {
  DiscountAccountRef: {
    name: string;
    value: string;
  };
  PercentBased: boolean;
  DiscountPercent: number;
}

export interface QuickbooksEstimateResponse {
  QueryResponse: {
    Estimate: QuickbooksEstimate[];
    startPosition: number;
    maxResults: number;
  };
  time: string;
}

export interface QuickbooksEstimate {
  domain: string;
  sparse: boolean;
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  CustomField: any[];
  DocNumber: string;
  TxnDate: string;
  CurrencyRef: {
    value: string;
    name: string;
  };
  TxnStatus: string;
  LinkedTxn: QuickbooksLinkedTransaction[];
  Line: QuickbooksEstimateLine[];
  TxnTaxDetail: {
    TxnTaxCodeRef?: {
      value: string;
    };
    TotalTax: number;
    TaxLine?: QuickbooksTaxLine[];
  };
  CustomerRef: {
    value: string;
    name: string;
  };
  CustomerMemo: {
    value: string;
  };
  BillAddr: QuickbooksAddress;
  ShipAddr: QuickbooksAddress;
  FreeFormAddress: boolean;
  TotalAmt: number;
  ApplyTaxAfterDiscount: boolean;
  PrintStatus: string;
  EmailStatus: string;
  BillEmail: {
    Address: string;
  };
  DeliveryInfo?: {
    DeliveryType: string;
  };
}

interface QuickbooksLinkedTransaction {
  TxnId: string;
  TxnType: string;
}

interface QuickbooksEstimateLine {
  Id?: string;
  LineNum?: number;
  Description?: string;
  Amount: number;
  DetailType: string;
  SalesItemLineDetail?: QuickbooksSalesItemLineDetail;
  SubTotalLineDetail?: Record<string, unknown>;
}

interface QuickbooksSalesItemLineDetail {
  ItemRef: {
    value: string;
    name: string;
  };
  UnitPrice: number;
  Qty: number;
  ItemAccountRef: {
    value: string;
    name: string;
  };
  TaxCodeRef: {
    value: string;
  };
}

interface QuickbooksTaxLine {
  Amount: number;
  DetailType: string;
  TaxLineDetail: QuickbooksTaxLineDetail;
}

interface QuickbooksTaxLineDetail {
  TaxRateRef: {
    value: string;
  };
  PercentBased: boolean;
  TaxPercent: number;
  NetAmountTaxable: number;
}

interface QuickbooksAddress {
  Id?: string;
  Line1: string;
  Line2?: string;
  Line3?: string;
  Line4?: string;
  City?: string;
  CountrySubDivisionCode?: string;
  PostalCode?: string;
  Lat: string;
  Long: string;
}

export interface DataProducer {
  closedWon: SalesforceClosedWonResourceListener;
}

export interface SalesforceClosedWonResourceListener {
  all: (cb: (orgs: SalesforceClosedWonResource[]) => void) => void;
  display: (cb: (orgs: SalesforceClosedWonResource[]) => void) => void;
  search: (cb: (orgs: SalesforceClosedWonResource[]) => void) => void;
  seo: (cb: (orgs: SalesforceClosedWonResource[]) => void) => void;
}

export interface SalesforceClosedWonResource {
  opportunity: Opportunity;
  opportunityLineItems: OpportunityLineItem[];
  account: Account;
  contact: Contact;
  products: Product[];
  parent?: Account;
  // Legacy types, mainly here for the GraphQL processor
  id: string;
  name: string;
  amount: number;
}

export type SalesforceClosedWonResourceWithUser = SalesforceClosedWonResource & {};

export interface SalesforceClosedWonEventListenerParams {
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
  AVSFQB__Quickbooks_Id__c?: string;
  attributes: PushTopicRecordAttributes;
}

export interface Product {
  Id: string;
  Name: string;
  Family: string;
  ProductCode: string;
  Description: string;
  AVSFQB__Quickbooks_Id__c?: string;
  attributes: PushTopicRecordAttributes;
}

export interface OpportunityLineItem {
  Id: string;
  Name: string;
  Quantity: number;
  UnitPrice: number;
  TotalPrice: number;
  Description: string;
  AVSFQB__Quickbooks_Id__c?: string;
  ServiceDate: string;
  attributes: PushTopicRecordAttributes;
}

export interface Account {
  Id: string;
  Name: string;
  ParentId: string;
  ShippingCity: string;
  ShippingStreet: string;
  ShippingPostalCode: number;
  ShippingLatitude: number;
  ShippingLongitude: number;
  BillingCity: string;
  BillingStreet: string;
  BillingPostalCode: number;
  BillingLatitude: number;
  BillingLongitude: number;
  BillingCountryCode: string;
  AVSFQB__Quickbooks_Id__c?: string;
  attributes: PushTopicRecordAttributes;
}

export interface PushTopicRecordAttributes {
  type: string;
  url: string;
}

export interface SalesforceService {
  query: ReturnType<typeof createSalesforceQueries>;
  stream: ReturnType<typeof createSalesforceStream>;
  mutation: ReturnType<typeof createSalesforceMutations>;
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

interface IntuitConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: "sandbox" | "production";
  accessToken: string;
  refreshToken: string;
  realmId: string;
}
export interface Config {
  salesforce: SalesforceConfig;
  graphql: GraphQLConfig;
  server: ExpressServerConfig;
  logLevel: LogLevel;
  intuit: IntuitConfig;
}

export type AppConfig = {
  subscription: () => SalesforceStreamSubscriptionParams;
};

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type Logger = ReturnType<typeof createLogger>;

export type SalesforceConfig = ConnectionOptions & {
  salesforceChannel: "live" | "test";
};

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
