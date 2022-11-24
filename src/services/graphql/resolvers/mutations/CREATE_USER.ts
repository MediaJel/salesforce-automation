import { graphql } from "@/services/graphql/generated";

const CREATE_USER = graphql(`
  mutation createDashboardUser(
    $username: String!
    $email: String!
    $phone: String!
    $orgId: ID!
    $roleItems: [RoleItemCreateWithoutRoleInput!]
    $avatar: ID
    $name: String
    $config: UserConfigCreateInput!
  ) {
    createDashboardUser(
      data: {
        username: $username
        email: $email
        phone: $phone
        orgId: $orgId
        roleItems: $roleItems
        avatar: $avatar
        name: $name
        config: $config
      }
    ) {
      id
      username
      email
    }
  }
`);

export default CREATE_USER;
