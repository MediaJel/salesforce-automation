/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n  mutation createOrg(\n    $name: String!\n    $description: String\n    $website: String!\n    $domain: String\n    $level: PartnerLevel!\n    $logoId: MediaCreateOneWithoutOrgInput\n    $parentOrgs: [OrgWhereUniqueInput!]\n    $roleitems: [RoleItemCreateWithoutRoleInput!]\n    $config: OrgConfigCreateWithoutOrgsInput\n    $reTargeting: Boolean!\n    $appIds: [String!]\n    $tradeDeskIdentifier: String\n    $storageBucket: String\n    $googleCustomerId: String\n    $viewId: String\n    $seo: Boolean!\n    $chatWootId: String\n    $cpm: String\n    $isGA4: Boolean\n    $salesforceId: String\n  ) {\n    createOrg(\n      data: {\n        salesforceId: $salesforceId\n        name: $name\n        description: $description\n        website: $website\n        domain: $domain\n        logo: $logoId\n        level: $level\n        chatWootId: $chatWootId\n        cpm: $cpm\n        parentOrg: { connect: $parentOrgs }\n        config: { create: $config }\n        dataConfig: {\n          create: {\n            reTargeting: $reTargeting\n            appIds: { set: $appIds }\n            tradeDeskIdentifier: $tradeDeskIdentifier\n            storageBucket: $storageBucket\n            googleCustomerId: $googleCustomerId\n            seo: $seo\n            googleAnalytics: { create: { viewId: $viewId, isGA4: $isGA4 } }\n          }\n        }\n        roles: {\n          create: {\n            name: $name\n            roleItems: { create: $roleitems }\n            isMaster: true\n          }\n        }\n      }\n    ) {\n      id\n      name\n      salesforceId\n    }\n  }\n": types.CreateOrgDocument,
    "\n  mutation createDashboardUser(\n    $username: String!\n    $email: String!\n    $phone: String!\n    $orgId: ID!\n    $roleItems: [RoleItemCreateWithoutRoleInput!]\n    $avatar: ID\n    $name: String\n    $config: UserConfigCreateInput!\n  ) {\n    createDashboardUser(\n      data: {\n        username: $username\n        email: $email\n        phone: $phone\n        orgId: $orgId\n        roleItems: $roleItems\n        avatar: $avatar\n        name: $name\n        config: $config\n      }\n    ) {\n      id\n      username\n      email\n    }\n  }\n": types.CreateDashboardUserDocument,
    "\n  query getOrgBySalesforceId($salesforceId: String!) {\n    orgs(where: { salesforceId: $salesforceId }) {\n      id\n      salesforceId\n      name\n    }\n  }\n": types.GetOrgBySalesforceIdDocument,
    "\n  query getUserBySalesforceIdOrEmail($salesforceId: String, $email: String) {\n    users(where: { OR: [{ salesforceId: $salesforceId }, { email: $email }] }) {\n      id\n      username\n      email\n    }\n  }\n": types.GetUserBySalesforceIdOrEmailDocument,
};

export function graphql(source: "\n  mutation createOrg(\n    $name: String!\n    $description: String\n    $website: String!\n    $domain: String\n    $level: PartnerLevel!\n    $logoId: MediaCreateOneWithoutOrgInput\n    $parentOrgs: [OrgWhereUniqueInput!]\n    $roleitems: [RoleItemCreateWithoutRoleInput!]\n    $config: OrgConfigCreateWithoutOrgsInput\n    $reTargeting: Boolean!\n    $appIds: [String!]\n    $tradeDeskIdentifier: String\n    $storageBucket: String\n    $googleCustomerId: String\n    $viewId: String\n    $seo: Boolean!\n    $chatWootId: String\n    $cpm: String\n    $isGA4: Boolean\n    $salesforceId: String\n  ) {\n    createOrg(\n      data: {\n        salesforceId: $salesforceId\n        name: $name\n        description: $description\n        website: $website\n        domain: $domain\n        logo: $logoId\n        level: $level\n        chatWootId: $chatWootId\n        cpm: $cpm\n        parentOrg: { connect: $parentOrgs }\n        config: { create: $config }\n        dataConfig: {\n          create: {\n            reTargeting: $reTargeting\n            appIds: { set: $appIds }\n            tradeDeskIdentifier: $tradeDeskIdentifier\n            storageBucket: $storageBucket\n            googleCustomerId: $googleCustomerId\n            seo: $seo\n            googleAnalytics: { create: { viewId: $viewId, isGA4: $isGA4 } }\n          }\n        }\n        roles: {\n          create: {\n            name: $name\n            roleItems: { create: $roleitems }\n            isMaster: true\n          }\n        }\n      }\n    ) {\n      id\n      name\n      salesforceId\n    }\n  }\n"): (typeof documents)["\n  mutation createOrg(\n    $name: String!\n    $description: String\n    $website: String!\n    $domain: String\n    $level: PartnerLevel!\n    $logoId: MediaCreateOneWithoutOrgInput\n    $parentOrgs: [OrgWhereUniqueInput!]\n    $roleitems: [RoleItemCreateWithoutRoleInput!]\n    $config: OrgConfigCreateWithoutOrgsInput\n    $reTargeting: Boolean!\n    $appIds: [String!]\n    $tradeDeskIdentifier: String\n    $storageBucket: String\n    $googleCustomerId: String\n    $viewId: String\n    $seo: Boolean!\n    $chatWootId: String\n    $cpm: String\n    $isGA4: Boolean\n    $salesforceId: String\n  ) {\n    createOrg(\n      data: {\n        salesforceId: $salesforceId\n        name: $name\n        description: $description\n        website: $website\n        domain: $domain\n        logo: $logoId\n        level: $level\n        chatWootId: $chatWootId\n        cpm: $cpm\n        parentOrg: { connect: $parentOrgs }\n        config: { create: $config }\n        dataConfig: {\n          create: {\n            reTargeting: $reTargeting\n            appIds: { set: $appIds }\n            tradeDeskIdentifier: $tradeDeskIdentifier\n            storageBucket: $storageBucket\n            googleCustomerId: $googleCustomerId\n            seo: $seo\n            googleAnalytics: { create: { viewId: $viewId, isGA4: $isGA4 } }\n          }\n        }\n        roles: {\n          create: {\n            name: $name\n            roleItems: { create: $roleitems }\n            isMaster: true\n          }\n        }\n      }\n    ) {\n      id\n      name\n      salesforceId\n    }\n  }\n"];
export function graphql(source: "\n  mutation createDashboardUser(\n    $username: String!\n    $email: String!\n    $phone: String!\n    $orgId: ID!\n    $roleItems: [RoleItemCreateWithoutRoleInput!]\n    $avatar: ID\n    $name: String\n    $config: UserConfigCreateInput!\n  ) {\n    createDashboardUser(\n      data: {\n        username: $username\n        email: $email\n        phone: $phone\n        orgId: $orgId\n        roleItems: $roleItems\n        avatar: $avatar\n        name: $name\n        config: $config\n      }\n    ) {\n      id\n      username\n      email\n    }\n  }\n"): (typeof documents)["\n  mutation createDashboardUser(\n    $username: String!\n    $email: String!\n    $phone: String!\n    $orgId: ID!\n    $roleItems: [RoleItemCreateWithoutRoleInput!]\n    $avatar: ID\n    $name: String\n    $config: UserConfigCreateInput!\n  ) {\n    createDashboardUser(\n      data: {\n        username: $username\n        email: $email\n        phone: $phone\n        orgId: $orgId\n        roleItems: $roleItems\n        avatar: $avatar\n        name: $name\n        config: $config\n      }\n    ) {\n      id\n      username\n      email\n    }\n  }\n"];
export function graphql(source: "\n  query getOrgBySalesforceId($salesforceId: String!) {\n    orgs(where: { salesforceId: $salesforceId }) {\n      id\n      salesforceId\n      name\n    }\n  }\n"): (typeof documents)["\n  query getOrgBySalesforceId($salesforceId: String!) {\n    orgs(where: { salesforceId: $salesforceId }) {\n      id\n      salesforceId\n      name\n    }\n  }\n"];
export function graphql(source: "\n  query getUserBySalesforceIdOrEmail($salesforceId: String, $email: String) {\n    users(where: { OR: [{ salesforceId: $salesforceId }, { email: $email }] }) {\n      id\n      username\n      email\n    }\n  }\n"): (typeof documents)["\n  query getUserBySalesforceIdOrEmail($salesforceId: String, $email: String) {\n    users(where: { OR: [{ salesforceId: $salesforceId }, { email: $email }] }) {\n      id\n      username\n      email\n    }\n  }\n"];

export function graphql(source: string): unknown;
export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;