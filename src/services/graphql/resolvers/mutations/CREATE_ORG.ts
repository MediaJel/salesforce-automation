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
    $salesforceId: String!
  ) {
    createOrg(
      data: {
        salesforceId: $salesforceId
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
      salesforceId
      name
    }
  }
`);

export default CREATE_ORG;
