/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n  mutation createOrg(\n    $name: String!\n    $description: String\n    $website: String!\n    $domain: String\n    $level: PartnerLevel!\n    $logoId: MediaCreateOneWithoutOrgInput\n    $parentOrgs: [OrgWhereUniqueInput!]\n    $roleitems: [RoleItemCreateWithoutRoleInput!]\n    $config: OrgConfigCreateWithoutOrgsInput\n    $reTargeting: Boolean!\n    $appIds: [String!]\n    $tradeDeskIdentifier: String\n    $storageBucket: String\n    $googleCustomerId: String\n    $signInLogoId: MediaCreateOneInput\n    $viewId: String\n    $seo: Boolean!\n    $chatWootId: String\n    $cpm: String\n    $isGA4: Boolean\n  ) {\n    createOrg(\n      data: {\n        name: $name\n        description: $description\n        website: $website\n        domain: $domain\n        logo: $logoId\n        signInLogo: $signInLogoId\n        level: $level\n        chatWootId: $chatWootId\n        cpm: $cpm\n        parentOrg: { connect: $parentOrgs }\n        config: { create: $config }\n        dataConfig: {\n          create: {\n            reTargeting: $reTargeting\n            appIds: { set: $appIds }\n            tradeDeskIdentifier: $tradeDeskIdentifier\n            storageBucket: $storageBucket\n            googleCustomerId: $googleCustomerId\n            seo: $seo\n            googleAnalytics: { create: { viewId: $viewId, isGA4: $isGA4 } }\n          }\n        }\n        roles: {\n          create: {\n            name: $name\n            roleItems: { create: $roleitems }\n            isMaster: true\n          }\n        }\n      }\n    ) {\n      id\n      brands(first: 5) {\n        name\n        logo {\n          key\n        }\n      }\n      config {\n        priceVisible\n        isDemo\n        isAdmin\n        isPartner\n        isTrafficker\n        exportData\n        isSelfService\n        hasInsights\n        providersVisible\n        isProcessor\n        canResetPasswords\n        campaignSummary\n        isPacing\n        pastData\n        segment\n        technicalSupport\n        articles\n      }\n      dataConfig {\n        reTargeting\n        appIds\n        tradeDeskIdentifier\n        storageBucket\n        googleCustomerId\n        seo\n        googleAnalytics {\n          viewId\n          isGA4\n        }\n      }\n      name\n      description\n      locations(first: 5) {\n        street\n        city\n        state\n      }\n      logo {\n        id\n        key\n      }\n      signInLogo {\n        id\n        key\n      }\n      roles(first: 5) {\n        id\n        name\n        isMaster\n        roleItems(first: 10) {\n          id\n          feature\n          actions\n        }\n        users {\n          id\n        }\n      }\n      level\n      website\n      domain\n      parentOrg {\n        name\n        id\n      }\n      chatWootId\n      cpm\n    }\n  }\n": types.CreateOrgDocument,
    "\n  mutation createDashboardUser(\n    $username: String!\n    $email: String!\n    $phone: String!\n    $orgId: ID!\n    $roleItems: [RoleItemCreateWithoutRoleInput!]\n    $avatar: ID\n    $name: String\n    $config: UserConfigCreateInput!\n  ) {\n    createDashboardUser(\n      data: {\n        username: $username\n        email: $email\n        phone: $phone\n        orgId: $orgId\n        roleItems: $roleItems\n        avatar: $avatar\n        name: $name\n        config: $config\n      }\n    ) {\n      id\n      name\n      username\n      email\n      phone\n      cognitoUserId\n      roles(first: 5) {\n        id\n        roleItems(first: 20) {\n          id\n          feature\n          actions\n        }\n        org {\n          id\n          name\n          parentOrg {\n            id\n            name\n          }\n          logo {\n            id\n            key\n          }\n        }\n      }\n      avatar {\n        id\n        key\n      }\n    }\n  }\n": types.CreateDashboardUserDocument,
    "\n  query getOrg($id: ID!) {\n    orgs(where: { id_not: $id }) {\n      id\n    }\n  }\n": types.GetOrgDocument,
    "\n  query GET_ORG_BY_NAME($name: String!) {\n    org(where: { name: $name }) {\n      id\n      name\n    }\n  }\n": types.Get_Org_By_NameDocument,
};

export function graphql(source: "\n  mutation createOrg(\n    $name: String!\n    $description: String\n    $website: String!\n    $domain: String\n    $level: PartnerLevel!\n    $logoId: MediaCreateOneWithoutOrgInput\n    $parentOrgs: [OrgWhereUniqueInput!]\n    $roleitems: [RoleItemCreateWithoutRoleInput!]\n    $config: OrgConfigCreateWithoutOrgsInput\n    $reTargeting: Boolean!\n    $appIds: [String!]\n    $tradeDeskIdentifier: String\n    $storageBucket: String\n    $googleCustomerId: String\n    $signInLogoId: MediaCreateOneInput\n    $viewId: String\n    $seo: Boolean!\n    $chatWootId: String\n    $cpm: String\n    $isGA4: Boolean\n  ) {\n    createOrg(\n      data: {\n        name: $name\n        description: $description\n        website: $website\n        domain: $domain\n        logo: $logoId\n        signInLogo: $signInLogoId\n        level: $level\n        chatWootId: $chatWootId\n        cpm: $cpm\n        parentOrg: { connect: $parentOrgs }\n        config: { create: $config }\n        dataConfig: {\n          create: {\n            reTargeting: $reTargeting\n            appIds: { set: $appIds }\n            tradeDeskIdentifier: $tradeDeskIdentifier\n            storageBucket: $storageBucket\n            googleCustomerId: $googleCustomerId\n            seo: $seo\n            googleAnalytics: { create: { viewId: $viewId, isGA4: $isGA4 } }\n          }\n        }\n        roles: {\n          create: {\n            name: $name\n            roleItems: { create: $roleitems }\n            isMaster: true\n          }\n        }\n      }\n    ) {\n      id\n      brands(first: 5) {\n        name\n        logo {\n          key\n        }\n      }\n      config {\n        priceVisible\n        isDemo\n        isAdmin\n        isPartner\n        isTrafficker\n        exportData\n        isSelfService\n        hasInsights\n        providersVisible\n        isProcessor\n        canResetPasswords\n        campaignSummary\n        isPacing\n        pastData\n        segment\n        technicalSupport\n        articles\n      }\n      dataConfig {\n        reTargeting\n        appIds\n        tradeDeskIdentifier\n        storageBucket\n        googleCustomerId\n        seo\n        googleAnalytics {\n          viewId\n          isGA4\n        }\n      }\n      name\n      description\n      locations(first: 5) {\n        street\n        city\n        state\n      }\n      logo {\n        id\n        key\n      }\n      signInLogo {\n        id\n        key\n      }\n      roles(first: 5) {\n        id\n        name\n        isMaster\n        roleItems(first: 10) {\n          id\n          feature\n          actions\n        }\n        users {\n          id\n        }\n      }\n      level\n      website\n      domain\n      parentOrg {\n        name\n        id\n      }\n      chatWootId\n      cpm\n    }\n  }\n"): (typeof documents)["\n  mutation createOrg(\n    $name: String!\n    $description: String\n    $website: String!\n    $domain: String\n    $level: PartnerLevel!\n    $logoId: MediaCreateOneWithoutOrgInput\n    $parentOrgs: [OrgWhereUniqueInput!]\n    $roleitems: [RoleItemCreateWithoutRoleInput!]\n    $config: OrgConfigCreateWithoutOrgsInput\n    $reTargeting: Boolean!\n    $appIds: [String!]\n    $tradeDeskIdentifier: String\n    $storageBucket: String\n    $googleCustomerId: String\n    $signInLogoId: MediaCreateOneInput\n    $viewId: String\n    $seo: Boolean!\n    $chatWootId: String\n    $cpm: String\n    $isGA4: Boolean\n  ) {\n    createOrg(\n      data: {\n        name: $name\n        description: $description\n        website: $website\n        domain: $domain\n        logo: $logoId\n        signInLogo: $signInLogoId\n        level: $level\n        chatWootId: $chatWootId\n        cpm: $cpm\n        parentOrg: { connect: $parentOrgs }\n        config: { create: $config }\n        dataConfig: {\n          create: {\n            reTargeting: $reTargeting\n            appIds: { set: $appIds }\n            tradeDeskIdentifier: $tradeDeskIdentifier\n            storageBucket: $storageBucket\n            googleCustomerId: $googleCustomerId\n            seo: $seo\n            googleAnalytics: { create: { viewId: $viewId, isGA4: $isGA4 } }\n          }\n        }\n        roles: {\n          create: {\n            name: $name\n            roleItems: { create: $roleitems }\n            isMaster: true\n          }\n        }\n      }\n    ) {\n      id\n      brands(first: 5) {\n        name\n        logo {\n          key\n        }\n      }\n      config {\n        priceVisible\n        isDemo\n        isAdmin\n        isPartner\n        isTrafficker\n        exportData\n        isSelfService\n        hasInsights\n        providersVisible\n        isProcessor\n        canResetPasswords\n        campaignSummary\n        isPacing\n        pastData\n        segment\n        technicalSupport\n        articles\n      }\n      dataConfig {\n        reTargeting\n        appIds\n        tradeDeskIdentifier\n        storageBucket\n        googleCustomerId\n        seo\n        googleAnalytics {\n          viewId\n          isGA4\n        }\n      }\n      name\n      description\n      locations(first: 5) {\n        street\n        city\n        state\n      }\n      logo {\n        id\n        key\n      }\n      signInLogo {\n        id\n        key\n      }\n      roles(first: 5) {\n        id\n        name\n        isMaster\n        roleItems(first: 10) {\n          id\n          feature\n          actions\n        }\n        users {\n          id\n        }\n      }\n      level\n      website\n      domain\n      parentOrg {\n        name\n        id\n      }\n      chatWootId\n      cpm\n    }\n  }\n"];
export function graphql(source: "\n  mutation createDashboardUser(\n    $username: String!\n    $email: String!\n    $phone: String!\n    $orgId: ID!\n    $roleItems: [RoleItemCreateWithoutRoleInput!]\n    $avatar: ID\n    $name: String\n    $config: UserConfigCreateInput!\n  ) {\n    createDashboardUser(\n      data: {\n        username: $username\n        email: $email\n        phone: $phone\n        orgId: $orgId\n        roleItems: $roleItems\n        avatar: $avatar\n        name: $name\n        config: $config\n      }\n    ) {\n      id\n      name\n      username\n      email\n      phone\n      cognitoUserId\n      roles(first: 5) {\n        id\n        roleItems(first: 20) {\n          id\n          feature\n          actions\n        }\n        org {\n          id\n          name\n          parentOrg {\n            id\n            name\n          }\n          logo {\n            id\n            key\n          }\n        }\n      }\n      avatar {\n        id\n        key\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createDashboardUser(\n    $username: String!\n    $email: String!\n    $phone: String!\n    $orgId: ID!\n    $roleItems: [RoleItemCreateWithoutRoleInput!]\n    $avatar: ID\n    $name: String\n    $config: UserConfigCreateInput!\n  ) {\n    createDashboardUser(\n      data: {\n        username: $username\n        email: $email\n        phone: $phone\n        orgId: $orgId\n        roleItems: $roleItems\n        avatar: $avatar\n        name: $name\n        config: $config\n      }\n    ) {\n      id\n      name\n      username\n      email\n      phone\n      cognitoUserId\n      roles(first: 5) {\n        id\n        roleItems(first: 20) {\n          id\n          feature\n          actions\n        }\n        org {\n          id\n          name\n          parentOrg {\n            id\n            name\n          }\n          logo {\n            id\n            key\n          }\n        }\n      }\n      avatar {\n        id\n        key\n      }\n    }\n  }\n"];
export function graphql(source: "\n  query getOrg($id: ID!) {\n    orgs(where: { id_not: $id }) {\n      id\n    }\n  }\n"): (typeof documents)["\n  query getOrg($id: ID!) {\n    orgs(where: { id_not: $id }) {\n      id\n    }\n  }\n"];
export function graphql(source: "\n  query GET_ORG_BY_NAME($name: String!) {\n    org(where: { name: $name }) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query GET_ORG_BY_NAME($name: String!) {\n    org(where: { name: $name }) {\n      id\n      name\n    }\n  }\n"];

export function graphql(source: string): unknown;
export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;