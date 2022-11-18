import { graphql } from "@/services/graphql/generated";

const CREATE_ORG = graphql(`
  mutation createOrg(
    $name: String!
    $description: String
    $website: String!
    $domain: String
    $level: PartnerLevel!
    $logoId: MediaCreateOneWithoutOrgInput
    $parentOrgs: [OrgWhereUniqueInput!]
    $roleitems: [RoleItemCreateWithoutRoleInput!]
    $config: OrgConfigCreateWithoutOrgsInput
    $reTargeting: Boolean!
    $appIds: [String!]
    $tradeDeskIdentifier: String
    $storageBucket: String
    $googleCustomerId: String
    $signInLogoId: MediaCreateOneInput
    $viewId: String
    $seo: Boolean!
    $chatWootId: String
    $cpm: String
    $isGA4: Boolean
  ) {
    createOrg(
      data: {
        name: $name
        description: $description
        website: $website
        domain: $domain
        logo: $logoId
        signInLogo: $signInLogoId
        level: $level
        chatWootId: $chatWootId
        cpm: $cpm
        parentOrg: { connect: $parentOrgs }
        config: { create: $config }
        dataConfig: {
          create: {
            reTargeting: $reTargeting
            appIds: { set: $appIds }
            tradeDeskIdentifier: $tradeDeskIdentifier
            storageBucket: $storageBucket
            googleCustomerId: $googleCustomerId
            seo: $seo
            googleAnalytics: { create: { viewId: $viewId, isGA4: $isGA4 } }
          }
        }
        roles: {
          create: {
            name: $name
            roleItems: { create: $roleitems }
            isMaster: true
          }
        }
      }
    ) {
      id
      brands(first: 5) {
        name
        logo {
          key
        }
      }
      config {
        priceVisible
        isDemo
        isAdmin
        isPartner
        isTrafficker
        exportData
        isSelfService
        hasInsights
        providersVisible
        isProcessor
        canResetPasswords
        campaignSummary
        isPacing
        pastData
        segment
        technicalSupport
        articles
      }
      dataConfig {
        reTargeting
        appIds
        tradeDeskIdentifier
        storageBucket
        googleCustomerId
        seo
        googleAnalytics {
          viewId
          isGA4
        }
      }
      name
      description
      locations(first: 5) {
        street
        city
        state
      }
      logo {
        id
        key
      }
      signInLogo {
        id
        key
      }
      roles(first: 5) {
        id
        name
        isMaster
        roleItems(first: 10) {
          id
          feature
          actions
        }
        users {
          id
        }
      }
      level
      website
      domain
      parentOrg {
        name
        id
      }
      chatWootId
      cpm
    }
  }
`);

export default CREATE_ORG;
